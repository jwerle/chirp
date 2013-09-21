
/**
 * Module dependencies
 */

var browser = require('../../../build/browser')
  , Stream = browser.Stream
  , domready = require('domready')
  , dom = require('domify')
  , minstache = require('minstache')
  , util = require('./util')
  , defer = setTimeout
  , puts = console.log.bind(console, 'chirp:')
  , error = puts.bind(puts, 'error:')


function applyFilters (filters, data) {
  var tmp = [].concat(filters)

  ~function next () {
    var fn = tmp.shift()
    if (fn) {
      fn(data, next);
    }
  }();
}


/**
 * DOM ready state
 */

var DOM_IS_READY = false;
domready(function () { DOM_IS_READY = true; });


/**
 * Export `chirp`
 */

module.exports = chirp;


/**
 * Storage api
 *
 * @api public
 */
var store = chirp.store = {
  get: localStorage.getItem.bind(localStorage),
  put: localStorage.setItem.bind(localStorage),
  del: localStorage.removeItem.bind(localStorage),
  clear: localStorage.clear.bind(localStorage),
  has: function (key) { return !!this.get(key); }
};


/**
 * Middleware
 */

var middleware = require('./middleware');
chirp.links = middleware.links;


/**
 * `chirp` construct
 *
 * @api public
 * @param {Node} node
 * @param {Object} opts
 */

function chirp (node, opts) {
  if (!(this instanceof chirp)) return new chirp(node, opts);
  else if (!(node instanceof Node)) throw new TypeError("expecting an instance of `Node`");
  else if ('object' !== typeof opts) throw new TypeError("expecting an object");
  else if ('object' !== typeof opts.streams) throw new TypeError("expecting `.streams` to be an object");

  var self = this
    , owner = null
    , streams = null

  this.streams = streams = opts.streams;
  this.domStream = $(node).find('.body').get(0);
  this.input = $(node).find('.input').get(0);
  this.user = function () { return owner; };
  this.filters = [];

  chirp.ready(function () {
    if (!(owner = store.get('user')))
      self.auth(authUser);
    else syncUser();

    streams.chirps.on('data', function (data) {
      if (undefined === data.sid)
        streams.chirps.sid = data.sid;

      var tmpFilters = [].concat(self.filters);

      tmpFilters.push(function (d, next) {
        self.write(Message(d));
      });

      if (data.message && data.owner)
        applyFilters(tmpFilters, data)
    });

    streams.chirps.on('error', function (e) {
      throw e
      error(e.message);
    });
  });

  function authUser (name) {
    if (name) owner = name;
    store.put('user', owner);
    syncUser();
  }

  function syncUser () {
    streams.users.write(JSON.stringify({owner: owner, timestamp: Date.now()}));
  }

  // force a user to click the send button for now
  // $(this.input).find('input').on('keyup', function (e) {
  //   if (13 === e.keyCode) {
  //     $(this.input).find('.send').trigger('click');
  //   }
  // });


  $(this.input).find('.send').on('click', function (e) {
    if (null === owner) {
      return self.auth(authUser);
    }
    var value = $(self.input).find('input').val()
    var links = [];
    if (!value) return false;
    $(self.input).find('input').val('');
    if (util.hasUrl(value)) {
      links = value.match(util.URL_REGEX)
    }
    self.streams.chirps.write(JSON.stringify({
      owner: self.user(),
      message: value,
      links: links,
      timestamp: Date.now()
    }));
  });
}


/**
 * Creates a client connection
 *
 * @api public
 * @param {String} host optional
 */

chirp.createClient = function (host) {
  var client = new Stream()
    , isReady = false
    , sock = null
    , buffer = []

  if ('string' !== typeof host) {
    host = window.document.location.host;
    host = 'ws://'+ host;
  }

  client.readable = true;
  client.writable = true;

  client.connect = function (fn) {
   client.sock = sock = new WebSocket(host);

   sock.onopen = function () {
     isReady = true;
     if ('function' === typeof fn) fn.call(client, sock);
     for (var i = 0, len = buffer.length; i < len; ++i) {
       sock.send(buffer[i]);
     }
     client.emit('connect', sock);
     // check if ended
     if (client._ended) client.end();
   };

   sock.onmessage = function (e) {
     try {
       client.emit('data', JSON.parse(e.data), e);
     } catch (e) {
       client.emit('error', e);
     }
   };

   sock.onclose = function () {
     client.emit('end');
     client.writable = false;
     client.readable = false;
   };
  };


  client.write = function (chunk) {
    if (false === isReady || buffer.length > 0) {
      buffer.push(chunk);
    } else {
      sock.send(chunk);
    }
  };

  client.end = function (chunk) {
    if (undefined !== chunk) {
      client.write(chunk);
    }

    if (false === isReady) {
      client._ended = true;
      return;
    }

    client.writable = false;
    sock.close();
  };


  client.destroy = function () {
    client._ended = true;
    client.writable = false;
    client.writable = false;
    buffer = [];
    sock.close();
  };

  return client;
};


/**
 * Binds a function for the dom ready event
 *
 * @api public
 * @param {Function} fn
 */

chirp.ready = function (fn) {
  if (true === DOM_IS_READY) {
    defer(fn);
  } else {
    domready(fn);
  }
  return this;
};


/**
 * Writes a `Message` instance to
 * the dom stream
 *
 * @api public
 * @param {Message} msg
 */

chirp.prototype.write = function (msg) {
  if (!(msg instanceof Message)) throw new TypeError("expecting an instance of `Message`");
  var node = msg.toNode();
  $(this.domStream).append($(node).addClass('animated fadeIn'));
  return this;
};


/**
 * Prompts user for a user name
 *
 * @api public
 * @param {Function} fn
 */

chirp.prototype.auth = function (fn) {
  var ret = prompt("User name?");
  defer(fn.bind(this, ret));
  return this;
};


/**
 * Provide a filter function
 * for when a client receives
 * data
 *
 * @api public
 * @param {Function} fn
 */

chirp.prototype.use = function (fn) {
  if ('function' !== typeof fn) throw new TypeError("expecting function");
  this.filters.push(fn);
  return this;
};


/**
 * `Message` constructor
 *
 * @api public
 * @param {Object} data
 */

chirp.Message = Message;
function Message (data) {
  if (!(this instanceof Message)) return new Message(data);
  else if ('object' !== typeof data) throw new TypeError("expecting object");

  this.owner = data.owner;
  this.message = escape(util.decodeEntities(data.message));
  this.timestamp = data.timestamp;
}


/**
 * Converts an instance to a dom
 * node
 *
 * @api public
 */

Message.prototype.toNode = function () {
  var tpl = minstache(
    ('<div class="chirp-message" data-timetamp="{{timestamp}}" data-owner="{{owner}}">'+
      '<span class="user">{{owner}}</span>'+
      '{{message}}'+
    '</div>'),
    this
  );

  return dom(unescape(tpl));
};
