exports.ljust = function(callback, input, num) {
  var bits = (input === null || input === undefined ? '' : input).toString().split(''),
      difference = num - bits.length;

  // push returns new length of array.
  while(difference > 0) difference = num - bits.push(' ');

  callback(null, bits.join(''));
};
