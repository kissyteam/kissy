modulex.add("cookie", [], function(require, exports, module) {

/*
combined modules:
cookie
*/
var cookie;
cookie = function (exports) {
  /**
   * cookie
   */
  var doc = document, MILLISECONDS_OF_DAY = 24 * 60 * 60 * 1000, encode = encodeURIComponent;
  function decode(s) {
    return decodeURIComponent(s.replace(/\+/g, ' '));
  }
  function isNotEmptyString(val) {
    return typeof val === 'string' && val !== '';
  }
  /**
   * Provide Cookie utilities.
   * @class Cookie
   * @singleton
   */
  exports = {
    get: function (name) {
      var ret, m;
      if (isNotEmptyString(name)) {
        if (m = String(doc.cookie).match(new RegExp('(?:^| )' + name + '(?:(?:=([^;]*))|;|$)'))) {
          ret = m[1] ? decode(m[1]) : '';
        }
      }
      return ret;
    },
    set: function (name, val, expires, domain, path, secure) {
      var text = String(encode(val)), date = expires;
      if (typeof date === 'number') {
        date = new Date();
        date.setTime(date.getTime() + expires * MILLISECONDS_OF_DAY);
      }
      if (date instanceof Date) {
        text += '; expires=' + date.toUTCString();
      }
      if (isNotEmptyString(domain)) {
        text += '; domain=' + domain;
      }
      if (isNotEmptyString(path)) {
        text += '; path=' + path;
      }
      if (secure) {
        text += '; secure';
      }
      doc.cookie = name + '=' + text;
    },
    remove: function (name, domain, path, secure) {
      this.set(name, '', -1, domain, path, secure);
    }
  };
  return exports;
}();
module.exports = cookie;
});