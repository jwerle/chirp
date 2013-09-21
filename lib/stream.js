
/**
 * Module dependencies
 */

var ws = require('ws')
  , through = require('through')
  , assert = require('assert')


function debounce (fn, ms) {
  return function () {
    var args = arguments;
    setTimeout(function () {
      fn.apply(fn, args);
    }, ms);
  }
}

/**
 * Export `stream`
 */

module.exports = stream;


/**
 * `stream` construct
 *
 * @api public
 * @param {Object} opts
 */

function stream (opts) {
  var stream = through(write, end)
  var sock = stream.sock = new ws.Server(opts);
  var stash = [];

  console.log(opts)
  sock.pool = [];

  function write (chunk) {
    if (null !== chunk) this.queue(chunk);
  }

  function end (chunk) {
    this.queue(null);
    sock.send(chunk);
    sock.close();
  }

  sock.on('connection', function (ws) {
    ws.sid = sid();
    sock.pool.push(ws);
    ws.send(JSON.stringify({sid: ws.sid}));

    if (stash.length) {
      stash.map(function (d) {
        debounce(ws.send.bind(ws), 100)(d)
      });
    }

    ws.on('message', function (msg) {
      stream.write(msg);
    });

    ws.on('close', function () {
      var len = sock.pool.length;
      sock.pool = sock.pool.filter(function (s) {
        return s.sid !== ws.sid;
      });

      assert(sock.pool.length < len);
    });
  });

  stream.send = function (chunk) {
    sock.pool.map(function (s) {
      s.send(chunk);
    });
  };

  stream.stash = function (chunk) {
    stash.push(chunk);
  };

  return stream;
}


/**
 * Generate a random socket id for a peer
 *
 * @api private
 */

function sid () {
  return Math.random().toString(16).slice(2);
}
