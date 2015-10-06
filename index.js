var get = require('chunk-store-multi-get');

module.exports = Dump;

function Dump(store, length){
  this._store = store;
  this._length = length;
  this._el = null;
  this._gutterWidth = 4;
  this._offsetWidth = Math.max(length.toString(16).length, 6);
  this._lineWidth = this._offsetWidth
    + 2 * this._gutterWidth
    + 4 * 16;
}

Dump.prototype.appendTo = function(el){
  el.appendChild(this._el = this._el || this._render());
};

Dump.prototype._render = function(){
  var self = this;
  var pre = document.createElement('pre');
  var lines = 500;
  var out = '';

  get(this._store, {
    chunkLength: 16,
    index: 0,
    length: lines * 16
  }, function(err, buf){
    if (err) throw err;

    for (var i = 0; i < lines; i++) {
      var offset = i * 16;
      out += self._renderLine(i, buf.slice(offset, offset + 16));
    }
    pre.innerHTML = out;
  });

  return pre;
};

Dump.prototype._renderLine = function(line, buf, out){
  var out = '';
  var offset = line * 16;
  out += pad(offset, this._offsetWidth);
  out += this._gutter();
 
  for (var j = 0; j < 16; j++) {
    if (buf.length < j) {
      out += spaces((16 - j) * 3);
      break;
    }
    out += pad(buf[j], 2) + ' ';
  }
  out += this._gutter();

  for (var j = 0; j < 16; j++) {
    if (buf.length < j) break;
    var v = buf[j];
    out += this._printable(v)
      ? String.fromCharCode(v)
      : '.';
  }

  return out + '\n';
};

Dump.prototype._gutter = function(){
  return spaces(this._gutterWidth);
};

Dump.prototype._printable = function(v){
  return v > 31 && v < 127 || v > 159;
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

function pad(num, max){
  var out = num.toString(16);
  while (out.length < max) out = '0' + out;
  return out;
}

function spaces(n){
  var out = '';
  for (var i = 0; i < n; i++) out += ' ';
  return out;
}
