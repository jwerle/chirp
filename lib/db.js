
/**
 * Module dependencies
 */

var level = require('level')
  , feed = require('level-livefeed')


/**
 * Export `db`
 */

module.exports = db;


/**
 * Level db instance constructor
 *
 * @api public
 * @param {String|Object} opts
 */

function db (opts) {
  var ldb = level(opts)
  ldb.feed = feed(ldb);
  return ldb;
}
