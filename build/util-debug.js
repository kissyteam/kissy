/*
Copyright 2014, KISSY v5.0.0
MIT Licensed
build time: Jul 30 15:21
*/
/*
combined modules:
util
util/array
util/base
util/escape
util/function
util/object
util/string
util/type
util/json
util/web
*/
KISSY.add('util', [
    './util/array',
    './util/escape',
    './util/function',
    './util/object',
    './util/string',
    './util/type',
    './util/json',
    './util/web',
    './util/base'
], function (S, require, exports, module) {
    /**
 * @ignore
 * util from KISSY
 * @author  yiminghe@gmail.com
 */
    require('./util/array');
    require('./util/escape');
    require('./util/function');
    require('./util/object');
    require('./util/string');
    require('./util/type');
    require('./util/json');
    require('./util/web');
    module.exports = require('./util/base');
});
KISSY.add('util/array', ['./base'], function (S, require, exports, module) {
    /**
 * @ignore
 * array utilities of lang
 * @author yiminghe@gmail.com
 */
    var TRUE = true, undef, AP = Array.prototype, indexOf = AP.indexOf, lastIndexOf = AP.lastIndexOf, filter = AP.filter, every = AP.every, some = AP.some, util = require('./base'), map = AP.map, FALSE = false;
    util.mix(util, {
        /**
     * Search for a specified value within an array.
     * @param item individual item to be searched
     * @method
     * @member KISSY
     * @param {Array} arr the array of items where item will be search
     * @return {number} item's index in array
     */
        indexOf: indexOf ? function (item, arr, fromIndex) {
            return fromIndex === undef ? indexOf.call(arr, item) : indexOf.call(arr, item, fromIndex);
        } : function (item, arr, fromIndex) {
            for (var i = fromIndex || 0, len = arr.length; i < len; ++i) {
                if (arr[i] === item) {
                    return i;
                }
            }
            return -1;
        },
        /**
     * Returns the index of the last item in the array
     * that contains the specified value, -1 if the
     * value isn't found.
     * @method
     * @param item individual item to be searched
     * @param {Array} arr the array of items where item will be search
     * @return {number} item's last index in array
     * @member KISSY
     */
        lastIndexOf: lastIndexOf ? function (item, arr, fromIndex) {
            return fromIndex === undef ? lastIndexOf.call(arr, item) : lastIndexOf.call(arr, item, fromIndex);
        } : function (item, arr, fromIndex) {
            if (fromIndex === undef) {
                fromIndex = arr.length - 1;
            }
            for (var i = fromIndex; i >= 0; i--) {
                if (arr[i] === item) {
                    break;
                }
            }
            return i;
        },
        /**
     * Returns a copy of the array with the duplicate entries removed
     * @param a {Array} the array to find the subset of unique for
     * @param [override] {Boolean} if override is TRUE, util.unique([a, b, a]) => [b, a].
     * if override is FALSE, util.unique([a, b, a]) => [a, b]
     * @return {Array} a copy of the array with duplicate entries removed
     * @member KISSY
     */
        unique: function (a, override) {
            var b = a.slice();
            if (override) {
                b.reverse();
            }
            var i = 0, n, item;
            while (i < b.length) {
                item = b[i];
                while ((n = util.lastIndexOf(item, b)) !== i) {
                    b.splice(n, 1);
                }
                i += 1;
            }
            if (override) {
                b.reverse();
            }
            return b;
        },
        /**
     * Search for a specified value index within an array.
     * @param item individual item to be searched
     * @param {Array} arr the array of items where item will be search
     * @return {Boolean} the item exists in arr
     * @member KISSY
     */
        inArray: function (item, arr) {
            return util.indexOf(item, arr) > -1;
        },
        /**
     * Executes the supplied function on each item in the array.
     * Returns a new array containing the items that the supplied
     * function returned TRUE for.
     * @member KISSY
     * @method
     * @param arr {Array} the array to iterate
     * @param fn {Function} the function to execute on each item
     * @param [context] {Object} optional context object
     * @return {Array} The items on which the supplied function returned TRUE.
     * If no items matched an empty array is returned.
     */
        filter: filter ? function (arr, fn, context) {
            return filter.call(arr, fn, context || this);
        } : function (arr, fn, context) {
            var ret = [];
            util.each(arr, function (item, i, arr) {
                if (fn.call(context || this, item, i, arr)) {
                    ret.push(item);
                }
            });
            return ret;
        },
        /**
     * Executes the supplied function on each item in the array.
     * Returns a new array containing the items that the supplied
     * function returned for.
     * @method
     * @param arr {Array} the array to iterate
     * @param fn {Function} the function to execute on each item
     * @param [context] {Object} optional context object
     * refer: https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Array/map
     * @return {Array} The items on which the supplied function returned
     * @member KISSY
     */
        map: map ? function (arr, fn, context) {
            return map.call(arr, fn, context || this);
        } : function (arr, fn, context) {
            var len = arr.length, res = new Array(len);
            for (var i = 0; i < len; i++) {
                var el = typeof arr === 'string' ? arr.charAt(i) : arr[i];
                if (el || //ie<9 in invalid when typeof arr == string
                    i in arr) {
                    res[i] = fn.call(context || this, el, i, arr);
                }
            }
            return res;
        },
        /**
     * Executes the supplied function on each item in the array.
     * Returns a value which is accumulation of the value that the supplied
     * function returned.
     *
     * @param arr {Array} the array to iterate
     * @param callback {Function} the function to execute on each item
     * @param initialValue {number} optional context object
     * refer: https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/array/reduce
     * @return {Array} The items on which the supplied function returned
     * @member KISSY
     */
        reduce: function (arr, callback, initialValue) {
            var len = arr.length;
            if (typeof callback !== 'function') {
                throw new TypeError('callback is not function!');
            }    // no value to return if no initial value and an empty array
            // no value to return if no initial value and an empty array
            if (len === 0 && arguments.length === 2) {
                throw new TypeError('arguments invalid');
            }
            var k = 0;
            var accumulator;
            if (arguments.length >= 3) {
                accumulator = initialValue;
            } else {
                do {
                    if (k in arr) {
                        accumulator = arr[k++];
                        break;
                    }    // if array contains no values, no initial value to return
                    // if array contains no values, no initial value to return
                    k += 1;
                    if (k >= len) {
                        throw new TypeError();
                    }
                } while (TRUE);
            }
            while (k < len) {
                if (k in arr) {
                    accumulator = callback.call(undef, accumulator, arr[k], k, arr);
                }
                k++;
            }
            return accumulator;
        },
        /**
     * Tests whether all elements in the array pass the test implemented by the provided function.
     * @method
     * @param arr {Array} the array to iterate
     * @param callback {Function} the function to execute on each item
     * @param [context] {Object} optional context object
     * @member KISSY
     * @return {Boolean} whether all elements in the array pass the test implemented by the provided function.
     */
        every: every ? function (arr, fn, context) {
            return every.call(arr, fn, context || this);
        } : function (arr, fn, context) {
            var len = arr && arr.length || 0;
            for (var i = 0; i < len; i++) {
                if (i in arr && !fn.call(context, arr[i], i, arr)) {
                    return FALSE;
                }
            }
            return TRUE;
        },
        /**
     * Tests whether some element in the array passes the test implemented by the provided function.
     * @method
     * @param arr {Array} the array to iterate
     * @param callback {Function} the function to execute on each item
     * @param [context] {Object} optional context object
     * @member KISSY
     * @return {Boolean} whether some element in the array passes the test implemented by the provided function.
     */
        some: some ? function (arr, fn, context) {
            return some.call(arr, fn, context || this);
        } : function (arr, fn, context) {
            var len = arr && arr.length || 0;
            for (var i = 0; i < len; i++) {
                if (i in arr && fn.call(context, arr[i], i, arr)) {
                    return TRUE;
                }
            }
            return FALSE;
        },
        /**
     * Converts object to a TRUE array.
     * do not pass form.elements to this function ie678 bug.
     * passing arguments is not recommended.
     * https://github.com/petkaantonov/bluebird/wiki/Optimization-killers
     * @param o {object|Array} array like object or array
     * @return {Array} native Array
     * @member KISSY
     */
        makeArray: function (o) {
            if (o == null) {
                return [];
            }
            if (util.isArray(o)) {
                return o;
            }
            var lengthType = typeof o.length, oType = typeof o;    // The strings and functions also have 'length'
            // The strings and functions also have 'length'
            if (lengthType !== 'number' || // select element
                // https://github.com/kissyteam/kissy/issues/537
                typeof o.nodeName === 'string' || // window
                /*jshint eqeqeq:false*/
                o != null && o == o.window || oType === 'string' || // https://github.com/ariya/phantomjs/issues/11478
                oType === 'function' && !('item' in o && lengthType === 'number')) {
                return [o];
            }
            var ret = [];
            for (var i = 0, l = o.length; i < l; i++) {
                ret[i] = o[i];
            }
            return ret;
        }
    });
});
KISSY.add('util/base', [], function (S, require, exports, module) {
    var guid = 0, EMPTY = '';
    module.exports = {
        mix: function (to, from) {
            for (var i in from) {
                to[i] = from[i];
            }
            return to;
        },
        /*
     * Generate a global unique id.
     * @param {String} [pre] guid prefix
     * @return {String} the guid
     */
        guid: function (pre) {
            return (pre || EMPTY) + guid++;
        }
    };
});
KISSY.add('util/escape', ['./base'], function (S, require, exports, module) {
    /**
 * @ignore
 * escape of lang
 * @author yiminghe@gmail.com
 */
    var util = require('./base');    // IE doesn't include non-breaking-space (0xa0) in their \s character
                                     // class (as required by section 7.2 of the ECMAScript spec), we explicitly
                                     // include it in the regexp to enforce consistent cross-browser behavior.
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
            '&#x27;': '\''
        }, reverseEntities = {}, escapeHtmlReg, unEscapeHtmlReg, possibleEscapeHtmlReg = /[&<>"'`]/,
        // - # $ ^ * ( ) + [ ] { } | \ , . ?
        escapeRegExp = /[\-#$\^*()+\[\]{}|\\,.?\s]/g;
    (function () {
        for (var k in htmlEntities) {
            reverseEntities[htmlEntities[k]] = k;
        }
    }());
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
});
KISSY.add('util/function', ['./base'], function (S, require, exports, module) {
    /**
 * @ignore
 * function utilities of lang
 * @author yiminghe@gmail.com
 */
    var util = require('./base');    // ios Function.prototype.bind === undefine
    // ios Function.prototype.bind === undefine
    function bindFn(r, fn, obj) {
        function FNOP() {
        }
        var slice = [].slice, args = slice.call(arguments, 3), bound = function () {
                var inArgs = slice.call(arguments);
                return fn.apply(this instanceof FNOP ? this : // fix: y.x=util.bind(fn);
                obj || this, r ? inArgs.concat(args) : args.concat(inArgs));
            };
        FNOP.prototype = fn.prototype;
        bound.prototype = new FNOP();
        return bound;
    }
    util.mix(util, {
        /**
     * empty function
     * @member KISSY
     */
        noop: function () {
        },
        /**
     * Creates a new function that, when called, itself calls this function in the context of the provided this value,
     * with a given sequence of arguments preceding any provided when the new function was called.
     * refer: https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Function/bind
     * @param {Function} fn internal called function
     * @param {Object} obj context in which fn runs
     * @param {*...} var_args extra arguments
     * @member KISSY
     * @return {Function} new function with context and arguments
     */
        bind: bindFn(0, bindFn, null, 0),
        /**
     * Creates a new function that, when called, itself calls this function in the context of the provided this value,
     * with a given sequence of arguments preceding any provided when the new function was called.
     * refer: https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Function/bind
     * @param {Function} fn internal called function
     * @param {Object} obj context in which fn runs
     * @param {*...} var_args extra arguments
     * @member KISSY
     * @return {Function} new function with context and arguments
     */
        rbind: bindFn(0, bindFn, null, 1),
        /**
     * Executes the supplied function in the context of the supplied
     * object 'when' milliseconds later. Executes the function a
     * single time unless periodic is set to true.
     *
     * @param fn {Function|String} the function to execute or the name of the method in
     * the 'o' object to execute.
     *
     * @param [when=0] {Number} the number of milliseconds to wait until the fn is executed.
     *
     * @param {Boolean} [periodic] if true, executes continuously at supplied interval
     * until canceled.
     *
     * @param {Object} [context] the context object.
     *
     * @param [data] that is provided to the function. This accepts either a single
     * item or an array. If an array is provided, the function is executed with
     * one parameter for each array item. If you need to pass a single array
     * parameter, it needs to be wrapped in an array.
     *
     * @return {Object} a timer object. Call the cancel() method on this object to stop
     * the timer.
     *
     * @member KISSY
     */
        later: function (fn, when, periodic, context, data) {
            when = when || 0;
            var m = fn, d = util.makeArray(data), f, r;
            if (typeof fn === 'string') {
                m = context[fn];
            }
            if (!m) {
                util.error('method undefine');
            }
            f = function () {
                m.apply(context, d);
            };
            r = periodic ? setInterval(f, when) : setTimeout(f, when);
            return {
                id: r,
                interval: periodic,
                cancel: function () {
                    if (this.interval) {
                        clearInterval(r);
                    } else {
                        clearTimeout(r);
                    }
                }
            };
        },
        /**
     * Throttles a call to a method based on the time between calls.
     * @param {Function} fn The function call to throttle.
     * @param {Object} [context] context fn to run
     * @param {Number} [ms] The number of milliseconds to throttle the method call.
     * Passing a -1 will disable the throttle. Defaults to 150.
     * @return {Function} Returns a wrapped function that calls fn throttled.
     * @member KISSY
     */
        throttle: function (fn, ms, context) {
            ms = ms || 150;
            if (ms === -1) {
                return function () {
                    fn.apply(context || this, arguments);
                };
            }
            var last = util.now();
            return function () {
                var now = util.now();
                if (now - last > ms) {
                    last = now;
                    fn.apply(context || this, arguments);
                }
            };
        },
        /**
     * buffers a call between a fixed time
     * @param {Function} fn
     * @param {Number} ms
     * @param {Object} [context]
     * @return {Function} Returns a wrapped function that calls fn buffered.
     * @member KISSY
     */
        buffer: function (fn, ms, context) {
            ms = ms || 150;
            if (ms === -1) {
                return function () {
                    fn.apply(context || this, arguments);
                };
            }
            var bufferTimer = null;
            function f() {
                f.stop();
                bufferTimer = util.later(fn, ms, 0, context || this, arguments);
            }
            f.stop = function () {
                if (bufferTimer) {
                    bufferTimer.cancel();
                    bufferTimer = 0;
                }
            };
            return f;
        }
    });
});
KISSY.add('util/object', [
    './base',
    'logger-manager'
], function (S, require, exports, module) {
    /**
 * @ignore
 * object utilities of lang
 * @author yiminghe@gmail.com
 */
    var util = require('./base');
    var LoggerManager = require('logger-manager');
    var logger = LoggerManager.getLogger('util');
    var undef;
    var MIX_CIRCULAR_DETECTION = '__MIX_CIRCULAR';
    var STAMP_MARKER = '__~ks_stamped';
    var host = typeof window === 'undefined' ? global : window;
    var CLONE_MARKER = '__~ks_cloned';
    var toString = {}.toString;
    var COMPARE_MARKER = '__~ks_compared';
    var Obj = Object;
    var objectCreate = Obj.create;    // bug in native ie678, not in simulated ie9
    // bug in native ie678, not in simulated ie9
    var hasEnumBug = !{ toString: 1 }.propertyIsEnumerable('toString');
    var enumProperties = [
            'constructor',
            'hasOwnProperty',
            'isPrototypeOf',
            'propertyIsEnumerable',
            'toString',
            'toLocaleString',
            'valueOf'
        ];
    function hasKey(obj, keyName) {
        return obj !== null && obj !== undef && obj[keyName] !== undef;
    }
    function cleanAndReturn(a, b, ret) {
        delete a[COMPARE_MARKER];
        delete b[COMPARE_MARKER];
        return ret;
    }
    function compareObjects(a, b) {
        // avoid circular reference
        if (a[COMPARE_MARKER] === b && b[COMPARE_MARKER] === a) {
            return true;
        }
        a[COMPARE_MARKER] = b;
        b[COMPARE_MARKER] = a;
        for (var property in b) {
            if (!hasKey(a, property) && hasKey(b, property)) {
                return cleanAndReturn(a, b, false);    // mismatchKeys.push('expected has key ' + property + '", but missing from actual.');
            }
        }
        // mismatchKeys.push('expected has key ' + property + '", but missing from actual.');
        for (property in a) {
            if (!hasKey(b, property) && hasKey(a, property)) {
                return cleanAndReturn(a, b, false);    // mismatchKeys.push('expected missing key "' + property + '", but present in actual.');
            }
        }
        // mismatchKeys.push('expected missing key "' + property + '", but present in actual.');
        for (property in b) {
            if (property === COMPARE_MARKER) {
                continue;
            }
            if (!util.equals(a[property], b[property])) {
                return cleanAndReturn(a, b, false);    //                mismatchValues.push('"' + property + '" was "' +
                                                       //                    (b[property] ? (b[property].toString()) : b[property]) +
                                                       //                    '" in expected, but was "' +
                                                       //                    (a[property] ? (a[property].toString()) : a[property]) + '" in actual.');
            }
        }
        //                mismatchValues.push('"' + property + '" was "' +
        //                    (b[property] ? (b[property].toString()) : b[property]) +
        //                    '" in expected, but was "' +
        //                    (a[property] ? (a[property].toString()) : a[property]) + '" in actual.');
        if (util.isArray(a) && util.isArray(b) && a.length !== b.length) {
            return cleanAndReturn(a, b, false);    // mismatchValues.push('arrays were not the same length');
        }
        // mismatchValues.push('arrays were not the same length');
        return cleanAndReturn(a, b, true);
    }
    mix(util, {
        /**
     * Checks to see whether two object are equals.
     * @param a
     * @param b
     * @member KISSY
     */
        equals: function (a, b) {
            if (a === b) {
                return true;
            }
            if (a === undef || a === null || b === undef || b === null) {
                // need type coercion
                return a == null && b == null;
            }
            if (a instanceof Date && b instanceof Date) {
                return a.getTime() === b.getTime();
            }
            if (typeof a === 'string' && typeof b === 'string') {
                return a === b;
            }
            if (typeof a === 'number' && typeof b === 'number') {
                return a === b;
            }
            if (typeof a === 'object' && typeof b === 'object') {
                return compareObjects(a, b);
            }    // Straight check
            // Straight check
            return a === b;
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
                // util.keys(new XX())
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
                var key, val, keys, i = 0, length = object && object.length,
                    // do not use typeof obj == 'function': bug in phantomjs
                    isObj = length === undef || toString.call(object) === '[object Function]';
                context = context || null;
                if (isObj) {
                    keys = util.keys(object);
                    for (; i < keys.length; i++) {
                        key = keys[i];    // can not use hasOwnProperty
                        // can not use hasOwnProperty
                        if (fn.call(context, object[key], key, object) === false) {
                            break;
                        }
                    }
                } else {
                    for (val = object[0]; i < length; val = object[++i]) {
                        if (fn.call(context, val, i, object) === false) {
                            break;
                        }
                    }
                }
            }
            return object;
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
        /**
     * Checks to see if an object is empty.
     * @member KISSY
     */
        isEmptyObject: function (o) {
            for (var p in o) {
                if (p !== undef) {
                    return false;
                }
            }
            return true;
        },
        /**
     * stamp a object by guid
     * @param {Object} o object needed to be stamped
     * @param {Boolean} [readOnly] while set marker on o if marker does not exist
     * @param {String} [marker] the marker will be set on Object
     * @return {String} guid associated with this object
     * @member KISSY
     */
        stamp: function (o, readOnly, marker) {
            marker = marker || STAMP_MARKER;
            var guid = o[marker];
            if (guid) {
                return guid;
            } else if (!readOnly) {
                try {
                    guid = o[marker] = util.guid(marker);
                } catch (e) {
                    guid = undef;
                }
            }
            return guid;
        },
        /**
     * Copies all the properties of s to r.
     * @method
     * @param {Object} r the augmented object
     * @param {Object} s the object need to augment
     * @param {Boolean|Object} [ov=true] whether overwrite existing property or config.
     * @param {Boolean} [ov.overwrite=true] whether overwrite existing property.
     * @param {String[]|Function} [ov.whitelist] array of white-list properties
     * @param {Boolean}[ov.deep=false] whether recursive mix if encounter object.
     * @param {String[]|Function} [wl] array of white-list properties
     * @param [deep=false] {Boolean} whether recursive mix if encounter object.
     * @return {Object} the augmented object
     * @member KISSY
     *
     *     @example
     *     var t = {};
     *     util.mix({x: {y: 2, z: 4}}, {x: {y: 3, a: t}}, {deep: true}) => {x: {y: 3, z: 4, a: {}}}, a !== t
     *     util.mix({x: {y: 2, z: 4}}, {x: {y: 3, a: t}}, {deep: true, overwrite: false}) => {x: {y: 2, z: 4, a: {}}}, a !== t
     *     util.mix({x: {y: 2, z: 4}}, {x: {y: 3, a: t}}, 1) => {x: {y: 3, a: t}}
     */
        mix: function (r, s, ov, wl, deep) {
            var structured;
            if (typeof ov === 'object') {
                wl = /**
             @ignore
             @type {String[]|Function}
             */
                ov.whitelist;
                deep = ov.deep;
                structured = ov.structured;
                ov = ov.overwrite;
            }
            if (wl && typeof wl !== 'function') {
                var originalWl = wl;
                wl = function (name, val) {
                    return util.inArray(name, originalWl) ? val : undef;
                };
            }
            if (ov === undef) {
                ov = true;
            }
            if (structured === undef) {
                structured = true;
            }
            var cache = [];
            var i = 0;
            var c;
            mixInternal(r, s, ov, wl, deep, cache, structured);
            while (c = cache[i++]) {
                delete c[MIX_CIRCULAR_DETECTION];
            }
            return r;
        },
        /**
     * Returns a new object containing all of the properties of
     * all the supplied objects. The properties from later objects
     * will overwrite those in earlier objects. Passing in a
     * single object will create a shallow copy of it.
     * @param {...Object} varArgs objects need to be merged
     * @return {Object} the new merged object
     * @member KISSY
     */
        merge: function (varArgs) {
            varArgs = util.makeArray(arguments);
            var o = {}, i, l = varArgs.length;
            for (i = 0; i < l; i++) {
                util.mix(o, varArgs[i]);
            }
            return o;
        },
        /**
     * Applies prototype properties from the supplier to the receiver.
     * @param   {Object} r received object
     * @param   {...Object} varArgs object need to  augment
     *          {Boolean} [ov=true] whether overwrite existing property
     *          {String[]} [wl] array of white-list properties
     * @return  {Object} the augmented object
     * @member KISSY
     */
        augment: function (r, varArgs) {
            var args = util.makeArray(arguments), len = args.length - 2, i = 1, proto, arg, ov = args[len], wl = args[len + 1];
            args[1] = varArgs;
            if (!util.isArray(wl)) {
                ov = wl;
                wl = undef;
                len++;
            }
            if (typeof ov !== 'boolean') {
                ov = undef;
                len++;
            }
            for (; i < len; i++) {
                arg = args[i];
                if (proto = arg.prototype) {
                    arg = util.mix({}, proto, true, removeConstructor);
                }
                util.mix(r.prototype, arg, ov, wl);
            }
            return r;
        },
        /**
     * Utility to set up the prototype, constructor and superclass properties to
     * support an inheritance strategy that can chain constructors and methods.
     * Static members will not be inherited.
     * @param r {Function} the object to modify
     * @param s {Function} the object to inherit
     * @param {Object} [px] prototype properties to add/override
     * @param {Object} [sx] static properties to add/override
     * @return r {Object}
     * @member KISSY
     */
        extend: function (r, s, px, sx) {
            if ('@DEBUG@') {
                if (!r) {
                    logger.error('extend r is null');
                }
                if (!s) {
                    logger.error('extend s is null');
                }
                if (!s || !r) {
                    return r;
                }
            }
            var sp = s.prototype, rp;    // in case parent does not set constructor
                                         // eg: parent.prototype={};
            // in case parent does not set constructor
            // eg: parent.prototype={};
            sp.constructor = s;    // add prototype chain
            // add prototype chain
            rp = createObject(sp, r);
            r.prototype = util.mix(rp, r.prototype);
            r.superclass = sp;    // add prototype overrides
            // add prototype overrides
            if (px) {
                util.mix(rp, px);
            }    // add object overrides
            // add object overrides
            if (sx) {
                util.mix(r, sx);
            }
            return r;
        },
        /**
     * Returns the namespace specified and creates it if it doesn't exist. Be careful
     * when naming packages. Reserved words may work in some browsers and not others.
     *
     *      @example
     *      util.namespace('app.Shop',a); // returns a.app.Shop
     *      util.namespace('app.Shop'); // returns app.Shop
     *
     * @return {Object}  A reference to the last namespace object created
     * @member KISSY
     */
        namespace: function (name, holder) {
            var o, j, p;
            p = name.split('.');
            o = holder || host;
            for (j = 0; j < p.length; ++j) {
                o = o[p[j]] = o[p[j]] || {};
            }
            return o;
        },
        /**
     * Creates a deep copy of a plain object or array. Others are returned untouched.
     * @param input
     * @member KISSY
     * @param {Function} [filter] filter function
     * @return {Object} the new cloned object
     * refer: http://www.w3.org/TR/html5/common-dom-interfaces.html#safe-passing-of-structured-data
     */
        clone: function (input, filter) {
            // 稍微改改就和规范一样了 :)
            // Let memory be an association list of pairs of objects,
            // initially empty. This is used to handle duplicate references.
            // In each pair of objects, one is called the source object
            // and the other the destination object.
            var structured;
            if (typeof filter === 'object') {
                structured = filter.structured;
                filter = filter.filter;
            }
            if (structured === undef) {
                structured = true;
            }
            var memory;
            if (structured) {
                memory = {};
            }
            var ret = cloneInternal(input, filter, memory, structured);
            if (structured) {
                util.each(memory, function (v) {
                    // 清理在源对象上做的标记
                    v = v.input;
                    if (v[CLONE_MARKER]) {
                        try {
                            delete v[CLONE_MARKER];
                        } catch (e) {
                            v[CLONE_MARKER] = undef;
                        }
                    }
                });
            }
            memory = null;
            return ret;
        }
    });
    function Empty() {
    }
    function createObject(proto, constructor) {
        var newProto;
        if (objectCreate) {
            newProto = objectCreate(proto);
        } else {
            Empty.prototype = proto;
            newProto = new Empty();
        }
        newProto.constructor = constructor;
        return newProto;
    }
    function mix(r, s) {
        for (var i in s) {
            r[i] = s[i];
        }
    }
    function mixInternal(r, s, ov, wl, deep, cache, structured) {
        if (!s || !r) {
            return r;
        }
        var i, p, keys, len;    // 记录循环标志
        // 记录循环标志
        s[MIX_CIRCULAR_DETECTION] = r;    // 记录被记录了循环标志的对像
        // 记录被记录了循环标志的对像
        cache.push(s);    // mix all properties
        // mix all properties
        keys = util.keys(s);
        len = keys.length;
        for (i = 0; i < len; i++) {
            p = keys[i];
            if (p !== MIX_CIRCULAR_DETECTION) {
                // no hasOwnProperty judge!
                _mix(p, r, s, ov, wl, deep, cache, structured);
            }
        }
        return r;
    }
    function removeConstructor(k, v) {
        return k === 'constructor' ? undef : v;
    }
    function _mix(p, r, s, ov, wl, deep, cache, structured) {
        // 要求覆盖
        // 或者目的不存在
        // 或者深度mix
        if (ov || !(p in r) || deep) {
            var target = r[p], src = s[p];    // prevent never-end loop
            // prevent never-end loop
            if (target === src) {
                // util.mix({},{x:undef})
                if (target === undef) {
                    r[p] = target;
                }
                return;
            }
            if (wl) {
                src = wl.call(s, p, src);
            }    // 来源是数组和对象，并且要求深度 mix
            // 来源是数组和对象，并且要求深度 mix
            if (deep && src && (util.isArray(src) || util.isPlainObject(src))) {
                if (structured && src[MIX_CIRCULAR_DETECTION]) {
                    r[p] = src[MIX_CIRCULAR_DETECTION];
                } else {
                    // 目标值为对象或数组，直接 mix
                    // 否则 新建一个和源值类型一样的空数组/对象，递归 mix
                    var clone = target && (util.isArray(target) || util.isPlainObject(target)) ? target : util.isArray(src) ? [] : {};
                    r[p] = clone;
                    mixInternal(clone, src, ov, wl, true, cache, structured);
                }
            } else if (src !== undef && (ov || !(p in r))) {
                r[p] = src;
            }
        }
    }
    function cloneInternal(input, f, memory, structured) {
        var destination = input;
        var isArray, isPlainObject, k, stamp;
        if (!input) {
            return destination;
        }    // If input is the source object of a pair of objects in memory,
             // then return the destination object in that pair of objects .
             // and abort these steps.
        // If input is the source object of a pair of objects in memory,
        // then return the destination object in that pair of objects .
        // and abort these steps.
        if (structured && input[CLONE_MARKER]) {
            // 对应的克隆后对象
            return memory[input[CLONE_MARKER]].destination;
        } else if (typeof input === 'object') {
            // 引用类型要先记录
            var Constructor = input.constructor;
            if (util.inArray(Constructor, [
                    Boolean,
                    String,
                    Number,
                    Date,
                    RegExp
                ])) {
                destination = new Constructor(input.valueOf());
            } else if (isArray = util.isArray(input)) {
                // ImageData , File, Blob , FileList .. etc
                destination = f ? util.filter(input, f) : input.concat();
            } else if (isPlainObject = util.isPlainObject(input)) {
                destination = {};
            }
            if (structured) {
                // Add a mapping from input (the source object)
                // to output (the destination object) to memory.
                // 做标记
                // stamp can not be
                input[CLONE_MARKER] = stamp = util.guid('c');    // 存储源对象以及克隆后的对象
                // 存储源对象以及克隆后的对象
                memory[stamp] = {
                    destination: destination,
                    input: input
                };
            }
        }    // If input is an Array object or an Object object,
             // then, for each enumerable property in input,
             // add a new property to output having the same name,
             // and having a value created from invoking the internal structured cloning algorithm recursively
             // with the value of the property as the 'input' argument and memory as the 'memory' argument.
             // The order of the properties in the input and output objects must be the same.
             // clone it
        // If input is an Array object or an Object object,
        // then, for each enumerable property in input,
        // add a new property to output having the same name,
        // and having a value created from invoking the internal structured cloning algorithm recursively
        // with the value of the property as the 'input' argument and memory as the 'memory' argument.
        // The order of the properties in the input and output objects must be the same.
        // clone it
        if (isArray) {
            for (var i = 0; i < destination.length; i++) {
                destination[i] = cloneInternal(destination[i], f, memory, structured);
            }
        } else if (isPlainObject) {
            for (k in input) {
                if (k !== CLONE_MARKER && (!f || f.call(input, input[k], k, input) !== false)) {
                    destination[k] = cloneInternal(input[k], f, memory, structured);
                }
            }
        }
        return destination;
    }
});

KISSY.add('util/string', ['./base'], function (S, require, exports, module) {
    /**
 * @ignore
 * string utilities of lang
 * @author yiminghe@gmail.com
 */
    var util = require('./base');
    var undef;    // IE doesn't include non-breaking-space (0xa0) in their \s character
                  // class (as required by section 7.2 of the ECMAScript spec), we explicitly
                  // include it in the regexp to enforce consistent cross-browser behavior.
    // IE doesn't include non-breaking-space (0xa0) in their \s character
    // class (as required by section 7.2 of the ECMAScript spec), we explicitly
    // include it in the regexp to enforce consistent cross-browser behavior.
    var SUBSTITUTE_REG = /\\?\{([^{}]+)\}/g, EMPTY = '';
    var RE_TRIM = /^[\s\xa0]+|[\s\xa0]+$/g, trim = String.prototype.trim;
    var RE_DASH = /-([a-z])/gi;
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
        trim: trim ? function (str) {
            return str == null ? EMPTY : trim.call(str);
        } : function (str) {
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
                return o[name] === undef ? EMPTY : o[name];
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
});
KISSY.add('util/type', ['./base'], function (S, require, exports, module) {
    /**
 * @ignore
 * type judgement
 * @author yiminghe@gmail.com, lifesinger@gmail.com
 */
    var util = require('./base');    // [[Class]] -> type pairs
    // [[Class]] -> type pairs
    var class2type = {}, FALSE = false, undef, noop = util.noop, OP = Object.prototype, toString = OP.toString;
    function hasOwnProperty(o, p) {
        return OP.hasOwnProperty.call(o, p);
    }
    util.mix(util, {
        /**
     * Determine the internal JavaScript [[Class]] of an object.
     * @member KISSY
     */
        type: function (o) {
            return o == null ? String(o) : class2type[toString.call(o)] || 'object';
        },
        /**
     * Checks to see if an object is a plain object (created using '{}'
     * or 'new Object()' but not 'new FunctionClass()').
     * @member KISSY
     */
        isPlainObject: function (obj) {
            // Must be an Object.
            // Because of IE, we also have to check the presence of the constructor property.
            // Make sure that Dom nodes and window objects don't pass through, as well
            if (!obj || util.type(obj) !== 'object' || obj.nodeType || /*jshint eqeqeq:false*/
                // must == for ie8
                obj.window == obj) {
                return FALSE;
            }
            var key, objConstructor;
            try {
                // Not own constructor property must be Object
                if ((objConstructor = obj.constructor) && !hasOwnProperty(obj, 'constructor') && !hasOwnProperty(objConstructor.prototype, 'isPrototypeOf')) {
                    return FALSE;
                }
            } catch (e) {
                // IE8,9 Will throw exceptions on certain host objects
                return FALSE;
            }    // Own properties are enumerated firstly, so to speed up,
                 // if last one is own, then all properties are own.
                 /*jshint noempty:false*/
            // Own properties are enumerated firstly, so to speed up,
            // if last one is own, then all properties are own.
            /*jshint noempty:false*/
            for (key in obj) {
            }
            return key === undef || hasOwnProperty(obj, key);
        }
    });
    if ('@DEBUG@') {
        util.mix(util, {
            /**
         * test whether o is boolean
         * @method
         * @param  o
         * @return {Boolean}
         * @member KISSY
         */
            isBoolean: noop,
            /**
         * test whether o is number
         * @method
         * @param  o
         * @return {Boolean}
         * @member KISSY
         */
            isNumber: noop,
            /**
         * test whether o is String
         * @method
         * @param  o
         * @return {Boolean}
         * @member KISSY
         */
            isString: noop,
            /**
         * test whether o is function
         * @method
         * @param  o
         * @return {Boolean}
         * @member KISSY
         */
            isFunction: noop,
            /**
         * test whether o is Array
         * @method
         * @param  o
         * @return {Boolean}
         * @member KISSY
         */
            isArray: noop,
            /**
         * test whether o is Date
         * @method
         * @param  o
         * @return {Boolean}
         * @member KISSY
         */
            isDate: noop,
            /**
         * test whether o is RegExp
         * @method
         * @param  o
         * @return {Boolean}
         * @member KISSY
         */
            isRegExp: noop,
            /**
         * test whether o is Object
         * @method
         * @param  o
         * @return {Boolean}
         * @member KISSY
         */
            isObject: noop
        });
    }
    var types = 'Boolean Number String Function Date RegExp Object Array'.split(' ');
    for (var i = 0; i < types.length; i++) {
        /*jshint loopfunc:true*/
        (function (name, lc) {
            // populate the class2type map
            class2type['[object ' + name + ']'] = lc = name.toLowerCase();    // add isBoolean/isNumber/...
            // add isBoolean/isNumber/...
            util['is' + name] = function (o) {
                return util.type(o) === lc;
            };
        }(types[i], i));
    }
    util.isArray = Array.isArray || util.isArray;
});
KISSY.add('util/json', ['./base'], function (S, require, exports, module) {
    var util = require('./base');    // Json RegExp
    // Json RegExp
    var INVALID_CHARS_REG = /^[\],:{}\s]*$/, INVALID_BRACES_REG = /(?:^|:|,)(?:\s*\[)+/g, INVALID_ESCAPES_REG = /\\(?:["\\\/bfnrt]|u[\da-fA-F]{4})/g, INVALID_TOKENS_REG = /"[^"\\\r\n]*"|true|false|null|-?(?:\d+\.|)\d+(?:[eE][+-]?\d+|)/g;
    util.parseJson = function (data) {
        if (data === null) {
            return data;
        }
        if (typeof data === 'string') {
            // for ie
            data = util.trim(data);
            if (data) {
                // from json2
                if (INVALID_CHARS_REG.test(data.replace(INVALID_ESCAPES_REG, '@').replace(INVALID_TOKENS_REG, ']').replace(INVALID_BRACES_REG, ''))) {
                    /*jshint evil:true*/
                    return new Function('return ' + data)();
                }
            }
        }
        return util.error('Invalid Json: ' + data);
    };
});
KISSY.add('util/web', [
    './base',
    'logger-manager'
], function (S, require, exports, module) {
    /**
 * this code can only run at browser environment
 * @ignore
 * @author lifesinger@gmail.com, yiminghe@gmail.com
 */
    var util = require('./base');
    var LoggerManager = require('logger-manager');
    var logger = LoggerManager.getLogger('util');
    var win = typeof window !== 'undefined' ? window : {}, undef, doc = win.document || {}, docElem = doc.documentElement, EMPTY = '', domReady = 0, callbacks = [],
        // The number of poll times.
        POLL_RETIRES = 500,
        // The poll interval in milliseconds.
        POLL_INTERVAL = 40,
        // #id or id
        RE_ID_STR = /^#?([\w-]+)$/, RE_NOT_WHITESPACE = /\S/, standardEventModel = doc.addEventListener, supportEvent = doc.attachEvent || standardEventModel, DOM_READY_EVENT = 'DOMContentLoaded', READY_STATE_CHANGE_EVENT = 'readystatechange', LOAD_EVENT = 'load', COMPLETE = 'complete',
        /*global addEventListener:true, removeEventListener:true*/
        addEventListener = standardEventModel ? function (el, type, fn) {
            el.addEventListener(type, fn, false);
        } : function (el, type, fn) {
            el.attachEvent('on' + type, fn);
        }, removeEventListener = standardEventModel ? function (el, type, fn) {
            el.removeEventListener(type, fn, false);
        } : function (el, type, fn) {
            el.detachEvent('on' + type, fn);
        };
    util.mix(util, {
        /**
     * A crude way of determining if an object is a window
     * @member KISSY
     */
        isWindow: function (obj) {
            // must use == for ie8
            /*jshint eqeqeq:false*/
            return obj != null && obj == obj.window;
        },
        /**
     * get xml representation of data
     * @param {String} data
     * @member KISSY
     */
        parseXml: function (data) {
            // already a xml
            if (data.documentElement) {
                return data;
            }
            var xml;
            try {
                // Standard
                if (win.DOMParser) {
                    xml = new DOMParser().parseFromString(data, 'text/xml');
                } else {
                    // IE
                    /*global ActiveXObject*/
                    xml = new ActiveXObject('Microsoft.XMLDOM');
                    xml.async = false;
                    xml.loadXML(data);
                }
            } catch (e) {
                logger.error('parseXML error :');
                logger.error(e);
                xml = undef;
            }
            if (!xml || !xml.documentElement || xml.getElementsByTagName('parsererror').length) {
                util.error('Invalid XML: ' + data);
            }
            return xml;
        },
        /**
     * Evaluates a script in a global context.
     * @member KISSY
     */
        globalEval: function (data) {
            if (data && RE_NOT_WHITESPACE.test(data)) {
                // http://weblogs.java.net/blog/driscoll/archive/2009/09/08/eval-javascript-global-context
                // http://msdn.microsoft.com/en-us/library/ie/ms536420(v=vs.85).aspx always return null
                /*jshint evil:true*/
                if (win.execScript) {
                    win.execScript(data);
                } else {
                    (function (data) {
                        win['eval'].call(win, data);
                    }(data));
                }
            }
        },
        /**
     * Specify a function to execute when the Dom is fully loaded.
     * @param fn {Function} A function to execute after the Dom is ready
     * @chainable
     * @member KISSY
     */
        ready: function (fn) {
            if (domReady) {
                if ('@DEBUG@') {
                    fn();
                } else {
                    try {
                        fn();
                    } catch (e) {
                        setTimeout(function () {
                            throw e;
                        }, 0);
                    }
                }
            } else {
                callbacks.push(fn);
            }
            return this;
        },
        /**
     * Executes the supplied callback when the item with the supplied id is found.
     * @param id {String} The id of the element, or an array of ids to look for.
     * @param fn {Function} What to execute when the element is found.
     * @member KISSY
     */
        available: function (id, fn) {
            id = (id + EMPTY).match(RE_ID_STR)[1];
            var retryCount = 1;
            var timer = util.later(function () {
                    if (++retryCount > POLL_RETIRES) {
                        timer.cancel();
                        return;
                    }
                    var node = doc.getElementById(id);
                    if (node) {
                        fn(node);
                        timer.cancel();
                    }
                }, POLL_INTERVAL, true);
        }
    });
    util.parseXML = util.parseXml;
    function fireReady() {
        if (domReady) {
            return;
        }    // nodejs
        // nodejs
        if (win && win.setTimeout) {
            removeEventListener(win, LOAD_EVENT, fireReady);
        }
        domReady = 1;
        for (var i = 0; i < callbacks.length; i++) {
            if ('@DEBUG@') {
                callbacks[i]();
            } else {
                try {
                    callbacks[i]();
                } catch (e) {
                    /*jshint loopfunc:true*/
                    setTimeout(function () {
                        throw e;
                    }, 0);
                }
            }
        }
    }    //  Binds ready events.
    //  Binds ready events.
    function bindReady() {
        // Catch cases where ready() is called after the
        // browser event has already occurred.
        if (!doc || doc.readyState === COMPLETE) {
            fireReady();
            return;
        }    // A fallback to window.onload, that will always work
        // A fallback to window.onload, that will always work
        addEventListener(win, LOAD_EVENT, fireReady);    // w3c mode
        // w3c mode
        if (standardEventModel) {
            var domReady = function () {
                removeEventListener(doc, DOM_READY_EVENT, domReady);
                fireReady();
            };
            addEventListener(doc, DOM_READY_EVENT, domReady);
        } else {
            var stateChange = function () {
                if (doc.readyState === COMPLETE) {
                    removeEventListener(doc, READY_STATE_CHANGE_EVENT, stateChange);
                    fireReady();
                }
            };    // ensure firing before onload (but completed after all inner iframes is loaded)
                  // maybe late but safe also for iframes
            // ensure firing before onload (but completed after all inner iframes is loaded)
            // maybe late but safe also for iframes
            addEventListener(doc, READY_STATE_CHANGE_EVENT, stateChange);    // If IE and not a frame
                                                                             // continually check to see if the document is ready
            // If IE and not a frame
            // continually check to see if the document is ready
            var notframe, doScroll = docElem && docElem.doScroll;
            try {
                notframe = win.frameElement === null;
            } catch (e) {
                notframe = false;
            }    // can not use in iframe,parent window is dom ready so doScroll is ready too
            // can not use in iframe,parent window is dom ready so doScroll is ready too
            if (doScroll && notframe) {
                var readyScroll = function () {
                    try {
                        // Ref: http://javascript.nwbox.com/IEContentLoaded/
                        doScroll('left');
                        fireReady();
                    } catch (ex) {
                        setTimeout(readyScroll, POLL_INTERVAL);
                    }
                };
                readyScroll();
            }
        }
    }    // bind on start
         // in case when you bind but the DOMContentLoaded has triggered
         // then you has to wait onload
         // worst case no callback at all
    // bind on start
    // in case when you bind but the DOMContentLoaded has triggered
    // then you has to wait onload
    // worst case no callback at all
    if (supportEvent) {
        bindReady();
    }
    try {
        if (doc.execCommand) {
            doc.execCommand('BackgroundImageCache', false, true);
        }
    } catch (e) {
    }
});
