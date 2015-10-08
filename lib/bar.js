var ColorcodedBar = require('colorcoded-bar');
var h = require('hyperscript');

module.exports = function(height, lines, fetch){
  var bar = new ColorcodedBar();
  var canvas = h('canvas');
  var el = h('div.entropy', canvas);

  (function next(i){
    fetch(i, function(err, value){
      if (err) throw err;

      bar.set(i, value);

      if (++i < lines) {
        next(i);
      } else {
        bar.render({ height: height, canvas: canvas });
      }
    });
  })(0);


  return el;
}
