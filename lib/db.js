
/**
 * Module dependencies
 */

var level = require('level')
  , sublevel = require('level-sublevel')
  , feed = require('level-livefeed')
  , array = require('level-array')


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
  var db = (
    sublevel(level(opts))
  );

  db.feed = feed(db);
  db.array = function (name) {
    return array(db.sublevel(name));
  };

  return db;
}
