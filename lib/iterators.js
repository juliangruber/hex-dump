
exports.refine = function(length){
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

exports.topdown = function(length){
  var i = 0;

  return function(){
    if (i == length) return;
    return i++;
  };
};
