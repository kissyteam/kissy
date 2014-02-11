(function (S) {
    var logger = S.getLogger('s/lang');
    var SEP = '&',
        EMPTY = '',
        EQ = '=',
        toString = ({}).toString,
        TRUE = true;
    var RE_TRIM = /^[\s\xa0]+|[\s\xa0]+$/g,
        trim = String.prototype.trim;
    // error in native ie678, not in simulated ie9
    var hasEnumBug = !({toString: 1}.propertyIsEnumerable('toString')),
        enumProperties = [
            'constructor',
            'hasOwnProperty',
            'isPrototypeOf',
            'propertyIsEnumerable',
            'toString',
            'toLocaleString',
            'valueOf'
        ];

    function isValidParamValue(val) {
        var t = typeof val;
        // If the type of val is null, undefined, number, string, boolean, return TRUE.
        return val == null || (t !== 'object' && t !== 'function');
    }

    S.mix(S, {
        /**
         * Checks to see if an object is empty.
         * @member KISSY
         */
        isEmptyObject: function (o) {
            for (var p in o) {
                if (p !== undefined) {
                    return false;
                }
            }
            return true;
        },

        /**
         * Gets current date in milliseconds.
         * @method
         * refer:  https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Date/now
         * http://j-query.blogspot.com/2011/02/timing-ecmascript-5-datenow-function.html
         * http://kangax.github.com/es5-compat-table/
         * @member KISSY
         * @return {Number} current time
         */
        now: Date.now || function () {
            return +new Date();
        },

        isArray: function (obj) {
            return toString.call(obj) === '[object Array]';
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
         * Get all the property names of o as array
         * @param {Object} o
         * @return {Array}
         * @member KISSY
         */
        keys: Object.keys || function (o) {
            var result = [], p, i;

            for (p in o) {
                // S.keys(new XX())
                if (o.hasOwnProperty(p)) {
                    result.push(p);
                }
            }

            if (hasEnumBug) {
                for (i = enumProperties.length - 1; i >= 0; i--) {
                    p = enumProperties[i];
                    if (o.hasOwnProperty(p)) {
                        result.push(p);
                    }
                }
            }

            return result;
        },
        /**
         * Executes the supplied function on each item in the array.
         * @param object {Object} the object to iterate
         * @param fn {Function} the function to execute on each item. The function
         *        receives three arguments: the value, the index, the full array.
         * @param {Object} [context]
         * @member KISSY
         */
        each: function (object, fn, context) {
            if (object) {
                var key,
                    val,
                    keys,
                    i = 0,
                    length = object && object.length,
                // do not use typeof obj == 'function': bug in phantomjs
                    isObj = length === undefined || toString.call(object) === '[object Function]';

                context = context || null;

                if (isObj) {
                    keys = S.keys(object);
                    for (; i < keys.length; i++) {
                        key = keys[i];
                        // can not use hasOwnProperty
                        if (fn.call(context, object[key], key, object) === false) {
                            break;
                        }
                    }
                } else {
                    for (val = object[0];
                         i < length; val = object[++i]) {
                        if (fn.call(context, val, i, object) === false) {
                            break;
                        }
                    }
                }
            }
            return object;
        },

        /**
         * Creates a serialized string of an array or object.
         *
         * for example:
         *     @example
         *     {foo: 1, bar: 2}    // -> 'foo=1&bar=2'
         *     {foo: 1, bar: [2, 3]}    // -> 'foo=1&bar=2&bar=3'
         *     {foo: '', bar: 2}    // -> 'foo=&bar=2'
         *     {foo: undefined, bar: 2}    // -> 'foo=undefined&bar=2'
         *     {foo: TRUE, bar: 2}    // -> 'foo=TRUE&bar=2'
         *
         * @param {Object} o json data
         * @param {String} [sep='&'] separator between each pair of data
         * @param {String} [eq='='] separator between key and value of data
         * @param {Boolean} [serializeArray=true] whether add '[]' to array key of data
         * @return {String}
         * @member KISSY
         */
        param: function (o, sep, eq, serializeArray) {
            sep = sep || SEP;
            eq = eq || EQ;
            if (serializeArray === undefined) {
                serializeArray = TRUE;
            }
            var buf = [], key, i, v, len, val,
                encode = S.urlEncode;
            for (key in o) {

                val = o[key];
                key = encode(key);

                // val is valid non-array value
                if (isValidParamValue(val)) {
                    buf.push(key);
                    if (val !== undefined) {
                        buf.push(eq, encode(val + EMPTY));
                    }
                    buf.push(sep);
                } else if (S.isArray(val) && val.length) {
                    // val is not empty array
                    for (i = 0, len = val.length; i < len; ++i) {
                        v = val[i];
                        if (isValidParamValue(v)) {
                            buf.push(key, (serializeArray ? encode('[]') : EMPTY));
                            if (v !== undefined) {
                                buf.push(eq, encode(v + EMPTY));
                            }
                            buf.push(sep);
                        }
                    }
                }
                // ignore other cases, including empty array, Function, RegExp, Date etc.

            }
            buf.pop();
            return buf.join(EMPTY);
        },

        /**
         * Parses a URI-like query string and returns an object composed of parameter/value pairs.
         *
         * for example:
         *      @example
         *      'section=blog&id=45'        // -> {section: 'blog', id: '45'}
         *      'section=blog&tag=js&tag=doc' // -> {section: 'blog', tag: ['js', 'doc']}
         *      'tag=ruby%20on%20rails'        // -> {tag: 'ruby on rails'}
         *      'id=45&raw'        // -> {id: '45', raw: ''}
         * @param {String} str param string
         * @param {String} [sep='&'] separator between each pair of data
         * @param {String} [eq='='] separator between key and value of data
         * @return {Object} json data
         * @member KISSY
         */
        unparam: function (str, sep, eq) {
            if (typeof str !== 'string' || !(str = S.trim(str))) {
                return {};
            }
            sep = sep || SEP;
            eq = eq || EQ;
            var ret = {},
                eqIndex,
                decode = S.urlDecode,
                pairs = str.split(sep),
                key, val,
                i = 0, len = pairs.length;

            for (; i < len; ++i) {
                eqIndex = pairs[i].indexOf(eq);
                if (eqIndex === -1) {
                    key = decode(pairs[i]);
                    val = undefined;
                } else {
                    // remember to decode key!
                    key = decode(pairs[i].substring(0, eqIndex));
                    val = pairs[i].substring(eqIndex + 1);
                    try {
                        val = decode(val);
                    } catch (e) {
                        logger.error('decodeURIComponent error : ' + val);
                        logger.error(e);
                    }
                    if (S.endsWith(key, '[]')) {
                        key = key.substring(0, key.length - 2);
                    }
                }
                if (key in ret) {
                    if (S.isArray(ret[key])) {
                        ret[key].push(val);
                    } else {
                        ret[key] = [ret[key], val];
                    }
                } else {
                    ret[key] = val;
                }
            }
            return ret;
        }
    });
})(KISSY);