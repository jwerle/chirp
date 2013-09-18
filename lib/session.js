
/**
 * Module dependencies
 */

var db = require('./db')
  , levelSession = require('level-session')



/**
 * Export `session`
 */

module.exports = session;


/**
 * `session` construct
 *
 * @api public
 */

function session () {
  return levelSession({db: db(__dirname + '/../db/session.db')});
}
