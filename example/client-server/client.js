var websocket = require('websocket-stream');
var transport = require('abstract-chunk-transport');
var Dump = require('../..');

var store = transport.client();
var ws = websocket('ws://localhost:9999');
ws.pipe(store).pipe(ws);

var el = document.createElement('div');
el.style.height = '600px';
document.body.appendChild(el);

var d = new Dump(store, 1000 * 16);
d.appendTo(el);

