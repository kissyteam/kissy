/*
Copyright 2014, KISSY v5.0.0
MIT Licensed
build time: Apr 15 17:57
*/
/*
combined files : 

util/array
util/escape
util/function
util/object
util/string
util/type
util/web
util

*/
/**
 * @ignore
 * array utilities of lang
 * @author yiminghe@gmail.com
 *
 */
KISSY.add('util/array',function (S) {
    var TRUE = true,
        undef,
        AP = Array.prototype,
        indexOf = AP.indexOf,
        lastIndexOf = AP.lastIndexOf,
        filter = AP.filter,
        every = AP.every,
        some = AP.some,
        map = AP.map,
        FALSE = false;

    S.mix(S, {
        /**
         * Search for a specified value within an array.
         * @param item individual item to be searched
         * @method
         * @member KISSY
         * @param {Array} arr the array of items where item will be search
         * @return {number} item's index in array
         */
        indexOf: indexOf ?
            function (item, arr, fromIndex) {
                return fromIndex === undef ?
                    indexOf.call(arr, item) :
                    indexOf.call(arr, item, fromIndex);
            } :
            function (item, arr, fromIndex) {
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
        lastIndexOf: (lastIndexOf) ?
            function (item, arr, fromIndex) {
                return fromIndex === undef ?
                    lastIndexOf.call(arr, item) :
                    lastIndexOf.call(arr, item, fromIndex);
            } :
            function (item, arr, fromIndex) {
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
         * @param [override] {Boolean} if override is TRUE, S.unique([a, b, a]) => [b, a].
         * if override is FALSE, S.unique([a, b, a]) => [a, b]
         * @return {Array} a copy of the array with duplicate entries removed
         * @member KISSY
         */
        unique: function (a, override) {
            var b = a.slice();
            if (override) {
                b.reverse();
            }
            var i = 0,
                n,
                item;

            while (i < b.length) {
                item = b[i];
                while ((n = S.lastIndexOf(item, b)) !== i) {
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
            return S.indexOf(item, arr) > -1;
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
        filter: filter ?
            function (arr, fn, context) {
                return filter.call(arr, fn, context || this);
            } :
            function (arr, fn, context) {
                var ret = [];
                S.each(arr, function (item, i, arr) {
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
        map: map ?
            function (arr, fn, context) {
                return map.call(arr, fn, context || this);
            } :
            function (arr, fn, context) {
                var len = arr.length,
                    res = new Array(len);
                for (var i = 0; i < len; i++) {
                    var el = typeof arr === 'string' ? arr.charAt(i) : arr[i];
                    if (el ||
                        //ie<9 in invalid when typeof arr == string
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
            }

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
                    }

                    // if array contains no values, no initial value to return
                    k += 1;
                    if (k >= len) {
                        throw new TypeError();
                    }
                }
                while (TRUE);
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
        every: every ?
            function (arr, fn, context) {
                return every.call(arr, fn, context || this);
            } :
            function (arr, fn, context) {
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
        some: some ?
            function (arr, fn, context) {
                return some.call(arr, fn, context || this);
            } :
            function (arr, fn, context) {
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
         * // do not pass form.elements to this function ie678 bug
         * @param o {object|Array} array like object or array
         * @return {Array} native Array
         * @member KISSY
         */
        makeArray: function (o) {
            if (o == null) {
                return [];
            }
            if (S.isArray(o)) {
                return o;
            }
            var lengthType = typeof o.length,
                oType = typeof o;
            // The strings and functions also have 'length'
            if (lengthType !== 'number' ||
                // select element
                // https://github.com/kissyteam/kissy/issues/537
                typeof o.nodeName === 'string' ||
                // window
                /*jshint eqeqeq:false*/
                (o != null && o == o.window) ||
                oType === 'string' ||
                // https://github.com/ariya/phantomjs/issues/11478
                (oType === 'function' && !('item' in o && lengthType === 'number'))) {
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
/**
 * @ignore
 * escape of lang
 * @author yiminghe@gmail.com
 *
 */
KISSY.add('util/escape',function (S) {
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

    S.mix(S, {
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

    S.escapeHTML = S.escapeHtml;
    S.unEscapeHTML = S.unEscapeHtml;
});
/**
 * @ignore
 * function utilities of lang
 * @author yiminghe@gmail.com
 *
 */
KISSY.add('util/function',function (S) {
    // ios Function.prototype.bind === undefine
    function bindFn(r, fn, obj) {
        function FNOP() {
        }

        var slice = [].slice,
            args = slice.call(arguments, 3),
            bound = function () {
                var inArgs = slice.call(arguments);
                return fn.apply(
                    this instanceof FNOP ? this :
                        // fix: y.x=S.bind(fn);
                        obj || this,
                    (r ? inArgs.concat(args) : args.concat(inArgs))
                );
            };
        FNOP.prototype = fn.prototype;
        bound.prototype = new FNOP();
        return bound;
    }

    S.mix(S, {
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
            var m = fn,
                d = S.makeArray(data),
                f,
                r;

            if (typeof fn === 'string') {
                m = context[fn];
            }

            if (!m) {
                S.error('method undefine');
            }

            f = function () {
                m.apply(context, d);
            };

            r = (periodic) ? setInterval(f, when) : setTimeout(f, when);

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

            var last = S.now();

            return function () {
                var now = S.now();
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
                bufferTimer = S.later(fn, ms, 0, context || this, arguments);
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
/**
 * @ignore
 * object utilities of lang
 * @author yiminghe@gmail.com
 *
 */
KISSY.add('util/object',function (S) {
    var undef;
    var logger = S.getLogger('s/util');
    var MIX_CIRCULAR_DETECTION = '__MIX_CIRCULAR',
        STAMP_MARKER = '__~ks_stamped',
        host = S.Env.host,
        TRUE = true,
        EMPTY = '',
        toString = ({}).toString,
        Obj = Object,
        objectCreate = Obj.create;

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

    mix(S, {
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
                    isObj = length === undef || toString.call(object) === '[object Function]';

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
                    guid = o[marker] = S.guid(marker);
                }
                catch (e) {
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
         * for example:
         *     @example
         *     var t = {};
         *     S.mix({x: {y: 2, z: 4}}, {x: {y: 3, a: t}}, {deep: TRUE}) => {x: {y: 3, z: 4, a: {}}}, a !== t
         *     S.mix({x: {y: 2, z: 4}}, {x: {y: 3, a: t}}, {deep: TRUE, overwrite: false}) => {x: {y: 2, z: 4, a: {}}}, a !== t
         *     S.mix({x: {y: 2, z: 4}}, {x: {y: 3, a: t}}, 1) => {x: {y: 3, a: t}}
         */
        mix: function (r, s, ov, wl, deep) {
            if (typeof ov === 'object') {
                wl = /**
                 @ignore
                 @type {String[]|Function}
                 */ov.whitelist;
                deep = ov.deep;
                ov = ov.overwrite;
            }

            if (wl && (typeof wl !== 'function')) {
                var originalWl = wl;
                wl = function (name, val) {
                    return S.inArray(name, originalWl) ? val : undef;
                };
            }

            if (ov === undef) {
                ov = TRUE;
            }

            var cache = [],
                c,
                i = 0;
            mixInternal(r, s, ov, wl, deep, cache);
            while ((c = cache[i++])) {
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
            varArgs = S.makeArray(arguments);
            var o = {},
                i,
                l = varArgs.length;
            for (i = 0; i < l; i++) {
                S.mix(o, varArgs[i]);
            }
            return o;
        },

        /**
         * Applies prototype properties from the supplier to the receiver.
         * @param   {Object} r received object
         * @param   {...Object} varArgs object need to  augment
         *          {Boolean} [ov=TRUE] whether overwrite existing property
         *          {String[]} [wl] array of white-list properties
         * @return  {Object} the augmented object
         * @member KISSY
         */
        augment: function (r, varArgs) {
            var args = S.makeArray(arguments),
                len = args.length - 2,
                i = 1,
                proto,
                arg,
                ov = args[len],
                wl = args[len + 1];

            args[1] = varArgs;

            if (!S.isArray(wl)) {
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
                if ((proto = arg.prototype)) {
                    arg = S.mix({}, proto, true, removeConstructor);
                }
                S.mix(r.prototype, arg, ov, wl);
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

            var sp = s.prototype,
                rp;

            // in case parent does not set constructor
            // eg: parent.prototype={};
            sp.constructor = s;

            // add prototype chain
            rp = createObject(sp, r);
            r.prototype = S.mix(rp, r.prototype);
            r.superclass = sp;

            // add prototype overrides
            if (px) {
                S.mix(rp, px);
            }

            // add object overrides
            if (sx) {
                S.mix(r, sx);
            }

            return r;
        },

        /**
         * Returns the namespace specified and creates it if it doesn't exist. Be careful
         * when naming packages. Reserved words may work in some browsers and not others.
         *
         * for example:
         *      @example
         *      S.namespace('KISSY.app'); // returns KISSY.app
         *      S.namespace('app.Shop'); // returns KISSY.app.Shop
         *      S.namespace('TB.app.Shop', TRUE); // returns TB.app.Shop
         *
         * @return {Object}  A reference to the last namespace object created
         * @member KISSY
         */
        namespace: function () {
            var args = S.makeArray(arguments),
                l = args.length,
                o = null, i, j, p,
                global = (args[l - 1] === TRUE && l--);

            for (i = 0; i < l; i++) {
                p = (EMPTY + args[i]).split('.');
                o = global ? host : this;
                for (j = (host[p[0]] === o) ? 1 : 0; j < p.length; ++j) {
                    o = o[p[j]] = o[p[j]] || {};
                }
            }
            return o;
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

    function mixInternal(r, s, ov, wl, deep, cache) {
        if (!s || !r) {
            return r;
        }
        var i, p, keys, len;

        // 记录循环标志
        s[MIX_CIRCULAR_DETECTION] = r;

        // 记录被记录了循环标志的对像
        cache.push(s);

        // mix all properties
        keys = S.keys(s);
        len = keys.length;
        for (i = 0; i < len; i++) {
            p = keys[i];
            if (p !== MIX_CIRCULAR_DETECTION) {
                // no hasOwnProperty judge!
                _mix(p, r, s, ov, wl, deep, cache);
            }
        }

        return r;
    }

    function removeConstructor(k, v) {
        return k === 'constructor' ? undef : v;
    }

    function _mix(p, r, s, ov, wl, deep, cache) {
        // 要求覆盖
        // 或者目的不存在
        // 或者深度mix
        if (ov || !(p in r) || deep) {
            var target = r[p],
                src = s[p];
            // prevent never-end loop
            if (target === src) {
                // S.mix({},{x:undef})
                if (target === undef) {
                    r[p] = target;
                }
                return;
            }
            if (wl) {
                src = wl.call(s, p, src);
            }
            // 来源是数组和对象，并且要求深度 mix
            if (deep && src && (S.isArray(src) || S.isPlainObject(src))) {
                if (src[MIX_CIRCULAR_DETECTION]) {
                    r[p] = src[MIX_CIRCULAR_DETECTION];
                } else {
                    // 目标值为对象或数组，直接 mix
                    // 否则 新建一个和源值类型一样的空数组/对象，递归 mix
                    var clone = target && (S.isArray(target) || S.isPlainObject(target)) ?
                        target :
                        (S.isArray(src) ? [] : {});
                    r[p] = clone;
                    mixInternal(clone, src, ov, wl, TRUE, cache);
                }
            } else if (src !== undef && (ov || !(p in r))) {
                r[p] = src;
            }
        }
    }
});
/**
 * @ignore
 * string utilities of lang
 * @author yiminghe@gmail.com
 *
 */
KISSY.add('util/string',function (S) {
    var undef;
    var logger = S.getLogger('s/util');
    // IE doesn't include non-breaking-space (0xa0) in their \s character
    // class (as required by section 7.2 of the ECMAScript spec), we explicitly
    // include it in the regexp to enforce consistent cross-browser behavior.
    var SUBSTITUTE_REG = /\\?\{([^{}]+)\}/g,
        EMPTY = '';
    var RE_DASH = /-([a-z])/ig;
    var RE_TRIM = /^[\s\xa0]+|[\s\xa0]+$/g,
        trim = String.prototype.trim;
    var SEP = '&',
        EQ = '=',
        TRUE = true;

    function isValidParamValue(val) {
        var t = typeof val;
        // If the type of val is null, undef, number, string, boolean, return TRUE.
        return val == null || (t !== 'object' && t !== 'function');
    }

    function upperCase() {
        return arguments[1].toUpperCase();
    }

    S.mix(S, {
        /**
         * Creates a serialized string of an array or object.
         *
         * for example:
         *     @example
         *     {foo: 1, bar: 2}    // -> 'foo=1&bar=2'
         *     {foo: 1, bar: [2, 3]}    // -> 'foo=1&bar=2&bar=3'
         *     {foo: '', bar: 2}    // -> 'foo=&bar=2'
         *     {foo: undef, bar: 2}    // -> 'foo=undef&bar=2'
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
            if (serializeArray === undef) {
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
                    if (val !== undef) {
                        buf.push(eq, encode(val + EMPTY));
                    }
                    buf.push(sep);
                } else if (S.isArray(val) && val.length) {
                    // val is not empty array
                    for (i = 0, len = val.length; i < len; ++i) {
                        v = val[i];
                        if (isValidParamValue(v)) {
                            buf.push(key, (serializeArray ? encode('[]') : EMPTY));
                            if (v !== undef) {
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
                    val = undef;
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
});
/**
 * @ignore
 * type judgement
 * @author yiminghe@gmail.com, lifesinger@gmail.com
 *
 */
KISSY.add('util/type',function (S) {
    // [[Class]] -> type pairs
    var class2type = {},
        FALSE = false,
        undef,
        noop = S.noop,
        OP = Object.prototype,
        toString = OP.toString;

    function hasOwnProperty(o, p) {
        return OP.hasOwnProperty.call(o, p);
    }

    S.mix(S, {
        /**
         * Determine the internal JavaScript [[Class]] of an object.
         * @member KISSY
         */
        type: function (o) {
            return o == null ?
                String(o) :
                class2type[toString.call(o)] || 'object';
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
            if (!obj || S.type(obj) !== 'object' || obj.nodeType ||
                /*jshint eqeqeq:false*/
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
            }

            // Own properties are enumerated firstly, so to speed up,
            // if last one is own, then all properties are own.
            /*jshint noempty:false*/
            for (key in obj) {
            }

            return ((key === undef) || hasOwnProperty(obj, key));
        }
    });

    if ('@DEBUG@') {
        S.mix(S, {
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
            class2type['[object ' + name + ']'] = (lc = name.toLowerCase());

            // add isBoolean/isNumber/...
            S['is' + name] = function (o) {
                return S.type(o) === lc;
            };
        })(types[i], i);
    }

    S.isArray = Array.isArray || S.isArray;
});
/**
 * this code can only run at browser environment
 * @ignore
 * @author lifesinger@gmail.com, yiminghe@gmail.com
 */
KISSY.add('util/web',function (S) {
    var logger = S.getLogger('s/web');
    var win = S.Env.host,
        undef,
        doc = win.document || {},
        docElem = doc.documentElement,
        location = win.location,
        EMPTY = '',
        domReady = 0,
        callbacks = [],
    // The number of poll times.
        POLL_RETIRES = 500,
    // The poll interval in milliseconds.
        POLL_INTERVAL = 40,
    // #id or id
        RE_ID_STR = /^#?([\w-]+)$/,
        RE_NOT_WHITESPACE = /\S/,
        standardEventModel = doc.addEventListener,
        supportEvent = doc.attachEvent || standardEventModel,
        DOM_READY_EVENT = 'DOMContentLoaded',
        READY_STATE_CHANGE_EVENT = 'readystatechange',
        LOAD_EVENT = 'load',
        COMPLETE = 'complete',
        addEventListener = standardEventModel ? function (el, type, fn) {
            el.addEventListener(type, fn, false);
        } : function (el, type, fn) {
            el.attachEvent('on' + type, fn);
        },
        removeEventListener = standardEventModel ? function (el, type, fn) {
            el.removeEventListener(type, fn, false);
        } : function (el, type, fn) {
            el.detachEvent('on' + type, fn);
        };

    S.mix(S, {
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
        parseXML: function (data) {
            // already a xml
            if (data.documentElement) {
                return data;
            }
            var xml;
            try {
                // Standard
                if (win.DOMParser) {
                    xml = new DOMParser().parseFromString(data, 'text/xml');
                } else { // IE
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
                S.error('Invalid XML: ' + data);
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
                    })(data);
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
                try {
                    fn(S);
                } catch (e) {
                    S.log(e.stack || e, 'error');
                    setTimeout(function () {
                        throw e;
                    }, 0);
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
            var timer = S.later(function () {
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

    function fireReady() {
        if (domReady) {
            return;
        }
        // nodejs
        if (win && win.setTimeout) {
            removeEventListener(win, LOAD_EVENT, fireReady);
        }
        domReady = 1;
        for (var i = 0; i < callbacks.length; i++) {
            try {
                callbacks[i](S);
            } catch (e) {
                S.log(e.stack || e, 'error');
                /*jshint loopfunc:true*/
                setTimeout(function () {
                    throw e;
                }, 0);
            }
        }
    }

    //  Binds ready events.
    function bindReady() {
        // Catch cases where ready() is called after the
        // browser event has already occurred.
        if (!doc || doc.readyState === COMPLETE) {
            fireReady();
            return;
        }

        // A fallback to window.onload, that will always work
        addEventListener(win, LOAD_EVENT, fireReady);

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
            };

            // ensure firing before onload (but completed after all inner iframes is loaded)
            // maybe late but safe also for iframes
            addEventListener(doc, READY_STATE_CHANGE_EVENT, stateChange);

            // If IE and not a frame
            // continually check to see if the document is ready
            var notframe,
                doScroll = docElem && docElem.doScroll;

            try {
                notframe = (win.frameElement === null);
            } catch (e) {
                notframe = false;
            }

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
    }

    // If url contains '?ks-debug', debug mode will turn on automatically.
    if (location && (location.search || EMPTY).indexOf('ks-debug') !== -1) {
        S.Config.debug = true;
    }

    // bind on start
    // in case when you bind but the DOMContentLoaded has triggered
    // then you has to wait onload
    // worst case no callback at all
    if (supportEvent) {
        bindReady();
    }

    try {
        doc.execCommand('BackgroundImageCache', false, true);
    } catch (e) {
    }

});

/**
 * @ignore
 * lang
 * @author  yiminghe@gmail.com
 *
 */
KISSY.add('util',['util/array', 'util/escape', 'util/function', 'util/object', 'util/string', 'util/type', 'util/web'], function (S, require) {
    var FALSE = false,
        CLONE_MARKER = '__~ks_cloned';

    S.mix = function (to, from) {
        for (var i in from) {
            to[i] = from[i];
        }
        return to;
    };

    require('util/array');
    require('util/escape');
    require('util/function');
    require('util/object');
    require('util/string');
    require('util/type');
    require('util/web');

    S.mix(S, {
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
            var memory = {},
                ret = cloneInternal(input, filter, memory);
            S.each(memory, function (v) {
                // 清理在源对象上做的标记
                v = v.input;
                if (v[CLONE_MARKER]) {
                    try {
                        delete v[CLONE_MARKER];
                    } catch (e) {
                        v[CLONE_MARKER] = undefined;
                    }
                }
            });
            memory = null;
            return ret;
        }
    });

    function cloneInternal(input, f, memory) {
        var destination = input,
            isArray,
            isPlainObject,
            k,
            stamp;
        if (!input) {
            return destination;
        }

        // If input is the source object of a pair of objects in memory,
        // then return the destination object in that pair of objects .
        // and abort these steps.
        if (input[CLONE_MARKER]) {
            // 对应的克隆后对象
            return memory[input[CLONE_MARKER]].destination;
        } else if (typeof input === 'object') {
            // 引用类型要先记录
            var Constructor = input.constructor;
            if (S.inArray(Constructor, [Boolean, String, Number, Date, RegExp])) {
                destination = new Constructor(input.valueOf());
            } else if ((isArray = S.isArray(input))) {
                // ImageData , File, Blob , FileList .. etc
                destination = f ? S.filter(input, f) : input.concat();
            } else if ((isPlainObject = S.isPlainObject(input))) {
                destination = {};
            }
            // Add a mapping from input (the source object)
            // to output (the destination object) to memory.
            // 做标记
            // stamp can not be
            input[CLONE_MARKER] = (stamp = S.guid('c'));
            // 存储源对象以及克隆后的对象
            memory[stamp] = {destination: destination, input: input};
        }
        // If input is an Array object or an Object object,
        // then, for each enumerable property in input,
        // add a new property to output having the same name,
        // and having a value created from invoking the internal structured cloning algorithm recursively
        // with the value of the property as the 'input' argument and memory as the 'memory' argument.
        // The order of the properties in the input and output objects must be the same.

        // clone it
        if (isArray) {
            for (var i = 0; i < destination.length; i++) {
                destination[i] = cloneInternal(destination[i], f, memory);
            }
        } else if (isPlainObject) {
            for (k in input) {

                if (k !== CLONE_MARKER &&
                    (!f || (f.call(input, input[k], k, input) !== FALSE))) {
                    destination[k] = cloneInternal(input[k], f, memory);
                }

            }
        }

        return destination;
    }

    return S;
});

