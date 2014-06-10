/**
 * @ignore
 * escape of lang
 * @author yiminghe@gmail.com
 */

var util = require('./base');
// IE doesn't include non-breaking-space (0xa0) in their \s character
// class (as required by section 7.2 of the ECMAScript spec), we explicitly
// include it in the regexp to enforce consistent cross-browser behavior.

var EMPTY = '',
// FALSE = false,
// http://www.owasp.org/index.php/XSS_(Cross_Site_Scripting)_Prevention_Cheat_Sheet
// http://wonko.com/post/html-escaping
    htmlEntities = {
        '&amp;': '&',
        '&gt;': '>',
        '&lt;': '<',
        '&#x60;': '`',
        '&#x2F;': '/',
        '&quot;': '"',
        /*jshint quotmark:false*/
        '&#x27;': "'"
    },
    reverseEntities = {},
    escapeHtmlReg,
    unEscapeHtmlReg,
    possibleEscapeHtmlReg = /[&<>"'`]/,
// - # $ ^ * ( ) + [ ] { } | \ , . ?
    escapeRegExp = /[\-#$\^*()+\[\]{}|\\,.?\s]/g;
(function () {
    for (var k in htmlEntities) {
        reverseEntities[htmlEntities[k]] = k;
    }
})();

escapeHtmlReg = getEscapeReg();
unEscapeHtmlReg = getUnEscapeReg();

function getEscapeReg() {
    var str = EMPTY;
    for (var e in htmlEntities) {
        var entity = htmlEntities[e];
        str += entity + '|';
    }
    str = str.slice(0, -1);
    escapeHtmlReg = new RegExp(str, 'g');
    return escapeHtmlReg;
}

function getUnEscapeReg() {
    var str = EMPTY;
    for (var e in reverseEntities) {
        var entity = reverseEntities[e];
        str += entity + '|';
    }
    str += '&#(\\d{1,5});';
    unEscapeHtmlReg = new RegExp(str, 'g');
    return unEscapeHtmlReg;
}

util.mix(util, {
    /**
     * get escaped string from html.
     * only escape
     *      & > < ` / " '
     * refer:
     *
     * [http://yiminghe.javaeye.com/blog/788929](http://yiminghe.javaeye.com/blog/788929)
     *
     * [http://wonko.com/post/html-escaping](http://wonko.com/post/html-escaping)
     * @param str {string} text2html show
     * @member KISSY
     * @return {String} escaped html
     */
    escapeHtml: function (str) {
        if (!str && str !== 0) {
            return '';
        }
        str = '' + str;
        if (!possibleEscapeHtmlReg.test(str)) {
            return str;
        }
        return (str + '').replace(escapeHtmlReg, function (m) {
            return reverseEntities[m];
        });
    },

    /**
     * get escaped regexp string for construct regexp.
     * @param str
     * @member KISSY
     * @return {String} escaped regexp
     */
    escapeRegExp: function (str) {
        return str.replace(escapeRegExp, '\\$&');
    },

    /**
     * un-escape html to string.
     * only unescape
     *      &amp; &lt; &gt; &#x60; &#x2F; &quot; &#x27; &#\d{1,5}
     * @param str {string} html2text
     * @member KISSY
     * @return {String} un-escaped html
     */
    unEscapeHtml: function (str) {
        return str.replace(unEscapeHtmlReg, function (m, n) {
            return htmlEntities[m] || String.fromCharCode(+n);
        });
    }
});

util.escapeHTML = util.escapeHtml;
util.unEscapeHTML = util.unEscapeHtml;
