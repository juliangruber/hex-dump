var shannon = require('binary-shannon-entropy');
var insertCSS = require('insert-css');
var fs = require('fs');
var GenericDump = require('generic-hex-dump');
var h = require('hyperscript');
var Bar = require('colorcoded-bar');
var fill = require('fill-colorcoded-bar');
var raf = require('raf');
var debounce = require('debounce');

var style = fs.readFileSync(__dirname + '/style.css', 'utf8');

module.exports = Dump;

function Dump(store, length){
  insertCSS(style);

  this._generic = new GenericDump(length);
  this._generic.replace('\n', '↵');

  this._store = store;
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

  pre.addEventListener('mousemove', debounce(function(ev){
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
  }, 10));

  return h('div.dump', barEl, pre);
};

Dump.prototype._renderHex = function(line, buf){
  var frag = document.createDocumentFragment();
  var hexValues = this._generic.hex(buf);

  frag.appendChild(txt(
    this._generic.offset(line) + this._gutter()
  ));
  hexValues.forEach(function(hex){
    frag.appendChild(h('span.hex-' + hex, hex));
    frag.appendChild(txt(' '));
  });
  if (buf.length < 16) {
    for (var i = 0; i < 16 - buf.length; i++) {
      frag.appendChild(txt('00 '));
    }
  }
  frag.appendChild(txt(this._gutter()));

  this._generic.strings(buf).forEach(function(str, idx){
    frag.appendChild(h('span.hex-' + hexValues[idx], str));
    frag.appendChild(txt(' '));
  });
  frag.appendChild(txt('\n'));

  return frag;
};

function txt(s){
  return document.createTextNode(s);
}

Dump.prototype._gutter = function(){
  return spaces(this._gutterWidth);
};

Dump.prototype.getSelection = function(){
  var sel = getSelection();
  if (sel.type != 'Range' || sel.anchorNode.parentNode != this._el) return;

  var start = {};
  start.offset = Math.min(sel.baseOffset, sel.extentOffset);
  start.line = Math.floor(start.offset / this._lineWidth);
  start.lineOffset = cap(0, 3 * 16, start.offset % (this._lineWidth + 1 /* \n */) - this._offsetWidth - this._gutterWidth);
  start.idx = Math.ceil((start.line * 16 + (start.lineOffset / 3)));

  var end = {};
  end.offset = Math.max(sel.baseOffset, sel.extentOffset);
  end.line = Math.floor(end.offset / (this._lineWidth));
  end.lineOffset = cap(0, 3 * 16, end.offset % (this._lineWidth + 1 /* \n */) - this._offsetWidth - this._gutterWidth - 1);
  end.idx = Math.ceil((end.line * 16 + (end.lineOffset / 3)));

  return this._buf.slice(start.idx, end.idx);
};

Dump.prototype._lineLength = function(i){
  return i == (this._lines - 1)
    ? this._lastChunkLength
    : 16;
};

function cap(min, max, num){
  return Math.min(max, Math.max(min, num));
}

function spaces(n){
  var out = '';
  for (var i = 0; i < n; i++) out += ' ';
  return out;
}

function pad(str, len){
  var out = str;
  var dif = len - str.length;
  for (var i = 0; i < dif; i++) out += ' ';
  return out;
}
