var Dump = require('./');
var bytes = require('bytes');
var Mem = require('memory-chunk-store');

var size = '512kb';

var len = bytes(size);
var chunks = Mem(16);

for (var i = 0; i < len / 16; i++) {
  chunks.put(i, Buffer('0123456789abcdef'));
}

var d = new Dump(chunks, len);
d.appendTo(document.body);
window.d = d;

