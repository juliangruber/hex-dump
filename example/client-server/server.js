var http = require('http');
var transport = require('abstract-chunk-transport');
var Store = require('fs-chunk-store');
var browserify = require('browserify');
var websocket = require('websocket-stream');

var store = new Store(16);

for (var i = 0; i < 1000; i++) {
  store.put(i, Buffer(16), function(err){
    if (err) throw err;
  });
}

var server = http.createServer(function(req, res){
  if ('/bundle.js' == req.url) {
    browserify()
    .add(__dirname + '/client.js')
    .transform('brfs')
    .bundle()
    .pipe(res);
  } else if ('/' == req.url) {
    res.end('<body><script src="/bundle.js"></script></body>');
  } else {
    res.end('no');
  }
});

websocket.createServer({
  server: server
}, function (con){
  con.pipe(transport.server(store)).pipe(con);
});

server.listen(9999, function(){
  console.log('~> http://localhost:9999/');
});
