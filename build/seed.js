/*
Copyright 2013, KISSY UI Library v1.20
MIT Licensed
build time: Apr 15 11:53
*/
/*
 * a seed where KISSY grows up from , KISS Yeah !
 * @author lifesinger@gmail.com,yiminghe@gmail.com
 */
(function (S, undefined) {
    /**
     * @namespace KISSY
     */

    var host = this,
        meta = {
            /**
             * Copies all the properties of s to r.
             * @param deep {boolean} whether recursive mix if encounter object
             * @return {Object} the augmented object
             */
            mix:function (r, s, ov, wl, deep) {
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

        _mix = function (p, r, s, ov, deep) {
            if (ov || !(p in r)) {
                var target = r[p], src = s[p];
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
    // override previous kissy
    S = host[S] = meta.mix(seed, meta);

    S.mix(S, {
        configs:{},
        // S.app() with these members.
        __APP_MEMBERS:['namespace'],
        __APP_INIT_METHODS:['__init'],

        /**
         * The version of the library.
         * @type {String}
         */
        version:'1.20',

        buildTime:'20130415115317',

        /**
         * Returns a new object containing all of the properties of
         * all the supplied objects. The properties from later objects
         * will overwrite those in earlier objects. Passing in a
         * single object will create a shallow copy of it.
         * @return {Object} the new merged object
         */
        merge:function () {
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
        augment:function (/*r, s1, s2, ..., ov, wl*/) {
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
         * @param {Object} [sx] static properties to add/override
         * @return r {Object}
         */
        extend:function (r, s, px, sx) {
            if (!s || !r) {
                return r;
            }

            var create = Object.create ?
                function (proto, c) {
                    return Object.create(proto, {
                        constructor:{
                            value:c
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
        __init:function () {
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
        namespace:function () {
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
        app:function (name, sx) {
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


        config:function (c) {
            var configs, cfg, r;
            for (var p in c) {
                if (c.hasOwnProperty(p)) {
                    if ((configs = this['configs']) &&
                        (cfg = configs[p])) {
                        r = cfg(c[p]);
                    }
                }
            }
            return r;
        },

        /**
         * Prints debug info.
         * @param msg {String} the message to log.
         * @param {String} [cat] the log category for the message. Default
         *        categories are "info", "warn", "error", "time" etc.
         * @param {String} [src] the source of the the message (opt)
         */
        log:function (msg, cat, src) {
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
        error:function (msg) {
            if (S.Config.debug) {
                throw msg;
            }
        },

        /*
         * Generate a global unique id.
         * @param {String} [pre] guid prefix
         * @return {String} the guid
         */
        guid:function (pre) {
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
(function (S, undefined) {

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
        STAMP_MARKER = '__~ks_stamped',
        RE_TRIM = /^[\s\xa0]+|[\s\xa0]+$/g,
        encode = encodeURIComponent,
        decode = decodeURIComponent,
        SEP = '&',
        EQ = '=',
        // [[Class]] -> type pairs
        class2type = {},
        // http://www.owasp.org/index.php/XSS_(Cross_Site_Scripting)_Prevention_Cheat_Sheet
        htmlEntities = {
            '&amp;':'&',
            '&gt;':'>',
            '&lt;':'<',
            '&#x60;':'`',
            '&#x2F;':'/',
            '&quot;':'"',
            '&#x27;':"'"
        },
        reverseEntities = {},
        escapeReg,
        unEscapeReg,
        // - # $ ^ * ( ) + [ ] { } | \ , . ?
        escapeRegExp = /[\-#$\^*()+\[\]{}|\\,.?\s]/g;
    (function () {
        for (var k in htmlEntities) {
            if (htmlEntities.hasOwnProperty(k)) {
                reverseEntities[htmlEntities[k]] = k;
            }
        }
    })();

    function getEscapeReg() {
        if (escapeReg) {
            return escapeReg
        }
        var str = EMPTY;
        S.each(htmlEntities, function (entity) {
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
        S.each(reverseEntities, function (entity) {
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

        /**
         * stamp a object by guid
         * @return guid associated with this object
         */
        stamp:function (o, readOnly, marker) {
            if (!o) {
                return o
            }
            marker = marker || STAMP_MARKER;
            var guid = o[marker];
            if (guid) {
                return guid;
            } else if (!readOnly) {
                try {
                    guid = o[marker] = S.guid(marker);
                }
                catch (e) {
                    guid = undefined;
                }
            }
            return guid;
        },

        noop:function () {
        },

        /**
         * Determine the internal JavaScript [[Class]] of an object.
         */
        type:function (o) {
            return nullOrUndefined(o) ?
                String(o) :
                class2type[toString.call(o)] || 'object';
        },

        isNullOrUndefined:nullOrUndefined,

        isNull:function (o) {
            return o === null;
        },

        isUndefined:function (o) {
            return o === undefined;
        },

        /**
         * Checks to see if an object is empty.
         */
        isEmptyObject:function (o) {
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
        isPlainObject:function (o) {
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
        equals:function (a, b, /*internal use*/mismatchKeys, /*internal use*/mismatchValues) {
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
         * @param input
         * @param {Function} filter filter function
         * @refer http://www.w3.org/TR/html5/common-dom-interfaces.html#safe-passing-of-structured-data
         */
        clone:function (input, filter) {
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
                        S.log("delete CLONE_MARKER error : ");
                        v[CLONE_MARKER] = undefined;
                    }
                }
            });
            memory = null;
            return ret;
        },

        /**
         * Removes the whitespace from the beginning and end of a string.
         */
        trim:trim ?
            function (str) {
                return nullOrUndefined(str) ? EMPTY : trim.call(str);
            } :
            function (str) {
                return nullOrUndefined(str) ? EMPTY : str.toString().replace(RE_TRIM, EMPTY);
            },

        /**
         * Substitutes keywords in a string using an object/array.
         * Removes undefined keywords and ignores escaped keywords.
         */
        substitute:function (str, o, regexp) {
            if (!S.isString(str)
                || !S.isPlainObject(o)) {
                return str;
            }

            return str.replace(regexp || /\\?\{([^{}]+)\}/g, function (match, name) {
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
         * @param {Object} [context]
         */
        each:function (object, fn, context) {
            if (object) {
                var key,
                    val,
                    i = 0,
                    length = object && object.length,
                    isObj = length === undefined || S.type(object) === 'function';

                context = context || host;

                if (isObj) {
                    for (key in object) {
                        // can not use hasOwnProperty
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
        indexOf:indexOf ?
            function (item, arr) {
                return indexOf.call(arr, item);
            } :
            function (item, arr) {
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
        lastIndexOf:(lastIndexOf) ?
            function (item, arr) {
                return lastIndexOf.call(arr, item);
            } :
            function (item, arr) {
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
        unique:function (a, override) {
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
        inArray:function (item, arr) {
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
        filter:filter ?
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
        // https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Array/map
        map:map ?
            function (arr, fn, context) {
                return map.call(arr, fn, context || this);
            } :
            function (arr, fn, context) {
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
         } : */function (arr, callback, initialValue) {
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

        some:some ?
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
         * it is not same with native bind
         * @refer https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Function/bind
         */
        bind:function (fn, obj) {
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
        now:Date.now || function () {
            return +new Date();
        },
        /**
         * frequently used in taobao cookie about nick
         */
        fromUnicode:function (str) {
            return str.replace(/\\u([a-f\d]{4})/ig, function (m, u) {
                return  String.fromCharCode(parseInt(u, HEX_BASE));
            });
        },
        /**
         * escape string to html
         * @refer   http://yiminghe.javaeye.com/blog/788929
         *          http://wonko.com/post/html-escaping
         * @param str {string} text2html show
         */
        escapeHTML:function (str) {
            return str.replace(getEscapeReg(), function (m) {
                return reverseEntities[m];
            });
        },

        escapeRegExp:function (str) {
            return str.replace(escapeRegExp, '\\$&');
        },

        /**
         * unescape html to string
         * @param str {string} html2text
         */
        unEscapeHTML:function (str) {
            return str.replace(getUnEscapeReg(), function (m, n) {
                return htmlEntities[m] || String.fromCharCode(+n);
            });
        },
        /**
         * Converts object to a true array.
         * @param o {object|Array} array like object or array
         * @return {Array}
         */
        makeArray:function (o) {
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
            for (var i = 0, l = o.length; i < l; i++) {
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
        param:function (o, sep, eq, arr) {
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
                if (o.hasOwnProperty(key)) {
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
        unparam:function (str, sep, eq) {
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
                } catch (e) {
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
                        ret[key] = [ret[key], val];
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
         * @param [data] that is provided to the function. This accepts either a single
         *        item or an array. If an array is provided, the function is executed with
         *        one parameter for each array item. If you need to pass a single array
         *        parameter, it needs to be wrapped in an array [myarray].
         * @return {Object} a timer object. Call the cancel() method on this object to stop
         *         the timer.
         */
        later:function (fn, when, periodic, context, data) {
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

            f = function () {
                m.apply(context, d);
            };

            r = (periodic) ? setInterval(f, when) : setTimeout(f, when);

            return {
                id:r,
                interval:periodic,
                cancel:function () {
                    if (this.interval) {
                        clearInterval(r);
                    } else {
                        clearTimeout(r);
                    }
                }
            };
        },

        startsWith:function (str, prefix) {
            return str.lastIndexOf(prefix, 0) === 0;
        },

        endsWith:function (str, suffix) {
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
        throttle:function (fn, ms, context) {
            ms = ms || 150;

            if (ms === -1) {
                return (function () {
                    fn.apply(context || this, arguments);
                });
            }

            var last = S.now();

            return (function () {
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
         * @param {object} [context]
         * @param {Number} ms
         */
        buffer:function (fn, ms, context) {
            ms = ms || 150;

            if (ms === -1) {
                return (function () {
                    fn.apply(context || this, arguments);
                });
            }
            var bufferTimer = null;

            function f() {
                f.stop();
                bufferTimer = S.later(fn, ms, FALSE, context || this,arguments);
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
        function (name, lc) {
            // populate the class2type map
            class2type['[object ' + name + ']'] = (lc = name.toLowerCase());

            // add isBoolean/isNumber/...
            S['is' + name] = function (o) {
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
            if (S.inArray(constructor, [Boolean, String, Number, Date, RegExp])) {
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
            memory[stamp] = {destination:destination, input:input};
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
                if (input.hasOwnProperty(k)) {
                    if (k !== CLONE_MARKER &&
                        (!f || (f.call(input, input[k], k, input) !== FALSE))) {
                        destination[k] = cloneInternal(input[k], f, memory);
                    }
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
        var hasKey = function (obj, keyName) {
            return (obj !== null && obj !== undefined) && obj[keyName] !== undefined;
        };
        for (var property in b) {
            if (b.hasOwnProperty(property)) {
                if (!hasKey(a, property) && hasKey(b, property)) {
                    mismatchKeys.push("expected has key '" + property + "', but missing from actual.");
                }
            }
        }
        for (property in a) {
            if (a.hasOwnProperty(property)) {
                if (!hasKey(b, property) && hasKey(a, property)) {
                    mismatchKeys.push("expected missing key '" + property + "', but present in actual.");
                }
            }
        }
        for (property in b) {
            if (b.hasOwnProperty(property)) {
                if (property == COMPARE_MARKER) {
                    continue;
                }
                if (!S.equals(a[property], b[property], mismatchKeys, mismatchValues)) {
                    mismatchValues.push("'" + property + "' was '" + (b[property] ? (b[property].toString()) : b[property])
                        + "' in expected, but was '" +
                        (a[property] ? (a[property].toString()) : a[property]) + "' in actual.");
                }
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
 * map mechanism
 * @author yiminghe@gmail.com
 */
(function (S, loader) {
    if ("require" in this) {
        return;
    }
    /**
     * modify current module path
     * @param rules
     * @example
     *      [
     *          [/(.+-)min(.js(\?t=\d+)?)$/,"$1$2"],
     *          [/(.+-)min(.js(\?t=\d+)?)$/,function(_,m1,m2){
     *              return m1+m2;
     *          }]
     *      ]
     */
    S.configs.map = function (rules) {
        S.Config.mappedRules = (S.Config.mappedRules || []).concat(rules);
    };

    S.mix(loader, {
        __getMappedPath:function (path) {
            var __mappedRules = S.Config.mappedRules || [];
            for (var i = 0; i < __mappedRules.length; i++) {
                var m, rule = __mappedRules[i];
                if (m = path.match(rule[0])) {
                    return path.replace(rule[0], rule[1]);
                }
            }
            return path;
        }
    });

})(KISSY, KISSY.__loader);/**
 * combine mechanism
 * @author yiminghe@gmail.com
 */
(function (S, loader) {
    if ("require" in this) {
        return;
    }

    var combines;

    /**
     * compress 'from module' to 'to module'
     * {
     *   core:['dom','ua','event','node','json','ajax','anim','base','cookie']
     * }
     */
    combines = S.configs.combines = function (from, to) {
        var cs;
        if (S.isObject(from)) {
            S.each(from, function (v, k) {
                S.each(v, function (v2) {
                    combines(v2, k);
                });
            });
            return;
        }
        cs = S.Config.combines = S.Config.combines || {};
        if (to) {
            cs[from] = to;
        } else {
            return cs[from] || from;
        }
    };

    S.mix(loader, {
        __getCombinedMod:function (modName) {
            var cs;
            cs = S.Config.combines = S.Config.combines || {};
            return cs[modName] || modName;
        }
    });
})(KISSY, KISSY.__loader);/**
 * status constants
 * @author yiminghe@gmail.com
 */
(function(S, data) {
    if ("require" in this) {
        return;
    }
    // 脚本(loadQueue)/模块(mod) 公用状态
    S.mix(data, {
        "INIT":0,
        "LOADING" : 1,
        "LOADED" : 2,
        "ERROR" : 3,
        // 模块特有
        "ATTACHED" : 4
    });
})(KISSY, KISSY.__loaderData);/**
 * utils for kissy loader
 * @author yiminghe@gmail.com
 */
(function(S, loader, utils) {
    if ("require" in this) {
        return;
    }
    var ua = navigator.userAgent,doc = document;
    S.mix(utils, {
        docHead:function() {
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
         * package path 相对地址则相对于当前页面获取绝对地址
         */
        normalBasePath:function (path) {
            path = S.trim(path);

            // path 为空时，不能变成 "/"
            if (path && path.charAt(path.length - 1) != '/') {
                path += "/";
            }

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

        /**
         * 相对路径文件名转换为绝对路径
         * @param path
         */
        absoluteFilePath:function(path) {
            path = utils.normalBasePath(path);
            return path.substring(0, path.length - 1);
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
(function (S, utils) {
    if ("require" in this) {
        return;
    }
    var CSS_POLL_INTERVAL = 30,
        /**
         * central poll for link node
         */
            timer = 0,

        monitors = {
            /**
             * node.id:[callback]
             */
        };

    function startCssTimer() {
        if (!timer) {
            S.log("start css polling");
            cssPoll();
        }
    }

    // single thread is ok
    function cssPoll() {
        for (var url in monitors) {
            var callbacks = monitors[url],
                node = callbacks.node,
                loaded = 0;
            if (utils.isWebKit) {
                if (node['sheet']) {
                    S.log("webkit loaded : " + url);
                    loaded = 1;
                }
            } else if (node['sheet']) {
                try {
                    var cssRules;
                    if (cssRules = node['sheet'].cssRules) {
                        S.log('firefox loaded : ' + url);
                        loaded = 1;
                    }
                } catch (ex) {
                    var exName = ex.name;
                    S.log('firefox getStyle : ' + exName + ' ' + ex.code + ' ' + url);
                    if (exName == 'NS_ERROR_DOM_SECURITY_ERR' ||
                        exName == 'SecurityError') {
                        S.log('firefox loaded : ' + url);
                        loaded = 1;
                    }
                }
            }

            if (loaded) {
                for (var i = 0; i < callbacks.length; i++) {
                    callbacks[i].call(node);
                }
                delete monitors[url];
            }
        }
        if (S.isEmptyObject(monitors)) {
            timer = 0;
            S.log("end css polling");
        } else {
            timer = setTimeout(cssPoll, CSS_POLL_INTERVAL);
        }
    }

    S.mix(utils, {
        scriptOnload:document.addEventListener ?
            function (node, callback) {
                if (utils.isLinkNode(node)) {
                    return utils.styleOnload(node, callback);
                }
                node.addEventListener('load', callback, false);
            } :
            function (node, callback) {
                if (utils.isLinkNode(node)) {
                    return utils.styleOnload(node, callback);
                }
                var oldCallback = node.onreadystatechange;
                node.onreadystatechange = function () {
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
         * 暂时不考虑如何判断失败，如 404 等
         * @refer
         *  - firefox 不可行（结论4错误）：
         *    - http://yearofmoo.com/2011/03/cross-browser-stylesheet-preloading/
         *  - 全浏览器兼容
         *    - http://lifesinger.org/lab/2011/load-js-css/css-preload.html
         *  - 其他
         *    - http://www.zachleat.com/web/load-css-dynamically/
         */
        styleOnload:window.attachEvent || window.opera ?
            // ie/opera
            function (node, callback) {
                // whether to detach using function wrapper?
                function t() {
                    node.detachEvent('onload', t);
                    S.log('ie/opera loaded : ' + node.href);
                    callback.call(node);
                }

                node.attachEvent('onload', t);
            } :
            // refer : http://lifesinger.org/lab/2011/load-js-css/css-preload.html
            // 暂时不考虑如何判断失败，如 404 等
            function (node, callback) {
                var href = node.href, arr;
                arr = monitors[href] = monitors[href] || [];
                arr.node = node;
                arr.push(callback);
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
    var MILLISECONDS_OF_SECOND = 1000,
        scriptOnload = utils.scriptOnload;

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
 * @author  yiminghe@gmail.com,lifesinger@gmail.com
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

})(KISSY, KISSY.__loader, KISSY.__loaderUtils, KISSY.__loaderData);

/**
 * @refer
 *  - https://github.com/amdjs/amdjs-api/wiki/AMD
 **//**
 * build full path from relative path and base path
 * @author  lifesinger@gmail.com,yiminghe@gmail.com
 */
(function (S, loader, utils, data) {
    if ("require" in this) {
        return;
    }
    S.mix(loader, {
        __buildPath:function (mod, base) {
            var self = this,
                Config = self.Config;

            base = base || Config.base;

            build("fullpath", "path");

            if (mod["cssfullpath"] !== data.LOADED) {
                build("cssfullpath", "csspath");
            }

            function build(fullpath, path) {

                if (mod[fullpath + "__builded"]) {
                    return;
                }

                mod[fullpath + "__builded"] = 1;

                if (!mod[fullpath] && mod[path]) {
                    //如果是 ./ 或 ../ 则相对当前模块路径
                    mod[path] = utils.normalDepModuleName(mod.name, mod[path]);
                    mod[fullpath] = base + mod[path];
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

                if (mod[fullpath]) {
                    mod[fullpath] = self.__getMappedPath(mod[fullpath]);
                }

            }
        }
    });
})(KISSY, KISSY.__loader, KISSY.__loaderUtils, KISSY.__loaderData);/**
 * logic for config.global , mainly for kissy.editor
 * @author  lifesinger@gmail.com,yiminghe@gmail.com
 */
(function(S, loader) {
    if ("require" in this) {
        return;
    }
    S.mix(loader, {

        // 按需从 global 迁移模块定义到当前 loader 实例，并根据 global 设置 fullpath
        __mixMod: function(name, global) {
            // 从 __mixMods 调用过来时，可能本实例没有该模块的数据结构
            var self = this,
                mods = self.Env.mods,
                gMods = global.Env.mods,
                mod = mods[name] || {},
                status = mod.status;

            if (gMods[name]) {

                S.mix(mod, S.clone(gMods[name]));

                // status 属于实例，当有值时，不能被覆盖。
                // 1. 只有没有初始值时，才从 global 上继承
                // 2. 初始值为 0 时，也从 global 上继承
                // 其他都保存自己的状态
                if (status) {
                    mod.status = status;
                }
            }

            // 来自 global 的 mod, path 也应该基于 global
            self.__buildPath(mod, global.Config.base);

            mods[name] = mod;
        }
    });
})(KISSY, KISSY.__loader);/**
 * for ie ,find current executive script ,then infer module name
 * @author yiminghe@gmail.com
 */
(function (S, loader, utils) {
    if ("require" in this) {
        return;
    }
    S.mix(loader, {
        //ie 特有，找到当前正在交互的脚本，根据脚本名确定模块名
        // 如果找不到，返回发送前那个脚本
        __findModuleNameByInteractive:function () {
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
            var src = utils.absoluteFilePath(re.src);
            // S.log("interactive src :" + src);
            // 注意：模块名不包含后缀名以及参数，所以去除
            // 系统模块去除系统路径
            // 需要 base norm , 防止 base 被指定为相对路径
            self.Config.base = utils.normalBasePath(self.Config.base);
            if (src.lastIndexOf(self.Config.base, 0)
                === 0) {
                return utils.removePostfix(src.substring(self.Config.base.length));
            }
            var packages = self.Config.packages,
                finalPackagePath,
                finalPackageLength = -1;
            //外部模块去除包路径，得到模块名
            for (var p in packages) {
                if (packages.hasOwnProperty(p)) {
                    var p_path = packages[p].path;
                    if (packages.hasOwnProperty(p) &&
                        src.lastIndexOf(p_path, 0) === 0) {
                        if (p_path.length > finalPackageLength) {
                            finalPackageLength = p_path.length;
                            finalPackagePath = p_path;
                        }
                    }
                }
            }
            if (finalPackagePath) {
                return utils.removePostfix(src.substring(finalPackagePath.length));
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
                // 这个是全局的，防止多实例对同一模块的重复下载
                loadQueque = S.Env._loadQueue,
                status = loadQueque[url],
                node = status;

            mod.status = mod.status || 0;

            // 可能已经由其它模块触发加载
            if (mod.status < LOADING && status) {
                // 该模块是否已经载入到 global ?
                mod.status = status === LOADED ? LOADED : LOADING;
            }

            // 1.20 兼容 1.1x 处理：加载 cssfullpath 配置的 css 文件
            // 仅发出请求，不做任何其它处理
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
                node = S.getScript(url, {
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
                            // 模块载入后，如果需要也要混入对应 global 上模块定义
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

                loadQueque[url] = node;
            }
            // 已经在加载中，需要添加回调到 script onload 中
            // 注意：没有考虑 error 情形
            else if (mod.status === LOADING) {
                utils.scriptOnload(node, function() {
                    // 模块载入后，如果需要也要混入对应 global 上模块定义
                    mixGlobal();
                    _scriptOnComplete();
                });
            }
            // 是内嵌代码，或者已经 loaded
            else {
                // 也要混入对应 global 上模块定义
                mixGlobal();
                callback();
            }

            function _modError() {
                S.log(mod.name + ' is not loaded! can not find module in path : ' + mod['fullpath'], 'error');
                mod.status = ERROR;
            }

            function mixGlobal() {
                // 对于动态下载下来的模块，loaded 后，global 上有可能更新 mods 信息
                // 需要同步到 instance 上去
                // 注意：要求 mod 对应的文件里，仅修改该 mod 信息
                if (cfg.global) {
                    self.__mixMod(mod.name, cfg.global);
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
 * @author lifesinger@gmail.com,yiminghe@gmail.com,lijing00333@163.com
 * @description: constant member and common method holder
 */
(function (S, loader, data) {
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
        __pagePath: location.href.replace(/#.*$/, "").replace(/[^/]*$/i, ""),

        //firefox,ie9,chrome 如果add没有模块名，模块定义先暂存这里
        __currentModule: null,

        //ie6,7,8开始载入脚本的时间
        __startLoadTime: 0,

        //ie6,7,8开始载入脚本对应的模块名
        __startLoadModuleName: null,

        __isAttached: function (modNames) {
            var mods = this.Env.mods,
                ret = true;
            S.each(modNames, function (name) {
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
(function (S, loader, utils) {
    if ("require" in this) {
        return;
    }
    /**
     * 包声明
     * biz -> .
     * 表示遇到 biz/x
     * 在当前网页路径找 biz/x.js
     */
    S.configs.packages = function (cfgs) {
        var ps;
        ps = S.Config.packages = S.Config.packages || {};
        S.each(cfgs, function (cfg) {
            ps[cfg.name] = cfg;
            //注意正则化
            cfg.path = cfg.path && utils.normalBasePath(cfg.path);
            cfg.tag = cfg.tag && encodeURIComponent(cfg.tag);
        });
    };
    S.mix(loader, {
        __getPackagePath:function (mod) {
            //缓存包路径，未申明的包的模块都到核心模块中找
            if (mod.packagepath) {
                return mod.packagepath;
            }
            var self = this,
                //一个模块合并到了另一个模块文件中去
                modName = S.__getCombinedMod(mod.name),
                packages = self.Config.packages || {},
                pName = "",
                p_def;

            for (var p in packages) {
                if (packages.hasOwnProperty(p)) {
                    if (S.startsWith(modName, p) &&
                        p.length > pName.length) {
                        pName = p;
                    }
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
        }
    });
})(KISSY, KISSY.__loader, KISSY.__loaderUtils);/**
 * register module ,associate module name with module factory(definition)
 * @author  yiminghe@gmail.com,lifesinger@gmail.com
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
 * @author  yiminghe@gmail.com,lifesinger@gmail.com
 */
(function (S, loader, utils, data) {

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
        use:function (modNames, callback, cfg) {
            modNames = modNames.replace(/\s+/g, "").split(',');
            utils.indexMapping(modNames);
            cfg = cfg || {};

            var self = this,
                fired;

            // 已经全部 attached, 直接执行回调即可
            if (self.__isAttached(modNames)) {
                var mods = self.__getModules(modNames);
                callback && callback.apply(self, mods);
                return;
            }

            // 有尚未 attached 的模块
            S.each(modNames, function (modName) {
                // 从 name 开始调用，防止不存在模块
                self.__attachModByName(modName, function () {
                    if (!fired &&
                        self.__isAttached(modNames)) {
                        fired = true;
                        var mods = self.__getModules(modNames);
                        callback && callback.apply(self, mods);
                    }
                }, cfg);
            });

            return self;
        },

        __getModules:function (modNames) {
            var self = this,
                mods = [self];

            S.each(modNames, function (modName) {
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
        require:function (moduleName) {
            var self = this,
                mods = self.Env.mods,
                mod = mods[moduleName],
                re = self['onRequire'] && self['onRequire'](mod);
            if (re !== undefined) {
                return re;
            }
            return mod && mod.value;
        },

        // 加载指定模块名模块，如果不存在定义默认定义为内部模块
        __attachModByName:function (modName, callback, cfg) {
            var self = this,
                mods = self.Env.mods;

            var mod = mods[modName];
            //没有模块定义
            if (!mod) {
                // 默认 js/css 名字
                // 不指定 .js 默认为 js
                // 指定为 css 载入 .css
                var componentJsName = self.Config['componentJsName'] ||
                    function (m) {
                        var suffix = "js", match;
                        if (match = m.match(/(.+)\.(js|css)$/i)) {
                            suffix = match[2];
                            m = match[1];
                        }
                        return m + '-min.' + suffix;
                    },
                    path = componentJsName(S.__getCombinedMod(modName));
                mod = {
                    path:path,
                    charset:'utf-8'
                };
                //添加模块定义
                mods[modName] = mod;
            }

            mod.name = modName;

            if (mod && mod.status === ATTACHED) {
                return;
            }

            // 先从 global 里取
            if (cfg.global) {
                self.__mixMod(modName, cfg.global);
            }

            self.__attach(mod, callback, cfg);
        },

        /**
         * Attach a module and all required modules.
         */
        __attach:function (mod, callback, cfg) {
            var self = this,
                r,
                rMod,
                i,
                attached = 0,
                mods = self.Env.mods,
                //复制一份当前的依赖项出来，防止 add 后修改！
                requires = (mod['requires'] || []).concat();

            mod['requires'] = requires;

            /**
             * check cyclic dependency between mods
             */
            function cyclicCheck() {
                var __allRequires,
                    myName = mod.name,
                    r, r2, rmod,
                    r__allRequires,
                    requires = mod.requires;
                // one mod's all requires mods to run its callback
                __allRequires = mod.__allRequires = mod.__allRequires || {};
                for (var i = 0; i < requires.length; i++) {
                    r = requires[i];
                    rmod = mods[r];
                    __allRequires[r] = 1;
                    if (rmod && (r__allRequires = rmod.__allRequires)) {
                        for (r2 in r__allRequires) {
                            if (r__allRequires.hasOwnProperty(r2)) {
                                __allRequires[r2] = 1;
                            }
                        }
                    }
                }
                if (__allRequires[myName]) {
                    var t = [];
                    for (r in __allRequires) {
                        if (__allRequires.hasOwnProperty(r)) {
                            t.push(r);
                        }
                    }
                    S.error("find cyclic dependency by mod " + myName + " between mods : " + t.join(","));
                }
            }

            if (S.Config.debug) {
                cyclicCheck();
            }

            // attach all required modules
            for (i = 0; i < requires.length; i++) {
                r = requires[i] = utils.normalDepModuleName(mod.name, requires[i]);
                rMod = mods[r];
                if (rMod && rMod.status === ATTACHED) {
                    //no need
                } else {
                    self.__attachModByName(r, fn, cfg);
                }
            }

            // load and attach this module
            self.__buildPath(mod, self.__getPackagePath(mod));

            self.__load(mod, function () {

                // add 可能改了 config，这里重新取下
                mod['requires'] = mod['requires'] || [];

                var newRequires = mod['requires'],
                    needToLoad = [];

                //本模块下载成功后串行下载 require
                for (i = 0; i < newRequires.length; i++) {
                    r = newRequires[i] = utils.normalDepModuleName(mod.name, newRequires[i]);
                    var rMod = mods[r],
                        inA = S.inArray(r, requires);
                    //已经处理过了或将要处理
                    if (rMod &&
                        rMod.status === ATTACHED
                        //已经正在处理了
                        || inA) {
                        //no need
                    } else {
                        //新增的依赖项
                        needToLoad.push(r);
                    }
                }

                if (needToLoad.length) {
                    for (i = 0; i < needToLoad.length; i++) {
                        self.__attachModByName(needToLoad[i], fn, cfg);
                    }
                } else {
                    fn();
                }
            }, cfg);

            function fn() {
                if (!attached &&
                    self.__isAttached(mod['requires'])) {

                    if (mod.status === LOADED) {
                        self.__attachMod(mod);
                    }
                    if (mod.status === ATTACHED) {
                        attached = 1;
                        callback();
                    }
                }
            }
        },

        __attachMod:function (mod) {
            var self = this,
                fns = mod.fns;

            if (fns) {
                S.each(fns, function (fn) {
                    var value;
                    if (S.isFunction(fn)) {
                        value = fn.apply(self, self.__getModules(mod['requires']));
                    } else {
                        value = fn;
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
(function (S, loader, utils) {
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
        var src = utils.absoluteFilePath(script.src),
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
                S.each(parts, function (part) {
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
    S.__initLoader = function () {
        var self = this;
        self.Env.mods = self.Env.mods || {}; // all added mods
    };

    S.Env._loadQueue = {}; // information for loading and loaded mods
    S.__initLoader();

    (function () {
        // get base from current script file path
        var scripts = document.getElementsByTagName('script'),
            currentScript = scripts[scripts.length - 1],
            base = getBaseUrl(currentScript);
        S.Config.base = utils.normalBasePath(base);
        // the default timeout for getScript
        S.Config.timeout = 10;
    })();

    S.mix(S.configs, {
        base:function (base) {
            S.Config.base = utils.normalBasePath(base);
        },
        timeout:function (v) {
            S.Config.timeout = v;
        },
        debug:function (v) {
            S.Config.debug = v;
        }
    });

    // for S.app working properly
    S.each(loader, function (v, k) {
        S.__APP_MEMBERS.push(k);
    });

    S.__APP_INIT_METHODS.push('__initLoader');

})(KISSY, KISSY.__loader, KISSY.__loaderUtils);/**
 * @module  web.js
 * @author  lifesinger@gmail.com,yiminghe@gmail.com
 * @description this code can only run at browser environment
 */
(function (S, undefined) {

    var win = S.__HOST,
        doc = win['document'],

        docElem = doc.documentElement,

        EMPTY = '',

    // Is the DOM ready to be used? Set to true once it occurs.
        isReady = false,

    // The functions to execute on DOM ready.
        readyList = [],

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
        isWindow: function (o) {
            return S.type(o) === 'object'
                && 'setInterval' in o
                && 'document' in o
                && o.document.nodeType == 9;
        },


        parseXML: function (data) {
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
            } catch (e) {
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
        globalEval: function (data) {
            if (data && RE_NOT_WHITE.test(data)) {
                // http://weblogs.java.net/blog/driscoll/archive/2009/09/08/eval-javascript-global-context
                ( window.execScript || function (data) {
                    window[ "eval" ].call(window, data);
                } )(data);
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
        ready: function (fn) {

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
        available: function (id, fn) {
            id = (id + EMPTY).match(RE_IDSTR)[1];
            if (!id || !S.isFunction(fn)) {
                return;
            }

            var retryCount = 1,
                node,
                timer = S.later(function () {
                    if ((node = doc.getElementById(id)) && (fn(node) || 1) ||
                        ++retryCount > POLL_RETRYS) {
                        timer.cancel();
                    }
                }, POLL_INTERVAL, true);
        }
    });


    /**
     * Binds ready events.
     */
    function _bindReady() {
        var doScroll = docElem.doScroll,
            eventType = doc.addEventListener ? 'DOMContentLoaded' : 'onreadystatechange',
            COMPLETE = 'complete',
            fire = function () {
                _fireReady();
            };

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
            } catch (e) {
                S.log("frameElement error : ");
                S.log(e);
            }

            if (doScroll && notframe) {
                function readyScroll() {
                    try {
                        // Ref: http://javascript.nwbox.com/IEContentLoaded/
                        doScroll('left');
                        fire();
                    } catch (ex) {
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

    /**
     * bind on start
     * in case when you bind but the DOMContentLoaded has triggered
     * then you has to wait onload
     * worst case no callback at all
     */
    _bindReady();

})(KISSY, undefined);
/**
 * 声明 kissy 核心中所包含的模块，动态加载时将直接从 core.js 中加载核心模块
 * @description: 为了和 1.1.7 及以前版本保持兼容，务实与创新，兼容与革新 ！
 * @author yiminghe@gmail.com
 */
(function (S) {
    S.config({
        'combines':{
            'core':['dom', 'ua', 'event', 'node', 'json', 'ajax', 'anim', 'base', 'cookie']
        }
    });
})(KISSY);
