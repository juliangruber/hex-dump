var Dump = require('./');
var bytes = require('bytes');

var size = '10kb';

var len = bytes(size);
var b = new Buffer(len);
for (var i = 0; i < len; i++) {
  b[i] = Math.round(Math.random() * 255);
}

var start = Date.now();

var d = new Dump(b);
d.appendTo(document.body);

console.log('Took %s ms for %s', Date.now() - start, size);
