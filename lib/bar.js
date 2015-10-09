var ColorcodedBar = require('colorcoded-bar');
var h = require('hyperscript');
var raf = require('raf');

module.exports = function(height, lines, fetch){
  var bar = new ColorcodedBar();
  var canvas = h('canvas');
  var el = h('div.entropy', canvas);
  var fetching = true;
  
  bar.set(lines, '');

  (function next(i){
    fetch(i, function(err, value){
      if (err) throw err;

      bar.set(i, value);

      if (++i < lines) {
        next(i);
      } else {
        fetching = false;
      }
    });
  })(0);

  (function draw(){
    bar.render({ height: height, canvas: canvas });
    if (fetching) raf(draw);
  })();

  return el;
}
