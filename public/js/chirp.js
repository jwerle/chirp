
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
return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require==\"function\"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error(\"Cannot find module '\"+o+\"'\")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require==\"function\"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){\n\
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
},{\"stream\":10}],2:[function(require,module,exports){\n\
\n\
\n\
//\n\
// The shims in this file are not fully implemented shims for the ES5\n\
// features, but do work for the particular usecases there is in\n\
// the other modules.\n\
//\n\
\n\
var toString = Object.prototype.toString;\n\
var hasOwnProperty = Object.prototype.hasOwnProperty;\n\
\n\
// Array.isArray is supported in IE9\n\
function isArray(xs) {\n\
  return toString.call(xs) === '[object Array]';\n\
}\n\
exports.isArray = typeof Array.isArray === 'function' ? Array.isArray : isArray;\n\
\n\
// Array.prototype.indexOf is supported in IE9\n\
exports.indexOf = function indexOf(xs, x) {\n\
  if (xs.indexOf) return xs.indexOf(x);\n\
  for (var i = 0; i < xs.length; i++) {\n\
    if (x === xs[i]) return i;\n\
  }\n\
  return -1;\n\
};\n\
\n\
// Array.prototype.filter is supported in IE9\n\
exports.filter = function filter(xs, fn) {\n\
  if (xs.filter) return xs.filter(fn);\n\
  var res = [];\n\
  for (var i = 0; i < xs.length; i++) {\n\
    if (fn(xs[i], i, xs)) res.push(xs[i]);\n\
  }\n\
  return res;\n\
};\n\
\n\
// Array.prototype.forEach is supported in IE9\n\
exports.forEach = function forEach(xs, fn, self) {\n\
  if (xs.forEach) return xs.forEach(fn, self);\n\
  for (var i = 0; i < xs.length; i++) {\n\
    fn.call(self, xs[i], i, xs);\n\
  }\n\
};\n\
\n\
// Array.prototype.map is supported in IE9\n\
exports.map = function map(xs, fn) {\n\
  if (xs.map) return xs.map(fn);\n\
  var out = new Array(xs.length);\n\
  for (var i = 0; i < xs.length; i++) {\n\
    out[i] = fn(xs[i], i, xs);\n\
  }\n\
  return out;\n\
};\n\
\n\
// Array.prototype.reduce is supported in IE9\n\
exports.reduce = function reduce(array, callback, opt_initialValue) {\n\
  if (array.reduce) return array.reduce(callback, opt_initialValue);\n\
  var value, isValueSet = false;\n\
\n\
  if (2 < arguments.length) {\n\
    value = opt_initialValue;\n\
    isValueSet = true;\n\
  }\n\
  for (var i = 0, l = array.length; l > i; ++i) {\n\
    if (array.hasOwnProperty(i)) {\n\
      if (isValueSet) {\n\
        value = callback(value, array[i], i, array);\n\
      }\n\
      else {\n\
        value = array[i];\n\
        isValueSet = true;\n\
      }\n\
    }\n\
  }\n\
\n\
  return value;\n\
};\n\
\n\
// String.prototype.substr - negative index don't work in IE8\n\
if ('ab'.substr(-1) !== 'b') {\n\
  exports.substr = function (str, start, length) {\n\
    // did we get a negative start, calculate how much it is from the beginning of the string\n\
    if (start < 0) start = str.length + start;\n\
\n\
    // call the original function\n\
    return str.substr(start, length);\n\
  };\n\
} else {\n\
  exports.substr = function (str, start, length) {\n\
    return str.substr(start, length);\n\
  };\n\
}\n\
\n\
// String.prototype.trim is supported in IE9\n\
exports.trim = function (str) {\n\
  if (str.trim) return str.trim();\n\
  return str.replace(/^\\s+|\\s+$/g, '');\n\
};\n\
\n\
// Function.prototype.bind is supported in IE9\n\
exports.bind = function () {\n\
  var args = Array.prototype.slice.call(arguments);\n\
  var fn = args.shift();\n\
  if (fn.bind) return fn.bind.apply(fn, args);\n\
  var self = args.shift();\n\
  return function () {\n\
    fn.apply(self, args.concat([Array.prototype.slice.call(arguments)]));\n\
  };\n\
};\n\
\n\
// Object.create is supported in IE9\n\
function create(prototype, properties) {\n\
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
}\n\
exports.create = typeof Object.create === 'function' ? Object.create : create;\n\
\n\
// Object.keys and Object.getOwnPropertyNames is supported in IE9 however\n\
// they do show a description and number property on Error objects\n\
function notObject(object) {\n\
  return ((typeof object != \"object\" && typeof object != \"function\") || object === null);\n\
}\n\
\n\
function keysShim(object) {\n\
  if (notObject(object)) {\n\
    throw new TypeError(\"Object.keys called on a non-object\");\n\
  }\n\
\n\
  var result = [];\n\
  for (var name in object) {\n\
    if (hasOwnProperty.call(object, name)) {\n\
      result.push(name);\n\
    }\n\
  }\n\
  return result;\n\
}\n\
\n\
// getOwnPropertyNames is almost the same as Object.keys one key feature\n\
//  is that it returns hidden properties, since that can't be implemented,\n\
//  this feature gets reduced so it just shows the length property on arrays\n\
function propertyShim(object) {\n\
  if (notObject(object)) {\n\
    throw new TypeError(\"Object.getOwnPropertyNames called on a non-object\");\n\
  }\n\
\n\
  var result = keysShim(object);\n\
  if (exports.isArray(object) && exports.indexOf(object, 'length') === -1) {\n\
    result.push('length');\n\
  }\n\
  return result;\n\
}\n\
\n\
var keys = typeof Object.keys === 'function' ? Object.keys : keysShim;\n\
var getOwnPropertyNames = typeof Object.getOwnPropertyNames === 'function' ?\n\
  Object.getOwnPropertyNames : propertyShim;\n\
\n\
if (new Error().hasOwnProperty('description')) {\n\
  var ERROR_PROPERTY_FILTER = function (obj, array) {\n\
    if (toString.call(obj) === '[object Error]') {\n\
      array = exports.filter(array, function (name) {\n\
        return name !== 'description' && name !== 'number' && name !== 'message';\n\
      });\n\
    }\n\
    return array;\n\
  };\n\
\n\
  exports.keys = function (object) {\n\
    return ERROR_PROPERTY_FILTER(object, keys(object));\n\
  };\n\
  exports.getOwnPropertyNames = function (object) {\n\
    return ERROR_PROPERTY_FILTER(object, getOwnPropertyNames(object));\n\
  };\n\
} else {\n\
  exports.keys = keys;\n\
  exports.getOwnPropertyNames = getOwnPropertyNames;\n\
}\n\
\n\
// Object.getOwnPropertyDescriptor - supported in IE8 but only on dom elements\n\
function valueObject(value, key) {\n\
  return { value: value[key] };\n\
}\n\
\n\
if (typeof Object.getOwnPropertyDescriptor === 'function') {\n\
  try {\n\
    Object.getOwnPropertyDescriptor({'a': 1}, 'a');\n\
    exports.getOwnPropertyDescriptor = Object.getOwnPropertyDescriptor;\n\
  } catch (e) {\n\
    // IE8 dom element issue - use a try catch and default to valueObject\n\
    exports.getOwnPropertyDescriptor = function (value, key) {\n\
      try {\n\
        return Object.getOwnPropertyDescriptor(value, key);\n\
      } catch (e) {\n\
        return valueObject(value, key);\n\
      }\n\
    };\n\
  }\n\
} else {\n\
  exports.getOwnPropertyDescriptor = valueObject;\n\
}\n\
\n\
},{}],3:[function(require,module,exports){\n\
// Copyright Joyent, Inc. and other Node contributors.\n\
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
// a duplex stream is just a stream that is both readable and writable.\n\
// Since JS doesn't have multiple prototypal inheritance, this class\n\
// prototypally inherits from Readable, and then parasitically from\n\
// Writable.\n\
\n\
module.exports = Duplex;\n\
var util = require('util');\n\
var shims = require('_shims');\n\
var timers = require('timers');\n\
var Readable = require('_stream_readable');\n\
var Writable = require('_stream_writable');\n\
\n\
util.inherits(Duplex, Readable);\n\
\n\
shims.forEach(shims.keys(Writable.prototype), function(method) {\n\
  if (!Duplex.prototype[method])\n\
    Duplex.prototype[method] = Writable.prototype[method];\n\
});\n\
\n\
function Duplex(options) {\n\
  if (!(this instanceof Duplex))\n\
    return new Duplex(options);\n\
\n\
  Readable.call(this, options);\n\
  Writable.call(this, options);\n\
\n\
  if (options && options.readable === false)\n\
    this.readable = false;\n\
\n\
  if (options && options.writable === false)\n\
    this.writable = false;\n\
\n\
  this.allowHalfOpen = true;\n\
  if (options && options.allowHalfOpen === false)\n\
    this.allowHalfOpen = false;\n\
\n\
  this.once('end', onend);\n\
}\n\
\n\
// the no-half-open enforcer\n\
function onend() {\n\
  // if we allow half-open state, or if the writable side ended,\n\
  // then we're ok.\n\
  if (this.allowHalfOpen || this._writableState.ended)\n\
    return;\n\
\n\
  // no more data can be written.\n\
  // But allow more writes to happen in this tick.\n\
  timers.setImmediate(shims.bind(this.end, this));\n\
}\n\
\n\
},{\"_shims\":2,\"_stream_readable\":5,\"_stream_writable\":7,\"timers\":12,\"util\":13}],4:[function(require,module,exports){\n\
// Copyright Joyent, Inc. and other Node contributors.\n\
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
// a passthrough stream.\n\
// basically just the most minimal sort of Transform stream.\n\
// Every written chunk gets output as-is.\n\
\n\
module.exports = PassThrough;\n\
\n\
var Transform = require('_stream_transform');\n\
var util = require('util');\n\
util.inherits(PassThrough, Transform);\n\
\n\
function PassThrough(options) {\n\
  if (!(this instanceof PassThrough))\n\
    return new PassThrough(options);\n\
\n\
  Transform.call(this, options);\n\
}\n\
\n\
PassThrough.prototype._transform = function(chunk, encoding, cb) {\n\
  cb(null, chunk);\n\
};\n\
\n\
},{\"_stream_transform\":6,\"util\":13}],5:[function(require,module,exports){\n\
var process=require(\"__browserify_process\");// Copyright Joyent, Inc. and other Node contributors.\n\
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
module.exports = Readable;\n\
Readable.ReadableState = ReadableState;\n\
\n\
var EE = require('events').EventEmitter;\n\
var Stream = require('stream');\n\
var shims = require('_shims');\n\
var Buffer = require('buffer').Buffer;\n\
var timers = require('timers');\n\
var util = require('util');\n\
var StringDecoder;\n\
\n\
util.inherits(Readable, Stream);\n\
\n\
function ReadableState(options, stream) {\n\
  options = options || {};\n\
\n\
  // the point at which it stops calling _read() to fill the buffer\n\
  // Note: 0 is a valid value, means \"don't call _read preemptively ever\"\n\
  var hwm = options.highWaterMark;\n\
  this.highWaterMark = (hwm || hwm === 0) ? hwm : 16 * 1024;\n\
\n\
  // cast to ints.\n\
  this.highWaterMark = ~~this.highWaterMark;\n\
\n\
  this.buffer = [];\n\
  this.length = 0;\n\
  this.pipes = null;\n\
  this.pipesCount = 0;\n\
  this.flowing = false;\n\
  this.ended = false;\n\
  this.endEmitted = false;\n\
  this.reading = false;\n\
\n\
  // In streams that never have any data, and do push(null) right away,\n\
  // the consumer can miss the 'end' event if they do some I/O before\n\
  // consuming the stream.  So, we don't emit('end') until some reading\n\
  // happens.\n\
  this.calledRead = false;\n\
\n\
  // a flag to be able to tell if the onwrite cb is called immediately,\n\
  // or on a later tick.  We set this to true at first, becuase any\n\
  // actions that shouldn't happen until \"later\" should generally also\n\
  // not happen before the first write call.\n\
  this.sync = true;\n\
\n\
  // whenever we return null, then we set a flag to say\n\
  // that we're awaiting a 'readable' event emission.\n\
  this.needReadable = false;\n\
  this.emittedReadable = false;\n\
  this.readableListening = false;\n\
\n\
\n\
  // object stream flag. Used to make read(n) ignore n and to\n\
  // make all the buffer merging and length checks go away\n\
  this.objectMode = !!options.objectMode;\n\
\n\
  // Crypto is kind of old and crusty.  Historically, its default string\n\
  // encoding is 'binary' so we have to make this configurable.\n\
  // Everything else in the universe uses 'utf8', though.\n\
  this.defaultEncoding = options.defaultEncoding || 'utf8';\n\
\n\
  // when piping, we only care about 'readable' events that happen\n\
  // after read()ing all the bytes and not getting any pushback.\n\
  this.ranOut = false;\n\
\n\
  // the number of writers that are awaiting a drain event in .pipe()s\n\
  this.awaitDrain = 0;\n\
\n\
  // if true, a maybeReadMore has been scheduled\n\
  this.readingMore = false;\n\
\n\
  this.decoder = null;\n\
  this.encoding = null;\n\
  if (options.encoding) {\n\
    if (!StringDecoder)\n\
      StringDecoder = require('string_decoder').StringDecoder;\n\
    this.decoder = new StringDecoder(options.encoding);\n\
    this.encoding = options.encoding;\n\
  }\n\
}\n\
\n\
function Readable(options) {\n\
  if (!(this instanceof Readable))\n\
    return new Readable(options);\n\
\n\
  this._readableState = new ReadableState(options, this);\n\
\n\
  // legacy\n\
  this.readable = true;\n\
\n\
  Stream.call(this);\n\
}\n\
\n\
// Manually shove something into the read() buffer.\n\
// This returns true if the highWaterMark has not been hit yet,\n\
// similar to how Writable.write() returns true if you should\n\
// write() some more.\n\
Readable.prototype.push = function(chunk, encoding) {\n\
  var state = this._readableState;\n\
\n\
  if (typeof chunk === 'string' && !state.objectMode) {\n\
    encoding = encoding || state.defaultEncoding;\n\
    if (encoding !== state.encoding) {\n\
      chunk = new Buffer(chunk, encoding);\n\
      encoding = '';\n\
    }\n\
  }\n\
\n\
  return readableAddChunk(this, state, chunk, encoding, false);\n\
};\n\
\n\
// Unshift should *always* be something directly out of read()\n\
Readable.prototype.unshift = function(chunk) {\n\
  var state = this._readableState;\n\
  return readableAddChunk(this, state, chunk, '', true);\n\
};\n\
\n\
function readableAddChunk(stream, state, chunk, encoding, addToFront) {\n\
  var er = chunkInvalid(state, chunk);\n\
  if (er) {\n\
    stream.emit('error', er);\n\
  } else if (chunk === null || chunk === undefined) {\n\
    state.reading = false;\n\
    if (!state.ended)\n\
      onEofChunk(stream, state);\n\
  } else if (state.objectMode || chunk && chunk.length > 0) {\n\
    if (state.ended && !addToFront) {\n\
      var e = new Error('stream.push() after EOF');\n\
      stream.emit('error', e);\n\
    } else if (state.endEmitted && addToFront) {\n\
      var e = new Error('stream.unshift() after end event');\n\
      stream.emit('error', e);\n\
    } else {\n\
      if (state.decoder && !addToFront && !encoding)\n\
        chunk = state.decoder.write(chunk);\n\
\n\
      // update the buffer info.\n\
      state.length += state.objectMode ? 1 : chunk.length;\n\
      if (addToFront) {\n\
        state.buffer.unshift(chunk);\n\
      } else {\n\
        state.reading = false;\n\
        state.buffer.push(chunk);\n\
      }\n\
\n\
      if (state.needReadable)\n\
        emitReadable(stream);\n\
\n\
      maybeReadMore(stream, state);\n\
    }\n\
  } else if (!addToFront) {\n\
    state.reading = false;\n\
  }\n\
\n\
  return needMoreData(state);\n\
}\n\
\n\
\n\
\n\
// if it's past the high water mark, we can push in some more.\n\
// Also, if we have no data yet, we can stand some\n\
// more bytes.  This is to work around cases where hwm=0,\n\
// such as the repl.  Also, if the push() triggered a\n\
// readable event, and the user called read(largeNumber) such that\n\
// needReadable was set, then we ought to push more, so that another\n\
// 'readable' event will be triggered.\n\
function needMoreData(state) {\n\
  return !state.ended &&\n\
         (state.needReadable ||\n\
          state.length < state.highWaterMark ||\n\
          state.length === 0);\n\
}\n\
\n\
// backwards compatibility.\n\
Readable.prototype.setEncoding = function(enc) {\n\
  if (!StringDecoder)\n\
    StringDecoder = require('string_decoder').StringDecoder;\n\
  this._readableState.decoder = new StringDecoder(enc);\n\
  this._readableState.encoding = enc;\n\
};\n\
\n\
// Don't raise the hwm > 128MB\n\
var MAX_HWM = 0x800000;\n\
function roundUpToNextPowerOf2(n) {\n\
  if (n >= MAX_HWM) {\n\
    n = MAX_HWM;\n\
  } else {\n\
    // Get the next highest power of 2\n\
    n--;\n\
    for (var p = 1; p < 32; p <<= 1) n |= n >> p;\n\
    n++;\n\
  }\n\
  return n;\n\
}\n\
\n\
function howMuchToRead(n, state) {\n\
  if (state.length === 0 && state.ended)\n\
    return 0;\n\
\n\
  if (state.objectMode)\n\
    return n === 0 ? 0 : 1;\n\
\n\
  if (isNaN(n) || n === null) {\n\
    // only flow one buffer at a time\n\
    if (state.flowing && state.buffer.length)\n\
      return state.buffer[0].length;\n\
    else\n\
      return state.length;\n\
  }\n\
\n\
  if (n <= 0)\n\
    return 0;\n\
\n\
  // If we're asking for more than the target buffer level,\n\
  // then raise the water mark.  Bump up to the next highest\n\
  // power of 2, to prevent increasing it excessively in tiny\n\
  // amounts.\n\
  if (n > state.highWaterMark)\n\
    state.highWaterMark = roundUpToNextPowerOf2(n);\n\
\n\
  // don't have that much.  return null, unless we've ended.\n\
  if (n > state.length) {\n\
    if (!state.ended) {\n\
      state.needReadable = true;\n\
      return 0;\n\
    } else\n\
      return state.length;\n\
  }\n\
\n\
  return n;\n\
}\n\
\n\
// you can override either this method, or the async _read(n) below.\n\
Readable.prototype.read = function(n) {\n\
  var state = this._readableState;\n\
  state.calledRead = true;\n\
  var nOrig = n;\n\
\n\
  if (typeof n !== 'number' || n > 0)\n\
    state.emittedReadable = false;\n\
\n\
  // if we're doing read(0) to trigger a readable event, but we\n\
  // already have a bunch of data in the buffer, then just trigger\n\
  // the 'readable' event and move on.\n\
  if (n === 0 &&\n\
      state.needReadable &&\n\
      (state.length >= state.highWaterMark || state.ended)) {\n\
    emitReadable(this);\n\
    return null;\n\
  }\n\
\n\
  n = howMuchToRead(n, state);\n\
\n\
  // if we've ended, and we're now clear, then finish it up.\n\
  if (n === 0 && state.ended) {\n\
    if (state.length === 0)\n\
      endReadable(this);\n\
    return null;\n\
  }\n\
\n\
  // All the actual chunk generation logic needs to be\n\
  // *below* the call to _read.  The reason is that in certain\n\
  // synthetic stream cases, such as passthrough streams, _read\n\
  // may be a completely synchronous operation which may change\n\
  // the state of the read buffer, providing enough data when\n\
  // before there was *not* enough.\n\
  //\n\
  // So, the steps are:\n\
  // 1. Figure out what the state of things will be after we do\n\
  // a read from the buffer.\n\
  //\n\
  // 2. If that resulting state will trigger a _read, then call _read.\n\
  // Note that this may be asynchronous, or synchronous.  Yes, it is\n\
  // deeply ugly to write APIs this way, but that still doesn't mean\n\
  // that the Readable class should behave improperly, as streams are\n\
  // designed to be sync/async agnostic.\n\
  // Take note if the _read call is sync or async (ie, if the read call\n\
  // has returned yet), so that we know whether or not it's safe to emit\n\
  // 'readable' etc.\n\
  //\n\
  // 3. Actually pull the requested chunks out of the buffer and return.\n\
\n\
  // if we need a readable event, then we need to do some reading.\n\
  var doRead = state.needReadable;\n\
\n\
  // if we currently have less than the highWaterMark, then also read some\n\
  if (state.length - n <= state.highWaterMark)\n\
    doRead = true;\n\
\n\
  // however, if we've ended, then there's no point, and if we're already\n\
  // reading, then it's unnecessary.\n\
  if (state.ended || state.reading)\n\
    doRead = false;\n\
\n\
  if (doRead) {\n\
    state.reading = true;\n\
    state.sync = true;\n\
    // if the length is currently zero, then we *need* a readable event.\n\
    if (state.length === 0)\n\
      state.needReadable = true;\n\
    // call internal read method\n\
    this._read(state.highWaterMark);\n\
    state.sync = false;\n\
  }\n\
\n\
  // If _read called its callback synchronously, then `reading`\n\
  // will be false, and we need to re-evaluate how much data we\n\
  // can return to the user.\n\
  if (doRead && !state.reading)\n\
    n = howMuchToRead(nOrig, state);\n\
\n\
  var ret;\n\
  if (n > 0)\n\
    ret = fromList(n, state);\n\
  else\n\
    ret = null;\n\
\n\
  if (ret === null) {\n\
    state.needReadable = true;\n\
    n = 0;\n\
  }\n\
\n\
  state.length -= n;\n\
\n\
  // If we have nothing in the buffer, then we want to know\n\
  // as soon as we *do* get something into the buffer.\n\
  if (state.length === 0 && !state.ended)\n\
    state.needReadable = true;\n\
\n\
  // If we happened to read() exactly the remaining amount in the\n\
  // buffer, and the EOF has been seen at this point, then make sure\n\
  // that we emit 'end' on the very next tick.\n\
  if (state.ended && !state.endEmitted && state.length === 0)\n\
    endReadable(this);\n\
\n\
  return ret;\n\
};\n\
\n\
function chunkInvalid(state, chunk) {\n\
  var er = null;\n\
  if (!Buffer.isBuffer(chunk) &&\n\
      'string' !== typeof chunk &&\n\
      chunk !== null &&\n\
      chunk !== undefined &&\n\
      !state.objectMode &&\n\
      !er) {\n\
    console.log('chunk: ', chunk);\n\
    er = new TypeError('Invalid non-string/buffer chunk');\n\
  }\n\
  return er;\n\
}\n\
\n\
\n\
function onEofChunk(stream, state) {\n\
  if (state.decoder && !state.ended) {\n\
    var chunk = state.decoder.end();\n\
    if (chunk && chunk.length) {\n\
      state.buffer.push(chunk);\n\
      state.length += state.objectMode ? 1 : chunk.length;\n\
    }\n\
  }\n\
  state.ended = true;\n\
\n\
  // if we've ended and we have some data left, then emit\n\
  // 'readable' now to make sure it gets picked up.\n\
  if (state.length > 0)\n\
    emitReadable(stream);\n\
  else\n\
    endReadable(stream);\n\
}\n\
\n\
// Don't emit readable right away in sync mode, because this can trigger\n\
// another read() call => stack overflow.  This way, it might trigger\n\
// a nextTick recursion warning, but that's not so bad.\n\
function emitReadable(stream) {\n\
  var state = stream._readableState;\n\
  state.needReadable = false;\n\
  if (state.emittedReadable)\n\
    return;\n\
\n\
  state.emittedReadable = true;\n\
  if (state.sync)\n\
    timers.setImmediate(function() {\n\
      emitReadable_(stream);\n\
    });\n\
  else\n\
    emitReadable_(stream);\n\
}\n\
\n\
function emitReadable_(stream) {\n\
  stream.emit('readable');\n\
}\n\
\n\
\n\
// at this point, the user has presumably seen the 'readable' event,\n\
// and called read() to consume some data.  that may have triggered\n\
// in turn another _read(n) call, in which case reading = true if\n\
// it's in progress.\n\
// However, if we're not ended, or reading, and the length < hwm,\n\
// then go ahead and try to read some more preemptively.\n\
function maybeReadMore(stream, state) {\n\
  if (!state.readingMore) {\n\
    state.readingMore = true;\n\
    timers.setImmediate(function() {\n\
      maybeReadMore_(stream, state);\n\
    });\n\
  }\n\
}\n\
\n\
function maybeReadMore_(stream, state) {\n\
  var len = state.length;\n\
  while (!state.reading && !state.flowing && !state.ended &&\n\
         state.length < state.highWaterMark) {\n\
    stream.read(0);\n\
    if (len === state.length)\n\
      // didn't get any data, stop spinning.\n\
      break;\n\
    else\n\
      len = state.length;\n\
  }\n\
  state.readingMore = false;\n\
}\n\
\n\
// abstract method.  to be overridden in specific implementation classes.\n\
// call cb(er, data) where data is <= n in length.\n\
// for virtual (non-string, non-buffer) streams, \"length\" is somewhat\n\
// arbitrary, and perhaps not very meaningful.\n\
Readable.prototype._read = function(n) {\n\
  this.emit('error', new Error('not implemented'));\n\
};\n\
\n\
Readable.prototype.pipe = function(dest, pipeOpts) {\n\
  var src = this;\n\
  var state = this._readableState;\n\
\n\
  switch (state.pipesCount) {\n\
    case 0:\n\
      state.pipes = dest;\n\
      break;\n\
    case 1:\n\
      state.pipes = [state.pipes, dest];\n\
      break;\n\
    default:\n\
      state.pipes.push(dest);\n\
      break;\n\
  }\n\
  state.pipesCount += 1;\n\
\n\
  var doEnd = (!pipeOpts || pipeOpts.end !== false) &&\n\
              dest !== process.stdout &&\n\
              dest !== process.stderr;\n\
\n\
  var endFn = doEnd ? onend : cleanup;\n\
  if (state.endEmitted)\n\
    timers.setImmediate(endFn);\n\
  else\n\
    src.once('end', endFn);\n\
\n\
  dest.on('unpipe', onunpipe);\n\
  function onunpipe(readable) {\n\
    if (readable !== src) return;\n\
    cleanup();\n\
  }\n\
\n\
  function onend() {\n\
    dest.end();\n\
  }\n\
\n\
  // when the dest drains, it reduces the awaitDrain counter\n\
  // on the source.  This would be more elegant with a .once()\n\
  // handler in flow(), but adding and removing repeatedly is\n\
  // too slow.\n\
  var ondrain = pipeOnDrain(src);\n\
  dest.on('drain', ondrain);\n\
\n\
  function cleanup() {\n\
    // cleanup event handlers once the pipe is broken\n\
    dest.removeListener('close', onclose);\n\
    dest.removeListener('finish', onfinish);\n\
    dest.removeListener('drain', ondrain);\n\
    dest.removeListener('error', onerror);\n\
    dest.removeListener('unpipe', onunpipe);\n\
    src.removeListener('end', onend);\n\
    src.removeListener('end', cleanup);\n\
\n\
    // if the reader is waiting for a drain event from this\n\
    // specific writer, then it would cause it to never start\n\
    // flowing again.\n\
    // So, if this is awaiting a drain, then we just call it now.\n\
    // If we don't know, then assume that we are waiting for one.\n\
    if (!dest._writableState || dest._writableState.needDrain)\n\
      ondrain();\n\
  }\n\
\n\
  // if the dest has an error, then stop piping into it.\n\
  // however, don't suppress the throwing behavior for this.\n\
  // check for listeners before emit removes one-time listeners.\n\
  var errListeners = EE.listenerCount(dest, 'error');\n\
  function onerror(er) {\n\
    unpipe();\n\
    if (errListeners === 0 && EE.listenerCount(dest, 'error') === 0)\n\
      dest.emit('error', er);\n\
  }\n\
  dest.once('error', onerror);\n\
\n\
  // Both close and finish should trigger unpipe, but only once.\n\
  function onclose() {\n\
    dest.removeListener('finish', onfinish);\n\
    unpipe();\n\
  }\n\
  dest.once('close', onclose);\n\
  function onfinish() {\n\
    dest.removeListener('close', onclose);\n\
    unpipe();\n\
  }\n\
  dest.once('finish', onfinish);\n\
\n\
  function unpipe() {\n\
    src.unpipe(dest);\n\
  }\n\
\n\
  // tell the dest that it's being piped to\n\
  dest.emit('pipe', src);\n\
\n\
  // start the flow if it hasn't been started already.\n\
  if (!state.flowing) {\n\
    // the handler that waits for readable events after all\n\
    // the data gets sucked out in flow.\n\
    // This would be easier to follow with a .once() handler\n\
    // in flow(), but that is too slow.\n\
    this.on('readable', pipeOnReadable);\n\
\n\
    state.flowing = true;\n\
    timers.setImmediate(function() {\n\
      flow(src);\n\
    });\n\
  }\n\
\n\
  return dest;\n\
};\n\
\n\
function pipeOnDrain(src) {\n\
  return function() {\n\
    var dest = this;\n\
    var state = src._readableState;\n\
    state.awaitDrain--;\n\
    if (state.awaitDrain === 0)\n\
      flow(src);\n\
  };\n\
}\n\
\n\
function flow(src) {\n\
  var state = src._readableState;\n\
  var chunk;\n\
  state.awaitDrain = 0;\n\
\n\
  function write(dest, i, list) {\n\
    var written = dest.write(chunk);\n\
    if (false === written) {\n\
      state.awaitDrain++;\n\
    }\n\
  }\n\
\n\
  while (state.pipesCount && null !== (chunk = src.read())) {\n\
\n\
    if (state.pipesCount === 1)\n\
      write(state.pipes, 0, null);\n\
    else\n\
      shims.forEach(state.pipes, write);\n\
\n\
    src.emit('data', chunk);\n\
\n\
    // if anyone needs a drain, then we have to wait for that.\n\
    if (state.awaitDrain > 0)\n\
      return;\n\
  }\n\
\n\
  // if every destination was unpiped, either before entering this\n\
  // function, or in the while loop, then stop flowing.\n\
  //\n\
  // NB: This is a pretty rare edge case.\n\
  if (state.pipesCount === 0) {\n\
    state.flowing = false;\n\
\n\
    // if there were data event listeners added, then switch to old mode.\n\
    if (EE.listenerCount(src, 'data') > 0)\n\
      emitDataEvents(src);\n\
    return;\n\
  }\n\
\n\
  // at this point, no one needed a drain, so we just ran out of data\n\
  // on the next readable event, start it over again.\n\
  state.ranOut = true;\n\
}\n\
\n\
function pipeOnReadable() {\n\
  if (this._readableState.ranOut) {\n\
    this._readableState.ranOut = false;\n\
    flow(this);\n\
  }\n\
}\n\
\n\
\n\
Readable.prototype.unpipe = function(dest) {\n\
  var state = this._readableState;\n\
\n\
  // if we're not piping anywhere, then do nothing.\n\
  if (state.pipesCount === 0)\n\
    return this;\n\
\n\
  // just one destination.  most common case.\n\
  if (state.pipesCount === 1) {\n\
    // passed in one, but it's not the right one.\n\
    if (dest && dest !== state.pipes)\n\
      return this;\n\
\n\
    if (!dest)\n\
      dest = state.pipes;\n\
\n\
    // got a match.\n\
    state.pipes = null;\n\
    state.pipesCount = 0;\n\
    this.removeListener('readable', pipeOnReadable);\n\
    state.flowing = false;\n\
    if (dest)\n\
      dest.emit('unpipe', this);\n\
    return this;\n\
  }\n\
\n\
  // slow case. multiple pipe destinations.\n\
\n\
  if (!dest) {\n\
    // remove all.\n\
    var dests = state.pipes;\n\
    var len = state.pipesCount;\n\
    state.pipes = null;\n\
    state.pipesCount = 0;\n\
    this.removeListener('readable', pipeOnReadable);\n\
    state.flowing = false;\n\
\n\
    for (var i = 0; i < len; i++)\n\
      dests[i].emit('unpipe', this);\n\
    return this;\n\
  }\n\
\n\
  // try to find the right one.\n\
  var i = shims.indexOf(state.pipes, dest);\n\
  if (i === -1)\n\
    return this;\n\
\n\
  state.pipes.splice(i, 1);\n\
  state.pipesCount -= 1;\n\
  if (state.pipesCount === 1)\n\
    state.pipes = state.pipes[0];\n\
\n\
  dest.emit('unpipe', this);\n\
\n\
  return this;\n\
};\n\
\n\
// set up data events if they are asked for\n\
// Ensure readable listeners eventually get something\n\
Readable.prototype.on = function(ev, fn) {\n\
  var res = Stream.prototype.on.call(this, ev, fn);\n\
\n\
  if (ev === 'data' && !this._readableState.flowing)\n\
    emitDataEvents(this);\n\
\n\
  if (ev === 'readable' && this.readable) {\n\
    var state = this._readableState;\n\
    if (!state.readableListening) {\n\
      state.readableListening = true;\n\
      state.emittedReadable = false;\n\
      state.needReadable = true;\n\
      if (!state.reading) {\n\
        this.read(0);\n\
      } else if (state.length) {\n\
        emitReadable(this, state);\n\
      }\n\
    }\n\
  }\n\
\n\
  return res;\n\
};\n\
Readable.prototype.addListener = Readable.prototype.on;\n\
\n\
// pause() and resume() are remnants of the legacy readable stream API\n\
// If the user uses them, then switch into old mode.\n\
Readable.prototype.resume = function() {\n\
  emitDataEvents(this);\n\
  this.read(0);\n\
  this.emit('resume');\n\
};\n\
\n\
Readable.prototype.pause = function() {\n\
  emitDataEvents(this, true);\n\
  this.emit('pause');\n\
};\n\
\n\
function emitDataEvents(stream, startPaused) {\n\
  var state = stream._readableState;\n\
\n\
  if (state.flowing) {\n\
    // https://github.com/isaacs/readable-stream/issues/16\n\
    throw new Error('Cannot switch to old mode now.');\n\
  }\n\
\n\
  var paused = startPaused || false;\n\
  var readable = false;\n\
\n\
  // convert to an old-style stream.\n\
  stream.readable = true;\n\
  stream.pipe = Stream.prototype.pipe;\n\
  stream.on = stream.addListener = Stream.prototype.on;\n\
\n\
  stream.on('readable', function() {\n\
    readable = true;\n\
\n\
    var c;\n\
    while (!paused && (null !== (c = stream.read())))\n\
      stream.emit('data', c);\n\
\n\
    if (c === null) {\n\
      readable = false;\n\
      stream._readableState.needReadable = true;\n\
    }\n\
  });\n\
\n\
  stream.pause = function() {\n\
    paused = true;\n\
    this.emit('pause');\n\
  };\n\
\n\
  stream.resume = function() {\n\
    paused = false;\n\
    if (readable)\n\
      timers.setImmediate(function() {\n\
        stream.emit('readable');\n\
      });\n\
    else\n\
      this.read(0);\n\
    this.emit('resume');\n\
  };\n\
\n\
  // now make it start, just in case it hadn't already.\n\
  stream.emit('readable');\n\
}\n\
\n\
// wrap an old-style stream as the async data source.\n\
// This is *not* part of the readable stream interface.\n\
// It is an ugly unfortunate mess of history.\n\
Readable.prototype.wrap = function(stream) {\n\
  var state = this._readableState;\n\
  var paused = false;\n\
\n\
  var self = this;\n\
  stream.on('end', function() {\n\
    if (state.decoder && !state.ended) {\n\
      var chunk = state.decoder.end();\n\
      if (chunk && chunk.length)\n\
        self.push(chunk);\n\
    }\n\
\n\
    self.push(null);\n\
  });\n\
\n\
  stream.on('data', function(chunk) {\n\
    if (state.decoder)\n\
      chunk = state.decoder.write(chunk);\n\
    if (!chunk || !state.objectMode && !chunk.length)\n\
      return;\n\
\n\
    var ret = self.push(chunk);\n\
    if (!ret) {\n\
      paused = true;\n\
      stream.pause();\n\
    }\n\
  });\n\
\n\
  // proxy all the other methods.\n\
  // important when wrapping filters and duplexes.\n\
  for (var i in stream) {\n\
    if (typeof stream[i] === 'function' &&\n\
        typeof this[i] === 'undefined') {\n\
      this[i] = function(method) { return function() {\n\
        return stream[method].apply(stream, arguments);\n\
      }}(i);\n\
    }\n\
  }\n\
\n\
  // proxy certain important events.\n\
  var events = ['error', 'close', 'destroy', 'pause', 'resume'];\n\
  shims.forEach(events, function(ev) {\n\
    stream.on(ev, shims.bind(self.emit, self, ev));\n\
  });\n\
\n\
  // when we try to consume some more bytes, simply unpause the\n\
  // underlying stream.\n\
  self._read = function(n) {\n\
    if (paused) {\n\
      paused = false;\n\
      stream.resume();\n\
    }\n\
  };\n\
\n\
  return self;\n\
};\n\
\n\
\n\
\n\
// exposed for testing purposes only.\n\
Readable._fromList = fromList;\n\
\n\
// Pluck off n bytes from an array of buffers.\n\
// Length is the combined lengths of all the buffers in the list.\n\
function fromList(n, state) {\n\
  var list = state.buffer;\n\
  var length = state.length;\n\
  var stringMode = !!state.decoder;\n\
  var objectMode = !!state.objectMode;\n\
  var ret;\n\
\n\
  // nothing in the list, definitely empty.\n\
  if (list.length === 0)\n\
    return null;\n\
\n\
  if (length === 0)\n\
    ret = null;\n\
  else if (objectMode)\n\
    ret = list.shift();\n\
  else if (!n || n >= length) {\n\
    // read it all, truncate the array.\n\
    if (stringMode)\n\
      ret = list.join('');\n\
    else\n\
      ret = Buffer.concat(list, length);\n\
    list.length = 0;\n\
  } else {\n\
    // read just some of it.\n\
    if (n < list[0].length) {\n\
      // just take a part of the first list item.\n\
      // slice is the same for buffers and strings.\n\
      var buf = list[0];\n\
      ret = buf.slice(0, n);\n\
      list[0] = buf.slice(n);\n\
    } else if (n === list[0].length) {\n\
      // first list is a perfect match\n\
      ret = list.shift();\n\
    } else {\n\
      // complex case.\n\
      // we have enough to cover it, but it spans past the first buffer.\n\
      if (stringMode)\n\
        ret = '';\n\
      else\n\
        ret = new Buffer(n);\n\
\n\
      var c = 0;\n\
      for (var i = 0, l = list.length; i < l && c < n; i++) {\n\
        var buf = list[0];\n\
        var cpy = Math.min(n - c, buf.length);\n\
\n\
        if (stringMode)\n\
          ret += buf.slice(0, cpy);\n\
        else\n\
          buf.copy(ret, c, 0, cpy);\n\
\n\
        if (cpy < buf.length)\n\
          list[0] = buf.slice(cpy);\n\
        else\n\
          list.shift();\n\
\n\
        c += cpy;\n\
      }\n\
    }\n\
  }\n\
\n\
  return ret;\n\
}\n\
\n\
function endReadable(stream) {\n\
  var state = stream._readableState;\n\
\n\
  // If we get here before consuming all the bytes, then that is a\n\
  // bug in node.  Should never happen.\n\
  if (state.length > 0)\n\
    throw new Error('endReadable called on non-empty stream');\n\
\n\
  if (!state.endEmitted && state.calledRead) {\n\
    state.ended = true;\n\
    timers.setImmediate(function() {\n\
      // Check that we didn't get one last unshift.\n\
      if (!state.endEmitted && state.length === 0) {\n\
        state.endEmitted = true;\n\
        stream.readable = false;\n\
        stream.emit('end');\n\
      }\n\
    });\n\
  }\n\
}\n\
\n\
},{\"__browserify_process\":18,\"_shims\":2,\"buffer\":15,\"events\":9,\"stream\":10,\"string_decoder\":11,\"timers\":12,\"util\":13}],6:[function(require,module,exports){\n\
// Copyright Joyent, Inc. and other Node contributors.\n\
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
// a transform stream is a readable/writable stream where you do\n\
// something with the data.  Sometimes it's called a \"filter\",\n\
// but that's not a great name for it, since that implies a thing where\n\
// some bits pass through, and others are simply ignored.  (That would\n\
// be a valid example of a transform, of course.)\n\
//\n\
// While the output is causally related to the input, it's not a\n\
// necessarily symmetric or synchronous transformation.  For example,\n\
// a zlib stream might take multiple plain-text writes(), and then\n\
// emit a single compressed chunk some time in the future.\n\
//\n\
// Here's how this works:\n\
//\n\
// The Transform stream has all the aspects of the readable and writable\n\
// stream classes.  When you write(chunk), that calls _write(chunk,cb)\n\
// internally, and returns false if there's a lot of pending writes\n\
// buffered up.  When you call read(), that calls _read(n) until\n\
// there's enough pending readable data buffered up.\n\
//\n\
// In a transform stream, the written data is placed in a buffer.  When\n\
// _read(n) is called, it transforms the queued up data, calling the\n\
// buffered _write cb's as it consumes chunks.  If consuming a single\n\
// written chunk would result in multiple output chunks, then the first\n\
// outputted bit calls the readcb, and subsequent chunks just go into\n\
// the read buffer, and will cause it to emit 'readable' if necessary.\n\
//\n\
// This way, back-pressure is actually determined by the reading side,\n\
// since _read has to be called to start processing a new chunk.  However,\n\
// a pathological inflate type of transform can cause excessive buffering\n\
// here.  For example, imagine a stream where every byte of input is\n\
// interpreted as an integer from 0-255, and then results in that many\n\
// bytes of output.  Writing the 4 bytes {ff,ff,ff,ff} would result in\n\
// 1kb of data being output.  In this case, you could write a very small\n\
// amount of input, and end up with a very large amount of output.  In\n\
// such a pathological inflating mechanism, there'd be no way to tell\n\
// the system to stop doing the transform.  A single 4MB write could\n\
// cause the system to run out of memory.\n\
//\n\
// However, even in such a pathological case, only a single written chunk\n\
// would be consumed, and then the rest would wait (un-transformed) until\n\
// the results of the previous transformed chunk were consumed.\n\
\n\
module.exports = Transform;\n\
\n\
var Duplex = require('_stream_duplex');\n\
var util = require('util');\n\
util.inherits(Transform, Duplex);\n\
\n\
\n\
function TransformState(options, stream) {\n\
  this.afterTransform = function(er, data) {\n\
    return afterTransform(stream, er, data);\n\
  };\n\
\n\
  this.needTransform = false;\n\
  this.transforming = false;\n\
  this.writecb = null;\n\
  this.writechunk = null;\n\
}\n\
\n\
function afterTransform(stream, er, data) {\n\
  var ts = stream._transformState;\n\
  ts.transforming = false;\n\
\n\
  var cb = ts.writecb;\n\
\n\
  if (!cb)\n\
    return stream.emit('error', new Error('no writecb in Transform class'));\n\
\n\
  ts.writechunk = null;\n\
  ts.writecb = null;\n\
\n\
  if (data !== null && data !== undefined)\n\
    stream.push(data);\n\
\n\
  if (cb)\n\
    cb(er);\n\
\n\
  var rs = stream._readableState;\n\
  rs.reading = false;\n\
  if (rs.needReadable || rs.length < rs.highWaterMark) {\n\
    stream._read(rs.highWaterMark);\n\
  }\n\
}\n\
\n\
\n\
function Transform(options) {\n\
  if (!(this instanceof Transform))\n\
    return new Transform(options);\n\
\n\
  Duplex.call(this, options);\n\
\n\
  var ts = this._transformState = new TransformState(options, this);\n\
\n\
  // when the writable side finishes, then flush out anything remaining.\n\
  var stream = this;\n\
\n\
  // start out asking for a readable event once data is transformed.\n\
  this._readableState.needReadable = true;\n\
\n\
  // we have implemented the _read method, and done the other things\n\
  // that Readable wants before the first _read call, so unset the\n\
  // sync guard flag.\n\
  this._readableState.sync = false;\n\
\n\
  this.once('finish', function() {\n\
    if ('function' === typeof this._flush)\n\
      this._flush(function(er) {\n\
        done(stream, er);\n\
      });\n\
    else\n\
      done(stream);\n\
  });\n\
}\n\
\n\
Transform.prototype.push = function(chunk, encoding) {\n\
  this._transformState.needTransform = false;\n\
  return Duplex.prototype.push.call(this, chunk, encoding);\n\
};\n\
\n\
// This is the part where you do stuff!\n\
// override this function in implementation classes.\n\
// 'chunk' is an input chunk.\n\
//\n\
// Call `push(newChunk)` to pass along transformed output\n\
// to the readable side.  You may call 'push' zero or more times.\n\
//\n\
// Call `cb(err)` when you are done with this chunk.  If you pass\n\
// an error, then that'll put the hurt on the whole operation.  If you\n\
// never call cb(), then you'll never get another chunk.\n\
Transform.prototype._transform = function(chunk, encoding, cb) {\n\
  throw new Error('not implemented');\n\
};\n\
\n\
Transform.prototype._write = function(chunk, encoding, cb) {\n\
  var ts = this._transformState;\n\
  ts.writecb = cb;\n\
  ts.writechunk = chunk;\n\
  ts.writeencoding = encoding;\n\
  if (!ts.transforming) {\n\
    var rs = this._readableState;\n\
    if (ts.needTransform ||\n\
        rs.needReadable ||\n\
        rs.length < rs.highWaterMark)\n\
      this._read(rs.highWaterMark);\n\
  }\n\
};\n\
\n\
// Doesn't matter what the args are here.\n\
// _transform does all the work.\n\
// That we got here means that the readable side wants more data.\n\
Transform.prototype._read = function(n) {\n\
  var ts = this._transformState;\n\
\n\
  if (ts.writechunk && ts.writecb && !ts.transforming) {\n\
    ts.transforming = true;\n\
    this._transform(ts.writechunk, ts.writeencoding, ts.afterTransform);\n\
  } else {\n\
    // mark that we need a transform, so that any data that comes in\n\
    // will get processed, now that we've asked for it.\n\
    ts.needTransform = true;\n\
  }\n\
};\n\
\n\
\n\
function done(stream, er) {\n\
  if (er)\n\
    return stream.emit('error', er);\n\
\n\
  // if there's nothing in the write buffer, then that means\n\
  // that nothing more will ever be provided\n\
  var ws = stream._writableState;\n\
  var rs = stream._readableState;\n\
  var ts = stream._transformState;\n\
\n\
  if (ws.length)\n\
    throw new Error('calling transform done when ws.length != 0');\n\
\n\
  if (ts.transforming)\n\
    throw new Error('calling transform done when still transforming');\n\
\n\
  return stream.push(null);\n\
}\n\
\n\
},{\"_stream_duplex\":3,\"util\":13}],7:[function(require,module,exports){\n\
// Copyright Joyent, Inc. and other Node contributors.\n\
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
// A bit simpler than readable streams.\n\
// Implement an async ._write(chunk, cb), and it'll handle all\n\
// the drain event emission and buffering.\n\
\n\
module.exports = Writable;\n\
Writable.WritableState = WritableState;\n\
\n\
var util = require('util');\n\
var Stream = require('stream');\n\
var timers = require('timers');\n\
var Buffer = require('buffer').Buffer;\n\
\n\
util.inherits(Writable, Stream);\n\
\n\
function WriteReq(chunk, encoding, cb) {\n\
  this.chunk = chunk;\n\
  this.encoding = encoding;\n\
  this.callback = cb;\n\
}\n\
\n\
function WritableState(options, stream) {\n\
  options = options || {};\n\
\n\
  // the point at which write() starts returning false\n\
  // Note: 0 is a valid value, means that we always return false if\n\
  // the entire buffer is not flushed immediately on write()\n\
  var hwm = options.highWaterMark;\n\
  this.highWaterMark = (hwm || hwm === 0) ? hwm : 16 * 1024;\n\
\n\
  // object stream flag to indicate whether or not this stream\n\
  // contains buffers or objects.\n\
  this.objectMode = !!options.objectMode;\n\
\n\
  // cast to ints.\n\
  this.highWaterMark = ~~this.highWaterMark;\n\
\n\
  this.needDrain = false;\n\
  // at the start of calling end()\n\
  this.ending = false;\n\
  // when end() has been called, and returned\n\
  this.ended = false;\n\
  // when 'finish' is emitted\n\
  this.finished = false;\n\
\n\
  // should we decode strings into buffers before passing to _write?\n\
  // this is here so that some node-core streams can optimize string\n\
  // handling at a lower level.\n\
  var noDecode = options.decodeStrings === false;\n\
  this.decodeStrings = !noDecode;\n\
\n\
  // Crypto is kind of old and crusty.  Historically, its default string\n\
  // encoding is 'binary' so we have to make this configurable.\n\
  // Everything else in the universe uses 'utf8', though.\n\
  this.defaultEncoding = options.defaultEncoding || 'utf8';\n\
\n\
  // not an actual buffer we keep track of, but a measurement\n\
  // of how much we're waiting to get pushed to some underlying\n\
  // socket or file.\n\
  this.length = 0;\n\
\n\
  // a flag to see when we're in the middle of a write.\n\
  this.writing = false;\n\
\n\
  // a flag to be able to tell if the onwrite cb is called immediately,\n\
  // or on a later tick.  We set this to true at first, becuase any\n\
  // actions that shouldn't happen until \"later\" should generally also\n\
  // not happen before the first write call.\n\
  this.sync = true;\n\
\n\
  // a flag to know if we're processing previously buffered items, which\n\
  // may call the _write() callback in the same tick, so that we don't\n\
  // end up in an overlapped onwrite situation.\n\
  this.bufferProcessing = false;\n\
\n\
  // the callback that's passed to _write(chunk,cb)\n\
  this.onwrite = function(er) {\n\
    onwrite(stream, er);\n\
  };\n\
\n\
  // the callback that the user supplies to write(chunk,encoding,cb)\n\
  this.writecb = null;\n\
\n\
  // the amount that is being written when _write is called.\n\
  this.writelen = 0;\n\
\n\
  this.buffer = [];\n\
}\n\
\n\
function Writable(options) {\n\
  // Writable ctor is applied to Duplexes, though they're not\n\
  // instanceof Writable, they're instanceof Readable.\n\
  if (!(this instanceof Writable) && !(this instanceof Stream.Duplex))\n\
    return new Writable(options);\n\
\n\
  this._writableState = new WritableState(options, this);\n\
\n\
  // legacy.\n\
  this.writable = true;\n\
\n\
  Stream.call(this);\n\
}\n\
\n\
// Otherwise people can pipe Writable streams, which is just wrong.\n\
Writable.prototype.pipe = function() {\n\
  this.emit('error', new Error('Cannot pipe. Not readable.'));\n\
};\n\
\n\
\n\
function writeAfterEnd(stream, state, cb) {\n\
  var er = new Error('write after end');\n\
  // TODO: defer error events consistently everywhere, not just the cb\n\
  stream.emit('error', er);\n\
  timers.setImmediate(function() {\n\
    cb(er);\n\
  });\n\
}\n\
\n\
// If we get something that is not a buffer, string, null, or undefined,\n\
// and we're not in objectMode, then that's an error.\n\
// Otherwise stream chunks are all considered to be of length=1, and the\n\
// watermarks determine how many objects to keep in the buffer, rather than\n\
// how many bytes or characters.\n\
function validChunk(stream, state, chunk, cb) {\n\
  var valid = true;\n\
  if (!Buffer.isBuffer(chunk) &&\n\
      'string' !== typeof chunk &&\n\
      chunk !== null &&\n\
      chunk !== undefined &&\n\
      !state.objectMode) {\n\
    var er = new TypeError('Invalid non-string/buffer chunk');\n\
    stream.emit('error', er);\n\
    timers.setImmediate(function() {\n\
      cb(er);\n\
    });\n\
    valid = false;\n\
  }\n\
  return valid;\n\
}\n\
\n\
Writable.prototype.write = function(chunk, encoding, cb) {\n\
  var state = this._writableState;\n\
  var ret = false;\n\
\n\
  if (typeof encoding === 'function') {\n\
    cb = encoding;\n\
    encoding = null;\n\
  }\n\
\n\
  if (Buffer.isBuffer(chunk))\n\
    encoding = 'buffer';\n\
  else if (!encoding)\n\
    encoding = state.defaultEncoding;\n\
\n\
  if (typeof cb !== 'function')\n\
    cb = function() {};\n\
\n\
  if (state.ended)\n\
    writeAfterEnd(this, state, cb);\n\
  else if (validChunk(this, state, chunk, cb))\n\
    ret = writeOrBuffer(this, state, chunk, encoding, cb);\n\
\n\
  return ret;\n\
};\n\
\n\
function decodeChunk(state, chunk, encoding) {\n\
  if (!state.objectMode &&\n\
      state.decodeStrings !== false &&\n\
      typeof chunk === 'string') {\n\
    chunk = new Buffer(chunk, encoding);\n\
  }\n\
  return chunk;\n\
}\n\
\n\
// if we're already writing something, then just put this\n\
// in the queue, and wait our turn.  Otherwise, call _write\n\
// If we return false, then we need a drain event, so set that flag.\n\
function writeOrBuffer(stream, state, chunk, encoding, cb) {\n\
  chunk = decodeChunk(state, chunk, encoding);\n\
  var len = state.objectMode ? 1 : chunk.length;\n\
\n\
  state.length += len;\n\
\n\
  var ret = state.length < state.highWaterMark;\n\
  state.needDrain = !ret;\n\
\n\
  if (state.writing)\n\
    state.buffer.push(new WriteReq(chunk, encoding, cb));\n\
  else\n\
    doWrite(stream, state, len, chunk, encoding, cb);\n\
\n\
  return ret;\n\
}\n\
\n\
function doWrite(stream, state, len, chunk, encoding, cb) {\n\
  state.writelen = len;\n\
  state.writecb = cb;\n\
  state.writing = true;\n\
  state.sync = true;\n\
  stream._write(chunk, encoding, state.onwrite);\n\
  state.sync = false;\n\
}\n\
\n\
function onwriteError(stream, state, sync, er, cb) {\n\
  if (sync)\n\
    timers.setImmediate(function() {\n\
      cb(er);\n\
    });\n\
  else\n\
    cb(er);\n\
\n\
  stream.emit('error', er);\n\
}\n\
\n\
function onwriteStateUpdate(state) {\n\
  state.writing = false;\n\
  state.writecb = null;\n\
  state.length -= state.writelen;\n\
  state.writelen = 0;\n\
}\n\
\n\
function onwrite(stream, er) {\n\
  var state = stream._writableState;\n\
  var sync = state.sync;\n\
  var cb = state.writecb;\n\
\n\
  onwriteStateUpdate(state);\n\
\n\
  if (er)\n\
    onwriteError(stream, state, sync, er, cb);\n\
  else {\n\
    // Check if we're actually ready to finish, but don't emit yet\n\
    var finished = needFinish(stream, state);\n\
\n\
    if (!finished && !state.bufferProcessing && state.buffer.length)\n\
      clearBuffer(stream, state);\n\
\n\
    if (sync) {\n\
      timers.setImmediate(function() {\n\
        afterWrite(stream, state, finished, cb);\n\
      });\n\
    } else {\n\
      afterWrite(stream, state, finished, cb);\n\
    }\n\
  }\n\
}\n\
\n\
function afterWrite(stream, state, finished, cb) {\n\
  if (!finished)\n\
    onwriteDrain(stream, state);\n\
  cb();\n\
  if (finished)\n\
    finishMaybe(stream, state);\n\
}\n\
\n\
// Must force callback to be called on nextTick, so that we don't\n\
// emit 'drain' before the write() consumer gets the 'false' return\n\
// value, and has a chance to attach a 'drain' listener.\n\
function onwriteDrain(stream, state) {\n\
  if (state.length === 0 && state.needDrain) {\n\
    state.needDrain = false;\n\
    stream.emit('drain');\n\
  }\n\
}\n\
\n\
\n\
// if there's something in the buffer waiting, then process it\n\
function clearBuffer(stream, state) {\n\
  state.bufferProcessing = true;\n\
\n\
  for (var c = 0; c < state.buffer.length; c++) {\n\
    var entry = state.buffer[c];\n\
    var chunk = entry.chunk;\n\
    var encoding = entry.encoding;\n\
    var cb = entry.callback;\n\
    var len = state.objectMode ? 1 : chunk.length;\n\
\n\
    doWrite(stream, state, len, chunk, encoding, cb);\n\
\n\
    // if we didn't call the onwrite immediately, then\n\
    // it means that we need to wait until it does.\n\
    // also, that means that the chunk and cb are currently\n\
    // being processed, so move the buffer counter past them.\n\
    if (state.writing) {\n\
      c++;\n\
      break;\n\
    }\n\
  }\n\
\n\
  state.bufferProcessing = false;\n\
  if (c < state.buffer.length)\n\
    state.buffer = state.buffer.slice(c);\n\
  else\n\
    state.buffer.length = 0;\n\
}\n\
\n\
Writable.prototype._write = function(chunk, encoding, cb) {\n\
  cb(new Error('not implemented'));\n\
};\n\
\n\
Writable.prototype.end = function(chunk, encoding, cb) {\n\
  var state = this._writableState;\n\
\n\
  if (typeof chunk === 'function') {\n\
    cb = chunk;\n\
    chunk = null;\n\
    encoding = null;\n\
  } else if (typeof encoding === 'function') {\n\
    cb = encoding;\n\
    encoding = null;\n\
  }\n\
\n\
  if (typeof chunk !== 'undefined' && chunk !== null)\n\
    this.write(chunk, encoding);\n\
\n\
  // ignore unnecessary end() calls.\n\
  if (!state.ending && !state.finished)\n\
    endWritable(this, state, cb);\n\
};\n\
\n\
\n\
function needFinish(stream, state) {\n\
  return (state.ending &&\n\
          state.length === 0 &&\n\
          !state.finished &&\n\
          !state.writing);\n\
}\n\
\n\
function finishMaybe(stream, state) {\n\
  var need = needFinish(stream, state);\n\
  if (need) {\n\
    state.finished = true;\n\
    stream.emit('finish');\n\
  }\n\
  return need;\n\
}\n\
\n\
function endWritable(stream, state, cb) {\n\
  state.ending = true;\n\
  finishMaybe(stream, state);\n\
  if (cb) {\n\
    if (state.finished)\n\
      timers.setImmediate(cb);\n\
    else\n\
      stream.once('finish', cb);\n\
  }\n\
  state.ended = true;\n\
}\n\
\n\
},{\"buffer\":15,\"stream\":10,\"timers\":12,\"util\":13}],8:[function(require,module,exports){\n\
// Copyright Joyent, Inc. and other Node contributors.\n\
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
// UTILITY\n\
var util = require('util');\n\
var shims = require('_shims');\n\
var pSlice = Array.prototype.slice;\n\
\n\
// 1. The assert module provides functions that throw\n\
// AssertionError's when particular conditions are not met. The\n\
// assert module must conform to the following interface.\n\
\n\
var assert = module.exports = ok;\n\
\n\
// 2. The AssertionError is defined in assert.\n\
// new assert.AssertionError({ message: message,\n\
//                             actual: actual,\n\
//                             expected: expected })\n\
\n\
assert.AssertionError = function AssertionError(options) {\n\
  this.name = 'AssertionError';\n\
  this.actual = options.actual;\n\
  this.expected = options.expected;\n\
  this.operator = options.operator;\n\
  this.message = options.message || getMessage(this);\n\
};\n\
\n\
// assert.AssertionError instanceof Error\n\
util.inherits(assert.AssertionError, Error);\n\
\n\
function replacer(key, value) {\n\
  if (util.isUndefined(value)) {\n\
    return '' + value;\n\
  }\n\
  if (util.isNumber(value) && (isNaN(value) || !isFinite(value))) {\n\
    return value.toString();\n\
  }\n\
  if (util.isFunction(value) || util.isRegExp(value)) {\n\
    return value.toString();\n\
  }\n\
  return value;\n\
}\n\
\n\
function truncate(s, n) {\n\
  if (util.isString(s)) {\n\
    return s.length < n ? s : s.slice(0, n);\n\
  } else {\n\
    return s;\n\
  }\n\
}\n\
\n\
function getMessage(self) {\n\
  return truncate(JSON.stringify(self.actual, replacer), 128) + ' ' +\n\
         self.operator + ' ' +\n\
         truncate(JSON.stringify(self.expected, replacer), 128);\n\
}\n\
\n\
// At present only the three keys mentioned above are used and\n\
// understood by the spec. Implementations or sub modules can pass\n\
// other keys to the AssertionError's constructor - they will be\n\
// ignored.\n\
\n\
// 3. All of the following functions must throw an AssertionError\n\
// when a corresponding condition is not met, with a message that\n\
// may be undefined if not provided.  All assertion methods provide\n\
// both the actual and expected values to the assertion error for\n\
// display purposes.\n\
\n\
function fail(actual, expected, message, operator, stackStartFunction) {\n\
  throw new assert.AssertionError({\n\
    message: message,\n\
    actual: actual,\n\
    expected: expected,\n\
    operator: operator,\n\
    stackStartFunction: stackStartFunction\n\
  });\n\
}\n\
\n\
// EXTENSION! allows for well behaved errors defined elsewhere.\n\
assert.fail = fail;\n\
\n\
// 4. Pure assertion tests whether a value is truthy, as determined\n\
// by !!guard.\n\
// assert.ok(guard, message_opt);\n\
// This statement is equivalent to assert.equal(true, !!guard,\n\
// message_opt);. To test strictly for the value true, use\n\
// assert.strictEqual(true, guard, message_opt);.\n\
\n\
function ok(value, message) {\n\
  if (!value) fail(value, true, message, '==', assert.ok);\n\
}\n\
assert.ok = ok;\n\
\n\
// 5. The equality assertion tests shallow, coercive equality with\n\
// ==.\n\
// assert.equal(actual, expected, message_opt);\n\
\n\
assert.equal = function equal(actual, expected, message) {\n\
  if (actual != expected) fail(actual, expected, message, '==', assert.equal);\n\
};\n\
\n\
// 6. The non-equality assertion tests for whether two objects are not equal\n\
// with != assert.notEqual(actual, expected, message_opt);\n\
\n\
assert.notEqual = function notEqual(actual, expected, message) {\n\
  if (actual == expected) {\n\
    fail(actual, expected, message, '!=', assert.notEqual);\n\
  }\n\
};\n\
\n\
// 7. The equivalence assertion tests a deep equality relation.\n\
// assert.deepEqual(actual, expected, message_opt);\n\
\n\
assert.deepEqual = function deepEqual(actual, expected, message) {\n\
  if (!_deepEqual(actual, expected)) {\n\
    fail(actual, expected, message, 'deepEqual', assert.deepEqual);\n\
  }\n\
};\n\
\n\
function _deepEqual(actual, expected) {\n\
  // 7.1. All identical values are equivalent, as determined by ===.\n\
  if (actual === expected) {\n\
    return true;\n\
\n\
  } else if (util.isBuffer(actual) && util.isBuffer(expected)) {\n\
    if (actual.length != expected.length) return false;\n\
\n\
    for (var i = 0; i < actual.length; i++) {\n\
      if (actual[i] !== expected[i]) return false;\n\
    }\n\
\n\
    return true;\n\
\n\
  // 7.2. If the expected value is a Date object, the actual value is\n\
  // equivalent if it is also a Date object that refers to the same time.\n\
  } else if (util.isDate(actual) && util.isDate(expected)) {\n\
    return actual.getTime() === expected.getTime();\n\
\n\
  // 7.3 If the expected value is a RegExp object, the actual value is\n\
  // equivalent if it is also a RegExp object with the same source and\n\
  // properties (`global`, `multiline`, `lastIndex`, `ignoreCase`).\n\
  } else if (util.isRegExp(actual) && util.isRegExp(expected)) {\n\
    return actual.source === expected.source &&\n\
           actual.global === expected.global &&\n\
           actual.multiline === expected.multiline &&\n\
           actual.lastIndex === expected.lastIndex &&\n\
           actual.ignoreCase === expected.ignoreCase;\n\
\n\
  // 7.4. Other pairs that do not both pass typeof value == 'object',\n\
  // equivalence is determined by ==.\n\
  } else if (!util.isObject(actual) && !util.isObject(expected)) {\n\
    return actual == expected;\n\
\n\
  // 7.5 For all other Object pairs, including Array objects, equivalence is\n\
  // determined by having the same number of owned properties (as verified\n\
  // with Object.prototype.hasOwnProperty.call), the same set of keys\n\
  // (although not necessarily the same order), equivalent values for every\n\
  // corresponding key, and an identical 'prototype' property. Note: this\n\
  // accounts for both named and indexed properties on Arrays.\n\
  } else {\n\
    return objEquiv(actual, expected);\n\
  }\n\
}\n\
\n\
function isArguments(object) {\n\
  return Object.prototype.toString.call(object) == '[object Arguments]';\n\
}\n\
\n\
function objEquiv(a, b) {\n\
  if (util.isNullOrUndefined(a) || util.isNullOrUndefined(b))\n\
    return false;\n\
  // an identical 'prototype' property.\n\
  if (a.prototype !== b.prototype) return false;\n\
  //~~~I've managed to break Object.keys through screwy arguments passing.\n\
  //   Converting to array solves the problem.\n\
  if (isArguments(a)) {\n\
    if (!isArguments(b)) {\n\
      return false;\n\
    }\n\
    a = pSlice.call(a);\n\
    b = pSlice.call(b);\n\
    return _deepEqual(a, b);\n\
  }\n\
  try {\n\
    var ka = shims.keys(a),\n\
        kb = shims.keys(b),\n\
        key, i;\n\
  } catch (e) {//happens when one is a string literal and the other isn't\n\
    return false;\n\
  }\n\
  // having the same number of owned properties (keys incorporates\n\
  // hasOwnProperty)\n\
  if (ka.length != kb.length)\n\
    return false;\n\
  //the same set of keys (although not necessarily the same order),\n\
  ka.sort();\n\
  kb.sort();\n\
  //~~~cheap key test\n\
  for (i = ka.length - 1; i >= 0; i--) {\n\
    if (ka[i] != kb[i])\n\
      return false;\n\
  }\n\
  //equivalent values for every corresponding key, and\n\
  //~~~possibly expensive deep test\n\
  for (i = ka.length - 1; i >= 0; i--) {\n\
    key = ka[i];\n\
    if (!_deepEqual(a[key], b[key])) return false;\n\
  }\n\
  return true;\n\
}\n\
\n\
// 8. The non-equivalence assertion tests for any deep inequality.\n\
// assert.notDeepEqual(actual, expected, message_opt);\n\
\n\
assert.notDeepEqual = function notDeepEqual(actual, expected, message) {\n\
  if (_deepEqual(actual, expected)) {\n\
    fail(actual, expected, message, 'notDeepEqual', assert.notDeepEqual);\n\
  }\n\
};\n\
\n\
// 9. The strict equality assertion tests strict equality, as determined by ===.\n\
// assert.strictEqual(actual, expected, message_opt);\n\
\n\
assert.strictEqual = function strictEqual(actual, expected, message) {\n\
  if (actual !== expected) {\n\
    fail(actual, expected, message, '===', assert.strictEqual);\n\
  }\n\
};\n\
\n\
// 10. The strict non-equality assertion tests for strict inequality, as\n\
// determined by !==.  assert.notStrictEqual(actual, expected, message_opt);\n\
\n\
assert.notStrictEqual = function notStrictEqual(actual, expected, message) {\n\
  if (actual === expected) {\n\
    fail(actual, expected, message, '!==', assert.notStrictEqual);\n\
  }\n\
};\n\
\n\
function expectedException(actual, expected) {\n\
  if (!actual || !expected) {\n\
    return false;\n\
  }\n\
\n\
  if (Object.prototype.toString.call(expected) == '[object RegExp]') {\n\
    return expected.test(actual);\n\
  } else if (actual instanceof expected) {\n\
    return true;\n\
  } else if (expected.call({}, actual) === true) {\n\
    return true;\n\
  }\n\
\n\
  return false;\n\
}\n\
\n\
function _throws(shouldThrow, block, expected, message) {\n\
  var actual;\n\
\n\
  if (util.isString(expected)) {\n\
    message = expected;\n\
    expected = null;\n\
  }\n\
\n\
  try {\n\
    block();\n\
  } catch (e) {\n\
    actual = e;\n\
  }\n\
\n\
  message = (expected && expected.name ? ' (' + expected.name + ').' : '.') +\n\
            (message ? ' ' + message : '.');\n\
\n\
  if (shouldThrow && !actual) {\n\
    fail(actual, expected, 'Missing expected exception' + message);\n\
  }\n\
\n\
  if (!shouldThrow && expectedException(actual, expected)) {\n\
    fail(actual, expected, 'Got unwanted exception' + message);\n\
  }\n\
\n\
  if ((shouldThrow && actual && expected &&\n\
      !expectedException(actual, expected)) || (!shouldThrow && actual)) {\n\
    throw actual;\n\
  }\n\
}\n\
\n\
// 11. Expected to throw an error:\n\
// assert.throws(block, Error_opt, message_opt);\n\
\n\
assert.throws = function(block, /*optional*/error, /*optional*/message) {\n\
  _throws.apply(this, [true].concat(pSlice.call(arguments)));\n\
};\n\
\n\
// EXTENSION! This is annoying to write outside this module.\n\
assert.doesNotThrow = function(block, /*optional*/message) {\n\
  _throws.apply(this, [false].concat(pSlice.call(arguments)));\n\
};\n\
\n\
assert.ifError = function(err) { if (err) {throw err;}};\n\
},{\"_shims\":2,\"util\":13}],9:[function(require,module,exports){\n\
// Copyright Joyent, Inc. and other Node contributors.\n\
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
var util = require('util');\n\
\n\
function EventEmitter() {\n\
  this._events = this._events || {};\n\
  this._maxListeners = this._maxListeners || undefined;\n\
}\n\
module.exports = EventEmitter;\n\
\n\
// Backwards-compat with node 0.10.x\n\
EventEmitter.EventEmitter = EventEmitter;\n\
\n\
EventEmitter.prototype._events = undefined;\n\
EventEmitter.prototype._maxListeners = undefined;\n\
\n\
// By default EventEmitters will print a warning if more than 10 listeners are\n\
// added to it. This is a useful default which helps finding memory leaks.\n\
EventEmitter.defaultMaxListeners = 10;\n\
\n\
// Obviously not all Emitters should be limited to 10. This function allows\n\
// that to be increased. Set to zero for unlimited.\n\
EventEmitter.prototype.setMaxListeners = function(n) {\n\
  if (!util.isNumber(n) || n < 0)\n\
    throw TypeError('n must be a positive number');\n\
  this._maxListeners = n;\n\
  return this;\n\
};\n\
\n\
EventEmitter.prototype.emit = function(type) {\n\
  var er, handler, len, args, i, listeners;\n\
\n\
  if (!this._events)\n\
    this._events = {};\n\
\n\
  // If there is no 'error' event listener then throw.\n\
  if (type === 'error') {\n\
    if (!this._events.error ||\n\
        (util.isObject(this._events.error) && !this._events.error.length)) {\n\
      er = arguments[1];\n\
      if (er instanceof Error) {\n\
        throw er; // Unhandled 'error' event\n\
      } else {\n\
        throw TypeError('Uncaught, unspecified \"error\" event.');\n\
      }\n\
      return false;\n\
    }\n\
  }\n\
\n\
  handler = this._events[type];\n\
\n\
  if (util.isUndefined(handler))\n\
    return false;\n\
\n\
  if (util.isFunction(handler)) {\n\
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
        len = arguments.length;\n\
        args = new Array(len - 1);\n\
        for (i = 1; i < len; i++)\n\
          args[i - 1] = arguments[i];\n\
        handler.apply(this, args);\n\
    }\n\
  } else if (util.isObject(handler)) {\n\
    len = arguments.length;\n\
    args = new Array(len - 1);\n\
    for (i = 1; i < len; i++)\n\
      args[i - 1] = arguments[i];\n\
\n\
    listeners = handler.slice();\n\
    len = listeners.length;\n\
    for (i = 0; i < len; i++)\n\
      listeners[i].apply(this, args);\n\
  }\n\
\n\
  return true;\n\
};\n\
\n\
EventEmitter.prototype.addListener = function(type, listener) {\n\
  var m;\n\
\n\
  if (!util.isFunction(listener))\n\
    throw TypeError('listener must be a function');\n\
\n\
  if (!this._events)\n\
    this._events = {};\n\
\n\
  // To avoid recursion in the case that type === \"newListener\"! Before\n\
  // adding it to the listeners, first emit \"newListener\".\n\
  if (this._events.newListener)\n\
    this.emit('newListener', type,\n\
              util.isFunction(listener.listener) ?\n\
              listener.listener : listener);\n\
\n\
  if (!this._events[type])\n\
    // Optimize the case of one listener. Don't need the extra array object.\n\
    this._events[type] = listener;\n\
  else if (util.isObject(this._events[type]))\n\
    // If we've already got an array, just append.\n\
    this._events[type].push(listener);\n\
  else\n\
    // Adding the second element, need to change to array.\n\
    this._events[type] = [this._events[type], listener];\n\
\n\
  // Check for listener leak\n\
  if (util.isObject(this._events[type]) && !this._events[type].warned) {\n\
    var m;\n\
    if (!util.isUndefined(this._maxListeners)) {\n\
      m = this._maxListeners;\n\
    } else {\n\
      m = EventEmitter.defaultMaxListeners;\n\
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
  return this;\n\
};\n\
\n\
EventEmitter.prototype.on = EventEmitter.prototype.addListener;\n\
\n\
EventEmitter.prototype.once = function(type, listener) {\n\
  if (!util.isFunction(listener))\n\
    throw TypeError('listener must be a function');\n\
\n\
  function g() {\n\
    this.removeListener(type, g);\n\
    listener.apply(this, arguments);\n\
  }\n\
\n\
  g.listener = listener;\n\
  this.on(type, g);\n\
\n\
  return this;\n\
};\n\
\n\
// emits a 'removeListener' event iff the listener was removed\n\
EventEmitter.prototype.removeListener = function(type, listener) {\n\
  var list, position, length, i;\n\
\n\
  if (!util.isFunction(listener))\n\
    throw TypeError('listener must be a function');\n\
\n\
  if (!this._events || !this._events[type])\n\
    return this;\n\
\n\
  list = this._events[type];\n\
  length = list.length;\n\
  position = -1;\n\
\n\
  if (list === listener ||\n\
      (util.isFunction(list.listener) && list.listener === listener)) {\n\
    delete this._events[type];\n\
    if (this._events.removeListener)\n\
      this.emit('removeListener', type, listener);\n\
\n\
  } else if (util.isObject(list)) {\n\
    for (i = length; i-- > 0;) {\n\
      if (list[i] === listener ||\n\
          (list[i].listener && list[i].listener === listener)) {\n\
        position = i;\n\
        break;\n\
      }\n\
    }\n\
\n\
    if (position < 0)\n\
      return this;\n\
\n\
    if (list.length === 1) {\n\
      list.length = 0;\n\
      delete this._events[type];\n\
    } else {\n\
      list.splice(position, 1);\n\
    }\n\
\n\
    if (this._events.removeListener)\n\
      this.emit('removeListener', type, listener);\n\
  }\n\
\n\
  return this;\n\
};\n\
\n\
EventEmitter.prototype.removeAllListeners = function(type) {\n\
  var key, listeners;\n\
\n\
  if (!this._events)\n\
    return this;\n\
\n\
  // not listening for removeListener, no need to emit\n\
  if (!this._events.removeListener) {\n\
    if (arguments.length === 0)\n\
      this._events = {};\n\
    else if (this._events[type])\n\
      delete this._events[type];\n\
    return this;\n\
  }\n\
\n\
  // emit removeListener for all listeners on all events\n\
  if (arguments.length === 0) {\n\
    for (key in this._events) {\n\
      if (key === 'removeListener') continue;\n\
      this.removeAllListeners(key);\n\
    }\n\
    this.removeAllListeners('removeListener');\n\
    this._events = {};\n\
    return this;\n\
  }\n\
\n\
  listeners = this._events[type];\n\
\n\
  if (util.isFunction(listeners)) {\n\
    this.removeListener(type, listeners);\n\
  } else {\n\
    // LIFO order\n\
    while (listeners.length)\n\
      this.removeListener(type, listeners[listeners.length - 1]);\n\
  }\n\
  delete this._events[type];\n\
\n\
  return this;\n\
};\n\
\n\
EventEmitter.prototype.listeners = function(type) {\n\
  var ret;\n\
  if (!this._events || !this._events[type])\n\
    ret = [];\n\
  else if (util.isFunction(this._events[type]))\n\
    ret = [this._events[type]];\n\
  else\n\
    ret = this._events[type].slice();\n\
  return ret;\n\
};\n\
\n\
EventEmitter.listenerCount = function(emitter, type) {\n\
  var ret;\n\
  if (!emitter._events || !emitter._events[type])\n\
    ret = 0;\n\
  else if (util.isFunction(emitter._events[type]))\n\
    ret = 1;\n\
  else\n\
    ret = emitter._events[type].length;\n\
  return ret;\n\
};\n\
},{\"util\":13}],10:[function(require,module,exports){\n\
// Copyright Joyent, Inc. and other Node contributors.\n\
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
module.exports = Stream;\n\
\n\
var EE = require('events').EventEmitter;\n\
var util = require('util');\n\
\n\
util.inherits(Stream, EE);\n\
Stream.Readable = require('_stream_readable');\n\
Stream.Writable = require('_stream_writable');\n\
Stream.Duplex = require('_stream_duplex');\n\
Stream.Transform = require('_stream_transform');\n\
Stream.PassThrough = require('_stream_passthrough');\n\
\n\
// Backwards-compat with node 0.4.x\n\
Stream.Stream = Stream;\n\
\n\
\n\
\n\
// old-style streams.  Note that the pipe method (the only relevant\n\
// part of this class) is overridden in the Readable class.\n\
\n\
function Stream() {\n\
  EE.call(this);\n\
}\n\
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
    if (EE.listenerCount(this, 'error') === 0) {\n\
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
    dest.removeListener('close', cleanup);\n\
  }\n\
\n\
  source.on('end', cleanup);\n\
  source.on('close', cleanup);\n\
\n\
  dest.on('close', cleanup);\n\
\n\
  dest.emit('pipe', source);\n\
\n\
  // Allow for unix-like usage: A.pipe(B).pipe(C)\n\
  return dest;\n\
};\n\
\n\
},{\"_stream_duplex\":3,\"_stream_passthrough\":4,\"_stream_readable\":5,\"_stream_transform\":6,\"_stream_writable\":7,\"events\":9,\"util\":13}],11:[function(require,module,exports){\n\
// Copyright Joyent, Inc. and other Node contributors.\n\
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
var Buffer = require('buffer').Buffer;\n\
\n\
function assertEncoding(encoding) {\n\
  if (encoding && !Buffer.isEncoding(encoding)) {\n\
    throw new Error('Unknown encoding: ' + encoding);\n\
  }\n\
}\n\
\n\
var StringDecoder = exports.StringDecoder = function(encoding) {\n\
  this.encoding = (encoding || 'utf8').toLowerCase().replace(/[-_]/, '');\n\
  assertEncoding(encoding);\n\
  switch (this.encoding) {\n\
    case 'utf8':\n\
      // CESU-8 represents each of Surrogate Pair by 3-bytes\n\
      this.surrogateSize = 3;\n\
      break;\n\
    case 'ucs2':\n\
    case 'utf16le':\n\
      // UTF-16 represents each of Surrogate Pair by 2-bytes\n\
      this.surrogateSize = 2;\n\
      this.detectIncompleteChar = utf16DetectIncompleteChar;\n\
      break;\n\
    case 'base64':\n\
      // Base-64 stores 3 bytes in 4 chars, and pads the remainder.\n\
      this.surrogateSize = 3;\n\
      this.detectIncompleteChar = base64DetectIncompleteChar;\n\
      break;\n\
    default:\n\
      this.write = passThroughWrite;\n\
      return;\n\
  }\n\
\n\
  this.charBuffer = new Buffer(6);\n\
  this.charReceived = 0;\n\
  this.charLength = 0;\n\
};\n\
\n\
\n\
StringDecoder.prototype.write = function(buffer) {\n\
  var charStr = '';\n\
  var offset = 0;\n\
\n\
  // if our last write ended with an incomplete multibyte character\n\
  while (this.charLength) {\n\
    // determine how many remaining bytes this buffer has to offer for this char\n\
    var i = (buffer.length >= this.charLength - this.charReceived) ?\n\
                this.charLength - this.charReceived :\n\
                buffer.length;\n\
\n\
    // add the new bytes to the char buffer\n\
    buffer.copy(this.charBuffer, this.charReceived, offset, i);\n\
    this.charReceived += (i - offset);\n\
    offset = i;\n\
\n\
    if (this.charReceived < this.charLength) {\n\
      // still not enough chars in this buffer? wait for more ...\n\
      return '';\n\
    }\n\
\n\
    // get the character that was split\n\
    charStr = this.charBuffer.slice(0, this.charLength).toString(this.encoding);\n\
\n\
    // lead surrogate (D800-DBFF) is also the incomplete character\n\
    var charCode = charStr.charCodeAt(charStr.length - 1);\n\
    if (charCode >= 0xD800 && charCode <= 0xDBFF) {\n\
      this.charLength += this.surrogateSize;\n\
      charStr = '';\n\
      continue;\n\
    }\n\
    this.charReceived = this.charLength = 0;\n\
\n\
    // if there are no more bytes in this buffer, just emit our char\n\
    if (i == buffer.length) return charStr;\n\
\n\
    // otherwise cut off the characters end from the beginning of this buffer\n\
    buffer = buffer.slice(i, buffer.length);\n\
    break;\n\
  }\n\
\n\
  var lenIncomplete = this.detectIncompleteChar(buffer);\n\
\n\
  var end = buffer.length;\n\
  if (this.charLength) {\n\
    // buffer the incomplete character bytes we got\n\
    buffer.copy(this.charBuffer, 0, buffer.length - lenIncomplete, end);\n\
    this.charReceived = lenIncomplete;\n\
    end -= lenIncomplete;\n\
  }\n\
\n\
  charStr += buffer.toString(this.encoding, 0, end);\n\
\n\
  var end = charStr.length - 1;\n\
  var charCode = charStr.charCodeAt(end);\n\
  // lead surrogate (D800-DBFF) is also the incomplete character\n\
  if (charCode >= 0xD800 && charCode <= 0xDBFF) {\n\
    var size = this.surrogateSize;\n\
    this.charLength += size;\n\
    this.charReceived += size;\n\
    this.charBuffer.copy(this.charBuffer, size, 0, size);\n\
    this.charBuffer.write(charStr.charAt(charStr.length - 1), this.encoding);\n\
    return charStr.substring(0, end);\n\
  }\n\
\n\
  // or just emit the charStr\n\
  return charStr;\n\
};\n\
\n\
StringDecoder.prototype.detectIncompleteChar = function(buffer) {\n\
  // determine how many bytes we have to check at the end of this buffer\n\
  var i = (buffer.length >= 3) ? 3 : buffer.length;\n\
\n\
  // Figure out if one of the last i bytes of our buffer announces an\n\
  // incomplete char.\n\
  for (; i > 0; i--) {\n\
    var c = buffer[buffer.length - i];\n\
\n\
    // See http://en.wikipedia.org/wiki/UTF-8#Description\n\
\n\
    // 110XXXXX\n\
    if (i == 1 && c >> 5 == 0x06) {\n\
      this.charLength = 2;\n\
      break;\n\
    }\n\
\n\
    // 1110XXXX\n\
    if (i <= 2 && c >> 4 == 0x0E) {\n\
      this.charLength = 3;\n\
      break;\n\
    }\n\
\n\
    // 11110XXX\n\
    if (i <= 3 && c >> 3 == 0x1E) {\n\
      this.charLength = 4;\n\
      break;\n\
    }\n\
  }\n\
\n\
  return i;\n\
};\n\
\n\
StringDecoder.prototype.end = function(buffer) {\n\
  var res = '';\n\
  if (buffer && buffer.length)\n\
    res = this.write(buffer);\n\
\n\
  if (this.charReceived) {\n\
    var cr = this.charReceived;\n\
    var buf = this.charBuffer;\n\
    var enc = this.encoding;\n\
    res += buf.slice(0, cr).toString(enc);\n\
  }\n\
\n\
  return res;\n\
};\n\
\n\
function passThroughWrite(buffer) {\n\
  return buffer.toString(this.encoding);\n\
}\n\
\n\
function utf16DetectIncompleteChar(buffer) {\n\
  var incomplete = this.charReceived = buffer.length % 2;\n\
  this.charLength = incomplete ? 2 : 0;\n\
  return incomplete;\n\
}\n\
\n\
function base64DetectIncompleteChar(buffer) {\n\
  var incomplete = this.charReceived = buffer.length % 3;\n\
  this.charLength = incomplete ? 3 : 0;\n\
  return incomplete;\n\
}\n\
\n\
},{\"buffer\":15}],12:[function(require,module,exports){\n\
try {\n\
    // Old IE browsers that do not curry arguments\n\
    if (!setTimeout.call) {\n\
        var slicer = Array.prototype.slice;\n\
        exports.setTimeout = function(fn) {\n\
            var args = slicer.call(arguments, 1);\n\
            return setTimeout(function() {\n\
                return fn.apply(this, args);\n\
            })\n\
        };\n\
\n\
        exports.setInterval = function(fn) {\n\
            var args = slicer.call(arguments, 1);\n\
            return setInterval(function() {\n\
                return fn.apply(this, args);\n\
            });\n\
        };\n\
    } else {\n\
        exports.setTimeout = setTimeout;\n\
        exports.setInterval = setInterval;\n\
    }\n\
    exports.clearTimeout = clearTimeout;\n\
    exports.clearInterval = clearInterval;\n\
\n\
    if (window.setImmediate) {\n\
      exports.setImmediate = window.setImmediate;\n\
      exports.clearImmediate = window.clearImmediate;\n\
    }\n\
\n\
    // Chrome and PhantomJS seems to depend on `this` pseudo variable being a\n\
    // `window` and throws invalid invocation exception otherwise. If this code\n\
    // runs in such JS runtime next line will throw and `catch` clause will\n\
    // exported timers functions bound to a window.\n\
    exports.setTimeout(function() {});\n\
} catch (_) {\n\
    function bind(f, context) {\n\
        return function () { return f.apply(context, arguments) };\n\
    }\n\
\n\
    if (typeof window !== 'undefined') {\n\
      exports.setTimeout = bind(setTimeout, window);\n\
      exports.setInterval = bind(setInterval, window);\n\
      exports.clearTimeout = bind(clearTimeout, window);\n\
      exports.clearInterval = bind(clearInterval, window);\n\
      if (window.setImmediate) {\n\
        exports.setImmediate = bind(window.setImmediate, window);\n\
        exports.clearImmediate = bind(window.clearImmediate, window);\n\
      }\n\
    } else {\n\
      if (typeof setTimeout !== 'undefined') {\n\
        exports.setTimeout = setTimeout;\n\
      }\n\
      if (typeof setInterval !== 'undefined') {\n\
        exports.setInterval = setInterval;\n\
      }\n\
      if (typeof clearTimeout !== 'undefined') {\n\
        exports.clearTimeout = clearTimeout;\n\
      }\n\
      if (typeof clearInterval === 'function') {\n\
        exports.clearInterval = clearInterval;\n\
      }\n\
    }\n\
}\n\
\n\
exports.unref = function unref() {};\n\
exports.ref = function ref() {};\n\
\n\
if (!exports.setImmediate) {\n\
  var currentKey = 0, queue = {}, active = false;\n\
\n\
  exports.setImmediate = (function () {\n\
      function drain() {\n\
        active = false;\n\
        for (var key in queue) {\n\
          if (queue.hasOwnProperty(currentKey, key)) {\n\
            var fn = queue[key];\n\
            delete queue[key];\n\
            fn();\n\
          }\n\
        }\n\
      }\n\
\n\
      if (typeof window !== 'undefined' &&\n\
          window.postMessage && window.addEventListener) {\n\
        window.addEventListener('message', function (ev) {\n\
          if (ev.source === window && ev.data === 'browserify-tick') {\n\
            ev.stopPropagation();\n\
            drain();\n\
          }\n\
        }, true);\n\
\n\
        return function setImmediate(fn) {\n\
          var id = ++currentKey;\n\
          queue[id] = fn;\n\
          if (!active) {\n\
            active = true;\n\
            window.postMessage('browserify-tick', '*');\n\
          }\n\
          return id;\n\
        };\n\
      } else {\n\
        return function setImmediate(fn) {\n\
          var id = ++currentKey;\n\
          queue[id] = fn;\n\
          if (!active) {\n\
            active = true;\n\
            setTimeout(drain, 0);\n\
          }\n\
          return id;\n\
        };\n\
      }\n\
  })();\n\
\n\
  exports.clearImmediate = function clearImmediate(id) {\n\
    delete queue[id];\n\
  };\n\
}\n\
\n\
},{}],13:[function(require,module,exports){\n\
var Buffer=require(\"__browserify_Buffer\").Buffer;// Copyright Joyent, Inc. and other Node contributors.\n\
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
var shims = require('_shims');\n\
\n\
var formatRegExp = /%[sdj%]/g;\n\
exports.format = function(f) {\n\
  if (!isString(f)) {\n\
    var objects = [];\n\
    for (var i = 0; i < arguments.length; i++) {\n\
      objects.push(inspect(arguments[i]));\n\
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
      case '%j':\n\
        try {\n\
          return JSON.stringify(args[i++]);\n\
        } catch (_) {\n\
          return '[Circular]';\n\
        }\n\
      default:\n\
        return x;\n\
    }\n\
  });\n\
  for (var x = args[i]; i < len; x = args[++i]) {\n\
    if (isNull(x) || !isObject(x)) {\n\
      str += ' ' + x;\n\
    } else {\n\
      str += ' ' + inspect(x);\n\
    }\n\
  }\n\
  return str;\n\
};\n\
\n\
/**\n\
 * Echos the value of a value. Trys to print the value out\n\
 * in the best way possible given the different types.\n\
 *\n\
 * @param {Object} obj The object to print out.\n\
 * @param {Object} opts Optional options object that alters the output.\n\
 */\n\
/* legacy: obj, showHidden, depth, colors*/\n\
function inspect(obj, opts) {\n\
  // default options\n\
  var ctx = {\n\
    seen: [],\n\
    stylize: stylizeNoColor\n\
  };\n\
  // legacy...\n\
  if (arguments.length >= 3) ctx.depth = arguments[2];\n\
  if (arguments.length >= 4) ctx.colors = arguments[3];\n\
  if (isBoolean(opts)) {\n\
    // legacy...\n\
    ctx.showHidden = opts;\n\
  } else if (opts) {\n\
    // got an \"options\" object\n\
    exports._extend(ctx, opts);\n\
  }\n\
  // set default options\n\
  if (isUndefined(ctx.showHidden)) ctx.showHidden = false;\n\
  if (isUndefined(ctx.depth)) ctx.depth = 2;\n\
  if (isUndefined(ctx.colors)) ctx.colors = false;\n\
  if (isUndefined(ctx.customInspect)) ctx.customInspect = true;\n\
  if (ctx.colors) ctx.stylize = stylizeWithColor;\n\
  return formatValue(ctx, obj, ctx.depth);\n\
}\n\
exports.inspect = inspect;\n\
\n\
\n\
// http://en.wikipedia.org/wiki/ANSI_escape_code#graphics\n\
inspect.colors = {\n\
  'bold' : [1, 22],\n\
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
  'yellow' : [33, 39]\n\
};\n\
\n\
// Don't use 'blue' not visible on cmd.exe\n\
inspect.styles = {\n\
  'special': 'cyan',\n\
  'number': 'yellow',\n\
  'boolean': 'yellow',\n\
  'undefined': 'grey',\n\
  'null': 'bold',\n\
  'string': 'green',\n\
  'date': 'magenta',\n\
  // \"name\": intentionally not styling\n\
  'regexp': 'red'\n\
};\n\
\n\
\n\
function stylizeWithColor(str, styleType) {\n\
  var style = inspect.styles[styleType];\n\
\n\
  if (style) {\n\
    return '\\u001b[' + inspect.colors[style][0] + 'm' + str +\n\
           '\\u001b[' + inspect.colors[style][1] + 'm';\n\
  } else {\n\
    return str;\n\
  }\n\
}\n\
\n\
\n\
function stylizeNoColor(str, styleType) {\n\
  return str;\n\
}\n\
\n\
\n\
function arrayToHash(array) {\n\
  var hash = {};\n\
\n\
  shims.forEach(array, function(val, idx) {\n\
    hash[val] = true;\n\
  });\n\
\n\
  return hash;\n\
}\n\
\n\
\n\
function formatValue(ctx, value, recurseTimes) {\n\
  // Provide a hook for user-specified inspect functions.\n\
  // Check that value is an object with an inspect function on it\n\
  if (ctx.customInspect &&\n\
      value &&\n\
      isFunction(value.inspect) &&\n\
      // Filter out the util module, it's inspect function is special\n\
      value.inspect !== exports.inspect &&\n\
      // Also filter out any prototype objects using the circular check.\n\
      !(value.constructor && value.constructor.prototype === value)) {\n\
    var ret = value.inspect(recurseTimes);\n\
    if (!isString(ret)) {\n\
      ret = formatValue(ctx, ret, recurseTimes);\n\
    }\n\
    return ret;\n\
  }\n\
\n\
  // Primitive types cannot have properties\n\
  var primitive = formatPrimitive(ctx, value);\n\
  if (primitive) {\n\
    return primitive;\n\
  }\n\
\n\
  // Look up the keys of the object.\n\
  var keys = shims.keys(value);\n\
  var visibleKeys = arrayToHash(keys);\n\
\n\
  if (ctx.showHidden) {\n\
    keys = shims.getOwnPropertyNames(value);\n\
  }\n\
\n\
  // Some type of object without properties can be shortcutted.\n\
  if (keys.length === 0) {\n\
    if (isFunction(value)) {\n\
      var name = value.name ? ': ' + value.name : '';\n\
      return ctx.stylize('[Function' + name + ']', 'special');\n\
    }\n\
    if (isRegExp(value)) {\n\
      return ctx.stylize(RegExp.prototype.toString.call(value), 'regexp');\n\
    }\n\
    if (isDate(value)) {\n\
      return ctx.stylize(Date.prototype.toString.call(value), 'date');\n\
    }\n\
    if (isError(value)) {\n\
      return formatError(value);\n\
    }\n\
  }\n\
\n\
  var base = '', array = false, braces = ['{', '}'];\n\
\n\
  // Make Array say that they are Array\n\
  if (isArray(value)) {\n\
    array = true;\n\
    braces = ['[', ']'];\n\
  }\n\
\n\
  // Make functions say that they are functions\n\
  if (isFunction(value)) {\n\
    var n = value.name ? ': ' + value.name : '';\n\
    base = ' [Function' + n + ']';\n\
  }\n\
\n\
  // Make RegExps say that they are RegExps\n\
  if (isRegExp(value)) {\n\
    base = ' ' + RegExp.prototype.toString.call(value);\n\
  }\n\
\n\
  // Make dates with properties first say the date\n\
  if (isDate(value)) {\n\
    base = ' ' + Date.prototype.toUTCString.call(value);\n\
  }\n\
\n\
  // Make error with message first say the error\n\
  if (isError(value)) {\n\
    base = ' ' + formatError(value);\n\
  }\n\
\n\
  if (keys.length === 0 && (!array || value.length == 0)) {\n\
    return braces[0] + base + braces[1];\n\
  }\n\
\n\
  if (recurseTimes < 0) {\n\
    if (isRegExp(value)) {\n\
      return ctx.stylize(RegExp.prototype.toString.call(value), 'regexp');\n\
    } else {\n\
      return ctx.stylize('[Object]', 'special');\n\
    }\n\
  }\n\
\n\
  ctx.seen.push(value);\n\
\n\
  var output;\n\
  if (array) {\n\
    output = formatArray(ctx, value, recurseTimes, visibleKeys, keys);\n\
  } else {\n\
    output = keys.map(function(key) {\n\
      return formatProperty(ctx, value, recurseTimes, visibleKeys, key, array);\n\
    });\n\
  }\n\
\n\
  ctx.seen.pop();\n\
\n\
  return reduceToSingleString(output, base, braces);\n\
}\n\
\n\
\n\
function formatPrimitive(ctx, value) {\n\
  if (isUndefined(value))\n\
    return ctx.stylize('undefined', 'undefined');\n\
  if (isString(value)) {\n\
    var simple = '\\'' + JSON.stringify(value).replace(/^\"|\"$/g, '')\n\
                                             .replace(/'/g, \"\\\\'\")\n\
                                             .replace(/\\\\\"/g, '\"') + '\\'';\n\
    return ctx.stylize(simple, 'string');\n\
  }\n\
  if (isNumber(value))\n\
    return ctx.stylize('' + value, 'number');\n\
  if (isBoolean(value))\n\
    return ctx.stylize('' + value, 'boolean');\n\
  // For some reason typeof null is \"object\", so special case here.\n\
  if (isNull(value))\n\
    return ctx.stylize('null', 'null');\n\
}\n\
\n\
\n\
function formatError(value) {\n\
  return '[' + Error.prototype.toString.call(value) + ']';\n\
}\n\
\n\
\n\
function formatArray(ctx, value, recurseTimes, visibleKeys, keys) {\n\
  var output = [];\n\
  for (var i = 0, l = value.length; i < l; ++i) {\n\
    if (hasOwnProperty(value, String(i))) {\n\
      output.push(formatProperty(ctx, value, recurseTimes, visibleKeys,\n\
          String(i), true));\n\
    } else {\n\
      output.push('');\n\
    }\n\
  }\n\
\n\
  shims.forEach(keys, function(key) {\n\
    if (!key.match(/^\\d+$/)) {\n\
      output.push(formatProperty(ctx, value, recurseTimes, visibleKeys,\n\
          key, true));\n\
    }\n\
  });\n\
  return output;\n\
}\n\
\n\
\n\
function formatProperty(ctx, value, recurseTimes, visibleKeys, key, array) {\n\
  var name, str, desc;\n\
  desc = shims.getOwnPropertyDescriptor(value, key) || { value: value[key] };\n\
  if (desc.get) {\n\
    if (desc.set) {\n\
      str = ctx.stylize('[Getter/Setter]', 'special');\n\
    } else {\n\
      str = ctx.stylize('[Getter]', 'special');\n\
    }\n\
  } else {\n\
    if (desc.set) {\n\
      str = ctx.stylize('[Setter]', 'special');\n\
    }\n\
  }\n\
\n\
  if (!hasOwnProperty(visibleKeys, key)) {\n\
    name = '[' + key + ']';\n\
  }\n\
  if (!str) {\n\
    if (shims.indexOf(ctx.seen, desc.value) < 0) {\n\
      if (isNull(recurseTimes)) {\n\
        str = formatValue(ctx, desc.value, null);\n\
      } else {\n\
        str = formatValue(ctx, desc.value, recurseTimes - 1);\n\
      }\n\
      if (str.indexOf('\\n\
') > -1) {\n\
        if (array) {\n\
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
      str = ctx.stylize('[Circular]', 'special');\n\
    }\n\
  }\n\
  if (isUndefined(name)) {\n\
    if (array && key.match(/^\\d+$/)) {\n\
      return str;\n\
    }\n\
    name = JSON.stringify('' + key);\n\
    if (name.match(/^\"([a-zA-Z_][a-zA-Z_0-9]*)\"$/)) {\n\
      name = name.substr(1, name.length - 2);\n\
      name = ctx.stylize(name, 'name');\n\
    } else {\n\
      name = name.replace(/'/g, \"\\\\'\")\n\
                 .replace(/\\\\\"/g, '\"')\n\
                 .replace(/(^\"|\"$)/g, \"'\");\n\
      name = ctx.stylize(name, 'string');\n\
    }\n\
  }\n\
\n\
  return name + ': ' + str;\n\
}\n\
\n\
\n\
function reduceToSingleString(output, base, braces) {\n\
  var numLinesEst = 0;\n\
  var length = shims.reduce(output, function(prev, cur) {\n\
    numLinesEst++;\n\
    if (cur.indexOf('\\n\
') >= 0) numLinesEst++;\n\
    return prev + cur.replace(/\\u001b\\[\\d\\d?m/g, '').length + 1;\n\
  }, 0);\n\
\n\
  if (length > 60) {\n\
    return braces[0] +\n\
           (base === '' ? '' : base + '\\n\
 ') +\n\
           ' ' +\n\
           output.join(',\\n\
  ') +\n\
           ' ' +\n\
           braces[1];\n\
  }\n\
\n\
  return braces[0] + base + ' ' + output.join(', ') + ' ' + braces[1];\n\
}\n\
\n\
\n\
// NOTE: These type checking functions intentionally don't use `instanceof`\n\
// because it is fragile and can be easily faked with `Object.create()`.\n\
function isArray(ar) {\n\
  return shims.isArray(ar);\n\
}\n\
exports.isArray = isArray;\n\
\n\
function isBoolean(arg) {\n\
  return typeof arg === 'boolean';\n\
}\n\
exports.isBoolean = isBoolean;\n\
\n\
function isNull(arg) {\n\
  return arg === null;\n\
}\n\
exports.isNull = isNull;\n\
\n\
function isNullOrUndefined(arg) {\n\
  return arg == null;\n\
}\n\
exports.isNullOrUndefined = isNullOrUndefined;\n\
\n\
function isNumber(arg) {\n\
  return typeof arg === 'number';\n\
}\n\
exports.isNumber = isNumber;\n\
\n\
function isString(arg) {\n\
  return typeof arg === 'string';\n\
}\n\
exports.isString = isString;\n\
\n\
function isSymbol(arg) {\n\
  return typeof arg === 'symbol';\n\
}\n\
exports.isSymbol = isSymbol;\n\
\n\
function isUndefined(arg) {\n\
  return arg === void 0;\n\
}\n\
exports.isUndefined = isUndefined;\n\
\n\
function isRegExp(re) {\n\
  return isObject(re) && objectToString(re) === '[object RegExp]';\n\
}\n\
exports.isRegExp = isRegExp;\n\
\n\
function isObject(arg) {\n\
  return typeof arg === 'object' && arg;\n\
}\n\
exports.isObject = isObject;\n\
\n\
function isDate(d) {\n\
  return isObject(d) && objectToString(d) === '[object Date]';\n\
}\n\
exports.isDate = isDate;\n\
\n\
function isError(e) {\n\
  return isObject(e) && objectToString(e) === '[object Error]';\n\
}\n\
exports.isError = isError;\n\
\n\
function isFunction(arg) {\n\
  return typeof arg === 'function';\n\
}\n\
exports.isFunction = isFunction;\n\
\n\
function isPrimitive(arg) {\n\
  return arg === null ||\n\
         typeof arg === 'boolean' ||\n\
         typeof arg === 'number' ||\n\
         typeof arg === 'string' ||\n\
         typeof arg === 'symbol' ||  // ES6 symbol\n\
         typeof arg === 'undefined';\n\
}\n\
exports.isPrimitive = isPrimitive;\n\
\n\
function isBuffer(arg) {\n\
  return arg instanceof Buffer;\n\
}\n\
exports.isBuffer = isBuffer;\n\
\n\
function objectToString(o) {\n\
  return Object.prototype.toString.call(o);\n\
}\n\
\n\
\n\
function pad(n) {\n\
  return n < 10 ? '0' + n.toString(10) : n.toString(10);\n\
}\n\
\n\
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
\n\
// log is just a thin wrapper to console.log that prepends a timestamp\n\
exports.log = function() {\n\
  console.log('%s - %s', timestamp(), exports.format.apply(exports, arguments));\n\
};\n\
\n\
\n\
/**\n\
 * Inherit the prototype methods from one constructor into another.\n\
 *\n\
 * The Function.prototype.inherits from lang.js rewritten as a standalone\n\
 * function (not on Function.prototype). NOTE: If this file is to be loaded\n\
 * during bootstrapping this function needs to be rewritten using some native\n\
 * functions as prototype setup using normal JavaScript does not work as\n\
 * expected during bootstrapping (see mirror.js in r114903).\n\
 *\n\
 * @param {function} ctor Constructor function which needs to inherit the\n\
 *     prototype.\n\
 * @param {function} superCtor Constructor function to inherit prototype from.\n\
 */\n\
exports.inherits = function(ctor, superCtor) {\n\
  ctor.super_ = superCtor;\n\
  ctor.prototype = shims.create(superCtor.prototype, {\n\
    constructor: {\n\
      value: ctor,\n\
      enumerable: false,\n\
      writable: true,\n\
      configurable: true\n\
    }\n\
  });\n\
};\n\
\n\
exports._extend = function(origin, add) {\n\
  // Don't do anything if add isn't an object\n\
  if (!add || !isObject(add)) return origin;\n\
\n\
  var keys = shims.keys(add);\n\
  var i = keys.length;\n\
  while (i--) {\n\
    origin[keys[i]] = add[keys[i]];\n\
  }\n\
  return origin;\n\
};\n\
\n\
function hasOwnProperty(obj, prop) {\n\
  return Object.prototype.hasOwnProperty.call(obj, prop);\n\
}\n\
\n\
},{\"__browserify_Buffer\":17,\"_shims\":2}],14:[function(require,module,exports){\n\
exports.readIEEE754 = function(buffer, offset, isBE, mLen, nBytes) {\n\
  var e, m,\n\
      eLen = nBytes * 8 - mLen - 1,\n\
      eMax = (1 << eLen) - 1,\n\
      eBias = eMax >> 1,\n\
      nBits = -7,\n\
      i = isBE ? 0 : (nBytes - 1),\n\
      d = isBE ? 1 : -1,\n\
      s = buffer[offset + i];\n\
\n\
  i += d;\n\
\n\
  e = s & ((1 << (-nBits)) - 1);\n\
  s >>= (-nBits);\n\
  nBits += eLen;\n\
  for (; nBits > 0; e = e * 256 + buffer[offset + i], i += d, nBits -= 8);\n\
\n\
  m = e & ((1 << (-nBits)) - 1);\n\
  e >>= (-nBits);\n\
  nBits += mLen;\n\
  for (; nBits > 0; m = m * 256 + buffer[offset + i], i += d, nBits -= 8);\n\
\n\
  if (e === 0) {\n\
    e = 1 - eBias;\n\
  } else if (e === eMax) {\n\
    return m ? NaN : ((s ? -1 : 1) * Infinity);\n\
  } else {\n\
    m = m + Math.pow(2, mLen);\n\
    e = e - eBias;\n\
  }\n\
  return (s ? -1 : 1) * m * Math.pow(2, e - mLen);\n\
};\n\
\n\
exports.writeIEEE754 = function(buffer, value, offset, isBE, mLen, nBytes) {\n\
  var e, m, c,\n\
      eLen = nBytes * 8 - mLen - 1,\n\
      eMax = (1 << eLen) - 1,\n\
      eBias = eMax >> 1,\n\
      rt = (mLen === 23 ? Math.pow(2, -24) - Math.pow(2, -77) : 0),\n\
      i = isBE ? (nBytes - 1) : 0,\n\
      d = isBE ? -1 : 1,\n\
      s = value < 0 || (value === 0 && 1 / value < 0) ? 1 : 0;\n\
\n\
  value = Math.abs(value);\n\
\n\
  if (isNaN(value) || value === Infinity) {\n\
    m = isNaN(value) ? 1 : 0;\n\
    e = eMax;\n\
  } else {\n\
    e = Math.floor(Math.log(value) / Math.LN2);\n\
    if (value * (c = Math.pow(2, -e)) < 1) {\n\
      e--;\n\
      c *= 2;\n\
    }\n\
    if (e + eBias >= 1) {\n\
      value += rt / c;\n\
    } else {\n\
      value += rt * Math.pow(2, 1 - eBias);\n\
    }\n\
    if (value * c >= 2) {\n\
      e++;\n\
      c /= 2;\n\
    }\n\
\n\
    if (e + eBias >= eMax) {\n\
      m = 0;\n\
      e = eMax;\n\
    } else if (e + eBias >= 1) {\n\
      m = (value * c - 1) * Math.pow(2, mLen);\n\
      e = e + eBias;\n\
    } else {\n\
      m = value * Math.pow(2, eBias - 1) * Math.pow(2, mLen);\n\
      e = 0;\n\
    }\n\
  }\n\
\n\
  for (; mLen >= 8; buffer[offset + i] = m & 0xff, i += d, m /= 256, mLen -= 8);\n\
\n\
  e = (e << mLen) | m;\n\
  eLen += mLen;\n\
  for (; eLen > 0; buffer[offset + i] = e & 0xff, i += d, e /= 256, eLen -= 8);\n\
\n\
  buffer[offset + i - d] |= s * 128;\n\
};\n\
\n\
},{}],15:[function(require,module,exports){\n\
var assert;\n\
exports.Buffer = Buffer;\n\
exports.SlowBuffer = Buffer;\n\
Buffer.poolSize = 8192;\n\
exports.INSPECT_MAX_BYTES = 50;\n\
\n\
function stringtrim(str) {\n\
  if (str.trim) return str.trim();\n\
  return str.replace(/^\\s+|\\s+$/g, '');\n\
}\n\
\n\
function Buffer(subject, encoding, offset) {\n\
  if(!assert) assert= require('assert');\n\
  if (!(this instanceof Buffer)) {\n\
    return new Buffer(subject, encoding, offset);\n\
  }\n\
  this.parent = this;\n\
  this.offset = 0;\n\
\n\
  // Work-around: node's base64 implementation\n\
  // allows for non-padded strings while base64-js\n\
  // does not..\n\
  if (encoding == \"base64\" && typeof subject == \"string\") {\n\
    subject = stringtrim(subject);\n\
    while (subject.length % 4 != 0) {\n\
      subject = subject + \"=\"; \n\
    }\n\
  }\n\
\n\
  var type;\n\
\n\
  // Are we slicing?\n\
  if (typeof offset === 'number') {\n\
    this.length = coerce(encoding);\n\
    // slicing works, with limitations (no parent tracking/update)\n\
    // check https://github.com/toots/buffer-browserify/issues/19\n\
    for (var i = 0; i < this.length; i++) {\n\
        this[i] = subject.get(i+offset);\n\
    }\n\
  } else {\n\
    // Find the length\n\
    switch (type = typeof subject) {\n\
      case 'number':\n\
        this.length = coerce(subject);\n\
        break;\n\
\n\
      case 'string':\n\
        this.length = Buffer.byteLength(subject, encoding);\n\
        break;\n\
\n\
      case 'object': // Assume object is an array\n\
        this.length = coerce(subject.length);\n\
        break;\n\
\n\
      default:\n\
        throw new Error('First argument needs to be a number, ' +\n\
                        'array or string.');\n\
    }\n\
\n\
    // Treat array-ish objects as a byte array.\n\
    if (isArrayIsh(subject)) {\n\
      for (var i = 0; i < this.length; i++) {\n\
        if (subject instanceof Buffer) {\n\
          this[i] = subject.readUInt8(i);\n\
        }\n\
        else {\n\
          this[i] = subject[i];\n\
        }\n\
      }\n\
    } else if (type == 'string') {\n\
      // We are a string\n\
      this.length = this.write(subject, 0, encoding);\n\
    } else if (type === 'number') {\n\
      for (var i = 0; i < this.length; i++) {\n\
        this[i] = 0;\n\
      }\n\
    }\n\
  }\n\
}\n\
\n\
Buffer.prototype.get = function get(i) {\n\
  if (i < 0 || i >= this.length) throw new Error('oob');\n\
  return this[i];\n\
};\n\
\n\
Buffer.prototype.set = function set(i, v) {\n\
  if (i < 0 || i >= this.length) throw new Error('oob');\n\
  return this[i] = v;\n\
};\n\
\n\
Buffer.byteLength = function (str, encoding) {\n\
  switch (encoding || \"utf8\") {\n\
    case 'hex':\n\
      return str.length / 2;\n\
\n\
    case 'utf8':\n\
    case 'utf-8':\n\
      return utf8ToBytes(str).length;\n\
\n\
    case 'ascii':\n\
    case 'binary':\n\
      return str.length;\n\
\n\
    case 'base64':\n\
      return base64ToBytes(str).length;\n\
\n\
    default:\n\
      throw new Error('Unknown encoding');\n\
  }\n\
};\n\
\n\
Buffer.prototype.utf8Write = function (string, offset, length) {\n\
  var bytes, pos;\n\
  return Buffer._charsWritten =  blitBuffer(utf8ToBytes(string), this, offset, length);\n\
};\n\
\n\
Buffer.prototype.asciiWrite = function (string, offset, length) {\n\
  var bytes, pos;\n\
  return Buffer._charsWritten =  blitBuffer(asciiToBytes(string), this, offset, length);\n\
};\n\
\n\
Buffer.prototype.binaryWrite = Buffer.prototype.asciiWrite;\n\
\n\
Buffer.prototype.base64Write = function (string, offset, length) {\n\
  var bytes, pos;\n\
  return Buffer._charsWritten = blitBuffer(base64ToBytes(string), this, offset, length);\n\
};\n\
\n\
Buffer.prototype.base64Slice = function (start, end) {\n\
  var bytes = Array.prototype.slice.apply(this, arguments)\n\
  return require(\"base64-js\").fromByteArray(bytes);\n\
};\n\
\n\
Buffer.prototype.utf8Slice = function () {\n\
  var bytes = Array.prototype.slice.apply(this, arguments);\n\
  var res = \"\";\n\
  var tmp = \"\";\n\
  var i = 0;\n\
  while (i < bytes.length) {\n\
    if (bytes[i] <= 0x7F) {\n\
      res += decodeUtf8Char(tmp) + String.fromCharCode(bytes[i]);\n\
      tmp = \"\";\n\
    } else\n\
      tmp += \"%\" + bytes[i].toString(16);\n\
\n\
    i++;\n\
  }\n\
\n\
  return res + decodeUtf8Char(tmp);\n\
}\n\
\n\
Buffer.prototype.asciiSlice = function () {\n\
  var bytes = Array.prototype.slice.apply(this, arguments);\n\
  var ret = \"\";\n\
  for (var i = 0; i < bytes.length; i++)\n\
    ret += String.fromCharCode(bytes[i]);\n\
  return ret;\n\
}\n\
\n\
Buffer.prototype.binarySlice = Buffer.prototype.asciiSlice;\n\
\n\
Buffer.prototype.inspect = function() {\n\
  var out = [],\n\
      len = this.length;\n\
  for (var i = 0; i < len; i++) {\n\
    out[i] = toHex(this[i]);\n\
    if (i == exports.INSPECT_MAX_BYTES) {\n\
      out[i + 1] = '...';\n\
      break;\n\
    }\n\
  }\n\
  return '<Buffer ' + out.join(' ') + '>';\n\
};\n\
\n\
\n\
Buffer.prototype.hexSlice = function(start, end) {\n\
  var len = this.length;\n\
\n\
  if (!start || start < 0) start = 0;\n\
  if (!end || end < 0 || end > len) end = len;\n\
\n\
  var out = '';\n\
  for (var i = start; i < end; i++) {\n\
    out += toHex(this[i]);\n\
  }\n\
  return out;\n\
};\n\
\n\
\n\
Buffer.prototype.toString = function(encoding, start, end) {\n\
  encoding = String(encoding || 'utf8').toLowerCase();\n\
  start = +start || 0;\n\
  if (typeof end == 'undefined') end = this.length;\n\
\n\
  // Fastpath empty strings\n\
  if (+end == start) {\n\
    return '';\n\
  }\n\
\n\
  switch (encoding) {\n\
    case 'hex':\n\
      return this.hexSlice(start, end);\n\
\n\
    case 'utf8':\n\
    case 'utf-8':\n\
      return this.utf8Slice(start, end);\n\
\n\
    case 'ascii':\n\
      return this.asciiSlice(start, end);\n\
\n\
    case 'binary':\n\
      return this.binarySlice(start, end);\n\
\n\
    case 'base64':\n\
      return this.base64Slice(start, end);\n\
\n\
    case 'ucs2':\n\
    case 'ucs-2':\n\
      return this.ucs2Slice(start, end);\n\
\n\
    default:\n\
      throw new Error('Unknown encoding');\n\
  }\n\
};\n\
\n\
\n\
Buffer.prototype.hexWrite = function(string, offset, length) {\n\
  offset = +offset || 0;\n\
  var remaining = this.length - offset;\n\
  if (!length) {\n\
    length = remaining;\n\
  } else {\n\
    length = +length;\n\
    if (length > remaining) {\n\
      length = remaining;\n\
    }\n\
  }\n\
\n\
  // must be an even number of digits\n\
  var strLen = string.length;\n\
  if (strLen % 2) {\n\
    throw new Error('Invalid hex string');\n\
  }\n\
  if (length > strLen / 2) {\n\
    length = strLen / 2;\n\
  }\n\
  for (var i = 0; i < length; i++) {\n\
    var byte = parseInt(string.substr(i * 2, 2), 16);\n\
    if (isNaN(byte)) throw new Error('Invalid hex string');\n\
    this[offset + i] = byte;\n\
  }\n\
  Buffer._charsWritten = i * 2;\n\
  return i;\n\
};\n\
\n\
\n\
Buffer.prototype.write = function(string, offset, length, encoding) {\n\
  // Support both (string, offset, length, encoding)\n\
  // and the legacy (string, encoding, offset, length)\n\
  if (isFinite(offset)) {\n\
    if (!isFinite(length)) {\n\
      encoding = length;\n\
      length = undefined;\n\
    }\n\
  } else {  // legacy\n\
    var swap = encoding;\n\
    encoding = offset;\n\
    offset = length;\n\
    length = swap;\n\
  }\n\
\n\
  offset = +offset || 0;\n\
  var remaining = this.length - offset;\n\
  if (!length) {\n\
    length = remaining;\n\
  } else {\n\
    length = +length;\n\
    if (length > remaining) {\n\
      length = remaining;\n\
    }\n\
  }\n\
  encoding = String(encoding || 'utf8').toLowerCase();\n\
\n\
  switch (encoding) {\n\
    case 'hex':\n\
      return this.hexWrite(string, offset, length);\n\
\n\
    case 'utf8':\n\
    case 'utf-8':\n\
      return this.utf8Write(string, offset, length);\n\
\n\
    case 'ascii':\n\
      return this.asciiWrite(string, offset, length);\n\
\n\
    case 'binary':\n\
      return this.binaryWrite(string, offset, length);\n\
\n\
    case 'base64':\n\
      return this.base64Write(string, offset, length);\n\
\n\
    case 'ucs2':\n\
    case 'ucs-2':\n\
      return this.ucs2Write(string, offset, length);\n\
\n\
    default:\n\
      throw new Error('Unknown encoding');\n\
  }\n\
};\n\
\n\
// slice(start, end)\n\
function clamp(index, len, defaultValue) {\n\
  if (typeof index !== 'number') return defaultValue;\n\
  index = ~~index;  // Coerce to integer.\n\
  if (index >= len) return len;\n\
  if (index >= 0) return index;\n\
  index += len;\n\
  if (index >= 0) return index;\n\
  return 0;\n\
}\n\
\n\
Buffer.prototype.slice = function(start, end) {\n\
  var len = this.length;\n\
  start = clamp(start, len, 0);\n\
  end = clamp(end, len, len);\n\
  return new Buffer(this, end - start, +start);\n\
};\n\
\n\
// copy(targetBuffer, targetStart=0, sourceStart=0, sourceEnd=buffer.length)\n\
Buffer.prototype.copy = function(target, target_start, start, end) {\n\
  var source = this;\n\
  start || (start = 0);\n\
  if (end === undefined || isNaN(end)) {\n\
    end = this.length;\n\
  }\n\
  target_start || (target_start = 0);\n\
\n\
  if (end < start) throw new Error('sourceEnd < sourceStart');\n\
\n\
  // Copy 0 bytes; we're done\n\
  if (end === start) return 0;\n\
  if (target.length == 0 || source.length == 0) return 0;\n\
\n\
  if (target_start < 0 || target_start >= target.length) {\n\
    throw new Error('targetStart out of bounds');\n\
  }\n\
\n\
  if (start < 0 || start >= source.length) {\n\
    throw new Error('sourceStart out of bounds');\n\
  }\n\
\n\
  if (end < 0 || end > source.length) {\n\
    throw new Error('sourceEnd out of bounds');\n\
  }\n\
\n\
  // Are we oob?\n\
  if (end > this.length) {\n\
    end = this.length;\n\
  }\n\
\n\
  if (target.length - target_start < end - start) {\n\
    end = target.length - target_start + start;\n\
  }\n\
\n\
  var temp = [];\n\
  for (var i=start; i<end; i++) {\n\
    assert.ok(typeof this[i] !== 'undefined', \"copying undefined buffer bytes!\");\n\
    temp.push(this[i]);\n\
  }\n\
\n\
  for (var i=target_start; i<target_start+temp.length; i++) {\n\
    target[i] = temp[i-target_start];\n\
  }\n\
};\n\
\n\
// fill(value, start=0, end=buffer.length)\n\
Buffer.prototype.fill = function fill(value, start, end) {\n\
  value || (value = 0);\n\
  start || (start = 0);\n\
  end || (end = this.length);\n\
\n\
  if (typeof value === 'string') {\n\
    value = value.charCodeAt(0);\n\
  }\n\
  if (!(typeof value === 'number') || isNaN(value)) {\n\
    throw new Error('value is not a number');\n\
  }\n\
\n\
  if (end < start) throw new Error('end < start');\n\
\n\
  // Fill 0 bytes; we're done\n\
  if (end === start) return 0;\n\
  if (this.length == 0) return 0;\n\
\n\
  if (start < 0 || start >= this.length) {\n\
    throw new Error('start out of bounds');\n\
  }\n\
\n\
  if (end < 0 || end > this.length) {\n\
    throw new Error('end out of bounds');\n\
  }\n\
\n\
  for (var i = start; i < end; i++) {\n\
    this[i] = value;\n\
  }\n\
}\n\
\n\
// Static methods\n\
Buffer.isBuffer = function isBuffer(b) {\n\
  return b instanceof Buffer || b instanceof Buffer;\n\
};\n\
\n\
Buffer.concat = function (list, totalLength) {\n\
  if (!isArray(list)) {\n\
    throw new Error(\"Usage: Buffer.concat(list, [totalLength])\\n\
 \\\n\
      list should be an Array.\");\n\
  }\n\
\n\
  if (list.length === 0) {\n\
    return new Buffer(0);\n\
  } else if (list.length === 1) {\n\
    return list[0];\n\
  }\n\
\n\
  if (typeof totalLength !== 'number') {\n\
    totalLength = 0;\n\
    for (var i = 0; i < list.length; i++) {\n\
      var buf = list[i];\n\
      totalLength += buf.length;\n\
    }\n\
  }\n\
\n\
  var buffer = new Buffer(totalLength);\n\
  var pos = 0;\n\
  for (var i = 0; i < list.length; i++) {\n\
    var buf = list[i];\n\
    buf.copy(buffer, pos);\n\
    pos += buf.length;\n\
  }\n\
  return buffer;\n\
};\n\
\n\
Buffer.isEncoding = function(encoding) {\n\
  switch ((encoding + '').toLowerCase()) {\n\
    case 'hex':\n\
    case 'utf8':\n\
    case 'utf-8':\n\
    case 'ascii':\n\
    case 'binary':\n\
    case 'base64':\n\
    case 'ucs2':\n\
    case 'ucs-2':\n\
    case 'utf16le':\n\
    case 'utf-16le':\n\
    case 'raw':\n\
      return true;\n\
\n\
    default:\n\
      return false;\n\
  }\n\
};\n\
\n\
// helpers\n\
\n\
function coerce(length) {\n\
  // Coerce length to a number (possibly NaN), round up\n\
  // in case it's fractional (e.g. 123.456) then do a\n\
  // double negate to coerce a NaN to 0. Easy, right?\n\
  length = ~~Math.ceil(+length);\n\
  return length < 0 ? 0 : length;\n\
}\n\
\n\
function isArray(subject) {\n\
  return (Array.isArray ||\n\
    function(subject){\n\
      return {}.toString.apply(subject) == '[object Array]'\n\
    })\n\
    (subject)\n\
}\n\
\n\
function isArrayIsh(subject) {\n\
  return isArray(subject) || Buffer.isBuffer(subject) ||\n\
         subject && typeof subject === 'object' &&\n\
         typeof subject.length === 'number';\n\
}\n\
\n\
function toHex(n) {\n\
  if (n < 16) return '0' + n.toString(16);\n\
  return n.toString(16);\n\
}\n\
\n\
function utf8ToBytes(str) {\n\
  var byteArray = [];\n\
  for (var i = 0; i < str.length; i++)\n\
    if (str.charCodeAt(i) <= 0x7F)\n\
      byteArray.push(str.charCodeAt(i));\n\
    else {\n\
      var h = encodeURIComponent(str.charAt(i)).substr(1).split('%');\n\
      for (var j = 0; j < h.length; j++)\n\
        byteArray.push(parseInt(h[j], 16));\n\
    }\n\
\n\
  return byteArray;\n\
}\n\
\n\
function asciiToBytes(str) {\n\
  var byteArray = []\n\
  for (var i = 0; i < str.length; i++ )\n\
    // Node's code seems to be doing this and not & 0x7F..\n\
    byteArray.push( str.charCodeAt(i) & 0xFF );\n\
\n\
  return byteArray;\n\
}\n\
\n\
function base64ToBytes(str) {\n\
  return require(\"base64-js\").toByteArray(str);\n\
}\n\
\n\
function blitBuffer(src, dst, offset, length) {\n\
  var pos, i = 0;\n\
  while (i < length) {\n\
    if ((i+offset >= dst.length) || (i >= src.length))\n\
      break;\n\
\n\
    dst[i + offset] = src[i];\n\
    i++;\n\
  }\n\
  return i;\n\
}\n\
\n\
function decodeUtf8Char(str) {\n\
  try {\n\
    return decodeURIComponent(str);\n\
  } catch (err) {\n\
    return String.fromCharCode(0xFFFD); // UTF 8 invalid char\n\
  }\n\
}\n\
\n\
// read/write bit-twiddling\n\
\n\
Buffer.prototype.readUInt8 = function(offset, noAssert) {\n\
  var buffer = this;\n\
\n\
  if (!noAssert) {\n\
    assert.ok(offset !== undefined && offset !== null,\n\
        'missing offset');\n\
\n\
    assert.ok(offset < buffer.length,\n\
        'Trying to read beyond buffer length');\n\
  }\n\
\n\
  if (offset >= buffer.length) return;\n\
\n\
  return buffer[offset];\n\
};\n\
\n\
function readUInt16(buffer, offset, isBigEndian, noAssert) {\n\
  var val = 0;\n\
\n\
\n\
  if (!noAssert) {\n\
    assert.ok(typeof (isBigEndian) === 'boolean',\n\
        'missing or invalid endian');\n\
\n\
    assert.ok(offset !== undefined && offset !== null,\n\
        'missing offset');\n\
\n\
    assert.ok(offset + 1 < buffer.length,\n\
        'Trying to read beyond buffer length');\n\
  }\n\
\n\
  if (offset >= buffer.length) return 0;\n\
\n\
  if (isBigEndian) {\n\
    val = buffer[offset] << 8;\n\
    if (offset + 1 < buffer.length) {\n\
      val |= buffer[offset + 1];\n\
    }\n\
  } else {\n\
    val = buffer[offset];\n\
    if (offset + 1 < buffer.length) {\n\
      val |= buffer[offset + 1] << 8;\n\
    }\n\
  }\n\
\n\
  return val;\n\
}\n\
\n\
Buffer.prototype.readUInt16LE = function(offset, noAssert) {\n\
  return readUInt16(this, offset, false, noAssert);\n\
};\n\
\n\
Buffer.prototype.readUInt16BE = function(offset, noAssert) {\n\
  return readUInt16(this, offset, true, noAssert);\n\
};\n\
\n\
function readUInt32(buffer, offset, isBigEndian, noAssert) {\n\
  var val = 0;\n\
\n\
  if (!noAssert) {\n\
    assert.ok(typeof (isBigEndian) === 'boolean',\n\
        'missing or invalid endian');\n\
\n\
    assert.ok(offset !== undefined && offset !== null,\n\
        'missing offset');\n\
\n\
    assert.ok(offset + 3 < buffer.length,\n\
        'Trying to read beyond buffer length');\n\
  }\n\
\n\
  if (offset >= buffer.length) return 0;\n\
\n\
  if (isBigEndian) {\n\
    if (offset + 1 < buffer.length)\n\
      val = buffer[offset + 1] << 16;\n\
    if (offset + 2 < buffer.length)\n\
      val |= buffer[offset + 2] << 8;\n\
    if (offset + 3 < buffer.length)\n\
      val |= buffer[offset + 3];\n\
    val = val + (buffer[offset] << 24 >>> 0);\n\
  } else {\n\
    if (offset + 2 < buffer.length)\n\
      val = buffer[offset + 2] << 16;\n\
    if (offset + 1 < buffer.length)\n\
      val |= buffer[offset + 1] << 8;\n\
    val |= buffer[offset];\n\
    if (offset + 3 < buffer.length)\n\
      val = val + (buffer[offset + 3] << 24 >>> 0);\n\
  }\n\
\n\
  return val;\n\
}\n\
\n\
Buffer.prototype.readUInt32LE = function(offset, noAssert) {\n\
  return readUInt32(this, offset, false, noAssert);\n\
};\n\
\n\
Buffer.prototype.readUInt32BE = function(offset, noAssert) {\n\
  return readUInt32(this, offset, true, noAssert);\n\
};\n\
\n\
\n\
/*\n\
 * Signed integer types, yay team! A reminder on how two's complement actually\n\
 * works. The first bit is the signed bit, i.e. tells us whether or not the\n\
 * number should be positive or negative. If the two's complement value is\n\
 * positive, then we're done, as it's equivalent to the unsigned representation.\n\
 *\n\
 * Now if the number is positive, you're pretty much done, you can just leverage\n\
 * the unsigned translations and return those. Unfortunately, negative numbers\n\
 * aren't quite that straightforward.\n\
 *\n\
 * At first glance, one might be inclined to use the traditional formula to\n\
 * translate binary numbers between the positive and negative values in two's\n\
 * complement. (Though it doesn't quite work for the most negative value)\n\
 * Mainly:\n\
 *  - invert all the bits\n\
 *  - add one to the result\n\
 *\n\
 * Of course, this doesn't quite work in Javascript. Take for example the value\n\
 * of -128. This could be represented in 16 bits (big-endian) as 0xff80. But of\n\
 * course, Javascript will do the following:\n\
 *\n\
 * > ~0xff80\n\
 * -65409\n\
 *\n\
 * Whoh there, Javascript, that's not quite right. But wait, according to\n\
 * Javascript that's perfectly correct. When Javascript ends up seeing the\n\
 * constant 0xff80, it has no notion that it is actually a signed number. It\n\
 * assumes that we've input the unsigned value 0xff80. Thus, when it does the\n\
 * binary negation, it casts it into a signed value, (positive 0xff80). Then\n\
 * when you perform binary negation on that, it turns it into a negative number.\n\
 *\n\
 * Instead, we're going to have to use the following general formula, that works\n\
 * in a rather Javascript friendly way. I'm glad we don't support this kind of\n\
 * weird numbering scheme in the kernel.\n\
 *\n\
 * (BIT-MAX - (unsigned)val + 1) * -1\n\
 *\n\
 * The astute observer, may think that this doesn't make sense for 8-bit numbers\n\
 * (really it isn't necessary for them). However, when you get 16-bit numbers,\n\
 * you do. Let's go back to our prior example and see how this will look:\n\
 *\n\
 * (0xffff - 0xff80 + 1) * -1\n\
 * (0x007f + 1) * -1\n\
 * (0x0080) * -1\n\
 */\n\
Buffer.prototype.readInt8 = function(offset, noAssert) {\n\
  var buffer = this;\n\
  var neg;\n\
\n\
  if (!noAssert) {\n\
    assert.ok(offset !== undefined && offset !== null,\n\
        'missing offset');\n\
\n\
    assert.ok(offset < buffer.length,\n\
        'Trying to read beyond buffer length');\n\
  }\n\
\n\
  if (offset >= buffer.length) return;\n\
\n\
  neg = buffer[offset] & 0x80;\n\
  if (!neg) {\n\
    return (buffer[offset]);\n\
  }\n\
\n\
  return ((0xff - buffer[offset] + 1) * -1);\n\
};\n\
\n\
function readInt16(buffer, offset, isBigEndian, noAssert) {\n\
  var neg, val;\n\
\n\
  if (!noAssert) {\n\
    assert.ok(typeof (isBigEndian) === 'boolean',\n\
        'missing or invalid endian');\n\
\n\
    assert.ok(offset !== undefined && offset !== null,\n\
        'missing offset');\n\
\n\
    assert.ok(offset + 1 < buffer.length,\n\
        'Trying to read beyond buffer length');\n\
  }\n\
\n\
  val = readUInt16(buffer, offset, isBigEndian, noAssert);\n\
  neg = val & 0x8000;\n\
  if (!neg) {\n\
    return val;\n\
  }\n\
\n\
  return (0xffff - val + 1) * -1;\n\
}\n\
\n\
Buffer.prototype.readInt16LE = function(offset, noAssert) {\n\
  return readInt16(this, offset, false, noAssert);\n\
};\n\
\n\
Buffer.prototype.readInt16BE = function(offset, noAssert) {\n\
  return readInt16(this, offset, true, noAssert);\n\
};\n\
\n\
function readInt32(buffer, offset, isBigEndian, noAssert) {\n\
  var neg, val;\n\
\n\
  if (!noAssert) {\n\
    assert.ok(typeof (isBigEndian) === 'boolean',\n\
        'missing or invalid endian');\n\
\n\
    assert.ok(offset !== undefined && offset !== null,\n\
        'missing offset');\n\
\n\
    assert.ok(offset + 3 < buffer.length,\n\
        'Trying to read beyond buffer length');\n\
  }\n\
\n\
  val = readUInt32(buffer, offset, isBigEndian, noAssert);\n\
  neg = val & 0x80000000;\n\
  if (!neg) {\n\
    return (val);\n\
  }\n\
\n\
  return (0xffffffff - val + 1) * -1;\n\
}\n\
\n\
Buffer.prototype.readInt32LE = function(offset, noAssert) {\n\
  return readInt32(this, offset, false, noAssert);\n\
};\n\
\n\
Buffer.prototype.readInt32BE = function(offset, noAssert) {\n\
  return readInt32(this, offset, true, noAssert);\n\
};\n\
\n\
function readFloat(buffer, offset, isBigEndian, noAssert) {\n\
  if (!noAssert) {\n\
    assert.ok(typeof (isBigEndian) === 'boolean',\n\
        'missing or invalid endian');\n\
\n\
    assert.ok(offset + 3 < buffer.length,\n\
        'Trying to read beyond buffer length');\n\
  }\n\
\n\
  return require('./buffer_ieee754').readIEEE754(buffer, offset, isBigEndian,\n\
      23, 4);\n\
}\n\
\n\
Buffer.prototype.readFloatLE = function(offset, noAssert) {\n\
  return readFloat(this, offset, false, noAssert);\n\
};\n\
\n\
Buffer.prototype.readFloatBE = function(offset, noAssert) {\n\
  return readFloat(this, offset, true, noAssert);\n\
};\n\
\n\
function readDouble(buffer, offset, isBigEndian, noAssert) {\n\
  if (!noAssert) {\n\
    assert.ok(typeof (isBigEndian) === 'boolean',\n\
        'missing or invalid endian');\n\
\n\
    assert.ok(offset + 7 < buffer.length,\n\
        'Trying to read beyond buffer length');\n\
  }\n\
\n\
  return require('./buffer_ieee754').readIEEE754(buffer, offset, isBigEndian,\n\
      52, 8);\n\
}\n\
\n\
Buffer.prototype.readDoubleLE = function(offset, noAssert) {\n\
  return readDouble(this, offset, false, noAssert);\n\
};\n\
\n\
Buffer.prototype.readDoubleBE = function(offset, noAssert) {\n\
  return readDouble(this, offset, true, noAssert);\n\
};\n\
\n\
\n\
/*\n\
 * We have to make sure that the value is a valid integer. This means that it is\n\
 * non-negative. It has no fractional component and that it does not exceed the\n\
 * maximum allowed value.\n\
 *\n\
 *      value           The number to check for validity\n\
 *\n\
 *      max             The maximum value\n\
 */\n\
function verifuint(value, max) {\n\
  assert.ok(typeof (value) == 'number',\n\
      'cannot write a non-number as a number');\n\
\n\
  assert.ok(value >= 0,\n\
      'specified a negative value for writing an unsigned value');\n\
\n\
  assert.ok(value <= max, 'value is larger than maximum value for type');\n\
\n\
  assert.ok(Math.floor(value) === value, 'value has a fractional component');\n\
}\n\
\n\
Buffer.prototype.writeUInt8 = function(value, offset, noAssert) {\n\
  var buffer = this;\n\
\n\
  if (!noAssert) {\n\
    assert.ok(value !== undefined && value !== null,\n\
        'missing value');\n\
\n\
    assert.ok(offset !== undefined && offset !== null,\n\
        'missing offset');\n\
\n\
    assert.ok(offset < buffer.length,\n\
        'trying to write beyond buffer length');\n\
\n\
    verifuint(value, 0xff);\n\
  }\n\
\n\
  if (offset < buffer.length) {\n\
    buffer[offset] = value;\n\
  }\n\
};\n\
\n\
function writeUInt16(buffer, value, offset, isBigEndian, noAssert) {\n\
  if (!noAssert) {\n\
    assert.ok(value !== undefined && value !== null,\n\
        'missing value');\n\
\n\
    assert.ok(typeof (isBigEndian) === 'boolean',\n\
        'missing or invalid endian');\n\
\n\
    assert.ok(offset !== undefined && offset !== null,\n\
        'missing offset');\n\
\n\
    assert.ok(offset + 1 < buffer.length,\n\
        'trying to write beyond buffer length');\n\
\n\
    verifuint(value, 0xffff);\n\
  }\n\
\n\
  for (var i = 0; i < Math.min(buffer.length - offset, 2); i++) {\n\
    buffer[offset + i] =\n\
        (value & (0xff << (8 * (isBigEndian ? 1 - i : i)))) >>>\n\
            (isBigEndian ? 1 - i : i) * 8;\n\
  }\n\
\n\
}\n\
\n\
Buffer.prototype.writeUInt16LE = function(value, offset, noAssert) {\n\
  writeUInt16(this, value, offset, false, noAssert);\n\
};\n\
\n\
Buffer.prototype.writeUInt16BE = function(value, offset, noAssert) {\n\
  writeUInt16(this, value, offset, true, noAssert);\n\
};\n\
\n\
function writeUInt32(buffer, value, offset, isBigEndian, noAssert) {\n\
  if (!noAssert) {\n\
    assert.ok(value !== undefined && value !== null,\n\
        'missing value');\n\
\n\
    assert.ok(typeof (isBigEndian) === 'boolean',\n\
        'missing or invalid endian');\n\
\n\
    assert.ok(offset !== undefined && offset !== null,\n\
        'missing offset');\n\
\n\
    assert.ok(offset + 3 < buffer.length,\n\
        'trying to write beyond buffer length');\n\
\n\
    verifuint(value, 0xffffffff);\n\
  }\n\
\n\
  for (var i = 0; i < Math.min(buffer.length - offset, 4); i++) {\n\
    buffer[offset + i] =\n\
        (value >>> (isBigEndian ? 3 - i : i) * 8) & 0xff;\n\
  }\n\
}\n\
\n\
Buffer.prototype.writeUInt32LE = function(value, offset, noAssert) {\n\
  writeUInt32(this, value, offset, false, noAssert);\n\
};\n\
\n\
Buffer.prototype.writeUInt32BE = function(value, offset, noAssert) {\n\
  writeUInt32(this, value, offset, true, noAssert);\n\
};\n\
\n\
\n\
/*\n\
 * We now move onto our friends in the signed number category. Unlike unsigned\n\
 * numbers, we're going to have to worry a bit more about how we put values into\n\
 * arrays. Since we are only worrying about signed 32-bit values, we're in\n\
 * slightly better shape. Unfortunately, we really can't do our favorite binary\n\
 * & in this system. It really seems to do the wrong thing. For example:\n\
 *\n\
 * > -32 & 0xff\n\
 * 224\n\
 *\n\
 * What's happening above is really: 0xe0 & 0xff = 0xe0. However, the results of\n\
 * this aren't treated as a signed number. Ultimately a bad thing.\n\
 *\n\
 * What we're going to want to do is basically create the unsigned equivalent of\n\
 * our representation and pass that off to the wuint* functions. To do that\n\
 * we're going to do the following:\n\
 *\n\
 *  - if the value is positive\n\
 *      we can pass it directly off to the equivalent wuint\n\
 *  - if the value is negative\n\
 *      we do the following computation:\n\
 *         mb + val + 1, where\n\
 *         mb   is the maximum unsigned value in that byte size\n\
 *         val  is the Javascript negative integer\n\
 *\n\
 *\n\
 * As a concrete value, take -128. In signed 16 bits this would be 0xff80. If\n\
 * you do out the computations:\n\
 *\n\
 * 0xffff - 128 + 1\n\
 * 0xffff - 127\n\
 * 0xff80\n\
 *\n\
 * You can then encode this value as the signed version. This is really rather\n\
 * hacky, but it should work and get the job done which is our goal here.\n\
 */\n\
\n\
/*\n\
 * A series of checks to make sure we actually have a signed 32-bit number\n\
 */\n\
function verifsint(value, max, min) {\n\
  assert.ok(typeof (value) == 'number',\n\
      'cannot write a non-number as a number');\n\
\n\
  assert.ok(value <= max, 'value larger than maximum allowed value');\n\
\n\
  assert.ok(value >= min, 'value smaller than minimum allowed value');\n\
\n\
  assert.ok(Math.floor(value) === value, 'value has a fractional component');\n\
}\n\
\n\
function verifIEEE754(value, max, min) {\n\
  assert.ok(typeof (value) == 'number',\n\
      'cannot write a non-number as a number');\n\
\n\
  assert.ok(value <= max, 'value larger than maximum allowed value');\n\
\n\
  assert.ok(value >= min, 'value smaller than minimum allowed value');\n\
}\n\
\n\
Buffer.prototype.writeInt8 = function(value, offset, noAssert) {\n\
  var buffer = this;\n\
\n\
  if (!noAssert) {\n\
    assert.ok(value !== undefined && value !== null,\n\
        'missing value');\n\
\n\
    assert.ok(offset !== undefined && offset !== null,\n\
        'missing offset');\n\
\n\
    assert.ok(offset < buffer.length,\n\
        'Trying to write beyond buffer length');\n\
\n\
    verifsint(value, 0x7f, -0x80);\n\
  }\n\
\n\
  if (value >= 0) {\n\
    buffer.writeUInt8(value, offset, noAssert);\n\
  } else {\n\
    buffer.writeUInt8(0xff + value + 1, offset, noAssert);\n\
  }\n\
};\n\
\n\
function writeInt16(buffer, value, offset, isBigEndian, noAssert) {\n\
  if (!noAssert) {\n\
    assert.ok(value !== undefined && value !== null,\n\
        'missing value');\n\
\n\
    assert.ok(typeof (isBigEndian) === 'boolean',\n\
        'missing or invalid endian');\n\
\n\
    assert.ok(offset !== undefined && offset !== null,\n\
        'missing offset');\n\
\n\
    assert.ok(offset + 1 < buffer.length,\n\
        'Trying to write beyond buffer length');\n\
\n\
    verifsint(value, 0x7fff, -0x8000);\n\
  }\n\
\n\
  if (value >= 0) {\n\
    writeUInt16(buffer, value, offset, isBigEndian, noAssert);\n\
  } else {\n\
    writeUInt16(buffer, 0xffff + value + 1, offset, isBigEndian, noAssert);\n\
  }\n\
}\n\
\n\
Buffer.prototype.writeInt16LE = function(value, offset, noAssert) {\n\
  writeInt16(this, value, offset, false, noAssert);\n\
};\n\
\n\
Buffer.prototype.writeInt16BE = function(value, offset, noAssert) {\n\
  writeInt16(this, value, offset, true, noAssert);\n\
};\n\
\n\
function writeInt32(buffer, value, offset, isBigEndian, noAssert) {\n\
  if (!noAssert) {\n\
    assert.ok(value !== undefined && value !== null,\n\
        'missing value');\n\
\n\
    assert.ok(typeof (isBigEndian) === 'boolean',\n\
        'missing or invalid endian');\n\
\n\
    assert.ok(offset !== undefined && offset !== null,\n\
        'missing offset');\n\
\n\
    assert.ok(offset + 3 < buffer.length,\n\
        'Trying to write beyond buffer length');\n\
\n\
    verifsint(value, 0x7fffffff, -0x80000000);\n\
  }\n\
\n\
  if (value >= 0) {\n\
    writeUInt32(buffer, value, offset, isBigEndian, noAssert);\n\
  } else {\n\
    writeUInt32(buffer, 0xffffffff + value + 1, offset, isBigEndian, noAssert);\n\
  }\n\
}\n\
\n\
Buffer.prototype.writeInt32LE = function(value, offset, noAssert) {\n\
  writeInt32(this, value, offset, false, noAssert);\n\
};\n\
\n\
Buffer.prototype.writeInt32BE = function(value, offset, noAssert) {\n\
  writeInt32(this, value, offset, true, noAssert);\n\
};\n\
\n\
function writeFloat(buffer, value, offset, isBigEndian, noAssert) {\n\
  if (!noAssert) {\n\
    assert.ok(value !== undefined && value !== null,\n\
        'missing value');\n\
\n\
    assert.ok(typeof (isBigEndian) === 'boolean',\n\
        'missing or invalid endian');\n\
\n\
    assert.ok(offset !== undefined && offset !== null,\n\
        'missing offset');\n\
\n\
    assert.ok(offset + 3 < buffer.length,\n\
        'Trying to write beyond buffer length');\n\
\n\
    verifIEEE754(value, 3.4028234663852886e+38, -3.4028234663852886e+38);\n\
  }\n\
\n\
  require('./buffer_ieee754').writeIEEE754(buffer, value, offset, isBigEndian,\n\
      23, 4);\n\
}\n\
\n\
Buffer.prototype.writeFloatLE = function(value, offset, noAssert) {\n\
  writeFloat(this, value, offset, false, noAssert);\n\
};\n\
\n\
Buffer.prototype.writeFloatBE = function(value, offset, noAssert) {\n\
  writeFloat(this, value, offset, true, noAssert);\n\
};\n\
\n\
function writeDouble(buffer, value, offset, isBigEndian, noAssert) {\n\
  if (!noAssert) {\n\
    assert.ok(value !== undefined && value !== null,\n\
        'missing value');\n\
\n\
    assert.ok(typeof (isBigEndian) === 'boolean',\n\
        'missing or invalid endian');\n\
\n\
    assert.ok(offset !== undefined && offset !== null,\n\
        'missing offset');\n\
\n\
    assert.ok(offset + 7 < buffer.length,\n\
        'Trying to write beyond buffer length');\n\
\n\
    verifIEEE754(value, 1.7976931348623157E+308, -1.7976931348623157E+308);\n\
  }\n\
\n\
  require('./buffer_ieee754').writeIEEE754(buffer, value, offset, isBigEndian,\n\
      52, 8);\n\
}\n\
\n\
Buffer.prototype.writeDoubleLE = function(value, offset, noAssert) {\n\
  writeDouble(this, value, offset, false, noAssert);\n\
};\n\
\n\
Buffer.prototype.writeDoubleBE = function(value, offset, noAssert) {\n\
  writeDouble(this, value, offset, true, noAssert);\n\
};\n\
\n\
},{\"./buffer_ieee754\":14,\"assert\":8,\"base64-js\":16}],16:[function(require,module,exports){\n\
(function (exports) {\n\
\t'use strict';\n\
\n\
\tvar lookup = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';\n\
\n\
\tfunction b64ToByteArray(b64) {\n\
\t\tvar i, j, l, tmp, placeHolders, arr;\n\
\t\n\
\t\tif (b64.length % 4 > 0) {\n\
\t\t\tthrow 'Invalid string. Length must be a multiple of 4';\n\
\t\t}\n\
\n\
\t\t// the number of equal signs (place holders)\n\
\t\t// if there are two placeholders, than the two characters before it\n\
\t\t// represent one byte\n\
\t\t// if there is only one, then the three characters before it represent 2 bytes\n\
\t\t// this is just a cheap hack to not do indexOf twice\n\
\t\tplaceHolders = b64.indexOf('=');\n\
\t\tplaceHolders = placeHolders > 0 ? b64.length - placeHolders : 0;\n\
\n\
\t\t// base64 is 4/3 + up to two characters of the original data\n\
\t\tarr = [];//new Uint8Array(b64.length * 3 / 4 - placeHolders);\n\
\n\
\t\t// if there are placeholders, only get up to the last complete 4 chars\n\
\t\tl = placeHolders > 0 ? b64.length - 4 : b64.length;\n\
\n\
\t\tfor (i = 0, j = 0; i < l; i += 4, j += 3) {\n\
\t\t\ttmp = (lookup.indexOf(b64[i]) << 18) | (lookup.indexOf(b64[i + 1]) << 12) | (lookup.indexOf(b64[i + 2]) << 6) | lookup.indexOf(b64[i + 3]);\n\
\t\t\tarr.push((tmp & 0xFF0000) >> 16);\n\
\t\t\tarr.push((tmp & 0xFF00) >> 8);\n\
\t\t\tarr.push(tmp & 0xFF);\n\
\t\t}\n\
\n\
\t\tif (placeHolders === 2) {\n\
\t\t\ttmp = (lookup.indexOf(b64[i]) << 2) | (lookup.indexOf(b64[i + 1]) >> 4);\n\
\t\t\tarr.push(tmp & 0xFF);\n\
\t\t} else if (placeHolders === 1) {\n\
\t\t\ttmp = (lookup.indexOf(b64[i]) << 10) | (lookup.indexOf(b64[i + 1]) << 4) | (lookup.indexOf(b64[i + 2]) >> 2);\n\
\t\t\tarr.push((tmp >> 8) & 0xFF);\n\
\t\t\tarr.push(tmp & 0xFF);\n\
\t\t}\n\
\n\
\t\treturn arr;\n\
\t}\n\
\n\
\tfunction uint8ToBase64(uint8) {\n\
\t\tvar i,\n\
\t\t\textraBytes = uint8.length % 3, // if we have 1 byte left, pad 2 bytes\n\
\t\t\toutput = \"\",\n\
\t\t\ttemp, length;\n\
\n\
\t\tfunction tripletToBase64 (num) {\n\
\t\t\treturn lookup[num >> 18 & 0x3F] + lookup[num >> 12 & 0x3F] + lookup[num >> 6 & 0x3F] + lookup[num & 0x3F];\n\
\t\t};\n\
\n\
\t\t// go through the array every three bytes, we'll deal with trailing stuff later\n\
\t\tfor (i = 0, length = uint8.length - extraBytes; i < length; i += 3) {\n\
\t\t\ttemp = (uint8[i] << 16) + (uint8[i + 1] << 8) + (uint8[i + 2]);\n\
\t\t\toutput += tripletToBase64(temp);\n\
\t\t}\n\
\n\
\t\t// pad the end with zeros, but make sure to not forget the extra bytes\n\
\t\tswitch (extraBytes) {\n\
\t\t\tcase 1:\n\
\t\t\t\ttemp = uint8[uint8.length - 1];\n\
\t\t\t\toutput += lookup[temp >> 2];\n\
\t\t\t\toutput += lookup[(temp << 4) & 0x3F];\n\
\t\t\t\toutput += '==';\n\
\t\t\t\tbreak;\n\
\t\t\tcase 2:\n\
\t\t\t\ttemp = (uint8[uint8.length - 2] << 8) + (uint8[uint8.length - 1]);\n\
\t\t\t\toutput += lookup[temp >> 10];\n\
\t\t\t\toutput += lookup[(temp >> 4) & 0x3F];\n\
\t\t\t\toutput += lookup[(temp << 2) & 0x3F];\n\
\t\t\t\toutput += '=';\n\
\t\t\t\tbreak;\n\
\t\t}\n\
\n\
\t\treturn output;\n\
\t}\n\
\n\
\tmodule.exports.toByteArray = b64ToByteArray;\n\
\tmodule.exports.fromByteArray = uint8ToBase64;\n\
}());\n\
\n\
},{}],17:[function(require,module,exports){\n\
require=(function(e,t,n,r){function i(r){if(!n[r]){if(!t[r]){if(e)return e(r);throw new Error(\"Cannot find module '\"+r+\"'\")}var s=n[r]={exports:{}};t[r][0](function(e){var n=t[r][1][e];return i(n?n:e)},s,s.exports)}return n[r].exports}for(var s=0;s<r.length;s++)i(r[s]);return i})(typeof require!==\"undefined\"&&require,{1:[function(require,module,exports){\n\
// UTILITY\n\
var util = require('util');\n\
var Buffer = require(\"buffer\").Buffer;\n\
var pSlice = Array.prototype.slice;\n\
\n\
function objectKeys(object) {\n\
  if (Object.keys) return Object.keys(object);\n\
  var result = [];\n\
  for (var name in object) {\n\
    if (Object.prototype.hasOwnProperty.call(object, name)) {\n\
      result.push(name);\n\
    }\n\
  }\n\
  return result;\n\
}\n\
\n\
// 1. The assert module provides functions that throw\n\
// AssertionError's when particular conditions are not met. The\n\
// assert module must conform to the following interface.\n\
\n\
var assert = module.exports = ok;\n\
\n\
// 2. The AssertionError is defined in assert.\n\
// new assert.AssertionError({ message: message,\n\
//                             actual: actual,\n\
//                             expected: expected })\n\
\n\
assert.AssertionError = function AssertionError(options) {\n\
  this.name = 'AssertionError';\n\
  this.message = options.message;\n\
  this.actual = options.actual;\n\
  this.expected = options.expected;\n\
  this.operator = options.operator;\n\
  var stackStartFunction = options.stackStartFunction || fail;\n\
\n\
  if (Error.captureStackTrace) {\n\
    Error.captureStackTrace(this, stackStartFunction);\n\
  }\n\
};\n\
util.inherits(assert.AssertionError, Error);\n\
\n\
function replacer(key, value) {\n\
  if (value === undefined) {\n\
    return '' + value;\n\
  }\n\
  if (typeof value === 'number' && (isNaN(value) || !isFinite(value))) {\n\
    return value.toString();\n\
  }\n\
  if (typeof value === 'function' || value instanceof RegExp) {\n\
    return value.toString();\n\
  }\n\
  return value;\n\
}\n\
\n\
function truncate(s, n) {\n\
  if (typeof s == 'string') {\n\
    return s.length < n ? s : s.slice(0, n);\n\
  } else {\n\
    return s;\n\
  }\n\
}\n\
\n\
assert.AssertionError.prototype.toString = function() {\n\
  if (this.message) {\n\
    return [this.name + ':', this.message].join(' ');\n\
  } else {\n\
    return [\n\
      this.name + ':',\n\
      truncate(JSON.stringify(this.actual, replacer), 128),\n\
      this.operator,\n\
      truncate(JSON.stringify(this.expected, replacer), 128)\n\
    ].join(' ');\n\
  }\n\
};\n\
\n\
// assert.AssertionError instanceof Error\n\
\n\
assert.AssertionError.__proto__ = Error.prototype;\n\
\n\
// At present only the three keys mentioned above are used and\n\
// understood by the spec. Implementations or sub modules can pass\n\
// other keys to the AssertionError's constructor - they will be\n\
// ignored.\n\
\n\
// 3. All of the following functions must throw an AssertionError\n\
// when a corresponding condition is not met, with a message that\n\
// may be undefined if not provided.  All assertion methods provide\n\
// both the actual and expected values to the assertion error for\n\
// display purposes.\n\
\n\
function fail(actual, expected, message, operator, stackStartFunction) {\n\
  throw new assert.AssertionError({\n\
    message: message,\n\
    actual: actual,\n\
    expected: expected,\n\
    operator: operator,\n\
    stackStartFunction: stackStartFunction\n\
  });\n\
}\n\
\n\
// EXTENSION! allows for well behaved errors defined elsewhere.\n\
assert.fail = fail;\n\
\n\
// 4. Pure assertion tests whether a value is truthy, as determined\n\
// by !!guard.\n\
// assert.ok(guard, message_opt);\n\
// This statement is equivalent to assert.equal(true, guard,\n\
// message_opt);. To test strictly for the value true, use\n\
// assert.strictEqual(true, guard, message_opt);.\n\
\n\
function ok(value, message) {\n\
  if (!!!value) fail(value, true, message, '==', assert.ok);\n\
}\n\
assert.ok = ok;\n\
\n\
// 5. The equality assertion tests shallow, coercive equality with\n\
// ==.\n\
// assert.equal(actual, expected, message_opt);\n\
\n\
assert.equal = function equal(actual, expected, message) {\n\
  if (actual != expected) fail(actual, expected, message, '==', assert.equal);\n\
};\n\
\n\
// 6. The non-equality assertion tests for whether two objects are not equal\n\
// with != assert.notEqual(actual, expected, message_opt);\n\
\n\
assert.notEqual = function notEqual(actual, expected, message) {\n\
  if (actual == expected) {\n\
    fail(actual, expected, message, '!=', assert.notEqual);\n\
  }\n\
};\n\
\n\
// 7. The equivalence assertion tests a deep equality relation.\n\
// assert.deepEqual(actual, expected, message_opt);\n\
\n\
assert.deepEqual = function deepEqual(actual, expected, message) {\n\
  if (!_deepEqual(actual, expected)) {\n\
    fail(actual, expected, message, 'deepEqual', assert.deepEqual);\n\
  }\n\
};\n\
\n\
function _deepEqual(actual, expected) {\n\
  // 7.1. All identical values are equivalent, as determined by ===.\n\
  if (actual === expected) {\n\
    return true;\n\
\n\
  } else if (Buffer.isBuffer(actual) && Buffer.isBuffer(expected)) {\n\
    if (actual.length != expected.length) return false;\n\
\n\
    for (var i = 0; i < actual.length; i++) {\n\
      if (actual[i] !== expected[i]) return false;\n\
    }\n\
\n\
    return true;\n\
\n\
  // 7.2. If the expected value is a Date object, the actual value is\n\
  // equivalent if it is also a Date object that refers to the same time.\n\
  } else if (actual instanceof Date && expected instanceof Date) {\n\
    return actual.getTime() === expected.getTime();\n\
\n\
  // 7.3. Other pairs that do not both pass typeof value == 'object',\n\
  // equivalence is determined by ==.\n\
  } else if (typeof actual != 'object' && typeof expected != 'object') {\n\
    return actual == expected;\n\
\n\
  // 7.4. For all other Object pairs, including Array objects, equivalence is\n\
  // determined by having the same number of owned properties (as verified\n\
  // with Object.prototype.hasOwnProperty.call), the same set of keys\n\
  // (although not necessarily the same order), equivalent values for every\n\
  // corresponding key, and an identical 'prototype' property. Note: this\n\
  // accounts for both named and indexed properties on Arrays.\n\
  } else {\n\
    return objEquiv(actual, expected);\n\
  }\n\
}\n\
\n\
function isUndefinedOrNull(value) {\n\
  return value === null || value === undefined;\n\
}\n\
\n\
function isArguments(object) {\n\
  return Object.prototype.toString.call(object) == '[object Arguments]';\n\
}\n\
\n\
function objEquiv(a, b) {\n\
  if (isUndefinedOrNull(a) || isUndefinedOrNull(b))\n\
    return false;\n\
  // an identical 'prototype' property.\n\
  if (a.prototype !== b.prototype) return false;\n\
  //~~~I've managed to break Object.keys through screwy arguments passing.\n\
  //   Converting to array solves the problem.\n\
  if (isArguments(a)) {\n\
    if (!isArguments(b)) {\n\
      return false;\n\
    }\n\
    a = pSlice.call(a);\n\
    b = pSlice.call(b);\n\
    return _deepEqual(a, b);\n\
  }\n\
  try {\n\
    var ka = objectKeys(a),\n\
        kb = objectKeys(b),\n\
        key, i;\n\
  } catch (e) {//happens when one is a string literal and the other isn't\n\
    return false;\n\
  }\n\
  // having the same number of owned properties (keys incorporates\n\
  // hasOwnProperty)\n\
  if (ka.length != kb.length)\n\
    return false;\n\
  //the same set of keys (although not necessarily the same order),\n\
  ka.sort();\n\
  kb.sort();\n\
  //~~~cheap key test\n\
  for (i = ka.length - 1; i >= 0; i--) {\n\
    if (ka[i] != kb[i])\n\
      return false;\n\
  }\n\
  //equivalent values for every corresponding key, and\n\
  //~~~possibly expensive deep test\n\
  for (i = ka.length - 1; i >= 0; i--) {\n\
    key = ka[i];\n\
    if (!_deepEqual(a[key], b[key])) return false;\n\
  }\n\
  return true;\n\
}\n\
\n\
// 8. The non-equivalence assertion tests for any deep inequality.\n\
// assert.notDeepEqual(actual, expected, message_opt);\n\
\n\
assert.notDeepEqual = function notDeepEqual(actual, expected, message) {\n\
  if (_deepEqual(actual, expected)) {\n\
    fail(actual, expected, message, 'notDeepEqual', assert.notDeepEqual);\n\
  }\n\
};\n\
\n\
// 9. The strict equality assertion tests strict equality, as determined by ===.\n\
// assert.strictEqual(actual, expected, message_opt);\n\
\n\
assert.strictEqual = function strictEqual(actual, expected, message) {\n\
  if (actual !== expected) {\n\
    fail(actual, expected, message, '===', assert.strictEqual);\n\
  }\n\
};\n\
\n\
// 10. The strict non-equality assertion tests for strict inequality, as\n\
// determined by !==.  assert.notStrictEqual(actual, expected, message_opt);\n\
\n\
assert.notStrictEqual = function notStrictEqual(actual, expected, message) {\n\
  if (actual === expected) {\n\
    fail(actual, expected, message, '!==', assert.notStrictEqual);\n\
  }\n\
};\n\
\n\
function expectedException(actual, expected) {\n\
  if (!actual || !expected) {\n\
    return false;\n\
  }\n\
\n\
  if (expected instanceof RegExp) {\n\
    return expected.test(actual);\n\
  } else if (actual instanceof expected) {\n\
    return true;\n\
  } else if (expected.call({}, actual) === true) {\n\
    return true;\n\
  }\n\
\n\
  return false;\n\
}\n\
\n\
function _throws(shouldThrow, block, expected, message) {\n\
  var actual;\n\
\n\
  if (typeof expected === 'string') {\n\
    message = expected;\n\
    expected = null;\n\
  }\n\
\n\
  try {\n\
    block();\n\
  } catch (e) {\n\
    actual = e;\n\
  }\n\
\n\
  message = (expected && expected.name ? ' (' + expected.name + ').' : '.') +\n\
            (message ? ' ' + message : '.');\n\
\n\
  if (shouldThrow && !actual) {\n\
    fail('Missing expected exception' + message);\n\
  }\n\
\n\
  if (!shouldThrow && expectedException(actual, expected)) {\n\
    fail('Got unwanted exception' + message);\n\
  }\n\
\n\
  if ((shouldThrow && actual && expected &&\n\
      !expectedException(actual, expected)) || (!shouldThrow && actual)) {\n\
    throw actual;\n\
  }\n\
}\n\
\n\
// 11. Expected to throw an error:\n\
// assert.throws(block, Error_opt, message_opt);\n\
\n\
assert.throws = function(block, /*optional*/error, /*optional*/message) {\n\
  _throws.apply(this, [true].concat(pSlice.call(arguments)));\n\
};\n\
\n\
// EXTENSION! This is annoying to write outside this module.\n\
assert.doesNotThrow = function(block, /*optional*/error, /*optional*/message) {\n\
  _throws.apply(this, [false].concat(pSlice.call(arguments)));\n\
};\n\
\n\
assert.ifError = function(err) { if (err) {throw err;}};\n\
\n\
},{\"util\":2,\"buffer\":3}],2:[function(require,module,exports){\n\
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
},{\"events\":4}],5:[function(require,module,exports){\n\
exports.readIEEE754 = function(buffer, offset, isBE, mLen, nBytes) {\n\
  var e, m,\n\
      eLen = nBytes * 8 - mLen - 1,\n\
      eMax = (1 << eLen) - 1,\n\
      eBias = eMax >> 1,\n\
      nBits = -7,\n\
      i = isBE ? 0 : (nBytes - 1),\n\
      d = isBE ? 1 : -1,\n\
      s = buffer[offset + i];\n\
\n\
  i += d;\n\
\n\
  e = s & ((1 << (-nBits)) - 1);\n\
  s >>= (-nBits);\n\
  nBits += eLen;\n\
  for (; nBits > 0; e = e * 256 + buffer[offset + i], i += d, nBits -= 8);\n\
\n\
  m = e & ((1 << (-nBits)) - 1);\n\
  e >>= (-nBits);\n\
  nBits += mLen;\n\
  for (; nBits > 0; m = m * 256 + buffer[offset + i], i += d, nBits -= 8);\n\
\n\
  if (e === 0) {\n\
    e = 1 - eBias;\n\
  } else if (e === eMax) {\n\
    return m ? NaN : ((s ? -1 : 1) * Infinity);\n\
  } else {\n\
    m = m + Math.pow(2, mLen);\n\
    e = e - eBias;\n\
  }\n\
  return (s ? -1 : 1) * m * Math.pow(2, e - mLen);\n\
};\n\
\n\
exports.writeIEEE754 = function(buffer, value, offset, isBE, mLen, nBytes) {\n\
  var e, m, c,\n\
      eLen = nBytes * 8 - mLen - 1,\n\
      eMax = (1 << eLen) - 1,\n\
      eBias = eMax >> 1,\n\
      rt = (mLen === 23 ? Math.pow(2, -24) - Math.pow(2, -77) : 0),\n\
      i = isBE ? (nBytes - 1) : 0,\n\
      d = isBE ? -1 : 1,\n\
      s = value < 0 || (value === 0 && 1 / value < 0) ? 1 : 0;\n\
\n\
  value = Math.abs(value);\n\
\n\
  if (isNaN(value) || value === Infinity) {\n\
    m = isNaN(value) ? 1 : 0;\n\
    e = eMax;\n\
  } else {\n\
    e = Math.floor(Math.log(value) / Math.LN2);\n\
    if (value * (c = Math.pow(2, -e)) < 1) {\n\
      e--;\n\
      c *= 2;\n\
    }\n\
    if (e + eBias >= 1) {\n\
      value += rt / c;\n\
    } else {\n\
      value += rt * Math.pow(2, 1 - eBias);\n\
    }\n\
    if (value * c >= 2) {\n\
      e++;\n\
      c /= 2;\n\
    }\n\
\n\
    if (e + eBias >= eMax) {\n\
      m = 0;\n\
      e = eMax;\n\
    } else if (e + eBias >= 1) {\n\
      m = (value * c - 1) * Math.pow(2, mLen);\n\
      e = e + eBias;\n\
    } else {\n\
      m = value * Math.pow(2, eBias - 1) * Math.pow(2, mLen);\n\
      e = 0;\n\
    }\n\
  }\n\
\n\
  for (; mLen >= 8; buffer[offset + i] = m & 0xff, i += d, m /= 256, mLen -= 8);\n\
\n\
  e = (e << mLen) | m;\n\
  eLen += mLen;\n\
  for (; eLen > 0; buffer[offset + i] = e & 0xff, i += d, e /= 256, eLen -= 8);\n\
\n\
  buffer[offset + i - d] |= s * 128;\n\
};\n\
\n\
},{}],6:[function(require,module,exports){\n\
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
},{}],4:[function(require,module,exports){\n\
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
},{\"__browserify_process\":6}],\"buffer-browserify\":[function(require,module,exports){\n\
module.exports=require('q9TxCC');\n\
},{}],\"q9TxCC\":[function(require,module,exports){\n\
function SlowBuffer (size) {\n\
    this.length = size;\n\
};\n\
\n\
var assert = require('assert');\n\
\n\
exports.INSPECT_MAX_BYTES = 50;\n\
\n\
\n\
function toHex(n) {\n\
  if (n < 16) return '0' + n.toString(16);\n\
  return n.toString(16);\n\
}\n\
\n\
function utf8ToBytes(str) {\n\
  var byteArray = [];\n\
  for (var i = 0; i < str.length; i++)\n\
    if (str.charCodeAt(i) <= 0x7F)\n\
      byteArray.push(str.charCodeAt(i));\n\
    else {\n\
      var h = encodeURIComponent(str.charAt(i)).substr(1).split('%');\n\
      for (var j = 0; j < h.length; j++)\n\
        byteArray.push(parseInt(h[j], 16));\n\
    }\n\
\n\
  return byteArray;\n\
}\n\
\n\
function asciiToBytes(str) {\n\
  var byteArray = []\n\
  for (var i = 0; i < str.length; i++ )\n\
    // Node's code seems to be doing this and not & 0x7F..\n\
    byteArray.push( str.charCodeAt(i) & 0xFF );\n\
\n\
  return byteArray;\n\
}\n\
\n\
function base64ToBytes(str) {\n\
  return require(\"base64-js\").toByteArray(str);\n\
}\n\
\n\
SlowBuffer.byteLength = function (str, encoding) {\n\
  switch (encoding || \"utf8\") {\n\
    case 'hex':\n\
      return str.length / 2;\n\
\n\
    case 'utf8':\n\
    case 'utf-8':\n\
      return utf8ToBytes(str).length;\n\
\n\
    case 'ascii':\n\
    case 'binary':\n\
      return str.length;\n\
\n\
    case 'base64':\n\
      return base64ToBytes(str).length;\n\
\n\
    default:\n\
      throw new Error('Unknown encoding');\n\
  }\n\
};\n\
\n\
function blitBuffer(src, dst, offset, length) {\n\
  var pos, i = 0;\n\
  while (i < length) {\n\
    if ((i+offset >= dst.length) || (i >= src.length))\n\
      break;\n\
\n\
    dst[i + offset] = src[i];\n\
    i++;\n\
  }\n\
  return i;\n\
}\n\
\n\
SlowBuffer.prototype.utf8Write = function (string, offset, length) {\n\
  var bytes, pos;\n\
  return SlowBuffer._charsWritten =  blitBuffer(utf8ToBytes(string), this, offset, length);\n\
};\n\
\n\
SlowBuffer.prototype.asciiWrite = function (string, offset, length) {\n\
  var bytes, pos;\n\
  return SlowBuffer._charsWritten =  blitBuffer(asciiToBytes(string), this, offset, length);\n\
};\n\
\n\
SlowBuffer.prototype.binaryWrite = SlowBuffer.prototype.asciiWrite;\n\
\n\
SlowBuffer.prototype.base64Write = function (string, offset, length) {\n\
  var bytes, pos;\n\
  return SlowBuffer._charsWritten = blitBuffer(base64ToBytes(string), this, offset, length);\n\
};\n\
\n\
SlowBuffer.prototype.base64Slice = function (start, end) {\n\
  var bytes = Array.prototype.slice.apply(this, arguments)\n\
  return require(\"base64-js\").fromByteArray(bytes);\n\
}\n\
\n\
function decodeUtf8Char(str) {\n\
  try {\n\
    return decodeURIComponent(str);\n\
  } catch (err) {\n\
    return String.fromCharCode(0xFFFD); // UTF 8 invalid char\n\
  }\n\
}\n\
\n\
SlowBuffer.prototype.utf8Slice = function () {\n\
  var bytes = Array.prototype.slice.apply(this, arguments);\n\
  var res = \"\";\n\
  var tmp = \"\";\n\
  var i = 0;\n\
  while (i < bytes.length) {\n\
    if (bytes[i] <= 0x7F) {\n\
      res += decodeUtf8Char(tmp) + String.fromCharCode(bytes[i]);\n\
      tmp = \"\";\n\
    } else\n\
      tmp += \"%\" + bytes[i].toString(16);\n\
\n\
    i++;\n\
  }\n\
\n\
  return res + decodeUtf8Char(tmp);\n\
}\n\
\n\
SlowBuffer.prototype.asciiSlice = function () {\n\
  var bytes = Array.prototype.slice.apply(this, arguments);\n\
  var ret = \"\";\n\
  for (var i = 0; i < bytes.length; i++)\n\
    ret += String.fromCharCode(bytes[i]);\n\
  return ret;\n\
}\n\
\n\
SlowBuffer.prototype.binarySlice = SlowBuffer.prototype.asciiSlice;\n\
\n\
SlowBuffer.prototype.inspect = function() {\n\
  var out = [],\n\
      len = this.length;\n\
  for (var i = 0; i < len; i++) {\n\
    out[i] = toHex(this[i]);\n\
    if (i == exports.INSPECT_MAX_BYTES) {\n\
      out[i + 1] = '...';\n\
      break;\n\
    }\n\
  }\n\
  return '<SlowBuffer ' + out.join(' ') + '>';\n\
};\n\
\n\
\n\
SlowBuffer.prototype.hexSlice = function(start, end) {\n\
  var len = this.length;\n\
\n\
  if (!start || start < 0) start = 0;\n\
  if (!end || end < 0 || end > len) end = len;\n\
\n\
  var out = '';\n\
  for (var i = start; i < end; i++) {\n\
    out += toHex(this[i]);\n\
  }\n\
  return out;\n\
};\n\
\n\
\n\
SlowBuffer.prototype.toString = function(encoding, start, end) {\n\
  encoding = String(encoding || 'utf8').toLowerCase();\n\
  start = +start || 0;\n\
  if (typeof end == 'undefined') end = this.length;\n\
\n\
  // Fastpath empty strings\n\
  if (+end == start) {\n\
    return '';\n\
  }\n\
\n\
  switch (encoding) {\n\
    case 'hex':\n\
      return this.hexSlice(start, end);\n\
\n\
    case 'utf8':\n\
    case 'utf-8':\n\
      return this.utf8Slice(start, end);\n\
\n\
    case 'ascii':\n\
      return this.asciiSlice(start, end);\n\
\n\
    case 'binary':\n\
      return this.binarySlice(start, end);\n\
\n\
    case 'base64':\n\
      return this.base64Slice(start, end);\n\
\n\
    case 'ucs2':\n\
    case 'ucs-2':\n\
      return this.ucs2Slice(start, end);\n\
\n\
    default:\n\
      throw new Error('Unknown encoding');\n\
  }\n\
};\n\
\n\
\n\
SlowBuffer.prototype.hexWrite = function(string, offset, length) {\n\
  offset = +offset || 0;\n\
  var remaining = this.length - offset;\n\
  if (!length) {\n\
    length = remaining;\n\
  } else {\n\
    length = +length;\n\
    if (length > remaining) {\n\
      length = remaining;\n\
    }\n\
  }\n\
\n\
  // must be an even number of digits\n\
  var strLen = string.length;\n\
  if (strLen % 2) {\n\
    throw new Error('Invalid hex string');\n\
  }\n\
  if (length > strLen / 2) {\n\
    length = strLen / 2;\n\
  }\n\
  for (var i = 0; i < length; i++) {\n\
    var byte = parseInt(string.substr(i * 2, 2), 16);\n\
    if (isNaN(byte)) throw new Error('Invalid hex string');\n\
    this[offset + i] = byte;\n\
  }\n\
  SlowBuffer._charsWritten = i * 2;\n\
  return i;\n\
};\n\
\n\
\n\
SlowBuffer.prototype.write = function(string, offset, length, encoding) {\n\
  // Support both (string, offset, length, encoding)\n\
  // and the legacy (string, encoding, offset, length)\n\
  if (isFinite(offset)) {\n\
    if (!isFinite(length)) {\n\
      encoding = length;\n\
      length = undefined;\n\
    }\n\
  } else {  // legacy\n\
    var swap = encoding;\n\
    encoding = offset;\n\
    offset = length;\n\
    length = swap;\n\
  }\n\
\n\
  offset = +offset || 0;\n\
  var remaining = this.length - offset;\n\
  if (!length) {\n\
    length = remaining;\n\
  } else {\n\
    length = +length;\n\
    if (length > remaining) {\n\
      length = remaining;\n\
    }\n\
  }\n\
  encoding = String(encoding || 'utf8').toLowerCase();\n\
\n\
  switch (encoding) {\n\
    case 'hex':\n\
      return this.hexWrite(string, offset, length);\n\
\n\
    case 'utf8':\n\
    case 'utf-8':\n\
      return this.utf8Write(string, offset, length);\n\
\n\
    case 'ascii':\n\
      return this.asciiWrite(string, offset, length);\n\
\n\
    case 'binary':\n\
      return this.binaryWrite(string, offset, length);\n\
\n\
    case 'base64':\n\
      return this.base64Write(string, offset, length);\n\
\n\
    case 'ucs2':\n\
    case 'ucs-2':\n\
      return this.ucs2Write(string, offset, length);\n\
\n\
    default:\n\
      throw new Error('Unknown encoding');\n\
  }\n\
};\n\
\n\
\n\
// slice(start, end)\n\
SlowBuffer.prototype.slice = function(start, end) {\n\
  if (end === undefined) end = this.length;\n\
\n\
  if (end > this.length) {\n\
    throw new Error('oob');\n\
  }\n\
  if (start > end) {\n\
    throw new Error('oob');\n\
  }\n\
\n\
  return new Buffer(this, end - start, +start);\n\
};\n\
\n\
SlowBuffer.prototype.copy = function(target, targetstart, sourcestart, sourceend) {\n\
  var temp = [];\n\
  for (var i=sourcestart; i<sourceend; i++) {\n\
    assert.ok(typeof this[i] !== 'undefined', \"copying undefined buffer bytes!\");\n\
    temp.push(this[i]);\n\
  }\n\
\n\
  for (var i=targetstart; i<targetstart+temp.length; i++) {\n\
    target[i] = temp[i-targetstart];\n\
  }\n\
};\n\
\n\
SlowBuffer.prototype.fill = function(value, start, end) {\n\
  if (end > this.length) {\n\
    throw new Error('oob');\n\
  }\n\
  if (start > end) {\n\
    throw new Error('oob');\n\
  }\n\
\n\
  for (var i = start; i < end; i++) {\n\
    this[i] = value;\n\
  }\n\
}\n\
\n\
function coerce(length) {\n\
  // Coerce length to a number (possibly NaN), round up\n\
  // in case it's fractional (e.g. 123.456) then do a\n\
  // double negate to coerce a NaN to 0. Easy, right?\n\
  length = ~~Math.ceil(+length);\n\
  return length < 0 ? 0 : length;\n\
}\n\
\n\
\n\
// Buffer\n\
\n\
function Buffer(subject, encoding, offset) {\n\
  if (!(this instanceof Buffer)) {\n\
    return new Buffer(subject, encoding, offset);\n\
  }\n\
\n\
  var type;\n\
\n\
  // Are we slicing?\n\
  if (typeof offset === 'number') {\n\
    this.length = coerce(encoding);\n\
    this.parent = subject;\n\
    this.offset = offset;\n\
  } else {\n\
    // Find the length\n\
    switch (type = typeof subject) {\n\
      case 'number':\n\
        this.length = coerce(subject);\n\
        break;\n\
\n\
      case 'string':\n\
        this.length = Buffer.byteLength(subject, encoding);\n\
        break;\n\
\n\
      case 'object': // Assume object is an array\n\
        this.length = coerce(subject.length);\n\
        break;\n\
\n\
      default:\n\
        throw new Error('First argument needs to be a number, ' +\n\
                        'array or string.');\n\
    }\n\
\n\
    if (this.length > Buffer.poolSize) {\n\
      // Big buffer, just alloc one.\n\
      this.parent = new SlowBuffer(this.length);\n\
      this.offset = 0;\n\
\n\
    } else {\n\
      // Small buffer.\n\
      if (!pool || pool.length - pool.used < this.length) allocPool();\n\
      this.parent = pool;\n\
      this.offset = pool.used;\n\
      pool.used += this.length;\n\
    }\n\
\n\
    // Treat array-ish objects as a byte array.\n\
    if (isArrayIsh(subject)) {\n\
      for (var i = 0; i < this.length; i++) {\n\
        if (subject instanceof Buffer) {\n\
          this.parent[i + this.offset] = subject.readUInt8(i);\n\
        }\n\
        else {\n\
          this.parent[i + this.offset] = subject[i];\n\
        }\n\
      }\n\
    } else if (type == 'string') {\n\
      // We are a string\n\
      this.length = this.write(subject, 0, encoding);\n\
    }\n\
  }\n\
\n\
}\n\
\n\
function isArrayIsh(subject) {\n\
  return Array.isArray(subject) || Buffer.isBuffer(subject) ||\n\
         subject && typeof subject === 'object' &&\n\
         typeof subject.length === 'number';\n\
}\n\
\n\
exports.SlowBuffer = SlowBuffer;\n\
exports.Buffer = Buffer;\n\
\n\
Buffer.poolSize = 8 * 1024;\n\
var pool;\n\
\n\
function allocPool() {\n\
  pool = new SlowBuffer(Buffer.poolSize);\n\
  pool.used = 0;\n\
}\n\
\n\
\n\
// Static methods\n\
Buffer.isBuffer = function isBuffer(b) {\n\
  return b instanceof Buffer || b instanceof SlowBuffer;\n\
};\n\
\n\
Buffer.concat = function (list, totalLength) {\n\
  if (!Array.isArray(list)) {\n\
    throw new Error(\"Usage: Buffer.concat(list, [totalLength])\\n\
 \\\n\
      list should be an Array.\");\n\
  }\n\
\n\
  if (list.length === 0) {\n\
    return new Buffer(0);\n\
  } else if (list.length === 1) {\n\
    return list[0];\n\
  }\n\
\n\
  if (typeof totalLength !== 'number') {\n\
    totalLength = 0;\n\
    for (var i = 0; i < list.length; i++) {\n\
      var buf = list[i];\n\
      totalLength += buf.length;\n\
    }\n\
  }\n\
\n\
  var buffer = new Buffer(totalLength);\n\
  var pos = 0;\n\
  for (var i = 0; i < list.length; i++) {\n\
    var buf = list[i];\n\
    buf.copy(buffer, pos);\n\
    pos += buf.length;\n\
  }\n\
  return buffer;\n\
};\n\
\n\
// Inspect\n\
Buffer.prototype.inspect = function inspect() {\n\
  var out = [],\n\
      len = this.length;\n\
\n\
  for (var i = 0; i < len; i++) {\n\
    out[i] = toHex(this.parent[i + this.offset]);\n\
    if (i == exports.INSPECT_MAX_BYTES) {\n\
      out[i + 1] = '...';\n\
      break;\n\
    }\n\
  }\n\
\n\
  return '<Buffer ' + out.join(' ') + '>';\n\
};\n\
\n\
\n\
Buffer.prototype.get = function get(i) {\n\
  if (i < 0 || i >= this.length) throw new Error('oob');\n\
  return this.parent[this.offset + i];\n\
};\n\
\n\
\n\
Buffer.prototype.set = function set(i, v) {\n\
  if (i < 0 || i >= this.length) throw new Error('oob');\n\
  return this.parent[this.offset + i] = v;\n\
};\n\
\n\
\n\
// write(string, offset = 0, length = buffer.length-offset, encoding = 'utf8')\n\
Buffer.prototype.write = function(string, offset, length, encoding) {\n\
  // Support both (string, offset, length, encoding)\n\
  // and the legacy (string, encoding, offset, length)\n\
  if (isFinite(offset)) {\n\
    if (!isFinite(length)) {\n\
      encoding = length;\n\
      length = undefined;\n\
    }\n\
  } else {  // legacy\n\
    var swap = encoding;\n\
    encoding = offset;\n\
    offset = length;\n\
    length = swap;\n\
  }\n\
\n\
  offset = +offset || 0;\n\
  var remaining = this.length - offset;\n\
  if (!length) {\n\
    length = remaining;\n\
  } else {\n\
    length = +length;\n\
    if (length > remaining) {\n\
      length = remaining;\n\
    }\n\
  }\n\
  encoding = String(encoding || 'utf8').toLowerCase();\n\
\n\
  var ret;\n\
  switch (encoding) {\n\
    case 'hex':\n\
      ret = this.parent.hexWrite(string, this.offset + offset, length);\n\
      break;\n\
\n\
    case 'utf8':\n\
    case 'utf-8':\n\
      ret = this.parent.utf8Write(string, this.offset + offset, length);\n\
      break;\n\
\n\
    case 'ascii':\n\
      ret = this.parent.asciiWrite(string, this.offset + offset, length);\n\
      break;\n\
\n\
    case 'binary':\n\
      ret = this.parent.binaryWrite(string, this.offset + offset, length);\n\
      break;\n\
\n\
    case 'base64':\n\
      // Warning: maxLength not taken into account in base64Write\n\
      ret = this.parent.base64Write(string, this.offset + offset, length);\n\
      break;\n\
\n\
    case 'ucs2':\n\
    case 'ucs-2':\n\
      ret = this.parent.ucs2Write(string, this.offset + offset, length);\n\
      break;\n\
\n\
    default:\n\
      throw new Error('Unknown encoding');\n\
  }\n\
\n\
  Buffer._charsWritten = SlowBuffer._charsWritten;\n\
\n\
  return ret;\n\
};\n\
\n\
\n\
// toString(encoding, start=0, end=buffer.length)\n\
Buffer.prototype.toString = function(encoding, start, end) {\n\
  encoding = String(encoding || 'utf8').toLowerCase();\n\
\n\
  if (typeof start == 'undefined' || start < 0) {\n\
    start = 0;\n\
  } else if (start > this.length) {\n\
    start = this.length;\n\
  }\n\
\n\
  if (typeof end == 'undefined' || end > this.length) {\n\
    end = this.length;\n\
  } else if (end < 0) {\n\
    end = 0;\n\
  }\n\
\n\
  start = start + this.offset;\n\
  end = end + this.offset;\n\
\n\
  switch (encoding) {\n\
    case 'hex':\n\
      return this.parent.hexSlice(start, end);\n\
\n\
    case 'utf8':\n\
    case 'utf-8':\n\
      return this.parent.utf8Slice(start, end);\n\
\n\
    case 'ascii':\n\
      return this.parent.asciiSlice(start, end);\n\
\n\
    case 'binary':\n\
      return this.parent.binarySlice(start, end);\n\
\n\
    case 'base64':\n\
      return this.parent.base64Slice(start, end);\n\
\n\
    case 'ucs2':\n\
    case 'ucs-2':\n\
      return this.parent.ucs2Slice(start, end);\n\
\n\
    default:\n\
      throw new Error('Unknown encoding');\n\
  }\n\
};\n\
\n\
\n\
// byteLength\n\
Buffer.byteLength = SlowBuffer.byteLength;\n\
\n\
\n\
// fill(value, start=0, end=buffer.length)\n\
Buffer.prototype.fill = function fill(value, start, end) {\n\
  value || (value = 0);\n\
  start || (start = 0);\n\
  end || (end = this.length);\n\
\n\
  if (typeof value === 'string') {\n\
    value = value.charCodeAt(0);\n\
  }\n\
  if (!(typeof value === 'number') || isNaN(value)) {\n\
    throw new Error('value is not a number');\n\
  }\n\
\n\
  if (end < start) throw new Error('end < start');\n\
\n\
  // Fill 0 bytes; we're done\n\
  if (end === start) return 0;\n\
  if (this.length == 0) return 0;\n\
\n\
  if (start < 0 || start >= this.length) {\n\
    throw new Error('start out of bounds');\n\
  }\n\
\n\
  if (end < 0 || end > this.length) {\n\
    throw new Error('end out of bounds');\n\
  }\n\
\n\
  return this.parent.fill(value,\n\
                          start + this.offset,\n\
                          end + this.offset);\n\
};\n\
\n\
\n\
// copy(targetBuffer, targetStart=0, sourceStart=0, sourceEnd=buffer.length)\n\
Buffer.prototype.copy = function(target, target_start, start, end) {\n\
  var source = this;\n\
  start || (start = 0);\n\
  end || (end = this.length);\n\
  target_start || (target_start = 0);\n\
\n\
  if (end < start) throw new Error('sourceEnd < sourceStart');\n\
\n\
  // Copy 0 bytes; we're done\n\
  if (end === start) return 0;\n\
  if (target.length == 0 || source.length == 0) return 0;\n\
\n\
  if (target_start < 0 || target_start >= target.length) {\n\
    throw new Error('targetStart out of bounds');\n\
  }\n\
\n\
  if (start < 0 || start >= source.length) {\n\
    throw new Error('sourceStart out of bounds');\n\
  }\n\
\n\
  if (end < 0 || end > source.length) {\n\
    throw new Error('sourceEnd out of bounds');\n\
  }\n\
\n\
  // Are we oob?\n\
  if (end > this.length) {\n\
    end = this.length;\n\
  }\n\
\n\
  if (target.length - target_start < end - start) {\n\
    end = target.length - target_start + start;\n\
  }\n\
\n\
  return this.parent.copy(target.parent,\n\
                          target_start + target.offset,\n\
                          start + this.offset,\n\
                          end + this.offset);\n\
};\n\
\n\
\n\
// slice(start, end)\n\
Buffer.prototype.slice = function(start, end) {\n\
  if (end === undefined) end = this.length;\n\
  if (end > this.length) throw new Error('oob');\n\
  if (start > end) throw new Error('oob');\n\
\n\
  return new Buffer(this.parent, end - start, +start + this.offset);\n\
};\n\
\n\
\n\
// Legacy methods for backwards compatibility.\n\
\n\
Buffer.prototype.utf8Slice = function(start, end) {\n\
  return this.toString('utf8', start, end);\n\
};\n\
\n\
Buffer.prototype.binarySlice = function(start, end) {\n\
  return this.toString('binary', start, end);\n\
};\n\
\n\
Buffer.prototype.asciiSlice = function(start, end) {\n\
  return this.toString('ascii', start, end);\n\
};\n\
\n\
Buffer.prototype.utf8Write = function(string, offset) {\n\
  return this.write(string, offset, 'utf8');\n\
};\n\
\n\
Buffer.prototype.binaryWrite = function(string, offset) {\n\
  return this.write(string, offset, 'binary');\n\
};\n\
\n\
Buffer.prototype.asciiWrite = function(string, offset) {\n\
  return this.write(string, offset, 'ascii');\n\
};\n\
\n\
Buffer.prototype.readUInt8 = function(offset, noAssert) {\n\
  var buffer = this;\n\
\n\
  if (!noAssert) {\n\
    assert.ok(offset !== undefined && offset !== null,\n\
        'missing offset');\n\
\n\
    assert.ok(offset < buffer.length,\n\
        'Trying to read beyond buffer length');\n\
  }\n\
\n\
  if (offset >= buffer.length) return;\n\
\n\
  return buffer.parent[buffer.offset + offset];\n\
};\n\
\n\
function readUInt16(buffer, offset, isBigEndian, noAssert) {\n\
  var val = 0;\n\
\n\
\n\
  if (!noAssert) {\n\
    assert.ok(typeof (isBigEndian) === 'boolean',\n\
        'missing or invalid endian');\n\
\n\
    assert.ok(offset !== undefined && offset !== null,\n\
        'missing offset');\n\
\n\
    assert.ok(offset + 1 < buffer.length,\n\
        'Trying to read beyond buffer length');\n\
  }\n\
\n\
  if (offset >= buffer.length) return 0;\n\
\n\
  if (isBigEndian) {\n\
    val = buffer.parent[buffer.offset + offset] << 8;\n\
    if (offset + 1 < buffer.length) {\n\
      val |= buffer.parent[buffer.offset + offset + 1];\n\
    }\n\
  } else {\n\
    val = buffer.parent[buffer.offset + offset];\n\
    if (offset + 1 < buffer.length) {\n\
      val |= buffer.parent[buffer.offset + offset + 1] << 8;\n\
    }\n\
  }\n\
\n\
  return val;\n\
}\n\
\n\
Buffer.prototype.readUInt16LE = function(offset, noAssert) {\n\
  return readUInt16(this, offset, false, noAssert);\n\
};\n\
\n\
Buffer.prototype.readUInt16BE = function(offset, noAssert) {\n\
  return readUInt16(this, offset, true, noAssert);\n\
};\n\
\n\
function readUInt32(buffer, offset, isBigEndian, noAssert) {\n\
  var val = 0;\n\
\n\
  if (!noAssert) {\n\
    assert.ok(typeof (isBigEndian) === 'boolean',\n\
        'missing or invalid endian');\n\
\n\
    assert.ok(offset !== undefined && offset !== null,\n\
        'missing offset');\n\
\n\
    assert.ok(offset + 3 < buffer.length,\n\
        'Trying to read beyond buffer length');\n\
  }\n\
\n\
  if (offset >= buffer.length) return 0;\n\
\n\
  if (isBigEndian) {\n\
    if (offset + 1 < buffer.length)\n\
      val = buffer.parent[buffer.offset + offset + 1] << 16;\n\
    if (offset + 2 < buffer.length)\n\
      val |= buffer.parent[buffer.offset + offset + 2] << 8;\n\
    if (offset + 3 < buffer.length)\n\
      val |= buffer.parent[buffer.offset + offset + 3];\n\
    val = val + (buffer.parent[buffer.offset + offset] << 24 >>> 0);\n\
  } else {\n\
    if (offset + 2 < buffer.length)\n\
      val = buffer.parent[buffer.offset + offset + 2] << 16;\n\
    if (offset + 1 < buffer.length)\n\
      val |= buffer.parent[buffer.offset + offset + 1] << 8;\n\
    val |= buffer.parent[buffer.offset + offset];\n\
    if (offset + 3 < buffer.length)\n\
      val = val + (buffer.parent[buffer.offset + offset + 3] << 24 >>> 0);\n\
  }\n\
\n\
  return val;\n\
}\n\
\n\
Buffer.prototype.readUInt32LE = function(offset, noAssert) {\n\
  return readUInt32(this, offset, false, noAssert);\n\
};\n\
\n\
Buffer.prototype.readUInt32BE = function(offset, noAssert) {\n\
  return readUInt32(this, offset, true, noAssert);\n\
};\n\
\n\
\n\
/*\n\
 * Signed integer types, yay team! A reminder on how two's complement actually\n\
 * works. The first bit is the signed bit, i.e. tells us whether or not the\n\
 * number should be positive or negative. If the two's complement value is\n\
 * positive, then we're done, as it's equivalent to the unsigned representation.\n\
 *\n\
 * Now if the number is positive, you're pretty much done, you can just leverage\n\
 * the unsigned translations and return those. Unfortunately, negative numbers\n\
 * aren't quite that straightforward.\n\
 *\n\
 * At first glance, one might be inclined to use the traditional formula to\n\
 * translate binary numbers between the positive and negative values in two's\n\
 * complement. (Though it doesn't quite work for the most negative value)\n\
 * Mainly:\n\
 *  - invert all the bits\n\
 *  - add one to the result\n\
 *\n\
 * Of course, this doesn't quite work in Javascript. Take for example the value\n\
 * of -128. This could be represented in 16 bits (big-endian) as 0xff80. But of\n\
 * course, Javascript will do the following:\n\
 *\n\
 * > ~0xff80\n\
 * -65409\n\
 *\n\
 * Whoh there, Javascript, that's not quite right. But wait, according to\n\
 * Javascript that's perfectly correct. When Javascript ends up seeing the\n\
 * constant 0xff80, it has no notion that it is actually a signed number. It\n\
 * assumes that we've input the unsigned value 0xff80. Thus, when it does the\n\
 * binary negation, it casts it into a signed value, (positive 0xff80). Then\n\
 * when you perform binary negation on that, it turns it into a negative number.\n\
 *\n\
 * Instead, we're going to have to use the following general formula, that works\n\
 * in a rather Javascript friendly way. I'm glad we don't support this kind of\n\
 * weird numbering scheme in the kernel.\n\
 *\n\
 * (BIT-MAX - (unsigned)val + 1) * -1\n\
 *\n\
 * The astute observer, may think that this doesn't make sense for 8-bit numbers\n\
 * (really it isn't necessary for them). However, when you get 16-bit numbers,\n\
 * you do. Let's go back to our prior example and see how this will look:\n\
 *\n\
 * (0xffff - 0xff80 + 1) * -1\n\
 * (0x007f + 1) * -1\n\
 * (0x0080) * -1\n\
 */\n\
Buffer.prototype.readInt8 = function(offset, noAssert) {\n\
  var buffer = this;\n\
  var neg;\n\
\n\
  if (!noAssert) {\n\
    assert.ok(offset !== undefined && offset !== null,\n\
        'missing offset');\n\
\n\
    assert.ok(offset < buffer.length,\n\
        'Trying to read beyond buffer length');\n\
  }\n\
\n\
  if (offset >= buffer.length) return;\n\
\n\
  neg = buffer.parent[buffer.offset + offset] & 0x80;\n\
  if (!neg) {\n\
    return (buffer.parent[buffer.offset + offset]);\n\
  }\n\
\n\
  return ((0xff - buffer.parent[buffer.offset + offset] + 1) * -1);\n\
};\n\
\n\
function readInt16(buffer, offset, isBigEndian, noAssert) {\n\
  var neg, val;\n\
\n\
  if (!noAssert) {\n\
    assert.ok(typeof (isBigEndian) === 'boolean',\n\
        'missing or invalid endian');\n\
\n\
    assert.ok(offset !== undefined && offset !== null,\n\
        'missing offset');\n\
\n\
    assert.ok(offset + 1 < buffer.length,\n\
        'Trying to read beyond buffer length');\n\
  }\n\
\n\
  val = readUInt16(buffer, offset, isBigEndian, noAssert);\n\
  neg = val & 0x8000;\n\
  if (!neg) {\n\
    return val;\n\
  }\n\
\n\
  return (0xffff - val + 1) * -1;\n\
}\n\
\n\
Buffer.prototype.readInt16LE = function(offset, noAssert) {\n\
  return readInt16(this, offset, false, noAssert);\n\
};\n\
\n\
Buffer.prototype.readInt16BE = function(offset, noAssert) {\n\
  return readInt16(this, offset, true, noAssert);\n\
};\n\
\n\
function readInt32(buffer, offset, isBigEndian, noAssert) {\n\
  var neg, val;\n\
\n\
  if (!noAssert) {\n\
    assert.ok(typeof (isBigEndian) === 'boolean',\n\
        'missing or invalid endian');\n\
\n\
    assert.ok(offset !== undefined && offset !== null,\n\
        'missing offset');\n\
\n\
    assert.ok(offset + 3 < buffer.length,\n\
        'Trying to read beyond buffer length');\n\
  }\n\
\n\
  val = readUInt32(buffer, offset, isBigEndian, noAssert);\n\
  neg = val & 0x80000000;\n\
  if (!neg) {\n\
    return (val);\n\
  }\n\
\n\
  return (0xffffffff - val + 1) * -1;\n\
}\n\
\n\
Buffer.prototype.readInt32LE = function(offset, noAssert) {\n\
  return readInt32(this, offset, false, noAssert);\n\
};\n\
\n\
Buffer.prototype.readInt32BE = function(offset, noAssert) {\n\
  return readInt32(this, offset, true, noAssert);\n\
};\n\
\n\
function readFloat(buffer, offset, isBigEndian, noAssert) {\n\
  if (!noAssert) {\n\
    assert.ok(typeof (isBigEndian) === 'boolean',\n\
        'missing or invalid endian');\n\
\n\
    assert.ok(offset + 3 < buffer.length,\n\
        'Trying to read beyond buffer length');\n\
  }\n\
\n\
  return require('./buffer_ieee754').readIEEE754(buffer, offset, isBigEndian,\n\
      23, 4);\n\
}\n\
\n\
Buffer.prototype.readFloatLE = function(offset, noAssert) {\n\
  return readFloat(this, offset, false, noAssert);\n\
};\n\
\n\
Buffer.prototype.readFloatBE = function(offset, noAssert) {\n\
  return readFloat(this, offset, true, noAssert);\n\
};\n\
\n\
function readDouble(buffer, offset, isBigEndian, noAssert) {\n\
  if (!noAssert) {\n\
    assert.ok(typeof (isBigEndian) === 'boolean',\n\
        'missing or invalid endian');\n\
\n\
    assert.ok(offset + 7 < buffer.length,\n\
        'Trying to read beyond buffer length');\n\
  }\n\
\n\
  return require('./buffer_ieee754').readIEEE754(buffer, offset, isBigEndian,\n\
      52, 8);\n\
}\n\
\n\
Buffer.prototype.readDoubleLE = function(offset, noAssert) {\n\
  return readDouble(this, offset, false, noAssert);\n\
};\n\
\n\
Buffer.prototype.readDoubleBE = function(offset, noAssert) {\n\
  return readDouble(this, offset, true, noAssert);\n\
};\n\
\n\
\n\
/*\n\
 * We have to make sure that the value is a valid integer. This means that it is\n\
 * non-negative. It has no fractional component and that it does not exceed the\n\
 * maximum allowed value.\n\
 *\n\
 *      value           The number to check for validity\n\
 *\n\
 *      max             The maximum value\n\
 */\n\
function verifuint(value, max) {\n\
  assert.ok(typeof (value) == 'number',\n\
      'cannot write a non-number as a number');\n\
\n\
  assert.ok(value >= 0,\n\
      'specified a negative value for writing an unsigned value');\n\
\n\
  assert.ok(value <= max, 'value is larger than maximum value for type');\n\
\n\
  assert.ok(Math.floor(value) === value, 'value has a fractional component');\n\
}\n\
\n\
Buffer.prototype.writeUInt8 = function(value, offset, noAssert) {\n\
  var buffer = this;\n\
\n\
  if (!noAssert) {\n\
    assert.ok(value !== undefined && value !== null,\n\
        'missing value');\n\
\n\
    assert.ok(offset !== undefined && offset !== null,\n\
        'missing offset');\n\
\n\
    assert.ok(offset < buffer.length,\n\
        'trying to write beyond buffer length');\n\
\n\
    verifuint(value, 0xff);\n\
  }\n\
\n\
  if (offset < buffer.length) {\n\
    buffer.parent[buffer.offset + offset] = value;\n\
  }\n\
};\n\
\n\
function writeUInt16(buffer, value, offset, isBigEndian, noAssert) {\n\
  if (!noAssert) {\n\
    assert.ok(value !== undefined && value !== null,\n\
        'missing value');\n\
\n\
    assert.ok(typeof (isBigEndian) === 'boolean',\n\
        'missing or invalid endian');\n\
\n\
    assert.ok(offset !== undefined && offset !== null,\n\
        'missing offset');\n\
\n\
    assert.ok(offset + 1 < buffer.length,\n\
        'trying to write beyond buffer length');\n\
\n\
    verifuint(value, 0xffff);\n\
  }\n\
\n\
  for (var i = 0; i < Math.min(buffer.length - offset, 2); i++) {\n\
    buffer.parent[buffer.offset + offset + i] =\n\
        (value & (0xff << (8 * (isBigEndian ? 1 - i : i)))) >>>\n\
            (isBigEndian ? 1 - i : i) * 8;\n\
  }\n\
\n\
}\n\
\n\
Buffer.prototype.writeUInt16LE = function(value, offset, noAssert) {\n\
  writeUInt16(this, value, offset, false, noAssert);\n\
};\n\
\n\
Buffer.prototype.writeUInt16BE = function(value, offset, noAssert) {\n\
  writeUInt16(this, value, offset, true, noAssert);\n\
};\n\
\n\
function writeUInt32(buffer, value, offset, isBigEndian, noAssert) {\n\
  if (!noAssert) {\n\
    assert.ok(value !== undefined && value !== null,\n\
        'missing value');\n\
\n\
    assert.ok(typeof (isBigEndian) === 'boolean',\n\
        'missing or invalid endian');\n\
\n\
    assert.ok(offset !== undefined && offset !== null,\n\
        'missing offset');\n\
\n\
    assert.ok(offset + 3 < buffer.length,\n\
        'trying to write beyond buffer length');\n\
\n\
    verifuint(value, 0xffffffff);\n\
  }\n\
\n\
  for (var i = 0; i < Math.min(buffer.length - offset, 4); i++) {\n\
    buffer.parent[buffer.offset + offset + i] =\n\
        (value >>> (isBigEndian ? 3 - i : i) * 8) & 0xff;\n\
  }\n\
}\n\
\n\
Buffer.prototype.writeUInt32LE = function(value, offset, noAssert) {\n\
  writeUInt32(this, value, offset, false, noAssert);\n\
};\n\
\n\
Buffer.prototype.writeUInt32BE = function(value, offset, noAssert) {\n\
  writeUInt32(this, value, offset, true, noAssert);\n\
};\n\
\n\
\n\
/*\n\
 * We now move onto our friends in the signed number category. Unlike unsigned\n\
 * numbers, we're going to have to worry a bit more about how we put values into\n\
 * arrays. Since we are only worrying about signed 32-bit values, we're in\n\
 * slightly better shape. Unfortunately, we really can't do our favorite binary\n\
 * & in this system. It really seems to do the wrong thing. For example:\n\
 *\n\
 * > -32 & 0xff\n\
 * 224\n\
 *\n\
 * What's happening above is really: 0xe0 & 0xff = 0xe0. However, the results of\n\
 * this aren't treated as a signed number. Ultimately a bad thing.\n\
 *\n\
 * What we're going to want to do is basically create the unsigned equivalent of\n\
 * our representation and pass that off to the wuint* functions. To do that\n\
 * we're going to do the following:\n\
 *\n\
 *  - if the value is positive\n\
 *      we can pass it directly off to the equivalent wuint\n\
 *  - if the value is negative\n\
 *      we do the following computation:\n\
 *         mb + val + 1, where\n\
 *         mb   is the maximum unsigned value in that byte size\n\
 *         val  is the Javascript negative integer\n\
 *\n\
 *\n\
 * As a concrete value, take -128. In signed 16 bits this would be 0xff80. If\n\
 * you do out the computations:\n\
 *\n\
 * 0xffff - 128 + 1\n\
 * 0xffff - 127\n\
 * 0xff80\n\
 *\n\
 * You can then encode this value as the signed version. This is really rather\n\
 * hacky, but it should work and get the job done which is our goal here.\n\
 */\n\
\n\
/*\n\
 * A series of checks to make sure we actually have a signed 32-bit number\n\
 */\n\
function verifsint(value, max, min) {\n\
  assert.ok(typeof (value) == 'number',\n\
      'cannot write a non-number as a number');\n\
\n\
  assert.ok(value <= max, 'value larger than maximum allowed value');\n\
\n\
  assert.ok(value >= min, 'value smaller than minimum allowed value');\n\
\n\
  assert.ok(Math.floor(value) === value, 'value has a fractional component');\n\
}\n\
\n\
function verifIEEE754(value, max, min) {\n\
  assert.ok(typeof (value) == 'number',\n\
      'cannot write a non-number as a number');\n\
\n\
  assert.ok(value <= max, 'value larger than maximum allowed value');\n\
\n\
  assert.ok(value >= min, 'value smaller than minimum allowed value');\n\
}\n\
\n\
Buffer.prototype.writeInt8 = function(value, offset, noAssert) {\n\
  var buffer = this;\n\
\n\
  if (!noAssert) {\n\
    assert.ok(value !== undefined && value !== null,\n\
        'missing value');\n\
\n\
    assert.ok(offset !== undefined && offset !== null,\n\
        'missing offset');\n\
\n\
    assert.ok(offset < buffer.length,\n\
        'Trying to write beyond buffer length');\n\
\n\
    verifsint(value, 0x7f, -0x80);\n\
  }\n\
\n\
  if (value >= 0) {\n\
    buffer.writeUInt8(value, offset, noAssert);\n\
  } else {\n\
    buffer.writeUInt8(0xff + value + 1, offset, noAssert);\n\
  }\n\
};\n\
\n\
function writeInt16(buffer, value, offset, isBigEndian, noAssert) {\n\
  if (!noAssert) {\n\
    assert.ok(value !== undefined && value !== null,\n\
        'missing value');\n\
\n\
    assert.ok(typeof (isBigEndian) === 'boolean',\n\
        'missing or invalid endian');\n\
\n\
    assert.ok(offset !== undefined && offset !== null,\n\
        'missing offset');\n\
\n\
    assert.ok(offset + 1 < buffer.length,\n\
        'Trying to write beyond buffer length');\n\
\n\
    verifsint(value, 0x7fff, -0x8000);\n\
  }\n\
\n\
  if (value >= 0) {\n\
    writeUInt16(buffer, value, offset, isBigEndian, noAssert);\n\
  } else {\n\
    writeUInt16(buffer, 0xffff + value + 1, offset, isBigEndian, noAssert);\n\
  }\n\
}\n\
\n\
Buffer.prototype.writeInt16LE = function(value, offset, noAssert) {\n\
  writeInt16(this, value, offset, false, noAssert);\n\
};\n\
\n\
Buffer.prototype.writeInt16BE = function(value, offset, noAssert) {\n\
  writeInt16(this, value, offset, true, noAssert);\n\
};\n\
\n\
function writeInt32(buffer, value, offset, isBigEndian, noAssert) {\n\
  if (!noAssert) {\n\
    assert.ok(value !== undefined && value !== null,\n\
        'missing value');\n\
\n\
    assert.ok(typeof (isBigEndian) === 'boolean',\n\
        'missing or invalid endian');\n\
\n\
    assert.ok(offset !== undefined && offset !== null,\n\
        'missing offset');\n\
\n\
    assert.ok(offset + 3 < buffer.length,\n\
        'Trying to write beyond buffer length');\n\
\n\
    verifsint(value, 0x7fffffff, -0x80000000);\n\
  }\n\
\n\
  if (value >= 0) {\n\
    writeUInt32(buffer, value, offset, isBigEndian, noAssert);\n\
  } else {\n\
    writeUInt32(buffer, 0xffffffff + value + 1, offset, isBigEndian, noAssert);\n\
  }\n\
}\n\
\n\
Buffer.prototype.writeInt32LE = function(value, offset, noAssert) {\n\
  writeInt32(this, value, offset, false, noAssert);\n\
};\n\
\n\
Buffer.prototype.writeInt32BE = function(value, offset, noAssert) {\n\
  writeInt32(this, value, offset, true, noAssert);\n\
};\n\
\n\
function writeFloat(buffer, value, offset, isBigEndian, noAssert) {\n\
  if (!noAssert) {\n\
    assert.ok(value !== undefined && value !== null,\n\
        'missing value');\n\
\n\
    assert.ok(typeof (isBigEndian) === 'boolean',\n\
        'missing or invalid endian');\n\
\n\
    assert.ok(offset !== undefined && offset !== null,\n\
        'missing offset');\n\
\n\
    assert.ok(offset + 3 < buffer.length,\n\
        'Trying to write beyond buffer length');\n\
\n\
    verifIEEE754(value, 3.4028234663852886e+38, -3.4028234663852886e+38);\n\
  }\n\
\n\
  require('./buffer_ieee754').writeIEEE754(buffer, value, offset, isBigEndian,\n\
      23, 4);\n\
}\n\
\n\
Buffer.prototype.writeFloatLE = function(value, offset, noAssert) {\n\
  writeFloat(this, value, offset, false, noAssert);\n\
};\n\
\n\
Buffer.prototype.writeFloatBE = function(value, offset, noAssert) {\n\
  writeFloat(this, value, offset, true, noAssert);\n\
};\n\
\n\
function writeDouble(buffer, value, offset, isBigEndian, noAssert) {\n\
  if (!noAssert) {\n\
    assert.ok(value !== undefined && value !== null,\n\
        'missing value');\n\
\n\
    assert.ok(typeof (isBigEndian) === 'boolean',\n\
        'missing or invalid endian');\n\
\n\
    assert.ok(offset !== undefined && offset !== null,\n\
        'missing offset');\n\
\n\
    assert.ok(offset + 7 < buffer.length,\n\
        'Trying to write beyond buffer length');\n\
\n\
    verifIEEE754(value, 1.7976931348623157E+308, -1.7976931348623157E+308);\n\
  }\n\
\n\
  require('./buffer_ieee754').writeIEEE754(buffer, value, offset, isBigEndian,\n\
      52, 8);\n\
}\n\
\n\
Buffer.prototype.writeDoubleLE = function(value, offset, noAssert) {\n\
  writeDouble(this, value, offset, false, noAssert);\n\
};\n\
\n\
Buffer.prototype.writeDoubleBE = function(value, offset, noAssert) {\n\
  writeDouble(this, value, offset, true, noAssert);\n\
};\n\
\n\
SlowBuffer.prototype.readUInt8 = Buffer.prototype.readUInt8;\n\
SlowBuffer.prototype.readUInt16LE = Buffer.prototype.readUInt16LE;\n\
SlowBuffer.prototype.readUInt16BE = Buffer.prototype.readUInt16BE;\n\
SlowBuffer.prototype.readUInt32LE = Buffer.prototype.readUInt32LE;\n\
SlowBuffer.prototype.readUInt32BE = Buffer.prototype.readUInt32BE;\n\
SlowBuffer.prototype.readInt8 = Buffer.prototype.readInt8;\n\
SlowBuffer.prototype.readInt16LE = Buffer.prototype.readInt16LE;\n\
SlowBuffer.prototype.readInt16BE = Buffer.prototype.readInt16BE;\n\
SlowBuffer.prototype.readInt32LE = Buffer.prototype.readInt32LE;\n\
SlowBuffer.prototype.readInt32BE = Buffer.prototype.readInt32BE;\n\
SlowBuffer.prototype.readFloatLE = Buffer.prototype.readFloatLE;\n\
SlowBuffer.prototype.readFloatBE = Buffer.prototype.readFloatBE;\n\
SlowBuffer.prototype.readDoubleLE = Buffer.prototype.readDoubleLE;\n\
SlowBuffer.prototype.readDoubleBE = Buffer.prototype.readDoubleBE;\n\
SlowBuffer.prototype.writeUInt8 = Buffer.prototype.writeUInt8;\n\
SlowBuffer.prototype.writeUInt16LE = Buffer.prototype.writeUInt16LE;\n\
SlowBuffer.prototype.writeUInt16BE = Buffer.prototype.writeUInt16BE;\n\
SlowBuffer.prototype.writeUInt32LE = Buffer.prototype.writeUInt32LE;\n\
SlowBuffer.prototype.writeUInt32BE = Buffer.prototype.writeUInt32BE;\n\
SlowBuffer.prototype.writeInt8 = Buffer.prototype.writeInt8;\n\
SlowBuffer.prototype.writeInt16LE = Buffer.prototype.writeInt16LE;\n\
SlowBuffer.prototype.writeInt16BE = Buffer.prototype.writeInt16BE;\n\
SlowBuffer.prototype.writeInt32LE = Buffer.prototype.writeInt32LE;\n\
SlowBuffer.prototype.writeInt32BE = Buffer.prototype.writeInt32BE;\n\
SlowBuffer.prototype.writeFloatLE = Buffer.prototype.writeFloatLE;\n\
SlowBuffer.prototype.writeFloatBE = Buffer.prototype.writeFloatBE;\n\
SlowBuffer.prototype.writeDoubleLE = Buffer.prototype.writeDoubleLE;\n\
SlowBuffer.prototype.writeDoubleBE = Buffer.prototype.writeDoubleBE;\n\
\n\
},{\"assert\":1,\"./buffer_ieee754\":5,\"base64-js\":7}],7:[function(require,module,exports){\n\
(function (exports) {\n\
\t'use strict';\n\
\n\
\tvar lookup = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';\n\
\n\
\tfunction b64ToByteArray(b64) {\n\
\t\tvar i, j, l, tmp, placeHolders, arr;\n\
\t\n\
\t\tif (b64.length % 4 > 0) {\n\
\t\t\tthrow 'Invalid string. Length must be a multiple of 4';\n\
\t\t}\n\
\n\
\t\t// the number of equal signs (place holders)\n\
\t\t// if there are two placeholders, than the two characters before it\n\
\t\t// represent one byte\n\
\t\t// if there is only one, then the three characters before it represent 2 bytes\n\
\t\t// this is just a cheap hack to not do indexOf twice\n\
\t\tplaceHolders = b64.indexOf('=');\n\
\t\tplaceHolders = placeHolders > 0 ? b64.length - placeHolders : 0;\n\
\n\
\t\t// base64 is 4/3 + up to two characters of the original data\n\
\t\tarr = [];//new Uint8Array(b64.length * 3 / 4 - placeHolders);\n\
\n\
\t\t// if there are placeholders, only get up to the last complete 4 chars\n\
\t\tl = placeHolders > 0 ? b64.length - 4 : b64.length;\n\
\n\
\t\tfor (i = 0, j = 0; i < l; i += 4, j += 3) {\n\
\t\t\ttmp = (lookup.indexOf(b64[i]) << 18) | (lookup.indexOf(b64[i + 1]) << 12) | (lookup.indexOf(b64[i + 2]) << 6) | lookup.indexOf(b64[i + 3]);\n\
\t\t\tarr.push((tmp & 0xFF0000) >> 16);\n\
\t\t\tarr.push((tmp & 0xFF00) >> 8);\n\
\t\t\tarr.push(tmp & 0xFF);\n\
\t\t}\n\
\n\
\t\tif (placeHolders === 2) {\n\
\t\t\ttmp = (lookup.indexOf(b64[i]) << 2) | (lookup.indexOf(b64[i + 1]) >> 4);\n\
\t\t\tarr.push(tmp & 0xFF);\n\
\t\t} else if (placeHolders === 1) {\n\
\t\t\ttmp = (lookup.indexOf(b64[i]) << 10) | (lookup.indexOf(b64[i + 1]) << 4) | (lookup.indexOf(b64[i + 2]) >> 2);\n\
\t\t\tarr.push((tmp >> 8) & 0xFF);\n\
\t\t\tarr.push(tmp & 0xFF);\n\
\t\t}\n\
\n\
\t\treturn arr;\n\
\t}\n\
\n\
\tfunction uint8ToBase64(uint8) {\n\
\t\tvar i,\n\
\t\t\textraBytes = uint8.length % 3, // if we have 1 byte left, pad 2 bytes\n\
\t\t\toutput = \"\",\n\
\t\t\ttemp, length;\n\
\n\
\t\tfunction tripletToBase64 (num) {\n\
\t\t\treturn lookup[num >> 18 & 0x3F] + lookup[num >> 12 & 0x3F] + lookup[num >> 6 & 0x3F] + lookup[num & 0x3F];\n\
\t\t};\n\
\n\
\t\t// go through the array every three bytes, we'll deal with trailing stuff later\n\
\t\tfor (i = 0, length = uint8.length - extraBytes; i < length; i += 3) {\n\
\t\t\ttemp = (uint8[i] << 16) + (uint8[i + 1] << 8) + (uint8[i + 2]);\n\
\t\t\toutput += tripletToBase64(temp);\n\
\t\t}\n\
\n\
\t\t// pad the end with zeros, but make sure to not forget the extra bytes\n\
\t\tswitch (extraBytes) {\n\
\t\t\tcase 1:\n\
\t\t\t\ttemp = uint8[uint8.length - 1];\n\
\t\t\t\toutput += lookup[temp >> 2];\n\
\t\t\t\toutput += lookup[(temp << 4) & 0x3F];\n\
\t\t\t\toutput += '==';\n\
\t\t\t\tbreak;\n\
\t\t\tcase 2:\n\
\t\t\t\ttemp = (uint8[uint8.length - 2] << 8) + (uint8[uint8.length - 1]);\n\
\t\t\t\toutput += lookup[temp >> 10];\n\
\t\t\t\toutput += lookup[(temp >> 4) & 0x3F];\n\
\t\t\t\toutput += lookup[(temp << 2) & 0x3F];\n\
\t\t\t\toutput += '=';\n\
\t\t\t\tbreak;\n\
\t\t}\n\
\n\
\t\treturn output;\n\
\t}\n\
\n\
\tmodule.exports.toByteArray = b64ToByteArray;\n\
\tmodule.exports.fromByteArray = uint8ToBase64;\n\
}());\n\
\n\
},{}],8:[function(require,module,exports){\n\
exports.readIEEE754 = function(buffer, offset, isBE, mLen, nBytes) {\n\
  var e, m,\n\
      eLen = nBytes * 8 - mLen - 1,\n\
      eMax = (1 << eLen) - 1,\n\
      eBias = eMax >> 1,\n\
      nBits = -7,\n\
      i = isBE ? 0 : (nBytes - 1),\n\
      d = isBE ? 1 : -1,\n\
      s = buffer[offset + i];\n\
\n\
  i += d;\n\
\n\
  e = s & ((1 << (-nBits)) - 1);\n\
  s >>= (-nBits);\n\
  nBits += eLen;\n\
  for (; nBits > 0; e = e * 256 + buffer[offset + i], i += d, nBits -= 8);\n\
\n\
  m = e & ((1 << (-nBits)) - 1);\n\
  e >>= (-nBits);\n\
  nBits += mLen;\n\
  for (; nBits > 0; m = m * 256 + buffer[offset + i], i += d, nBits -= 8);\n\
\n\
  if (e === 0) {\n\
    e = 1 - eBias;\n\
  } else if (e === eMax) {\n\
    return m ? NaN : ((s ? -1 : 1) * Infinity);\n\
  } else {\n\
    m = m + Math.pow(2, mLen);\n\
    e = e - eBias;\n\
  }\n\
  return (s ? -1 : 1) * m * Math.pow(2, e - mLen);\n\
};\n\
\n\
exports.writeIEEE754 = function(buffer, value, offset, isBE, mLen, nBytes) {\n\
  var e, m, c,\n\
      eLen = nBytes * 8 - mLen - 1,\n\
      eMax = (1 << eLen) - 1,\n\
      eBias = eMax >> 1,\n\
      rt = (mLen === 23 ? Math.pow(2, -24) - Math.pow(2, -77) : 0),\n\
      i = isBE ? (nBytes - 1) : 0,\n\
      d = isBE ? -1 : 1,\n\
      s = value < 0 || (value === 0 && 1 / value < 0) ? 1 : 0;\n\
\n\
  value = Math.abs(value);\n\
\n\
  if (isNaN(value) || value === Infinity) {\n\
    m = isNaN(value) ? 1 : 0;\n\
    e = eMax;\n\
  } else {\n\
    e = Math.floor(Math.log(value) / Math.LN2);\n\
    if (value * (c = Math.pow(2, -e)) < 1) {\n\
      e--;\n\
      c *= 2;\n\
    }\n\
    if (e + eBias >= 1) {\n\
      value += rt / c;\n\
    } else {\n\
      value += rt * Math.pow(2, 1 - eBias);\n\
    }\n\
    if (value * c >= 2) {\n\
      e++;\n\
      c /= 2;\n\
    }\n\
\n\
    if (e + eBias >= eMax) {\n\
      m = 0;\n\
      e = eMax;\n\
    } else if (e + eBias >= 1) {\n\
      m = (value * c - 1) * Math.pow(2, mLen);\n\
      e = e + eBias;\n\
    } else {\n\
      m = value * Math.pow(2, eBias - 1) * Math.pow(2, mLen);\n\
      e = 0;\n\
    }\n\
  }\n\
\n\
  for (; mLen >= 8; buffer[offset + i] = m & 0xff, i += d, m /= 256, mLen -= 8);\n\
\n\
  e = (e << mLen) | m;\n\
  eLen += mLen;\n\
  for (; eLen > 0; buffer[offset + i] = e & 0xff, i += d, e /= 256, eLen -= 8);\n\
\n\
  buffer[offset + i - d] |= s * 128;\n\
};\n\
\n\
},{}],3:[function(require,module,exports){\n\
function SlowBuffer (size) {\n\
    this.length = size;\n\
};\n\
\n\
var assert = require('assert');\n\
\n\
exports.INSPECT_MAX_BYTES = 50;\n\
\n\
\n\
function toHex(n) {\n\
  if (n < 16) return '0' + n.toString(16);\n\
  return n.toString(16);\n\
}\n\
\n\
function utf8ToBytes(str) {\n\
  var byteArray = [];\n\
  for (var i = 0; i < str.length; i++)\n\
    if (str.charCodeAt(i) <= 0x7F)\n\
      byteArray.push(str.charCodeAt(i));\n\
    else {\n\
      var h = encodeURIComponent(str.charAt(i)).substr(1).split('%');\n\
      for (var j = 0; j < h.length; j++)\n\
        byteArray.push(parseInt(h[j], 16));\n\
    }\n\
\n\
  return byteArray;\n\
}\n\
\n\
function asciiToBytes(str) {\n\
  var byteArray = []\n\
  for (var i = 0; i < str.length; i++ )\n\
    // Node's code seems to be doing this and not & 0x7F..\n\
    byteArray.push( str.charCodeAt(i) & 0xFF );\n\
\n\
  return byteArray;\n\
}\n\
\n\
function base64ToBytes(str) {\n\
  return require(\"base64-js\").toByteArray(str);\n\
}\n\
\n\
SlowBuffer.byteLength = function (str, encoding) {\n\
  switch (encoding || \"utf8\") {\n\
    case 'hex':\n\
      return str.length / 2;\n\
\n\
    case 'utf8':\n\
    case 'utf-8':\n\
      return utf8ToBytes(str).length;\n\
\n\
    case 'ascii':\n\
      return str.length;\n\
\n\
    case 'base64':\n\
      return base64ToBytes(str).length;\n\
\n\
    default:\n\
      throw new Error('Unknown encoding');\n\
  }\n\
};\n\
\n\
function blitBuffer(src, dst, offset, length) {\n\
  var pos, i = 0;\n\
  while (i < length) {\n\
    if ((i+offset >= dst.length) || (i >= src.length))\n\
      break;\n\
\n\
    dst[i + offset] = src[i];\n\
    i++;\n\
  }\n\
  return i;\n\
}\n\
\n\
SlowBuffer.prototype.utf8Write = function (string, offset, length) {\n\
  var bytes, pos;\n\
  return SlowBuffer._charsWritten =  blitBuffer(utf8ToBytes(string), this, offset, length);\n\
};\n\
\n\
SlowBuffer.prototype.asciiWrite = function (string, offset, length) {\n\
  var bytes, pos;\n\
  return SlowBuffer._charsWritten =  blitBuffer(asciiToBytes(string), this, offset, length);\n\
};\n\
\n\
SlowBuffer.prototype.base64Write = function (string, offset, length) {\n\
  var bytes, pos;\n\
  return SlowBuffer._charsWritten = blitBuffer(base64ToBytes(string), this, offset, length);\n\
};\n\
\n\
SlowBuffer.prototype.base64Slice = function (start, end) {\n\
  var bytes = Array.prototype.slice.apply(this, arguments)\n\
  return require(\"base64-js\").fromByteArray(bytes);\n\
}\n\
\n\
function decodeUtf8Char(str) {\n\
  try {\n\
    return decodeURIComponent(str);\n\
  } catch (err) {\n\
    return String.fromCharCode(0xFFFD); // UTF 8 invalid char\n\
  }\n\
}\n\
\n\
SlowBuffer.prototype.utf8Slice = function () {\n\
  var bytes = Array.prototype.slice.apply(this, arguments);\n\
  var res = \"\";\n\
  var tmp = \"\";\n\
  var i = 0;\n\
  while (i < bytes.length) {\n\
    if (bytes[i] <= 0x7F) {\n\
      res += decodeUtf8Char(tmp) + String.fromCharCode(bytes[i]);\n\
      tmp = \"\";\n\
    } else\n\
      tmp += \"%\" + bytes[i].toString(16);\n\
\n\
    i++;\n\
  }\n\
\n\
  return res + decodeUtf8Char(tmp);\n\
}\n\
\n\
SlowBuffer.prototype.asciiSlice = function () {\n\
  var bytes = Array.prototype.slice.apply(this, arguments);\n\
  var ret = \"\";\n\
  for (var i = 0; i < bytes.length; i++)\n\
    ret += String.fromCharCode(bytes[i]);\n\
  return ret;\n\
}\n\
\n\
SlowBuffer.prototype.inspect = function() {\n\
  var out = [],\n\
      len = this.length;\n\
  for (var i = 0; i < len; i++) {\n\
    out[i] = toHex(this[i]);\n\
    if (i == exports.INSPECT_MAX_BYTES) {\n\
      out[i + 1] = '...';\n\
      break;\n\
    }\n\
  }\n\
  return '<SlowBuffer ' + out.join(' ') + '>';\n\
};\n\
\n\
\n\
SlowBuffer.prototype.hexSlice = function(start, end) {\n\
  var len = this.length;\n\
\n\
  if (!start || start < 0) start = 0;\n\
  if (!end || end < 0 || end > len) end = len;\n\
\n\
  var out = '';\n\
  for (var i = start; i < end; i++) {\n\
    out += toHex(this[i]);\n\
  }\n\
  return out;\n\
};\n\
\n\
\n\
SlowBuffer.prototype.toString = function(encoding, start, end) {\n\
  encoding = String(encoding || 'utf8').toLowerCase();\n\
  start = +start || 0;\n\
  if (typeof end == 'undefined') end = this.length;\n\
\n\
  // Fastpath empty strings\n\
  if (+end == start) {\n\
    return '';\n\
  }\n\
\n\
  switch (encoding) {\n\
    case 'hex':\n\
      return this.hexSlice(start, end);\n\
\n\
    case 'utf8':\n\
    case 'utf-8':\n\
      return this.utf8Slice(start, end);\n\
\n\
    case 'ascii':\n\
      return this.asciiSlice(start, end);\n\
\n\
    case 'binary':\n\
      return this.binarySlice(start, end);\n\
\n\
    case 'base64':\n\
      return this.base64Slice(start, end);\n\
\n\
    case 'ucs2':\n\
    case 'ucs-2':\n\
      return this.ucs2Slice(start, end);\n\
\n\
    default:\n\
      throw new Error('Unknown encoding');\n\
  }\n\
};\n\
\n\
\n\
SlowBuffer.prototype.hexWrite = function(string, offset, length) {\n\
  offset = +offset || 0;\n\
  var remaining = this.length - offset;\n\
  if (!length) {\n\
    length = remaining;\n\
  } else {\n\
    length = +length;\n\
    if (length > remaining) {\n\
      length = remaining;\n\
    }\n\
  }\n\
\n\
  // must be an even number of digits\n\
  var strLen = string.length;\n\
  if (strLen % 2) {\n\
    throw new Error('Invalid hex string');\n\
  }\n\
  if (length > strLen / 2) {\n\
    length = strLen / 2;\n\
  }\n\
  for (var i = 0; i < length; i++) {\n\
    var byte = parseInt(string.substr(i * 2, 2), 16);\n\
    if (isNaN(byte)) throw new Error('Invalid hex string');\n\
    this[offset + i] = byte;\n\
  }\n\
  SlowBuffer._charsWritten = i * 2;\n\
  return i;\n\
};\n\
\n\
\n\
SlowBuffer.prototype.write = function(string, offset, length, encoding) {\n\
  // Support both (string, offset, length, encoding)\n\
  // and the legacy (string, encoding, offset, length)\n\
  if (isFinite(offset)) {\n\
    if (!isFinite(length)) {\n\
      encoding = length;\n\
      length = undefined;\n\
    }\n\
  } else {  // legacy\n\
    var swap = encoding;\n\
    encoding = offset;\n\
    offset = length;\n\
    length = swap;\n\
  }\n\
\n\
  offset = +offset || 0;\n\
  var remaining = this.length - offset;\n\
  if (!length) {\n\
    length = remaining;\n\
  } else {\n\
    length = +length;\n\
    if (length > remaining) {\n\
      length = remaining;\n\
    }\n\
  }\n\
  encoding = String(encoding || 'utf8').toLowerCase();\n\
\n\
  switch (encoding) {\n\
    case 'hex':\n\
      return this.hexWrite(string, offset, length);\n\
\n\
    case 'utf8':\n\
    case 'utf-8':\n\
      return this.utf8Write(string, offset, length);\n\
\n\
    case 'ascii':\n\
      return this.asciiWrite(string, offset, length);\n\
\n\
    case 'binary':\n\
      return this.binaryWrite(string, offset, length);\n\
\n\
    case 'base64':\n\
      return this.base64Write(string, offset, length);\n\
\n\
    case 'ucs2':\n\
    case 'ucs-2':\n\
      return this.ucs2Write(string, offset, length);\n\
\n\
    default:\n\
      throw new Error('Unknown encoding');\n\
  }\n\
};\n\
\n\
\n\
// slice(start, end)\n\
SlowBuffer.prototype.slice = function(start, end) {\n\
  if (end === undefined) end = this.length;\n\
\n\
  if (end > this.length) {\n\
    throw new Error('oob');\n\
  }\n\
  if (start > end) {\n\
    throw new Error('oob');\n\
  }\n\
\n\
  return new Buffer(this, end - start, +start);\n\
};\n\
\n\
SlowBuffer.prototype.copy = function(target, targetstart, sourcestart, sourceend) {\n\
  var temp = [];\n\
  for (var i=sourcestart; i<sourceend; i++) {\n\
    assert.ok(typeof this[i] !== 'undefined', \"copying undefined buffer bytes!\");\n\
    temp.push(this[i]);\n\
  }\n\
\n\
  for (var i=targetstart; i<targetstart+temp.length; i++) {\n\
    target[i] = temp[i-targetstart];\n\
  }\n\
};\n\
\n\
function coerce(length) {\n\
  // Coerce length to a number (possibly NaN), round up\n\
  // in case it's fractional (e.g. 123.456) then do a\n\
  // double negate to coerce a NaN to 0. Easy, right?\n\
  length = ~~Math.ceil(+length);\n\
  return length < 0 ? 0 : length;\n\
}\n\
\n\
\n\
// Buffer\n\
\n\
function Buffer(subject, encoding, offset) {\n\
  if (!(this instanceof Buffer)) {\n\
    return new Buffer(subject, encoding, offset);\n\
  }\n\
\n\
  var type;\n\
\n\
  // Are we slicing?\n\
  if (typeof offset === 'number') {\n\
    this.length = coerce(encoding);\n\
    this.parent = subject;\n\
    this.offset = offset;\n\
  } else {\n\
    // Find the length\n\
    switch (type = typeof subject) {\n\
      case 'number':\n\
        this.length = coerce(subject);\n\
        break;\n\
\n\
      case 'string':\n\
        this.length = Buffer.byteLength(subject, encoding);\n\
        break;\n\
\n\
      case 'object': // Assume object is an array\n\
        this.length = coerce(subject.length);\n\
        break;\n\
\n\
      default:\n\
        throw new Error('First argument needs to be a number, ' +\n\
                        'array or string.');\n\
    }\n\
\n\
    if (this.length > Buffer.poolSize) {\n\
      // Big buffer, just alloc one.\n\
      this.parent = new SlowBuffer(this.length);\n\
      this.offset = 0;\n\
\n\
    } else {\n\
      // Small buffer.\n\
      if (!pool || pool.length - pool.used < this.length) allocPool();\n\
      this.parent = pool;\n\
      this.offset = pool.used;\n\
      pool.used += this.length;\n\
    }\n\
\n\
    // Treat array-ish objects as a byte array.\n\
    if (isArrayIsh(subject)) {\n\
      for (var i = 0; i < this.length; i++) {\n\
        this.parent[i + this.offset] = subject[i];\n\
      }\n\
    } else if (type == 'string') {\n\
      // We are a string\n\
      this.length = this.write(subject, 0, encoding);\n\
    }\n\
  }\n\
\n\
}\n\
\n\
function isArrayIsh(subject) {\n\
  return Array.isArray(subject) || Buffer.isBuffer(subject) ||\n\
         subject && typeof subject === 'object' &&\n\
         typeof subject.length === 'number';\n\
}\n\
\n\
exports.SlowBuffer = SlowBuffer;\n\
exports.Buffer = Buffer;\n\
\n\
Buffer.poolSize = 8 * 1024;\n\
var pool;\n\
\n\
function allocPool() {\n\
  pool = new SlowBuffer(Buffer.poolSize);\n\
  pool.used = 0;\n\
}\n\
\n\
\n\
// Static methods\n\
Buffer.isBuffer = function isBuffer(b) {\n\
  return b instanceof Buffer || b instanceof SlowBuffer;\n\
};\n\
\n\
Buffer.concat = function (list, totalLength) {\n\
  if (!Array.isArray(list)) {\n\
    throw new Error(\"Usage: Buffer.concat(list, [totalLength])\\n\
 \\\n\
      list should be an Array.\");\n\
  }\n\
\n\
  if (list.length === 0) {\n\
    return new Buffer(0);\n\
  } else if (list.length === 1) {\n\
    return list[0];\n\
  }\n\
\n\
  if (typeof totalLength !== 'number') {\n\
    totalLength = 0;\n\
    for (var i = 0; i < list.length; i++) {\n\
      var buf = list[i];\n\
      totalLength += buf.length;\n\
    }\n\
  }\n\
\n\
  var buffer = new Buffer(totalLength);\n\
  var pos = 0;\n\
  for (var i = 0; i < list.length; i++) {\n\
    var buf = list[i];\n\
    buf.copy(buffer, pos);\n\
    pos += buf.length;\n\
  }\n\
  return buffer;\n\
};\n\
\n\
// Inspect\n\
Buffer.prototype.inspect = function inspect() {\n\
  var out = [],\n\
      len = this.length;\n\
\n\
  for (var i = 0; i < len; i++) {\n\
    out[i] = toHex(this.parent[i + this.offset]);\n\
    if (i == exports.INSPECT_MAX_BYTES) {\n\
      out[i + 1] = '...';\n\
      break;\n\
    }\n\
  }\n\
\n\
  return '<Buffer ' + out.join(' ') + '>';\n\
};\n\
\n\
\n\
Buffer.prototype.get = function get(i) {\n\
  if (i < 0 || i >= this.length) throw new Error('oob');\n\
  return this.parent[this.offset + i];\n\
};\n\
\n\
\n\
Buffer.prototype.set = function set(i, v) {\n\
  if (i < 0 || i >= this.length) throw new Error('oob');\n\
  return this.parent[this.offset + i] = v;\n\
};\n\
\n\
\n\
// write(string, offset = 0, length = buffer.length-offset, encoding = 'utf8')\n\
Buffer.prototype.write = function(string, offset, length, encoding) {\n\
  // Support both (string, offset, length, encoding)\n\
  // and the legacy (string, encoding, offset, length)\n\
  if (isFinite(offset)) {\n\
    if (!isFinite(length)) {\n\
      encoding = length;\n\
      length = undefined;\n\
    }\n\
  } else {  // legacy\n\
    var swap = encoding;\n\
    encoding = offset;\n\
    offset = length;\n\
    length = swap;\n\
  }\n\
\n\
  offset = +offset || 0;\n\
  var remaining = this.length - offset;\n\
  if (!length) {\n\
    length = remaining;\n\
  } else {\n\
    length = +length;\n\
    if (length > remaining) {\n\
      length = remaining;\n\
    }\n\
  }\n\
  encoding = String(encoding || 'utf8').toLowerCase();\n\
\n\
  var ret;\n\
  switch (encoding) {\n\
    case 'hex':\n\
      ret = this.parent.hexWrite(string, this.offset + offset, length);\n\
      break;\n\
\n\
    case 'utf8':\n\
    case 'utf-8':\n\
      ret = this.parent.utf8Write(string, this.offset + offset, length);\n\
      break;\n\
\n\
    case 'ascii':\n\
      ret = this.parent.asciiWrite(string, this.offset + offset, length);\n\
      break;\n\
\n\
    case 'binary':\n\
      ret = this.parent.binaryWrite(string, this.offset + offset, length);\n\
      break;\n\
\n\
    case 'base64':\n\
      // Warning: maxLength not taken into account in base64Write\n\
      ret = this.parent.base64Write(string, this.offset + offset, length);\n\
      break;\n\
\n\
    case 'ucs2':\n\
    case 'ucs-2':\n\
      ret = this.parent.ucs2Write(string, this.offset + offset, length);\n\
      break;\n\
\n\
    default:\n\
      throw new Error('Unknown encoding');\n\
  }\n\
\n\
  Buffer._charsWritten = SlowBuffer._charsWritten;\n\
\n\
  return ret;\n\
};\n\
\n\
\n\
// toString(encoding, start=0, end=buffer.length)\n\
Buffer.prototype.toString = function(encoding, start, end) {\n\
  encoding = String(encoding || 'utf8').toLowerCase();\n\
\n\
  if (typeof start == 'undefined' || start < 0) {\n\
    start = 0;\n\
  } else if (start > this.length) {\n\
    start = this.length;\n\
  }\n\
\n\
  if (typeof end == 'undefined' || end > this.length) {\n\
    end = this.length;\n\
  } else if (end < 0) {\n\
    end = 0;\n\
  }\n\
\n\
  start = start + this.offset;\n\
  end = end + this.offset;\n\
\n\
  switch (encoding) {\n\
    case 'hex':\n\
      return this.parent.hexSlice(start, end);\n\
\n\
    case 'utf8':\n\
    case 'utf-8':\n\
      return this.parent.utf8Slice(start, end);\n\
\n\
    case 'ascii':\n\
      return this.parent.asciiSlice(start, end);\n\
\n\
    case 'binary':\n\
      return this.parent.binarySlice(start, end);\n\
\n\
    case 'base64':\n\
      return this.parent.base64Slice(start, end);\n\
\n\
    case 'ucs2':\n\
    case 'ucs-2':\n\
      return this.parent.ucs2Slice(start, end);\n\
\n\
    default:\n\
      throw new Error('Unknown encoding');\n\
  }\n\
};\n\
\n\
\n\
// byteLength\n\
Buffer.byteLength = SlowBuffer.byteLength;\n\
\n\
\n\
// fill(value, start=0, end=buffer.length)\n\
Buffer.prototype.fill = function fill(value, start, end) {\n\
  value || (value = 0);\n\
  start || (start = 0);\n\
  end || (end = this.length);\n\
\n\
  if (typeof value === 'string') {\n\
    value = value.charCodeAt(0);\n\
  }\n\
  if (!(typeof value === 'number') || isNaN(value)) {\n\
    throw new Error('value is not a number');\n\
  }\n\
\n\
  if (end < start) throw new Error('end < start');\n\
\n\
  // Fill 0 bytes; we're done\n\
  if (end === start) return 0;\n\
  if (this.length == 0) return 0;\n\
\n\
  if (start < 0 || start >= this.length) {\n\
    throw new Error('start out of bounds');\n\
  }\n\
\n\
  if (end < 0 || end > this.length) {\n\
    throw new Error('end out of bounds');\n\
  }\n\
\n\
  return this.parent.fill(value,\n\
                          start + this.offset,\n\
                          end + this.offset);\n\
};\n\
\n\
\n\
// copy(targetBuffer, targetStart=0, sourceStart=0, sourceEnd=buffer.length)\n\
Buffer.prototype.copy = function(target, target_start, start, end) {\n\
  var source = this;\n\
  start || (start = 0);\n\
  end || (end = this.length);\n\
  target_start || (target_start = 0);\n\
\n\
  if (end < start) throw new Error('sourceEnd < sourceStart');\n\
\n\
  // Copy 0 bytes; we're done\n\
  if (end === start) return 0;\n\
  if (target.length == 0 || source.length == 0) return 0;\n\
\n\
  if (target_start < 0 || target_start >= target.length) {\n\
    throw new Error('targetStart out of bounds');\n\
  }\n\
\n\
  if (start < 0 || start >= source.length) {\n\
    throw new Error('sourceStart out of bounds');\n\
  }\n\
\n\
  if (end < 0 || end > source.length) {\n\
    throw new Error('sourceEnd out of bounds');\n\
  }\n\
\n\
  // Are we oob?\n\
  if (end > this.length) {\n\
    end = this.length;\n\
  }\n\
\n\
  if (target.length - target_start < end - start) {\n\
    end = target.length - target_start + start;\n\
  }\n\
\n\
  return this.parent.copy(target.parent,\n\
                          target_start + target.offset,\n\
                          start + this.offset,\n\
                          end + this.offset);\n\
};\n\
\n\
\n\
// slice(start, end)\n\
Buffer.prototype.slice = function(start, end) {\n\
  if (end === undefined) end = this.length;\n\
  if (end > this.length) throw new Error('oob');\n\
  if (start > end) throw new Error('oob');\n\
\n\
  return new Buffer(this.parent, end - start, +start + this.offset);\n\
};\n\
\n\
\n\
// Legacy methods for backwards compatibility.\n\
\n\
Buffer.prototype.utf8Slice = function(start, end) {\n\
  return this.toString('utf8', start, end);\n\
};\n\
\n\
Buffer.prototype.binarySlice = function(start, end) {\n\
  return this.toString('binary', start, end);\n\
};\n\
\n\
Buffer.prototype.asciiSlice = function(start, end) {\n\
  return this.toString('ascii', start, end);\n\
};\n\
\n\
Buffer.prototype.utf8Write = function(string, offset) {\n\
  return this.write(string, offset, 'utf8');\n\
};\n\
\n\
Buffer.prototype.binaryWrite = function(string, offset) {\n\
  return this.write(string, offset, 'binary');\n\
};\n\
\n\
Buffer.prototype.asciiWrite = function(string, offset) {\n\
  return this.write(string, offset, 'ascii');\n\
};\n\
\n\
Buffer.prototype.readUInt8 = function(offset, noAssert) {\n\
  var buffer = this;\n\
\n\
  if (!noAssert) {\n\
    assert.ok(offset !== undefined && offset !== null,\n\
        'missing offset');\n\
\n\
    assert.ok(offset < buffer.length,\n\
        'Trying to read beyond buffer length');\n\
  }\n\
\n\
  return buffer.parent[buffer.offset + offset];\n\
};\n\
\n\
function readUInt16(buffer, offset, isBigEndian, noAssert) {\n\
  var val = 0;\n\
\n\
\n\
  if (!noAssert) {\n\
    assert.ok(typeof (isBigEndian) === 'boolean',\n\
        'missing or invalid endian');\n\
\n\
    assert.ok(offset !== undefined && offset !== null,\n\
        'missing offset');\n\
\n\
    assert.ok(offset + 1 < buffer.length,\n\
        'Trying to read beyond buffer length');\n\
  }\n\
\n\
  if (isBigEndian) {\n\
    val = buffer.parent[buffer.offset + offset] << 8;\n\
    val |= buffer.parent[buffer.offset + offset + 1];\n\
  } else {\n\
    val = buffer.parent[buffer.offset + offset];\n\
    val |= buffer.parent[buffer.offset + offset + 1] << 8;\n\
  }\n\
\n\
  return val;\n\
}\n\
\n\
Buffer.prototype.readUInt16LE = function(offset, noAssert) {\n\
  return readUInt16(this, offset, false, noAssert);\n\
};\n\
\n\
Buffer.prototype.readUInt16BE = function(offset, noAssert) {\n\
  return readUInt16(this, offset, true, noAssert);\n\
};\n\
\n\
function readUInt32(buffer, offset, isBigEndian, noAssert) {\n\
  var val = 0;\n\
\n\
  if (!noAssert) {\n\
    assert.ok(typeof (isBigEndian) === 'boolean',\n\
        'missing or invalid endian');\n\
\n\
    assert.ok(offset !== undefined && offset !== null,\n\
        'missing offset');\n\
\n\
    assert.ok(offset + 3 < buffer.length,\n\
        'Trying to read beyond buffer length');\n\
  }\n\
\n\
  if (isBigEndian) {\n\
    val = buffer.parent[buffer.offset + offset + 1] << 16;\n\
    val |= buffer.parent[buffer.offset + offset + 2] << 8;\n\
    val |= buffer.parent[buffer.offset + offset + 3];\n\
    val = val + (buffer.parent[buffer.offset + offset] << 24 >>> 0);\n\
  } else {\n\
    val = buffer.parent[buffer.offset + offset + 2] << 16;\n\
    val |= buffer.parent[buffer.offset + offset + 1] << 8;\n\
    val |= buffer.parent[buffer.offset + offset];\n\
    val = val + (buffer.parent[buffer.offset + offset + 3] << 24 >>> 0);\n\
  }\n\
\n\
  return val;\n\
}\n\
\n\
Buffer.prototype.readUInt32LE = function(offset, noAssert) {\n\
  return readUInt32(this, offset, false, noAssert);\n\
};\n\
\n\
Buffer.prototype.readUInt32BE = function(offset, noAssert) {\n\
  return readUInt32(this, offset, true, noAssert);\n\
};\n\
\n\
\n\
/*\n\
 * Signed integer types, yay team! A reminder on how two's complement actually\n\
 * works. The first bit is the signed bit, i.e. tells us whether or not the\n\
 * number should be positive or negative. If the two's complement value is\n\
 * positive, then we're done, as it's equivalent to the unsigned representation.\n\
 *\n\
 * Now if the number is positive, you're pretty much done, you can just leverage\n\
 * the unsigned translations and return those. Unfortunately, negative numbers\n\
 * aren't quite that straightforward.\n\
 *\n\
 * At first glance, one might be inclined to use the traditional formula to\n\
 * translate binary numbers between the positive and negative values in two's\n\
 * complement. (Though it doesn't quite work for the most negative value)\n\
 * Mainly:\n\
 *  - invert all the bits\n\
 *  - add one to the result\n\
 *\n\
 * Of course, this doesn't quite work in Javascript. Take for example the value\n\
 * of -128. This could be represented in 16 bits (big-endian) as 0xff80. But of\n\
 * course, Javascript will do the following:\n\
 *\n\
 * > ~0xff80\n\
 * -65409\n\
 *\n\
 * Whoh there, Javascript, that's not quite right. But wait, according to\n\
 * Javascript that's perfectly correct. When Javascript ends up seeing the\n\
 * constant 0xff80, it has no notion that it is actually a signed number. It\n\
 * assumes that we've input the unsigned value 0xff80. Thus, when it does the\n\
 * binary negation, it casts it into a signed value, (positive 0xff80). Then\n\
 * when you perform binary negation on that, it turns it into a negative number.\n\
 *\n\
 * Instead, we're going to have to use the following general formula, that works\n\
 * in a rather Javascript friendly way. I'm glad we don't support this kind of\n\
 * weird numbering scheme in the kernel.\n\
 *\n\
 * (BIT-MAX - (unsigned)val + 1) * -1\n\
 *\n\
 * The astute observer, may think that this doesn't make sense for 8-bit numbers\n\
 * (really it isn't necessary for them). However, when you get 16-bit numbers,\n\
 * you do. Let's go back to our prior example and see how this will look:\n\
 *\n\
 * (0xffff - 0xff80 + 1) * -1\n\
 * (0x007f + 1) * -1\n\
 * (0x0080) * -1\n\
 */\n\
Buffer.prototype.readInt8 = function(offset, noAssert) {\n\
  var buffer = this;\n\
  var neg;\n\
\n\
  if (!noAssert) {\n\
    assert.ok(offset !== undefined && offset !== null,\n\
        'missing offset');\n\
\n\
    assert.ok(offset < buffer.length,\n\
        'Trying to read beyond buffer length');\n\
  }\n\
\n\
  neg = buffer.parent[buffer.offset + offset] & 0x80;\n\
  if (!neg) {\n\
    return (buffer.parent[buffer.offset + offset]);\n\
  }\n\
\n\
  return ((0xff - buffer.parent[buffer.offset + offset] + 1) * -1);\n\
};\n\
\n\
function readInt16(buffer, offset, isBigEndian, noAssert) {\n\
  var neg, val;\n\
\n\
  if (!noAssert) {\n\
    assert.ok(typeof (isBigEndian) === 'boolean',\n\
        'missing or invalid endian');\n\
\n\
    assert.ok(offset !== undefined && offset !== null,\n\
        'missing offset');\n\
\n\
    assert.ok(offset + 1 < buffer.length,\n\
        'Trying to read beyond buffer length');\n\
  }\n\
\n\
  val = readUInt16(buffer, offset, isBigEndian, noAssert);\n\
  neg = val & 0x8000;\n\
  if (!neg) {\n\
    return val;\n\
  }\n\
\n\
  return (0xffff - val + 1) * -1;\n\
}\n\
\n\
Buffer.prototype.readInt16LE = function(offset, noAssert) {\n\
  return readInt16(this, offset, false, noAssert);\n\
};\n\
\n\
Buffer.prototype.readInt16BE = function(offset, noAssert) {\n\
  return readInt16(this, offset, true, noAssert);\n\
};\n\
\n\
function readInt32(buffer, offset, isBigEndian, noAssert) {\n\
  var neg, val;\n\
\n\
  if (!noAssert) {\n\
    assert.ok(typeof (isBigEndian) === 'boolean',\n\
        'missing or invalid endian');\n\
\n\
    assert.ok(offset !== undefined && offset !== null,\n\
        'missing offset');\n\
\n\
    assert.ok(offset + 3 < buffer.length,\n\
        'Trying to read beyond buffer length');\n\
  }\n\
\n\
  val = readUInt32(buffer, offset, isBigEndian, noAssert);\n\
  neg = val & 0x80000000;\n\
  if (!neg) {\n\
    return (val);\n\
  }\n\
\n\
  return (0xffffffff - val + 1) * -1;\n\
}\n\
\n\
Buffer.prototype.readInt32LE = function(offset, noAssert) {\n\
  return readInt32(this, offset, false, noAssert);\n\
};\n\
\n\
Buffer.prototype.readInt32BE = function(offset, noAssert) {\n\
  return readInt32(this, offset, true, noAssert);\n\
};\n\
\n\
function readFloat(buffer, offset, isBigEndian, noAssert) {\n\
  if (!noAssert) {\n\
    assert.ok(typeof (isBigEndian) === 'boolean',\n\
        'missing or invalid endian');\n\
\n\
    assert.ok(offset + 3 < buffer.length,\n\
        'Trying to read beyond buffer length');\n\
  }\n\
\n\
  return require('./buffer_ieee754').readIEEE754(buffer, offset, isBigEndian,\n\
      23, 4);\n\
}\n\
\n\
Buffer.prototype.readFloatLE = function(offset, noAssert) {\n\
  return readFloat(this, offset, false, noAssert);\n\
};\n\
\n\
Buffer.prototype.readFloatBE = function(offset, noAssert) {\n\
  return readFloat(this, offset, true, noAssert);\n\
};\n\
\n\
function readDouble(buffer, offset, isBigEndian, noAssert) {\n\
  if (!noAssert) {\n\
    assert.ok(typeof (isBigEndian) === 'boolean',\n\
        'missing or invalid endian');\n\
\n\
    assert.ok(offset + 7 < buffer.length,\n\
        'Trying to read beyond buffer length');\n\
  }\n\
\n\
  return require('./buffer_ieee754').readIEEE754(buffer, offset, isBigEndian,\n\
      52, 8);\n\
}\n\
\n\
Buffer.prototype.readDoubleLE = function(offset, noAssert) {\n\
  return readDouble(this, offset, false, noAssert);\n\
};\n\
\n\
Buffer.prototype.readDoubleBE = function(offset, noAssert) {\n\
  return readDouble(this, offset, true, noAssert);\n\
};\n\
\n\
\n\
/*\n\
 * We have to make sure that the value is a valid integer. This means that it is\n\
 * non-negative. It has no fractional component and that it does not exceed the\n\
 * maximum allowed value.\n\
 *\n\
 *      value           The number to check for validity\n\
 *\n\
 *      max             The maximum value\n\
 */\n\
function verifuint(value, max) {\n\
  assert.ok(typeof (value) == 'number',\n\
      'cannot write a non-number as a number');\n\
\n\
  assert.ok(value >= 0,\n\
      'specified a negative value for writing an unsigned value');\n\
\n\
  assert.ok(value <= max, 'value is larger than maximum value for type');\n\
\n\
  assert.ok(Math.floor(value) === value, 'value has a fractional component');\n\
}\n\
\n\
Buffer.prototype.writeUInt8 = function(value, offset, noAssert) {\n\
  var buffer = this;\n\
\n\
  if (!noAssert) {\n\
    assert.ok(value !== undefined && value !== null,\n\
        'missing value');\n\
\n\
    assert.ok(offset !== undefined && offset !== null,\n\
        'missing offset');\n\
\n\
    assert.ok(offset < buffer.length,\n\
        'trying to write beyond buffer length');\n\
\n\
    verifuint(value, 0xff);\n\
  }\n\
\n\
  buffer.parent[buffer.offset + offset] = value;\n\
};\n\
\n\
function writeUInt16(buffer, value, offset, isBigEndian, noAssert) {\n\
  if (!noAssert) {\n\
    assert.ok(value !== undefined && value !== null,\n\
        'missing value');\n\
\n\
    assert.ok(typeof (isBigEndian) === 'boolean',\n\
        'missing or invalid endian');\n\
\n\
    assert.ok(offset !== undefined && offset !== null,\n\
        'missing offset');\n\
\n\
    assert.ok(offset + 1 < buffer.length,\n\
        'trying to write beyond buffer length');\n\
\n\
    verifuint(value, 0xffff);\n\
  }\n\
\n\
  if (isBigEndian) {\n\
    buffer.parent[buffer.offset + offset] = (value & 0xff00) >>> 8;\n\
    buffer.parent[buffer.offset + offset + 1] = value & 0x00ff;\n\
  } else {\n\
    buffer.parent[buffer.offset + offset + 1] = (value & 0xff00) >>> 8;\n\
    buffer.parent[buffer.offset + offset] = value & 0x00ff;\n\
  }\n\
}\n\
\n\
Buffer.prototype.writeUInt16LE = function(value, offset, noAssert) {\n\
  writeUInt16(this, value, offset, false, noAssert);\n\
};\n\
\n\
Buffer.prototype.writeUInt16BE = function(value, offset, noAssert) {\n\
  writeUInt16(this, value, offset, true, noAssert);\n\
};\n\
\n\
function writeUInt32(buffer, value, offset, isBigEndian, noAssert) {\n\
  if (!noAssert) {\n\
    assert.ok(value !== undefined && value !== null,\n\
        'missing value');\n\
\n\
    assert.ok(typeof (isBigEndian) === 'boolean',\n\
        'missing or invalid endian');\n\
\n\
    assert.ok(offset !== undefined && offset !== null,\n\
        'missing offset');\n\
\n\
    assert.ok(offset + 3 < buffer.length,\n\
        'trying to write beyond buffer length');\n\
\n\
    verifuint(value, 0xffffffff);\n\
  }\n\
\n\
  if (isBigEndian) {\n\
    buffer.parent[buffer.offset + offset] = (value >>> 24) & 0xff;\n\
    buffer.parent[buffer.offset + offset + 1] = (value >>> 16) & 0xff;\n\
    buffer.parent[buffer.offset + offset + 2] = (value >>> 8) & 0xff;\n\
    buffer.parent[buffer.offset + offset + 3] = value & 0xff;\n\
  } else {\n\
    buffer.parent[buffer.offset + offset + 3] = (value >>> 24) & 0xff;\n\
    buffer.parent[buffer.offset + offset + 2] = (value >>> 16) & 0xff;\n\
    buffer.parent[buffer.offset + offset + 1] = (value >>> 8) & 0xff;\n\
    buffer.parent[buffer.offset + offset] = value & 0xff;\n\
  }\n\
}\n\
\n\
Buffer.prototype.writeUInt32LE = function(value, offset, noAssert) {\n\
  writeUInt32(this, value, offset, false, noAssert);\n\
};\n\
\n\
Buffer.prototype.writeUInt32BE = function(value, offset, noAssert) {\n\
  writeUInt32(this, value, offset, true, noAssert);\n\
};\n\
\n\
\n\
/*\n\
 * We now move onto our friends in the signed number category. Unlike unsigned\n\
 * numbers, we're going to have to worry a bit more about how we put values into\n\
 * arrays. Since we are only worrying about signed 32-bit values, we're in\n\
 * slightly better shape. Unfortunately, we really can't do our favorite binary\n\
 * & in this system. It really seems to do the wrong thing. For example:\n\
 *\n\
 * > -32 & 0xff\n\
 * 224\n\
 *\n\
 * What's happening above is really: 0xe0 & 0xff = 0xe0. However, the results of\n\
 * this aren't treated as a signed number. Ultimately a bad thing.\n\
 *\n\
 * What we're going to want to do is basically create the unsigned equivalent of\n\
 * our representation and pass that off to the wuint* functions. To do that\n\
 * we're going to do the following:\n\
 *\n\
 *  - if the value is positive\n\
 *      we can pass it directly off to the equivalent wuint\n\
 *  - if the value is negative\n\
 *      we do the following computation:\n\
 *         mb + val + 1, where\n\
 *         mb   is the maximum unsigned value in that byte size\n\
 *         val  is the Javascript negative integer\n\
 *\n\
 *\n\
 * As a concrete value, take -128. In signed 16 bits this would be 0xff80. If\n\
 * you do out the computations:\n\
 *\n\
 * 0xffff - 128 + 1\n\
 * 0xffff - 127\n\
 * 0xff80\n\
 *\n\
 * You can then encode this value as the signed version. This is really rather\n\
 * hacky, but it should work and get the job done which is our goal here.\n\
 */\n\
\n\
/*\n\
 * A series of checks to make sure we actually have a signed 32-bit number\n\
 */\n\
function verifsint(value, max, min) {\n\
  assert.ok(typeof (value) == 'number',\n\
      'cannot write a non-number as a number');\n\
\n\
  assert.ok(value <= max, 'value larger than maximum allowed value');\n\
\n\
  assert.ok(value >= min, 'value smaller than minimum allowed value');\n\
\n\
  assert.ok(Math.floor(value) === value, 'value has a fractional component');\n\
}\n\
\n\
function verifIEEE754(value, max, min) {\n\
  assert.ok(typeof (value) == 'number',\n\
      'cannot write a non-number as a number');\n\
\n\
  assert.ok(value <= max, 'value larger than maximum allowed value');\n\
\n\
  assert.ok(value >= min, 'value smaller than minimum allowed value');\n\
}\n\
\n\
Buffer.prototype.writeInt8 = function(value, offset, noAssert) {\n\
  var buffer = this;\n\
\n\
  if (!noAssert) {\n\
    assert.ok(value !== undefined && value !== null,\n\
        'missing value');\n\
\n\
    assert.ok(offset !== undefined && offset !== null,\n\
        'missing offset');\n\
\n\
    assert.ok(offset < buffer.length,\n\
        'Trying to write beyond buffer length');\n\
\n\
    verifsint(value, 0x7f, -0x80);\n\
  }\n\
\n\
  if (value >= 0) {\n\
    buffer.writeUInt8(value, offset, noAssert);\n\
  } else {\n\
    buffer.writeUInt8(0xff + value + 1, offset, noAssert);\n\
  }\n\
};\n\
\n\
function writeInt16(buffer, value, offset, isBigEndian, noAssert) {\n\
  if (!noAssert) {\n\
    assert.ok(value !== undefined && value !== null,\n\
        'missing value');\n\
\n\
    assert.ok(typeof (isBigEndian) === 'boolean',\n\
        'missing or invalid endian');\n\
\n\
    assert.ok(offset !== undefined && offset !== null,\n\
        'missing offset');\n\
\n\
    assert.ok(offset + 1 < buffer.length,\n\
        'Trying to write beyond buffer length');\n\
\n\
    verifsint(value, 0x7fff, -0x8000);\n\
  }\n\
\n\
  if (value >= 0) {\n\
    writeUInt16(buffer, value, offset, isBigEndian, noAssert);\n\
  } else {\n\
    writeUInt16(buffer, 0xffff + value + 1, offset, isBigEndian, noAssert);\n\
  }\n\
}\n\
\n\
Buffer.prototype.writeInt16LE = function(value, offset, noAssert) {\n\
  writeInt16(this, value, offset, false, noAssert);\n\
};\n\
\n\
Buffer.prototype.writeInt16BE = function(value, offset, noAssert) {\n\
  writeInt16(this, value, offset, true, noAssert);\n\
};\n\
\n\
function writeInt32(buffer, value, offset, isBigEndian, noAssert) {\n\
  if (!noAssert) {\n\
    assert.ok(value !== undefined && value !== null,\n\
        'missing value');\n\
\n\
    assert.ok(typeof (isBigEndian) === 'boolean',\n\
        'missing or invalid endian');\n\
\n\
    assert.ok(offset !== undefined && offset !== null,\n\
        'missing offset');\n\
\n\
    assert.ok(offset + 3 < buffer.length,\n\
        'Trying to write beyond buffer length');\n\
\n\
    verifsint(value, 0x7fffffff, -0x80000000);\n\
  }\n\
\n\
  if (value >= 0) {\n\
    writeUInt32(buffer, value, offset, isBigEndian, noAssert);\n\
  } else {\n\
    writeUInt32(buffer, 0xffffffff + value + 1, offset, isBigEndian, noAssert);\n\
  }\n\
}\n\
\n\
Buffer.prototype.writeInt32LE = function(value, offset, noAssert) {\n\
  writeInt32(this, value, offset, false, noAssert);\n\
};\n\
\n\
Buffer.prototype.writeInt32BE = function(value, offset, noAssert) {\n\
  writeInt32(this, value, offset, true, noAssert);\n\
};\n\
\n\
function writeFloat(buffer, value, offset, isBigEndian, noAssert) {\n\
  if (!noAssert) {\n\
    assert.ok(value !== undefined && value !== null,\n\
        'missing value');\n\
\n\
    assert.ok(typeof (isBigEndian) === 'boolean',\n\
        'missing or invalid endian');\n\
\n\
    assert.ok(offset !== undefined && offset !== null,\n\
        'missing offset');\n\
\n\
    assert.ok(offset + 3 < buffer.length,\n\
        'Trying to write beyond buffer length');\n\
\n\
    verifIEEE754(value, 3.4028234663852886e+38, -3.4028234663852886e+38);\n\
  }\n\
\n\
  require('./buffer_ieee754').writeIEEE754(buffer, value, offset, isBigEndian,\n\
      23, 4);\n\
}\n\
\n\
Buffer.prototype.writeFloatLE = function(value, offset, noAssert) {\n\
  writeFloat(this, value, offset, false, noAssert);\n\
};\n\
\n\
Buffer.prototype.writeFloatBE = function(value, offset, noAssert) {\n\
  writeFloat(this, value, offset, true, noAssert);\n\
};\n\
\n\
function writeDouble(buffer, value, offset, isBigEndian, noAssert) {\n\
  if (!noAssert) {\n\
    assert.ok(value !== undefined && value !== null,\n\
        'missing value');\n\
\n\
    assert.ok(typeof (isBigEndian) === 'boolean',\n\
        'missing or invalid endian');\n\
\n\
    assert.ok(offset !== undefined && offset !== null,\n\
        'missing offset');\n\
\n\
    assert.ok(offset + 7 < buffer.length,\n\
        'Trying to write beyond buffer length');\n\
\n\
    verifIEEE754(value, 1.7976931348623157E+308, -1.7976931348623157E+308);\n\
  }\n\
\n\
  require('./buffer_ieee754').writeIEEE754(buffer, value, offset, isBigEndian,\n\
      52, 8);\n\
}\n\
\n\
Buffer.prototype.writeDoubleLE = function(value, offset, noAssert) {\n\
  writeDouble(this, value, offset, false, noAssert);\n\
};\n\
\n\
Buffer.prototype.writeDoubleBE = function(value, offset, noAssert) {\n\
  writeDouble(this, value, offset, true, noAssert);\n\
};\n\
\n\
SlowBuffer.prototype.readUInt8 = Buffer.prototype.readUInt8;\n\
SlowBuffer.prototype.readUInt16LE = Buffer.prototype.readUInt16LE;\n\
SlowBuffer.prototype.readUInt16BE = Buffer.prototype.readUInt16BE;\n\
SlowBuffer.prototype.readUInt32LE = Buffer.prototype.readUInt32LE;\n\
SlowBuffer.prototype.readUInt32BE = Buffer.prototype.readUInt32BE;\n\
SlowBuffer.prototype.readInt8 = Buffer.prototype.readInt8;\n\
SlowBuffer.prototype.readInt16LE = Buffer.prototype.readInt16LE;\n\
SlowBuffer.prototype.readInt16BE = Buffer.prototype.readInt16BE;\n\
SlowBuffer.prototype.readInt32LE = Buffer.prototype.readInt32LE;\n\
SlowBuffer.prototype.readInt32BE = Buffer.prototype.readInt32BE;\n\
SlowBuffer.prototype.readFloatLE = Buffer.prototype.readFloatLE;\n\
SlowBuffer.prototype.readFloatBE = Buffer.prototype.readFloatBE;\n\
SlowBuffer.prototype.readDoubleLE = Buffer.prototype.readDoubleLE;\n\
SlowBuffer.prototype.readDoubleBE = Buffer.prototype.readDoubleBE;\n\
SlowBuffer.prototype.writeUInt8 = Buffer.prototype.writeUInt8;\n\
SlowBuffer.prototype.writeUInt16LE = Buffer.prototype.writeUInt16LE;\n\
SlowBuffer.prototype.writeUInt16BE = Buffer.prototype.writeUInt16BE;\n\
SlowBuffer.prototype.writeUInt32LE = Buffer.prototype.writeUInt32LE;\n\
SlowBuffer.prototype.writeUInt32BE = Buffer.prototype.writeUInt32BE;\n\
SlowBuffer.prototype.writeInt8 = Buffer.prototype.writeInt8;\n\
SlowBuffer.prototype.writeInt16LE = Buffer.prototype.writeInt16LE;\n\
SlowBuffer.prototype.writeInt16BE = Buffer.prototype.writeInt16BE;\n\
SlowBuffer.prototype.writeInt32LE = Buffer.prototype.writeInt32LE;\n\
SlowBuffer.prototype.writeInt32BE = Buffer.prototype.writeInt32BE;\n\
SlowBuffer.prototype.writeFloatLE = Buffer.prototype.writeFloatLE;\n\
SlowBuffer.prototype.writeFloatBE = Buffer.prototype.writeFloatBE;\n\
SlowBuffer.prototype.writeDoubleLE = Buffer.prototype.writeDoubleLE;\n\
SlowBuffer.prototype.writeDoubleBE = Buffer.prototype.writeDoubleBE;\n\
\n\
},{\"assert\":1,\"./buffer_ieee754\":8,\"base64-js\":9}],9:[function(require,module,exports){\n\
(function (exports) {\n\
\t'use strict';\n\
\n\
\tvar lookup = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';\n\
\n\
\tfunction b64ToByteArray(b64) {\n\
\t\tvar i, j, l, tmp, placeHolders, arr;\n\
\t\n\
\t\tif (b64.length % 4 > 0) {\n\
\t\t\tthrow 'Invalid string. Length must be a multiple of 4';\n\
\t\t}\n\
\n\
\t\t// the number of equal signs (place holders)\n\
\t\t// if there are two placeholders, than the two characters before it\n\
\t\t// represent one byte\n\
\t\t// if there is only one, then the three characters before it represent 2 bytes\n\
\t\t// this is just a cheap hack to not do indexOf twice\n\
\t\tplaceHolders = b64.indexOf('=');\n\
\t\tplaceHolders = placeHolders > 0 ? b64.length - placeHolders : 0;\n\
\n\
\t\t// base64 is 4/3 + up to two characters of the original data\n\
\t\tarr = [];//new Uint8Array(b64.length * 3 / 4 - placeHolders);\n\
\n\
\t\t// if there are placeholders, only get up to the last complete 4 chars\n\
\t\tl = placeHolders > 0 ? b64.length - 4 : b64.length;\n\
\n\
\t\tfor (i = 0, j = 0; i < l; i += 4, j += 3) {\n\
\t\t\ttmp = (lookup.indexOf(b64[i]) << 18) | (lookup.indexOf(b64[i + 1]) << 12) | (lookup.indexOf(b64[i + 2]) << 6) | lookup.indexOf(b64[i + 3]);\n\
\t\t\tarr.push((tmp & 0xFF0000) >> 16);\n\
\t\t\tarr.push((tmp & 0xFF00) >> 8);\n\
\t\t\tarr.push(tmp & 0xFF);\n\
\t\t}\n\
\n\
\t\tif (placeHolders === 2) {\n\
\t\t\ttmp = (lookup.indexOf(b64[i]) << 2) | (lookup.indexOf(b64[i + 1]) >> 4);\n\
\t\t\tarr.push(tmp & 0xFF);\n\
\t\t} else if (placeHolders === 1) {\n\
\t\t\ttmp = (lookup.indexOf(b64[i]) << 10) | (lookup.indexOf(b64[i + 1]) << 4) | (lookup.indexOf(b64[i + 2]) >> 2);\n\
\t\t\tarr.push((tmp >> 8) & 0xFF);\n\
\t\t\tarr.push(tmp & 0xFF);\n\
\t\t}\n\
\n\
\t\treturn arr;\n\
\t}\n\
\n\
\tfunction uint8ToBase64(uint8) {\n\
\t\tvar i,\n\
\t\t\textraBytes = uint8.length % 3, // if we have 1 byte left, pad 2 bytes\n\
\t\t\toutput = \"\",\n\
\t\t\ttemp, length;\n\
\n\
\t\tfunction tripletToBase64 (num) {\n\
\t\t\treturn lookup[num >> 18 & 0x3F] + lookup[num >> 12 & 0x3F] + lookup[num >> 6 & 0x3F] + lookup[num & 0x3F];\n\
\t\t};\n\
\n\
\t\t// go through the array every three bytes, we'll deal with trailing stuff later\n\
\t\tfor (i = 0, length = uint8.length - extraBytes; i < length; i += 3) {\n\
\t\t\ttemp = (uint8[i] << 16) + (uint8[i + 1] << 8) + (uint8[i + 2]);\n\
\t\t\toutput += tripletToBase64(temp);\n\
\t\t}\n\
\n\
\t\t// pad the end with zeros, but make sure to not forget the extra bytes\n\
\t\tswitch (extraBytes) {\n\
\t\t\tcase 1:\n\
\t\t\t\ttemp = uint8[uint8.length - 1];\n\
\t\t\t\toutput += lookup[temp >> 2];\n\
\t\t\t\toutput += lookup[(temp << 4) & 0x3F];\n\
\t\t\t\toutput += '==';\n\
\t\t\t\tbreak;\n\
\t\t\tcase 2:\n\
\t\t\t\ttemp = (uint8[uint8.length - 2] << 8) + (uint8[uint8.length - 1]);\n\
\t\t\t\toutput += lookup[temp >> 10];\n\
\t\t\t\toutput += lookup[(temp >> 4) & 0x3F];\n\
\t\t\t\toutput += lookup[(temp << 2) & 0x3F];\n\
\t\t\t\toutput += '=';\n\
\t\t\t\tbreak;\n\
\t\t}\n\
\n\
\t\treturn output;\n\
\t}\n\
\n\
\tmodule.exports.toByteArray = b64ToByteArray;\n\
\tmodule.exports.fromByteArray = uint8ToBase64;\n\
}());\n\
\n\
},{}]},{},[])\n\
;;module.exports=require(\"buffer-browserify\")\n\
\n\
},{}],18:[function(require,module,exports){\n\
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
},{}]},{},[1])\n\
(1)\n\
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
  , util = require('./util')\n\
  , defer = setTimeout\n\
  , puts = console.log.bind(console, 'chirp:')\n\
  , error = puts.bind(puts, 'error:')\n\
\n\
\n\
function applyFilters (filters, data) {\n\
  var tmp = [].concat(filters)\n\
\n\
  ~function next () {\n\
    var fn = tmp.shift()\n\
    if (fn) {\n\
      fn(data, next);\n\
    }\n\
  }();\n\
}\n\
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
 * Middleware\n\
 */\n\
\n\
var middleware = require('./middleware');\n\
chirp.links = middleware.links;\n\
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
  this.user = function () { return owner; };\n\
  this.filters = [];\n\
\n\
  chirp.ready(function () {\n\
    if (!(owner = store.get('user')))\n\
      self.auth(authUser);\n\
\n\
    client.on('data', function (data) {\n\
      if (undefined === data.sid)\n\
        client.sid = data.sid;\n\
\n\
      var tmpFilters = [].concat(self.filters);\n\
\n\
      tmpFilters.push(function (d, next) {\n\
        self.write(Message(d));\n\
      });\n\
\n\
      if (data.message && data.owner)\n\
        applyFilters(tmpFilters, data)\n\
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
    var links = [];\n\
    if (!value) return false;\n\
    $(self.input).find('input').val('');\n\
    if (util.hasUrl(value)) {\n\
      links = value.match(util.URL_REGEX)\n\
    }\n\
    self.client.write(JSON.stringify({\n\
      owner: self.user(),\n\
      message: value,\n\
      links: links,\n\
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
    host = window.document.location.host;\n\
    host = 'ws://'+ host;\n\
  }\n\
\n\
  client.readable = true;\n\
  client.writable = true;\n\
\n\
  client.connect = function (fn) {\n\
   client.sock = sock = new WebSocket(host);\n\
\n\
   sock.onopen = function () {\n\
     isReady = true;\n\
     if ('function' === typeof fn) fn.call(client, sock);\n\
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
 * Provide a filter function\n\
 * for when a client receives\n\
 * data\n\
 *\n\
 * @api public\n\
 * @param {Function} fn\n\
 */\n\
\n\
chirp.prototype.use = function (fn) {\n\
  if ('function' !== typeof fn) throw new TypeError(\"expecting function\");\n\
  this.filters.push(fn);\n\
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
  this.message = escape(util.decodeEntities(data.message));\n\
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
  return dom(unescape(tpl));\n\
};\n\
//@ sourceURL=chirp/public/js/chirp/index.js"
));
require.register("chirp/public/js/chirp/middleware.js", Function("exports, require, module",
"\n\
/**\n\
 * Module dependencies\n\
 */\n\
\n\
var dom = require('domify')\n\
  , util = require('./util')\n\
\n\
\n\
/**\n\
 * Returns a middleware\n\
 * function that converts all\n\
 * links to anchor tags\n\
 *\n\
 * @api public\n\
 * @param {Object} opts\n\
 */\n\
\n\
exports.links = function (opts) {\n\
  opts = ('object' === typeof opts) ? opts : {};\n\
\n\
  return function (data, next) {\n\
    var re = util.URL_REGEX;\n\
    var target = opts.target || '_blank';\n\
    var className = opts.className || '';\n\
    var match = data.message.match(re);\n\
\n\
    var tpl = '<a href=\"$1\" alt=\"$1\"'+\n\
                 'target=\"'+ target +'\"'+\n\
                 'class=\"'+ className +'\"'+\n\
                 'title=\"$1\">$1</a>';\n\
\n\
    if (null === match)\n\
      return next();\n\
\n\
    data.message = data.message.replace(re, tpl);\n\
    data.hasLink = true;\n\
    next();\n\
  }\n\
};\n\
//@ sourceURL=chirp/public/js/chirp/middleware.js"
));
require.register("chirp/public/js/chirp/util.js", Function("exports, require, module",
"\n\
/**\n\
 * Module dependencies\n\
 */\n\
\n\
\n\
// http://blog.mattheworiordan.com/post/13174566389/url-regular-expression-for-links-with-or-without-the\n\
exports.URL_REGEX = /((([A-Za-z]{3,9}:(?:\\/\\/)?)(?:[-;:&=\\+\\$,\\w]+@)?[A-Za-z0-9.-]+|(?:www.|[-;:&=\\+\\$,\\w]+@)[A-Za-z0-9.-]+)((?:\\/[\\+~%\\/.\\w-_]*)?\\??(?:[-\\+=&;%@.\\w_]*)#?(?:[.\\!\\/\\\\w]*))?)/gm;\n\
\n\
\n\
// borrowed from http://stackoverflow.com/a/9609450/1408668\n\
exports.decodeEntities = (function() {\n\
  var el = document.createElement('div');\n\
\n\
  function decodeHTMLEntities (str) {\n\
    if ('string' === typeof str) {\n\
      el.innerHTML = str;\n\
      str = el.innerHTML;\n\
    }\n\
\n\
    return str;\n\
  }\n\
\n\
  return decodeHTMLEntities;\n\
})();\n\
\n\
\n\
exports.hasUrl = function (url) {\n\
  return exports.URL_REGEX.test(url);\n\
};\n\
//@ sourceURL=chirp/public/js/chirp/util.js"
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