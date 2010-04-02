/**
 * @module  lang
 * @author  lifesinger@gmail.com
 * @depends kissy
 */

KISSY.add('lang', function(S, undefined) {

    var AP = Array.prototype,
        forEach = AP.forEach,
        indexOf = AP.indexOf,
        slice = AP.slice,
        REG_TRIM = /^\s+|\s+$/g,
        toString = Object.prototype.toString,
        encode = encodeURIComponent,
        decode = decodeURIComponent;

    S.mix(S, {

        /**
         * Executes the supplied function on each item in the array.
         * @param {array} arr the array to iterate
         * @param {function} fn the function to execute on each item. The function
         * receives three arguments: the value, the index, the full array.
         * @param {object} context optional context object
         */
        each: forEach ?
              function (arr, fn, context) {
                  forEach.call(arr, fn, context);
                  return this;
              } :
              function(arr, fn, context) {
                  var l = (arr && arr.length) || 0, i;
                  for (i = 0; i < l; ++i) {
                      fn.call(context || this, arr[i], i, arr);
                  }
                  return this;
              },

        /**
         * Remove the whitespace from the beginning and end of a string.
         * @param {string} str
         */
        trim: String.prototype.trim ?
              function(str) {
                  return (str || '').trim();
              } :
              function(str) {
                  return (str || '').replace(REG_TRIM, '');
              },

        // NOTE: DOM methods and functions like alert aren't supported. They return false on IE.
        isFunction: function(obj) {
            return toString.call(obj) === '[object Function]';
        },

        isArray: function(obj) {
            return toString.call(obj) === '[object Array]';
        },

        /**
         * Search for a specified value within an array.
         */
        inArray: indexOf ?
                 function(elem, arr) {
                     return indexOf.call(arr, elem) !== -1;
                 } :
                 function(elem, arr) {
                     for (var i = 0, len = arr.length; i < len; ++i) {
                         if (arr[i] === elem) {
                             return true;
                         }
                     }
                     return false;
                 },

        makeArray: function(obj) {
            if (obj === null) return [];
            if (S.isArray(obj)) return obj;

            // The strings and functions also have 'length'
            if (typeof obj.length !== 'number' || typeof obj === 'string' || S.isFunction(obj)) {
                return [obj];
            }

            // ie 不支持用 slice 转换 NodeList, 降级到普通方法
            if (obj.item && S.UA.ie) {
                var ret = [], i = 0, len = obj.length;
                for (; i < len; ++i) {
                    ret[i] = obj[i];
                }
                return ret;
            }

            // array-like
            return slice.call(obj);

        },

        /**
         * Takes an object and converts it to an encoded URI-like param string.
         * <pre>
         *     {foo: 1, bar: 2}    // -> 'foo=1&bar=2'
         *     {foo: 1, bar: [2, 3]}    // -> 'foo=1&bar=2&bar=3'
         *     {foo: '', bar: 2}    // -> 'foo=&bar=2'
         *     {foo: undefined, bar: 2}    // -> 'foo=&bar=2'
         * </pre>
         */
        param: function(o) {
            if (!o) return '';

            var buf = [], key, val, type;

            for (key in o) {
                val = o[key]; key = encode(key); type = typeof val;

                if (type === 'undefined') {
                    buf.push(key, '=&');
                }
                else if (type !== 'function' && type !== 'object') {
                    buf.push(key, '=', encode(val), '&');
                }
                else if (S.isArray(val)) {
                    if (val.length) {
                        for (var i = 0, len = val.length; i < len; i++) {
                            var t = typeof val[i];
                            if (t != 'function' && t != 'object') {
                                buf.push(key, '=', encode(val[i] === undefined ? '' : val[i]), '&');
                            }
                        }
                    }
                    else {
                        buf.push(key, '=&');
                    }
                }
            }

            buf.pop();
            return buf.join('');
        },

        /**
         * Parses a URI-like query string and returns an object composed of parameter/value pairs.
         * This method is realy targeted at parsing query strings (hence the default value of "&" for the separator argument).
         * For this reason, it does not consider anything that is either before a question
         * mark (which signals the beginning of a query string) or beyond the hash symbol ("#"),
         * and runs decodeURIComponent() on each parameter/value pair.
         * Note that parameters which do not have a specified value will be set to undefined.
         * <code>
         | 'section=blog&id=45'        // -> {section: 'blog', id: '45'}
         |
         | 'section=blog;id=45', false, ';'        // -> {section: 'blog', id: '45'}
         |
         | 'http://www.example.com?section=blog&id=45#comments'        // -> {section: 'blog', id: '45'}
         |
         | 'section=blog&tag=javascript&tag=prototype&tag=doc'
         | // -> {section: 'blog', tag: ['javascript', 'prototype', 'doc']}
         |
         | 'tag=ruby%20on%20rails'        // -> {tag: 'ruby on rails'}
         |
         | 'id=45&raw'        // -> {id: '45', raw: undefined}
         * </code>
         * @param {String} string
         * @param {Boolean} overwrite (optional) Items of the same name will overwrite previous values instead of creating an an array (Defaults to false).
         * @return {Object} A literal with members
         */
        unparam: function(string, overwrite, separator) {
            if (!string || !string.length) return { };

            var match = string.trim().match(/([^?#]*)(#.*)?$/);
            if (!match) return { };

            var obj = { };
            var pairs = match[1].split(separator || '&');

            var pair, name, value;
            for (var i = 0, len = pairs.length; i < len; ++i) {
                pair = pairs[i].split('=');
                name = decode(pair[0]);
                value = decode(pair[1]);
                if (value === '' || value === 'undefined') value = undefined; // &k 鍜?&k= 閮借繕鍘熸垚 undefined

                if (overwrite !== true) {
                    if (typeof obj[name] == 'undefined') {
                        obj[name] = value;
                    } else if (typeof obj[name] == 'string') {
                        obj[name] = [obj[name]];
                        obj[name].push(value);
                    } else {
                        obj[name].push(value);
                    }
                } else {
                    obj[name] = value;
                }
            }
            return obj;
        }
    });
});

/**
 * Notes:
 *
 *  2010.04
 *   - param 和 unparam 应该放在什么地方合适？有点纠结，目前暂放此处。
 *
 */
