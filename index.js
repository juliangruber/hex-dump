var shannon = require('binary-shannon-entropy');
var insertCSS = require('insert-css');
var fs = require('fs');
var GenericDump = require('generic-hex-dump');
var h = require('hyperscript');
var Bar = require('colorcoded-bar');
var fill = require('fill-colorcoded-bar');
var raf = require('raf');
var debounce = require('debounce');
var multiget = require('chunk-store-multi-get');
var CacheChunkStore = require('cache-chunk-store');

var style = fs.readFileSync(__dirname + '/style.css', 'utf8');

module.exports = Dump;

function Dump(store, length){
  insertCSS(style);

  this._generic = new GenericDump(length);
  this._generic.replace('\n', '↵');

  this._store = new CacheChunkStore(store, {
    max: 100
  });
  this._el = null;
  this._gutterWidth = 4;
  this._offsetWidth = this._generic.offsetWidth();
  this._lines = this._generic.lines();
  this._length = length;
  this._lineWidth = this._offsetWidth
    + 2 * this._gutterWidth
    + 4 * 16;
  this._lastChunkLength = length % 16 || 16;
}

Dump.prototype.appendTo = function(el){
  var height = el.getClientRects()[0].height;
  el.appendChild(this._render(height));
};

Dump.prototype._render = function(height){
  var self = this;

  var canvas = h('canvas');
  var pre = h('pre.hex');
  var barEl = h('div.entropy', canvas);

  var bar = new Bar;
  var status = fill(bar, {
    length: this._lines,
    strategy: 'refine'
  }, function(i, cb){
    self._store.get(i, { length: self._lineLength(i) }, function(err, buf){
      if (err) return cb(err);

      var entropy = shannon(buf); // 0 -> 4
      var color = 'rgba(1, 1, 1, ' + (entropy / 4) + ')';
      cb(null, color);
    });
  });

  (function draw(){
    bar.render({ canvas: canvas, height: height });
    if (status.fetching) raf(draw);
  })();

  var frag = document.createDocumentFragment();

  (function next(i){
    self._store.get(i, { length: self._lineLength(i) }, function(err, buf){
      if (err) throw err;

      frag.appendChild(self._renderHex(i, buf));

      if (i % 5 == 0) {
        pre.appendChild(frag);
        frag = document.createDocumentFragment();
      }

      if (++i < self._lines) {
        next(i);
      } else {
        pre.appendChild(frag);
      }
    });
  })(0);

  pre.addEventListener('mousemove', this._onmousemove(pre));

  return h('div.dump', barEl, pre);
};

Dump.prototype._onmousemove = function(pre){
  return debounce(function(ev){
    var selected = pre.querySelectorAll('.selected');
    for (var i = 0; i < selected.length; i++) {
      selected[i].classList.remove('selected');
    }

    var target = ev.target;
    if (target.tagName != 'SPAN') return;

    var match = pre.querySelectorAll('.' + target.className);
    for (var i = 0; i < match.length; i++) {
      match[i].classList.add('selected');
    }
  }, 10);
};

Dump.prototype._renderHex = function(line, buf){
  var frag = document.createDocumentFragment();
  var hexValues = this._generic.hex(buf);

  frag.appendChild(txt(this._generic.offset(line)));
  frag.appendChild(txt(this._gutter()));
  hexValues.forEach(function(hex, idx){
    frag.appendChild(h('span.hex-' + hex,
      { 'data-offset': line*16+idx },
      hex
    ));
    frag.appendChild(txt(' '));
  });
  for (var i = 0; i < 16 - buf.length; i++) {
    frag.appendChild(txt('   '));
  }
  frag.appendChild(txt(this._gutter()));

  this._generic.strings(buf).forEach(function(str, idx){
    frag.appendChild(h('span.hex-' + hexValues[idx],
      { 'data-offset': line*16+idx },
      str
    ));
    frag.appendChild(txt(' '));
  });
  frag.appendChild(txt('\n'));

  return frag;
};

Dump.prototype.getSelection = function(cb){
  var sel = getSelection();
  if (sel.type != 'Range') return;

  var anchor = sel.anchorNode.parentNode.tagName == 'SPAN'
    ? sel.anchorNode.parentNode
    : sel.anchorNode.nextSibling;
  var focus = sel.focusNode.parentNode.tagName == 'SPAN'
    ? sel.focusNode.parentNode
    : sel.focusNode.previousSibling;
  var start = anchor.dataset.offset;
  var end = focus.dataset.offset;

  var index = Math.floor(start / 16);
  var offset = start - index * 16;

  multiget(this._store, {
    index: index,
    offset: offset,
    length: end - start + 1,
    chunkLength: 16
  }, cb);
};

Dump.prototype._lineLength = function(i){
  return i == (this._lines - 1)
    ? this._lastChunkLength
    : 16;
};

Dump.prototype._gutter = function(){
  var out = '';
  for (var i = 0; i < this._gutterWidth; i++) out += ' ';
  return out;
};

function txt(s){
  return document.createTextNode(s);
}

