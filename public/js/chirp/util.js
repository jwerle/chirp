
/**
 * Module dependencies
 */


// http://blog.mattheworiordan.com/post/13174566389/url-regular-expression-for-links-with-or-without-the
exports.URL_REGEX = /((([A-Za-z]{3,9}:(?:\/\/)?)(?:[-;:&=\+\$,\w]+@)?[A-Za-z0-9.-]+|(?:www.|[-;:&=\+\$,\w]+@)[A-Za-z0-9.-]+)((?:\/[\+~%\/.\w-_]*)?\??(?:[-\+=&;%@.\w_]*)#?(?:[.\!\/\\w]*))?)/gm;


// borrowed from http://stackoverflow.com/a/9609450/1408668
exports.decodeEntities = (function() {
  var el = document.createElement('div');

  function decodeHTMLEntities (str) {
    if ('string' === typeof str) {
      el.innerHTML = str;
      str = el.innerHTML;
    }

    return str;
  }

  return decodeHTMLEntities;
})();


exports.hasUrl = function (url) {
  return exports.URL_REGEX.test(url);
};
