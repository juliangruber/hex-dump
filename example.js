var Dump = require('./');

var b = new Buffer('foo bar \x00 \x00 yolo yo ok thanks computer');
var d = new Dump(b);

d.appendTo(document.body);
