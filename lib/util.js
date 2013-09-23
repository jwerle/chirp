
/**
 * Module dependencies
 */

var colors = require('colors')


/**
 * Message prefix
 *
 * @api public
 */

var prefix = exports.prefix = 'chirp:'.cyan;


/**
 * Prints to `stdout`
 *
 * @api public
 * @param {Mixed} out
 */

exports.puts = puts;
function puts (out) {
  var args = [prefix].concat([].slice.call(arguments, 0));
  console.log.apply(console, args);
}


/**
 * Prints to `stderr`
 *
 * @api public
 * @param {String} out
 */

exports.error = error;
function error (out) {
  var args = [prefix, ' error: '.red].concat([].slice.call(arguments, 0));
  console.log.apply(console, args);
}
