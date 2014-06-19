/**
 * @ignore
 * string utilities of lang
 * @author yiminghe@gmail.com
 */

var util = require('./base');
var undef;
// IE doesn't include non-breaking-space (0xa0) in their \s character
// class (as required by section 7.2 of the ECMAScript spec), we explicitly
// include it in the regexp to enforce consistent cross-browser behavior.
var SUBSTITUTE_REG = /\\?\{([^{}]+)\}/g,
    EMPTY = '';

var RE_TRIM = /^[\s\xa0]+|[\s\xa0]+$/g,
    trim = String.prototype.trim;

var RE_DASH = /-([a-z])/ig;

function upperCase() {
    return arguments[1].toUpperCase();
}

util.mix(util, {
    /**
     * test whether a string start with a specified substring
     * @param {String} str the whole string
     * @param {String} prefix a specified substring
     * @return {Boolean} whether str start with prefix
     * @member KISSY
     */
    startsWith: function (str, prefix) {
        return str.lastIndexOf(prefix, 0) === 0;
    },

    /**
     * test whether a string end with a specified substring
     * @param {String} str the whole string
     * @param {String} suffix a specified substring
     * @return {Boolean} whether str end with suffix
     * @member KISSY
     */
    endsWith: function (str, suffix) {
        var ind = str.length - suffix.length;
        return ind >= 0 && str.indexOf(suffix, ind) === ind;
    },

    /**
     * Removes the whitespace from the beginning and end of a string.
     * @method
     * @member KISSY
     */
    trim: trim ?
        function (str) {
            return str == null ? EMPTY : trim.call(str);
        } :
        function (str) {
            return str == null ? EMPTY : (str + '').replace(RE_TRIM, EMPTY);
        },

    /**
     * Call encodeURIComponent to encode a url component
     * @param {String} s part of url to be encoded.
     * @return {String} encoded url part string.
     * @member KISSY
     */
    urlEncode: function (s) {
        return encodeURIComponent(String(s));
    },

    /**
     * Call decodeURIComponent to decode a url component
     * and replace '+' with space.
     * @param {String} s part of url to be decoded.
     * @return {String} decoded url part string.
     * @member KISSY
     */
    urlDecode: function (s) {
        return decodeURIComponent(s.replace(/\+/g, ' '));
    },

    camelCase: function (name) {
        if (name.indexOf('-') === -1) {
            return name;
        }
        return name.replace(RE_DASH, upperCase);
    },
    /**
     * Substitutes keywords in a string using an object/array.
     * Removes undef keywords and ignores escaped keywords.
     * @param {String} str template string
     * @param {Object} o json data
     * @member KISSY
     * @param {RegExp} [regexp] to match a piece of template string
     */
    substitute: function (str, o, regexp) {
        if (typeof str !== 'string' || !o) {
            return str;
        }

        return str.replace(regexp || SUBSTITUTE_REG, function (match, name) {
            if (match.charAt(0) === '\\') {
                return match.slice(1);
            }
            return (o[name] === undef) ? EMPTY : o[name];
        });
    },

    /** uppercase first character.
     * @member KISSY
     * @param s
     * @return {String}
     */
    ucfirst: function (s) {
        s += '';
        return s.charAt(0).toUpperCase() + s.substring(1);
    }
});