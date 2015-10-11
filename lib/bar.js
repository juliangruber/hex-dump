var ColorcodedBar = require('colorcoded-bar');
var h = require('hyperscript');
var raf = require('raf');
var iterators = require('./iterators');

module.exports = function(height, lines, fetch, strategy){
  var bar = new ColorcodedBar();
  var canvas = h('canvas');
  var el = h('div.entropy', canvas);
  var fetching = true;
  
  bar.set(lines, '');

  var s = iterators[strategy || 'refine'](lines);

  (function next(i){
    fetch(i, function(err, value){
      if (err) throw err;

      bar.set(i, value);

      i = s();
      if (typeof i == 'undefined') return fetching = false;
      next(i);
    });
  })(s());

  (function draw(){
    bar.render({ height: height, canvas: canvas });
    if (fetching) raf(draw);
  })();

  return el;
}

