var Dump = require('./');
var bytes = require('bytes');
var Mem = require('memory-chunk-store');
var shannon = require('binary-shannon-entropy');
var random = require('entropy-buffer');

var size = '10kb';

var len = bytes(size);
var chunks = Mem(16);

for (var i = 0; i < len / 16; i++) {
  chunks.put(i, random(16, Math.random() * 8));
}

var el = document.createElement('div');
el.style.height = '600px';
document.body.appendChild(el);

var d = new Dump(chunks, len);
d.appendTo(el);
window.d = d;

