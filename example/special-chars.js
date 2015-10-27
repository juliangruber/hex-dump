var Dump = require('..');
var Mem = require('memory-chunk-store');

var chunks = Mem(12);

chunks.put(0, Buffer('foo\r\nbar\tbaz'), check);
chunks.put(1, Buffer(16), check);
function check(err){ if (err) throw err };

var el = document.createElement('div');
el.style.height = '600px';
document.body.appendChild(el);

var d = new Dump(chunks, 12);
d.appendTo(el);

