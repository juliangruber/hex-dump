module.exports = Dump;

function Dump(buf){
  this._buf = buf;
  this._el = this._render();
}

Dump.prototype.appendTo = function(el){
  el.appendChild(this._el);
};

Dump.prototype._render = function(){
  var pre = document.createElement('pre');
  var buf = this._buf;
  var lines = Math.ceil(buf.length / 16);
  var offsetWidth = Math.max(buf.length.toString(16).length, 6);

  for (var i = 0; i < lines; i++) {
    var offset = i * 16;
    pre.innerHTML += pad(offset, offsetWidth);
    pre.innerHTML += this._gutter();
    
    var off = Number(offset);
    for (var j = 0; j < 16; j++) {
      if (buf.length < off) {
        pre.innerHTML += spaces((16 - j) * 3);
        break;
      }
      pre.innerHTML += pad(buf[off], 2) + ' ';
      off++;
    }
    pre.innerHTML += this._gutter();

    off = Number(offset);
    for (var j = 0; j < 16; j++) {
      if (buf.length < off) break;
      var v = buf[off];
      pre.innerHTML += this._printable(v)
        ? String.fromCharCode(v)
        : '.';
      off++;
    }

    pre.innerHTML += '\n';
  }

  return pre;
};

Dump.prototype._gutter = function(){
  return spaces(4);
};

Dump.prototype._printable = function(v){
  return v > 31 && v < 127 || v > 159;
};

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
