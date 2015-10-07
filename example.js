var Dump = require('./');
var bytes = require('bytes');
var Mem = require('memory-chunk-store');
var random = require('random-buffer');

var size = '512kb';

var len = bytes(size);
var chunks = Mem(16);

for (var i = 0; i < len / 16; i++) {
  chunks.put(i, random(16));
}

var d = new Dump(chunks, len);
d.appendTo(document.body);
window.d = d;

