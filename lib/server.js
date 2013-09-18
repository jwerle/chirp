
/**
 * Module dependencies
 */

var connect = require('connect')
  , troute = require('troute')


/**
 * Export `Server`
 */

module.exports = Server;


/**
 * `Server` constructor
 *
 * @api public
 */

function Server () {
  var server = connect();

  server.use(connect.logger('dev'));
  server.use(connect.static(__dirname + '/../public'));
  server.use(connect.bodyParser());
  server.use(connect.methodOverride());
  server.use(connect.cookieParser());
 // server.use(connect.session({secret: 'chirp'}));

  server.get = troute.get
  server.post = troute.post;
  server.put = troute.put;
  server.del = troute.del;
  server.head = troute.head;
  server.options = troute.options;

  return server;
}
