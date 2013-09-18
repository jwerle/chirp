
/**
 * Require the given path.
 *
 * @param {String} path
 * @return {Object} exports
 * @api public
 */

function require(path, parent, orig) {
  var resolved = require.resolve(path);

  // lookup failed
  if (null == resolved) {
    orig = orig || path;
    parent = parent || 'root';
    var err = new Error('Failed to require "' + orig + '" from "' + parent + '"');
    err.path = orig;
    err.parent = parent;
    err.require = true;
    throw err;
  }

  var module = require.modules[resolved];

  // perform real require()
  // by invoking the module's
  // registered function
  if (!module.exports) {
    module.exports = {};
    module.client = module.component = true;
    module.call(this, module.exports, require.relative(resolved), module);
  }

  return module.exports;
}

/**
 * Registered modules.
 */

require.modules = {};

/**
 * Registered aliases.
 */

require.aliases = {};

/**
 * Resolve `path`.
 *
 * Lookup:
 *
 *   - PATH/index.js
 *   - PATH.js
 *   - PATH
 *
 * @param {String} path
 * @return {String} path or null
 * @api private
 */

require.resolve = function(path) {
  if (path.charAt(0) === '/') path = path.slice(1);

  var paths = [
    path,
    path + '.js',
    path + '.json',
    path + '/index.js',
    path + '/index.json'
  ];

  for (var i = 0; i < paths.length; i++) {
    var path = paths[i];
    if (require.modules.hasOwnProperty(path)) return path;
    if (require.aliases.hasOwnProperty(path)) return require.aliases[path];
  }
};

/**
 * Normalize `path` relative to the current path.
 *
 * @param {String} curr
 * @param {String} path
 * @return {String}
 * @api private
 */

require.normalize = function(curr, path) {
  var segs = [];

  if ('.' != path.charAt(0)) return path;

  curr = curr.split('/');
  path = path.split('/');

  for (var i = 0; i < path.length; ++i) {
    if ('..' == path[i]) {
      curr.pop();
    } else if ('.' != path[i] && '' != path[i]) {
      segs.push(path[i]);
    }
  }

  return curr.concat(segs).join('/');
};

/**
 * Register module at `path` with callback `definition`.
 *
 * @param {String} path
 * @param {Function} definition
 * @api private
 */

require.register = function(path, definition) {
  require.modules[path] = definition;
};

/**
 * Alias a module definition.
 *
 * @param {String} from
 * @param {String} to
 * @api private
 */

require.alias = function(from, to) {
  if (!require.modules.hasOwnProperty(from)) {
    throw new Error('Failed to alias "' + from + '", it does not exist');
  }
  require.aliases[to] = from;
};

/**
 * Return a require function relative to the `parent` path.
 *
 * @param {String} parent
 * @return {Function}
 * @api private
 */

require.relative = function(parent) {
  var p = require.normalize(parent, '..');

  /**
   * lastIndexOf helper.
   */

  function lastIndexOf(arr, obj) {
    var i = arr.length;
    while (i--) {
      if (arr[i] === obj) return i;
    }
    return -1;
  }

  /**
   * The relative require() itself.
   */

  function localRequire(path) {
    var resolved = localRequire.resolve(path);
    return require(resolved, parent, path);
  }

  /**
   * Resolve relative to the parent.
   */

  localRequire.resolve = function(path) {
    var c = path.charAt(0);
    if ('/' == c) return path.slice(1);
    if ('.' == c) return require.normalize(p, path);

    // resolve deps by returning
    // the dep in the nearest "deps"
    // directory
    var segs = parent.split('/');
    var i = lastIndexOf(segs, 'deps') + 1;
    if (!i) i = 0;
    path = segs.slice(0, i + 1).join('/') + '/deps/' + path;
    return path;
  };

  /**
   * Check if module is defined at `path`.
   */

  localRequire.exists = function(path) {
    return require.modules.hasOwnProperty(localRequire.resolve(path));
  };

  return localRequire;
};
require.register("component-indexof/index.js", Function("exports, require, module",
"module.exports = function(arr, obj){\n\
  if (arr.indexOf) return arr.indexOf(obj);\n\
  for (var i = 0; i < arr.length; ++i) {\n\
    if (arr[i] === obj) return i;\n\
  }\n\
  return -1;\n\
};//@ sourceURL=component-indexof/index.js"
));
require.register("component-emitter/index.js", Function("exports, require, module",
"\n\
/**\n\
 * Module dependencies.\n\
 */\n\
\n\
var index = require('indexof');\n\
\n\
/**\n\
 * Expose `Emitter`.\n\
 */\n\
\n\
module.exports = Emitter;\n\
\n\
/**\n\
 * Initialize a new `Emitter`.\n\
 *\n\
 * @api public\n\
 */\n\
\n\
function Emitter(obj) {\n\
  if (obj) return mixin(obj);\n\
};\n\
\n\
/**\n\
 * Mixin the emitter properties.\n\
 *\n\
 * @param {Object} obj\n\
 * @return {Object}\n\
 * @api private\n\
 */\n\
\n\
function mixin(obj) {\n\
  for (var key in Emitter.prototype) {\n\
    obj[key] = Emitter.prototype[key];\n\
  }\n\
  return obj;\n\
}\n\
\n\
/**\n\
 * Listen on the given `event` with `fn`.\n\
 *\n\
 * @param {String} event\n\
 * @param {Function} fn\n\
 * @return {Emitter}\n\
 * @api public\n\
 */\n\
\n\
Emitter.prototype.on = function(event, fn){\n\
  this._callbacks = this._callbacks || {};\n\
  (this._callbacks[event] = this._callbacks[event] || [])\n\
    .push(fn);\n\
  return this;\n\
};\n\
\n\
/**\n\
 * Adds an `event` listener that will be invoked a single\n\
 * time then automatically removed.\n\
 *\n\
 * @param {String} event\n\
 * @param {Function} fn\n\
 * @return {Emitter}\n\
 * @api public\n\
 */\n\
\n\
Emitter.prototype.once = function(event, fn){\n\
  var self = this;\n\
  this._callbacks = this._callbacks || {};\n\
\n\
  function on() {\n\
    self.off(event, on);\n\
    fn.apply(this, arguments);\n\
  }\n\
\n\
  fn._off = on;\n\
  this.on(event, on);\n\
  return this;\n\
};\n\
\n\
/**\n\
 * Remove the given callback for `event` or all\n\
 * registered callbacks.\n\
 *\n\
 * @param {String} event\n\
 * @param {Function} fn\n\
 * @return {Emitter}\n\
 * @api public\n\
 */\n\
\n\
Emitter.prototype.off =\n\
Emitter.prototype.removeListener =\n\
Emitter.prototype.removeAllListeners = function(event, fn){\n\
  this._callbacks = this._callbacks || {};\n\
\n\
  // all\n\
  if (0 == arguments.length) {\n\
    this._callbacks = {};\n\
    return this;\n\
  }\n\
\n\
  // specific event\n\
  var callbacks = this._callbacks[event];\n\
  if (!callbacks) return this;\n\
\n\
  // remove all handlers\n\
  if (1 == arguments.length) {\n\
    delete this._callbacks[event];\n\
    return this;\n\
  }\n\
\n\
  // remove specific handler\n\
  var i = index(callbacks, fn._off || fn);\n\
  if (~i) callbacks.splice(i, 1);\n\
  return this;\n\
};\n\
\n\
/**\n\
 * Emit `event` with the given args.\n\
 *\n\
 * @param {String} event\n\
 * @param {Mixed} ...\n\
 * @return {Emitter}\n\
 */\n\
\n\
Emitter.prototype.emit = function(event){\n\
  this._callbacks = this._callbacks || {};\n\
  var args = [].slice.call(arguments, 1)\n\
    , callbacks = this._callbacks[event];\n\
\n\
  if (callbacks) {\n\
    callbacks = callbacks.slice(0);\n\
    for (var i = 0, len = callbacks.length; i < len; ++i) {\n\
      callbacks[i].apply(this, args);\n\
    }\n\
  }\n\
\n\
  return this;\n\
};\n\
\n\
/**\n\
 * Return array of callbacks for `event`.\n\
 *\n\
 * @param {String} event\n\
 * @return {Array}\n\
 * @api public\n\
 */\n\
\n\
Emitter.prototype.listeners = function(event){\n\
  this._callbacks = this._callbacks || {};\n\
  return this._callbacks[event] || [];\n\
};\n\
\n\
/**\n\
 * Check if this emitter has `event` handlers.\n\
 *\n\
 * @param {String} event\n\
 * @return {Boolean}\n\
 * @api public\n\
 */\n\
\n\
Emitter.prototype.hasListeners = function(event){\n\
  return !! this.listeners(event).length;\n\
};\n\
//@ sourceURL=component-emitter/index.js"
));
require.register("juliangruber-stream/index.js", Function("exports, require, module",
"// Copyright Joyent, Inc. and other Node contributors.\n\
//\n\
// Permission is hereby granted, free of charge, to any person obtaining a\n\
// copy of this software and associated documentation files (the\n\
// \"Software\"), to deal in the Software without restriction, including\n\
// without limitation the rights to use, copy, modify, merge, publish,\n\
// distribute, sublicense, and/or sell copies of the Software, and to permit\n\
// persons to whom the Software is furnished to do so, subject to the\n\
// following conditions:\n\
//\n\
// The above copyright notice and this permission notice shall be included\n\
// in all copies or substantial portions of the Software.\n\
//\n\
// THE SOFTWARE IS PROVIDED \"AS IS\", WITHOUT WARRANTY OF ANY KIND, EXPRESS\n\
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF\n\
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN\n\
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,\n\
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR\n\
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE\n\
// USE OR OTHER DEALINGS IN THE SOFTWARE.\n\
\n\
var Emitter = require('emitter');\n\
\n\
function Stream() {\n\
  Emitter.call(this);\n\
}\n\
Stream.prototype = new Emitter();\n\
module.exports = Stream;\n\
// Backwards-compat with node 0.4.x\n\
Stream.Stream = Stream;\n\
\n\
Stream.prototype.pipe = function(dest, options) {\n\
  var source = this;\n\
\n\
  function ondata(chunk) {\n\
    if (dest.writable) {\n\
      if (false === dest.write(chunk) && source.pause) {\n\
        source.pause();\n\
      }\n\
    }\n\
  }\n\
\n\
  source.on('data', ondata);\n\
\n\
  function ondrain() {\n\
    if (source.readable && source.resume) {\n\
      source.resume();\n\
    }\n\
  }\n\
\n\
  dest.on('drain', ondrain);\n\
\n\
  // If the 'end' option is not supplied, dest.end() will be called when\n\
  // source gets the 'end' or 'close' events.  Only dest.end() once.\n\
  if (!dest._isStdio && (!options || options.end !== false)) {\n\
    source.on('end', onend);\n\
    source.on('close', onclose);\n\
  }\n\
\n\
  var didOnEnd = false;\n\
  function onend() {\n\
    if (didOnEnd) return;\n\
    didOnEnd = true;\n\
\n\
    dest.end();\n\
  }\n\
\n\
\n\
  function onclose() {\n\
    if (didOnEnd) return;\n\
    didOnEnd = true;\n\
\n\
    if (typeof dest.destroy === 'function') dest.destroy();\n\
  }\n\
\n\
  // don't leave dangling pipes when there are errors.\n\
  function onerror(er) {\n\
    cleanup();\n\
    if (!this.hasListeners('error')) {\n\
      throw er; // Unhandled stream error in pipe.\n\
    }\n\
  }\n\
\n\
  source.on('error', onerror);\n\
  dest.on('error', onerror);\n\
\n\
  // remove all the event listeners that were added.\n\
  function cleanup() {\n\
    source.off('data', ondata);\n\
    dest.off('drain', ondrain);\n\
\n\
    source.off('end', onend);\n\
    source.off('close', onclose);\n\
\n\
    source.off('error', onerror);\n\
    dest.off('error', onerror);\n\
\n\
    source.off('end', cleanup);\n\
    source.off('close', cleanup);\n\
\n\
    dest.off('end', cleanup);\n\
    dest.off('close', cleanup);\n\
  }\n\
\n\
  source.on('end', cleanup);\n\
  source.on('close', cleanup);\n\
\n\
  dest.on('end', cleanup);\n\
  dest.on('close', cleanup);\n\
\n\
  dest.emit('pipe', source);\n\
\n\
  // Allow for unix-like usage: A.pipe(B).pipe(C)\n\
  return dest;\n\
}\n\
//@ sourceURL=juliangruber-stream/index.js"
));
require.register("jb55-domready/index.js", Function("exports, require, module",
"/*!\n\
  * domready (c) Dustin Diaz 2012 - License MIT\n\
  */\n\
!function (name, definition) {\n\
  if (typeof module != 'undefined') module.exports = definition()\n\
  else if (typeof define == 'function' && typeof define.amd == 'object') define(definition)\n\
  else this[name] = definition()\n\
}('domready', function (ready) {\n\
\n\
  var fns = [], fn, f = false\n\
    , doc = document\n\
    , testEl = doc.documentElement\n\
    , hack = testEl.doScroll\n\
    , domContentLoaded = 'DOMContentLoaded'\n\
    , addEventListener = 'addEventListener'\n\
    , onreadystatechange = 'onreadystatechange'\n\
    , readyState = 'readyState'\n\
    , loaded = /^loade|c/.test(doc[readyState])\n\
\n\
  function flush(f) {\n\
    loaded = 1\n\
    while (f = fns.shift()) f()\n\
  }\n\
\n\
  doc[addEventListener] && doc[addEventListener](domContentLoaded, fn = function () {\n\
    doc.removeEventListener(domContentLoaded, fn, f)\n\
    flush()\n\
  }, f)\n\
\n\
\n\
  hack && doc.attachEvent(onreadystatechange, fn = function () {\n\
    if (/^c/.test(doc[readyState])) {\n\
      doc.detachEvent(onreadystatechange, fn)\n\
      flush()\n\
    }\n\
  })\n\
\n\
  return (ready = hack ?\n\
    function (fn) {\n\
      self != top ?\n\
        loaded ? fn() : fns.push(fn) :\n\
        function () {\n\
          try {\n\
            testEl.doScroll('left')\n\
          } catch (e) {\n\
            return setTimeout(function() { ready(fn) }, 50)\n\
          }\n\
          fn()\n\
        }()\n\
    } :\n\
    function (fn) {\n\
      loaded ? fn() : fns.push(fn)\n\
    })\n\
})//@ sourceURL=jb55-domready/index.js"
));
require.register("component-domify/index.js", Function("exports, require, module",
"\n\
/**\n\
 * Expose `parse`.\n\
 */\n\
\n\
module.exports = parse;\n\
\n\
/**\n\
 * Wrap map from jquery.\n\
 */\n\
\n\
var map = {\n\
  option: [1, '<select multiple=\"multiple\">', '</select>'],\n\
  optgroup: [1, '<select multiple=\"multiple\">', '</select>'],\n\
  legend: [1, '<fieldset>', '</fieldset>'],\n\
  thead: [1, '<table>', '</table>'],\n\
  tbody: [1, '<table>', '</table>'],\n\
  tfoot: [1, '<table>', '</table>'],\n\
  colgroup: [1, '<table>', '</table>'],\n\
  caption: [1, '<table>', '</table>'],\n\
  tr: [2, '<table><tbody>', '</tbody></table>'],\n\
  td: [3, '<table><tbody><tr>', '</tr></tbody></table>'],\n\
  th: [3, '<table><tbody><tr>', '</tr></tbody></table>'],\n\
  col: [2, '<table><tbody></tbody><colgroup>', '</colgroup></table>'],\n\
  _default: [0, '', '']\n\
};\n\
\n\
/**\n\
 * Parse `html` and return the children.\n\
 *\n\
 * @param {String} html\n\
 * @return {Array}\n\
 * @api private\n\
 */\n\
\n\
function parse(html) {\n\
  if ('string' != typeof html) throw new TypeError('String expected');\n\
\n\
  // tag name\n\
  var m = /<([\\w:]+)/.exec(html);\n\
  if (!m) throw new Error('No elements were generated.');\n\
  var tag = m[1];\n\
\n\
  // body support\n\
  if (tag == 'body') {\n\
    var el = document.createElement('html');\n\
    el.innerHTML = html;\n\
    return el.removeChild(el.lastChild);\n\
  }\n\
\n\
  // wrap map\n\
  var wrap = map[tag] || map._default;\n\
  var depth = wrap[0];\n\
  var prefix = wrap[1];\n\
  var suffix = wrap[2];\n\
  var el = document.createElement('div');\n\
  el.innerHTML = prefix + html + suffix;\n\
  while (depth--) el = el.lastChild;\n\
\n\
  var els = el.children;\n\
  if (1 == els.length) {\n\
    return el.removeChild(els[0]);\n\
  }\n\
\n\
  var fragment = document.createDocumentFragment();\n\
  while (els.length) {\n\
    fragment.appendChild(el.removeChild(els[0]));\n\
  }\n\
\n\
  return fragment;\n\
}\n\
//@ sourceURL=component-domify/index.js"
));
require.register("visionmedia-minstache/index.js", Function("exports, require, module",
"\n\
/**\n\
 * Expose `render()`.`\n\
 */\n\
\n\
exports = module.exports = render;\n\
\n\
/**\n\
 * Expose `compile()`.\n\
 */\n\
\n\
exports.compile = compile;\n\
\n\
/**\n\
 * Render the given mustache `str` with `obj`.\n\
 *\n\
 * @param {String} str\n\
 * @param {Object} obj\n\
 * @return {String}\n\
 * @api public\n\
 */\n\
\n\
function render(str, obj) {\n\
  obj = obj || {};\n\
  var fn = compile(str);\n\
  return fn(obj);\n\
}\n\
\n\
/**\n\
 * Compile the given `str` to a `Function`.\n\
 *\n\
 * @param {String} str\n\
 * @return {Function}\n\
 * @api public\n\
 */\n\
\n\
function compile(str) {\n\
  var js = [];\n\
  var toks = parse(str);\n\
  var tok;\n\
\n\
  for (var i = 0; i < toks.length; ++i) {\n\
    tok = toks[i];\n\
    if (i % 2 == 0) {\n\
      js.push('\"' + tok.replace(/\"/g, '\\\\\"') + '\"');\n\
    } else {\n\
      switch (tok[0]) {\n\
        case '/':\n\
          tok = tok.slice(1);\n\
          js.push(') + ');\n\
          break;\n\
        case '^':\n\
          tok = tok.slice(1);\n\
          assertProperty(tok);\n\
          js.push(' + section(obj, \"' + tok + '\", true, ');\n\
          break;\n\
        case '#':\n\
          tok = tok.slice(1);\n\
          assertProperty(tok);\n\
          js.push(' + section(obj, \"' + tok + '\", false, ');\n\
          break;\n\
        case '!':\n\
          tok = tok.slice(1);\n\
          assertProperty(tok);\n\
          js.push(' + obj.' + tok + ' + ');\n\
          break;\n\
        default:\n\
          assertProperty(tok);\n\
          js.push(' + escape(obj.' + tok + ') + ');\n\
      }\n\
    }\n\
  }\n\
\n\
  js = '\\n\
'\n\
    + indent(escape.toString()) + ';\\n\
\\n\
'\n\
    + indent(section.toString()) + ';\\n\
\\n\
'\n\
    + '  return ' + js.join('').replace(/\\n\
/g, '\\\\n\
');\n\
\n\
  return new Function('obj', js);\n\
}\n\
\n\
/**\n\
 * Assert that `prop` is a valid property.\n\
 *\n\
 * @param {String} prop\n\
 * @api private\n\
 */\n\
\n\
function assertProperty(prop) {\n\
  if (!prop.match(/^[\\w.]+$/)) throw new Error('invalid property \"' + prop + '\"');\n\
}\n\
\n\
/**\n\
 * Parse `str`.\n\
 *\n\
 * @param {String} str\n\
 * @return {Array}\n\
 * @api private\n\
 */\n\
\n\
function parse(str) {\n\
  return str.split(/\\{\\{|\\}\\}/);\n\
}\n\
\n\
/**\n\
 * Indent `str`.\n\
 *\n\
 * @param {String} str\n\
 * @return {String}\n\
 * @api private\n\
 */\n\
\n\
function indent(str) {\n\
  return str.replace(/^/gm, '  ');\n\
}\n\
\n\
/**\n\
 * Section handler.\n\
 *\n\
 * @param {Object} context obj\n\
 * @param {String} prop\n\
 * @param {String} str\n\
 * @param {Boolean} negate\n\
 * @api private\n\
 */\n\
\n\
function section(obj, prop, negate, str) {\n\
  var val = obj[prop];\n\
  if ('function' == typeof val) return val.call(obj, str);\n\
  if (negate) val = !val;\n\
  if (val) return str;\n\
  return '';\n\
}\n\
\n\
/**\n\
 * Escape the given `html`.\n\
 *\n\
 * @param {String} html\n\
 * @return {String}\n\
 * @api private\n\
 */\n\
\n\
function escape(html) {\n\
  return String(html)\n\
    .replace(/&/g, '&amp;')\n\
    .replace(/\"/g, '&quot;')\n\
    .replace(/</g, '&lt;')\n\
    .replace(/>/g, '&gt;');\n\
}\n\
//@ sourceURL=visionmedia-minstache/index.js"
));
require.register("chirp/build/browser.js", Function("exports, require, module",
"(function(e){if(\"function\"==typeof bootstrap)bootstrap(\"__browser__\",e);else if(\"object\"==typeof exports)module.exports=e();else if(\"function\"==typeof define&&define.amd)define(e);else if(\"undefined\"!=typeof ses){if(!ses.ok())return;ses.makeBrowser=e}else\"undefined\"!=typeof window?window.browser=e():global.browser=e()})(function(){var define,ses,bootstrap,module,exports;\n\
return (function(e,t,n){function i(n,s){if(!t[n]){if(!e[n]){var o=typeof require==\"function\"&&require;if(!s&&o)return o(n,!0);if(r)return r(n,!0);throw new Error(\"Cannot find module '\"+n+\"'\")}var u=t[n]={exports:{}};e[n][0].call(u.exports,function(t){var r=e[n][1][t];return i(r?r:t)},u,u.exports)}return t[n].exports}var r=typeof require==\"function\"&&require;for(var s=0;s<n.length;s++)i(n[s]);return i})({1:[function(require,module,exports){\n\
\n\
/**\n\
 * Module dependencies\n\
 */\n\
\n\
var stream = require('stream')\n\
\n\
\n\
exports.Stream = stream.Stream;\n\
\n\
},{\"stream\":2}],2:[function(require,module,exports){\n\
var events = require('events');\n\
var util = require('util');\n\
\n\
function Stream() {\n\
  events.EventEmitter.call(this);\n\
}\n\
util.inherits(Stream, events.EventEmitter);\n\
module.exports = Stream;\n\
// Backwards-compat with node 0.4.x\n\
Stream.Stream = Stream;\n\
\n\
Stream.prototype.pipe = function(dest, options) {\n\
  var source = this;\n\
\n\
  function ondata(chunk) {\n\
    if (dest.writable) {\n\
      if (false === dest.write(chunk) && source.pause) {\n\
        source.pause();\n\
      }\n\
    }\n\
  }\n\
\n\
  source.on('data', ondata);\n\
\n\
  function ondrain() {\n\
    if (source.readable && source.resume) {\n\
      source.resume();\n\
    }\n\
  }\n\
\n\
  dest.on('drain', ondrain);\n\
\n\
  // If the 'end' option is not supplied, dest.end() will be called when\n\
  // source gets the 'end' or 'close' events.  Only dest.end() once, and\n\
  // only when all sources have ended.\n\
  if (!dest._isStdio && (!options || options.end !== false)) {\n\
    dest._pipeCount = dest._pipeCount || 0;\n\
    dest._pipeCount++;\n\
\n\
    source.on('end', onend);\n\
    source.on('close', onclose);\n\
  }\n\
\n\
  var didOnEnd = false;\n\
  function onend() {\n\
    if (didOnEnd) return;\n\
    didOnEnd = true;\n\
\n\
    dest._pipeCount--;\n\
\n\
    // remove the listeners\n\
    cleanup();\n\
\n\
    if (dest._pipeCount > 0) {\n\
      // waiting for other incoming streams to end.\n\
      return;\n\
    }\n\
\n\
    dest.end();\n\
  }\n\
\n\
\n\
  function onclose() {\n\
    if (didOnEnd) return;\n\
    didOnEnd = true;\n\
\n\
    dest._pipeCount--;\n\
\n\
    // remove the listeners\n\
    cleanup();\n\
\n\
    if (dest._pipeCount > 0) {\n\
      // waiting for other incoming streams to end.\n\
      return;\n\
    }\n\
\n\
    dest.destroy();\n\
  }\n\
\n\
  // don't leave dangling pipes when there are errors.\n\
  function onerror(er) {\n\
    cleanup();\n\
    if (this.listeners('error').length === 0) {\n\
      throw er; // Unhandled stream error in pipe.\n\
    }\n\
  }\n\
\n\
  source.on('error', onerror);\n\
  dest.on('error', onerror);\n\
\n\
  // remove all the event listeners that were added.\n\
  function cleanup() {\n\
    source.removeListener('data', ondata);\n\
    dest.removeListener('drain', ondrain);\n\
\n\
    source.removeListener('end', onend);\n\
    source.removeListener('close', onclose);\n\
\n\
    source.removeListener('error', onerror);\n\
    dest.removeListener('error', onerror);\n\
\n\
    source.removeListener('end', cleanup);\n\
    source.removeListener('close', cleanup);\n\
\n\
    dest.removeListener('end', cleanup);\n\
    dest.removeListener('close', cleanup);\n\
  }\n\
\n\
  source.on('end', cleanup);\n\
  source.on('close', cleanup);\n\
\n\
  dest.on('end', cleanup);\n\
  dest.on('close', cleanup);\n\
\n\
  dest.emit('pipe', source);\n\
\n\
  // Allow for unix-like usage: A.pipe(B).pipe(C)\n\
  return dest;\n\
};\n\
\n\
},{\"events\":3,\"util\":4}],5:[function(require,module,exports){\n\
// shim for using process in browser\n\
\n\
var process = module.exports = {};\n\
\n\
process.nextTick = (function () {\n\
    var canSetImmediate = typeof window !== 'undefined'\n\
    && window.setImmediate;\n\
    var canPost = typeof window !== 'undefined'\n\
    && window.postMessage && window.addEventListener\n\
    ;\n\
\n\
    if (canSetImmediate) {\n\
        return function (f) { return window.setImmediate(f) };\n\
    }\n\
\n\
    if (canPost) {\n\
        var queue = [];\n\
        window.addEventListener('message', function (ev) {\n\
            if (ev.source === window && ev.data === 'process-tick') {\n\
                ev.stopPropagation();\n\
                if (queue.length > 0) {\n\
                    var fn = queue.shift();\n\
                    fn();\n\
                }\n\
            }\n\
        }, true);\n\
\n\
        return function nextTick(fn) {\n\
            queue.push(fn);\n\
            window.postMessage('process-tick', '*');\n\
        };\n\
    }\n\
\n\
    return function nextTick(fn) {\n\
        setTimeout(fn, 0);\n\
    };\n\
})();\n\
\n\
process.title = 'browser';\n\
process.browser = true;\n\
process.env = {};\n\
process.argv = [];\n\
\n\
process.binding = function (name) {\n\
    throw new Error('process.binding is not supported');\n\
}\n\
\n\
// TODO(shtylman)\n\
process.cwd = function () { return '/' };\n\
process.chdir = function (dir) {\n\
    throw new Error('process.chdir is not supported');\n\
};\n\
\n\
},{}],3:[function(require,module,exports){\n\
(function(process){if (!process.EventEmitter) process.EventEmitter = function () {};\n\
\n\
var EventEmitter = exports.EventEmitter = process.EventEmitter;\n\
var isArray = typeof Array.isArray === 'function'\n\
    ? Array.isArray\n\
    : function (xs) {\n\
        return Object.prototype.toString.call(xs) === '[object Array]'\n\
    }\n\
;\n\
function indexOf (xs, x) {\n\
    if (xs.indexOf) return xs.indexOf(x);\n\
    for (var i = 0; i < xs.length; i++) {\n\
        if (x === xs[i]) return i;\n\
    }\n\
    return -1;\n\
}\n\
\n\
// By default EventEmitters will print a warning if more than\n\
// 10 listeners are added to it. This is a useful default which\n\
// helps finding memory leaks.\n\
//\n\
// Obviously not all Emitters should be limited to 10. This function allows\n\
// that to be increased. Set to zero for unlimited.\n\
var defaultMaxListeners = 10;\n\
EventEmitter.prototype.setMaxListeners = function(n) {\n\
  if (!this._events) this._events = {};\n\
  this._events.maxListeners = n;\n\
};\n\
\n\
\n\
EventEmitter.prototype.emit = function(type) {\n\
  // If there is no 'error' event listener then throw.\n\
  if (type === 'error') {\n\
    if (!this._events || !this._events.error ||\n\
        (isArray(this._events.error) && !this._events.error.length))\n\
    {\n\
      if (arguments[1] instanceof Error) {\n\
        throw arguments[1]; // Unhandled 'error' event\n\
      } else {\n\
        throw new Error(\"Uncaught, unspecified 'error' event.\");\n\
      }\n\
      return false;\n\
    }\n\
  }\n\
\n\
  if (!this._events) return false;\n\
  var handler = this._events[type];\n\
  if (!handler) return false;\n\
\n\
  if (typeof handler == 'function') {\n\
    switch (arguments.length) {\n\
      // fast cases\n\
      case 1:\n\
        handler.call(this);\n\
        break;\n\
      case 2:\n\
        handler.call(this, arguments[1]);\n\
        break;\n\
      case 3:\n\
        handler.call(this, arguments[1], arguments[2]);\n\
        break;\n\
      // slower\n\
      default:\n\
        var args = Array.prototype.slice.call(arguments, 1);\n\
        handler.apply(this, args);\n\
    }\n\
    return true;\n\
\n\
  } else if (isArray(handler)) {\n\
    var args = Array.prototype.slice.call(arguments, 1);\n\
\n\
    var listeners = handler.slice();\n\
    for (var i = 0, l = listeners.length; i < l; i++) {\n\
      listeners[i].apply(this, args);\n\
    }\n\
    return true;\n\
\n\
  } else {\n\
    return false;\n\
  }\n\
};\n\
\n\
// EventEmitter is defined in src/node_events.cc\n\
// EventEmitter.prototype.emit() is also defined there.\n\
EventEmitter.prototype.addListener = function(type, listener) {\n\
  if ('function' !== typeof listener) {\n\
    throw new Error('addListener only takes instances of Function');\n\
  }\n\
\n\
  if (!this._events) this._events = {};\n\
\n\
  // To avoid recursion in the case that type == \"newListeners\"! Before\n\
  // adding it to the listeners, first emit \"newListeners\".\n\
  this.emit('newListener', type, listener);\n\
\n\
  if (!this._events[type]) {\n\
    // Optimize the case of one listener. Don't need the extra array object.\n\
    this._events[type] = listener;\n\
  } else if (isArray(this._events[type])) {\n\
\n\
    // Check for listener leak\n\
    if (!this._events[type].warned) {\n\
      var m;\n\
      if (this._events.maxListeners !== undefined) {\n\
        m = this._events.maxListeners;\n\
      } else {\n\
        m = defaultMaxListeners;\n\
      }\n\
\n\
      if (m && m > 0 && this._events[type].length > m) {\n\
        this._events[type].warned = true;\n\
        console.error('(node) warning: possible EventEmitter memory ' +\n\
                      'leak detected. %d listeners added. ' +\n\
                      'Use emitter.setMaxListeners() to increase limit.',\n\
                      this._events[type].length);\n\
        console.trace();\n\
      }\n\
    }\n\
\n\
    // If we've already got an array, just append.\n\
    this._events[type].push(listener);\n\
  } else {\n\
    // Adding the second element, need to change to array.\n\
    this._events[type] = [this._events[type], listener];\n\
  }\n\
\n\
  return this;\n\
};\n\
\n\
EventEmitter.prototype.on = EventEmitter.prototype.addListener;\n\
\n\
EventEmitter.prototype.once = function(type, listener) {\n\
  var self = this;\n\
  self.on(type, function g() {\n\
    self.removeListener(type, g);\n\
    listener.apply(this, arguments);\n\
  });\n\
\n\
  return this;\n\
};\n\
\n\
EventEmitter.prototype.removeListener = function(type, listener) {\n\
  if ('function' !== typeof listener) {\n\
    throw new Error('removeListener only takes instances of Function');\n\
  }\n\
\n\
  // does not use listeners(), so no side effect of creating _events[type]\n\
  if (!this._events || !this._events[type]) return this;\n\
\n\
  var list = this._events[type];\n\
\n\
  if (isArray(list)) {\n\
    var i = indexOf(list, listener);\n\
    if (i < 0) return this;\n\
    list.splice(i, 1);\n\
    if (list.length == 0)\n\
      delete this._events[type];\n\
  } else if (this._events[type] === listener) {\n\
    delete this._events[type];\n\
  }\n\
\n\
  return this;\n\
};\n\
\n\
EventEmitter.prototype.removeAllListeners = function(type) {\n\
  if (arguments.length === 0) {\n\
    this._events = {};\n\
    return this;\n\
  }\n\
\n\
  // does not use listeners(), so no side effect of creating _events[type]\n\
  if (type && this._events && this._events[type]) this._events[type] = null;\n\
  return this;\n\
};\n\
\n\
EventEmitter.prototype.listeners = function(type) {\n\
  if (!this._events) this._events = {};\n\
  if (!this._events[type]) this._events[type] = [];\n\
  if (!isArray(this._events[type])) {\n\
    this._events[type] = [this._events[type]];\n\
  }\n\
  return this._events[type];\n\
};\n\
\n\
})(require(\"__browserify_process\"))\n\
},{\"__browserify_process\":5}],4:[function(require,module,exports){\n\
var events = require('events');\n\
\n\
exports.isArray = isArray;\n\
exports.isDate = function(obj){return Object.prototype.toString.call(obj) === '[object Date]'};\n\
exports.isRegExp = function(obj){return Object.prototype.toString.call(obj) === '[object RegExp]'};\n\
\n\
\n\
exports.print = function () {};\n\
exports.puts = function () {};\n\
exports.debug = function() {};\n\
\n\
exports.inspect = function(obj, showHidden, depth, colors) {\n\
  var seen = [];\n\
\n\
  var stylize = function(str, styleType) {\n\
    // http://en.wikipedia.org/wiki/ANSI_escape_code#graphics\n\
    var styles =\n\
        { 'bold' : [1, 22],\n\
          'italic' : [3, 23],\n\
          'underline' : [4, 24],\n\
          'inverse' : [7, 27],\n\
          'white' : [37, 39],\n\
          'grey' : [90, 39],\n\
          'black' : [30, 39],\n\
          'blue' : [34, 39],\n\
          'cyan' : [36, 39],\n\
          'green' : [32, 39],\n\
          'magenta' : [35, 39],\n\
          'red' : [31, 39],\n\
          'yellow' : [33, 39] };\n\
\n\
    var style =\n\
        { 'special': 'cyan',\n\
          'number': 'blue',\n\
          'boolean': 'yellow',\n\
          'undefined': 'grey',\n\
          'null': 'bold',\n\
          'string': 'green',\n\
          'date': 'magenta',\n\
          // \"name\": intentionally not styling\n\
          'regexp': 'red' }[styleType];\n\
\n\
    if (style) {\n\
      return '\\033[' + styles[style][0] + 'm' + str +\n\
             '\\033[' + styles[style][1] + 'm';\n\
    } else {\n\
      return str;\n\
    }\n\
  };\n\
  if (! colors) {\n\
    stylize = function(str, styleType) { return str; };\n\
  }\n\
\n\
  function format(value, recurseTimes) {\n\
    // Provide a hook for user-specified inspect functions.\n\
    // Check that value is an object with an inspect function on it\n\
    if (value && typeof value.inspect === 'function' &&\n\
        // Filter out the util module, it's inspect function is special\n\
        value !== exports &&\n\
        // Also filter out any prototype objects using the circular check.\n\
        !(value.constructor && value.constructor.prototype === value)) {\n\
      return value.inspect(recurseTimes);\n\
    }\n\
\n\
    // Primitive types cannot have properties\n\
    switch (typeof value) {\n\
      case 'undefined':\n\
        return stylize('undefined', 'undefined');\n\
\n\
      case 'string':\n\
        var simple = '\\'' + JSON.stringify(value).replace(/^\"|\"$/g, '')\n\
                                                 .replace(/'/g, \"\\\\'\")\n\
                                                 .replace(/\\\\\"/g, '\"') + '\\'';\n\
        return stylize(simple, 'string');\n\
\n\
      case 'number':\n\
        return stylize('' + value, 'number');\n\
\n\
      case 'boolean':\n\
        return stylize('' + value, 'boolean');\n\
    }\n\
    // For some reason typeof null is \"object\", so special case here.\n\
    if (value === null) {\n\
      return stylize('null', 'null');\n\
    }\n\
\n\
    // Look up the keys of the object.\n\
    var visible_keys = Object_keys(value);\n\
    var keys = showHidden ? Object_getOwnPropertyNames(value) : visible_keys;\n\
\n\
    // Functions without properties can be shortcutted.\n\
    if (typeof value === 'function' && keys.length === 0) {\n\
      if (isRegExp(value)) {\n\
        return stylize('' + value, 'regexp');\n\
      } else {\n\
        var name = value.name ? ': ' + value.name : '';\n\
        return stylize('[Function' + name + ']', 'special');\n\
      }\n\
    }\n\
\n\
    // Dates without properties can be shortcutted\n\
    if (isDate(value) && keys.length === 0) {\n\
      return stylize(value.toUTCString(), 'date');\n\
    }\n\
\n\
    var base, type, braces;\n\
    // Determine the object type\n\
    if (isArray(value)) {\n\
      type = 'Array';\n\
      braces = ['[', ']'];\n\
    } else {\n\
      type = 'Object';\n\
      braces = ['{', '}'];\n\
    }\n\
\n\
    // Make functions say that they are functions\n\
    if (typeof value === 'function') {\n\
      var n = value.name ? ': ' + value.name : '';\n\
      base = (isRegExp(value)) ? ' ' + value : ' [Function' + n + ']';\n\
    } else {\n\
      base = '';\n\
    }\n\
\n\
    // Make dates with properties first say the date\n\
    if (isDate(value)) {\n\
      base = ' ' + value.toUTCString();\n\
    }\n\
\n\
    if (keys.length === 0) {\n\
      return braces[0] + base + braces[1];\n\
    }\n\
\n\
    if (recurseTimes < 0) {\n\
      if (isRegExp(value)) {\n\
        return stylize('' + value, 'regexp');\n\
      } else {\n\
        return stylize('[Object]', 'special');\n\
      }\n\
    }\n\
\n\
    seen.push(value);\n\
\n\
    var output = keys.map(function(key) {\n\
      var name, str;\n\
      if (value.__lookupGetter__) {\n\
        if (value.__lookupGetter__(key)) {\n\
          if (value.__lookupSetter__(key)) {\n\
            str = stylize('[Getter/Setter]', 'special');\n\
          } else {\n\
            str = stylize('[Getter]', 'special');\n\
          }\n\
        } else {\n\
          if (value.__lookupSetter__(key)) {\n\
            str = stylize('[Setter]', 'special');\n\
          }\n\
        }\n\
      }\n\
      if (visible_keys.indexOf(key) < 0) {\n\
        name = '[' + key + ']';\n\
      }\n\
      if (!str) {\n\
        if (seen.indexOf(value[key]) < 0) {\n\
          if (recurseTimes === null) {\n\
            str = format(value[key]);\n\
          } else {\n\
            str = format(value[key], recurseTimes - 1);\n\
          }\n\
          if (str.indexOf('\\n\
') > -1) {\n\
            if (isArray(value)) {\n\
              str = str.split('\\n\
').map(function(line) {\n\
                return '  ' + line;\n\
              }).join('\\n\
').substr(2);\n\
            } else {\n\
              str = '\\n\
' + str.split('\\n\
').map(function(line) {\n\
                return '   ' + line;\n\
              }).join('\\n\
');\n\
            }\n\
          }\n\
        } else {\n\
          str = stylize('[Circular]', 'special');\n\
        }\n\
      }\n\
      if (typeof name === 'undefined') {\n\
        if (type === 'Array' && key.match(/^\\d+$/)) {\n\
          return str;\n\
        }\n\
        name = JSON.stringify('' + key);\n\
        if (name.match(/^\"([a-zA-Z_][a-zA-Z_0-9]*)\"$/)) {\n\
          name = name.substr(1, name.length - 2);\n\
          name = stylize(name, 'name');\n\
        } else {\n\
          name = name.replace(/'/g, \"\\\\'\")\n\
                     .replace(/\\\\\"/g, '\"')\n\
                     .replace(/(^\"|\"$)/g, \"'\");\n\
          name = stylize(name, 'string');\n\
        }\n\
      }\n\
\n\
      return name + ': ' + str;\n\
    });\n\
\n\
    seen.pop();\n\
\n\
    var numLinesEst = 0;\n\
    var length = output.reduce(function(prev, cur) {\n\
      numLinesEst++;\n\
      if (cur.indexOf('\\n\
') >= 0) numLinesEst++;\n\
      return prev + cur.length + 1;\n\
    }, 0);\n\
\n\
    if (length > 50) {\n\
      output = braces[0] +\n\
               (base === '' ? '' : base + '\\n\
 ') +\n\
               ' ' +\n\
               output.join(',\\n\
  ') +\n\
               ' ' +\n\
               braces[1];\n\
\n\
    } else {\n\
      output = braces[0] + base + ' ' + output.join(', ') + ' ' + braces[1];\n\
    }\n\
\n\
    return output;\n\
  }\n\
  return format(obj, (typeof depth === 'undefined' ? 2 : depth));\n\
};\n\
\n\
\n\
function isArray(ar) {\n\
  return ar instanceof Array ||\n\
         Array.isArray(ar) ||\n\
         (ar && ar !== Object.prototype && isArray(ar.__proto__));\n\
}\n\
\n\
\n\
function isRegExp(re) {\n\
  return re instanceof RegExp ||\n\
    (typeof re === 'object' && Object.prototype.toString.call(re) === '[object RegExp]');\n\
}\n\
\n\
\n\
function isDate(d) {\n\
  if (d instanceof Date) return true;\n\
  if (typeof d !== 'object') return false;\n\
  var properties = Date.prototype && Object_getOwnPropertyNames(Date.prototype);\n\
  var proto = d.__proto__ && Object_getOwnPropertyNames(d.__proto__);\n\
  return JSON.stringify(proto) === JSON.stringify(properties);\n\
}\n\
\n\
function pad(n) {\n\
  return n < 10 ? '0' + n.toString(10) : n.toString(10);\n\
}\n\
\n\
var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep',\n\
              'Oct', 'Nov', 'Dec'];\n\
\n\
// 26 Feb 16:19:34\n\
function timestamp() {\n\
  var d = new Date();\n\
  var time = [pad(d.getHours()),\n\
              pad(d.getMinutes()),\n\
              pad(d.getSeconds())].join(':');\n\
  return [d.getDate(), months[d.getMonth()], time].join(' ');\n\
}\n\
\n\
exports.log = function (msg) {};\n\
\n\
exports.pump = null;\n\
\n\
var Object_keys = Object.keys || function (obj) {\n\
    var res = [];\n\
    for (var key in obj) res.push(key);\n\
    return res;\n\
};\n\
\n\
var Object_getOwnPropertyNames = Object.getOwnPropertyNames || function (obj) {\n\
    var res = [];\n\
    for (var key in obj) {\n\
        if (Object.hasOwnProperty.call(obj, key)) res.push(key);\n\
    }\n\
    return res;\n\
};\n\
\n\
var Object_create = Object.create || function (prototype, properties) {\n\
    // from es5-shim\n\
    var object;\n\
    if (prototype === null) {\n\
        object = { '__proto__' : null };\n\
    }\n\
    else {\n\
        if (typeof prototype !== 'object') {\n\
            throw new TypeError(\n\
                'typeof prototype[' + (typeof prototype) + '] != \\'object\\''\n\
            );\n\
        }\n\
        var Type = function () {};\n\
        Type.prototype = prototype;\n\
        object = new Type();\n\
        object.__proto__ = prototype;\n\
    }\n\
    if (typeof properties !== 'undefined' && Object.defineProperties) {\n\
        Object.defineProperties(object, properties);\n\
    }\n\
    return object;\n\
};\n\
\n\
exports.inherits = function(ctor, superCtor) {\n\
  ctor.super_ = superCtor;\n\
  ctor.prototype = Object_create(superCtor.prototype, {\n\
    constructor: {\n\
      value: ctor,\n\
      enumerable: false,\n\
      writable: true,\n\
      configurable: true\n\
    }\n\
  });\n\
};\n\
\n\
var formatRegExp = /%[sdj%]/g;\n\
exports.format = function(f) {\n\
  if (typeof f !== 'string') {\n\
    var objects = [];\n\
    for (var i = 0; i < arguments.length; i++) {\n\
      objects.push(exports.inspect(arguments[i]));\n\
    }\n\
    return objects.join(' ');\n\
  }\n\
\n\
  var i = 1;\n\
  var args = arguments;\n\
  var len = args.length;\n\
  var str = String(f).replace(formatRegExp, function(x) {\n\
    if (x === '%%') return '%';\n\
    if (i >= len) return x;\n\
    switch (x) {\n\
      case '%s': return String(args[i++]);\n\
      case '%d': return Number(args[i++]);\n\
      case '%j': return JSON.stringify(args[i++]);\n\
      default:\n\
        return x;\n\
    }\n\
  });\n\
  for(var x = args[i]; i < len; x = args[++i]){\n\
    if (x === null || typeof x !== 'object') {\n\
      str += ' ' + x;\n\
    } else {\n\
      str += ' ' + exports.inspect(x);\n\
    }\n\
  }\n\
  return str;\n\
};\n\
\n\
},{\"events\":3}]},{},[1])(1)\n\
});\n\
;//@ sourceURL=chirp/build/browser.js"
));
require.register("chirp/public/js/chirp/index.js", Function("exports, require, module",
"\n\
/**\n\
 * Module dependencies\n\
 */\n\
\n\
var browser = require('../../../build/browser')\n\
  , Stream = browser.Stream\n\
  , domready = require('domready')\n\
  , dom = require('domify')\n\
  , minstache = require('minstache')\n\
  , defer = setTimeout\n\
  , puts = console.log.bind(console, 'chirp:')\n\
  , error = puts.bind(puts, 'error:')\n\
\n\
\n\
/**\n\
 * DOM ready state\n\
 */\n\
\n\
var DOM_IS_READY = false;\n\
domready(function () { DOM_IS_READY = true; });\n\
\n\
\n\
/**\n\
 * Export `chirp`\n\
 */\n\
\n\
module.exports = chirp;\n\
\n\
\n\
/**\n\
 * Storage api\n\
 *\n\
 * @api public\n\
 */\n\
var store = chirp.store = {\n\
  get: localStorage.getItem.bind(localStorage),\n\
  put: localStorage.setItem.bind(localStorage),\n\
  del: localStorage.removeItem.bind(localStorage),\n\
  clear: localStorage.clear.bind(localStorage),\n\
  has: function (key) { return !!this.get(key); }\n\
};\n\
\n\
\n\
/**\n\
 * `chirp` construct\n\
 *\n\
 * @api public\n\
 * @param {Node} node\n\
 * @param {Object} client\n\
 */\n\
\n\
function chirp (node, client) {\n\
  if (!(this instanceof chirp)) return new chirp(node, client);\n\
  else if (!(client instanceof Stream)) throw new TypeError(\"expecting a stream\");\n\
  else if (!(node instanceof Node)) throw new TypeError(\"expecting an instance of `Node`\");\n\
\n\
  var self = this\n\
    , owner = null\n\
\n\
  this.client = client;\n\
  this.domStream = $(node).find('.body').get(0);\n\
  this.input = $(node).find('.input').get(0);\n\
\n\
  this.user = function () { return owner; };\n\
\n\
  chirp.ready(function () {\n\
    if (!(owner = store.get('user')))\n\
      self.auth(authUser);\n\
\n\
    client.on('data', function (data) {\n\
      if (undefined === data.sid)\n\
        client.sid = data.sid;\n\
\n\
      if (data.message && data.owner)\n\
      self.write(Message(data));\n\
    });\n\
\n\
    client.on('error', function (e) {\n\
      error(e.message);\n\
    });\n\
  });\n\
\n\
  function authUser (name) {\n\
    if (name) owner = name;\n\
    store.put('user', owner);\n\
  }\n\
\n\
  // force a user to click the send button for now\n\
  // $(this.input).find('input').on('keyup', function (e) {\n\
  //   if (13 === e.keyCode) {\n\
  //     $(this.input).find('.send').trigger('click');\n\
  //   }\n\
  // });\n\
\n\
\n\
  $(this.input).find('.send').on('click', function (e) {\n\
    if (null === owner) {\n\
      return self.auth(authUser);\n\
    }\n\
    var value = $(self.input).find('input').val()\n\
    if (!value) return false;\n\
    $(self.input).find('input').val('');\n\
    self.client.write(JSON.stringify({\n\
      owner: self.user(),\n\
      message: value,\n\
      timestamp: Date.now()\n\
    }));\n\
  });\n\
}\n\
\n\
\n\
/**\n\
 * Creates a client connection\n\
 *\n\
 * @api public\n\
 * @param {String} host optional\n\
 */\n\
\n\
chirp.createClient = function (host) {\n\
  var client = new Stream()\n\
    , isReady = false\n\
    , sock = null\n\
    , buffer = []\n\
\n\
  if ('string' !== typeof host) {\n\
    host = window.document.location.host.replace(/:.*/, '');\n\
    host = 'ws://'+ host;\n\
  }\n\
\n\
  client.readable = true;\n\
  client.writable = true;\n\
\n\
\n\
  client.connect = function (fn) {\n\
   client.sock = sock = new WebSocket(host);\n\
\n\
   sock.onopen = function () {\n\
     isReady = true;\n\
     if ('function' === fn) fn.call(client, sock);\n\
     for (var i = 0, len = buffer.length; i < len; ++i) {\n\
       sock.send(buffer[i]);\n\
     }\n\
     client.emit('connect', sock);\n\
     // check if ended\n\
     if (client._ended) client.end();\n\
   };\n\
\n\
   sock.onmessage = function (e) {\n\
     try {\n\
       client.emit('data', JSON.parse(e.data), e);\n\
     } catch (e) {\n\
       client.emit('error', e);\n\
     }\n\
   };\n\
\n\
   sock.onclose = function () {\n\
     client.emit('end');\n\
     client.writable = false;\n\
     client.readable = false;\n\
   };\n\
  };\n\
\n\
\n\
  client.write = function (chunk) {\n\
    if (false === isReady || buffer.length > 0) {\n\
      buffer.push(chunk);\n\
    } else {\n\
      sock.send(chunk);\n\
    }\n\
  };\n\
\n\
  client.end = function (chunk) {\n\
    if (undefined !== chunk) {\n\
      client.write(chunk);\n\
    }\n\
\n\
    if (false === isReady) {\n\
      client._ended = true;\n\
      return;\n\
    }\n\
\n\
    client.writable = false;\n\
    sock.close();\n\
  };\n\
\n\
\n\
  client.destroy = function () {\n\
    client._ended = true;\n\
    client.writable = false;\n\
    client.writable = false;\n\
    buffer = [];\n\
    sock.close();\n\
  };\n\
\n\
  return client;\n\
};\n\
\n\
\n\
/**\n\
 * Binds a function for the dom ready event\n\
 *\n\
 * @api public\n\
 * @param {Function} fn\n\
 */\n\
\n\
chirp.ready = function (fn) {\n\
  if (true === DOM_IS_READY) {\n\
    defer(fn);\n\
  } else {\n\
    domready(fn);\n\
  }\n\
  return this;\n\
};\n\
\n\
\n\
/**\n\
 * Writes a `Message` instance to\n\
 * the dom stream\n\
 *\n\
 * @api public\n\
 * @param {Message} msg\n\
 */\n\
\n\
chirp.prototype.write = function (msg) {\n\
  if (!(msg instanceof Message)) throw new TypeError(\"expecting an instance of `Message`\");\n\
  var node = msg.toNode();\n\
  $(this.domStream).append($(node).addClass('animated fadeIn'));\n\
  return this;\n\
};\n\
\n\
\n\
/**\n\
 * Prompts user for a user name\n\
 *\n\
 * @api public\n\
 * @param {Function} fn\n\
 */\n\
\n\
chirp.prototype.auth = function (fn) {\n\
  var ret = prompt(\"User name?\");\n\
  defer(fn.bind(this, ret));\n\
  return this;\n\
};\n\
\n\
\n\
/**\n\
 * `Message` constructor\n\
 *\n\
 * @api public\n\
 * @param {Object} data\n\
 */\n\
\n\
chirp.Message = Message;\n\
function Message (data) {\n\
  if (!(this instanceof Message)) return new Message(data);\n\
  else if ('object' !== typeof data) throw new TypeError(\"expecting object\");\n\
\n\
  this.owner = data.owner;\n\
  this.message = data.message;\n\
  this.timestamp = data.timestamp;\n\
}\n\
\n\
\n\
/**\n\
 * Converts an instance to a dom\n\
 * node\n\
 *\n\
 * @api public\n\
 */\n\
\n\
Message.prototype.toNode = function () {\n\
  var tpl = minstache(\n\
    ('<div class=\"chirp-message\" data-timetamp=\"{{timestamp}}\" data-owner=\"{{owner}}\">'+\n\
      '<span class=\"user\">{{owner}}</span>'+\n\
      '{{message}}'+\n\
    '</div>'),\n\
    this\n\
  );\n\
\n\
  return dom(tpl);\n\
};\n\
//@ sourceURL=chirp/public/js/chirp/index.js"
));




require.alias("juliangruber-stream/index.js", "chirp/deps/stream/index.js");
require.alias("juliangruber-stream/index.js", "stream/index.js");
require.alias("component-emitter/index.js", "juliangruber-stream/deps/emitter/index.js");
require.alias("component-indexof/index.js", "component-emitter/deps/indexof/index.js");

require.alias("jb55-domready/index.js", "chirp/deps/domready/index.js");
require.alias("jb55-domready/index.js", "domready/index.js");

require.alias("component-domify/index.js", "chirp/deps/domify/index.js");
require.alias("component-domify/index.js", "domify/index.js");

require.alias("visionmedia-minstache/index.js", "chirp/deps/minstache/index.js");
require.alias("visionmedia-minstache/index.js", "minstache/index.js");

require.alias("chirp/public/js/chirp/index.js", "chirp/index.js");