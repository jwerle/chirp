
/**
 * Module dependencies
 */

var Server = require('./server')
  , session = require('./session')
  , db = require('./db')
  , stream = require('./stream')



/**
 * Chirp utils
 *
 * @api public
 */

exports.util = require('./util');


/**
 * Creates a new server instance
 *
 * @api public
 */

exports.createServer = function () {
  return Server();
};


/**
 * Creates a session filter
 * for request with level-session
 *
 * @api public
 */

exports.session = function () {
  return session();
};


/**
 * Returns a reference to the
 * levelDB instance for chirp
 *
 * @api public
 */

exports.db = function (opts) {
  return db(opts);
}


/**
 * Returns a new stream
 * with a socket instance
 * attached to it
 *
 * @api public
 * @param {Object} opts
 */

exports.stream = function (opts) {
  if ('object' !== typeof opts) throw new TypeError("expecting object");
//  else if (undefined === opts.server) throw new TypeError("expecting `.server` to be an object");
  return stream(opts);
};
