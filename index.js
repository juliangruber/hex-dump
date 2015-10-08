var shannon = require('binary-shannon-entropy');
var insertCSS = require('insert-css');
var fs = require('fs');
var GenericDump = require('generic-hex-dump');
var h = require('hyperscript');
var renderBar = require('./lib/bar');

var style = fs.readFileSync(__dirname + '/style.css', 'utf8');

module.exports = Dump;

function Dump(store, length){
  insertCSS(style);

  this._store = store;
  this._generic = new GenericDump(length);
  this._el = null;
  this._gutterWidth = 4;
  this._offsetWidth = this._generic.offsetWidth();
  this._lines = this._generic.lines();
  this._lineWidth = this._offsetWidth
    + 2 * this._gutterWidth
    + 4 * 16;
}

Dump.prototype.appendTo = function(el){
  var height = el.getClientRects()[0].height;
  el.appendChild(this._render(height));
};

Dump.prototype._render = function(height){
  var self = this;

  var canvas = h('canvas');
  var pre = h('pre.hex');

  var bar = renderBar(height, this._lines, function(i, cb){
    self._store.get(i, { length: 16 }, function(err, buf){
      if (err) return cb(err);

      var entropy = shannon(buf); // 0 -> 4
      var color = 'rgba(1, 1, 1, ' + (entropy / 4) + ')';
      cb(null, color);
    });
  });

  var out = '';

  (function next(i){
    self._store.get(i, { length: 16 }, function(err, buf){
      if (err) throw err;

      out += self._renderHex(i, buf);

      if (++i < self._lines) {
        next(i);
      } else {
        pre.innerHTML = out;
      }
    });
  })(0);

  return h('div.dump', bar, pre);
};

Dump.prototype._renderHex = function(line, buf){
  return [
    this._generic.offset(line),
    this._generic.hex(buf).join(' '),
    this._generic.strings(buf).join(' ')
  ].join(this._gutter()) + '\n';
};

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

function cap(min, max, num){
  return Math.min(max, Math.max(min, num));
}

function spaces(n){
  var out = '';
  for (var i = 0; i < n; i++) out += ' ';
  return out;
}
