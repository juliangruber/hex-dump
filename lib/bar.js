var ColorcodedBar = require('colorcoded-bar');
var h = require('hyperscript');
var raf = require('raf');
var iterators = require('./iterators');
var parallel = require('run-parallel');

module.exports = function(height, lines, fetch, strategy){
  var bar = new ColorcodedBar();
  var canvas = h('canvas');
  var el = h('div.entropy', canvas);
  var fetching = true;
  
  bar.set(lines, '');

  var s = iterators[strategy || 'refine'](lines);
  var concurrency = 10;
  var i;

  (function next(){
    var fns = [];
    for (var i = 0; i < concurrency; i ++) fns.push(function(cb){
      i = s();
      if (typeof i == 'undefined') return cb();

      fetch(i, function(err, value){
        if (err) return cb(err);
        bar.set(i, value);
        cb();
      });
    });
    parallel(fns, function(err){
      if (err) throw err;
      if (typeof i != 'undefined') next();
      else fetching = false;
    });
  })();

  (function draw(){
    bar.render({ height: height, canvas: canvas });
    if (fetching) raf(draw);
  })();

  return el;
}

