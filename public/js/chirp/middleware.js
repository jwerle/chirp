
/**
 * Module dependencies
 */

var dom = require('domify')
  , util = require('./util')


/**
 * Returns a middleware
 * function that converts all
 * links to anchor tags
 *
 * @api public
 * @param {Object} opts
 */

exports.links = function (opts) {
  opts = ('object' === typeof opts) ? opts : {};

  return function (data, next) {
    var re = util.URL_REGEX;
    var target = opts.target || '_blank';
    var className = opts.className || '';
    var match = data.message.match(re);

    var tpl = '<a href="$1" alt="$1"'+
                 'target="'+ target +'"'+
                 'class="'+ className +'"'+
                 'title="$1">$1</a>';

    if (null === match)
      return next();

    data.message = data.message.replace(re, tpl);
    data.hasLink = true;
    next();
  }
};
