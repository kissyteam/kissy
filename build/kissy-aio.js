/*
Copyright 2011, KISSY UI Library v1.20dev
MIT Licensed
build time: Oct 12 14:28
*/
/*
 * a seed where KISSY grows up from , KISS Yeah !
 * @author lifesinger@gmail.com,yiminghe@gmail.com
 */
(function(S, undefined) {

    var host = this,
        meta = {
            /**
             * Copies all the properties of s to r.
             * @param deep {boolean} whether recursive mix if encounter object
             * @return {Object} the augmented object
             */
            mix: function(r, s, ov, wl, deep) {
                if (!s || !r) {
                    return r;
                }
                if (ov === undefined) {
                    ov = true;
                }
                var i, p, len;

                if (wl && (len = wl.length)) {
                    for (i = 0; i < len; i++) {
                        p = wl[i];
                        if (p in s) {
                            _mix(p, r, s, ov, deep);
                        }
                    }
                } else {
                    for (p in s) {
                        _mix(p, r, s, ov, deep);
                    }
                }
                return r;
            }
        },

        _mix = function(p, r, s, ov, deep) {
            if (ov || !(p in r)) {
                var target = r[p],src = s[p];
                // prevent never-end loop
                if (target === src) {
                    return;
                }
                // 来源是数组和对象，并且要求深度 mix
                if (deep && src && (S.isArray(src) || S.isPlainObject(src))) {
                    // 目标值为对象或数组，直接 mix
                    // 否则 新建一个和源值类型一样的空数组/对象，递归 mix
                    var clone = target && (S.isArray(target) || S.isPlainObject(target)) ?
                        target :
                        (S.isArray(src) ? [] : {});
                    r[p] = S.mix(clone, src, ov, undefined, true);
                } else if (src !== undefined) {
                    r[p] = s[p];
                }
            }
        },

        // If KISSY is already defined, the existing KISSY object will not
        // be overwritten so that defined namespaces are preserved.
        seed = (host && host[S]) || {},

        guid = 0,
        EMPTY = '';

    // The host of runtime environment. specify by user's seed or <this>,
    // compatibled for  '<this> is null' in unknown engine.
    host = seed.__HOST || (seed.__HOST = host || {});

    // shortcut and meta for seed.
    S = host[S] = meta.mix(seed, meta, false);

    S.mix(S, {

        // S.app() with these members.
        __APP_MEMBERS: ['namespace'],
        __APP_INIT_METHODS: ['__init'],

        /**
         * The version of the library.
         * @type {String}
         */
        version: '1.20dev',

        buildTime:'20111012142802',

        /**
         * Returns a new object containing all of the properties of
         * all the supplied objects. The properties from later objects
         * will overwrite those in earlier objects. Passing in a
         * single object will create a shallow copy of it.
         * @return {Object} the new merged object
         */
        merge: function() {
            var o = {}, i, l = arguments.length;
            for (i = 0; i < l; i++) {
                S.mix(o, arguments[i]);
            }
            return o;
        },

        /**
         * Applies prototype properties from the supplier to the receiver.
         * @return {Object} the augmented object
         */
        augment: function(/*r, s1, s2, ..., ov, wl*/) {
            var args = S.makeArray(arguments),
                len = args.length - 2,
                r = args[0],
                ov = args[len],
                wl = args[len + 1],
                i = 1;

            if (!S.isArray(wl)) {
                ov = wl;
                wl = undefined;
                len++;
            }
            if (!S.isBoolean(ov)) {
                ov = undefined;
                len++;
            }

            for (; i < len; i++) {
                S.mix(r.prototype, args[i].prototype || args[i], ov, wl);
            }

            return r;
        },

        /**
         * Utility to set up the prototype, constructor and superclass properties to
         * support an inheritance strategy that can chain constructors and methods.
         * Static members will not be inherited.
         * @param r {Function} the object to modify
         * @param s {Function} the object to inherit
         * @param px {Object} prototype properties to add/override
         * @param sx {Object} static properties to add/override
         * @return r {Object}
         */
        extend: function(r, s, px, sx) {
            if (!s || !r) {
                return r;
            }

            var create = Object.create ?
                function(proto, c) {
                    return Object.create(proto, {
                        constructor: {
                            value: c
                        }
                    });
                } :
                function (proto, c) {
                    function F() {
                    }

                    F.prototype = proto;

                    var o = new F();
                    o.constructor = c;
                    return o;
                },
                sp = s.prototype,
                rp;

            // add prototype chain
            rp = create(sp, r);
            r.prototype = S.mix(rp, r.prototype);
            r.superclass = create(sp, s);

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

        /****************************************************************************************

         *                            The KISSY System Framework                                *

         ****************************************************************************************/

        /**
         * Initializes KISSY
         */
        __init: function() {
            this.Config = this.Config || {};
            this.Env = this.Env || {};

            // NOTICE: '@DEBUG@' will replace with '' when compressing.
            // So, if loading source file, debug is on by default.
            // If loading min version, debug is turned off automatically.
            this.Config.debug = '@DEBUG@';
        },

        /**
         * Returns the namespace specified and creates it if it doesn't exist. Be careful
         * when naming packages. Reserved words may work in some browsers and not others.
         * <code>
         * S.namespace('KISSY.app'); // returns KISSY.app
         * S.namespace('app.Shop'); // returns KISSY.app.Shop
         * S.namespace('TB.app.Shop', true); // returns TB.app.Shop
         * </code>
         * @return {Object}  A reference to the last namespace object created
         */
        namespace: function() {
            var args = S.makeArray(arguments),
                l = args.length,
                o = null, i, j, p,
                global = (args[l - 1] === true && l--);

            for (i = 0; i < l; i++) {
                p = (EMPTY + args[i]).split('.');
                o = global ? host : this;
                for (j = (host[p[0]] === o) ? 1 : 0; j < p.length; ++j) {
                    o = o[p[j]] = o[p[j]] || { };
                }
            }
            return o;
        },

        /**
         * create app based on KISSY.
         * @param name {String} the app name
         * @param sx {Object} static properties to add/override
         * <code>
         * S.app('TB');
         * TB.namespace('app'); // returns TB.app
         * </code>
         * @return {Object}  A reference to the app global object
         */
        app: function(name, sx) {
            var isStr = S.isString(name),
                O = isStr ? host[name] || {} : name,
                i = 0,
                len = S.__APP_INIT_METHODS.length;

            S.mix(O, this, true, S.__APP_MEMBERS);
            for (; i < len; i++) {
                S[S.__APP_INIT_METHODS[i]].call(O);
            }

            S.mix(O, S.isFunction(sx) ? sx() : sx);
            isStr && (host[name] = O);

            return O;
        },


        config:function(c) {
            for (var p in c) {
                if (this["_" + p]) {
                    this["_" + p](c[p]);
                }
            }
        },

        /**
         * Prints debug info.
         * @param msg {String} the message to log.
         * @param cat {String} the log category for the message. Default
         *        categories are "info", "warn", "error", "time" etc.
         * @param src {String} the source of the the message (opt)
         */
        log: function(msg, cat, src) {
            if (S.Config.debug) {
                if (src) {
                    msg = src + ': ' + msg;
                }
                if (host['console'] !== undefined && console.log) {
                    console[cat && console[cat] ? cat : 'log'](msg);
                }
            }
        },

        /**
         * Throws error message.
         */
        error: function(msg) {
            if (S.Config.debug) {
                throw msg;
            }
        },

        /*
         * Generate a global unique id.
         * @param pre {String} optional guid prefix
         * @return {String} the guid
         */
        guid: function(pre) {
            return (pre || EMPTY) + guid++;
        }
    });

    S.__init();
    return S;

})('KISSY', undefined);
/**
 * @module  lang
 * @author  lifesinger@gmail.com,yiminghe@gmail.com
 * @description this code can run in any ecmascript compliant environment
 */
(function(S, undefined) {

    var host = S.__HOST,
        TRUE = true,
        FALSE = false,
        OP = Object.prototype,
        toString = OP.toString,
        hasOwnProperty = OP.hasOwnProperty,
        AP = Array.prototype,
        indexOf = AP.indexOf,
        lastIndexOf = AP.lastIndexOf,
        filter = AP.filter,
        every = AP.every,
        some = AP.some,
        //reduce = AP.reduce,
        trim = String.prototype.trim,
        map = AP.map,
        EMPTY = '',
        HEX_BASE = 16,
        CLONE_MARKER = '__~ks_cloned',
        COMPARE_MARKER = '__~ks_compared',
        RE_TRIM = /^\s+|\s+$/g,
        encode = encodeURIComponent,
        decode = decodeURIComponent,
        SEP = '&',
        EQ = '=',
        // [[Class]] -> type pairs
        class2type = {},
        htmlEntities = {
            '&amp;': '&',
            '&gt;': '>',
            '&lt;': '<',
            '&quot;': '"'
        },
        reverseEntities = {},
        escapeReg,
        unEscapeReg;
    (function() {
        for (var k in htmlEntities) {
            reverseEntities[htmlEntities[k]] = k;
        }
    })();

    function getEscapeReg() {
        if (escapeReg) {
            return escapeReg
        }
        var str = EMPTY;
        S.each(htmlEntities, function(entity) {
            str += entity + '|';
        });
        str = str.slice(0, -1);
        return escapeReg = new RegExp(str, "g");
    }

    function getUnEscapeReg() {
        if (unEscapeReg) {
            return unEscapeReg
        }
        var str = EMPTY;
        S.each(reverseEntities, function(entity) {
            str += entity + '|';
        });
        str += '&#(\\d{1,5});';
        return unEscapeReg = new RegExp(str, "g");
    }


    function isValidParamValue(val) {
        var t = typeof val;
        // If the type of val is null, undefined, number, string, boolean, return true.
        return nullOrUndefined(val) || (t !== 'object' && t !== 'function');
    }

    S.mix(S, {
        noop:function() {
        },

        /**
         * Determine the internal JavaScript [[Class]] of an object.
         */
        type: function(o) {
            return nullOrUndefined(o) ?
                String(o) :
                class2type[toString.call(o)] || 'object';
        },

        isNullOrUndefined:nullOrUndefined,

        isNull: function(o) {
            return o === null;
        },

        isUndefined: function(o) {
            return o === undefined;
        },

        /**
         * Checks to see if an object is empty.
         */
        isEmptyObject: function(o) {
            for (var p in o) {
                if (p !== undefined) {
                    return FALSE;
                }
            }
            return TRUE;
        },

        /**
         * Checks to see if an object is a plain object (created using "{}"
         * or "new Object()" or "new FunctionClass()").
         * Ref: http://lifesinger.org/blog/2010/12/thinking-of-isplainobject/
         */
        isPlainObject: function(o) {
            /**
             * note by yiminghe
             * isPlainObject(node=document.getElementById("xx")) -> false
             * toString.call(node) : ie678 == '[object Object]',other =='[object HTMLElement]'
             * 'isPrototypeOf' in node : ie678 === false ,other === true
             */

            return o && toString.call(o) === '[object Object]' && 'isPrototypeOf' in o;
        },



        /**
         * 两个目标是否内容相同
         *
         * @param a 比较目标1
         * @param b 比较目标2
         * @param [mismatchKeys] internal use
         * @param [mismatchValues] internal use
         */
        equals : function(a, b, /*internal use*/mismatchKeys, /*internal use*/mismatchValues) {
            // inspired by jasmine
            mismatchKeys = mismatchKeys || [];
            mismatchValues = mismatchValues || [];

            if (a === b) {
                return TRUE;
            }
            if (a === undefined || a === null || b === undefined || b === null) {
                // need type coercion
                return nullOrUndefined(a) && nullOrUndefined(b);
            }
            if (a instanceof Date && b instanceof Date) {
                return a.getTime() == b.getTime();
            }
            if (S.isString(a) && S.isString(b)) {
                return (a == b);
            }
            if (S.isNumber(a) && S.isNumber(b)) {
                return (a == b);
            }
            if (typeof a === "object" && typeof b === "object") {
                return compareObjects(a, b, mismatchKeys, mismatchValues);
            }
            // Straight check
            return (a === b);
        },

        /**
         * Creates a deep copy of a plain object or array. Others are returned untouched.
         * 稍微改改就和规范一样了 :)
         * @refer http://www.w3.org/TR/html5/common-dom-interfaces.html#safe-passing-of-structured-data
         */
        clone: function(input, f) {
            // Let memory be an association list of pairs of objects,
            // initially empty. This is used to handle duplicate references.
            // In each pair of objects, one is called the source object
            // and the other the destination object.
            var memory = {},
                ret = cloneInternal(input, f, memory);
            S.each(memory, function(v) {
                // 清理在源对象上做的标记
                v = v.input;
                if (v[CLONE_MARKER]) {
                    try {
                        delete v[CLONE_MARKER];
                    } catch (e) {
                        S.log("delete CLONE_MARKER error : ");
                        v[CLONE_MARKER] = undefined;
                    }
                }
            });
            memory = undefined;
            return ret;
        },

        /**
         * Removes the whitespace from the beginning and end of a string.
         */
        trim: trim ?
            function(str) {
                return nullOrUndefined(str) ? EMPTY : trim.call(str);
            } :
            function(str) {
                return nullOrUndefined(str) ? EMPTY : str.toString().replace(RE_TRIM, EMPTY);
            },

        /**
         * Substitutes keywords in a string using an object/array.
         * Removes undefined keywords and ignores escaped keywords.
         */
        substitute: function(str, o, regexp) {
            if (!S.isString(str)
                || !S.isPlainObject(o)) {
                return str;
            }

            return str.replace(regexp || /\\?\{([^{}]+)\}/g, function(match, name) {
                if (match.charAt(0) === '\\') {
                    return match.slice(1);
                }
                return (o[name] === undefined) ? EMPTY : o[name];
            });
        },

        /**
         * Executes the supplied function on each item in the array.
         * @param object {Object} the object to iterate
         * @param fn {Function} the function to execute on each item. The function
         *        receives three arguments: the value, the index, the full array.
         * @param context {Object} (opt)
         */
        each: function(object, fn, context) {
            if (object) {
                var key,
                    val,
                    i = 0,
                    length = object && object.length,
                    isObj = length === undefined || S.type(object) === 'function';

                context = context || host;

                if (isObj) {
                    for (key in object) {
                        if (fn.call(context, object[key], key, object) === FALSE) {
                            break;
                        }
                    }
                } else {
                    for (val = object[0];
                         i < length && fn.call(context, val, i, object) !== FALSE; val = object[++i]) {
                    }
                }
            }
            return object;
        },

        /**
         * Search for a specified value within an array.
         */
        indexOf: indexOf ?
            function(item, arr) {
                return indexOf.call(arr, item);
            } :
            function(item, arr) {
                for (var i = 0, len = arr.length; i < len; ++i) {
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
         */
        lastIndexOf: (lastIndexOf) ?
            function(item, arr) {
                return lastIndexOf.call(arr, item);
            } :
            function(item, arr) {
                for (var i = arr.length - 1; i >= 0; i--) {
                    if (arr[i] === item) {
                        break;
                    }
                }
                return i;
            },

        /**
         * Returns a copy of the array with the duplicate entries removed
         * @param a {Array} the array to find the subset of uniques for
         * @param override {Boolean}
         *        if override is true, S.unique([a, b, a]) => [b, a]
         *        if override is false, S.unique([a, b, a]) => [a, b]
         * @return {Array} a copy of the array with duplicate entries removed
         */
        unique: function(a, override) {
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
         */
        inArray: function(item, arr) {
            return S.indexOf(item, arr) > -1;
        },

        /**
         * Executes the supplied function on each item in the array.
         * Returns a new array containing the items that the supplied
         * function returned true for.
         * @param arr {Array} the array to iterate
         * @param fn {Function} the function to execute on each item
         * @param context {Object} optional context object
         * @return {Array} The items on which the supplied function
         *         returned true. If no items matched an empty array is
         *         returned.
         */
        filter: filter ?
            function(arr, fn, context) {
                return filter.call(arr, fn, context || this);
            } :
            function(arr, fn, context) {
                var ret = [];
                S.each(arr, function(item, i, arr) {
                    if (fn.call(context || this, item, i, arr)) {
                        ret.push(item);
                    }
                });
                return ret;
            },
        // https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Array/map
        map:map ?
            function(arr, fn, context) {
                return map.call(arr, fn, context || this);
            } :
            function(arr, fn, context) {
                var len = arr.length,
                    res = new Array(len);
                for (var i = 0; i < len; i++) {
                    var el = S.isString(arr) ? arr.charAt(i) : arr[i];
                    if (el
                        ||
                        //ie<9 in invalid when typeof arr == string
                        i in arr) {
                        res[i] = fn.call(context || this, el, i, arr);
                    }
                }
                return res;
            },

        /**
         * @refer  https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/array/reduce
         */
        reduce:/*
         NaN ?
         reduce ? function(arr, callback, initialValue) {
         return arr.reduce(callback, initialValue);
         } : */function(arr, callback, initialValue) {
            var len = arr.length;
            if (typeof callback !== "function") {
                throw new TypeError("callback is not function!");
            }

            // no value to return if no initial value and an empty array
            if (len === 0 && arguments.length == 2) {
                throw new TypeError("arguments invalid");
            }

            var k = 0;
            var accumulator;
            if (arguments.length >= 3) {
                accumulator = arguments[2];
            }
            else {
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
                    accumulator = callback.call(undefined, accumulator, arr[k], k, arr);
                }
                k++;
            }

            return accumulator;
        },

        every:every ?
            function(arr, fn, context) {
                return every.call(arr, fn, context || this);
            } :
            function(arr, fn, context) {
                var len = arr && arr.length || 0;
                for (var i = 0; i < len; i++) {
                    if (i in arr && !fn.call(context, arr[i], i, arr)) {
                        return FALSE;
                    }
                }
                return TRUE;
            },

        some:some ?
            function(arr, fn, context) {
                return some.call(arr, fn, context || this);
            } :
            function(arr, fn, context) {
                var len = arr && arr.length || 0;
                for (var i = 0; i < len; i++) {
                    if (i in arr && fn.call(context, arr[i], i, arr)) {
                        return TRUE;
                    }
                }
                return FALSE;
            },


        /**
         * it is not same with native bind
         * @refer https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Function/bind
         */
        bind:function(fn, obj) {
            var slice = [].slice,
                args = slice.call(arguments, 2),
                fNOP = function () {
                },
                bound = function () {
                    return fn.apply(this instanceof fNOP ? this : obj,
                        args.concat(slice.call(arguments)));
                };
            fNOP.prototype = fn.prototype;
            bound.prototype = new fNOP();
            return bound;
        },

        /**
         * Gets current date in milliseconds.
         * @refer  https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Date/now
         * http://j-query.blogspot.com/2011/02/timing-ecmascript-5-datenow-function.html
         * http://kangax.github.com/es5-compat-table/
         */
        now: Date.now || function() {
            return +new Date();
        },
        /**
         * frequently used in taobao cookie about nick
         */
        fromUnicode:function(str) {
            return str.replace(/\\u([a-f\d]{4})/ig, function(m, u) {
                return  String.fromCharCode(parseInt(u, HEX_BASE));
            });
        },
        /**
         * escape string to html
         * @refer http://yiminghe.javaeye.com/blog/788929
         * @param str {string} text2html show
         */
        escapeHTML:function(str) {
            return str.replace(getEscapeReg(), function(m) {
                return reverseEntities[m];
            });
        },

        /**
         * unescape html to string
         * @param str {string} html2text
         */
        unEscapeHTML:function(str) {
            return str.replace(getUnEscapeReg(), function(m, n) {
                return htmlEntities[m] || String.fromCharCode(+n);
            });
        },
        /**
         * Converts object to a true array.
         * @param o {object|Array} array like object or array
         * @return {Array}
         */
        makeArray: function(o) {
            if (nullOrUndefined(o)) {
                return [];
            }
            if (S.isArray(o)) {
                return o;
            }

            // The strings and functions also have 'length'
            if (typeof o.length !== 'number' || S.isString(o) || S.isFunction(o)) {
                return [o];
            }
            var ret = [];
            for (var i = 0,l = o.length; i < l; i++) {
                ret[i] = o[i];
            }
            return ret;
        },
        /**
         * Creates a serialized string of an array or object.
         * @return {String}
         * <code>
         * {foo: 1, bar: 2}    // -> 'foo=1&bar=2'
         * {foo: 1, bar: [2, 3]}    // -> 'foo=1&bar=2&bar=3'
         * {foo: '', bar: 2}    // -> 'foo=&bar=2'
         * {foo: undefined, bar: 2}    // -> 'foo=undefined&bar=2'
         * {foo: true, bar: 2}    // -> 'foo=true&bar=2'
         * </code>
         */
        param: function(o, sep, eq, arr) {
            if (!S.isPlainObject(o)) {
                return EMPTY;
            }
            sep = sep || SEP;
            eq = eq || EQ;
            if (S.isUndefined(arr)) {
                arr = TRUE;
            }
            var buf = [], key, val;
            for (key in o) {
                val = o[key];
                key = encode(key);

                // val is valid non-array value
                if (isValidParamValue(val)) {
                    buf.push(key, eq, encode(val + EMPTY), sep);
                }
                // val is not empty array
                else if (S.isArray(val) && val.length) {
                    for (var i = 0, len = val.length; i < len; ++i) {
                        if (isValidParamValue(val[i])) {
                            buf.push(key,
                                (arr ? encode("[]") : EMPTY),
                                eq, encode(val[i] + EMPTY), sep);
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
         * <code>
         * 'section=blog&id=45'        // -> {section: 'blog', id: '45'}
         * 'section=blog&tag=js&tag=doc' // -> {section: 'blog', tag: ['js', 'doc']}
         * 'tag=ruby%20on%20rails'        // -> {tag: 'ruby on rails'}
         * 'id=45&raw'        // -> {id: '45', raw: ''}
         * </code>
         */
        unparam: function(str, sep, eq) {
            if (typeof str !== 'string'
                || (str = S.trim(str)).length === 0) {
                return {};
            }
            sep = sep || SEP;
            eq = eq || EQ;
            var ret = {},
                pairs = str.split(sep),
                pair, key, val,
                i = 0, len = pairs.length;

            for (; i < len; ++i) {
                pair = pairs[i].split(eq);
                key = decode(pair[0]);
                try {
                    val = decode(pair[1] || EMPTY);
                } catch(e) {
                    S.log(e + "decodeURIComponent error : " + pair[1], "error");
                    val = pair[1] || EMPTY;
                }
                if (S.endsWith(key, "[]")) {
                    key = key.substring(0, key.length - 2);
                }
                if (hasOwnProperty.call(ret, key)) {
                    if (S.isArray(ret[key])) {
                        ret[key].push(val);
                    } else {
                        ret[key] = [ret[key],val];
                    }
                } else {
                    ret[key] = val;
                }
            }
            return ret;
        },
        /**
         * Executes the supplied function in the context of the supplied
         * object 'when' milliseconds later. Executes the function a
         * single time unless periodic is set to true.
         * @param fn {Function|String} the function to execute or the name of the method in
         *        the 'o' object to execute.
         * @param when {Number} the number of milliseconds to wait until the fn is executed.
         * @param periodic {Boolean} if true, executes continuously at supplied interval
         *        until canceled.
         * @param context {Object} the context object.
         * @param data [Array] that is provided to the function. This accepts either a single
         *        item or an array. If an array is provided, the function is executed with
         *        one parameter for each array item. If you need to pass a single array
         *        parameter, it needs to be wrapped in an array [myarray].
         * @return {Object} a timer object. Call the cancel() method on this object to stop
         *         the timer.
         */
        later: function(fn, when, periodic, context, data) {
            when = when || 0;
            var m = fn,
                d = S.makeArray(data),
                f,
                r;

            if (S.isString(fn)) {
                m = context[fn];
            }

            if (!m) {
                S.error('method undefined');
            }

            f = function() {
                m.apply(context, d);
            };

            r = (periodic) ? setInterval(f, when) : setTimeout(f, when);

            return {
                id: r,
                interval: periodic,
                cancel: function() {
                    if (this.interval) {
                        clearInterval(r);
                    } else {
                        clearTimeout(r);
                    }
                }
            };
        },

        startsWith:function(str, prefix) {
            return str.lastIndexOf(prefix, 0) === 0;
        },

        endsWith:function(str, suffix) {
            var ind = str.length - suffix.length;
            return ind >= 0 && str.indexOf(suffix, ind) == ind;
        },

        /**
         * Based on YUI3
         * Throttles a call to a method based on the time between calls.
         * @param  {function} fn The function call to throttle.
         * @param {object} context ontext fn to run
         * @param {Number} ms The number of milliseconds to throttle the method call.
         *              Passing a -1 will disable the throttle. Defaults to 150.
         * @return {function} Returns a wrapped function that calls fn throttled.
         */
        throttle:function(fn, ms, context) {
            ms = ms || 150;

            if (ms === -1) {
                return (function() {
                    fn.apply(context || this, arguments);
                });
            }

            var last = S.now();

            return (function() {
                var now = S.now();
                if (now - last > ms) {
                    last = now;
                    fn.apply(context || this, arguments);
                }
            });
        },

        /**
         * buffers a call between  a fixed time
         * @param {function} fn
         * @param {object} context
         * @param {Number} ms
         */
        buffer:function(fn, ms, context) {
            ms = ms || 150;

            if (ms === -1) {
                return (function() {
                    fn.apply(context || this, arguments);
                });
            }
            var bufferTimer = null;

            function f() {
                f.stop();
                bufferTimer = S.later(fn, ms, FALSE, context || this);
            }

            f.stop = function() {
                if (bufferTimer) {
                    bufferTimer.cancel();
                    bufferTimer = 0;
                }
            };

            return f;
        }

    });

    // for idea ..... auto-hint
    S.mix(S, {
        isBoolean:isValidParamValue,
        isNumber:isValidParamValue,
        isString:isValidParamValue,
        isFunction:isValidParamValue,
        isArray:isValidParamValue,
        isDate:isValidParamValue,
        isRegExp:isValidParamValue,
        isObject:isValidParamValue
    });

    S.each('Boolean Number String Function Array Date RegExp Object'.split(' '),
        function(name, lc) {
            // populate the class2type map
            class2type['[object ' + name + ']'] = (lc = name.toLowerCase());

            // add isBoolean/isNumber/...
            S['is' + name] = function(o) {
                return S.type(o) == lc;
            }
        });

    function nullOrUndefined(o) {
        return S.isNull(o) || S.isUndefined(o);
    }


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
        } else if (typeof input === "object") {
            // 引用类型要先记录
            var constructor = input.constructor;
            if (S.inArray(constructor, [Boolean,String,Number,Date,RegExp])) {
                destination = new constructor(input.valueOf());
            }
            // ImageData , File, Blob , FileList .. etc
            else if (isArray = S.isArray(input)) {
                destination = f ? S.filter(input, f) : input.concat();
            } else if (isPlainObject = S.isPlainObject(input)) {
                destination = {};
            }
            // Add a mapping from input (the source object)
            // to output (the destination object) to memory.
            // 做标记
            input[CLONE_MARKER] = (stamp = S.guid());
            // 存储源对象以及克隆后的对象
            memory[stamp] = {destination:destination,input:input};
        }
        // If input is an Array object or an Object object,
        // then, for each enumerable property in input, 
        // add a new property to output having the same name, 
        // and having a value created from invoking the internal structured cloning algorithm recursively 
        // with the value of the property as the "input" argument and memory as the "memory" argument.
        // The order of the properties in the input and output objects must be the same.

        // clone it
        if (isArray) {
            for (var i = 0; i < destination.length; i++) {
                destination[i] = cloneInternal(destination[i], f, memory);
            }
        } else if (isPlainObject) {
            for (k in input) {
                if (k !== CLONE_MARKER &&
                    input.hasOwnProperty(k) &&
                    (!f || (f.call(input, input[k], k, input) !== FALSE))) {
                    destination[k] = cloneInternal(input[k], f, memory);
                }
            }
        }

        return destination;
    }

    function compareObjects(a, b, mismatchKeys, mismatchValues) {
        // 两个比较过了，无需再比较，防止循环比较
        if (a[COMPARE_MARKER] === b && b[COMPARE_MARKER] === a) {
            return TRUE;
        }
        a[COMPARE_MARKER] = b;
        b[COMPARE_MARKER] = a;
        var hasKey = function(obj, keyName) {
            return (obj !== null && obj !== undefined) && obj[keyName] !== undefined;
        };
        for (var property in b) {
            if (!hasKey(a, property) && hasKey(b, property)) {
                mismatchKeys.push("expected has key '" + property + "', but missing from actual.");
            }
        }
        for (property in a) {
            if (!hasKey(b, property) && hasKey(a, property)) {
                mismatchKeys.push("expected missing key '" + property + "', but present in actual.");
            }
        }
        for (property in b) {
            if (property == COMPARE_MARKER) {
                continue;
            }
            if (!S.equals(a[property], b[property], mismatchKeys, mismatchValues)) {
                mismatchValues.push("'" + property + "' was '" + (b[property] ? (b[property].toString()) : b[property])
                    + "' in expected, but was '" +
                    (a[property] ? (a[property].toString()) : a[property]) + "' in actual.");
            }
        }
        if (S.isArray(a) && S.isArray(b) && a.length != b.length) {
            mismatchValues.push("arrays were not the same length");
        }
        delete a[COMPARE_MARKER];
        delete b[COMPARE_MARKER];
        return (mismatchKeys.length === 0 && mismatchValues.length === 0);
    }

})(KISSY, undefined);
/**
 * setup data structure for kissy loader
 * @author yiminghe@gmail.com
 */
(function(S){
    if("require" in this) {
        return;
    }
    S.__loader={};
    S.__loaderUtils={};
    S.__loaderData={};
})(KISSY);/**
 * status constants
 * @author yiminghe@gmail.com
 */
(function(S,data) {
    if("require" in this) {
        return;
    }
    S.mix(data, {
        "LOADING" : 1,
        "LOADED" : 2,
        "ERROR" : 3,
        "ATTACHED" : 4
    });
})(KISSY,KISSY.__loaderData);/**
 * utils for kissy loader
 * @author yiminghe@gmail.com
 */
(function(S, loader, utils) {
    if ("require" in this) {
        return;
    }
    var ua=navigator.userAgent,doc=document;
    S.mix(utils, {
        docHead:function(){
          return doc.getElementsByTagName('head')[0] || doc.documentElement;
        },
        isWebKit:!!ua.match(/AppleWebKit/),
        IE : !!ua.match(/MSIE/),
        isCss:function(url) {
            return /\.css(?:\?|$)/i.test(url);
        },
        isLinkNode:function(n) {
            return n.nodeName.toLowerCase() == 'link';
        },
        /**
         * resolve relative part of path
         * x/../y/z -> y/z
         * x/./y/z -> x/y/z
         * @param path uri path
         * @return {string} resolved path
         * @description similar to path.normalize in nodejs
         */
        normalizePath:function(path) {
            var paths = path.split("/"),
                re = [],
                p;
            for (var i = 0; i < paths.length; i++) {
                p = paths[i];
                if (p == ".") {
                } else if (p == "..") {
                    re.pop();
                } else {
                    re.push(p);
                }
            }
            return re.join("/");
        },

        /**
         * 根据当前模块以及依赖模块的相对路径，得到依赖模块的绝对路径
         * @param moduleName 当前模块
         * @param depName 依赖模块
         * @return {string|Array} 依赖模块的绝对路径
         * @description similar to path.resolve in nodejs
         */
        normalDepModuleName:function normalDepModuleName(moduleName, depName) {
            if (!depName) {
                return depName;
            }
            if (S.isArray(depName)) {
                for (var i = 0; i < depName.length; i++) {
                    depName[i] = normalDepModuleName(moduleName, depName[i]);
                }
                return depName;
            }
            if (startsWith(depName, "../") || startsWith(depName, "./")) {
                var anchor = "",index;
                // x/y/z -> x/y/
                if ((index = moduleName.lastIndexOf("/")) != -1) {
                    anchor = moduleName.substring(0, index + 1);
                }
                return normalizePath(anchor + depName);
            } else if (depName.indexOf("./") != -1
                || depName.indexOf("../") != -1) {
                return normalizePath(depName);
            } else {
                return depName;
            }
        },
        //去除后缀名，要考虑时间戳?
        removePostfix:function (path) {
            return path.replace(/(-min)?\.js[^/]*$/i, "");
        },
        /**
         * 路径正则化，不能是相对地址
         * 相对地址则转换成相对页面的绝对地址
         * 用途:
         * 1. package path 相对地址则相对于当前页面获取绝对地址
         * 2. kissy.js 相对引用如何获取.
         */
        normalBasePath:function (path) {
            if (path.charAt(path.length - 1) != '/') {
                path += "/";
            }
            path = S.trim(path);
            /**
             * 一定要正则化，防止出现 ../ 等相对路径
             * 考虑本地路径
             */
            if (!path.match(/^(http(s)?)|(file):/i)
                && !startsWith(path, "/")) {
                path = loader.__pagePath + path;
            }
            return normalizePath(path);
        },

        //http://wiki.commonjs.org/wiki/Packages/Mappings/A
        //如果模块名以 / 结尾，自动加 index
        indexMapping:function (names) {
            for (var i = 0; i < names.length; i++) {
                if (names[i].match(/\/$/)) {
                    names[i] += "index";
                }
            }
            return names;
        }
    });

    var startsWith = S.startsWith,normalizePath = utils.normalizePath;

})(KISSY, KISSY.__loader, KISSY.__loaderUtils);/**
 * script/css load across browser
 * @author  yiminghe@gmail.com
 */
(function(S, utils) {
    if ("require" in this) {
        return;
    }
    var isWebKit = utils.isWebKit,
        CSS_POLL_INTERVAL = 100,
        /**
         * central poll for link node
         */
            timer = null,

        monitors = {
            /**
             * node.href:{node:node,callback:callback}
             */
        };

    function startCssTimer() {
        if (!timer) {
            S.log("start css polling");
            ccsPoll();
        }
    }

    // single thread is ok
    function ccsPoll() {
        var stop = true;
        for (var url in monitors) {
            var d = monitors[url],
                node = d.node,
                callbacks = d.callbacks,
                loaded = false;
            if (isWebKit) {
                if (node['sheet']) {
                    S.log("webkit loaded : " + url);
                    loaded = true;
                }
            } else if (node['sheet']) {
                try {
                    if (node['sheet'].cssRules) {
                        S.log('firefox  ' + node['sheet'].cssRules + ' loaded : ' + url);
                        loaded = true;
                    }
                } catch(ex) {
                    S.log('firefox  ' + ex.name + ' ' + url);
                    if (ex.name === 'NS_ERROR_DOM_SECURITY_ERR') {
                        S.log('firefox  ' + ex.name + ' loaded : ' + url);
                        loaded = true;
                    }
                }
            }

            if (loaded) {
                S.each(callbacks, function(callback) {
                    callback.call(node);
                });
                delete monitors[url];
            } else {
                stop = false;
            }
        }
        if (stop) {
            timer = null;
            S.log("end css polling");
        } else {
            timer = setTimeout(ccsPoll, CSS_POLL_INTERVAL);
        }
    }


    S.mix(utils, {
        scriptOnload:document.addEventListener ?
            function(node, callback) {
                if (utils.isLinkNode(node)) {
                    return utils.styleOnload(node, callback);
                }
                node.addEventListener('load', callback, false);
            } :
            function(node, callback) {
                if (utils.isLinkNode(node)) {
                    return utils.styleOnload(node, callback);
                }
                var oldCallback = node.onreadystatechange;
                node.onreadystatechange = function() {
                    var rs = node.readyState;
                    if (/loaded|complete/i.test(rs)) {
                        node.onreadystatechange = null;
                        oldCallback && oldCallback();
                        callback.call(this);
                    }
                };
            },

        /**
         * monitor css onload across browsers
         */
        styleOnload:window.attachEvent ?
            //ie/opera
            function(node, callback) {
                // whether to detach using function wrapper?
                function t() {
                    node.detachEvent('onload', t);
                    S.log('ie/opera loaded : ' + node.href);
                    callback.call(node);
                }

                node.attachEvent('onload', t);
            } :
            //refer : http://lifesinger.org/lab/2011/load-js-css/css-preload.html
            //暂时不考虑如何判断失败，如 404 等
            function(node, callback) {
                var k = node.href;
                if (monitors[k]) {
                    monitors[k].callbacks.push(callback);
                } else {
                    monitors[k] = {
                        node:node,
                        callbacks:[callback]
                    };
                }
                startCssTimer();
            }
    });
})(KISSY, KISSY.__loaderUtils);/**
 * getScript support for css and js callback after load
 * @author  lifesinger@gmail.com,yiminghe@gmail.com
 */
(function(S, utils) {
    if ("require" in this) {
        return;
    }
    var MILLISECONDS_OF_SECOND = 1000;
    var scriptOnload = utils.scriptOnload;

    S.mix(S, {

        /**
         * load  a css file from server using http get ,after css file load ,execute success callback
         * @param url css file url
         * @param success callback
         * @param charset
         */
        getStyle:function(url, success, charset) {
            var doc = document,
                head = utils.docHead(),
                node = doc.createElement('link'),
                config = success;

            if (S.isPlainObject(config)) {
                success = config.success;
                charset = config.charset;
            }

            node.href = url;
            node.rel = 'stylesheet';

            if (charset) {
                node.charset = charset;
            }

            if (success) {
                utils.scriptOnload(node, success);
            }
            head.appendChild(node);
            return node;

        },
        /**
         * Load a JavaScript/Css file from the server using a GET HTTP request, then execute it.
         * <code>
         *  getScript(url, success, charset);
         *  or
         *  getScript(url, {
         *      charset: string
         *      success: fn,
         *      error: fn,
         *      timeout: number
         *  });
         * </code>
         */
        getScript:function(url, success, charset) {
            if (utils.isCss(url)) {
                return S.getStyle(url, success, charset);
            }
            var doc = document,
                head = doc.head || doc.getElementsByTagName("head")[0],
                node = doc.createElement('script'),
                config = success,
                error,
                timeout,
                timer;

            if (S.isPlainObject(config)) {
                success = config.success;
                error = config.error;
                timeout = config.timeout;
                charset = config.charset;
            }

            function clearTimer() {
                if (timer) {
                    timer.cancel();
                    timer = undefined;
                }
            }


            node.src = url;
            node.async = true;
            if (charset) {
                node.charset = charset;
            }
            if (success || error) {
                scriptOnload(node, function() {
                    clearTimer();
                    S.isFunction(success) && success.call(node);
                });

                if (S.isFunction(error)) {

                    //标准浏览器
                    if (doc.addEventListener) {
                        node.addEventListener("error", function() {
                            clearTimer();
                            error.call(node);
                        }, false);
                    }

                    timer = S.later(function() {
                        timer = undefined;
                        error();
                    }, (timeout || this.Config.timeout) * MILLISECONDS_OF_SECOND);
                }
            }
            head.insertBefore(node, head.firstChild);
            return node;
        }
    });

})(KISSY, KISSY.__loaderUtils);/**
 * add module definition
 * @author  lifesinger@gmail.com,yiminghe@gmail.com
 */
(function(S, loader, utils, data) {
    if ("require" in this) {
        return;
    }
    var IE = utils.IE,
        ATTACHED = data.ATTACHED,
        mix = S.mix;


    mix(loader, {
        /**
         * Registers a module.
         * @param name {String} module name
         * @param def {Function|Object} entry point into the module that is used to bind module to KISSY
         * @param config {Object}
         * <code>
         * KISSY.add('module-name', function(S){ }, {requires: ['mod1']});
         * </code>
         * <code>
         * KISSY.add({
         *     'mod-name': {
         *         fullpath: 'url',
         *         requires: ['mod1','mod2']
         *     }
         * });
         * </code>
         * @return {KISSY}
         */
        add: function(name, def, config) {
            var self = this,
                mods = self.Env.mods,
                o;

            // S.add(name, config) => S.add( { name: config } )
            if (S.isString(name)
                && !config
                && S.isPlainObject(def)) {
                o = {};
                o[name] = def;
                name = o;
            }

            // S.add( { name: config } )
            if (S.isPlainObject(name)) {
                S.each(name, function(v, k) {
                    v.name = k;
                    if (mods[k]) {
                        // 保留之前添加的配置
                        mix(v, mods[k], false);
                    }
                });
                mix(mods, name);
                return self;
            }
            // S.add(name[, fn[, config]])
            if (S.isString(name)) {

                var host;
                if (config && ( host = config.host )) {
                    var hostMod = mods[host];
                    if (!hostMod) {
                        S.log("module " + host + " can not be found !", "error");
                        //S.error("module " + host + " can not be found !");
                        return self;
                    }
                    if (self.__isAttached(host)) {
                        def.call(self, self);
                    } else {
                        //该 host 模块纯虚！
                        hostMod.fns = hostMod.fns || [];
                        hostMod.fns.push(def);
                    }
                    return self;
                }

                self.__registerModule(name, def, config);
                //显示指定 add 不 attach
                if (config && config['attach'] === false) {
                    return self;
                }
                // 和 1.1.7 以前版本保持兼容，不得已而为之
                var mod = mods[name];
                var requires = utils.normalDepModuleName(name, mod.requires);
                if (self.__isAttached(requires)) {
                    //S.log(mod.name + " is attached when add !");
                    self.__attachMod(mod);
                }
                //调试用，为什么不在 add 时 attach
                else if (this.Config.debug && !mod) {
                    var i,modNames;
                    i = (modNames = S.makeArray(requires)).length - 1;
                    for (; i >= 0; i--) {
                        var requireName = modNames[i];
                        var requireMod = mods[requireName] || {};
                        if (requireMod.status !== ATTACHED) {
                            S.log(mod.name + " not attached when added : depends " + requireName);
                        }
                    }
                }
                return self;
            }
            // S.add(fn,config);
            if (S.isFunction(name)) {
                config = def;
                def = name;
                if (IE) {
                    /*
                     Kris Zyp
                     2010年10月21日, 上午11时34分
                     We actually had some discussions off-list, as it turns out the required
                     technique is a little different than described in this thread. Briefly,
                     to identify anonymous modules from scripts:
                     * In non-IE browsers, the onload event is sufficient, it always fires
                     immediately after the script is executed.
                     * In IE, if the script is in the cache, it actually executes *during*
                     the DOM insertion of the script tag, so you can keep track of which
                     script is being requested in case define() is called during the DOM
                     insertion.
                     * In IE, if the script is not in the cache, when define() is called you
                     can iterate through the script tags and the currently executing one will
                     have a script.readyState == "interactive"
                     See RequireJS source code if you need more hints.
                     Anyway, the bottom line from a spec perspective is that it is
                     implemented, it works, and it is possible. Hope that helps.
                     Kris
                     */
                    // http://groups.google.com/group/commonjs/browse_thread/thread/5a3358ece35e688e/43145ceccfb1dc02#43145ceccfb1dc02
                    // use onload to get module name is not right in ie
                    name = self.__findModuleNameByInteractive();
                    S.log("old_ie get modname by interactive : " + name);
                    self.__registerModule(name, def, config);
                    self.__startLoadModuleName = null;
                    self.__startLoadTime = 0;
                } else {
                    // 其他浏览器 onload 时，关联模块名与模块定义
                    self.__currentModule = {
                        def:def,
                        config:config
                    };
                }
                return self;
            }
            S.log("invalid format for KISSY.add !", "error");
            return self;
        }
    });

})(KISSY, KISSY.__loader, KISSY.__loaderUtils, KISSY.__loaderData);/**
 * build full path from relative path and base path
 * @author  lifesinger@gmail.com,yiminghe@gmail.com
 */
(function(S, loader, utils, data) {
    if ("require" in this) {
        return;
    }
    S.mix(loader, {
        __buildPath: function(mod, base) {
            var self = this,
                Config = self.Config;

            build("fullpath", "path");
            if (mod["cssfullpath"] !== data.LOADED) {
                build("cssfullpath", "csspath");
            }

            function build(fullpath, path) {
                if (!mod[fullpath] && mod[path]) {
                    //如果是 ./ 或 ../ 则相对当前模块路径
                    mod[path] = utils.normalDepModuleName(mod.name, mod[path]);
                    mod[fullpath] = (base || Config.base) + mod[path];
                }
                // debug 模式下，加载非 min 版
                if (mod[fullpath] && Config.debug) {
                    mod[fullpath] = mod[fullpath].replace(/-min/ig, "");
                }

                //刷新客户端缓存，加时间戳 tag
                if (mod[fullpath]
                    && !(mod[fullpath].match(/\?t=/))
                    && mod.tag) {
                    mod[fullpath] += "?t=" + mod.tag;
                }
            }
        }
    });
})(KISSY, KISSY.__loader, KISSY.__loaderUtils, KISSY.__loaderData);/**
 * logic for config.global , mainly for kissy.editor
 * @author  lifesinger@gmail.com,yiminghe@gmail.com
 */
(function(S, loader) {
    if("require" in this) {
        return;
    }
    S.mix(loader, {
        __mixMods: function(global) {
            var self=this,
                mods = self.Env.mods,
                gMods = global.Env.mods,
                name;
            for (name in gMods) {
                self.__mixMod(mods, gMods, name, global);
            }
        },

        __mixMod: function(mods, gMods, name, global) {
            var mod = mods[name] || {},
                status = mod.status;

            S.mix(mod, S.clone(gMods[name]));

            // status 属于实例，当有值时，不能被覆盖。
            // 1. 只有没有初始值时，才从 global 上继承
            // 2. 初始值为 0 时，也从 global 上继承
            // 其他都保存自己的状态
            if (status) {
                mod.status = status;
            }

            // 来自 global 的 mod, path 应该基于 global
            if (global) {
                this.__buildPath(mod, global.Config.base);
            }

            mods[name] = mod;
        }
    });
})(KISSY, KISSY.__loader);/**
 * for ie ,find current executive script ,then infer module name
 * @author yiminghe@gmail.com
 */
(function(S, loader, utils) {
    if ("require" in this) {
        return;
    }
    S.mix(loader, {
        //ie 特有，找到当前正在交互的脚本，根据脚本名确定模块名
        // 如果找不到，返回发送前那个脚本
        __findModuleNameByInteractive:function() {
            var self = this,
                scripts = document.getElementsByTagName("script"),
                re,
                script;

            for (var i = 0; i < scripts.length; i++) {
                script = scripts[i];
                if (script.readyState == "interactive") {
                    re = script;
                    break;
                }
            }
            if (!re) {
                // sometimes when read module file from cache , interactive status is not triggered
                // module code is executed right after inserting into dom
                // i has to preserve module name before insert module script into dom , then get it back here
                S.log("can not find interactive script,time diff : " + (+new Date() - self.__startLoadTime), "error");
                S.log("old_ie get modname from cache : " + self.__startLoadModuleName);
                return self.__startLoadModuleName;
                //S.error("找不到 interactive 状态的 script");
            }

            // src 必定是绝对路径
            // or re.hasAttribute ? re.src :  re.getAttribute('src', 4);
            // http://msdn.microsoft.com/en-us/library/ms536429(VS.85).aspx
            var src = utils.normalBasePath(re.src);
            src = src.substring(0, src.length - 1);
            // S.log("interactive src :" + src);
            // 注意：模块名不包含后缀名以及参数，所以去除
            // 系统模块去除系统路径
            // 需要 base norm , 防止 base 被指定为相对路径
            self.Config.base = utils.normalBasePath(self.Config.base);
            if (src.lastIndexOf(self.Config.base, 0)
                === 0) {
                return utils.removePostfix(src.substring(self.Config.base.length));
            }
            var packages = self.__packages;
            //外部模块去除包路径，得到模块名
            for (var p in packages) {
                var p_path = packages[p].path;
                if (packages.hasOwnProperty(p)
                    && src.lastIndexOf(p_path, 0) === 0) {
                    return utils.removePostfix(src.substring(p_path.length));
                }
            }
            S.log("interactive script does not have package config ：" + src, "error");
        }
    });
})(KISSY, KISSY.__loader, KISSY.__loaderUtils);/**
 * load a single mod (js or css)
 * @author  lifesinger@gmail.com,yiminghe@gmail.com
 */
(function(S, loader, utils, data) {
    if ("require" in this) {
        return;
    }
    var IE = utils.IE,
        LOADING = data.LOADING,
        LOADED = data.LOADED,
        ERROR = data.ERROR,
        ATTACHED = data.ATTACHED;

    S.mix(loader, {
        /**
         * Load a single module.
         */
        __load: function(mod, callback, cfg) {

            var self = this,
                url = mod['fullpath'],
                isCss = utils.isCss(url),
                //这个是全局的，防止多实例对同一模块的重复下载
                loadQueque = self.Env._loadQueue,
                node = loadQueque[url],
                ret;

            mod.status = mod.status || 0;

            // 可能已经由其它模块触发加载
            if (mod.status < LOADING && node) {
                mod.status = node.nodeName ? LOADING : LOADED;
            }

            // 加载 css, 仅发出请求，不做任何其它处理
            if (S.isString(mod["cssfullpath"])) {
                S.getScript(mod["cssfullpath"]);
                mod["cssfullpath"] = mod.csspath = LOADED;
            }

            if (mod.status < LOADING && url) {
                mod.status = LOADING;
                if (IE && !isCss) {
                    self.__startLoadModuleName = mod.name;
                    self.__startLoadTime = Number(+new Date());
                }
                ret = S.getScript(url, {
                    success: function() {
                        if (isCss) {

                        } else {
                            //载入 css 不需要这步了
                            //标准浏览器下：外部脚本执行后立即触发该脚本的 load 事件,ie9 还是不行
                            if (self.__currentModule) {
                                S.log("standard browser get modname after load : " + mod.name);
                                self.__registerModule(mod.name, self.__currentModule.def,
                                    self.__currentModule.config);
                                self.__currentModule = null;
                            }
                            mixGlobal();
                            if (mod.fns && mod.fns.length > 0) {

                            } else {
                                _modError();
                            }
                        }
                        if (mod.status != ERROR) {
                            S.log(mod.name + ' is loaded.', 'info');
                        }
                        _scriptOnComplete();
                    },
                    error: function() {
                        _modError();
                        _scriptOnComplete();
                    },
                    charset: mod.charset
                });

                loadQueque[url] = ret;
            }
            // 已经在加载中，需要添加回调到 script onload 中
            // 注意：没有考虑 error 情形
            else if (mod.status === LOADING) {
                utils.scriptOnload(node, _scriptOnComplete);
            }
            // 是内嵌代码，或者已经 loaded
            else {
                callback();
            }

            function _modError() {
                S.log(mod.name + ' is not loaded! , can not find module in path : ' + mod['fullpath'], 'error');
                mod.status = ERROR;
            }

            function mixGlobal() {
                // 对于动态下载下来的模块，loaded 后，global 上有可能更新 mods 信息
                // 需要同步到 instance 上去
                // 注意：要求 mod 对应的文件里，仅修改该 mod 信息
                if (cfg.global) {
                    self.__mixMod(self.Env.mods, cfg.global.Env.mods,
                        mod.name, cfg.global);
                }
            }

            function _scriptOnComplete() {
                loadQueque[url] = LOADED;
                if (mod.status !== ERROR) {

                    // 注意：当多个模块依赖同一个下载中的模块A下，模块A仅需 attach 一次
                    // 因此要加上下面的 !== 判断，否则会出现重复 attach,
                    // 比如编辑器里动态加载时，被依赖的模块会重复
                    if (mod.status !== ATTACHED) {
                        mod.status = LOADED;
                    }

                    callback();
                }
            }
        }
    });

})(KISSY, KISSY.__loader, KISSY.__loaderUtils, KISSY.__loaderData);/**
 * @module loader
 * @author lifesinger@gmail.com, lijing00333@163.com, yiminghe@gmail.com
 * @description: constant member and common method holder
 */
(function(S, loader, data) {
    if ("require" in this) {
        return;
    }
    var ATTACHED = data.ATTACHED,
        mix = S.mix;

    mix(loader, {

        // 当前页面所在的目录
        // http://xx.com/y/z.htm#!/f/g
        // ->
        // http://xx.com/y/
        __pagePath:location.href.replace(location.hash, "").replace(/[^/]*$/i, ""),

        //firefox,ie9,chrome 如果add没有模块名，模块定义先暂存这里
        __currentModule:null,

        //ie6,7,8开始载入脚本的时间
        __startLoadTime:0,

        //ie6,7,8开始载入脚本对应的模块名
        __startLoadModuleName:null,

        __isAttached: function(modNames) {
            var mods = this.Env.mods,
                ret = true;
            S.each(modNames, function(name) {
                var mod = mods[name];
                if (!mod || mod.status !== ATTACHED) {
                    ret = false;
                    return ret;
                }
            });
            return ret;
        }
    });


})(KISSY, KISSY.__loader, KISSY.__loaderData);

/**
 * 2011-01-04 chengyu<yiminghe@gmail.com> refactor:
 *
 * adopt requirejs :
 *
 * 1. packages(cfg) , cfg :{
 *    name : 包名，用于指定业务模块前缀
 *    path: 前缀包名对应的路径
 *    charset: 该包下所有文件的编码
 *
 * 2. add(moduleName,function(S,depModule){return function(){}},{requires:["depModuleName"]});
 *    moduleName add 时可以不写
 *    depModuleName 可以写相对地址 (./ , ../)，相对于 moduleName
 *
 * 3. S.use(["dom"],function(S,DOM){
 *    });
 *    依赖注入，发生于 add 和 use 时期
 *
 * 4. add,use 不支持 css loader ,getScript 仍然保留支持
 *
 * 5. 部分更新模块文件代码 x/y?t=2011 ，加载过程中注意去除事件戳，仅在载入文件时使用
 *
 * demo : http://lite-ext.googlecode.com/svn/trunk/lite-ext/playground/module_package/index.html
 *
 * 2011-03-01 yiminghe@gmail.com note:
 *
 * compatibility
 *
 * 1. 保持兼容性，不得已而为之
 *      支持 { host : }
 *      如果 requires 都已经 attached，支持 add 后立即 attach
 *      支持 { attach : false } 显示控制 add 时是否 attach
 *      支持 { global : Editor } 指明模块来源
 *
 *
 * 2011-05-04 初步拆分文件，tmd 乱了
 */

/**
 * package mechanism
 * @author yiminghe@gmail.com
 */
(function(S, loader, utils) {
    if ("require" in this) {
        return;
    }

    S.mix(loader, {

        /**
         * 包声明
         * biz -> .
         * 表示遇到 biz/x
         * 在当前网页路径找 biz/x.js
         */
        _packages:function(cfgs) {
            var self = this,
                ps;
            ps = self.__packages = self.__packages || {};
            S.each(cfgs, function(cfg) {
                ps[cfg.name] = cfg;
                //注意正则化
                cfg.path = cfg.path && utils.normalBasePath(cfg.path);
                cfg.tag = cfg.tag && encodeURIComponent(cfg.tag);
            });
        },

        __getPackagePath:function(mod) {
            //缓存包路径，未申明的包的模块都到核心模块中找
            if (mod.packagepath) {
                return mod.packagepath;
            }
            var self = this,
                //一个模块合并到了另一个模块文件中去
                modName = self._combine(mod.name),
                packages = self.__packages || {},
                pName = "",
                p_def;

            for (var p in packages) {
                if (packages.hasOwnProperty(p)
                    && S.startsWith(modName, p)
                    && p.length > pName
                    ) {
                    pName = p;
                }
            }
            p_def = packages[pName];
            mod.charset = p_def && p_def.charset || mod.charset;
            if (p_def) {
                mod.tag = p_def.tag;
            } else {
                // kissy 自身组件的事件戳后缀
                mod.tag = encodeURIComponent(S.Config.tag || S.buildTime);
            }
            return mod.packagepath = (p_def && p_def.path) || self.Config.base;
        },
        /**
         * compress 'from module' to 'to module'
         * {
         *   core:['dom','ua','event','node','json','ajax','anim','base','cookie']
         * }
         */
        _combine:function(from, to) {
            var self = this,
                cs;
            if (S.isObject(from)) {
                S.each(from, function(v, k) {
                    S.each(v, function(v2) {
                        self._combine(v2, k);
                    });
                });
                return;
            }
            cs = self.__combines = self.__combines || {};
            if (to) {
                cs[from] = to;
            } else {
                return cs[from] || from;
            }
        }
    });
})(KISSY, KISSY.__loader, KISSY.__loaderUtils);/**
 * register module ,associate module name with module factory(definition)
 * @author  lifesinger@gmail.com,yiminghe@gmail.com
 */
(function(S, loader,data) {
    if ("require" in this) {
        return;
    }
    var LOADED = data.LOADED,
        mix = S.mix;

    mix(loader, {
        //注册模块，将模块和定义 factory 关联起来
        __registerModule:function(name, def, config) {
            config = config || {};
            var self = this,
                mods = self.Env.mods,
                mod = mods[name] || {};

            // 注意：通过 S.add(name[, fn[, config]]) 注册的代码，无论是页面中的代码，
            // 还是 js 文件里的代码，add 执行时，都意味着该模块已经 LOADED
            mix(mod, { name: name, status: LOADED });

            if (mod.fns && mod.fns.length) {
                S.log(name + " is defined more than once");
                //S.error(name + " is defined more than once");
            }

            //支持 host，一个模块多个 add factory
            mod.fns = mod.fns || [];
            mod.fns.push(def);
            mix((mods[name] = mod), config);
        }
    });
})(KISSY, KISSY.__loader, KISSY.__loaderData);/**
 * use and attach mod
 * @author  lifesinger@gmail.com,yiminghe@gmail.com
 */
(function(S, loader, utils, data) {
    if ("require" in this) {
        return;
    }
    var LOADED = data.LOADED,
        ATTACHED = data.ATTACHED;

    S.mix(loader, {
        /**
         * Start load specific mods, and fire callback when these mods and requires are attached.
         * <code>
         * S.use('mod-name', callback, config);
         * S.use('mod1,mod2', callback, config);
         * </code>
         */
        use: function(modNames, callback, cfg) {
            modNames = modNames.replace(/\s+/g, "").split(',');
            utils.indexMapping(modNames);
            cfg = cfg || {};

            var self = this,
                fired;
            //如果 use 指定了 global
            if (cfg.global) {
                self.__mixMods(cfg.global);
            }

            // 已经全部 attached, 直接执行回调即可
            if (self.__isAttached(modNames)) {
                var mods = self.__getModules(modNames);
                callback && callback.apply(self, mods);
                return;
            }

            // 有尚未 attached 的模块
            S.each(modNames, function(modName) {
                // 从 name 开始调用，防止不存在模块
                self.__attachModByName(modName, function() {
                    if (!fired && self.__isAttached(modNames)) {
                        fired = true;
                        var mods = self.__getModules(modNames);
                        callback && callback.apply(self, mods);
                    }
                }, cfg);
            });

            return self;
        },

        __getModules:function(modNames) {
            var self = this,
                mods = [self];
            S.each(modNames, function(modName) {
                if (!utils.isCss(modName)) {
                    mods.push(self.require(modName));
                }
            });
            return mods;
        },

        /**
         * get module's value defined by define function
         * @param {string} moduleName
         */
        require:function(moduleName) {
            var mods = S.Env.mods,
                mod = mods[moduleName],
                re = S['onRequire'] && S['onRequire'](mod);
            if (re !== undefined) {
                return re;
            }
            return mod && mod.value;
        },

        //加载指定模块名模块，如果不存在定义默认定义为内部模块
        __attachModByName: function(modName, callback, cfg) {

            var self = this,
                mods = self.Env.mods,
                mod = mods[modName];
            //没有模块定义
            if (!mod) {
                // 默认 js/css 名字
                // 不指定 .js 默认为 js
                // 指定为 css 载入 .css
                var componentJsName = self.Config['componentJsName'] || function(m) {
                    var suffix = "js";
                    if (/(.+)\.(js|css)$/i.test(m)) {
                        suffix = RegExp.$2;
                        m = RegExp.$1;
                    }
                    return m + '-min.' + suffix;
                },  path = S.isFunction(componentJsName) ?
                    //一个模块合并到了了另一个模块文件中去
                    componentJsName(self._combine(modName))
                    : componentJsName;
                mod = {
                    path:path,
                    charset: 'utf-8'
                };
                //添加模块定义
                mods[modName] = mod;
            }
            mod.name = modName;
            if (mod && mod.status === ATTACHED) {
                return;
            }

            self.__attach(mod, callback, cfg);
        },

        /**
         * Attach a module and all required modules.
         */
        __attach: function(mod, callback, cfg) {
            var self = this,
                mods = self.Env.mods,
                //复制一份当前的依赖项出来，防止add后修改！
                requires = (mod['requires'] || []).concat();
            mod['requires'] = requires;

            // attach all required modules
            S.each(requires, function(r, i, requires) {
                r = requires[i] = utils.normalDepModuleName(mod.name, r);
                var rMod = mods[r];
                if (rMod && rMod.status === ATTACHED) {
                    //no need
                } else {
                    self.__attachModByName(r, fn, cfg);
                }
            });


            // load and attach this module
            self.__buildPath(mod, self.__getPackagePath(mod));

            self.__load(mod, function() {

                // add 可能改了 config，这里重新取下
                mod['requires'] = mod['requires'] || [];

                var newRequires = mod['requires'];
                //var    optimize = [];

                //本模块下载成功后串行下载 require
                S.each(newRequires, function(r, i, newRequires) {
                    r = newRequires[i] = utils.normalDepModuleName(mod.name, r);
                    var rMod = mods[r],
                        inA = S.inArray(r, requires);
                    //已经处理过了或将要处理
                    if (rMod && rMod.status === ATTACHED
                        //已经正在处理了
                        || inA) {
                        //no need
                    } else {
                        //新增的依赖项
                        self.__attachModByName(r, fn, cfg);
                    }
                    /**
                     * 依赖项需要重新下载，最好和被依赖者一起 use
                     */
//                    if (!inA && (!rMod || rMod.status < LOADED)) {
//                        optimize.push(r);
//                    }
                });

//                if (optimize.length != 0) {
//                    optimize.unshift(mod.name);
//                    S.log(optimize + " : better to be used together", "warn");
//                }

                fn();
            }, cfg);

            var attached = false;

            function fn() {
                if (!attached && self.__isAttached(mod['requires'])) {

                    if (mod.status === LOADED) {
                        self.__attachMod(mod);
                    }
                    if (mod.status === ATTACHED) {
                        attached = true;
                        callback();
                    }
                }
            }
        },

        __attachMod: function(mod) {
            var self = this,
                defs = mod.fns;

            if (defs) {
                S.each(defs, function(def) {
                    var value;
                    if (S.isFunction(def)) {
                        value = def.apply(self, self.__getModules(mod['requires']));
                    } else {
                        value = def;
                    }
                    mod.value = mod.value || value;
                });
            }

            mod.status = ATTACHED;
        }
    });
})(KISSY, KISSY.__loader, KISSY.__loaderUtils, KISSY.__loaderData);/**
 *  mix loader into S and infer KISSy baseUrl if not set
 *  @author  lifesinger@gmail.com,yiminghe@gmail.com
 */
(function(S, loader, utils) {
    if ("require" in this) {
        return;
    }
    S.mix(S, loader);

    /**
     * get base from src
     * @param src script source url
     * @return base for kissy
     * @example:
     *   http://a.tbcdn.cn/s/kissy/1.1.6/??kissy-min.js,suggest/suggest-pkg-min.js
     *   http://a.tbcdn.cn/??s/kissy/1.1.6/kissy-min.js,s/kissy/1.1.5/suggest/suggest-pkg-min.js
     *   http://a.tbcdn.cn/??s/kissy/1.1.6/suggest/suggest-pkg-min.js,s/kissy/1.1.5/kissy-min.js
     *   http://a.tbcdn.cn/s/kissy/1.1.6/kissy-min.js?t=20101215.js
     * @notice: custom combo rules, such as yui3:
     *  <script src="path/to/kissy" data-combo-prefix="combo?" data-combo-sep="&"></script>
     */
        // notice: timestamp
    var baseReg = /^(.*)(seed|kissy)(-aio)?(-min)?\.js[^/]*/i,
        baseTestReg = /(seed|kissy)(-aio)?(-min)?\.js/i;

    function getBaseUrl(script) {
        var src = script.src,
            prefix = script.getAttribute('data-combo-prefix') || '??',
            sep = script.getAttribute('data-combo-sep') || ',',
            parts = src.split(sep),
            base,
            part0 = parts[0],
            index = part0.indexOf(prefix);

        // no combo
        if (index == -1) {
            base = src.replace(baseReg, '$1');
        } else {
            base = part0.substring(0, index);
            var part01 = part0.substring(index + 2, part0.length);
            // combo first
            // notice use match better than test
            if (part01.match(baseTestReg)) {
                base += part01.replace(baseReg, '$1');
            }
            // combo after first
            else {
                S.each(parts, function(part) {
                    if (part.match(baseTestReg)) {
                        base += part.replace(baseReg, '$1');
                        return false;
                    }
                });
            }
        }
        return base;
    }


    /**
     * Initializes loader.
     */
    S.__initLoader = function() {
        var self = this;
        self.Env.mods = self.Env.mods || {}; // all added mods
        self.Env._loadQueue = {}; // information for loading and loaded mods
    };

    S.__initLoader();

    (function() {
        // get base from current script file path
        var scripts = document.getElementsByTagName('script'),
            currentScript = scripts[scripts.length - 1],
            base = getBaseUrl(currentScript);
        S.Config.base = utils.normalBasePath(base);
        // the default timeout for getScript
        S.Config.timeout = 10;
    })();

    // for S.app working properly
    S.each(loader, function(v, k) {
        S.__APP_MEMBERS.push(k);
    });

    S.__APP_INIT_METHODS.push('__initLoader');

})(KISSY, KISSY.__loader, KISSY.__loaderUtils);/**
 * @module  web.js
 * @author  lifesinger@gmail.com,yiminghe@gmail.com
 * @description this code can only run at browser environment
 */
(function(S, undefined) {

    var win = S.__HOST,
        doc = win['document'],

        docElem = doc.documentElement,

        EMPTY = '',

        // Is the DOM ready to be used? Set to true once it occurs.
        isReady = false,

        // The functions to execute on DOM ready.
        readyList = [],

        // Has the ready events already been bound?
        readyBound = false,

        // The number of poll times.
        POLL_RETRYS = 500,

        // The poll interval in milliseconds.
        POLL_INTERVAL = 40,

        // #id or id
        RE_IDSTR = /^#?([\w-]+)$/,

        RE_NOT_WHITE = /\S/;
    S.mix(S, {


        /**
         * A crude way of determining if an object is a window
         */
        isWindow: function(o) {
            return S.type(o) === 'object'
                && 'setInterval' in o
                && 'document' in o
                && o.document.nodeType == 9;
        },


        parseXML: function(data) {
            var xml;
            try {
                // Standard
                if (window.DOMParser) {
                    xml = new DOMParser().parseFromString(data, "text/xml");
                } else { // IE
                    xml = new ActiveXObject("Microsoft.XMLDOM");
                    xml.async = "false";
                    xml.loadXML(data);
                }
            } catch(e) {
                S.log("parseXML error : ");
                S.log(e);
                xml = undefined;
            }
            if (!xml || !xml.documentElement || xml.getElementsByTagName("parsererror").length) {
                S.error("Invalid XML: " + data);
            }
            return xml;
        },

        /**
         * Evalulates a script in a global context.
         */
        globalEval: function(data) {
            if (data && RE_NOT_WHITE.test(data)) {
                // Inspired by code by Andrea Giammarchi
                // http://webreflection.blogspot.com/2007/08/global-scope-evaluation-and-dom.html
                var head = doc.getElementsByTagName('head')[0] || docElem,
                    script = doc.createElement('script');

                // It works! All browsers support!
                script.text = data;

                // Use insertBefore instead of appendChild to circumvent an IE6 bug.
                // This arises when a base node is used.
                head.insertBefore(script, head.firstChild);
                head.removeChild(script);
            }
        },

        /**
         * Specify a function to execute when the DOM is fully loaded.
         * @param fn {Function} A function to execute after the DOM is ready
         * <code>
         * KISSY.ready(function(S){ });
         * </code>
         * @return {KISSY}
         */
        ready: function(fn) {
            // Attach the listeners
            if (!readyBound) {
                _bindReady();
            }

            // If the DOM is already ready
            if (isReady) {
                // Execute the function immediately
                fn.call(win, this);
            } else {
                // Remember the function for later
                readyList.push(fn);
            }

            return this;
        },

        /**
         * Executes the supplied callback when the item with the supplied id is found.
         * @param id <String> The id of the element, or an array of ids to look for.
         * @param fn <Function> What to execute when the element is found.
         */
        available: function(id, fn) {
            id = (id + EMPTY).match(RE_IDSTR)[1];
            if (!id || !S.isFunction(fn)) {
                return;
            }

            var retryCount = 1,

                timer = S.later(function() {
                    if (doc.getElementById(id) && (fn() || 1) || ++retryCount > POLL_RETRYS) {
                        timer.cancel();
                    }

                }, POLL_INTERVAL, true);
        }
    });


    /**
     * Binds ready events.
     */
    function _bindReady() {
        var doScroll = doc.documentElement.doScroll,
            eventType = doScroll ? 'onreadystatechange' : 'DOMContentLoaded',
            COMPLETE = 'complete',
            fire = function() {
                _fireReady();
            };

        // Set to true once it runs
        readyBound = true;

        // Catch cases where ready() is called after the
        // browser event has already occurred.
        if (doc.readyState === COMPLETE) {
            return fire();
        }

        // w3c mode
        if (doc.addEventListener) {
            function domReady() {
                doc.removeEventListener(eventType, domReady, false);
                fire();
            }

            doc.addEventListener(eventType, domReady, false);

            // A fallback to window.onload, that will always work
            win.addEventListener('load', fire, false);
        }
        // IE event model is used
        else {
            function stateChange() {
                if (doc.readyState === COMPLETE) {
                    doc.detachEvent(eventType, stateChange);
                    fire();
                }
            }

            // ensure firing before onload, maybe late but safe also for iframes
            doc.attachEvent(eventType, stateChange);

            // A fallback to window.onload, that will always work.
            win.attachEvent('onload', fire);

            // If IE and not a frame
            // continually check to see if the document is ready
            var notframe = false;

            try {
                notframe = (win['frameElement'] === null);
            } catch(e) {
                S.log("frameElement error : ");
                S.log(e);
            }

            if (doScroll && notframe) {
                function readyScroll() {
                    try {
                        // Ref: http://javascript.nwbox.com/IEContentLoaded/
                        doScroll('left');
                        fire();
                    } catch(ex) {
                        //S.log("detect document ready : " + ex);
                        setTimeout(readyScroll, POLL_INTERVAL);
                    }
                }

                readyScroll();
            }
        }
        return 0;
    }

    /**
     * Executes functions bound to ready event.
     */
    function _fireReady() {
        if (isReady) {
            return;
        }

        // Remember that the DOM is ready
        isReady = true;

        // If there are functions bound, to execute
        if (readyList) {
            // Execute all of them
            var fn, i = 0;
            while (fn = readyList[i++]) {
                fn.call(win, S);
            }

            // Reset the list of functions
            readyList = null;
        }
    }

    // If url contains '?ks-debug', debug mode will turn on automatically.
    if (location && (location.search || EMPTY).indexOf('ks-debug') !== -1) {
        S.Config.debug = true;
    }

})(KISSY, undefined);
/**
 * 声明 kissy 核心中所包含的模块，动态加载时将直接从 core.js 中加载核心模块
 * @description: 为了和 1.1.7 及以前版本保持兼容，务实与创新，兼容与革新 ！
 * @author yiminghe@gmail.com
 */
(function(S) {
    S.config({
        combine:{
            core:['dom','ua','event','node','json','ajax','anim','base','cookie']
        }
    });
})(KISSY);
/**
 combined files : 

D:\code\kissy_git\kissy\src\ua\base.js
D:\code\kissy_git\kissy\src\ua\extra.js
D:\code\kissy_git\kissy\src\ua.js
D:\code\kissy_git\kissy\src\dom\base.js
D:\code\kissy_git\kissy\src\dom\attr.js
D:\code\kissy_git\kissy\src\dom\class.js
D:\code\kissy_git\kissy\src\dom\create.js
D:\code\kissy_git\kissy\src\dom\data.js
D:\code\kissy_git\kissy\src\dom\insertion.js
D:\code\kissy_git\kissy\src\dom\offset.js
D:\code\kissy_git\kissy\src\dom\style.js
D:\code\kissy_git\kissy\src\dom\selector.js
D:\code\kissy_git\kissy\src\dom\style-ie.js
D:\code\kissy_git\kissy\src\dom\traversal.js
D:\code\kissy_git\kissy\src\dom.js
D:\code\kissy_git\kissy\src\event\keycodes.js
D:\code\kissy_git\kissy\src\event\object.js
D:\code\kissy_git\kissy\src\event\base.js
D:\code\kissy_git\kissy\src\event\target.js
D:\code\kissy_git\kissy\src\event\focusin.js
D:\code\kissy_git\kissy\src\event\hashchange.js
D:\code\kissy_git\kissy\src\event\valuechange.js
D:\code\kissy_git\kissy\src\event\delegate.js
D:\code\kissy_git\kissy\src\event\mouseenter.js
D:\code\kissy_git\kissy\src\event\submit.js
D:\code\kissy_git\kissy\src\event\change.js
D:\code\kissy_git\kissy\src\event.js
D:\code\kissy_git\kissy\src\node\base.js
D:\code\kissy_git\kissy\src\node\attach.js
D:\code\kissy_git\kissy\src\node\override.js
D:\code\kissy_git\kissy\src\anim\easing.js
D:\code\kissy_git\kissy\src\anim\manager.js
D:\code\kissy_git\kissy\src\anim\base.js
D:\code\kissy_git\kissy\src\anim\color.js
D:\code\kissy_git\kissy\src\anim\scroll.js
D:\code\kissy_git\kissy\src\anim.js
D:\code\kissy_git\kissy\src\node\anim-plugin.js
D:\code\kissy_git\kissy\src\node.js
D:\code\kissy_git\kissy\src\json\json2.js
D:\code\kissy_git\kissy\src\json.js
D:\code\kissy_git\kissy\src\ajax\form-serializer.js
D:\code\kissy_git\kissy\src\ajax\xhrobject.js
D:\code\kissy_git\kissy\src\ajax\base.js
D:\code\kissy_git\kissy\src\ajax\xhrbase.js
D:\code\kissy_git\kissy\src\ajax\subdomain.js
D:\code\kissy_git\kissy\src\ajax\xdr.js
D:\code\kissy_git\kissy\src\ajax\xhr.js
D:\code\kissy_git\kissy\src\ajax\script.js
D:\code\kissy_git\kissy\src\ajax\jsonp.js
D:\code\kissy_git\kissy\src\ajax\form.js
D:\code\kissy_git\kissy\src\ajax\iframe-upload.js
D:\code\kissy_git\kissy\src\ajax.js
D:\code\kissy_git\kissy\src\base\attribute.js
D:\code\kissy_git\kissy\src\base\base.js
D:\code\kissy_git\kissy\src\base.js
D:\code\kissy_git\kissy\src\cookie\base.js
D:\code\kissy_git\kissy\src\cookie.js
D:\code\kissy_git\kissy\src\core.js
**/

/**
 * @module  ua
 * @author  lifesinger@gmail.com
 */
KISSY.add('ua/base', function() {

    var ua = navigator.userAgent,
        EMPTY = '', MOBILE = 'mobile',
        core = EMPTY, shell = EMPTY, m,
        o = {
            // browser core type
            //webkit: 0,
            //trident: 0,
            //gecko: 0,
            //presto: 0,

            // browser type
            //chrome: 0,
            //safari: 0,
            //firefox:  0,
            //ie: 0,
            //opera: 0

            //mobile: '',
            //core: '',
            //shell: ''
        },
        numberify = function(s) {
            var c = 0;
            // convert '1.2.3.4' to 1.234
            return parseFloat(s.replace(/\./g, function() {
                return (c++ === 0) ? '.' : '';
            }));
        };

    // WebKit
    if ((m = ua.match(/AppleWebKit\/([\d.]*)/)) && m[1]) {
        o[core = 'webkit'] = numberify(m[1]);

        // Chrome
        if ((m = ua.match(/Chrome\/([\d.]*)/)) && m[1]) {
            o[shell = 'chrome'] = numberify(m[1]);
        }
        // Safari
        else if ((m = ua.match(/\/([\d.]*) Safari/)) && m[1]) {
            o[shell = 'safari'] = numberify(m[1]);
        }

        // Apple Mobile
        if (/ Mobile\//.test(ua)) {
            o[MOBILE] = 'apple'; // iPad, iPhone or iPod Touch
        }
        // Other WebKit Mobile Browsers
        else if ((m = ua.match(/NokiaN[^\/]*|Android \d\.\d|webOS\/\d\.\d/))) {
            o[MOBILE] = m[0].toLowerCase(); // Nokia N-series, Android, webOS, ex: NokiaN95
        }
    }
    // NOT WebKit
    else {
        // Presto
        // ref: http://www.useragentstring.com/pages/useragentstring.php
        if ((m = ua.match(/Presto\/([\d.]*)/)) && m[1]) {
            o[core = 'presto'] = numberify(m[1]);
            
            // Opera
            if ((m = ua.match(/Opera\/([\d.]*)/)) && m[1]) {
                o[shell = 'opera'] = numberify(m[1]); // Opera detected, look for revision

                if ((m = ua.match(/Opera\/.* Version\/([\d.]*)/)) && m[1]) {
                    o[shell] = numberify(m[1]);
                }

                // Opera Mini
                if ((m = ua.match(/Opera Mini[^;]*/)) && m) {
                    o[MOBILE] = m[0].toLowerCase(); // ex: Opera Mini/2.0.4509/1316
                }
                // Opera Mobile
                // ex: Opera/9.80 (Windows NT 6.1; Opera Mobi/49; U; en) Presto/2.4.18 Version/10.00
                // issue: 由于 Opera Mobile 有 Version/ 字段，可能会与 Opera 混淆，同时对于 Opera Mobile 的版本号也比较混乱
                else if ((m = ua.match(/Opera Mobi[^;]*/)) && m){
                    o[MOBILE] = m[0];
                }
            }
            
        // NOT WebKit or Presto
        } else {
            // MSIE
            if ((m = ua.match(/MSIE\s([^;]*)/)) && m[1]) {
                o[core = 'trident'] = 0.1; // Trident detected, look for revision
                // 注意：
                //  o.shell = ie, 表示外壳是 ie
                //  但 o.ie = 7, 并不代表外壳是 ie7, 还有可能是 ie8 的兼容模式
                //  对于 ie8 的兼容模式，还要通过 documentMode 去判断。但此处不能让 o.ie = 8, 否则
                //  很多脚本判断会失误。因为 ie8 的兼容模式表现行为和 ie7 相同，而不是和 ie8 相同
                o[shell = 'ie'] = numberify(m[1]);

                // Get the Trident's accurate version
                if ((m = ua.match(/Trident\/([\d.]*)/)) && m[1]) {
                    o[core] = numberify(m[1]);
                }

            // NOT WebKit, Presto or IE
            } else {
                // Gecko
                if ((m = ua.match(/Gecko/))) {
                    o[core = 'gecko'] = 0.1; // Gecko detected, look for revision
                    if ((m = ua.match(/rv:([\d.]*)/)) && m[1]) {
                        o[core] = numberify(m[1]);
                    }

                    // Firefox
                    if ((m = ua.match(/Firefox\/([\d.]*)/)) && m[1]) {
                        o[shell = 'firefox'] = numberify(m[1]);
                    }
                }
            }
        }
    }

    o.core = core;
    o.shell = shell;
    o._numberify = numberify;
    return o;
});

/**
 * NOTES:
 *
 * 2010.03
 *  - jQuery, YUI 等类库都推荐用特性探测替代浏览器嗅探。特性探测的好处是能自动适应未来设备和未知设备，比如
 *    if(document.addEventListener) 假设 IE9 支持标准事件，则代码不用修改，就自适应了“未来浏览器”。
 *    对于未知浏览器也是如此。但是，这并不意味着浏览器嗅探就得彻底抛弃。当代码很明确就是针对已知特定浏览器的，
 *    同时并非是某个特性探测可以解决时，用浏览器嗅探反而能带来代码的简洁，同时也也不会有什么后患。总之，一切
 *    皆权衡。
 *  - UA.ie && UA.ie < 8 并不意味着浏览器就不是 IE8, 有可能是 IE8 的兼容模式。进一步的判断需要使用 documentMode.
 *
 * TODO:
 *  - test mobile
 *  - 3Q 大战后，360 去掉了 UA 信息中的 360 信息，需采用 res 方法去判断
 *
 */

/**
 * @module  ua-extra
 * @author  gonghao<gonghao@ghsky.com>
 */
KISSY.add('ua/extra', function(S, UA) {
    var ua = navigator.userAgent,
        m, external, shell,
        o = { },
        numberify = UA._numberify;

    /**
     * 说明：
     * @子涯总结的各国产浏览器的判断依据: http://spreadsheets0.google.com/ccc?key=tluod2VGe60_ceDrAaMrfMw&hl=zh_CN#gid=0
     * 根据 CNZZ 2009 年度浏览器占用率报告，优化了判断顺序：http://www.tanmi360.com/post/230.htm
     * 如果检测出浏览器，但是具体版本号未知用 0.1 作为标识
     * 世界之窗 & 360 浏览器，在 3.x 以下的版本都无法通过 UA 或者特性检测进行判断，所以目前只要检测到 UA 关键字就认为起版本号为 3
     */

    // 360Browser
    if (m = ua.match(/360SE/)) {
        o[shell = 'se360'] = 3; // issue: 360Browser 2.x cannot be recognised, so if recognised default set verstion number to 3
    }
    // Maxthon
    else if ((m = ua.match(/Maxthon/)) && (external = window.external)) {
        // issue: Maxthon 3.x in IE-Core cannot be recognised and it doesn't have exact version number
        // but other maxthon versions all have exact version number
        shell = 'maxthon';
        try {
            o[shell] = numberify(external['max_version']);
        } catch(ex) {
            o[shell] = 0.1;
        }
    }
    // TT
    else if (m = ua.match(/TencentTraveler\s([\d.]*)/)) {
        o[shell = 'tt'] = m[1] ? numberify(m[1]) : 0.1;
    }
    // TheWorld
    else if (m = ua.match(/TheWorld/)) {
        o[shell = 'theworld'] = 3; // issue: TheWorld 2.x cannot be recognised, so if recognised default set verstion number to 3
    }
    // Sougou
    else if (m = ua.match(/SE\s([\d.]*)/)) {
        o[shell = 'sougou'] = m[1] ? numberify(m[1]) : 0.1;
    }

    // If the browser has shell(no matter IE-core or Webkit-core or others), set the shell key
    shell && (o.shell = shell);

    S.mix(UA, o);
    return UA;
}, {
    requires:["ua/base"]
});

KISSY.add("ua", function(S,UA) {
    return UA;
}, {
    requires:["ua/extra"]
});

/**
 * @module  dom
 * @author  lifesinger@gmail.com,yiminghe@gmail.com
 */
KISSY.add('dom/base', function(S, undefined) {

    function nodeTypeIs(node, val) {
        return node && node.nodeType === val;
    }

    var DOM = {

        /**
         * enumeration of dom node type
         * @type Number
         */
        ELEMENT_NODE : 1,
        ATTRIBUTE_NODE : 2,
        TEXT_NODE:3,
        CDATA_SECTION_NODE : 4,
        ENTITY_REFERENCE_NODE: 5,
        ENTITY_NODE : 6,
        PROCESSING_INSTRUCTION_NODE :7,
        COMMENT_NODE : 8,
        DOCUMENT_NODE : 9,
        DOCUMENT_TYPE_NODE : 10,
        DOCUMENT_FRAGMENT_NODE : 11,
        NOTATION_NODE : 12,

        /**
         * 是不是 element node
         */
        _isElementNode: function(elem) {
            return nodeTypeIs(elem, DOM.ELEMENT_NODE);
        },

        /**
         * elem 为 window 时，直接返回
         * elem 为 document 时，返回关联的 window
         * elem 为 undefined 时，返回当前 window
         * 其它值，返回 false
         */
        _getWin: function(elem) {
            return (elem && ('scrollTo' in elem) && elem['document']) ?
                elem :
                nodeTypeIs(elem, DOM.DOCUMENT_NODE) ?
                    elem.defaultView || elem.parentWindow :
                    (elem === undefined || elem === null) ?
                        window : false;
        },

        _nodeTypeIs: nodeTypeIs,

        // Ref: http://lifesinger.github.com/lab/2010/nodelist.html
        _isNodeList:function(o) {
            // 注1：ie 下，有 window.item, typeof node.item 在 ie 不同版本下，返回值不同
            // 注2：select 等元素也有 item, 要用 !node.nodeType 排除掉
            // 注3：通过 namedItem 来判断不可靠
            // 注4：getElementsByTagName 和 querySelectorAll 返回的集合不同
            // 注5: 考虑 iframe.contentWindow
            return o && !o.nodeType && o.item && !o.setTimeout;
        },

        _nodeName:function(e, name) {
            return e && e.nodeName.toLowerCase() === name.toLowerCase();
        }
    };

    return DOM;

});

/**
 * 2011-08
 *  - 添加键盘枚举值，方便依赖程序清晰
 */

/**
 * @module  dom-attr
 * @author  lifesinger@gmail.com,yiminghe@gmail.com
 */
KISSY.add('dom/attr', function(S, DOM, UA, undefined) {

        var doc = document,
            docElement = doc.documentElement,
            oldIE = !docElement.hasAttribute,
            TEXT = docElement.textContent === undefined ?
                'innerText' : 'textContent',
            EMPTY = '',
            nodeName = DOM._nodeName,
            isElementNode = DOM._isElementNode,
            rboolean = /^(?:autofocus|autoplay|async|checked|controls|defer|disabled|hidden|loop|multiple|open|readonly|required|scoped|selected)$/i,
            rfocusable = /^(?:button|input|object|select|textarea)$/i,
            rclickable = /^a(?:rea)?$/i,
            rinvalidChar = /:|^on/,
            rreturn = /\r/g,
            attrFix = {
            },
            attrFn = {
                val: 1,
                css: 1,
                html: 1,
                text: 1,
                data: 1,
                width: 1,
                height: 1,
                offset: 1
            },
            attrHooks = {
                // http://fluidproject.org/blog/2008/01/09/getting-setting-and-removing-tabindex-values-with-javascript/
                tabindex:{
                    get:function(el) {
                        // elem.tabIndex doesn't always return the correct value when it hasn't been explicitly set
                        var attributeNode = el.getAttributeNode("tabindex");
                        return attributeNode && attributeNode.specified ?
                            parseInt(attributeNode.value, 10) :
                            rfocusable.test(el.nodeName) || rclickable.test(el.nodeName) && el.href ?
                                0 :
                                undefined;
                    }
                },
                // 在标准浏览器下，用 getAttribute 获取 style 值
                // IE7- 下，需要用 cssText 来获取
                // 统一使用 cssText
                style:{
                    get:function(el) {
                        return el.style.cssText;
                    },
                    set:function(el, val) {
                        el.style.cssText = val;
                    }
                }
            },
            propFix = {
                tabindex: "tabIndex",
                readonly: "readOnly",
                "for": "htmlFor",
                "class": "className",
                maxlength: "maxLength",
                cellspacing: "cellSpacing",
                "cellpadding": "cellPadding",
                rowspan: "rowSpan",
                colspan: "colSpan",
                usemap: "useMap",
                frameborder: "frameBorder",
                "contenteditable": "contentEditable"
            },
            // Hook for boolean attributes
            // if bool is false
            //  - standard browser returns null
            //  - ie<8 return false
            //   - so norm to undefined
            boolHook = {
                get: function(elem, name) {
                    // 转发到 prop 方法
                    return DOM.prop(elem, name) ?
                        // 根据 w3c attribute , true 时返回属性名字符串
                        name.toLowerCase() :
                        undefined;
                },
                set: function(elem, value, name) {
                    var propName;
                    if (value === false) {
                        // Remove boolean attributes when set to false
                        DOM.removeAttr(elem, name);
                    } else {
                        // 直接设置 true,因为这是 bool 类属性
                        propName = propFix[ name ] || name;
                        if (propName in elem) {
                            // Only set the IDL specifically if it already exists on the element
                            elem[ propName ] = true;
                        }
                        elem.setAttribute(name, name.toLowerCase());
                    }
                    return name;
                }
            },
            propHooks = {},
            // get attribute value from attribute node , only for ie
            attrNodeHook = {
            },
            valHooks = {
                option: {
                    get: function(elem) {
                        // 当没有设定 value 时，标准浏览器 option.value === option.text
                        // ie7- 下，没有设定 value 时，option.value === '', 需要用 el.attributes.value 来判断是否有设定 value
                        var val = elem.attributes.value;
                        return !val || val.specified ? elem.value : elem.text;
                    }
                },
                select: {
                    // 对于 select, 特别是 multiple type, 存在很严重的兼容性问题
                    get: function(elem) {
                        var index = elem.selectedIndex,
                            options = elem.options,
                            one = elem.type === "select-one";

                        // Nothing was selected
                        if (index < 0) {
                            return null;
                        } else if (one) {
                            return DOM.val(options[index]);
                        }

                        // Loop through all the selected options
                        var ret = [], i = 0, len = options.length;
                        for (; i < len; ++i) {
                            if (options[i].selected) {
                                ret.push(DOM.val(options[i]));
                            }
                        }
                        // Multi-Selects return an array
                        return ret;
                    },

                    set: function(elem, value) {
                        var values = S.makeArray(value),
                            opts = elem.options;
                        S.each(opts, function(opt) {
                            opt.selected = S.inArray(DOM.val(opt), values);
                        });

                        if (!values.length) {
                            elem.selectedIndex = -1;
                        }
                        return values;
                    }
                }};

        function isTextNode(elem) {
            return DOM._nodeTypeIs(elem, DOM.TEXT_NODE);
        }

        if (oldIE) {

            // get attribute value from attribute node for ie
            attrNodeHook = {
                get: function(elem, name) {
                    var ret;
                    ret = elem.getAttributeNode(name);
                    // Return undefined if nodeValue is empty string
                    return ret && ret.nodeValue !== "" ?
                        ret.nodeValue :
                        undefined;
                },
                set: function(elem, value, name) {
                    // Check form objects in IE (multiple bugs related)
                    // Only use nodeValue if the attribute node exists on the form
                    var ret = elem.getAttributeNode(name);
                    if (ret) {
                        ret.nodeValue = value;
                    } else {
                        try {
                            var attr = elem.ownerDocument.createAttribute(name);
                            attr.value = value;
                            elem.setAttributeNode(attr);
                        }
                        catch (e) {
                            // It's a real failure only if setAttribute also fails.
                            return elem.setAttribute(name, value, 0);
                        }
                    }
                }
            };


            // ie6,7 不区分 attribute 与 property
            attrFix = propFix;
            // http://fluidproject.org/blog/2008/01/09/getting-setting-and-removing-tabindex-values-with-javascript/
            attrHooks.tabIndex = attrHooks.tabindex;
            // fix ie bugs
            // 不光是 href, src, 还有 rowspan 等非 mapping 属性，也需要用第 2 个参数来获取原始值
            // 注意 colSpan rowSpan 已经由 propFix 转为大写
            S.each([ "href", "src", "width", "height","colSpan","rowSpan" ], function(name) {
                attrHooks[ name ] = {
                    get: function(elem) {
                        var ret = elem.getAttribute(name, 2);
                        return ret === null ? undefined : ret;
                    }
                };
            });
            // button 元素的 value 属性和其内容冲突
            // <button value='xx'>zzz</button>
            valHooks.button = attrHooks.value = attrNodeHook;
        }

        // Radios and checkboxes getter/setter

        S.each([ "radio", "checkbox" ], function(r) {
            valHooks[ r ] = {
                get: function(elem) {
                    // Handle the case where in Webkit "" is returned instead of "on" if a value isn't specified
                    return elem.getAttribute("value") === null ? "on" : elem.value;
                },
                set: function(elem, value) {
                    if (S.isArray(value)) {
                        return elem.checked = S.inArray(DOM.val(elem), value);
                    }
                }

            };
        });

        function getProp(elem, name) {
            name = propFix[ name ] || name;
            var hook = propHooks[ name ];
            if (hook && hook.get) {
                return hook.get(elem, name);

            } else {
                return elem[ name ];
            }
        }

        S.mix(DOM, {

            /**
             * 自定义属性不推荐使用，使用 .data
             * @param selector
             * @param name
             * @param value
             */
            prop: function(selector, name, value) {
                // suports hash
                if (S.isPlainObject(name)) {
                    for (var k in name) {
                        DOM.prop(selector, k, name[k]);
                    }
                    return;
                }
                var elems = DOM.query(selector);
                // Try to normalize/fix the name
                name = propFix[ name ] || name;
                var hook = propHooks[ name ];
                if (value !== undefined) {
                    elems.each(function(elem) {
                        if (hook && hook.set) {
                            hook.set(elem, value, name);
                        } else {
                            elem[ name ] = value;
                        }
                    });
                } else {
                    if (elems.length) {
                        return getProp(elems[0], name);
                    }
                }
            },

            /**
             * 是否其中一个元素包含指定 property
             * @param selector
             * @param name
             */
            hasProp:function(selector, name) {
                var elems = DOM.query(selector);
                for (var i = 0; i < elems.length; i++) {
                    var el = elems[i];
                    if (getProp(el, name) !== undefined) {
                        return true;
                    }
                }
                return false;
            },

            /**
             * 不推荐使用，使用 .data .removeData
             * @param selector
             * @param name
             */
            removeProp:function(selector, name) {
                name = propFix[ name ] || name;
                DOM.query(selector).each(function(el) {
                    try {
                        el[ name ] = undefined;
                        delete el[ name ];
                    } catch(e) {
                        S.log("delete el property error : ");
                        S.log(e);
                    }
                });
            },

            /**
             * Gets the value of an attribute for the first element in the set of matched elements or
             * Sets an attribute for the set of matched elements.
             */
            attr:function(selector, name, val, pass) {
                /*
                 Hazards From Caja Note:

                 - In IE[67], el.setAttribute doesn't work for attributes like
                 'class' or 'for'.  IE[67] expects you to set 'className' or
                 'htmlFor'.  Caja use setAttributeNode solves this problem.

                 - In IE[67], <input> elements can shadow attributes.  If el is a
                 form that contains an <input> named x, then el.setAttribute(x, y)
                 will set x's value rather than setting el's attribute.  Using
                 setAttributeNode solves this problem.

                 - In IE[67], the style attribute can only be modified by setting
                 el.style.cssText.  Neither setAttribute nor setAttributeNode will
                 work.  el.style.cssText isn't bullet-proof, since it can be
                 shadowed by <input> elements.

                 - In IE[67], you can never change the type of an <button> element.
                 setAttribute('type') silently fails, but setAttributeNode
                 throws an exception.  caja : the silent failure. KISSY throws error.

                 - In IE[67], you can never change the type of an <input> element.
                 setAttribute('type') throws an exception.  We want the exception.

                 - In IE[67], setAttribute is case-sensitive, unless you pass 0 as a
                 3rd argument.  setAttributeNode is case-insensitive.

                 - Trying to set an invalid name like ":" is supposed to throw an
                 error.  In IE[678] and Opera 10, it fails without an error.
                 */
                // suports hash
                if (S.isPlainObject(name)) {
                    pass = val;
                    for (var k in name) {
                        DOM.attr(selector, k, name[k], pass);
                    }
                    return;
                }

                if (!(name = S.trim(name))) {
                    return;
                }

                name = name.toLowerCase();

                // attr functions
                if (pass && attrFn[name]) {
                    return DOM[name](selector, val);
                }

                // custom attrs
                name = attrFix[name] || name;

                var attrNormalizer;

                if (rboolean.test(name)) {
                    attrNormalizer = boolHook;
                }
                // only old ie?
                else if (rinvalidChar.test(name)) {
                    attrNormalizer = attrNodeHook;
                } else {
                    attrNormalizer = attrHooks[name];
                }

                // getter
                if (val === undefined) {
                    // supports css selector/Node/NodeList
                    var el = DOM.get(selector);
                    // only get attributes on element nodes
                    if (!isElementNode(el)) {
                        return;
                    }

                    // browsers index elements by id/name on forms, give priority to attributes.
                    if (nodeName(el, "form")) {
                        attrNormalizer = attrNodeHook;
                    }
                    if (attrNormalizer && attrNormalizer.get) {
                        return attrNormalizer.get(el, name);
                    }

                    var ret = el.getAttribute(name);

                    // standard browser non-existing attribute return null
                    // ie<8 will return undefined , because it return property
                    // so norm to undefined
                    return ret === null ? undefined : ret;
                } else {
                    // setter
                    DOM.query(selector).each(function(el) {
                        // only set attributes on element nodes
                        if (!isElementNode(el)) {
                            return;
                        }
                        var normalizer = attrNormalizer;
                        // browsers index elements by id/name on forms, give priority to attributes.
                        if (nodeName(el, "form")) {
                            normalizer = attrNodeHook;
                        }
                        if (normalizer && normalizer.set) {
                            normalizer.set(el, val, name);
                        } else {
                            // convert the value to a string (all browsers do this but IE)
                            el.setAttribute(name, EMPTY + val);
                        }
                    });
                }
            },

            /**
             * Removes the attribute of the matched elements.
             */
            removeAttr: function(selector, name) {
                name = name.toLowerCase();
                name = attrFix[name] || name;
                DOM.query(selector).each(function(el) {
                    if (isElementNode(el)) {
                        var propName;
                        el.removeAttribute(name);
                        // Set corresponding property to false for boolean attributes
                        if (rboolean.test(name) && (propName = propFix[ name ] || name) in el) {
                            el[ propName ] = false;
                        }
                    }
                });
            },

            /**
             * 是否其中一个元素包含指定属性
             */
            hasAttr: oldIE ?
                function(selector, name) {
                    name = name.toLowerCase();
                    var elems = DOM.query(selector);
                    // from ppk :http://www.quirksmode.org/dom/w3c_core.html
                    // IE5-7 doesn't return the value of a style attribute.
                    // var $attr = el.attributes[name];
                    for (var i = 0; i < elems.length; i++) {
                        var el = elems[i];
                        var $attr = el.getAttributeNode(name);
                        if ($attr && $attr.specified) {
                            return true;
                        }
                    }
                    return false;
                }
                :
                function(selector, name) {
                    var elems = DOM.query(selector);
                    for (var i = 0; i < elems.length; i++) {
                        var el = elems[i];
                        //使用原生实现
                        if (el.hasAttribute(name)) {
                            return true;
                        }
                    }
                    return false;
                },

            /**
             * Gets the current value of the first element in the set of matched or
             * Sets the value of each element in the set of matched elements.
             */
            val : function(selector, value) {
                var hook, ret;

                //getter
                if (value === undefined) {

                    var elem = DOM.get(selector);

                    if (elem) {
                        hook = valHooks[ elem.nodeName.toLowerCase() ] || valHooks[ elem.type ];

                        if (hook && "get" in hook && (ret = hook.get(elem, "value")) !== undefined) {
                            return ret;
                        }

                        ret = elem.value;

                        return typeof ret === "string" ?
                            // handle most common string cases
                            ret.replace(rreturn, "") :
                            // handle cases where value is null/undefined or number
                            S.isNullOrUndefined(ret) ? "" : ret;
                    }

                    return;
                }

                DOM.query(selector).each(function(elem) {

                    if (elem.nodeType !== 1) {
                        return;
                    }

                    var val = value;

                    // Treat null/undefined as ""; convert numbers to string
                    if (S.isNullOrUndefined(val)) {
                        val = "";
                    } else if (typeof val === "number") {
                        val += "";
                    } else if (S.isArray(val)) {
                        val = S.map(val, function (value) {
                            return S.isNullOrUndefined(val) ? "" : value + "";
                        });
                    }

                    hook = valHooks[ elem.nodeName.toLowerCase() ] || valHooks[ elem.type ];

                    // If set returns undefined, fall back to normal setting
                    if (!hook || !("set" in hook) || hook.set(elem, val, "value") === undefined) {
                        elem.value = val;
                    }
                });
            },

            /**
             * Gets the text context of the first element in the set of matched elements or
             * Sets the text content of the matched elements.
             */
            text: function(selector, val) {
                // getter
                if (val === undefined) {
                    // supports css selector/Node/NodeList
                    var el = DOM.get(selector);

                    // only gets value on supported nodes
                    if (isElementNode(el)) {
                        return el[TEXT] || EMPTY;
                    }
                    else if (isTextNode(el)) {
                        return el.nodeValue;
                    }
                    return undefined;
                }
                // setter
                else {
                    DOM.query(selector).each(function(el) {
                        if (isElementNode(el)) {
                            el[TEXT] = val;
                        }
                        else if (isTextNode(el)) {
                            el.nodeValue = val;
                        }
                    });
                }
            }
        });
        return DOM;
    }, {
        requires:["./base","ua"]
    }
);

/**
 * NOTES:
 * 承玉：2011-06-03
 *  - 借鉴 jquery 1.6,理清 attribute 与 property
 *
 * 承玉：2011-01-28
 *  - 处理 tabindex，顺便重构
 *
 * 2010.03
 *  - 在 jquery/support.js 中，special attrs 里还有 maxlength, cellspacing,
 *    rowspan, colspan, useap, frameboder, 但测试发现，在 Grade-A 级浏览器中
 *    并无兼容性问题。
 *  - 当 colspan/rowspan 属性值设置有误时，ie7- 会自动纠正，和 href 一样，需要传递
 *    第 2 个参数来解决。jQuery 未考虑，存在兼容性 bug.
 *  - jQuery 考虑了未显式设定 tabindex 时引发的兼容问题，kissy 里忽略（太不常用了）
 *  - jquery/attributes.js: Safari mis-reports the default selected
 *    property of an option 在 Safari 4 中已修复。
 *
 */

/**
 * @module  dom-class
 * @author  lifesinger@gmail.com
 */
KISSY.add('dom/class', function(S, DOM, undefined) {

    var SPACE = ' ',
        REG_SPLIT = /[\.\s]\s*\.?/,
        REG_CLASS = /[\n\t]/g;

    function norm(elemClass) {
        return (SPACE + elemClass + SPACE).replace(REG_CLASS, SPACE);
    }

    S.mix(DOM, {

        __hasClass:function(el, cls) {
            var className = el.className;
            if (className) {
                className = norm(className);
                return className.indexOf(SPACE + cls + SPACE) > -1;
            } else {
                return false;
            }
        },

        /**
         * Determine whether any of the matched elements are assigned the given class.
         */
        hasClass: function(selector, value) {
            return batch(selector, value, function(elem, classNames, cl) {
                var elemClass = elem.className;
                if (elemClass) {
                    var className = norm(elemClass),
                        j = 0,
                        ret = true;
                    for (; j < cl; j++) {
                        if (className.indexOf(SPACE + classNames[j] + SPACE) < 0) {
                            ret = false;
                            break;
                        }
                    }
                    if (ret) {
                        return true;
                    }
                }
            }, true);
        },

        /**
         * Adds the specified class(es) to each of the set of matched elements.
         */
        addClass: function(selector, value) {
            batch(selector, value, function(elem, classNames, cl) {
                var elemClass = elem.className;
                if (!elemClass) {
                    elem.className = value;
                } else {
                    var className = norm(elemClass),
                        setClass = elemClass,
                        j = 0;
                    for (; j < cl; j++) {
                        if (className.indexOf(SPACE + classNames[j] + SPACE) < 0) {
                            setClass += SPACE + classNames[j];
                        }
                    }
                    elem.className = S.trim(setClass);
                }
            }, undefined);
        },

        /**
         * Remove a single class, multiple classes, or all classes from each element in the set of matched elements.
         */
        removeClass: function(selector, value) {
            batch(selector, value, function(elem, classNames, cl) {
                var elemClass = elem.className;
                if (elemClass) {
                    if (!cl) {
                        elem.className = '';
                    } else {
                        var className = norm(elemClass),
                            j = 0,
                            needle;
                        for (; j < cl; j++) {
                            needle = SPACE + classNames[j] + SPACE;
                            // 一个 cls 有可能多次出现：'link link2 link link3 link'
                            while (className.indexOf(needle) >= 0) {
                                className = className.replace(needle, SPACE);
                            }
                        }
                        elem.className = S.trim(className);
                    }
                }
            }, undefined);
        },

        /**
         * Replace a class with another class for matched elements.
         * If no oldClassName is present, the newClassName is simply added.
         */
        replaceClass: function(selector, oldClassName, newClassName) {
            DOM.removeClass(selector, oldClassName);
            DOM.addClass(selector, newClassName);
        },

        /**
         * Add or remove one or more classes from each element in the set of
         * matched elements, depending on either the class's presence or the
         * value of the switch argument.
         * @param state {Boolean} optional boolean to indicate whether class
         *        should be added or removed regardless of current state.
         */
        toggleClass: function(selector, value, state) {
            var isBool = S.isBoolean(state), has;

            batch(selector, value, function(elem, classNames, cl) {
                var j = 0, className;
                for (; j < cl; j++) {
                    className = classNames[j];
                    has = isBool ? !state : DOM.hasClass(elem, className);
                    DOM[has ? 'removeClass' : 'addClass'](elem, className);
                }
            }, undefined);
        }
    });

    function batch(selector, value, fn, resultIsBool) {
        if (!(value = S.trim(value))) {
            return resultIsBool ? false : undefined;
        }

        var elems = DOM.query(selector),
            len = elems.length,
            tmp = value.split(REG_SPLIT),
            elem,
            ret;

        var classNames = [];
        for (var i = 0; i < tmp.length; i++) {
            var t = S.trim(tmp[i]);
            if (t) {
                classNames.push(t);
            }
        }
        for (i = 0; i < len; i++) {
            elem = elems[i];
            if (DOM._isElementNode(elem)) {
                ret = fn(elem, classNames, classNames.length);
                if (ret !== undefined) {
                    return ret;
                }
            }
        }

        if (resultIsBool) {
            return false;
        }
        return undefined;
    }

    return DOM;
}, {
    requires:["dom/base"]
});

/**
 * NOTES:
 *   - hasClass/addClass/removeClass 的逻辑和 jQuery 保持一致
 *   - toggleClass 不支持 value 为 undefined 的情形（jQuery 支持）
 */

/**
 * @module  dom-create
 * @author  lifesinger@gmail.com,yiminghe@gmail.com
 */
KISSY.add('dom/create', function(S, DOM, UA, undefined) {

        var doc = document,
            ie = UA['ie'],
            nodeTypeIs = DOM._nodeTypeIs,
            isElementNode = DOM._isElementNode,
            DIV = 'div',
            PARENT_NODE = 'parentNode',
            DEFAULT_DIV = doc.createElement(DIV),
            rxhtmlTag = /<(?!area|br|col|embed|hr|img|input|link|meta|param)(([\w:]+)[^>]*)\/>/ig,
            RE_TAG = /<(\w+)/,
            // Ref: http://jmrware.com/articles/2010/jqueryregex/jQueryRegexes.html#note_05
            RE_SCRIPT = /<script([^>]*)>([^<]*(?:(?!<\/script>)<[^<]*)*)<\/script>/ig,
            RE_SIMPLE_TAG = /^<(\w+)\s*\/?>(?:<\/\1>)?$/,
            RE_SCRIPT_SRC = /\ssrc=(['"])(.*?)\1/i,
            RE_SCRIPT_CHARSET = /\scharset=(['"])(.*?)\1/i;

        S.mix(DOM, {

            /**
             * Creates a new HTMLElement using the provided html string.
             */
            create: function(html, props, ownerDoc) {
                if (nodeTypeIs(html, DOM.ELEMENT_NODE)
                    || nodeTypeIs(html, DOM.TEXT_NODE)) {
                    return DOM.clone(html);
                }

                if (!(html = S.trim(html))) {
                    return null;
                }

                var ret = null,
                    creators = DOM._creators,
                    m,
                    tag = DIV,
                    k,
                    nodes;

                // 简单 tag, 比如 DOM.create('<p>')
                if ((m = RE_SIMPLE_TAG.exec(html))) {
                    ret = (ownerDoc || doc).createElement(m[1]);
                }
                // 复杂情况，比如 DOM.create('<img src="sprite.png" />')
                else {
                    // Fix "XHTML"-style tags in all browsers
                    html = html.replace(rxhtmlTag, "<$1><" + "/$2>");

                    if ((m = RE_TAG.exec(html)) && (k = m[1])) {
                        tag = k.toLowerCase();
                    }

                    nodes = (creators[tag] || creators[DIV])(html, ownerDoc).childNodes;

                    if (nodes.length === 1) {
                        // return single node, breaking parentNode ref from "fragment"
                        ret = nodes[0][PARENT_NODE].removeChild(nodes[0]);
                    }
                    else if (nodes.length) {
                        // return multiple nodes as a fragment
                        ret = nl2frag(nodes, ownerDoc || doc);
                    } else {
                        S.error(html + " : create node error");
                    }
                }

                return attachProps(ret, props);
            },

            _creators: {
                div: function(html, ownerDoc) {
                    var frag = ownerDoc ? ownerDoc.createElement(DIV) : DEFAULT_DIV;
                    // html 为 <style></style> 时不行，必须有其他元素？
                    frag['innerHTML'] = "m<div>" + html + "<" + "/div>";
                    return frag.lastChild;
                }
            },

            /**
             * Gets/Sets the HTML contents of the HTMLElement.
             * @param {Boolean} loadScripts (optional) True to look for and process scripts (defaults to false).
             * @param {Function} callback (optional) For async script loading you can be notified when the update completes.
             */
            html: function(selector, val, loadScripts, callback) {
                // getter
                if (val === undefined) {
                    // supports css selector/Node/NodeList
                    var el = DOM.get(selector);

                    // only gets value on element nodes
                    if (isElementNode(el)) {
                        return el['innerHTML'];
                    }
                }
                // setter
                else {
                    DOM.query(selector).each(function(elem) {
                        if (isElementNode(elem)) {
                            setHTML(elem, val, loadScripts, callback);
                        }
                    });
                }
            },

            /**
             * Remove the set of matched elements from the DOM.
             * 不要使用 innerHTML='' 来清除元素，可能会造成内存泄露，要使用 DOM.remove()
             * @param selector 选择器或元素集合
             * @param {Boolean} keepData 删除元素时是否保留其上的数据，用于离线操作，提高性能
             */
            remove: function(selector, keepData) {
                DOM.query(selector).each(function(el) {
                    if (!keepData && el.nodeType == DOM.ELEMENT_NODE) {
                        // 清楚事件
                        var Event = S.require("event");
                        if (Event) {
                            Event.detach(el.getElementsByTagName("*"));
                            Event.detach(el);
                        }
                        DOM.removeData(el.getElementsByTagName("*"));
                        DOM.removeData(el);
                    }

                    if (el.parentNode) {
                        el.parentNode.removeChild(el);
                    }
                });
            },

            /**
             * clone node across browsers for the first node in selector
             * @param selector 选择器或单个元素
             * @param {Boolean} withDataAndEvent 复制节点是否包括和源节点同样的数据和事件
             * @param {Boolean} deepWithDataAndEvent 复制节点的子孙节点是否包括和源节点子孙节点同样的数据和事件
             * @refer https://developer.mozilla.org/En/DOM/Node.cloneNode
             * @returns 复制后的节点
             */
            clone:function(selector, deep, withDataAndEvent, deepWithDataAndEvent) {
                var elem = DOM.get(selector);

                if (!elem) {
                    return null;
                }

                var clone = elem.cloneNode(deep);

                if (elem.nodeType == DOM.ELEMENT_NODE ||
                    elem.nodeType == DOM.DOCUMENT_FRAGMENT_NODE) {
                    // IE copies events bound via attachEvent when using cloneNode.
                    // Calling detachEvent on the clone will also remove the events
                    // from the original. In order to get around this, we use some
                    // proprietary methods to clear the events. Thanks to MooTools
                    // guys for this hotness.
                    if (elem.nodeType == DOM.ELEMENT_NODE) {
                        fixAttributes(elem, clone);
                    }

                    if (deep) {
                        processAll(fixAttributes, elem, clone);
                    }
                }
                // runtime 获得事件模块
                if (withDataAndEvent) {
                    cloneWidthDataAndEvent(elem, clone);
                    if (deep && deepWithDataAndEvent) {
                        processAll(cloneWidthDataAndEvent, elem, clone);
                    }
                }
                return clone;
            },

            empty:function(selector) {
                DOM.query(selector).each(function(el) {
                    DOM.remove(el.childNodes);
                });
            },

            _nl2frag:nl2frag
        });

        function processAll(fn, elem, clone) {
            if (elem.nodeType == DOM.DOCUMENT_FRAGMENT_NODE) {
                var eCs = elem.childNodes,
                    cloneCs = clone.childNodes,
                    fIndex = 0;
                while (eCs[fIndex]) {
                    if (cloneCs[fIndex]) {
                        processAll(fn, eCs[fIndex], cloneCs[fIndex]);
                    }
                    fIndex++;
                }
            } else if (elem.nodeType == DOM.ELEMENT_NODE) {
                var elemChildren = elem.getElementsByTagName("*"),
                    cloneChildren = clone.getElementsByTagName("*"),
                    cIndex = 0;
                while (elemChildren[cIndex]) {
                    if (cloneChildren[cIndex]) {
                        fn(elemChildren[cIndex], cloneChildren[cIndex]);
                    }
                    cIndex++;
                }
            }
        }


        // 克隆除了事件的 data
        function cloneWidthDataAndEvent(src, dest) {
            var Event = S.require('event');

            if (dest.nodeType !== DOM.ELEMENT_NODE && !DOM.hasData(src)) {
                return;
            }

            var srcData = DOM.data(src);

            // 浅克隆，data 也放在克隆节点上
            for (var d in srcData) {
                DOM.data(dest, d, srcData[d]);
            }

            // 事件要特殊点
            if (Event) {
                Event._removeData(dest);
                Event._clone(src, dest);
            }
        }

        // wierd ie cloneNode fix from jq
        function fixAttributes(src, dest) {

            // clearAttributes removes the attributes, which we don't want,
            // but also removes the attachEvent events, which we *do* want
            if (dest.clearAttributes) {
                dest.clearAttributes();
            }

            // mergeAttributes, in contrast, only merges back on the
            // original attributes, not the events
            if (dest.mergeAttributes) {
                dest.mergeAttributes(src);
            }

            var nodeName = dest.nodeName.toLowerCase();

            // IE6-8 fail to clone children inside object elements that use
            // the proprietary classid attribute value (rather than the type
            // attribute) to identify the type of content to display
            if (nodeName === "object" && !dest.childNodes.length) {
                S.each(src.childNodes, function(c) {
                    dest.appendChild(c);
                });
                // dest.outerHTML = src.outerHTML;
            } else if (nodeName === "input" && (src.type === "checkbox" || src.type === "radio")) {
                // IE6-8 fails to persist the checked state of a cloned checkbox
                // or radio button. Worse, IE6-7 fail to give the cloned element
                // a checked appearance if the defaultChecked value isn't also set
                if (src.checked) {
                    dest.defaultChecked = dest.checked = src.checked;
                }

                // IE6-7 get confused and end up setting the value of a cloned
                // checkbox/radio button to an empty string instead of "on"
                if (dest.value !== src.value) {
                    dest.value = src.value;
                }

                // IE6-8 fails to return the selected option to the default selected
                // state when cloning options
            } else if (nodeName === "option") {
                dest.selected = src.defaultSelected;
                // IE6-8 fails to set the defaultValue to the correct value when
                // cloning other types of input fields
            } else if (nodeName === "input" || nodeName === "textarea") {
                dest.defaultValue = src.defaultValue;
            }

            // Event data gets referenced instead of copied if the expando
            // gets copied too
            // 自定义 data 根据参数特殊处理，expando 只是个用于引用的属性
            dest.removeAttribute(DOM.__EXPANDO);
        }

        // 添加成员到元素中
        function attachProps(elem, props) {
            if (S.isPlainObject(props)) {
                if (isElementNode(elem)) {
                    DOM.attr(elem, props, true);
                }
                // document fragment
                else if (elem.nodeType == DOM.DOCUMENT_FRAGMENT_NODE) {
                    S.each(elem.childNodes, function(child) {
                        DOM.attr(child, props, true);
                    });
                }
            }
            return elem;
        }

        // 将 nodeList 转换为 fragment
        function nl2frag(nodes, ownerDoc) {
            var ret = null, i, len;

            if (nodes
                && (nodes.push || nodes.item)
                && nodes[0]) {
                ownerDoc = ownerDoc || nodes[0].ownerDocument;
                ret = ownerDoc.createDocumentFragment();

                if (nodes.item) { // convert live list to static array
                    nodes = S.makeArray(nodes);
                }

                for (i = 0,len = nodes.length; i < len; i++) {
                    ret.appendChild(nodes[i]);
                }
            }
            else {
                S.log('Unable to convert ' + nodes + ' to fragment.');
            }
            return ret;
        }


        // 直接通过 innerHTML 设置 html
        function setHTMLSimple(elem, html) {
            html = (html + '').replace(RE_SCRIPT, ''); // 过滤掉所有 script
            try {
                elem['innerHTML'] = html;
            }
            catch(ex) {
                S.log("set innerHTML error : ");
                S.log(ex);
                // remove any remaining nodes
                while (elem.firstChild) {
                    elem.removeChild(elem.firstChild);
                }
                // html == '' 时，无需再 appendChild
                if (html) {
                    elem.appendChild(DOM.create(html));
                }
            }
        }

        /**
         * Update the innerHTML of this element, optionally searching for and processing scripts.
         * @refer http://www.sencha.com/deploy/dev/docs/source/Element-more.html#method-Ext.Element-update
         *        http://lifesinger.googlecode.com/svn/trunk/lab/2010/innerhtml-and-script-tags.html
         */
        function setHTML(elem, html, loadScripts, callback) {
            if (!loadScripts) {
                setHTMLSimple(elem, html);
                S.isFunction(callback) && callback();
                return;
            }

            var id = S.guid('ks-tmp-'),
                re_script = new RegExp(RE_SCRIPT); // 防止

            html += '<span id="' + id + '"><' + '/span>';

            // 确保脚本执行时，相关联的 DOM 元素已经准备好
            // 不依赖于浏览器特性，正则表达式自己分析
            S.available(id, function() {
                var hd = DOM.get('head'),
                    match,
                    attrs,
                    srcMatch,
                    charsetMatch,
                    t,
                    s,
                    text;

                re_script['lastIndex'] = 0;
                while ((match = re_script.exec(html))) {
                    attrs = match[1];
                    srcMatch = attrs ? attrs.match(RE_SCRIPT_SRC) : false;
                    // script via src
                    if (srcMatch && srcMatch[2]) {
                        s = doc.createElement('script');
                        s.src = srcMatch[2];
                        // set charset
                        if ((charsetMatch = attrs.match(RE_SCRIPT_CHARSET)) && charsetMatch[2]) {
                            s.charset = charsetMatch[2];
                        }
                        s.async = true; // make sure async in gecko
                        hd.appendChild(s);
                    }
                    // inline script
                    else if ((text = match[2]) && text.length > 0) {
                        // sync , 同步
                        S.globalEval(text);
                    }
                }

                // 删除探测节点
                (t = doc.getElementById(id)) && DOM.remove(t);

                // 回调
                S.isFunction(callback) && callback();
            });

            setHTMLSimple(elem, html);
        }

        // only for gecko and ie
        // 2010-10-22: 发现 chrome 也与 gecko 的处理一致了
        if (ie || UA['gecko'] || UA['webkit']) {
            // 定义 creators, 处理浏览器兼容
            var creators = DOM._creators,
                create = DOM.create,
                TABLE_OPEN = '<table>',
                TABLE_CLOSE = '<' + '/table>',
                RE_TBODY = /(?:\/(?:thead|tfoot|caption|col|colgroup)>)+\s*<tbody/,
                creatorsMap = {
                    option: 'select',
                    td: 'tr',
                    tr: 'tbody',
                    tbody: 'table',
                    col: 'colgroup',
                    legend: 'fieldset' // ie 支持，但 gecko 不支持
                };

            for (var p in creatorsMap) {
                (function(tag) {
                    creators[p] = function(html, ownerDoc) {
                        return create('<' + tag + '>' + html + '<' + '/' + tag + '>', null, ownerDoc);
                    }
                })(creatorsMap[p]);
            }


            // IE7- adds TBODY when creating thead/tfoot/caption/col/colgroup elements
            if (ie < 8) {
                creators.tbody = function(html, ownerDoc) {
                    var frag = create(TABLE_OPEN + html + TABLE_CLOSE, null, ownerDoc),
                        tbody = frag.children['tags']('tbody')[0];

                    if (frag.children.length > 1 && tbody && !RE_TBODY.test(html)) {
                        tbody[PARENT_NODE].removeChild(tbody); // strip extraneous tbody
                    }
                    return frag;
                };
            }

            S.mix(creators, {
                optgroup: creators.option, // gecko 支持，但 ie 不支持
                th: creators.td,
                thead: creators.tbody,
                tfoot: creators.tbody,
                caption: creators.tbody,
                colgroup: creators.tbody
            });
        }
        return DOM;
    },
    {
        requires:["./base","ua"]
    });

/**
 * 2011-08-22
 * clone 实现，参考 jq
 *
 * 2011-08
 *  remove 需要对子孙节点以及自身清除事件以及自定义 data
 *  create 修改，支持 <style></style> ie 下直接创建
 *  TODO: jquery clone ,clean 实现
 *
 * TODO:
 *  - 研究 jQuery 的 buildFragment 和 clean
 *  - 增加 cache, 完善 test cases
 *  - 支持更多 props
 *  - remove 时，是否需要移除事件，以避免内存泄漏？需要详细的测试。
 */

/**
 * @module  dom-data
 * @author  lifesinger@gmail.com,yiminghe@gmail.com
 */
KISSY.add('dom/data', function(S, DOM, undefined) {

    var win = window,
        EXPANDO = '_ks_data_' + S.now(), // 让每一份 kissy 的 expando 都不同
        dataCache = { },       // 存储 node 节点的 data
        winDataCache = { };    // 避免污染全局


    // The following elements throw uncatchable exceptions if you
    // attempt to add expando properties to them.
    var noData = {
    };
    noData['applet'] = 1;
    noData['object'] = 1;
    noData['embed'] = 1;

    var commonOps = {
        hasData:function(cache, name) {
            if (cache) {
                if (name !== undefined) {
                    if (name in cache) {
                        return true;
                    }
                } else if (!S.isEmptyObject(cache)) {
                    return true;
                }
            }
            return false;
        }
    };

    var objectOps = {
        hasData:function(ob, name) {
            if (ob == win) {
                return objectOps.hasData(winDataCache, name);
            }
            // 直接建立在对象内
            var thisCache = ob[EXPANDO];
            return commonOps.hasData(thisCache, name);
        },

        data:function(ob, name, value) {
            if (ob == win) {
                return objectOps.data(winDataCache, name, value);
            }
            var cache = ob[EXPANDO];
            if (value !== undefined) {
                cache = ob[EXPANDO] = ob[EXPANDO] || {};
                cache[name] = value;
            } else {
                if (name !== undefined) {
                    return cache && cache[name];
                } else {
                    cache = ob[EXPANDO] = ob[EXPANDO] || {};
                    return cache;
                }
            }
        },
        removeData:function(ob, name) {
            if (ob == win) {
                return objectOps.removeData(winDataCache, name);
            }
            var cache = ob[EXPANDO];
            if (!cache) {
                return;
            }
            if (name !== undefined) {
                delete cache[name];
                if (S.isEmptyObject(cache)) {
                    objectOps.removeData(ob, undefined);
                }
            } else {
                delete ob[EXPANDO];
            }
        }
    };

    var domOps = {
        hasData:function(elem, name) {
            var key = elem[EXPANDO];
            if (!key) {
                return false;
            }
            var thisCache = dataCache[key];
            return commonOps.hasData(thisCache, name);
        },

        data:function(elem, name, value) {
            if (noData[elem.nodeName.toLowerCase()]) {
                return;
            }
            var key = elem[EXPANDO];
            if (!key) {
                // 节点上关联键值也可以
                key = elem[EXPANDO] = S.guid();
            }
            var cache = dataCache[key];
            if (value !== undefined) {
                // 需要新建
                cache = dataCache[key] = dataCache[key] || {};
                cache[name] = value;
            } else {
                if (name !== undefined) {
                    return cache && cache[name];
                } else {
                    // 需要新建
                    cache = dataCache[key] = dataCache[key] || {};
                    return cache;
                }
            }
        },

        removeData:function(elem, name) {
            var key = elem[EXPANDO];
            if (!key) {
                return;
            }
            var cache = dataCache[key];
            if (!cache) {
                return;
            }
            if (name !== undefined) {
                delete cache[name];
                if (S.isEmptyObject(cache)) {
                    domOps.removeData(elem, undefined);
                }
            } else {
                delete dataCache[key];
                try {
                    delete elem[EXPANDO];
                } catch(e) {
                    //S.log("delete expando error : ");
                    //S.log(e);
                }
                if (elem.removeAttribute) {
                    elem.removeAttribute(EXPANDO);
                }
            }
        }
    };


    S.mix(DOM, {

        __EXPANDO:EXPANDO,

        /**
         * whether any node has data
         */
        hasData:function(selector, name) {
            var ret = false,elems = DOM.query(selector);
            for (var i = 0; i < elems.length; i++) {
                var elem = elems[i];
                if (checkIsNode(elem)) {
                    ret = domOps.hasData(elem, name);
                } else {
                    ret = objectOps.hasData(elem, name);
                }
                if (ret) {
                    return ret;
                }
            }
            return ret;
        },

        /**
         * Store arbitrary data associated with the matched elements.
         */
        data: function(selector, name, data) {
            // suports hash
            if (S.isPlainObject(name)) {
                for (var k in name) {
                    DOM.data(selector, k, name[k]);
                }
                return;
            }

            // getter
            if (data === undefined) {
                var elem = DOM.get(selector);
                if (checkIsNode(elem)) {
                    return domOps.data(elem, name, data);
                } else if (elem) {
                    return objectOps.data(elem, name, data);
                }
            }
            // setter
            else {
                DOM.query(selector).each(function(elem) {
                    if (checkIsNode(elem)) {
                        domOps.data(elem, name, data);
                    } else {
                        objectOps.data(elem, name, data);
                    }
                });
            }
        },

        /**
         * Remove a previously-stored piece of data.
         */
        removeData: function(selector, name) {
            DOM.query(selector).each(function(elem) {
                if (checkIsNode(elem)) {
                    domOps.removeData(elem, name);
                } else {
                    objectOps.removeData(elem, name);
                }
            });
        }
    });

    function checkIsNode(elem) {
        // note : 普通对象不要定义 nodeType 这种特殊属性!
        return elem && elem.nodeType;
    }

    return DOM;

}, {
    requires:["./base"]
});
/**
 * 承玉：2011-05-31
 *  - 分层 ，节点和普通对象分开粗合理
 **/

/**
 * @module  dom-insertion
 * @author  lifesinger@gmail.com,yiminghe@gmail.com
 */
KISSY.add('dom/insertion', function(S, DOM) {

    var PARENT_NODE = 'parentNode',
        NEXT_SIBLING = 'nextSibling';

    var nl2frag = DOM._nl2frag;


    // fragment is easier than nodelist
    function insertion(newNodes, refNodes, fn) {
        newNodes = DOM.query(newNodes);
        refNodes = DOM.query(refNodes);
        if (!newNodes.length || !refNodes.length) {
            return;
        }
        var newNode = nl2frag(newNodes),
            clonedNode;
        //fragment 一旦插入里面就空了，先复制下
        if (refNodes.length > 1) {
            clonedNode = DOM.clone(newNode, true);
        }
        for (var i = 0; i < refNodes.length; i++) {
            var refNode = refNodes[i];
            //refNodes 超过一个，clone
            var node = i > 0 ? DOM.clone(clonedNode, true) : newNode;
            fn(node, refNode);
        }
    }

    S.mix(DOM, {

        /**
         * Inserts the new node as the previous sibling of the reference node.
         */
        insertBefore: function(newNodes, refNodes) {
            insertion(newNodes, refNodes, function(newNode, refNode) {
                if (refNode[PARENT_NODE]) {
                    refNode[PARENT_NODE].insertBefore(newNode, refNode);
                }
            });
        },

        /**
         * Inserts the new node as the next sibling of the reference node.
         */
        insertAfter: function(newNodes, refNodes) {
            insertion(newNodes, refNodes, function(newNode, refNode) {
                if (refNode[PARENT_NODE]) {
                    refNode[PARENT_NODE].insertBefore(newNode, refNode[NEXT_SIBLING]);
                }
            });
        },

        /**
         * Inserts the new node as the last child.
         */
        appendTo: function(newNodes, parents) {
            insertion(newNodes, parents, function(newNode, parent) {
                parent.appendChild(newNode);
            });
        },

        /**
         * Inserts the new node as the first child.
         */
        prependTo:function(newNodes, parents) {
            insertion(newNodes, parents, function(newNode, parent) {
                parent.insertBefore(newNode, parent.firstChild);
            });
        }
    });
    var alias = {
        "prepend":"prependTo",
        "append":"appendTo",
        "before":"insertBefore",
        "after":"insertAfter"
    };
    for (var a in alias) {
        DOM[a] = DOM[alias[a]];
    }
    return DOM;
}, {
    requires:["./create"]
});

/**
 * 2011-05-25
 *  - 承玉：参考 jquery 处理多对多的情形 :http://api.jquery.com/append/
 *      DOM.append(".multi1",".multi2");
 *
 */

/**
 * @module  dom-offset
 * @author  lifesinger@gmail.com,yiminghe@gmail.com
 */
KISSY.add('dom/offset', function(S, DOM, UA, undefined) {

    var win = window,
        doc = document,
        isIE = UA['ie'],
        docElem = doc.documentElement,
        isElementNode = DOM._isElementNode,
        nodeTypeIs = DOM._nodeTypeIs,
        getWin = DOM._getWin,
        isStrict = doc.compatMode === 'CSS1Compat',
        MAX = Math.max,
        PARSEINT = parseInt,
        POSITION = 'position',
        RELATIVE = 'relative',
        DOCUMENT = 'document',
        BODY = 'body',
        DOC_ELEMENT = 'documentElement',
        OWNER_DOCUMENT = 'ownerDocument',
        VIEWPORT = 'viewport',
        SCROLL = 'scroll',
        CLIENT = 'client',
        LEFT = 'left',
        TOP = 'top',
        isNumber = S.isNumber,
        SCROLL_LEFT = SCROLL + 'Left',
        SCROLL_TOP = SCROLL + 'Top',
        GET_BOUNDING_CLIENT_RECT = 'getBoundingClientRect';

//    ownerDocument 的判断不保证 elem 没有游离在 document 之外（比如 fragment）
//    function inDocument(elem) {
//        if (!elem) {
//            return 0;
//        }
//        var doc = elem.ownerDocument;
//        if (!doc) {
//            return 0;
//        }
//        var html = doc.documentElement;
//        if (html === elem) {
//            return true;
//        }
//        else if (DOM.__contains(html, elem)) {
//            return true;
//        }
//        return false;
//    }

    S.mix(DOM, {


        /**
         * Gets the current coordinates of the element, relative to the document.
         * @param relativeWin The window to measure relative to. If relativeWin
         *     is not in the ancestor frame chain of the element, we measure relative to
         *     the top-most window.
         */
        offset: function(selector, val, relativeWin) {
            // getter
            if (val === undefined) {
                var elem = DOM.get(selector),ret;
                if (elem) {
                    ret = getOffset(elem, relativeWin);
                }
                return ret;
            }
            // setter
            DOM.query(selector).each(function(elem) {
                setOffset(elem, val);
            });
        },

        /**
         * Makes elem visible in the container
         * @param elem
         * @param container
         * @param top
         * @param hscroll
         * @param {Boolean} auto whether adjust element automatically
         *                       (it only scrollIntoView when element is out of view)
         * @refer http://www.w3.org/TR/2009/WD-html5-20090423/editing.html#scrollIntoView
         *        http://www.sencha.com/deploy/dev/docs/source/Element.scroll-more.html#scrollIntoView
         *        http://yiminghe.javaeye.com/blog/390732
         */
        scrollIntoView: function(elem, container, top, hscroll, auto) {
            if (!(elem = DOM.get(elem))) {
                return;
            }

            if (container) {
                container = DOM.get(container);
            }

            if (!container) {
                container = elem.ownerDocument;
            }

            if (auto !== true) {
                hscroll = hscroll === undefined ? true : !!hscroll;
                top = top === undefined ? true : !!top;
            }

            // document 归一化到 window
            if (nodeTypeIs(container, DOM.DOCUMENT_NODE)) {
                container = getWin(container);
            }

            var isWin = !!getWin(container),
                elemOffset = DOM.offset(elem),
                eh = DOM.outerHeight(elem),
                ew = DOM.outerWidth(elem),
                containerOffset,
                ch,
                cw,
                containerScroll,
                diffTop,
                diffBottom,
                win,
                winScroll,
                ww,
                wh;

            if (isWin) {
                win = container;
                wh = DOM.height(win);
                ww = DOM.width(win);
                winScroll = {
                    left:DOM.scrollLeft(win),
                    top:DOM.scrollTop(win)
                };
                // elem 相对 container 可视视窗的距离
                diffTop = {
                    left: elemOffset[LEFT] - winScroll[LEFT],
                    top: elemOffset[TOP] - winScroll[TOP]
                };
                diffBottom = {
                    left:  elemOffset[LEFT] + ew - (winScroll[LEFT] + ww),
                    top:elemOffset[TOP] + eh - (winScroll[TOP] + wh)
                };
                containerScroll = winScroll;
            }
            else {
                containerOffset = DOM.offset(container);
                ch = container.clientHeight;
                cw = container.clientWidth;
                containerScroll = {
                    left:DOM.scrollLeft(container),
                    top:DOM.scrollTop(container)
                };
                // elem 相对 container 可视视窗的距离
                // 注意边框 , offset 是边框到根节点
                diffTop = {
                    left: elemOffset[LEFT] - containerOffset[LEFT] -
                        (PARSEINT(DOM.css(container, 'borderLeftWidth')) || 0),
                    top: elemOffset[TOP] - containerOffset[TOP] -
                        (PARSEINT(DOM.css(container, 'borderTopWidth')) || 0)
                };
                diffBottom = {
                    left:  elemOffset[LEFT] + ew -
                        (containerOffset[LEFT] + cw +
                            (PARSEINT(DOM.css(container, 'borderRightWidth')) || 0)) ,
                    top:elemOffset[TOP] + eh -
                        (containerOffset[TOP] + ch +
                            (PARSEINT(DOM.css(container, 'borderBottomWidth')) || 0))
                };
            }

            if (diffTop.top < 0 || diffBottom.top > 0) {
                // 强制向上
                if (top === true) {
                    DOM.scrollTop(container, containerScroll.top + diffTop.top);
                } else if (top === false) {
                    DOM.scrollTop(container, containerScroll.top + diffBottom.top);
                } else {
                    // 自动调整
                    if (diffTop.top < 0) {
                        DOM.scrollTop(container, containerScroll.top + diffTop.top);
                    } else {
                        DOM.scrollTop(container, containerScroll.top + diffBottom.top);
                    }
                }
            }

            if (hscroll) {
                if (diffTop.left < 0 || diffBottom.left > 0) {
                    // 强制向上
                    if (top === true) {
                        DOM.scrollLeft(container, containerScroll.left + diffTop.left);
                    } else if (top === false) {
                        DOM.scrollLeft(container, containerScroll.left + diffBottom.left);
                    } else {
                        // 自动调整
                        if (diffTop.left < 0) {
                            DOM.scrollLeft(container, containerScroll.left + diffTop.left);
                        } else {
                            DOM.scrollLeft(container, containerScroll.left + diffBottom.left);
                        }
                    }
                }
            }
        },
        /**
         * for idea autocomplete
         */
        docWidth:0,
        docHeight:0,
        viewportHeight:0,
        viewportWidth:0
    });

    // http://old.jr.pl/www.quirksmode.org/viewport/compatibility.html
    // http://www.quirksmode.org/dom/w3c_cssom.html
    // add ScrollLeft/ScrollTop getter/setter methods
    S.each(['Left', 'Top'], function(name, i) {
        var method = SCROLL + name;

        DOM[method] = function(elem, v) {
            if (isNumber(elem)) {
                return arguments.callee(win, elem);
            }
            elem = DOM.get(elem);
            var ret,
                w = getWin(elem),
                d;
            if (w) {
                if (v !== undefined) {
                    // 注意多 windw 情况，不能简单取 win
                    var left = name == "Left" ? v : DOM.scrollLeft(w),
                        top = name == "Top" ? v : DOM.scrollTop(w);
                    w['scrollTo'](left, top);
                } else {
                    //标准
                    //chrome == body.scrollTop
                    //firefox/ie9 == documentElement.scrollTop
                    ret = w[ 'page' + (i ? 'Y' : 'X') + 'Offset'];
                    if (!isNumber(ret)) {
                        d = w[DOCUMENT];
                        //ie6,7,8 standard mode
                        ret = d[DOC_ELEMENT][method];
                        if (!isNumber(ret)) {
                            //quirks mode
                            ret = d[BODY][method];
                        }
                    }
                }
            } else if (isElementNode(elem)) {
                if (v !== undefined) {
                    elem[method] = v
                } else {
                    ret = elem[method];
                }
            }
            return ret;
        }
    });

    // add docWidth/Height, viewportWidth/Height getter methods
    S.each(['Width', 'Height'], function(name) {
        DOM['doc' + name] = function(refWin) {
            refWin = DOM.get(refWin);
            var w = getWin(refWin),
                d = w[DOCUMENT];
            return MAX(
                //firefox chrome documentElement.scrollHeight< body.scrollHeight
                //ie standard mode : documentElement.scrollHeight> body.scrollHeight
                d[DOC_ELEMENT][SCROLL + name],
                //quirks : documentElement.scrollHeight 最大等于可视窗口多一点？
                d[BODY][SCROLL + name],
                DOM[VIEWPORT + name](d));
        };

        DOM[VIEWPORT + name] = function(refWin) {
            refWin = DOM.get(refWin);
            var prop = 'inner' + name,
                w = getWin(refWin),
                d = w[DOCUMENT];
            return (prop in w) ?
                // 标准 = documentElement.clientHeight
                w[prop] :
                // ie 标准 documentElement.clientHeight , 在 documentElement.clientHeight 上滚动？
                // ie quirks body.clientHeight: 在 body 上？
                (isStrict ? d[DOC_ELEMENT][CLIENT + name] : d[BODY][CLIENT + name]);
        }
    });

    function getClientPosition(elem) {
        var box, x = 0, y = 0,
            body = doc.body,
            w = getWin(elem[OWNER_DOCUMENT]);

        // 根据 GBS 最新数据，A-Grade Browsers 都已支持 getBoundingClientRect 方法，不用再考虑传统的实现方式
        if (elem[GET_BOUNDING_CLIENT_RECT]) {
            box = elem[GET_BOUNDING_CLIENT_RECT]();

            // 注：jQuery 还考虑减去 docElem.clientLeft/clientTop
            // 但测试发现，这样反而会导致当 html 和 body 有边距/边框样式时，获取的值不正确
            // 此外，ie6 会忽略 html 的 margin 值，幸运地是没有谁会去设置 html 的 margin

            x = box[LEFT];
            y = box[TOP];

            // ie 下应该减去窗口的边框吧，毕竟默认 absolute 都是相对窗口定位的
            // 窗口边框标准是设 documentElement ,quirks 时设置 body
            // 最好禁止在 body 和 html 上边框 ，但 ie < 9 html 默认有 2px ，减去
            // 但是非 ie 不可能设置窗口边框，body html 也不是窗口 ,ie 可以通过 html,body 设置
            // 标准 ie 下 docElem.clientTop 就是 border-top
            // ie7 html 即窗口边框改变不了。永远为 2

            // 但标准 firefox/chrome/ie9 下 docElem.clientTop 是窗口边框，即使设了 border-top 也为 0
            var clientTop = isIE && doc['documentMode'] != 9
                && (isStrict ? docElem.clientTop : body.clientTop)
                || 0,
                clientLeft = isIE && doc['documentMode'] != 9
                    && (isStrict ? docElem.clientLeft : body.clientLeft)
                    || 0;
            if (1 > 2) {
            }
            x -= clientLeft;
            y -= clientTop;

            // iphone/ipad/itouch 下的 Safari 获取 getBoundingClientRect 时，已经加入 scrollTop
            if (UA.mobile == 'apple') {
                x -= DOM[SCROLL_LEFT](w);
                y -= DOM[SCROLL_TOP](w);
            }
        }

        return { left: x, top: y };
    }


    function getPageOffset(el) {
        var pos = getClientPosition(el);
        var w = getWin(el[OWNER_DOCUMENT]);
        pos.left += DOM[SCROLL_LEFT](w);
        pos.top += DOM[SCROLL_TOP](w);
        return pos;
    }

    // 获取 elem 相对 elem.ownerDocument 的坐标
    function getOffset(el, relativeWin) {
        var position = {left:0,top:0};

        // Iterate up the ancestor frame chain, keeping track of the current window
        // and the current element in that window.
        var currentWin = getWin(el[OWNER_DOCUMENT]);
        var currentEl = el;
        relativeWin = relativeWin || currentWin;
        do {
            // if we're at the top window, we want to get the page offset.
            // if we're at an inner frame, we only want to get the window position
            // so that we can determine the actual page offset in the context of
            // the outer window.
            var offset = currentWin == relativeWin ?
                getPageOffset(currentEl) :
                getClientPosition(currentEl);
            position.left += offset.left;
            position.top += offset.top;
        } while (currentWin && currentWin != relativeWin &&
            (currentEl = currentWin['frameElement']) &&
            (currentWin = currentWin.parent));

        return position;
    }

    // 设置 elem 相对 elem.ownerDocument 的坐标
    function setOffset(elem, offset) {
        // set position first, in-case top/left are set even on static elem
        if (DOM.css(elem, POSITION) === 'static') {
            elem.style[POSITION] = RELATIVE;
        }
        var old = getOffset(elem), ret = { }, current, key;

        for (key in offset) {
            current = PARSEINT(DOM.css(elem, key), 10) || 0;
            ret[key] = current + offset[key] - old[key];
        }
        DOM.css(elem, ret);
    }

    return DOM;
}, {
    requires:["./base","ua"]
});

/**
 * 2011-05-24
 *  - 承玉：
 *  - 调整 docWidth , docHeight ,
 *      viewportHeight , viewportWidth ,scrollLeft,scrollTop 参数，
 *      便于放置到 Node 中去，可以完全摆脱 DOM，完全使用 Node
 *
 *
 *
 * TODO:
 *  - 考虑是否实现 jQuery 的 position, offsetParent 等功能
 *  - 更详细的测试用例（比如：测试 position 为 fixed 的情况）
 */

/**
 * @module  dom
 * @author  lifesinger@gmail.com,yiminghe@gmail.com
 */
KISSY.add('dom/style', function(S, DOM, UA, undefined) {

    var doc = document,
        docElem = doc.documentElement,
        isIE = UA['ie'],
        STYLE = 'style',
        FLOAT = 'float',
        CSS_FLOAT = 'cssFloat',
        STYLE_FLOAT = 'styleFloat',
        WIDTH = 'width',
        HEIGHT = 'height',
        AUTO = 'auto',
        DISPLAY = 'display',
        OLD_DISPLAY = DISPLAY + S.now(),
        NONE = 'none',
        PARSEINT = parseInt,
        RE_NUMPX = /^-?\d+(?:px)?$/i,
        cssNumber = {
            "fillOpacity": 1,
            "fontWeight": 1,
            "lineHeight": 1,
            "opacity": 1,
            "orphans": 1,
            "widows": 1,
            "zIndex": 1,
            "zoom": 1
        },
        RE_DASH = /-([a-z])/ig,
        CAMELCASE_FN = function(all, letter) {
            return letter.toUpperCase();
        },
        // 考虑 ie9 ...
        rupper = /([A-Z]|^ms)/g,
        EMPTY = '',
        DEFAULT_UNIT = 'px',
        CUSTOM_STYLES = {},
        cssProps = {},
        defaultDisplay = {};

    // normalize reserved word float alternatives ("cssFloat" or "styleFloat")
    if (docElem[STYLE][CSS_FLOAT] !== undefined) {
        cssProps[FLOAT] = CSS_FLOAT;
    }
    else if (docElem[STYLE][STYLE_FLOAT] !== undefined) {
        cssProps[FLOAT] = STYLE_FLOAT;
    }

    function camelCase(name) {
        return name.replace(RE_DASH, CAMELCASE_FN);
    }

    var defaultDisplayDetectIframe,
        defaultDisplayDetectIframeDoc;

    function isCustomDomain() {
        if (!UA['ie']) {
            return false;
        }
        var domain = doc.domain,
            hostname = location.hostname;
        return domain != hostname &&
            domain != ( '[' + hostname + ']' );	// IPv6 IP support
    }

    // modified from jquery : bullet-proof method of getting default display
    // fix domain problem in ie>6 , ie6 still access denied
    function getDefaultDisplay(tagName) {
        var body,
            elem;
        if (!defaultDisplay[ tagName ]) {
            body = doc.body || doc.documentElement;
            elem = doc.createElement(tagName);
            DOM.prepend(elem, body);
            var oldDisplay = DOM.css(elem, "display");
            body.removeChild(elem);
            // If the simple way fails,
            // get element's real default display by attaching it to a temp iframe
            if (oldDisplay === "none" || oldDisplay === "") {
                // No iframe to use yet, so create it
                if (!defaultDisplayDetectIframe) {
                    defaultDisplayDetectIframe = doc.createElement("iframe");

                    defaultDisplayDetectIframe.frameBorder =
                        defaultDisplayDetectIframe.width =
                            defaultDisplayDetectIframe.height = 0;

                    DOM.prepend(defaultDisplayDetectIframe, body);

                    if (isCustomDomain()) {
                        defaultDisplayDetectIframe.src = 'javascript:void(function(){' + encodeURIComponent("" +
                            "document.open();" +
                            "document.domain='" +
                            doc.domain
                            + "';" +
                            "document.close();") + "}())";
                    }
                } else {
                    DOM.prepend(defaultDisplayDetectIframe, body);
                }

                // Create a cacheable copy of the iframe document on first call.
                // IE and Opera will allow us to reuse the iframeDoc without re-writing the fake HTML
                // document to it; WebKit & Firefox won't allow reusing the iframe document.
                if (!defaultDisplayDetectIframeDoc || !defaultDisplayDetectIframe.createElement) {
                    // ie6 need a breath , such as alert(8) or setTimeout;
                    // 同时需要同步，所以无解
                    defaultDisplayDetectIframeDoc = defaultDisplayDetectIframe.contentWindow.document;
                    defaultDisplayDetectIframeDoc.write(( doc.compatMode === "CSS1Compat" ? "<!doctype html>" : "" )
                        + "<html><body>");
                    defaultDisplayDetectIframeDoc.close();
                }

                elem = defaultDisplayDetectIframeDoc.createElement(tagName);

                defaultDisplayDetectIframeDoc.body.appendChild(elem);

                oldDisplay = DOM.css(elem, "display");

                body.removeChild(defaultDisplayDetectIframe);
            }

            // Store the correct default display
            defaultDisplay[ tagName ] = oldDisplay;
        }

        return defaultDisplay[ tagName ];
    }

    S.mix(DOM, {

        _CUSTOM_STYLES: CUSTOM_STYLES,
        _cssProps:cssProps,
        _getComputedStyle: function(elem, name) {
            var val = "",
                computedStyle = {},
                d = elem.ownerDocument;

            name = name.replace(rupper, "-$1").toLowerCase();

            // https://github.com/kissyteam/kissy/issues/61
            if (computedStyle = d.defaultView.getComputedStyle(elem, null)) {
                val = computedStyle.getPropertyValue(name) || computedStyle[name];
            }

            // 还没有加入到 document，就取行内
            if (val == "" && !DOM.__contains(d.documentElement, elem)) {
                name = cssProps[name] || name;
                val = elem[STYLE][name];
            }

            return val;
        },

        /**
         *  Get and set the style property on a DOM Node
         */
        style:function(selector, name, val) {
            // suports hash
            if (S.isPlainObject(name)) {
                for (var k in name) {
                    DOM.style(selector, k, name[k]);
                }
                return;
            }
            if (val === undefined) {
                var elem = DOM.get(selector),ret = '';
                if (elem) {
                    ret = style(elem, name, val);
                }
                return ret;
            } else {
                DOM.query(selector).each(function(elem) {
                    style(elem, name, val);
                });
            }
        },

        /**
         * (Gets computed style) or (sets styles) on the matches elements.
         */
        css: function(selector, name, val) {
            // suports hash
            if (S.isPlainObject(name)) {
                for (var k in name) {
                    DOM.css(selector, k, name[k]);
                }
                return;
            }

            name = camelCase(name);
            var hook = CUSTOM_STYLES[name];
            // getter
            if (val === undefined) {
                // supports css selector/Node/NodeList
                var elem = DOM.get(selector), ret = '';
                if (elem) {
                    // If a hook was provided get the computed value from there
                    if (hook && "get" in hook && (ret = hook.get(elem, true)) !== undefined) {
                    } else {
                        ret = DOM._getComputedStyle(elem, name);
                    }
                }
                return ret === undefined ? '' : ret;
            }
            // setter
            else {
                DOM.style(selector, name, val);
            }
        },

        /**
         * Show the matched elements.
         */
        show: function(selector) {

            DOM.query(selector).each(function(elem) {

                elem[STYLE][DISPLAY] = DOM.data(elem, OLD_DISPLAY) || EMPTY;

                // 可能元素还处于隐藏状态，比如 css 里设置了 display: none
                if (DOM.css(elem, DISPLAY) === NONE) {
                    var tagName = elem.tagName.toLowerCase(),
                        old = getDefaultDisplay(tagName);
                    DOM.data(elem, OLD_DISPLAY, old);
                    elem[STYLE][DISPLAY] = old;
                }
            });
        },

        /**
         * Hide the matched elements.
         */
        hide: function(selector) {
            DOM.query(selector).each(function(elem) {
                var style = elem[STYLE], old = style[DISPLAY];
                if (old !== NONE) {
                    if (old) {
                        DOM.data(elem, OLD_DISPLAY, old);
                    }
                    style[DISPLAY] = NONE;
                }
            });
        },

        /**
         * Display or hide the matched elements.
         */
        toggle: function(selector) {
            DOM.query(selector).each(function(elem) {
                if (DOM.css(elem, DISPLAY) === NONE) {
                    DOM.show(elem);
                } else {
                    DOM.hide(elem);
                }
            });
        },

        /**
         * Creates a stylesheet from a text blob of rules.
         * These rules will be wrapped in a STYLE tag and appended to the HEAD of the document.
         * @param {String} cssText The text containing the css rules
         * @param {String} id An id to add to the stylesheet for later removal
         */
        addStyleSheet: function(refWin, cssText, id) {
            if (S.isString(refWin)) {
                id = cssText;
                cssText = refWin;
                refWin = window;
            }
            refWin = DOM.get(refWin);
            var win = DOM._getWin(refWin),doc = win.document;
            var elem;

            if (id && (id = id.replace('#', EMPTY))) {
                elem = DOM.get('#' + id, doc);
            }

            // 仅添加一次，不重复添加
            if (elem) {
                return;
            }

            elem = DOM.create('<style>', { id: id }, doc);

            // 先添加到 DOM 树中，再给 cssText 赋值，否则 css hack 会失效
            DOM.get('head', doc).appendChild(elem);

            if (elem.styleSheet) { // IE
                elem.styleSheet.cssText = cssText;
            } else { // W3C
                elem.appendChild(doc.createTextNode(cssText));
            }
        },

        unselectable:function(selector) {
            DOM.query(selector).each(function(elem) {
                if (UA['gecko']) {
                    elem[STYLE]['MozUserSelect'] = 'none';
                }
                else if (UA['webkit']) {
                    elem[STYLE]['KhtmlUserSelect'] = 'none';
                } else {
                    if (UA['ie'] || UA['opera']) {
                        var e,i = 0,
                            els = elem.getElementsByTagName("*");
                        elem.setAttribute("unselectable", 'on');
                        while (( e = els[ i++ ] )) {
                            switch (e.tagName.toLowerCase()) {
                                case 'iframe' :
                                case 'textarea' :
                                case 'input' :
                                case 'select' :
                                    /* Ignore the above tags */
                                    break;
                                default :
                                    e.setAttribute("unselectable", 'on');
                            }
                        }
                    }
                }
            });
        },
        innerWidth:0,
        innerHeight:0,
        outerWidth:0,
        outerHeight:0,
        width:0,
        height:0
    });

    function capital(str) {
        return str.charAt(0).toUpperCase() + str.substring(1);
    }


    S.each([WIDTH,HEIGHT], function(name) {
        DOM["inner" + capital(name)] = function(selector) {
            var el = DOM.get(selector);
            if (el) {
                return getWH(el, name, "padding");
            } else {
                return null;
            }
        };


        DOM["outer" + capital(name)] = function(selector, includeMargin) {
            var el = DOM.get(selector);
            if (el) {
                return getWH(el, name, includeMargin ? "margin" : "border");
            } else {
                return null;
            }
        };

        DOM[name] = function(selector, val) {
            var ret = DOM.css(selector, name, val);
            if (ret) {
                ret = parseFloat(ret);
            }
            return ret;
        };
    });


    var cssShow = { position: "absolute", visibility: "hidden", display: "block" };

    /**
     * css height,width 永远都是计算值
     */
    S.each(["height", "width"], function(name) {
        CUSTOM_STYLES[ name ] = {
            get: function(elem, computed) {
                var val;
                if (computed) {
                    if (elem.offsetWidth !== 0) {
                        val = getWH(elem, name);
                    } else {
                        swap(elem, cssShow, function() {
                            val = getWH(elem, name);
                        });
                    }
                    return val + "px";
                }
            },
            set: function(elem, value) {
                if (RE_NUMPX.test(value)) {
                    value = parseFloat(value);
                    if (value >= 0) {
                        return value + "px";
                    }
                } else {
                    return value;
                }
            }
        };
    });

    S.each(["left", "top"], function(name) {
        CUSTOM_STYLES[ name ] = {
            get: function(elem, computed) {
                if (computed) {
                    var val = DOM._getComputedStyle(elem, name),offset;

                    // 1. 当没有设置 style.left 时，getComputedStyle 在不同浏览器下，返回值不同
                    //    比如：firefox 返回 0, webkit/ie 返回 auto
                    // 2. style.left 设置为百分比时，返回值为百分比
                    // 对于第一种情况，如果是 relative 元素，值为 0. 如果是 absolute 元素，值为 offsetLeft - marginLeft
                    // 对于第二种情况，大部分类库都未做处理，属于“明之而不 fix”的保留 bug
                    if (val === AUTO) {
                        val = 0;
                        if (S.inArray(DOM.css(elem, 'position'), ['absolute','fixed'])) {
                            offset = elem[name === 'left' ? 'offsetLeft' : 'offsetTop'];

                            // old-ie 下，elem.offsetLeft 包含 offsetParent 的 border 宽度，需要减掉
                            if (isIE && document['documentMode'] != 9 || UA['opera']) {
                                // 类似 offset ie 下的边框处理
                                // 如果 offsetParent 为 html ，需要减去默认 2 px == documentElement.clientTop
                                // 否则减去 borderTop 其实也是 clientTop
                                // http://msdn.microsoft.com/en-us/library/aa752288%28v=vs.85%29.aspx
                                // ie<9 注意有时候 elem.offsetParent 为 null ...
                                // 比如 DOM.append(DOM.create("<div class='position:absolute'></div>"),document.body)
                                offset -= elem.offsetParent && elem.offsetParent['client' + (name == 'left' ? 'Left' : 'Top')]
                                    || 0;
                            }
                            val = offset - (PARSEINT(DOM.css(elem, 'margin-' + name)) || 0);
                        }
                        val += "px";
                    }
                    return val;
                }
            }
        };
    });


    function swap(elem, options, callback) {
        var old = {};

        // Remember the old values, and insert the new ones
        for (var name in options) {
            old[ name ] = elem[STYLE][ name ];
            elem[STYLE][ name ] = options[ name ];
        }

        callback.call(elem);

        // Revert the old values
        for (name in options) {
            elem[STYLE][ name ] = old[ name ];
        }
    }


    function style(elem, name, val) {
        var style;
        if (elem.nodeType === 3 || elem.nodeType === 8 || !(style = elem[STYLE])) {
            return undefined;
        }
        name = camelCase(name);
        var ret,hook = CUSTOM_STYLES[name];
        name = cssProps[name] || name;
        // setter
        if (val !== undefined) {
            // normalize unsetting
            if (val === null || val === EMPTY) {
                val = EMPTY;
            }
            // number values may need a unit
            else if (!isNaN(Number(val)) && !cssNumber[name]) {
                val += DEFAULT_UNIT;
            }
            if (hook && hook.set) {
                val = hook.set(elem, val);
            }
            if (val !== undefined) {
                // ie 无效值报错
                try {
                    elem[STYLE][name] = val;
                } catch(e) {
                    S.log("css set error :" + e);
                }
            }
            return undefined;
        }
        //getter
        else {
            // If a hook was provided get the non-computed value from there
            if (hook && "get" in hook && (ret = hook.get(elem, false)) !== undefined) {

            } else {
                // Otherwise just get the value from the style object
                ret = style[ name ];
            }
            return ret === undefined ? "" : ret;
        }

    }


    /**
     * 得到元素的大小信息
     * @param elem
     * @param name
     * @param {String} extra    "padding" : (css width) + padding
     *                          "border" : (css width) + padding + border
     *                          "margin" : (css width) + padding + border + margin
     */
    function getWH(elem, name, extra) {
        if (S.isWindow(elem)) {
            return name == WIDTH ? DOM.viewportWidth(elem) : DOM.viewportHeight(elem);
        } else if (elem.nodeType == 9) {
            return name == WIDTH ? DOM.docWidth(elem) : DOM.docHeight(elem);
        }
        var which = name === WIDTH ? ['Left', 'Right'] : ['Top', 'Bottom'],
            val = name === WIDTH ? elem.offsetWidth : elem.offsetHeight;

        if (val > 0) {
            if (extra !== "border") {
                S.each(which, function(w) {
                    if (!extra) {
                        val -= parseFloat(DOM.css(elem, "padding" + w)) || 0;
                    }
                    if (extra === "margin") {
                        val += parseFloat(DOM.css(elem, extra + w)) || 0;
                    } else {
                        val -= parseFloat(DOM.css(elem, "border" + w + "Width")) || 0;
                    }
                });
            }

            return val
        }

        // Fall back to computed then uncomputed css if necessary
        val = DOM._getComputedStyle(elem, name);
        if (val < 0 || S.isNullOrUndefined(val)) {
            val = elem.style[ name ] || 0;
        }
        // Normalize "", auto, and prepare for extra
        val = parseFloat(val) || 0;

        // Add padding, border, margin
        if (extra) {
            S.each(which, function(w) {
                val += parseFloat(DOM.css(elem, "padding" + w)) || 0;
                if (extra !== "padding") {
                    val += parseFloat(DOM.css(elem, "border" + w + "Width")) || 0;
                }
                if (extra === "margin") {
                    val += parseFloat(DOM.css(elem, extra + w)) || 0;
                }
            });
        }

        return val;
    }

    return DOM;
}, {
    requires:["dom/base","ua"]
});

/**
 *
 * 2011-08-19
 *  - 调整结构，减少耦合
 *  - fix css("height") == auto
 *
 * NOTES:
 *  - Opera 下，color 默认返回 #XXYYZZ, 非 rgb(). 目前 jQuery 等类库均忽略此差异，KISSY 也忽略。
 *  - Safari 低版本，transparent 会返回为 rgba(0, 0, 0, 0), 考虑低版本才有此 bug, 亦忽略。
 *
 *
 *  - getComputedStyle 在 webkit 下，会舍弃小数部分，ie 下会四舍五入，gecko 下直接输出 float 值。
 *
 *  - color: blue 继承值，getComputedStyle, 在 ie 下返回 blue, opera 返回 #0000ff, 其它浏览器
 *    返回 rgb(0, 0, 255)
 *
 *  - 总之：要使得返回值完全一致是不大可能的，jQuery/ExtJS/KISSY 未“追求完美”。YUI3 做了部分完美处理，但
 *    依旧存在浏览器差异。
 */

/**
 * @module  selector
 * @author  lifesinger@gmail.com , yiminghe@gmail.com
 */
KISSY.add('dom/selector', function(S, DOM, undefined) {

    var doc = document,
        filter = S.filter,
        require = S.require,
        each = S.each,
        isArray = S.isArray,
        makeArray = S.makeArray,
        isNodeList = DOM._isNodeList,
        nodeName = DOM._nodeName,
        push = Array.prototype.push,
        SPACE = ' ',
        isString = S.isString,
        ANY = '*',
        REG_ID = /^#[\w-]+$/,
        REG_QUERY = /^(?:#([\w-]+))?\s*([\w-]+|\*)?\.?([\w-]+)?$/;

    /**
     * Retrieves an Array of HTMLElement based on the given CSS selector.
     * @param {String|Array} selector
     * @param {String|Array<HTMLElement>|NodeList} context find elements matching selector under context
     * @return {Array} The array of found HTMLElement
     */
    function query(selector, context) {
        var ret = [];
        var contexts = tuneContext(context);

        each(contexts, function(c) {
            push.apply(ret, queryByContexts(selector, c));
        });

        //必要时去重排序
        if (S.isString(selector) && selector.indexOf(",") > -1 ||
            contexts.length > 1) {
            unique(ret);
        }
        // attach each method
        ret.each = S.bind(each, undefined, ret);

        return ret;
    }

    function queryByContexts(selector, context) {
        var ret = [],
            sizzle = require("sizzle");
        if (isString(selector)) {
            selector = S.trim(selector);
        }
        // 如果选择器有 , 分开递归一部分一部分来
        if (isString(selector) && selector.indexOf(",") > -1) {
            ret = queryBySelectors(selector, context);
        }
        // 复杂了，交给 sizzle
        else if (isString(selector) && !REG_QUERY.exec(String(selector))) {
            ret = queryBySizzle(selector, context);
        }
        // 简单选择器自己处理
        else {
            ret = queryBySimple(selector, context);
        }
        return ret;
    }

    // 交给 sizzle 模块处理
    function queryBySizzle(selector, context) {
        var ret = [],
            sizzle = require("sizzle");
        if (sizzle) {
            sizzle(selector, context, ret);
        } else {
            // 原生不支持
            error(selector);
        }
        return ret;
    }

    // 处理 selector 的每个部分
    function queryBySelectors(selector, context) {
        var ret = [],
            selectors = selector.split(",");
        each(selectors, function(s) {
            push.apply(ret, queryByContexts(s, context));
        });
        // 多部分选择器可能得到重复结果
        return ret;
    }

    // 最简单情况了，单个选择器部分，单个上下文
    function queryBySimple(selector, context) {
        var match,
            t,
            ret = [],
            id,
            tag,
            cls;
        if (isString(selector)) {
            // selector 为 #id 是最常见的情况，特殊优化处理
            if (REG_ID.test(selector)) {
                t = getElementById(selector.slice(1), context);
                if (t) {
                    // #id 无效时，返回空数组
                    ret = [t];
                }
            }
            // selector 为支持列表中的其它 6 种
            else {
                match = REG_QUERY.exec(selector);
                if (match) {
                    // 获取匹配出的信息
                    id = match[1];
                    tag = match[2];
                    cls = match[3];
                    // 空白前只能有 id ，取出来作为 context
                    context = (id ? getElementById(id, context) : context);
                    if (context) {
                        // #id .cls | #id tag.cls | .cls | tag.cls | #id.cls
                        if (cls) {
                            if (!id || selector.indexOf(SPACE) != -1) { // 排除 #id.cls
                                ret = [].concat(getElementsByClassName(cls, tag, context));
                            }
                            // 处理 #id.cls
                            else {
                                t = getElementById(id, context);
                                if (t && hasClass(t, cls)) {
                                    ret = [t];
                                }
                            }
                        }
                        // #id tag | tag
                        else if (tag) { // 排除空白字符串
                            ret = getElementsByTagName(tag, context);
                        }
                    }
                }
            }
        }
        // 传入的 selector 是 NodeList 或已是 Array
        else if (selector && (isArray(selector) || isNodeList(selector))) {
            // 只能包含在 context 里面
            ret = filter(selector, function(s) {
                return testByContext(s, context);
            });
        }
        // 传入的 selector 是 HTMLNode 查看约束
        // 否则 window/document，原样返回
        else if (selector) {
            if (testByContext(selector, context)) {
                ret = [selector];
            }
        }
        return ret;
    }

    function testByContext(element, context) {
        if (!element) {
            return false;
        }
        // 防止 element 节点还没添加到 document ，但是也可以获取到 query(element) => [element]
        // document 的上下文一律放行

        // context == doc 意味着没有提供第二个参数，到这里只是想单纯包装原生节点，则不检测
        if (context == doc) {
            return true;
        }
        // 节点受上下文约束
        return DOM.__contains(context, element);
    }

    var unique;
    (function() {
        var sortOrder,
            t,
            hasDuplicate,
            baseHasDuplicate = true;

        // Here we check if the JavaScript engine is using some sort of
// optimization where it does not always call our comparision
// function. If that is the case, discard the hasDuplicate value.
//   Thus far that includes Google Chrome.
        [0, 0].sort(function() {
            baseHasDuplicate = false;
            return 0;
        });

        // 排序去重
        unique = function (elements) {
            if (sortOrder) {
                hasDuplicate = baseHasDuplicate;
                elements.sort(sortOrder);

                if (hasDuplicate) {
                    var i = 1,len = elements.length;
                    while (i < len) {
                        if (elements[i] === elements[ i - 1 ]) {
                            elements.splice(i, 1);
                        } else {
                            i++;
                        }
                    }
                }
            }
            return elements;
        };

        // 貌似除了 ie 都有了...
        if (doc.documentElement.compareDocumentPosition) {
            sortOrder = t = function(a, b) {
                if (a == b) {
                    hasDuplicate = true;
                    return 0;
                }

                if (!a.compareDocumentPosition || !b.compareDocumentPosition) {
                    return a.compareDocumentPosition ? -1 : 1;
                }

                return a.compareDocumentPosition(b) & 4 ? -1 : 1;
            };

        } else {
            sortOrder = t = function(a, b) {
                // The nodes are identical, we can exit early
                if (a == b) {
                    hasDuplicate = true;
                    return 0;
                    // Fallback to using sourceIndex (in IE) if it's available on both nodes
                } else if (a.sourceIndex && b.sourceIndex) {
                    return a.sourceIndex - b.sourceIndex;
                }
            };
        }
    })();


    // 调整 context 为合理值
    function tuneContext(context) {
        // context 为 undefined 是最常见的情况，优先考虑
        if (context === undefined) {
            return [doc];
        }
        // 其他直接使用 query
        return query(context, undefined);
    }

    // query #id
    function getElementById(id, context) {
        if (!context) {
            return null;
        }
        var doc = context;
        if (context.nodeType !== DOM.DOCUMENT_NODE) {
            doc = context.ownerDocument;
        }
        var el = doc.getElementById(id);
        if (el && el.parentNode) {
            // ie opera confuse name with id
            // https://github.com/kissyteam/kissy/issues/67
            // 不能直接 el.id ，否则 input shadow form attribute
            if (DOM.attr(el, "id") !== id) {
                // 直接在 context 下的所有节点找
                el = DOM.filter("*", "#" + id, context)[0] || null;
            }
            // ie 特殊情况下以及指明在 context 下找了，不需要再判断
            // 如果指定了 context node , 还要判断 id 是否处于 context 内
            else if (!testByContext(el, context)) {
                el = null;
            }
        } else {
            el = null;
        }

        return el;
    }

    // query tag
    function getElementsByTagName(tag, context) {
        return context && makeArray(context.getElementsByTagName(tag)) || [];
    }

    (function() {
        // Check to see if the browser returns only elements
        // when doing getElementsByTagName('*')

        // Create a fake element
        var div = doc.createElement('div');
        div.appendChild(doc.createComment(''));

        // Make sure no comments are found
        if (div.getElementsByTagName(ANY).length > 0) {
            getElementsByTagName = function(tag, context) {
                var ret = makeArray(context.getElementsByTagName(tag));
                if (tag === ANY) {
                    var t = [], i = 0,node;
                    while ((node = ret[i++])) {
                        // Filter out possible comments
                        if (node.nodeType === 1) {
                            t.push(node);
                        }
                    }
                    ret = t;
                }
                return ret;
            };
        }
    })();

    // query .cls
    var getElementsByClassName = doc.getElementsByClassName ? function(cls, tag, context) {
        // query("#id1 xx","#id2")
        // #id2 内没有 #id1 , context 为 null , 这里防御下
        if (!context) {
            return [];
        }
        var els = makeArray(context.getElementsByClassName(cls)),
            ret = els,
            i = 0,
            len = els.length,
            el;

        if (tag && tag !== ANY) {
            ret = makeArray();
            for (; i < len; ++i) {
                el = els[i];
                if (nodeName(el, tag)) {
                    ret.push(el);
                }
            }
        }
        return ret;
    } : ( doc.querySelectorAll ? function(cls, tag, context) {
        // ie8 return staticNodeList 对象,[].concat 会形成 [ staticNodeList ] ，手动转化为普通数组
        return context && makeArray(context.querySelectorAll((tag ? tag : '') + '.' + cls)) || [];
    } : function(cls, tag, context) {
        if (!context) {
            return [];
        }
        var els = makeArray(context.getElementsByTagName(tag || ANY)),
            ret = [],
            i = 0,
            len = els.length,
            el;
        for (; i < len; ++i) {
            el = els[i];
            if (hasClass(el, cls)) {
                ret.push(el);
            }
        }
        return ret;
    });

    function hasClass(el, cls) {
        return DOM.__hasClass(el, cls);
    }

    // throw exception
    function error(msg) {
        S.error('Unsupported selector: ' + msg);
    }

    S.mix(DOM, {

        query: query,

        get: function(selector, context) {
            return query(selector, context)[0] || null;
        },

        unique:unique,

        /**
         * Filters an array of elements to only include matches of a filter.
         * @param filter selector or fn
         */
        filter: function(selector, filter, context) {
            var elems = query(selector, context),
                sizzle = require("sizzle"),
                match,
                tag,
                id,
                cls,
                ret = [];

            // 默认仅支持最简单的 tag.cls 或 #id 形式
            if (isString(filter) &&
                (match = REG_QUERY.exec(filter))) {
                id = match[1];
                tag = match[2];
                cls = match[3];
                if (!id) {
                    filter = function(elem) {
                        var tagRe = true,clsRe = true;

                        // 指定 tag 才进行判断
                        if (tag) {
                            tagRe = nodeName(elem, tag);
                        }

                        // 指定 cls 才进行判断
                        if (cls) {
                            clsRe = hasClass(elem, cls);
                        }

                        return clsRe && tagRe;
                    }
                } else if (id && !tag && !cls) {
                    filter = function(elem) {
                        return elem.id === id;
                    };
                }
            }

            if (S.isFunction(filter)) {
                ret = S.filter(elems, filter);
            }
            // 其它复杂 filter, 采用外部选择器
            else if (filter && sizzle) {
                ret = sizzle.matches(filter, elems);
            }
            // filter 为空或不支持的 selector
            else {
                error(filter);
            }

            return ret;
        },

        /**
         * Returns true if the passed element(s) match the passed filter
         */
        test: function(selector, filter, context) {
            var elements = query(selector, context);
            return elements.length && (DOM.filter(elements, filter, context).length === elements.length);
        }
    });
    return DOM;
}, {
    requires:["dom/base"]
});

/**
 * NOTES:
 *
 * 2011.08.02
 *  - 利用 sizzle 重构选择器
 *  - 1.1.6 修正，原来 context 只支持 #id 以及 document
 *    1.2 context 支持任意，和 selector 格式一致
 *  - 简单选择器也和 jquery 保持一致 DOM.query("xx","yy") 支持
 *    - context 不提供则为当前 document ，否则通过 query 递归取得
 *    - 保证选择出来的节点（除了 document window）都是位于 context 范围内
 *
 *
 * 2010.01
 *  - 对 reg exec 的结果(id, tag, className)做 cache, 发现对性能影响很小，去掉。
 *  - getElementById 使用频率最高，使用直达通道优化。
 *  - getElementsByClassName 性能优于 querySelectorAll, 但 IE 系列不支持。
 *  - instanceof 对性能有影响。
 *  - 内部方法的参数，比如 cls, context 等的异常情况，已经在 query 方法中有保证，无需冗余“防卫”。
 *  - query 方法中的条件判断考虑了“频率优先”原则。最有可能出现的情况放在前面。
 *  - Array 的 push 方法可以用 j++ 来替代，性能有提升。
 *  - 返回值策略和 Sizzle 一致，正常时，返回数组；其它所有情况，返回空数组。
 *
 *  - 从压缩角度考虑，还可以将 getElmentsByTagName 和 getElementsByClassName 定义为常量，
 *    不过感觉这样做太“压缩控”，还是保留不替换的好。
 *
 *  - 调整 getElementsByClassName 的降级写法，性能最差的放最后。
 *
 * 2010.02
 *  - 添加对分组选择器的支持（主要参考 Sizzle 的代码，代去除了对非 Grade A 级浏览器的支持）
 *
 * 2010.03
 *  - 基于原生 dom 的两个 api: S.query 返回数组; S.get 返回第一个。
 *    基于 Node 的 api: S.one, 在 Node 中实现。
 *    基于 NodeList 的 api: S.all, 在 NodeList 中实现。
 *    通过 api 的分层，同时满足初级用户和高级用户的需求。
 *
 * 2010.05
 *  - 去掉给 S.query 返回值默认添加的 each 方法，保持纯净。
 *  - 对于不支持的 selector, 采用外部耦合进来的 Selector.
 *
 * 2010.06
 *  - 增加 filter 和 test 方法
 *
 * 2010.07
 *  - 取消对 , 分组的支持，group 直接用 Sizzle
 *
 * 2010.08
 *  - 给 S.query 的结果 attach each 方法
 *
 * 2011.05
 *  - 承玉：恢复对简单分组支持
 *
 * Ref: http://ejohn.org/blog/selectors-that-people-actually-use/
 * 考虑 2/8 原则，仅支持以下选择器：
 * #id
 * tag
 * .cls
 * #id tag
 * #id .cls
 * tag.cls
 * #id tag.cls
 * 注 1：REG_QUERY 还会匹配 #id.cls
 * 注 2：tag 可以为 * 字符
 * 注 3: 支持 , 号分组
 *
 *
 * Bugs:
 *  - S.query('#test-data *') 等带 * 号的选择器，在 IE6 下返回的值不对。jQuery 等类库也有此 bug, 诡异。
 *
 * References:
 *  - http://ejohn.org/blog/selectors-that-people-actually-use/
 *  - http://ejohn.org/blog/thoughts-on-queryselectorall/
 *  - MDC: querySelector, querySelectorAll, getElementsByClassName
 *  - Sizzle: http://github.com/jeresig/sizzle
 *  - MINI: http://james.padolsey.com/javascript/mini/
 *  - Peppy: http://jamesdonaghue.com/?p=40
 *  - Sly: http://github.com/digitarald/sly
 *  - XPath, TreeWalker：http://www.cnblogs.com/rubylouvre/archive/2009/07/24/1529640.html
 *
 *  - http://www.quirksmode.org/blog/archives/2006/01/contains_for_mo.html
 *  - http://www.quirksmode.org/dom/getElementsByTagNames.html
 *  - http://ejohn.org/blog/comparing-document-position/
 *  - http://github.com/jeresig/sizzle/blob/master/sizzle.js
 */

/**
 * @module  dom
 * @author  lifesinger@gmail.com,yiminghe@gmail.com
 */
KISSY.add('dom/style-ie', function(S, DOM, UA, Style) {

        var HUNDRED = 100;

        // only for ie
        if (!UA['ie']) {
            return DOM;
        }

        var doc = document,
            docElem = doc.documentElement,
            OPACITY = 'opacity',
            STYLE = 'style',
            FILTER = "filter",
            CURRENT_STYLE = 'currentStyle',
            RUNTIME_STYLE = 'runtimeStyle',
            LEFT = 'left',
            PX = 'px',
            CUSTOM_STYLES = Style._CUSTOM_STYLES,
            RE_NUMPX = /^-?\d+(?:px)?$/i,
            RE_NUM = /^-?\d/,
            ropacity = /opacity=([^)]*)/,
            ralpha = /alpha\([^)]*\)/i;

        // use alpha filter for IE opacity
        try {
            if (S.isNullOrUndefined(docElem.style[OPACITY])) {

                CUSTOM_STYLES[OPACITY] = {

                    get: function(elem, computed) {
                        // 没有设置过 opacity 时会报错，这时返回 1 即可
                        // 如果该节点没有添加到 dom ，取不到 filters 结构
                        // val = elem[FILTERS]['DXImageTransform.Microsoft.Alpha'][OPACITY];
                        return ropacity.test((
                            computed && elem[CURRENT_STYLE] ?
                                elem[CURRENT_STYLE][FILTER] :
                                elem[STYLE][FILTER]) || "") ?
                            ( parseFloat(RegExp.$1) / HUNDRED ) + "" :
                            computed ? "1" : "";
                    },

                    set: function(elem, val) {
                        val = parseFloat(val);

                        var style = elem[STYLE],
                            currentStyle = elem[CURRENT_STYLE],
                            opacity = isNaN(val) ? "" : "alpha(" + OPACITY + "=" + val * HUNDRED + ")",
                            filter = S.trim(currentStyle && currentStyle[FILTER] || style[FILTER] || "");

                        // ie  has layout
                        style.zoom = 1;

                        // if setting opacity to 1, and no other filters exist - attempt to remove filter attribute
                        if (val >= 1 && S.trim(filter.replace(ralpha, "")) === "") {

                            // Setting style.filter to null, "" & " " still leave "filter:" in the cssText
                            // if "filter:" is present at all, clearType is disabled, we want to avoid this
                            // style.removeAttribute is IE Only, but so apparently is this code path...
                            style.removeAttribute(FILTER);

                            // if there there is no filter style applied in a css rule, we are done
                            if (currentStyle && !currentStyle[FILTER]) {
                                return;
                            }
                        }

                        // otherwise, set new filter values
                        // 如果 >=1 就不设，就不能覆盖外部样式表定义的样式，一定要设
                        style.filter = ralpha.test(filter) ?
                            filter.replace(ralpha, opacity) :
                            filter + (filter ? ", " : "") + opacity;
                    }
                };
            }
        }
        catch(ex) {
            S.log('IE filters ActiveX is disabled. ex = ' + ex);
        }

        /**
         * border fix
         * ie 不设置数值，则 computed style 不返回数值，只返回 thick? medium ...
         * (default is "medium")
         */
        var IE8 = UA['ie'] == 8,
            BORDER_MAP = {
            },
            BORDERS = ["","Top","Left","Right","Bottom"];
        BORDER_MAP['thin'] = IE8 ? '1px' : '2px';
        BORDER_MAP['medium'] = IE8 ? '3px' : '4px';
        BORDER_MAP['thick'] = IE8 ? '5px' : '6px';
        S.each(BORDERS, function(b) {
            var name = "border" + b + "Width",
                styleName = "border" + b + "Style";
            CUSTOM_STYLES[name] = {
                get: function(elem, computed) {
                    // 只有需要计算样式的时候才转换，否则取原值
                    var currentStyle = computed ? elem[CURRENT_STYLE] : 0,
                        current = currentStyle && String(currentStyle[name]) || undefined;
                    // look up keywords if a border exists
                    if (current && current.indexOf("px") < 0) {
                        // 边框没有隐藏
                        if (BORDER_MAP[current] && currentStyle[styleName] !== "none") {
                            current = BORDER_MAP[current];
                        } else {
                            // otherwise no border
                            current = 0;
                        }
                    }
                    return current;
                }
            };
        });

        // getComputedStyle for IE
        if (!(doc.defaultView || { }).getComputedStyle && docElem[CURRENT_STYLE]) {

            DOM._getComputedStyle = function(elem, name) {
                name = DOM._cssProps[name] || name;

                var ret = elem[CURRENT_STYLE] && elem[CURRENT_STYLE][name];

                // 当 width/height 设置为百分比时，通过 pixelLeft 方式转换的 width/height 值
                // 一开始就处理了! CUSTOM_STYLE["height"],CUSTOM_STYLE["width"] ,cssHook 解决@2011-08-19
                // 在 ie 下不对，需要直接用 offset 方式
                // borderWidth 等值也有问题，但考虑到 borderWidth 设为百分比的概率很小，这里就不考虑了

                // From the awesome hack by Dean Edwards
                // http://erik.eae.net/archives/2007/07/27/18.54.15/#comment-102291
                // If we're not dealing with a regular pixel number
                // but a number that has a weird ending, we need to convert it to pixels
                if ((!RE_NUMPX.test(ret) && RE_NUM.test(ret))) {
                    // Remember the original values
                    var style = elem[STYLE],
                        left = style[LEFT],
                        rsLeft = elem[RUNTIME_STYLE] && elem[RUNTIME_STYLE][LEFT];

                    // Put in the new values to get a computed value out
                    if (rsLeft) {
                        elem[RUNTIME_STYLE][LEFT] = elem[CURRENT_STYLE][LEFT];
                    }
                    style[LEFT] = name === 'fontSize' ? '1em' : (ret || 0);
                    ret = style['pixelLeft'] + PX;

                    // Revert the changed values
                    style[LEFT] = left;
                    if (rsLeft) {
                        elem[RUNTIME_STYLE][LEFT] = rsLeft;
                    }
                }
                return ret === "" ? "auto" : ret;
            };
        }
        return DOM;
    },
    {
        requires:["./base","ua","./style"]
    }
);
/**
 * NOTES:
 * 承玉： 2011.05.19 opacity in ie
 *  - 如果节点是动态创建，设置opacity，没有加到 dom 前，取不到 opacity 值
 *  - 兼容：border-width 值，ie 下有可能返回 medium/thin/thick 等值，其它浏览器返回 px 值。
 *
 *  - opacity 的实现，参考自 jquery
 *
 */

/**
 * @module  dom-traversal
 * @author  lifesinger@gmail.com,yiminghe@gmail.com
 */
KISSY.add('dom/traversal', function(S, DOM, undefined) {

    var isElementNode = DOM._isElementNode,
        CONTAIN_MASK = 16;

    S.mix(DOM, {

        closest:function(selector, filter, context) {
            return nth(selector, filter, 'parentNode', function(elem) {
                return elem.nodeType != DOM.DOCUMENT_FRAGMENT_NODE;
            }, context, true);
        },

        /**
         * Gets the parent node of the first matched element.
         */
        parent: function(selector, filter, context) {
            return nth(selector, filter, 'parentNode', function(elem) {
                return elem.nodeType != DOM.DOCUMENT_FRAGMENT_NODE;
            }, context);
        },

        first:function(selector, filter) {
            var elem = DOM.get(selector);
            return nth(elem && elem.firstChild, filter, 'nextSibling',
                undefined, undefined, true);
        },

        last:function(selector, filter) {
            var elem = DOM.get(selector);
            return nth(elem && elem.lastChild, filter, 'previousSibling',
                undefined, undefined, true);
        },

        /**
         * Gets the following sibling of the first matched element.
         */
        next: function(selector, filter) {
            return nth(selector, filter, 'nextSibling', undefined);
        },

        /**
         * Gets the preceding sibling of the first matched element.
         */
        prev: function(selector, filter) {
            return nth(selector, filter, 'previousSibling', undefined);
        },

        /**
         * Gets the siblings of the first matched element.
         */
        siblings: function(selector, filter) {
            return getSiblings(selector, filter, true);
        },

        /**
         * Gets the children of the first matched element.
         */
        children: function(selector, filter) {
            return getSiblings(selector, filter, undefined);
        },

        __contains:document.documentElement.contains ?
            function(a, b) {
                if (a.nodeType == DOM.TEXT_NODE) {
                    return false;
                }
                var precondition;
                if (b.nodeType == DOM.TEXT_NODE) {
                    b = b.parentNode;
                    // a 和 b父亲相等也就是返回 true
                    precondition = true;
                } else if (b.nodeType == DOM.DOCUMENT_NODE) {
                    // b === document
                    // 没有任何元素能包含 document
                    return false;
                } else {
                    // a 和 b 相等返回 false
                    precondition = a !== b;
                }
                // !a.contains => a===document
                // 注意原生 contains 判断时 a===b 也返回 true
                return precondition && (a.contains ? a.contains(b) : true);
            } : (
            document.documentElement.compareDocumentPosition ?
                function(a, b) {
                    return !!(a.compareDocumentPosition(b) & CONTAIN_MASK);
                } :
                // it can not be true , pathetic browser
                0
            ),

        /**
         * Check to see if a DOM node is within another DOM node.
         */
        contains:
            function(a, b) {
                a = DOM.get(a);
                b = DOM.get(b);
                if (a && b) {
                    return DOM.__contains(a, b);
                }
            },

        equals:function(n1, n2) {
            n1 = DOM.query(n1);
            n2 = DOM.query(n2);
            if (n1.length != n2.length) {
                return false;
            }
            for (var i = n1.length; i >= 0; i--) {
                if (n1[i] != n2[i]) {
                    return false;
                }
            }
            return true;
        }
    });

    // 获取元素 elem 在 direction 方向上满足 filter 的第一个元素
    // filter 可为 number, selector, fn array ，为数组时返回多个
    // direction 可为 parentNode, nextSibling, previousSibling
    // context : 到某个阶段不再查找直接返回
    function nth(elem, filter, direction, extraFilter, context, includeSef) {
        if (!(elem = DOM.get(elem))) {
            return null;
        }
        if (filter === 0) {
            return elem;
        }
        if (!includeSef) {
            elem = elem[direction];
        }
        if (!elem) {
            return null;
        }
        context = (context && DOM.get(context)) || null;

        if (filter === undefined) {
            // 默认取 1
            filter = 1;
        }
        var ret = [],
            isArray = S.isArray(filter),
            fi,
            flen;

        if (S.isNumber(filter)) {
            fi = 0;
            flen = filter;
            filter = function() {
                return ++fi === flen;
            };
        }

        // 概念统一，都是 context 上下文，只过滤子孙节点，自己不管
        while (elem && elem != context) {
            if (isElementNode(elem)
                && testFilter(elem, filter)
                && (!extraFilter || extraFilter(elem))) {
                ret.push(elem);
                if (!isArray) {
                    break;
                }
            }
            elem = elem[direction];
        }

        return isArray ? ret : ret[0] || null;
    }

    function testFilter(elem, filter) {
        if (!filter) {
            return true;
        }
        if (S.isArray(filter)) {
            for (var i = 0; i < filter.length; i++) {
                if (DOM.test(elem, filter[i])) {
                    return true;
                }
            }
        } else if (DOM.test(elem, filter)) {
            return true;
        }
        return false;
    }

    // 获取元素 elem 的 siblings, 不包括自身
    function getSiblings(selector, filter, parent) {
        var ret = [],
            elem = DOM.get(selector),
            j,
            parentNode = elem,
            next;
        if (elem && parent) {
            parentNode = elem.parentNode;
        }

        if (parentNode) {
            for (j = 0,next = parentNode.firstChild;
                 next;
                 next = next.nextSibling) {
                if (isElementNode(next)
                    && next !== elem
                    && (!filter || DOM.test(next, filter))) {
                    ret[j++] = next;
                }
            }
        }

        return ret;
    }

    return DOM;
}, {
    requires:["./base"]
});

/**
 * 2011-08
 * - 添加 closest , first ,last 完全摆脱原生属性
 *
 * NOTES:
 * - jquery does not return null ,it only returns empty array , but kissy does.
 *
 *  - api 的设计上，没有跟随 jQuery. 一是为了和其他 api 一致，保持 first-all 原则。二是
 *    遵循 8/2 原则，用尽可能少的代码满足用户最常用的功能。
 *
 */

KISSY.add("dom", function(S,DOM) {
    return DOM;
}, {
    requires:["dom/attr",
        "dom/class",
        "dom/create",
        "dom/data",
        "dom/insertion",
        "dom/offset",
        "dom/style",
        "dom/selector",
        "dom/style-ie",
        "dom/traversal"]
});

/**
 * @fileOverview some keycodes definition and utils from closure-library
 * @author yiminghe@gmail.com
 */
KISSY.add("event/keycodes", function() {
    var KeyCodes = {
        MAC_ENTER: 3,
        BACKSPACE: 8,
        TAB: 9,
        NUM_CENTER: 12,  // NUMLOCK on FF/Safari Mac
        ENTER: 13,
        SHIFT: 16,
        CTRL: 17,
        ALT: 18,
        PAUSE: 19,
        CAPS_LOCK: 20,
        ESC: 27,
        SPACE: 32,
        PAGE_UP: 33,     // also NUM_NORTH_EAST
        PAGE_DOWN: 34,   // also NUM_SOUTH_EAST
        END: 35,         // also NUM_SOUTH_WEST
        HOME: 36,        // also NUM_NORTH_WEST
        LEFT: 37,        // also NUM_WEST
        UP: 38,          // also NUM_NORTH
        RIGHT: 39,       // also NUM_EAST
        DOWN: 40,        // also NUM_SOUTH
        PRINT_SCREEN: 44,
        INSERT: 45,      // also NUM_INSERT
        DELETE: 46,      // also NUM_DELETE
        ZERO: 48,
        ONE: 49,
        TWO: 50,
        THREE: 51,
        FOUR: 52,
        FIVE: 53,
        SIX: 54,
        SEVEN: 55,
        EIGHT: 56,
        NINE: 57,
        QUESTION_MARK: 63, // needs localization
        A: 65,
        B: 66,
        C: 67,
        D: 68,
        E: 69,
        F: 70,
        G: 71,
        H: 72,
        I: 73,
        J: 74,
        K: 75,
        L: 76,
        M: 77,
        N: 78,
        O: 79,
        P: 80,
        Q: 81,
        R: 82,
        S: 83,
        T: 84,
        U: 85,
        V: 86,
        W: 87,
        X: 88,
        Y: 89,
        Z: 90,
        META: 91, // WIN_KEY_LEFT
        WIN_KEY_RIGHT: 92,
        CONTEXT_MENU: 93,
        NUM_ZERO: 96,
        NUM_ONE: 97,
        NUM_TWO: 98,
        NUM_THREE: 99,
        NUM_FOUR: 100,
        NUM_FIVE: 101,
        NUM_SIX: 102,
        NUM_SEVEN: 103,
        NUM_EIGHT: 104,
        NUM_NINE: 105,
        NUM_MULTIPLY: 106,
        NUM_PLUS: 107,
        NUM_MINUS: 109,
        NUM_PERIOD: 110,
        NUM_DIVISION: 111,
        F1: 112,
        F2: 113,
        F3: 114,
        F4: 115,
        F5: 116,
        F6: 117,
        F7: 118,
        F8: 119,
        F9: 120,
        F10: 121,
        F11: 122,
        F12: 123,
        NUMLOCK: 144,
        SEMICOLON: 186,            // needs localization
        DASH: 189,                 // needs localization
        EQUALS: 187,               // needs localization
        COMMA: 188,                // needs localization
        PERIOD: 190,               // needs localization
        SLASH: 191,                // needs localization
        APOSTROPHE: 192,           // needs localization
        SINGLE_QUOTE: 222,         // needs localization
        OPEN_SQUARE_BRACKET: 219,  // needs localization
        BACKSLASH: 220,            // needs localization
        CLOSE_SQUARE_BRACKET: 221, // needs localization
        WIN_KEY: 224,
        MAC_FF_META: 224, // Firefox (Gecko) fires this for the meta key instead of 91
        WIN_IME: 229
    };

    KeyCodes.isTextModifyingKeyEvent = function(e) {
        if (e.altKey && !e.ctrlKey ||
            e.metaKey ||
            // Function keys don't generate text
            e.keyCode >= KeyCodes.F1 &&
                e.keyCode <= KeyCodes.F12) {
            return false;
        }

        // The following keys are quite harmless, even in combination with
        // CTRL, ALT or SHIFT.
        switch (e.keyCode) {
            case KeyCodes.ALT:
            case KeyCodes.CAPS_LOCK:
            case KeyCodes.CONTEXT_MENU:
            case KeyCodes.CTRL:
            case KeyCodes.DOWN:
            case KeyCodes.END:
            case KeyCodes.ESC:
            case KeyCodes.HOME:
            case KeyCodes.INSERT:
            case KeyCodes.LEFT:
            case KeyCodes.MAC_FF_META:
            case KeyCodes.META:
            case KeyCodes.NUMLOCK:
            case KeyCodes.NUM_CENTER:
            case KeyCodes.PAGE_DOWN:
            case KeyCodes.PAGE_UP:
            case KeyCodes.PAUSE:
            case KeyCodes.PHANTOM:
            case KeyCodes.PRINT_SCREEN:
            case KeyCodes.RIGHT:
            case KeyCodes.SHIFT:
            case KeyCodes.UP:
            case KeyCodes.WIN_KEY:
            case KeyCodes.WIN_KEY_RIGHT:
                return false;
            default:
                return true;
        }
    };

    KeyCodes.isCharacterKey = function(keyCode) {
        if (keyCode >= KeyCodes.ZERO &&
            keyCode <= KeyCodes.NINE) {
            return true;
        }

        if (keyCode >= KeyCodes.NUM_ZERO &&
            keyCode <= KeyCodes.NUM_MULTIPLY) {
            return true;
        }

        if (keyCode >= KeyCodes.A &&
            keyCode <= KeyCodes.Z) {
            return true;
        }

        // Safari sends zero key code for non-latin characters.
        if (goog.userAgent.WEBKIT && keyCode == 0) {
            return true;
        }

        switch (keyCode) {
            case KeyCodes.SPACE:
            case KeyCodes.QUESTION_MARK:
            case KeyCodes.NUM_PLUS:
            case KeyCodes.NUM_MINUS:
            case KeyCodes.NUM_PERIOD:
            case KeyCodes.NUM_DIVISION:
            case KeyCodes.SEMICOLON:
            case KeyCodes.DASH:
            case KeyCodes.EQUALS:
            case KeyCodes.COMMA:
            case KeyCodes.PERIOD:
            case KeyCodes.SLASH:
            case KeyCodes.APOSTROPHE:
            case KeyCodes.SINGLE_QUOTE:
            case KeyCodes.OPEN_SQUARE_BRACKET:
            case KeyCodes.BACKSLASH:
            case KeyCodes.CLOSE_SQUARE_BRACKET:
                return true;
            default:
                return false;
        }
    };

    return KeyCodes;

});

/**
 * @module  EventObject
 * @author  lifesinger@gmail.com
 */
KISSY.add('event/object', function(S, undefined) {

    var doc = document,
        props = ('altKey attrChange attrName bubbles button cancelable ' +
            'charCode clientX clientY ctrlKey currentTarget data detail ' +
            'eventPhase fromElement handler keyCode layerX layerY metaKey ' +
            'newValue offsetX offsetY originalTarget pageX pageY prevValue ' +
            'relatedNode relatedTarget screenX screenY shiftKey srcElement ' +
            'target toElement view wheelDelta which').split(' ');

    /**
     * KISSY's event system normalizes the event object according to
     * W3C standards. The event object is guaranteed to be passed to
     * the event handler. Most properties from the original event are
     * copied over and normalized to the new event object.
     */
    function EventObject(currentTarget, domEvent, type) {
        var self = this;
        self.currentTarget = currentTarget;
        self.originalEvent = domEvent || { };

        if (domEvent) { // html element
            self.type = domEvent.type;
            self._fix();
        }
        else { // custom
            self.type = type;
            self.target = currentTarget;
        }

        // bug fix: in _fix() method, ie maybe reset currentTarget to undefined.
        self.currentTarget = currentTarget;
        self.fixed = true;
    }

    S.augment(EventObject, {

        _fix: function() {
            var self = this,
                originalEvent = self.originalEvent,
                l = props.length, prop,
                ct = self.currentTarget,
                ownerDoc = (ct.nodeType === 9) ? ct : (ct.ownerDocument || doc); // support iframe

            // clone properties of the original event object
            while (l) {
                prop = props[--l];
                self[prop] = originalEvent[prop];
            }

            // fix target property, if necessary
            if (!self.target) {
                self.target = self.srcElement || doc; // srcElement might not be defined either
            }

            // check if target is a textnode (safari)
            if (self.target.nodeType === 3) {
                self.target = self.target.parentNode;
            }

            // add relatedTarget, if necessary
            if (!self.relatedTarget && self.fromElement) {
                self.relatedTarget = (self.fromElement === self.target) ? self.toElement : self.fromElement;
            }

            // calculate pageX/Y if missing and clientX/Y available
            if (self.pageX === undefined && self.clientX !== undefined) {
                var docEl = ownerDoc.documentElement, bd = ownerDoc.body;
                self.pageX = self.clientX + (docEl && docEl.scrollLeft || bd && bd.scrollLeft || 0) - (docEl && docEl.clientLeft || bd && bd.clientLeft || 0);
                self.pageY = self.clientY + (docEl && docEl.scrollTop || bd && bd.scrollTop || 0) - (docEl && docEl.clientTop || bd && bd.clientTop || 0);
            }

            // add which for key events
            if (self.which === undefined) {
                self.which = (self.charCode === undefined) ? self.keyCode : self.charCode;
            }

            // add metaKey to non-Mac browsers (use ctrl for PC's and Meta for Macs)
            if (self.metaKey === undefined) {
                self.metaKey = self.ctrlKey;
            }

            // add which for click: 1 === left; 2 === middle; 3 === right
            // Note: button is not normalized, so don't use it
            if (!self.which && self.button !== undefined) {
                self.which = (self.button & 1 ? 1 : (self.button & 2 ? 3 : ( self.button & 4 ? 2 : 0)));
            }
        },

        /**
         * Prevents the event's default behavior
         */
        preventDefault: function() {
            var e = this.originalEvent;

            // if preventDefault exists run it on the original event
            if (e.preventDefault) {
                e.preventDefault();
            }
            // otherwise set the returnValue property of the original event to false (IE)
            else {
                e.returnValue = false;
            }

            this.isDefaultPrevented = true;
        },

        /**
         * Stops the propagation to the next bubble target
         */
        stopPropagation: function() {
            var e = this.originalEvent;

            // if stopPropagation exists run it on the original event
            if (e.stopPropagation) {
                e.stopPropagation();
            }
            // otherwise set the cancelBubble property of the original event to true (IE)
            else {
                e.cancelBubble = true;
            }

            this.isPropagationStopped = true;
        },



        /**
         * Stops the propagation to the next bubble target and
         * prevents any additional listeners from being exectued
         * on the current target.
         */
        stopImmediatePropagation: function() {
            var e = this.originalEvent;

            if (e.stopImmediatePropagation) {
                e.stopImmediatePropagation();
            } else {
                this.stopPropagation();
            }

            this.isImmediatePropagationStopped = true;
        },

        /**
         * Stops the event propagation and prevents the default
         * event behavior.
         * @param immediate {boolean} if true additional listeners
         * on the current target will not be executed
         */
        halt: function(immediate) {
            if (immediate) {
                this.stopImmediatePropagation();
            } else {
                this.stopPropagation();
            }

            this.preventDefault();
        }
    });

    if (1 > 2) {
        alert(S.cancelBubble);
    }

    return EventObject;

});

/**
 * NOTES:
 *
 *  2010.04
 *   - http://www.w3.org/TR/2003/WD-DOM-Level-3-Events-20030331/ecma-script-binding.html
 *
 * TODO:
 *   - pageX, clientX, scrollLeft, clientLeft 的详细测试
 */

/**
 * @module  event
 * @author  lifesinger@gmail.com,yiminghe@gmail.com
 */
KISSY.add('event/base', function(S, DOM, EventObject, undefined) {

    var doc = document,
        nodeName = DOM._nodeName,
        makeArray = S.makeArray,
        simpleAdd = doc.addEventListener ?
            function(el, type, fn, capture) {
                if (el.addEventListener) {
                    el.addEventListener(type, fn, !!capture);
                }
            } :
            function(el, type, fn) {
                if (el.attachEvent) {
                    el.attachEvent('on' + type, fn);
                }
            },
        simpleRemove = doc.removeEventListener ?
            function(el, type, fn, capture) {
                if (el.removeEventListener) {
                    el.removeEventListener(type, fn, !!capture);
                }
            } :
            function(el, type, fn) {
                if (el.detachEvent) {
                    el.detachEvent('on' + type, fn);
                }
            },
        SPACE = " ",
        // 记录手工 fire(domElement,type) 时的 type
        // 再在浏览器通知的系统 eventHandler 中检查
        // 如果相同，那么证明已经 fire 过了，不要再次触发了
        Event_Triggered = "",
        TRIGGERED_NONE = "trigger-none-" + S.now(),
        // 事件存储位置 key
        // { handler: eventHandler, events:  {type:[{scope:scope,fn:fn}]}  } }
        EVENT_GUID = 'ksEventTargetId' + S.now();

    /**
     * @name Event
     * @namespace
     */
    var Event = {

        _clone:function(src, dest) {
            if (dest.nodeType !== DOM.ELEMENT_NODE ||
                !Event._hasData(src)) {
                return;
            }
            var eventDesc = Event._data(src),
                events = eventDesc.events;
            S.each(events, function(handlers, type) {
                S.each(handlers, function(handler) {
                    Event.on(dest, type, handler.fn, handler.scope, handler.data);
                });
            });
        },

        _hasData:function(elem) {
            return DOM.hasData(elem, EVENT_GUID);
        },

        _data:function(elem) {
            var args = makeArray(arguments);
            args.splice(1, 0, EVENT_GUID);
            return DOM.data.apply(DOM, args);
        },

        _removeData:function(elem) {
            var args = makeArray(arguments);
            args.splice(1, 0, EVENT_GUID);
            return DOM.removeData.apply(DOM, args);
        },

        // such as: { 'mouseenter' : { setup:fn ,tearDown:fn} }
        special: { },

        /**
         * Adds an event listener.
         * @param targets KISSY selector
         * @param type {String} The type of event to append.
         * @param fn {Function} The event handler.
         * @param scope {Object} (optional) The scope (this reference) in which the handler function is executed.
         */
            // data : 附加在回调后面的数据，delegate 检查使用
            // remove 时 data 相等(指向同一对象或者定义了 equals 比较函数)
        add: function(targets, type, fn, scope /* optional */, data/*internal usage*/) {
            if (batchForType('add', targets, type, fn, scope, data)) {
                return targets;
            }

            DOM.query(targets).each(function(target) {
                var isNativeEventTarget = !target.isCustomEventTarget,
                    eventDesc;

                // 不是有效的 target 或 参数不对
                if (!target ||
                    !type ||
                    !S.isFunction(fn) ||
                    (isNativeEventTarget && !isValidTarget(target))) {
                    return;
                }
                // 获取事件描述
                eventDesc = Event._data(target);
                if (!eventDesc) {
                    Event._data(target, eventDesc = {});
                }
                //事件 listeners
                var events = eventDesc.events = eventDesc.events || {},
                    handlers = events[type] = events[type] || [],
                    handleObj = {
                        fn: fn,
                        scope: scope,
                        data:data
                    },
                    eventHandler = eventDesc.handler;
                // 该元素没有 handler ，并且该元素是 dom 节点时才需要注册 dom 事件
                if (!eventHandler) {
                    eventHandler = eventDesc.handler = function(event, data) {
                        // 是经过 fire 手动调用而导致的，就不要再次触发了，已经在 fire 中 bubble 过一次了
                        if (event && event.type == Event_Triggered) {
                            return;
                        }
                        var target = eventHandler.target;
                        if (!event || !event.fixed) {
                            event = new EventObject(target, event);
                        }
                        if (S.isPlainObject(data)) {
                            S.mix(event, data);
                        }
                        return Event._handle(target, event);
                    };
                    eventHandler.target = target;
                }
                if (isNativeEventTarget) {
                    addDomEvent(target, type, eventHandler, handlers, handleObj);
                    //nullify to prevent memory leak in ie ?
                    target = null;
                }
                // 增加 listener
                handlers.push(handleObj);
            });
            return targets;
        },

        __getListeners:function(target, type) {
            var events = Event.__getEvents(target) || {};
            return events[type] || [];
        },

        __getEvents:function(target) {
            // 获取事件描述
            var eventDesc = Event._data(target);
            return eventDesc && eventDesc.events;
        },

        /**
         * Detach an event or set of events from an element.
         */
        remove: function(targets, type /* optional */, fn /* optional */, scope /* optional */, data/*internal usage*/) {
            if (batchForType('remove', targets, type, fn, scope)) {
                return targets;
            }

            DOM.query(targets).each(function(target) {
                var eventDesc = Event._data(target),
                    events = eventDesc && eventDesc.events,
                    listeners,
                    len,
                    i,
                    j,
                    t,
                    isNativeEventTarget = !target.isCustomEventTarget,
                    special = (isNativeEventTarget && Event.special[type]) || { };
                if (!target ||
                    (!isNativeEventTarget && !isValidTarget(target)) ||
                    !events) {
                    return;
                }
                // remove all types of event
                if (type === undefined) {
                    for (type in events) {
                        Event.remove.call(Event, target, type);
                    }
                    return;
                }

                scope = scope || target;

                if ((listeners = events[type])) {
                    len = listeners.length;
                    // 移除 fn
                    if (fn && len) {
                        for (i = 0,j = 0,t = []; i < len; ++i) {
                            var reserve = false,
                                listener = listeners[i],
                                listenerScope = listener.scope || target;
                            if (fn !== listener.fn
                                || scope !== listenerScope) {
                                t[j++] = listener;
                                reserve = true;
                            } else if (data !== data2) {
                                var data2 = listener.data;
                                // undelgate 不能 remove 普通 on 的 handler
                                // remove 不能 remove delegate 的 handler
                                if (!data && data2
                                    || data2 && !data
                                    ) {
                                    t[j++] = listener;
                                    reserve = true;
                                } else if (data && data2) {
                                    if (!data.equals || !data2.equals) {
                                        S.error("no equals in data");
                                    } else if (!data2.equals(data)) {
                                        t[j++] = listener;
                                        reserve = true;
                                    }
                                }
                            }
                            if (!reserve && special.remove) {
                                special.remove.call(target, listener);
                            }
                        }
                        events[type] = t;
                        len = t.length;
                    }

                    // remove(el, type) or fn 已移除光
                    if (fn === undefined || len === 0) {
                        // dom node need to detach handler from dom node
                        if (isNativeEventTarget &&
                            (!special['tearDown'] ||
                                special['tearDown'].call(target) === false)) {
                            simpleRemove(target, type, eventDesc.handler);
                        }
                        // remove target's single event description
                        delete events[type];
                    }
                }

                // remove target's  all events description
                if (S.isEmptyObject(events)) {
                    eventDesc.handler.target = null;
                    delete eventDesc.handler;
                    delete eventDesc.events;
                    Event._removeData(target);
                }
            });
            return targets;
        },

        _handle: function(target, event) {
            /* As some listeners may remove themselves from the
             event, the original array length is dynamic. So,
             let's make a copy of all listeners, so we are
             sure we'll call all of them.*/
            var listeners = Event.__getListeners(target, event.type).slice(0),
                ret,
                gRet,
                i = 0,
                len = listeners.length,
                listener;

            for (; i < len; ++i) {
                listener = listeners[i];
                ret = listener.fn.call(listener.scope || target,
                    event, listener.data);
                // 和 jQuery 逻辑保持一致

                if (ret !== undefined) {

                    // 有一个 false，最终结果就是 false
                    // 否则等于最后一个返回值
                    if (gRet !== false) {
                        gRet = ret;
                    }

                    // return false 等价 preventDefault + stopProgation
                    if (ret === false) {
                        event.halt();
                    }
                }
                if (event.isImmediatePropagationStopped) {
                    break;
                }
            }

            return gRet;
        },

        /**
         * fire event , simulate bubble in browser
         */
        fire:function(targets, eventType, eventData, onlyHandlers) {
            if (batchForType("fire", targets, eventType, eventData)) {
                return;
            }

            var ret;

            DOM.query(targets).each(function(target) {
                var isNativeEventTarget = !target.isCustomEventTarget;
                // 自定义事件很简单，不需要冒泡，不需要默认事件处理
                eventData = eventData || {};
                // protect event type
                eventData.type = eventType;
                if (!isNativeEventTarget) {
                    var eventDesc = Event._data(target);
                    if (eventDesc && S.isFunction(eventDesc.handler)) {
                        ret = eventDesc.handler(undefined, eventData);
                    }
                } else {
                    var r = fireDOMEvent(target, eventType, eventData, onlyHandlers);
                    if (r !== undefined) {
                        ret = r;
                    }
                }
            });
            return ret;
        },
        _batchForType:batchForType,
        _simpleAdd: simpleAdd,
        _simpleRemove: simpleRemove
    };

    // shorthand
    Event.on = Event.add;
    Event.detach = Event.remove;

    function batchForType(methodName, targets, types) {
        // on(target, 'click focus', fn)
        if ((types = S.trim(types)) && types.indexOf(SPACE) > 0) {
            var args = makeArray(arguments);
            S.each(types.split(SPACE), function(type) {
                var args2 = [].concat(args);
                args2.splice(0, 3, targets, type);
                Event[methodName].apply(Event, args2);
            });
            return true;
        }
        return undefined;
    }

    function isValidTarget(target) {
        // 3 - is text node
        // 8 - is comment node
        return target && target.nodeType !== 3 && target.nodeType !== 8;
    }

    /**
     * dom node need eventHandler attached to dom node
     */
    function addDomEvent(target, type, eventHandler, handlers, handleObj) {
        var special = Event.special[type] || {};
        // 第一次注册该事件，dom 节点才需要注册 dom 事件
        if (!handlers.length && (!special.setup || special.setup.call(target) === false)) {
            simpleAdd(target, type, eventHandler)
        }
        if (special.add) {
            special.add.call(target, handleObj);
        }
    }


    /**
     * fire dom event from bottom to up
     */
    function fireDOMEvent(target, eventType, eventData, onlyHandlers) {
        var ret;
        if (!isValidTarget(target)) {
            return ret;
        }
        var event = new EventObject(target);
        event.target = target;
        S.mix(event, eventData);
        // 只运行自己的绑定函数，不冒泡也不触发默认行为
        if (onlyHandlers) {
            event.stopPropagation();
            event.preventDefault();
        }
        var cur = target,
            ontype = "on" + eventType;
        //bubble up dom tree
        do{
            var handler = (Event._data(cur) || {}).handler;
            event.currentTarget = cur;
            if (handler) {
                handler.call(cur, event);
            }
            // Trigger an inline bound script
            if (cur[ ontype ] && cur[ ontype ].call(cur) === false) {
                ret = false;
                event.preventDefault();
            }
            // Bubble up to document, then to window
            cur = cur.parentNode ||
                cur.ownerDocument ||
                cur === target.ownerDocument && window;
        } while (cur && !event.isPropagationStopped);

        if (!event.isDefaultPrevented) {
            if (!(eventType === "click" && nodeName(target, "a"))) {
                var old;
                try {
                    if (ontype && target[ eventType ]) {
                        // Don't re-trigger an onFOO event when we call its FOO() method
                        old = target[ ontype ];

                        if (old) {
                            target[ ontype ] = null;
                        }
                        // 记录当前 trigger 触发
                        Event_Triggered = eventType;
                        // 只触发默认事件，而不要执行绑定的用户回调
                        // 同步触发
                        target[ eventType ]();
                    }
                } catch (ieError) {
                    S.log("trigger action error : ");
                    S.log(ieError);
                }

                if (old) {
                    target[ ontype ] = old;
                }

                Event_Triggered = TRIGGERED_NONE;
            }
        }
        return ret;
    }

    if (1 > 2) {
        Event._simpleAdd()._simpleRemove();
    }

    return Event;
}, {
    requires:["dom","event/object"]
});

/**
 * 承玉：2011-06-07
 *  - eventHandler 一个元素一个而不是一个元素一个事件一个，节省内存
 *  - 减少闭包使用，prevent ie 内存泄露？
 *  - 增加 fire ，模拟冒泡处理 dom 事件
 *  - TODO: 自定义事件和 dom 事件操作彻底分离?
 *
 */

/**
 * @module  EventTarget
 * @author  lifesinger@gmail.com , yiminghe@gmail.com
 */
KISSY.add('event/target', function(S, Event) {

    /**
     * 提供事件发布和订阅机制
     * @name Target
     * @memberOf Event
     */
    var Target =
    /**
     * @lends Event.Target
     */
    {

        isCustomEventTarget: true,

        /**
         * 触发事件
         * @param {String} type 事件名
         * @param {Object} eventData 事件附加信息对象
         * @returns 如果一个 listener 返回false，则返回 false ，否则返回最后一个 listener 的值.
         */
        fire: function(type, eventData) {
            // no chain ,need data returned
            return Event.fire(this, type, eventData);
        },

        /**
         * 监听事件
         * @param {String} type 事件名
         * @param {Function} fn 事件处理器
         * @param {Object} scope 事件处理器内的 this 值，默认当前实例
         * @returns 当前实例
         */
        on: function(type, fn, scope) {
            Event.add(this, type, fn, scope);
            return this; // chain
        },

        /**
         * 取消监听事件
         * @param {String} type 事件名
         * @param {Function} fn 事件处理器
         * @param {Object} scope 事件处理器内的 this 值，默认当前实例
         * @returns 当前实例
         */
        detach: function(type, fn, scope) {
            Event.remove(this, type, fn, scope);
            return this; // chain
        }
    };

    return Target;
}, {
    /*
     实际上只需要 dom/data ，但是不要跨模块引用另一模块的子模块，
     否则会导致build打包文件 dom 和 dom-data 重复载入
     */
    requires:["./base"]
});

/**
 * NOTES:
 *
 *  2010.04
 *   - 初始设想 api: publish, fire, on, detach. 实际实现时发现，publish 不是必须
 *     的，on 时能自动 publish. api 简化为：触发/订阅/反订阅
 *
 *   - detach 命名是因为 removeEventListener 太长，remove 则太容易冲突
 */

/**
 * @module  event-focusin
 * @author  yiminghe@gmail.com
 */
KISSY.add('event/focusin', function(S, UA, Event) {

    // 让非 IE 浏览器支持 focusin/focusout
    if (!UA['ie']) {
        S.each([
            { name: 'focusin', fix: 'focus' },
            { name: 'focusout', fix: 'blur' }
        ], function(o) {
            var attaches = 0;
            Event.special[o.name] = {
                // 统一在 document 上 capture focus/blur 事件，然后模拟冒泡 fire 出来
                // 达到和 focusin 一样的效果 focusin -> focus
                // refer: http://yiminghe.iteye.com/blog/813255
                setup: function() {
                    if (attaches++ === 0) {
                        document.addEventListener(o.fix, handler, true);
                    }
                },

                tearDown:function() {
                    if (--attaches === 0) {
                        document.removeEventListener(o.fix, handler, true);
                    }
                }
            };

            function handler(event) {
                var target = event.target;
                return Event.fire(target, o.name);
            }

        });
    }
    return Event;
}, {
    requires:["ua","./base"]
});

/**
 * 承玉:2011-06-07
 * - refactor to jquery , 更加合理的模拟冒泡顺序，子元素先出触发，父元素后触发
 *
 * NOTES:
 *  - webkit 和 opera 已支持 DOMFocusIn/DOMFocusOut 事件，但上面的写法已经能达到预期效果，暂时不考虑原生支持。
 */

/**
 * @module  event-hashchange
 * @author  yiminghe@gmail.com , xiaomacji@gmail.com
 */
KISSY.add('event/hashchange', function(S, Event, DOM, UA) {

    var ie = docMode || UA['ie'],
        HASH_CHANGE = 'hashchange';

    // IE8以上切换浏览器模式到IE7，会导致 'onhashchange' in window === true
    // 1. 不支持 hashchange 事件，支持 hash 导航(opera??)：定时器监控
    // 2. 不支持 hashchange 事件，不支持 hash 导航(ie67) : iframe + 定时器
    if ((!( 'on' + HASH_CHANGE in window)) || ie < 8) {

        var POLL_INTERVAL = 50,
            doc = document,
            win = window,
            docMode = doc['documentMode'],
            getHash = function() {
                // ie 返回 "" ，其他返回 "#"
                // return location.hash ?
                var url = location.href;
                return '#' + url.replace(/^[^#]*#?(.*)$/, '$1');
            },
            timer,

            lastHash = getHash(),

            poll = function () {
                var hash = getHash();
                if (hash !== lastHash) {
                    hashChange(hash);
                    lastHash = hash;
                }
                timer = setTimeout(poll, POLL_INTERVAL);
            },

            hashChange = ie < 8 ? function(hash) {
                //debugger
                var html = '<html><body>' + hash + '<' + '/body><' + '/html>',
                    doc = iframe.contentWindow.document;
                try {
                    // 写入历史 hash
                    doc.open();
                    doc.write(html);
                    doc.close();
                    return true;
                } catch (e) {
                    S.log('doc write error : ');
                    S.log(e);
                    return false;
                }
            } : function () {
                notifyHashChange();
            },

            notifyHashChange = function () {
                //S.log("hash changed : " + hash);
                Event.fire(win, HASH_CHANGE);
            },
            setup = function () {
                if (!timer) {
                    poll();
                }
            },
            tearDown = function () {
                timer && clearTimeout(timer);
                timer = null;
            },
            iframe;

        // ie6, 7, 覆盖一些function
        if (ie < 8) {

            /**
             * 前进后退 : start -> notifyHashChange
             * 直接输入 : poll -> hashChange -> start
             * iframe 内容和 url 同步
             */
            setup = function() {
                if (!iframe) {
                    //http://www.paciellogroup.com/blog/?p=604
                    iframe = DOM.create('<iframe ' +
                        //'src="#" ' +
                        'style="display: none" ' +
                        'height="0" ' +
                        'width="0" ' +
                        'tabindex="-1" ' +
                        'title="empty"/>');
                    // Append the iframe to the documentElement rather than the body.
                    // Keeping it outside the body prevents scrolling on the initial
                    // page load
                    DOM.prepend(iframe, document.documentElement);

                    // init，第一次触发，以后都是 start
                    Event.add(iframe, "load", function() {
                        Event.remove(iframe, "load");
                        // Update the iframe with the initial location hash, if any. This
                        // will create an initial history entry that the user can return to
                        // after the state has changed.
                        hashChange(getHash());
                        Event.add(iframe, "load", start);
                        poll();
                    });

                    /**
                     * 前进后退 ： start -> 触发
                     * 直接输入 : timer -> hashChange -> start -> 触发
                     * 触发统一在 start(load)
                     * iframe 内容和 url 同步
                     */
                        //后退触发点
                        //或addHistory 调用
                        //只有 start 来通知应用程序
                    function start() {
                        //S.log('iframe start load..');
                        //debugger
                        var c = S.trim(DOM.html(iframe.contentWindow.document.body));
                        var ch = getHash();

                        //后退时不等
                        //改变location则相等
                        if (c != ch) {
                            location.hash = c;
                            // 使lasthash为iframe历史， 不然重新写iframe， 会导致最新状态（丢失前进状态）
                            lastHash = c;
                        }
                        notifyHashChange();
                    }
                }
            };

            tearDown = function() {
                timer && clearTimeout(timer);
                timer = null;
                Event.detach(iframe);
                DOM.remove(iframe);
                iframe = null;
            };
        }

        Event.special[HASH_CHANGE] = {
            setup: function() {
                if (this !== win) {
                    return;
                }
                // 不用注册 dom 事件
                setup();
            },
            tearDown: function() {
                if (this !== win) {
                    return;
                }
                tearDown();
            }
        };
    }
}, {
    requires:["./base","dom","ua"]
});

/**
 * 已知 bug :
 * - ie67 有时后退后取得的 location.hash 不和地址栏一致，导致必须后退两次才能触发 hashchange
 *
 * v1 : 2010-12-29
 * v1.1: 支持非IE，但不支持onhashchange事件的浏览器(例如低版本的firefox、safari)
 * refer : http://yiminghe.javaeye.com/blog/377867
 *         https://github.com/cowboy/jquery-hashchange
 */

/**
 * inspired by yui3 :
 *
 * Synthetic event that fires when the <code>value</code> property of an input
 * field or textarea changes as a result of a keystroke, mouse operation, or
 * input method editor (IME) input event.
 *
 * Unlike the <code>onchange</code> event, this event fires when the value
 * actually changes and not when the element loses focus. This event also
 * reports IME and multi-stroke input more reliably than <code>oninput</code> or
 * the various key events across browsers.
 *
 * @author yiminghe@gmail.com
 */
KISSY.add('event/valuechange', function(S, Event, DOM) {
    var VALUE_CHANGE = "valuechange",
        nodeName = DOM._nodeName,
        KEY = "event/valuechange",
        HISTORY_KEY = KEY + "/history",
        POLL_KEY = KEY + "/poll",
        interval = 50;

    function stopPoll(target) {
        DOM.removeData(target, HISTORY_KEY);
        if (DOM.hasData(target, POLL_KEY)) {
            var poll = DOM.data(target, POLL_KEY);
            clearTimeout(poll);
            DOM.removeData(target, POLL_KEY);
        }
    }

    function stopPollHandler(ev) {
        var target = ev.target;
        stopPoll(target);
    }

    function startPoll(target) {
        if (DOM.hasData(target, POLL_KEY)) return;
        DOM.data(target, POLL_KEY, setTimeout(function() {
            var v = target.value,h = DOM.data(target, HISTORY_KEY);
            if (v !== h) {
                // 只触发自己绑定的 handler
                Event.fire(target, VALUE_CHANGE, {
                    prevVal:h,
                    newVal:v
                }, true);
                DOM.data(target, HISTORY_KEY, v);
            }
            DOM.data(target, POLL_KEY, setTimeout(arguments.callee, interval));
        }, interval));
    }

    function startPollHandler(ev) {
        var target = ev.target;
        // when focus ,record its current value immediately
        if (ev.type == "focus") {
            DOM.data(target, HISTORY_KEY, target.value);
        }
        startPoll(target);
    }

    function monitor(target) {
        unmonitored(target);
        Event.on(target, "blur", stopPollHandler);
        Event.on(target, "mousedown keyup keydown focus", startPollHandler);
    }

    function unmonitored(target) {
        stopPoll(target);
        Event.remove(target, "blur", stopPollHandler);
        Event.remove(target, "mousedown keyup keydown focus", startPollHandler);
    }

    Event.special[VALUE_CHANGE] = {
        setup: function() {
            var target = this;
            if (nodeName(target, "input")
                || nodeName(target, "textarea")) {
                monitor(target);
            }
        },
        tearDown: function() {
            var target = this;
            unmonitored(target);
        }
    };
    return Event;
}, {
    requires:["./base","dom"]
});

/**
 * kissy delegate for event module
 * @author yiminghe@gmail.com
 */
KISSY.add("event/delegate", function(S, DOM, Event) {
    var batchForType = Event._batchForType,
        delegateMap = {
            "focus":{
                type:"focusin"
            },
            "blur":{
                type:"focusout"
            },
            "mouseenter":{
                type:"mouseover",
                handler:mouseHandler
            },
            "mouseleave":{
                type:"mouseout",
                handler:mouseHandler
            }
        };

    S.mix(Event, {
        delegate:function(targets, type, selector, fn, scope) {
            if (batchForType('delegate', targets, type, selector, fn, scope)) {
                return targets;
            }
            DOM.query(targets).each(function(target) {
                // 自定义事件 delegate 无意义
                if (target.isCustomEventTarget) {
                    return;
                }
                var preType = type,handler = delegateHandler;
                if (delegateMap[type]) {
                    type = delegateMap[preType].type;
                    handler = delegateMap[preType].handler || handler;
                }
                Event.on(target, type, handler, target, {
                    fn:fn,
                    selector:selector,
                    preType:preType,
                    scope:scope,
                    equals:equals
                });
            });
            return targets;
        },

        undelegate:function(targets, type, selector, fn, scope) {
            if (batchForType('undelegate', targets, type, selector, fn, scope)) {
                return targets;
            }
            DOM.query(targets).each(function(target) {
                // 自定义事件 delegate 无意义
                if (target.isCustomEventTarget) {
                    return;
                }
                var preType = type,handler = delegateHandler;
                if (delegateMap[type]) {
                    type = delegateMap[preType].type;
                    handler = delegateMap[preType].handler || handler;
                }
                Event.remove(target, type, handler, target, {
                    fn:fn,
                    selector:selector,
                    preType:preType,
                    scope:scope,
                    equals:equals
                });
            });
            return targets;
        }
    });

    // 比较函数，两个 delegate 描述对象比较
    function equals(d) {
        if (d.fn === undefined && d.selector === undefined) {
            return true;
        } else if (d.fn === undefined) {
            return this.selector == d.selector;
        } else {
            return this.fn == d.fn && this.selector == d.selector && this.scope == d.scope;
        }
    }

    // 根据 selector ，从事件源得到对应节点
    function delegateHandler(event, data) {
        var delegateTarget = this,
            target = event.target,
            invokeds = DOM.closest(target, [data.selector], delegateTarget);

        // 找到了符合 selector 的元素，可能并不是事件源
        return invokes.call(delegateTarget, invokeds, event, data);
    }

    // mouseenter/leave 特殊处理
    function mouseHandler(event, data) {
        var delegateTarget = this,
            target = event.target,
            relatedTarget = event.relatedTarget;
        // 恢复为用户想要的 mouseenter/leave 类型
        event.type = data.preType;
        // mouseenter/leave 不会冒泡，只选择最近一个
        target = DOM.closest(target, data.selector, delegateTarget);
        if (target) {
            if (target !== relatedTarget &&
                (!relatedTarget || !DOM.contains(target, relatedTarget))
                ) {
                event.currentTarget = target;
                return data.fn.call(data.scope || delegateTarget, event);
            }
        }
        return undefined;
    }


    function invokes(invokeds, event, data) {
        var delegateTarget = this,
            gret;
        if (invokeds) {
            for (var i = 0; i < invokeds.length; i++) {
                event.currentTarget = invokeds[i];
                var ret = data.fn.call(data.scope || delegateTarget, event);
                if (ret === false ||
                    event.isPropagationStopped ||
                    event.isImmediatePropagationStopped) {
                    if (ret === false) {
                        gret = ret;
                    }
                    if (event.isPropagationStopped ||
                        event.isImmediatePropagationStopped) {
                        break;
                    }
                }
            }
        }
        return gret;
    }

    return Event;
}, {
    requires:["dom","./base"]
});

/**
 * focusin/out 的特殊之处 , delegate 只能在容器上注册 focusin/out ，
 * 1.其实非 ie 都是注册 focus capture=true，然后注册到 focusin 对应 handlers
 *   1.1 当 Event.fire("focus")，没有 focus 对应的 handlers 数组，然后调用元素 focus 方法，
 *   focusin.js 调用 Event.fire("focusin") 进而执行 focusin 对应的 handlers 数组
 *   1.2 当调用 Event.fire("focusin")，直接执行 focusin 对应的 handlers 数组，但不会真正聚焦
 *
 * 2.ie 直接注册 focusin , focusin handlers 也有对应用户回调
 *   2.1 当 Event.fire("focus") , 同 1.1
 *   2.2 当 Event.fire("focusin"),直接执行 focusin 对应的 handlers 数组，但不会真正聚焦
 *
 * mouseenter/leave delegate 特殊处理， mouseenter 没有冒泡的概念，只能替换为 mouseover/out
 *
 * form submit 事件 ie<9 不会冒泡
 *
 **/

/**
 * @module  event-mouseenter
 * @author  lifesinger@gmail.com , yiminghe@gmail.com
 */
KISSY.add('event/mouseenter', function(S, Event, DOM, UA) {

    if (!UA['ie']) {
        S.each([
            { name: 'mouseenter', fix: 'mouseover' },
            { name: 'mouseleave', fix: 'mouseout' }
        ], function(o) {


            // 元素内触发的 mouseover/out 不能算 mouseenter/leave
            function withinElement(event) {

                var self = this,
                    parent = event.relatedTarget;

                // 设置用户实际注册的事件名，触发该事件所对应的 listener 数组
                event.type = o.name;

                // Firefox sometimes assigns relatedTarget a XUL element
                // which we cannot access the parentNode property of
                try {

                    // Chrome does something similar, the parentNode property
                    // can be accessed but is null.
                    if (parent && parent !== document && !parent.parentNode) {
                        return;
                    }

                    // 在自身外边就触发
                    if (parent !== self &&
                        // self==document , parent==null
                        (!parent || !DOM.contains(self, parent))
                        ) {
                        // handle event if we actually just moused on to a non sub-element
                        Event._handle(self, event);
                    }

                    // assuming we've left the element since we most likely mousedover a xul element
                } catch(e) {
                    S.log("withinElement error : " + e);
                }
            }


            Event.special[o.name] = {

                // 第一次 mouseenter 时注册下
                // 以后都直接放到 listener 数组里， 由 mouseover 读取触发
                setup: function() {
                    Event.add(this, o.fix, withinElement);
                },

                //当 listener 数组为空时，也清掉 mouseover 注册，不再读取
                tearDown:function() {
                    Event.remove(this, o.fix, withinElement);
                }
            }
        });
    }

    return Event;
}, {
    requires:["./base","dom","ua"]
});

/**
 * 承玉：2011-06-07
 * - 根据新结构，调整 mouseenter 兼容处理
 * - fire('mouseenter') 可以的，直接执行 mouseenter 的 handlers 用户回调数组
 *
 *
 * TODO:
 *  - ie6 下，原生的 mouseenter/leave 貌似也有 bug, 比如 <div><div /><div /><div /></div>
 *    jQuery 也异常，需要进一步研究
 */

/**
 * patch for ie<9 submit : does not bubble !
 * @author yiminghe@gmail.com
 */
KISSY.add("event/submit", function(S, UA, Event, DOM) {
    var mode = document['documentMode'];
    if (UA['ie'] && (UA['ie'] < 9 || (mode && mode < 9))) {
        var nodeName = DOM._nodeName;
        Event.special['submit'] = {
            setup: function() {
                var el = this;
                // form use native
                if (nodeName(el, "form")) {
                    return false;
                }
                // lazy add submit for inside forms
                // note event order : click/keypress -> submit
                // keypoint : find the forms
                Event.on(el, "click keypress", detector);
            },
            tearDown:function() {
                var el = this;
                // form use native
                if (nodeName(el, "form")) {
                    return false;
                }
                Event.remove(el, "click keypress", detector);
                DOM.query("form", el).each(function(form) {
                    if (form.__submit__fix) {
                        form.__submit__fix = 0;
                        Event.remove(form, "submit", submitBubble);
                    }
                });
            }
        };


        function detector(e) {
            var t = e.target,
                form = nodeName(t, "input") || nodeName(t, "button") ? t.form : null;

            if (form && !form.__submit__fix) {
                form.__submit__fix = 1;
                Event.on(form, "submit", submitBubble);
            }
        }

        function submitBubble(e) {
            var form = this;
            if (form.parentNode) {
                // simulated bubble for submit
                // fire from parentNode. if form.on("submit") , this logic is never run!
                Event.fire(form.parentNode, "submit", e);
            }
        }


    }

}, {
    requires:["ua","./base","dom"]
});
/**
 * modified from jq ,fix submit in ie<9
 **/

/**
 * change bubble and checkbox/radio fix patch for ie<9
 * @author yiminghe@gmail.com
 */
KISSY.add("event/change", function(S, UA, Event, DOM) {
    var mode = document['documentMode'];

    if (UA['ie'] && (UA['ie'] < 9 || (mode && mode < 9))) {

        var rformElems = /^(?:textarea|input|select)$/i;

        function isFormElement(n) {
            return rformElems.test(n.nodeName);
        }

        function isCheckBoxOrRadio(el) {
            var type = el.type;
            return type == "checkbox" || type == "radio";
        }

        Event.special['change'] = {
            setup: function() {
                var el = this;
                if (isFormElement(el)) {
                    // checkbox/radio only fires change when blur in ie<9
                    // so use another technique from jquery
                    if (isCheckBoxOrRadio(el)) {
                        // change in ie<9
                        // change = propertychange -> click
                        Event.on(el, "propertychange", propertyChange);
                        Event.on(el, "click", onClick);
                    } else {
                        // other form elements use native , do not bubble
                        return false;
                    }
                } else {
                    // if bind on parentNode ,lazy bind change event to its form elements
                    // note event order : beforeactivate -> change
                    // note 2: checkbox/radio is exceptional
                    Event.on(el, "beforeactivate", beforeActivate);
                }
            },
            tearDown:function() {
                var el = this;
                if (isFormElement(el)) {
                    if (isCheckBoxOrRadio(el)) {
                        Event.remove(el, "propertychange", propertyChange);
                        Event.remove(el, "click", onClick);
                    } else {
                        return false;
                    }
                } else {
                    Event.remove(el, "beforeactivate", beforeActivate);
                    DOM.query("textarea,input,select", el).each(function(fel) {
                        if (fel.__changeHandler) {
                            fel.__changeHandler = 0;
                            Event.remove(fel, "change", changeHandler);
                        }
                    });
                }
            }
        };

        function propertyChange(e) {
            if (e.originalEvent.propertyName == "checked") {
                this.__changed = 1;
            }
        }

        function onClick(e) {
            if (this.__changed) {
                this.__changed = 0;
                // fire from itself
                Event.fire(this, "change", e);
            }
        }

        function beforeActivate(e) {
            var t = e.target;
            if (isFormElement(t) && !t.__changeHandler) {
                t.__changeHandler = 1;
                // lazy bind change
                Event.on(t, "change", changeHandler);
            }
        }

        function changeHandler(e) {
            var fel = this;
            // checkbox/radio already bubble using another technique
            if (isCheckBoxOrRadio(fel)) {
                return;
            }
            var p;
            if (p = fel.parentNode) {
                // fire from parent , itself is handled natively
                Event.fire(p, "change", e);
            }
        }

    }
}, {
    requires:["ua","./base","dom"]
});

KISSY.add("event", function(S, KeyCodes, Event, Target, Object) {
    Event.KeyCodes = KeyCodes;
    Event.Target = Target;
    Event.Object = Object;
    return Event;
}, {
    requires:[
        "event/keycodes",
        "event/base",
        "event/target",
        "event/object",
        "event/focusin",
        "event/hashchange",
        "event/valuechange",
        "event/delegate",
        "event/mouseenter",
        "event/submit",
        "event/change"
    ]
});

/**
 * definition for node and nodelist
 * @author lifesinger@gmail.com,yiminghe@gmail.com
 */
KISSY.add("node/base", function(S, DOM, undefined) {

    var AP = Array.prototype,
        makeArray = S.makeArray,
        isNodeList = DOM._isNodeList;

    /**
     * The NodeList class provides a wrapper for manipulating DOM Node.
     * @constructor
     */
    function NodeList(html, props, ownerDocument) {
        var self = this,domNode;

        if (!(self instanceof NodeList)) {
            return new NodeList(html, props, ownerDocument);
        }

        // handle NodeList(''), NodeList(null), or NodeList(undefined)
        if (!html) {
            return undefined;
        }

        else if (S.isString(html)) {
            // create from html
            domNode = DOM.create(html, props, ownerDocument);
            // ('<p>1</p><p>2</p>') 转换为 NodeList
            if (domNode.nodeType === DOM.DOCUMENT_FRAGMENT_NODE) { // fragment
                AP.push.apply(this, makeArray(domNode.childNodes));
                return undefined;
            }
        }

        else if (S.isArray(html) || isNodeList(html)) {
            AP.push.apply(this, makeArray(html));
            return undefined;
        }

        else {
            // node, document, window
            domNode = html;
        }

        self[0] = domNode;
        self.length = 1;
        return undefined;
    }

    S.augment(NodeList, {

        /**
         * 默认长度为 0
         */
        length: 0,


        item: function(index) {
            var self = this;
            if (S.isNumber(index)) {
                if (index >= self.length) {
                    return null;
                } else {
                    return new NodeList(self[index]);
                }
            } else {
                return new NodeList(index);
            }
        },

        add:function(selector, context, index) {
            if (S.isNumber(context)) {
                index = context;
                context = undefined;
            }
            var list = NodeList.all(selector, context).getDOMNodes(),
                ret = new NodeList(this);
            if (index === undefined) {
                AP.push.apply(ret, list);
            } else {
                var args = [index,0];
                args.push.apply(args, list);
                AP.splice.apply(ret, args);
            }
            return ret;
        },

        slice:function(start, end) {
            return new NodeList(AP.slice.call(this, start, end));
        },

        /**
         * Retrieves the DOMNodes.
         */
        getDOMNodes: function() {
            return AP.slice.call(this);
        },

        /**
         * Applies the given function to each Node in the NodeList.
         * @param fn The function to apply. It receives 3 arguments: the current node instance, the node's index, and the NodeList instance
         * @param context An optional context to apply the function with Default context is the current NodeList instance
         */
        each: function(fn, context) {
            var self = this,len = self.length, i = 0, node;

            for (node = new NodeList(self[0]);
                 i < len && fn.call(context || node, node, i, self) !== false;
                 node = new NodeList(self[++i])) {
            }

            return this;
        },
        /**
         * Retrieves the DOMNode.
         */
        getDOMNode: function() {
            return this[0];
        },

        /**
         * stack sub query
         */
        end:function() {
            var self = this;
            return self.__parent || self;
        },

        all:function(selector) {
            var ret,self = this;
            if (self.length > 0) {
                ret = NodeList.all(selector, self);
            } else {
                ret = new NodeList();
            }
            ret.__parent = self;
            return ret;
        },

        one:function(selector) {
            var self = this,all = self.all(selector),
                ret = all.length ? all.slice(0, 1) : null;
            if (ret) {
                ret.__parent = self;
            }
            return ret;
        }
    });

    S.mix(NodeList, {

        /**
         * enumeration of dom node type
         */
        ELEMENT_NODE : DOM.ELEMENT_NODE,
        ATTRIBUTE_NODE : DOM.ATTRIBUTE_NODE,
        TEXT_NODE:DOM.TEXT_NODE,
        CDATA_SECTION_NODE : DOM.CDATA_SECTION_NODE,
        ENTITY_REFERENCE_NODE: DOM.ENTITY_REFERENCE_NODE,
        ENTITY_NODE : DOM.ENTITY_NODE,
        PROCESSING_INSTRUCTION_NODE :DOM.PROCESSING_INSTRUCTION_NODE,
        COMMENT_NODE : DOM.COMMENT_NODE,
        DOCUMENT_NODE : DOM.DOCUMENT_NODE,
        DOCUMENT_TYPE_NODE : DOM.DOCUMENT_TYPE_NODE,
        DOCUMENT_FRAGMENT_NODE : DOM.DOCUMENT_FRAGMENT_NODE,
        NOTATION_NODE : DOM.NOTATION_NODE,

        /**
         * 查找位于上下文中并且符合选择器定义的节点列表或根据 html 生成新节点
         * @param {String|HTMLElement[]|NodeList} selector html 字符串或<a href='http://docs.kissyui.com/docs/html/api/core/dom/selector.html'>选择器</a>或节点列表
         * @param {String|Array<HTMLElement>|NodeList|HTMLElement|Document} [context] 上下文定义
         * @returns {NodeList} 节点列表对象
         */
        all:function(selector, context) {
            // are we dealing with html string ?
            // TextNode 仍需要自己 new Node

            if (S.isString(selector)
                && (selector = S.trim(selector))
                && selector.length >= 3
                && S.startsWith(selector, "<")
                && S.endsWith(selector, ">")
                ) {
                if (context) {
                    if (context.getDOMNode) {
                        context = context.getDOMNode();
                    }
                    if (context.ownerDocument) {
                        context = context.ownerDocument;
                    }
                }
                return new NodeList(selector, undefined, context);
            }
            return new NodeList(DOM.query(selector, context));
        },
        one:function(selector, context) {
            var all = NodeList.all(selector, context);
            return all.length ? all.slice(0, 1) : null;
        }
    });

    return NodeList;
}, {
    requires:["dom"]
});


/**
 * Notes:
 * 2011-05-25
 *  - 承玉：参考 jquery，只有一个 NodeList 对象，Node 就是 NodeList 的别名
 *
 *  2010.04
 *   - each 方法传给 fn 的 this, 在 jQuery 里指向原生对象，这样可以避免性能问题。
 *     但从用户角度讲，this 的第一直觉是 $(this), kissy 和 yui3 保持一致，牺牲
 *     性能，以易用为首。
 *   - 有了 each 方法，似乎不再需要 import 所有 dom 方法，意义不大。
 *   - dom 是低级 api, node 是中级 api, 这是分层的一个原因。还有一个原因是，如果
 *     直接在 node 里实现 dom 方法，则不大好将 dom 的方法耦合到 nodelist 里。可
 *     以说，技术成本会制约 api 设计。
 */

/**
 * import methods from DOM to NodeList.prototype
 * @author  yiminghe@gmail.com
 */
KISSY.add('node/attach', function(S, DOM, Event, NodeList, undefined) {

    var NLP = NodeList.prototype,
        makeArray = S.makeArray,
        // DOM 添加到 NP 上的方法
        // if DOM methods return undefined , Node methods need to transform result to itself
        DOM_INCLUDES_NORM = [
            "equals",
            "contains",
            "scrollTop",
            "scrollLeft",
            "height",
            "width",
            "innerHeight",
            "innerWidth",
            "outerHeight",
            "outerWidth",
            "addStyleSheet",
            // "append" will be overridden
            "appendTo",
            // "prepend" will be overridden
            "prependTo",
            "insertBefore",
            "before",
            "after",
            "insertAfter",
            "test",
            "hasClass",
            "addClass",
            "removeClass",
            "replaceClass",
            "toggleClass",
            "removeAttr",
            "hasAttr",
            "hasProp",
            // anim override
//            "show",
//            "hide",
//            "toggle",
            "scrollIntoView",
            "remove",
            "empty",
            "removeData",
            "hasData",
            "unselectable"
        ],
        // if return array ,need transform to nodelist
        DOM_INCLUDES_NORM_NODE_LIST = [
            "filter",
            "first",
            "parent",
            "closest",
            "next",
            "prev",
            "clone",
            "siblings",
            "children"
        ],
        // if set return this else if get return true value ,no nodelist transform
        DOM_INCLUDES_NORM_IF = {
            // dom method : set parameter index
            "attr":1,
            "text":0,
            "css":1,
            "style":1,
            "val":0,
            "prop":1,
            "offset":0,
            "html":0,
            "data":1
        },
        // Event 添加到 NP 上的方法
        EVENT_INCLUDES = ["on","detach","fire","delegate","undelegate"];


    function accessNorm(fn, self, args) {
        args.unshift(self);
        var ret = DOM[fn].apply(DOM, args);
        if (ret === undefined) {
            return self;
        }
        return ret;
    }

    function accessNormList(fn, self, args) {
        args.unshift(self);
        var ret = DOM[fn].apply(DOM, args);
        if (ret === undefined) {
            return self;
        }
        else if (ret === null) {
            return null;
        }
        return new NodeList(ret);
    }

    function accessNormIf(fn, self, index, args) {

        // get
        if (args[index] === undefined
            // 并且第一个参数不是对象，否则可能是批量设置写
            && !S.isObject(args[0])) {
            args.unshift(self);
            return DOM[fn].apply(DOM, args);
        }
        // set
        return accessNorm(fn, self, args);
    }

    S.each(DOM_INCLUDES_NORM, function(k) {
        NLP[k] = function() {
            var args = makeArray(arguments);
            return accessNorm(k, this, args);
        };
    });

    S.each(DOM_INCLUDES_NORM_NODE_LIST, function(k) {
        NLP[k] = function() {
            var args = makeArray(arguments);
            return accessNormList(k, this, args);
        };
    });

    S.each(DOM_INCLUDES_NORM_IF, function(index, k) {
        NLP[k] = function() {
            var args = makeArray(arguments);
            return accessNormIf(k, this, index, args);
        };
    });

    S.each(EVENT_INCLUDES, function(k) {
        NLP[k] = function() {
            var args = makeArray(arguments);
            args.unshift(this);
            return Event[k].apply(Event, args);
        }
    });

}, {
    requires:["dom","event","./base"]
});

/**
 * 2011-05-24
 *  - 承玉：
 *  - 将 DOM 中的方法包装成 NodeList 方法
 *  - Node 方法调用参数中的 KISSY NodeList 要转换成第一个 HTML Node
 *  - 要注意链式调用，如果 DOM 方法返回 undefined （无返回值），则 NodeList 对应方法返回 this
 *  - 实际上可以完全使用 NodeList 来代替 DOM，不和节点关联的方法如：viewportHeight 等，在 window，document 上调用
 *  - 存在 window/document 虚节点，通过 S.one(window)/new Node(window) ,S.one(document)/new NodeList(document) 获得
 */

/**
 * overrides methods in NodeList.prototype
 * @author yiminghe@gmail.com
 */
KISSY.add("node/override", function(S, DOM, Event, NodeList) {

    /**
     * append(node ,parent) : 参数顺序反过来了
     * appendTo(parent,node) : 才是正常
     *
     */
    S.each(['append', 'prepend','before','after'], function(insertType) {

        NodeList.prototype[insertType] = function(html) {

            var newNode = html,self = this;
            // 创建
            if (S.isString(newNode)) {
                newNode = DOM.create(newNode);
            }
            if (newNode) {
                DOM[insertType](newNode, self);
            }
            return self;

        };
    });

}, {
    requires:["dom","event","./base","./attach"]
});

/**
 * 2011-05-24
 * - 承玉：
 * - 重写 NodeList 的某些方法
 * - 添加 one ,all ，从当前 NodeList 往下开始选择节点
 * - 处理 append ,prepend 和 DOM 的参数实际上是反过来的
 * - append/prepend 参数是节点时，如果当前 NodeList 数量 > 1 需要经过 clone，因为同一节点不可能被添加到多个节点中去（NodeList）
 */

/**
 * @module anim-easing
 */
KISSY.add('anim/easing', function() {

    // Based on Easing Equations (c) 2003 Robert Penner, all rights reserved.
    // This work is subject to the terms in http://www.robertpenner.com/easing_terms_of_use.html
    // Preview: http://www.robertpenner.com/easing/easing_demo.html

    /**
     * 和 YUI 的 Easing 相比，S.Easing 进行了归一化处理，参数调整为：
     * @param {Number} t Time value used to compute current value  保留 0 =< t <= 1
     * @param {Number} b Starting value  b = 0
     * @param {Number} c Delta between start and end values  c = 1
     * @param {Number} d Total length of animation d = 1
     */

    var PI = Math.PI,
        pow = Math.pow,
        sin = Math.sin,
        BACK_CONST = 1.70158,

        Easing = {

            /**
             * Uniform speed between points.
             */
            easeNone: function (t) {
                return t;
            },

            /**
             * Begins slowly and accelerates towards end. (quadratic)
             */
            easeIn: function (t) {
                return t * t;
            },

            /**
             * Begins quickly and decelerates towards end.  (quadratic)
             */
            easeOut: function (t) {
                return ( 2 - t) * t;
            },

            /**
             * Begins slowly and decelerates towards end. (quadratic)
             */
            easeBoth: function (t) {
                return (t *= 2) < 1 ?
                    .5 * t * t :
                    .5 * (1 - (--t) * (t - 2));
            },

            /**
             * Begins slowly and accelerates towards end. (quartic)
             */
            easeInStrong: function (t) {
                return t * t * t * t;
            },

            /**
             * Begins quickly and decelerates towards end.  (quartic)
             */
            easeOutStrong: function (t) {
                return 1 - (--t) * t * t * t;
            },

            /**
             * Begins slowly and decelerates towards end. (quartic)
             */
            easeBothStrong: function (t) {
                return (t *= 2) < 1 ?
                    .5 * t * t * t * t :
                    .5 * (2 - (t -= 2) * t * t * t);
            },

            /**
             * Snap in elastic effect.
             */

            elasticIn: function (t) {
                var p = .3, s = p / 4;
                if (t === 0 || t === 1) return t;
                return -(pow(2, 10 * (t -= 1)) * sin((t - s) * (2 * PI) / p));
            },

            /**
             * Snap out elastic effect.
             */
            elasticOut: function (t) {
                var p = .3, s = p / 4;
                if (t === 0 || t === 1) return t;
                return pow(2, -10 * t) * sin((t - s) * (2 * PI) / p) + 1;
            },

            /**
             * Snap both elastic effect.
             */
            elasticBoth: function (t) {
                var p = .45, s = p / 4;
                if (t === 0 || (t *= 2) === 2) return t;

                if (t < 1) {
                    return -.5 * (pow(2, 10 * (t -= 1)) *
                        sin((t - s) * (2 * PI) / p));
                }
                return pow(2, -10 * (t -= 1)) *
                    sin((t - s) * (2 * PI) / p) * .5 + 1;
            },

            /**
             * Backtracks slightly, then reverses direction and moves to end.
             */
            backIn: function (t) {
                if (t === 1) t -= .001;
                return t * t * ((BACK_CONST + 1) * t - BACK_CONST);
            },

            /**
             * Overshoots end, then reverses and comes back to end.
             */
            backOut: function (t) {
                return (t -= 1) * t * ((BACK_CONST + 1) * t + BACK_CONST) + 1;
            },

            /**
             * Backtracks slightly, then reverses direction, overshoots end,
             * then reverses and comes back to end.
             */
            backBoth: function (t) {
                if ((t *= 2 ) < 1) {
                    return .5 * (t * t * (((BACK_CONST *= (1.525)) + 1) * t - BACK_CONST));
                }
                return .5 * ((t -= 2) * t * (((BACK_CONST *= (1.525)) + 1) * t + BACK_CONST) + 2);
            },

            /**
             * Bounce off of start.
             */
            bounceIn: function (t) {
                return 1 - Easing.bounceOut(1 - t);
            },

            /**
             * Bounces off end.
             */
            bounceOut: function (t) {
                var s = 7.5625, r;

                if (t < (1 / 2.75)) {
                    r = s * t * t;
                }
                else if (t < (2 / 2.75)) {
                    r = s * (t -= (1.5 / 2.75)) * t + .75;
                }
                else if (t < (2.5 / 2.75)) {
                    r = s * (t -= (2.25 / 2.75)) * t + .9375;
                }
                else {
                    r = s * (t -= (2.625 / 2.75)) * t + .984375;
                }

                return r;
            },

            /**
             * Bounces off start and end.
             */
            bounceBoth: function (t) {
                if (t < .5) {
                    return Easing.bounceIn(t * 2) * .5;
                }
                return Easing.bounceOut(t * 2 - 1) * .5 + .5;
            }
        };

    Easing.NativeTimeFunction = {
        easeNone: 'linear',
        ease: 'ease',

        easeIn: 'ease-in',
        easeOut: 'ease-out',
        easeBoth: 'ease-in-out',

        // Ref:
        //  1. http://www.w3.org/TR/css3-transitions/#transition-timing-function_tag
        //  2. http://www.robertpenner.com/easing/easing_demo.html
        //  3. assets/cubic-bezier-timing-function.html
        // 注：是模拟值，非精确推导值
        easeInStrong: 'cubic-bezier(0.9, 0.0, 0.9, 0.5)',
        easeOutStrong: 'cubic-bezier(0.1, 0.5, 0.1, 1.0)',
        easeBothStrong: 'cubic-bezier(0.9, 0.0, 0.1, 1.0)'
    };

    return Easing;
});

/**
 * TODO:
 *  - test-easing.html 详细的测试 + 曲线可视化
 *
 * NOTES:
 *  - 综合比较 jQuery UI/scripty2/YUI 的 easing 命名，还是觉得 YUI 的对用户
 *    最友好。因此这次完全照搬 YUI 的 Easing, 只是代码上做了点压缩优化。
 *
 */

/**
 * single timer for the whole anim module
 * @author  yiminghe@gmail.com
 */
KISSY.add("anim/manager", function(S) {
    var tag = S.guid("anim-");

    function getKv(anim) {
        anim[tag] = anim[tag] || S.guid("anim-");
        return anim[tag];
    }

    return {
        interval:20,
        runnings:{},
        timer:null,
        start:function(anim) {
            var kv = getKv(anim);
            if (this.runnings[kv]) {
                return;
            }
            this.runnings[kv] = anim;
            this.startTimer();
        },
        stop:function(anim) {
            this.notRun(anim);
        },
        notRun:function(anim) {
            var kv = getKv(anim);
            delete this.runnings[kv];
            if (S.isEmptyObject(this.runnings)) {
                this.stopTimer();
            }
        },
        pause:function(anim) {
            this.notRun(anim);
        },
        resume:function(anim) {
            this.start(anim);
        },
        startTimer:function() {
            var self = this;
            if (!self.timer) {
                self.timer = setTimeout(function() {
                    //S.log("running : " + (id++));
                    if (!self.runFrames()) {
                        self.timer = null;
                        self.startTimer();
                    } else {
                        self.stopTimer();
                    }
                }, self.interval);
            }
        },
        stopTimer:function() {
            var t = this.timer;
            if (t) {
                clearTimeout(t);
                this.timer = null;
                //S.log("timer stop");
            }
        },
        runFrames:function() {
            var done = true,runnings = this.runnings;
            for (var r in runnings) {
                if (runnings.hasOwnProperty(r)) {
                    done = false;
                    runnings[r]._runFrame();
                }
            }
            return done;
        }
    };
});

/**
 * @module   anim
 * @author   lifesinger@gmail.com,yiminghe@gmail.com
 */
KISSY.add('anim/base', function(S, DOM, Event, Easing, UA, AM, undefined) {

    var EventTarget = Event.Target,
        _isElementNode = DOM._isElementNode,
        /**
         * milliseconds in one second
         * @constant
         */
            SECOND_UNIT = 1000,
        PROPS,
        CUSTOM_ATTRS,
        OPACITY,NONE,
        EVENT_START,
        EVENT_STEP,
        EVENT_COMPLETE,
        defaultConfig,
        TRANSITION_NAME;

    //支持的有效的 css 分属性，数字则动画，否则直接设最终结果
    PROPS = (

        'borderBottomWidth ' +
            'borderBottomStyle ' +

            'borderLeftWidth ' +
            'borderLeftStyle ' +
            // 同 font
            //'borderColor ' +

            'borderRightWidth ' +
            'borderRightStyle ' +
            'borderSpacing ' +

            'borderTopWidth ' +
            'borderTopStyle ' +
            'bottom ' +

            // shorthand 属性去掉，取分解属性
            //'font ' +
            'fontFamily ' +
            'fontSize ' +
            'fontWeight ' +
            'height ' +
            'left ' +
            'letterSpacing ' +
            'lineHeight ' +
            'marginBottom ' +
            'marginLeft ' +
            'marginRight ' +
            'marginTop ' +
            'maxHeight ' +
            'maxWidth ' +
            'minHeight ' +
            'minWidth ' +
            'opacity ' +
            'outlineOffset ' +
            'outlineWidth ' +
            'paddingBottom ' +
            'paddingLeft ' +
            'paddingRight ' +
            'paddingTop ' +
            'right ' +
            'textIndent ' +
            'top ' +
            'width ' +
            'wordSpacing ' +
            'zIndex').split(' ');

    //支持的元素属性
    CUSTOM_ATTRS = [];

    OPACITY = 'opacity';
    NONE = 'none';
    EVENT_START = 'start';
    EVENT_STEP = 'step';
    EVENT_COMPLETE = 'complete';
    defaultConfig = {
        duration: 1,
        easing: 'easeNone',
        nativeSupport: true // 优先使用原生 css3 transition
    };


    /**
     * get a anim instance associate
     * @param elem 元素或者 window （ window 时只能动画 scrollTop/scrollLeft ）
     * @param props
     * @param duration
     * @param easing
     * @param callback
     * @param nativeSupport
     */
    function Anim(elem, props, duration, easing, callback, nativeSupport) {
        // ignore non-exist element
        if (!(elem = DOM.get(elem))) {
            return;
        }

        // factory or constructor
        if (!(this instanceof Anim)) {
            return new Anim(elem, props, duration, easing, callback, nativeSupport);
        }

        /**
         * 默认不启用原生动画，有些问题
         */
        if (nativeSupport === undefined) {
            nativeSupport = false;
        }

        var self = this,
            isConfig = S.isPlainObject(duration),
            style = props,
            config;

        /**
         * the related dom element
         */
        self.domEl = elem;

        /**
         * the transition properties
         * 可以是 "width: 200px; color: #ccc" 字符串形式
         * 也可以是 { width: '200px', color: '#ccc' } 对象形式
         */
        if (S.isPlainObject(style)) {
            style = String(S.param(style, ';'))
                .replace(/=/g, ':')
                .replace(/%23/g, '#')// 还原颜色值中的 #
                //注意：这里自定义属性也被 - 了，后面从字符串中取值时需要考虑
                .replace(/([a-z])([A-Z])/g, '$1-$2')
                .toLowerCase(); // backgroundColor => background-color
        }

        //正则化，并且将shorthand属性分解成各个属性统一单独处理
        //border:1px solid #fff =>
        //borderLeftWidth:1px
        //borderLeftColor:#fff
        self.props = normalize(style, elem);
        // normalize 后：
        // props = {
        //          width: { v: 200, unit: 'px', f: interpolate }
        //          color: { v: '#ccc', unit: '', f: color }
        //         }

        self.targetStyle = style;

        /**
         * animation config
         */
        if (isConfig) {
            config = S.merge(defaultConfig, duration);
        } else {
            config = S.clone(defaultConfig);
            if (duration != null) {
                config.duration = parseFloat(duration) || 1;
            }
            if (S.isString(easing) || S.isFunction(easing)) {
                config.easing = easing;
            }
            if (S.isFunction(callback)) {
                config.complete = callback;
            }
            config.nativeSupport = nativeSupport;
        }

        //如果设定了元素属性的动画，则不能启动 css3 transition
        if (config.nativeSupport && !S.isEmptyObject(getCustomAttrs(style))) {
            config.nativeSupport = false;
        }
        self.config = config;

        /**
         * detect browser native animation(CSS3 transition) support
         */
        if (config.nativeSupport
            && getNativeTransitionName()
            && S.isString((easing = config.easing))) {
            // 当 easing 是支持的字串时，才激活 native transition
            if (/cubic-bezier\([\s\d.,]+\)/.test(easing) ||
                (easing = Easing.NativeTimeFunction[easing])) {
                config.easing = easing;
                self.transitionName = getNativeTransitionName();
            }
        }

        // register callback
        if (S.isFunction(callback)) {
            self.callback = callback;
        }
    }

    Anim.PROPS = PROPS;
    Anim.CUSTOM_ATTRS = CUSTOM_ATTRS;

    /**
     * 数值插值函数
     * @param {Number} source 源值
     * @param {Number} target 目的值
     * @param {Number} pos 当前位置，从 easing 得到 0~1
     * @return {Number} 当前值
     */
    function interpolate(source, target, pos) {
        return (source + (target - source) * pos).toFixed(3);
    }

    // 不能插值的直接返回终值，没有动画插值过程
    function mirror(source, target) {
        source = null;
        return target;
    }

    function normValueForAnim(val) {
        var num = parseFloat(val),
            unit = (val + '').replace(/^[-\d.]+/, '');
        // 不能动画的量，插值直接设为最终，下次也不运行
        if (isNaN(num)) {
            return {v:unit,u:'',f:mirror};
        }
        return {v:num,u:unit,f:interpolate};
    }


    /**
     * 相应属性的读取设置操作，需要转化为动画模块格式
     */
    Anim.PROP_OPS = {
        "*":{

            getter:function(elem, prop) {
                return normValueForAnim(DOM.css(elem, prop));
            },

            setter:function(elem, prop, val) {
                return DOM.css(elem, prop, val);
            },

            interpolate:interpolate,

            eq:function(tp, sp) {
                return tp.v == sp.v && tp.u == sp.u;
            }
        }
    };

    var PROP_OPS = Anim.PROP_OPS;


    S.augment(Anim, EventTarget, {
        /**
         * @type {boolean} 是否在运行
         */
        isRunning:false,
        /**
         * 动画开始到现在逝去的时间
         */
        elapsedTime:0,
        /**
         * 动画开始的时间
         */
        start:0,
        /**
         * 动画结束的时间
         */
        finish:0,
        /**
         * 动画持续时间，不间断的话 = finish-start
         */
        duration:0,

        run: function() {

            var self = this,
                config = self.config,
                elem = self.domEl,
                duration, easing,
                start,
                finish,
                target = self.props,
                source = {},
                prop;

            if (self.fire(EVENT_START) === false) {
                return;
            }

            self.stop(); // 先停止掉正在运行的动画
            duration = config.duration * SECOND_UNIT;
            self.duration = duration;
            if (self.transitionName) {
                // some hack ,Weird but ff/chrome need a break
                setTimeout(function() {
                    self._nativeRun();
                }, 10);
            } else {
                for (prop in target) {
                    source[prop] = getAnimValue(elem, prop);
                }

                self.source = source;

                start = S.now();
                finish = start + duration;
                easing = config.easing;

                if (S.isString(easing)) {
                    easing = Easing[easing] || Easing.easeNone;
                }


                self.start = start;
                self.finish = finish;
                self.easing = easing;

                AM.start(self);
            }

            self.isRunning = true;

            return self;
        },

        _complete:function() {
            var self = this;
            self.fire(EVENT_COMPLETE);
            self.callback && self.callback();
        },

        _runFrame:function() {

            var self = this,
                elem = self.domEl,
                finish = self.finish,
                start = self.start,
                duration = self.duration,
                time = S.now(),
                source = self.source,
                easing = self.easing,
                target = self.props,
                prop,
                elapsedTime;
            elapsedTime = time - start;
            var t = time > finish ? 1 : elapsedTime / duration,
                sp, tp, b;

            self.elapsedTime = elapsedTime;

            //S.log("********************************  _runFrame");

            for (prop in target) {

                sp = source[prop];
                tp = target[prop];

                // 没有发生变化的，直接略过
                if (eqAnimValue(prop, tp, sp)) {
                    continue;
                }

                //S.log(prop);
                //S.log(tp.v + " : " + sp.v + " : " + sp.u + " : " + tp.u);

                // 比如 sp = { v: 0, u: 'pt'} ( width: 0 时，默认单位是 pt )
                // 这时要把 sp 的单位调整为和 tp 的一致
                if (tp.v === 0) {
                    tp.u = sp.u;
                }

                // 单位不一样时，以 tp.u 的为主，同时 sp 从 0 开始
                // 比如：ie 下 border-width 默认为 medium
                if (sp.u !== tp.u) {
                    //S.log(prop + " : " + sp.v + " : " + sp.u);
                    //S.log(tp.f);
                    sp.v = 0;
                    sp.u = tp.u;
                }

                setAnimValue(elem, prop, tp.f(sp.v, tp.v, easing(t)) + tp.u);
                /**
                 * 不能动画的量，直接设成最终值，下次不用动画，设置 dom 了
                 */
                if (tp.f == mirror) {
                    sp.v = tp.v;
                    sp.u = tp.u;
                }
            }

            if ((self.fire(EVENT_STEP) === false) || (b = time > finish)) {
                // complete 事件只在动画到达最后一帧时才触发
                self.stop(b);
            }
        },

        _nativeRun: function() {
            var self = this,
                config = self.config,
                elem = self.domEl,
                duration = self.duration,
                easing = config.easing,
                prefix = self.transitionName,
                transition = {};

            // using CSS transition process
            transition[prefix + 'Property'] = 'all';
            transition[prefix + 'Duration'] = duration + 'ms';
            transition[prefix + 'TimingFunction'] = easing;

            // set the CSS transition style
            DOM.css(elem, transition);

            // set the final style value (need some hack for opera)
            setTimeout(function() {
                setToFinal(elem,
                    // target,
                    self.targetStyle);
            }, 0);

            // after duration time, fire the stop function
            S.later(function() {
                self.stop(true);
            }, duration);
        },

        stop: function(finish) {
            var self = this;
            // already stopped
            if (!self.isRunning) {
                return;
            }

            if (self.transitionName) {
                self._nativeStop(finish);
            } else {
                // 直接设置到最终样式
                if (finish) {
                    setToFinal(self.domEl,
                        //self.props,
                        self.targetStyle);
                    self._complete();
                }
                AM.stop(self);
            }

            self.isRunning = false;

            return self;
        },

        _nativeStop: function(finish) {
            var self = this,
                elem = self.domEl,
                props = self.props,
                prop;

            // handle for the CSS transition
            if (finish) {
                // CSS transition value remove should come first
                self._clearNativeProperty();
                self._complete();
            } else {
                // if want to stop the CSS transition, should set the current computed style value to the final CSS value
                for (prop in props) {
                    DOM.css(elem, prop, DOM._getComputedStyle(elem, prop));
                }
                // CSS transition value remove should come last
                self._clearNativeProperty();
            }
        },

        _clearNativeProperty:function() {
            var transition = {},
                self = this,
                elem = self.domEl,
                prefix = self.transitionName;
            transition[prefix + 'Property'] = NONE;
            transition[prefix + 'Duration'] = "";
            transition[prefix + 'TimingFunction'] = "";
            DOM.css(elem, transition);
        }
    });

    Anim.supportTransition = function() {
        if (TRANSITION_NAME) {
            return TRANSITION_NAME;
        }
        var name = 'transition', transitionName;
        var el = document.documentElement;
        if (el.style[name] !== undefined) {
            transitionName = name;
        } else {
            S.each(['Webkit', 'Moz', 'O'], function(item) {
                if (el.style[(name = item + 'Transition')] !== undefined) {
                    transitionName = name;
                    return false;
                }
            });
        }
        TRANSITION_NAME = transitionName;
        return transitionName;
    };


    var getNativeTransitionName = Anim.supportTransition;

    function setToFinal(elem, style) {
        setAnimStyleText(elem, style);
    }

    function getAnimValue(el, prop) {
        return (PROP_OPS[prop] || PROP_OPS["*"]).getter(el, prop);
    }


    function setAnimValue(el, prop, v) {
        return (PROP_OPS[prop] || PROP_OPS["*"]).setter(el, prop, v);
    }

    function eqAnimValue(prop, tp, sp) {
        var propSpecial = PROP_OPS[prop];
        if (propSpecial && propSpecial.eq) {
            return propSpecial.eq(tp, sp);
        }
        return PROP_OPS["*"].eq(tp, sp);
    }

    /**
     * 建一个尽量相同的 dom 节点在相同的位置（不单行内，获得相同的 css 选择器样式定义），从中取值
     */
    function normalize(style, elem) {
        var css,
            rules = {},
            i = PROPS.length,
            v,
            el;

        // 是否是元素
        // 这里支持 window
        if (_isElementNode(elem)) {
            el = DOM.clone(elem, true);

            DOM.insertAfter(el, elem);

            css = el.style;

            setAnimStyleText(el, style);

            while (i--) {
                var prop = PROPS[i];
                // !important 只对行内样式得到计算当前真实值
                if (v = css[prop]) {
                    rules[prop] = getAnimValue(el, prop);
                }
            }
        } else {
            el = elem;
        }

        //自定义属性混入
        var customAttrs = getCustomAttrs(style);

        for (var a in customAttrs) {
            // 如果之前没有克隆，就直接取源值
            rules[a] = el !== elem ?
                getAnimValue(el, a) :
                normValueForAnim(customAttrs[a]);
        }

        // 如果之前没有克隆就没必要删除
        if (el !== elem) {
            DOM.remove(el);
        }

        return rules;
    }

    /**
     * 直接设置 cssText 以及属性字符串，注意 ie 的 opacity
     * @param style
     * @param elem
     */
    function setAnimStyleText(elem, style) {

        if (UA['ie'] && style.indexOf(OPACITY) > -1) {
            var reg = /opacity\s*:\s*([^;]+)(;|$)/;
            var match = style.match(reg);
            if (match) {
                DOM.css(elem, OPACITY, parseFloat(match[1]));
            }
            //不要把它清除了
            //ie style.opacity 要能取！
        }

        if (_isElementNode(elem)) {
            elem.style.cssText += ';' + style;
        }

        //设置自定义属性
        var attrs = getCustomAttrs(style);
        for (var a in attrs) {
            setAnimValue(elem, a, attrs[a]);
        }
    }

    /**
     * 从自定义属性和样式字符串中解出属性值
     * @param style
     */
    function getCustomAttrs(style) {

        var ret = {};
        for (var i = 0; i < CUSTOM_ATTRS.length; i++) {
            var attr = CUSTOM_ATTRS[i]
                .replace(/([a-z])([A-Z])/g, '$1-$2')
                .toLowerCase();
            var reg = new RegExp(attr + "\\s*:([^;]+)(;|$)");
            var m = style.match(reg);
            if (m) {
                ret[CUSTOM_ATTRS[i]] = S.trim(m[1]);
            }
        }
        return ret;
    }

    return Anim;
}, {
    requires:["dom","event","./easing","ua","./manager"]
});

/**
 *
 *
 *
 * 2011-04
 * - 借鉴 yui3 ，中央定时器，否则 ie6 内存泄露？
 * - 支持配置 scrollTop/scrollLeft
 *
 *
 * TODO:
 *  - 效率需要提升，当使用 nativeSupport 时仍做了过多动作
 *  - opera nativeSupport 存在 bug ，浏览器自身 bug ?
 *  - 实现 jQuery Effects 的 queue / specialEasing / += / 等特性
 *
 * NOTES:
 *  - 与 emile 相比，增加了 borderStyle, 使得 border: 5px solid #ccc 能从无到有，正确显示
 *  - api 借鉴了 YUI, jQuery 以及 http://www.w3.org/TR/css3-transitions/
 *  - 代码实现了借鉴了 Emile.js: http://github.com/madrobby/emile *
 */

/**
 * special patch for making color gradual change
 * @author  yiminghe@gmail.com
 */
KISSY.add("anim/color", function(S, DOM, Anim) {

    var HEX_BASE = 16,
        KEYWORDS = {
            "black":[0,0,0],
            "silver":[192,192,192],
            "gray":[128,128,128],
            "white":[255,255,255],
            "maroon":[128,0,0],
            "red":[255,0,0],
            "purple":[128,0,128],
            "fuchsia":[255,0,255],
            "green":[0,128,0],
            "lime":[0,255,0],
            "olive":[128,128,0],
            "yellow":[255,255,0],
            "navy":[0,0,128],
            "blue":[0,0,255],
            "teal":[0,128,128],
            "aqua":[0,255,255]
        };
    var re_RGB = /^rgb\(([0-9]+)\s*,\s*([0-9]+)\s*,\s*([0-9]+)\)$/i,
        re_hex = /^#?([0-9A-F]{1,2})([0-9A-F]{1,2})([0-9A-F]{1,2})$/i;


    //颜色 css 属性
    var colors = ('backgroundColor ' +
        'borderBottomColor ' +
        'borderLeftColor ' +
        'borderRightColor ' +
        'borderTopColor ' +
        'color ' +
        'outlineColor').split(' ');

    var OPS = Anim.PROP_OPS,
        PROPS = Anim.PROPS;

    //添加到支持集
    PROPS.push.apply(PROPS, colors);


    //得到颜色的数值表示，红绿蓝数字数组
    function numericColor(val) {
        val = val.toLowerCase();
        var match;
        if (match = val.match(re_RGB)) {
            return [
                parseInt(match[1]),
                parseInt(match[2]),
                parseInt(match[3])
            ];
        } else if (match = val.match(re_hex)) {
            for (var i = 1; i < match.length; i++) {
                if (match[i].length < 2) {
                    match[i] += match[i];
                }
            }
            return [
                parseInt(match[1], HEX_BASE),
                parseInt(match[2], HEX_BASE),
                parseInt(match[3], HEX_BASE)
            ];
        }
        if (KEYWORDS[val]) {
            return KEYWORDS[val];
        }
        //transparent 或者 颜色字符串返回
        S.log("only allow rgb or hex color string : " + val, "warn");
        return [255,255,255];
    }

    /**
     * 根据颜色的数值表示，执行数组插值
     * @param source {Array.<Number>} 颜色源值表示
     * @param target {Array.<Number>} 颜色目的值表示
     * @param pos {Number} 当前进度
     * @return {String} 可设置css属性的格式值 : rgb
     */
    function interpolate(source, target, pos) {
        var commonInterpolate = OPS["*"].interpolate;
        return 'rgb(' + [
            Math.floor(commonInterpolate(source[0], target[0], pos)),
            Math.floor(commonInterpolate(source[1], target[1], pos)),
            Math.floor(commonInterpolate(source[2], target[2], pos))
        ].join(', ') + ')';
    }

    OPS["color"] = {
        getter:function(elem, prop) {
            return {
                v:numericColor(DOM.css(elem, prop)),
                u:'',
                f:interpolate
            };
        },

        setter:OPS["*"].setter,

        eq:function(tp, sp) {
            return (tp.v + "") == (sp.v + "");
        }
    };

    S.each(colors, function(prop) {
        OPS[prop] = OPS['color'];
    });
}, {
    requires:["dom","./base"]
});

/**
 * special patch for animate scroll property of element
 * @author  yiminghe@gmail.com
 */
KISSY.add("anim/scroll", function(S, DOM, Anim) {

    var OPS = Anim.PROP_OPS;

    //添加到支持集
    Anim.CUSTOM_ATTRS.push("scrollLeft", "scrollTop");

    // 不从 css  中读取，从元素属性中得到值
    OPS["scrollLeft"] = OPS["scrollTop"] = {
        getter:function(elem, prop) {
            return {
                v:DOM[prop](elem),
                u:'',
                f:OPS["*"].interpolate
            };
        },
        setter:function(elem, prop, val) {
            // use dom to support window
            DOM[prop](elem, val);
        }
    };
}, {
    requires:["dom","./base"]
});

KISSY.add("anim", function(S, Anim,Easing) {
    Anim.Easing=Easing;
    return Anim;
}, {
    requires:["anim/base","anim/easing","anim/color","anim/scroll"]
});

/**
 * @module  anim-node-plugin
 * @author  lifesinger@gmail.com,
 *          qiaohua@taobao.com,
 *          yiminghe@gmail.com
 */
KISSY.add('node/anim-plugin', function(S, DOM, Anim, N, undefined) {

    var NLP = N.prototype,
        ANIM_KEY = "ksAnims" + S.now(),
        DISPLAY = 'display',
        NONE = 'none',
        OVERFLOW = 'overflow',
        HIDDEN = 'hidden',
        OPCACITY = 'opacity',
        HEIGHT = 'height',
        SHOW = "show",
        HIDE = "hide",
        FADE = "fade",
        SLIDE = "slide",
        TOGGLE = "toggle",
        WIDTH = 'width',
        FX = {
            show: [OVERFLOW, OPCACITY, HEIGHT, WIDTH],
            fade: [OPCACITY],
            slide: [OVERFLOW, HEIGHT]
        };

    N.__ANIM_KEY = ANIM_KEY;

    (function(P) {

        function attachAnim(elem, anim) {
            var anims = DOM.data(elem, ANIM_KEY);
            if (!anims) {
                DOM.data(elem, ANIM_KEY, anims = []);
            }
            anim.on("complete", function() {
                var anims = DOM.data(elem, ANIM_KEY);
                if (anims) {
                    // 结束后从关联的动画队列中删除当前动画
                    var index = S.indexOf(anim, anims);
                    if (index >= 0) {
                        anims.splice(index, 1);
                    }
                    if (!anims.length) {
                        DOM.removeData(elem, ANIM_KEY);
                    }
                }
            });
            // 当前节点的所有动画队列
            anims.push(anim);
        }

        P.animate = function() {
            var self = this,
                args = S.makeArray(arguments);
            S.each(self, function(elem) {
                var anim = Anim.apply(undefined, [elem].concat(args)).run();
                attachAnim(elem, anim);
            });
            return self;
        };

        P.stop = function(finish) {
            var self = this;
            S.each(self, function(elem) {
                var anims = DOM.data(elem, ANIM_KEY);
                if (anims) {
                    S.each(anims, function(anim) {
                        anim.stop(finish);
                    });
                    DOM.removeData(elem, ANIM_KEY);
                }
            });
            return self;
        };

        S.each({
                show: [SHOW, 1],
                hide: [SHOW, 0],
                fadeIn: [FADE, 1],
                fadeOut: [FADE, 0],
                slideDown: [SLIDE, 1],
                slideUp: [SLIDE, 0]
            },
            function(v, k) {
                P[k] = function(speed, callback, easing, nativeSupport) {
                    var self = this;
                    // 没有参数时，调用 DOM 中的对应方法
                    if (DOM[k] && !speed) {
                        DOM[k](self);
                    } else {
                        S.each(self, function(elem) {
                            var anim = fx(elem, v[0], speed, callback,
                                v[1], easing || 'easeOut', nativeSupport);
                            attachAnim(elem, anim);
                        });
                    }
                    return self;
                };
            });

        // toggle 提出来单独写，清晰点
        P[TOGGLE] = function(speed) {
            var self = this;
            P[self.css(DISPLAY) === NONE ? SHOW : HIDE].apply(self, arguments);
        };
    })(NLP);

    function fx(elem, which, speed, callback, visible, easing, nativeSupport) {

        if (visible) {
            DOM.show(elem);
        }

        // 根据不同类型设置初始 css 属性, 并设置动画参数
        var originalStyle = {}, style = {};
        S.each(FX[which], function(prop) {
            /**
             * 2011-08-19
             * originalStyle 记录行内样式，防止外联样式干扰！
             */
            var elemStyle = elem.style;
            if (prop === OVERFLOW) {
                originalStyle[OVERFLOW] = elemStyle[OVERFLOW];
                DOM.css(elem, OVERFLOW, HIDDEN);
            }
            else if (prop === OPCACITY) {
                // 取行内 opacity
                originalStyle[OPCACITY] = DOM.style(elem, OPCACITY);
                style.opacity = visible ? 1 : 0;
                if (visible) {
                    DOM.css(elem, OPCACITY, 0);
                }
            }
            else if (prop === HEIGHT) {
                originalStyle[HEIGHT] = elemStyle[HEIGHT];
                //http://arunprasad.wordpress.com/2008/08/26/naturalwidth-and-naturalheight-for-image-element-in-internet-explorer/
                style.height = (visible ?
                    DOM.height(elem) || elem.naturalHeight :
                    0) + "px";
                if (visible) {
                    DOM.css(elem, HEIGHT, 0);
                }
            }
            else if (prop === WIDTH) {
                originalStyle[WIDTH] = elemStyle[WIDTH];
                style.width = (visible ?
                    DOM.width(elem) || elem.naturalWidth :
                    0) + "px";
                if (visible) {
                    DOM.css(elem, WIDTH, 0);
                }
            }
        });

        // 开始动画
        return new Anim(elem, style, speed, easing, function() {
            // 如果是隐藏，需要设置 diaplay
            if (!visible) {
                DOM.hide(elem);
            }

            // 还原样式
            if (originalStyle[HEIGHT] !== undefined) {
                DOM.css(elem, "height", originalStyle[HEIGHT]);
            }
            if (originalStyle[WIDTH] !== undefined) {
                DOM.css(elem, "width", originalStyle[WIDTH]);
            }
            if (originalStyle[OPCACITY] !== undefined) {
                DOM.css(elem, "opacity", originalStyle[OPCACITY]);
            }
            if (originalStyle[OVERFLOW] !== undefined) {
                DOM.css(elem, "overflow", originalStyle[OVERFLOW]);
            }

            if (callback) {
                callback();
            }

        }, nativeSupport).run();
    }

}, {
    requires:["dom","anim","./base"]
});
/**
 * 2011-05-17
 *  - 承玉：添加 stop ，随时停止动画
 *
 *  TODO
 *  - anim needs queue mechanism ?
 */

KISSY.add("node", function(S, Event, Node) {
    Node.KeyCodes = Event.KeyCodes;
    return Node;
}, {
    requires:[
        "event",
        "node/base",
        "node/attach",
        "node/override",
        "node/anim-plugin"]
});

/*
 http://www.JSON.org/json2.js
 2010-08-25

 Public Domain.

 NO WARRANTY EXPRESSED OR IMPLIED. USE AT YOUR OWN RISK.

 See http://www.JSON.org/js.html


 This code should be minified before deployment.
 See http://javascript.crockford.com/jsmin.html

 USE YOUR OWN COPY. IT IS EXTREMELY UNWISE TO LOAD CODE FROM SERVERS YOU DO
 NOT CONTROL.


 This file creates a global JSON object containing two methods: stringify
 and parse.

 JSON.stringify(value, replacer, space)
 value       any JavaScript value, usually an object or array.

 replacer    an optional parameter that determines how object
 values are stringified for objects. It can be a
 function or an array of strings.

 space       an optional parameter that specifies the indentation
 of nested structures. If it is omitted, the text will
 be packed without extra whitespace. If it is a number,
 it will specify the number of spaces to indent at each
 level. If it is a string (such as '\t' or '&nbsp;'),
 it contains the characters used to indent at each level.

 This method produces a JSON text from a JavaScript value.

 When an object value is found, if the object contains a toJSON
 method, its toJSON method will be called and the result will be
 stringified. A toJSON method does not serialize: it returns the
 value represented by the name/value pair that should be serialized,
 or undefined if nothing should be serialized. The toJSON method
 will be passed the key associated with the value, and this will be
 bound to the value

 For example, this would serialize Dates as ISO strings.

 Date.prototype.toJSON = function (key) {
 function f(n) {
 // Format integers to have at least two digits.
 return n < 10 ? '0' + n : n;
 }

 return this.getUTCFullYear()   + '-' +
 f(this.getUTCMonth() + 1) + '-' +
 f(this.getUTCDate())      + 'T' +
 f(this.getUTCHours())     + ':' +
 f(this.getUTCMinutes())   + ':' +
 f(this.getUTCSeconds())   + 'Z';
 };

 You can provide an optional replacer method. It will be passed the
 key and value of each member, with this bound to the containing
 object. The value that is returned from your method will be
 serialized. If your method returns undefined, then the member will
 be excluded from the serialization.

 If the replacer parameter is an array of strings, then it will be
 used to select the members to be serialized. It filters the results
 such that only members with keys listed in the replacer array are
 stringified.

 Values that do not have JSON representations, such as undefined or
 functions, will not be serialized. Such values in objects will be
 dropped; in arrays they will be replaced with null. You can use
 a replacer function to replace those with JSON values.
 JSON.stringify(undefined) returns undefined.

 The optional space parameter produces a stringification of the
 value that is filled with line breaks and indentation to make it
 easier to read.

 If the space parameter is a non-empty string, then that string will
 be used for indentation. If the space parameter is a number, then
 the indentation will be that many spaces.

 Example:

 text = JSON.stringify(['e', {pluribus: 'unum'}]);
 // text is '["e",{"pluribus":"unum"}]'


 text = JSON.stringify(['e', {pluribus: 'unum'}], null, '\t');
 // text is '[\n\t"e",\n\t{\n\t\t"pluribus": "unum"\n\t}\n]'

 text = JSON.stringify([new Date()], function (key, value) {
 return this[key] instanceof Date ?
 'Date(' + this[key] + ')' : value;
 });
 // text is '["Date(---current time---)"]'


 JSON.parse(text, reviver)
 This method parses a JSON text to produce an object or array.
 It can throw a SyntaxError exception.

 The optional reviver parameter is a function that can filter and
 transform the results. It receives each of the keys and values,
 and its return value is used instead of the original value.
 If it returns what it received, then the structure is not modified.
 If it returns undefined then the member is deleted.

 Example:

 // Parse the text. Values that look like ISO date strings will
 // be converted to Date objects.

 myData = JSON.parse(text, function (key, value) {
 var a;
 if (typeof value === 'string') {
 a =
 /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2}(?:\.\d*)?)Z$/.exec(value);
 if (a) {
 return new Date(Date.UTC(+a[1], +a[2] - 1, +a[3], +a[4],
 +a[5], +a[6]));
 }
 }
 return value;
 });

 myData = JSON.parse('["Date(09/09/2001)"]', function (key, value) {
 var d;
 if (typeof value === 'string' &&
 value.slice(0, 5) === 'Date(' &&
 value.slice(-1) === ')') {
 d = new Date(value.slice(5, -1));
 if (d) {
 return d;
 }
 }
 return value;
 });


 This is a reference implementation. You are free to copy, modify, or
 redistribute.
 */

/*jslint evil: true, strict: false */

/*members "", "\b", "\t", "\n", "\f", "\r", "\"", JSON, "\\", apply,
 call, charCodeAt, getUTCDate, getUTCFullYear, getUTCHours,
 getUTCMinutes, getUTCMonth, getUTCSeconds, hasOwnProperty, join,
 lastIndex, length, parse, prototype, push, replace, slice, stringify,
 test, toJSON, toString, valueOf
 */


// Create a JSON object only if one does not already exist. We create the
// methods in a closure to avoid creating global variables.

KISSY.add("json/json2", function(S, UA) {
    var win = window,JSON = win.JSON;
    // ie 8.0.7600.16315@win7 json 有问题
    if (!JSON || UA['ie'] < 9) {
        JSON = win.JSON = {};
    }

    function f(n) {
        // Format integers to have at least two digits.
        return n < 10 ? '0' + n : n;
    }

    if (typeof Date.prototype.toJSON !== 'function') {

        Date.prototype.toJSON = function (key) {

            return isFinite(this.valueOf()) ?
                this.getUTCFullYear() + '-' +
                    f(this.getUTCMonth() + 1) + '-' +
                    f(this.getUTCDate()) + 'T' +
                    f(this.getUTCHours()) + ':' +
                    f(this.getUTCMinutes()) + ':' +
                    f(this.getUTCSeconds()) + 'Z' : null;
        };

        String.prototype.toJSON =
            Number.prototype.toJSON =
                Boolean.prototype.toJSON = function (key) {
                    return this.valueOf();
                };
    }

    var cx = /[\u0000\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g,
        escapable = /[\\\"\x00-\x1f\x7f-\x9f\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g,
        gap,
        indent,
        meta = {    // table of character substitutions
            '\b': '\\b',
            '\t': '\\t',
            '\n': '\\n',
            '\f': '\\f',
            '\r': '\\r',
            '"' : '\\"',
            '\\': '\\\\'
        },
        rep;


    function quote(string) {

// If the string contains no control characters, no quote characters, and no
// backslash characters, then we can safely slap some quotes around it.
// Otherwise we must also replace the offending characters with safe escape
// sequences.

        escapable['lastIndex'] = 0;
        return escapable.test(string) ?
            '"' + string.replace(escapable, function (a) {
                var c = meta[a];
                return typeof c === 'string' ? c :
                    '\\u' + ('0000' + a.charCodeAt(0).toString(16)).slice(-4);
            }) + '"' :
            '"' + string + '"';
    }


    function str(key, holder) {

// Produce a string from holder[key].

        var i,          // The loop counter.
            k,          // The member key.
            v,          // The member value.
            length,
            mind = gap,
            partial,
            value = holder[key];

// If the value has a toJSON method, call it to obtain a replacement value.

        if (value && typeof value === 'object' &&
            typeof value.toJSON === 'function') {
            value = value.toJSON(key);
        }

// If we were called with a replacer function, then call the replacer to
// obtain a replacement value.

        if (typeof rep === 'function') {
            value = rep.call(holder, key, value);
        }

// What happens next depends on the value's type.

        switch (typeof value) {
            case 'string':
                return quote(value);

            case 'number':

// JSON numbers must be finite. Encode non-finite numbers as null.

                return isFinite(value) ? String(value) : 'null';

            case 'boolean':
            case 'null':

// If the value is a boolean or null, convert it to a string. Note:
// typeof null does not produce 'null'. The case is included here in
// the remote chance that this gets fixed someday.

                return String(value);

// If the type is 'object', we might be dealing with an object or an array or
// null.

            case 'object':

// Due to a specification blunder in ECMAScript, typeof null is 'object',
// so watch out for that case.

                if (!value) {
                    return 'null';
                }

// Make an array to hold the partial results of stringifying this object value.

                gap += indent;
                partial = [];

// Is the value an array?

                if (Object.prototype.toString.apply(value) === '[object Array]') {

// The value is an array. Stringify every element. Use null as a placeholder
// for non-JSON values.

                    length = value.length;
                    for (i = 0; i < length; i += 1) {
                        partial[i] = str(i, value) || 'null';
                    }

// Join all of the elements together, separated with commas, and wrap them in
// brackets.

                    v = partial.length === 0 ? '[]' :
                        gap ? '[\n' + gap +
                            partial.join(',\n' + gap) + '\n' +
                            mind + ']' :
                            '[' + partial.join(',') + ']';
                    gap = mind;
                    return v;
                }

// If the replacer is an array, use it to select the members to be stringified.

                if (rep && typeof rep === 'object') {
                    length = rep.length;
                    for (i = 0; i < length; i += 1) {
                        k = rep[i];
                        if (typeof k === 'string') {
                            v = str(k, value);
                            if (v) {
                                partial.push(quote(k) + (gap ? ': ' : ':') + v);
                            }
                        }
                    }
                } else {

// Otherwise, iterate through all of the keys in the object.

                    for (k in value) {
                        if (Object.hasOwnProperty.call(value, k)) {
                            v = str(k, value);
                            if (v) {
                                partial.push(quote(k) + (gap ? ': ' : ':') + v);
                            }
                        }
                    }
                }

// Join all of the member texts together, separated with commas,
// and wrap them in braces.

                v = partial.length === 0 ? '{}' :
                    gap ? '{\n' + gap + partial.join(',\n' + gap) + '\n' +
                        mind + '}' : '{' + partial.join(',') + '}';
                gap = mind;
                return v;
        }
    }

// If the JSON object does not yet have a stringify method, give it one.

    if (typeof JSON.stringify !== 'function') {
        JSON.stringify = function (value, replacer, space) {

// The stringify method takes a value and an optional replacer, and an optional
// space parameter, and returns a JSON text. The replacer can be a function
// that can replace values, or an array of strings that will select the keys.
// A default replacer method can be provided. Use of the space parameter can
// produce text that is more easily readable.

            var i;
            gap = '';
            indent = '';

// If the space parameter is a number, make an indent string containing that
// many spaces.

            if (typeof space === 'number') {
                for (i = 0; i < space; i += 1) {
                    indent += ' ';
                }

// If the space parameter is a string, it will be used as the indent string.

            } else if (typeof space === 'string') {
                indent = space;
            }

// If there is a replacer, it must be a function or an array.
// Otherwise, throw an error.

            rep = replacer;
            if (replacer && typeof replacer !== 'function' &&
                (typeof replacer !== 'object' ||
                    typeof replacer.length !== 'number')) {
                throw new Error('JSON.stringify');
            }

// Make a fake root object containing our value under the key of ''.
// Return the result of stringifying the value.

            return str('', {'': value});
        };
    }


// If the JSON object does not yet have a parse method, give it one.

    if (typeof JSON.parse !== 'function') {
        JSON.parse = function (text, reviver) {

// The parse method takes a text and an optional reviver function, and returns
// a JavaScript value if the text is a valid JSON text.

            var j;

            function walk(holder, key) {

// The walk method is used to recursively walk the resulting structure so
// that modifications can be made.

                var k, v, value = holder[key];
                if (value && typeof value === 'object') {
                    for (k in value) {
                        if (Object.hasOwnProperty.call(value, k)) {
                            v = walk(value, k);
                            if (v !== undefined) {
                                value[k] = v;
                            } else {
                                delete value[k];
                            }
                        }
                    }
                }
                return reviver.call(holder, key, value);
            }


// Parsing happens in four stages. In the first stage, we replace certain
// Unicode characters with escape sequences. JavaScript handles many characters
// incorrectly, either silently deleting them, or treating them as line endings.

            text = String(text);
            cx['lastIndex'] = 0;
            if (cx.test(text)) {
                text = text.replace(cx, function (a) {
                    return '\\u' +
                        ('0000' + a.charCodeAt(0).toString(16)).slice(-4);
                });
            }

// In the second stage, we run the text against regular expressions that look
// for non-JSON patterns. We are especially concerned with '()' and 'new'
// because they can cause invocation, and '=' because it can cause mutation.
// But just to be safe, we want to reject all unexpected forms.

// We split the second stage into 4 regexp operations in order to work around
// crippling inefficiencies in IE's and Safari's regexp engines. First we
// replace the JSON backslash pairs with '@' (a non-JSON character). Second, we
// replace all simple value tokens with ']' characters. Third, we delete all
// open brackets that follow a colon or comma or that begin the text. Finally,
// we look to see that the remaining characters are only whitespace or ']' or
// ',' or ':' or '{' or '}'. If that is so, then the text is safe for eval.

            if (/^[\],:{}\s]*$/
                .test(text.replace(/\\(?:["\\\/bfnrt]|u[0-9a-fA-F]{4})/g, '@')
                .replace(/"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g, ']')
                .replace(/(?:^|:|,)(?:\s*\[)+/g, ''))) {

// In the third stage we use the eval function to compile the text into a
// JavaScript structure. The '{' operator is subject to a syntactic ambiguity
// in JavaScript: it can begin a block or an object literal. We wrap the text
// in parens to eliminate the ambiguity.

                j = eval('(' + text + ')');

// In the optional fourth stage, we recursively walk the new structure, passing
// each name/value pair to a reviver function for possible transformation.

                return typeof reviver === 'function' ?
                    walk({'': j}, '') : j;
            }

// If the text is not JSON parseable, then a SyntaxError is thrown.

            throw new SyntaxError('JSON.parse');
        };
    }
    return JSON;
}, {requires:['ua']});

/**
 * adapt json2 to kissy
 * @author lifesinger@gmail.com
 */
KISSY.add('json', function (S, JSON) {

    return {

        parse: function(text) {
            // 当输入为 undefined / null / '' 时，返回 null
            if (S.isNullOrUndefined(text) || text === '') {
                return null;
            }
            return JSON.parse(text);
        },

        stringify: JSON.stringify
    };
}, {
    requires:["json/json2"]
});

/**
 * form data  serialization util
 * @author  yiminghe@gmail.com
 */
KISSY.add("ajax/form-serializer", function(S, DOM) {
    var rselectTextarea = /^(?:select|textarea)/i,
        rCRLF = /\r?\n/g,
        rinput = /^(?:color|date|datetime|email|hidden|month|number|password|range|search|tel|text|time|url|week)$/i;
    return {
        /**
         * 序列化表单元素
         * @param {String|HTMLElement[]|HTMLElement|Node} forms
         */
        serialize:function(forms) {
            var elements = [],data = {};
            DOM.query(forms).each(function(el) {
                // form 取其表单元素集合
                // 其他直接取自身
                var subs = el.elements ? S.makeArray(el.elements) : [el];
                elements.push.apply(elements, subs);
            });
            // 对表单元素进行过滤，具备有效值的才保留
            elements = S.filter(elements, function(el) {
                // 有名字
                return el.name &&
                    // 不被禁用
                    !el.disabled &&
                    (
                        // radio,checkbox 被选择了
                        el.checked ||
                            // select 或者 textarea
                            rselectTextarea.test(el.nodeName) ||
                            // input 类型
                            rinput.test(el.type)
                        );

                // 这样子才取值
            });
            S.each(elements, function(el) {
                var val = DOM.val(el),vs;
                // 字符串换行平台归一化
                val = S.map(S.makeArray(val), function(v) {
                    return v.replace(rCRLF, "\r\n");
                });
                // 全部搞成数组，防止同名
                vs = data[el.name] = data[el.name] || [];
                vs.push.apply(vs, val);
            });
            // 名值键值对序列化,数组元素名字前不加 []
            return S.param(data, undefined, undefined, false);
        }
    };
}, {
    requires:['dom']
});

/**
 * encapsulation of io object . as transaction object in yui3
 * @author yiminghe@gmail.com
 */
KISSY.add("ajax/xhrobject", function(S, Event) {

    var OK_CODE = 200,
        MULTIPLE_CHOICES = 300,
        NOT_MODIFIED = 304,
        // get individual response header from responseheader str
        rheaders = /^(.*?):[ \t]*([^\r\n]*)\r?$/mg;

    function handleResponseData(xhr) {

        // text xml 是否原生转化支持
        var text = xhr.responseText,
            xml = xhr.responseXML,
            c = xhr.config,
            cConverts = c.converters,
            xConverts = xhr.converters || {},
            type,
            responseData,
            contents = c.contents,
            dataType = c.dataType;

        // 例如 script 直接是js引擎执行，没有返回值，不需要自己处理初始返回值
        // jsonp 时还需要把 script 转换成 json，后面还得自己来
        if (text || xml) {

            var contentType = xhr.mimeType || xhr.getResponseHeader("Content-Type");

            // 去除无用的通用格式
            while (dataType[0] == "*") {
                dataType.shift();
            }

            if (!dataType.length) {
                // 获取源数据格式，放在第一个
                for (type in contents) {
                    if (contents[type].test(contentType)) {
                        if (dataType[0] != type) {
                            dataType.unshift(type);
                        }
                        break;
                    }
                }
            }
            // 服务器端没有告知（并且客户端没有mimetype）默认 text 类型
            dataType[0] = dataType[0] || "text";

            //获得合适的初始数据
            if (dataType[0] == "text" && text !== undefined) {
                responseData = text;
            }
            // 有 xml 值才直接取，否则可能还要从 xml 转
            else if (dataType[0] == "xml" && xml !== undefined) {
                responseData = xml;
            } else {
                // 看能否从 text xml 转换到合适数据
                S.each(["text","xml"], function(prevType) {
                    var type = dataType[0],
                        converter = xConverts[prevType] && xConverts[prevType][type] ||
                            cConverts[prevType] && cConverts[prevType][type];
                    if (converter) {
                        dataType.unshift(prevType);
                        responseData = prevType == "text" ? text : xml;
                        return false;
                    }
                });
            }
        }
        var prevType = dataType[0];

        // 按照转化链把初始数据转换成我们想要的数据类型
        for (var i = 1; i < dataType.length; i++) {
            type = dataType[i];

            var converter = xConverts[prevType] && xConverts[prevType][type] ||
                cConverts[prevType] && cConverts[prevType][type];

            if (!converter) {
                throw "no covert for " + prevType + " => " + type;
            }
            responseData = converter(responseData);

            prevType = type;
        }

        xhr.responseData = responseData;
    }

    function XhrObject(c) {
        S.mix(this, {
            // 结构化数据，如 json
            responseData:null,
            config:c || {},
            timeoutTimer:null,
            responseText:null,
            responseXML:null,
            responseHeadersString:"",
            responseHeaders:null,
            requestHeaders:{},
            readyState:0,
            //internal state
            state:0,
            statusText:null,
            status:0,
            transport:null
        });
    }

    S.augment(XhrObject, Event.Target, {
            // Caches the header
            setRequestHeader: function(name, value) {
                this.requestHeaders[ name ] = value;
                return this;
            },

            // Raw string
            getAllResponseHeaders: function() {
                return this.state === 2 ? this.responseHeadersString : null;
            },

            // Builds headers hashtable if needed
            getResponseHeader: function(key) {
                var match;
                if (this.state === 2) {
                    if (!this.responseHeaders) {
                        this.responseHeaders = {};
                        while (( match = rheaders.exec(this.responseHeadersString) )) {
                            this.responseHeaders[ match[1] ] = match[ 2 ];
                        }
                    }
                    match = this.responseHeaders[ key];
                }
                return match === undefined ? null : match;
            },

            // Overrides response content-type header
            overrideMimeType: function(type) {
                if (!this.state) {
                    this.mimeType = type;
                }
                return this;
            },

            // Cancel the request
            abort: function(statusText) {
                statusText = statusText || "abort";
                if (this.transport) {
                    this.transport.abort(statusText);
                }
                this.callback(0, statusText);
                return this;
            },

            callback:function(status, statusText) {
                //debugger
                var xhr = this;
                // 只能执行一次，防止重复执行
                // 例如完成后，调用 abort

                // 到这要么成功，调用success
                // 要么失败，调用 error
                // 最终都会调用 complete
                if (xhr.state == 2) {
                    return;
                }
                xhr.state = 2;
                xhr.readyState = 4;
                var isSuccess;
                if (status >= OK_CODE && status < MULTIPLE_CHOICES || status == NOT_MODIFIED) {

                    if (status == NOT_MODIFIED) {
                        statusText = "notmodified";
                        isSuccess = true;
                    } else {
                        try {
                            handleResponseData(xhr);
                            statusText = "success";
                            isSuccess = true;
                        } catch(e) {
                            statusText = "parsererror : " + e;
                        }
                    }

                } else {
                    if (status < 0) {
                        status = 0;
                    }
                }

                xhr.status = status;
                xhr.statusText = statusText;

                if (isSuccess) {
                    xhr.fire("success");
                } else {
                    xhr.fire("error");
                }
                xhr.fire("complete");
                xhr.transport = undefined;
            }
        }
    );

    return XhrObject;
}, {
    requires:["event"]
});

/**
 * a scalable client io framework
 * @author  yiminghe@gmail.com , lijing00333@163.com
 */
KISSY.add("ajax/base", function(S, JSON, Event, XhrObject) {

        var rlocalProtocol = /^(?:about|app|app\-storage|.+\-extension|file|widget):$/,
            rspace = /\s+/,
            rurl = /^([\w\+\.\-]+:)(?:\/\/([^\/?#:]*)(?::(\d+))?)?/,
            mirror = function(s) {
                return s;
            },
            HTTP_PORT = 80,
            HTTPS_PORT = 443,
            rnoContent = /^(?:GET|HEAD)$/,
            curLocation,
            curLocationParts;


        try {
            curLocation = location.href;
        } catch(e) {
            S.log("ajax/base get curLocation error : ");
            S.log(e);
            // Use the href attribute of an A element
            // since IE will modify it given document.location
            curLocation = document.createElement("a");
            curLocation.href = "";
            curLocation = curLocation.href;
        }

        curLocationParts = rurl.exec(curLocation);

        var isLocal = rlocalProtocol.test(curLocationParts[1]),
            transports = {},
            defaultConfig = {
                // isLocal:isLocal,
                type:"GET",
                // only support utf-8 when post, encoding can not be changed actually
                contentType: "application/x-www-form-urlencoded; charset=UTF-8",
                async:true,
                // whether add []
                serializeArray:true,
                // whether param data
                processData:true,
                /*
                 url:"",
                 context:null,
                 // 单位秒!!
                 timeout: 0,
                 data: null,
                 // 可取json | jsonp | script | xml | html | text | null | undefined
                 dataType: null,
                 username: null,
                 password: null,
                 cache: null,
                 mimeType:null,
                 xdr:{
                 subDomain:{
                 proxy:'http://xx.t.com/proxy.html'
                 }
                 },
                 headers: {},
                 xhrFields:{},
                 // jsonp script charset
                 scriptCharset:null,
                 crossdomain:false,
                 forceScript:false,
                 */

                accepts: {
                    xml: "application/xml, text/xml",
                    html: "text/html",
                    text: "text/plain",
                    json: "application/json, text/javascript",
                    "*": "*/*"
                },
                converters:{
                    text:{
                        json:JSON.parse,
                        html:mirror,
                        text:mirror,
                        xml:S.parseXML
                    }
                },
                contents:{
                    xml:/xml/,
                    html:/html/,
                    json:/json/
                }
            };

        defaultConfig.converters.html = defaultConfig.converters.text;

        function setUpConfig(c) {
            // deep mix
            c = S.mix(S.clone(defaultConfig), c || {}, undefined, undefined, true);
            if (!S.isBoolean(c.crossDomain)) {
                var parts = rurl.exec(c.url.toLowerCase());
                c.crossDomain = !!( parts &&
                    ( parts[ 1 ] != curLocationParts[ 1 ] || parts[ 2 ] != curLocationParts[ 2 ] ||
                        ( parts[ 3 ] || ( parts[ 1 ] === "http:" ? HTTP_PORT : HTTPS_PORT ) )
                            !=
                            ( curLocationParts[ 3 ] || ( curLocationParts[ 1 ] === "http:" ? HTTP_PORT : HTTPS_PORT ) ) )
                    );
            }

            if (c.processData && c.data && !S.isString(c.data)) {
                // 必须 encodeURIComponent 编码 utf-8
                c.data = S.param(c.data, undefined, undefined, c.serializeArray);
            }

            c.type = c.type.toUpperCase();
            c.hasContent = !rnoContent.test(c.type);

            if (!c.hasContent) {
                if (c.data) {
                    c.url += ( /\?/.test(c.url) ? "&" : "?" ) + c.data;
                }
                if (c.cache === false) {
                    c.url += ( /\?/.test(c.url) ? "&" : "?" ) + "_ksTS=" + (S.now() + "_" + S.guid());
                }
            }

            // 数据类型处理链，一步步将前面的数据类型转化成最后一个
            c.dataType = S.trim(c.dataType || "*").split(rspace);

            c.context = c.context || c;
            return c;
        }

        function fire(eventType, xhr) {
            io.fire(eventType, { ajaxConfig: xhr.config ,xhr:xhr});
        }

        function handleXhrEvent(e) {
            var xhr = this,
                c = xhr.config,
                type = e.type;
            if (this.timeoutTimer) {
                clearTimeout(this.timeoutTimer);
            }
            if (c[type]) {
                c[type].call(c.context, xhr.responseData, xhr.statusText, xhr);
            }
            fire(type, xhr);
        }

        function io(c) {
            if (!c.url) {
                return undefined;
            }
            c = setUpConfig(c);
            var xhr = new XhrObject(c);
            fire("start", xhr);
            var transportContructor = transports[c.dataType[0]] || transports["*"],
                transport = new transportContructor(xhr);
            xhr.transport = transport;

            if (c.contentType) {
                xhr.setRequestHeader("Content-Type", c.contentType);
            }
            var dataType = c.dataType[0],
                accepts = c.accepts;
            // Set the Accepts header for the server, depending on the dataType
            xhr.setRequestHeader(
                "Accept",
                dataType && accepts[dataType] ?
                    accepts[ dataType ] + (dataType === "*" ? "" : ", */*; q=0.01"  ) :
                    accepts[ "*" ]
            );

            // Check for headers option
            for (var i in c.headers) {
                xhr.setRequestHeader(i, c.headers[ i ]);
            }

            xhr.on("complete success error", handleXhrEvent);

            xhr.readyState = 1;

            fire("send", xhr);

            // Timeout
            if (c.async && c.timeout > 0) {
                xhr.timeoutTimer = setTimeout(function() {
                    xhr.abort("timeout");
                }, c.timeout * 1000);
            }

            try {
                // flag as sending
                xhr.state = 1;
                transport.send();
            } catch (e) {
                // Propagate exception as error if not done
                if (xhr.status < 2) {
                    xhr.callback(-1, e);
                    // Simply rethrow otherwise
                } else {
                    S.error(e);
                }
            }

            return xhr;
        }

        S.mix(io, Event.Target);
        S.mix(io, {
            isLocal:isLocal,
            setupConfig:function(setting) {
                S.mix(defaultConfig, setting, undefined, undefined, true);
            },
            setupTransport:function(name, fn) {
                transports[name] = fn;
            },
            getTransport:function(name) {
                return transports[name];
            },
            getConfig:function() {
                return defaultConfig;
            }
        });


        return io;
    },
    {
        requires:["json","event","./xhrobject"]
    });

/**
 * 借鉴 jquery，优化减少闭包使用
 *
 * TODO:
 *  ifModified mode 是否需要？
 *  优点：
 *      不依赖浏览器处理，ajax 请求浏览不会自动加 If-Modified-Since If-None-Match ??
 *  缺点：
 *      内存占用
 **/

/**
 * base for xhr and subdomain
 * @author yiminghe@gmail.com
 */
KISSY.add("ajax/xhrbase", function(S, io) {
    var OK_CODE = 200,
        win = window,
        // http://msdn.microsoft.com/en-us/library/cc288060(v=vs.85).aspx
        _XDomainRequest = win['XDomainRequest'],
        NO_CONTENT_CODE = 204,
        NOT_FOUND_CODE = 404,
        NO_CONTENT_CODE2 = 1223,
        XhrBase = {
            proto:{}
        };

    function createStandardXHR(_, refWin) {
        try {
            return new (refWin || win)['XMLHttpRequest']();
        } catch(e) {
            S.log("createStandardXHR error");
        }
        return undefined;
    }

    function createActiveXHR(_, refWin) {
        try {
            return new (refWin || win)['ActiveXObject']("Microsoft.XMLHTTP");
        } catch(e) {
            S.log("createActiveXHR error");
        }
        return undefined;
    }

    XhrBase.xhr = win.ActiveXObject ? function(crossDomain, refWin) {
        if (crossDomain && _XDomainRequest) {
            return new _XDomainRequest();
        }
        // ie7 XMLHttpRequest 不能访问本地文件
        return !io.isLocal && createStandardXHR(crossDomain, refWin) || createActiveXHR(crossDomain, refWin);
    } : createStandardXHR;

    function isInstanceOfXDomainRequest(xhr) {
        return _XDomainRequest && (xhr instanceof _XDomainRequest);
    }

    S.mix(XhrBase.proto, {
        sendInternal:function() {

            var self = this,
                xhrObj = self.xhrObj,
                c = xhrObj.config;

            var xhr = self.xhr,
                xhrFields,
                i;

            if (c['username']) {
                xhr.open(c.type, c.url, c.async, c['username'], c.password)
            } else {
                xhr.open(c.type, c.url, c.async);
            }

            if (xhrFields = c['xhrFields']) {
                for (i in xhrFields) {
                    xhr[ i ] = xhrFields[ i ];
                }
            }

            // Override mime type if supported
            if (xhrObj.mimeType && xhr.overrideMimeType) {
                xhr.overrideMimeType(xhrObj.mimeType);
            }
            // yui3 and jquery both have
            if (!c.crossDomain && !xhrObj.requestHeaders["X-Requested-With"]) {
                xhrObj.requestHeaders[ "X-Requested-With" ] = "XMLHttpRequest";
            }
            try {
                // 跨域时，不能设，否则请求变成
                // OPTIONS /xhr/r.php HTTP/1.1
                if (!c.crossDomain) {
                    for (i in xhrObj.requestHeaders) {
                        xhr.setRequestHeader(i, xhrObj.requestHeaders[ i ]);
                    }
                }
            } catch(e) {
                S.log("setRequestHeader in xhr error : ");
                S.log(e);
            }

            xhr.send(c.hasContent && c.data || null);

            if (!c.async || xhr.readyState == 4) {
                self._callback();
            } else {
                // _XDomainRequest 单独的回调机制
                if (isInstanceOfXDomainRequest(xhr)) {
                    xhr.onload = function() {
                        xhr.readyState = 4;
                        xhr.status = 200;
                        self._callback();
                    };
                    xhr.onerror = function() {
                        xhr.readyState = 4;
                        xhr.status = 500;
                        self._callback();
                    };
                } else {
                    xhr.onreadystatechange = function() {
                        self._callback();
                    };
                }
            }
        },
        // 由 xhrObj.abort 调用，自己不可以调用 xhrObj.abort
        abort:function() {
            this._callback(0, 1);
        },

        _callback:function(event, abort) {
            // Firefox throws exceptions when accessing properties
            // of an xhr when a network error occured
            // http://helpful.knobs-dials.com/index.php/Component_returned_failure_code:_0x80040111_(NS_ERROR_NOT_AVAILABLE)
            try {
                var self = this,
                    xhr = self.xhr,
                    xhrObj = self.xhrObj,
                    c = xhrObj.config;
                //abort or complete
                if (abort || xhr.readyState == 4) {

                    // ie6 ActiveObject 设置不恰当属性导致出错
                    if (isInstanceOfXDomainRequest(xhr)) {
                        xhr.onerror = S.noop;
                        xhr.onload = S.noop;
                    } else {
                        // ie6 ActiveObject 只能设置，不能读取这个属性，否则出错！
                        xhr.onreadystatechange = S.noop;
                    }

                    if (abort) {
                        // 完成以后 abort 不要调用
                        if (xhr.readyState !== 4) {
                            xhr.abort();
                        }
                    } else {
                        var status = xhr.status;

                        // _XDomainRequest 不能获取响应头
                        if (!isInstanceOfXDomainRequest(xhr)) {
                            xhrObj.responseHeadersString = xhr.getAllResponseHeaders();
                        }

                        var xml = xhr.responseXML;

                        // Construct response list
                        if (xml && xml.documentElement /* #4958 */) {
                            xhrObj.responseXML = xml;
                        }
                        xhrObj.responseText = xhr.responseText;

                        // Firefox throws an exception when accessing
                        // statusText for faulty cross-domain requests
                        try {
                            var statusText = xhr.statusText;
                        } catch(e) {
                            S.log("xhr statustext error : ");
                            S.log(e);
                            // We normalize with Webkit giving an empty statusText
                            statusText = "";
                        }

                        // Filter status for non standard behaviors
                        // If the request is local and we have data: assume a success
                        // (success with no data won't get notified, that's the best we
                        // can do given current implementations)
                        if (!status && io.isLocal && !c.crossDomain) {
                            status = xhrObj.responseText ? OK_CODE : NOT_FOUND_CODE;
                            // IE - #1450: sometimes returns 1223 when it should be 204
                        } else if (status === NO_CONTENT_CODE2) {
                            status = NO_CONTENT_CODE;
                        }

                        xhrObj.callback(status, statusText);

                    }
                }
            } catch (firefoxAccessException) {
                xhr.onreadystatechange = S.noop;
                if (!abort) {
                    xhrObj.callback(-1, firefoxAccessException);
                }
            }
        }
    });

    return XhrBase;
}, {
    requires:['./base']
});

/**
 * solve io between sub domains using proxy page
 * @author yiminghe@gmail.com
 */
KISSY.add("ajax/subdomain", function(S, XhrBase, Event, DOM) {

    var rurl = /^([\w\+\.\-]+:)(?:\/\/([^\/?#:]*)(?::(\d+))?)?/;

    var PROXY_PAGE = "/sub_domain_proxy.html";

    var doc = document;

    var iframeMap = {
        // hostname:{iframe: , ready:}
    };

    function SubDomain(xhrObj) {
        var self = this,
            c = xhrObj.config;
        self.xhrObj = xhrObj;
        var m = c.url.match(rurl);
        self.__hostname = m[2];
        self.__protocol = m[1];
        c.crossDomain = false;
    }


    S.augment(SubDomain, XhrBase.proto, {
        send:function() {
            var self = this,
                c = self.xhrObj.config,
                hostname = self.__hostname,
                iframe,
                iframeDesc = iframeMap[hostname];

            var proxy = PROXY_PAGE;

            if (c['xdr'] && c['xdr']['subDomain'] && c['xdr']['subDomain'].proxy) {
                proxy = c['xdr']['subDomain'].proxy;
            }

            if (iframeDesc && iframeDesc.ready) {
                self.xhr = XhrBase.xhr(0, iframeDesc.iframe.contentWindow);
                if (self.xhr) {
                    self.sendInternal();
                } else {
                    S.error("document.domain not set correctly!");
                }
                return;
            }
            if (!iframeDesc) {
                iframeDesc = iframeMap[hostname] = {};
                iframe = iframeDesc.iframe = document.createElement("iframe");
                DOM.css(iframe, {
                    position:'absolute',
                    left:'-9999px',
                    top:'-9999px'
                });
                DOM.prepend(iframe, doc.body || doc.documentElement);
                iframe.src = self.__protocol + "//" + hostname + proxy;
            } else {
                iframe = iframeDesc.iframe;
            }

            Event.on(iframe, "load", self._onLoad, self);

        },

        _onLoad:function() {
            var self = this,
                hostname = self.__hostname,
                iframeDesc = iframeMap[hostname];
            iframeDesc.ready = 1;
            Event.detach(iframeDesc.iframe, "load", self._onLoad, self);
            self.send();
        }
    });

    return SubDomain;

}, {
    requires:['./xhrbase','event','dom']
});

/**
 * use flash to accomplish cross domain request , usage scenario ? why not jsonp ?
 * @author yiminghe@gmail.com
 */
KISSY.add("ajax/xdr", function(S, io, DOM) {

    var // current running request instances
        maps = {},
        ID = "io_swf",
        // flash transporter
        flash,
        doc = document,
        // whether create the flash transporter
        init = false;

    // create the flash transporter
    function _swf(uri, _, uid) {
        if (init) {
            return;
        }
        init = true;
        var o = '<object id="' + ID +
            '" type="application/x-shockwave-flash" data="' +
            uri + '" width="0" height="0">' +
            '<param name="movie" value="' +
            uri + '" />' +
            '<param name="FlashVars" value="yid=' +
            _ + '&uid=' +
            uid +
            '&host=KISSY.io" />' +
            '<param name="allowScriptAccess" value="always" />' +
            '</object>',
            c = doc.createElement('div');
        DOM.prepend(c, doc.body || doc.documentElement);
        c.innerHTML = o;
    }

    function XdrTransport(xhrObj) {
        S.log("use flash xdr");
        this.xhrObj = xhrObj;
    }

    S.augment(XdrTransport, {
        // rewrite send to support flash xdr
        send:function() {
            var self = this,
                xhrObj = self.xhrObj,
                c = xhrObj.config;
            var xdr = c['xdr'] || {};
            // 不提供则使用 cdn 默认的 flash
            _swf(xdr.src || (S.Config.base + "ajax/io.swf"), 1, 1);
            // 简便起见，用轮训
            if (!flash) {
                // S.log("detect xdr flash");
                setTimeout(function() {
                    self.send();
                }, 200);
                return;
            }
            self._uid = S.guid();
            maps[self._uid] = self;

            // ie67 send 出错？
            flash.send(c.url, {
                id:self._uid,
                uid:self._uid,
                method:c.type,
                data:c.hasContent && c.data || {}
            });
        },

        abort:function() {
            flash.abort(this._uid);
        },

        _xdrResponse:function(e, o) {
            // S.log(e);
            var self = this,
                ret,
                xhrObj = self.xhrObj;

            // need decodeURI to get real value from flash returned value
            xhrObj.responseText = decodeURI(o.c.responseText);

            switch (e) {
                case 'success':
                    ret = { status: 200, statusText: "success" };
                    delete maps[o.id];
                    break;
                case 'abort':
                    delete maps[o.id];
                    break;
                case 'timeout':
                case 'transport error':
                case 'failure':
                    delete maps[o.id];
                    ret = { status: 500, statusText: e };
                    break;
            }
            if (ret) {
                xhrObj.callback(ret.status, ret.statusText);
            }
        }
    });

    /*called by flash*/
    io['applyTo'] = function(_, cmd, args) {
        // S.log(cmd + " execute");
        var cmds = cmd.split("."),
            func = S;
        S.each(cmds, function(c) {
            func = func[c];
        });
        func.apply(null, args);
    };

    // when flash is loaded
    io['xdrReady'] = function() {
        flash = doc.getElementById(ID);
    };

    /**
     * when response is returned from server
     * @param e response status
     * @param o internal data
     * @param c internal data
     */
    io['xdrResponse'] = function(e, o, c) {
        var xhr = maps[o.uid];
        xhr && xhr._xdrResponse(e, o, c);
    };

    // export io for flash to call
    S.io = io;

    return XdrTransport;

}, {
    requires:["./base",'dom']
});

/**
 * ajax xhr transport class , route subdomain , xdr
 * @author yiminghe@gmail.com
 */
KISSY.add("ajax/xhr", function(S, io, XhrBase, SubDomain, XdrTransport) {

    var rurl = /^([\w\+\.\-]+:)(?:\/\/([^\/?#:]*)(?::(\d+))?)?/;

    var _XDomainRequest = window['XDomainRequest'];

    var detectXhr = XhrBase.xhr();

    if (detectXhr) {

        // slice last two pars
        // xx.taobao.com => taobao.com
        function getMainDomain(host) {
            var t = host.split('.');
            if (t.length < 2) {
                return t.join(".");
            } else {
                return t.reverse().slice(0, 2).reverse().join('.');
            }
        }

        function XhrTransport(xhrObj) {
            var c = xhrObj.config,
                xdrCfg = c['xdr'] || {};

            if (c.crossDomain) {

                var parts = c.url.match(rurl);

                // 跨子域
                if (getMainDomain(location.hostname) == getMainDomain(parts[2])) {
                    return new SubDomain(xhrObj);
                }

                /**
                 * ie>7 强制使用 flash xdr
                 */
                if (!("withCredentials" in detectXhr) &&
                    (String(xdrCfg.use) === "flash" || !_XDomainRequest)) {
                    return new XdrTransport(xhrObj);
                }
            }

            this.xhrObj = xhrObj;

            return undefined;
        }

        S.augment(XhrTransport, XhrBase.proto, {

            send:function() {
                var self = this,
                    xhrObj = self.xhrObj,
                    c = xhrObj.config;
                self.xhr = XhrBase.xhr(c.crossDomain);
                self.sendInternal();
            }

        });

        io.setupTransport("*", XhrTransport);
    }

    return io;
}, {
    requires:["./base",'./xhrbase','./subdomain',"./xdr"]
});

/**
 * 借鉴 jquery，优化使用原型替代闭包
 **/

/**
 * script transport for kissy io
 * @description: modified version of S.getScript , add abort ability
 * @author  yiminghe@gmail.com
 */
KISSY.add("ajax/script", function(S, io) {

    var doc = document;

    var OK_CODE = 200,ERROR_CODE = 500;

    io.setupConfig({
        accepts:{
            script:"text/javascript, " +
                "application/javascript, " +
                "application/ecmascript, " +
                "application/x-ecmascript"
        },

        contents:{
            script:/javascript|ecmascript/
        },
        converters:{
            text:{
                // 如果以 xhr+eval 需要下面的，
                // 否则直接 script node 不需要，引擎自己执行了，
                // 不需要手动 eval
                script:function(text) {
                    S.globalEval(text);
                    return text;
                }
            }
        }
    });

    function ScriptTransport(xhrObj) {
        // 优先使用 xhr+eval 来执行脚本, ie 下可以探测到（更多）失败状态
        if (!xhrObj.config.crossDomain &&
            !xhrObj.config['forceScript']) {
            return new (io.getTransport("*"))(xhrObj);
        }
        this.xhrObj = xhrObj;
        return 0;
    }

    S.augment(ScriptTransport, {
        send:function() {
            var self = this,
                script,
                xhrObj = this.xhrObj,
                c = xhrObj.config,
                head = doc['head'] ||
                    doc.getElementsByTagName("head")[0] ||
                    doc.documentElement;
            self.head = head;
            script = doc.createElement("script");
            self.script = script;
            script.async = "async";

            if (c['scriptCharset']) {
                script.charset = c['scriptCharset'];
            }

            script.src = c.url;

            script.onerror =
                script.onload =
                    script.onreadystatechange = function(e) {
                        e = e || window.event;
                        // firefox onerror 没有 type ?!
                        self._callback((e.type || "error").toLowerCase());
                    };

            head.insertBefore(script, head.firstChild);
        },

        _callback:function(event, abort) {
            var script = this.script,
                xhrObj = this.xhrObj,
                head = this.head;

            // 防止重复调用,成功后 abort
            if (!script) {
                return;
            }

            if (abort ||
                !script.readyState ||
                /loaded|complete/.test(script.readyState)
                || event == "error"
                ) {

                script['onerror'] = script.onload = script.onreadystatechange = null;

                // Remove the script
                if (head && script.parentNode) {
                    // ie 报错载入无效 js
                    // 怎么 abort ??
                    // script.src = "#";
                    head.removeChild(script);
                }

                this.script = undefined;
                this.head = undefined;

                // Callback if not abort
                if (!abort && event != "error") {
                    xhrObj.callback(OK_CODE, "success");
                }
                // 非 ie<9 可以判断出来
                else if (event == "error") {
                    xhrObj.callback(ERROR_CODE, "scripterror");
                }
            }
        },

        abort:function() {
            this._callback(0, 1);
        }
    });

    io.setupTransport("script", ScriptTransport);

    return io;

}, {
    requires:['./base','./xhr']
});

/**
 * jsonp transport based on script transport
 * @author  yiminghe@gmail.com
 */
KISSY.add("ajax/jsonp", function(S, io) {

    io.setupConfig({
        jsonp:"callback",
        jsonpCallback:function() {
            //不使用 now() ，极端情况下可能重复
            return S.guid("jsonp");
        }
    });

    io.on("start", function(e) {
        var xhr = e.xhr,c = xhr.config;
        if (c.dataType[0] == "jsonp") {
            var response,
                cJsonpCallback = c.jsonpCallback,
                jsonpCallback = S.isFunction(cJsonpCallback) ?
                    cJsonpCallback() :
                    cJsonpCallback,
                previous = window[ jsonpCallback ];

            c.url += ( /\?/.test(c.url) ? "&" : "?" ) + c.jsonp + "=" + jsonpCallback;

            // build temporary JSONP function
            window[jsonpCallback] = function(r) {
                // 使用数组，区别：故意调用了 jsonpCallback(undefined) 与 根本没有调用
                // jsonp 返回了数组
                if (arguments.length > 1) {
                    r = S.makeArray(arguments);
                }
                response = [r];
            };

            // cleanup whether success or failure
            xhr.on("complete", function() {
                window[ jsonpCallback ] = previous;
                if (previous === undefined) {
                    try {
                        delete window[ jsonpCallback ];
                    } catch(e) {
                        //S.log("delete window variable error : ");
                        //S.log(e);
                    }
                } else if (response) {
                    // after io success handler called
                    // then call original existed jsonpcallback
                    previous(response[0]);
                }
            });

            xhr.converters = xhr.converters || {};
            xhr.converters.script = xhr.converters.script || {};

            // script -> jsonp ,jsonp need to see json not as script
            xhr.converters.script.json = function() {
                if (!response) {
                    S.error(" not call jsonpCallback : " + jsonpCallback)
                }
                return response[0];
            };

            c.dataType.length = 2;
            // 利用 script transport 发送 script 请求
            c.dataType[0] = 'script';
            c.dataType[1] = 'json';
        }
    });

    return io;
}, {
    requires:['./base']
});

KISSY.add("ajax/form", function(S, io, DOM, FormSerializer) {

    io.on("start", function(e) {
        //debugger
        var xhr = e.xhr,
            c = xhr.config;
        // serialize form if needed
        if (c.form) {
            var form = DOM.get(c.form),
                enctype = form['encoding'] || form.enctype;
            // 上传有其他方法
            if (enctype.toLowerCase() != "multipart/form-data") {
                // when get need encode
                var formParam = FormSerializer.serialize(form);

                if (formParam) {
                    if (c.hasContent) {
                        // post 加到 data 中
                        c.data = c.data || "";
                        if (c.data) {
                            c.data += "&";
                        }
                        c.data += formParam;
                    } else {
                        // get 直接加到 url
                        c.url += ( /\?/.test(c.url) ? "&" : "?" ) + formParam;
                    }
                }
            } else {
                var d = c.dataType[0];
                if (d == "*") {
                    d = "text";
                }
                c.dataType.length = 2;
                c.dataType[0] = "iframe";
                c.dataType[1] = d;
            }
        }
    });

    return io;

}, {
        requires:['./base',"dom","./form-serializer"]
    });

/**
 * non-refresh upload file with form by iframe
 * @author  yiminghe@gmail.com
 */
KISSY.add("ajax/iframe-upload", function(S, DOM, Event, io) {

    var doc = document;

    var OK_CODE = 200,ERROR_CODE = 500,BREATH_INTERVAL = 30;

    // iframe 内的内容就是 body.innerText
    io.setupConfig({
        converters:{
            // iframe 到其他类型的转化和 text 一样
            iframe:io.getConfig().converters.text,
            text:{
                iframe:function(text) {
                    return text;
                }
            }}});

    function createIframe(xhr) {
        var id = S.guid("ajax-iframe");
        xhr.iframe = DOM.create("<iframe " +
            " id='" + id + "'" +
            // need name for target of form
            " name='" + id + "'" +
            " style='position:absolute;left:-9999px;top:-9999px;'/>");
        xhr.iframeId = id;
        DOM.prepend(xhr.iframe, doc.body || doc.documentElement);
    }

    function addDataToForm(data, form, serializeArray) {
        data = S.unparam(data);
        var ret = [];
        for (var d in data) {
            var isArray = S.isArray(data[d]),
                vs = S.makeArray(data[d]);
            // 数组和原生一样对待，创建多个同名输入域
            for (var i = 0; i < vs.length; i++) {
                var e = doc.createElement("input");
                e.type = 'hidden';
                e.name = d + (isArray && serializeArray ? "[]" : "");
                e.value = vs[i];
                DOM.append(e, form);
                ret.push(e);
            }
        }
        return ret;
    }


    function removeFieldsFromData(fields) {
        DOM.remove(fields);
    }

    function IframeTransport(xhr) {
        this.xhr = xhr;
    }

    S.augment(IframeTransport, {
        send:function() {
            //debugger
            var xhr = this.xhr,
                c = xhr.config,
                fields,
                form = DOM.get(c.form);

            this.attrs = {
                target:DOM.attr(form, "target") || "",
                action:DOM.attr(form, "action") || ""
            };
            this.form = form;

            createIframe(xhr);

            // set target to iframe to avoid main page refresh
            DOM.attr(form, {"target": xhr.iframeId,"action": c.url});

            if (c.data) {
                fields = addDataToForm(c.data, form, c.serializeArray);
            }

            this.fields = fields;

            var iframe = xhr.iframe;

            Event.on(iframe, "load error", this._callback, this);

            form.submit();

        },

        _callback:function(event
                           //, abort
            ) {
            //debugger
            var form = this.form,
                xhr = this.xhr,
                eventType = event.type,
                iframe = xhr.iframe;
            // 防止重复调用 , 成功后 abort
            if (!iframe) {
                return;
            }

            DOM.attr(form, this.attrs);

            if (eventType == "load") {
                var iframeDoc = iframe.contentWindow.document;
                xhr.responseXML = iframeDoc;
                xhr.responseText = DOM.text(iframeDoc.body);
                xhr.callback(OK_CODE, "success");
            } else if (eventType == 'error') {
                xhr.callback(ERROR_CODE, "error");
            }

            removeFieldsFromData(this.fields);


            Event.detach(iframe);

            setTimeout(function() {
                // firefox will keep loading if not settimeout
                DOM.remove(iframe);
            }, BREATH_INTERVAL);

            // nullify to prevent memory leak?
            xhr.iframe = null;
        },

        abort:function() {
            this._callback(0, 1);
        }
    });

    io.setupTransport("iframe", IframeTransport);

    return io;

}, {
    requires:["dom","event","./base"]
});

KISSY.add("ajax", function(S, serializer, io) {
    var undef = undefined;
    // some shortcut
    S.mix(io, {

        /**
         * form 序列化
         * @param formElement {HTMLFormElement} 将要序列化的 form 元素
         */
        serialize:serializer.serialize,

        get: function(url, data, callback, dataType, _t) {
            // data 参数可省略
            if (S.isFunction(data)) {
                dataType = callback;
                callback = data;
                data = undef;
            }

            return io({
                type: _t || "get",
                url: url,
                data: data,
                success: callback,
                dataType: dataType
            });
        },

        post: function(url, data, callback, dataType) {
            if (S.isFunction(data)) {
                dataType = callback;
                callback = data;
                data = undef;
            }
            return io.get(url, data, callback, dataType, "post");
        },

        jsonp: function(url, data, callback) {
            if (S.isFunction(data)) {
                callback = data;
                data = undef;
            }
            return io.get(url, data, callback, "jsonp");
        },

        // 和 S.getScript 保持一致
        // 更好的 getScript 可以用
        /*
         io({
         dataType:'script'
         });
         */
        getScript:S.getScript,

        getJSON: function(url, data, callback) {
            if (S.isFunction(data)) {
                callback = data;
                data = undef;
            }
            return io.get(url, data, callback, "json");
        },

        upload:function(url, form, data, callback, dataType) {
            if (S.isFunction(data)) {
                dataType = callback;
                callback = data;
                data = undef;
            }
            return io({
                url:url,
                type:'post',
                dataType:dataType,
                form:form,
                data:data,
                success:callback
            });
        }
    });

    return io;
}, {
    requires:[
        "ajax/form-serializer",
        "ajax/base",
        "ajax/xhrobject",
        "ajax/xhr",
        "ajax/script",
        "ajax/jsonp",
        "ajax/form",
        "ajax/iframe-upload"]
});

/**
 * @module  Attribute
 * @author  yiminghe@gmail.com, lifesinger@gmail.com
 */
KISSY.add('base/attribute', function(S, undef) {

    /**
     * 提供属性管理机制
     * @name Attribute
     * @class
     */
    function Attribute() {
        /**
         * attribute meta information
         {
         attrName: {
         getter: function,
         setter: function,
         value: v, // default value
         valueFn: function
         }
         }
         */
        this.__attrs = {};

        /**
         * attribute value
         {
         attrName: attrVal
         }
         */
        this.__attrVals = {};
    }

    S.augment(Attribute,
        /**
         * @lends Attribute.prototype
         */
        {

            __getDefAttrs: function() {
                return S.clone(this.__attrs);
            },

            /**
             * Adds an attribute with the provided configuration to the host object.
             * The config supports the following properties:
             * {
             *     value: 'the default value',
             *     valueFn: function
             *     setter: function
             *     getter: function
             * }
             * @param {boolean} override whether override existing attribute config ,default true
             */
            addAttr: function(name, attrConfig, override) {
                var host = this;
                if (!host.__attrs[name]) {
                    host.__attrs[name] = S.clone(attrConfig || {});
                } else {
                    S.mix(host.__attrs[name], attrConfig, override);
                }
                return host;
            },

            /**
             * Configures a group of attributes, and sets initial values.
             * @param {Object} attrConfigs  An object with attribute name/configuration pairs.
             * @param {Object} values An object with attribute name/value pairs, defining the initial values to apply.
             *        Values defined in the cfgs argument will be over-written by values in this argument.
             */
            addAttrs: function(attrConfigs, values) {
                var host = this;

                S.each(attrConfigs, function(attrConfig, name) {
                    if (name in values) {
                        attrConfig.value = values[name];
                    }
                    host.addAttr(name, attrConfig);
                });

                return host;
            },

            /**
             * Checks if the given attribute has been added to the host.
             */
            hasAttr: function(name) {
                return name && this.__attrs.hasOwnProperty(name);
            },

            /**
             * Removes an attribute from the host object.
             */
            removeAttr: function(name) {
                var host = this;

                if (host.hasAttr(name)) {
                    delete host.__attrs[name];
                    delete host.__attrVals[name];
                }

                return host;
            },

            /**
             * Sets the value of an attribute.
             */
            set: function(name, value) {
                var host = this,
                    prevVal = host.get(name);

                // if no change, just return
                if (prevVal === value) {
                    return;
                }

                // check before event
                if (false === host.__fireAttrChange('before', name, prevVal, value)) {
                    return;
                }

                // set it
                host.__set(name, value);

                // fire after event
                host.__fireAttrChange('after', name, prevVal, host.__attrVals[name]);

                return host;
            },

            __fireAttrChange: function(when, name, prevVal, newVal) {
                return this.fire(when + capitalFirst(name) + 'Change', {
                    attrName: name,
                    prevVal: prevVal,
                    newVal: newVal
                });
            },

            /**
             * internal use, no event involved, just set.
             * @private
             */
            __set: function(name, value) {
                var host = this,
                    setValue,
                    // if host does not have meta info corresponding to (name,value)
                    // then register on demand in order to collect all data meta info
                    // 一定要注册属性元数据，否则其他模块通过 _attrs 不能枚举到所有有效属性
                    // 因为属性在声明注册前可以直接设置值
                    attrConfig = host.__attrs[name] = host.__attrs[name] || {},
                    setter = attrConfig['setter'];

                // if setter has effect
                if (setter) {
                    setValue = setter.call(host, value);
                }
                if (setValue !== undef) {
                    value = setValue;
                }

                // finally set
                host.__attrVals[name] = value;
            },

            /**
             * Gets the current value of the attribute.
             */
            get: function(name) {
                var host = this, attrConfig, getter, ret;

                attrConfig = host.__attrs[name];
                getter = attrConfig && attrConfig['getter'];

                // get user-set value or default value
                //user-set value takes privilege
                ret = name in host.__attrVals ?
                    host.__attrVals[name] :
                    host.__getDefAttrVal(name);

                // invoke getter for this attribute
                if (getter) {
                    ret = getter.call(host, ret);
                }

                return ret;
            },

            __getDefAttrVal: function(name) {
                var host = this,
                    attrConfig = host.__attrs[name],
                    valFn, val;

                if (!attrConfig) {
                    return;
                }

                if ((valFn = attrConfig.valueFn)) {
                    val = valFn.call(host);
                    if (val !== undef) {
                        attrConfig.value = val;
                    }
                    delete attrConfig.valueFn;
                }

                return attrConfig.value;
            },

            /**
             * Resets the value of an attribute.just reset what addAttr set  (not what invoker set when call new Xx(cfg))
             * @param {String} name name of attribute
             */
            reset: function (name) {
                var host = this;

                if (host.hasAttr(name)) {
                    // if attribute does not have default value, then set to undefined.
                    return host.set(name, host.__getDefAttrVal(name));
                }

                // reset all
                for (name in host.__attrs) {
                    if (host.hasAttr(name)) {
                        host.reset(name);
                    }
                }

                return host;
            }
        });

    function capitalFirst(s) {
        s += '';
        return s.charAt(0).toUpperCase() + s.substring(1);
    }

    Attribute['__capitalFirst'] = capitalFirst;

    return Attribute;
});

/**
 * @module  Base
 * @author  yiminghe@gmail.com,lifesinger@gmail.com
 */
KISSY.add('base/base', function (S, Attribute, Event) {

    /**
     * Base for class-based component
     * @name Base
     * @extends Event.Target
     * @extends Attribute
     * @class
     */
    function Base(config) {
        Attribute.call(this);
        var c = this.constructor;

        // define
        while (c) {
            addAttrs(this, c['ATTRS']);
            c = c.superclass ? c.superclass.constructor : null;
        }
        // initial
        initAttrs(this, config);
    }

    function addAttrs(host, attrs) {
        if (attrs) {
            for (var attr in attrs) {
                // 子类上的 ATTRS 配置优先
                if (attrs.hasOwnProperty(attr)) {
                    //父类后加，父类不覆盖子类的相同设置
                    host.addAttr(attr, attrs[attr], false);
                }
            }
        }
    }

    function initAttrs(host, config) {
        if (config) {
            for (var attr in config) {
                if (config.hasOwnProperty(attr)) {
                    //用户设置会调用 setter 的，但不会触发属性变化事件
                    host.__set(attr, config[attr]);
                }

            }
        }
    }

    S.augment(Base, Event.Target, Attribute);
    return Base;
}, {
    requires:["./attribute","event"]
});

KISSY.add("base", function(S, Base) {
    return Base;
}, {
    requires:["base/base"]
});

/**
 * @module  cookie
 * @author  lifesinger@gmail.com
 */
KISSY.add('cookie/base', function(S) {

    var doc = document,
        MILLISECONDS_OF_DAY = 24 * 60 * 60 * 1000,
        encode = encodeURIComponent,
        decode = decodeURIComponent;


    function isNotEmptyString(val) {
        return S.isString(val) && val !== '';
    }

    return {

        /**
         * 获取 cookie 值
         * @return {string} 如果 name 不存在，返回 undefined
         */
        get: function(name) {
            var ret, m;

            if (isNotEmptyString(name)) {
                if ((m = String(doc.cookie).match(
                    new RegExp('(?:^| )' + name + '(?:(?:=([^;]*))|;|$)')))) {
                    ret = m[1] ? decode(m[1]) : '';
                }
            }
            return ret;
        },

        set: function(name, val, expires, domain, path, secure) {
            var text = String(encode(val)), date = expires;

            // 从当前时间开始，多少天后过期
            if (typeof date === 'number') {
                date = new Date();
                date.setTime(date.getTime() + expires * MILLISECONDS_OF_DAY);
            }
            // expiration date
            if (date instanceof Date) {
                text += '; expires=' + date.toUTCString();
            }

            // domain
            if (isNotEmptyString(domain)) {
                text += '; domain=' + domain;
            }

            // path
            if (isNotEmptyString(path)) {
                text += '; path=' + path;
            }

            // secure
            if (secure) {
                text += '; secure';
            }

            //S.log(text);
            doc.cookie = name + '=' + text;
        },

        remove: function(name, domain, path, secure) {
            // 置空，并立刻过期
            this.set(name, '', -1, domain, path, secure);
        }
    };

});

/**
 * NOTES:
 *
 *  2010.04
 *   - get 方法要考虑 ie 下，
 *     值为空的 cookie 为 'test3; test3=3; test3tt=2; test1=t1test3; test3', 没有等于号。
 *     除了正则获取，还可以 split 字符串的方式来获取。
 *   - api 设计上，原本想借鉴 jQuery 的简明风格：S.cookie(name, ...), 但考虑到可扩展性，目前
 *     独立成静态工具类的方式更优。
 */

KISSY.add("cookie", function(S,C) {
    return C;
}, {
    requires:["cookie/base"]
});

KISSY.add("core", function(S, UA, DOM, Event, Node, JSON, Ajax, Anim, Base, Cookie) {
    Ajax.getScript=S.getScript;
    var re = {
        UA:UA,
        DOM:DOM,
        Event:Event,
        EventTarget:Event.Target,
        EventObject:Event.Object,
        Node:Node,
        NodeList:Node,
        JSON:JSON,
        Ajax:Ajax,
        IO:Ajax,
        ajax:Ajax,
        io:Ajax,
        jsonp:Ajax.jsonp,
        Anim:Anim,
        Easing:Anim.Easing,
        Base:Base,
        Cookie:Cookie,
        one:Node.one,
        all:Node.all,
        get:DOM.get,
        query:DOM.query
    };
    S.mix(S, re);
    return re;
}, {
    requires:[
        "ua",
        "dom",
        "event",
        "node",
        "json",
        "ajax",
        "anim",
        "base",
        "cookie"
    ]
});



KISSY.use('core');
/*
Copyright 2011, KISSY UI Library v1.20dev
MIT Licensed
build time: Sep 22 13:54
*/
/*!
 * Sizzle CSS Selector Engine
 *  Copyright 2011, The Dojo Foundation
 *  Released under the MIT, BSD, and GPL Licenses.
 *  More information: http://sizzlejs.com/
 */
KISSY.add('sizzle/impl', function(S) {

    var chunker = /((?:\((?:\([^()]+\)|[^()]+)+\)|\[(?:\[[^\[\]]*\]|['"][^'"]*['"]|[^\[\]'"]+)+\]|\\.|[^ >+~,(\[\\]+)+|[>+~])(\s*,\s*)?((?:.|\r|\n)*)/g,
        done = 0,
        toString = Object.prototype.toString,
        hasDuplicate = false,
        baseHasDuplicate = true,
        rBackslash = /\\/g,
        rNonWord = /\W/;

// Here we check if the JavaScript engine is using some sort of
// optimization where it does not always call our comparision
// function. If that is the case, discard the hasDuplicate value.
//   Thus far that includes Google Chrome.
    [0, 0].sort(function() {
        baseHasDuplicate = false;
        return 0;
    });

    var Sizzle = function(selector, context, results, seed) {
        results = results || [];
        context = context || document;

        var origContext = context;

        if (context.nodeType !== 1 && context.nodeType !== 9) {
            return [];
        }

        if (!selector || typeof selector !== "string") {
            return results;
        }

        var m, set, checkSet, extra, ret, cur, pop, i,
            prune = true,
            contextXML = Sizzle.isXML(context),
            parts = [],
            soFar = selector;

        // Reset the position of the chunker regexp (start from head)
        do {
            chunker.exec("");
            m = chunker.exec(soFar);

            if (m) {
                soFar = m[3];

                parts.push(m[1]);

                if (m[2]) {
                    extra = m[3];
                    break;
                }
            }
        } while (m);

        if (parts.length > 1 && origPOS.exec(selector)) {

            if (parts.length === 2 && Expr.relative[ parts[0] ]) {
                set = posProcess(parts[0] + parts[1], context);

            } else {
                set = Expr.relative[ parts[0] ] ?
                    [ context ] :
                    Sizzle(parts.shift(), context);

                while (parts.length) {
                    selector = parts.shift();

                    if (Expr.relative[ selector ]) {
                        selector += parts.shift();
                    }

                    set = posProcess(selector, set);
                }
            }

        } else {
            // Take a shortcut and set the context if the root selector is an ID
            // (but not if it'll be faster if the inner selector is an ID)
            if (!seed && parts.length > 1 && context.nodeType === 9 && !contextXML &&
                Expr.match.ID.test(parts[0]) && !Expr.match.ID.test(parts[parts.length - 1])) {

                ret = Sizzle.find(parts.shift(), context, contextXML);
                context = ret.expr ?
                    Sizzle.filter(ret.expr, ret.set)[0] :
                    ret.set[0];
            }

            if (context) {
                ret = seed ?
                { expr: parts.pop(), set: makeArray(seed) } :
                    Sizzle.find(parts.pop(), parts.length === 1 && (parts[0] === "~" || parts[0] === "+") && context.parentNode ? context.parentNode : context, contextXML);

                set = ret.expr ?
                    Sizzle.filter(ret.expr, ret.set) :
                    ret.set;

                if (parts.length > 0) {
                    checkSet = makeArray(set);

                } else {
                    prune = false;
                }

                while (parts.length) {
                    cur = parts.pop();
                    pop = cur;

                    if (!Expr.relative[ cur ]) {
                        cur = "";
                    } else {
                        pop = parts.pop();
                    }

                    if (pop == null) {
                        pop = context;
                    }

                    Expr.relative[ cur ](checkSet, pop, contextXML);
                }

            } else {
                checkSet = parts = [];
            }
        }

        if (!checkSet) {
            checkSet = set;
        }

        if (!checkSet) {
            Sizzle.error(cur || selector);
        }

        if (toString.call(checkSet) === "[object Array]") {
            if (!prune) {
                results.push.apply(results, checkSet);

            } else if (context && context.nodeType === 1) {
                for (i = 0; checkSet[i] != null; i++) {
                    if (checkSet[i] && (checkSet[i] === true || checkSet[i].nodeType === 1 && Sizzle.contains(context, checkSet[i]))) {
                        results.push(set[i]);
                    }
                }

            } else {
                for (i = 0; checkSet[i] != null; i++) {
                    if (checkSet[i] && checkSet[i].nodeType === 1) {
                        results.push(set[i]);
                    }
                }
            }

        } else {
            makeArray(checkSet, results);
        }

        if (extra) {
            Sizzle(extra, origContext, results, seed);
            Sizzle.uniqueSort(results);
        }

        return results;
    };

    Sizzle.uniqueSort = function(results) {
        if (sortOrder) {
            hasDuplicate = baseHasDuplicate;
            results.sort(sortOrder);

            if (hasDuplicate) {
                for (var i = 1; i < results.length; i++) {
                    if (results[i] === results[ i - 1 ]) {
                        results.splice(i--, 1);
                    }
                }
            }
        }

        return results;
    };

    Sizzle.matches = function(expr, set) {
        return Sizzle(expr, null, null, set);
    };

    Sizzle.matchesSelector = function(node, expr) {
        return Sizzle(expr, null, null, [node]).length > 0;
    };

    Sizzle.find = function(expr, context, isXML) {
        var set;

        if (!expr) {
            return [];
        }

        for (var i = 0, l = Expr.order.length; i < l; i++) {
            var match,
                type = Expr.order[i];

            if ((match = Expr.leftMatch[ type ].exec(expr))) {
                var left = match[1];
                match.splice(1, 1);

                if (left.substr(left.length - 1) !== "\\") {
                    match[1] = (match[1] || "").replace(rBackslash, "");
                    set = Expr.find[ type ](match, context, isXML);

                    if (set != null) {
                        expr = expr.replace(Expr.match[ type ], "");
                        break;
                    }
                }
            }
        }

        if (!set) {
            set = typeof context.getElementsByTagName !== "undefined" ?
                context.getElementsByTagName("*") :
                [];
        }

        return { set: set, expr: expr };
    };

    Sizzle.filter = function(expr, set, inplace, not) {
        var match, anyFound,
            old = expr,
            result = [],
            curLoop = set,
            isXMLFilter = set && set[0] && Sizzle.isXML(set[0]);

        while (expr && set.length) {
            for (var type in Expr.filter) {
                if ((match = Expr.leftMatch[ type ].exec(expr)) != null && match[2]) {
                    var found, item,
                        filter = Expr.filter[ type ],
                        left = match[1];

                    anyFound = false;

                    match.splice(1, 1);

                    if (left.substr(left.length - 1) === "\\") {
                        continue;
                    }

                    if (curLoop === result) {
                        result = [];
                    }

                    if (Expr.preFilter[ type ]) {
                        match = Expr.preFilter[ type ](match, curLoop, inplace, result, not, isXMLFilter);

                        if (!match) {
                            anyFound = found = true;

                        } else if (match === true) {
                            continue;
                        }
                    }

                    if (match) {
                        for (var i = 0; (item = curLoop[i]) != null; i++) {
                            if (item) {
                                found = filter(item, match, i, curLoop);
                                var pass = not ^ !!found;

                                if (inplace && found != null) {
                                    if (pass) {
                                        anyFound = true;

                                    } else {
                                        curLoop[i] = false;
                                    }

                                } else if (pass) {
                                    result.push(item);
                                    anyFound = true;
                                }
                            }
                        }
                    }

                    if (found !== undefined) {
                        if (!inplace) {
                            curLoop = result;
                        }

                        expr = expr.replace(Expr.match[ type ], "");

                        if (!anyFound) {
                            return [];
                        }

                        break;
                    }
                }
            }

            // Improper expression
            if (expr === old) {
                if (anyFound == null) {
                    Sizzle.error(expr);

                } else {
                    break;
                }
            }

            old = expr;
        }

        return curLoop;
    };

    Sizzle.error = function(msg) {
        throw "Syntax error, unrecognized expression: " + msg;
    };

    var Expr = Sizzle.selectors = {
        order: [ "ID", "NAME", "TAG" ],

        match: {
            ID: /#((?:[\w\u00c0-\uFFFF\-]|\\.)+)/,
            CLASS: /\.((?:[\w\u00c0-\uFFFF\-]|\\.)+)/,
            NAME: /\[name=['"]*((?:[\w\u00c0-\uFFFF\-]|\\.)+)['"]*\]/,
            ATTR: /\[\s*((?:[\w\u00c0-\uFFFF\-]|\\.)+)\s*(?:(\S?=)\s*(?:(['"])(.*?)\3|(#?(?:[\w\u00c0-\uFFFF\-]|\\.)*)|)|)\s*\]/,
            TAG: /^((?:[\w\u00c0-\uFFFF\*\-]|\\.)+)/,
            CHILD: /:(only|nth|last|first)-child(?:\(\s*(even|odd|(?:[+\-]?\d+|(?:[+\-]?\d*)?n\s*(?:[+\-]\s*\d+)?))\s*\))?/,
            POS: /:(nth|eq|gt|lt|first|last|even|odd)(?:\((\d*)\))?(?=[^\-]|$)/,
            PSEUDO: /:((?:[\w\u00c0-\uFFFF\-]|\\.)+)(?:\((['"]?)((?:\([^\)]+\)|[^\(\)]*)+)\2\))?/
        },

        leftMatch: {},

        attrMap: {
            "class": "className",
            "for": "htmlFor"
        },

        attrHandle: {
            href: function(elem) {
                return elem.getAttribute("href");
            },
            type: function(elem) {
                return elem.getAttribute("type");
            }
        },

        relative: {
            "+": function(checkSet, part) {
                var isPartStr = typeof part === "string",
                    isTag = isPartStr && !rNonWord.test(part),
                    isPartStrNotTag = isPartStr && !isTag;

                if (isTag) {
                    part = part.toLowerCase();
                }

                for (var i = 0, l = checkSet.length, elem; i < l; i++) {
                    if ((elem = checkSet[i])) {
                        while ((elem = elem.previousSibling) && elem.nodeType !== 1) {
                        }

                        checkSet[i] = isPartStrNotTag || elem && elem.nodeName.toLowerCase() === part ?
                            elem || false :
                            elem === part;
                    }
                }

                if (isPartStrNotTag) {
                    Sizzle.filter(part, checkSet, true);
                }
            },

            ">": function(checkSet, part) {
                var elem,
                    isPartStr = typeof part === "string",
                    i = 0,
                    l = checkSet.length;

                if (isPartStr && !rNonWord.test(part)) {
                    part = part.toLowerCase();

                    for (; i < l; i++) {
                        elem = checkSet[i];

                        if (elem) {
                            var parent = elem.parentNode;
                            checkSet[i] = parent.nodeName.toLowerCase() === part ? parent : false;
                        }
                    }

                } else {
                    for (; i < l; i++) {
                        elem = checkSet[i];

                        if (elem) {
                            checkSet[i] = isPartStr ?
                                elem.parentNode :
                                elem.parentNode === part;
                        }
                    }

                    if (isPartStr) {
                        Sizzle.filter(part, checkSet, true);
                    }
                }
            },

            "": function(checkSet, part, isXML) {
                var nodeCheck,
                    doneName = done++,
                    checkFn = dirCheck;

                if (typeof part === "string" && !rNonWord.test(part)) {
                    part = part.toLowerCase();
                    nodeCheck = part;
                    checkFn = dirNodeCheck;
                }

                checkFn("parentNode", part, doneName, checkSet, nodeCheck, isXML);
            },

            "~": function(checkSet, part, isXML) {
                var nodeCheck,
                    doneName = done++,
                    checkFn = dirCheck;

                if (typeof part === "string" && !rNonWord.test(part)) {
                    part = part.toLowerCase();
                    nodeCheck = part;
                    checkFn = dirNodeCheck;
                }

                checkFn("previousSibling", part, doneName, checkSet, nodeCheck, isXML);
            }
        },

        find: {
            ID: function(match, context, isXML) {
                if (typeof context.getElementById !== "undefined" && !isXML) {
                    var m = context.getElementById(match[1]);
                    // Check parentNode to catch when Blackberry 4.6 returns
                    // nodes that are no longer in the document #6963
                    return m && m.parentNode ? [m] : [];
                }
            },

            NAME: function(match, context) {
                if (typeof context.getElementsByName !== "undefined") {
                    var ret = [],
                        results = context.getElementsByName(match[1]);

                    for (var i = 0, l = results.length; i < l; i++) {
                        if (results[i].getAttribute("name") === match[1]) {
                            ret.push(results[i]);
                        }
                    }

                    return ret.length === 0 ? null : ret;
                }
            },

            TAG: function(match, context) {
                if (typeof context.getElementsByTagName !== "undefined") {
                    return context.getElementsByTagName(match[1]);
                }
            }
        },
        preFilter: {
            CLASS: function(match, curLoop, inplace, result, not, isXML) {
                match = " " + match[1].replace(rBackslash, "") + " ";

                if (isXML) {
                    return match;
                }

                for (var i = 0, elem; (elem = curLoop[i]) != null; i++) {
                    if (elem) {
                        if (not ^ (elem.className && (" " + elem.className + " ").replace(/[\t\n\r]/g, " ").indexOf(match) >= 0)) {
                            if (!inplace) {
                                result.push(elem);
                            }

                        } else if (inplace) {
                            curLoop[i] = false;
                        }
                    }
                }

                return false;
            },

            ID: function(match) {
                return match[1].replace(rBackslash, "");
            },

            TAG: function(match, curLoop) {
                return match[1].replace(rBackslash, "").toLowerCase();
            },

            CHILD: function(match) {
                if (match[1] === "nth") {
                    if (!match[2]) {
                        Sizzle.error(match[0]);
                    }

                    match[2] = match[2].replace(/^\+|\s*/g, '');

                    // parse equations like 'even', 'odd', '5', '2n', '3n+2', '4n-1', '-n+6'
                    var test = /(-?)(\d*)(?:n([+\-]?\d*))?/.exec(
                        match[2] === "even" && "2n" || match[2] === "odd" && "2n+1" ||
                            !/\D/.test(match[2]) && "0n+" + match[2] || match[2]);

                    // calculate the numbers (first)n+(last) including if they are negative
                    match[2] = (test[1] + (test[2] || 1)) - 0;
                    match[3] = test[3] - 0;
                }
                else if (match[2]) {
                    Sizzle.error(match[0]);
                }

                // TODO: Move to normal caching system
                match[0] = done++;

                return match;
            },

            ATTR: function(match, curLoop, inplace, result, not, isXML) {
                var name = match[1] = match[1].replace(rBackslash, "");

                if (!isXML && Expr.attrMap[name]) {
                    match[1] = Expr.attrMap[name];
                }

                // Handle if an un-quoted value was used
                match[4] = ( match[4] || match[5] || "" ).replace(rBackslash, "");

                if (match[2] === "~=") {
                    match[4] = " " + match[4] + " ";
                }

                return match;
            },

            PSEUDO: function(match, curLoop, inplace, result, not) {
                if (match[1] === "not") {
                    // If we're dealing with a complex expression, or a simple one
                    if (( chunker.exec(match[3]) || "" ).length > 1 || /^\w/.test(match[3])) {
                        match[3] = Sizzle(match[3], null, null, curLoop);

                    } else {
                        var ret = Sizzle.filter(match[3], curLoop, inplace, true ^ not);

                        if (!inplace) {
                            result.push.apply(result, ret);
                        }

                        return false;
                    }

                } else if (Expr.match.POS.test(match[0]) || Expr.match.CHILD.test(match[0])) {
                    return true;
                }

                return match;
            },

            POS: function(match) {
                match.unshift(true);

                return match;
            }
        },

        filters: {
            enabled: function(elem) {
                return elem.disabled === false && elem.type !== "hidden";
            },

            disabled: function(elem) {
                return elem.disabled === true;
            },

            checked: function(elem) {
                return elem.checked === true;
            },

            selected: function(elem) {
                // Accessing this property makes selected-by-default
                // options in Safari work properly
                if (elem.parentNode) {
                    elem.parentNode.selectedIndex;
                }

                return elem.selected === true;
            },

            parent: function(elem) {
                return !!elem.firstChild;
            },

            empty: function(elem) {
                return !elem.firstChild;
            },

            has: function(elem, i, match) {
                return !!Sizzle(match[3], elem).length;
            },

            header: function(elem) {
                return (/h\d/i).test(elem.nodeName);
            },

            text: function(elem) {
                var attr = elem.getAttribute("type"), type = elem.type;
                // IE6 and 7 will map elem.type to 'text' for new HTML5 types (search, etc)
                // use getAttribute instead to test this case
                return elem.nodeName.toLowerCase() === "input" && "text" === type && ( attr === type || attr === null );
            },

            radio: function(elem) {
                return elem.nodeName.toLowerCase() === "input" && "radio" === elem.type;
            },

            checkbox: function(elem) {
                return elem.nodeName.toLowerCase() === "input" && "checkbox" === elem.type;
            },

            file: function(elem) {
                return elem.nodeName.toLowerCase() === "input" && "file" === elem.type;
            },

            password: function(elem) {
                return elem.nodeName.toLowerCase() === "input" && "password" === elem.type;
            },

            submit: function(elem) {
                var name = elem.nodeName.toLowerCase();
                return (name === "input" || name === "button") && "submit" === elem.type;
            },

            image: function(elem) {
                return elem.nodeName.toLowerCase() === "input" && "image" === elem.type;
            },

            reset: function(elem) {
                var name = elem.nodeName.toLowerCase();
                return (name === "input" || name === "button") && "reset" === elem.type;
            },

            button: function(elem) {
                var name = elem.nodeName.toLowerCase();
                return name === "input" && "button" === elem.type || name === "button";
            },

            input: function(elem) {
                return (/input|select|textarea|button/i).test(elem.nodeName);
            },

            focus: function(elem) {
                return elem === elem.ownerDocument.activeElement;
            }
        },
        setFilters: {
            first: function(elem, i) {
                return i === 0;
            },

            last: function(elem, i, match, array) {
                return i === array.length - 1;
            },

            even: function(elem, i) {
                return i % 2 === 0;
            },

            odd: function(elem, i) {
                return i % 2 === 1;
            },

            lt: function(elem, i, match) {
                return i < match[3] - 0;
            },

            gt: function(elem, i, match) {
                return i > match[3] - 0;
            },

            nth: function(elem, i, match) {
                return match[3] - 0 === i;
            },

            eq: function(elem, i, match) {
                return match[3] - 0 === i;
            }
        },
        filter: {
            PSEUDO: function(elem, match, i, array) {
                var name = match[1],
                    filter = Expr.filters[ name ];

                if (filter) {
                    return filter(elem, i, match, array);

                } else if (name === "contains") {
                    return (elem.textContent || elem.innerText || Sizzle.getText([ elem ]) || "").indexOf(match[3]) >= 0;

                } else if (name === "not") {
                    var not = match[3];

                    for (var j = 0, l = not.length; j < l; j++) {
                        if (not[j] === elem) {
                            return false;
                        }
                    }

                    return true;

                } else {
                    Sizzle.error(name);
                }
            },

            CHILD: function(elem, match) {
                var type = match[1],
                    node = elem;

                switch (type) {
                    case "only":
                    case "first":
                        while ((node = node.previousSibling)) {
                            if (node.nodeType === 1) {
                                return false;
                            }
                        }

                        if (type === "first") {
                            return true;
                        }

                        node = elem;

                    case "last":
                        while ((node = node.nextSibling)) {
                            if (node.nodeType === 1) {
                                return false;
                            }
                        }

                        return true;

                    case "nth":
                        var first = match[2],
                            last = match[3];

                        if (first === 1 && last === 0) {
                            return true;
                        }

                        var doneName = match[0],
                            parent = elem.parentNode;

                        if (parent && (parent.sizcache !== doneName || !elem.nodeIndex)) {
                            var count = 0;

                            for (node = parent.firstChild; node; node = node.nextSibling) {
                                if (node.nodeType === 1) {
                                    node.nodeIndex = ++count;
                                }
                            }

                            parent.sizcache = doneName;
                        }

                        var diff = elem.nodeIndex - last;

                        if (first === 0) {
                            return diff === 0;

                        } else {
                            return ( diff % first === 0 && diff / first >= 0 );
                        }
                }
            },

            ID: function(elem, match) {
                return elem.nodeType === 1 && elem.getAttribute("id") === match;
            },

            TAG: function(elem, match) {
                return (match === "*" && elem.nodeType === 1) || elem.nodeName.toLowerCase() === match;
            },

            CLASS: function(elem, match) {
                return (" " + (elem.className || elem.getAttribute("class")) + " ")
                    .indexOf(match) > -1;
            },

            ATTR: function(elem, match) {
                var name = match[1],
                    result = Expr.attrHandle[ name ] ?
                        Expr.attrHandle[ name ](elem) :
                        elem[ name ] != null ?
                            elem[ name ] :
                            elem.getAttribute(name),
                    value = result + "",
                    type = match[2],
                    check = match[4];

                return result == null ?
                    type === "!=" :
                    type === "=" ?
                        value === check :
                        type === "*=" ?
                            value.indexOf(check) >= 0 :
                            type === "~=" ?
                                (" " + value + " ").indexOf(check) >= 0 :
                                !check ?
                                    value && result !== false :
                                    type === "!=" ?
                                        value !== check :
                                        type === "^=" ?
                                            value.indexOf(check) === 0 :
                                            type === "$=" ?
                                                value.substr(value.length - check.length) === check :
                                                type === "|=" ?
                                                    value === check || value.substr(0, check.length + 1) === check + "-" :
                                                    false;
            },

            POS: function(elem, match, i, array) {
                var name = match[2],
                    filter = Expr.setFilters[ name ];

                if (filter) {
                    return filter(elem, i, match, array);
                }
            }
        }
    };

    var origPOS = Expr.match.POS,
        fescape = function(all, num) {
            return "\\" + (num - 0 + 1);
        };

    for (var type in Expr.match) {
        Expr.match[ type ] = new RegExp(Expr.match[ type ].source + (/(?![^\[]*\])(?![^\(]*\))/.source));
        Expr.leftMatch[ type ] = new RegExp(/(^(?:.|\r|\n)*?)/.source + Expr.match[ type ].source.replace(/\\(\d+)/g, fescape));
    }

    var makeArray = function(array, results) {
        array = Array.prototype.slice.call(array, 0);

        if (results) {
            results.push.apply(results, array);
            return results;
        }

        return array;
    };

// Perform a simple check to determine if the browser is capable of
// converting a NodeList to an array using builtin methods.
// Also verifies that the returned array holds DOM nodes
// (which is not the case in the Blackberry browser)
    try {
        Array.prototype.slice.call(document.documentElement.childNodes, 0)[0].nodeType;

// Provide a fallback method if it does not work
    } catch(e) {
        makeArray = function(array, results) {
            var i = 0,
                ret = results || [];

            if (toString.call(array) === "[object Array]") {
                Array.prototype.push.apply(ret, array);

            } else {
                if (typeof array.length === "number") {
                    for (var l = array.length; i < l; i++) {
                        ret.push(array[i]);
                    }

                } else {
                    for (; array[i]; i++) {
                        ret.push(array[i]);
                    }
                }
            }

            return ret;
        };
    }

    var sortOrder, siblingCheck;

    if (document.documentElement.compareDocumentPosition) {
        sortOrder = function(a, b) {
            if (a === b) {
                hasDuplicate = true;
                return 0;
            }

            if (!a.compareDocumentPosition || !b.compareDocumentPosition) {
                return a.compareDocumentPosition ? -1 : 1;
            }

            return a.compareDocumentPosition(b) & 4 ? -1 : 1;
        };

    } else {
        sortOrder = function(a, b) {
            // The nodes are identical, we can exit early
            if (a === b) {
                hasDuplicate = true;
                return 0;

                // Fallback to using sourceIndex (in IE) if it's available on both nodes
            } else if (a.sourceIndex && b.sourceIndex) {
                return a.sourceIndex - b.sourceIndex;
            }

            var al, bl,
                ap = [],
                bp = [],
                aup = a.parentNode,
                bup = b.parentNode,
                cur = aup;

            // If the nodes are siblings (or identical) we can do a quick check
            if (aup === bup) {
                return siblingCheck(a, b);

                // If no parents were found then the nodes are disconnected
            } else if (!aup) {
                return -1;

            } else if (!bup) {
                return 1;
            }

            // Otherwise they're somewhere else in the tree so we need
            // to build up a full list of the parentNodes for comparison
            while (cur) {
                ap.unshift(cur);
                cur = cur.parentNode;
            }

            cur = bup;

            while (cur) {
                bp.unshift(cur);
                cur = cur.parentNode;
            }

            al = ap.length;
            bl = bp.length;

            // Start walking down the tree looking for a discrepancy
            for (var i = 0; i < al && i < bl; i++) {
                if (ap[i] !== bp[i]) {
                    return siblingCheck(ap[i], bp[i]);
                }
            }

            // We ended someplace up the tree so do a sibling check
            return i === al ?
                siblingCheck(a, bp[i], -1) :
                siblingCheck(ap[i], b, 1);
        };

        siblingCheck = function(a, b, ret) {
            if (a === b) {
                return ret;
            }

            var cur = a.nextSibling;

            while (cur) {
                if (cur === b) {
                    return -1;
                }

                cur = cur.nextSibling;
            }

            return 1;
        };
    }

// Utility function for retreiving the text value of an array of DOM nodes
    Sizzle.getText = function(elems) {
        var ret = "", elem;

        for (var i = 0; elems[i]; i++) {
            elem = elems[i];

            // Get the text from text nodes and CDATA nodes
            if (elem.nodeType === 3 || elem.nodeType === 4) {
                ret += elem.nodeValue;

                // Traverse everything else, except comment nodes
            } else if (elem.nodeType !== 8) {
                ret += Sizzle.getText(elem.childNodes);
            }
        }

        return ret;
    };

// Check to see if the browser returns elements by name when
// querying by getElementById (and provide a workaround)
    (function() {
        // We're going to inject a fake input element with a specified name
        var form = document.createElement("div"),
            id = "script" + (new Date()).getTime(),
            root = document.documentElement;

        form.innerHTML = "<a name='" + id + "'/>";

        // Inject it into the root element, check its status, and remove it quickly
        root.insertBefore(form, root.firstChild);

        // The workaround has to do additional checks after a getElementById
        // Which slows things down for other browsers (hence the branching)
        if (document.getElementById(id)) {
            Expr.find.ID = function(match, context, isXML) {
                if (typeof context.getElementById !== "undefined" && !isXML) {
                    var m = context.getElementById(match[1]);

                    return m ?
                        m.id === match[1] || typeof m.getAttributeNode !== "undefined" && m.getAttributeNode("id").nodeValue === match[1] ?
                            [m] :
                            undefined :
                        [];
                }
            };

            Expr.filter.ID = function(elem, match) {
                var node = typeof elem.getAttributeNode !== "undefined" && elem.getAttributeNode("id");

                return elem.nodeType === 1 && node && node.nodeValue === match;
            };
        }

        root.removeChild(form);

        // release memory in IE
        root = form = null;
    })();

    (function() {
        // Check to see if the browser returns only elements
        // when doing getElementsByTagName("*")

        // Create a fake element
        var div = document.createElement("div");
        div.appendChild(document.createComment(""));

        // Make sure no comments are found
        if (div.getElementsByTagName("*").length > 0) {
            Expr.find.TAG = function(match, context) {
                var results = context.getElementsByTagName(match[1]);

                // Filter out possible comments
                if (match[1] === "*") {
                    var tmp = [];

                    for (var i = 0; results[i]; i++) {
                        if (results[i].nodeType === 1) {
                            tmp.push(results[i]);
                        }
                    }

                    results = tmp;
                }

                return results;
            };
        }

        // Check to see if an attribute returns normalized href attributes
        div.innerHTML = "<a href='#'></a>";

        if (div.firstChild && typeof div.firstChild.getAttribute !== "undefined" &&
            div.firstChild.getAttribute("href") !== "#") {

            Expr.attrHandle.href = function(elem) {
                return elem.getAttribute("href", 2);
            };
        }

        // release memory in IE
        div = null;
    })();

    if (document.querySelectorAll) {
        (function() {
            var oldSizzle = Sizzle,
                div = document.createElement("div"),
                id = "__sizzle__";

            div.innerHTML = "<p class='TEST'></p>";

            // Safari can't handle uppercase or unicode characters when
            // in quirks mode.
            if (div.querySelectorAll && div.querySelectorAll(".TEST").length === 0) {
                return;
            }

            Sizzle = function(query, context, extra, seed) {
                context = context || document;

                // Only use querySelectorAll on non-XML documents
                // (ID selectors don't work in non-HTML documents)
                if (!seed && !Sizzle.isXML(context)) {
                    // See if we find a selector to speed up
                    var match = /^(\w+$)|^\.([\w\-]+$)|^#([\w\-]+$)/.exec(query);

                    if (match && (context.nodeType === 1 || context.nodeType === 9)) {
                        // Speed-up: Sizzle("TAG")
                        if (match[1]) {
                            return makeArray(context.getElementsByTagName(query), extra);

                            // Speed-up: Sizzle(".CLASS")
                        } else if (match[2] && Expr.find.CLASS && context.getElementsByClassName) {
                            return makeArray(context.getElementsByClassName(match[2]), extra);
                        }
                    }

                    if (context.nodeType === 9) {
                        // Speed-up: Sizzle("body")
                        // The body element only exists once, optimize finding it
                        if (query === "body" && context.body) {
                            return makeArray([ context.body ], extra);

                            // Speed-up: Sizzle("#ID")
                        } else if (match && match[3]) {
                            var elem = context.getElementById(match[3]);

                            // Check parentNode to catch when Blackberry 4.6 returns
                            // nodes that are no longer in the document #6963
                            if (elem && elem.parentNode) {
                                // Handle the case where IE and Opera return items
                                // by name instead of ID
                                if (elem.id === match[3]) {
                                    return makeArray([ elem ], extra);
                                }

                            } else {
                                return makeArray([], extra);
                            }
                        }

                        try {
                            return makeArray(context.querySelectorAll(query), extra);
                        } catch(qsaError) {
                        }

                        // qSA works strangely on Element-rooted queries
                        // We can work around this by specifying an extra ID on the root
                        // and working up from there (Thanks to Andrew Dupont for the technique)
                        // IE 8 doesn't work on object elements
                    } else if (context.nodeType === 1 && context.nodeName.toLowerCase() !== "object") {
                        var oldContext = context,
                            old = context.getAttribute("id"),
                            nid = old || id,
                            hasParent = context.parentNode,
                            relativeHierarchySelector = /^\s*[+~]/.test(query);

                        if (!old) {
                            context.setAttribute("id", nid);
                        } else {
                            nid = nid.replace(/'/g, "\\$&");
                        }
                        if (relativeHierarchySelector && hasParent) {
                            context = context.parentNode;
                        }

                        try {
                            if (!relativeHierarchySelector || hasParent) {
                                return makeArray(context.querySelectorAll("[id='" + nid + "'] " + query), extra);
                            }

                        } catch(pseudoError) {
                        } finally {
                            if (!old) {
                                oldContext.removeAttribute("id");
                            }
                        }
                    }
                }

                return oldSizzle(query, context, extra, seed);
            };

            for (var prop in oldSizzle) {
                Sizzle[ prop ] = oldSizzle[ prop ];
            }

            // release memory in IE
            div = null;
        })();
    }

    (function() {
        var html = document.documentElement,
            matches = html.matchesSelector || html.mozMatchesSelector || html.webkitMatchesSelector || html.msMatchesSelector;

        if (matches) {
            // Check to see if it's possible to do matchesSelector
            // on a disconnected node (IE 9 fails this)
            var disconnectedMatch = !matches.call(document.createElement("div"), "div"),
                pseudoWorks = false;

            try {
                // This should fail with an exception
                // Gecko does not error, returns false instead
                matches.call(document.documentElement, "[test!='']:sizzle");

            } catch(pseudoError) {
                pseudoWorks = true;
            }

            Sizzle.matchesSelector = function(node, expr) {
                // Make sure that attribute selectors are quoted
                expr = expr.replace(/\=\s*([^'"\]]*)\s*\]/g, "='$1']");

                if (!Sizzle.isXML(node)) {
                    try {
                        if (pseudoWorks || !Expr.match.PSEUDO.test(expr) && !/!=/.test(expr)) {
                            var ret = matches.call(node, expr);

                            // IE 9's matchesSelector returns false on disconnected nodes
                            if (ret || !disconnectedMatch ||
                                // As well, disconnected nodes are said to be in a document
                                // fragment in IE 9, so check for that
                                node.document && node.document.nodeType !== 11) {
                                return ret;
                            }
                        }
                    } catch(e) {
                    }
                }

                return Sizzle(expr, null, null, [node]).length > 0;
            };
        }
    })();

    (function() {
        var div = document.createElement("div");

        div.innerHTML = "<div class='test e'></div><div class='test'></div>";

        // Opera can't find a second classname (in 9.6)
        // Also, make sure that getElementsByClassName actually exists
        if (!div.getElementsByClassName || div.getElementsByClassName("e").length === 0) {
            return;
        }

        // Safari caches class attributes, doesn't catch changes (in 3.2)
        div.lastChild.className = "e";

        if (div.getElementsByClassName("e").length === 1) {
            return;
        }

        Expr.order.splice(1, 0, "CLASS");
        Expr.find.CLASS = function(match, context, isXML) {
            if (typeof context.getElementsByClassName !== "undefined" && !isXML) {
                return context.getElementsByClassName(match[1]);
            }
        };

        // release memory in IE
        div = null;
    })();

    function dirNodeCheck(dir, cur, doneName, checkSet, nodeCheck, isXML) {
        for (var i = 0, l = checkSet.length; i < l; i++) {
            var elem = checkSet[i];

            if (elem) {
                var match = false;

                elem = elem[dir];

                while (elem) {
                    if (elem.sizcache === doneName) {
                        match = checkSet[elem.sizset];
                        break;
                    }

                    if (elem.nodeType === 1 && !isXML) {
                        elem.sizcache = doneName;
                        elem.sizset = i;
                    }

                    if (elem.nodeName.toLowerCase() === cur) {
                        match = elem;
                        break;
                    }

                    elem = elem[dir];
                }

                checkSet[i] = match;
            }
        }
    }

    function dirCheck(dir, cur, doneName, checkSet, nodeCheck, isXML) {
        for (var i = 0, l = checkSet.length; i < l; i++) {
            var elem = checkSet[i];

            if (elem) {
                var match = false;

                elem = elem[dir];

                while (elem) {
                    if (elem.sizcache === doneName) {
                        match = checkSet[elem.sizset];
                        break;
                    }

                    if (elem.nodeType === 1) {
                        if (!isXML) {
                            elem.sizcache = doneName;
                            elem.sizset = i;
                        }

                        if (typeof cur !== "string") {
                            if (elem === cur) {
                                match = true;
                                break;
                            }

                        } else if (Sizzle.filter(cur, [elem]).length > 0) {
                            match = elem;
                            break;
                        }
                    }

                    elem = elem[dir];
                }

                checkSet[i] = match;
            }
        }
    }

    if (document.documentElement.contains) {
        Sizzle.contains = function(a, b) {
            return a !== b && (a.contains ? a.contains(b) : true);
        };

    } else if (document.documentElement.compareDocumentPosition) {
        Sizzle.contains = function(a, b) {
            return !!(a.compareDocumentPosition(b) & 16);
        };

    } else {
        Sizzle.contains = function() {
            return false;
        };
    }

    Sizzle.isXML = function(elem) {
        // documentElement is verified for cases where it doesn't yet exist
        // (such as loading iframes in IE - #4833)
        var documentElement = (elem ? elem.ownerDocument || elem : 0).documentElement;

        return documentElement ? documentElement.nodeName !== "HTML" : false;
    };

    var posProcess = function(selector, context) {
        var match,
            tmpSet = [],
            later = "",
            root = context.nodeType ? [context] : context;

        // Position selectors must be done after the filter
        // And so must :not(positional) so we move all PSEUDOs to the end
        while ((match = Expr.match.PSEUDO.exec(selector))) {
            later += match[0];
            selector = selector.replace(Expr.match.PSEUDO, "");
        }

        selector = Expr.relative[selector] ? selector + "*" : selector;

        for (var i = 0, l = root.length; i < l; i++) {
            Sizzle(selector, root[i], tmpSet);
        }

        return Sizzle.filter(later, tmpSet);
    };

    // EXPOSE
    return Sizzle;
});

KISSY.add("sizzle", function(S, sizzle) {
    return sizzle;
}, {
    requires:["sizzle/impl"]
});
/*
Copyright 2011, KISSY UI Library v1.20dev
MIT Licensed
build time: Sep 22 13:54
*/
/**
 * 数据延迟加载组件
 * @module   datalazyload
 * @creator  玉伯<lifesinger@gmail.com>
 */
KISSY.add('datalazyload/impl', function(S, DOM, Event, undefined) {

    var win = window,
        DELAY = 0.1,
        doc = document,

        IMG_SRC_DATA = 'data-ks-lazyload',
        AREA_DATA_CLS = 'ks-datalazyload',
        CUSTOM = '-custom',
        MANUAL = 'manual',
        DISPLAY = 'display', DEFAULT = 'default', NONE = 'none',
        SCROLL = 'scroll', RESIZE = 'resize',

        defaultConfig = {

            /**
             * 懒处理模式
             *   auto   - 自动化。html 输出时，不对 img.src 做任何处理
             *   manual - 输出 html 时，已经将需要延迟加载的图片的 src 属性替换为 IMG_SRC_DATA
             * 注：对于 textarea 数据，只有手动模式
             */
            mod: MANUAL,

            /**
             * 当前视窗往下，diff px 外的 img/textarea 延迟加载
             * 适当设置此值，可以让用户在拖动时感觉数据已经加载好
             * 默认为当前视窗高度（两屏以外的才延迟加载）
             */
            diff: DEFAULT,

            /**
             * 图像的占位图，默认无
             */
            placeholder: NONE,

            /**
             * 是否执行 textarea 里面的脚本
             */
            execScript: true
        };

    /**
     * 延迟加载组件
     * @constructor
     */
    function DataLazyload(containers, config) {
        var self = this;

        // factory or constructor
        if (!(self instanceof DataLazyload)) {
            return new DataLazyload(containers, config);
        }

        // 允许仅传递 config 一个参数
        if (config === undefined) {
            config = containers;
            containers = [doc];
        }

        // containers 是一个 HTMLElement 时
        if (!S.isArray(containers)) {
            containers = [DOM.get(containers) || doc];
        }

        /**
         * 图片所在容器（可以多个），默认为 [doc]
         * @type Array
         */
        self.containers = containers;

        /**
         * 配置参数
         * @type Object
         */
        self.config = S.merge(defaultConfig, config);

        /**
         * 需要延迟下载的图片
         * @type Array
         */
        //self.images

        /**
         * 需要延迟处理的 textarea
         * @type Array
         */
        //self.areaes

        /**
         * 和延迟项绑定的回调函数
         * @type object
         */
        self.callbacks = {els: [], fns: []};

        /**
         * 开始延迟的 Y 坐标
         * @type number
         */
        //self.threshold

        self._init();
        return undefined;
    }

    S.augment(DataLazyload, {

        /**
         * 初始化
         * @protected
         */
        _init: function() {
            var self = this;
            self.threshold = self._getThreshold();

            self._filterItems();
            self._initLoadEvent();
        },

        /**
         * 获取并初始化需要延迟的 images 和 areaes
         * @protected
         */
        _filterItems: function() {
            var self = this,
                containers = self.containers,
                n, N, imgs, areaes, i, img,
                lazyImgs = [], lazyAreas = [];

            for (n = 0,N = containers.length; n < N; ++n) {
                imgs = DOM.query('img', containers[n]);
                lazyImgs = lazyImgs.concat(S.filter(imgs, self._filterImg, self));

                areaes = DOM.query('textarea', containers[n]);
                lazyAreas = lazyAreas.concat(S.filter(areaes, self._filterArea, self));
            }

            self.images = lazyImgs;
            self.areaes = lazyAreas;
        },

        /**
         * filter for lazyload image
         */
        _filterImg: function(img) {
            var self = this,
                dataSrc = img.getAttribute(IMG_SRC_DATA),
                threshold = self.threshold,
                placeholder = self.config.placeholder,
                isManualMod = self.config.mod === MANUAL;

            // 手工模式，只处理有 data-src 的图片
            if (isManualMod) {
                if (dataSrc) {
                    if (placeholder !== NONE) {
                        img.src = placeholder;
                    }
                    return true;
                }
            }
            // 自动模式，只处理 threshold 外无 data-src 的图片
            else {
                // 注意：已有 data-src 的项，可能已有其它实例处理过，不用再次处理
                if (DOM.offset(img).top > threshold && !dataSrc) {
                    DOM.attr(img, IMG_SRC_DATA, img.src);
                    if (placeholder !== NONE) {
                        img.src = placeholder;
                    } else {
                        img.removeAttribute('src');
                    }
                    return true;
                }
            }
        },

        /**
         * filter for lazyload textarea
         */
        _filterArea: function(area) {
            return DOM.hasClass(area, AREA_DATA_CLS);
        },

        /**
         * 初始化加载事件
         * @protected
         */
        _initLoadEvent: function() {
            var timer, self = this, resizeHandler;

            // scroll 和 resize 时，加载图片
            Event.on(win, SCROLL, loader);
            Event.on(win, RESIZE, function() {
                self.threshold = self._getThreshold();
                loader();
            });

            // 需要立即加载一次，以保证第一屏的延迟项可见
            if (self._getItemsLength()) {
                S.ready(function() {
                    loadItems();
                });
            }

            // 加载函数
            function loader() {
                if (timer) {
                    return;
                }
                timer = S.later(function() {
                    loadItems();
                    timer = null;
                }, DELAY); // 0.1s 内，用户感觉流畅
            }

            // 加载延迟项
            function loadItems() {
                self._loadItems();
                if (self._getItemsLength() === 0) {
                    Event.remove(win, SCROLL, loader);
                    Event.remove(win, RESIZE, resizeHandler);
                }
            }
        },

        /**
         * 加载延迟项
         */
        _loadItems: function() {
            var self = this;
            self._loadImgs();
            self._loadAreas();
            self._fireCallbacks();
        },

        /**
         * 加载图片
         * @protected
         */
        _loadImgs: function() {
            var self = this;
            self.images = S.filter(self.images, self._loadImg, self);
        },

        /**
         * 监控滚动，处理图片
         */
        _loadImg: function(img) {
            var self = this,
                scrollTop = DOM.scrollTop(),
                threshold = self.threshold + scrollTop,
                offset = DOM.offset(img);

            if (offset.top <= threshold) {
                self._loadImgSrc(img);
            } else {
                return true;
            }
        },

        /**
         * 加载图片 src
         * @static
         */
        _loadImgSrc: function(img, flag) {
            flag = flag || IMG_SRC_DATA;
            var dataSrc = img.getAttribute(flag);

            if (dataSrc && img.src != dataSrc) {
                img.src = dataSrc;
                img.removeAttribute(flag);
            }
        },

        /**
         * 加载 textarea 数据
         * @protected
         */
        _loadAreas: function() {
            var self = this;
            self.areaes = S.filter(self.areaes, self._loadArea, self);
        },

        /**
         * 监控滚动，处理 textarea
         */
        _loadArea: function(area) {
            var self = this, top,
                isHidden = DOM.css(area, DISPLAY) === NONE;

            // 注：area 可能处于 display: none 状态，DOM.offset(area).top 返回 0
            // 这种情况下用 area.parentNode 的 Y 值来替代
            top = DOM.offset(isHidden ? area.parentNode : area).top;

            if (top <= self.threshold + DOM.scrollTop()) {
                self._loadAreaData(area.parentNode, area, self.config.execScript);
            } else {
                return true;
            }
        },

        /**
         * 从 textarea 中加载数据
         * @static
         */
        _loadAreaData: function(container, area, execScript) {
            // 采用隐藏 textarea 但不去除方式，去除会引发 Chrome 下错乱
            area.style.display = NONE;
            area.className = ''; // clear hook

            var content = DOM.create('<div>');
            container.insertBefore(content, area);
            DOM.html(content, area.value, execScript === undefined ? true : execScript);

            //area.value = ''; // bug fix: 注释掉，不能清空，否则 F5 刷新，会丢内容
        },

        /**
         * 触发回调
         */
        _fireCallbacks: function() {
            var self = this,
                callbacks = self.callbacks,
                els = callbacks.els, fns = callbacks.fns,
                scrollTop = DOM.scrollTop(),
                threshold = self.threshold + scrollTop,
                i, el, fn, remainEls = [], remainFns = [];

            for (i = 0; (el = els[i]) && (fn = fns[i++]);) {
                if (DOM.offset(el).top <= threshold) {
                    fn.call(el);
                } else {
                    remainEls.push(el);
                    remainFns.push(fn);
                }

            }
            callbacks.els = remainEls;
            callbacks.fns = remainFns;
        },

        /**
         * 添加回调函数。当 el 即将出现在视图中时，触发 fn
         */
        addCallback: function(el, fn) {
            var callbacks = this.callbacks;
            el = DOM.get(el);

            if (el && S.isFunction(fn)) {
                callbacks.els.push(el);
                callbacks.fns.push(fn);
            }
        },

        /**
         * 获取阈值
         * @protected
         */
        _getThreshold: function() {
            var diff = this.config.diff,
                vh = DOM.viewportHeight();

            if (diff === DEFAULT) {
                // diff 默认为当前视窗高度（两屏以外的才延迟加载）
                return 2 * vh;
            }
            else {
                // 将 diff 转换成数值
                return vh + (+diff);
            }
        },

        /**
         * 获取当前延迟项的数量
         * @protected
         */
        _getItemsLength: function() {
            var self = this;
            return self.images.length + self.areaes.length + self.callbacks.els.length;
        },

        /**
         * 加载自定义延迟数据
         * @static
         */
        loadCustomLazyData: function(containers, type) {
            var self = this, area, imgs;

            if (type === 'img-src') type = 'img';
            
            // 支持数组
            if (!S.isArray(containers)) {
                containers = [DOM.get(containers)];
            }

            // 遍历处理
            S.each(containers, function(container) {
                switch (type) {
                    case 'img':
                        if (container.nodeName === 'IMG') { // 本身就是图片
                            imgs = [container];
                        } else {
                            imgs = DOM.query('img', container);
                        }

                        S.each(imgs, function(img) {
                            self._loadImgSrc(img, IMG_SRC_DATA + CUSTOM);
                        });

                        break;

                    default:
                        area = DOM.get('textarea', container);
                        if (area && DOM.hasClass(area, AREA_DATA_CLS + CUSTOM)) {
                            self._loadAreaData(container, area);
                        }
                }
            });
        }
    });

    // attach static methods
    S.mix(DataLazyload, DataLazyload.prototype, true, ['loadCustomLazyData', '_loadImgSrc', '_loadAreaData']);

    return DataLazyload;

}, { requires: ['dom','event'] });

/**
 * NOTES:
 *
 * 模式为 auto 时：
 *  1. 在 Firefox 下非常完美。脚本运行时，还没有任何图片开始下载，能真正做到延迟加载。
 *  2. 在 IE 下不尽完美。脚本运行时，有部分图片已经与服务器建立链接，这部分 abort 掉，
 *     再在滚动时延迟加载，反而增加了链接数。
 *  3. 在 Safari 和 Chrome 下，因为 webkit 内核 bug，导致无法 abort 掉下载。该
 *     脚本完全无用。
 *  4. 在 Opera 下，和 Firefox 一致，完美。
 *  5. 2010-07-12: 发现在 Firefox 下，也有导致部分 Aborted 链接。
 *
 * 模式为 manual 时：（要延迟加载的图片，src 属性替换为 data-lazyload-src, 并将 src 的值赋为 placeholder ）
 *  1. 在任何浏览器下都可以完美实现。
 *  2. 缺点是不渐进增强，无 JS 时，图片不能展示。
 *
 * 缺点：
 *  1. 对于大部分情况下，需要拖动查看内容的页面（比如搜索结果页），快速滚动时加载有损用
 *     户体验（用户期望所滚即所得），特别是网速不好时。
 *  2. auto 模式不支持 Webkit 内核浏览器；IE 下，有可能导致 HTTP 链接数的增加。
 *
 * 优点：
 *  1. 可以很好的提高页面初始加载速度。
 *  2. 第一屏就跳转，延迟加载图片可以减少流量。
 *
 * 参考资料：
 *  1. http://davidwalsh.name/lazyload MooTools 的图片延迟插件
 *  2. http://vip.qq.com/ 模板输出时，就替换掉图片的 src
 *  3. http://www.appelsiini.net/projects/lazyload jQuery Lazyload
 *  4. http://www.dynamixlabs.com/2008/01/17/a-quick-look-add-a-loading-icon-to-your-larger-images/
 *  5. http://www.nczonline.net/blog/2009/11/30/empty-image-src-can-destroy-your-site/
 *
 * 特别要注意的测试用例:
 *  1. 初始窗口很小，拉大窗口时，图片加载正常
 *  2. 页面有滚动位置时，刷新页面，图片加载正常
 *  3. 手动模式，第一屏有延迟图片时，加载正常
 *
 * 2009-12-17 补充：
 *  1. textarea 延迟加载约定：页面中需要延迟的 dom 节点，放在
 *       <textarea class='ks-datalazysrc invisible'>dom code</textarea>
 *     里。可以添加 hidden 等 class, 但建议用 invisible, 并设定 height = '实际高度'，这样可以保证
 *     滚动时，diff 更真实有效。
 *     注意：textarea 加载后，会替换掉父容器中的所有内容。
 *  2. 延迟 callback 约定：dataLazyload.addCallback(el, fn) 表示当 el 即将出现时，触发 fn.
 *  3. 所有操作都是最多触发一次，比如 callback. 来回拖动滚动条时，只有 el 第一次出现时会触发 fn 回调。
 */

/**
 * xTODO:
 *   - [取消] 背景图片的延迟加载（对于 css 里的背景图片和 sprite 很难处理）
 *   - [取消] 加载时的 loading 图（对于未设定大小的图片，很难完美处理[参考资料 4]）
 */

/**
 * UPDATE LOG:
 *   - 2010-07-31 yubo IMG_SRC_DATA 由 data-lazyload-src 更名为 data-ks-lazyload + 支持 touch 设备
 *   - 2010-07-10 chengyu 重构，使用正则表达式识别 html 中的脚本，使用 EventTarget 自定义事件机制来处理回调
 *   - 2010-05-10 yubo ie6 下，在 dom ready 后执行，会导致 placeholder 重复加载，为比避免此问题，默认为 none, 去掉占位图
 *   - 2010-04-05 yubo 重构，使得对 YUI 的依赖仅限于 YDOM
 *   - 2009-12-17 yubo 将 imglazyload 升级为 datalazyload, 支持 textarea 方式延迟和特定元素即将出现时的回调函数
 */
KISSY.add("datalazyload", function(S, D) {
    S.DataLazyload = D;
    return D;
}, {
    requires:["datalazyload/impl"]
});
/*
Copyright 2011, KISSY UI Library v1.20dev
MIT Licensed
build time: Sep 22 13:54
*/
/**
 * @fileoverview KISSY Template Engine.
 * @author yyfrankyy@gmail.com
 */
KISSY.add('template/base', function(S) {

    var // Template Cache
        templateCache = {},

        // start/end tag mark
        tagStartEnd = {
            '#': 'start',
            '/': 'end'
        },

        // static string
        KS_TEMPL_STAT_PARAM = 'KS_TEMPL_STAT_PARAM',
        KS_TEMPL_STAT_PARAM_REG = new RegExp(KS_TEMPL_STAT_PARAM, "g"),
        KS_TEMPL = 'KS_TEMPL',
        KS_DATA = 'KS_DATA_',
        KS_EMPTY = '',
        KS_AS = 'as',

        PREFIX = '");',
        SUFFIX = KS_TEMPL + '.push("',

        PARSER_SYNTAX_ERROR = 'KISSY.Template: Syntax Error. ',
        PARSER_RENDER_ERROR = 'KISSY.Template: Render Error. ',

        PARSER_PREFIX = 'var ' + KS_TEMPL + '=[],' +
            KS_TEMPL_STAT_PARAM + '=false;with(',

        PARSER_MIDDLE = '||{}){try{' + KS_TEMPL + '.push("',

        PARSER_SUFFIX = '");}catch(e){' + KS_TEMPL + '=["' +
            PARSER_RENDER_ERROR + '" + e.message]}};return ' +
            KS_TEMPL + '.join("");',

        restoreQuote = function(str) {
            return str.replace(/\\"/g, '"');
        },

        escapeQuote = function(str) {
            return str.replace(/"/g, '\\"');
        },

        trim = S.trim,

        // build a static parser
        buildParser = function(tpl) {
            var _parser,
                _empty_index;
            return escapeQuote(trim(tpl)
                .replace(/[\r\t\n]/g, ' ')
                // escape escape ...
                .replace(/\\/g, '\\\\'))
                .replace(/\{\{([#/]?)(?!\}\})([^}]*)\}\}/g,
                function(all, expr, body) {
                    _parser = KS_EMPTY;
                    // is an expression
                    if (expr) {
                        body = trim(body);
                        _empty_index = body.indexOf(' ');
                        body = _empty_index === -1 ?
                            [ body, '' ] :
                            [
                                body.substring(0, _empty_index),
                                body.substring(_empty_index)
                            ];

                        var operator = body[0],
                            fn,
                            args = trim(body[1]),
                            opStatement = Statements[operator];

                        if (opStatement && tagStartEnd[expr]) {
                            // get expression definition function/string
                            fn = opStatement[tagStartEnd[expr]];
                            _parser = S.isFunction(fn) ?
                                restoreQuote(fn.apply(this, args.split(/\s+/))) :
                                restoreQuote(fn.replace(KS_TEMPL_STAT_PARAM_REG, args));
                        }
                    }
                    // return array directly
                    else {
                        _parser = KS_TEMPL +
                            '.push(' +
                            restoreQuote(body) +
                            ');';
                    }
                    return PREFIX + _parser + SUFFIX;

                });
        },

        // expression
        Statements = {
            'if': {
                start: 'if(' + KS_TEMPL_STAT_PARAM + '){',
                end: '}'
            },

            'else': {
                start: '}else{'
            },

            'elseif': {
                start: '}else if(' + KS_TEMPL_STAT_PARAM + '){'
            },

            // KISSY.each function wrap
            'each': {
                start: function(obj, as, v, k) {
                    var _ks_value = '_ks_value',
                        _ks_index = '_ks_index';
                    if (as === KS_AS && v) {
                        _ks_value = v || _ks_value,
                            _ks_index = k || _ks_index;
                    }
                    return 'KISSY.each(' + obj +
                        ', function(' + _ks_value +
                        ', ' + _ks_index + '){';
                },
                end: '});'
            },

            // comments
            '!': {
                start: '/*' + KS_TEMPL_STAT_PARAM + '*/'
            }
        };

    /**
     * Template
     * @param {String} tpl template to be rendered.
     * @return {Object} return this for chain.
     */
    function Template(tpl) {
        if (!(templateCache[tpl])) {
            var _ks_data = S.guid(KS_DATA),
                func,
                o,
                _parser = [
                    PARSER_PREFIX,
                    _ks_data,
                    PARSER_MIDDLE,
                    o = buildParser(tpl),
                    PARSER_SUFFIX
                ];

            try {
                func = new Function(_ks_data, _parser.join(KS_EMPTY));
            } catch (e) {
                _parser[3] = PREFIX + SUFFIX +
                    PARSER_SYNTAX_ERROR + ',' +
                    e.message + PREFIX + SUFFIX;
                func = new Function(_ks_data, _parser.join(KS_EMPTY));
            }

            templateCache[tpl] = {
                name: _ks_data,
                o:o,
                parser: _parser.join(KS_EMPTY),
                render: func
            };
        }
        return templateCache[tpl];
    }

    S.mix(Template, {
        /**
         * Logging Compiled Template Codes
         * @param {String} tpl template string.
         */
        log: function(tpl) {
            if (tpl in templateCache) {
                if ('js_beautify' in window) {
//                        S.log(js_beautify(templateCache[tpl].parser, {
//                            indent_size: 4,
//                            indent_char: ' ',
//                            preserve_newlines: true,
//                            braces_on_own_line: false,
//                            keep_array_indentation: false,
//                            space_after_anon_function: true
//                        }), 'info');
                } else {
                    S.log(templateCache[tpl].parser, 'info');
                }
            } else {
                Template(tpl);
                this.log(tpl);
            }
        },

        /**
         * add statement for extending template tags
         * @param {String} statement tag name.
         * @param {String} o extent tag object.
         */
        addStatement: function(statement, o) {
            if (S.isString(statement) && S.isObject(o)) {
                Statements[statement] = o;
            }
        }

    });

    return Template;

});
/**
 * 2011-09-20 note by yiminghe :
 *      - code style change
 *      - remove reg cache , ugly to see
 *      - fix escape by escape
 *      - expect(T('{{#if a=="a"}}{{b}}\\"{{/if}}').render({a:"a",b:"b"})).toBe('b\\"');
 */
/**
 * @fileoverview KISSY.Template Node.
 * @author 文河<wenhe@taobao.com>
 */
KISSY.add('template/node', function(S, Template, Node) {
    var $ = Node.all;
    S.mix(S, {
        tmpl: function(selector, data) {
            return $(Template($(selector).html()).render(data));
        }
    });

}, {requires:["./base",'node']});
KISSY.add("template", function(S, T) {
    S.Template = T;
    return T;
}, {
    requires:["template/base","template/node"]
});
/*
Copyright 2011, KISSY UI Library v1.20dev
MIT Licensed
build time: Sep 22 13:54
*/
/**
 * @module   Flash 全局静态类
 * @author   kingfo<oicuicu@gmail.com>
 */
KISSY.add('flash/base', function(S) {

    return {
        /**
         * flash 实例 map { '#id': elem, ... }
         * @static
         */
        swfs: { },
        length: 0,
        version:"1.3"
    };

});
/**
 * @module   Flash UA 探测
 * @author   kingfo<oicuicu@gmail.com>
 */
KISSY.add('flash/ua', function(S, UA) {

    var fpv, fpvF, firstRun = true;

    /**
     * 获取 Flash 版本号
     * 返回数据 [M, S, R] 若未安装，则返回 undefined
     */
    function getFlashVersion() {
        var ver, SF = 'ShockwaveFlash';

        // for NPAPI see: http://en.wikipedia.org/wiki/NPAPI
        if (navigator.plugins && navigator.mimeTypes.length) {
            ver = (navigator.plugins['Shockwave Flash'] || 0).description;
        }
        // for ActiveX see:	http://en.wikipedia.org/wiki/ActiveX
        else if (window.ActiveXObject) {
            try {
                ver = new ActiveXObject(SF + '.' + SF)['GetVariable']('$version');
            } catch(ex) {
                //S.log('getFlashVersion failed via ActiveXObject');
                // nothing to do, just return undefined
            }
        }

        // 插件没安装或有问题时，ver 为 undefined
        if (!ver) return undefined;

        // 插件安装正常时，ver 为 "Shockwave Flash 10.1 r53" or "WIN 10,1,53,64"
        return arrify(ver);
    }

    /**
     * arrify("10.1.r53") => ["10", "1", "53"]
     */
    function arrify(ver) {
        return ver.match(/(\d)+/g).splice(0, 3);
    }

    /**
     * 格式：主版本号Major.次版本号Minor(小数点后3位，占3位)修正版本号Revision(小数点后第4至第8位，占5位)
     * ver 参数不符合预期时，返回 0
     * numerify("10.1 r53") => 10.00100053
     * numerify(["10", "1", "53"]) => 10.00100053
     * numerify(12.2) => 12.2
     */
    function numerify(ver) {
        var arr = S.isString(ver) ? arrify(ver) : ver, ret = ver;
        if (S.isArray(arr)) {
            ret = parseFloat(arr[0] + '.' + pad(arr[1], 3) + pad(arr[2], 5));
        }
        return ret || 0;
    }

    /**
     * pad(12, 5) => "00012"
     * ref: http://lifesinger.org/blog/2009/08/the-harm-of-tricky-code/
     */
    function pad(num, n) {
        var len = (num + '').length;
        while (len++ < n) {
            num = '0' + num;
        }
        return num;
    }

    /**
     * 返回数据 [M, S, R] 若未安装，则返回 undefined
     * fpv 全称是 flash player version
     */
    UA.fpv = function(force) {
        // 考虑 new ActiveX 和 try catch 的 性能损耗，延迟初始化到第一次调用时
        if (force || firstRun) {
            firstRun = false;
            fpv = getFlashVersion();
            fpvF = numerify(fpv);
        }
        return fpv;
    };

    /**
     * Checks fpv is greater than or equal the specific version.
     * 普通的 flash 版本检测推荐使用该方法
     * @param ver eg. "10.1.53"
     * <code>
     *    if(S.UA.fpvGEQ('9.9.2')) { ... }
     * </code>
     */
    UA.fpvGEQ = function(ver, force) {
        if (firstRun) UA.fpv(force);
        return !!fpvF && (fpvF >= numerify(ver));
    };

}, { requires:["ua"] });

/**
 * NOTES:
 *
 -  ActiveXObject JS 小记
 -    newObj = new ActiveXObject(ProgID:String[, location:String])
 -    newObj      必需    用于部署 ActiveXObject  的变量
 -    ProgID      必选    形式为 "serverName.typeName" 的字符串
 -    serverName  必需    提供该对象的应用程序的名称
 -    typeName    必需    创建对象的类型或者类
 -    location    可选    创建该对象的网络服务器的名称

 -  Google Chrome 比较特别：
 -    即使对方未安装 flashplay 插件 也含最新的 Flashplayer
 -    ref: http://googlechromereleases.blogspot.com/2010/03/dev-channel-update_30.html
 *
 */
/**
 * @module   将 swf 嵌入到页面中
 * @author   kingfo<oicuicu@gmail.com>, 射雕<lifesinger@gmail.com>
 */
KISSY.add('flash/embed', function(S,UA,DOM,Flash,JSON) {

    var
        SWF_SUCCESS = 1,
        FP_LOW = 0,
        FP_UNINSTALL = -1,
        //TARGET_NOT_FOUND = -2,  // 指定 ID 的对象未找到
        SWF_SRC_UNDEFINED = -3, // swf 的地址未指定

		RE_FLASH_TAGS = /^(?:object|embed)/i,
        CID = 'clsid:d27cdb6e-ae6d-11cf-96b8-444553540000',
        TYPE = 'application/x-shockwave-flash',
        FLASHVARS = 'flashvars', EMPTY = '', SPACE =' ',
        PREFIX = 'ks-flash-', ID_PRE = '#', EQUAL = '=', DQUOTA ='"',
        //SQUOTA  = "'",
        LT ='<', GT='>',
		CONTAINER_PRE = 'ks-flash-container-',
		OBJECT_TAG = 'object',
		EMBED_TAG = 'embed',
		OP = Object.prototype,
        encode = encodeURIComponent,


        // flash player 的参数范围
        PARAMS = {
            ////////////////////////// 高频率使用的参数
            //flashvars: EMPTY,     // swf 传入的第三方数据。支持复杂的 Object / XML 数据 / JSON 字符串
            wmode: EMPTY,
            allowscriptaccess: EMPTY,
            allownetworking: EMPTY,
            allowfullscreen: EMPTY,
            ///////////////////////// 显示 控制 删除 
            play: 'false',
            loop: EMPTY,
            menu: EMPTY,
            quality: EMPTY,
            scale: EMPTY,
            salign: EMPTY,
            bgcolor: EMPTY,
            devicefont: EMPTY,
			hasPriority:EMPTY,
            /////////////////////////	其他控制参数
            base: EMPTY,
            swliveconnect: EMPTY,
            seamlesstabbing: EMPTY
        },



        defaultConifg = {
            //src: '',       // swf 路径
            params: { },     // Flash Player 的配置参数
            attrs: {         // swf 对应 DOM 元素的属性
                width: 215,	 // 最小控制面板宽度,小于此数字将无法支持在线快速安装
                height: 138  // 最小控制面板高度,小于此数字将无法支持在线快速安装
            },
            //xi: '',	     //	快速安装地址。全称 express install  // ? 默认路径
            version: 9       //	要求的 Flash Player 最低版本
        };


    S.mix(Flash, {

        fpv: UA.fpv,

        fpvGEQ: UA.fpvGEQ,


        /**
         * 添加 SWF 对象
         * @param target {String|HTMLElement}  #id or element
         */
        add: function(target, config, callback) {
            var xi, id , isDynamic, nodeName;
            // 标准化配置信息
            config = Flash._normalize(config);

            // 合并配置信息
            config = S.merge(defaultConifg, config);
            config.attrs = S.merge(defaultConifg.attrs, config.attrs);
			
			// 过滤 ID 前缀
			id = pureId(target);

            // 1. target 元素未找到 则自行创建一个容器
            if (!(target = DOM.get(target))) {
				target = DOM.create('<div id='+ id +'/>');
				DOM.prepend(target,document.body); // 在可视区域 才能有激活 flash 默认行为更改至直接激活
				//document.body.appendChild(target);
            }

			nodeName = target.nodeName.toLowerCase();

			// 动态标记   供后续扩展使用
			// 在 callback(config) 的  config.dynamic 应用
			isDynamic = !RE_FLASH_TAGS.test(nodeName);

            // 保存 容器id, 没有则自动生成 
            if (!target.id) target.id = S.guid(CONTAINER_PRE);
			id = target.id;

			// 保存 Flash id , 没有则自动生成
            if (!config.id) config.id = S.guid(PREFIX);
			config.attrs.id = config.id;

            // 2. flash 插件没有安装
            if (!UA.fpv()) {
                Flash._callback(callback, FP_UNINSTALL, id, target,isDynamic);
                return;
            }

            // 3. 已安装，但当前客户端版本低于指定版本时
            if (!UA.fpvGEQ(config.version)) {
                Flash._callback(callback, FP_LOW, id, target,isDynamic);

                // 有 xi 时，将 src 替换为快速安装
                if (!((xi = config.xi) && S.isString(xi))) return;
                config.src = xi;
            }



			// 对已有 HTML 结构的 SWF 进行注册使用
			if(!isDynamic){
				// bugfix: 静态双 object 获取问题。双 Object 外层有 id 但内部才有效。  longzang 2010/8/9
				if (nodeName == OBJECT_TAG) {
					// bugfix: 静态双 object 在 chrome 7以下存在问题，如使用 chrome 内胆的 sogou。2010/12/23
					if (UA['gecko'] || UA['opera'] || UA['chrome'] > 7) {
		                target = DOM.query('object', target)[0] || target;
		            }
	            }

				config.attrs.id = id;

				Flash._register(target, config, callback,isDynamic);
				return;
			}



            // src 未指定
            if (!config.src) {
                Flash._callback(callback, SWF_SRC_UNDEFINED, id, target,isDynamic);
                return;
            }

            // 替换 target 为 SWF 嵌入对象
            Flash._embed(target, config, callback);

        },

        /**
         * 获得已注册到 S.Flash 的 SWF
         * 注意，请不要混淆 DOM.get() 和 Flash.get()
         * 只有成功执行过 S.Flash.add() 的 SWF 才可以被获取
         * @return {HTMLElement}  返回 SWF 的 HTML 元素(object/embed). 未注册时，返回 undefined
         */
        get: function(id) {
			id = pureId(id);
            return Flash.swfs[id];
        },

        /**
         * 移除已注册到 S.Flash 的 SWF 和 DOM 中对应的 HTML 元素
         */
        remove: function(id) {
            var swf = Flash.get(id);
            if (swf) {
                DOM.remove(swf);
                delete Flash.swfs[swf.id];
                Flash.length -= 1;
            }
        },

        /**
         * 检测是否存在已注册的 swf
         * 只有成功执行过 S.Flash.add() 的 SWF 才可以被获取到
         * @return {Boolean}
         */
        contains: function(target) {
            var swfs = Flash.swfs,
                id, ret = false;

            if (S.isString(target)) {
                ret = (target in swfs);
            } else {
                for (id in swfs)
                    if (swfs[id] === target) {
                        ret = true;
                        break;
                    }
            }
            return ret;
        },

        _register: function(swf, config, callback,isDynamic) {
            var id = config.attrs.id;

            Flash._addSWF(id, swf);
            Flash._callback(callback, SWF_SUCCESS, id, swf,isDynamic);
        },

        _embed: function (target, config, callback) {

            target.innerHTML = Flash._stringSWF(config);

			// bugfix: 重新获取对象,否则还是老对象. 如 入口为 div 如果不重新获取则仍然是 div	longzang | 2010/8/9
			target = DOM.get(ID_PRE + config.id);

			Flash._register(target, config, callback,true);
        },

        _callback: function(callback, type, id, swf,isDynamic) {
            if (type && S.isFunction(callback)) {
                callback({
                    status: type,
                    id: id,
                    swf: swf,
					dynamic:!!isDynamic
                });
            }
        },

        _addSWF: function(id, swf) {
            if (id && swf) {
                Flash.swfs[id] = swf;
                Flash.length += 1;
            }
        },
		_stringSWF:function (config){
			var res,
				attr = EMPTY,
				par = EMPTY,
				src = config.src,
				attrs = config.attrs,
				params = config.params,
				//id,
                k,
                //v,
                tag;



			if(UA['ie']){
				// 创建 object

				tag = OBJECT_TAG;

				// 普通属性
				for (k in attrs){
					if(attrs[k] != OP[k]){ // 过滤原型属性
						if(k != "classid" && k != "data") attr += stringAttr(k,attrs[k]);
					}
				}

				// 特殊属性
				attr += stringAttr('classid',CID);

				// 普通参数
				for (k in params){
					if(k in PARAMS) par += stringParam(k,params[k]);
				}

				par += stringParam('movie',src);

				// 特殊参数
				if(params[FLASHVARS]) par += stringParam(FLASHVARS,Flash.toFlashVars(params[FLASHVARS]));

				res = LT + tag + attr + GT + par + LT + '/' + tag + GT;
			}else{
				// 创建 embed
				tag = EMBED_TAG;

				// 源
				attr += stringAttr('src',src);

				// 普通属性
				for (k in attrs){
					if(attrs[k] != OP[k]){
						if(k != "classid" && k != "data") attr += stringAttr(k,attrs[k]);
					}
				}

				// 特殊属性
				attr += stringAttr('type',TYPE);

				// 参数属性
				for (k in params){
					if(k in PARAMS) par += stringAttr(k,params[k]);
				}

				// 特殊参数
				if(params[FLASHVARS]) par += stringAttr(FLASHVARS,Flash.toFlashVars(params[FLASHVARS]));

				res = LT + tag + attr + par  + '/'  + GT;
			}
			return res
		},

        /**
         * 将对象的 key 全部转为小写
         * 一般用于配置选项 key 的标准化
         */
        _normalize: function(obj) {
            var key, val, prop, ret = obj || { };

            if (S.isPlainObject(obj)) {
                ret = {};

                for (prop in obj) {
                    key = prop.toLowerCase();
                    val = obj[prop];

                    // 忽略自定义传参内容标准化
                    if (key !== FLASHVARS) val = Flash._normalize(val);

                    ret[key] = val;
                }
            }
            return ret;
        },

        /**
         * 将普通对象转换为 flashvars
         * eg: {a: 1, b: { x: 2, z: 's=1&c=2' }} => a=1&b={"x":2,"z":"s%3D1%26c%3D2"}
         */
        toFlashVars: function(obj) {
            if (!S.isPlainObject(obj)) return EMPTY; // 仅支持 PlainOject
            var prop, data, arr = [],ret;

            for (prop in obj) {
                data = obj[prop];

                // 字符串，用双引号括起来 		 [bug]不需要	longzang
                if (S.isString(data)) {
                   //data = '"' + encode(data) + '"';
				   data = encode(data);  	//bugfix:	有些值事实上不需要双引号   longzang 2010/8/4
                }
                // 其它值，用 stringify 转换后，再转义掉字符串值
                else {
                    data = (JSON.stringify(data));
                    if (!data) continue; // 忽略掉 undefined, fn 等值

                    data = data.replace(/:"([^"]+)/g, function(m, val) {
                        return ':"' + encode(val);
                    });
                }

                arr.push(prop + '=' + data);
            }
			ret = arr.join('&');
            return ret.replace(/"/g,"'"); //bugfix: 将 " 替换为 ',以免取值产生问题。  但注意自转换为JSON时，需要进行还原处理。
        }
    });

	function stringAttr(key,value){
		return SPACE + key + EQUAL + DQUOTA + value + DQUOTA;
	}

	function stringParam(key,value){
		return '<param name="' + key + '" value="' + value + '" />';
	}
	
	function pureId(o){
		return S.isString(o) ? o.replace(ID_PRE, '') : o;
	}

    return Flash;


}, { requires:["ua","dom","flash/base","json","flash/ua"] });

KISSY.add("flash", function(S, F) {
    S.Flash = F;
    return F;
}, {
    requires:["flash/base","flash/embed"]
});
/*
Copyright 2011, KISSY UI Library v1.20dev
MIT Licensed
build time: Sep 22 13:54
*/
/**
 * dd support for kissy , dd objects central management module
 * @author  承玉<yiminghe@gmail.com>
 */
KISSY.add('dd/ddm', function(S, DOM, Event, Node, Base) {

    var doc = document,
        BUFFER_TIME = 200,
        MOVE_DELAY = 30,
        SHIM_ZINDEX = 999999;

    function DDM() {
        DDM.superclass.constructor.apply(this, arguments);
        this._init();
    }

    DDM.ATTRS = {
        prefixCls:{
            value:"ks-dd-"
        },
        /**
         * mousedown 后 buffer 触发时间  timeThred
         */
        bufferTime: { value: BUFFER_TIME },

        /**
         * 当前激活的拖动对象，在同一时间只有一个值，所以不是数组
         */
        activeDrag: {},

        /**
         *当前激活的drop对象，在同一时间只有一个值
         */
        activeDrop:{},
        /**
         * 所有注册的可被防止对象，统一管理
         */
        drops:{
            value:[]
        }
    };

    /*
     负责拖动涉及的全局事件：
     1.全局统一的鼠标移动监控
     2.全局统一的鼠标弹起监控，用来通知当前拖动对象停止
     3.为了跨越 iframe 而统一在底下的遮罩层
     */
    S.extend(DDM, Base, {

        _regDrop:function(d) {
            this.get("drops").push(d);
        },

        _unregDrop:function(d) {
            var index = S.indexOf(d, this.get("drops"));
            if (index != -1) {
                this.get("drops").splice(index, 1);
            }
        },

        _init: function() {
            var self = this;
            self._showShimMove = S.throttle(self._move, MOVE_DELAY, self);
        },

        /*
         全局鼠标移动事件通知当前拖动对象正在移动
         注意：chrome8: click 时 mousedown-mousemove-mouseup-click 也会触发 mousemove
         */
        _move: function(ev) {
            var activeDrag = this.get('activeDrag');
            //S.log("move");
            if (!activeDrag) {
                return;
            }
            //防止 ie 选择到字
            ev.preventDefault();
            activeDrag._move(ev);
            /**
             * 获得当前的激活drop
             */
            this._notifyDropsMove(ev);
        },

        _notifyDropsMove:function(ev) {

            var activeDrag = this.get("activeDrag"),mode = activeDrag.get("mode");
            var drops = this.get("drops");
            var activeDrop,
                vArea = 0,
                dragRegion = region(activeDrag.get("node")),
                dragArea = area(dragRegion);

            S.each(drops, function(drop) {

                var node = drop.getNodeFromTarget(ev,
                    // node
                    activeDrag.get("dragNode")[0],
                    // proxy node
                    activeDrag.get("node")[0]);

                if (!node
                // 当前 drop 区域已经包含  activeDrag.get("node")
                // 不要返回，可能想调整位置
                    ) {
                    return;
                }

                var a;
                if (mode == "point") {
                    //取鼠标所在的 drop 区域
                    if (inNodeByPointer(node, activeDrag.mousePos)) {
                        if (!activeDrop ||
                            // 当前得到的可放置元素范围更小，取范围小的那个
                            activeDrop.get("node").contains(node)
                            ) {
                            activeDrop = drop;
                        }
                    }
                } else if (mode == "intersect") {
                    //取一个和activeDrag交集最大的drop区域
                    a = area(intersect(dragRegion, region(node)));
                    if (a > vArea) {
                        vArea = a;
                        activeDrop = drop;
                    }

                } else if (mode == "strict") {
                    //drag 全部在 drop 里面
                    a = area(intersect(dragRegion, region(node)));
                    if (a == dragArea) {
                        activeDrop = drop;
                        return false;
                    }
                }
            });
            var oldDrop = this.get("activeDrop");
            if (oldDrop && oldDrop != activeDrop) {
                oldDrop._handleOut(ev);
            }
            if (activeDrop) {
                activeDrop._handleOver(ev);
            } else {
                activeDrag.get("node").removeClass(this.get("prefixCls") + "drag-over");
                this.set("activeDrop", null);
            }
        },

        _deactivateDrops:function() {
            var activeDrag = this.get("activeDrag"),
                activeDrop = this.get("activeDrop");
            activeDrag.get("node").removeClass(this.get("prefixCls") + "drag-over");
            if (activeDrop) {
                var ret = { drag: activeDrag, drop: activeDrop};
                activeDrop.get("node").removeClass(this.get("prefixCls") + "drop-over");
                activeDrop.fire('drophit', ret);
                activeDrag.fire('dragdrophit', ret);
                this.fire("drophit", ret);
                this.fire("dragdrophit", ret);
            } else {
                activeDrag.fire('dragdropmiss', {
                    drag:activeDrag
                });
                this.fire("dragdropmiss", {
                    drag:activeDrag
                });
            }
        },

        /**
         * 当前拖动对象通知全局：我要开始啦
         * 全局设置当前拖动对象，
         * 还要根据配置进行 buffer 处理
         * @param drag
         */
        _start: function(drag) {
            var self = this,
                bufferTime = self.get("bufferTime") || 0;

            //事件先要注册好，防止点击，导致 mouseup 时还没注册事件
            self._registerEvent();

            //是否中央管理，强制限制拖放延迟
            if (bufferTime) {
                self._bufferTimer = setTimeout(function() {
                    self._bufferStart(drag);
                }, bufferTime);
            } else {
                self._bufferStart(drag);
            }
        },

        _bufferStart: function(drag) {
            var self = this;
            self.set('activeDrag', drag);

            //真正开始移动了才激活垫片
            if (drag.get("shim")) {
                self._activeShim();
            }

            drag._start();
            drag.get("dragNode").addClass(this.get("prefixCls") + "dragging");
        },

        /**
         * 全局通知当前拖动对象：你结束拖动了！
         * @param ev
         */
        _end: function(ev) {
            var self = this,
                activeDrag = self.get("activeDrag");
            self._unregisterEvent();
            if (self._bufferTimer) {
                clearTimeout(self._bufferTimer);
                self._bufferTimer = null;
            }
            self._shim && self._shim.css({
                display:"none"
            });

            if (!activeDrag) {
                return;
            }
            activeDrag._end(ev);
            activeDrag.get("dragNode").removeClass(this.get("prefixCls") + "dragging");
            //处理 drop，看看到底是否有 drop 命中
            this._deactivateDrops(ev);
            self.set("activeDrag", null);
            self.set("activeDrop", null);
        },

        /**
         * 垫片只需创建一次
         */
        _activeShim: function() {
            var self = this,doc = document;
            //创造垫片，防止进入iframe，外面document监听不到 mousedown/up/move
            self._shim = new Node("<div " +
                "style='" +
                //red for debug
                "background-color:red;" +
                "position:absolute;" +
                "left:0;" +
                "width:100%;" +
                "top:0;" +
                "cursor:move;" +
                "z-index:" +
                //覆盖iframe上面即可
                SHIM_ZINDEX
                + ";" +
                "'><" + "/div>").appendTo(doc.body);
            //0.5 for debug
            self._shim.css("opacity", 0);
            self._activeShim = self._showShim;
            self._showShim();
        },

        _showShim: function() {
            var self = this;
            self._shim.css({
                display: "",
                height: DOM['docHeight']()
            });
        },

        /**
         * 开始时注册全局监听事件
         */
        _registerEvent: function() {
            var self = this;
            Event.on(doc, 'mouseup', self._end, self);
            Event.on(doc, 'mousemove', self._showShimMove, self);
        },

        /**
         * 结束时需要取消掉，防止平时无谓的监听
         */
        _unregisterEvent: function() {
            var self = this;
            Event.remove(doc, 'mousemove', self._showShimMove, self);
            Event.remove(doc, 'mouseup', self._end, self);
        }
    });

    function region(node) {
        var offset = node.offset();
        return {
            left:offset.left,
            right:offset.left + node.outerWidth(),
            top:offset.top,
            bottom:offset.top + node.outerHeight()
        };
    }

    function inRegion(region, pointer) {

        return region.left <= pointer.left
            && region.right >= pointer.left
            && region.top <= pointer.top
            && region.bottom >= pointer.top;
    }

    function area(region) {
        if (region.top >= region.bottom || region.left >= region.right) {
            return 0;
        }
        return (region.right - region.left) * (region.bottom - region.top);
    }

    function intersect(r1, r2) {
        var t = Math.max(r1.top, r2.top),
            r = Math.min(r1.right, r2.right),
            b = Math.min(r1.bottom, r2.bottom),
            l = Math.max(r1.left, r2.left);
        return {
            left:l,
            right:r,
            top:t,
            bottom:b
        };
    }

    function inNodeByPointer(node, point) {
        return inRegion(region(node), point);
    }

    var ddm = new DDM();
    ddm.inRegion = inRegion;
    ddm.region = region;
    return ddm;
}, {
    requires:["dom","event","node","base"]
});
/**
 * dd support for kissy, drag for dd
 * @author  承玉<yiminghe@gmail.com>
 */
KISSY.add('dd/draggable', function(S, UA, Node, Base, DDM) {

    /*
     拖放纯功能类
     */
    function Draggable() {
        Draggable.superclass.constructor.apply(this, arguments);
        this._init();
    }

    Draggable['POINT'] = "point";
    Draggable.INTERSECT = "intersect";
    Draggable.STRICT = "strict";

    Draggable.ATTRS = {
        /**
         * 拖放节点，可能指向 proxy node
         */
        node: {
            setter:function(v) {
                return Node.one(v);
            }
        },
        /*
         真实的节点
         */
        dragNode:{},

        /**
         * 是否需要遮罩跨越iframe
         */
        shim:{
            value:true
        },

        /**
         * handler 数组，注意暂时必须在 node 里面
         */
        handlers:{
            value:[]
        },
        cursor:{
            value:"move"
        },

        mode:{
            /**
             * @enum point,intersect,strict
             * @description
             *  In point mode, a Drop is targeted by the cursor being over the Target
             *  In intersect mode, a Drop is targeted by "part" of the drag node being over the Target
             *  In strict mode, a Drop is targeted by the "entire" drag node being over the Target             *
             */
            value:'point'
        }

    };

    S.extend(Draggable, Base, {

        _init: function() {
            var self = this,
                node = self.get('node'),
                handlers = self.get('handlers');
            self.set("dragNode", node);

            if (handlers.length === 0) {
                handlers[0] = node;
            }

            for (var i = 0; i < handlers.length; i++) {
                var hl = handlers[i];
                hl = Node.one(hl);
                //ie 不能在其内开始选择区域
                hl.unselectable();
                if (self.get("cursor")) {
                    hl.css('cursor', self.get("cursor"));
                }
            }
            node.on('mousedown', self._handleMouseDown, self);
        },

        destroy:function() {
            var self = this,
                node = self.get('dragNode'),
                handlers = self.get('handlers');
            for (var i = 0; i < handlers.length; i++) {
                var hl = handlers[i];
                if (hl.css("cursor") == self.get("cursor")) {
                    hl.css("cursor", "auto");
                }
            }
            node.detach('mousedown', self._handleMouseDown, self);
            self.detach();
        },

        _check: function(t) {
            var handlers = this.get('handlers');

            for (var i = 0; i < handlers.length; i++) {
                var hl = handlers[i];
                if (hl.contains(t)
                    ||
                    //子区域内点击也可以启动
                    hl[0] == t[0]) {
                    return true;
                }
            }
            return false;
        },

        /**
         * 鼠标按下时，查看触发源是否是属于 handler 集合，
         * 保存当前状态
         * 通知全局管理器开始作用
         * @param ev
         */
        _handleMouseDown: function(ev) {
            var self = this,
                t = new Node(ev.target);

            if (!self._check(t)) {
                return;
            }
            //chrome 阻止了 flash 点击？？
            //不组织的话chrome会选择
            //if (!UA.webkit) {
            //firefox 默认会拖动对象地址
            ev.preventDefault();
            //}
            self._prepare(ev);

        },

        _prepare:function(ev) {
            var self = this;

            DDM._start(self);

            var node = self.get("node"),
                mx = ev.pageX,
                my = ev.pageY,
                nxy = node.offset();
            self['startMousePos'] = self.mousePos = {
                left:mx,
                top:my
            };
            self.startNodePos = nxy;
            self._diff = {
                left:mx - nxy.left,
                top:my - nxy.top
            };
            self.set("diff", self._diff);
        },

        _move: function(ev) {
            var self = this,
                diff = self.get("diff"),
                left = ev.pageX - diff.left,
                top = ev.pageY - diff.top;
            self.mousePos = {
                left:ev.pageX,
                top:ev.pageY
            };
            var ret = {
                left:left,
                top:top,
                pageX:ev.pageX,
                pageY:ev.pageY,
                drag:this
            };
            self.fire("drag", ret);
            DDM.fire("drag", ret);
        },

        _end: function() {
            this.fire("dragend", {
                drag:this
            });
            DDM.fire("dragend", {
                drag:this
            });
        },

        _start: function() {
            this.fire("dragstart", {
                drag:this
            });
            DDM.fire("dragstart", {
                drag:this
            });
        }
    });

    return Draggable;

},
{
    requires:["ua","node","base","./ddm"]
});
/**
 * droppable for kissy
 * @author yiminghe@gmail.com
 */
KISSY.add("dd/droppable", function(S, Node, Base, DDM) {

    function Droppable() {
        Droppable.superclass.constructor.apply(this, arguments);
        this._init();
    }

    Droppable.ATTRS = {
        /**
         * 放节点
         */
        node: {
            setter:function(v) {
                if (v) {
                    var n = Node.one(v);
                    n.addClass(DDM.get("prefixCls") + "drop");
                    return n;
                }
            }
        }

    };

    S.extend(Droppable, Base, {
            /**
             * 用于被 droppable-delegate override
             */
            getNodeFromTarget:function(ev, dragNode, proxyNode) {
                var node=this.get("node"),
                    domNode = node[0];
                // 排除当前拖放和代理节点
                return domNode == dragNode || domNode == proxyNode
                    ? null : node;
            },
            _init:function() {
                DDM._regDrop(this);
            },
            _handleOut:function() {
                var activeDrag = DDM.get("activeDrag");

                this.get("node").removeClass(DDM.get("prefixCls") + "drop-over");
                var ret = {
                    drop:this,
                    drag:activeDrag
                };
                this.fire("dropexit", ret);
                DDM.fire("dropexit", ret);
                activeDrag.get("node").removeClass(DDM.get("prefixCls") + "drag-over");
                activeDrag.fire("dragexit", ret);
                DDM.fire("dragexit", ret);
            },
            _handleOver:function(ev) {
                var oldDrop = DDM.get("activeDrop");
                DDM.set("activeDrop", this);
                var activeDrag = DDM.get("activeDrag");
                this.get("node").addClass(DDM.get("prefixCls") + "drop-over");
                var evt = S.mix({
                        drag:activeDrag,
                        drop:this
                    }, ev);
                if (this != oldDrop) {
                    activeDrag.get("node").addClass(DDM.get("prefixCls") + "drag-over");
                    //第一次先触发 dropenter,dragenter
                    activeDrag.fire("dragenter", evt);
                    this.fire("dropenter", evt);
                    DDM.fire("dragenter", evt);
                    DDM.fire("dropenter", evt);
                } else {
                    activeDrag.fire("dragover", evt);
                    this.fire("dropover", evt);
                    DDM.fire("dragover", evt);
                    DDM.fire("dropover", evt);
                }
            },
            destroy:function() {
                DDM._unregDrop(this);
            }
        });

    return Droppable;

}, { requires:["node","base","./ddm"] });/**
 * generate proxy drag object,
 * @author yiminghe@gmail.com
 */
KISSY.add("dd/proxy", function(S, Node) {
    var DESTRUCTOR_ID = "__proxy_destructors",
        DRAG_TAG = "__proxy_id",
        PROXY_ATTR = "__proxy";

    function Proxy() {
        Proxy.superclass.constructor.apply(this, arguments);
        this[DESTRUCTOR_ID] = {};
    }

    Proxy.ATTRS = {
        node:{
            /*
             如何生成替代节点
             @return {KISSY.Node} 替代节点
             */
            value:function(drag) {
                return new Node(drag.get("node").clone(true));
                //n.attr("id", S.guid("ks-dd-proxy"));
            }
        },
        destroyOnEnd:{
            /**
             * 是否每次都生成新节点/拖放完毕是否销毁当前代理节点
             */
            value:false
        }
    };

    S.extend(Proxy, S.Base, {
        attach:function(drag) {
            if (drag[DRAG_TAG]) {
                return;
            }

            var self = this;

            function start() {
                var node = self.get("node");
                var dragNode = drag.get("node");

                if (!self[PROXY_ATTR] && S.isFunction(node)) {
                    node = node(drag);
                    node.addClass("ks-dd-proxy");
                    node.css("position", "absolute");
                    self[PROXY_ATTR] = node;
                }
                dragNode.parent().append(self[PROXY_ATTR]);
                self[PROXY_ATTR].show();
                self[PROXY_ATTR].offset(dragNode.offset());
                drag.set("dragNode", dragNode);
                drag.set("node", self[PROXY_ATTR]);
            }

            function end() {
                var node = self[PROXY_ATTR];
                drag.get("dragNode").offset(node.offset());
                node.hide();
                if (self.get("destroyOnEnd")) {
                    node.remove();
                    self[PROXY_ATTR] = null;
                }
                drag.set("node", drag.get("dragNode"));
            }

            drag.on("dragstart", start);
            drag.on("dragend", end);

            var tag = drag[DRAG_TAG] = S.guid("dd-proxyid-");

            self[DESTRUCTOR_ID][tag] = {
                drag:drag,
                fn:function() {
                    drag.detach("dragstart", start);
                    drag.detach("dragend", end);
                }
            };
        },
        unAttach:function(drag) {
            var tag = drag[DRAG_TAG];
            if (!tag) {
                return;
            }
            this[DESTRUCTOR_ID][tag].fn();
            delete this[DESTRUCTOR_ID][tag];
            delete drag[DRAG_TAG];
        },

        destroy:function() {
            var node = this.get("node");
            if (node && !S.isFunction(node)) {
                node.remove();
            }
            for (var d in this[DESTRUCTOR_ID]) {
                this.unAttach(this[DESTRUCTOR_ID][d].drag);
            }
        }
    });

    return Proxy;
}, {
    requires:['node']
});/**
 * delegate all draggable nodes to one draggable object
 * @author yiminghe@gmail.com
 */
KISSY.add("dd/draggable-delegate", function(S, DDM, Draggable, DOM,Node) {
    function Delegate() {
        Delegate.superclass.constructor.apply(this, arguments);
    }

    S.extend(Delegate, Draggable, {
        _init:function() {
            var self = this,
                handlers = self.get('handlers'),
                node = self.get('container');
            if (handlers.length === 0) {
                handlers.push(self.get("selector"));
            }
            node.on('mousedown', self._handleMouseDown, self);
        },

        /**
         * 得到适合 handler，从这里开始启动拖放，对于 handlers 选择器字符串数组
         * @param target
         */
        _getHandler:function(target) {
            var self = this,
                node = this.get("container"),
                handlers = self.get('handlers');

            while (target && target[0] !== node[0]) {
                for (var i = 0; i < handlers.length; i++) {
                    var h = handlers[i];
                    if (DOM.test(target[0], h, node[0])) {
                        return target;
                    }
                }
                target = target.parent();
            }
        },

        /**
         * 找到真正应该移动的节点，对应 selector 属性选择器字符串
         * @param h
         */
        _getNode:function(h) {
            var node = this.get("container"),sel = this.get("selector");
            while (h && h[0] != node[0]) {
                if (DOM.test(h[0], sel, node[0])) {
                    return h;
                }
                h = h.parent();
            }
        },

        /**
         * 父容器监听 mousedown，找到合适的拖动 handlers 以及拖动节点
         *
         * @param ev
         */
        _handleMouseDown:function(ev) {
            var self = this;
            var target = new Node(ev.target);
            var handler = target && this._getHandler(target);
            if (!handler) {
                return;
            }
            var node = this._getNode(handler);
            if (!node) {
                return;
            }
            ev.preventDefault();
            self.set("node", node);
            self.set("dragNode", node);
            self._prepare(ev);
        },

        destroy:function() {
            var self = this;
            self.get("container").detach('mousedown',
                self._handleMouseDown,
                self);
            self.detach();
        }
    },
    {
        ATTRS:{
            /**
             * 用于委托的父容器
             */
            container:{
                setter:function(v) {
                    return Node.one(v);
                }
            },

            /**
             * 实际拖放的节点选择器，一般用 tag.cls
             */
            selector:{
            }

        /**
         * 继承来的 handlers : 拖放句柄选择器数组，一般用 [ tag.cls ]
         * 不设则为 [ selector ]
         *
         * handlers:{
         *  value:[]
         * }
         */
        }
    });

    return Delegate;
}, {
    requires:['./ddm','./draggable','dom','node']
});/**
 * only one droppable instance for multiple droppable nodes
 * @author yiminghe@gmail.com
 */
KISSY.add("dd/droppable-delegate", function(S, DDM, Droppable, DOM, Node) {
    function DroppableDelegate() {
        DroppableDelegate.superclass.constructor.apply(this, arguments);
    }

    S.extend(DroppableDelegate, Droppable, {

            /**
             * 根据鼠标位置得到真正的可放目标，暂时不考虑 mode，只考虑鼠标
             * @param ev
             */
            getNodeFromTarget:function(ev, dragNode, proxyNode) {

                var pointer = {
                    left:ev.pageX,
                    top:ev.pageY
                };

                var container = this.get("container"),
                    selector = this.get("selector");

                var allNodes = container.all(selector);
                //S.log("start ***********************");
                for (var i = 0; i < allNodes.length; i++) {
                    var domNode = allNodes[i],
                        n = new Node(domNode);
                    // 排除当前拖放的元素以及代理节点
                    if (domNode == proxyNode || domNode == dragNode) {
                        continue;
                    }
                    //S.log(n.attr("class"));
                    if (DDM.inRegion(DDM.region(n), pointer)) {
                        this.set("lastNode", this.get("node"));
                        this.set("node", n);
                        //S.log("end ***********************");
                        return n;
                    }
                }
                //S.log("end ***********************");
                return null;
            },

            _handleOut:function() {
                DroppableDelegate.superclass._handleOut.call(this);
                this.set("node", null);
                this.set("lastNode", null);
            },

            _handleOver:function(ev) {
                var oldDrop = DDM.get("activeDrop");
                DDM.set("activeDrop", this);
                var activeDrag = DDM.get("activeDrag");
                this.get("node").addClass(DDM.get("prefixCls") + "drop-over");
                var evt = S.mix({
                        drag:activeDrag,
                        drop:this
                    }, ev);
                var node = this.get("node"),
                    lastNode = this.get("lastNode");

                if (this != oldDrop
                    || !lastNode
                    || (lastNode && lastNode[0] !== node[0])
                    ) {
                    /**
                     * 两个可 drop 节点相邻，先通知上次的离开
                     */
                    if (lastNode) {
                        this.set("node", lastNode);
                        DroppableDelegate.superclass._handleOut.call(this);
                    }
                    /**
                     * 再通知这次的进入
                     */
                    this.set("node", node);
                    activeDrag.get("node").addClass(DDM.get("prefixCls") + "drag-over");
                    //第一次先触发 dropenter,dragenter
                    activeDrag.fire("dragenter", evt);
                    this.fire("dropenter", evt);
                    DDM.fire("dragenter", evt);
                    DDM.fire("dropenter", evt);
                } else {

                    activeDrag.fire("dragover", evt);
                    this.fire("dropover", evt);
                    DDM.fire("dragover", evt);
                    DDM.fire("dropover", evt);
                }
            }
        },
        {
            ATTRS:{
                /**
                 * 上一个成为放目标的节点
                 */
                lastNode:{
                }
                ,
                /**
                 * 放目标节点选择器
                 */
                selector:{
                }
                ,
                /**
                 * 放目标所在区域
                 */
                container:{
                    setter:function(v) {
                        return Node.one(v);
                    }
                }
            }
        });

    return DroppableDelegate;
}, {
        requires:['./ddm','./droppable','dom','node']
    });/**
 * auto scroll for drag object's container
 * @author yiminghe@gmail.com
 */
KISSY.add("dd/scroll", function(S, Base, Node, DOM) {

    var TAG_DRAG = "__dd-scroll-id-",
        RATE = [10,10],
        ADJUST_DELAY = 100,
        DIFF = [20,20],
        DESTRUCTORS = "__dd_scrolls";

    function Scroll() {
        Scroll.superclass.constructor.apply(this, arguments);
        this[DESTRUCTORS] = {};
    }

    Scroll.ATTRS = {
        node:{
            setter:function(v) {
                return Node.one(v);
            }
        },
        rate:{
            value:RATE
        },
        diff:{
            value:DIFF
        }
    };


    function isWin(node) {
        return !node || node == window;
    }

    S.extend(Scroll, Base, {

        getRegion:function(node) {
            if (isWin(node)) {
                return {
                    width:DOM.viewportWidth(),
                    height:DOM.viewportHeight()
                };
            } else {
                return {
                    width:node.outerWidth(),
                    height:node.outerHeight()
                };
            }
        },

        getOffset:function(node) {
            if (isWin(node)) {
                return {
                    left:DOM.scrollLeft(),
                    top:DOM.scrollTop()
                };
            } else {
                return node.offset();
            }
        },

        getScroll:function(node) {
            if (isWin(node)) {
                return {
                    left:DOM.scrollLeft(),
                    top:DOM.scrollTop()
                };
            } else {
                return {
                    left:node[0].scrollLeft,
                    top:node[0].scrollTop
                };
            }
        },

        setScroll:function(node, r) {
            if (isWin(node)) {
                window.scrollTo(r.left, r.top);
            } else {
                node[0].scrollLeft = r.left;
                node[0].scrollTop = r.top;
            }
        },

        unAttach:function(drag) {
            var tag = drag[TAG_DRAG];
            if (!tag) {
                return;
            }
            this[DESTRUCTORS][tag].fn();
            delete drag[TAG_DRAG];
            delete this[DESTRUCTORS][tag];
        },

        destroy:function() {
            for (var d in this[DESTRUCTORS]) {
                this.unAttach(this[DESTRUCTORS][d].drag);
            }
        },

        attach:function(drag) {
            if (drag[TAG_DRAG]) {
                return;
            }

            var self = this,
                rate = self.get("rate"),
                diff = self.get("diff"),
                event,
                /*
                 目前相对 container 的便宜，container 为 window 时，相对于 viewport
                 */
                dxy,
                timer = null;

            function dragging(ev) {
                if (ev.fake) {
                    return;
                }
                var node = self.get("node");
                event = ev;
                dxy = S.clone(drag.mousePos);
                var offset = self.getOffset(node);
                dxy.left -= offset.left;
                dxy.top -= offset.top;
                if (!timer) {
                    startScroll();
                }
            }

            function dragend() {
                clearTimeout(timer);
                timer = null;
            }

            drag.on("drag", dragging);

            drag.on("dragend", dragend);

            var tag = drag[TAG_DRAG] = S.guid(TAG_DRAG);
            self[DESTRUCTORS][tag] = {
                drag:drag,
                fn:function() {
                    drag.detach("drag", dragging);
                    drag.detach("dragend", dragend);
                }
            };


            function startScroll() {
                //S.log("******* scroll");
                var node = self.get("node"),
                    r = self.getRegion(node),
                    nw = r.width,
                    nh = r.height,
                    scroll = self.getScroll(node),
                    origin = S.clone(scroll);

                var diffY = dxy.top - nh;
                //S.log(diffY);
                var adjust = false;
                if (diffY >= -diff[1]) {
                    scroll.top += rate[1];
                    adjust = true;
                }

                var diffY2 = dxy.top;
                //S.log(diffY2);
                if (diffY2 <= diff[1]) {
                    scroll.top -= rate[1];
                    adjust = true;
                }


                var diffX = dxy.left - nw;
                //S.log(diffX);
                if (diffX >= -diff[0]) {
                    scroll.left += rate[0];
                    adjust = true;
                }

                var diffX2 = dxy.left;
                //S.log(diffX2);
                if (diffX2 <= diff[0]) {
                    scroll.left -= rate[0];
                    adjust = true;
                }

                if (adjust) {

                    self.setScroll(node, scroll);
                    timer = setTimeout(arguments.callee, ADJUST_DELAY);
                    // 不希望更新相对值，特别对于相对 window 时，相对值如果不真正拖放触发的 drag，是不变的，
                    // 不会因为程序 scroll 而改变相对值
                    event.fake = true;
                    if (isWin(node)) {
                        // 当使 window 自动滚动时，也要使得拖放物体相对文档位置随 scroll 改变
                        // 而相对 node 容器时，只需 node 容器滚动，拖动物体相对文档位置不需要改变
                        scroll = self.getScroll(node);
                        event.left += scroll.left - origin.left;
                        event.top += scroll.top - origin.top;
                    }
                    drag.fire("drag", event);
                } else {
                    timer = null;
                }
            }

        }
    });

    return Scroll;
}, {
    requires:['base','node','dom']
});/**
 * dd support for kissy
 * @author  承玉<yiminghe@gmail.com>
 */
KISSY.add("dd", function(S, DDM, Draggable, Droppable, Proxy, Delegate, DroppableDelegate, Scroll) {
    var dd = {
        Draggable:Draggable,
        Droppable:Droppable,
        DDM:DDM,
        Proxy:Proxy,
        DraggableDelegate:Delegate,
        DroppableDelegate:DroppableDelegate,
        Scroll:Scroll
    };

    S.mix(S, dd);

    return dd;
}, {
    requires:["dd/ddm",
        "dd/draggable",
        "dd/droppable",
        "dd/proxy",
        "dd/draggable-delegate",
        "dd/droppable-delegate",
        "dd/scroll"]
});
/*
Copyright 2011, KISSY UI Library v1.20dev
MIT Licensed
build time: Sep 22 13:54
*/
/**
 * resizable support for kissy
 * @author  承玉<yiminghe@gmail.com>
 * @requires: dd
 */
KISSY.add("resizable/base", function(S, Node, D, UIBase) {

    var Draggable = D.Draggable,
        CLS_PREFIX = "ke-resizehandler";

    var hcNormal = {
        "t":function(minW, maxW, minH, maxH, ot, ol, ow, oh, diffT) {
            var h = getBoundValue(minH, maxH, oh - diffT);
            var t = ot + oh - h;
            return [0,h,t,0]
        },
        "b":function(minW, maxW, minH, maxH, ot, ol, ow, oh, diffT) {
            var h = getBoundValue(minH, maxH, oh + diffT);
            return [0,h,0,0];
        },
        "r":function(minW, maxW, minH, maxH, ot, ol, ow, oh, diffT, diffL) {
            var w = getBoundValue(minW, maxW, ow + diffL);
            return [w,0,0,0];
        },
        "l":function(minW, maxW, minH, maxH, ot, ol, ow, oh, diffT, diffL) {
            var w = getBoundValue(minW, maxW, ow - diffL);
            var l = ol + ow - w;
            return [w,0,0,l]
        }
    };

    var horizonal = ["l","r"],vertical = ["t","b"];
    for (var i = 0; i < horizonal.length; i++) {
        for (var j = 0; j < vertical.length; j++) {
            (function(h, v) {
                hcNormal[ h + v] = hcNormal[ v + h] = function() {
                    return merge(hcNormal[h].apply(this, arguments),
                        hcNormal[v].apply(this, arguments));
                }
            })(horizonal[i], vertical[j]);
        }
    }
    function merge(a1, a2) {
        var a = [];
        for (var i = 0; i < a1.length; i++) {
            a[i] = a1[i] || a2[i];
        }
        return a;
    }

    function getBoundValue(min, max, v) {
        return Math.min(Math.max(min, v), max);
    }


    return UIBase.create([], {
        renderUI:function() {
            var self = this,node = self.get("node");
            self.dds = {};
            if (node.css("position") == "static") {
                node.css("position", "relative");
            }
        },
        _uiSetHandlers:function(v) {
            var self = this,
                dds = self.dds,
                node = self.get("node");
            self.destructor();
            for (var i = 0; i < v.length; i++) {
                var hc = v[i],
                    el = new Node("<div class='" + CLS_PREFIX +
                        " " + CLS_PREFIX + "-" + hc + "'/>")
                        .prependTo(node),
                    dd = dds[hc] = new Draggable({
                        node:el,
                        cursor:null
                    });
                dd.on("drag", self._drag, self);
                dd.on("dragstart", self._dragStart, self);
            }
        },
        _dragStart:function() {
            var self = this,node = self.get("node");
            self._width = node.width();
            self._top = parseInt(node.css("top"));
            self._left = parseInt(node.css("left"));
            self._height = node.height();
        },
        _drag:function(ev) {
            var self = this,
                node = self.get("node"),
                dd = ev.currentTarget || ev.target,
                hc = self._getHanderC(dd),
                ow = self._width,
                oh = self._height,
                minW = self.get("minWidth"),
                maxW = self.get("maxWidth"),
                minH = self.get("minHeight"),
                maxH = self.get("maxHeight"),
                diffT = ev.top - dd.startNodePos.top,
                diffL = ev.left - dd.startNodePos.left,
                ot = self._top,
                ol = self._left;

            var pos = hcNormal[hc](minW, maxW, minH, maxH, ot, ol, ow, oh, diffT, diffL);
            var attr = ["width","height","top","left"];
            for (var i = 0; i < attr.length; i++) {
                if (pos[i]) {
                    node.css(attr[i], pos[i]);
                }
            }
        },

        _getHanderC:function(dd) {
            var dds = this.dds;
            for (var d in dds) {
                if (!dds.hasOwnProperty(d)) {
                    return;
                }
                if (dds[d] == dd) {
                    return d;
                }
            }
        },
        destructor:function() {
            var self = this,
                dds = self.dds;
            for (var d in dds) {
                if (!dds.hasOwnProperty(d)){
                    return;
                }
                dds[d].destroy();
                dds[d].get("node").remove();
                delete dds[d];
            }
        }
    }, {
        ATTRS:{
            node:{
                setter:function(v) {
                    return Node.one(v);
                }
            },
            minWidth:{
                value:0
            },
            minHeight:{
                value:0
            },
            maxWidth:{
                value:Number.MAX_VALUE
            },
            maxHeight:{
                value:Number.MAX_VALUE
            },
            handlers:{
                //t,tr,r,br,b,bl,l,tl
                value:[]
            }
        }
    });

}, { requires:["node","dd","uibase"] });
KISSY.add("resizable", function(S, R) {
    S.Resizable = R;
    return R;
}, {
    requires:["resizable/base"]
});
/*
Copyright 2011, KISSY UI Library v1.20dev
MIT Licensed
build time: Sep 22 13:55
*/
/**
 * UIBase.Align
 * @author yiminghe@gmail.com , qiaohua@taobao.com
 */
KISSY.add('uibase/align', function(S, UA, DOM, Node) {


    /**
     * inspired by closure library by Google
     * @refer http://yiminghe.iteye.com/blog/1124720
     */

    /**
     * 得到影响元素显示的父亲元素
     */
    function getOffsetParent(element) {
        // ie 这个也不是完全可行
        /**
         <div style="width: 50px;height: 100px;overflow: hidden">
         <div style="width: 50px;height: 100px;position: relative;" id="d6">
         元素 6 高 100px 宽 50px<br/>
         </div>
         </div>
         **/
//            if (UA['ie']) {
//                return element.offsetParent;
//            }
        var body = element.ownerDocument.body,
            positionStyle = DOM.css(element, 'position'),
            skipStatic = positionStyle == 'fixed' || positionStyle == 'absolute';

        for (var parent = element.parentNode;
             parent && parent != body;
             parent = parent.parentNode) {

            positionStyle = DOM.css(parent, 'position');

            skipStatic = skipStatic && positionStyle == 'static';

            var parentOverflow = DOM.css(parent, "overflow");

            // 必须有 overflow 属性，可能会隐藏掉子孙元素
            if (parentOverflow != 'visible' && (
                // 元素初始为 fixed absolute ，遇到 父亲不是 定位元素忽略
                // 否则就可以
                !skipStatic ||
                    positionStyle == 'fixed' ||
                    positionStyle == 'absolute' ||
                    positionStyle == 'relative'
                )) {
                return parent;
            }
        }
        return null;
    }

    /**
     * 获得元素的显示部分的区域
     */
    function getVisibleRectForElement(element) {
        var visibleRect = {
            left:0,
            right:Infinity,
            top:0,
            bottom:Infinity
        };

        for (var el = element; el = getOffsetParent(el);) {


            var clientWidth = el.clientWidth;

            if (
            // clientWidth is zero for inline block elements in IE.
                (!UA['ie'] || clientWidth !== 0)
            // on WEBKIT, body element can have clientHeight = 0 and scrollHeight > 0
            // && (!UA['webkit'] || clientHeight != 0 || el != body)
            // overflow 不为 visible 则可以限定其内元素
            // && (scrollWidth != clientWidth || scrollHeight != clientHeight)
            // offsetParent 已经判断过了
            //&& DOM.css(el, 'overflow') != 'visible'
                ) {
                var clientLeft = el.clientLeft,
                    clientTop = el.clientTop,
                    pos = DOM.offset(el),
                    client = {
                        left:clientLeft,
                        top:clientTop
                    };
                pos.left += client.left;
                pos.top += client.top;

                visibleRect.top = Math.max(visibleRect['top'], pos.top);
                visibleRect.right = Math.min(visibleRect.right,
                    pos.left + el.clientWidth);
                visibleRect.bottom = Math.min(visibleRect['bottom'],
                    pos.top + el.clientHeight);
                visibleRect.left = Math.max(visibleRect.left, pos.left);
            }
        }

        var scrollX = DOM.scrollLeft(),
            scrollY = DOM.scrollTop();

        visibleRect.left = Math.max(visibleRect.left, scrollX);
        visibleRect.top = Math.max(visibleRect['top'], scrollY);
        visibleRect.right = Math.min(visibleRect.right, scrollX + DOM.viewportWidth());
        visibleRect.bottom = Math.min(visibleRect['bottom'], scrollY + DOM.viewportHeight());

        return visibleRect.top >= 0 && visibleRect.left >= 0 &&
            visibleRect.bottom > visibleRect.top &&
            visibleRect.right > visibleRect.left ?
            visibleRect : null;
    }

    function isFailed(status) {
        for (var s in status) {
            if (s.indexOf("fail") === 0) {
                return true;
            }
        }
        return false;
    }

    function positionAtAnchor(alignCfg) {
        var offset = alignCfg.offset,
            node = alignCfg.node,
            points = alignCfg.points,
            self = this,
            xy,
            diff,
            p1,
            //如果没有view，就是不区分mvc
            el = self.get('el'),
            p2;

        offset = offset || [0,0];
        xy = el.offset();

        // p1 是 node 上 points[0] 的 offset
        // p2 是 overlay 上 points[1] 的 offset
        p1 = getAlignOffset(node, points[0]);
        p2 = getAlignOffset(el, points[1]);

        diff = [p2.left - p1.left, p2.top - p1.top];
        xy = {
            left: xy.left - diff[0] + (+offset[0]),
            top: xy.top - diff[1] + (+offset[1])
        };

        return positionAtCoordinate.call(self, xy, alignCfg);
    }


    function positionAtCoordinate(absolutePos, alignCfg) {
        var self = this,el = self.get('el');
        var status = {};
        var elSize = {width:el.outerWidth(),height:el.outerHeight()},
            size = S.clone(elSize);
        if (!S.isEmptyObject(alignCfg.overflow)) {
            var viewport = getVisibleRectForElement(el[0]);
            status = adjustForViewport(absolutePos, size, viewport, alignCfg.overflow || {});
            if (isFailed(status)) {
                return status;
            }
        }

        self.set("x", absolutePos.left);
        self.set("y", absolutePos.top);

        if (size.width != elSize.width || size.height != elSize.height) {
            el.width(size.width);
            el.height(size.height);
        }

        return status;

    }


    function adjustForViewport(pos, size, viewport, overflow) {
        var status = {};
        if (pos.left < viewport.left && overflow.adjustX) {
            pos.left = viewport.left;
            status.adjustX = 1;
        }
        // Left edge inside and right edge outside viewport, try to resize it.
        if (pos.left < viewport.left &&
            pos.left + size.width > viewport.right &&
            overflow.resizeWidth) {
            size.width -= (pos.left + size.width) - viewport.right;
            status.resizeWidth = 1;
        }

        // Right edge outside viewport, try to move it.
        if (pos.left + size.width > viewport.right &&
            overflow.adjustX) {
            pos.left = Math.max(viewport.right - size.width, viewport.left);
            status.adjustX = 1;
        }

        // Left or right edge still outside viewport, fail if the FAIL_X option was
        // specified, ignore it otherwise.
        if (overflow.failX) {
            status.failX = pos.left < viewport.left ||
                pos.left + size.width > viewport.right;
        }

        // Top edge outside viewport, try to move it.
        if (pos.top < viewport.top && overflow.adjustY) {
            pos.top = viewport.top;
            status.adjustY = 1;
        }

        // Top edge inside and bottom edge outside viewport, try to resize it.
        if (pos.top >= viewport.top &&
            pos.top + size.height > viewport.bottom &&
            overflow.resizeHeight) {
            size.height -= (pos.top + size.height) - viewport.bottom;
            status.resizeHeight = 1;
        }

        // Bottom edge outside viewport, try to move it.
        if (pos.top + size.height > viewport.bottom &&
            overflow.adjustY) {
            pos.top = Math.max(viewport.bottom - size.height, viewport.top);
            status.adjustY = 1;
        }

        // Top or bottom edge still outside viewport, fail if the FAIL_Y option was
        // specified, ignore it otherwise.
        if (overflow.failY) {
            status.failY = pos.top < viewport.top ||
                pos.top + size.height > viewport.bottom;
        }

        return status;
    }


    function flip(points, reg, map) {
        var ret = [];
        S.each(points, function(p) {
            ret.push(p.replace(reg, function(m) {
                return map[m];
            }));
        });
        return ret;
    }

    function flipOffset(offset, index) {
        offset[index] = -offset[index];
        return offset;
    }

    function Align() {
    }

    Align.ATTRS = {
        align: {
            // 默认不是正中，可以实现自由动画 zoom
//            value:{
//                node: null,         // 参考元素, falsy 值为可视区域, 'trigger' 为触发元素, 其他为指定元素
//                points: ['cc','cc'], // ['tr', 'tl'] 表示 overlay 的 tl 与参考节点的 tr 对齐
//                offset: [0, 0]      // 有效值为 [n, m]
//            }
        }
    };

    /**
     * 获取 node 上的 align 对齐点 相对于页面的坐标
     * @param node
     * @param align
     */
    function getAlignOffset(node, align) {
        var V = align.charAt(0),
            H = align.charAt(1),
            offset, w, h, x, y;

        if (node) {
            node = Node.one(node);
            offset = node.offset();
            w = node.outerWidth();
            h = node.outerHeight();
        } else {
            offset = { left: DOM.scrollLeft(), top: DOM.scrollTop() };
            w = DOM.viewportWidth();
            h = DOM.viewportHeight();
        }

        x = offset.left;
        y = offset.top;

        if (V === 'c') {
            y += h / 2;
        } else if (V === 'b') {
            y += h;
        }

        if (H === 'c') {
            x += w / 2;
        } else if (H === 'r') {
            x += w;
        }

        return { left: x, top: y };
    }

    Align.prototype = {

        _uiSetAlign: function(v) {
            if (S.isPlainObject(v)) {
                this.align(v.node, v.points, v.offset, v.overflow);
            }
        },

        /**
         * 对齐 Overlay 到 node 的 points 点, 偏移 offset 处
         * @param {Element} node 参照元素, 可取配置选项中的设置, 也可是一元素
         * @param {String[]} points 对齐方式
         * @param {Number[]} [offset] 偏移
         */
        align: function(node, points, offset, overflow) {
            var self = this,
                flag = {};
            // 后面会改的，先保存下
            overflow = S.clone(overflow || {});
            offset = offset && [].concat(offset) || [0,0];
            if (overflow.failX) {
                flag.failX = 1;
            }
            if (overflow.failY) {
                flag.failY = 1;
            }
            var status = positionAtAnchor.call(self, {
                node:node,
                points:points,
                offset:offset,
                overflow:flag
            });
            // 如果错误调整重试
            if (isFailed(status)) {
                if (status.failX) {
                    points = flip(points, /[lr]/ig, {
                        l:"r",
                        r:"l"
                    });
                    offset = flipOffset(offset, 0);
                }

                if (status.failY) {
                    points = flip(points, /[tb]/ig, {
                        t:"b",
                        b:"t"
                    });
                    offset = flipOffset(offset, 1);
                }
            }

            status = positionAtAnchor.call(self, {
                node:node,
                points:points,
                offset:offset,
                overflow:flag
            });

            if (isFailed(status)) {
                delete overflow.failX;
                delete overflow.failY;
                status = positionAtAnchor.call(self, {
                    node:node,
                    points:points,
                    offset:offset,
                    overflow:overflow
                });
            }
        },

        /**
         * 居中显示到可视区域, 一次性居中
         */
        center: function(node) {
            this.set('align', {
                node: node,
                points: ["cc", "cc"],
                offset: [0, 0]
            });
        }
    };

    return Align;
}, {
    requires:["ua","dom","node"]
});
/**
 *  2011-07-13 承玉 note:
 *   - 增加智能对齐，以及大小调整选项
 **//**
 * @module  UIBase
 * @author  yiminghe@gmail.com,lifesinger@gmail.com
 * @refer http://martinfowler.com/eaaDev/uiArchs.html
 */
KISSY.add('uibase/base', function (S, Base, Node) {

    var UI_SET = '_uiSet',
        SRC_NODE = 'srcNode',
        ATTRS = 'ATTRS',
        HTML_PARSER = 'HTML_PARSER',
        noop = function() {
        };

    function capitalFirst(s) {
        s += '';
        return s.charAt(0).toUpperCase() + s.substring(1);
    }

    /**
     * UIBase for class-based component
     * @class
     * @extends Base
     * @name UIBase
     * @namespace
     */
    function UIBase(config) {
        // 读取用户设置的属性值并设置到自身
        Base.apply(this, arguments);
        // 根据 srcNode 设置属性值
        // 按照类层次执行初始函数，主类执行 initializer 函数，扩展类执行构造器函数
        initHierarchy(this, config);
        // 是否自动渲染
        config && config.autoRender && this.render();
    }

    /**
     * 模拟多继承
     * init attr using constructors ATTRS meta info
     */
    function initHierarchy(host, config) {

        var c = host.constructor;

        while (c) {

            // 从 markup 生成相应的属性项
            if (config &&
                config[SRC_NODE] &&
                c.HTML_PARSER) {
                if ((config[SRC_NODE] = Node.one(config[SRC_NODE]))) {
                    applyParser.call(host, config[SRC_NODE], c.HTML_PARSER);
                }
            }

            c = c.superclass && c.superclass.constructor;
        }

        callMethodByHierarchy(host, "initializer", "constructor");

    }

    function callMethodByHierarchy(host, mainMethod, extMethod) {
        var c = host.constructor,
            extChains = [],
            ext,
            main,
            exts,
            t;

        // define
        while (c) {

            // 收集扩展类
            t = [];
            if (exts = c.__ks_exts) {
                for (var i = 0; i < exts.length; i++) {
                    ext = exts[i];
                    if (ext) {
                        if (extMethod != "constructor") {
                            //只调用真正自己构造器原型的定义，继承原型链上的不要管
                            if (ext.prototype.hasOwnProperty(extMethod)) {
                                ext = ext.prototype[extMethod];
                            } else {
                                ext = null;
                            }
                        }
                        ext && t.push(ext);
                    }
                }
            }

            // 收集主类
            // 只调用真正自己构造器原型的定义，继承原型链上的不要管 !important
            // 所以不用自己在 renderUI 中调用 superclass.renderUI 了，UIBase 构造器自动搜寻
            // 以及 initializer 等同理
            if (c.prototype.hasOwnProperty(mainMethod) && (main = c.prototype[mainMethod])) {
                t.push(main);
            }

            // 原地 reverse
            if (t.length) {
                extChains.push.apply(extChains, t.reverse());
            }

            c = c.superclass && c.superclass.constructor;
        }

        // 初始化函数
        // 顺序：父类的所有扩展类函数 -> 父类对应函数 -> 子类的所有扩展函数 -> 子类对应函数
        for (i = extChains.length - 1; i >= 0; i--) {
            extChains[i] && extChains[i].call(host);
        }
    }

    /**
     * 销毁组件
     * 顺序： 子类 destructor -> 子类扩展 destructor -> 父类 destructor -> 父类扩展 destructor
     */
    function destroyHierarchy(host) {
        var c = host.constructor,
            exts,
            d,
            i;

        while (c) {
            // 只触发该类真正的析构器，和父亲没关系，所以不要在子类析构器中调用 superclass
            if (c.prototype.hasOwnProperty("destructor")) {
                c.prototype.destructor.apply(host);
            }

            if ((exts = c.__ks_exts)) {
                for (i = exts.length - 1; i >= 0; i--) {
                    d = exts[i] && exts[i].prototype.__destructor;
                    d && d.apply(host);
                }
            }

            c = c.superclass && c.superclass.constructor;
        }
    }

    function applyParser(srcNode, parser) {
        var host = this, p, v;

        // 从 parser 中，默默设置属性，不触发事件
        for (p in parser) {
            if (parser.hasOwnProperty(p)) {
                v = parser[p];

                // 函数
                if (S.isFunction(v)) {
                    host.__set(p, v.call(host, srcNode));
                }
                // 单选选择器
                else if (S.isString(v)) {
                    host.__set(p, srcNode.one(v));
                }
                // 多选选择器
                else if (S.isArray(v) && v[0]) {
                    host.__set(p, srcNode.all(v[0]))
                }
            }
        }
    }

    UIBase.HTML_PARSER = {};

    UIBase.ATTRS = {
        // 是否已经渲染完毕
        rendered:{
            value:false
        },
        // dom 节点是否已经创建完毕
        created:{
            value:false
        }
    };

    S.extend(UIBase, Base,
        /**
         * @lends UIBase.prototype
         */
        {

            /**
             * 建立节点，先不放在 dom 树中，为了性能!
             */
            create:function() {
                var self = this;
                // 是否生成过节点
                if (!self.get("created")) {
                    self._createDom();
                    self.fire('createDom');
                    callMethodByHierarchy(self, "createDom", "__createDom");
                    self.fire('afterCreateDom');
                    self.set("created", true);
                }
            },

            /**
             * 渲染组件到 dom 结构
             */
            render: function() {
                var self = this;
                // 是否已经渲染过
                if (!self.get("rendered")) {
                    self.create();
                    self._renderUI();
                    // 实际上是 beforeRenderUI
                    self.fire('renderUI');
                    callMethodByHierarchy(self, "renderUI", "__renderUI");
                    self.fire('afterRenderUI');
                    self._bindUI();
                    // 实际上是 beforeBindUI
                    self.fire('bindUI');
                    callMethodByHierarchy(self, "bindUI", "__bindUI");
                    self.fire('afterBindUI');
                    self._syncUI();
                    // 实际上是 beforeSyncUI
                    self.fire('syncUI');
                    callMethodByHierarchy(self, "syncUI", "__syncUI");
                    self.fire('afterSyncUI');
                    self.set("rendered", true);
                }
            },

            /**
             * 创建 dom 节点，但不放在 document 中
             */
            _createDom:noop,

            /**
             * 节点已经创建完毕，可以放在 document 中了
             */
            _renderUI: noop,

            /**
             * @protected
             */
            renderUI: noop,

            /**
             * 根据属性变化设置 UI
             */
            _bindUI: function() {
                var self = this,
                    attrs = self.__attrs,
                    attr, m;

                for (attr in attrs) {
                    if (attrs.hasOwnProperty(attr)) {
                        m = UI_SET + capitalFirst(attr);
                        if (self[m]) {
                            // 自动绑定事件到对应函数
                            (function(attr, m) {
                                self.on('after' + capitalFirst(attr) + 'Change', function(ev) {
                                    self[m](ev.newVal, ev);
                                });
                            })(attr, m);
                        }
                    }
                }
            },

            /**
             * @protected
             */
            bindUI: noop,

            /**
             * 根据当前（初始化）状态来设置 UI
             */
            _syncUI: function() {
                var self = this,
                    attrs = self.__attrs;
                for (var a in attrs) {
                    if (attrs.hasOwnProperty(a)) {
                        var m = UI_SET + capitalFirst(a);
                        //存在方法，并且用户设置了初始值或者存在默认值，就同步状态
                        if (self[m]
                            // 用户如果设置了显式不同步，就不同步，比如一些值从 html 中读取，不需要同步再次设置
                            && attrs[a].sync !== false
                            && self.get(a) !== undefined) {
                            self[m](self.get(a));
                        }
                    }
                }
            },

            /**
             * protected
             */
            syncUI: noop,


            /**
             * 销毁组件
             */
            destroy: function() {
                destroyHierarchy(this);
                this.fire('destroy');
                this.detach();
            }
        });

    /**
     * 根据基类以及扩展类得到新类
     * @name UIBase.create
     * @static
     * @param {Function} base 基类
     * @param {Function[]} exts 扩展类
     * @param {Object} px 原型 mix 对象
     * @param {Object} sx 静态 mix 对象
     * @returns {UIBase} 组合 后 的 新类
     */
    UIBase.create = function(base, exts, px, sx) {
        if (S.isArray(base)) {
            sx = px;
            px = exts;
            exts = base;
            base = UIBase;
        }
        base = base || UIBase;
        if (S.isObject(exts)) {
            sx = px;
            px = exts;
            exts = [];
        }

        function C() {
            UIBase.apply(this, arguments);
        }

        S.extend(C, base, px, sx);

        if (exts) {

            C.__ks_exts = exts;

            var desc = {
                // ATTRS:
                // HMTL_PARSER:
            },constructors = exts.concat(C);

            // [ex1,ex2],扩展类后面的优先，ex2 定义的覆盖 ex1 定义的
            // 主类最优先
            S.each(constructors, function(ext) {
                if (ext) {
                    // 合并 ATTRS/HTML_PARSER 到主类
                    S.each([ATTRS, HTML_PARSER], function(K) {
                        if (ext[K]) {
                            desc[K] = desc[K] || {};
                            // 不覆盖主类上的定义，因为继承层次上扩展类比主类层次高
                            // 但是值是对象的话会深度合并
                            // 注意：最好值是简单对象，自定义 new 出来的对象就会有问题!
                            S.mix(desc[K], ext[K], true, undefined, true);
                        }
                    });
                }
            });

            S.each(desc, function(v, k) {
                C[k] = v;
            });

            var prototype = {};

            // 主类最优先
            S.each(constructors, function(ext) {
                if (ext) {
                    var proto = ext.prototype;
                    // 合并功能代码到主类，不覆盖
                    for (var p in proto) {
                        // 不覆盖主类，但是主类的父类还是覆盖吧
                        if (proto.hasOwnProperty(p)) {
                            prototype[p] = proto[p];
                        }
                    }
                }
            });

            S.each(prototype, function(v, k) {
                C.prototype[k] = v;
            });
        }
        return C;
    };

    return UIBase;
}, {
    requires:["base","node"]
});
/**
 * render 和 create 区别
 * render 包括 create ，以及把生成的节点放在 document 中
 * create 仅仅包括创建节点
 **//**
 * UIBase.Box
 * @author 承玉<yiminghe@gmail.com>
 */
KISSY.add('uibase/box', function() {


    function Box() {
    }

    Box.ATTRS = {
        html: {
            view:true,
            sync:false
        },
        // 宽度
        width:{
            view:true
        },
        // 高度
        height:{
            view:true
        },
        // 容器的 class
        elCls:{
            view:true
        },
        // 容器的行内样式
        elStyle:{
            view:true
        },
        // 其他属性
        elAttrs:{
            //其他属性
            view:true
        },
        // 插入到该元素前
        elBefore:{
            view:true
        },
        el:{
            view:true
        },

        // 渲染该组件的目的容器
        render:{
            view:true
        },

        visibleMode:{
            value:"display",
            view:true
        },
        // 默认显示，但不触发事件
        visible:{
            view:true
        },

        // 从已存在节点开始渲染
        srcNode:{
            view:true
        }
    };


    Box.HTML_PARSER = {
        el:function(srcNode) {
            /**
             * 如果需要特殊的对现有元素的装饰行为
             */
            if (this.decorateInternal) {
                this.decorateInternal(srcNode);
            }
            return srcNode;
        }
    };

    Box.prototype = {

        _uiSetVisible:function(isVisible) {
            var self = this;
            self.fire(isVisible ? "show" : "hide");
        },


        /**
         * 显示 Overlay
         */
        show: function() {
            var self = this;
            self.render();
            self.set("visible", true);
        },

        /**
         * 隐藏
         */
        hide: function() {
            this.set("visible", false);
        }
    };

    return Box;
});
/**
 * UIBase.Box
 * @author 承玉<yiminghe@gmail.com>
 */
KISSY.add('uibase/boxrender', function(S, Node) {

    var $ = S.all;

    function Box() {
    }

    Box.ATTRS = {
        el: {
            //容器元素
            setter:function(v) {
                return $(v);
            }
        },
        elCls: {},
        elStyle:{},
        width: {},
        height: {},
        elTagName:{
            // 生成标签名字
            value:"div"
        },
        elAttrs:{},
        elBefore:{},
        render:{},
        html: {
            sync:false
        },
        visible:{},
        visibleMode:{}
    };

    Box.construct = constructEl;

    function constructEl(cls, style, width, height, tag, attrs) {
        style = style || {};

        if (width) {
            style.width = width;
        }

        if (height) {
            style.height = height;
        }

        var styleStr = '';

        for (var s in style) {
            if (style.hasOwnProperty(s)) {
                styleStr += s + ":" + style[s] + ";";
            }
        }

        var attrStr = '';

        for (var a in attrs) {
            if (attrs.hasOwnProperty(a)) {
                attrStr += " " + a + "='" + attrs[a] + "'" + " ";
            }
        }

        return "<" + tag + (styleStr ? (" style='" + styleStr + "' ") : "")
            + attrStr + (cls ? (" class='" + cls + "' ") : "")
            + "><" + "/" + tag + ">";
        //return ret;
    }

    Box.HTML_PARSER = {
        html:function(el) {
            return el.html();
        }
    };

    Box.prototype = {


        __renderUI:function() {
            var self = this;
            // 新建的节点才需要摆放定位
            if (self.__boxRenderNew) {
                var render = self.get("render"),
                    el = self.get("el"),
                    elBefore = self.get("elBefore");
                if (elBefore) {
                    el.insertBefore(elBefore);
                }
                else if (render) {
                    el.appendTo(render);
                }
                else {
                    el.appendTo("body");
                }
            }
        },

        /**
         * 只负责建立节点，如果是 decorate 过来的，甚至内容会丢失
         * 通过 render 来重建原有的内容
         */
        __createDom:function() {

            var self = this,
                el = self.get("el");
            if (!el) {
                self.__boxRenderNew = true;
                el = new Node(constructEl(self.get("elCls"),
                    self.get("elStyle"),
                    self.get("width"),
                    self.get("height"),
                    self.get("elTagName"),
                    self.get("elAttrs")));
                self.set("el", el);
                if (self.get("html")) {
                    el.html(self.get("html"));
                }
            }
        },

        _uiSetElAttrs:function(attrs) {
            this.get("el").attr(attrs);
        },

        _uiSetElCls:function(cls) {
            this.get("el").addClass(cls);
        },

        _uiSetElStyle:function(style) {

            this.get("el").css(style);
        },

        _uiSetWidth:function(w) {
            this.get("el").width(w);
        },

        _uiSetHeight:function(h) {
            //S.log("_uiSetHeight");
            var self = this;
            self.get("el").height(h);
        },

        _uiSetHtml:function(c) {
            this.get("el").html(c);
        },

        _uiSetVisible:function(isVisible) {
            var el = this.get("el"),
                visibleMode = this.get("visibleMode");
            if (visibleMode == "visibility") {
                el.css("visibility", isVisible ? "visible" : "hidden");
            } else {
                el.css("display", isVisible ? "" : "none");
            }
        },

        show:function() {
            var self = this;
            self.render();
            self.set("visible", true);
        },
        hide:function() {
            this.set("visible", false);
        },

        __destructor:function() {
            //S.log("box __destructor");
            var el = this.get("el");
            if (el) {
                el.detach();
                el.remove();
            }
        }
    };

    return Box;
}, {
    requires:['node']
});
/**
 * close extension for kissy dialog
 * @author 承玉<yiminghe@gmail.com>
 */
KISSY.add("uibase/close", function() {
    function Close() {
    }

    var HIDE = "hide";
    Close.ATTRS = {
        closable: {
            view:true
        },
        closeAction:{
            value:HIDE
        }
    };

    var actions = {
        hide:HIDE,
        destroy:"destroy"
    };

    Close.prototype = {

        __bindUI:function() {

            var self = this,
                closeBtn = self.get("view").get("closeBtn");
            closeBtn && closeBtn.on("click", function(ev) {
                self[actions[self.get("closeAction")] || HIDE]();
                ev.preventDefault();
            });
        }
    };
    return Close;

});/**
 * close extension for kissy dialog
 * @author 承玉<yiminghe@gmail.com>
 */
KISSY.add("uibase/closerender", function(S, Node) {

    var CLS_PREFIX = 'ext-';

    function Close() {
    }

    Close.ATTRS = {
        closable: {             // 是否需要关闭按钮
            value: true
        },
        closeBtn:{
        }
    };

    Close.HTML_PARSER = {
        closeBtn:function(el) {
            return el.one("." + this.get("prefixCls") + CLS_PREFIX + 'close');
        }
    };

    Close.prototype = {
        _uiSetClosable:function(v) {
            var self = this,
                closeBtn = self.get("closeBtn");
            if (closeBtn) {
                if (v) {
                    closeBtn.css("display", "");
                } else {
                    closeBtn.css("display", "none");
                }
            }
        },
        __renderUI:function() {
            var self = this,
                closeBtn = self.get("closeBtn"),
                el = self.get("el");

            if (!closeBtn && el) {
                closeBtn = new Node("<a " +
                    "tabindex='0' " +
                    "role='button' " +
                    "class='" + this.get("prefixCls") + CLS_PREFIX + "close" + "'>" +
                    "<span class='" +
                    this.get("prefixCls") + CLS_PREFIX + "close-x" +
                    "'>关闭<" + "/span>" +
                    "<" + "/a>").appendTo(el);
                self.set("closeBtn", closeBtn);
            }
        },

        __destructor:function() {

            var self = this,
                closeBtn = self.get("closeBtn");
            closeBtn && closeBtn.detach();
        }
    };

    return Close;

}, {
    requires:["node"]
});/**
 * constrain extension for kissy
 * @author 承玉<yiminghe@gmail.com>, 乔花<qiaohua@taobao.com>
 */
KISSY.add("uibase/constrain", function(S, DOM, Node) {

    function Constrain() {

    }

    Constrain.ATTRS = {
        constrain:{
            //不限制
            //true:viewport限制
            //node:限制在节点范围
            value:false
        }
    };

    /**
     * 获取受限区域的宽高, 位置
     * @return {Object | undefined} {left: 0, top: 0, maxLeft: 100, maxTop: 100}
     */
    function _getConstrainRegion(constrain) {
        var ret;
        if (!constrain) {
            return ret;
        }
        var el = this.get("el");
        if (constrain !== true) {
            constrain = Node.one(constrain);
            ret = constrain.offset();
            S.mix(ret, {
                maxLeft: ret.left + constrain.outerWidth() - el.outerWidth(),
                maxTop: ret.top + constrain.outerHeight() - el.outerHeight()
            });
        }
        // 没有指定 constrain, 表示受限于可视区域
        else {
            //不要使用 viewportWidth()
            //The innerWidth attribute, on getting,
            //must return the viewport width including the size of a rendered scroll bar (if any).
            //On getting, the clientWidth attribute returns the viewport width
            //excluding the size of a rendered scroll bar (if any)
            //  if the element is the root element 
            var vWidth = document.documentElement.clientWidth;
            ret = { left: DOM.scrollLeft(), top: DOM.scrollTop() };
            S.mix(ret, {
                maxLeft: ret.left + vWidth - el.outerWidth(),
                maxTop: ret.top + DOM.viewportHeight() - el.outerHeight()
            });
        }

        return ret;
    }

    Constrain.prototype = {

        __renderUI:function() {
            var self = this,
                attrs = self.__getDefAttrs(),
                xAttr = attrs["x"],
                yAttr = attrs["y"],
                oriXSetter = xAttr["setter"],
                oriYSetter = yAttr["setter"];
            xAttr.setter = function(v) {
                var r = oriXSetter && oriXSetter.call(self, v);
                if (r === undefined) {
                    r = v;
                }
                if (!self.get("constrain")) {
                    return r;
                }
                var _ConstrainExtRegion = _getConstrainRegion.call(
                    self, self.get("constrain"));
                return Math.min(Math.max(r,
                    _ConstrainExtRegion.left),
                    _ConstrainExtRegion.maxLeft);
            };
            yAttr.setter = function(v) {
                var r = oriYSetter && oriYSetter.call(self, v);
                if (r === undefined) {
                    r = v;
                }
                if (!self.get("constrain")) {
                    return r;
                }
                var _ConstrainExtRegion = _getConstrainRegion.call(
                    self, self.get("constrain"));
                return Math.min(Math.max(r,
                    _ConstrainExtRegion.top),
                    _ConstrainExtRegion.maxTop);
            };
            self.addAttr("x", xAttr);
            self.addAttr("y", yAttr);
        }
    };


    return Constrain;

}, {
    requires:["dom","node"]
});/**
 * 里层包裹层定义，适合mask以及shim
 * @author yiminghe@gmail.com
 */
KISSY.add("uibase/contentbox", function() {

    function ContentBox() {
    }

    ContentBox.ATTRS = {
        //层内容
        content:{
            view:true,
            sync:false
        },
        contentEl:{
            view:true
        },

        contentElAttrs:{
            view:true
        },
        contentElStyle:{
            view:true
        },
        contentTagName:{
            view:true
        }
    };

    ContentBox.prototype = {    };

    return ContentBox;
});/**
 * 里层包裹层定义，适合mask以及shim
 * @author yiminghe@gmail.com
 */
KISSY.add("uibase/contentboxrender", function(S, Node, BoxRender) {

    function ContentBox() {
    }

    ContentBox.ATTRS = {
        //内容容器节点
        contentEl:{},
        contentElAttrs:{},
        contentElCls:{
            value:""
        },
        contentElStyle:{},
        contentTagName:{value:"div"},
        //层内容
        content:{
            sync:false
        }
    };

    /**
     * ! contentEl 只能由组件动态生成
     */
    ContentBox.HTML_PARSER = {
        content:function(el) {
            return el.html();
        }
    };

    var constructEl = BoxRender.construct;

    ContentBox.prototype = {

        // no need ,shift create work to __createDom
        __renderUI:function() {
        },

        __createDom:function() {
            var self = this,
                contentEl,
                c,
                el = self.get("el"),
                elChildren = S.makeArray(el[0].childNodes);
            contentEl = new Node(constructEl(
                self.get("prefixCls") + "contentbox "
                    + self.get("contentElCls"),
                self.get("contentElStyle"),
                undefined,
                undefined,
                self.get("contentTagName"),
                self.get("contentElAttrs"))).appendTo(el);
            self.set("contentEl", contentEl);
            if (elChildren.length) {
                for (var i = 0; i < elChildren.length; i++) {
                    contentEl.append(elChildren[i]);
                }
            } else if (c = self.get("content")) {
                setContent(self, c);
            }


        },

        _uiSetContentElCls:function(cls) {
            this.get("contentEl").addClass(cls);
        },
        _uiSetContentElAttrs:function(attrs) {
            this.get("contentEl").attr(attrs);
        },
        _uiSetContentElStyle:function(v) {
            this.get("contentEl").css(v);
        },
        _uiSetContent:function(c) {
            setContent(this, c);
        }
    };

    function setContent(self, c) {
        var contentEl = self.get("contentEl");
        contentEl.html("");
        c && contentEl.append(c);
    }

    return ContentBox;
}, {
    requires:["node","./boxrender"]
});/**
 * drag extension for position
 * @author 承玉<yiminghe@gmail.com>
 */
KISSY.add("uibase/drag", function(S) {


    function Drag() {
    }

    Drag.ATTRS = {
        handlers:{value:[]},
        draggable:{value:true}
    };

    Drag.prototype = {

        _uiSetHandlers:function(v) {
            if (v && v.length > 0 && this.__drag) {
                this.__drag.set("handlers", v);
            }
        },

        __bindUI:function() {
            var Draggable = S.require("dd/draggable");
            var self = this,
                el = self.get("el");
            if (self.get("draggable") && Draggable) {
                self.__drag = new Draggable({
                    node:el,
                    handlers:self.get("handlers")
                });
            }
        },

        _uiSetDraggable:function(v) {

            var self = this,
                d = self.__drag;
            if (!d) {
                return;
            }
            if (v) {
                d.detach("drag");
                d.on("drag", self._dragExtAction, self);
            } else {
                d.detach("drag");
            }
        },

        _dragExtAction:function(offset) {
            this.set("xy", [offset.left,offset.top])
        },
        /**
         *
         */
        __destructor:function() {
            //S.log("DragExt __destructor");
            var d = this.__drag;
            d && d.destroy();
        }

    };
    return Drag;

});/**
 * loading mask support for overlay
 * @author 承玉<yiminghe@gmail.com>
 */
KISSY.add("uibase/loading", function() {

    function Loading() {
    }

    Loading.prototype = {
        loading:function() {
            this.get("view").loading();
        },

        unloading:function() {
            this.get("view").unloading();
        }
    };

    return Loading;

});/**
 * loading mask support for overlay
 * @author 承玉<yiminghe@gmail.com>
 */
KISSY.add("uibase/loadingrender", function(S, Node) {

    function Loading() {
    }

    Loading.prototype = {
        loading:function() {
            var self = this;
            if (!self._loadingExtEl) {
                self._loadingExtEl = new Node("<div " +
                    "class='" +
                    this.get("prefixCls") +
                    "ext-loading'" +
                    " style='position: absolute;" +
                    "border: none;" +
                    "width: 100%;" +
                    "top: 0;" +
                    "left: 0;" +
                    "z-index: 99999;" +
                    "height:100%;" +
                    "*height: expression(this.parentNode.offsetHeight);" + "'/>")
                    .appendTo(self.get("el"));
            }
            self._loadingExtEl.show();
        },

        unloading:function() {
            var lel = this._loadingExtEl;
            lel && lel.hide();
        }
    };

    return Loading;

}, {
    requires:['node']
});/**
 * mask extension for kissy
 * @author 承玉<yiminghe@gmail.com>
 */
KISSY.add("uibase/mask", function() {


    function Mask() {
    }

    Mask.ATTRS = {
        mask:{
            value:false
        }
    };

    Mask.prototype = {

        _uiSetMask:function(v) {
            var self = this;
            if (v) {
                self.on("show", self.get("view")._maskExtShow, self.get("view"));
                self.on("hide", self.get("view")._maskExtHide, self.get("view"));
            } else {
                self.detach("show", self.get("view")._maskExtShow, self.get("view"));
                self.detach("hide", self.get("view")._maskExtHide, self.get("view"));
            }
        }
    };


    return Mask;
}, {requires:["ua"]});/**
 * mask extension for kissy
 * @author 承玉<yiminghe@gmail.com>
 */
KISSY.add("uibase/maskrender", function(S,UA,DOM,Node) {

    /**
     * 多 position 共享一个遮罩
     */
    var mask,
        iframe,
        num = 0;


    function initMask() {
        mask = new Node("<div " +
            //"tabindex='-1' " +
            "class='" +
            this.get("prefixCls") + "ext-mask'/>").prependTo("body");
        mask.css({
                "position":"absolute",
                left:0,
                top:0,
                width:UA['ie'] == 6 ? DOM['docWidth']() : "100%",
                "height": DOM['docHeight']()
            });
        if (UA['ie'] == 6) {
            //ie6 下最好和 mask 平行
            iframe = new Node("<" + "iframe " +
                //"tabindex='-1' " +
                "style='position:absolute;" +
                "left:0;" +
                "top:0;" +
                "background:red;" +
                "width:" + DOM['docWidth']() + "px;" +
                "height:" + DOM['docHeight']() + "px;" +
                "filter:alpha(opacity=0);" +
                "z-index:-1;'/>").insertBefore(mask)
        }

        S.Event.on(window, "resize", function() {
            var o = {
                width:UA['ie'] == 6 ? DOM['docWidth']() : "100%",
                "height": DOM['docHeight']()
            };
            if (iframe) {
                iframe.css(o);
            }
            mask.css(o);
        });

        /**
         * 点 mask 焦点不转移
         */
        mask.unselectable();
        mask.on("mousedown click", function(e) {
            e.halt();
        });
    }

    function Mask() {
        //S.log("mask init");
    }


    Mask.prototype = {

        _maskExtShow:function() {
            var self = this;
            if (!mask) {
                initMask.call(self);
            }
            var zIndex = self.get("zIndex") - 1;
            mask.css("z-index", zIndex);
            iframe && iframe.css("z-index", zIndex);
            num++;
            mask.css("display", "");
            iframe && iframe.css("display", "");
        },

        _maskExtHide:function() {
            num--;
            if (num <= 0) {
                num = 0;
            }
            if (!num) {
                mask && mask.css("display", "none");
                iframe && iframe.css("display", "none");
            }
        },

        __destructor:function() {
            this._maskExtHide();
        }

    };

    return Mask;
}, {requires:["ua","dom","node"]});/**
 * position and visible extension，可定位的隐藏层
 * @author 承玉<yiminghe@gmail.com>
 */
KISSY.add("uibase/position", function(S) {

    function Position() {
    }

    Position.ATTRS = {
        x: {
            view:true
        },
        y: {
            view:true
        },
        xy: {
            // 相对 page 定位, 有效值为 [n, m], 为 null 时, 选 align 设置
            setter: function(v) {

                var self = this,
                    xy = S.makeArray(v);

                /*
                 属性内分发特别注意：
                 xy -> x,y

                 */
                if (xy.length) {
                    xy[0] && self.set("x", xy[0]);
                    xy[1] && self.set("y", xy[1]);
                }
                return v;
            },
            /**
             * xy 纯中转作用
             */
            getter:function() {
                return [this.get("x"),this.get("y")];
            }
        },
        zIndex: {
            view:true
        }
    };


    Position.prototype = {

        /**
         * 移动到绝对位置上, move(x, y) or move(x) or move([x, y])
         * @param {number|Array.<number>} x
         * @param {number=} y
         */
        move: function(x, y) {
            var self = this;
            if (S.isArray(x)) {
                y = x[1];
                x = x[0];
            }
            self.set("xy", [x,y]);
        }


    };

    return Position;
});/**
 * position and visible extension，可定位的隐藏层
 * @author  承玉<yiminghe@gmail.com>
 */
KISSY.add("uibase/positionrender", function() {

    var ZINDEX = 9999;

    function Position() {
    }

    Position.ATTRS = {
        x: {
            // 水平方向绝对位置
            valueFn:function() {
                // 读到这里时，el 一定是已经加到 dom 树中了，否则报未知错误
                // el 不在 dom 树中 offset 报错的
                // 最早读就是在 syncUI 中，一点重复设置(读取自身 X 再调用 _uiSetX)无所谓了
                return this.get("el") && this.get("el").offset().left;
            }
        },
        y: {
            // 垂直方向绝对位置
            valueFn:function() {
                return this.get("el") && this.get("el").offset().top;
            }
        },
        zIndex: {
            value: ZINDEX
        }
    };


    Position.prototype = {

        __renderUI:function() {
            this.get("el").addClass(this.get("prefixCls") + "ext-position");
        },

        _uiSetZIndex:function(x) {
            this.get("el").css("z-index", x);
        },
        _uiSetX:function(x) {
            this.get("el").offset({
                left:x
            });
        },
        _uiSetY:function(y) {
            this.get("el").offset({
                top:y
            });
        }
    };

    return Position;
});/**
 * resize extension using resizable
 * @author yiminghe@gmail.com
 */
KISSY.add("uibase/resize", function(S) {
    function Resize() {
    }

    Resize.ATTRS = {
        resize:{
            value:{
            }
        }
    };

    Resize.prototype = {
        __destructor:function() {
            self.resizer && self.resizer.destroy();
        },
        _uiSetResize:function(v) {

            var Resizable = S.require("resizable"),self = this;
            if (Resizable) {
                self.resizer && self.resizer.destroy();
                v.node = self.get("el");
                v.autoRender = true;
                if (v.handlers) {
                    self.resizer = new Resizable(v);
                }
            }

        }
    };


    return Resize;
});/**
 * shim for ie6 ,require box-ext
 * @author 承玉<yiminghe@gmail.com>
 */
KISSY.add("uibase/shimrender", function(S, Node) {

    function Shim() {
        //S.log("shim init");
    }


    Shim.ATTRS = {
        shim:{
            value:true
        }
    };
    Shim.prototype = {

        _uiSetShim:function(v) {
            var self = this,el = self.get("el");
            if (v && !self.__shimEl) {
                self.__shimEl = new Node("<" + "iframe style='position: absolute;" +
                    "border: none;" +
                    "width: expression(this.parentNode.offsetWidth);" +
                    "top: 0;" +
                    "opacity: 0;" +
                    "filter: alpha(opacity=0);" +
                    "left: 0;" +
                    "z-index: -1;" +
                    "height: expression(this.parentNode.offsetHeight);" + "'/>");
                el.prepend(self.__shimEl);
            } else if (!v && self.__shimEl) {
                self.__shimEl.remove();
                delete self.__shimEl;
            }
        }
    };

    return Shim;
}, {
    requires:['node']
});/**
 * support standard mod for component
 * @author 承玉<yiminghe@gmail.com>
 */
KISSY.add("uibase/stdmod", function() {


    function StdMod() {
    }

    StdMod.ATTRS = {
        header:{
            view:true
        },
        body:{
            view:true
        },
        footer:{
            view:true
        },
        bodyStyle:{
            view:true
        },
        footerStyle:{
            view:true
        },
        headerStyle:{
            view:true
        },
        headerContent:{
            view:true
        },
        bodyContent:{
            view:true
        },
        footerContent:{
            view:true
        }
    };


    StdMod.prototype = {};

    return StdMod;

});/**
 * support standard mod for component
 * @author 承玉<yiminghe@gmail.com>
 */
KISSY.add("uibase/stdmodrender", function(S, Node) {


    var CLS_PREFIX = "stdmod-";

    function StdMod() {
    }

    StdMod.ATTRS = {
        header:{
        },
        body:{
        },
        footer:{
        },
        bodyStyle:{
        },
        footerStyle:{

        },
        headerStyle:{

        },
        headerContent:{},
        bodyContent:{},
        footerContent:{}
    };

    StdMod.HTML_PARSER = {
        header:function(el) {
            return el.one("." + this.get("prefixCls") + CLS_PREFIX + "header");
        },
        body:function(el) {
            return el.one("." + this.get("prefixCls") + CLS_PREFIX + "body");
        },
        footer:function(el) {
            return el.one("." + this.get("prefixCls") + CLS_PREFIX + "footer");
        }
    };

    function renderUI(self, part) {
        var el = self.get("contentEl"),
            partEl = self.get(part);
        if (!partEl) {
            partEl = new Node("<div class='" + self.get("prefixCls") + CLS_PREFIX + part + "'/>")
                .appendTo(el);
            self.set(part, partEl);
        }
    }

    StdMod.prototype = {

        _setStdModContent:function(part, v) {
            if (S.isString(v)) {
                this.get(part).html(v);
            } else {
                this.get(part).html("");
                this.get(part).append(v);
            }
        },
        _uiSetBodyStyle:function(v) {

            this.get("body").css(v);

        },
        _uiSetHeaderStyle:function(v) {

            this.get("header").css(v);

        },
        _uiSetFooterStyle:function(v) {

            this.get("footer").css(v);
        },
        _uiSetBodyContent:function(v) {
            this._setStdModContent("body", v);
        },
        _uiSetHeaderContent:function(v) {
            this._setStdModContent("header", v);
        },
        _uiSetFooterContent:function(v) {
            this._setStdModContent("footer", v);
        },
        __renderUI:function() {
            renderUI(this, "header");
            renderUI(this, "body");
            renderUI(this, "footer");
        }
    };

    return StdMod;

}, {
    requires:['node']
});KISSY.add("uibase", function(S, UIBase, Align, Box, BoxRender, Close, CloseRender, Contrain, Contentbox, ContentboxRender, Drag, Loading, LoadingRender, Mask, MaskRender, Position, PositionRender, ShimRender, Resize, StdMod, StdModRender) {
    Close.Render = CloseRender;
    Loading.Render = LoadingRender;
    Mask.Render = MaskRender;
    Position.Render = PositionRender;
    StdMod.Render = StdModRender;
    Box.Render = BoxRender;
    Contentbox.Render = ContentboxRender;
    S.mix(UIBase, {
        Align:Align,
        Box:Box,
        Close:Close,
        Contrain:Contrain,
        Contentbox:Contentbox,
        Drag:Drag,
        Loading:Loading,
        Mask:Mask,
        Position:Position,
        Shim:{
            Render:ShimRender
        },
        Resize:Resize,
        StdMod:StdMod
    });
    S.UIBase = UIBase;
    return UIBase;
}, {
    requires:["uibase/base",
        "uibase/align",
        "uibase/box",
        "uibase/boxrender",
        "uibase/close",
        "uibase/closerender",
        "uibase/constrain",
        "uibase/contentbox",
        "uibase/contentboxrender",
        "uibase/drag",
        "uibase/loading",
        "uibase/loadingrender",
        "uibase/mask",
        "uibase/maskrender",
        "uibase/position",
        "uibase/positionrender",
        "uibase/shimrender",
        "uibase/resize",
        "uibase/stdmod",
        "uibase/stdmodrender"]
});
/*
Copyright 2011, KISSY UI Library v1.20dev
MIT Licensed
build time: Sep 22 13:54
*/
/**
 * container can delegate event for its children
 * @author yiminghe@gmail.com
 */
KISSY.add("component/container", function(S, UIBase, MC, UIStore, DelegateChildren, DecorateChildren) {
    /**
     * 多继承，容器也是组件，具备代理儿子事件以及递归装饰儿子的功能
     */
    return UIBase.create(MC, [DelegateChildren,DecorateChildren]);

}, {
    requires:['uibase','./modelcontrol','./uistore','./delegatechildren','./decoratechildren']
});/**
 * decorate its children from one element
 * @author yiminghe@gmail.com
 */
KISSY.add("component/decoratechild", function(S, DecorateChildren) {
    function DecorateChild() {

    }

    S.augment(DecorateChild, DecorateChildren, {
        decorateInternal:function(element) {
            var self = this;
            self.set("el", element);
            var ui = self.get("decorateChildCls"),
                prefixCls = self.get("prefixCls"),
                child = element.one("." + self.getCls(ui));
            // 可以装饰?
            if (child) {
                var UI = self._findUIByClass(child);
                if (UI) {
                    // 可以直接装饰
                    self.decorateChildrenInternal(UI, child, prefixCls);
                } else {
                    // 装饰其子节点集合
                    self.decorateChildren(child);
                }
            }
        }
    });

    return DecorateChild;
}, {
    requires:['./decoratechildren']
});/**
 * @fileOverview decorate function for children render from markup
 * @author yiminghe@gmail.com
 */
KISSY.add("component/decoratechildren", function(S, UIStore) {
    function DecorateChildren() {

    }

    S.augment(DecorateChildren, {
        decorateInternal:function(el) {
            var self = this;
            self.set("el", el);
            self.decorateChildren(el);
        },

        /**
         * 生成一个组件
         */
        decorateChildrenInternal:function(UI, c, prefixCls) {
            this.addChild(new UI({
                srcNode:c,
                prefixCls:prefixCls
            }));
        },

        /**
         * 得到适合装饰该节点的组件类
         * @param c
         */
        _findUIByClass:function(c) {
            var self = this,
                cls = c.attr("class") || "",
                prefixCls = self.get("prefixCls");
            // 过滤掉特定前缀
            cls = cls.replace(new RegExp("\\b" + prefixCls, "ig"), "");
            var UI = UIStore.getUIByClass(cls);
            if (!UI) {
                S.log(c);
                S.log("can not find ui " + cls + " from this markup");
            }
            return UI;
        },

        /**
         * container 需要在装饰时对儿子特殊处理，递归装饰
         */
        decorateChildren:function(el) {
            var self = this,children = el.children(),
                prefixCls = self.get("prefixCls");
            children.each(function(c) {
                var UI = self._findUIByClass(c);
                self.decorateChildrenInternal(UI, c, prefixCls);
            });
        }
    });

    return DecorateChildren;

}, {
    requires:['./uistore']
});/**
 * @fileOverview delegate events for children
 * @author yiminghe@gmail.com
 */
KISSY.add("component/delegatechildren", function(S) {
    function DelegateChildren() {

    }

    S.augment(DelegateChildren, {
        __bindUI:function() {
            var self = this;
            self.get("el").on("mousedown mouseup mouseover mouseout dblclick",
                self._handleChildMouseEvents, self);
        },

        _handleChildMouseEvents:function(e) {
            var control = this.getOwnerControl(e.target);
            if (control) {
                // Child control identified; forward the event.
                switch (e.type) {
                    case "mousedown":
                        control._handleMouseDown(e);
                        break;
                    case "mouseup":
                        control._handleMouseUp(e);
                        break;
                    case "mouseover":
                        control._handleMouseOver(e);
                        break;
                    case "mouseout":
                        control._handleMouseOut(e);
                        break;
                    case "dblclick":
                        control._handleDblClick(e);
                        break;
                    default:
                        S.error(e.type + " unhandled!");
                }
            }
        },

        getOwnerControl:function(node) {
            var self = this,
                children = self.get("children"),
                len = children.length,
                elem = this.get("el")[0];
            while (node && node !== elem) {
                for (var i = 0; i < len; i++) {
                    if (children[i].get("el")[0] === node) {
                        return children[i];
                    }
                }
                node = node.parentNode;
            }
            return null;
        }
    });

    return DelegateChildren;
});/**
 * model and control base class for kissy
 * @author yiminghe@gmail.com
 * @refer http://martinfowler.com/eaaDev/uiArchs.html
 */
KISSY.add("component/modelcontrol", function(S, Event, UIBase, UIStore, Render) {

        function wrapperViewSetter(attrName) {
            return function(ev) {
                var value = ev.newVal,self = this;
                self.get("view") && self.get("view").set(attrName, value);
            };
        }

        function wrapperViewGetter(attrName) {
            return function(v) {
                var self = this;
                return v === undefined ?
                    self.get("view") && self.get("view").get(attrName) :
                    v;
            };
        }


        function initChild(self, c, elBefore) {
            // If this (parent) component doesn't have a DOM yet, call createDom now
            // to make sure we render the child component's element into the correct
            // parent element (otherwise render_ with a null first argument would
            // render the child into the document body, which is almost certainly not
            // what we want).
            self.create();
            var contentEl = self.getContentElement();
            c.set("parent", self);
            c.set("render", contentEl);
            c.set("elBefore", elBefore);
            // 如果 parent 已经渲染好了子组件也要立即渲染，就 创建 dom ，绑定事件
            if (self.get("rendered")) {
                c.render();
            }
            // 如果 parent 也没渲染，子组件 create 出来和 parent 节点关联
            // 子组件和 parent 组件一起渲染
            else {
// 之前设好属性，view ，logic 同步还没 bind ,create 不是 render ，还没有 bindUI
                c.create();
                contentEl[0].insertBefore(c.get("el")[0], elBefore && elBefore[0] || null);

            }
        }

        /**
         * 不使用 valueFn
         * 只有 render 时需要找到默认，其他时候不需要，防止莫名其妙初始化
         */
        function getDefaultView() {
            // 逐层找默认渲染器
            var self = this,
                c = self.constructor,
                DefaultRender;

            while (c && !DefaultRender) {
                DefaultRender = c['DefaultRender'];
                c = c.superclass && c.superclass.constructor;
            }
            if (DefaultRender) {
                /**
                 * 将渲染层初始化所需要的属性，直接构造器设置过去
                 */
                var attrs = self.__attrs,
                    cfg = {};
                for (var attrName in attrs) {
                    if (attrs.hasOwnProperty(attrName)) {
                        var attrCfg = attrs[attrName],v;
                        if (attrCfg.view) {
                            // 只设置用户设置的值
                            // 考虑 c 上的默认值
                            if (( v = self.get(attrName) ) !== undefined) {
                                cfg[attrName] = v;
                            }
                        }
                    }
                }
                return new DefaultRender(cfg);
            }
            return 0;
        }

        function getClsByHierarch(self) {
            if (self.__componentClasses) {
                return self.__componentClasses;
            }
            var constructor = self.constructor,re = [];
            while (constructor && constructor != ModelControl) {
                var cls = UIStore.getClsByUI(constructor);
                if (cls) {
                    re.push(cls);
                }
                constructor = constructor.superclass && constructor.superclass.constructor;
            }
            return self.__componentClasses = re.join(" ");
        }


        function capitalFirst(s) {
            return s.charAt(0).toUpperCase() + s.substring(1);
        }

        /**
         * model and control for component
         * @name ModelControl
         * @constructor
         */
        var ModelControl = UIBase.create([UIBase.Box], {

                getCls:UIStore.getCls,

                initializer:function() {
                    /**
                     * 整理属性，对纯属于 view 的属性，添加 getter setter 直接到 view
                     */
                    var self = this,
                        attrs = self.__attrs;
                    for (var attrName in attrs) {
                        if (attrs.hasOwnProperty(attrName)) {
                            var attrCfg = attrs[attrName];
                            if (attrCfg.view) {
// setter 不应该有实际操作，仅用于正规化比较好
// attrCfg.setter = wrapperViewSetter(attrName);
                                self.on("after" + capitalFirst(attrName) + "Change",
                                    wrapperViewSetter(attrName));
// 逻辑层读值直接从 view 层读
// 那么如果存在默认值也设置在 view 层
// 逻辑层不要设置 getter
                                attrCfg.getter = wrapperViewGetter(attrName);
                            }
                        }
                    }
                },

                /**
                 * control 层的渲染 ui 就是 render view
                 * finally，不能被 override
                 */
                renderUI:function() {
                    var self = this;
                    self.get("view").render();
                    //then render my children
                    var children = self.get("children");
                    S.each(children, function(child) {
                        // 不在 Base 初始化设置属性时运行，防止和其他初始化属性冲突
                        initChild(self, child);
                        child.render();
                    });
                },

                /**
                 * 控制层的 createDom 实际上就是调用 view 层的 create 来创建真正的节点
                 */
                createDom:function() {
                    var self = this;
                    var view = self.get("view") || getDefaultView.call(self);
                    if (!view) {
                        S.error("no view for");
                        S.error(self.constructor);
                        return;
                    }
                    view.create();
                    view._renderCls(getClsByHierarch(self));
                    if (!self.get("allowTextSelection_")) {
                        view.get("el").unselectable();
                    }
                    self.set("view", view);
                },

                /**
                 * Returns the DOM element into which child components are to be rendered,
                 or null if the container itself hasn't been rendered yet.  Overrides
                 */
                getContentElement:function() {
                    var view = this.get('view');
                    return view && view.getContentElement();
                },

                /**
                 *
                 * @param c  children to be added
                 * @param {int=} index  position to be inserted
                 */
                addChild:function(c, index) {
                    var self = this,
                        children = self.get("children"),
                        elBefore = null;
                    if (index !== undefined) {
                        children.splice(index, 0, c);
                        elBefore = children[index] || null;
                    } else {
                        children.push(c);
                    }
                    initChild(self, c, elBefore);
                },

                removeChild:function(c, destroy) {
                    var children = this.get("children"),
                        index = S.indexOf(c, children);
                    if (index != -1) {
                        children.splice(index, 1);
                    }
                    if (destroy) {
                        c.destroy();
                    }
                },

                removeChildren:function(destroy) {
                    var self = this,
                        t = [].concat(self.get("children"));
                    S.each(t, function(c) {
                        self.removeChild(c, destroy);
                    });
                    self.set("children", []);
                },

                getChildAt:function(index) {
                    var children = this.get("children");
                    return children[index];
                },

                _uiSetHandleMouseEvents:function(v) {
                    var self = this,
                        el = self.get("el");
                    if (v) {
                        el.on("mouseenter", self._handleMouseEnter, self);
                        el.on("mouseleave", self._handleMouseLeave, self);
                        el.on("mousedown", self._handleMouseDown, self);
                        el.on("mouseup", self._handleMouseUp, self);
                        el.on("dblclick", self._handleDblClick, self);
                    } else {
                        el.detach("mouseenter", self._handleMouseEnter, self);
                        el.detach("mouseleave", self._handleMouseLeave, self);
                        el.detach("mousedown", self._handleMouseDown, self);
                        el.detach("mouseup", self._handleMouseUp, self);
                        el.detach("dblclick", self._handleDblClick, self);
                    }
                },

                _handleDblClick:function(e) {
                    var self = this;
                    if (!self.get("disabled")) {
                        self._performInternal(e);
                    }
                },

                _isMouseEventWithinElement:function(e, elem) {
                    var relatedTarget = e.relatedTarget;
                    if (!relatedTarget) {
                        return false;
                    }
                    // 在里面或等于自身都不算 mouseenter/leave
                    if (relatedTarget === elem[0]
                        || elem.contains(relatedTarget)) {
                        return true;
                    }
                },

                _handleMouseOver:function(e) {
                    var self = this,
                        el = self.get("el");
                    if (self.get("disabled")) {
                        return true;
                    }
                    if (!self._isMouseEventWithinElement(e, el)) {
                        self._handleMouseEnter(e);
                    }
                },


                _handleMouseOut:function(e) {
                    var self = this,
                        el = self.get("el");
                    if (self.get("disabled")) {
                        return true;
                    }
                    if (!self._isMouseEventWithinElement(e, el)) {
                        self._handleMouseLeave(e);
                    }
                },

                /**
                 * root element handler for mouse enter
                 */
                _handleMouseEnter:function() {
                    var self = this;
                    if (self.get("disabled")) {
                        return true;
                    }
                    self.set("highlighted", true);
                },

                /**
                 * root element handler for mouse leave
                 */
                _handleMouseLeave:function() {
                    var self = this;
                    if (self.get("disabled")) {
                        return true;
                    }
                    self.set("active", false);
                    self.set("highlighted", false);
                },

                /**
                 * root element handler for mouse down
                 * @param ev
                 */
                _handleMouseDown:function(ev) {
                    var self = this;
                    if (self.get("disabled")) {
                        return true;
                    }
                    if (ev.which == 1 && self.get("activeable")) {
                        self.set("active", true);
                    }
                    var el = self.getKeyEventTarget();
                    // 左键，否则 unselectable 在 ie 下鼠标点击获得不到焦点
                    if (ev.which == 1 && el.attr("tabindex") >= 0) {
                        el[0].focus();
                    }
                    // Cancel the default action unless the control
                    // allows text selection.
                    if (ev.which == 1 && !self.get("allowTextSelection_")) {
                        // firefox 不会引起焦点转移
                        ev.preventDefault();
                    }
                },

                /**
                 * whether component can receive focus
                 */
                _uiSetFocusable:function(v) {
                    var self = this,
                        el = self.getKeyEventTarget();
                    if (v) {
                        el.on("focus", self._handleFocus, self);
                        el.on("blur", self._handleBlur, self);
                        el.on("keydown", self._handleKeydown, self);
                    } else {
                        el.detach("focus", self._handleFocus, self);
                        el.detach("blur", self._handleBlur, self);
                        el.detach("keydown", self._handleKeydown, self);
                    }
                },

                _uiSetFocused:function(v) {
                    this._forwardSetAttrToView("focused", v);
                },

                _uiSetHighlighted:function(v) {
                    this._forwardSetAttrToView("highlighted", v);
                },

                _forwardSetAttrToView:function(attrName, v) {
                    var view = this.get("view");
                    view["_set" + capitalFirst(attrName)].call(view, v, getClsByHierarch(this));
                },


                _uiSetDisabled:function(v) {
                    this._forwardSetAttrToView("disabled", v);
                },


                _uiSetActive:function(v) {
                    this._forwardSetAttrToView("active", v);
                },

                /**
                 * 焦点所在元素即键盘事件处理元素
                 */
                getKeyEventTarget:function() {
                    return this.get("view").getKeyEventTarget();
                },
                /**
                 * root element handler for mouse up
                 */
                _handleMouseUp:function(ev) {
                    var self = this;
                    if (self.get("disabled")) {
                        return true;
                    }
                    // 左键
                    if (self.get("active") && ev.which == 1) {
                        self._performInternal(ev);
                        self.set("active", false);
                    }
                },
                /**
                 * root element handler for focus
                 */
                _handleFocus:function() {
                    this.set("focused", true);
                },
                /**
                 * root element handler for blur
                 */
                _handleBlur:function() {
                    this.set("focused", false);
                },

                _handleKeyEventInternal:function(ev) {
                    if (ev.keyCode == Event.KeyCodes.ENTER) {
                        return this._performInternal(ev);
                    }
                },
                /**
                 * root element handler for keydown
                 * @param ev
                 */
                _handleKeydown:function(ev) {
                    var self = this;
                    if (self.get("disabled")) {
                        return true;
                    }
                    if (self._handleKeyEventInternal(ev)) {
                        ev.halt();
                        return true;
                    }
                },

                /**
                 * root element handler for click
                 */
                _performInternal:function() {
                },

                destructor:function() {
                    var self = this,
                        children = self.get("children");
                    S.each(children, function(child) {
                        child.destroy();
                    });
                    var view = self.get("view");
                    if (view) {
                        view.destroy();
                    }
                }
            },
            {
                ATTRS:{
                    /**
                     *  session state
                     */

                        // 是否绑定鼠标事件
                    handleMouseEvents:{
                        value:true
                    },

                    // 是否支持焦点处理
                    focusable:{
                        /*
                         *  observer synchronization , model 分成两类：
                         *view 负责监听 view 类 model 变化更新界面
                         *control 负责监听 control 类变化改变逻辑
                         *  problem : Observer behavior is hard to understand and debug because it's implicit behavior.
                         *
                         *  Keeping screen state and session state synchronized is an important task
                         *  Data Binding
                         */
                        view:true,
                        value:true
                        /**
                         * In general data binding gets tricky
                         * because if you have to avoid cycles where a change to the control,
                         * changes the record set, which updates the control,
                         * which updates the record set....
                         * The flow of usage helps avoid these -
                         * we load from the session state to the screen when the screen is opened,
                         * after that any changes to the screen state propagate back to the session state.
                         * It's unusual for the session state to be updated directly once the screen is up.
                         * As a result data binding might not be entirely bi-directional -
                         * just confined to initial upload and
                         * then propagating changes from the controls to the session state.
                         */
                        // sync
                    },

                    activeable:{
                        value:true
                    },

                    focused:{},

                    active:{},

                    highlighted:{},

                    //子组件
                    children:{
                        value:[]
                    },

                    // 转交给渲染层
                    prefixCls:{
                        view:true,
                        value:"ks-"
                    },

                    // 父组件
                    // Parent component to which events will be propagated.
                    parent:{
                    },

                    //渲染层
                    view:{
                    },

                    //是否禁用
                    disabled:{},

                    // 是否允许 DOM 结构内的文字选定
                    allowTextSelection_:{
                        value:false
                    }
                },

                DefaultRender:Render
            });

        return ModelControl;
    },
    {
        requires:['event','uibase','./uistore','./render']
    }
)
    ;
/**
 *  Note:
 *  控制层元属性配置中 view 的作用
 *   - 如果没有属性变化处理函数，自动生成属性变化处理函数，自动转发给 view 层
 *   - 如果没有指定 view 层实例，在生成默认 view 实例时，所有用户设置的 view 的属性都转到默认 view 实例中
 **//**
 * render base class for kissy
 * @author yiminghe@gmail.com
 * @refer http://martinfowler.com/eaaDev/uiArchs.html
 */
KISSY.add("component/render", function(S, UIBase, UIStore) {

    function tagFunc(self, classes, tag) {
        return self.getCls(classes.split(/\s+/).join(tag + " ") + tag);
    }

    return UIBase.create([UIBase.Box.Render], {

        _completeClasses:function(classes, tag) {
            return tagFunc(this, classes, tag);
        },

        /**
         * @protected
         */
        _renderCls:function(componentCls) {
            var self = this;
            self.get("el").addClass(self.getCls(componentCls));
        },

        getCls:UIStore.getCls,

        getKeyEventTarget:function() {
            return this.get("el");
        },

        getContentElement:function() {
            return this.get("contentEl") || this.get("el");
        },

        /**
         * @protected
         */
        _uiSetFocusable:function(v) {
            var el = this.getKeyEventTarget(),
                tabindex = el.attr("tabindex");
            if (tabindex >= 0 && !v) {
                el.attr("tabindex", -1);
            } else if (!(tabindex >= 0) && v) {
                el.attr("tabindex", 0);
            }
        },

        /**
         * @protected
         */
        _setHighlighted:function(v, componentCls) {
            var self = this,el = self.get("el");
            el[v ? 'addClass' : 'removeClass'](tagFunc(self, componentCls, "-hover"));
        },

        /**
         * @protected
         */
        _setDisabled:function(v, componentCls) {
            var self = this,el = self.get("el");
            el[v ? 'addClass' : 'removeClass'](tagFunc(self, componentCls, "-disabled"))
                //不能被 tab focus 到
                //support aria
                .attr({
                    "tabindex": v ? -1 : 0,
                    "aria-disabled": v
                });

        },
        /**
         * @protected
         */
        _setActive:function(v, componentCls) {
            var self = this;
            self.get("el")[v ? 'addClass' : 'removeClass'](tagFunc(self, componentCls, "-active"))
                .attr("aria-pressed", !!v);
        },
        /**
         * @protected
         */
        _setFocused:function(v, componentCls) {
            var self = this,el = self.get("el");
            el[v ? 'addClass' : 'removeClass'](tagFunc(self, componentCls, "-focused"));
        }

    }, {
        ATTRS:{
            /**
             *  screen state
             */
            prefixCls:{},
            focusable:{}
        }
    });
}, {
    requires:['uibase','./uistore']
});KISSY.add("component/uistore", function(S) {
    var uis = {
        // 不带前缀 prefixCls
        /*
         "menu" :{
         priority:0,
         ui:Menu
         }
         */
    };

    function getUIByClass(cls) {
        var cs = cls.split(/\s+/),p = -1,ui = null;
        for (var i = 0; i < cs.length; i++) {
            var uic = uis[cs[i]];
            if (uic && uic.priority > p) {
                ui = uic.ui;
            }
        }
        return ui;
    }

    function getClsByUI(constructor) {
        for (var u in uis) {
            var ui = uis[u];
            if (ui.ui == constructor) {
                return u;
            }
        }
        return 0;
    }

    function getClsByInstance(self) {
        return getClsByUI(self.constructor);
    }

    function setUIByClass(cls, uic) {
        uis[cls] = uic;
    }


    function getCls(cls) {
        var cs = S.trim(cls).split(/\s+/);
        for (var i = 0; i < cs.length; i++) {
            if (cs[i]) {
                cs[i] = this.get("prefixCls") + cs[i];
            }
        }
        return cs.join(" ");
    }

    return {
        getCls:getCls,
        getClsByUI:getClsByUI,
        getClsByInstance:getClsByInstance,
        getUIByClass:getUIByClass,
        setUIByClass:setUIByClass,
        PRIORITY:{
            LEVEL1:10,
            LEVEL2:20,
            LEVEL3:30,
            LEVEL4:40,
            LEVEL5:50,
            LEVEL6:60
        }
    };
});/**
 * mvc based component framework for kissy
 * @author yiminghe@gmail.com
 */
KISSY.add("component", function(KISSY, ModelControl, Render, Container, UIStore, DelegateChildren, DecorateChildren, DecorateChild) {

    /**
     * @name Component
     * @namespace
     */
    return {
        ModelControl:ModelControl,
        Render:Render,
        Container:Container,
        UIStore:UIStore,
        DelegateChildren:DelegateChildren,
        DecorateChild:DecorateChild,
        DecorateChildren:DecorateChildren
    };
}, {
    requires:['component/modelcontrol',
        'component/render',
        'component/container',
        'component/uistore',
        'component/delegatechildren',
        'component/decoratechildren',
        'component/decoratechild']
});
/*
Copyright 2011, KISSY UI Library v1.20dev
MIT Licensed
build time: Sep 22 13:54
*/
/**
 * Switchable
 * @creator  玉伯<lifesinger@gmail.com>,yiminghe@gmail.com
 */
KISSY.add('switchable/base', function(S, DOM, Event, undefined) {

    var DISPLAY = 'display',
        BLOCK = 'block',
        makeArray = S.makeArray,
        NONE = 'none',
        EventTarget = Event.Target,
        FORWARD = 'forward',
        BACKWARD = 'backward',
        DOT = '.',
        EVENT_INIT = 'init',
        EVENT_BEFORE_SWITCH = 'beforeSwitch',
        EVENT_SWITCH = 'switch',
        CLS_PREFIX = 'ks-switchable-';


    /**
     * Switchable Widget
     * attached members：
     *   - this.container
     *   - this.config
     *   - this.triggers  可以为空值 []
     *   - this.panels    可以为空值 []
     *   - this.content
     *   - this.length
     *   - this.activeIndex
     *   - this.switchTimer
     */
    function Switchable(container, config) {
        var self = this;

        // 调整配置信息
        config = config || {};
        if (!('markupType' in config)) {
            if (config.panelCls) {
                config.markupType = 1;
            } else if (config.panels) {
                config.markupType = 2;
            }
        }

        // init config by hierarchy
        var host = this.constructor;
        while (host) {
            config = S.merge(host.Config, config);
            host = host.superclass ? host.superclass.constructor : null;
        }
        /**
         * the container of widget
         * @type HTMLElement
         */
        self.container = DOM.get(container);

        /**
         * 配置参数
         * @type Object
         */
        self.config = config;

        /**
         * triggers
         * @type Array of HTMLElement
         */
        //self.triggers

        /**
         * panels
         * @type Array of HTMLElement
         */
        //self.panels

        /**
         * length = panels.length / steps
         * @type number
         */
        //self.length

        /**
         * the parentNode of panels
         * @type HTMLElement
         */
        //self.content

        /**
         * 上一个完成动画/切换的位置
         * @type Number
         */
        //self.completedIndex

        /**
         * 当前正在动画/切换的位置,没有动画则和 completedIndex 一致
         * @type Number
         */
        self.activeIndex = self.completedIndex = config.activeIndex;

        // 设置了 activeIndex
        // 要配合设置 markup
        if (self.activeIndex > -1) {
        }
        //设置了 switchTo , activeIndex == -1
        else if (typeof config.switchTo == "number") {
        }
        // 否则，默认都为 0
        // 要配合设置位置 0 的 markup
        else {
            self.completedIndex = self.activeIndex = 0;
        }


        self._init();
        self._initPlugins();
        self.fire(EVENT_INIT);


        if (self.activeIndex > -1) {
        } else if (typeof config.switchTo == "number") {
            self.switchTo(config.switchTo);
        }
    }

    function getDomEvent(e) {
        var originalEvent = {};
        originalEvent.type = e.originalEvent.type;
        originalEvent.target = e.originalEvent.target || e.originalEvent.srcElement;
        return {originalEvent:originalEvent};
    }

    Switchable.getDomEvent = getDomEvent;

    // 默认配置
    Switchable.Config = {
        markupType: 0, // markup 的类型，取值如下：

        // 0 - 默认结构：通过 nav 和 content 来获取 triggers 和 panels
        navCls: CLS_PREFIX + 'nav',
        contentCls: CLS_PREFIX + 'content',

        // 1 - 适度灵活：通过 cls 来获取 triggers 和 panels
        triggerCls: CLS_PREFIX + 'trigger',
        panelCls: CLS_PREFIX + 'panel',

        // 2 - 完全自由：直接传入 triggers 和 panels
        triggers: [],
        panels: [],

        // 是否有触点
        hasTriggers: true,

        // 触发类型
        triggerType: 'mouse', // or 'click'
        // 触发延迟
        delay: .1, // 100ms

        activeIndex: -1, // markup 的默认激活项应与 activeIndex 保持一致，激活并不代表动画完成
        activeTriggerCls: 'ks-active',
        //switchTo: undefined,  // 初始切换到面板

        // 可见视图内有多少个 panels
        steps: 1,

        // 可见视图区域的大小。一般不需要设定此值，仅当获取值不正确时，用于手工指定大小
        viewSize: []
    };

    // 插件
    Switchable.Plugins = [];

    S.augment(Switchable, EventTarget, {

        _initPlugins:function() {
            // init plugins by Hierarchy
            var self = this,
                pluginHost = self.constructor;
            while (pluginHost) {
                S.each(pluginHost.Plugins, function(plugin) {
                    if (plugin.init) {
                        plugin.init(self);
                    }
                });
                pluginHost = pluginHost.superclass ?
                    pluginHost.superclass.constructor :
                    null;
            }
        },

        /**
         * init switchable
         */
        _init: function() {
            var self = this,
                cfg = self.config;

            // parse markup
            self._parseMarkup();

            // bind triggers
            if (cfg.hasTriggers) {
                self._bindTriggers();
            }
        },

        /**
         * 解析 markup, 获取 triggers, panels, content
         */
        _parseMarkup: function() {
            var self = this,
                container = self.container,
                cfg = self.config,
                nav,
                content,
                triggers = [],
                panels = [],
                n;

            switch (cfg.markupType) {
                case 0: // 默认结构
                    nav = DOM.get(DOT + cfg.navCls, container);
                    if (nav) {
                        triggers = DOM.children(nav);
                    }
                    content = DOM.get(DOT + cfg.contentCls, container);
                    panels = DOM.children(content);
                    break;
                case 1: // 适度灵活
                    triggers = DOM.query(DOT + cfg.triggerCls, container);
                    panels = DOM.query(DOT + cfg.panelCls, container);
                    break;
                case 2: // 完全自由
                    triggers = cfg.triggers;
                    panels = cfg.panels;
                    break;
            }


            // get length
            n = panels.length;
            self.length = n / cfg.steps;

            // 自动生成 triggers
            if (cfg.hasTriggers && n > 0 && triggers.length === 0) {
                triggers = self._generateTriggersMarkup(self.length);
            }

            // 将 triggers 和 panels 转换为普通数组
            self.triggers = makeArray(triggers);
            self.panels = makeArray(panels);

            // get content
            self.content = content || panels[0].parentNode;
            self.nav = nav || cfg.hasTriggers && triggers[0].parentNode;
        },

        /**
         * 自动生成 triggers 的 markup
         */
        _generateTriggersMarkup: function(len) {
            var self = this,
                cfg = self.config,
                ul = DOM.create('<ul>'),
                li,
                i;

            ul.className = cfg.navCls;
            for (i = 0; i < len; i++) {
                li = DOM.create('<li>');
                if (i === self.activeIndex) {
                    li.className = cfg.activeTriggerCls;
                }
                li.innerHTML = i + 1;
                ul.appendChild(li);
            }

            self.container.appendChild(ul);
            return DOM.children(ul);
        },

        /**
         * 给 triggers 添加事件
         */
        _bindTriggers: function() {
            var self = this, cfg = self.config,
                triggers = self.triggers, trigger,
                i, len = triggers.length;

            for (i = 0; i < len; i++) {
                (function(index) {
                    trigger = triggers[index];

                    Event.on(trigger, 'click', function(e) {
                        self._onFocusTrigger(index, e);
                    });

                    if (cfg.triggerType === 'mouse') {
                        Event.on(trigger, 'mouseenter', function(e) {
                            self._onMouseEnterTrigger(index, e);
                        });
                        Event.on(trigger, 'mouseleave', function() {
                            self._onMouseLeaveTrigger(index);
                        });
                    }
                })(i);
            }
        },

        /**
         * click or tab 键激活 trigger 时触发的事件
         */
        _onFocusTrigger: function(index, e) {
            var self = this;
            // 重复点击
            if (!self._triggerIsValid(index)) {
                return;
            }
            this._cancelSwitchTimer(); // 比如：先悬浮，再立刻点击，这时悬浮触发的切换可以取消掉。
            self.switchTo(index, undefined, getDomEvent(e));
        },

        /**
         * 鼠标悬浮在 trigger 上时触发的事件
         */
        _onMouseEnterTrigger: function(index, e) {
            var self = this;
            if (!self._triggerIsValid(index)) {
                return;
            }
            var ev = getDomEvent(e);
            // 重复悬浮。比如：已显示内容时，将鼠标快速滑出再滑进来，不必再次触发。
            self.switchTimer = S.later(function() {
                self.switchTo(index, undefined, ev);
            }, self.config.delay * 1000);
        },

        /**
         * 鼠标移出 trigger 时触发的事件
         */
        _onMouseLeaveTrigger: function() {
            this._cancelSwitchTimer();
        },

        /**
         * 重复触发时的有效判断
         */
        _triggerIsValid: function(index) {
            return this.activeIndex !== index;
        },

        /**
         * 取消切换定时器
         */
        _cancelSwitchTimer: function() {
            var self = this;
            if (self.switchTimer) {
                self.switchTimer.cancel();
                self.switchTimer = undefined;
            }
        },

        /**
         * 切换操作，对外 api
         * @param index 要切换的项
         * @param direction 方向，用于 effect
         * @param ev 引起该操作的事件
         * @param callback 运行完回调，和绑定 switch 事件作用一样
         */
        switchTo: function(index, direction, ev, callback) {
            var self = this,
                cfg = self.config,
                triggers = self.triggers,
                panels = self.panels,
                ingIndex = self.activeIndex,
                steps = cfg.steps,
                fromIndex = ingIndex * steps,
                toIndex = index * steps;

            // 再次避免重复触发
            if (!self._triggerIsValid(index)) {
                return self;
            }
            if (self.fire(EVENT_BEFORE_SWITCH, {toIndex: index}) === false) {
                return self;
            }


            // switch active trigger
            if (cfg.hasTriggers) {
                self._switchTrigger(ingIndex > -1 ?
                    triggers[ingIndex] : null,
                    triggers[index]);
            }

            // switch active panels
            if (direction === undefined) {
                direction = index > ingIndex ? FORWARD : BACKWARD;
            }

            // switch view
            self._switchView(
                ingIndex > -1 ? panels.slice(fromIndex, fromIndex + steps) : null,
                panels.slice(toIndex, toIndex + steps),
                index,
                direction, ev, function() {
                    callback && callback.call(self, index);
                    // update activeIndex
                    self.completedIndex = index
                });

            self.activeIndex = index;

            return self; // chain
        },

        /**
         * 切换当前触点
         */
        _switchTrigger: function(fromTrigger, toTrigger/*, index*/) {
            var activeTriggerCls = this.config.activeTriggerCls;

            if (fromTrigger) {
                DOM.removeClass(fromTrigger, activeTriggerCls);
            }
            DOM.addClass(toTrigger, activeTriggerCls);
        },

        /**
         * 切换视图
         */
        _switchView: function(fromPanels, toPanels, index, direction, ev, callback) {
            // 最简单的切换效果：直接隐藏/显示
            if (fromPanels) {
                DOM.css(fromPanels, DISPLAY, NONE);
            }
            DOM.css(toPanels, DISPLAY, BLOCK);

            // fire onSwitch events
            this._fireOnSwitch(index, ev);
            callback && callback.call(this);
        },

        /**
         * 触发 switch 相关事件
         */
        _fireOnSwitch: function(index, ev) {
            this.fire(EVENT_SWITCH, S.mix(ev || {}, { currentIndex: index }));
        },

        /**
         * 切换到上一视图
         */
        prev: function(ev) {
            var self = this,
                activeIndex = self.activeIndex;
            self.switchTo(activeIndex > 0 ?
                activeIndex - 1 :
                self.length - 1, BACKWARD, ev);
        },

        /**
         * 切换到下一视图
         */
        next: function(ev) {
            var self = this,
                activeIndex = self.activeIndex;
            self.switchTo(activeIndex < self.length - 1 ?
                activeIndex + 1 :
                0, FORWARD, ev);
        }
    });

    return Switchable;

}, { requires: ['dom',"event"] });

/**
 * NOTES:
 *
 * 承玉：2011.06.02 review switchable
 *
 * 承玉：2011.05.10
 *   - 抽象 init plugins by Hierarchy
 *   - 抽象 init config by hierarchy
 *   - switchTo 处理，外部设置，初始展开面板
 *   - 增加状态 completedIndex
 *
 * 2010.07
 *  - 重构，去掉对 YUI2-Animation 的依赖
 *
 * 2010.04
 *  - 重构，脱离对 yahoo-dom-event 的依赖
 *
 * 2010.03
 *  - 重构，去掉 Widget, 部分代码直接采用 kissy 基础库
 *  - 插件机制从 weave 织入法改成 hook 钩子法
 *
 * TODO:
 *  - http://malsup.com/jquery/cycle/
 *  - http://www.mall.taobao.com/go/chn/mall_chl/flagship.php
 *  - 对 touch 设备的支持
 *
 * References:
 *  - jQuery Scrollable http://flowplayer.org/tools/scrollable.html
 *
 */
/**
 * common aria for switchable and stop autoplay if necessary
 * @author yiminghe@gmail.com
 */
KISSY.add("switchable/aria", function(S, DOM, Event, Switchable) {


    Switchable.Plugins.push({
        name:'aria',
        init:function(self) {
            if (!self.config.aria) return;

            var container = self.container;

            Event.on(container, "focusin", _contentFocusin, self);

            Event.on(container, "focusout", _contentFocusout, self);
        }
    });


    function _contentFocusin() {
        this.stop && this.stop();
        /**
         * !TODO
         * tab 到时滚动到当前
         */
    }

    function _contentFocusout() {
        this.start && this.start();
    }

    var default_focus = ["a","input","button","object"];
    var oriTabIndex = "oriTabIndex";
    return {

        setTabIndex:function(root, v) {
            root.tabIndex = v;
            DOM.query("*", root).each(function(n) {
                var nodeName = n.nodeName.toLowerCase();
                // a 需要被禁止或者恢复
                if (S.inArray(nodeName, default_focus)) {
                    if (!DOM.hasAttr(n, oriTabIndex)) {
                        DOM.attr(n, oriTabIndex, n.tabIndex)
                    }
                    //恢复原来
                    if (v != -1) {
                        n.tabIndex = DOM.attr(n, oriTabIndex);
                    } else {
                        n.tabIndex = v;
                    }
                }
            });
        }
    };

}, {
    requires:['dom','event','./base']
});/**
 * Accordion Widget
 * @creator  沉鱼<fool2fish@gmail.com>,yiminghe@gmail.com
 */
KISSY.add('switchable/accordion/base', function(S, DOM, Switchable) {


    /**
     * Accordion Class
     * @constructor
     */
    function Accordion(container, config) {
        var self = this;

        // factory or constructor
        if (!(self instanceof Accordion)) {
            return new Accordion(container, config);
        }

        Accordion.superclass.constructor.apply(self, arguments);
    }

    S.extend(Accordion, Switchable, {

            _switchTrigger: function(fromTrigger, toTrigger/*, index*/) {
                var self = this,
                    cfg = self.config;
                if (cfg.multiple) {
                    DOM.toggleClass(toTrigger, cfg.activeTriggerCls);
                } else {
                    Accordion.superclass._switchTrigger.apply(self, arguments);
                }
            },

            /**
             * 重复触发时的有效判断
             */
            _triggerIsValid: function(index) {
                // multiple 模式下，再次触发意味着切换展开/收缩状态
                return this.config.multiple ||
                    Accordion.superclass._triggerIsValid.call(this, index);
            },

            /**
             * 切换视图
             */
            _switchView: function(fromPanels, toPanels, index, direction, ev, callback) {
                var self = this,
                    cfg = self.config,
                    panel = toPanels[0];

                if (cfg.multiple) {
                    DOM.toggle(panel);
                    this._fireOnSwitch(index, ev);
                    callback && callback.call(this);
                } else {
                    Accordion.superclass._switchView.apply(self, arguments);
                }
            }
        });

    Accordion.Plugins = [];
    Accordion.Config = {
        markupType: 1,
        triggerType: 'click',
        multiple: false
    };
    return Accordion;

}, { requires:["dom","../base"]});

/**
 * TODO:
 *  - 支持动画
 *
 *  承玉：2011.06.02 review switchable
 *
 *  承玉：2011.05.10
 *   - review ,prepare for aria
 *
 *
 */
/**
 * accordion aria support
 * @creator yiminghe@gmail.com
 */
KISSY.add('switchable/accordion/aria', function(S, DOM, Event, Aria, Accordion) {

    var KEY_PAGEUP = 33;
    var KEY_PAGEDOWN = 34;
    var KEY_END = 35;
    var KEY_HOME = 36;

    var KEY_LEFT = 37;
    var KEY_UP = 38;
    var KEY_RIGHT = 39;
    var KEY_DOWN = 40;
    var KEY_TAB = 9;

//    var DOM_EVENT = {originalEvent:{target:1}};

    var KEY_SPACE = 32;
//    var KEY_BACKSPACE = 8;
//    var KEY_DELETE = 46;
    var KEY_ENTER = 13;
//    var KEY_INSERT = 45;
//    var KEY_ESCAPE = 27;

    S.mix(Accordion.Config, {
            aria:true
        });

    Accordion.Plugins.push({
            name:"aria",
            init:function(self) {
                if (!self.config.aria) return;
                var container = self.container,
                    activeIndex = self.activeIndex;
                DOM.attr(container, "aria-multiselectable",
                    self.config.multiple ? "true" : "false");
                if (self.nav) {
                    DOM.attr(self.nav, "role", "tablist");
                }
                var triggers = self.triggers,
                    panels = self.panels;
                var i = 0;
                S.each(panels, function(panel) {
                    if (!panel.id) {
                        panel.id = S.guid("ks-accordion-tab-panel");
                    }
                });
                S.each(triggers, function(trigger) {
                    if (!trigger.id) {
                        trigger.id = S.guid("ks-accordion-tab");
                    }
                });

                S.each(triggers, function(trigger) {
                    trigger.setAttribute("role", "tab");
                    trigger.setAttribute("aria-expanded", activeIndex == i ? "true" : "false");
                    trigger.setAttribute("aria-selected", activeIndex == i ? "true" : "false");
                    trigger.setAttribute("aria-controls", panels[i].id);
                    setTabIndex(trigger, activeIndex == i ? "0" : "-1");
                    i++;
                });
                i = 0;
                S.each(panels, function(panel) {
                    var t = triggers[i];
                    panel.setAttribute("role", "tabpanel");
                    panel.setAttribute("aria-hidden", activeIndex == i ? "false" : "true");
                    panel.setAttribute("aria-labelledby", t.id);
                    i++;
                });

                self.on("switch", _tabSwitch, self);

                Event.on(container, "keydown", _tabKeydown, self);
                /**
                 * prevent firefox native tab switch
                 */
                Event.on(container, "keypress", _tabKeypress, self);

            }
        });

    var setTabIndex = Aria.setTabIndex;

    function _currentTabFromEvent(t) {
        var triggers = this.triggers,
            trigger;
        S.each(triggers, function(ct) {
            if (ct == t || DOM.contains(ct, t)) {
                trigger = ct;
            }
        });
        return trigger;
    }


    function _currentPanelFromEvent(t) {
        var panels = this.panels,
            panel;
        S.each(panels, function(ct) {
            if (ct == t || DOM.contains(ct, t)) {
                panel = ct;
            }
        });
        return panel;
    }

    function getTabFromPanel(panel) {
        var triggers = this.triggers,
            panels = this.panels;
        return triggers[S.indexOf(panel, panels)];
    }

    function _currentTabByTarget(t) {
        var self = this,
            currentTarget = _currentTabFromEvent.call(self, t);
        if (!currentTarget) {
            currentTarget = getTabFromPanel.call(self,
                _currentPanelFromEvent.call(self, t))
        }
        return currentTarget;
    }

    function _tabKeypress(e) {

        switch (e.keyCode) {

            case KEY_PAGEUP:
            case KEY_PAGEDOWN:
                if (e.ctrlKey && !e.altKey && !e.shiftKey) {
                    e.halt();
                } // endif
                break;

            case KEY_TAB:
                if (e.ctrlKey && !e.altKey) {
                    e.halt();
                } // endif
                break;

        }
    }

    /**
     * Keyboard commands for the Tab Panel
     * @param e
     */
    function _tabKeydown(e) {
        var t = e.target,
            self = this,
            currentTarget,
            triggers = self.triggers;

        // Save information about a modifier key being pressed
        // May want to ignore keyboard events that include modifier keys
        var no_modifier_pressed_flag = !e.ctrlKey && !e.shiftKey && !e.altKey;
        var control_modifier_pressed_flag = e.ctrlKey && !e.shiftKey && !e.altKey;

        switch (e.keyCode) {

            case KEY_ENTER:
            case KEY_SPACE:
                if ((currentTarget = _currentTabFromEvent.call(self, t))
                    && no_modifier_pressed_flag
                    ) {

                    enter.call(self, currentTarget);
                    e.halt();
                }
                break;

            case KEY_LEFT:
            case KEY_UP:
                if ((currentTarget = _currentTabFromEvent.call(self, t))
                // 争渡读屏器阻止了上下左右键
                //&& no_modifier_pressed_flag
                    ) {
                    prev.call(self, currentTarget);
                    e.halt();
                } // endif
                break;

            case KEY_RIGHT:
            case KEY_DOWN:
                if ((currentTarget = _currentTabFromEvent.call(self, t))
                //&& no_modifier_pressed_flag
                    ) {
                    next.call(self, currentTarget);
                    e.halt();
                } // endif
                break;

            case KEY_PAGEDOWN:
                if (control_modifier_pressed_flag) {
                    e.halt();
                    currentTarget = _currentTabByTarget.call(self, t);
                    next.call(self, currentTarget);
                }
                break;

            case KEY_PAGEUP:
                if (control_modifier_pressed_flag) {
                    e.halt();
                    currentTarget = _currentTabByTarget.call(self, t);
                    prev.call(self, currentTarget);
                }
                break;

            case KEY_HOME:
                if (no_modifier_pressed_flag) {
                    currentTarget = _currentTabByTarget.call(self, t);
                    switchTo.call(self, 0);
                    e.halt();
                }
                break;

            case KEY_END:
                if (no_modifier_pressed_flag) {
                    currentTarget = _currentTabByTarget.call(self, t);
                    switchTo.call(self, triggers.length - 1);
                    e.halt();
                }
                break;

            case KEY_TAB:
                if (e.ctrlKey && !e.altKey) {
                    e.halt();
                    currentTarget = _currentTabByTarget.call(self, t);
                    if (e.shiftKey)
                        prev.call(self, currentTarget);
                    else
                        next.call(self, currentTarget);
                }
                break;
        }
    }

    function focusTo(nextIndex, focusNext) {
        var self = this,
            triggers = self.triggers,
            next = triggers[nextIndex];
        S.each(triggers, function(cur) {
            if (cur === next) return;
            setTabIndex(cur, "-1");
            DOM.removeClass(cur, "ks-switchable-select");
            cur.setAttribute("aria-selected", "false");
        });
        if (focusNext) {
            next.focus();
        }
        setTabIndex(next, "0");
        DOM.addClass(next, "ks-switchable-select");
        next.setAttribute("aria-selected", "true");
    }

    // trigger 焦点转移
    function prev(trigger) {
        var self = this,
            triggers = self.triggers,
            focusIndex = S.indexOf(trigger, triggers),
            nFocusIndex = focusIndex == 0
                ? triggers.length - 1 : focusIndex - 1;
        focusTo.call(self, nFocusIndex, true);
    }

    function switchTo(index) {
        focusTo.call(this, index, true)
    }


    // trigger 焦点转移
    function next(trigger) {
        var self = this,
            triggers = self.triggers,
            focusIndex = S.indexOf(trigger, triggers),
            nFocusIndex = (focusIndex == triggers.length - 1
                ? 0 : focusIndex + 1);
        focusTo.call(self, nFocusIndex, true);
    }

    function enter(trigger) {
        this.switchTo(S.indexOf(trigger, this.triggers));
    }


    // 显示 tabpanel
    function _tabSwitch(ev) {

        var domEvent = !!(ev.originalEvent.target || ev.originalEvent.srcElement),
            self = this,
            multiple = self.config.multiple,
            activeIndex = ev.currentIndex,
            panels = self.panels,
            triggers = self.triggers,
            trigger = triggers[activeIndex],
            panel = panels[activeIndex];

        if (!multiple) {
            S.each(panels, function(p) {
                if (p !== panel) {
                    p.setAttribute("aria-hidden", "true");
                }
            });
            S.each(triggers, function(t) {
                if (t !== trigger) {
                    t.setAttribute("aria-hidden", "true");
                }
            });
        }

        var o = panel.getAttribute("aria-hidden");
        panel.setAttribute("aria-hidden", o == "false" ? "true" : "false");
        trigger.setAttribute("aria-expanded", o == "false" ? "false" : "true");
        focusTo.call(self, activeIndex, domEvent);
    }
},
    {
        requires:["dom","event","../aria","./base"]
    });

/**

 承玉：2011.06.02 review switchable

 2011-05-08 承玉：add support for aria & keydown

 <h2>键盘快捷键</h2>
 <ul class="list">
 <li>左/上键:当焦点在标签时转到上一个标签
 <li>右/下键:当焦点在标签时转到下一个标签
 <li>Home: 当焦点在标签时转到第一个标签
 <li>End: 当焦点在标签时转到最后一个标签
 <li>Control + PgUp and Control + Shift + Tab: 当然焦点在容器内时转到当前标签上一个标签
 <li>Control + PgDn and Control + Tab: 当然焦点在容器内时转到当前标签下一个标签
 </ul>
 **/
/**
 * Switchable Autoplay Plugin
 * @creator  玉伯<lifesinger@gmail.com>
 */
KISSY.add('switchable/autoplay', function(S, Event, Switchable, undefined) {


    /**
     * 添加默认配置
     */
    S.mix(Switchable.Config, {
        autoplay: false,
        interval: 5, // 自动播放间隔时间
        pauseOnHover: true  // triggerType 为 mouse 时，鼠标悬停在 slide 上是否暂停自动播放
    });

    /**
     * 添加插件
     * attached members:
     *   - this.paused
     */
    Switchable.Plugins.push({

        name: 'autoplay',

        init: function(host) {

            var cfg = host.config,
                interval = cfg.interval * 1000,
                timer;

            if (!cfg.autoplay) return;

            function startAutoplay() {
                // 设置自动播放
                timer = S.later(function() {
                    if (host.paused) return;
                    // 自动播放默认 forward（不提供配置），这样可以保证 circular 在临界点正确切换
                    host.switchTo(host.activeIndex < host.length - 1 ?
                        host.activeIndex + 1 : 0,
                        'forward');
                }, interval, true);
            }

            // go
            startAutoplay();

            // 添加 stop 方法，使得外部可以停止自动播放
            host.stop = function() {
                if (timer) {
                    timer.cancel();
                    timer = undefined;
                }
                // paused 可以让外部知道 autoplay 的当前状态
                host.paused = true;
            };

            host.start = function() {
                if (timer) {
                    timer.cancel();
                    timer = undefined;
                }
                host.paused = false;
                startAutoplay();
            };

            // 鼠标悬停，停止自动播放
            if (cfg.pauseOnHover) {
                Event.on(host.container, 'mouseenter', host.stop, host);
                Event.on(host.container, 'mouseleave', host.start, host);
            }
        }
    });
    return Switchable;
}, { requires:["event","./base"]});
/**
 承玉：2011.06.02 review switchable
 *//**
 * Switchable Autorender Plugin
 * @creator  玉伯<lifesinger@gmail.com>
 */
KISSY.add('switchable/autorender', function(S,DOM,JSON,Switchable) {

    /**
     * 自动渲染 container 元素内的所有 Switchable 组件
     * 默认钩子：<div class="KS_Widget" data-widget-type="Tabs" data-widget-config="{...}">
     */
    Switchable.autoRender = function(hook, container) {
        hook = '.' + (hook || 'KS_Widget');

        DOM.query(hook, container).each(function(elem) {
            var type = elem.getAttribute('data-widget-type'), config;
            if (type && ('Switchable Tabs Slide Carousel Accordion'.indexOf(type) > -1)) {
                try {
                    config = elem.getAttribute('data-widget-config');
                    if (config) config = config.replace(/'/g, '"');
                    new S[type](elem, JSON.parse(config));
                } catch(ex) {
                    S.log('Switchable.autoRender: ' + ex, 'warn');
                }
            }
        });
    }

}, { requires:["dom","json","switchable/base"]});
/**
 * Carousel Widget
 * @creator  玉伯<lifesinger@gmail.com>
 */
KISSY.add('switchable/carousel/base', function(S, DOM, Event, Switchable, undefined) {

    var CLS_PREFIX = 'ks-switchable-',
        DOT = '.',
        PREV_BTN = 'prevBtn',
        NEXT_BTN = 'nextBtn',
        DOM_EVENT = {originalEvent:{target:1}};

    /**
     * Carousel Class
     * @constructor
     */
    function Carousel(container, config) {

        var self = this;

        // factory or constructor
        if (!(self instanceof Carousel)) {
            return new Carousel(container, config);
        }

        // call super
        Carousel.superclass.constructor.apply(self, arguments);
    }

    Carousel.Config = {
        circular: true,
        prevBtnCls: CLS_PREFIX + 'prev-btn',
        nextBtnCls: CLS_PREFIX + 'next-btn',
        disableBtnCls: CLS_PREFIX + 'disable-btn'
    };

    Carousel.Plugins = [];

    S.extend(Carousel, Switchable, {
            /**
             * 插入 carousel 的初始化逻辑
             *
             * Carousel 的初始化逻辑
             * 增加了:
             *   self.prevBtn
             *   self.nextBtn
             */
            _init:function() {
                var self = this;
                Carousel.superclass._init.call(self);
                var cfg = self.config,
                    disableCls = cfg.disableBtnCls;

                // 获取 prev/next 按钮，并添加事件
                S.each(['prev', 'next'], function(d) {
                    var btn = self[d + 'Btn'] = DOM.get(DOT + cfg[d + 'BtnCls'], self.container);

                    Event.on(btn, 'mousedown', function(ev) {
                        ev.preventDefault();
                        if (!DOM.hasClass(btn, disableCls)) {
                            self[d](DOM_EVENT);
                        }
                    });
                });

                // 注册 switch 事件，处理 prevBtn/nextBtn 的 disable 状态
                // circular = true 时，无需处理
                if (!cfg.circular) {
                    self.on('switch', function(ev) {
                        var i = ev.currentIndex,
                            disableBtn = (i === 0) ?
                                self[PREV_BTN] :
                                (i === self.length - 1) ? self[NEXT_BTN] :
                                    undefined;

                        DOM.removeClass([self[PREV_BTN], self[NEXT_BTN]], disableCls);

                        if (disableBtn) {
                            DOM.addClass(disableBtn, disableCls);
                        }
                    });
                }

                // 触发 itemSelected 事件
                Event.on(self.panels, 'click', function() {
                    self.fire('itemSelected', { item: this });
                });
            }
        });


    return Carousel;

}, { requires:["dom","event","../base"]});


/**
 * NOTES:
 *
 * 承玉：2011.06.02 review switchable
 *
 * 承玉：2011.05
 *  - 内部组件 init 覆盖父类而不是监听事件
 *
 * 2010.07
 *  - 添加对 prevBtn/nextBtn 的支持
 *  - 添加 itemSelected 事件
 *
 * TODO:
 *  - itemSelected 时，自动居中的特性
 */
/**
 * aria support for carousel
 * @author yiminghe@gmail.com
 */
KISSY.add("switchable/carousel/aria", function(S, DOM, Event, Aria, Carousel) {

//    var KEY_PAGEUP = 33;
//    var KEY_PAGEDOWN = 34;
//    var KEY_END = 35;
//    var KEY_HOME = 36;

    var KEY_LEFT = 37;
    var KEY_UP = 38;
    var KEY_RIGHT = 39;
    var KEY_DOWN = 40;
    //var KEY_TAB = 9;

    var KEY_SPACE = 32;
//    var KEY_BACKSPACE = 8;
//    var KEY_DELETE = 46;
    var KEY_ENTER = 13;
//    var KEY_INSERT = 45;
//    var KEY_ESCAPE = 27;
    var setTabIndex = Aria.setTabIndex;
    var DOM_EVENT = {originalEvent:{target:1}};
    var FORWARD = 'forward',
        BACKWARD = 'backward';

    function _switch(ev) {
        var self = this;
        var steps = self.config.steps;
        var index = ev.currentIndex;
        var activeIndex = self.activeIndex;
        var panels = self.panels;
        var panel = panels[index * steps];
        var triggers = self.triggers;
        var trigger = triggers[index];

        var domEvent = !!(ev.originalEvent.target || ev.originalEvent.srcElement);

        // dom 事件触发
        if (domEvent
            // 初始化
            || activeIndex == -1) {

            S.each(triggers, function(t) {
                setTabIndex(t, -1);
            });

            S.each(panels, function(t) {
                setTabIndex(t, -1);
            });

            if (trigger) {
                setTabIndex(trigger, 0);
            }
            setTabIndex(panel, 0);

            //dom 事件触发时，才会进行聚焦，否则会干扰用户
            if (domEvent) {
                panel.focus();
            }
        }
    }

    function findTrigger(t) {
        var r;
        S.each(this.triggers, function(trigger) {
            if (trigger == t
                || DOM.contains(trigger, t)) {
                r = trigger;
                return false;
            }
        });
        return r;
    }

    function next(c) {
        var n = DOM.next(c),
            triggers = this.triggers;
        if (!n) {
            n = triggers[0];
        }
        setTabIndex(c, -1);
        if (n) {
            setTabIndex(n, 0);
            n.focus();
        }
    }


    function prev(c) {
        var n = DOM.prev(c),
            triggers = this.triggers;
        if (!n) {
            n = triggers[triggers.length - 1];
        }
        setTabIndex(c, -1);
        if (n) {
            setTabIndex(n, 0);
            n.focus();
        }
    }

    function _navKeydown(e) {
        var key = e.keyCode,t = e.target,
            c;

        switch (key) {
            case KEY_DOWN:
            case KEY_RIGHT:

                c = findTrigger.call(this, t);
                if (c) {
                    next.call(this, c);
                    e.halt();
                }
                break;

            case KEY_UP:
            case KEY_LEFT:

                c = findTrigger.call(this, t);
                if (c) {
                    prev.call(this, c);
                    e.halt();
                }
                break;

            case KEY_ENTER:
            case KEY_SPACE:
                c = findTrigger.call(this, t);
                if (c) {
                    this.switchTo(S.indexOf(c, this.triggers), undefined, DOM_EVENT);
                    e.halt();
                }
                break;
        }
    }

    function findPanel(t) {
        var r;
        S.each(this.panels, function(p) {
            if (p == t || DOM.contains(p, t)) {
                r = p;
                return false;
            }
        });
        return r;
    }


    function nextPanel(c) {
        var n = DOM.next(c),
            panels = this.panels;
        if (!n) {
            n = panels[0];
        }
        setTabIndex(c, -1);
        setTabIndex(n, 0);

        if (checkPanel.call(this, n, FORWARD)) {
            n.focus();
        }
    }


    function prevPanel(c) {
        var n = DOM.prev(c),
            panels = this.panels;
        if (!n) {
            n = panels[panels.length - 1];
        }
        setTabIndex(c, -1);
        setTabIndex(n, 0);
        if (checkPanel.call(this, n, BACKWARD)) {
            n.focus();
        }
    }

    function checkPanel(p, direction) {
        var index = S.indexOf(p, this.panels),
            steps = this.config.steps,
            dest = Math.floor(index / steps);
        // 在同一个 panel 组，立即返回
        if (dest == this.activeIndex) {
            return 1;
        }
        if (index % steps == 0 || index % steps == steps - 1) {
            //向前动画滚动中，focus，会不正常 ...
            //传递事件，动画后异步 focus
            this.switchTo(dest, direction, DOM_EVENT);
            return 0;
        }
        return 1;
    }


    function _contentKeydown(e) {

        var key = e.keyCode,
            t = e.target,
            c;

        switch (key) {
            case KEY_DOWN:
            case KEY_RIGHT:

                c = findPanel.call(this, t);
                if (c) {
                    nextPanel.call(this, c);
                    e.halt();
                }
                break;


            case KEY_UP:
            case KEY_LEFT:

                c = findPanel.call(this, t);
                if (c) {
                    prevPanel.call(this, c);
                    e.halt();
                }
                break;

            case KEY_ENTER:
            case KEY_SPACE:

                c = findPanel.call(this, t);
                if (c) {
                    this.fire('itemSelected', { item: c });
                    e.halt();
                }
                break;
        }
    }

    S.mix(Carousel.Config, {
            aria:false
        });

    Carousel.Plugins.push({
            name:"aria",
            init:function(self) {
                if (!self.config.aria) {
                    return;
                }
                var triggers = self.triggers;
                var panels = self.panels;
                var content = self.content;
                var activeIndex = self.activeIndex;

                if (!content.id) {
                    content.id = S.guid("ks-switchbale-content");
                }
                content.setAttribute("role", "listbox");
                var i = 0;
                S.each(triggers, function(t) {
                    setTabIndex(t, activeIndex == i ? "0" : "-1");
                    t.setAttribute("role", "button");
                    t.setAttribute("aria-controls", content.id);
                    i++;
                });
                i = 0;
                S.each(panels, function(t) {
                    setTabIndex(t, "-1");
                    t.setAttribute("role", "option");
                    i++;
                });

                self.on("switch", _switch, self);
                var nav = self.nav;

                if (nav) {
                    Event.on(nav, "keydown", _navKeydown, self);
                }

                Event.on(content, "keydown", _contentKeydown, self);

                var prevBtn = self['prevBtn'],
                    nextBtn = self['nextBtn'];

                if (prevBtn) {
                    setTabIndex(prevBtn, 0);
                    prevBtn.setAttribute("role", "button");
                    Event.on(prevBtn, "keydown", function(e) {
                        if (e.keyCode == KEY_ENTER || e.keyCode == KEY_SPACE) {
                            self.prev(DOM_EVENT);
                            e.preventDefault();
                        }
                    });
                }

                if (nextBtn) {
                    setTabIndex(nextBtn, 0);
                    nextBtn.setAttribute("role", "button");
                    Event.on(nextBtn, "keydown", function(e) {
                        if (e.keyCode == KEY_ENTER || e.keyCode == KEY_SPACE) {
                            self.next(DOM_EVENT);
                            e.preventDefault();
                        }
                    });
                }

            }
        });

}, {
        requires:["dom","event","../aria","./base"]
    });

/**
 承玉：2011.06.02 review switchable

 承玉:2011.05.12

 <h2>键盘快捷键</h2>
 <ul class="list">
 <li><strong>当焦点在上一页 / 下一页时</strong>
 <ul>
 <li>
 enter/space 旋转到上一屏下一屏，并且焦点转移到当前屏的第一个面板
 </li>
 </ul>
 </li>

 <li>
 <strong> 当焦点在导航圆点时</strong>
 <ul>
 <li>
 上/左键：焦点转移到上一个导航圆点
 </li>
 <li>
 下/右键：焦点转移到下一个导航圆点
 </li>
 <li>
 enter/space: 旋转到当前导航圆点代表的滚动屏，并且焦点转移到当前屏的第一个面板
 </li>
 </ul>
 </li>


 <li>
 <strong>当焦点在底部滚动屏某个面板时</strong>
 <ul>
 <li>
 上/左键：焦点转移到上一个面板，必要时滚屏
 </li>
 <li>
 下/右键：焦点转移到下一个面板，必要时滚屏
 </li>
 <li>
 enter/space: 触发 itemSelect 事件，item 为当前面板
 </li>
 </ul>
 </li>
 </ul>
 **//**
 * Switchable Effect Plugin
 * @creator  玉伯<lifesinger@gmail.com>
 */
KISSY.add('switchable/effect', function(S, DOM, Event, Anim, Switchable, undefined) {

    var DISPLAY = 'display',
        BLOCK = 'block',
        NONE = 'none',
        OPACITY = 'opacity',
        Z_INDEX = 'z-index',
        POSITION = 'position',
        RELATIVE = 'relative',
        ABSOLUTE = 'absolute',
        SCROLLX = 'scrollx',
        SCROLLY = 'scrolly',
        FADE = 'fade',
        LEFT = 'left',
        TOP = 'top',
        FLOAT = 'float',
        PX = 'px',
        Effects;

    /**
     * 添加默认配置
     */
    S.mix(Switchable.Config, {
        effect: NONE, // 'scrollx', 'scrolly', 'fade' 或者直接传入 custom effect fn
        duration: .5, // 动画的时长
        easing: 'easeNone', // easing method
        nativeAnim: undefined
    });

    /**
     * 定义效果集
     */
    Switchable.Effects = {

        // 最朴素的显示/隐藏效果
        none: function(fromEls, toEls, callback) {
            if (fromEls) {
                DOM.css(fromEls, DISPLAY, NONE);
            }
            DOM.css(toEls, DISPLAY, BLOCK);
            callback && callback();
        },

        // 淡隐淡现效果
        fade: function(fromEls, toEls, callback) {
            if (fromEls) {
                if (fromEls.length !== 1) {
                    S.error('fade effect only supports steps == 1.');
                }
            }

            var self = this,
                cfg = self.config,
                fromEl = fromEls ? fromEls[0] : null,
                toEl = toEls[0];

            if (self.anim) {
                // 不执行回调
                self.anim.stop();
                // 防止上个未完，放在最下层
                DOM.css(self.anim.fromEl, {
                    zIndex: 1,
                    opacity:0
                });
                // 把上个的 toEl 放在最上面，防止 self.anim.toEl == fromEL
                // 压不住后面了
                DOM.css(self.anim.toEl, "zIndex", 9);
            }


            // 首先显示下一张
            DOM.css(toEl, OPACITY, 1);

            if (fromEl) {
                // 动画切换
                self.anim = new Anim(fromEl,
                    { opacity: 0 },
                    cfg.duration,
                    cfg.easing,
                    function() {
                        self.anim = undefined; // free
                        // 切换 z-index
                        DOM.css(toEl, Z_INDEX, 9);
                        DOM.css(fromEl, Z_INDEX, 1);
                        callback && callback();
                    }, cfg.nativeAnim).run();
                self.anim.toEl = toEl;
                self.anim.fromEl = fromEl;
            } else {
                //初始情况下没有必要动画切换
                DOM.css(toEl, Z_INDEX, 9);
                callback && callback();
            }
        },

        // 水平/垂直滚动效果
        scroll: function(fromEls, toEls, callback, index) {
            var self = this,
                cfg = self.config,
                isX = cfg.effect === SCROLLX,
                diff = self.viewSize[isX ? 0 : 1] * index,
                props = { };

            props[isX ? LEFT : TOP] = -diff + PX;

            if (self.anim) {
                self.anim.stop();
            }
            if (fromEls) {
                self.anim = new Anim(self.content, props,
                    cfg.duration,
                    cfg.easing,
                    function() {
                        self.anim = undefined; // free
                        callback && callback();
                    }, cfg.nativeAnim).run();
            } else {
                DOM.css(self.content, props);
                callback && callback();
            }
        }
    };
    Effects = Switchable.Effects;
    Effects[SCROLLX] = Effects[SCROLLY] = Effects.scroll;

    /**
     * 添加插件
     * attached members:
     *   - this.viewSize
     */
    Switchable.Plugins.push({

        name: 'effect',

        /**
         * 根据 effect, 调整初始状态
         */
        init: function(host) {
            var cfg = host.config,
                effect = cfg.effect,
                panels = host.panels,
                content = host.content,
                steps = cfg.steps,
                activeIndex = host.activeIndex,
                len = panels.length;

            // 1. 获取高宽
            host.viewSize = [
                cfg.viewSize[0] || panels[0].offsetWidth * steps,
                cfg.viewSize[1] || panels[0].offsetHeight * steps
            ];
            // 注：所有 panel 的尺寸应该相同
            // 最好指定第一个 panel 的 width 和 height, 因为 Safari 下，图片未加载时，读取的 offsetHeight 等值会不对

            // 2. 初始化 panels 样式
            if (effect !== NONE) { // effect = scrollx, scrolly, fade

                // 这些特效需要将 panels 都显示出来
                DOM.css(panels, DISPLAY, BLOCK);

                switch (effect) {
                    // 如果是滚动效果
                    case SCROLLX:
                    case SCROLLY:

                        // 设置定位信息，为滚动效果做铺垫
                        DOM.css(content, POSITION, ABSOLUTE);

                        // 注：content 的父级不一定是 container
                        if (DOM.css(content.parentNode, POSITION) == "static") {
                            DOM.css(content.parentNode, POSITION, RELATIVE);
                        }

                        // 水平排列
                        if (effect === SCROLLX) {
                            DOM.css(panels, FLOAT, LEFT);
                            // 设置最大宽度，以保证有空间让 panels 水平排布
                            DOM.width(content, host.viewSize[0] * (len / steps));
                        }
                        break;

                    // 如果是透明效果，则初始化透明
                    case FADE:
                        var min = activeIndex * steps,
                            max = min + steps - 1,
                            isActivePanel;

                        S.each(panels, function(panel, i) {
                            isActivePanel = i >= min && i <= max;
                            DOM.css(panel, {
                                opacity: isActivePanel ? 1 : 0,
                                position: ABSOLUTE,
                                zIndex: isActivePanel ? 9 : 1
                            });
                        });
                        break;
                }
            }

            // 3. 在 CSS 里，需要给 container 设定高宽和 overflow: hidden
        }
    });

    /**
     * 覆盖切换方法
     */
    S.augment(Switchable, {

        _switchView: function(fromEls, toEls, index, direction, ev, callback) {

            var self = this,
                cfg = self.config,
                effect = cfg.effect,
                fn = S.isFunction(effect) ? effect : Effects[effect];

            fn.call(self, fromEls, toEls, function() {
                self._fireOnSwitch(index, ev);
                callback && callback.call(self);
            }, index, direction);
        }

    });

    return Switchable;

}, { requires:["dom","event","anim","switchable/base"]});
/**
 * 承玉：2011.06.02 review switchable
 */
/**
 * Switchable Circular Plugin
 * @creator  玉伯<lifesinger@gmail.com>
 */
KISSY.add('switchable/circular', function(S, DOM, Anim, Switchable) {

    var POSITION = 'position',
        RELATIVE = 'relative',
        LEFT = 'left',
        TOP = 'top',
        EMPTY = '',
        PX = 'px',
        FORWARD = 'forward',
        BACKWARD = 'backward',
        SCROLLX = 'scrollx',
        SCROLLY = 'scrolly';

    /**
     * 添加默认配置
     */
    S.mix(Switchable.Config, {
            circular: false
        });

    /**
     * 循环滚动效果函数
     */
    function circularScroll(fromEls, toEls, callback, index, direction) {
        var self = this,
            cfg = self.config,
            len = self.length,
            activeIndex = self.activeIndex,
            isX = cfg.scrollType === SCROLLX,
            prop = isX ? LEFT : TOP,
            viewDiff = self.viewSize[isX ? 0 : 1],
            diff = -viewDiff * index,
            props = {},
            isCritical,
            isBackward = direction === BACKWARD;
        // 从第一个反向滚动到最后一个 or 从最后一个正向滚动到第一个
        isCritical = (isBackward && activeIndex === 0 && index === len - 1)
            || (direction === FORWARD && activeIndex === len - 1 && index === 0);

        if (isCritical) {
            // 调整位置并获取 diff
            diff = adjustPosition.call(self, self.panels, index, isBackward, prop, viewDiff);
        }
        props[prop] = diff + PX;

        // 开始动画

        if (self.anim) {
            self.anim.stop();
        }

        if (fromEls) {
            self.anim = new Anim(self.content,
                props,
                cfg.duration,
                cfg.easing,
                function() {
                    if (isCritical) {
                        // 复原位置
                        resetPosition.call(self, self.panels, index, isBackward, prop, viewDiff);
                    }
                    // free
                    self.anim = undefined;
                    callback && callback();
                }, cfg.nativeAnim).run();
        } else {
            // 初始化
            DOM.css(self.content, props);
            callback && callback();
        }

    }

    /**
     * 调整位置
     */
    function adjustPosition(panels, index, isBackward, prop, viewDiff) {
        var self = this, cfg = self.config,
            steps = cfg.steps,
            len = self.length,
            start = isBackward ? len - 1 : 0,
            from = start * steps,
            to = (start + 1) * steps,
            i;

        // 调整 panels 到下一个视图中
        var actionPanels = panels.slice(from, to);
        DOM.css(actionPanels, POSITION, RELATIVE);
        DOM.css(actionPanels, prop, (isBackward ? -1 : 1) * viewDiff * len);

        // 偏移量
        return isBackward ? viewDiff : -viewDiff * len;
    }

    /**
     * 复原位置
     */
    function resetPosition(panels, index, isBackward, prop, viewDiff) {
        var self = this,
            cfg = self.config,
            steps = cfg.steps,
            len = self.length,
            start = isBackward ? len - 1 : 0,
            from = start * steps,
            to = (start + 1) * steps,
            i;

        // 滚动完成后，复位到正常状态
        var actionPanels = panels.slice(from, to);
        DOM.css(actionPanels, POSITION, EMPTY);
        DOM.css(actionPanels, prop, EMPTY);

        // 瞬移到正常位置
        DOM.css(self.content, prop, isBackward ? -viewDiff * (len - 1) : EMPTY);
    }

    /**
     * 添加插件
     */
    Switchable.Plugins.push({

            name: 'circular',

            /**
             * 根据 effect, 调整初始状态
             */
            init: function(host) {
                var cfg = host.config;

                // 仅有滚动效果需要下面的调整
                if (cfg.circular && (cfg.effect === SCROLLX || cfg.effect === SCROLLY)) {
                    // 覆盖滚动效果函数
                    cfg.scrollType = cfg.effect; // 保存到 scrollType 中
                    cfg.effect = circularScroll;
                }
            }
        });

}, { requires:["dom","anim","./base","./effect"]});

/**
 * 承玉：2011.06.02 review switchable
 *
 * TODO:
 *   - 是否需要考虑从 0 到 2（非最后一个） 的 backward 滚动？需要更灵活
 */
/**
 * Switchable Countdown Plugin
 * @creator  gonghao<gonghao@ghsky.com>
 */
KISSY.add('switchable/countdown', function(S, DOM, Event, Anim, Switchable, undefined) {

    var CLS_PREFIX = 'ks-switchable-trigger-',
        TRIGGER_MASK_CLS = CLS_PREFIX + 'mask',
        TRIGGER_CONTENT_CLS = CLS_PREFIX + 'content',
        STYLE = 'style';

    /**
     * 添加默认配置
     */
    S.mix(Switchable.Config, {
            countdown: false,
            countdownFromStyle: '',      // 倒计时的初始样式
            countdownToStyle: 'width: 0' // 初始样式由用户在 css 里指定，配置里仅需要传入有变化的最终样式
        });

    /**
     * 添加插件
     */
    Switchable.Plugins.push({

            name: 'countdown',

            init: function(host) {
                var cfg = host.config,
                    animTimer,
                    interval = cfg.interval,
                    triggers = host.triggers,
                    masks = [],
                    fromStyle = cfg.countdownFromStyle,
                    toStyle = cfg.countdownToStyle,
                    anim;

                // 必须保证开启 autoplay 以及有 trigger 时，才能开启倒计时动画
                if (!cfg.autoplay || !cfg.hasTriggers || !cfg.countdown) return;

                // 为每个 trigger 增加倒计时动画覆盖层
                S.each(triggers, function(trigger, i) {
                    trigger.innerHTML = '<div class="' + TRIGGER_MASK_CLS + '"></div>' +
                        '<div class="' + TRIGGER_CONTENT_CLS + '">' +
                        trigger.innerHTML + '</div>';
                    masks[i] = trigger.firstChild;
                });

                // 鼠标悬停，停止自动播放
                if (cfg.pauseOnHover) {
                    Event.on(host.container, 'mouseenter', function() {
                        // 先停止未完成动画
                        stopAnim();

                        // 快速平滑回退到初始状态
                        var mask = masks[host.activeIndex];
                        if (fromStyle) {
                            anim = new Anim(mask, fromStyle, .2, 'easeOut').run();
                        } else {
                            DOM.attr(mask, STYLE, "");
                        }
                    });

                    Event.on(host.container, 'mouseleave', function() {
                        // 鼠标离开时立即停止未完成动画
                        stopAnim();
                        var index = host.activeIndex;

                        // 初始化动画参数，准备开始新一轮动画
                        // 设置初始样式
                        DOM.attr(masks[index], STYLE, fromStyle);

                        // 重新开始倒计时动画，缓冲下，避免快速滑动
                        animTimer = setTimeout(function() {
                            startAnim(index);
                        }, 200);
                    });
                }

                // panels 切换前，当前 trigger 完成善后工作以及下一 trigger 进行初始化
                host.on('beforeSwitch', function() {
                    // 恢复前，先结束未完成动画效果
                    stopAnim();

                    // 将当前 mask 恢复动画前状态
                    if (masks[host.activeIndex]) {
                        DOM.attr(masks[host.activeIndex], STYLE, fromStyle || "");
                    }
                });

                // panel 切换完成时，开始 trigger 的倒计时动画
                host.on('switch', function(ev) {
                    // 悬停状态，当用户主动触发切换时，不需要倒计时动画
                    if (!host.paused) {
                        startAnim(ev.currentIndex);
                    }
                });

                // 开始倒计时动画
                function startAnim(index) {
                    stopAnim(); // 开始之前，先确保停止掉之前的
                    anim = new Anim(masks[index],
                        toStyle, interval - 1).run(); // -1 是为了动画结束时停留一下，使得动画更自然
                }

                // 停止所有动画
                function stopAnim() {
                    if (animTimer) {
                        clearTimeout(animTimer);
                        animTimer = null;
                    }
                    if (anim) {
                        anim.stop();
                        anim = undefined;
                    }
                }

                /**
                 * 开始第一个倒计时
                 */
                if (host.activeIndex > -1) {
                    startAnim(host.activeIndex);
                }


            }
        });

    return Switchable;

}, { requires:["dom","event","anim","./base"]});
/**
 * 承玉：2011.06.02 review switchable
 *//**
 * Switchable Lazyload Plugin
 * @creator  玉伯<lifesinger@gmail.com>
 */
KISSY.add('switchable/lazyload', function(S, DOM, Switchable) {

    var EVENT_BEFORE_SWITCH = 'beforeSwitch',
        IMG_SRC = 'img',
        AREA_DATA = 'textarea',
        FLAGS = { };

    FLAGS[IMG_SRC] = 'data-ks-lazyload-custom';
    FLAGS[AREA_DATA] = 'ks-datalazyload-custom';

    /**
     * 添加默认配置
     */
    S.mix(Switchable.Config, {
            lazyDataType: AREA_DATA // or IMG_SRC
        });

    /**
     * 织入初始化函数
     */
    Switchable.Plugins.push({

            name: 'lazyload',

            init: function(host) {
                var DataLazyload = S.require("datalazyload"),
                    cfg = host.config,
                    type, flag;
                if (cfg.lazyDataType === 'img-src') cfg.lazyDataType = IMG_SRC;
                if (cfg.lazyDataType === 'area-data') cfg.lazyDataType = AREA_DATA;
                
                type = cfg.lazyDataType;
                flag = FLAGS[type];
                // 没有延迟项
                if (!DataLazyload || !type || !flag) {
                    return;
                }

                host.on(EVENT_BEFORE_SWITCH, loadLazyData);

                /**
                 * 加载延迟数据
                 */
                function loadLazyData(ev) {
                    var steps = cfg.steps,
                        from = ev.toIndex * steps ,
                        to = from + steps;

                    DataLazyload.loadCustomLazyData(host.panels.slice(from, to), type);
                    if (isAllDone()) {
                        host.detach(EVENT_BEFORE_SWITCH, loadLazyData);
                    }
                }

                /**
                 * 是否都已加载完成
                 */
                function isAllDone() {
                    var elems,
                        isImgSrc = type === IMG_SRC,
                        tagName = isImgSrc ? 'img' : (type === AREA_DATA ? 'textarea' : '');

                    if (tagName) {
                        elems = DOM.query(tagName, host.container);
                        for (var i = 0,len = elems.length; i < len; i++) {
                            var el = elems[i];
                            if (isImgSrc ?
                                DOM.attr(el, flag) :
                                DOM.hasClass(el, flag)) {
                                return false;
                            }
                        }
                    }
                    return true;
                }
            }
        });

    return Switchable;

}, { requires:["dom","./base"]});
/**
 * 承玉：2011.06.02 review switchable
 *//**
 * Tabs Widget
 * @creator  玉伯<lifesinger@gmail.com>
 */
KISSY.add('switchable/slide/base', function(S, Switchable) {



    /**
     * Slide Class
     * @constructor
     */
    function Slide(container, config) {

        var self = this;

        // factory or constructor
        if (!(self instanceof Slide)) {
            return new Slide(container, config);
        }

        Slide.superclass.constructor.apply(self, arguments);
    }

    Slide.Config={
        autoplay: true,
        circular: true
    };

    Slide.Plugins=[];

    S.extend(Slide, Switchable);

    return Slide;

}, { requires:["../base"]});

/**
 * 承玉：2011.06.02 review switchable
 */
/**
 * aria support for slide
 * @author yiminghe@gmail.com
 */
KISSY.add("switchable/slide/aria", function(S, DOM, Event, Aria, Slide) {

//    var KEY_PAGEUP = 33;
//    var KEY_PAGEDOWN = 34;
//    var KEY_END = 35;
//    var KEY_HOME = 36;

    var KEY_LEFT = 37;
    var KEY_UP = 38;
    var KEY_RIGHT = 39;
    var KEY_DOWN = 40;
    // var KEY_TAB = 9;

    // var KEY_SPACE = 32;
//    var KEY_BACKSPACE = 8;
//    var KEY_DELETE = 46;
    // var KEY_ENTER = 13;
//    var KEY_INSERT = 45;
//    var KEY_ESCAPE = 27;

    S.mix(Slide.Config, {
            aria:false
        });

    var DOM_EVENT = {originalEvent:{target:1}};

    var setTabIndex = Aria.setTabIndex;
    Slide.Plugins.push({
            name:"aria",
            init:function(self) {
                if (!self.config.aria) return;
                var triggers = self.triggers;
                var panels = self.panels;
                var i = 0;
                var activeIndex = self.activeIndex;
                S.each(triggers, function(t) {
                    setTabIndex(t, "-1");
                    i++;
                });
                i = 0;
                S.each(panels, function(p) {
                    setTabIndex(p, activeIndex == i ? "0" : "-1");
                    DOM.attr(p, "role", "option");
                    i++;
                });

                var content = self.content;

                DOM.attr(content, "role", "listbox");

                Event.on(content, "keydown", _contentKeydownProcess, self);

                setTabIndex(panels[0], 0);

                self.on("switch", function(ev) {
                    var index = ev.currentIndex,
                        domEvent = !!(ev.originalEvent.target || ev.originalEvent.srcElement),
                        last = self.completedIndex;

                    if (last > -1) {
                        setTabIndex(panels[last], -1);
                    }
                    setTabIndex(panels[index], 0);

                    //dom 触发的事件，自动聚焦
                    if (domEvent) {
                        panels[index].focus();
                    }
                });
            }
        });

    function _contentKeydownProcess(e) {
        var self = this,
            key = e.keyCode;
        switch (key) {

            case KEY_DOWN:
            case KEY_RIGHT:
                self.next(DOM_EVENT);
                e.halt();
                break;

            case KEY_UP:
            case KEY_LEFT:
                self.prev(DOM_EVENT);
                e.halt();
                break;
        }
    }

}, {
        requires:["dom","event","../aria",'./base']
    });
/**
 2011-05-12 承玉：add support for aria & keydown

 <h2>键盘操作</h2>
 <ul class="list">
 <li>tab 进入卡盘时，停止自动播放</li>
 <li>上/左键：当焦点位于卡盘时，切换到上一个 slide 面板</li>
 <li>下/右键：当焦点位于卡盘时，切换到下一个 slide 面板</li>
 <li>tab 离开卡盘时，开始自动播放</li>
 </ul>
 **//**
 * Tabs Widget
 * @creator  玉伯<lifesinger@gmail.com>
 */
KISSY.add('switchable/tabs/base', function(S, Switchable) {
    function Tabs(container, config) {
        var self = this;

        // factory or constructor
        if (!(self instanceof Tabs)) {
            return new Tabs(container, config);
        }

        Tabs.superclass.constructor.call(self, container, config);
        return 0;
    }

    S.extend(Tabs, Switchable);

    Tabs.Config = {};
    Tabs.Plugins = [];
    return Tabs;
}, {
    requires:["../base"]
});/**
 * Tabs aria support
 * @creator yiminghe@gmail.com
 */
KISSY.add('switchable/tabs/aria', function(S, DOM, Event, Switchable, Aria, Tabs) {

        var KEY_PAGEUP = 33;
        var KEY_PAGEDOWN = 34;
        var KEY_END = 35;
        var KEY_HOME = 36;

        var KEY_LEFT = 37;
        var KEY_UP = 38;
        var KEY_RIGHT = 39;
        var KEY_DOWN = 40;
        var KEY_TAB = 9;

//    var KEY_SPACE = 32;
//    var KEY_BACKSPACE = 8;
//    var KEY_DELETE = 46;
//    var KEY_ENTER = 13;
//    var KEY_INSERT = 45;
//    var KEY_ESCAPE = 27;

        S.mix(Tabs.Config, {
            aria:true
        });

        Tabs.Plugins.push({
            name:"aria",
            init:function(self) {
                if (!self.config.aria) return;
                var triggers = self.triggers,
                    activeIndex = self.activeIndex,
                    panels = self.panels;
                var container = self.container;
                if (self.nav) {
                    DOM.attr(self.nav, "role", "tablist");
                }
                var i = 0;
                S.each(triggers, function(trigger) {
                    trigger.setAttribute("role", "tab");
                    setTabIndex(trigger, activeIndex == i ? "0" : "-1");
                    if (!trigger.id) {
                        trigger.id = S.guid("ks-switchable");
                    }
                    i++;
                });
                i = 0;
                S.each(panels, function(panel) {
                    var t = triggers[i];
                    panel.setAttribute("role", "tabpanel");
                    panel.setAttribute("aria-hidden", activeIndex == i ? "false" : "true");
                    panel.setAttribute("aria-labelledby", t.id);
                    i++;
                });

                self.on("switch", _tabSwitch, self);


                Event.on(container, "keydown", _tabKeydown, self);
                /**
                 * prevent firefox native tab switch
                 */
                Event.on(container, "keypress", _tabKeypress, self);

            }
        });

        var setTabIndex = Aria.setTabIndex;


        function _currentTabFromEvent(t) {
            var triggers = this.triggers,
                trigger;
            S.each(triggers, function(ct) {
                if (ct == t || DOM.contains(ct, t)) {
                    trigger = ct;
                }
            });
            return trigger;
        }

        function _tabKeypress(e) {

            switch (e.keyCode) {

                case KEY_PAGEUP:
                case KEY_PAGEDOWN:
                    if (e.ctrlKey && !e.altKey && !e.shiftKey) {
                        e.halt();
                    } // endif
                    break;

                case KEY_TAB:
                    if (e.ctrlKey && !e.altKey) {
                        e.halt();
                    } // endif
                    break;

            }
        }

        var getDomEvent = Switchable.getDomEvent;

        /**
         * Keyboard commands for the Tab Panel
         * @param e
         */
        function _tabKeydown(e) {
            var t = e.target,self = this;
            var triggers = self.triggers;

            // Save information about a modifier key being pressed
            // May want to ignore keyboard events that include modifier keys
            var no_modifier_pressed_flag = !e.ctrlKey && !e.shiftKey && !e.altKey;
            var control_modifier_pressed_flag = e.ctrlKey && !e.shiftKey && !e.altKey;

            switch (e.keyCode) {

                case KEY_LEFT:
                case KEY_UP:
                    if (_currentTabFromEvent.call(self, t)
                    // 争渡读屏器阻止了上下左右键
                    //&& no_modifier_pressed_flag
                        ) {
                        self.prev(getDomEvent(e));
                        e.halt();
                    } // endif
                    break;

                case KEY_RIGHT:
                case KEY_DOWN:
                    if (_currentTabFromEvent.call(self, t)
                    //&& no_modifier_pressed_flag
                        ) {
                        self.next(getDomEvent(e));
                        e.halt();
                    } // endif
                    break;

                case KEY_PAGEDOWN:

                    if (control_modifier_pressed_flag) {
                        e.halt();
                        self.next(getDomEvent(e));
                    }
                    break;

                case KEY_PAGEUP:
                    if (control_modifier_pressed_flag) {
                        e.halt();
                        self.prev(getDomEvent(e));
                    }
                    break;

//            case KEY_HOME:
//                if (no_modifier_pressed_flag) {
//                    self.switchTo(0, undefined, getDomEvent(e));
//                    e.halt();
//                }
//                break;
//            case KEY_END:
//                if (no_modifier_pressed_flag) {
//                    self.switchTo(triggers.length - 1, undefined, getDomEvent(e));
//                    e.halt();
//                }
//
//                break;

                case KEY_TAB:
                    if (e.ctrlKey && !e.altKey) {
                        e.halt();
                        if (e.shiftKey)
                            self.prev(getDomEvent(e));
                        else
                            self.next(getDomEvent(e));
                    }
                    break;
            }
        }

        function _tabSwitch(ev) {
            var domEvent = !!(ev.originalEvent.target || ev.originalEvent.srcElement);

            var self = this;
            // 上一个激活 tab
            var lastActiveIndex = self.completedIndex;

            // 当前激活 tab
            var activeIndex = ev.currentIndex;

            if (lastActiveIndex == activeIndex) return;

            var lastTrigger = self.triggers[lastActiveIndex];
            var trigger = self.triggers[activeIndex];
            var lastPanel = self.panels[lastActiveIndex];
            var panel = self.panels[activeIndex];
            if (lastTrigger) {
                setTabIndex(lastTrigger, "-1");
            }
            setTabIndex(trigger, "0");

            // move focus to current trigger if invoked by dom event
            if (domEvent) {
                trigger.focus();
            }
            if (lastPanel) {
                lastPanel.setAttribute("aria-hidden", "true");
            }
            panel.setAttribute("aria-hidden", "false");
        }


    },
    {
        requires:["dom","event","../base","../aria","./base"]
    });

/**
 * 2011-05-08 承玉：add support for aria & keydown
 * <h2>键盘快捷键</h2>

 <ul class="list">
 <li>左/上键:当焦点在标签时转到上一个标签
 <li>右/下键:当焦点在标签时转到下一个标签
 <li>Home: 当焦点在标签时转到第一个标签 -- 去除
 输入框内 home 跳到输入框第一个字符前面 ，
 end 跳到输入框最后一个字符后面 ，
 不应该拦截
 <li>End: 当焦点在标签时转到最后一个标签 -- 去除
 <li>Control + PgUp and Control + Shift + Tab: 当然焦点在容器内时转到当前标签上一个标签
 <li>Control + PgDn and Control + Tab: 当然焦点在容器内时转到当前标签下一个标签
 </ul>
 */
KISSY.add("switchable", function(S, Switchable, Aria, Accordion, AAria, autoplay, autorender, Carousel, CAria, circular, countdown, effect, lazyload, Slide, SAria, Tabs, TAria) {
    S.Switchable = Switchable;
    var re = {
        Accordion:Accordion,
        Carousel:Carousel,
        Slide:Slide,
        Tabs:Tabs
    };
    S.mix(S, re);
    S.mix(Switchable, re);
    return Switchable;
}, {
    requires:[
        "switchable/base",
        "switchable/aria",
        "switchable/accordion/base",
        "switchable/accordion/aria",
        "switchable/autoplay",
        "switchable/autorender",
        "switchable/carousel/base",
        "switchable/carousel/aria",
        "switchable/circular",
        "switchable/countdown",
        "switchable/effect",
        "switchable/lazyload",
        "switchable/slide/base",
        "switchable/slide/aria",
        "switchable/tabs/base",
        "switchable/tabs/aria"
    ]
});
/*
Copyright 2011, KISSY UI Library v1.20dev
MIT Licensed
build time: Sep 22 13:54
*/
/**
 * KISSY Overlay
 * @author  承玉<yiminghe@gmail.com>,乔花<qiaohua@taobao.com>
 */
KISSY.add("overlay/overlayrender", function(S, UA, UIBase, Component) {

    function require(s) {
        return S.require("uibase/" + s);
    }

    return UIBase.create(Component.Render, [
        require("contentboxrender"),
        require("positionrender"),
        require("loadingrender"),
        UA['ie'] === 6 ? require("shimrender") : null,
        require("closerender"),
        require("maskrender")
    ]);
}, {
    requires: ["ua","uibase","component"]
});

/**
 * 2010-11-09 2010-11-10 承玉<yiminghe@gmail.com>重构，attribute-base-uibase-Overlay ，采用 UIBase.create
 */
/**
 * http://www.w3.org/TR/wai-aria-practices/#trap_focus
 * @author yiminghe@gmail.com
 */
KISSY.add("overlay/ariarender", function(S, Node) {

    var $ = Node.all;

    function Aria() {

    }

//    Aria.ATTRS={
//      aria:{
//          value:false
//      }
//    };


    var KEY_TAB = Node.KeyCodes.TAB;

    function _onKey(/*Normalized Event*/ evt) {

        var self = this,
            keyCode = evt.keyCode,
            firstFocusItem = self.get("el");
        if (keyCode != KEY_TAB) {
            return;
        }
        // summary:
        // Handles the keyboard events for accessibility reasons

        var node = $(evt.target); // get the target node of the keypress event

        // find the first and last tab focusable items in the hierarchy of the dialog container node
        // do this every time if the items may be added / removed from the the dialog may change visibility or state

        var lastFocusItem = self.__ariaArchor;

        // assumes firstFocusItem and lastFocusItem maintained by dialog object

        // see if we are shift-tabbing from first focusable item on dialog
        if (node.equals(firstFocusItem) && evt.shiftKey) {
            lastFocusItem[0].focus(); // send focus to last item in dialog
            evt.halt(); //stop the tab keypress event
        }
        // see if we are tabbing from the last focusable item
        else if (node.equals(lastFocusItem) && !evt.shiftKey) {
            firstFocusItem[0].focus(); // send focus to first item in dialog
            evt.halt(); //stop the tab keypress event
        }
        else {
            // see if the key is for the dialog
            if (node.equals(firstFocusItem) ||
                firstFocusItem.contains(node)) {
                return;
            }
        }
        // this key is for the document window
        // allow tabbing into the dialog
        evt.halt();//stop the event if not a tab keypress
    } // end of function


    Aria.prototype = {

        __renderUI:function() {
            var self = this,
                el = self.get("el"),
                header = self.get("header");
            if (self.get("aria")) {
                el.attr("role", "dialog");
                el.attr("tabindex", 0);
                if (!header.attr("id")) {
                    header.attr("id", S.guid("ks-dialog-header"));
                }
                el.attr("aria-labelledby", header.attr("id"));
                // 哨兵元素，从这里 tab 出去到弹窗根节点
                // 从根节点 shift tab 出去到这里
                self.__ariaArchor = $("<div tabindex='0'></div>").appendTo(el);
            }
        },

        __bindUI:function() {

            var self = this;
            if (self.get("aria")) {
                var el = self.get("el"),
                    lastActive;
                self.on("afterVisibleChange", function(ev) {
                    if (ev.newVal) {
                        lastActive = document.activeElement;
                        el[0].focus();
                        el.attr("aria-hidden", "false");
                        el.on("keydown", _onKey, self);
                    } else {
                        el.attr("aria-hidden", "true");
                        el.detach("keydown", _onKey, self);
                        lastActive && lastActive.focus();
                    }
                });
            }
        }
    };

    return Aria;
}, {
    requires:["node"]
});/**
 * http://www.w3.org/TR/wai-aria-practices/#trap_focus
 * @author yiminghe@gmail.com
 */
KISSY.add("overlay/aria", function(S,Event) {
    function Aria() {
    }

    Aria.ATTRS = {
        aria:{
            view:true
        }
    };

    Aria.prototype = {

        __bindUI:function() {
            var self = this,el = self.get("el");
            if (self.get("aria")) {
                el.on("keydown", function(e) {
                    if (e.keyCode === Event.KeyCodes.ESC) {
                        self.hide();
                        e.halt();
                    }
                });
            }
        }
    };
    return Aria;
},{
    requires:['event']
});/**
 * effect applied when overlay shows or hides
 * @author yiminghe@gmail.com
 */
KISSY.add("overlay/effect", function(S) {
    var NONE = 'none',DURATION = 0.5;
    var effects = {fade:["Out","In"],slide:["Up","Down"]};

    function Effect() {
    }

    Effect.ATTRS = {
        effect:{
            value:{
                effect:NONE,
                duration:DURATION,
                easing:'easeOut'
            },
            setter:function(v) {
                var effect = v.effect;
                if (S.isString(effect) && !effects[effect]) {
                    v.effect = NONE;
                }
            }

        }
    };

    Effect.prototype = {

        __bindUI:function() {
            var self = this;
            self.on("afterVisibleChange", function(ev) {
                var effect = self.get("effect").effect;
                if (effect == NONE) {
                    return;
                }
                var v = ev.newVal,
                    el = self.get("el");
                el.stop(true);
                el.css("visibility", "visible");
                var m = effect + effects[effect][Number(v)];
                el[m](self.get("effect").duration, function() {
                    el.css("display", "block");
                    el.css("visibility", v ? "visible" : "hidden");
                }, self.get("effect").easing, false);

            });
        }
    };

    return Effect;
}, {
    requires:['anim']
});/**
 * model and control for overlay
 * @author yiminghe@gmail.com
 */
KISSY.add("overlay/overlay", function(S, UIBase, Component, OverlayRender, Effect) {
    function require(s) {
        return S.require("uibase/" + s);
    }

    var Overlay = UIBase.create(Component.ModelControl, [
        require("contentbox"),
        require("position"),
        require("loading"),
        require("align"),
        require("close"),
        require("resize"),
        require("mask"),
        Effect
    ], {}, {
        ATTRS:{
            // 是否支持焦点处理
            focusable:{
                value:false
            },
            closable:{
                // overlay 默认没 X
                value:false
            },
            // 是否绑定鼠标事件
            handleMouseEvents:{
                value:false
            },
            allowTextSelection_:{
                value:true
            },
            visibleMode:{
                value:"visibility"
            }
        }
    });

    Overlay.DefaultRender = OverlayRender;


    Component.UIStore.setUIByClass("overlay", {
        priority:Component.UIStore.PRIORITY.LEVEL1,
        ui:Overlay
    });

    return Overlay;
}, {
    requires:['uibase','component','./overlayrender','./effect']
});/**
 * render for dialog
 * @author yiminghe@gmail.com
 */
KISSY.add("overlay/dialogrender", function(S, UIBase, OverlayRender, AriaRender) {
    function require(s) {
        return S.require("uibase/" + s);
    }

    return UIBase.create(OverlayRender, [
        require("stdmodrender"),
        AriaRender
    ]);
}, {
    requires:['uibase','./overlayrender','./ariarender']
});/**
 * KISSY.Dialog
 * @author  承玉<yiminghe@gmail.com>, 乔花<qiaohua@taobao.com>
 */
KISSY.add('overlay/dialog', function(S, Component, Overlay, UIBase, DialogRender, Aria) {

    function require(s) {
        return S.require("uibase/" + s);
    }

    var Dialog = UIBase.create(Overlay, [
        require("stdmod"),
        require("drag"),
        require("constrain"),
        Aria
    ], {
        renderUI:function() {
            var self = this;
            //设置值，drag-ext 绑定时用到
            self.set("handlers", [self.get("header")]);
        }
    }, {
        ATTRS:{
            closable:{
                value:true
            }
        }
    });

    Dialog.DefaultRender = DialogRender;

    Component.UIStore.setUIByClass("dialog", {
        priority:Component.UIStore.PRIORITY.LEVEL2,
        ui:Dialog
    });

    return Dialog;

}, {
    requires:[ "component","overlay/overlay","uibase",'overlay/dialogrender','./aria']
});

/**
 * 2010-11-10 承玉<yiminghe@gmail.com>重构，使用扩展类
 */



/**
 * KISSY.Popup
 * @author  乔花<qiaohua@taobao.com> , 承玉<yiminghe@gmail.com>
 */
KISSY.add('overlay/popup', function(S, Component, Overlay, undefined) {

    var POPUP_DELAY = 100;

    function Popup(container, config) {
        var self = this;

        // 支持 Popup(config)
        if (S.isUndefined(config)) {
            config = container;
        } else {
            config.srcNode = container;
        }

        Popup.superclass.constructor.call(self, config);
    }

    Popup.ATTRS = {
        trigger: {
            setter:function(v) {
                return S.one(v);
            }
        },          // 触发器
        triggerType: {value:'click'}    // 触发类型
    };

    S.extend(Popup, Overlay, {
        initializer: function() {
            var self = this;
            // 获取相关联的 DOM 节点
            var trigger = self.get("trigger");
            if (trigger) {
                if (self.get("triggerType") === 'mouse') {
                    self._bindTriggerMouse();

                    self.on('bindUI', function() {
                        self._bindContainerMouse();
                    });
                } else {
                    self._bindTriggerClick();
                }
            }
        },

        _bindTriggerMouse: function() {
            var self = this,
                trigger = self.get("trigger"),
                timer;

            self.__mouseEnterPopup = function() {
                self._clearHiddenTimer();

                timer = S.later(function() {
                    self.show();
                    timer = undefined;
                }, POPUP_DELAY);
            };

            trigger.on('mouseenter', self.__mouseEnterPopup);


            self._mouseLeavePopup = function() {
                if (timer) {
                    timer.cancel();
                    timer = undefined;
                }

                self._setHiddenTimer();
            };

            trigger.on('mouseleave', self._mouseLeavePopup);
        },

        _bindContainerMouse: function() {
            var self = this;

            self.get('el').on('mouseleave', self._setHiddenTimer, self)
                .on('mouseenter', self._clearHiddenTimer, self);
        },

        _setHiddenTimer: function() {
            var self = this;
            self._hiddenTimer = S.later(function() {
                self.hide();
            }, POPUP_DELAY);
        },

        _clearHiddenTimer: function() {
            var self = this;
            if (self._hiddenTimer) {
                self._hiddenTimer.cancel();
                self._hiddenTimer = undefined;
            }
        },

        _bindTriggerClick: function() {
            var self = this;
            self.__clickPopup = function(e) {
                e.halt();
                self.show();
            };
            self.get("trigger").on('click', self.__clickPopup);
        },

        destructor:function() {
            var self = this;
            var t = self.get("trigger");
            if (t) {
                if (self.__clickPopup) {
                    t.detach('click', self.__clickPopup);
                }
                if (self.__mouseEnterPopup) {
                    t.detach('mouseenter', self.__mouseEnterPopup);
                }

                if (self._mouseLeavePopup) {
                    t.detach('mouseleave', self._mouseLeavePopup);
                }
            }
            if (self.get('el')) {
                self.get('el').detach('mouseleave', self._setHiddenTimer, self)
                    .detach('mouseenter', self._clearHiddenTimer, self);
            }
        }
    });


    Component.UIStore.setUIByClass("popup", {
        priority:Component.UIStore.PRIORITY.LEVEL1,
        ui:Popup
    });

    return Popup;
}, {
    requires:[ "component","./overlay"]
});

/**
 * 2011-05-17
 *  - 承玉：利用 initializer , destructor ,ATTRS
 **/KISSY.add("overlay", function(S, O, OR, D, DR, P) {
    O.Render = OR;
    D.Render = DR;
    O.Dialog = D;
    S.Overlay = O;
    S.Dialog = D;
    O.Popup = S.Popup = P;

    return O;
}, {
    requires:["overlay/overlay","overlay/overlayrender","overlay/dialog","overlay/dialogrender", "overlay/popup"]
});
/*
Copyright 2011, KISSY UI Library v1.20dev
MIT Licensed
build time: Sep 22 13:54
*/
KISSY.add("suggest", function(S, Sug) {
    S.Suggest = Sug;
    return Sug;
}, {
    requires:["suggest/base"]
});/**
 * 提示补全组件
 * @module   suggest
 * @creator  玉伯<lifesinger@gmail.com>
 */
KISSY.add('suggest/base', function(S, DOM, Event, UA, undefined) {

    var win = window,
        EventTarget = Event.Target,
        doc = document, bd, head = DOM.get('head'),
        ie = UA['ie'],
        ie6 = (ie === 6),
        ie9 = (ie >= 9),

        CALLBACK_FN = 'KISSY.Suggest.callback', // 约定的全局回调函数
        PREFIX = 'ks-suggest-',
        STYLE_ID = PREFIX + 'style', // 样式 style 元素的 id

        CONTAINER_CLS = PREFIX + 'container',
        KEY_EL_CLS = PREFIX + 'key',
        RESULT_EL_CLS = PREFIX + 'result',
        SELECTED_ITEM_CLS = 'ks-selected', // 选中项
        ODD_ITEM_CLS = 'ks-odd', // 奇数项
        EVEN_ITEM_CLS = 'ks-even', // 偶数项
        CONTENT_CLS = PREFIX + 'content',
        FOOTER_CLS = PREFIX + 'footer',
        CLOSE_BTN_CLS = PREFIX + 'closebtn',
        SHIM_CLS = PREFIX + 'shim', // iframe shim 的 class

        EVENT_BEFORE_START = 'beforeStart', // 监控计时器开始前触发，可以用来做条件触发
        EVENT_ITEM_SELECT = 'itemSelect', // 选中某项时触发，可以用来添加监控埋点等参数
        EVENT_BEFORE_SUBMIT = 'beforeSubmit', // 表单提交前触发，可以用来取消提交或添加特定参数
        EVENT_BEFORE_DATA_REQUEST = 'beforeDataRequest', // 请求数据前触发，可以用来动态修改请求 url 和参数
        EVENT_DATA_RETURN = 'dataReturn', // 获得返回数据时触发，可以用来动态修正数据
        EVENT_UPDATE_FOOTER = 'updateFooter', // 更新底部内容时触发，可以用来动态添加自定义内容
        EVENT_BEFORE_SHOW = 'beforeShow', // 显示提示层前触发，可以用来动态修改提示层数据

        TIMER_DELAY = 200,
        EMPTY = '', HIDDEN = 'hidden',
        DISPLAY = 'display', NONE = 'none',
        LI = 'LI', li = 'li', DIV = '<div>',
        RESULT = 'result', KEY = 'key',
        DATA_TIME = 'data-time',
        PARSEINT = parseInt,
        RE_FOCUS_ELEMS = /^(?:input|button|a)$/i,

        /**
         * Suggest 的默认配置
         */
            defaultConfig = {
            /**
             * 用户附加给悬浮提示层的 class
             *
             * 提示层的默认结构如下：
             * <div class='ks-suggest-container {containerCls}'>
             *     <ol class="ks-suggest-content">
             *         <li>
             *             <span class='ks-suggest-key'>...</span>
             *             <span class='ks-suggest-result'>...</span>
             *         </li>
             *     </ol>
             *     <div class='ks-suggest-footer'>
             *         <a class='ks-suggest-close-btn'>...</a>
             *     </div>
             * </div>
             * @type String
             */
            containerCls: EMPTY,

            /**
             * 提示层的宽度
             * 注意：默认情况下，提示层的宽度和input输入框的宽度保持一致
             * 示范取值：'200px', '10%' 等，必须带单位
             * @type String
             */
            //containerWidth: EMPTY,

            /**
             * result 的格式
             * @type String
             */
            resultFormat: '%result%',

            /**
             * 是否显示关闭按钮
             * @type Boolean
             */
            //closeBtn: false,

            /**
             * 关闭按钮上的文字
             * @type String
             */
            closeBtnText: '关闭',

            /**
             * 是否需要 iframe shim 默认只在 ie6 下显示
             * @type Boolean
             */
            shim: ie6,

            /**
             * 初始化后，自动激活
             * @type Boolean
             */
            //autoFocus: false,

            /**
             * 选择某项时，是否自动提交表单
             * @type Boolean
             */
            submitOnSelect: true,

            /**
             * 提示悬浮层和输入框的垂直偏离
             * 默认向上偏差 1px, 使得悬浮层刚好覆盖输入框的下边框
             * @type Boolean
             */
            offset: -1,

            /**
             * 数据接口返回数据的编码
             */
            charset: 'utf-8',

            /**
             * 回调函数的参数名
             */
            callbackName: 'callback',

            /**
             * 回调函数的函数名
             */
            callbackFn: CALLBACK_FN,

            /**
             * 查询的参数名
             */
            queryName: 'q',

            /**
             * @type Number 数据源标志, 默认为 0 , 可取 0, 1, 2
             * - 0: 数据来自远程, 且请求回来后存入 _dataCache
             * - 1: 数据来自远程, 且不存入 _dataCache, 每次请求的数据是否需要缓存, 防止在公用同一个 suggest , 但数据源不一样时, 出现相同内容
             * - 2: 数据来自静态, 不存在时, 不显示提示浮层
             */
            dataType: 0
            /**
             * 提示层内容渲染器
             * @param {Object} data 请求返回的数据
             * @return {HTMLElement | String} 渲染的内容,可选项要求由"li"标签包裹，并将用于表单提交的值存储在"li"元素的key属性上
             */
            //contentRender:null
        };

    /**
     * 提示补全组件
     * @class Suggest
     * @constructor
     * @param {String|HTMLElement} textInput
     * @param {String} dataSource
     * @param {Object} config
     */
    function Suggest(textInput, dataSource, config) {
        var self = this, cbFn;

        // allow instantiation without the new operator
        if (!(self instanceof Suggest)) {
            return new Suggest(textInput, dataSource, config);
        }

        /**
         * 文本输入框
         * @type HTMLElement
         */
        self.textInput = DOM.get(textInput);

        /**
         * 配置参数
         * @type Object
         */
        self.config = config = S.merge(defaultConfig, config);

        /**
         * 获取数据的 URL, 或是静态数据
         * @type {String|Object}
         */
        if (S.isString(dataSource)) {
            // 归一化为：http://path/to/suggest.do? or http://path/to/suggest.do?p=1&
            dataSource += (dataSource.indexOf('?') === -1) ? '?' : '&';
            self.dataSource = dataSource + config.callbackName + '=' + (cbFn = config.callbackFn);
            if (config.dataType === 2) self.config.dataType = 0;

            // 回调函数名不是默认值时，需要指向默认回调函数
            if (cbFn !== CALLBACK_FN) initCallback(cbFn);
        }
        // 如果就是一个数据源对象, 强制使用 dataSource
        else {
            self.dataSource = dataSource;
            self.config.dataType = 2;
        }


        /**
         * 通过 jsonp 返回的数据
         * @type Object
         */
        //self.returnedData = undefined;

        /**
         * 存放提示信息的容器
         * @type HTMLElement
         */
        //self.container = undefined;
        //self.content = undefined;
        //self.footer = undefined;

        /**
         * 输入框的值
         * @type String
         */
        self.query = EMPTY;

        /**
         * 获取数据时的参数
         * @type String
         */
        self.queryParams = EMPTY;

        /**
         * 内部定时器
         * @private
         * @type Object
         */
        //self._timer = undefined;

        /**
         * 计时器是否处于运行状态
         * @private
         * @type Boolean
         */
        //self._isRunning = false;

        /**
         * 获取数据的 script 元素
         * @type HTMLElement
         */
        //self.dataScript = undefined;

        /**
         * 数据缓存
         * @private
         * @type Object
         */
        self._dataCache = { };

        /**
         * 最新 script 的时间戳
         * @type String
         */
        //self._latestScriptTime = EMPTY;

        /**
         * script返回的数据是否已经过期
         * @type Boolean
         */
        //self._scriptDataIsOut = false;

        /**
         * 提示层的当前选中项
         * @type Boolean
         */
        //self.selectedItem = undefined;

        /**
         * 焦点是否在提示层
         */
        //self._focusing = false;

        // init
        self._init();
        return 0;
    }

    S.augment(Suggest, EventTarget, {

        /**
         * 初始化方法
         * @protected
         */
        _init: function() {
            var self = this;
            bd = doc.body;

            self._initTextInput();
            self._initContainer();
            if (self.config.shim) self._initShim();

            self._initStyle();
            self._initEvent();
        },

        /**
         * 初始化输入框
         */
        _initTextInput: function() {
            var self = this,
                input = self.textInput,
                isDowningOrUping = false, // 是否持续按住 DOWN / UP 键
                pressingCount = 0; // 持续按住某键时，连续触发的 keydown 次数。注意 Opera 只会触发一次

            DOM.attr(input, 'autocomplete', 'off');
            if (self.config['autoFocus']) input.focus();

            // 监控 keydown 事件
            // 注：截至 2010/08/03, 在 Opera 10.60 中，输入法开启时，依旧不会触发任何键盘事件
            Event.on(input, 'keydown', function(ev) {
                var keyCode = ev.keyCode;
                //S.log('keydown ' + keyCode);

                // home end 空阻止
                if (keyCode == 35 || keyCode == 36) {
                    if (!input.value) {
                        ev.halt();
                        return;
                    }
                }

                // ESC 键，隐藏提示层并还原初始输入
                if (keyCode === 27) {
                    self.hide();
                    input.value = self.query;
                }
                // 方向键，包括 PgUp, PgDn, End, Home, Left, Up, Right, Down
                else if (keyCode > 32 && keyCode < 41) {
                    // 如果输入框无值，按下以上键时，将响应转移到页面上，以避免自动定焦导致的键盘导航问题
                    if (!input.value) {
                        input.blur();
                    }
                    // DOWN / UP 键
                    else if (keyCode === 40 || keyCode === 38) {
                        // 按住键不动时，延时处理。这样可以使操作看起来更自然，避免太快导致的体验不好
                        if (pressingCount++ === 0) {
                            if (self._isRunning) self.stop();
                            isDowningOrUping = true;
                            self._selectItem(keyCode === 40);
                        }
                        else if (pressingCount == 3) {
                            pressingCount = 0;
                        }
                        // webkit 内核下，input 中按 UP 键，默认会导致光标定位到最前
                        ev.preventDefault();
                    }
                }
                // ENTER 键
                else if (keyCode === 13) {
                    // 提交表单前，先隐藏提示层并停止计时器
                    input.blur(); // 这一句还可以阻止掉浏览器的默认提交事件

                    // 如果是键盘选中某项后回车，触发 onItemSelect 事件
                    if (isDowningOrUping) {
                        if (input.value == self._getSelectedItemKey()) { // 确保值匹配
                            if (self.fire(EVENT_ITEM_SELECT) === false) return;
                        }
                    }

                    // 提交表单
                    self._submitForm();
                }
                // 非以上控制键，开启计时器
                else {
                    if (!self._isRunning) {
                        // 1. 当网速较慢，suggest.js 还未下载和初始化完时，用户可能就已经开始输入
                        //    这时，focus 事件已经不会触发，需要在 keydown 里触发定时器
                        // 2. 非 DOWN/UP 等控制键时，需要激活定时器
                        self.start();
                    }
                    isDowningOrUping = false;
                }

                /*
                 * fix 防止 chrome 下 键盘按键移动选中项后, 仍然触发 mousemove 事件
                 */
                if (UA['chrome']) {
                    // 标志按键状态, 延迟后, 恢复没有按键
                    if (self._keyTimer) self._keyTimer.cancel();
                    self._keyTimer = S.later(function() {
                        self._keyTimer = undefined;
                    }, 500);
                }
            });

            // reset pressingCount
            Event.on(input, 'keyup', function() {
                pressingCount = 0;
            });

            // 失去焦点时，停止计时器，并隐藏提示层
            Event.on(input, 'blur', function() {
                self.stop();

                // 点击提示层中的 input 输入框时，首先会输发这里的 blur 事件，之后才是 focusin
                // 因此需要 setTimeout 一下，更换顺序
                S.later(function() {
                    if (!self._focusing) { // 焦点在提示层时，不关闭
                        self.hide();
                    }
                }, 0);
            });
        },

        /**
         * 初始化提示层容器
         */
        _initContainer: function() {
            var self = this,
                extraCls = self.config.containerCls,
                container = DOM.create(DIV, {
                    'class': CONTAINER_CLS + (extraCls ? ' ' + extraCls : EMPTY),
                    style: 'position:absolute;visibility:hidden'
                }),
                content = DOM.create(DIV, {
                    'class': CONTENT_CLS
                }),
                footer = DOM.create(DIV, {
                    'class': FOOTER_CLS
                });

            container.appendChild(content);
            container.appendChild(footer);
            bd.insertBefore(container, bd.firstChild);

            self.container = container;
            self.content = content;
            self.footer = footer;

            self._initContainerEvent();
        },

        /**
         * 设置容器的 left, top, width
         */
        _setContainerRegion: function() {
            var self = this, config = self.config,
                input = self.textInput,
                p = DOM.offset(input),
                container = self.container;

            DOM.offset(container, {
                left: p.left,
                top: p.top + input.offsetHeight + config.offset
            });

            // 默认 container 的边框为 1, padding 为 0, 因此 width = offsetWidth - 2
            DOM.width(container, config['containerWidth'] || input.offsetWidth - 2);
        },

        /**
         * 初始化容器事件
         */
        _initContainerEvent: function() {
            var self = this,
                input = self.textInput,
                container = self.container,
                content = self.content,
                footer = self.footer,
                mouseDownItem, mouseLeaveFooter;

            Event.on(content, 'mousemove', function(ev) {
                if (self._keyTimer) return;

                var target = ev.target;

                if (target.nodeName !== LI) {
                    target = DOM.parent(target, li);
                }

                if (DOM.contains(content, target)) {
                    if (target !== self.selectedItem) {
                        // 移除老的
                        self._removeSelectedItem();
                        // 设置新的
                        self._setSelectedItem(target);
                    }
                }
            });

            Event.on(content, 'mousedown', function(ev) {
                var target = ev.target;

                // 可能点击在 li 的子元素上
                if (target.nodeName !== LI) {
                    target = DOM.parent(target, li);
                }
                mouseDownItem = target;
            });

            // 鼠标按下时，让输入框不会失去焦点
            Event.on(container, 'mousedown', function(ev) {
                if (!RE_FOCUS_ELEMS.test(ev.target.nodeName)) { // footer 区域的 input 等元素不阻止
                    // 1. for IE
                    input.onbeforedeactivate = function() {
                        win.event.returnValue = false;
                        input.onbeforedeactivate = null;
                    };
                    // 2. for W3C
                    ev.preventDefault();
                }
            });

            Event.on(content, 'mouseup', function(ev) {
                var target = ev.target;
                if (ev.which > 2) return; // 非左键和中键点击

                // 可能点击在 li 的子元素上
                if (target.nodeName !== LI) {
                    target = DOM.parent(target, li);
                }

                // 在提示层 A 项处按下鼠标，移动到 B 处释放，不触发 onItemSelect
                if (target != mouseDownItem) return;

                // 必须点击在 content 内部的 li 上
                if (DOM.contains(content, target)) {
                    self._updateInputFromSelectItem(target);

                    // 触发选中事件
                    if (self.fire(EVENT_ITEM_SELECT) === false) return;

                    // 提交表单前，先隐藏提示层并停止计时器
                    try {
                        input.blur();
                    } catch(e) {
                    }

                    // 提交表单
                    self._submitForm();
                }
            });

            // footer 获取到焦点，比如同店购的输入框
            Event.on(footer, 'focusin', function() {
                self._focusing = true;
                self._removeSelectedItem();
                mouseLeaveFooter = false; // 在这里还原为 false 即可
            });

            Event.on(footer, 'focusout', function() {
                self._focusing = false;

                // 如果立刻 focus textInput 的话，无法从 footer 的一个输入框切换到另一个
                // 因此需要等待另一个输入框 focusin 触发后，再执行下面的逻辑
                S.later(function() {
                    // 鼠标已移开 footer 区域
                    if (mouseLeaveFooter) {
                        self.hide();
                    }
                    // 不是转移到另一个输入框，而是在 footer 非输入框处点击
                    else if (!self._focusing) {
                        self.textInput.focus();
                    }
                }, 0);
            });

            // 使得在 footer 的输入框获取焦点后，点击提示层外面，能关闭提示层
            Event.on(self.container, 'mouseleave', function() {
                mouseLeaveFooter = true;
            });

            // 点击在关闭按钮上
            Event.on(footer, 'click', function(ev) {
                if (DOM.hasClass(ev.target, CLOSE_BTN_CLS)) {
                    self.hide();
                }
            })
        },

        /**
         * click 选择 or enter 后，提交表单
         */
        _submitForm: function() {
            var self = this;

            // 注：对于键盘控制 enter 选择的情况，由 html 自身决定是否提交。否则会导致某些输入法下，用 enter 选择英文时也触发提交
            if (self.config.submitOnSelect) {
                var form = self.textInput.form;
                if (!form) return;

                if (self.fire(EVENT_BEFORE_SUBMIT, { form: form }) === false) return;

                // 通过 js 提交表单时，不会触发 onsubmit 事件
                // 需要 js 自己触发
                // 这里触发的目的是，使得其它脚本中给 form 注册的 onsubmit 事件可以正常触发
                if (doc.createEvent) { // w3c
                    var evObj = doc.createEvent('MouseEvents');
                    evObj.initEvent('submit', true, false);
                    form.dispatchEvent(evObj);
                }
                else if (doc.createEventObject) { // ie
                    form.fireEvent('onsubmit');
                }

                form.submit();
            }
        },

        /**
         * 给容器添加 iframe shim 层
         */
        _initShim: function() {
            var iframe = DOM.create('<iframe>', {
                src: 'about:blank',
                'class': SHIM_CLS,
                style: 'position:absolute;visibility:hidden;border:none'
            });
            this.container.shim = iframe;

            bd.insertBefore(iframe, bd.firstChild);
        },

        /**
         * 设置 shim 的 left, top, width, height
         */
        _setShimRegion: function() {
            var self = this, container = self.container,
                style = container.style, shim = container.shim;
            if (shim) {
                //S.log([PARSEINT(style.left) - 2, style.top, PARSEINT(style.width) + 2, DOM.height(container)-2]);
                DOM.css(shim, {
                    left: PARSEINT(style.left) - 2, // -2 可以解决吞边线的 bug
                    top: style.top,
                    width: PARSEINT(style.width) + 2,
                    height: DOM.height(container) - 2
                });
            }
        },

        /**
         * 初始化样式
         */
        _initStyle: function() {
            var styleEl = DOM.get('#' + STYLE_ID);
            if (styleEl) return; // 防止多个实例时重复添加

            DOM.addStyleSheet(
                '.ks-suggest-container{background:white;border:1px solid #999;z-index:99999}'
                    + '.ks-suggest-shim{z-index:99998}'
                    + '.ks-suggest-container li{color:#404040;padding:1px 0 2px;font-size:12px;line-height:18px;float:left;width:100%}'
                    + '.ks-suggest-container .ks-selected{background-color:#39F;cursor:default}'
                    + '.ks-suggest-key{float:left;text-align:left;padding-left:5px}'
                    + '.ks-suggest-result{float:right;text-align:right;padding-right:5px;color:green}'
                    + '.ks-suggest-container .ks-selected span{color:#FFF;cursor:default}'
                    + '.ks-suggest-footer{padding:0 5px 5px}'
                    + '.ks-suggest-closebtn{float:right}'
                    + '.ks-suggest-container li,.ks-suggest-footer{overflow:hidden;zoom:1;clear:both}'
                    /* hacks */
                    + '.ks-suggest-container{*margin-left:2px;_margin-left:-2px;_margin-top:-3px}',
                STYLE_ID);
        },

        /**
         * 初始化事件
         */
        _initEvent: function() {
            var self = this;

            // onresize 时，调整提示层的位置
            Event.on(win, 'resize', function() {
                self._setContainerRegion();
                self._setShimRegion();
                // 2010-08-04: 为了保持连贯，取消了定时器
            });
        },

        /**
         * 启动计时器，开始监听用户输入
         */
        start: function() {
            var self = this;
            if (self.fire(EVENT_BEFORE_START) === false) return;

            Suggest.focusInstance = self;

            self._timer = S.later(function() {
                self._updateContent();
                self._timer = S.later(arguments.callee, TIMER_DELAY);
            }, TIMER_DELAY);

            self._isRunning = true;
        },

        /**
         * 停止计时器
         */
        stop: function() {
            var self = this;

            Suggest.focusInstance = undefined;
            if (self._timer) self._timer.cancel();
            self._isRunning = false;
        },

        /**
         * 显示提示层
         */
        show: function() {
            var self = this;
            if (self.isVisible()) return;
            var container = self.container, shim = container.shim;

            // 每次显示前，都重新计算位置，这样能自适应 input 的变化（牺牲少量性能，满足更普适的需求）
            self._setContainerRegion();
            visible(container);

            if (shim) {
                self._setShimRegion();
                visible(shim);
            }
        },

        /**
         * 隐藏提示层
         */
        hide: function() {
            if (!this.isVisible()) return;
            var container = this.container, shim = container.shim;

            if (shim) invisible(shim);
            invisible(container);
        },

        /**
         * 提示层是否显示
         */
        isVisible: function() {
            return this.container.style.visibility != HIDDEN;
        },

        /**
         * 更新提示层的数据
         */
        _updateContent: function() {
            var self = this, input = self.textInput, q;

            // 检测是否需要更新。注意：加入空格也算有变化
            if (input.value == self.query) return;
            q = self.query = input.value;

            // 1. 输入为空时，隐藏提示层
            if (!S.trim(q)) {
                self._fillContainer();
                self.hide();
                return;
            }

            switch (self.config.dataType) {
                case 0:
                    if (self._dataCache[q] !== undefined) { // 1. 如果设置需要缓存标志 且已经有缓存数据时, 使用缓存中的
                        S.log('use cache');
                        self._fillContainer(self._dataCache[q]);
                        self._displayContainer();
                    } else { // 2. 请求服务器数据
                        S.log('no cache, data from server');
                        self._requestData();
                    }
                    break;
                case 1:
                    S.log('no cache, data always from server');
                    self._requestData();
                    break;
                case 2:
                    S.log('use static datasource');
                    self._handleResponse(self.dataSource[q]);
                    break;
            }
        },

        /**
         * 通过 script 元素异步加载数据
         */
        _requestData: function() {
            var self = this, config = self.config, script;
            //S.log('request data via script');

            if (!ie || ie9) self.dataScript = undefined; // IE不需要重新创建 script 元素

            if (!self.dataScript) {
                script = doc.createElement('script');
                script.charset = config.charset;
                script.async = true;

                head.insertBefore(script, head.firstChild);
                self.dataScript = script;

                if (!ie || ie9) {
                    var t = S.now();
                    self._latestScriptTime = t;
                    DOM.attr(script, DATA_TIME, t);

                    Event.on(script, 'load', function() {
                        // 判断返回的数据是否已经过期
                        self._scriptDataIsOut = DOM.attr(script, DATA_TIME) != self._latestScriptTime;
                    });
                }
            }

            self.queryParams = config.queryName + '=' + encodeURIComponent(self.query);
            if (self.fire(EVENT_BEFORE_DATA_REQUEST) === false) return;

            // 注意：没必要加时间戳，是否缓存由服务器返回的Header头控制
            self.dataScript.src = self.dataSource + '&' + self.queryParams;
        },

        /**
         * 处理获取的数据
         * @param {Object} data
         */
        _handleResponse: function(data) {
            var self = this, formattedData,
                content = EMPTY, i, len, list, li, key, itemData;
            //S.log('handle response');

            if (self._scriptDataIsOut) return; // 抛弃过期数据，否则会导致 bug：1. 缓存 key 值不对； 2. 过期数据导致的闪屏

            self.returnedData = data;
            if (self.fire(EVENT_DATA_RETURN, { data: data }) === false) return;

            //渲染内容
            if (!self.config.contentRenderer) {
                content = self._renderContent(data);
            } else {
                content = self.config.contentRenderer(data);
            }

            self._fillContainer(content);

            // fire event
            // 实际上是 beforeCache，但从用户的角度看，是 beforeShow
            // 这样可以保证重复内容不用重新生成，直接用缓存
            if (self.fire(EVENT_BEFORE_SHOW) === false) return;

            // cache
            if (!self.config.dataType) self._dataCache[self.query] = DOM.html(self.content);

            // 显示容器
            self._displayContainer();
        },
        /**
         * 渲染内容
         */
        _renderContent:function(data) {
            var self = this, formattedData,
                content = EMPTY, i, len, list, li, key, itemData;


            // 格式化数据
            formattedData = self._formatData(self.returnedData);

            // 填充数据
            if ((len = formattedData.length) > 0) {
                list = DOM.create('<ol>');
                for (i = 0; i < len; ++i) {
                    itemData = formattedData[i];
                    li = self._formatItem((key = itemData[KEY]), itemData[RESULT]);

                    // 缓存 key 值到 attribute 上
                    DOM.attr(li, KEY, key);

                    // 添加奇偶 class
                    DOM.addClass(li, i % 2 ? EVEN_ITEM_CLS : ODD_ITEM_CLS);
                    list.appendChild(li);
                }
                content = list;
            }
            return content;
        },

        /**
         * 格式化输入的数据对象为标准格式
         * @param {Object} data 格式可以有 3 种：
         *  1. {'result' : [['key1', 'result1'], ['key2', 'result2'], ...]}
         *  2. {'result' : ['key1', 'key2', ...]}
         *  3. 1 和 2 的组合
         *  4. 标准格式
         *  5. 上面 1 - 4 中，直接取 o['result'] 的值
         * @return Object 标准格式的数据：
         *  [{'key' : 'key1', 'result' : 'result1'}, {'key' : 'key2', 'result' : 'result2'}, ...]
         */
        _formatData: function(data) {
            var arr = [], len, item, i, j = 0;
            if (!data) return arr;
            if (S.isArray(data[RESULT])) data = data[RESULT];
            if (!(len = data.length)) return arr;

            for (i = 0; i < len; ++i) {
                item = data[i];

                if (S.isString(item)) { // 只有 key 值时
                    arr[j++] = { 'key' : item };
                } else if (S.isArray(item) && item.length > 1) { // ['key', 'result'] 取数组前2个
                    arr[j++] = {'key' : item[0], 'result' : item[1]};
                }
                // 不能识别的，直接忽略掉
            }
            return arr;
        },

        /**
         * 格式化输出项
         * @param {String} key 查询字符串
         * @param {Number} result 结果 可不设
         * @return {HTMLElement}
         */
        _formatItem: function(key, result) {
            var li = DOM.create('<li>'),
                resultText;

            li.appendChild(DOM.create('<span>', {
                'class': KEY_EL_CLS,
                html: key
            }));

            if (result) {
                resultText = this.config.resultFormat.replace('%result%', result);
                if (S.trim(resultText)) { // 有值时才创建
                    li.appendChild(DOM.create('<span>', {
                        'class': RESULT_EL_CLS,
                        html: resultText
                    }));
                }
            }

            return li;
        },

        /**
         * 填充提示层容器
         */
        _fillContainer: function(content, footer) {
            var self = this;
            self._fillContent(content || EMPTY);
            self._fillFooter(footer || EMPTY);

            // bugfix: 更改容器内容时, 调整 shim 大小
            if (self.isVisible()) self._setShimRegion();
        },

        /**
         * 填充提示层内容层
         * @param {String|HTMLElement} html innerHTML or Child Node
         */
        _fillContent: function(html) {
            replaceContent(this.content, html);
            this.selectedItem = undefined; // 一旦重新填充了，selectedItem 就没了，需要重置
        },

        /**
         * 填充提示层底部
         */
        _fillFooter: function(html) {
            var self = this, cfg = self.config,
                footer = self.footer, closeBtn;

            replaceContent(footer, html);

            // 关闭按钮
            if (cfg['closeBtn']) {
                footer.appendChild(DOM.create('<a>', {
                    'class': CLOSE_BTN_CLS,
                    text: cfg.closeBtnText,
                    href: 'javascript: void(0)',
                    target: '_self' // bug fix: 覆盖<base target='_blank' />，否则会弹出空白页面
                }));
            }

            // 根据 query 参数，有可能填充不同的内容到 footer
            self.fire(EVENT_UPDATE_FOOTER, { footer: footer, query: self.query });

            // 无内容时，隐藏掉
            DOM.css(footer, DISPLAY, DOM.text(footer) ? EMPTY : NONE);
        },

        /**
         * 根据 contanier 的内容，显示或隐藏容器
         */
        _displayContainer: function() {
            var self = this;

            if (S.trim(DOM.text(self.container))) {
                self.show();
            } else {
                self.hide();
            }
        },

        /**
         * 选中提示层中的上/下一个条
         * @param {Boolean} down true 表示 down, false 表示 up
         */
        _selectItem: function(down) {
            var self = this,
                items = DOM.query(li, self.container),
                newSelectedItem;
            if (items.length === 0) return;

            // 有可能用 ESC 隐藏了，直接显示即可
            if (!self.isVisible()) {
                self.show();
                return; // 保留原来的选中状态
            }

            // 没有选中项时，选中第一/最后项
            if (!self.selectedItem) {
                newSelectedItem = items[down ? 0 : items.length - 1];
            } else {
                // 选中下/上一项
                //newSelectedItem = DOM[down ? 'next' : 'prev'](self.selectedItem);
                //如果选项被分散在多个ol中，不能直接next或prev获取
                newSelectedItem = items[S.indexOf(self.selectedItem, items) + (down ? 1 : -1)];
                // 已经到了最后/前一项时，归位到输入框，并还原输入值
                if (!newSelectedItem) {
                    self.textInput.value = self.query;
                }
            }

            // 移除当前选中项
            self._removeSelectedItem();

            // 选中新项
            if (newSelectedItem) {
                self._setSelectedItem(newSelectedItem);
                self._updateInputFromSelectItem();
            }
        },

        /**
         * 移除选中项
         */
        _removeSelectedItem: function() {
            DOM.removeClass(this.selectedItem, SELECTED_ITEM_CLS);
            this.selectedItem = undefined;
        },

        /**
         * 设置当前选中项
         */
        _setSelectedItem: function(item) {
            DOM.addClass(item, SELECTED_ITEM_CLS);
            this.selectedItem = item;
            this.textInput.focus(); // 考虑从 footer 移动到 content 区域，需要重新聚焦
        },

        /**
         * 获取提示层中选中项的 key 字符串
         */
        _getSelectedItemKey: function() {
            var self = this;
            if (!self.selectedItem) return EMPTY;

            // getElementsByClassName 比较损耗性能，改用缓存数据到 attribute 上方法
            //var keyEl = Dom.getElementsByClassName(KEY_EL_CLS, '*', this.selectedItem)[0];
            //return keyEl.innerHTML;

            return DOM.attr(self.selectedItem, KEY);
        },

        /**
         * 将选中项的 key 值更新到 textInput
         */
        _updateInputFromSelectItem: function() {
            var self = this;
            self.textInput.value = self._getSelectedItemKey(self.selectedItem) || self.query; // 如果没有 key, 就用输入值
        }
    });

    function visible(elem) {
        elem.style.visibility = EMPTY;
    }

    function invisible(elem) {
        elem.style.visibility = HIDDEN;
    }

    function replaceContent(elem, html) {
        if (html.nodeType === 1) {
            DOM.html(elem, EMPTY);
            elem.appendChild(html);
        } else {
            DOM.html(elem, html);
        }
    }

    function initCallback(cbFn) {
        var parts = cbFn.split('.'), len = parts.length, o;

        // cbFn 有可能为 'goog.ac.h'
        if (len > 1) {
            cbFn = cbFn.replace(/^(.*)\..+$/, '$1');
            o = S.namespace(cbFn, true);
            o[parts[len - 1]] = callback;
        } else {
            win[cbFn] = callback;
        }
    }

    /**
     * 约定的全局回调函数
     */
    function callback(data) {
        if (!Suggest.focusInstance) return;
        // 保证先运行 script.onload 事件，然后再执行 callback 函数
        S.later(function() {
            Suggest.focusInstance._handleResponse(data);
        }, 0);
    }

    Suggest.version = 1.1;
    Suggest.callback = callback;
    S.Suggest = Suggest;
    return Suggest;

}, { requires: ['dom','event','ua'] });


/**
 * 小结：
 *
 * 整个组件代码，由两大部分组成：数据处理 + 事件处理
 *
 * 一、数据处理很 core，但相对来说是简单的，由 requestData + handleResponse + formatData 等辅助方法组成
 * 需要注意两点：
 *  a. IE 中, 改变 script.src, 会自动取消掉之前的请求，并发送新请求。非 IE 中，必须新创建 script 才行。这是
 *     requestData 方法中存在两种处理方式的原因。  --- IE9 中修改 src 不会发送新请求(qiaohua)
 *  b. 当网速很慢，数据返回时，用户的输入可能已改变，已经有请求发送出去，需要抛弃过期数据。目前采用加 data-time
 *     的解决方案。更好的解决方案是，调整 API，使得返回的数据中，带有 query 值。
 *
 * 二、事件处理看似简单，实际上有不少陷阱，分 2 部分：
 *  1. 输入框的 focus/blur 事件 + 键盘控制事件
 *  2. 提示层上的鼠标悬浮和点击事件
 * 需要注意以下几点：
 *  a. 因为点击提示层时，首先会触发输入框的 blur 事件，blur 事件中调用 hide 方法，提示层一旦隐藏后，就捕获不到
 *     点击事件了。因此有了 this._mouseHovering 来排除这种情况，使得 blur 时不会触发 hide, 在提示层的点击
 *     事件中自行处理。（2009-06-18 更新：采用 mouseup 来替代 click 事件，代码清晰简单了很多）（注：后来发现
 *     用 beforedeactive 方法可以阻止掉输入框的焦点丢失，逻辑更简单了）
 *  b. 当鼠标移动到某项或通过上下键选中某项时，给 this.selectedItem 赋值；当提示层的数据重新填充时，重置
 *     this.selectedItem. 这种处理方式和 google 的一致，可以使得选中某项，隐藏，再次打开时，依旧选中原来
 *     的选中项。
 *  c. 在 ie 等浏览器中，输入框中输入 ENTER 键时，会自动提交表单。如果 form.target='_blank', 自动提交和 JS 提交
 *     会打开两个提交页面。因此这里采取了在 JS 中不提交的策略，ENTER 键是否提交表单，完全由 HTML 代码自身决定。这
 *     样也能使得组件很容易应用在不需要提交表单的场景中。（2009-06-18 更新：可以通过 blur() 取消掉浏览器的默认
 *     Enter 响应，这样能使得代码逻辑和 mouseup 的一致）
 *  d. onItemSelect 仅在鼠标点击选择某项 和 键盘选中某项回车 后触发。
 *  e. 当 textInput 会触发表单提交时，在 enter keydown 和 keyup 之间，就会触发提交。因此在 keydown 中捕捉事件。
 *     并且在 keydown 中能捕捉到持续 DOWN/UP, 在 keyup 中就不行了。
 *
 * 【得到的一些编程经验】：
 *  1. 职责单一原则。方法的职责要单一，比如 hide 方法和 show 方法，除了改变 visibility, 就不要拥有其它功能。这
 *     看似简单，真要做到却并不容易。保持职责单一，保持简单的好处是，代码的整体逻辑更清晰，方法的可复用性也提
 *     高了。
 *  2. 小心事件处理。当事件之间有关联时，要仔细想清楚，设计好后再写代码。比如输入框的 blur 和提示层的 click 事件。
 *  3. 测试的重要性。目前是列出 Test Cases，以后要尝试自动化。保证每次改动后，都不影响原有功能。
 *  4. 挑选正确的事件做正确的事，太重要了，能省去很多很多烦恼。
 *
 */

/**
 * 2009-08-05 更新： 将 class 从配置项中移动到常量，原因是：修改默认 className 的可能性很小，仅保留一个
 *                  containerCls 作为个性化样式的接口即可。
 *
 * 2009-12-10 更新： 采用 kissy module 组织代码。为了避免多个沙箱下，对全局回调函数覆盖定义引发的问题，
 *                  采用共享模式。
 *
 * 2010-03-10 更新： 去除共享模式，适应 kissy 新的代码组织方式。
 *
 * 2010-08-04 更新： 去掉对 yahoo-dom-event 的依赖，仅依赖 ks-core. 调整了部分 public api, 扩展更容易了。
 *
 * 2011-05-22 更新： fool2fish<fool2fish@gmail.com>新增部分完全向后兼容的功能
 *                   1. 对于开放配置config.contentRenderer，接收content的渲染函数，返回渲染后的dom节点，规定item必须为li
 *                   2. 改进上下方向键选择item的代码逻辑
 */
/*
Copyright 2011, KISSY UI Library v1.20dev
MIT Licensed
build time: Sep 22 13:54
*/
/**
 * @fileoverview 图像放大区域
 * @author  乔花<qiaohua@taobao.com>
 */
KISSY.add("imagezoom/zoomer", function(S, Node, undefined) {
    var STANDARD = 'standard', INNER = 'inner',
        RE_IMG_SRC = /^.+\.(?:jpg|png|gif)$/i,
        round = Math.round, min = Math.min,
        body;

    function Zoomer() {
        var self = this,
            tmp;

        // 预加载大图
        tmp = self.get('bigImageSrc');
        if (tmp && self.get('preload')) {
            new Image().src = tmp;
        }

        // 两种显示效果切换标志
        self._isInner = self.get('type') === INNER;
        body = new Node(document.body);
    }

    Zoomer.ATTRS = {
        width: {
            valueFn: function() {
                return this.get('imageWidth');
            }
        },
        height: {
            valueFn: function() {
                return this.get('imageHeight');
            }
        },
        elCls: {
            value: 'ks-imagezoom-viewer'
        },
        elStyle: {
            value:  {
                overflow: 'hidden',
                position: 'absolute'
            }
        },


        /**
         * 显示类型
         * @type {string}
         */
        type: {
            value: STANDARD   // STANDARD  or INNER
        },
        /**
         * 是否预加载大图
         * @type {boolean}
         */
        preload: {
            value: true
        },

        /**
         * 大图路径, 默认取触点上的 data-ks-imagezoom 属性值
         * @type {string}
         */
        bigImageSrc: {
            setter: function(v) {
                if (v && RE_IMG_SRC.test(v)) {
                    return v;
                }
                return this.get('bigImageSrc');
            },
            valueFn: function() {
                var img = this.get('imageNode'), data;

                if (img) {
                    data = img.attr('data-ks-imagezoom');
                    if (data && RE_IMG_SRC.test(data)) return data;
                }
                return undefined;
            }
        },
        /**
         * 大图高宽, 大图高宽是指在没有加载完大图前, 使用这个值来替代计算, 等加载完后会重新更新镜片大小, 具体场景下, 设置个更合适的值
         * @type {Array.<number>}

        bigImageSize: {
            value: [800, 800],
            setter: function(v) {
                this.set('bigImageWidth', v[0]);
                this.set('bigImageHeight', v[1]);
                return v;
            }
        },*/
        /**
         * 大图高宽, 大图高宽是指在没有加载完大图前, 使用这个值来替代计算, 等加载完后会重新更新镜片大小, 具体场景下, 设置个更合适的值
         * @type {number}
         */
        bigImageWidth: {
            valueFn: function() {
                var img = this.bigImage;
                img = img && img.width();
                return img || 800;
            }
        },
        bigImageHeight: {
            valueFn: function() {
                var img = this.bigImage;
                img = img && img.height();
                return img || 800;
            }
        },

        /**
         * 保存当前鼠标位置
         */
        currentMouse: {
            value: undefined
        },
        lensClass: {
            value: 'ks-imagezoom-lens'
        },
        lensHeight: {
            value: undefined
        },
        lensWidth: {
            value: undefined
        },
        lensTop: {
            value: undefined
        },
        lensLeft: {
            value: undefined
        }
    };

    Zoomer.HTML_PARSER = {
    };

    S.augment(Zoomer, {
        __renderUI: function() {
            var self = this, bigImage;

            self.viewer = self.get("contentEl");
            bigImage = self.bigImage = new Node('<img src="' + self.get("bigImageSrc") + '" />').css('position', 'absolute').appendTo(self.viewer);

            self._setLensSize();
            self._setLensOffset();
            
            if (self._isInner) {
                // inner 位置强制修改
                self.set('align', {
                    node: self.image,
                    points: ['cc', 'cc']
                });
                self._bigImageCopy = new Node('<img src="' + self.image.attr('src') + '"  />').css('position', 'absolute')
                    .width(self.get('bigImageWidth')).height(self.get('bigImageHeight')).prependTo(self.viewer);
            }
            // 标准模式, 添加镜片
            else {
                self.lens = new Node('<div class="' + self.get("lensClass") + '"></div>').css('position', 'absolute').appendTo(body).hide();
            }

            self.viewer.appendTo(self.get("el"));

            self.loading();
            // 大图加载完毕后更新显示区域
            imgOnLoad(bigImage, function() {
                self.unloading();
                self._setLensSize();

                self.set('bigImageWidth', bigImage.width());
                self.set('bigImageHeight', bigImage.height());
            });
        },
        __bindUI: function() {
            var self = this;

            self.on('afterVisibleChange', function(ev) {
                var isVisible = ev.newVal;
                if (isVisible) {
                    if (self._isInner) {
                        self._anim(0.4, 42);
                    }
                    body.on('mousemove', self._mouseMove, self);
                } else {
                    hide(self.lens);
                    body.detach('mousemove', self._mouseMove, self);
                }
            });
        },
        __syncUI: function() {
        },

        __destructor: function() {
            var self = this;

            self.viewer.remove();
            self.lens.remove();
        },

        /**
         * 设置镜片大小
         */
        _setLensSize: function() {
            var self = this,
                rw = self.get('imageWidth'), rh = self.get('imageHeight'),
                bw = self.get('bigImageWidth'), bh = self.get('bigImageHeight'),
                w = self.get('width'), h = self.get('height');

            // 计算镜片宽高, vH / bigImageH = lensH / imageH
            self.set('lensWidth', min(round(w * rw / bw), rw));
            self.set('lensHeight', min(round(h * rh / bh), rh));
        },
        /**
         * 随着鼠标移动, 设置镜片位置
         * @private
         */
        _setLensOffset: function(ev) {
            var self = this,
                ev = ev || self.get('currentMouse'),
                rl = self.get('imageLeft'), rt = self.get('imageTop'),
                rw = self.get('imageWidth'), rh = self.get('imageHeight'),
                w = self.get('width'), h = self.get('height'),
                lensWidth = self.get('lensWidth'), lensHeight = self.get('lensHeight'),
                lensLeft = ev.pageX - lensWidth / 2, lensTop = ev.pageY - lensHeight / 2;

            if (lensLeft <= rl) {
                lensLeft = rl;
            } else if (lensLeft >= rw + rl - lensWidth) {
                lensLeft = rw + rl - lensWidth;
            }

            if (lensTop <= rt) {
                lensTop = rt;
            } else if (lensTop >= rh + rt - lensHeight) {
                lensTop = rh + rt - lensHeight;
            }
            self.set('lensLeft', lensLeft);
            self.set('lensTop', lensTop);
        },

        _mouseMove: function(ev) {
            var self = this,
                rl = self.get('imageLeft'), rt = self.get('imageTop'),
                rw = self.get('imageWidth'), rh = self.get('imageHeight');

            if (ev.pageX > rl && ev.pageX < rl + rw &&
                ev.pageY > rt && ev.pageY < rt + rh) {
                self.set('currentMouse', ev);
            } else {
                // 移出
                self.hide();
            }
        },

        /**
         * Inner 效果中的放大动画
         * @param {number} seconds
         * @param {number} times
         * @private
         */
        _anim: function(seconds, times) {
            var self = this,
                go, t = 1,
                rl = self.get('imageLeft'), rt = self.get('imageTop'),
                rw = self.get('imageWidth'), rh = self.get('imageHeight'),
                bw = self.get('bigImageWidth'), bh = self.get('bigImageHeight'),
                max_left = - round((self.get('lensLeft') - rl) * bw / rw),
                max_top = - round((self.get('lensTop') - rt) * bh / rh),
                tmpWidth, tmpHeight, tmpCss;

            if (self._animTimer) self._animTimer.cancel();

            // set min width and height
            self.bigImage.width(rw).height(rh);
            self._bigImageCopy.width(rw).height(rh);

            self._animTimer = S.later((go = function() {
                tmpWidth = rw + ( bw - rw) / times * t;
                tmpHeight = rh + (bh - rh) / times * t;
                tmpCss = {
                    left: max_left / times * t,
                    top: max_top / times * t
                };
                self.bigImage.width(tmpWidth).height(tmpHeight).css(tmpCss);
                self._bigImageCopy.width(tmpWidth).height(tmpHeight).css(tmpCss);

                if (++t > times) {
                    self._animTimer.cancel();
                    self._animTimer = undefined;
                }
            }), seconds * 1000 / times, true);

            go();
        },

        _uiSetCurrentMouse: function(ev) {
            var self = this,
                lt;
            if (!self.bigImage || self._animTimer) return;

            // 更新 lens 位置
            show(self.lens);
            self._setLensOffset(ev);

            // 设置大图偏移
            lt = {
                left: - round((self.get('lensLeft') - self.get('imageLeft')) * self.get('bigImageWidth') / self.get('imageWidth')),
                top: - round((self.get('lensTop') - self.get('imageTop')) * self.get('bigImageHeight') / self.get('imageHeight'))
            };
            self._bigImageCopy && self._bigImageCopy.css(lt);
            self.bigImage.css(lt);
        },

        _uiSetLensWidth: function(v) {
            this.lens && this.lens.width(v);
        },
        _uiSetLensHeight: function(v) {
            this.lens && this.lens.height(v);
        },
        _uiSetLensTop: function(v) {
            this.lens && this.lens.offset({ 'top': v });
        },
        _uiSetLensLeft: function(v) {
            this.lens && this.lens.offset({ 'left': v });
        },

        _uiSetBigImageWidth: function(v) {
            v && this.bigImage && this.bigImage.width(v);
            v && this._bigImageCopy && this._bigImageCopy.width(v);
        },
        _uiSetBigImageHeight: function(v) {
            v && this.bigImage && this.bigImage.height(v);
            v && this._bigImageCopy && this._bigImageCopy.height(v);
        },
        _uiSetBigImageSrc: function(v) {
            v && this.bigImage && this.bigImage.attr('src', v);
            v && this._bigImageCopy && this._bigImageCopy.attr('src', v);
        },


        /**
         * 改变小图元素的 src
         * @param {String} src
         */
        changeImageSrc: function(src) {
            var self = this;
            self.image.attr('src', src);
            self.loading();
        },

        /**
         * 调整放大区域位置, 在外部改变小图位置时, 需要对应更新放大区域的位置
         */
        refreshRegion: function() {
            var self = this;

            self._fresh = self.get('align');
            self.set('align', undefined);
        }
    });

    function show(obj) {
        obj && obj.show();
    }
    function hide(obj) {
        obj && obj.hide();
    }
    function imgOnLoad(img, callback) {
        var imgElem = img[0];
        if ((imgElem && imgElem.complete && imgElem.clientWidth)) {
            callback();
            return;
        }
        // 1) 图尚未加载完毕，等待 onload 时再初始化 2) 多图切换时需要绑定load事件来更新相关信息
        img.on('load', callback);
    }

    Zoomer.__imgOnLoad = imgOnLoad;
    return Zoomer;
}, {
    requires:["node"]
});/**
 * @fileoverview 图片放大效果 ImageZoom.
 * @author  玉伯<lifesinger@gmail.com>, 乔花<qiaohua@taobao.com>
 * @see silde.html
 */
KISSY.add('imagezoom/base', function(S, DOM, Event, UA, Anim, UIBase, Node, Zoomer, undefined) {
    var IMAGEZOOM_ICON_TMPL = "<span class='{iconClass}'></span>",
        IMAGEZOOM_WRAP_TMPL = "<div class='{wrapClass}'></div>";

    function require(s) {
        return S.require("uibase/" + s);
    }
    function show(obj) {
        obj && obj.show();
    }
    function hide(obj) {
        obj && obj.hide();
    }

    return UIBase.create([require("boxrender"),
        require("contentboxrender"),
        require("positionrender"),
        require("loadingrender"),
        UA['ie'] == 6 ? require("shimrender") : null,
        require("align"),
        require("maskrender"),
        Zoomer
    ], {

        initializer:function() {
            var self = this,
                tmp;

            tmp = self.image = self.get('imageNode');

            // 在小图加载完毕时初始化
            tmp && Zoomer.__imgOnLoad(tmp, function() {
                if (!self.imageWrap) {
                    self._render();
                    self._bind();
                }
            });
        },

        /*renderUI:function() {
        },
        syncUI:function() {
        },
        bindUI: function() {
        },*/
        destructor: function() {
            var self = this;

            self.image.detach();
        },

        _render: function() {
            var self = this, wrap,
                image = self.image,
                elem = image.parent();

            if (elem.css('display') !== 'inline') {
                elem = image;
            }
            self.imageWrap = new Node(S.substitute(IMAGEZOOM_WRAP_TMPL, {
                wrapClass: self.get('wrapClass')
            })).insertBefore(elem);
            self.imageWrap.prepend(elem);

            if (self.get('showIcon')) {
                self.icon = new Node(S.substitute(IMAGEZOOM_ICON_TMPL, {
                    iconClass: self.get("iconClass")
                }));
                self.imageWrap.append(self.icon);
            }
        },

        /**
         * 绑定鼠标进入/离开/移动事件, 只有进入, 才响应鼠标移动事件
         * @private
         */
        _bind: function() {
            var self = this,
                timer;

            self.image.on('mouseenter', function(ev) {
                if (!self.get('hasZoom')) return;

                timer = S.later(function() {
                    self.set('currentMouse', ev);
                    if (self._fresh) {
                        self.set('align', self._fresh);
                        self._fresh = undefined;
                    }
                    self.show();
                    timer = undefined;
                }, 50);
            }).on('mouseleave', function() {
                if (timer) {
                    timer.cancel();
                    timer = undefined;
                }
            });

            self.on('afterVisibleChange', function(ev) {
                var isVisible = ev.newVal;
                if (isVisible) {
                    hide(self.icon);
                } else {
                    show(self.icon);
                }
            });
        },

        _uiSetHasZoom: function(v) {
            if (v) {
                show(this.icon);
            } else {
                hide(this.icon);
            }
        }
    },
    {
        ATTRS:{
            imageNode: {
                setter: function(el) {
                    return Node.one(el);
                }
            },
            wrapClass: {
                value: 'ks-imagezoom-wrap'
            },
            imageWidth: {
                valueFn: function() {
                    var img = this.get('imageNode');
                    img = img && img.width();
                    return img || 400;
                }
            },
            imageHeight: {
                valueFn: function() {
                    var img = this.get('imageNode');
                    img = img && img.height();
                    return img || 400;
                }
            },
            imageLeft: {
                valueFn: function() {
                    var img = this.get('imageNode');
                    img = img && img.offset().left;
                    return img || 400;
                }
            },
            imageTop: {
                valueFn: function() {
                    var img = this.get('imageNode');
                    img = img && img.offset().top;
                    return img || 400;
                }
            },
            /**
             * 显示放大区域标志
             * @type {boolean}
             */
            hasZoom: {
                value: true,
                setter: function(v) {
                    return !!v;
                }
            },

            /**
             * 是否显示放大镜提示图标
             * @type {boolean}
             */
            showIcon: {
                value: true
            },
            iconClass: {
                value: 'ks-imagezoom-icon'
            },
            prefixCls:{
                value: 'ks-'
            }
        }
    });
}, {
    requires: ['dom','event', 'ua', 'anim', 'uibase', 'node', 'imagezoom/zoomer']
});


/**
 * NOTES:
 *  201101
 *      - 重构代码, 基于 UIBase
 *
 */

/**
 * auto render
 * @author  玉伯<lifesinger@gmail.com>
 */
KISSY.add('imagezoom/autorender', function(S, DOM, JSON, ImageZoom) {

    /**
     * 自动渲染 container 元素内的所有 ImageZoom 组件
     * 默认钩子：<div class="KS_Widget" data-widget-type="ImageZoom" data-widget-config="{...}">
     *
     */
    ImageZoom.autoRender = function(hook, container) {
        hook = '.' + (hook || 'KS_Widget');

        DOM.query(hook, container).each(function(elem) {
            var type = elem.getAttribute('data-widget-type'), config;

            if (type === 'ImageZoom') {
                try {
                    config = elem.getAttribute('data-widget-config');
                    if (config) config = config.replace(/'/g, '"');
                    new ImageZoom(elem, JSON.parse(config));
                }
                catch(ex) {
                    S.log('ImageZoom.autoRender: ' + ex, 'warn');
                }
            }
        });
    };

}, { requires:["dom","json","imagezoom/base"] });
KISSY.add("imagezoom", function(S, ImageZoom) {
    S.ImageZoom = ImageZoom;
    return ImageZoom;
}, {requires:[
    "imagezoom/base",
    "imagezoom/autorender"
]});
/*
Copyright 2011, KISSY UI Library v1.20dev
MIT Licensed
build time: Sep 22 13:53
*/
/**
 * KISSY Calendar
 * @creator  拔赤<lijing00333@163.com>
 */
KISSY.add('calendar/base', function(S, Node, Event, undefined) {
    var EventTarget = Event.Target,$ = Node.all;

    function Calendar(trigger, config) {
        this._init(trigger, config);
    }

    S.augment(Calendar, {

        /**
         * 日历构造函数
         * @method     _init
         * @param { string }    selector
         * @param { string }    config
         * @private
         */
        _init: function(selector, config) {
            var self = this,con = Node.one(selector);
            self.id = self.C_Id = self._stamp(con);
            self._buildParam(config);

            /*
             self.con  日历的容器
             self.id   传进来的id
             self.C_Id 永远代表日历容器的ID
             */
            if (!self.popup) {
                self.con = con;
            } else {
                self.trigger = con;
                self.con = new Node('<div>');
                Node.one('body').append(self.con);
                self.C_Id = self._stamp(self.con);
                self.con.css({
                    'top':'0px',
                    'position':'absolute',
                    'background':'white',
                    'visibility':'hidden'
                });
            }

            //创建事件中心
            //事件中心已经和Calendar合并
            var EventFactory = function() {
            };
            S.augment(EventFactory, EventTarget);
            var eventCenter = new EventFactory();
            S.mix(self, eventCenter);

            self.render();
            self._buildEvent();
            return this;
        },

        render: function(o) {
            var self = this,
                i = 0,
                _prev,_next,_oym;

            o = o || {};
            self._parseParam(o);
            self.ca = [];

            self.con.addClass('ks-cal-call ks-clearfix multi-' + self.pages);
            self.con.html('');

            for (i = 0,_oym = [self.year,self.month]; i < self.pages; i++) {
                if (i === 0) {
                    _prev = true;
                } else {
                    _prev = false;
                    _oym = self._computeNextMonth(_oym);
                }
                _next = i == (self.pages - 1);
                self.ca.push(new self.Page({
                    year:_oym[0],
                    month:_oym[1],
                    prevArrow:_prev,
                    nextArrow:_next,
                    showTime:self.showTime
                }, self));


                self.ca[i].render();
            }
            return this;

        },

        /**
         * 用以给容器打上id的标记,容器有id则返回
         * @method _stamp
         * @param el
         * @return {string}
         * @private
         */
        _stamp: function(el) {
            if (!el.attr('id')) {
                el.attr('id', S.guid('K_Calendar'));
            }
            return el.attr('id');
        },

        /**
         * 计算d天的前几天或者后几天，返回date
         * @method _showdate
         * @private
         */
        _showdate: function(n, d) {
            var uom = new Date(d - 0 + n * 86400000);
            uom = uom.getFullYear() + "/" + (uom.getMonth() + 1) + "/" + uom.getDate();
            return new Date(uom);
        },

        /**
         * 创建日历外框的事件
         * @method _buildEvent
         * @private
         */
        _buildEvent: function() {
            var self = this;
            if (!self.popup) {
                return this;
            }
            //点击空白
            //flush event
            for (var i = 0; i < self.EV.length; i++) {
                if (self.EV[i] !== undefined) {
                    self.EV[i].detach();
                }
            }
            self.EV[0] = Node.one('body').on('click', function(e) {
                var target = $(e.target);
                //点击到日历上
                if (target.attr('id') === self.C_Id) {
                    return;
                }
                if ((target.hasClass('ks-next') || target.hasClass('ks-prev')) &&
                    target[0].tagName === 'A') {
                    return;
                }
                //点击在trigger上
                if (target.attr('id') == self.id) {
                    return;
                }

                if (self.con.css('visibility') == 'hidden') return;
                var inRegion = function(dot, r) {
                    return dot[0] > r[0].x
                        && dot[0] < r[1].x
                        && dot[1] > r[0].y
                        && dot[1] < r[1].y;
                };

                // bugfix by jayli - popup状态下，点击选择月份的option时日历层关闭
                if (self.con.contains(target) &&
                    (target[0].nodeName.toLowerCase() === 'option' ||
                        target[0].nodeName.toLowerCase() === 'select')) {
                    return;
                }

                /*
                 if (!S.DOM.contains(Node.one('#' + self.C_Id), e.target)) {
                 */
                if (!inRegion([e.pageX,e.pageY], [
                    {
                        x:self.con.offset().left,
                        y:self.con.offset().top
                    },
                    {
                        x:self.con.offset().left + self.con.width(),
                        y:self.con.offset().top + self.con.height()
                    }
                ])) {
                    self.hide();
                }
            });
            //点击触点
            for (i = 0; i < self.triggerType.length; i++) {

                self.EV[1] = Node.one('#' + self.id).on(self.triggerType[i], function(e) {
                    e.target = $(e.target);
                    e.preventDefault();
                    //如果focus和click同时存在的hack

                    var a = self.triggerType;
                    if (S.inArray('click', a) && S.inArray('focus', a)) {//同时含有
                        if (e.type == 'focus') {
                            self.toggle();
                        }
                    } else if (S.inArray('click', a) && !S.inArray('focus', a)) {//只有click
                        if (e.type == 'click') {
                            self.toggle();
                        }
                    } else if (!S.inArray('click', a) && S.inArray('focus', a)) {//只有focus
                        setTimeout(function() {//为了跳过document.onclick事件
                            self.toggle();
                        }, 170);
                    } else {
                        self.toggle();
                    }

                });

            }
            return this;
        },

        /**
         * 改变日历是否显示的状态
         * @mathod toggle
         */
        toggle: function() {
            var self = this;
            if (self.con.css('visibility') == 'hidden') {
                self.show();
            } else {
                self.hide();
            }
        },

        /**
         * 显示日历
         * @method show
         */
        show: function() {
            var self = this;
            self.con.css('visibility', '');
            var _x = self.trigger.offset().left,
                //KISSY得到DOM的width是innerWidth，这里期望得到outterWidth
                height = self.trigger.outerHeight() || self.trigger.height(),
                _y = self.trigger.offset().top + height;
            self.con.css('left', _x.toString() + 'px');
            self.con.css('top', _y.toString() + 'px');
            return this;
        },

        /**
         * 隐藏日历
         * @method hide
         */
        hide: function() {
            var self = this;
            self.con.css('visibility', 'hidden');
            return this;
        },

        /**
         * 创建参数列表
         * @method _buildParam
         * @private
         */
        _buildParam: function(o) {
            var self = this;
            if (o === undefined || o === null) {
                o = { };
            }

            function setParam(def, key) {
                var v = o[key];
                // null在这里是“占位符”，用来清除参数的一个道具
                self[key] = (v === undefined || v === null) ? def : v;
            }

            //这种处理方式不错
            S.each({
                date:        new Date(),
                startDay:    0,
                pages:       1,
                closable:    false,
                rangeSelect: false,
                minDate:     false,
                maxDate:     false,
                multiSelect: false,
                navigator:   true,
                popup:       false,
                showTime:    false,
                triggerType: ['click']
            }, setParam);

            // 支持用户传进来一个string
            if (typeof o.triggerType === 'string') {
                o.triggerType = [o.triggerType];
            }

            setParam(self.date, 'selected');
            if (o.startDay) {
                self.startDay = (7 - o.startDay) % 7;
            }

            if (o.range !== undefined && o.range !== null) {
                var s = self._showdate(1, new Date(o.range.start.getFullYear() + '/' + (o.range.start.getMonth() + 1) + '/' + (o.range.start.getDate())));
                var e = self._showdate(1, new Date(o.range.end.getFullYear() + '/' + (o.range.end.getMonth() + 1) + '/' + (o.range.end.getDate())));
                self.range = {
                    start:s,
                    end:e
                };
            } else {
                self.range = {
                    start:null,
                    end:null
                };
            }
            self.EV = [];
            return this;
        },

        /**
         * 过滤参数列表
         * @method _parseParam
         * @private
         */
        _parseParam: function(o) {
            var self = this,i;
            if (o === undefined || o === null) {
                o = {};
            }
            for (i in o) {
                self[i] = o[i];
            }
            self._handleDate();
            return this;
        },

        /**
         * 模板函数
         * @method _templetShow
         * @private
         */
        _templetShow: function(templet, data) {
            var str_in,value_s,i,m,value,par;
            if (data instanceof Array) {
                str_in = '';
                for (i = 0; i < data.length; i++) {
                    str_in += arguments.callee(templet, data[i]);
                }
                templet = str_in;
            } else {
                value_s = templet.match(/{\$(.*?)}/g);
                if (data !== undefined && value_s !== null) {
                    for (i = 0,m = value_s.length; i < m; i++) {
                        par = value_s[i].replace(/({\$)|}/g, '');
                        value = (data[par] !== undefined) ? data[par] : '';
                        templet = templet.replace(value_s[i], value);
                    }
                }
            }
            return templet;
        },

        /**
         * 处理日期
         * @method _handleDate
         * @private
         */
        _handleDate: function() {
            var self = this,
                date = self.date;
            self.weekday = date.getDay() + 1;//星期几 //指定日期是星期几
            self.day = date.getDate();//几号
            self.month = date.getMonth();//月份
            self.year = date.getFullYear();//年份
            return this;
        },

        //get标题
        _getHeadStr: function(year, month) {
            return year.toString() + '年' + (Number(month) + 1).toString() + '月';
        },

        //月加
        _monthAdd: function() {
            var self = this;
            if (self.month == 11) {
                self.year++;
                self.month = 0;
            } else {
                self.month++;
            }
            self.date = new Date(self.year.toString() + '/' + (self.month + 1).toString() + '/1');
            return this;
        },

        //月减
        _monthMinus: function() {
            var self = this;
            if (self.month === 0) {
                self.year--;
                self.month = 11;
            } else {
                self.month--;
            }
            self.date = new Date(self.year.toString() + '/' + (self.month + 1).toString() + '/1');
            return this;
        },

        //裸算下一个月的年月,[2009,11],年:fullYear，月:从0开始计数
        _computeNextMonth: function(a) {
            var _year = a[0],
                _month = a[1];
            if (_month == 11) {
                _year++;
                _month = 0;
            } else {
                _month++;
            }
            return [_year,_month];
        },

        //处理日期的偏移量
        _handleOffset: function() {
            var self = this,
                data = ['日','一','二','三','四','五','六'],
                temp = '<span>{$day}</span>',
                offset = self.startDay,
                day_html = '',
                a = [];
            for (var i = 0; i < 7; i++) {
                a[i] = {
                    day:data[(i - offset + 7) % 7]
                };
            }
            day_html = self._templetShow(temp, a);

            return {
                day_html:day_html
            };
        },

        //处理起始日期,d:Date类型
        _handleRange: function(d) {
            var self = this,t;
            if ((self.range.start === null && self.range.end === null ) || (self.range.start !== null && self.range.end !== null)) {
                self.range.start = d;
                self.range.end = null;
                self.render();
            } else if (self.range.start !== null && self.range.end === null) {
                self.range.end = d;
                if (self.range.start.getTime() > self.range.end.getTime()) {
                    t = self.range.start;
                    self.range.start = self.range.end;
                    self.range.end = t;
                }
                self.fire('rangeSelect', self.range);
                self.render();
            }
            return this;
        }
    });

    return Calendar;
}, { requires: ['node',"event"] });

/**
 * 2010-09-09 by lijing00333@163.com - 拔赤
 *     - 将基于YUI2/3的Calendar改为基于KISSY
 *     - 增加起始日期（星期x）的自定义
 *      - 常见浮层的bugfix
 *
 * TODO:
 *   - 日历日期的输出格式的定制
 *   - 多选日期的场景的交互设计
 */
/*
 * Date Format 1.2.3
 * (c) 2007-2009 Steven Levithan <stevenlevithan.com>
 * MIT license
 *
 * Includes enhancements by Scott Trenda <scott.trenda.net>
 * and Kris Kowal <cixar.com/~kris.kowal/>
 *
 * Accepts a date, a mask, or a date and a mask.
 * Returns a formatted version of the given date.
 * The date defaults to the current date/time.
 * The mask defaults to dateFormat.masks.default.
 *
 * Last modified by jayli 拔赤 2010-09-09
 * - 增加中文的支持
 * - 简单的本地化，对w（星期x）的支持
 */
KISSY.add('calendar/date', function(S) {

    function dateParse(data) {

        var date = null;

        //Convert to date
        if (!(date instanceof Date)) {
            date = new Date(data);
        }
        else {
            return date;
        }

        // Validate
        if (date instanceof Date && (date != "Invalid Date") && !isNaN(date)) {
            return date;
        }
        else {
            return null;
        }

    }


    var dateFormat = function () {
        var token = /w{1}|d{1,4}|m{1,4}|yy(?:yy)?|([HhMsTt])\1?|[LloSZ]|"[^"]*"|'[^']*'/g,
            timezone = /\b(?:[PMCEA][SDP]T|(?:Pacific|Mountain|Central|Eastern|Atlantic) (?:Standard|Daylight|Prevailing) Time|(?:GMT|UTC)(?:[-+]\d{4})?)\b/g,
            timezoneClip = /[^-+\dA-Z]/g,
            pad = function (val, len) {
                val = String(val);
                len = len || 2;
                while (val.length < len) {
                    val = "0" + val;
                }
                return val;
            },
            // Some common format strings
            masks = {
                "default":      "ddd mmm dd yyyy HH:MM:ss",
                shortDate:      "m/d/yy",
                //mediumDate:     "mmm d, yyyy",
                longDate:       "mmmm d, yyyy",
                fullDate:       "dddd, mmmm d, yyyy",
                shortTime:      "h:MM TT",
                //mediumTime:     "h:MM:ss TT",
                longTime:       "h:MM:ss TT Z",
                isoDate:        "yyyy-mm-dd",
                isoTime:        "HH:MM:ss",
                isoDateTime:    "yyyy-mm-dd'T'HH:MM:ss",
                isoUTCDateTime: "UTC:yyyy-mm-dd'T'HH:MM:ss'Z'",

                //added by jayli
                localShortDate:    "yy年mm月dd日",
                localShortDateTime:"yy年mm月dd日 hh:MM:ss TT",
                localLongDate:    "yyyy年mm月dd日",
                localLongDateTime:"yyyy年mm月dd日 hh:MM:ss TT",
                localFullDate:    "yyyy年mm月dd日 w",
                localFullDateTime:"yyyy年mm月dd日 w hh:MM:ss TT"

            },

            // Internationalization strings
            i18n = {
                dayNames: [
                    "Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat",
                    "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday",
                    "星期日","星期一","星期二","星期三","星期四","星期五","星期六"
                ],
                monthNames: [
                    "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
                    "January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"
                ]
            };

        // Regexes and supporting functions are cached through closure
        return function (date, mask, utc) {

            // You can't provide utc if you skip other args (use the "UTC:" mask prefix)
            if (arguments.length == 1 && Object.prototype.toString.call(date) == "[object String]" && !/\d/.test(date)) {
                mask = date;
                date = undefined;
            }

            // Passing date through Date applies Date.parse, if necessary
            date = date ? new Date(date) : new Date();
            if (isNaN(date)) {
                throw SyntaxError("invalid date");
            }

            mask = String(masks[mask] || mask || masks["default"]);

            // Allow setting the utc argument via the mask
            if (mask.slice(0, 4) == "UTC:") {
                mask = mask.slice(4);
                utc = true;
            }

            var _ = utc ? "getUTC" : "get",
                d = date[_ + "Date"](),
                D = date[_ + "Day"](),
                m = date[_ + "Month"](),
                y = date[_ + "FullYear"](),
                H = date[_ + "Hours"](),
                M = date[_ + "Minutes"](),
                s = date[_ + "Seconds"](),
                L = date[_ + "Milliseconds"](),
                o = utc ? 0 : date.getTimezoneOffset(),
                flags = {
                    d:    d,
                    dd:   pad(d, undefined),
                    ddd:  i18n.dayNames[D],
                    dddd: i18n.dayNames[D + 7],
                    w:     i18n.dayNames[D + 14],
                    m:    m + 1,
                    mm:   pad(m + 1, undefined),
                    mmm:  i18n.monthNames[m],
                    mmmm: i18n.monthNames[m + 12],
                    yy:   String(y).slice(2),
                    yyyy: y,
                    h:    H % 12 || 12,
                    hh:   pad(H % 12 || 12, undefined),
                    H:    H,
                    HH:   pad(H, undefined),
                    M:    M,
                    MM:   pad(M, undefined),
                    s:    s,
                    ss:   pad(s, undefined),
                    l:    pad(L, 3),
                    L:    pad(L > 99 ? Math.round(L / 10) : L, undefined),
                    t:    H < 12 ? "a" : "p",
                    tt:   H < 12 ? "am" : "pm",
                    T:    H < 12 ? "A" : "P",
                    TT:   H < 12 ? "AM" : "PM",
                    Z:    utc ? "UTC" : (String(date).match(timezone) || [""]).pop().replace(timezoneClip, ""),
                    o:    (o > 0 ? "-" : "+") + pad(Math.floor(Math.abs(o) / 60) * 100 + Math.abs(o) % 60, 4),
                    S:    ["th", "st", "nd", "rd"][d % 10 > 3 ? 0 : (d % 100 - d % 10 != 10) * d % 10]
                };

            return mask.replace(token, function ($0) {
                return $0 in flags ? flags[$0] : $0.slice(1, $0.length - 1);
            });
        };
    }();

    return {
        format: function(date, mask, utc) {
            return dateFormat(date, mask, utc);
        },
        parse: function(date) {
            return dateParse(date);
        }
    };
});

/**
 * 2010-09-14 拔赤
 *        - 仅支持S.Date.format和S.Date.parse，format仅对常用格式进行支持（不超过10个），也可以自定义
 *        - kissy-lang中是否应当增加Lang.type(o)?或者isDate(d)?
 *        - 模块名称取为datetype还是直接用date? 我更倾向于用date
 *        - YUI的datetype花了大量精力对全球语种进行hack，似乎KISSY是不必要的，KISSY只对中文做hack即可
 */
/**
 * @module     日历
 * @creator  拔赤<lijing00333@163.com>
 */
KISSY.add('calendar/page', function(S, UA, Node, Calendar) {

    S.augment(Calendar, {

        Page: function(config, father) {
            /**
             * 子日历构造器
             * @constructor S.Calendar.Page
             * @param {object} config ,参数列表，需要指定子日历所需的年月
             * @param {object} father,指向Y.Calendar实例的指针，需要共享父框的参数
             * @return 子日历的实例
             */

            //属性
            this.father = father;
            this.month = Number(config.month);
            this.year = Number(config.year);
            this.prevArrow = config.prevArrow;
            this.nextArrow = config.nextArrow;
            this.node = null;
            this.timmer = null;//时间选择的实例
            this.id = '';
            this.EV = [];
            this.html = [
                '<div class="ks-cal-box" id="{$id}">',
                '<div class="ks-cal-hd">',
                '<a href="javascript:void(0);" class="ks-prev {$prev}"><</a>',
                '<a href="javascript:void(0);" class="ks-title">{$title}</a>',
                '<a href="javascript:void(0);" class="ks-next {$next}">></a>',
                '</div>',
                '<div class="ks-cal-bd">',
                '<div class="ks-whd">',
                /*
                 '<span>日</span>',
                 '<span>一</span>',
                 '<span>二</span>',
                 '<span>三</span>',
                 '<span>四</span>',
                 '<span>五</span>',
                 '<span>六</span>',
                 */
                father._handleOffset().day_html,
                '</div>',
                '<div class="ks-dbd ks-clearfix">',
                '{$ds}',
                /*
                 <a href="" class="ks-null">1</a>
                 <a href="" class="ks-disabled">3</a>
                 <a href="" class="ks-selected">1</a>
                 <a href="" class="ks-today">1</a>
                 <a href="">1</a>
                 */
                '</div>',
                '</div>',
                '<div class="ks-setime hidden">',
                '</div>',
                '<div class="ks-cal-ft {$showtime}">',
                '<div class="ks-cal-time">',
                '时间：00:00 &hearts;',
                '</div>',
                '</div>',
                '<div class="ks-selectime hidden">',//<!--用以存放点选时间的一些关键值-->',
                '</div>',
                '</div><!--#ks-cal-box-->'
            ].join("");
            this.nav_html = [
                '<p>',
                '月',
                '<select' +
                    ' value="{$the_month}">',
                '<option class="m1" value="1">01</option>',
                '<option class="m2" value="2">02</option>',
                '<option class="m3" value="3">03</option>',
                '<option class="m4" value="4">04</option>',
                '<option class="m5" value="5">05</option>',
                '<option class="m6" value="6">06</option>',
                '<option class="m7" value="7">07</option>',
                '<option class="m8" value="8">08</option>',
                '<option class="m9" value="9">09</option>',
                '<option class="m10" value="10">10</option>',
                '<option class="m11" value="11">11</option>',
                '<option class="m12" value="12">12</option>',
                '</select>',
                '</p>',
                '<p>',
                '年',
                '<input type="text" value="{$the_year}" onfocus="this.select()"/>',
                '</p>',
                '<p>',
                '<button class="ok">确定</button><button class="cancel">取消</button>',
                '</p>'
            ].join("");


            //方法
            //常用的数据格式的验证
            this.Verify = function() {

                var isDay = function(n) {
                    if (!/^\d+$/i.test(n)) {
                        return false;
                    }
                    n = Number(n);
                    return !(n < 1 || n > 31);

                },
                    isYear = function(n) {
                        if (!/^\d+$/i.test(n)) {
                            return false;
                        }
                        n = Number(n);
                        return !(n < 100 || n > 10000);

                    },
                    isMonth = function(n) {
                        if (!/^\d+$/i.test(n)) {
                            return false;
                        }
                        n = Number(n);
                        return !(n < 1 || n > 12);


                    };

                return {
                    isDay:isDay,
                    isYear:isYear,
                    isMonth:isMonth

                };


            };

            /**
             * 渲染子日历的UI
             */
            this._renderUI = function() {
                var cc = this,_o = {},ft;
                cc.HTML = '';
                _o.prev = '';
                _o.next = '';
                _o.title = '';
                _o.ds = '';
                if (!cc.prevArrow) {
                    _o.prev = 'hidden';
                }
                if (!cc.nextArrow) {
                    _o.next = 'hidden';
                }
                if (!cc.father.showtime) {
                    _o.showtime = 'hidden';
                }
                _o.id = cc.id = 'ks-cal-' + Math.random().toString().replace(/.\./i, '');
                _o.title = cc.father._getHeadStr(cc.year, cc.month);
                cc.createDS();
                _o.ds = cc.ds;
                cc.father.con.append(cc.father._templetShow(cc.html, _o));
                cc.node = Node.one('#' + cc.id);
                if (cc.father.showTime) {
                    ft = cc.node.one('.ks-cal-ft');
                    ft.removeClass('hidden');
                    cc.timmer = new cc.father.TimeSelector(ft, cc.father);
                }
                return this;
            };
            /**
             * 创建子日历的事件
             */
            this._buildEvent = function() {
                var cc = this,i,
                    con = Node.one('#' + cc.id);
                //flush event
                for (i = 0; i < cc.EV.length; i++) {
                    if (typeof cc.EV[i] != 'undefined') {
                        cc.EV[i].detach();
                    }
                }

                cc.EV[0] = con.one('div.ks-dbd').on('click', function(e) {
                    //e.preventDefault();
                    e.target = Node(e.target);
                    if (e.target.hasClass('ks-null')) {
                        return;
                    }
                    if (e.target.hasClass('ks-disabled')) {
                        return;
                    }
                    var selectedd = Number(e.target.html());
                    //如果当天是30日或者31日，设置2月份就会出问题
                    var d = new Date('2010/01/01');
                    d.setYear(cc.year);
                    d.setMonth(cc.month);
                     d.setDate(selectedd);
                    //self.callback(d);
                    //datetime的date
                    cc.father.dt_date = d;
                    cc.father.fire('select', {
                        date:d
                    });
                    if (cc.father.popup && cc.father.closable) {
                        cc.father.hide();
                    }
                    if (cc.father.rangeSelect) {
                        cc.father._handleRange(d);
                    }
                    cc.father.render({selected:d});
                });
                //向前
                cc.EV[1] = con.one('a.ks-prev').on('click', function(e) {
                    e.preventDefault();
                    cc.father._monthMinus().render();
                    cc.father.fire('monthChange', {
                        date:new Date(cc.father.year + '/' + (cc.father.month + 1) + '/01')
                    });

                });
                //向后
                cc.EV[2] = con.one('a.ks-next').on('click', function(e) {
                    e.preventDefault();
                    cc.father._monthAdd().render();
                    cc.father.fire('monthChange', {
                        date:new Date(cc.father.year + '/' + (cc.father.month + 1) + '/01')
                    });
                });
                if (cc.father.navigator) {
                    cc.EV[3] = con.one('a.ks-title').on('click', function(e) {
                        try {
                            cc.timmer.hidePopup();
                            e.preventDefault();
                        } catch(exp) {
                        }
                        e.target = Node(e.target);
                        var setime_node = con.one('.ks-setime');
                        setime_node.html('');
                        var in_str = cc.father._templetShow(cc.nav_html, {
                            the_month:cc.month + 1,
                            the_year:cc.year
                        });
                        setime_node.html(in_str);
                        setime_node.removeClass('hidden');
                        con.one('input').on('keydown', function(e) {
                            e.target = Node(e.target);
                            if (e.keyCode == 38) {//up
                                e.target.val(Number(e.target.val()) + 1);
                                e.target[0].select();
                            }
                            if (e.keyCode == 40) {//down
                                e.target.val(Number(e.target.val()) - 1);
                                e.target[0].select();
                            }
                            if (e.keyCode == 13) {//enter
                                var _month = con.one('.ks-setime').one('select').val();
                                var _year = con.one('.ks-setime').one('input').val();
                                con.one('.ks-setime').addClass('hidden');
                                if (!cc.Verify().isYear(_year)) {
                                    return;
                                }
                                if (!cc.Verify().isMonth(_month)) {
                                    return;
                                }
                                cc.father.render({
                                    date:new Date(_year + '/' + _month + '/01')
                                });
                                cc.father.fire('monthChange', {
                                    date:new Date(_year + '/' + _month + '/01')
                                });
                            }
                        });
                    });
                    cc.EV[4] = con.one('.ks-setime').on('click', function(e) {
                        e.preventDefault();
                        e.target = Node(e.target);
                        if (e.target.hasClass('ok')) {
                            var _month = con.one('.ks-setime').one('select').val(),
                                _year = con.one('.ks-setime').one('input').val();
                            con.one('.ks-setime').addClass('hidden');
                            if (!cc.Verify().isYear(_year)) {
                                return;
                            }
                            if (!cc.Verify().isMonth(_month)) {
                                return;
                            }
                            cc.father.render({
                                date:new Date(_year + '/' + _month + '/01')
                            });
                            cc.father.fire('monthChange', {
                                date:new Date(_year + '/' + _month + '/01')
                            });
                        } else if (e.target.hasClass('cancel')) {
                            con.one('.ks-setime').addClass('hidden');
                        }
                    });
                }
                return this;

            };
            /**
             * 得到当前子日历的node引用
             */
            this._getNode = function() {
                var cc = this;
                return cc.node;
            };
            /**
             * 得到某月有多少天,需要给定年来判断闰年
             */
            this._getNumOfDays = function(year, month) {
                return 32 - new Date(year, month - 1, 32).getDate();
            };
            /**
             * 生成日期的html
             */
            this.createDS = function() {
                var cc = this,
                    s = '',
                    startweekday = (new Date(cc.year + '/' + (cc.month + 1) + '/01').getDay() + cc.father.startDay + 7) % 7,//当月第一天是星期几
                    k = cc._getNumOfDays(cc.year, cc.month + 1) + startweekday,
                    i, _td_s;

                for (i = 0; i < k; i++) {
                    //prepare data {{
                    if (/532/.test(UA['webkit'])) {//hack for chrome
                        _td_s = new Date(cc.year + '/' + Number(cc.month + 1) + '/' + (i + 1 - startweekday).toString());
                    } else {
                        _td_s = new Date(cc.year + '/' + Number(cc.month + 1) + '/' + (i + 2 - startweekday).toString());
                    }
                    var _td_e = new Date(cc.year + '/' + Number(cc.month + 1) + '/' + (i + 1 - startweekday).toString());
                    //prepare data }}
                    if (i < startweekday) {//null
                        s += '<a href="javascript:void(0);" class="ks-null">0</a>';
                    } else if (cc.father.minDate instanceof Date &&
                        new Date(cc.year + '/' + (cc.month + 1) + '/' + (i + 2 - startweekday)).getTime() < (cc.father.minDate.getTime() + 1)) {//disabled
                        s += '<a href="javascript:void(0);" class="ks-disabled">' + (i - startweekday + 1) + '</a>';

                    } else if (cc.father.maxDate instanceof Date &&
                        new Date(cc.year + '/' + (cc.month + 1) + '/' + (i + 1 - startweekday)).getTime() > cc.father.maxDate.getTime()) {//disabled
                        s += '<a href="javascript:void(0);" class="ks-disabled">' + (i - startweekday + 1) + '</a>';


                    } else if ((cc.father.range.start !== null && cc.father.range.end !== null) && //日期选择范围
                       (  _td_s.getTime() >= cc.father._showdate(1,cc.father.range.start).getTime() && _td_e.getTime() < cc.father._showdate(1,cc.father.range.end).getTime())) {

                        if (i == (startweekday + (new Date()).getDate() - 1) &&
                            (new Date()).getFullYear() == cc.year &&
                            (new Date()).getMonth() == cc.month) {//今天并被选择
                            s += '<a href="javascript:void(0);" class="ks-range ks-today">' + (i - startweekday + 1) + '</a>';
                        } else {
                            s += '<a href="javascript:void(0);" class="ks-range">' + (i - startweekday + 1) + '</a>';
                        }

                    } else if (i == (startweekday + (new Date()).getDate() - 1) &&
                        (new Date()).getFullYear() == cc.year &&
                        (new Date()).getMonth() == cc.month) {//today
                        s += '<a href="javascript:void(0);" class="ks-today">' + (i - startweekday + 1) + '</a>';

                    } else if (i == (startweekday + cc.father.selected.getDate() - 1) &&
                        cc.month == cc.father.selected.getMonth() &&
                        cc.year == cc.father.selected.getFullYear()) {//selected
                        s += '<a href="javascript:void(0);" class="ks-selected">' + (i - startweekday + 1) + '</a>';
                    } else {//other
                        s += '<a href="javascript:void(0);">' + (i - startweekday + 1) + '</a>';
                    }
                }
                if (k % 7 !== 0) {
                    for (i = 0; i < (7 - k % 7); i++) {
                        s += '<a href="javascript:void(0);" class="ks-null">0</a>';
                    }
                }
                cc.ds = s;
                return this;
            };
            /**
             * 渲染
             */
            this.render = function() {
                var cc = this;
                cc._renderUI();
                cc._buildEvent();
                return this;
            };


        }//Page constructor over
    });
    return Calendar;
}, { requires:["ua","node","calendar/base"] });
/**
 * @module     日历
 * @creator  拔赤<lijing00333@163.com>
 */
KISSY.add('calendar/time', function(S, Node,Calendar) {

    S.augment(Calendar, {

        /**
         * 时间选择构造器
         * @constructor S.Calendar.TimerSelector
         * @param {object} ft ,timer所在的容器
         * @param {object} father 指向S.Calendar实例的指针，需要共享父框的参数
         */
        TimeSelector:function(ft, father) {
            //属性
            this.father = father;
            this.fcon = ft.parent('.ks-cal-box');
            this.popupannel = this.fcon.one('.ks-selectime');//点选时间的弹出层
            if (typeof father._time == 'undefined') {//确保初始值和当前时间一致
                father._time = new Date();
            }
            this.time = father._time;
            this.status = 's';//当前选择的状态，'h','m','s'依次判断更新哪个值
            this.ctime = Node('<div class="ks-cal-time">时间：<span class="h">h</span>:<span class="m">m</span>:<span class="s">s</span><!--{{arrow--><div class="cta"><button class="u"></button><button class="d"></button></div><!--arrow}}--></div>');
            this.button = Node('<button class="ct-ok">确定</button>');
            //小时
            this.h_a = ['00','01','02','03','04','05','06','07','08','09','10','11','12','13','14','15','16','17','18','19','20','21','22','23'];
            //分钟
            this.m_a = ['00','10','20','30','40','50'];
            //秒
            this.s_a = ['00','10','20','30','40','50'];


            //方法
            /**
             * 创建相应的容器html，值均包含在a中
             * 参数：要拼装的数组
             * 返回：拼好的innerHTML,结尾还要带一个关闭的a
             *
             */
            this.parseSubHtml = function(a) {
                var in_str = '';
                for (var i = 0; i < a.length; i++) {
                    in_str += '<a href="javascript:void(0);" class="item">' + a[i] + '</a>';
                }
                in_str += '<a href="javascript:void(0);" class="x">x</a>';
                return in_str;
            };
            /**
             * 显示ks-selectime容器
             * 参数，构造好的innerHTML
             */
            this.showPopup = function(instr) {
                var self = this;
                this.popupannel.html(instr);
                this.popupannel.removeClass('hidden');
                var status = self.status;
                self.ctime.all('span').removeClass('on');
                switch (status) {
                    case 'h':
                        self.ctime.all('.h').addClass('on');
                        break;
                    case 'm':
                        self.ctime.all('.m').addClass('on');
                        break;
                    case 's':
                        self.ctime.all('.s').addClass('on');
                        break;
                }
            };
            /**
             * 隐藏ks-selectime容器
             */
            this.hidePopup = function() {
                this.popupannel.addClass('hidden');
            };
            /**
             * 不对其做更多的上下文假设，仅仅根据time显示出来
             */
            this.render = function() {
                var self = this;
                var h = self.get('h');
                var m = self.get('m');
                var s = self.get('s');
                self.father._time = self.time;
                self.ctime.all('.h').html(h);
                self.ctime.all('.m').html(m);
                self.ctime.all('.s').html(s);
                return self;
            };
            //这里的set和get都只是对time的操作，并不对上下文做过多假设
            /**
             * set(status,v)
             * h:2,'2'
             */
            this.set = function(status, v) {
                var self = this;
                v = Number(v);
                switch (status) {
                    case 'h':
                        self.time.setHours(v);
                        break;
                    case 'm':
                        self.time.setMinutes(v);
                        break;
                    case 's':
                        self.time.setSeconds(v);
                        break;
                }
                self.render();
            };
            /**
             * get(status)
             */
            this.get = function(status) {
                var self = this;
                var time = self.time;
                switch (status) {
                    case 'h':
                        return time.getHours();
                    case 'm':
                        return time.getMinutes();
                    case 's':
                        return time.getSeconds();
                }
            };

            /**
             * add()
             * 状态值代表的变量增1
             */
            this.add = function() {
                var self = this;
                var status = self.status;
                var v = self.get(status);
                v++;
                self.set(status, v);
            };
            /**
             * minus()
             * 状态值代表的变量增1
             */
            this.minus = function() {
                var self = this;
                var status = self.status;
                var v = self.get(status);
                v--;
                self.set(status, v);
            };


            //构造
            this._init = function() {
                var self = this;
                ft.html('').append(self.ctime);
                ft.append(self.button);
                self.render();
                self.popupannel.on('click', function(e) {
                    var el = Node(e.target);
                    if (el.hasClass('x')) {//关闭
                        self.hidePopup();
                    } else if (el.hasClass('item')) {//点选一个值
                        var v = Number(el.html());
                        self.set(self.status, v);
                        self.hidePopup();
                    }
                });
                //确定的动作
                self.button.on('click', function() {
                    //初始化读取父框的date
                    var d = typeof self.father.dt_date == 'undefined' ? self.father.date : self.father.dt_date;
                    d.setHours(self.get('h'));
                    d.setMinutes(self.get('m'));
                    d.setSeconds(self.get('s'));
                    self.father.fire('timeSelect', {
                        date:d
                    });
                    if (self.father.popup && self.father.closable) {
                        self.father.hide();
                    }
                });
                //ctime上的键盘事件，上下键，左右键的监听
                //TODO 考虑是否去掉
                self.ctime.on('keyup', function(e) {
                    if (e.keyCode == 38 || e.keyCode == 37) {//up or left
                        //e.stopPropagation();
                        e.preventDefault();
                        self.add();
                    }
                    if (e.keyCode == 40 || e.keyCode == 39) {//down or right
                        //e.stopPropagation();
                        e.preventDefault();
                        self.minus();
                    }
                });
                //上的箭头动作
                self.ctime.one('.u').on('click', function() {
                    self.hidePopup();
                    self.add();
                });
                //下的箭头动作
                self.ctime.one('.d').on('click', function() {
                    self.hidePopup();
                    self.minus();
                });
                //弹出选择小时
                self.ctime.one('.h').on('click', function() {
                    var in_str = self.parseSubHtml(self.h_a);
                    self.status = 'h';
                    self.showPopup(in_str);
                });
                //弹出选择分钟
                self.ctime.one('.m').on('click', function() {
                    var in_str = self.parseSubHtml(self.m_a);
                    self.status = 'm';
                    self.showPopup(in_str);
                });
                //弹出选择秒
                self.ctime.one('.s').on('click', function() {
                    var in_str = self.parseSubHtml(self.s_a);
                    self.status = 's';
                    self.showPopup(in_str);
                });


            };
            this._init();


        }

    });

    return Calendar;

}, { requires:["node","calendar/base"] });
KISSY.add("calendar", function(S, C, Page, Time, Date) {
    S.Calendar = C;
    S.Date = Date;
    return C;
}, {
    requires:["calendar/base","calendar/page","calendar/time","calendar/date"]
});
/*
Copyright 2011, KISSY UI Library v1.20dev
MIT Licensed
build time: Sep 22 13:54
*/
/**
 * deletable menuitem
 * @author yiminghe@gmail.com
 */
KISSY.add("menu/delmenuitem", function(S, Node, UIBase, Component, MenuItem, DelMenuItemRender) {
    var $ = Node.all;
    var CLS = DelMenuItemRender.CLS,
        DEL_CLS = DelMenuItemRender.DEL_CLS;

    function del(self) {
        var parent = self.get("parent");
        if (parent.fire("beforeDelete", {
            target:self
        }) === false) {
            return;
        }
        parent.removeChild(self, true);
        parent.set("highlightedItem", null);
        parent.fire("delete", {
            target:self
        });
    }

    var DelMenuItem = UIBase.create(MenuItem, {
        _performInternal:function(e) {
            var target = $(e.target);
            // 点击了删除
            if (target.hasClass(this.getCls(DEL_CLS))) {
                del(this);
                return true;
            }
            return MenuItem.prototype._performInternal.call(this, e);
        },
        _handleKeydown:function(e) {
            // d 键
            if (e.keyCode === Node.KeyCodes.D) {
                del(this);
                return true;
            }
        }
    }, {
        ATTRS:{
            delTooltip:{
                view:true
            }
        },
        DefaultRender:DelMenuItemRender
    });


    Component.UIStore.setUIByClass(CLS, {
        priority:Component.UIStore.PRIORITY.LEVEL4,
        ui:DelMenuItem
    });
    return DelMenuItem;
}, {
    requires:['node','uibase','component','./menuitem','./delmenuitemrender']
});/**
 * deletable menuitemrender
 * @author yiminghe@gmail.com
 */
KISSY.add("menu/delmenuitemrender", function(S, Node, UIBase, Component, MenuItemRender) {
    var CLS = "menuitem-deletable",
        DEL_CLS = "menuitem-delete";
    var DEL_TMPL = '<span class="{prefixCls}' + DEL_CLS + '" title="{tooltip}">X<' + '/span>';

    function addDel(self) {
        self.get("contentEl").append(S.substitute(DEL_TMPL, {
            prefixCls:self.get("prefixCls"),
            tooltip:self.get("delTooltip")
        }));
    }

    return UIBase.create(MenuItemRender, {
        createDom:function() {
            addDel(this);
        },
        _uiSetContent:function(v) {
            var self = this;
            MenuItemRender.prototype._uiSetContent.call(self, v);
            addDel(self);
        },

        _uiSetDelTooltip:function() {
            this._uiSetContent(this.get("content"));
        }
    }, {
        ATTRS:{
            delTooltip:{}
        },
        HTML_PARSER:{
            delEl:function(el) {
                return el.one(this.getCls(DEL_CLS));
            }
        },
        CLS:CLS,
        DEL_CLS:DEL_CLS
    });
}, {
    requires:['node','uibase','component','./menuitemrender']
});/**
 *  menu where items can be filtered based on user keyboard input
 *  @author yiminghe@gmail.com
 */
KISSY.add("menu/filtermenu", function(S, UIBase, Component, Menu, FilterMenuRender) {

    var HIT_CLS = "menuitem-hit";

    // 转义正则特殊字符，返回字符串用来构建正则表达式
    function regExpEscape(s) {
        return s.replace(/([-()\[\]{}+?*.$\^|,:#<!\\])/g, '\\$1').
            replace(/\x08/g, '\\x08');
    }

    var FilterMenu = UIBase.create(Menu, {
            bindUI:function() {
                var self = this,
                    view = self.get("view"),
                    filterInput = view.get("filterInput");
                /*监控键盘事件*/
                filterInput.on("keyup", self.handleFilterEvent, self);
            },

            _handleMouseEnter:function() {
                var self = this;
                FilterMenu.superclass._handleMouseEnter.apply(self, arguments);
                // 权益解决，filter input focus 后会滚动到牌聚焦处，select 则不会
                // 如果 filtermenu 的菜单项被滚轮滚到后面，点击触发不了，会向前滚动到 filter input
                self.getKeyEventTarget()[0].select();
            },

            handleFilterEvent:function() {
                var self = this,
                    view = self.get("view"),
                    filterInput = view.get("filterInput"),
                    highlightedItem = self.get("highlightedItem");
                /* 根据用户输入过滤 */
                self.set("filterStr", filterInput.val());

                // 如果没有高亮项或者高亮项因为过滤被隐藏了
                // 默认选择符合条件的第一项
                if (!highlightedItem || !highlightedItem.get("visible")) {
                    self.set("highlightedItem",
                        self._getNextEnabledHighlighted(0, 1));
                }
            },

            _uiSetFilterStr:function(v) {
                // 过滤条件变了立即过滤
                this.filterItems(v);
            },

            filterItems:function(str) {
                var self = this,
                    view = self.get("view"),
                    _labelEl = view.get("labelEl"),
                    filterInput = view.get("filterInput");

                // 有过滤条件提示隐藏，否则提示显示
                _labelEl[str ? "hide" : "show"]();

                if (self.get("allowMultiple")) {
                    var enteredItems = [],
                        lastWord;

                    var match = str.match(/(.+)[,，]\s*([^，,]*)/);
                    // 已经确认的项
                    // , 号之前的项必定确认

                    var items = [];

                    if (match) {
                        items = match[1].split(/[,，]/);
                    }

                    // 逗号结尾
                    // 如果可以补全，那么补全最后一项为第一个高亮项
                    if (/[,，]$/.test(str)) {
                        enteredItems = [];
                        if (match) {
                            enteredItems = items;
                            //待补全的项
                            lastWord = items[items.length - 1];
                            var item = self.get("highlightedItem"),
                                content = item && item.get("content");
                            // 有高亮而且最后一项不为空补全
                            if (content && content.indexOf(lastWord) > -1
                                && lastWord) {
                                enteredItems[enteredItems.length - 1] = content;
                            }
                            filterInput.val(enteredItems.join(",") + ",");
                        }
                        str = '';
                    } else {
                        // 需要菜单过滤的过滤词，在最后一个 , 后面
                        if (match) {
                            str = match[2] || "";
                        }
                        // 没有 , 则就是当前输入的
                        // else{ str=str}

                        //记录下
                        enteredItems = items;
                    }
                    var oldEnteredItems = self.get("enteredItems");
                    // 发生变化，长度变化和内容变化等同
                    if (oldEnteredItems.length != enteredItems.length) {
                        S.log("enteredItems : ");
                        S.log(enteredItems);
                        self.set("enteredItems", enteredItems);
                    }
                }

                var children = self.get("children"),
                    strExp = str && new RegExp(regExpEscape(str), "ig"),
                    // 匹配项样式类
                    hit = this.getCls(HIT_CLS);

                // 过滤所有子组件
                S.each(children, function(c) {
                    var content = c.get("content");
                    if (!str) {
                        // 没有过滤条件
                        // 恢复原有内容
                        // 显示出来
                        c.get("contentEl").html(content);
                        c.set("visible", true);
                    } else {
                        if (content.indexOf(str) > -1) {
                            // 如果符合过滤项
                            // 显示
                            c.set("visible", true);
                            // 匹配子串着重 wrap
                            c.get("contentEl").html(content.replace(strExp, function(m) {
                                return "<span class='" + hit + "'>" + m + "<" + "/span>";
                            }));
                        } else {
                            // 不符合
                            // 隐藏
                            c.set("visible", false);
                        }
                    }
                });
            },

            decorateInternal:function(el) {
                var self = this;
                self.set("el", el);
                var menuContent = el.one("." + self.getCls("menu-content"));
                self.decorateChildren(menuContent);
            },

            /**
             * 重置状态，用于重用
             */
            reset:function() {
                var self = this,
                    view = self.get("view");
                self.set("filterStr", "");
                self.set("enteredItems", []);
                var filterInput = view && view.get("filterInput");
                filterInput && filterInput.val("");
            },

            destructor:function() {
                var view = this.get("view");
                var filterInput = view && view.get("filterInput");
                filterInput && filterInput.detach();
            }

        },
        {
            ATTRS:{
                label:{
                    view:true
                },

                filterStr:{
                },

                enteredItems:{
                    value:[]
                },

                allowMultiple:{
                    value:false
                }
            },
            DefaultRender:FilterMenuRender
        }
    );

    Component.UIStore.setUIByClass("filtermenu", {
        priority:Component.UIStore.PRIORITY.LEVEL2,
        ui:FilterMenu
    });

    return FilterMenu;
}, {
    requires:['uibase','component','./menu','./filtermenurender']
});/**
 * filter menu render
 * 1.create filter input
 * 2.change menu contentelement
 * @author yiminghe@gmail.com
 */
KISSY.add("menu/filtermenurender", function(S, Node, UIBase, MenuRender) {
    var $ = Node.all,
        MENU_FILTER = "menu-filter",
        MENU_FILTER_LABEL = "menu-filter-label",
        MENU_CONTENT = "menu-content";

    return UIBase.create(MenuRender, {
        getContentElement:function() {
            return this.get("menuContent");
        },

        getKeyEventTarget:function() {
            return this.get("filterInput");
        },
        createDom:function() {
            var self = this;
            var contentEl = MenuRender.prototype.getContentElement.call(this);
            var filterWrap = self.get("filterWrap");
            if (!filterWrap) {
                self.set("filterWrap",
                    filterWrap = $("<div class='" + this.getCls(MENU_FILTER) + "'/>")
                        .appendTo(contentEl));
            }
            if (!this.get("labelEl")) {
                this.set("labelEl",
                    $("<div class='" + this.getCls(MENU_FILTER_LABEL) + "'/>")
                        .appendTo(filterWrap));
            }
            if (!self.get("filterInput")) {
                self.set("filterInput", $("<input autocomplete='off'/>")
                    .appendTo(filterWrap));
            }
            if (!self.get("menuContent")) {
                self.set("menuContent",
                    $("<div class='" + this.getCls(MENU_CONTENT) + "'/>")
                        .appendTo(contentEl));
            }
        },

        _uiSetLabel:function(v) {
            this.get("labelEl").html(v);
        }
    }, {

        ATTRS:{
            /* 过滤输入框的提示 */
            label:{}
        },

        HTML_PARSER:{
            labelEl:function(el) {
                return el.one("." + this.getCls(MENU_FILTER))
                    .one("." + this.getCls(MENU_FILTER_LABEL))
            },
            filterWrap:function(el) {
                return el.one("." + this.getCls(MENU_FILTER));
            },
            menuContent:function(el) {
                return el.one("." + this.getCls(MENU_CONTENT));
            },
            filterInput:function(el) {
                return el.one("." + this.getCls(MENU_FILTER)).one("input");
            }
        }
    });

}, {
    requires:['node','uibase','./menurender']
});/**
 * menu model and controller for kissy,accommodate menu items
 * @author yiminghe@gmail.com
 */
KISSY.add("menu/menu", function(S, Event, UIBase, Component, MenuRender) {
    var KeyCodes = Event.KeyCodes;
    var Menu = UIBase.create(Component.Container, {
        _uiSetHighlightedItem:function(v, ev) {
            var pre = ev && ev.prevVal;
            if (pre) {
                pre.set("highlighted", false);
            }
            v && v.set("highlighted", true);
            this.set("activeItem", v);
        },

        _handleBlur:function(e) {
            Menu.superclass._handleBlur.call(this, e);
            this.set("highlightedItem", undefined);
        },


        //dir : -1 ,+1
        //skip disabled items
        _getNextEnabledHighlighted:function(index, dir) {
            var children = this.get("children"),
                len = children.length,
                o = index;
            do {
                var c = children[index];
                if (!c.get("disabled") && (c.get("visible") !== false)) {
                    return children[index];
                }
                index = (index + dir + len) % len;
            } while (index != o);
            return undefined;
        },

        _handleKeydown:function(e) {
            if (this._handleKeyEventInternal(e)) {
                e.halt();
                return true;
            }
            // return false , 会阻止 tab 键 ....
            return undefined;
        },

        /**
         * Attempts to handle a keyboard event; returns true if the event was handled,
         * false otherwise.  If the container is enabled, and a child is highlighted,
         * calls the child control's {@code handleKeyEvent} method to give the control
         * a chance to handle the event first.
         * @param  e Key event to handle.
         * @return {boolean} Whether the event was handled by the container (or one of
         *     its children).
         */
        _handleKeyEventInternal:function(e) {

            // Give the highlighted control the chance to handle the key event.
            var highlightedItem = this.get("highlightedItem");

            // 先看当前活跃 menuitem 是否要处理
            if (highlightedItem && highlightedItem._handleKeydown(e)) {
                return true;
            }

            var children = this.get("children"),len = children.length;

            if (len === 0) {
                return undefined;
            }

            var index,destIndex;

            //自己处理了，不要向上处理，嵌套菜单情况
            switch (e.keyCode) {
                // esc
                case KeyCodes.ESC:
                    // TODO
                    // focus 的话手动失去焦点
                    return undefined;
                    break;

                // home
                case KeyCodes.HOME:
                    this.set("highlightedItem",
                        this._getNextEnabledHighlighted(0, 1));
                    break;
                // end
                case KeyCodes.END:
                    this.set("highlightedItem",
                        this._getNextEnabledHighlighted(len - 1, -1));
                    break;
                // up
                case KeyCodes.UP:
                    if (!highlightedItem) {
                        destIndex = len - 1;
                    } else {
                        index = S.indexOf(highlightedItem, children);
                        destIndex = (index - 1 + len) % len;
                    }
                    this.set("highlightedItem",
                        this._getNextEnabledHighlighted(destIndex, -1));
                    break;
                //down
                case KeyCodes.DOWN:
                    if (!highlightedItem) {
                        destIndex = 0;
                    } else {
                        index = S.indexOf(highlightedItem, children);
                        destIndex = (index + 1 + len) % len;
                    }
                    this.set("highlightedItem",
                        this._getNextEnabledHighlighted(destIndex, 1));
                    break;
                default:
                    return undefined;
            }
            return true;
        },

        bindUI:function() {
            var self = this;
            /**
             * 隐藏后，去掉高亮与当前
             */
            self.on("hide", function() {
                self.set("highlightedItem", undefined);
            });
        },


        containsElement:function(element) {
            if (this.get("view").containsElement(element)) {
                return true;
            }

            var children = this.get('children');

            for (var i = 0, count = children.length; i < count; i++) {
                var child = children[i];
                if (typeof child.containsElement == 'function' &&
                    child.containsElement(element)) {
                    return true;
                }
            }

            return false;
        }
    }, {
        ATTRS:{
            // 普通菜单可聚焦
            // 通过 tab 聚焦到菜单的根节点，通过上下左右操作子菜单项
            focusable:{
                value:true
            },
            visibleMode:{
                value:"display"
            },
            /**
             * 当前高亮的儿子菜单项
             */
            highlightedItem:{},
            /**
             * 当前 active 的子孙菜单项，并不一直等于 highlightedItem
             */
            activeItem:{
                view:true
            }
        },
        DefaultRender:MenuRender
    });

    Component.UIStore.setUIByClass("menu", {
        priority:Component.UIStore.PRIORITY.LEVEL1,
        ui:Menu
    });
    return Menu;

}, {
    requires:['event','uibase','component','./menurender','./submenu']
});

/**
 * TODO
 *  - 去除 activeItem
 **//**
 * menu item ,child component for menu
 * @author yiminghe@gmail.com
 */
KISSY.add("menu/menuitem", function(S, UIBase, Component, MenuItemRender) {

    var $ = S.all;

    var MenuItem = UIBase.create(Component.ModelControl, [UIBase.Contentbox], {

        _handleMouseEnter:function(e) {
            // 父亲不允许自己处理
            if (MenuItem.superclass._handleMouseEnter.call(this, e)) {
                return true;
            }
            this.get("parent").set("highlightedItem", this);
        },

        _handleMouseLeave:function(e) {
            // 父亲不允许自己处理
            if (MenuItem.superclass._handleMouseLeave.call(this, e)) {
                return true;
            }
            this.get("parent").set("highlightedItem", undefined);
        },

        _performInternal:function() {
            // 可选
            if (this.get("selectable")) {
                this.set("selected", true);
            }
            // 可选中，取消选中
            if (this.get("checkable")) {
                this.set("checked", !this.get("checked"));
            }
            this.get("parent").fire("click", {
                // 使用熟悉的 target，而不是自造新词！
                target:this
            });
            return true;
        },

        _uiSetChecked:function(v) {
            this._forwardSetAttrToView("checked", v);
        },

        _uiSetSelected:function(v) {
            this._forwardSetAttrToView("selected", v);
        },

        _uiSetHighlighted:function(v) {
            MenuItem.superclass._uiSetHighlighted.apply(this, arguments);
            // 是否要滚动到当前菜单项(横向，纵向)
            if (v) {
                var el = this.get("el"),
                    // 找到向上路径上第一个可以滚动的容器，直到父组件节点（包括）
                    // 找不到就放弃，为效率考虑不考虑 parent 的嵌套可滚动 div
                    p = el.parent(function(e) {
                        return $(e).css("overflow") != "visible";
                    }, this.get("parent").get("el").parent());
                if (!p) {
                    return;
                }
                el.scrollIntoView(p, undefined, undefined, true);
            }
        },

        containsElement:function(element) {
            return this.get('view').containsElement(element);
        }

    }, {
        ATTRS:{

            /**
             * 是否支持焦点处理
             * @override
             */
            focusable:{
                value:false
            },

            visibleMode:{
                value:"display"
            },

            /**
             * 是否绑定鼠标事件
             * @override
             */
            handleMouseEvents:{
                value:false
            },

            selectable:{
                view:true
            },

            checkable:{
                view:true
            },

            // @inheritedDoc
            // option.text
            // content:{},

            // option.value
            value:{},

            checked:{},
            selected:{}
        },

        HTML_PARSER:{
            selectable:function(el) {
                var cls = this.getCls("menuitem-selectable");
                return el.hasClass(cls);
            }
        }
    });

    MenuItem.DefaultRender = MenuItemRender;

    Component.UIStore.setUIByClass("menuitem", {
        priority:Component.UIStore.PRIORITY.LEVEL1,
        ui:MenuItem
    });

    return MenuItem;
}, {
    requires:['uibase','component','./menuitemrender']
});/**
 * simple menuitem render
 * @author yiminghe@gmail.com
 */
KISSY.add("menu/menuitemrender", function(S, Node, UIBase, Component) {

    var CHECK_CLS = "menuitem-checkbox",
        CONTENT_CLS = "menuitem-content";

    function setUpCheckEl(self) {
        var el = self.get("el"),
            cls = self.getCls(CHECK_CLS),
            checkEl = el.one("." + cls);
        if (!checkEl) {
            checkEl = new Node("<div class='" + cls + "'/>").prependTo(el);
            // if not ie will lose focus when click
            checkEl.unselectable();
        }
        return checkEl;
    }

    return UIBase.create(Component.Render, [UIBase.Contentbox.Render], {
        renderUI:function() {
            var self = this,
                el = self.get("el");
            el.attr("role", "menuitem");
            self.get("contentEl").addClass(self.getCls(CONTENT_CLS));
            if (!el.attr("id")) {
                el.attr("id", S.guid("ks-menuitem"));
            }
        },

        _setSelected:function(v, componentCls) {
            var self = this,
                tag = "-selected",
                el = self.get("el"),
                cls = self._completeClasses(componentCls, tag);
            el[v ? 'addClass' : 'removeClass'](cls);
        },

        _setChecked:function(v, componentCls) {
            var self = this,
                tag = "-checked",
                el = self.get("el"),
                cls = self._completeClasses(componentCls, tag);
            el[v ? 'addClass' : 'removeClass'](cls);
        },

        _uiSetSelectable:function(v) {
            this.get("el").attr("role", v ? 'menuitemradio' : 'menuitem');
        },

        _uiSetCheckable:function(v) {
            if (v) {
                setUpCheckEl(this);
            }
            this.get("el").attr("role", v ? 'menuitemcheckbox' : 'menuitem');
        },

        containsElement:function(element) {
            var el = this.get("el");
            return el[0] == element || el.contains(element);
        }
    }, {
        ATTRS:{
            selected:{},
            // @inheritedDoc
            // content:{},
            // 属性必须声明，否则无法和 _uiSetChecked 绑定在一起
            checked:{}
        }
    });
}, {
    requires:['node','uibase','component']
});/**
 * render aria from menu according to current menuitem
 * @author yiminghe@gmail.com
 */
KISSY.add("menu/menurender", function(S, UA, UIBase, Component) {

    return UIBase.create(Component.Render, [
        UIBase.Contentbox.Render
    ], {

        renderUI:function() {
            var el = this.get("el");
            el .attr("role", "menu")
                .attr("aria-haspopup", true);
            if (!el.attr("id")) {
                el.attr("id", S.guid("ks-menu"));
            }
        },

        _uiSetActiveItem:function(v) {
            var el = this.get("el");
            if (v) {
                var menuItemEl = v.get("el"),
                    id = menuItemEl.attr("id");
                el.attr("aria-activedescendant", id);
                // 会打印重复 ，每个子菜单都会打印，然后冒泡至父菜单，再打印，和该 menuitem 所处层次有关系
                //S.log("menurender :" + el.attr("id") + " _uiSetActiveItem : " + v.get("content"));
            } else {
                el.attr("aria-activedescendant", "");
                //S.log("menurender :" + el.attr("id") + " _uiSetActiveItem : " + "");
            }
        },

        containsElement:function(element) {
            var el = this.get("el");
            return el[0] === element || el.contains(element);
        }
    }, {
        ATTRS:{
            activeItem:{}
        }
    });
}, {
    requires:['ua','uibase','component']
});/**
 * positionable and not focusable menu
 * @author yiminghe@gmail.com
 */
KISSY.add("menu/popupmenu", function(S, UIBase, Component, Menu, PopupMenuRender) {
    var PopMenu = UIBase.create(Menu, [
        UIBase.Position,
        UIBase.Align
    ], {
    }, {
        ATTRS:{
            // 弹出菜单一般不可聚焦，焦点在使它弹出的元素上
            focusable:{
                value:false
            },
            visibleMode:{
                value:"visibility"
            }
        },
        DefaultRender:PopupMenuRender
    });

    Component.UIStore.setUIByClass("popupmenu", {
        priority:Component.UIStore.PRIORITY.LEVEL2,
        ui:PopMenu
    });

    return PopMenu;

}, {
    requires:['uibase','component','./menu','./popupmenurender']
});/**
 * popup menu render
 * @author yiminghe@gmail.com
 */
KISSY.add("menu/popupmenurender", function(S, UA, UIBase, MenuRender) {
    return UIBase.create(MenuRender, [
        UIBase.Position.Render,
        UA['ie'] === 6 ? UIBase.Shim.Render : null
    ]);
}, {
    requires:['ua','uibase','./menurender']
});/**
 * menu separator def
 * @author yiminghe@gmail.com
 */
KISSY.add("menu/separator", function(S, UIBase, Component, SeparatorRender) {

    var Separator = UIBase.create(Component.ModelControl, {
    }, {
        ATTRS:{
            focusable:{
                value:false
            },
            // 分隔线禁用，不可以被键盘访问
            disabled:{
                value:true
            },
            handleMouseEvents:{
                value:false
            }
        },
        DefaultRender:SeparatorRender
    });

    Component.UIStore.setUIByClass("menuseparator", {
        priority:Component.UIStore.PRIORITY.LEVEL2,
        ui:Separator
    });

    return Separator;

}, {
    requires:['uibase','component','./separatorrender']
});/**
 * menu separator render def
 * @author yiminghe@gmail.com
 */
KISSY.add("menu/separatorrender", function(S, UIBase, Component) {

    return UIBase.create(Component.Render, {
        createDom:function() {
            this.get("el").attr("role", "separator");
        }
    });

}, {
    requires:['uibase','component']
});/**
 * submenu model and control for kissy , transfer item's keycode to menu
 * @author yiminghe@gmail.com
 */
KISSY.add(
    /* or precisely submenuitem */
    "menu/submenu",
    function(S, Event, UIBase, Component, MenuItem, SubMenuRender) {

        var KeyCodes = Event.KeyCodes,
            MENU_DELAY = 300;
        /**
         * Class representing a submenu that can be added as an item to other menus.
         */
        var SubMenu = UIBase.create(MenuItem, [Component.DecorateChild], {

                _onParentHide:function() {
                    this.get("menu") && this.get("menu").hide();
                },

                bindUI:function() {
                    /**
                     * 自己不是 menu，自己只是 menuitem，其所属的 menu 为 get("parent")
                     */
                    var self = this,
                        parentMenu = self.get("parent"),
                        menu = this.get("menu");

                    //当改菜单项所属的菜单隐藏后，该菜单项关联的子菜单也要隐藏
                    if (parentMenu) {

                        parentMenu.on("hide", self._onParentHide, self);

                        // 子菜单选中后也要通知父级菜单
                        // 不能使用 afterSelectedItemChange ，多个 menu 嵌套，可能有缓存
                        // 单个 menu 来看可能 selectedItem没有变化
                        menu.on("click", function(ev) {
                            parentMenu.fire("click", {
                                target:ev.target
                            });
                        });

                        // 通知父级菜单
                        menu.on("afterActiveItemChange", function(ev) {
                            parentMenu.set("activeItem", ev.newVal);
                        });
                    }
                    // 访问子菜单，当前 submenu 不隐藏 menu
                    // leave submenuitem -> enter menuitem -> menu item highlight ->
                    // -> menu highlight -> onChildHighlight_ ->

                    // menu render 后才会注册 afterHighlightedItemChange 到 _uiSet
                    // 这里的 onChildHighlight_ 比 afterHighlightedItemChange 先执行
                    // 保险点用 beforeHighlightedItemChange
                    menu.on("beforeHighlightedItemChange", self.onChildHighlight_, self);
                },

                /**
                 * @inheritDoc
                 * Sets a timer to show the submenu
                 **/
                _handleMouseEnter:function(e) {
                    if (SubMenu.superclass._handleMouseEnter.call(this, e)) {
                        return true;
                    }
                    this.clearTimers();
                    this.showTimer_ = S.later(this.showMenu,
                        this.get("menuDelay"), false, this);
                },

                showMenu:function() {
                    var menu = this.get("menu");
                    menu.set("align", S.mix({
                        node:this.get("el"),
                        points:['tr','tl']
                    }, this.get("menuAlign")));
                    menu.render();
                    /**
                     * If activation of your menuitem produces a popup menu,
                     then the menuitem should have aria-haspopup set to the ID of the corresponding menu
                     to allow the assistive technology to follow the menu hierarchy
                     and assist the user in determining context during menu navigation.
                     */
                    this.get("el").attr("aria-haspopup",
                        menu.get("el").attr("id"));
                    menu.show();
                },


                /**
                 * Clears the show and hide timers for the sub menu.
                 */
                clearTimers : function() {
                    if (this.dismissTimer_) {
                        this.dismissTimer_.cancel();
                        this.dismissTimer_ = null;
                    }
                    if (this.showTimer_) {
                        this.showTimer_.cancel();
                        this.showTimer_ = null;
                    }
                },

                /**
                 * Listens to the sub menus items and ensures that this menu item is selected
                 * while dismissing the others.  This handles the case when the user mouses
                 * over other items on their way to the sub menu.
                 * @param  e Highlight event to handle.
                 * @private
                 */
                onChildHighlight_ :function(e) {
                    if (e.newVal) {
                        if (this.get("menu").get("parent") == this) {
                            this.clearTimers();
                            // superclass(menuitem)._handleMouseLeave 已经把自己 highlight 去掉了
                            // 导致本类 _uiSetHighlighted 调用，又把子菜单隐藏了
                            this.get("parent").set("highlightedItem", this);
                        }
                    }
                },

                hideMenu:function() {
                    var menu = this.get("menu");
                    menu && menu.hide();
                },

                // click ，立即显示
                _performInternal:function() {
                    this.clearTimers();
                    this.showMenu();
                },

                /**
                 * Handles a key event that is passed to the menu item from its parent because
                 * it is highlighted.  If the right key is pressed the sub menu takes control
                 * and delegates further key events to its menu until it is dismissed OR the
                 * left key is pressed.
                 * @param e A key event.
                 * @return {boolean} Whether the event was handled.
                 */
                _handleKeydown:function(e) {
                    var self = this;

                    var menu = self.get("menu");

                    var hasKeyboardControl_ = menu && menu.get("visible");

                    var keyCode = e.keyCode;

                    if (!hasKeyboardControl_) {
                        // right
                        if (keyCode == KeyCodes.RIGHT) {
                            self.showMenu();
                            var menuChildren = menu.get("children");
                            if (menuChildren[0]) {
                                menu.set("highlightedItem", menuChildren[0]);
                            }
                        } else {
                            return undefined;
                        }
                    } else if (menu._handleKeydown(e)) {
                    }
                    // The menu has control and the key hasn't yet been handled, on left arrow
                    // we turn off key control.
                    // left
                    else if (keyCode == KeyCodes.LEFT) {
                        self.hideMenu();
                        // 隐藏后，当前激活项重回
                        self.get("parent").set("activeItem", self);
                    } else {
                        return undefined;
                    }
                    return true;
                },

                /**
                 * @inheritDoc
                 * Dismisses the submenu on a delay, with the result that the user needs less
                 * accuracy when moving to submenus.
                 **/
                _uiSetHighlighted:function(highlight, ev) {
                    var self = this;
                    SubMenu.superclass._uiSetHighlighted.call(self, highlight, ev);
                    if (!highlight) {
                        if (self.dismissTimer_) {
                            self.dismissTimer_.cancel();
                        }
                        self.dismissTimer_ = S.later(self.hideMenu,
                            self.get("menuDelay"),
                            false, self);
                    }
                },

                containsElement:function(element) {
                    var menu = this.get("menu");
                    return menu && menu.containsElement(element);
                },

                // 默认 addChild，这里里面的元素需要放到 menu 属性中
                decorateChildrenInternal:function(ui, el, cls) {
                    // 不能用 diaplay:none
                    el.css("visibility", "hidden");
                    var docBody = S.one(el[0].ownerDocument.body);
                    docBody.prepend(el);
                    var menu = new ui({
                        srcNode:el,
                        prefixCls:cls
                    });
                    this.set("menu", menu);
                },

                destructor : function() {
                    var self = this,
                        parentMenu = self.get("parent"),
                        menu = this.get("menu");

                    self.clearTimers();

                    //当改菜单项所属的菜单隐藏后，该菜单项关联的子菜单也要隐藏
                    if (parentMenu) {
                        parentMenu.detach("hide", self._onParentHide, self);
                    }
                    if (!self.get("externalSubMenu") && menu) {
                        menu.destroy();
                    }
                }
            },
            {
                ATTRS:{
                    /**
                     * The delay before opening the sub menu in milliseconds.  (This number is
                     * arbitrary, it would be good to get some user studies or a designer to play
                     * with some numbers).
                     * @type {number}
                     */
                    menuDelay:{
                        value:MENU_DELAY
                    },
                    /**
                     * whether destroy submenu when destroy itself ,reverse result
                     * @type {boolean}
                     */
                    externalSubMenu:{
                        value:false
                    },
                    menuAlign:{},
                    menu:{
                        setter:function(m) {
                            m.set("parent", this);
                        }
                    },
                    decorateChildCls:{
                        value:"popupmenu"
                    }
                },

                DefaultRender:SubMenuRender
            }
        );


        Component.UIStore.setUIByClass("submenu", {
            priority:Component.UIStore.PRIORITY.LEVEL2,
            ui:SubMenu
        });

        return SubMenu;
    }, {
        requires:['event','uibase','component','./menuitem','./submenurender']
    });

/**

 **//**
 * submenu render for kissy ,extend menuitem render with arrow
 * @author yiminghe@gmail.com
 */
KISSY.add("menu/submenurender", function(S, UIBase, MenuItemRender) {
        var SubMenuRender;
        var ARROW_TMPL = '<span class="{prefixCls}submenu-arrow">►<' + '/span>';
        SubMenuRender = UIBase.create(MenuItemRender, {
            renderUI:function() {
                var self = this,
                    el = self.get("el"),
                    contentEl = self.get("contentEl");
                el.attr("aria-haspopup", "true");
                contentEl.append(S.substitute(ARROW_TMPL, {
                    prefixCls:this.get("prefixCls")
                }));
            },
            _uiSetContent:function(v) {
                var self = this;
                SubMenuRender.superclass._uiSetContent.call(self, v);
                self.get("contentEl").append(S.substitute(ARROW_TMPL, {
                    prefixCls:this.get("prefixCls")
                }));
            }

        });
        return SubMenuRender;
    },
    {
        requires:['uibase','./menuitemrender']
    });KISSY.add("menu", function(S, Menu, Render, Item, ItemRender, SubMenu, SubMenuRender, Separator, SeparatorRender, PopupMenu, FilterMenu, DelMenuItem) {
    Menu.Render = Render;
    Menu.Item = Item;
    Menu.Item.Render = ItemRender;
    Menu.SubMenu = SubMenu;
    SubMenu.Render = SubMenuRender;
    Menu.Separator = Separator;
    Menu.PopupMenu = PopupMenu;
    Menu.FilterMenu = FilterMenu;
    Menu.DelMenuItem = DelMenuItem;
    return Menu;
}, {
    requires:[
        'menu/menu',
        'menu/menurender',
        'menu/menuitem',
        'menu/menuitemrender',
        'menu/submenu',
        'menu/submenurender',
        'menu/separator',
        'menu/separatorrender',
        'menu/popupmenu',
        'menu/filtermenu',
        'menu/delmenuitem',
        'menu/delmenuitemrender'
    ]
});
/*
Copyright 2011, KISSY UI Library v1.20dev
MIT Licensed
build time: Sep 23 13:05
*/
/**
 * Model and Control for button
 * @author yiminghe@gmail.com
 */
KISSY.add("button/base", function(S, Event, UIBase, Component, CustomRender) {

    var KeyCodes = Event.KeyCodes,
        Button = UIBase.create(Component.ModelControl, [UIBase.Contentbox], {

            bindUI:function() {
                this.get("el").on("keyup", this._handleKeyEventInternal, this);
            },

            _handleKeyEventInternal:function(e) {
                if (e.keyCode == KeyCodes.ENTER &&
                    e.type == "keydown" ||
                    e.keyCode == KeyCodes.SPACE &&
                        e.type == "keyup") {
                    return this._performInternal(e);
                }
                // Return true for space keypress (even though the event is handled on keyup)
                // as preventDefault needs to be called up keypress to take effect in IE and
                // WebKit.
                return e.keyCode == KeyCodes.SPACE;
            },

            /* button 的默认行为就是触发 click*/
            _performInternal:function() {
                var self = this;
                self.fire("click");
            }
        }, {
            ATTRS:{
                /**
                 * @inheritedDoc
                 * disabled:{}
                 */
                value:{},
                describedby:{
                    view:true
                },
                tooltip:{
                    view:true
                },
                collapseSide:{
                    view:true
                }
            }
        });

    Button.DefaultRender = CustomRender;


    Component.UIStore.setUIByClass("button", {
        priority:Component.UIStore.PRIORITY.LEVEL1,
        ui:Button
    });

    return Button;

}, {
    requires:['event','uibase','component','./customrender']
});/**
 * abstract view for button
 * @author yiminghe@gmail.com
 */
KISSY.add("button/buttonrender", function(S, UIBase, Component) {
    // http://www.w3.org/TR/wai-aria-practices/
    return UIBase.create(Component.Render, {
        createDom:function() {
            //set wai-aria role
            this.get("el").attr("role", "button")
                .addClass(this.getCls("inline-block button"));
        },
        _uiSetTooltip:function(title) {
            this.get("el").attr("title", title);
        },
        _uiSetDescribedby:function(describedby) {
            this.get("el").attr("aria-describedby", describedby);
        },

        _uiSetCollapseSide:function(side) {
            var self = this,
                cls = self.getCls("button-collapse-"),
                el = self.get("el");
            el.removeClass(cls + "left " + cls + "right");
            if (side) {
                el.addClass(cls + side);
            }
        }
    }, {
        ATTRS:{
            /**
             * @inheritedDoc
             * disabled:{}
             */

            /**
             * @inheritedDoc
             * prefixCls:{}
             */

                // aria-describledby support
            describedby:{},
            tooltip:{},
            collapseSide:{}
        }
    });
}, {
    requires:['uibase','component']
});/**
 * view for button , double div for pseudo-round corner
 * @author yiminghe@gmail.com
 */
KISSY.add("button/customrender", function(S, Node, UIBase, ButtonRender) {

    //双层 div 模拟圆角
    var CONTENT_CLS = "button-outer-box",
        INNER_CLS = "button-inner-box";


    return UIBase.create(ButtonRender, [UIBase.Contentbox.Render], {

            /**
             *  modelcontrol 会在 create 后进行 unselectable，
             *  需要所有的节点创建工作放在 createDom 中
             */
            createDom:function() {
                var self = this,
                    el = self.get("el"),
                    contentEl = self.get("contentEl"),
                    id = S.guid('ks-button-labelby');
                el.attr("aria-labelledby", id);
                //按钮的描述节点在最内层，其余都是装饰
                contentEl.addClass(self.getCls(CONTENT_CLS));
                var elChildren = S.makeArray(contentEl[0].childNodes),
                    innerEl = new Node("<div id='" + id + "' " +
                        "class='" + self.getCls(INNER_CLS) + "'/>")
                        .appendTo(contentEl);
                // content 由 contentboxrender 处理
                for (var i = 0; i < elChildren.length; i++) {
                    innerEl.append(elChildren[i]);
                }
                self.set("innerEl", innerEl);
            },

            /**
             * 内容移到内层
             * @override
             * @param v
             */
            _uiSetContent:function(v) {
                var innerEl = this.get("innerEl");
                innerEl.html("");
                v && innerEl.append(v);
            }
        }, {
            /**
             * @inheritedDoc
             * content:{}
             */
            innerEL:{}
        }
    );
}, {
    requires:['node','uibase','./buttonrender']
});/**
 * simple split button ,common usecase :button + menubutton
 * @author yiminghe@gmail.com
 */
KISSY.add("button/split", function(S) {

    var handles = {
        content:function(e) {
            var first = this,t = e.target;
            first.set("content", t.get("content"));
            first.set("value", t.get("value"));
        },
        value:function(e) {
            var first = this,t = e.target;
            first.set("value", t.get("value"));
        }
    };

    function Split() {
        Split.superclass.constructor.apply(this, arguments);
    }

    Split.ATTRS = {
        // 第一个组件按钮
        first:{},
        // 第二个组件
        second:{},
        // 第二个组件的见ring事件
        eventType:{
            value:"click"
        },
        eventHandler:{
            // 或者 value
            value:"content"
        }
    };

    S.extend(Split, S.Base, {
        render:function() {
            var self = this,
                eventType = self.get("eventType"),
                eventHandler = handles[self.get("eventHandler")],
                first = self.get("first"),
                second = self.get("second");
            first.set("collapseSide", "right");
            second.set("collapseSide", "left");
            first.render();
            second.render();
            if (eventType && eventHandler) {
                second.on(eventType, eventHandler, first);
            }
        }
    });

    return Split;

}, {
    requires:['base']
});/**
 * simulated button for kissy , inspired by goog button
 * @author yiminghe@gmail.com
 */
KISSY.add("button", function(S, Button, Render, Split) {
    Button.Render = Render;
    Button.Split = Split;
    return Button;
}, {
    requires:['button/base','button/customrender','button/split']
});
/*
Copyright 2011, KISSY UI Library v1.20dev
MIT Licensed
build time: Sep 23 13:05
*/
/**
 * combination of menu and button ,similar to native select
 * @author yiminghe@gmail.com
 */
KISSY.add("menubutton/menubutton", function(S, UIBase, Node, Button, MenuButtonRender, Menu, Component) {
    var $ = Node.all,
        KeyCodes = Node.KeyCodes,
        ALIGN = {
            points:["bl","tl"],
            overflow:{
                failX:1,
                failY:1,
                adjustX:1,
                adjustY:1
            }
        },
        MenuButton = UIBase.create(Button, [Component.DecorateChild], {

            /**
             * private
             */
            _hideMenu:function() {
                var menu = this.get("menu");
                if (menu) {
                    menu.hide();
                }
            },

            /**
             * private
             */
            _showMenu:function() {
                var self = this,
                    el = self.get("el"),
                    menu = self.get("menu");
                if (menu && !menu.get("visible")) {
                    menu.set("align", S.merge({
                        node:el
                    }, ALIGN, self.get("menuAlign")));
                    menu.show();
                    el.attr("aria-haspopup", menu.get("el").attr("id"));
                }
            },

            _uiSetCollapsed:function(v) {
                if (v) {
                    this._hideMenu();
                } else {
                    this._showMenu();
                }
            },


            _reposition:function() {
                var self = this,
                    menu = self.get("menu"),
                    el = self.get("el");
                if (menu && menu.get("visible")) {
                    menu.set("align", S.mix({
                        node:el
                    }, self.get("menuAlign")));
                }
            },

            /**
             * 产生菜单时对菜单监听，只监听一次
             * @protected
             */
            __bindMenu:function() {
                var self = this,
                    menu = this.get("menu");
                if (menu) {
                    menu.on("afterActiveItemChange", function(ev) {
                        self.set("activeItem", ev.newVal);
                    });

                    menu.on("click", self._handleMenuClick, self);

                    //窗口改变大小，重新调整
                    $(window).on("resize", self._reposition, self);
                    /*
                     bind 与 getMenu 都可能调用，时序不定
                     */
                    self.__bindMenu = S.noop;
                }
            },

            /**
             * @protected
             */
            _handleMenuClick:function(e) {
                this.fire("click", {
                    target:e.target
                });
                this.set("collapsed", true);
            },

            /**
             * @private
             */
            bindUI:function() {
                this.__bindMenu();
            },

            /**
             * @inheritDoc
             */
            _handleKeyEventInternal:function(e) {
                var self = this,menu = self.get("menu");

                // space 只在 keyup 时处理
                if (e.keyCode == KeyCodes.SPACE) {
                    // Prevent page scrolling in Chrome.
                    e.preventDefault();
                    if (e.type != "keyup") {
                        return undefined;
                    }
                } else if (e.type != "keydown") {
                    return undefined;
                }
                //转发给 menu 处理
                if (menu && menu.get("visible")) {
                    var handledByMenu = menu._handleKeydown(e);
                    // esc
                    if (e.keyCode == KeyCodes.ESC) {
                        self.set("collapsed", true);
                        return true;
                    }
                    return handledByMenu;
                }

                // Menu is closed, and the user hit the down/up/space key; open menu.
                if (e.keyCode == KeyCodes.SPACE ||
                    e.keyCode == KeyCodes.DOWN ||
                    e.keyCode == KeyCodes.UP) {
                    self.set("collapsed", false);
                    return true;
                }
                return undefined;
            },

            _performInternal:function() {
                var self = this,menu = self.get("menu");
                if (menu) {
                    if (menu.get("visible")) {
                        // popup menu 监听 doc click ?
                        self.set("collapsed", true);
                    } else {
                        self.set("collapsed", false);
                    }
                }
            },

            /**
             * @inheritDoc
             */
            _handleBlur:function(e) {
                MenuButton.superclass._handleBlur.call(this, e);
                this.set("collapsed", true);
            },

            /**
             * if no menu , then construct
             * @private
             */
            getMenu:function() {
                var self = this,m = self.get("menu");
                if (!m) {
                    m = new Menu.PopupMenu(S.mix({
                        prefixCls:this.get("prefixCls")
                    }, self.get("menuCfg")));
                    self.set("menu", m);
                    self.__bindMenu();
                }
                return m;
            },

            /**
             * Adds a new menu item at the end of the menu.
             * @param item Menu item to add to the menu.
             */
            addItem:function(item, index) {
                this.getMenu().addChild(item, index);
            },

            removeItem:function(c, destroy) {
                this.get("menu") && this.get("menu").removeChild(c, destroy);
            },

            removeItems:function(destroy) {
                this.get("menu") && this.get("menu").removeChildren(destroy);
            },

            getItemAt:function(index) {
                return this.get("menu") && this.get("menu").getChildAt(index);
            },

            // 禁用时关闭已显示菜单
            _uiSetDisabled:function(v) {
                MenuButton.superclass._uiSetDisabled.apply(this, S.makeArray(arguments));
                !v && this.set("collapsed", true);
            },

            /**
             * @private
             */
            decorateChildrenInternal:function(ui, el, cls) {
                // 不能用 diaplay:none , menu 的隐藏是靠 visibility
                // eg: menu.show(); menu.hide();
                el.css("visibility", "hidden");
                var docBody = S.one(el[0].ownerDocument.body);
                docBody.prepend(el);
                var menu = new ui(S.mix({
                    srcNode:el,
                    prefixCls:cls
                }, this.get("menuCfg")));
                this.set("menu", menu);
            },

            /**
             * @private
             */
            destructor:function() {
                var self = this, menu = self.get("menu");
                $(window).detach("resize", self._reposition, self);
                menu && menu.destroy();
            }

        }, {
            ATTRS:{
                activeItem:{
                    view:true
                },
                menuAlign:{
                    value:{}
                },
                menuCfg:{},
                decorateChildCls:{
                    value:"popupmenu"
                },
                // 不关心选中元素 , 由 select 负责
                // selectedItem
                menu:{
                    setter:function(v) {
                        v.set("parent", this);
                    }
                },
                collapsed:{
                    value:true,
                    view:true
                }
            },
            DefaultRender:MenuButtonRender
        });

    Component.UIStore.setUIByClass("menu-button", {
        priority:Component.UIStore.PRIORITY.LEVEL2,
        ui:MenuButton
    });

    return MenuButton;
}, {
    requires:["uibase","node","button","./menubuttonrender","menu","component"]
});/**
 * render aria and drop arrow for menubutton
 * @author  yiminghe@gmail.com
 */
KISSY.add("menubutton/menubuttonrender", function(S, UIBase, Button) {

    var MENU_BUTTON_TMPL = '<div class="{prefixCls}inline-block ' +
        '{prefixCls}menu-button-caption">{content}<' + '/div>' +
        '<div class="{prefixCls}inline-block ' +
        '{prefixCls}menu-button-dropdown">&nbsp;<' + '/div>',
        CAPTION_CLS = "menu-button-caption",
        COLLAPSE_CLS = "menu-button-open";

    return UIBase.create(Button.Render, {

        createDom:function() {
            var innerEl = this.get("innerEl"),
                html = S.substitute(MENU_BUTTON_TMPL, {
                    content:this.get("content") || "",
                    prefixCls:this.get("prefixCls")
                });
            innerEl
                .html(html)
                //带有 menu
                .attr("aria-haspopup", true);
        },

        _uiSetContent:function(v) {
            var caption = this.get("el").one("." + this.getCls(CAPTION_CLS));
            caption.html("");
            v && caption.append(v);
        },

        _uiSetCollapsed:function(v) {
            var self = this,
                el = self.get("el"),
                cls = self.getCls(COLLAPSE_CLS);
            el[v ? 'removeClass' : 'addClass'](cls).attr("aria-expanded", !v);
        },

        _uiSetActiveItem:function(v) {
            this.get("el").attr("aria-activedescendant",
                (v && v.get("el").attr("id")) || "");
        }
    }, {
        ATTRS:{
            activeItem:{
            },
            collapsed:{
            }
        }
    });
}, {
    requires:['uibase','button']
});/**
 * represent a menu option , just make it selectable and can have select status
 * @author yiminghe@gmail.com
 */
KISSY.add("menubutton/option", function(S, UIBase, Component, Menu) {
    var MenuItem = Menu.Item;
    var Option = UIBase.create(MenuItem, {}, {
        ATTRS:{
            selectable:{
                value:true
            }
        }
    });
    Component.UIStore.setUIByClass("option", {
        priority:10,
        ui:Option
    });
    return Option;

}, {
    requires:['uibase','component','menu']
});/**
 * manage a list of single-select options
 * @author yiminghe@gmail.com
 */
KISSY.add("menubutton/select", function(S, Node, UIBase, Component, MenuButton, Menu, Option) {

    function getMenuChildren(self) {
        return self.get("menu") && self.get("menu").get("children") || [];
    }


    var Select = UIBase.create(MenuButton, {

            /**
             * @protected
             */
            __bindMenu :function() {
                var self = this,
                    menu = self.get("menu");
                Select.superclass.__bindMenu.call(self);
                if (menu) {
                    menu.on("show", self._handleMenuShow, self);
                }
            },
            /**
             *  different from menubutton by highlighting the currently selected option
             *  on open menu.
             */
            _handleMenuShow:function() {
                var self = this;
                self.get("menu").set("highlightedItem",
                    self.get("selectedItem") || self.get("menu").getChildAt(0));
            },
            /**
             * @private
             */
            _updateCaption:function() {
                var self = this,
                    item = self.get("selectedItem");
                self.set("content", item ? item.get("content") : self.get("defaultCaption"));
            },
            _handleMenuClick:function(e) {
                var self = this;
                self.set("selectedItem", e.target);
                self.set("collapsed", true);
                Select.superclass._handleMenuClick.call(self, e);
            },

            removeItems:function() {
                var self = this;
                Select.superclass.removeItems.apply(self, arguments);
                self.set("selectedItem", null);
            },
            removeItem:function(c) {
                var self = this;
                Select.superclass.removeItem.apply(self, arguments);
                if (c == self.get("selectedItem")) {
                    self.set("selectedItem", null);
                }
            },
            _uiSetSelectedItem:function(v, ev) {
                if (ev && ev.prevVal) {
                    ev.prevVal.set("selected", false);
                }
                this._updateCaption();
            },
            _uiSetDefaultCaption:function() {
                this._updateCaption();
            }
        },
        {
            ATTRS:{

                // 也是 selectedItem 的一个视图
                value :{
                    getter:function() {
                        var selectedItem = this.get("selectedItem");
                        return selectedItem && selectedItem.get("value");
                    },
                    setter:function(v) {
                        var self = this;
                        var children = getMenuChildren(self);
                        for (var i = 0; i < children.length; i++) {
                            var item = children[i];
                            if (item.get("value") == v) {
                                self.set("selectedItem", item);
                                return;
                            }
                        }
                        self.set("selectedItem", null);
                        return null;
                    }
                },


                // @inheritedDoc  from button
                // content :{}

                selectedItem:{
                },

                // 只是 selectedItem 的一个视图，无状态
                selectedIndex:{
                    setter:function(index) {
                        var self = this,
                            children = getMenuChildren(self);
                        if (index < 0 || index >= children.length) {
                            // 和原生保持一致
                            return -1;
                        }
                        self.set("selectedItem", children[index]);
                    },

                    getter:function() {
                        return S.indexOf(this.get("selectedItem"),
                            getMenuChildren(this));
                    }
                },

                defaultCaption:{
                    value:""
                }
            }
        }
    );

    Select.decorate = function(element, cfg) {
        element = S.one(element);
        cfg = cfg || {};
        cfg.elBefore = element;
        var select = new Select(cfg),
            name,
            selectedItem,
            curValue = element.val(),
            options = element.all("option");

        options.each(function(option) {
            var item = new Option({
                content:option.text(),
                prefixCls:cfg.prefixCls,
                elCls:option.attr("class"),
                value:option.val()
            });
            if (curValue == option.val()) {
                selectedItem = item;
            }
            select.addItem(item);
        });

        select.set("selectedItem", selectedItem);
        select.render();

        if (name = element.attr("name")) {
            var input = new Node("<input type='hidden' name='" + name
                + "' value='" + curValue + "'>").insertBefore(element);

            select.on("afterSelectedItemChange", function(e) {
                if (e.newVal) {
                    input.val(e.newVal.get("value"));
                } else {
                    input.val("");
                }
            });
        }
        element.remove();
        return select;
    };

    Component.UIStore.setUIByClass("select", {
        priority:Component.UIStore.PRIORITY.LEVEL3,
        ui:Select
    });

    return Select;

}, {
    requires:['node','uibase','component','./menubutton','menu','./option']
});

/**
 * TODO
 *  how to emulate multiple ?
 **/KISSY.add("menubutton", function(S, MenuButton, MenuButtonRender, Select, Option) {
    MenuButton.Render = MenuButtonRender;
    MenuButton.Select = Select;
    MenuButton.Option = Option;
    return MenuButton;
}, {
    requires:['menubutton/menubutton',
        'menubutton/menubuttonrender',
        'menubutton/select',
        'menubutton/option']
});
/*
Copyright 2011, KISSY UI Library v1.20dev
MIT Licensed
build time: Sep 22 13:55
*/
/**
 * @author: 常胤 (lzlu.com)
 * @version: 2.0
 * @date: 2011.5.18
 */

KISSY.add("validation/base", function(S, DOM, Event, Util, Define, Field, Warn, Rule) {

    /**
     * KISSY.Validation构造函数
     * @param form {String} 要验证的form表单
     * @param config {Object} 配置
     */
    function Validation(form, config) {
        var self = this;

        if (S.isString(form)) {
            form = S.get(form);
        }

        if (!form) {
            Util.log("请配置正确的form ID.");
            return;
        }

        self._init(form, config || {});
    }


    /**
     * KISSY.Validation原型扩展
     */
    S.augment(Validation, S.EventTarget, {

        /**
         * @private
         * @param form {Element}
         * @param config {Object}
         */
        _init: function(form, config) {
            var self = this;

            //合并默认配置和用户配置
            self.config = S.merge(Define.Config, config);

            /**
             * 当前操作的表单
             * @name Validation.form
             * @type {Element}
             */
            self.form = form;

            //保存所有要操作的KISSY.Validation.Field实例
            self.fields = new Util.storage();

            //初始化字段
            self._initfields();

        },

        /**
         * 初始化所有通过伪属性配置了校验规则的field
         * @private
         */
        _initfields: function() {
            var self = this, cfg = self.config;
            S.each(self.form.elements, function(el) {
                var attr = DOM.attr(el, cfg.attrname);
                if (attr)self.add(el, Util.toJSON(attr.replace(/'/g, '"')));
            });
        },

        /**
         * 添加要校验的field
         * 支持两种方式：
         *     1.Validation.Field实例
         *     2.字段
         * @param {String|Element} field
         * @param {Object} config
         */
        add: function(field, config) {
            var self = this, fields = self.fields,
                cfg = S.merge(self.config, config);

            //直接增加Validation.Field实例
            if (S.isObject(field) && field instanceof Field) {
                fields.add(DOM.attr(field.el, "id"), field);
                return self;
            }

            //实例化Validation.Field后增加
            var el = DOM.get(field) || DOM.get("#" + field), id = DOM.attr(el, "id");

            if (!el || el.form != self.form) {
                Util.log("字段" + field + "不存在或不属于该form");
                return;
            }

            //给对应的field生成一个id
            if (!id) {
                id = cfg.prefix + S.guid();
                DOM.attr(el, "id", id);
            }

            fields.add(id, new Field(el, cfg));
        },

        /**
         * 将已添加的field排除
         * @param {String} field id
         */
        remove: function(field) {
            this.fields.remove(field);
        },

        /**
         * 通过field的id获取对应的field实例
         * @param id {String}
         */
        get: function(id) {
            return this.fields.get(id);
        },

        /**
         * 触发校验,指定字段则只校验指定字段，否则校验所有字段
         * @param {?String}
            * @return {Boolean} 是否验证通过
         */
        isValid: function(field) {
            var self = this, store = self.fields;

            //校验单个字段
            if (field && store.get(field)) {
                return store.get(field).isValid();
            }

            //校验所有字段
            var flag = true;
            store.each(function(id, field) {
                if (!field.isValid()) {
                    flag = false;
                    //验证截至到第一个出错的字段
                    if (field.single) {
                        return false;
                    }
                }
            });

            return flag;
        },


        /**
         * 提交表单,会先校验所有字段
         */
        submit: function() {
            var self = this, flag = self.fire("submit", self.fields);
            if (flag && self.isValid()) {
                self.form.submit();
            }
        }

    });


    S.mix(Validation, {
        Util: Util,
        Define: Define,
        Field: Field,
        Warn: Warn,
        Rule: Rule
    });


    /**
     * @class: Validation表单验证组件
     * @constructor
     */
    return Validation;

}, { requires: ["dom","event","./utils","./define","./field","./warn","./rule"] });/**
 * Validation默认配置和常量
 * @author: 常胤 (lzlu.com)
 */

KISSY.add("validation/define",function(){
	
	var Define = {};
	
	//默认配置
	Define.Config = {
		/**
		 * 伪属性配置名称
		 */
		attrname: 'data-valid',
		/**
		 * 自动生成的字段ID的前缀
		 */
		prefix: "auth-f",
		/**
		 * 默认消息提示类型
		 */
		defaultwarn: "alert"
	};
	
	
	//常量定义
	Define.Const = {
		/**
		 * 字段校验状态枚举
		 * error 错误
		 * ok 正确
		 * hint 提示
		 * ignore 忽略
		 */
		enumvalidsign: {
			error: 0,
			ok: 1,
			hint: 2,
			ignore: 3
		}
	};

	return Define
	
});
/**
 * Validation.Field
 * @author: 常胤 <lzlu.com>
 */
KISSY.add("validation/field", function(S, DOM, Event, Util, Define, Rule, Remote, Warn) {
    var symbol = Define.Const.enumvalidsign,
        doc = document;

    /**
     * @name Validation.Field类
     * @constructor
     * @param el {String|Element} field字段
     * @param config {Object} 配置
     */
    function Field(el, config) {
        var self = this;
        el = S.get(el);
        if (!el) {
            Util.log("字段不存在。");
            return;
        }

        /**
         * field对象
         * @name
         * @type HTMLElement
         */
        self.el = el;

        //保存配置的校验规则
        self.rule = new Util.storage();

        //init
        self._init(config);

    }

    //默认配置
    Field.Config = {
        required: [true,'此项为必填项。'],
        initerror : "data-showerror"
    };

    S.augment(Field, {

        /**
         * init field
         * @private
         */
        _init: function(config) {
            var self = this,
                cfg = S.merge(Field.Config, config || {});


            S.mix(self, cfg, "label");

            //处理字段
            self._initField();

            //初始化字段的验证规则
            self._initVType(cfg);

            //初始化提示组件
            self._initWarn(cfg);

            //显示初始化错误
            if (DOM.attr(self.el, cfg.initerror)) {
                self.showMessage(false, DOM.attr(self.el, cfg.initerror));
            }

        },

        /**
         * 初始化字段,如果是checkbox or radio 则将self.el保存为数组
         * @private
         */
        _initField: function() {
            var self = this, el = self.el;
            //如果为checkbox/radio则保存为数组
            if ("checkbox,radio".indexOf(DOM.attr(el, "type")) > -1) {
                var form = el.form, elName = DOM.attr(el, "name");
                var els = [];
                S.each(doc.getElementsByName(elName), function(item) {
                    if (item.form == form) {
                        els.push(item);
                    }
                });
                self.el = els;
            }
        },

        /**
         * 获取静态配置规则
         * @private
         */
        _initVType: function(vtype) {
            var self = this, el = self.el;

            //从config中获取所有规则
            for (var v in vtype) {
                self.addRule(v, vtype[v]);
            }

            //通过伪属性获取规则
            // TODO

            //ajax校验
            if (vtype['remote']) {
                var ajaxCfg = S.isArray(vtype['remote']) ? {url:vtype['remote'][0]} : vtype['remote'];
                var ajax = new Remote(el, ajaxCfg, function(est, msg) {
                    self.showMessage(est, msg);
                });
                self.addRule("ajax", function(value) {
                    return ajax.check(value);
                });
            }
        },

        /**
         * 初始化提示信息方式
         * 允许通过3种方式配置Warn
         *  1.Warn的实例
         *  2.Warn的名称
         *  3.style名称
         */
        _initWarn: function(config) {
            var self = this,
                clsWarn,    //Warn类
                insWarn,    //Warn实例
                cfg = {};	//传入Warn的配置

            //如果配置Warn类
            if (config.warn) {
                clsWarn = S.isFunction(config.warn) ? config.warn : Warn.get(config.warn);
                cfg = S.merge(config, {});
            }

            //配置样式
            if (config.style && Warn.getStyle(config.style)) {
                var customize = Warn.getStyle(config.style);
                clsWarn = Warn.get(customize.core);
                cfg = S.merge(config, customize);
            }

            if (!clsWarn) {
                Util.log("提示信息类配置错误.");
                return;
            }

            insWarn = new clsWarn(self.el, cfg);


            //绑定验证事件
            insWarn._bindEvent(self.el, config.event || insWarn.event, function() {
                var result = self._validateValue();
                if (S.isArray(result) && result.length == 2) {
                    self.showMessage(result[1], result[0]);
                }
            });

            //将warn赋给field对象
            S.mix(self, {
                warn: insWarn,
                single: insWarn.single
            });

        },


        /**
         * 核心函数，执行校验
         * 1.事件驱动focus，blur,click等
         * 2.方法驱动submit
         */
        _validateValue: function() {
            var self = this,
                rule = self.rule,
                value = self._getValue(),
                rs = rule.getAll(),

                //格式化返回数据
                make = function(estate, msg) {
                    return [msg,estate]
                };

            //无需校验
            if (DOM.attr(self.el, "disabled") || DOM.hasClass(self.el, "disabled")) {
                return make(symbol.ignore, undefined);
            }

            //依赖校验
            if (rs["depend"] && rs["depend"].call(this, value) !== true) {
                return make(symbol.ignore, undefined);
            }

            //执行所有校验
            for (var v in rs) {
                //必填项的特殊处理
                if (v == "required") {
                    var require = rs["required"].call(this, value);
                    if (require) {
                        return self.label ? make(symbol.hint, self.label) : make(symbol.error, require);
                    } else {
                        if (Util.isEmpty(value)) return make(symbol.ignore, "");
                    }
                }
                //依赖校验已经处理了
                if ("depend".indexOf(v) > -1) {
                    continue;
                }
                //ajax不校验
                if ("ajax".indexOf(v) > -1) {
                    break;
                }
                var result = rs[v].call(this, value);
                if (!Util.isEmpty(result)) {
                    self['_ajaxtimer'] && self['_ajaxtimer'].cancel();
                    return make(symbol.error, result);
                }
            }

            //执行ajax校验
            if (rs["ajax"]) {
                return rs["ajax"].call(self, value);
            }

            //通过校验
            return make(symbol.ok, self['okMsg'] || "OK");
        },

        /**
         * 取值
         */
        _getValue: function() {
            var self = this, ele = self.el,
                val = [];
            switch (DOM.attr(ele, "type")) {
                case "select-multiple":
                    S.each(ele.options, function(el) {
                        if (el.selected)val.push(el.value);
                    });
                    break;
                case "radio":
                case "checkbox":
                    S.each(ele, function(el) {
                        if (el.checked)val.push(el.value);
                    });
                    break;
                default:
                    val = DOM.val(ele);
            }
            return val;
        },

        /**
         * @description 给当前field对象增加一条验证规则
         * 如果Auth.Rule中存在直接增加
         * @name
         * @param {String} name 规则名称
         * @param {Object} argument 规则可配置
         */
        addRule: function(name, argument) {
            var self = this, rule = self.rule;

            //通过实例方法直接增加函数
            if (S.isFunction(name)) {
                rule.add(S.guid(), name);
                return self;
            }

            //增加预定义规则
            var r = Rule.get(name, argument);
            if (r) {
                rule.add(name, r);
                return self;
            }

        },

        /**
         * 移除规则
         * 匿名函数不能移除
         * 同一规则配置多次后不能单个移除
         */
        removeRule: function(name) {
            var self = this, rule = self.rule;
            rule.remove(name);
        },

        /**
         * 触发字段的错误显示
         * @param {Object} msg
         */
        showMessage: function(est, msg, type) {
            var self = this;
            self.warn.showMessage(est, msg, type);
        },

        /**
         * 校验field
         */
        isValid: function() {
            var self = this, result = self._validateValue();
            self.showMessage(result[1], result[0]);
            return result[1] != 0;
        }

    });


    return Field;

}, { requires: ['dom',"event","./utils","./define","./rule","./rule/remote","./warn"] });/**
 * 校验规则管理
 * @author: 常胤 <lzlu.com>
 */

KISSY.add("validation/rule", function(S, Util, Rule) {

	return Rule;

}, { requires: ["./utils", "./rule/base", "./rule/normal"] });


/**
 * 规则管理类
 * @author: 常胤 <lzlu.com>
 */
KISSY.add("validation/rule/base", function(S, DOM, Event, Util) {

		/**
		 * 规则对象
		 */
		return new function(){
			var self = this, store = new Util.storage();
			
			/**
			 * 增加规则
			 * @param {String} name 规则名
			 * @param {String} text 提示信息
			 * @param {Function} fn 校验函数
			 */
			self.add = function(name,text,fn){
				if(S.isFunction(fn)){
					store.add(name,{
						name: name,
						fun: fn,
						text: text
					});
				}
			};
			
			/**
			 * 获取规则
			 * @param {String} name 规则名
			 * @return {Object} 规则实例  
			 */
			self.get = function(name,param){
				var r = store.get(name);
				if(!r){
					return null;
				}
				
				var fun = r.fun, tip = r.text;
				/**
				 * 前台调用传参: [param1,param2..tips]
				 * rule定义为: function(value,tips,param1,param2..)
				 * 因此需要格式化参数 [[参数],提示信息]
				 */
				var argLen = fun.length-1, arg = [];
				if(!param){
					arg =  [tip];
				}else if(S.isArray(param)){
					if(param.length>=argLen){
						arg.push(param[param.length-1]);
						arg = arg.concat(param.slice(0,-1));
					}else{
						arg.push(tip);
						arg = arg.concat(param);
					}
				}else{
					if(argLen>0){
						arg.push(tip);
						arg.push(param);
					}else{
						arg.push(tip);
					}
				}
				
				//返回函数
				return function(value){
					return fun.apply(this,[value].concat(arg));
				}	
			};

			/**
			 * 辅助调试
			 * @param {String} name 规则名
			 * @return {string} 规则详细信息
			 */
			self.toString = function(name,template){
				var r = store.get(name);
					template = template || "【规则名】\n {0}\n\n【默认提示信息】\n {1}\n\n【函数体】\n {2}";
				if(r){
					return Util.format(template, r.name, r.text, r.fun.toString());
				}else{
					//return Util.format("规则[{0}]不存在",name);
				}
			};
	
		};

	
}, { requires: ['dom',"event","../utils"] });/**
 * 增加常用校验规则
 * @author: 常胤 <lzlu.com>
 */
KISSY.add("validation/rule/normal", function(S, DOM, Event, Util, Rule) {
	
	//自定义函数
	Rule.add("func","校验失败。",function(value,text,fun){
		var result = fun.call(this,value);

		if(result===false){
			return text;
		}

		if(!Util.isEmpty(result)){
			return result;
		}

	});

	//正则校验
	Rule.add("regex","校验失败。",function(value,text,reg){
		if(!new RegExp(reg).test(value)){
			return text;
		}
	});
	
	
	Rule.add("depend","该字段无需校验",function(value,text,fun){
		return fun.call(this,value);
	});
	
 
	//ajax校验
//	Rule.add("remote","校验失败。",function(value,text,url){
//
//	});
	//ajax校验
	Rule.add("ajax","校验失败。",function(value,text,fun){
		return fun.call(this,value);
	});
	
	//为空校验
	Rule.add("required","此项为必填项。",function(value,text,is){
		if(S.isArray(value) && value.length==0){
			return text;
		}
		if(Util.isEmpty(value) && is){
			return text;
		}
	});

	//重复校验
	Rule.add("equalTo","两次输入不一致。",function(value,text,to){
		if(value !== DOM.val(S.get(to))){
			return text;
		}
	});

	//长度校验
	Rule.add("length","字符长度不能小于{0},且不能大于{1}",function(value,text,minLen,maxLen,realLength){
		var len = Util.getStrLen(value,realLength),
			minl = Util.toNumber(minLen), maxl = Util.toNumber(maxLen);
		if(!(len>=minl && len<=maxl)){
			return Util.format(text,minl,maxl);
		}
	});
	
	//最小长度校验
	Rule.add("minLength","不能小于{0}个字符。",function(value,text,minLen,realLength){
		var len = Util.getStrLen(value,realLength),
			minl = Util.toNumber(minLen);
		if(len<minl){
			return Util.format(text,minl);
		}
	});
	
	//最大长度校验
	Rule.add("maxLength","不能大于{0}个字符。",function(value,text,maxLen,realLength){
		var len = Util.getStrLen(value,realLength),
			maxl = Util.toNumber(maxLen);
		if(len>maxl){
			return Util.format(text,maxl);
		}
	});
	
	//允许格式
	Rule.add("fiter","允许的格式{0}。",function(value,text,type){
		if(!new RegExp( '^.+\.(?=EXT)(EXT)$'.replace(/EXT/g, type.split(/\s*,\s*/).join('|')), 'gi' ).test(value)){
			return Util.format(text,type);
		}
	});
	
	//数值范围校验
	Rule.add("range","只能在{0}至{1}之间。",function(value,text,min,max){
		min = Util.toNumber(min), max = Util.toNumber(max);
		if(value<min || value>max){
			return Util.format(text,min,max);
		}
	});
	
	//checkbox数量校验
	Rule.add("group","只能在{0}至{1}之间。",function(value,text,min,max){
		if(S.isArray(value)){
			var len = value.length;
			if(!(len>=min && len<=max)){
				return Util.format(text, min, max);
			}
		}
	});
	
	//两端不含空格
	Rule.add("trim","两端不能含有空格。",function(value,text){
		if(/(^\s+)|(\s+$)/g.test(value)){
			return text
		}
	});
	
	//左侧不能含有空格
	Rule.add("ltrim","字符串最前面不能包含空格",function(value,text){
		if(/^\s+/g.test(value)){
			return text
		}
	});
	
	//右侧不能含有空格
	Rule.add("rtrim","字符串末尾不能包含空格",function(value,text){
		if(/\s+$/g.test(value)){
			return text
		}
	});
	
	Rule.add("card","身份证号码不正确",function(value,text){
		var iW = [7,9,10,5,8,4,2,1,6,3,7,9,10,5,8,4,2,1],
			iSum = 0;
		for( i=0;i<17;i++){
			iSum += parseInt(value.charAt(i))* iW[i];
		}
		var sJYM = (12-(iSum % 11)) % 11;
		if(sJYM == 10){
			sJYM = 'x';
		}
		var cCheck = value.charAt(17).toLowerCase();
		if( cCheck != sJYM ){
			return text;
		}
	});
	
	
	
	S.each([["chinese",/^[\u0391-\uFFE5]+$/,"只能输入中文"],
			["english",/^[A-Za-z]+$/,"只能输入英文字母"],
			["currency",/^\d+(\.\d+)?$/,"金额格式不正确。"],
			["phone",/^((\(\d{2,3}\))|(\d{3}\-))?(\(0\d{2,3}\)|0\d{2,3}-)?[1-9]\d{6,7}(\-\d{1,4})?$/,"电话号码格式不正确。"],
			["mobile",/^((\(\d{2,3}\))|(\d{3}\-))?13\d{9}$/,"手机号码格式不正确。"],
			["url",/^http:\/\/[A-Za-z0-9]+\.[A-Za-z0-9]+[\/=\?%\-&_~`@[\]':+!]*([^<>""])*$/,"url格式不正确。"],
			["email",/^\w+([-+.]\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*$/,"请输入正确的email格式"]
		],function(item){
			Rule.add(item[0],item[2],function(value,text){
				if(!new RegExp(item[1]).test(value)){
					return text;
				}
			});
		});



}, { requires: ['dom',"event","../utils","./base"] });





/**
 * 远程校验
 * @author: 常胤 <lzlu.com>
 */
KISSY.add("validation/rule/remote", function(S, DOM, Event, Util) {

    function Remote(el, config, callback) {
        var timer = null,
            ajaxHandler = null,
            cache = new Util.storage(),
            elName = DOM.attr(el, "name"),
            cfg = {
                loading: "loading",
                type: 'POST',
                dataType: 'json',
                data: {}
            };

        S.mix(cfg, config);

        function success(val){
            return function(data, textStatus, xhr) {
                if (data && (data.state===true || data.state===false)) {
                    callback(data.state, data.message);
                    if(data.state) {
                        cache.add(val, { est: data.state,msg: data.message});
                    }
                }else{
                    callback(0,"failure");
                }
                //用户自定义回调方法
                if (S.isFunction(config.success)) {
                    config.success.call(this, data, textStatus, xhr);
                }
                ajaxHandler = null;
            };
        }

        cfg.error = function(data, textStatus, xhr) {
            if (S.isFunction(config.error)) {
                config.success.call(this, data, textStatus, xhr);
            }
        };

        function ajax(time, val) {
            S.io(cfg);
        }


        this.check = function(val) {
            //缓存
            var r = cache.get(val);
            if (r) {
                return [r.msg,r.est];
            }

            //延迟校验
            if (timer)timer.cancel();
            timer = S.later(function() {
                if(ajaxHandler){
                    ajaxHandler.abort();
                }
                cfg.data[elName] = val;
                cfg.success = success(val);
                ajaxHandler = S.io(cfg);
            }, 500);
            return [cfg.loading,0];
        }

    }

    return Remote;


}, { requires: ['dom',"event","../utils"] });





/**
 * 工具类
 * @author: 常胤 <lzlu.com>
 */

KISSY.add("validation/utils", function(S, undefined) {

    /**
     * 常用工具类
     */
    var utils = {

        log: S.log,

        /**
         * 转化为JSON对象
         * @param {Object} str
         * @return {Object}
         */
        toJSON: function(str) {
            try {
                eval("var result=" + str);
            } catch(e) {
                return {};
            }
            return result;
            //return S.JSON.parse(str);
        },

        /**
         * 判断是否为空字符串
         * @param {Object} v
         * @return {Boolean}
         */
        isEmpty: function(v) {
            return v === null || v === undefined || v === '';
        },

        /**
         * 格式化参数
         * @param {Object} str 要格式化的字符串
         * @return {String}
         */
        format: function(str) {
            //format("金额必须在{0}至{1}之间",80,100); //result:"金额必须在80至100之间"
            var args = Array.prototype.slice.call(arguments, 1);
            return str.replace(/\{(\d+)\}/g, function(m, i) {
                return args[i];
            });
        },

        /**
         * 转换成数字
         * @param {Object} n
         * @return {number}
         */
        toNumber: function(n) {
            n = new String(n);
            n = n.indexOf(".") > -1 ? parseFloat(n) : parseInt(n);
            return isNaN(n) ? 0 : n;
        },

        /**
         * 获取字符串的长度
         * @example getStrLen('a啊',true); //结果为3
         * @param {Object} str
         * @param {Object} realLength
         * @return {number}
         */
        getStrLen: function(str, realLength) {
            return realLength ? str.replace(/[^\x00-\xFF]/g, '**').length : str.length;
        },


        /**
         * 简单的存储类
         */
        storage: function() {
            this.cache = {};
        }

    };

    S.augment(utils.storage, {

            /**
             * 增加对象
             * @param {Object} key
             * @param {Object} value
             * @param {Object} cover
             */
            add: function(key, value, cover) {
                var self = this, cache = self.cache;
                if (!cache[key] || (cache[key] && (cover == null || cover ))) {
                    cache[key] = value;
                }
            },

            /**
             * 移除对象
             * @param {Object} key
             */
            remove: function(key) {
                var self = this, cache = self.cache;
                if (cache[key]) {
                    delete cache[key]
                }
            },

            /**
             * 获取对象
             * @param {Object} key
             */
            get: function(key) {
                var self = this, cache = self.cache;
                return cache[key] ? cache[key] : null;
            },

            /**
             * 获取所有对象
             */
            getAll: function() {
                return this.cache;
            },

            /**
             * each
             * @param {Object} fun
             */
            each: function(fun) {
                var self = this, cache = self.cache;
                for (var item in cache) {
                    if (fun.call(self, item, cache[item]) === false)break;
                }
            }

        });

    return utils;

});












/**
 * 信息提示类及管理
 * @validationor: 常胤 <lzlu.com>
 */

KISSY.add("validation/warn", function(S, Util, Warn, BaseClass, Alert, Static, Float) {

    /**
     * 增加三种自带的样式
     */
    Warn.extend("Alert", Alert);
    Warn.extend("Static", Static);
    Warn.extend("Float", Float);


    //提示类基类，方便用户自己扩展
    Warn.BaseClass = BaseClass;
    return Warn;

}, { requires: ["./utils","./warn/base","./warn/baseclass","./warn/alert","./warn/static","./warn/float"] });/**
 * 扩展提示类:alert
 * @author: 常胤 <lzlu.com>
 */
KISSY.add("validation/warn/alert", function(S, DOM, Event, Util, Define) {
	var symbol = Define.Const.enumvalidsign;

	function Alert(){
		return {
			init: function(){
				this.single = true;
			},
			showMessage: function(estate,msg) {
				var self = this;
				if(estate == symbol.error){
					self.invalidClass&&DOM.addClass(self.target,self.invalidClass);
					alert(msg);
					self.target.focus();
					return false;
				}else{
					self.invalidClass&&DOM.removeClass(self.target, self.invalidClass);
				}
			},
			style:{
				alert:{
					invalidClass:'vailInvalid'
				}
			}
		}
	}
	
	return Alert;

}, { requires: ['dom',"event","../utils","../define"] });
























	
	
	

/**
 * 提示类管理类
 * @author: 常胤 <lzlu.com>
 */
KISSY.add("validation/warn/base", function(S, DOM, Event, Util, BaseClass) {

    var engine = new Util.storage();
    var style = new Util.storage();

    return{

        /**
         * 扩展你的信息提示类
         * @param name 类名称
         * @param extfun 类或对象
         */
        extend : function(name, extfun) {
            var newwarn = function(target, config) {
                    newwarn.superclass.constructor.call(this, target, config);
                },
                ext = S.isFunction(extfun) ? extfun() : extfun;

            //保存样式
            if (ext.style) {
                for (var s in ext.style) {
                    this.addStyle(s, S.merge(ext.style[s], {core:name}));
                }
                delete ext.style;
            }

            S.extend(newwarn, BaseClass, ext);
            //保存类
            engine.add(name, newwarn);
            return newwarn;
        },

        /**
         * 增加内置风格
         */
        addStyle : function(name, config) {
            style.add(name, config);
        },

        /**
         * 获取内置风格
         */
        getStyle : function(name) {
            return style.get(name);
        },

        /**
         * 获取提示类
         */
        get : function(name) {
            return engine.get(name);
        }

    };


}, { requires: ['dom',"event","../utils","./baseclass"] });
























	
	
	

/**
 * 扩展类基类
 * @author: 常胤 <lzlu.com>
 */

KISSY.add("validation/warn/baseclass", function(S, DOM, Event) {

    function BaseClass(target, config) {
        var self = this;

        /**
         * 目标对象
         * @type HTMLElement
         */
        self.target = S.isArray(target) ? target[target.length - 1] : target;
        self.el = target;

        self.single = false;

        /**
         * 合并配置
         */
        S.mix(self, config || {});

        //初始化
        self.init();
    }

    S.augment(BaseClass, S.EventTarget, {

        /**
         * init
         */
        init: function() {
            //dosth
        },

        /**
         * 给对象绑定事件
         *     - checkbox，radiobox默认只能绑定click事件
         *    - select默认只能绑定change事件
         *     - 如果你有特殊需求也可以重写此方法
         * @param {Element} el
         * @param {String} evttype
         * @param {Function} fun
         */
        _bindEvent: function(el, evttype, fun) {
			if(S.get(el).tagName.toLowerCase()=="select"){
				Event.on(el, "change", fun);
			}else{
				switch ((DOM.attr(el, 'type') || "input").toLowerCase()) {
					case "radio":
					case "checkbox":
						Event.on(el, 'click', fun);
						break;
					case "file":
						Event.on(el, "change", fun);
						break;
					default:
						Event.on(el, evttype, fun);
				}
			}
        },

        /**
         * 显示出错信息
         * @param {Boolean} result
         * @param {String} msg
         */
        showMessage: function(result, msg) {
            result = 1;
            msg = 1;
            evttype = 1;
        }

    });

    return BaseClass;

}, { requires: ['dom',"event"]});/**
 * 扩展提示类：float
 * @author: 常胤 <lzlu.com>
 */
KISSY.add("validation/warn/float", function(S, DOM, Event, Util, Define) {
	var symbol = Define.Const.enumvalidsign;

	function Float(){
		return {
			//出错标记
			invalidCls: "J_Invalid",
			
			//重写init
			init: function(){
				var self = this, tg = self.target,
					panel = DOM.create(self.template),
					msg = DOM.get('div.msg',panel);
				
				
				S.ready(function(){
					document.body.appendChild(panel);
				});
				S.mix(self,{
					panel: S.one(panel),
					msg: S.one(msg)
				});

				//绑定对象的focus,blur事件来显示隐藏消息面板
				Event.on(self.el,"focus",function(ev){
					if(DOM.hasClass(tg,self.invalidCls)){
						self._toggleError(true,ev.target);
					}
				});
				
				Event.on(self.el,"blur",function(){
					self._toggleError(false);
				});
			},

			//处理校验结果
			showMessage: function(result,msg,evttype,target) {
				var self = this,tg = self.target,
					div = self.msg;

				if(symbol.ok==result){
					DOM.removeClass(tg,self.invalidClass);
					div.html('OK');
				}else{
					if(evttype!="submit"){
						self._toggleError(true,target);
					}
					DOM.addClass(tg,self.invalidClass);
					div.html(msg);
				}
			},
			
			//定位
			_pos: function(target){
				var self = this, offset = DOM.offset(target||self.target),
				 ph = self.panel.height(),
					pl = offset.left-10,pt = offset.top-ph-20;
				self.panel.css('left',pl).css('top',pt);
			},
			
			//显示错误
			_toggleError: function(show,target){
				var self = this,panel = self.panel;
				if(show){
					DOM.show(panel);
					self._pos(target);
				}else{
					DOM.hide(panel);
				}
			},
            
			style:{
				"float":{
					template: '<div class="valid-float" style="display:none;"><div class="msg">&nbsp;</div><'+'s>◥◤</s></div>',
					event: 'focus blur',
					invalidClass: 'vailInvalid'
				}
			}
		}
	}
		
	return Float;

}, { requires: ['dom',"event","../utils","../define"] });
























	
	
	

/**
 * 提示类：Static
 * @author: 常胤 <lzlu.com>
 */
KISSY.add("validation/warn/static", function(S, Node, Util, Define) {
    var symbol = Define.Const.enumvalidsign,
        $ = Node.all;

    function Static() {
        return {
            init: function(){
                var self = this, tg = $(self.target), panel;

                //伪属性配置的id
                if(tg.attr("data-message")) {
                    panel = $(tg.attr("data-messagebox"));
                }
                //配置的id
                else if(self.messagebox) {
                    panel = $(self.messagebox);
                }
                //从模版创建
                else {
                    panel = Node(self.template).appendTo(tg.parent());
                }
                
                if(panel) {
                    self.panel = panel;
					self.panelheight = panel.css("height");
                    self.estate = panel.one(".estate");
                    self.label = panel.one(".label");
                    if(!self.estate || !self.label) return;
                    panel.hide();
                }else{
                    return;
                }

            },

            showMessage: function(result, msg) {
                var self = this, tg = $(self.el),
                    panel = self.panel, estate = self.estate, label = self.label,
                    time = S.isNumber(self.anim)?self.anim:0.1;

                if (self.invalidClass) {
                    if (result == symbol.ignore && result == symbol.ok) {
                        tg.removeClass(self.invalidClass);
                    } else {
                        tg.addClass(self.invalidClass);
                    }
                }

                var display = panel.css("display")=="none"?false:true,
					ph = self.panelheight;
                if (result == symbol.ignore) {
                    display && panel.slideUp(time);
                } else {
                    estate.removeClass("ok tip error");
                    if (result == symbol.error) {
                        estate.addClass("error");
                        label.html(msg);
                        display || panel.height(ph).slideDown(time);
                    } else if (result == symbol.ok) {
                        if(self.isok===false) {
                            display && panel.slideUp(time);
                        }else{
                            display || panel.height(ph).slideDown(time);
                            estate.addClass("ok");
                            label.html(self.oktext?self.oktext:msg);
                        }
                    } else if (result == symbol.hint) {
                        estate.addClass("tip");
                        label.html(msg);
                        display || panel.height(ph).slideDown(time);
                    }
                }
            },

            style: {
                text: {
                    template: '<label class="valid-text"><span class="estate"><em class="label"></em></span></label>',
                    event: 'focus blur keyup'
                },
                under: {
                    template: '<div class="valid-under"><p class="estate"><span class="label"></span></p></div>',
                    event: 'focus blur keyup'
                }
            }
        }
    }
    return Static;

}, { requires: ['node',"../utils","../define"] });

/**
 * @description 表单验证组件
 * @author: changyin@taobao.com (lzlu.com)
 * @version: 1.2
 * @date: 2011.06.21
 */
 
KISSY.add("validation", function(S, Validation) {
   		S.Validation = Validation;
	    return Validation;
	}, {
		requires:["validation/base","validation/assets/base.css"]
	}
);
