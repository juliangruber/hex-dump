var Dump = require('..');
var bytes = require('bytes');
var Mem = require('memory-chunk-store');
var shannon = require('binary-shannon-entropy');

var size = '20mb';

var len = bytes(size);
var chunks = Mem(16);

for (var i = 0; i < len / 16; i++) {
  chunks.put(i, Buffer(16));
}

console.log('GO');

var el = document.createElement('div');
el.style.height = '600px';
document.body.appendChild(el);

var d = new Dump(chunks, len);
d.appendTo(el);
window.d = d;

