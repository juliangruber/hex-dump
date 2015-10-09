var ColorcodedBar = require('colorcoded-bar');
var h = require('hyperscript');
var raf = require('raf');

module.exports = function(height, lines, fetch, strategy){
  var bar = new ColorcodedBar();
  var canvas = h('canvas');
  var el = h('div.entropy', canvas);
  var fetching = true;
  
  bar.set(lines, '');

  var s = strategies[strategy || 'refine'](lines);

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

var strategies = {};

strategies.refine = function(length){
  var next = [];
  var divisor = 2;

  return function(){
    if (!next.length) {
      var seg = length / divisor;
      for (var i = 0; i < divisor; i++) {
        next.push(Math.floor(seg * i));
      }
      if (divisor >= length && seg < 2) return;
      divisor *= 2;
    }

    return next.shift();
  };
};

strategies.topdown = function(length){
  var i = 0;

  return function(){
    if (i == length) return;
    return i++;
  };
};
