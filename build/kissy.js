/*
Copyright 2012, KISSY UI Library v1.30dev
MIT Licensed
build time: Apr 9 12:04
*/
/*
 * @fileOverview a seed where KISSY grows up from , KISS Yeah !
 * @author lifesinger@gmail.com,yiminghe@gmail.com
 */
(function (S, undefined) {
    /**
     * @namespace The KISSY global namespace object. you can use
     * <code>
     *     KISSY.each/mix
     * </code>
     * to do basic operation.
     * or
     * <code>
     *      KISSY.use("overlay,node",function(S,Overlay,Node){
     *          //
     *      })
     * </code>
     * to do complex task with modules.
     * @name KISSY
     */

    var host = this,
        hasEnumBug = !({toString:1}.propertyIsEnumerable('toString')),
        hasOwn = Object.prototype.hasOwnProperty,
        emumProperties = [
            'hasOwnProperty',
            'isPrototypeOf',
            'propertyIsEnumerable',
            'toString',
            'toLocaleString',
            'valueOf'
        ],
        meta = {
            /**
             * Copies all the properties of s to r.
             * @name KISSY.mix
             * @function
             * @param {Object} r the augmented object
             * @param {Object} s the object need to augment
             * @param {boolean} [ov=true] whether overwrite existing property
             * @param {String[]} [wl] array of white-list properties
             * @param deep {boolean} whether recursive mix if encounter object,
             * if deep is set true,then ov should be set true too!
             * @return {Object} the augmented object
             * @example
             * <code>
             * var t={};
             * S.mix({x:{y:2,z:4}},{x:{y:3,a:t}},1,0,1) =>{x:{y:3,z:4,a:{}}} , a!==t
             * S.mix({x:{y:2,z:4}},{x:{y:3,a:t}},1) => {x:{y:3,a:t}}
             * </code>
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
                        // no hasOwnProperty judge !
                        _mix(p, r, s, ov, deep);
                    }

                    // fix #101
                    if (hasEnumBug) {
                        for (var j = 0; j < emumProperties.length; j++) {
                            p = emumProperties[j];
                            if (ov && hasOwn.call(s, p)) {
                                r[p] = s[p];
                            }
                        }
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
    seed.Env = seed.Env || {};
    host = seed.Env.host || (seed.Env.host = host || {});

    // shortcut and meta for seed.
    // override previous kissy
    S = host[S] = meta.mix(seed, meta);

    S.mix(KISSY,
        /**
         * @lends KISSY
         */
        {
            /**
             * @private
             */
            configs:(S.configs || {}),
            // S.app() with these members.
            __APP_MEMBERS:['namespace'],
            __APP_INIT_METHODS:[init],

            /**
             * The version of the library.
             * @type {String}
             */
            version:'1.30dev',

            /**
             * The build time of the library
             * @type {String}
             */
            __BUILD_TIME:'20120409120412',

            /**
             * Returns a new object containing all of the properties of
             * all the supplied objects. The properties from later objects
             * will overwrite those in earlier objects. Passing in a
             * single object will create a shallow copy of it.
             * @param {...} m1 objects need to be merged
             * @return {Object} the new merged object
             */
            merge:function (m1) {
                var o = {}, i, l = arguments.length;
                for (i = 0; i < l; i++) {
                    S.mix(o, arguments[i]);
                }
                return o;
            },

            /**
             * Applies prototype properties from the supplier to the receiver.
             * @param   {Object} r received object
             * @param   {...Object} s1 object need to  augment
             *          {boolean} [ov=true] whether overwrite existing property
             *          {String[]} [wl] array of white-list properties
             * @return  {Object} the augmented object
             */
            augment:function (r, s1) {
                var args = S.makeArray(arguments),
                    len = args.length - 2,
                    i = 1,
                    ov = args[len],
                    wl = args[len + 1];

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
             * @deprecated recommended using packages
             */
            app:function (name, sx) {
                var isStr = S.isString(name),
                    O = isStr ? host[name] || {} : name,
                    i = 0,
                    __APP_INIT_METHODS = S.__APP_INIT_METHODS,
                    len = __APP_INIT_METHODS.length;

                S.mix(O, this, true, S.__APP_MEMBERS);
                for (; i < len; i++) {
                    __APP_INIT_METHODS[i].call(O);
                }

                S.mix(O, S.isFunction(sx) ? sx() : sx);
                isStr && (host[name] = O);

                return O;
            },

            /**
             * set KISSY configuration
             * @param c detail configs
             * @param {Object[]} c.packages
             * @param {String} c.packages.0.name package name
             * @param {String} c.packages.0.path package path
             * @param {String} c.packages.0.tag timestamp for this package's module file
             * @param {Array[]} c.map file map configs
             * @param {Array[]} c.map.0 a single map rule
             * @param {RegExp} c.map.0.0 a regular expression to match url
             * @param {String|Function} c.map.0.1 provide replacement for String.replace
             * @param {boolean} c.combine whether to enable combo
             * @param {String} c.base set base for kissy loader.use with caution!
             * @param {boolean} c.debug whether to enable debug mod
             * @example
             * // use gallery from cdn
             * <code>
             * KISSY.config({
             *      combine:true,
             *      packages:[{
             *          name:"gallery",
             *          path:"http://a.tbcdn.cn/s/kissy/gallery/"
             *      }]
             * });
             * </code>
             * // use map to reduce connection count
             * <code>
             * S.config({
             * map:[
             * [
             *  /http:\/\/a.tbcdn.cn\/s\/kissy\/1.2.0\/(?:overlay|component|uibase|switchable)-min.js(.+)$/,
             *  "http://a.tbcdn.cn/s/kissy/1.2.0/??overlay-min.js,component-min.js,uibase-min.js,switchable-min.js$1"]
             * ]
             * });
             * </code>
             */
            config:function (c) {
                var configs, cfg, r;
                for (var p in c) {
                    if (c.hasOwnProperty(p)) {
                        // some filter
                        if ((configs = this['configs']) && (cfg = configs[p])) {
                            r = cfg(c[p]);
                        } else {
                            // or set directly
                            S.Config[p] = c[p];
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

    /**
     * Initializes
     */
    function init() {
        var self = this,
            c;
        self.Env = self.Env || {};
        c = self.Config = self.Config || {};
        // NOTICE: '@DEBUG@' will replace with '' when compressing.
        // So, if loading source file, debug is on by default.
        // If loading min version, debug is turned off automatically.
        c.debug = '@DEBUG@';
    }

    init.call(S);
    return S;

})('KISSY', undefined);
/**
 * @fileOverview   lang
 * @author  lifesinger@gmail.com,yiminghe@gmail.com
 * @description this code can run in any ecmascript compliant environment
 */
(function (S, undefined) {

    var TRUE = true,
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
        // IE doesn't include non-breaking-space (0xa0) in their \s character
        // class (as required by section 7.2 of the ECMAScript spec), we explicitly
        // include it in the regexp to enforce consistent cross-browser behavior.
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
        return val == null || (t !== 'object' && t !== 'function');
    }

    S.mix(S,
        /**
         * @lends KISSY
         */
        {

            /**
             * stamp a object by guid
             * @param {Object} o object needed to be stamped
             * @param {boolean} [readOnly] while set marker on o if marker does not exist
             * @param {String} [marker] the marker will be set on Object
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

            /**
             * empty function
             */
            noop:function () {
            },

            /**
             * Determine the internal JavaScript [[Class]] of an object.
             */
            type:function (o) {
                return o == null ?
                    String(o) :
                    class2type[toString.call(o)] || 'object';
            },

            /**
             * whether o === null
             * @param o
             */
            isNull:function (o) {
                return o === null;
            },

            /**
             * whether o === undefined
             * @param o
             */
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
             */
            isPlainObject:function (o) {
                /**
                 * note by yiminghe
                 * isPlainObject(node=document.getElementById("xx")) -> false
                 * toString.call(node) : ie678 == '[object Object]',other =='[object HTMLElement]'
                 * 'isPrototypeOf' in node : ie678 === false ,other === true
                 * refer http://lifesinger.org/blog/2010/12/thinking-of-isplainobject/
                 */
                return o && toString.call(o) === '[object Object]' && 'isPrototypeOf' in o;
            },


            /**
             * 两个目标是否内容相同
             * @param a 比较目标1
             * @param b 比较目标2
             * @returns {boolean} a.equals(b)
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
                    return a == null && b == null;
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
             * @param input
             * @param {Function} [filter] filter function
             * @returns the new cloned object
             * @see http://www.w3.org/TR/html5/common-dom-interfaces.html#safe-passing-of-structured-data
             */
            clone:function (input, filter) {
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
             * @function
             */
            trim:trim ?
                function (str) {
                    return str == null ? EMPTY : trim.call(str);
                } :
                function (str) {
                    return str == null ? EMPTY : str.toString().replace(RE_TRIM, EMPTY);
                },

            /**
             * Substitutes keywords in a string using an object/array.
             * Removes undefined keywords and ignores escaped keywords.
             * @param {String} str template string
             * @param {Object} o json data
             * @param {RegExp} [regexp] to match a piece of template string
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

                    context = context || null;

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
             * @param item individual item to be searched
             * @function
             * @param {Array} arr the array of items where item will be search
             * @returns {number} item's index in array
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
             * @function
             * @param item individual item to be searched
             * @param {Array} arr the array of items where item will be search
             * @returns {number} item's last index in array
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
             * @param a {Array} the array to find the subset of unique for
             * @param [override] {Boolean}
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
             * @param item individual item to be searched
             * @param {Array} arr the array of items where item will be search
             * @returns {boolean} the item exists in arr
             */
            inArray:function (item, arr) {
                return S.indexOf(item, arr) > -1;
            },

            /**
             * Executes the supplied function on each item in the array.
             * Returns a new array containing the items that the supplied
             * function returned true for.
             * @function
             * @param arr {Array} the array to iterate
             * @param fn {Function} the function to execute on each item
             * @param [context] {Object} optional context object
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


            /**
             * Executes the supplied function on each item in the array.
             * Returns a new array containing the items that the supplied
             * function returned for.
             * @function
             * @param arr {Array} the array to iterate
             * @param fn {Function} the function to execute on each item
             * @param [context] {Object} optional context object
             * @see https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Array/map
             * @return {Array} The items on which the supplied function
             *         returned
             */
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
             * Executes the supplied function on each item in the array.
             * Returns a value which is accumulation of the value that the supplied
             * function returned.
             *
             * @param arr {Array} the array to iterate
             * @param callback {Function} the function to execute on each item
             * @param initialValue {number} optional context object
             * @see https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/array/reduce
             * @return {Array} The items on which the supplied function returned
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

            /**
             * Tests whether all elements in the array pass the test implemented by the provided function.
             * @function
             * @param arr {Array} the array to iterate
             * @param callback {Function} the function to execute on each item
             * @param [context] {Object} optional context object
             * @returns {boolean} whether all elements in the array pass the test implemented by the provided function.
             */
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

            /**
             * Tests whether some element in the array passes the test implemented by the provided function.
             * @function
             * @param arr {Array} the array to iterate
             * @param callback {Function} the function to execute on each item
             * @param [context] {Object} optional context object
             * @returns {boolean} whether some element in the array passes the test implemented by the provided function.
             */
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
             * Creates a new function that, when called, itself calls this function in the context of the provided this value,
             * with a given sequence of arguments preceding any provided when the new function was called.
             * @see https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Function/bind
             * @param {Function} fn internal called function
             * @param {Object} obj context in which fn runs
             * @param {...} arg1 extra arguments
             * @returns {Function} new function with context and arguments
             */
            bind:function (fn, obj, arg1) {
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
             * @function
             * @see  https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Date/now
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
             * get escaped string from html
             * @see   http://yiminghe.javaeye.com/blog/788929
             *        http://wonko.com/post/html-escaping
             * @param str {string} text2html show
             */
            escapeHTML:function (str) {
                return str.replace(getEscapeReg(), function (m) {
                    return reverseEntities[m];
                });
            },

            /**
             * get escaped regexp string for construct regexp
             * @param str
             */
            escapeRegExp:function (str) {
                return str.replace(escapeRegExp, '\\$&');
            },

            /**
             * un-escape html to string
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
             * @return {Array} native Array
             */
            makeArray:function (o) {
                if (o == null) {
                    return [];
                }
                if (S.isArray(o)) {
                    return o;
                }

                // The strings and functions also have 'length'
                if (typeof o.length !== 'number'
                    // element
                    || o.nodeName
                    // window
                    || o.alert
                    || S.isString(o) || S.isFunction(o)) {
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
             * @example
             * <code>
             * {foo: 1, bar: 2}    // -> 'foo=1&bar=2'
             * {foo: 1, bar: [2, 3]}    // -> 'foo=1&bar=2&bar=3'
             * {foo: '', bar: 2}    // -> 'foo=&bar=2'
             * {foo: undefined, bar: 2}    // -> 'foo=undefined&bar=2'
             * {foo: true, bar: 2}    // -> 'foo=true&bar=2'
             * </code>
             * @param {Object} o json data
             * @param {String} [sep='&'] separator between each pair of data
             * @param {String} [eq='='] separator between key and value of data
             * @param {boolean} [arr=true] whether add '[]' to array key of data
             * @return {String}
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
             * @example
             * <code>
             * 'section=blog&id=45'        // -> {section: 'blog', id: '45'}
             * 'section=blog&tag=js&tag=doc' // -> {section: 'blog', tag: ['js', 'doc']}
             * 'tag=ruby%20on%20rails'        // -> {tag: 'ruby on rails'}
             * 'id=45&raw'        // -> {id: '45', raw: ''}
             * </code>
             * @param {String} str param string
             * @param {String} [sep='&'] separator between each pair of data
             * @param {String} [eq='='] separator between key and value of data
             * @returns {Object} json data
             */
            unparam:function (str, sep, eq) {
                if (!S.isString(str) || !(str = S.trim(str))) {
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
             * @param {Boolean} [periodic] if true, executes continuously at supplied interval
             *        until canceled.
             * @param {Object} [context] the context object.
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

            /**
             * test whether a string start with a specified substring
             * @param {String} str the whole string
             * @param {String} prefix a specified substring
             * @returns {boolean} whether str start with prefix
             */
            startsWith:function (str, prefix) {
                return str.lastIndexOf(prefix, 0) === 0;
            },

            /**
             * test whether a string end with a specified substring
             * @param {String} str the whole string
             * @param {String} suffix a specified substring
             * @returns {boolean} whether str end with suffix
             */
            endsWith:function (str, suffix) {
                var ind = str.length - suffix.length;
                return ind >= 0 && str.indexOf(suffix, ind) == ind;
            },

            /**
             * Throttles a call to a method based on the time between calls.
             * @param {function} fn The function call to throttle.
             * @param {object} [context] context fn to run
             * @param {Number} [ms] The number of milliseconds to throttle the method call.
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
             * buffers a call between a fixed time
             * @param {function} fn
             * @param {object} [context]
             * @param {Number} ms
             * @return {function} Returns a wrapped function that calls fn buffered.
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
                    bufferTimer = S.later(fn, ms, FALSE, context || this, arguments);
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
    S.mix(S,
        /**
         * @lends KISSY
         */
        {
            /**
             * test whether o is boolean
             * @function
             * @param  o
             * @returns {boolean}
             */
            isBoolean:isValidParamValue,
            /**
             * test whether o is number
             * @function
             * @param  o
             * @returns {boolean}
             */
            isNumber:isValidParamValue,
            /**
             * test whether o is String
             * @function
             * @param  o
             * @returns {boolean}
             */
            isString:isValidParamValue,
            /**
             * test whether o is function
             * @function
             * @param  o
             * @returns {boolean}
             */
            isFunction:isValidParamValue,
            /**
             * test whether o is Array
             * @function
             * @param  o
             * @returns {boolean}
             */
            isArray:isValidParamValue,
            /**
             * test whether o is Date
             * @function
             * @param  o
             * @returns {boolean}
             */
            isDate:isValidParamValue,
            /**
             * test whether o is RegExp
             * @function
             * @param  o
             * @returns {boolean}
             */
            isRegExp:isValidParamValue,
            /**
             * test whether o is Object
             * @function
             * @param  o
             * @returns {boolean}
             */
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
 * implement Promise specification by KISSY
 * @author yiminghe@gmail.com
 * @description thanks to https://github.com/kriskowal/q
 */
(function (KISSY, undefined) {
    var S = KISSY;

    function nextTick(fn) {
        // for debug
        // fn();
        // make parallel call in production
        // setTimeout(fn, 0);
        // sync,same with event
        fn();
    }

    /**
     * @class Defer constructor For KISSY,implement Promise specification.
     * @memberOf KISSY
     */
    function Defer(promise) {
        var self = this;
        if (!(self instanceof Defer)) {
            return new Defer(promise);
        }
        // http://en.wikipedia.org/wiki/Object-capability_model
        // principal of least authority
        /**
         * @description defer object's promise
         * @type KISSY.Promise
         * @memberOf KISSY.Defer#
         * @name promise
         */
        self.promise = promise || new Promise();
    }

    Defer.prototype =
    /**
     * @lends KISSY.Defer.prototype
     */
    {
        constructor:Defer,
        /**
         * fulfill defer object's promise
         * note: can only be called once
         * @param value defer object's value
         * @returns defer object's promise
         */
        resolve:function (value) {
            var promise = this.promise,
                pendings;
            if (!(pendings = promise._pendings)) {
                return undefined;
            }
            // set current promise's resolved value
            // maybe a promise or instant value
            promise._value = value;
            pendings = [].concat(pendings);
            promise._pendings = undefined;
            for (var i = 0; i < pendings.length; i++) {
                (function (p) {
                    nextTick(function () {
                        promise._when(p[0], p[1]);
                    });
                })(pendings[i]);
            }
            return value;
        },
        /**
         * reject defer object's promise
         * @param reason
         * @returns defer object's promise
         */
        reject:function (reason) {
            return this.resolve(new Reject(reason));
        }
    };

    function isPromise(obj) {
        return  obj && obj instanceof Promise;
    }

    /**
     * @class Promise constructor.
     * This class should not be instantiated manually.
     * Instances will be created and returned as needed by {@link KISSY.Defer#promise}
     * @namespace
     * @param v promise's resolved value
     * @memberOf KISSY
     */
    function Promise(v) {
        var self = this;
        // maybe internal value is also a promise
        self._value = v;
        if (!arguments.length) {
            self._pendings = [];
        }
    }

    Promise.prototype =
    /**
     * @lends KISSY.Promise.prototype
     */
    {
        constructor:Promise,
        /**
         * two effects:
         * 1. call fulfilled with immediate value
         * 2. push fulfilled in right promise
         * @private
         * @param fulfilled
         * @param rejected
         */
        _when:function (fulfilled, rejected) {
            var promise = this,
                v = promise._value,
                pendings = promise._pendings;
            // unresolved
            // pushed to pending list
            if (pendings) {
                pendings.push([fulfilled, rejected]);
            }
            // rejected or nested promise
            else if (isPromise(v)) {
                nextTick(function () {
                    v._when(fulfilled, rejected);
                });
            } else {
                // fulfilled value
                // normal value represents ok
                // need return user's return value
                // if return promise then forward
                return fulfilled && fulfilled(v);
            }
            return undefined;
        },
        /**
         * register callbacks when this promise object is resolved
         * @param {Function(*)} fulfilled called when resolved successfully,pass a resolved value to this function and
         *                      return a value (could be promise object) for the new promise's resolved value.
         * @param {Function(*)} [rejected] called when error occurs,pass error reason to this function and
         *                      return a new reason for the new promise's error reason
         * @returns {KISSY.Promise} a new promise object
         */
        then:function (fulfilled, rejected) {
            return when(this, fulfilled, rejected);
        },
        /**
         * call rejected callback when this promise object is rejected
         * @param {Function(*)} rejected called with rejected reason
         * @returns {KISSY.Promise} a new promise object
         */
        fail:function (rejected) {
            return when(this, 0, rejected);
        },
        /**
         * call callback when this promise object is rejected or resolved
         * @param {Function(*,Boolean)} callback the second parameter is
         * true when resolved and false when rejected
         * @@returns {KISSY.Promise} a new promise object
         */
        fin:function (callback) {
            return when(this, function (value) {
                return callback(value, true);
            }, function (reason) {
                return callback(reason, false);
            });
        },
        /**
         * whether the given object is a resolved promise
         * if it is resolved with another promise,
         * then that promise needs to be resolved as well.
         */
        isResolved:function () {
            return isResolved(this);
        },
        /**
         * whether the given object is a rejected promise
         */
        isRejected:function () {
            return isRejected(this);
        }
    };

    function Reject(reason) {
        if (reason instanceof Reject) {
            return reason;
        }
        Promise.apply(this, arguments);
        if (this._value instanceof Promise) {
            S.error('assert.not(this._value instanceof promise) in Reject constructor');
        }
        return undefined;
    }

    S.extend(Reject, Promise, {
        // override,simply call rejected
        _when:function (fulfilled, rejected) {
            // if there is a rejected , should always has! see when()
            if (!rejected) {
                S.error("no rejected callback!");
            }
            return rejected ? rejected(this._value) : new Reject(this._value);
        }
    });

    function resolve(value) {
        if (value instanceof Promise) {
            return value;
        }
        return new Promise(value);
    }

    /**
     * wrap for promise._when
     * @param value
     * @param fulfilled
     * @param [rejected]
     */
    function when(value, fulfilled, rejected) {
        var defer = new Defer(),
            done = 0;

        // wrap user's callback to catch exception
        function _fulfilled(value) {
            try {
                return fulfilled ? fulfilled(value) : value;
            } catch (e) {
                S.log(e,"error");
                return new Reject(e);
            }
        }

        function _rejected(reason) {
            try {
                return rejected ? rejected(reason) : new Reject(reason);
            } catch (e) {
                S.log(e,"error");
                return new Reject(e);
            }
        }

        nextTick(function () {
            resolve(value)._when(function (value) {
                if (done) {
                    S.error("already done at fulfilled");
                    return;
                }
                if (value instanceof Promise) {
                    S.error("assert.not(value instanceof Promise) in when")
                }
                done = 1;
                defer.resolve(
                    // may return another promise
                    resolve(value)._when(_fulfilled, _rejected)
                );
            }, function (reason) {
                if (done) {
                    S.error("already done at rejected");
                    return;
                }
                done = 1;
                // _reject may return non-Reject object for error recovery
                defer.resolve(_rejected(reason));
            });
        });

        // chained and leveled
        // wait for value's resolve
        return defer.promise;
    }

    function isResolved(obj) {
        // exclude Reject at first
        return !isRejected(obj) &&
            isPromise(obj) &&
            (obj._pendings === undefined) &&
            (
                // immediate value
                !isPromise(obj._value) ||
                    // resolved with a resolved promise !!! :)
                    // Reject._value is string
                    isResolved(obj._value)
                );
    }

    function isRejected(obj) {
        return isPromise(obj) &&
            (obj._pendings === undefined) &&
            (obj._value instanceof Reject);
    }

    KISSY.Defer = Defer;
    KISSY.Promise = Promise;

    S.mix(Promise,
        /**
         * @lends KISSY.Promise
         */
        {
            /**
             * register callbacks when obj as a promise is resolved
             * or call fulfilled callback directly when obj is not a promise object
             * @param {KISSY.Promise|*} obj a promise object or value of any type
             * @param {Function(*)} fulfilled called when obj resolved successfully,pass a resolved value to this function and
             *                      return a value (could be promise object) for the new promise's resolved value.
             * @param {Function(*)} [rejected] called when error occurs in obj,pass error reason to this function and
             *                      return a new reason for the new promise's error reason
             * @returns {KISSY.Promise} a new promise object
             * @example
             * <code>
             * function check(p){
             *   S.Promise.when(p,function(v){
             *     alert(v===1);
             *   });
             * }
             *
             * var defer=S.Defer();
             * defer.resolve(1);
             *
             * check(1); // => alert(true)
             *
             * check(defer.promise); //=> alert(true);
             * </code>
             * @function
             */
            when:when,
            /**
             * whether the given object is a promise
             * @function
             * @param obj the tested object
             */
            isPromise:isPromise,
            /**
             * whether the given object is a resolved promise
             * @function
             * @param obj the tested object
             */
            isResolved:isResolved,
            /**
             * whether the given object is a rejected promise
             * @function
             * @param obj the tested object
             */
            isRejected:isRejected,
            /**
             * return a new promise
             * which is resolved when all promises is resolved
             * and rejected when any one of promises is rejected
             * @param {KISSY.Promise[]} promises list of promises
             */
            all:function (promises) {
                return when([].concat(promises), function (promises) {
                    var count = promises.length;
                    if (!count) {
                        return promises;
                    }
                    var defer = Defer();
                    for (var i = 0; i < promises.length; i++) {
                        (function (promise, i) {
                            when(promise, function (value) {
                                promises[i] = value;
                                if (--count === 0) {
                                    // if all is resolved
                                    // then resolve final returned promise with all value
                                    defer.resolve(promises);
                                }
                            }, function (r) {
                                // if any one is rejected
                                // then reject final return promise with first reason
                                defer.reject(r);
                            });
                        })(promises[i], i);
                    }
                    return defer.promise;
                });
            }
        });

})(KISSY);

/**
 * refer:
 *  - http://wiki.commonjs.org/wiki/Promises
 *  - http://en.wikipedia.org/wiki/Futures_and_promises#Read-only_views
 *  - http://en.wikipedia.org/wiki/Object-capability_model
 *  - https://github.com/kriskowal/q
 *  - http://www.sitepen.com/blog/2010/05/03/robust-promises-with-dojo-deferred-1-5/
 *  - http://dojotoolkit.org/documentation/tutorials/1.6/deferreds/
 **//**
 * @fileOverview setup data structure for kissy loader
 * @author yiminghe@gmail.com,lifesinger@gmail.com
 */
(function (S) {
    if (typeof require !== 'undefined') {
        return;
    }

    /**
     * @class KISSY Loader constructor
     * This class should not be instantiated manually.
     * @memberOf KISSY
     */
    function Loader(SS) {
        this.SS = SS;
        /**
         * @name KISSY.Loader#afterModAttached
         * @description fired after a module is attached
         * @event
         * @param e
         * @param {KISSY.Loader.Module} e.mod current module object
         */
    }

    KISSY.Loader = Loader;

    /**
     * @class KISSY Module constructor
     * This class should not be instantiated manually.
     * @memberOf KISSY.Loader
     */
    function Module(ps) {
        S.mix(this, ps);
    }

    S.augment(Module,
        /**
         * @lends KISSY.Loader.Module#
         */
        {
            /**
             * set the value of current module
             * @param v value to be set
             */
            setValue:function (v) {
                this.v = v;
            },
            /**
             * get the value of current module
             */
            getValue:function () {
                return this.v;
            },
            /**
             * get the name of current module
             * @returns {String}
             */
            getName:function () {
                return this.name;
            },
            /**
             * @private
             */
            getUrlTag:function () {
                return this.tag || this.packageTag;
            }
        });

    Loader.Module = Module;

    // 脚本(loadQueue)/模块(mod) 公用状态
    Loader.STATUS = {
        "INIT":0,
        "LOADING":1,
        "LOADED":2,
        "ERROR":3,
        // 模块特有
        "ATTACHED":4
    };
})(KISSY);/**
 * simple event target for loader
 * @author yiminghe@gmail.com
 */
(function (S) {

    if (typeof require !== 'undefined') {
        return;
    }

    var time = S.now(),
        p = "__events__" + time;

    function getHolder(self) {
        return self[p] || (self[p] = {});
    }

    function getEventHolder(self, name, create) {
        var holder = getHolder(self);
        if (create) {
            holder[name] = holder[name] || [];
        }
        return holder[name];
    }

    S.Loader.Target =
    /**
     * @lends KISSY.Loader#
     */
    {
        /**
         * register callback for specified eventName from loader
         * @param {String} eventName event name from kissy loader
         * @param {Function} callback function to be executed when event of eventName is fired
         */
        on:function (eventName, callback) {
            getEventHolder(this, eventName, 1).push(callback);
        },

        /**
         * remove callback for specified eventName from loader
         * @param {String} [eventName] eventName from kissy loader.
         * if undefined remove all callbacks for all events
         * @param {Function } [callback] function to be executed when event of eventName is fired.
         * if undefined remove all callbacks fro this event
         */
        detach:function (eventName, callback) {
            if (!eventName) {
                delete this[p];
                return;
            }
            var fns = getEventHolder(this, eventName);
            if (fns) {
                if (callback) {
                    var index = S.indexOf(callback, fns);
                    if (index != -1) {
                        fns.splice(index, 1);
                    }
                }
                if (!callback || !fns.length) {
                    delete getHolder(this)[eventName];
                }
            }
        },

        /**
         * @private
         */
        fire:function (eventName, obj) {
            var fns = getEventHolder(this, eventName);
            S.each(fns, function (f) {
                f.call(null, obj);
            });
        }
    };
})(KISSY);/**
 * @fileOverview utils for kissy loader
 * @author yiminghe@gmail.com
 */
(function (S, undefined) {
    if (typeof require !== 'undefined') {
        return;
    }
    var Loader = S.Loader,
        ua = navigator.userAgent,
        startsWith = S.startsWith,
        data = Loader.STATUS,
        utils = {},
        doc = S.Env.host.document,
        // 当前页面所在的目录
        // http://xx.com/y/z.htm#!/f/g
        // ->
        // http://xx.com/y/
        __pagePath = location.href.replace(location.hash, "").replace(/[^/]*$/i, "");

    // http://wiki.commonjs.org/wiki/Packages/Mappings/A
    // 如果模块名以 / 结尾，自动加 index
    function indexMap(s) {
        if (/(.+\/)(\?t=.+)?$/.test(s)) {
            return RegExp.$1 + "index" + RegExp.$2;
        }
        return s;
    }


    function removeSuffixAndTagFromModName(modName) {
        var tag = undefined,
            m,
            withTagReg = /([^?]+)(?:\?t=(.+))/;

        if (m = modName.match(withTagReg)) {
            modName = m[1];
            tag = m[2];
        }

        // js do not need suffix
        modName = modName.replace(/\.js$/i, "");
        return {
            modName:modName,
            tag:tag
        };
    }

    S.mix(utils, {

        docHead:function () {
            return doc.getElementsByTagName('head')[0] || doc.documentElement;
        },

        isWebKit:!!ua.match(/AppleWebKit/),

        IE:!!ua.match(/MSIE/),

        isCss:function (url) {
            return /\.css(?:\?|$)/i.test(url);
        },

        isLinkNode:function (n) {
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
        normalizePath:function (path) {
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
        normalDepModuleName:function (moduleName, depName) {
            if (!depName) {
                return depName;
            }
            if (S.isArray(depName)) {
                for (var i = 0; i < depName.length; i++) {
                    depName[i] = utils.normalDepModuleName(moduleName, depName[i]);
                }
                return depName;
            }
            if (startsWith(depName, "../") || startsWith(depName, "./")) {
                var anchor = "", index;
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

        //去除后缀名，要考虑时间戳!
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
                path = __pagePath + path;
            }
            return normalizePath(path);
        },

        /**
         * 相对路径文件名转换为绝对路径
         * @param path
         */
        absoluteFilePath:function (path) {
            path = utils.normalBasePath(path);
            return path.substring(0, path.length - 1);
        },

        getPackagePath:function (self, mod) {
            //缓存包路径，未申明的包的模块都到核心模块中找
            if (mod.packagePath) {
                return mod.packagePath;
            }

            var //一个模块合并到了另一个模块文件中去
                modName = mod.name,
                packages = self.Config.packages || {},
                pName = "",
                p_def;

            for (var p in packages) {
                if (packages.hasOwnProperty(p)) {
                    if (S.startsWith(modName, p) &&
                        p.length > pName) {
                        pName = p;
                    }
                }
            }

            p_def = packages[pName];

            mod.charset = p_def && p_def.charset || mod.charset;

            if (p_def) {
                mod.packageTag = p_def.tag;
            } else {
                // kissy 自身组件的事件戳后缀
                mod.packageTag = encodeURIComponent(self.Config.tag);
            }

            return mod.packagePath = (p_def && p_def.path) || self.Config.base;
        },


        createModuleInfo:function (self, modName) {

            var info = removeSuffixAndTagFromModName(modName),
                tag = info.tag;

            modName = info.modName;

            var mods = self.Env.mods,
                mod = mods[modName];

            if (mod && mod.path && mod.charset) {
                mod.tag = mod.tag || tag;
                return mod;
            }

            if (!mod) {
                mods[modName] = mod = new Loader.Module();
            }

            // 用户配置的 path优先
            S.mix(mod, {
                name:modName,
                path:defaultComponentJsName(modName),
                charset:'utf-8',
                tag:tag
            }, false);
            return mod;
        },

        isAttached:function (self, modNames) {
            return isStatus(self, modNames, data.ATTACHED);
        },

        isLoaded:function (self, modNames) {
            return isStatus(self, modNames, data.LOADED);
        },

        getModules:function (self, modNames) {
            var mods = [self];

            S.each(modNames, function (modName) {
                if (!utils.isCss(modName)) {
                    mods.push(self.require(modName));
                }
            });

            return mods;
        },

        attachMod:function (self, mod) {
            if (mod.status == data.ATTACHED) {
                return;
            }

            var fn = mod.fn,
                value;

            // 需要解开 index，相对路径，去除 tag，但是需要保留 alias，防止值不对应
            mod.requires = utils.normalizeModNamesWithAlias(self,mod.requires, mod.name);

            if (fn) {
                if (S.isFunction(fn)) {
                    // context is mod info
                    value = fn.apply(mod, utils.getModules(self, mod.requires));
                } else {
                    value = fn;
                }
                mod.value = value;
            }

            mod.status = data.ATTACHED;

            self.getLoader().fire("afterModAttached", {
                mod:mod
            });
        },

        getModNamesAsArray:function (modNames) {
            if (S.isString(modNames)) {
                modNames = modNames.replace(/\s+/g, "").split(',');
            }
            return modNames;
        },

        /**
         * Three effects:
         * 1. add index : / => /index
         * 2. unalias : core => dom,event,ua
         * 3. relative to absolute : ./x => y/x
         * 4. create module info with tag : core.js?t=xx => core , .tag=xx         *
         * @param {KISSY} self Global KISSY instance
         * @param {String|String[]} modNames Array of module names or module names string separated by comma
         */
        normalizeModNames:function (self, modNames, refModName) {
            var ret = [],
                mods = self.Env.mods;
            S.each(modNames, function (name) {
                var alias, m;
                // 1. index map
                name = indexMap(name);
                // 2. un alias
                if ((m = mods[name]) && (alias = m.alias)) {
                    ret.push.apply(ret, indexMap(alias));
                } else {
                    ret.push(name);
                }
            });
            // 3. relative to absolute (optional)
            if (refModName) {
                ret = utils.normalDepModuleName(refModName, ret);
            }
            // 4. create module info with tag
            S.each(ret, function (name, i) {
                ret[i] = utils.createModuleInfo(self, name).name;
            });
            return ret;
        },

        normalizeModNamesWithAlias:function (self,modNames, refModName) {
            var ret = [];
            S.each(modNames, function (name) {
                // 1. index map
                name = indexMap(name);
                ret.push(name);
            });
            // 2. relative to absolute (optional)
            if (refModName) {
                ret = utils.normalDepModuleName(refModName, ret);
            }
            // 3. create module info with tag
            S.each(ret, function (name, i) {
                ret[i] = utils.createModuleInfo(self, name).name;
            });
            return ret;
        },

        //注册模块，将模块和定义 factory 关联起来
        registerModule:function (self, name, def, config) {
            config = config || {};

            utils.createModuleInfo(self, name);

            var mods = self.Env.mods,
                mod = mods[name];

            // 注意：通过 S.add(name[, fn[, config]]) 注册的代码，无论是页面中的代码，
            // 还是 js 文件里的代码，add 执行时，都意味着该模块已经 LOADED
            S.mix(mod, { name:name, status:data.LOADED });

            if (mod.fn) {
                S.log(name + " is defined more than once");
                return;
            }

            mod.fn = def;

            S.mix((mods[name] = mod), config);

            S.log(name + " is loaded");
        },

        normAdd:function (self, name, def, config) {
            var mods = self.Env.mods,
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
                S.each(name, function (modCfg, modName) {
                    utils.createModuleInfo(self, modName);
                    S.mix(mods[modName], modCfg);
                });
                return true;
            }
        },

        getMappedPath:function (self, path) {
            var __mappedRules = self.Config.mappedRules || [];
            for (var i = 0; i < __mappedRules.length; i++) {
                var m, rule = __mappedRules[i];
                if (m = path.match(rule[0])) {
                    return path.replace(rule[0], rule[1]);
                }
            }
            return path;
        }

    });

    function defaultComponentJsName(m) {
        var suffix = ".js", match;
        if (match = m.match(/(.+)(\.css)$/i)) {
            suffix = match[2];
            m = match[1];
        }
        return m + (S.Config.debug ? '' : '-min') + suffix;
    }

    function isStatus(self, modNames, status) {
        var mods = self.Env.mods,
            ret = true;
        modNames = S.makeArray(modNames);
        S.each(modNames, function (name) {
            var mod = mods[name];
            if (!mod || mod.status !== status) {
                ret = false;
                return ret;
            }
        });
        return ret;
    }

    var normalizePath = utils.normalizePath;

    Loader.Utils = utils;

})(KISSY);/**
 * @fileOverview script/css load across browser
 * @author  yiminghe@gmail.com
 */
(function (S) {
    if (typeof require !== 'undefined') {
        return;
    }

    var CSS_POLL_INTERVAL = 30,
        win = S.Env.host,
        utils = S.Loader.Utils,
        /**
         * central poll for link node
         */
            timer = 0,

        monitors = {
            /**
             * node.id:{callback:callback,node:node}
             */
        };

    function startCssTimer() {
        if (!timer) {
            // S.log("start css polling");
            cssPoll();
        }
    }

    // single thread is ok
    function cssPoll() {
        for (var url in monitors) {
            var callbackObj = monitors[url],
                node = callbackObj.node,
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
                        S.log('firefox  ' + cssRules + ' loaded : ' + url);
                        loaded = 1;
                    }
                } catch (ex) {
                    // S.log('firefox  ' + ex.name + ' ' + ex.code + ' ' + url);
                    // if (ex.name === 'NS_ERROR_DOM_SECURITY_ERR') {
                    if (ex.code === 1000) {
                        S.log('firefox  ' + ex.name + ' loaded : ' + url);
                        loaded = 1;
                    }
                }
            }

            if (loaded) {
                if (callbackObj.callback) {
                    callbackObj.callback.call(node);
                }
                delete monitors[url];
            }
        }
        if (S.isEmptyObject(monitors)) {
            timer = 0;
            // S.log("end css polling");
        } else {
            timer = setTimeout(cssPoll, CSS_POLL_INTERVAL);
        }
    }

    S.mix(utils, {
        scriptOnLoad:win.addEventListener ?
            function (node, callback) {
                node.addEventListener('load', callback, false);
            } :
            function (node, callback) {
                node.onreadystatechange = function () {
                    var self = this, rs = self.readyState;
                    if (/loaded|complete/i.test(rs)) {
                        self.onreadystatechange = null;
                        callback.call(self);
                    }
                };
            },

        /**
         * monitor css onload across browsers
         * 暂时不考虑如何判断失败，如 404 等
         * @see <pre>
         *  - firefox 不可行（结论4错误）：
         *    - http://yearofmoo.com/2011/03/cross-browser-stylesheet-preloading/
         *  - 全浏览器兼容
         *    - http://lifesinger.org/lab/2011/load-js-css/css-preload.html
         *  - 其他
         *    - http://www.zachleat.com/web/load-css-dynamically/
         *  </pre>
         */
        styleOnLoad:win.attachEvent ?
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
                var href = node.href,
                    arr;
                arr = monitors[href] = {};
                arr.node = node;
                arr.callback = callback;
                startCssTimer();
            }
    });
})(KISSY);/**
 * @fileOverview getScript support for css and js callback after load
 * @author  yiminghe@gmail.com,lifesinger@gmail.com
 */
(function (S) {
    if (typeof require !== 'undefined') {
        return;
    }
    var MILLISECONDS_OF_SECOND = 1000,
        doc = S.Env.host.document,
        utils = S.Loader.Utils,
        jsCallbacks = {},
        cssCallbacks = {};

    S.mix(S, {

        /**
         * load  a css file from server using http get,
         * after css file load ,execute success callback.
         * note: no support for timeout and error
         * @param url css file url
         * @param success callback
         * @param charset
         * @private
         */
        getStyle:function (url, success, charset) {

            var config = success;

            if (S.isPlainObject(config)) {
                success = config.success;
                charset = config.charset;
            }
            var src = utils.absoluteFilePath(url),
                callbacks = cssCallbacks[src] = cssCallbacks[src] || [];

            callbacks.push(success);

            if (callbacks.length > 1) {
                // S.log(" queue css : " + callbacks.length);
                return callbacks.node;
            }

            var head = utils.docHead(),
                node = doc.createElement('link');

            callbacks.node = node;

            node.href = url;
            node.rel = 'stylesheet';

            if (charset) {
                node.charset = charset;
            }
            utils.styleOnLoad(node, function () {
                var callbacks = cssCallbacks[src];
                S.each(callbacks, function (callback) {
                    if (callback) {
                        callback.call(node);
                    }
                });
                delete cssCallbacks[src];
            });
            // css order matters!
            head.appendChild(node);
            return node;

        },
        /**
         * Load a JavaScript/Css file from the server using a GET HTTP request,
         * then execute it.
         * @example
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
         * @param {String} url resource's url
         * @param {Function|Object} [success] success callback or config
         * @param {Function} [success.success] success callback
         * @param {Function} [success.error] error callback
         * @param {Number} [success.timeout] timeout (s)
         * @param {String} [success.charset] charset of current resource
         * @param {String} [charset] charset of current resource
         * @returns {HTMLElement} script/style node
         * @memberOf KISSY
         */
        getScript:function (url, success, charset) {
            if (utils.isCss(url)) {
                return S.getStyle(url, success, charset);
            }

            var config = success,
                error,
                timeout,
                timer;

            if (S.isPlainObject(config)) {
                success = config.success;
                error = config.error;
                timeout = config.timeout;
                charset = config.charset;
            }

            var src = utils.absoluteFilePath(url),
                callbacks = jsCallbacks[src] = jsCallbacks[src] || [];

            callbacks.push([success, error]);

            if (callbacks.length > 1) {
                // S.log(" queue js : " + callbacks.length + " : for :" + url + " by " + (config.source || ""));
                return callbacks.node;
            } else {
                // S.log("init getScript : by " + config.source);
            }

            var head = utils.docHead(),
                node = doc.createElement('script'),
                clearTimer = function () {
                    if (timer) {
                        timer.cancel();
                        timer = undefined;
                    }
                };

            node.src = url;
            node.async = true;

            callbacks.node = node;

            if (charset) {
                node.charset = charset;
            }

            var end = function (error) {
                var index = error ? 1 : 0;
                clearTimer();
                var callbacks = jsCallbacks[src];
                S.each(callbacks, function (callback) {
                    if (callback[index]) {
                        callback[index].call(node);
                    }
                });
                delete jsCallbacks[src];
            }

            utils.scriptOnLoad(node, function () {
                end(0);
            });

            //标准浏览器
            if (node.addEventListener) {
                node.addEventListener("error", function () {
                    end(1);
                }, false);
            }

            if (timeout) {
                timer = S.later(function () {
                    end(1);
                }, timeout * MILLISECONDS_OF_SECOND);
            }
            head.insertBefore(node, head.firstChild);
            return node;
        }
    });

})(KISSY);
/**
 * yiminghe@gmail.com refactor@2012-03-29
 *  - 考虑连续重复请求单个 script 的情况，内部排队
 *
 * yiminghe@gmail.com 2012-03-13
 *  - getScript
 *      - 404 in ie<9 trigger success , others trigger error
 *      - syntax error in all trigger success
 **/(function (S) {
    if (typeof require !== 'undefined') {
        return;
    }
    var utils = S.Loader.Utils;
    /**
     * modify current module path
     * @private
     * @param rules
     * @example
     * <code>
     *      [
     *          [/(.+-)min(.js(\?t=\d+)?)$/,"$1$2"],
     *          [/(.+-)min(.js(\?t=\d+)?)$/,function(_,m1,m2){
     *              return m1+m2;
     *          }]
     *      ]
     * </code>
     */
    S.configs.map = function (rules) {
        S.Config.mappedRules = (S.Config.mappedRules || []).concat(rules);
    };
    /**
     * 包声明
     * biz -> .
     * 表示遇到 biz/x
     * 在当前网页路径找 biz/x.js
     * @private
     */
    S.configs.packages = function (cfgs) {
        var ps = S.Config.packages = S.Config.packages || {};
        S.each(cfgs, function (cfg) {
            ps[cfg.name] = cfg;
            //注意正则化
            cfg.path = cfg.path && utils.normalBasePath(cfg.path);
            cfg.tag = cfg.tag && encodeURIComponent(cfg.tag);
        });
    };

    S.configs.base = function (base) {
        S.Config.base = utils.normalBasePath(base);
    };
})(KISSY);/**
 * simple loader from KISSY<=1.2
 * @author yiminghe@gmail.com
 */
(function (S, undefined) {

    if (typeof require !== 'undefined') {
        return;
    }

    var Loader = S.Loader,
        utils = Loader.Utils;


    S.augment(Loader,
        Loader.Target,
        {

            //firefox,ie9,chrome 如果add没有模块名，模块定义先暂存这里
            __currentModule:null,

            //ie6,7,8开始载入脚本的时间
            __startLoadTime:0,

            //ie6,7,8开始载入脚本对应的模块名
            __startLoadModuleName:null,

            /**
             * Registers a module.
             * @param {String|Object} [name] module name
             * @param {Function|Object} [def] entry point into the module that is used to bind module to KISSY
             * @param {Object} [config] special config for this add
             * @param {String[]} [config.requires] array of mod's name that current module requires
             * @example
             * <code>
             * KISSY.add('module-name', function(S){ }, {requires: ['mod1']});

             * KISSY.add({
             *     'mod-name': {
             *         fullpath: 'url',
             *         requires: ['mod1','mod2']
             *     }
             * });
             * </code>
             */
            add:function (name, def, config) {
                var self = this,
                    SS = self.SS,
                    mod,
                    requires,
                    mods = SS.Env.mods,
                    o;

                if (utils.normAdd(SS, name, def, config)) {
                    return;
                }

                // S.add(name[, fn[, config]])
                if (S.isString(name)) {

                    utils.registerModule(SS, name, def, config);

                    mod = mods[name];

                    // 显示指定 add 不 attach
                    if (config && config['attach'] === false) {
                        return;
                    }

                    requires = utils.normalizeModNames(SS, mod.requires, name);

                    if (utils.isAttached(SS, requires)) {
                        utils.attachMod(SS, mod);
                    }
                    return;
                }
                // S.add(fn,config);
                else if (S.isFunction(name)) {
                    config = def;
                    def = name;
                    if (utils.IE) {
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
                        name = findModuleNameByInteractive(self);
                        S.log("old_ie get modname by interactive : " + name);
                        utils.registerModule(SS, name, def, config);
                        self.__startLoadModuleName = null;
                        self.__startLoadTime = 0;
                    } else {
                        // 其他浏览器 onload 时，关联模块名与模块定义
                        self.__currentModule = {
                            def:def,
                            config:config
                        };
                    }
                    return;
                }
                S.log("invalid format for KISSY.add !", "error");
            }
        });




    // ie 特有，找到当前正在交互的脚本，根据脚本名确定模块名
    // 如果找不到，返回发送前那个脚本
    function findModuleNameByInteractive(self) {
        var self = this,
            SS = self.SS,
            base,
            scripts = S.Env.host.document.getElementsByTagName("script"),
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
        // 注意：模块名不包含后缀名以及参数，所以去除
        // 系统模块去除系统路径
        // 需要 base norm , 防止 base 被指定为相对路径
        // configs 统一处理
        // SS.Config.base = SS.normalBasePath(self.Config.base);
        if (src.lastIndexOf(base = SS.Config.base, 0) === 0) {
            return utils.removePostfix(src.substring(base.length));
        }
        var packages = SS.Config.packages;
        //外部模块去除包路径，得到模块名
        for (var p in packages) {
            if (packages.hasOwnProperty(p)) {
                var p_path = packages[p].path;
                if (packages.hasOwnProperty(p) &&
                    src.lastIndexOf(p_path, 0) === 0) {
                    return utils.removePostfix(src.substring(p_path.length));
                }
            }
        }
        S.log("interactive script does not have package config ：" + src, "error");
    }

})(KISSY);

/**
 * 2012-02-21 yiminghe@gmail.com refactor:
 *
 * 拆分 ComboLoader 与 Loader
 *
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
 * 2011-05-04 初步拆分文件，tmd 乱了
 */
/**
 * @fileOverview use and attach mod
 * @author  yiminghe@gmail.com,lifesinger@gmail.com
 */
(function (S) {
    if (typeof require !== 'undefined') {
        return;
    }

    var Loader = S.Loader,
        data = Loader.STATUS,
        utils = Loader.Utils,
        INIT = data.INIT,
        IE = utils.IE,
        LOADING = data.LOADING,
        LOADED = data.LOADED,
        ERROR = data.ERROR,
        ATTACHED = data.ATTACHED;

    S.augment(Loader, {
        /**
         * Start load specific mods, and fire callback when these mods and requires are attached.
         * @example
         * <code>
         * S.use('mod-name', callback, config);
         * S.use('mod1,mod2', callback, config);
         * </code>
         * @param {String|String[]} modNames names of mods to be loaded,if string then separated by space
         * @param {Function} callback callback when modNames are all loaded,
         *                   with KISSY as first argument and mod's value as the following arguments
         */
        use:function (modNames, callback) {
            var self = this,
                SS = self.SS;

            modNames = utils.getModNamesAsArray(modNames);
            modNames = utils.normalizeModNamesWithAlias(SS,modNames);

            var normalizedModNames = utils.normalizeModNames(SS, modNames),
                count = normalizedModNames.length,
                currentIndex = 0;

            // 已经全部 attached, 直接执行回调即可
            if (utils.isAttached(SS, normalizedModNames)) {
                var mods = utils.getModules(SS, modNames);
                callback && callback.apply(SS, mods);
                return;
            }

            // 有尚未 attached 的模块
            S.each(normalizedModNames, function (modName) {
                // 从 name 开始调用，防止不存在模块
                attachModByName(self, modName, function () {
                    currentIndex++;
                    if (currentIndex == count) {
                        var mods = utils.getModules(SS, modNames);
                        callback && callback.apply(SS, mods);
                    }
                });
            });

            return self;
        }
    });


    function buildModPath(self, mod, base) {
        var SS = self.SS,
            Config = SS.Config;

        base = base || Config.base;

        build("fullpath", "path");

        if (mod["cssfullpath"] !== data.LOADED) {
            build("cssfullpath", "csspath");
        }

        function build(fullpath, path) {
            var flag = "__" + fullpath + "Ready",
                t,
                p = mod[fullpath],
                sp = mod[path];
            if (mod[flag]) {
                return;
            }
            if (!p && sp) {
                //如果是 ./ 或 ../ 则相对当前模块路径
                sp = mod[path] = utils.normalDepModuleName(mod.name, sp);
                p = base + sp;
            }
            // debug 模式下，加载非 min 版
            if (p) {
                mod[fullpath] = utils.getMappedPath(SS, p +
                    ((t = mod.getUrlTag()) ? ("?t=" + t) : ""));
                mod[flag] = 1;
            }
        }
    }

    // 加载指定模块名模块，如果不存在定义默认定义为内部模块
    function attachModByName(self, modName, callback) {
        var SS = self.SS,
            mod = SS.Env.mods[modName];
        if (mod.status === ATTACHED) {
            callback();
            return;
        }
        attachModRecursive(self, mod, callback);
    }


    /**
     * Attach a module and all required modules.
     */
    function attachModRecursive(self, mod, callback) {
        var SS = self.SS,
            r,
            rMod,
            i,
            callbackBeCalled = 0,
            // 最终有效的 require ，add 处声明为准
            newRequires,
            mods = SS.Env.mods;

        // 复制一份当前的依赖项出来，防止 add 后修改！
        // 事先配置的 require ，同 newRequires 有区别
        var requires = utils.normalizeModNames(SS, mod.requires, mod.name);

        /**
         * check cyclic dependency between mods
         * @private
         */
        function cyclicCheck() {
            // one mod's all requires mods to run its callback
            var __allRequires = mod.__allRequires = mod.__allRequires || {},
                myName = mod.name,
                rmod,
                r__allRequires;

            S.each(requires, function (r) {
                rmod = mods[r];
                __allRequires[r] = 1;
                if (rmod && (r__allRequires = rmod.__allRequires)) {
                    S.mix(__allRequires, r__allRequires);
                }
            });

            if (__allRequires[myName]) {
                S.log(__allRequires, "error");
                var JSON = window.JSON,
                    error = "";
                if (JSON) {
                    error = JSON.stringify(__allRequires);
                }
                S.error("find cyclic dependency by mod " + myName + " between mods : " + error);

            }
        }

        if (S.Config.debug) {
            cyclicCheck();
        }

        // attach all required modules
        for (i = 0; i < requires.length; i++) {
            r = requires[i];
            rMod = mods[r];
            if (rMod && rMod.status === ATTACHED) {
                //no need
            } else {
                attachModByName(self, r, fn);
            }
        }

        // load and attach this module
        buildModPath(self, mod, utils.getPackagePath(SS, mod));

        loadModByScript(self, mod, function () {

            // KISSY.add 可能改了 config，这里重新取下
            newRequires = utils.normalizeModNames(SS, mod.requires, mod.name);

            var needToLoad = [];

            //本模块下载成功后串行下载 require
            for (i = 0; i < newRequires.length; i++) {
                var r = newRequires[i],
                    rMod = mods[r],
                    inA = S.inArray(r, requires);
                //已经处理过了或将要处理
                if (rMod &&
                    rMod.status === ATTACHED ||
                    //已经正在处理了
                    inA) {
                    //no need
                } else {
                    //新增的依赖项
                    needToLoad.push(r);
                }
            }

            if (needToLoad.length) {
                for (i = 0; i < needToLoad.length; i++) {
                    attachModByName(self, needToLoad[i], fn);
                }
            } else {
                fn();
            }
        });

        function fn() {
            if (
            // 前提条件，本模块 script onload 已经调用
            // ie 下 add 与 script onload 并不连续！！
            // attach 以 newRequires 为准
                newRequires &&
                    !callbackBeCalled &&
                    // 2012-03-16 by yiminghe@gmail.com
                    // add 与 onload ie 下不连续
                    // c 依赖 a
                    // a 模块 add 时进行 attach
                    // a add 后 c 模块 onload 触发
                    // 检测到 a 已经 attach 则调用该函数
                    // a onload 后又调用该函数则需要用 callbackBeCalled 来把门
                    utils.isAttached(SS, newRequires)) {
                if (mod.status == LOADED) {
                    utils.attachMod(SS, mod);
                }
                if (mod.status == ATTACHED) {
                    callbackBeCalled = 1;
                    callback();
                }
            }
        }
    }


    /**
     * Load a single module.
     */
    function loadModByScript(self, mod, callback) {
        var SS = self.SS,
            cssfullpath,
            url = mod['fullpath'],
            isCss = utils.isCss(url)

        mod.status = mod.status || INIT;

        // 1.20 兼容 1.1x 处理：加载 cssfullpath 配置的 css 文件
        // 仅发出请求，不做任何其它处理
        if (cssfullpath = mod["cssfullpath"]) {
            S.getScript(cssfullpath);
            mod["cssfullpath"] = mod.csspath = LOADED;
        }

        if (mod.status < LOADING) {
            mod.status = LOADING;
            if (IE && !isCss) {
                self.__startLoadModuleName = mod.name;
                self.__startLoadTime = Number(+new Date());
            }
            S.getScript(url, {
                // syntaxError in all browser will trigger this
                // same as #111 : https://github.com/kissyteam/kissy/issues/111
                success:function () {
                    if (!isCss) {
                        // 载入 css 不需要这步了
                        // 标准浏览器下：外部脚本执行后立即触发该脚本的 load 事件,ie9 还是不行
                        if (self.__currentModule) {
                            S.log("standard browser get modname after load : " + mod.name);
                            utils.registerModule(SS,
                                mod.name, self.__currentModule.def,
                                self.__currentModule.config);
                            self.__currentModule = null;
                        }
                    }
                    checkAndHandle();
                },
                error:checkAndHandle,
                // source:mod.name + "-init",
                charset:mod.charset
            });
        }
        // 已经在加载中，需要添加回调到 script onload 中
        // 注意：没有考虑 error 情形，只在第一次处理即可
        // 交给 getScript 排队
        else if (mod.status == LOADING) {
            S.getScript(url, {
                success:checkAndHandle,
                // source:mod.name + "-loading",
                charset:mod.charset
            });
        }
        // loaded/attached/error
        else {
            checkAndHandle();
        }

        function checkAndHandle() {
            if (isCss || mod.fn) {
                // css 不会设置 LOADED! 必须外部设置
                if (isCss && mod.status != ATTACHED) {
                    mod.status = LOADED;
                }
                callback();
            } else {
                // ie will call success even when getScript error(404)
                _modError();
            }
        }

        function _modError() {
            S.log(mod.name + ' is not loaded! can not find module in path : ' + mod['fullpath'], 'error');
            mod.status = ERROR;
        }
    }
})(KISSY);/**
 * using combo to load module files
 * @author yiminghe@gmail.com
 */
(function (S) {

    if (typeof require !== 'undefined') {
        return;
    }

    function loadScripts(urls, callback, charset) {
        var count = urls && urls.length;
        if (!count) {
            callback();
            return;
        }
        for (var i = 0; i < urls.length; i++) {
            var url = urls[i];
            S.getScript(url, function () {
                if (!(--count)) {
                    callback();
                }
            }, charset || "utf-8");
        }
    }

    var MAX_URL_LENGTH = 1024,
        Loader = S.Loader,
        data = Loader.STATUS,
        utils = Loader.Utils;

    /**
     * using combo to load module files
     * @class
     * @param SS KISSY
     */
    function ComboLoader(SS) {
        S.mix(this, {
            SS:SS,
            queue:[],
            loading:0
        });
    }

    S.augment(ComboLoader,
        Loader.Target,
        /**
         * @lends ComboLoader#
         */
        {
            next:function () {
                var self = this;
                if (self.queue.length) {
                    var args = self.queue.shift();
                    self._use(args.modNames, args.fn);
                }
            },

            enqueue:function (modNames, fn) {
                var self = this;
                self.queue.push({
                    modNames:modNames,
                    fn:fn
                });
            },

            _use:function (modNames, fn) {
                var self = this, SS = self.SS;

                self.loading = 1;

                modNames = utils.getModNamesAsArray(modNames);

                modNames= utils.normalizeModNamesWithAlias(SS,modNames);

                var unaliasModNames = utils.normalizeModNames(SS, modNames);

                var allModNames = self.calculate(unaliasModNames);

                var comboUrls = self.getComboUrls(allModNames);

                // load css first to avoid page blink
                var css = comboUrls.css,
                    countCss = 0;

                for (var p in css) {
                    countCss++;
                }

                if (!countCss) {
                    self._useJs(comboUrls, fn, modNames);
                    return;
                }

                for (p in css) {
                    loadScripts(css[p], function () {
                        if (!(--countCss)) {
                            S.each(unaliasModNames, function (name) {
                                utils.attachMod(self.SS, self.getModInfo(name));
                            });
                            self._useJs(comboUrls, fn, modNames);
                        }
                    }, css[p].charset);
                }
            },

            use:function (modNames, callback) {
                var self = this,
                    fn = function () {
                        // KISSY.use in callback will be queued
                        if (callback) {
                            callback.apply(this, arguments);
                        }
                        self.loading = 0;
                        self.next();
                    };

                self.enqueue(modNames, fn);

                if (!self.loading) {
                    self.next();
                }
            },

            _useJs:function (comboUrls, fn, modNames) {
                var self = this,
                    jss = comboUrls.js,
                    countJss = 0;


                for (var p in jss) {
                    countJss++;
                }

                if (!countJss) {
                    fn.apply(null, utils.getModules(self.SS, modNames));
                    return;
                }
                var success = 1;
                for (p in jss) {
                    (function (p) {
                        loadScripts(jss[p], function () {
                            var mods = jss[p].mods;
                            for (var i = 0; i < mods.length; i++) {
                                var mod = mods[i];
                                // fix #111
                                // https://github.com/kissyteam/kissy/issues/111
                                if (!mod.fn) {
                                    S.log(mod.name + ' is not loaded! can not find module in path : ' + jss[p], 'error');
                                    mod.status = data.ERROR;
                                    success = 0;
                                    return;
                                }
                            }
                            if (success && !(--countJss)) {
                                var unaliasModNames = utils.normalizeModNames(self.SS, modNames);
                                self.attachMods(unaliasModNames);
                                if (utils.isAttached(self.SS, unaliasModNames)) {
                                    fn.apply(null, utils.getModules(self.SS, modNames))
                                } else {
                                    // new require is introduced by KISSY.add
                                    // run again
                                    self._use(modNames, fn)
                                }
                            }
                        }, jss[p].charset);
                    })(p);
                }
            },

            add:function (name, def, config) {
                var self = this,
                    requires,
                    SS = self.SS;

                if (utils.normAdd(SS, name, def, config)) {
                    return;
                }
                if (config && (requires = config.requires)) {
                    utils.normalDepModuleName(name, requires);
                }
                utils.registerModule(SS, name, def, config);
            },


            attachMods:function (modNames) {
                var self = this;
                S.each(modNames, function (modName) {
                    self.attachMod(modName);
                });
            },

            attachMod:function (modName) {
                var SS = this.SS,
                    mod = this.getModInfo(modName);
                if (
                // new require after add
                // not register yet!
                    !mod || utils.isAttached(SS, modName)) {
                    return;
                }
                var requires = utils.normalizeModNames(SS, mod.requires, modName);
                for (var i = 0; i < requires.length; i++) {
                    this.attachMod(requires[i]);
                }
                for (i = 0; i < requires.length; i++) {
                    if (!utils.isAttached(SS, requires[i])) {
                        return false;
                    }
                }
                utils.attachMod(SS, mod);
            },

            calculate:function (modNames) {
                var ret = {}, SS = this.SS;
                for (var i = 0; i < modNames.length; i++) {
                    var m = modNames[i];
                    if (!utils.isAttached(SS, m)) {
                        if (!utils.isLoaded(SS, m)) {
                            ret[m] = 1;
                        }
                        S.mix(ret, this.getRequires((m)));
                    }
                }
                var ret2 = [];
                for (var r in ret) {
                    ret2.push(r);
                }
                return ret2;
            },

            getComboUrls:function (modNames) {
                var self = this,
                    i,
                    mod,
                    packagePath,
                    combos = {};

                S.each(modNames, function (modName) {
                    mod = self.getModInfo(modName);
                    packagePath = utils.getPackagePath(self.SS, mod);
                    var type = utils.isCss(mod.path) ? "css" : "js";
                    combos[packagePath] = combos[packagePath] || {};
                    combos[packagePath][type] = combos[packagePath][type] || [];
                    combos[packagePath][type].tag = combos[packagePath][type].tag || mod.tag;
                    combos[packagePath][type].packageTag = mod.packageTag;
                    combos[packagePath][type].charset = mod.charset;
                    combos[packagePath][type].push(mod);
                });

                S.each(combos, function (v) {
                    var js, css;
                    if (js = v["js"]) {
                        // module level tag is superior to package level tag
                        js.tag = js.tag || js.packageTag;
                    }
                    if (css = v["css"]) {
                        css.tag = css.tag || css.packageTag;
                    }
                });

                var res = {
                    js:{},
                    css:{}
                }, t;

                var comboPrefix = S.Config.comboPrefix,
                    comboSep = S.Config.comboSep,
                    maxUrlLength = S.Config['comboMaxUrlLength'] || MAX_URL_LENGTH;

                for (packagePath in combos) {
                    for (var type in combos[packagePath]) {
                        t = [];
                        var jss = combos[packagePath][type];
                        res[type][packagePath] = [];
                        res[type][packagePath].charset = jss.charset;
                        // current package's mods
                        res[type][packagePath].mods = [];
                        var prefix = packagePath + comboPrefix,
                            l = prefix.length;
                        for (i = 0; i < jss.length; i++) {
                            t.push(jss[i].path);
                            res[type][packagePath].mods.push(jss[i]);
                            if (l + t.join(comboSep).length > maxUrlLength) {
                                t.pop();
                                res[type][packagePath].push(self.getComboUrl(
                                    t.length > 1 ? prefix : packagePath,
                                    t, comboSep, jss.tag
                                ));
                                t = [];
                                i--;
                            }
                        }
                        if (t.length) {
                            res[type][packagePath].push(self.getComboUrl(
                                t.length > 1 ? prefix : packagePath,
                                t, comboSep, jss.tag
                            ));
                        }
                    }
                }

                return res;
            },

            getComboUrl:function (prefix, t, comboSep, tag) {
                return utils.getMappedPath(
                    this.SS,
                    prefix + t.join(comboSep) + (tag ? ("?t=" + tag) : "")
                );
            },

            getModInfo:function (modName) {
                var SS = this.SS, mods = SS.Env.mods;
                return mods[modName];
            },

            // get requires mods need to be loaded dynamically
            getRequires:function (modName) {
                var self = this,
                    SS = self.SS,
                    mod = self.getModInfo(modName),
                    ret = {};
                // if this mod is attached then its require is attached too!
                if (mod && !utils.isAttached(SS, modName)) {
                    var requires = utils.normalizeModNames(SS, mod.requires, modName);
                    // circular dependency check
                    if (S.Config.debug) {
                        var allRequires = mod.__allRequires || (mod.__allRequires = {});
                        if (allRequires[modName]) {
                            S.error("detect circular dependency among : ");
                            S.error(allRequires);
                        }
                    }
                    for (var i = 0; i < requires.length; i++) {
                        var r = requires[i];
                        if (S.Config.debug) {
                            // circular dependency check
                            var rMod = self.getModInfo(r);
                            allRequires[r] = 1;
                            if (rMod && rMod.__allRequires) {
                                S.each(rMod.__allRequires, function (_, r2) {
                                    allRequires[r2] = 1;
                                });
                            }
                        }
                        // if not load into page yet
                        if (!utils.isLoaded(SS, r)
                            // and not attached
                            && !utils.isAttached(SS, r)) {
                            ret[r] = 1;
                        }
                        var ret2 = self.getRequires(r);
                        S.mix(ret, ret2);
                    }
                }
                return ret;
            }
        });

    Loader.Combo = ComboLoader;

})(KISSY);
/**
 * 2012-02-20 yiminghe note:
 *  - three status
 *      0 : initialized
 *      LOADED : load into page
 *      ATTACHED : def executed
 **//**
 *  @fileOverview mix loader into S and infer KISSy baseUrl if not set
 *  @author  lifesinger@gmail.com,yiminghe@gmail.com
 */
(function (S) {

    if (typeof require !== 'undefined') {
        return;
    }

    var Loader = S.Loader,
        utils = Loader.Utils,
        ComboLoader = S.Loader.Combo;

    S.mix(S,
        /**
         * @lends KISSY
         */
        {
            /**
             * Registers a module with the KISSY global.
             * @param {String} [name] module name.
             * it must be set if combine is true in {@link KISSY.config}
             * @param {Function} def module definition function that is used to return
             * this module value
             * @param {KISSY} def.S KISSY global instance
             * @param def.x... this module's required modules' value
             * @param {Object} [cfg] module optional config data
             * @param {String[]} cfg.requires this module's required module name list
             * @example
             * // dom module's definition
             * <code>
             * KISSY.add("dom",function(S,UA){
             *  return { css:function(el,name,val){} };
             * },{
             *  requires:["ua"]
             * });
             * </code>
             */
            add:function (name, def, cfg) {
                this.getLoader().add(name, def, cfg);
            },
            /**
             * Attached one or more modules to global KISSY instance.
             * @param {String|String[]} names moduleNames. 1-n modules to bind(use comma to separate)
             * @param {Function} callback callback function executed
             * when KISSY has the required functionality.
             * @param {KISSY} callback.S KISSY instance
             * @param callback.x... used module values
             * @example
             * // loads and attached overlay,dd and its dependencies
             * KISSY.use("overlay,dd",function(S,Overlay){});
             */
            use:function (names, callback) {
                this.getLoader().use(names, callback);
            },
            /**
             * get KISSY's loader instance
             * @returns {KISSY.Loader}
             */
            getLoader:function () {
                var self = this;
                if (self.Config.combine) {
                    return self.Env._comboLoader;
                } else {
                    return self.Env._loader;
                }
            },
            /**
             * get module value defined by define function
             * @param {string} moduleName
             * @private
             */
            require:function (moduleName) {
                var self = this,
                    mods = self.Env.mods,
                    mod = mods[moduleName];
                return mod && mod.value;
            }
        });


    // notice: timestamp
    var baseReg = /^(.*)(seed|kissy)(-aio)?(-min)?\.js[^/]*/i,
        baseTestReg = /(seed|kissy)(-aio)?(-min)?\.js/i;

    /**
     * get base from src
     * @param script script node
     * @return base for kissy
     * @private
     * @example
     * <pre>
     *   http://a.tbcdn.cn/s/kissy/1.1.6/??kissy-min.js,suggest/suggest-pkg-min.js
     *   http://a.tbcdn.cn/??s/kissy/1.1.6/kissy-min.js,s/kissy/1.1.5/suggest/suggest-pkg-min.js
     *   http://a.tbcdn.cn/??s/kissy/1.1.6/suggest/suggest-pkg-min.js,s/kissy/1.1.5/kissy-min.js
     *   http://a.tbcdn.cn/s/kissy/1.1.6/kissy-min.js?t=20101215.js
     *  note about custom combo rules, such as yui3:
     *   <script src="path/to/kissy" data-combo-prefix="combo?" data-combo-sep="&"></script>
     * <pre>
     */
    function getBaseUrl(script) {
        var src = utils.absoluteFilePath(script.src),
            prefix = S.Config.comboPrefix = script.getAttribute('data-combo-prefix') || '??',
            sep = S.Config.comboSep = script.getAttribute('data-combo-sep') || ',',
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
    function initLoader() {
        var self = this, env = self.Env;
        env.mods = env.mods || {}; // all added mods
        env._loader = new Loader(self);
        env._comboLoader = new ComboLoader(self);
    }

    // get base from current script file path
    var scripts = S.Env.host.document.getElementsByTagName('script');

    S.config({
        base:getBaseUrl(scripts[scripts.length - 1])
    });

    // the default timeout for getScript
    S.Config.timeout = 10;

    S.Config.tag = S.__BUILD_TIME;

    initLoader.call(S);

    // for S.app working properly
    S.__APP_MEMBERS.push("add", "use", "require");

    S.__APP_INIT_METHODS.push(initLoader);

})(KISSY);/**
 * @fileOverview   web.js
 * @author  lifesinger@gmail.com,yiminghe@gmail.com
 * @description this code can only run at browser environment
 */
(function (S, undefined) {

    var win = S.Env.host,

        doc = win['document'],

        docElem = doc.documentElement,

        EMPTY = '',

        readyDefer = new S.Defer(),

        readyPromise = readyDefer.promise,

        // The number of poll times.
        POLL_RETRYS = 500,

        // The poll interval in milliseconds.
        POLL_INTERVAL = 40,

        // #id or id
        RE_IDSTR = /^#?([\w-]+)$/,

        RE_NOT_WHITE = /\S/;

    S.mix(S,
        /**
         * @lends KISSY
         */
        {


            /**
             * A crude way of determining if an object is a window
             */
            isWindow:function (o) {
                return S.type(o) === 'object'
                    && 'setInterval' in o
                    && 'document' in o
                    && o.document.nodeType == 9;
            },


            /**
             * get xml representation of data
             * @param {String} data
             */
            parseXML:function (data) {
                var xml;
                try {
                    // Standard
                    if (win.DOMParser) {
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
            globalEval:function (data) {
                if (data && RE_NOT_WHITE.test(data)) {
                    // http://weblogs.java.net/blog/driscoll/archive/2009/09/08/eval-javascript-global-context
                    ( win.execScript || function (data) {
                        win[ "eval" ].call(win, data);
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
            ready:function (fn) {

                function f() {
                    try {
                        fn(S);
                    } catch (e) {
                        // print stack info for firefox/chrome
                        S.log(e.stack, "error");
                        if (S.Config.debug) {
                            throw e;
                        }
                    }
                }

                readyPromise.then(f);

                return this;
            },

            /**
             * Executes the supplied callback when the item with the supplied id is found.
             * @param id <String> The id of the element, or an array of ids to look for.
             * @param fn <Function> What to execute when the element is found.
             */
            available:function (id, fn) {
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
            eventType = doScroll ? 'onreadystatechange' : 'DOMContentLoaded',
            COMPLETE = 'complete',
            fire = function () {
                readyDefer.resolve(S)
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

            // ensure firing before onload (but completed after all inner iframes is loaded)
            // maybe late but safe also for iframes
            doc.attachEvent(eventType, stateChange);

            // A fallback to window.onload, that will always work.
            win.attachEvent('onload', fire);

            // If IE and not a frame
            // continually check to see if the document is ready
            var notframe;

            try {
                notframe = (win['frameElement'] === null);
            } catch (e) {
                S.log("get frameElement error : ");
                S.log(e);
                notframe = false;
            }

            // can not use in iframe,parent window is dom ready so doScoll is ready too
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

    if (navigator.userAgent.match(/MSIE/)) {
        try {
            doc.execCommand("BackgroundImageCache", false, true);
        } catch (e) {
        }
    }

})(KISSY, undefined);
/**
 * module meta info for auto combo
 * @author yiminghe@gmail.com
 */
(function (S) {
    S.add({

        /****************************
         * Core
         ****************************/
        "dom":{
            requires:["ua"]
        },
        "event":{
            requires:["dom"]
        },
        "ajax":{
            requires:["dom", "event", "json"]
        },
        "anim":{
            requires:["dom", "event"]
        },
        "base":{
            requires:["event"]
        },
        "node":{
            requires:["dom", "event", "anim"]
        },
        core:{
            alias:["dom", "event", "ajax", "anim", "base", "node", "json"]
        },

        /******************************
         *  Infrastructure
         ******************************/
        "uibase":{
            requires:['base', 'node']
        },
        "mvc":{
            requires:["base", "ajax"]
        },
        "component":{
            requires:["uibase", "node"]
        },

        /****************************
         *  UI Component
         ****************************/

        "input-selection":{
            // TODO: implement conditional loader
            condition:function () {
                return typeof S.Env.host.document.createElement("input").selectionEnd != "number";
            },
            requires:['dom']
        },

        "button":{
            requires:["component", "node"]
        },
        "overlay":{
            requires:["component", "node"]
        },
        "resizable":{
            requires:["base", "node"]
        },
        "menu":{
            requires:["component", "node"]
        },
        "menubutton":{
            requires:["menu", "button"]
        },
        "validation":{
            requires:["node", "ajax"]
        },
        "waterfall":{
            requires:["node", "base", "ajax"]
        },
        "tree":{
            requires:["component", "node"]
        },
        "suggest":{
            requires:["dom", "event"]
        },
        "switchable":{
            requires:["dom", "event", "anim", "json"]
        },
        "calendar":{
            requires:["node"]
        },
        "datalazyload":{
            requires:["dom", "event"]
        },
        "dd":{
            requires:["node", "base"]
        },
        "flash":{
            requires:["dom", "json"]
        },
        "imagezoom":{
            requires:["node", "uibase"]
        },
        "editor":{
            requires:['htmlparser', 'core']
        }
    });

})(KISSY);
/**
 * TODO: should be auto generated by module compiler
 **/
/*
Copyright 2012, KISSY UI Library v1.30dev
MIT Licensed
build time: Mar 29 23:41
*/
/**
 * @fileOverview ua
 * @author lifesinger@gmail.com
 */
KISSY.add('ua/base', function (S, undefined) {

    var ua = navigator.userAgent,
        EMPTY = '',
        MOBILE = 'mobile',
        core = EMPTY,
        shell = EMPTY, m,
        IE_DETECT_RANGE = [6, 9],
        v,
        end,
        VERSION_PLACEHOLDER = '{{version}}',
        IE_DETECT_TPL = '<!--[if IE ' + VERSION_PLACEHOLDER + ']><' + 's></s><![endif]-->',
        div = S.Env.host.document.createElement('div'),
        s,
        o = {
            // browser core type
            webkit:undefined,
            trident:undefined,
            gecko:undefined,
            presto:undefined,

            // browser type
            chrome:undefined,
            safari:undefined,
            firefox:undefined,
            ie:undefined,
            opera:undefined,

            mobile:undefined,
            core:undefined,
            shell:undefined
        },
        numberify = function (s) {
            var c = 0;
            // convert '1.2.3.4' to 1.234
            return parseFloat(s.replace(/\./g, function () {
                return (c++ === 0) ? '.' : '';
            }));
        };

    // try to use IE-Conditional-Comment detect IE more accurately
    // IE10 doesn't support this method, @ref: http://blogs.msdn.com/b/ie/archive/2011/07/06/html5-parsing-in-ie10.aspx
    div.innerHTML = IE_DETECT_TPL.replace(VERSION_PLACEHOLDER, '');
    s = div.getElementsByTagName('s');

    if (s.length > 0) {

        shell = 'ie';
        o[core = 'trident'] = 0.1; // Trident detected, look for revision

        // Get the Trident's accurate version
        if ((m = ua.match(/Trident\/([\d.]*)/)) && m[1]) {
            o[core] = numberify(m[1]);
        }

        // Detect the accurate version
        // 注意：
        //  o.shell = ie, 表示外壳是 ie
        //  但 o.ie = 7, 并不代表外壳是 ie7, 还有可能是 ie8 的兼容模式
        //  对于 ie8 的兼容模式，还要通过 documentMode 去判断。但此处不能让 o.ie = 8, 否则
        //  很多脚本判断会失误。因为 ie8 的兼容模式表现行为和 ie7 相同，而不是和 ie8 相同
        for (v = IE_DETECT_RANGE[0], end = IE_DETECT_RANGE[1]; v <= end; v++) {
            div.innerHTML = IE_DETECT_TPL.replace(VERSION_PLACEHOLDER, v);
            if (s.length > 0) {
                o[shell] = v;
                break;
            }
        }

    } else {

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
                    else if ((m = ua.match(/Opera Mobi[^;]*/)) && m) {
                        o[MOBILE] = m[0];
                    }
                }

                // NOT WebKit or Presto
            } else {
                // MSIE
                // 由于最开始已经使用了 IE 条件注释判断，因此落到这里的唯一可能性只有 IE10+
                if ((m = ua.match(/MSIE\s([^;]*)/)) && m[1]) {
                    o[core = 'trident'] = 0.1; // Trident detected, look for revision
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
    }

    o.core = core;
    o.shell = shell;
    o._numberify = numberify;
    return o;
});

/**
 * NOTES:
 *
 * 2011.11.08
 *  - ie < 10 使用条件注释判断内核，更精确 by gonghaocn@gmail.com
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
 * attach ua to class of html
 * @author yiminghe@gmail.com
 */
KISSY.add("ua/css", function (S, UA) {
    var o = [
        // browser core type
        "webkit",
        "trident",
        "gecko",
        "presto",
        // browser type
        "chrome",
        "safari",
        "firefox",
        "ie",
        "opera"
    ],
        documentElement = S.Env.host.document.documentElement,
        className = "",
        v;
    S.each(o, function (key) {
        if (v = UA[key]) {
            className += " ks-" + key + ((v + "").replace(/\./g, "_"));
            className += " ks-" + key;
        }
    });
    documentElement.className = S.trim(documentElement.className + className);
}, {
    requires:['./base']
});

/**
 * refer :
 *  - http://yiminghe.iteye.com/blog/444889
 *//**
 * @fileOverview ua-extra
 * @author gonghao<gonghao@ghsky.com>
 */
KISSY.add('ua/extra', function(S, UA) {
    var ua = navigator.userAgent,
        win=S.Env.host,
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
    else if ((m = ua.match(/Maxthon/)) && (external = win.external)) {
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
/**
 * @fileOverview ua
 */
KISSY.add("ua", function (S, UA) {
    S.UA = UA;
    return UA;
}, {
    requires:["ua/extra", "ua/css"]
});
/*
Copyright 2012, KISSY UI Library v1.30dev
MIT Licensed
build time: Apr 9 12:04
*/
/**
 * @fileOverview   dom-attr
 * @author  yiminghe@gmail.com,lifesinger@gmail.com
 */
KISSY.add('dom/attr', function (S, DOM, UA, undefined) {

        var doc = S.Env.host.document,
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
                val:1,
                css:1,
                html:1,
                text:1,
                data:1,
                width:1,
                height:1,
                offset:1,
                scrollTop:1,
                scrollLeft:1
            },
            attrHooks = {
                // http://fluidproject.org/blog/2008/01/09/getting-setting-and-removing-tabindex-values-with-javascript/
                tabindex:{
                    get:function (el) {
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
                    get:function (el) {
                        return el.style.cssText;
                    },
                    set:function (el, val) {
                        el.style.cssText = val;
                    }
                }
            },
            propFix = {
                "hidefocus":"hideFocus",
                tabindex:"tabIndex",
                readonly:"readOnly",
                "for":"htmlFor",
                "class":"className",
                maxlength:"maxLength",
                "cellspacing":"cellSpacing",
                "cellpadding":"cellPadding",
                rowspan:"rowSpan",
                colspan:"colSpan",
                usemap:"useMap",
                "frameborder":"frameBorder",
                "contenteditable":"contentEditable"
            },
            // Hook for boolean attributes
            // if bool is false
            //  - standard browser returns null
            //  - ie<8 return false
            //   - so norm to undefined
            boolHook = {
                get:function (elem, name) {
                    // 转发到 prop 方法
                    return DOM.prop(elem, name) ?
                        // 根据 w3c attribute , true 时返回属性名字符串
                        name.toLowerCase() :
                        undefined;
                },
                set:function (elem, value, name) {
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
                option:{
                    get:function (elem) {
                        // 当没有设定 value 时，标准浏览器 option.value === option.text
                        // ie7- 下，没有设定 value 时，option.value === '', 需要用 el.attributes.value 来判断是否有设定 value
                        var val = elem.attributes.value;
                        return !val || val.specified ? elem.value : elem.text;
                    }
                },
                select:{
                    // 对于 select, 特别是 multiple type, 存在很严重的兼容性问题
                    get:function (elem) {
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

                    set:function (elem, value) {
                        var values = S.makeArray(value),
                            opts = elem.options;
                        S.each(opts, function (opt) {
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
                get:function (elem, name) {
                    var ret;
                    ret = elem.getAttributeNode(name);
                    // Return undefined if attribute node specified by user
                    return ret && (
                        // fix #100
                        ret.specified
                            // input.attr("value")
                            || ret.nodeValue) ?
                        ret.nodeValue :
                        undefined;
                },
                set:function (elem, value, name) {
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
                            // http://msdn.microsoft.com/en-us/library/ms536739(v=vs.85).aspx
                            // 0 : Match sAttrName regardless of case.
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
            S.each([ "href", "src", "width", "height", "colSpan", "rowSpan" ], function (name) {
                attrHooks[ name ] = {
                    get:function (elem) {
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

        S.each([ "radio", "checkbox" ], function (r) {
            valHooks[ r ] = {
                get:function (elem) {
                    // Handle the case where in Webkit "" is returned instead of "on" if a value isn't specified
                    return elem.getAttribute("value") === null ? "on" : elem.value;
                },
                set:function (elem, value) {
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

        S.mix(DOM,
            /**
             * @lends DOM
             */
            {
                /**
                 * Get the value of a property for the first element in the set of matched elements.
                 * or
                 * Set one or more properties for the set of matched elements.
                 * @param {Array<HTMLElement>|String} selector matched elements
                 * @param {String|Object} name
                 * The name of the property to set.
                 * or
                 * A map of property-value pairs to set.
                 * @param [value] A value to set for the property.
                 * @returns {String|undefined|boolean}
                 */
                prop:function (selector, name, value) {
                    var elems = DOM.query(selector);

                    // supports hash
                    if (S.isPlainObject(name)) {
                        for (var k in name) {
                            DOM.prop(elems, k, name[k]);
                        }
                        return undefined;
                    }

                    // Try to normalize/fix the name
                    name = propFix[ name ] || name;
                    var hook = propHooks[ name ];
                    if (value !== undefined) {
                        for (var i = elems.length - 1; i >= 0; i--) {
                            var elem = elems[i];
                            if (hook && hook.set) {
                                hook.set(elem, value, name);
                            } else {
                                elem[ name ] = value;
                            }
                        }
                    } else {
                        if (elems.length) {
                            return getProp(elems[0], name);
                        }
                    }
                    return undefined;
                },

                /**
                 * Whether one of the matched elements has specified property name
                 * @param {Array<HTMLElement>|String} selector 元素
                 * @param {String} name The name of property to test
                 * @return {boolean}
                 */
                hasProp:function (selector, name) {
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
                 * Remove a property for the set of matched elements.
                 * @param {Array<HTMLElement>|String} selector matched elements
                 * @param {String} name The name of the property to remove.
                 */
                removeProp:function (selector, name) {
                    name = propFix[ name ] || name;
                    var elems = DOM.query(selector);
                    for (var i = elems.length - 1; i >= 0; i--) {
                        var el = elems[i];
                        try {
                            el[ name ] = undefined;
                            delete el[ name ];
                        } catch (e) {
                            // S.log("delete el property error : ");
                            // S.log(e);
                        }
                    }
                },

                /**
                 * Get the value of an attribute for the first element in the set of matched elements.
                 * or
                 * Set one or more attributes for the set of matched elements.
                 * @param {HTMLElement[]|HTMLElement|String|Element} selector matched elements
                 * @param {String|Object} name The name of the attribute to set. or A map of attribute-value pairs to set.
                 * @param [val] A value to set for the attribute.
                 * @returns {String}
                 */
                attr:function (selector, name, val, pass) {
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

                    var els = DOM.query(selector);

                    // supports hash
                    if (S.isPlainObject(name)) {
                        pass = val;
                        for (var k in name) {
                            if (name.hasOwnProperty(k)) {
                                DOM.attr(els, k, name[k], pass);
                            }
                        }
                        return undefined;
                    }

                    if (!(name = S.trim(name))) {
                        return undefined;
                    }

                    // attr functions
                    if (pass && attrFn[name]) {
                        return DOM[name](selector, val);
                    }

                    // scrollLeft
                    name = name.toLowerCase();

                    if (pass && attrFn[name]) {
                        return DOM[name](selector, val);
                    }

                    // custom attrs
                    name = attrFix[name] || name;

                    var attrNormalizer,
                        el = els[0],
                        ret;

                    if (rboolean.test(name)) {
                        attrNormalizer = boolHook;
                    }
                    // only old ie?
                    else if (rinvalidChar.test(name)) {
                        attrNormalizer = attrNodeHook;
                    } else {
                        attrNormalizer = attrHooks[name];
                    }


                    if (val === undefined) {
                        if (el && el.nodeType === DOM.ELEMENT_NODE) {
                            // browsers index elements by id/name on forms, give priority to attributes.
                            if (nodeName(el, "form")) {
                                attrNormalizer = attrNodeHook;
                            }
                            if (attrNormalizer && attrNormalizer.get) {
                                return attrNormalizer.get(el, name);
                            }

                            ret = el.getAttribute(name);

                            // standard browser non-existing attribute return null
                            // ie<8 will return undefined , because it return property
                            // so norm to undefined
                            return ret === null ? undefined : ret;
                        }
                    } else {
                        for (var i = els.length - 1; i >= 0; i--) {
                            el = els[i];
                            if (el && el.nodeType === DOM.ELEMENT_NODE) {
                                if (nodeName(el, "form")) {
                                    attrNormalizer = attrNodeHook;
                                }
                                if (attrNormalizer && attrNormalizer.set) {
                                    attrNormalizer.set(el, val, name);
                                } else {
                                    // convert the value to a string (all browsers do this but IE)
                                    el.setAttribute(name, EMPTY + val);
                                }
                            }
                        }
                    }
                    return undefined;
                },

                /**
                 * Remove an attribute from each element in the set of matched elements.
                 * @param {Array<HTMLElement>|String} selector matched elements
                 * @param {String} name An attribute to remove
                 */
                removeAttr:function (selector, name) {
                    name = name.toLowerCase();
                    name = attrFix[name] || name;
                    var els = DOM.query(selector), el, i;
                    for (i = els.length - 1; i >= 0; i--) {
                        el = els[i];
                        if (isElementNode(el)) {
                            var propName;
                            el.removeAttribute(name);
                            // Set corresponding property to false for boolean attributes
                            if (rboolean.test(name) && (propName = propFix[ name ] || name) in el) {
                                el[ propName ] = false;
                            }
                        }
                    }
                },

                /**
                 * Whether one of the matched elements has specified attribute
                 * @function
                 * @param {Array<HTMLElement>|String} selector matched elements
                 * @param {String} name The attribute to be tested
                 * @returns {Boolean}
                 */
                hasAttr:oldIE ?
                    function (selector, name) {
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
                    function (selector, name) {
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
                 * Get the current value of the first element in the set of matched elements.
                 * or
                 * Set the value of each element in the set of matched elements.
                 * @param {Array<HTMLElement>|String} selector matched elements
                 * @param {String|Array<String>} [value] A string of text or an array of strings corresponding to the value of each matched element to set as selected/checked.
                 * @returns {undefined|String|Array<String>|Number}
                 */
                val:function (selector, value) {
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
                                ret == null ? "" : ret;
                        }

                        return undefined;
                    }

                    var els = DOM.query(selector), i;
                    for (i = els.length - 1; i >= 0; i--) {
                        elem = els[i];
                        if (elem.nodeType !== 1) {
                            return undefined;
                        }

                        var val = value;

                        // Treat null/undefined as ""; convert numbers to string
                        if (val == null) {
                            val = "";
                        } else if (typeof val === "number") {
                            val += "";
                        } else if (S.isArray(val)) {
                            val = S.map(val, function (value) {
                                return value == null ? "" : value + "";
                            });
                        }

                        hook = valHooks[ elem.nodeName.toLowerCase() ] || valHooks[ elem.type ];

                        // If set returns undefined, fall back to normal setting
                        if (!hook || !("set" in hook) || hook.set(elem, val, "value") === undefined) {
                            elem.value = val;
                        }
                    }
                    return undefined;
                },

                _propHooks:propHooks,

                /**
                 * Get the combined text contents of each element in the set of matched elements, including their descendants.
                 * or
                 * Set the content of each element in the set of matched elements to the specified text.
                 * @param {HTMLElement[]|HTMLElement|String} selector matched elements
                 * @param {String} [val] A string of text to set as the content of each matched element.
                 * @returns {String|undefined}
                 */
                text:function (selector, val) {
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
                        var els = DOM.query(selector), i;
                        for (i = els.length - 1; i >= 0; i--) {
                            el = els[i];
                            if (isElementNode(el)) {
                                el[TEXT] = val;
                            }
                            else if (isTextNode(el)) {
                                el.nodeValue = val;
                            }
                        }
                    }
                    return undefined;
                }
            });
        if (1 > 2) {
            DOM.removeProp("j", "1");
        }
        return DOM;
    }, {
        requires:["./base", "ua"]
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
 * @fileOverview   dom
 * @author  yiminghe@gmail.com,lifesinger@gmail.com
 */
KISSY.add('dom/base', function (S, UA, undefined) {

    var WINDOW=S.Env.host;

    function nodeTypeIs(node, val) {
        return node && node.nodeType === val;
    }


    var NODE_TYPE =
    /**
     * @lends DOM
     */
    {
        ELEMENT_NODE:1,
        "ATTRIBUTE_NODE":2,
        TEXT_NODE:3,
        "CDATA_SECTION_NODE":4,
        "ENTITY_REFERENCE_NODE":5,
        "ENTITY_NODE":6,
        "PROCESSING_INSTRUCTION_NODE":7,
        COMMENT_NODE:8,
        DOCUMENT_NODE:9,
        "DOCUMENT_TYPE_NODE":10,
        DOCUMENT_FRAGMENT_NODE:11,
        "NOTATION_NODE":12
    };
    var DOM = {

        _isCustomDomain:function (win) {
            win = win || WINDOW;
            var domain = win.document.domain,
                hostname = win.location.hostname;
            return domain != hostname &&
                domain != ( '[' + hostname + ']' );	// IPv6 IP support
        },

        _genEmptyIframeSrc:function (win) {
            win = win || WINDOW;
            if (UA['ie'] && DOM._isCustomDomain(win)) {
                return  'javascript:void(function(){' + encodeURIComponent("" +
                    "document.open();" +
                    "document.domain='" +
                    win.document.domain
                    + "';" +
                    "document.close();") + "}())";
            }
        },

        _NODE_TYPE:NODE_TYPE,


        /**
         * 是不是 element node
         */
        _isElementNode:function (elem) {
            return nodeTypeIs(elem, DOM.ELEMENT_NODE);
        },

        /**
         * elem 为 window 时，直接返回
         * elem 为 document 时，返回关联的 window
         * elem 为 undefined 时，返回当前 window
         * 其它值，返回 false
         */
        _getWin:function (elem) {
            return (elem && ('scrollTo' in elem) && elem['document']) ?
                elem :
                nodeTypeIs(elem, DOM.DOCUMENT_NODE) ?
                    elem.defaultView || elem.parentWindow :
                    (elem === undefined || elem === null) ?
                        WINDOW : false;
        },

        _nodeTypeIs:nodeTypeIs,

        // Ref: http://lifesinger.github.com/lab/2010/nodelist.html
        _isNodeList:function (o) {
            // 注1：ie 下，有 window.item, typeof node.item 在 ie 不同版本下，返回值不同
            // 注2：select 等元素也有 item, 要用 !node.nodeType 排除掉
            // 注3：通过 namedItem 来判断不可靠
            // 注4：getElementsByTagName 和 querySelectorAll 返回的集合不同
            // 注5: 考虑 iframe.contentWindow
            return o && !o.nodeType && o.item && !o.setTimeout;
        },

        _nodeName:function (e, name) {
            return e && e.nodeName.toLowerCase() === name.toLowerCase();
        }
    };

    S.mix(DOM, NODE_TYPE);

    return DOM;

}, {
    requires:['ua']
});

/**
 * 2011-08
 *  - 添加键盘枚举值，方便依赖程序清晰
 */
/**
 * @fileOverview   dom-class
 * @author  lifesinger@gmail.com,yiminghe@gmail.com
 */
KISSY.add('dom/class', function (S, DOM, undefined) {

    var SPACE = ' ',
        REG_SPLIT = /[\.\s]\s*\.?/,
        REG_CLASS = /[\n\t]/g;

    function norm(elemClass) {
        return (SPACE + elemClass + SPACE).replace(REG_CLASS, SPACE);
    }

    S.mix(DOM,

        /**
         * @lends DOM
         */
        {
            /**
             * Determine whether any of the matched elements are assigned the given classes.
             * @param {HTMLElement|String|HTMLElement[]} [selector] matched elements
             * @param {String} className One or more class names to search for.
             * multiple class names is separated by space
             * @return {boolean}
             */
            hasClass:function (selector, className) {
                return batch(selector, className, function (elem, classNames, cl) {
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
             * @param {HTMLElement|String|HTMLElement[]} [selector] matched elements
             * @param {String} className One or more class names to be added to the class attribute of each matched element.
             * multiple class names is separated by space
             */
            addClass:function (selector, className) {
                batch(selector, className, function (elem, classNames, cl) {
                    var elemClass = elem.className;
                    if (!elemClass) {
                        elem.className = className;
                    } else {
                        var normClassName = norm(elemClass),
                            setClass = elemClass,
                            j = 0;
                        for (; j < cl; j++) {
                            if (normClassName.indexOf(SPACE + classNames[j] + SPACE) < 0) {
                                setClass += SPACE + classNames[j];
                            }
                        }
                        elem.className = S.trim(setClass);
                    }
                }, undefined);
            },

            /**
             * Remove a single class, multiple classes, or all classes from each element in the set of matched elements.
             * @param {HTMLElement|String|HTMLElement[]} [selector] matched elements
             * @param {String} className One or more class names to be removed from the class attribute of each matched element.
             * multiple class names is separated by space
             */
            removeClass:function (selector, className) {
                batch(selector, className, function (elem, classNames, cl) {
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
             * @param {HTMLElement|String|HTMLElement[]} [selector] matched elements
             * @param {String} oldClassName One or more class names to be removed from the class attribute of each matched element.
             * multiple class names is separated by space
             * @param {String} newClassName One or more class names to be added to the class attribute of each matched element.
             * multiple class names is separated by space
             */
            replaceClass:function (selector, oldClassName, newClassName) {
                DOM.removeClass(selector, oldClassName);
                DOM.addClass(selector, newClassName);
            },

            /**
             * Add or remove one or more classes from each element in the set of
             * matched elements, depending on either the class's presence or the
             * value of the switch argument.
             * @param {HTMLElement|String|HTMLElement[]} [selector] matched elements
             * @param {String} className One or more class names to be added to the class attribute of each matched element.
             * multiple class names is separated by space
             * @param [state] {Boolean} optional boolean to indicate whether class
             *        should be added or removed regardless of current state.
             */
            toggleClass:function (selector, className, state) {
                var isBool = S.isBoolean(state), has;

                batch(selector, className, function (elem, classNames, cl) {
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
 * @fileOverview   dom-create
 * @author  lifesinger@gmail.com,yiminghe@gmail.com
 */
KISSY.add('dom/create', function (S, DOM, UA, undefined) {

        var doc = S.Env.host.document,
            ie = UA['ie'],
            nodeTypeIs = DOM._nodeTypeIs,
            isElementNode = DOM._isElementNode,
            isString = S.isString,
            DIV = 'div',
            PARENT_NODE = 'parentNode',
            DEFAULT_DIV = doc.createElement(DIV),
            rxhtmlTag = /<(?!area|br|col|embed|hr|img|input|link|meta|param)(([\w:]+)[^>]*)\/>/ig,
            RE_TAG = /<([\w:]+)/,
            rtbody = /<tbody/i,
            rleadingWhitespace = /^\s+/,
            lostLeadingWhitespace = ie && ie < 9,
            rhtml = /<|&#?\w+;/,
            RE_SIMPLE_TAG = /^<(\w+)\s*\/?>(?:<\/\1>)?$/;

        // help compression
        function getElementsByTagName(el, tag) {
            return el.getElementsByTagName(tag);
        }

        function cleanData(els) {
            var Event = S.require("event");
            if (Event) {
                Event.detach(els);
            }
            DOM.removeData(els);
        }

        S.mix(DOM,
            /**
             * @lends DOM
             */
            {

                /**
                 * Creates DOM elements on the fly from the provided string of raw HTML.
                 * @param {String} html A string of HTML to create on the fly. Note that this parses HTML, not XML.
                 * @param {Object} [props] An map of attributes on the newly-created element.
                 * @param {Document} [ownerDoc] A document in which the new elements will be created
                 * @returns {DocumentFragment|HTMLElement}
                 */
                create:function (html, props, ownerDoc, _trim/*internal*/) {

                    var ret = null;

                    if (!html) {
                        return ret;
                    }

                    if (html.nodeType) {
                        return DOM.clone(html);
                    }


                    if (!isString(html)) {
                        return ret;
                    }

                    if (_trim === undefined) {
                        _trim = true;
                    }

                    if (_trim) {
                        html = S.trim(html);
                    }


                    var creators = DOM._creators,
                        holder,
                        whitespaceMatch,
                        context = ownerDoc || doc,
                        m,
                        tag = DIV,
                        k,
                        nodes;

                    if (!rhtml.test(html)) {
                        ret = context.createTextNode(html);
                    }
                    // 简单 tag, 比如 DOM.create('<p>')
                    else if ((m = RE_SIMPLE_TAG.exec(html))) {
                        ret = context.createElement(m[1]);
                    }
                    // 复杂情况，比如 DOM.create('<img src="sprite.png" />')
                    else {
                        // Fix "XHTML"-style tags in all browsers
                        html = html.replace(rxhtmlTag, "<$1><" + "/$2>");

                        if ((m = RE_TAG.exec(html)) && (k = m[1])) {
                            tag = k.toLowerCase();
                        }

                        holder = (creators[tag] || creators[DIV])(html, context);
                        // ie 把前缀空白吃掉了
                        if (lostLeadingWhitespace && (whitespaceMatch = html.match(rleadingWhitespace))) {
                            holder.insertBefore(context.createTextNode(whitespaceMatch[0]), holder.firstChild);
                        }
                        nodes = holder.childNodes;

                        if (nodes.length === 1) {
                            // return single node, breaking parentNode ref from "fragment"
                            ret = nodes[0][PARENT_NODE].removeChild(nodes[0]);
                        }
                        else if (nodes.length) {
                            // return multiple nodes as a fragment
                            ret = nl2frag(nodes, context);
                        } else {
                            S.error(html + " : create node error");
                        }
                    }

                    return attachProps(ret, props);
                },

                _creators:{
                    div:function (html, ownerDoc) {
                        var frag = ownerDoc && ownerDoc != doc ? ownerDoc.createElement(DIV) : DEFAULT_DIV;
                        // html 为 <style></style> 时不行，必须有其他元素？
                        frag['innerHTML'] = "m<div>" + html + "<" + "/div>";
                        return frag.lastChild;
                    }
                },

                /**
                 * Get the HTML contents of the first element in the set of matched elements.
                 * or
                 * Set the HTML contents of each element in the set of matched elements.
                 * @param {HTMLElement|String|HTMLElement[]} [selector] matched elements
                 * @param {String} htmlString  A string of HTML to set as the content of each matched element.
                 * @param {Boolean} [loadScripts=false] True to look for and process scripts
                 */
                html:function (selector, htmlString, loadScripts, callback) {
                    // supports css selector/Node/NodeList
                    var els = DOM.query(selector),
                        el = els[0];
                    if (!el) {
                        return
                    }
                    // getter
                    if (htmlString === undefined) {
                        // only gets value on the first of element nodes
                        if (isElementNode(el)) {
                            return el['innerHTML'];
                        } else {
                            return null;
                        }
                    }
                    // setter
                    else {

                        var success = false, i, elem;
                        htmlString += "";

                        // faster
                        // fix #103,some html element can not be set through innerHTML
                        if (!htmlString.match(/<(?:script|style|link)/i) &&
                            (!lostLeadingWhitespace || !htmlString.match(rleadingWhitespace)) &&
                            !creatorsMap[ (htmlString.match(RE_TAG) || ["", ""])[1].toLowerCase() ]) {

                            try {
                                for (i = els.length - 1; i >= 0; i--) {
                                    elem = els[i];
                                    if (isElementNode(elem)) {
                                        cleanData(getElementsByTagName(elem, "*"));
                                        elem.innerHTML = htmlString;
                                    }
                                }
                                success = true;
                            } catch (e) {
                                // a <= "<a>"
                                // a.innerHTML='<p>1</p>';
                            }

                        }

                        if (!success) {
                            var valNode = DOM.create(htmlString, 0, el.ownerDocument, 0);
                            for (i = els.length - 1; i >= 0; i--) {
                                elem = els[i];
                                if (isElementNode(elem)) {
                                    DOM.empty(elem);
                                    DOM.append(valNode, elem, loadScripts);
                                }
                            }
                        }
                        callback && callback();
                    }
                },

                /**
                 * Remove the set of matched elements from the DOM.
                 * @param {HTMLElement|String|HTMLElement[]} [selector] matched elements
                 * @param {Boolean} [keepData=false] whether keep bound events and jQuery data associated with the elements from removed.
                 */
                remove:function (selector, keepData) {
                    var el, els = DOM.query(selector), i;
                    for (i = els.length - 1; i >= 0; i--) {
                        el = els[i];
                        if (!keepData && isElementNode(el)) {
                            // 清理数据
                            var elChildren = getElementsByTagName(el, "*");
                            cleanData(elChildren);
                            cleanData(el);
                        }

                        if (el.parentNode) {
                            el.parentNode.removeChild(el);
                        }
                    }
                },

                /**
                 * Create a deep copy of the first of matched elements.
                 * @param {HTMLElement|String|HTMLElement[]} [selector] matched elements
                 * @param {Boolean} [deep=false] whether perform deep copy
                 * @param {Boolean} [withDataAndEvent=false] A Boolean indicating
                 * whether event handlers and data should be copied along with the elements.
                 * @param {Boolean} [deepWithDataAndEvent=false]
                 * A Boolean indicating whether event handlers and data for all children of the cloned element should be copied.
                 * if set true then deep argument must be set true as well.
                 * @see https://developer.mozilla.org/En/DOM/Node.cloneNode
                 * @returns {HTMLElement}
                 */
                clone:function (selector, deep, withDataAndEvent, deepWithDataAndEvent) {
                    var elem = DOM.get(selector);

                    if (!elem) {
                        return null;
                    }

                    // TODO
                    // ie bug :
                    // 1. ie<9 <script>xx</script> => <script></script>
                    // 2. ie will execute external script
                    var clone = elem.cloneNode(deep);

                    if (isElementNode(elem) ||
                        nodeTypeIs(elem, DOM.DOCUMENT_FRAGMENT_NODE)) {
                        // IE copies events bound via attachEvent when using cloneNode.
                        // Calling detachEvent on the clone will also remove the events
                        // from the original. In order to get around this, we use some
                        // proprietary methods to clear the events. Thanks to MooTools
                        // guys for this hotness.
                        if (isElementNode(elem)) {
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

                /**
                 * Remove(include data and event handlers) all child nodes of the set of matched elements from the DOM.
                 * @param {HTMLElement|String|HTMLElement[]} [selector] matched elements
                 */
                empty:function (selector) {
                    var els = DOM.query(selector), el, i;
                    for (i = els.length - 1; i >= 0; i--) {
                        el = els[i];
                        DOM.remove(el.childNodes);
                    }
                },

                _nl2frag:nl2frag
            });

        function processAll(fn, elem, clone) {
            if (nodeTypeIs(elem, DOM.DOCUMENT_FRAGMENT_NODE)) {
                var eCs = elem.childNodes,
                    cloneCs = clone.childNodes,
                    fIndex = 0;
                while (eCs[fIndex]) {
                    if (cloneCs[fIndex]) {
                        processAll(fn, eCs[fIndex], cloneCs[fIndex]);
                    }
                    fIndex++;
                }
            } else if (isElementNode(elem)) {
                var elemChildren = getElementsByTagName(elem, "*"),
                    cloneChildren = getElementsByTagName(clone, "*"),
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

            if (isElementNode(dest) && !DOM.hasData(src)) {
                return;
            }

            var srcData = DOM.data(src);

            // 浅克隆，data 也放在克隆节点上
            for (var d in srcData) {
                DOM.data(dest, d, srcData[d]);
            }

            // 事件要特殊点
            if (Event) {
                // _removeData 不需要？刚克隆出来本来就没
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

            var nodeName = dest.nodeName.toLowerCase(),
                srcChilds = src.childNodes;

            // IE6-8 fail to clone children inside object elements that use
            // the proprietary classid attribute value (rather than the type
            // attribute) to identify the type of content to display
            if (nodeName === "object" && !dest.childNodes.length) {
                for (var i = 0; i < srcChilds.length; i++) {
                    dest.appendChild(srcChilds[i].cloneNode(true));
                }
                // dest.outerHTML = src.outerHTML;
            } else if (nodeName === "input" && (src.type === "checkbox" || src.type === "radio")) {
                // IE6-8 fails to persist the checked state of a cloned checkbox
                // or radio button. Worse, IE6-7 fail to give the cloned element
                // a checked appearance if the defaultChecked value isn't also set
                if (src.checked) {
                    dest['defaultChecked'] = dest.checked = src.checked;
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
                else if (nodeTypeIs(elem, DOM.DOCUMENT_FRAGMENT_NODE)) {
                    DOM.attr(elem.childNodes, props, true);
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
                nodes = S.makeArray(nodes);
                for (i = 0, len = nodes.length; i < len; i++) {
                    ret.appendChild(nodes[i]);
                }
            }
            else {
                S.log('Unable to convert ' + nodes + ' to fragment.');
            }
            return ret;
        }

        // only for gecko and ie
        // 2010-10-22: 发现 chrome 也与 gecko 的处理一致了
        // if (ie || UA['gecko'] || UA['webkit']) {
        // 定义 creators, 处理浏览器兼容
        var creators = DOM._creators,
            create = DOM.create,
            creatorsMap = {
                option:'select',
                optgroup:'select',
                area:'map',
                thead:'table',
                td:'tr',
                th:'tr',
                tr:'tbody',
                tbody:'table',
                tfoot:'table',
                caption:'table',
                colgroup:'table',
                col:'colgroup',
                legend:'fieldset' // ie 支持，但 gecko 不支持
            };

        for (var p in creatorsMap) {
            (function (tag) {
                creators[p] = function (html, ownerDoc) {
                    return create('<' + tag + '>' + html + '<' + '/' + tag + '>', null, ownerDoc);
                };
            })(creatorsMap[p]);
        }


        // IE7- adds TBODY when creating thead/tfoot/caption/col/colgroup elements
        if (ie < 8) {
            // fix #88
            // https://github.com/kissyteam/kissy/issues/88 : spurious tbody in ie<8
            creators.table = function (html, ownerDoc) {
                var frag = creators[DIV](html, ownerDoc),
                    hasTBody = rtbody.test(html);
                if (hasTBody) {
                    return frag;
                }
                var table = frag.firstChild,
                    tableChildren = S.makeArray(table.childNodes);
                S.each(tableChildren, function (c) {
                    if (DOM._nodeName(c, "tbody") && !c.childNodes.length) {
                        table.removeChild(c);
                    }
                });
                return frag;
            };
        }
        //}
        return DOM;
    },
    {
        requires:["./base", "ua"]
    });

/**
 * 2012-01-31
 * remove spurious tbody
 *
 * 2011-10-13
 * empty , html refactor
 *
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
 * @fileOverview   dom-data
 * @author  lifesinger@gmail.com,yiminghe@gmail.com
 */
KISSY.add('dom/data', function (S, DOM, undefined) {

    var win = S.Env.host,
        EXPANDO = '_ks_data_' + S.now(), // 让每一份 kissy 的 expando 都不同
        dataCache = { }, // 存储 node 节点的 data
        winDataCache = { };    // 避免污染全局


    // The following elements throw uncatchable exceptions if you
    // attempt to add expando properties to them.
    var noData = {
    };
    noData['applet'] = 1;
    noData['object'] = 1;
    noData['embed'] = 1;

    var commonOps = {
        hasData:function (cache, name) {
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
        hasData:function (ob, name) {
            // 只判断当前窗口，iframe 窗口内数据直接放入全局变量
            if (ob == win) {
                return objectOps.hasData(winDataCache, name);
            }
            // 直接建立在对象内
            var thisCache = ob[EXPANDO];
            return commonOps.hasData(thisCache, name);
        },

        data:function (ob, name, value) {
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
        removeData:function (ob, name) {
            if (ob == win) {
                return objectOps.removeData(winDataCache, name);
            }
            var cache = ob[EXPANDO];
            if (name !== undefined) {
                delete cache[name];
                if (S.isEmptyObject(cache)) {
                    objectOps.removeData(ob);
                }
            } else {
                try {
                    // ob maybe window in iframe
                    // ie will throw error
                    delete ob[EXPANDO];
                } catch (e) {
                    ob[EXPANDO] = undefined;
                }
            }
        }
    };

    var domOps = {
        hasData:function (elem, name) {
            var key = elem[EXPANDO];
            if (!key) {
                return false;
            }
            var thisCache = dataCache[key];
            return commonOps.hasData(thisCache, name);
        },

        data:function (elem, name, value) {
            if (noData[elem.nodeName.toLowerCase()]) {
                return undefined;
            }
            var key = elem[EXPANDO], cache;
            if (!key) {
                // 根本不用附加属性
                if (name !== undefined &&
                    value === undefined) {
                    return undefined;
                }
                // 节点上关联键值也可以
                key = elem[EXPANDO] = S.guid();
            }
            cache = dataCache[key];
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

        removeData:function (elem, name) {
            var key = elem[EXPANDO], cache;
            if (!key) {
                return;
            }
            cache = dataCache[key];
            if (name !== undefined) {
                delete cache[name];
                if (S.isEmptyObject(cache)) {
                    domOps.removeData(elem);
                }
            } else {
                delete dataCache[key];
                try {
                    delete elem[EXPANDO];
                } catch (e) {
                    elem[EXPANDO] = undefined;
                    //S.log("delete expando error : ");
                    //S.log(e);
                }
                if (elem.removeAttribute) {
                    elem.removeAttribute(EXPANDO);
                }
            }
        }
    };


    S.mix(DOM,
        /**
         * @lends DOM
         */
        {

            __EXPANDO:EXPANDO,

            /**
             * Determine whether an element has any data or specified data name associated with it.
             * @param {HTMLElement[]|String|HTMLElement} selector Matched elements
             * @param {String} [name] A string naming the piece of data to set.
             * @returns {boolean}
             */
            hasData:function (selector, name) {
                var ret = false,
                    elems = DOM.query(selector);
                for (var i = 0; i < elems.length; i++) {
                    var elem = elems[i];
                    if (elem.nodeType) {
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
             * If name set and data unset Store arbitrary data associated with the specified element. Returns undefined.
             * or
             * If name set and data unset returns value at named data store for the element
             * or
             * If name unset and data unset returns the full data store for the element.
             * @param {HTMLElement[]|String|HTMLElement} selector Matched elements
             * @param {String} [name] A string naming the piece of data to set.
             * @param {String} [data] The new data value.
             * @returns {Object|undefined}
             */
            data:function (selector, name, data) {

                var elems = DOM.query(selector), elem = elems[0];

                // supports hash
                if (S.isPlainObject(name)) {
                    for (var k in name) {
                        DOM.data(elems, k, name[k]);
                    }
                    return undefined;
                }

                // getter
                if (data === undefined) {
                    if (elem) {
                        if (elem.nodeType) {
                            return domOps.data(elem, name, data);
                        } else {
                            return objectOps.data(elem, name, data);
                        }
                    }
                }
                // setter
                else {
                    for (var i = elems.length - 1; i >= 0; i--) {
                        elem = elems[i];
                        if (elem.nodeType) {
                            domOps.data(elem, name, data);
                        } else {
                            objectOps.data(elem, name, data);
                        }
                    }
                }
                return undefined;
            },

            /**
             * Remove a previously-stored piece of data from matched elements.
             * or
             * Remove all data from matched elements if name unset.
             * @param {HTMLElement[]|String|HTMLElement} selector Matched elements
             * @param {String} [name] A string naming the piece of data to delete.
             */
            removeData:function (selector, name) {
                var els = DOM.query(selector), elem, i;
                for (i = els.length - 1; i >= 0; i--) {
                    elem = els[i];
                    if (elem.nodeType) {
                        domOps.removeData(elem, name);
                    } else {
                        objectOps.removeData(elem, name);
                    }
                }
            }
        });

    return DOM;

}, {
    requires:["./base"]
});
/**
 * 承玉：2011-05-31
 *  - 分层 ，节点和普通对象分开处理
 **//**
 * @fileOverview dom
 */
KISSY.add("dom", function (S, DOM) {

    /**
     * @namespace Provides DOM helper methods
     * @name DOM
     */
    S.mix(S,{
        DOM:DOM,
        get:DOM.get,
        query:DOM.query
    });

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
});/**
 * @fileOverview   dom-insertion
 * @author  yiminghe@gmail.com,lifesinger@gmail.com
 */
KISSY.add('dom/insertion', function (S, UA, DOM) {

    var PARENT_NODE = 'parentNode',
        rformEls = /^(?:button|input|object|select|textarea)$/i,
        nodeName = DOM._nodeName,
        makeArray = S.makeArray,
        splice = [].splice,
        _isElementNode = DOM._isElementNode,
        NEXT_SIBLING = 'nextSibling';

    /**
     ie 6,7 lose checked status when append to dom
     var c=S.all("<input />");
     c.attr("type","radio");
     c.attr("checked",true);
     S.all("#t").append(c);
     alert(c[0].checked);
     */
    function fixChecked(ret) {
        for (var i = 0; i < ret.length; i++) {
            var el = ret[i];
            if (el.nodeType == DOM.DOCUMENT_FRAGMENT_NODE) {
                fixChecked(el.childNodes);
            } else if (nodeName(el, "input")) {
                fixCheckedInternal(el);
            } else if (_isElementNode(el)) {
                var cs = el.getElementsByTagName("input");
                for (var j = 0; j < cs.length; j++) {
                    fixChecked(cs[j]);
                }
            }
        }
    }

    function fixCheckedInternal(el) {
        if (el.type === "checkbox" || el.type === "radio") {
            // after insert , in ie6/7 checked is decided by defaultChecked !
            el.defaultChecked = el.checked;
        }
    }

    var rscriptType = /\/(java|ecma)script/i;

    function isJs(el) {
        return !el.type || rscriptType.test(el.type);
    }

    // extract script nodes and execute alone later
    function filterScripts(nodes, scripts) {
        var ret = [], i, el, nodeName;
        for (i = 0; nodes[i]; i++) {
            el = nodes[i];
            nodeName = el.nodeName.toLowerCase();
            if (el.nodeType == DOM.DOCUMENT_FRAGMENT_NODE) {
                ret.push.apply(ret, filterScripts(makeArray(el.childNodes), scripts));
            } else if (nodeName === "script" && isJs(el)) {
                // remove script to make sure ie9 does not invoke when append
                if (el.parentNode) {
                    el.parentNode.removeChild(el)
                }
                if (scripts) {
                    scripts.push(el);
                }
            } else {
                if (_isElementNode(el) &&
                    // ie checkbox getElementsByTagName 后造成 checked 丢失
                    !rformEls.test(nodeName)) {
                    var tmp = [],
                        s,
                        j,
                        ss = el.getElementsByTagName("script");
                    for (j = 0; j < ss.length; j++) {
                        s = ss[j];
                        if (isJs(s)) {
                            tmp.push(s);
                        }
                    }
                    splice.apply(nodes, [i + 1, 0].concat(tmp));
                }
                ret.push(el);
            }
        }
        return ret;
    }

    // execute script
    function evalScript(el) {
        if (el.src) {
            S.getScript(el.src);
        } else {
            var code = S.trim(el.text || el.textContent || el.innerHTML || "");
            if (code) {
                S.globalEval(code);
            }
        }
    }

    // fragment is easier than nodelist
    function insertion(newNodes, refNodes, fn, scripts) {
        newNodes = DOM.query(newNodes);

        if (scripts) {
            scripts = [];
        }

        // filter script nodes ,process script separately if needed
        newNodes = filterScripts(newNodes, scripts);

        // Resets defaultChecked for any radios and checkboxes
        // about to be appended to the DOM in IE 6/7
        if (UA['ie'] < 8) {
            fixChecked(newNodes);
        }
        refNodes = DOM.query(refNodes);
        var newNodesLength = newNodes.length,
            refNodesLength = refNodes.length;
        if ((!newNodesLength &&
            (!scripts || !scripts.length)) ||
            !refNodesLength) {
            return;
        }
        // fragment 插入速度快点
        // 而且能够一个操作达到批量插入
        // refer: http://www.w3.org/TR/REC-DOM-Level-1/level-one-core.html#ID-B63ED1A3
        var newNode = DOM._nl2frag(newNodes),
            clonedNode;
        //fragment 一旦插入里面就空了，先复制下
        if (refNodesLength > 1) {
            clonedNode = DOM.clone(newNode, true);
            refNodes = S.makeArray(refNodes)
        }
        for (var i = 0; i < refNodesLength; i++) {
            var refNode = refNodes[i];
            if (newNodesLength) {
                //refNodes 超过一个，clone
                var node = i > 0 ? DOM.clone(clonedNode, true) : newNode;
                fn(node, refNode);
            }
            if (scripts && scripts.length) {
                S.each(scripts, evalScript);
            }
        }
    }

    // loadScripts default to false to prevent xss
    S.mix(DOM,
        /**
         * @lends DOM
         */
        {

            /**
             * Insert every element in the set of newNodes before every element in the set of refNodes.
             * @param {HTMLElement|HTMLElement[]} newNodes Nodes to be inserted
             * @param {HTMLElement|HTMLElement[]|String} refNodes Nodes to be referred
             */
            insertBefore:function (newNodes, refNodes, loadScripts) {
                insertion(newNodes, refNodes, function (newNode, refNode) {
                    if (refNode[PARENT_NODE]) {
                        refNode[PARENT_NODE].insertBefore(newNode, refNode);
                    }
                }, loadScripts);
            },

            /**
             * Insert every element in the set of newNodes after every element in the set of refNodes.
             * @param {HTMLElement|HTMLElement[]} newNodes Nodes to be inserted
             * @param {HTMLElement|HTMLElement[]|String} refNodes Nodes to be referred
             */
            insertAfter:function (newNodes, refNodes, loadScripts) {
                insertion(newNodes, refNodes, function (newNode, refNode) {
                    if (refNode[PARENT_NODE]) {
                        refNode[PARENT_NODE].insertBefore(newNode, refNode[NEXT_SIBLING]);
                    }
                }, loadScripts);
            },

            /**
             * Insert every element in the set of newNodes to the end of every element in the set of parents.
             * @param {HTMLElement|HTMLElement[]} newNodes Nodes to be inserted
             * @param {HTMLElement|HTMLElement[]|String} parents Nodes to be referred as parentNode
             */
            appendTo:function (newNodes, parents, loadScripts) {
                insertion(newNodes, parents, function (newNode, parent) {
                    parent.appendChild(newNode);
                }, loadScripts);
            },

            /**
             * Insert every element in the set of newNodes to the beginning of every element in the set of parents.
             * @param {HTMLElement|HTMLElement[]} newNodes Nodes to be inserted
             * @param {HTMLElement|HTMLElement[]|String} parents Nodes to be referred as parentNode
             */
            prependTo:function (newNodes, parents, loadScripts) {
                insertion(newNodes, parents, function (newNode, parent) {
                    parent.insertBefore(newNode, parent.firstChild);
                }, loadScripts);
            },

            /**
             * Wrap a node around all elements in the set of matched elements
             * @param {HTMLElement|HTMLElement[]|String} wrappedNodes set of matched elements
             * @param {HTMLElement|String} wrapperNode html node or selector to get the node wrapper
             */
            wrapAll:function (wrappedNodes, wrapperNode) {
                // deep clone
                wrapperNode = DOM.clone(DOM.get(wrapperNode), true);
                wrappedNodes = DOM.query(wrappedNodes);
                if (wrappedNodes[0].parentNode) {
                    DOM.insertBefore(wrapperNode, wrappedNodes[0]);
                }
                var c;
                while ((c = wrapperNode.firstChild) && c.nodeType == 1) {
                    wrapperNode = c;
                }
                DOM.appendTo(wrappedNodes, wrapperNode);
            },

            /**
             * Wrap a node around each element in the set of matched elements
             * @param {HTMLElement|HTMLElement[]|String} wrappedNodes set of matched elements
             * @param {HTMLElement|String} wrapperNode html node or selector to get the node wrapper
             */
            wrap:function (wrappedNodes, wrapperNode) {
                wrappedNodes = DOM.query(wrappedNodes);
                wrapperNode = DOM.get(wrapperNode);
                S.each(wrappedNodes, function (w) {
                    DOM.wrapAll(w, wrapperNode);
                });
            },

            /**
             * Wrap a node around the childNodes of each element in the set of matched elements.
             * @param {HTMLElement|HTMLElement[]|String} wrappedNodes set of matched elements
             * @param {HTMLElement|String} wrapperNode html node or selector to get the node wrapper
             */
            wrapInner:function (wrappedNodes, wrapperNode) {
                wrappedNodes = DOM.query(wrappedNodes);
                wrapperNode = DOM.get(wrapperNode);
                S.each(wrappedNodes, function (w) {
                    var contents = w.childNodes;
                    if (contents.length) {
                        DOM.wrapAll(contents, wrapperNode);
                    } else {
                        w.appendChild(wrapperNode);
                    }
                });
            },

            /**
             * Remove the parents of the set of matched elements from the DOM,
             * leaving the matched elements in their place.
             * @param {HTMLElement|HTMLElement[]|String} wrappedNodes set of matched elements
             */
            unwrap:function (wrappedNodes) {
                wrappedNodes = DOM.query(wrappedNodes);
                S.each(wrappedNodes, function (w) {
                    var p = w.parentNode;
                    DOM.replaceWith(p, p.childNodes);
                });
            },

            /**
             * Replace each element in the set of matched elements with the provided newNodes.
             * @param {HTMLElement|HTMLElement[]|String} selector set of matched elements
             * @param {HTMLElement|HTMLElement[]|String} newNodes new nodes to replace the matched elements
             */
            replaceWith:function (selector, newNodes) {
                var nodes = DOM.query(selector);
                newNodes = DOM.query(newNodes);
                DOM.remove(newNodes, true);
                DOM.insertBefore(newNodes, nodes);
                DOM.remove(nodes);
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
    requires:["ua", "./create"]
});

/**
 * 2012-04-05 yiminghe@gmail.com
 *  - 增加 replaceWith/wrap/wrapAll/wrapInner/unwrap
 *
 * 2011-05-25
 *  - 承玉：参考 jquery 处理多对多的情形 :http://api.jquery.com/append/
 *      DOM.append(".multi1",".multi2");
 *
 */
/**
 * @fileOverview   dom-offset
 * @author  lifesinger@gmail.com,yiminghe@gmail.com
 */
KISSY.add('dom/offset', function (S, DOM, UA, undefined) {

    var win = S.Env.host,
        doc = win.document,
        isIE = UA['ie'],
        docElem = doc.documentElement,
        isElementNode = DOM._isElementNode,
        nodeTypeIs = DOM._nodeTypeIs,
        getWin = DOM._getWin,
        CSS1Compat = "CSS1Compat",
        compatMode = "compatMode",
        isStrict = doc[compatMode] === CSS1Compat,
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

    S.mix(DOM,
        /**
         * @lends DOM
         */
        {

            /**
             * Get the current coordinates of the first element in the set of matched elements, relative to the document.
             * or
             * Set the current coordinates of every element in the set of matched elements, relative to the document.
             * @param {HTMLElement[]|String|HTMLElement} selector Matched elements
             * @param {Object} [coordinates ] An object containing the properties top and left,
             * which are integers indicating the new top and left coordinates for the elements.
             * @param {Number} [coordinates.left ] the new top and left coordinates for the elements.
             * @param {Number} [coordinates.top ] the new top and top coordinates for the elements.
             * @param {window} [relativeWin] The window to measure relative to. If relativeWin
             *     is not in the ancestor frame chain of the element, we measure relative to
             *     the top-most window.
             * @returns {Object|undefined} if Get, the format of returned value is same with coordinates.
             */
            offset:function (selector, coordinates, relativeWin) {
                // getter
                if (coordinates === undefined) {
                    var elem = DOM.get(selector), ret;
                    if (elem) {
                        ret = getOffset(elem, relativeWin);
                    }
                    return ret;
                }
                // setter
                var els = DOM.query(selector), i;
                for (i = els.length - 1; i >= 0; i--) {
                    elem = els[i];
                    setOffset(elem, coordinates);
                }
                return undefined;
            },

            /**
             * Makes the first of matched elements visible in the container
             * @param {HTMLElement[]|String|HTMLElement} selector Matched elements
             * @param {String|HTMLElement} [container=window] Container element
             * @param {Boolean} [top=true] Whether align with top of container.
             * @param {Boolean} [hscroll=true] Whether trigger horizontal scroll.
             * @param {Boolean} [auto=false] Whether adjust element automatically
             * (only scrollIntoView when element is out of view)
             * @see http://www.w3.org/TR/2009/WD-html5-20090423/editing.html#scrollIntoView
             *        http://www.sencha.com/deploy/dev/docs/source/Element.scroll-more.html#scrollIntoView
             *        http://yiminghe.javaeye.com/blog/390732
             */
            scrollIntoView:function (selector, container, top, hscroll, auto) {
                var elem;

                if (!(elem = DOM.get(selector))) {
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
                        left:elemOffset[LEFT] - winScroll[LEFT],
                        top:elemOffset[TOP] - winScroll[TOP]
                    };
                    diffBottom = {
                        left:elemOffset[LEFT] + ew - (winScroll[LEFT] + ww),
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
                        left:elemOffset[LEFT] - containerOffset[LEFT] -
                            (PARSEINT(DOM.css(container, 'borderLeftWidth')) || 0),
                        top:elemOffset[TOP] - containerOffset[TOP] -
                            (PARSEINT(DOM.css(container, 'borderTopWidth')) || 0)
                    };
                    diffBottom = {
                        left:elemOffset[LEFT] + ew -
                            (containerOffset[LEFT] + cw +
                                (PARSEINT(DOM.css(container, 'borderRightWidth')) || 0)),
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
             * Get the width of document
             * @param {window} [win=window] Window to be referred.
             * @function
             */
            docWidth:0,
            /**
             * Get the height of document
             * @param {window} [win=window] Window to be referred.
             * @function
             */
            docHeight:0,
            /**
             * Get the height of window
             * @param {window} [win=window] Window to be referred.
             * @function
             */
            viewportHeight:0,
            /**
             * Get the width of document
             * @param {window} [win=window] Window to be referred.
             * @function
             */
            viewportWidth:0,
            /**
             * Get the current vertical position of the scroll bar for the first element in the set of matched elements.
             * or
             * Set the current vertical position of the scroll bar for each of the set of matched elements.
             * @param {HTMLElement[]|String|HTMLElement|window} selector matched elements
             * @param {Number} value An integer indicating the new position to set the scroll bar to.
             * @function
             */
            scrollTop:0,
            /**
             * Get the current horizontal position of the scroll bar for the first element in the set of matched elements.
             * or
             * Set the current horizontal position of the scroll bar for each of the set of matched elements.
             * @param {HTMLElement[]|String|HTMLElement|window} selector matched elements
             * @param {Number} value An integer indicating the new position to set the scroll bar to.
             * @function
             */
            scrollLeft:0
        });

    // http://old.jr.pl/www.quirksmode.org/viewport/compatibility.html
    // http://www.quirksmode.org/dom/w3c_cssom.html
    // add ScrollLeft/ScrollTop getter/setter methods
    S.each(['Left', 'Top'], function (name, i) {
        var method = SCROLL + name;

        DOM[method] = function (elem, v) {
            if (isNumber(elem)) {
                return arguments.callee(win, elem);
            }
            elem = DOM.get(elem);
            var ret,
                w = getWin(elem),
                d;
            if (w) {
                if (v !== undefined) {
                    v = parseFloat(v);
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
                    elem[method] = parseFloat(v)
                } else {
                    ret = elem[method];
                }
            }
            return ret;
        }
    });

    // add docWidth/Height, viewportWidth/Height getter methods
    S.each(['Width', 'Height'], function (name) {
        DOM['doc' + name] = function (refWin) {
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

        DOM[VIEWPORT + name] = function (refWin) {
            refWin = DOM.get(refWin);
            var prop = CLIENT + name,
                win = getWin(refWin),
                doc = win[DOCUMENT],
                body = doc[BODY],
                documentElement = doc[DOC_ELEMENT],
                documentElementProp = documentElement[prop];
            // 标准模式取 documentElement
            // backcompat 取 body
            return doc[compatMode] === CSS1Compat
                && documentElementProp ||
                body && body[ prop ] || documentElementProp;
//            return (prop in w) ?
//                // 标准 = documentElement.clientHeight
//                w[prop] :
//                // ie 标准 documentElement.clientHeight , 在 documentElement.clientHeight 上滚动？
//                // ie quirks body.clientHeight: 在 body 上？
//                (isStrict ? d[DOC_ELEMENT][CLIENT + name] : d[BODY][CLIENT + name]);
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

        return { left:x, top:y };
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
        var position = {left:0, top:0};

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
    requires:["./base", "ua"]
});

/**
 * 2012-03-30
 *  - refer: http://www.softcomplex.com/docs/get_window_size_and_scrollbar_position.html
 *  - http://help.dottoro.com/ljkfqbqj.php
 *  - http://www.boutell.com/newfaq/creating/sizeofclientarea.html
 *
 * 2011-05-24
 *  - 承玉：
 *  - 调整 docWidth , docHeight ,
 *      viewportHeight , viewportWidth ,scrollLeft,scrollTop 参数，
 *      便于放置到 Node 中去，可以完全摆脱 DOM，完全使用 Node
 *
 *
 * TODO:
 *  - 考虑是否实现 jQuery 的 position, offsetParent 等功能
 *  - 更详细的测试用例（比如：测试 position 为 fixed 的情况）
 */
/**
 * @fileOverview   selector
 * @author  lifesinger@gmail.com , yiminghe@gmail.com
 */
KISSY.add('dom/selector', function (S, DOM, undefined) {

    var doc = S.Env.host.document,
        filter = S.filter,
        require = function (selector) {
            return S.require(selector);
        },
        isArray = S.isArray,
        isString = S.isString,
        makeArray = S.makeArray,
        isNodeList = DOM._isNodeList,
        nodeName = DOM._nodeName,
        push = Array.prototype.push,
        SPACE = ' ',
        COMMA = ',',
        trim = S.trim,
        ANY = '*',
        REG_ID = /^#[\w-]+$/,
        REG_QUERY = /^(?:#([\w-]+))?\s*([\w-]+|\*)?\.?([\w-]+)?$/;

    function query_each(f) {
        var self = this, el, i;
        for (i = 0; i < self.length; i++) {
            el = self[i];
            if (f(el, i) === false) {
                break;
            }
        }
    }

    /**
     * Accepts a string containing a CSS selector which is then used to match a set of elements.
     * @param {String|HTMLElement[]} selector
     * A string containing a selector expression.
     * or
     * array of HTMLElements.
     * @param {String|HTMLElement[]|Document} [context] context under which to find elements matching selector.
     * @return {HTMLElement[]} The array of found HTMLElements
     */
    function query(selector, context) {
        var ret,
            i,
            simpleContext,
            isSelectorString = isString(selector),
            // optimize common usage
            contexts = (context === undefined && (simpleContext = 1)) ?
                [doc] :
                tuneContext(context);
        // 常见的空
        if (!selector) {
            ret = [];
        }
        // 常见的选择器
        // DOM.query("#x")
        else if (isSelectorString) {
            selector = trim(selector);
            if (contexts.length == 1 && selector) {
                ret = quickFindBySelectorStr(selector, contexts[0]);
            }
        }
        // 不写 context，就是包装一下
        else if (simpleContext) {
            // 1.常见的单个元素
            // DOM.query(document.getElementById("xx"))
            if (selector.nodeType || selector.setTimeout) {
                ret = [selector];
            }
            // 2.KISSY NodeList 特殊点直接返回，提高性能
            else if (selector.getDOMNodes) {
                return selector;
            }
            // 3.常见的数组
            // var x=DOM.query(".l");
            // DOM.css(x,"color","red");
            else if (isArray(selector)) {
                ret = selector;
            }
            // 4.selector.item
            // DOM.query(document.getElementsByTagName("a"))
            // note:
            // document.createElement("select").item 已经在 1 处理了
            // S.all().item 已经在 2 处理了
            else if (isNodeList(selector)) {
                ret = S.makeArray(selector);
            } else {
                ret = [ selector ];
            }
        }

        if (!ret) {
            ret = [];
            if (selector) {
                for (i = 0; i < contexts.length; i++) {
                    push.apply(ret, queryByContexts(selector, contexts[i]));
                }
                //必要时去重排序
                if (ret.length > 1 &&
                    // multiple contexts
                    (contexts.length > 1 ||
                        (isSelectorString &&
                            // multiple selector
                            selector.indexOf(COMMA) > -1))) {
                    unique(ret);
                }
            }
        }

        // attach each method
        ret.each = query_each;

        return ret;
    }

    function queryByContexts(selector, context) {
        var ret = [],
            isSelectorString = isString(selector);
        if (isSelectorString && selector.match(REG_QUERY) ||
            !isSelectorString) {
            // 简单选择器自己处理
            ret = queryBySimple(selector, context);
        }
        // 如果选择器有 , 分开递归一部分一部分来
        else if (isSelectorString && selector.indexOf(COMMA) > -1) {
            ret = queryBySelectors(selector, context);
        }
        else {
            // 复杂了，交给 sizzle
            ret = queryBySizzle(selector, context);
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
            i,
            selectors = selector.split(/\s*,\s*/);
        for (i = 0; i < selectors.length; i++) {
            push.apply(ret, queryByContexts(selectors[i], context));
        }
        // 多部分选择器可能得到重复结果
        return ret;
    }

    function quickFindBySelectorStr(selector, context) {
        var ret, t, match, id, tag, cls;
        // selector 为 #id 是最常见的情况，特殊优化处理
        if (REG_ID.test(selector)) {
            t = getElementById(selector.slice(1), context);
            if (t) {
                // #id 无效时，返回空数组
                ret = [t];
            } else {
                ret = [];
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
                ret = ret || [];
            }
        }
        return ret;
    }

    // 最简单情况了，单个选择器部分，单个上下文
    function queryBySimple(selector, context) {
        var ret,
            isSelectorString = isString(selector);
        if (isSelectorString) {
            ret = quickFindBySelectorStr(selector, context) || [];
        }
        // 传入的 selector 是 NodeList 或已是 Array
        else if (isArray(selector) || isNodeList(selector)) {
            // 只能包含在 context 里面
            // filter 会转换为 nodelist 为数组
            ret = filter(selector, function (s) {
                return testByContext(s, context);
            });
        }
        // 传入的 selector 是 HTMLNode 查看约束
        // 否则 window/document，原样返回
        else if (testByContext(selector, context)) {
            ret = [selector];
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
        return DOM.contains(context, element);
    }

    var unique = S.noop;
    (function () {
        var sortOrder,
            hasDuplicate,
            baseHasDuplicate = true;

        // Here we check if the JavaScript engine is using some sort of
        // optimization where it does not always call our comparision
        // function. If that is the case, discard the hasDuplicate value.
        // Thus far that includes Google Chrome.
        [0, 0].sort(function () {
            baseHasDuplicate = false;
            return 0;
        });

        // 排序去重
        unique = function (elements) {
            if (sortOrder) {
                hasDuplicate = baseHasDuplicate;
                elements.sort(sortOrder);

                if (hasDuplicate) {
                    var i = 1, len = elements.length;
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
            sortOrder = function (a, b) {
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
            sortOrder = function (a, b) {
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
        return query(context, undefined);
    }

    // query #id
    function getElementById(id, context) {
        var doc = context,
            el;
        if (context.nodeType !== DOM.DOCUMENT_NODE) {
            doc = context.ownerDocument;
        }
        el = doc.getElementById(id);
        if (el && el.id === id) {
            // optimize for common usage
        }
        else if (el && el.parentNode) {
            // ie opera confuse name with id
            // https://github.com/kissyteam/kissy/issues/67
            // 不能直接 el.id ，否则 input shadow form attribute
            if (!idEq(el, id)) {
                // 直接在 context 下的所有节点找
                el = DOM.filter(ANY, "#" + id, context)[0] || null;
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

    (function () {
        // Check to see if the browser returns only elements
        // when doing getElementsByTagName('*')

        // Create a fake element
        var div = doc.createElement('div');
        div.appendChild(doc.createComment(''));

        // Make sure no comments are found
        if (div.getElementsByTagName(ANY).length > 0) {
            getElementsByTagName = function (tag, context) {
                var ret = makeArray(context.getElementsByTagName(tag));
                if (tag === ANY) {
                    var t = [], i = 0, node;
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
    var getElementsByClassName = doc.getElementsByClassName ? function (cls, tag, context) {
        // query("#id1 xx","#id2")
        // #id2 内没有 #id1 , context 为 null , 这里防御下
        if (!context) {
            return [];
        }
        var els = context.getElementsByClassName(cls),
            ret,
            i = 0,
            len = els.length,
            el;

        if (tag && tag !== ANY) {
            ret = [];
            for (; i < len; ++i) {
                el = els[i];
                if (nodeName(el, tag)) {
                    ret.push(el);
                }
            }
        } else {
            ret = makeArray(els);
        }
        return ret;
    } : ( doc.querySelectorAll ? function (cls, tag, context) {
        // ie8 return staticNodeList 对象,[].concat 会形成 [ staticNodeList ] ，手动转化为普通数组
        return context && makeArray(context.querySelectorAll((tag ? tag : '') + '.' + cls)) || [];
    } : function (cls, tag, context) {
        if (!context) {
            return [];
        }
        var els = context.getElementsByTagName(tag || ANY),
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
        var className;
        return (className = el.className) && (" " + className + " ").indexOf(" " + cls + " ") !== -1;
    }

    // throw exception
    function error(msg) {
        S.error('Unsupported selector: ' + msg);
    }

    S.mix(DOM,
        /**
         * @lends DOM
         */
        {

            /**
             * Accepts a string containing a CSS selector which is then used to match a set of elements.
             * @param {String|HTMLElement[]} selector
             * A string containing a selector expression.
             * or
             * array of HTMLElements.
             * @param {String|HTMLElement[]|Document|HTMLElement} [context] context under which to find elements matching selector.
             * @return {HTMLElement[]} The array of found HTMLElements
             */
            query:query,

            /**
             * Accepts a string containing a CSS selector which is then used to match a set of elements.
             * @param {String|HTMLElement[]} selector
             * A string containing a selector expression.
             * or
             * array of HTMLElements.
             * @param {String|HTMLElement[]|Document|HTMLElement} [context] context under which to find elements matching selector.
             * @return {HTMLElement} The first of found HTMLElements
             */
            get:function (selector, context) {
                return query(selector, context)[0] || null;
            },

            /**
             * Sorts an array of DOM elements, in place, with the duplicates removed.
             * Note that this only works on arrays of DOM elements, not strings or numbers.
             * @param {HTMLElement[]} The Array of DOM elements.
             * @function
             * @return {HTMLElement[]}
             */
            unique:unique,

            /**
             * Reduce the set of matched elements to those that match the selector or pass the function's test.
             * @param {String|HTMLElement[]|NodeList} selector Matched elements
             * @param {String|Function} filter Selector string or filter function
             * @param {String|HTMLElement[]|Document} [context] Context under which to find matched elements
             * @return {HTMLElement[]}
             */
            filter:function (selector, filter, context) {
                var elems = query(selector, context),
                    sizzle = require("sizzle"),
                    match,
                    tag,
                    id,
                    cls,
                    ret = [];

                // 默认仅支持最简单的 tag.cls 或 #id 形式
                if (isString(filter) &&
                    (filter = trim(filter)) &&
                    (match = REG_QUERY.exec(filter))) {
                    id = match[1];
                    tag = match[2];
                    cls = match[3];
                    if (!id) {
                        filter = function (elem) {
                            var tagRe = true, clsRe = true;

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
                        filter = function (elem) {
                            return idEq(elem, id);
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
             * Returns true if the matched element(s) pass the filter test
             * @param {String|HTMLElement[]} selector Matched elements
             * @param {String|Function} filter Selector string or filter function
             * @param {String|HTMLElement[]|Document} [context] Context under which to find matched elements
             * @returns {Boolean}
             */
            test:function (selector, filter, context) {
                var elements = query(selector, context);
                return elements.length && (DOM.filter(elements, filter, context).length === elements.length);
            }
        });


    function idEq(elem, id) {
        // form !
        var idNode = elem.getAttributeNode("id");
        return idNode && idNode.nodeValue === id;
    }

    return DOM;
}, {
    requires:["./base"]
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
 * @fileOverview style for ie
 * @author  lifesinger@gmail.com,yiminghe@gmail.com
 */
KISSY.add('dom/style-ie', function (S, DOM, UA, Style) {

    var HUNDRED = 100;

    // only for ie
    if (!UA['ie']) {
        return DOM;
    }

    var doc = S.Env.host.document,
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
        backgroundPosition = "backgroundPosition",
        ropacity = /opacity=([^)]*)/,
        ralpha = /alpha\([^)]*\)/i;

    // odd backgroundPosition
    CUSTOM_STYLES[backgroundPosition] = {
        get:function (elem, computed) {
            if (computed) {
                return elem[CURRENT_STYLE][backgroundPosition + "X"] +
                    " " +
                    elem[CURRENT_STYLE][backgroundPosition + "Y"];
            } else {
                return elem[STYLE][backgroundPosition];
            }
        }
    };

    // use alpha filter for IE opacity
    try {
        if (docElem.style[OPACITY] == null) {

            CUSTOM_STYLES[OPACITY] = {

                get:function (elem, computed) {
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

                set:function (elem, val) {
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
    catch (ex) {
        S.log('IE filters ActiveX is disabled. ex = ' + ex);
    }

    /*
     border fix
     ie 不设置数值，则 computed style 不返回数值，只返回 thick? medium ...
     (default is "medium")
     */
    var IE8 = UA['ie'] == 8,
        BORDER_MAP = {
        },
        BORDERS = ["", "Top", "Left", "Right", "Bottom"];
    BORDER_MAP['thin'] = IE8 ? '1px' : '2px';
    BORDER_MAP['medium'] = IE8 ? '3px' : '4px';
    BORDER_MAP['thick'] = IE8 ? '5px' : '6px';

    S.each(BORDERS, function (b) {
        var name = "border" + b + "Width",
            styleName = "border" + b + "Style";

        /**
         * @ignore
         */
        CUSTOM_STYLES[name] = {
            get:function (elem, computed) {
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

        DOM._getComputedStyle = function (elem, name) {
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
}, {
    requires:["./base", "ua", "./style"]
});
/**
 * NOTES:
 *
 * yiminghe@gmail.com: 2011.12.21 backgroundPosition in ie
 *  - currentStyle['backgroundPosition'] undefined
 *  - currentStyle['backgroundPositionX'] ok
 *  - currentStyle['backgroundPositionY'] ok
 *
 *
 * yiminghe@gmail.com： 2011.05.19 opacity in ie
 *  - 如果节点是动态创建，设置opacity，没有加到 dom 前，取不到 opacity 值
 *  - 兼容：border-width 值，ie 下有可能返回 medium/thin/thick 等值，其它浏览器返回 px 值。
 *
 *  - opacity 的实现，参考自 jquery
 *
 */
/**
 * @fileOverview   dom/style
 * @author  yiminghe@gmail.com,lifesinger@gmail.com
 */
KISSY.add('dom/style', function (S, DOM, UA, undefined) {
    "use strict";
    var WINDOW = S.Env.host,
        doc = WINDOW.document,
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
            "fillOpacity":1,
            "fontWeight":1,
            "lineHeight":1,
            "opacity":1,
            "orphans":1,
            "widows":1,
            "zIndex":1,
            "zoom":1
        },
        rmsPrefix = /^-ms-/,
        RE_DASH = /-([a-z])/ig,
        CAMELCASE_FN = function (all, letter) {
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
        // fix #92, ms!
        return name.replace(rmsPrefix, "ms-").replace(RE_DASH, CAMELCASE_FN);
    }

    var defaultDisplayDetectIframe,
        defaultDisplayDetectIframeDoc;

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
                    var iframeSrc;
                    if (iframeSrc = DOM._genEmptyIframeSrc()) {
                        defaultDisplayDetectIframe.src = iframeSrc;
                    }
                } else {
                    DOM.prepend(defaultDisplayDetectIframe, body);
                }

                // Create a cacheable copy of the iframe document on first call.
                // IE and Opera will allow us to reuse the iframeDoc without re-writing the fake HTML
                // document to it; WebKit & Firefox won't allow reusing the iframe document.
                if (!defaultDisplayDetectIframeDoc || !defaultDisplayDetectIframe.createElement) {

                    try {
                        defaultDisplayDetectIframeDoc = defaultDisplayDetectIframe.contentWindow.document;
                        defaultDisplayDetectIframeDoc.write(( doc.compatMode === "CSS1Compat" ? "<!doctype html>" : "" )
                            + "<html><head>" +
                            (UA['ie'] && DOM._isCustomDomain() ?
                                "<script>document.domain = '" +
                                    doc.domain
                                    + "';</script>" : "")
                            +
                            "</head><body>");
                        defaultDisplayDetectIframeDoc.close();
                    } catch (e) {
                        // ie6 need a breath , such as alert(8) or setTimeout;
                        // 同时需要同步，所以无解，勉强返回
                        return "block";
                    }
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

    S.mix(DOM,
        /**
         * @lends DOM
         */
        {
            _camelCase:camelCase,
            // _cssNumber:cssNumber,
            _CUSTOM_STYLES:CUSTOM_STYLES,
            _cssProps:cssProps,
            _getComputedStyle:function (elem, name) {
                var val = "",
                    computedStyle,
                    d = elem.ownerDocument;

                name = name.replace(rupper, "-$1").toLowerCase();

                // https://github.com/kissyteam/kissy/issues/61
                if (computedStyle = d.defaultView.getComputedStyle(elem, null)) {
                    val = computedStyle.getPropertyValue(name) || computedStyle[name];
                }

                // 还没有加入到 document，就取行内
                if (val == "" && !DOM.contains(d.documentElement, elem)) {
                    name = cssProps[name] || name;
                    val = elem[STYLE][name];
                }

                return val;
            },

            /**
             *  Get inline style property from the first element of matched elements
             *  or
             *  Set one or more CSS properties for the set of matched elements.
             *  @param {HTMLElement[]|String|HTMLElement} selector Matched elements
             *  @param {String|Object} name A CSS property. or A map of property-value pairs to set.
             *  @param [val] A value to set for the property.
             *  @returns {undefined|String}
             */
            style:function (selector, name, val) {
                var els = DOM.query(selector), elem = els[0], i;
                // supports hash
                if (S.isPlainObject(name)) {
                    for (var k in name) {
                        for (i = els.length - 1; i >= 0; i--) {
                            style(els[i], k, name[k]);
                        }
                    }
                    return undefined;
                }
                if (val === undefined) {
                    var ret = '';
                    if (elem) {
                        ret = style(elem, name, val);
                    }
                    return ret;
                } else {
                    for (i = els.length - 1; i >= 0; i--) {
                        style(els[i], name, val);
                    }
                }
                return undefined;
            },

            /**
             * Get the computed value of a style property for the first element in the set of matched elements.
             * or
             * Set one or more CSS properties for the set of matched elements.
             * @param {HTMLElement[]|String|HTMLElement|Element} selector 选择器或节点或节点数组
             * @param {String|Object} name A CSS property. or A map of property-value pairs to set.
             * @param [val] A value to set for the property.
             * @returns {undefined|String}
             */
            css:function (selector, name, val) {
                var els = DOM.query(selector),
                    elem = els[0],
                    i;
                // supports hash
                if (S.isPlainObject(name)) {
                    for (var k in name) {
                        for (i = els.length - 1; i >= 0; i--) {
                            style(els[i], k, name[k]);
                        }
                    }
                    return undefined;
                }

                name = camelCase(name);
                var hook = CUSTOM_STYLES[name];
                // getter
                if (val === undefined) {
                    // supports css selector/Node/NodeList
                    var ret = '';
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
                    for (i = els.length - 1; i >= 0; i--) {
                        style(els[i], name, val);
                    }
                }
                return undefined;
            },

            /**
             * Display the matched elements.
             * @param {HTMLElement[]|String|HTMLElement} selector Matched elements.
             */
            show:function (selector) {
                var els = DOM.query(selector), elem, i;
                for (i = els.length - 1; i >= 0; i--) {
                    elem = els[i];
                    elem[STYLE][DISPLAY] = DOM.data(elem, OLD_DISPLAY) || EMPTY;

                    // 可能元素还处于隐藏状态，比如 css 里设置了 display: none
                    if (DOM.css(elem, DISPLAY) === NONE) {
                        var tagName = elem.tagName.toLowerCase(),
                            old = getDefaultDisplay(tagName);
                        DOM.data(elem, OLD_DISPLAY, old);
                        elem[STYLE][DISPLAY] = old;
                    }
                }
            },

            /**
             * Hide the matched elements.
             * @param {HTMLElement[]|String|HTMLElement} selector Matched elements.
             */
            hide:function (selector) {
                var els = DOM.query(selector), elem, i;
                for (i = els.length - 1; i >= 0; i--) {
                    elem = els[i];
                    var style = elem[STYLE], old = style[DISPLAY];
                    if (old !== NONE) {
                        if (old) {
                            DOM.data(elem, OLD_DISPLAY, old);
                        }
                        style[DISPLAY] = NONE;
                    }
                }
            },

            /**
             * Display or hide the matched elements.
             * @param {HTMLElement[]|String|HTMLElement} selector Matched elements.
             */
            toggle:function (selector) {
                var els = DOM.query(selector), elem, i;
                for (i = els.length - 1; i >= 0; i--) {
                    elem = els[i];
                    if (DOM.css(elem, DISPLAY) === NONE) {
                        DOM.show(elem);
                    } else {
                        DOM.hide(elem);
                    }
                }
            },

            /**
             * Creates a stylesheet from a text blob of rules.
             * These rules will be wrapped in a STYLE tag and appended to the HEAD of the document.
             * @param {window} [refWin=window] Window which will accept this stylesheet
             * @param {String} cssText The text containing the css rules
             * @param {String} [id] An id to add to the stylesheet for later removal
             */
            addStyleSheet:function (refWin, cssText, id) {
                refWin = refWin || WINDOW;
                if (S.isString(refWin)) {
                    id = cssText;
                    cssText = refWin;
                    refWin = WINDOW;
                }
                refWin = DOM.get(refWin);
                var win = DOM._getWin(refWin),
                    doc = win.document,
                    elem;

                if (id && (id = id.replace('#', EMPTY))) {
                    elem = DOM.get('#' + id, doc);
                }

                // 仅添加一次，不重复添加
                if (elem) {
                    return;
                }

                elem = DOM.create('<style>', { id:id }, doc);

                // 先添加到 DOM 树中，再给 cssText 赋值，否则 css hack 会失效
                DOM.get('head', doc).appendChild(elem);

                if (elem.styleSheet) { // IE
                    elem.styleSheet.cssText = cssText;
                } else { // W3C
                    elem.appendChild(doc.createTextNode(cssText));
                }
            },

            /**
             * Make matched elements unselectable
             * @param {HTMLElement[]|String|HTMLElement} selector  Matched elements.
             */
            unselectable:function (selector) {
                var _els = DOM.query(selector), elem, j;
                for (j = _els.length - 1; j >= 0; j--) {
                    elem = _els[j];
                    if (UA['gecko']) {
                        elem[STYLE]['MozUserSelect'] = 'none';
                    }
                    else if (UA['webkit']) {
                        elem[STYLE]['KhtmlUserSelect'] = 'none';
                    } else {
                        if (UA['ie'] || UA['opera']) {
                            var e, i = 0,
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
                }
            },

            /**
             * Get the current computed width for the first element in the set of matched elements, including padding but not border.
             * @function
             * @param {HTMLElement[]|String|HTMLElement} selector Matched elements
             * @returns {Number}
             */
            innerWidth:0,
            /**
             * Get the current computed height for the first element in the set of matched elements, including padding but not border.
             * @function
             * @param {HTMLElement[]|String|HTMLElement} selector Matched elements
             * @returns {Number}
             */
            innerHeight:0,
            /**
             *  Get the current computed width for the first element in the set of matched elements, including padding and border, and optionally margin.
             * @function
             * @param {HTMLElement[]|String|HTMLElement} selector Matched elements
             * @param {Boolean} [includeMargin] A Boolean indicating whether to include the element's margin in the calculation.
             * @returns {Number}
             */
            outerWidth:0,
            /**
             * Get the current computed height for the first element in the set of matched elements, including padding, border, and optionally margin.
             * @function
             * @param {HTMLElement[]|String|HTMLElement} selector Matched elements
             * @param {Boolean} [includeMargin] A Boolean indicating whether to include the element's margin in the calculation.
             * @returns {Number}
             */
            outerHeight:0,
            /**
             * Get the current computed width for the first element in the set of matched elements.
             * or
             * Set the CSS width of each element in the set of matched elements.
             * @function
             * @param {HTMLElement[]|String|HTMLElement} selector Matched elements
             * @param {String|Number} [value]
             * An integer representing the number of pixels, or an integer along with an optional unit of measure appended (as a string).
             * @returns {Number|undefined}
             */
            width:0,
            /**
             * Get the current computed height for the first element in the set of matched elements.
             * or
             * Set the CSS height of each element in the set of matched elements.
             * @function
             * @param {HTMLElement[]|String|HTMLElement} selector Matched elements
             * @param {String|Number} [value]
             * An integer representing the number of pixels, or an integer along with an optional unit of measure appended (as a string).
             * @returns {Number|undefined}
             */
            height:0
        });

    function capital(str) {
        return str.charAt(0).toUpperCase() + str.substring(1);
    }

    S.each([WIDTH, HEIGHT], function (name) {
        DOM["inner" + capital(name)] = function (selector) {
            var el = DOM.get(selector);
            return el && getWHIgnoreDisplay(el, name, "padding");
        };

        DOM["outer" + capital(name)] = function (selector, includeMargin) {
            var el = DOM.get(selector);
            return el && getWHIgnoreDisplay(el, name, includeMargin ? "margin" : "border");
        };

        DOM[name] = function (selector, val) {
            var ret = DOM.css(selector, name, val);
            if (ret) {
                ret = parseFloat(ret);
            }
            return ret;
        };
    });

    var cssShow = { position:"absolute", visibility:"hidden", display:"block" };

    /*
     css height,width 永远都是计算值
     */
    S.each(["height", "width"], function (name) {
        /**
         * @ignore
         */
        CUSTOM_STYLES[ name ] = {
            /**
             * @ignore
             */
            get:function (elem, computed) {
                if (computed) {
                    return getWHIgnoreDisplay(elem, name) + "px";
                }
            },
            set:function (elem, value) {
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

    S.each(["left", "top"], function (name) {
        /**
         * @ignore
         */
        CUSTOM_STYLES[ name ] = {
            get:function (elem, computed) {
                if (computed) {
                    var val = DOM._getComputedStyle(elem, name), offset;

                    // 1. 当没有设置 style.left 时，getComputedStyle 在不同浏览器下，返回值不同
                    //    比如：firefox 返回 0, webkit/ie 返回 auto
                    // 2. style.left 设置为百分比时，返回值为百分比
                    // 对于第一种情况，如果是 relative 元素，值为 0. 如果是 absolute 元素，值为 offsetLeft - marginLeft
                    // 对于第二种情况，大部分类库都未做处理，属于“明之而不 fix”的保留 bug
                    if (val === AUTO) {
                        val = 0;
                        if (S.inArray(DOM.css(elem, 'position'), ['absolute', 'fixed'])) {
                            offset = elem[name === 'left' ? 'offsetLeft' : 'offsetTop'];

                            // old-ie 下，elem.offsetLeft 包含 offsetParent 的 border 宽度，需要减掉
                            if (isIE && doc['documentMode'] != 9 || UA['opera']) {
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
        var ret, hook = CUSTOM_STYLES[name];
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
                    style[name] = val;
                } catch (e) {
                    S.log("css set error :" + e);
                }
                // #80 fix,font-family
                if (val === EMPTY && style.removeAttribute) {
                    style.removeAttribute(name);
                }
            }
            if (!style.cssText) {
                elem.removeAttribute('style');
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

    // fix #119 : https://github.com/kissyteam/kissy/issues/119
    function getWHIgnoreDisplay(elem) {
        var val, args = arguments;
        // incase elem is window
        // elem.offsetWidth === undefined
        if (elem.offsetWidth !== 0) {
            val = getWH.apply(undefined, args);
        } else {
            swap(elem, cssShow, function () {
                val = getWH.apply(undefined, args);
            });
        }
        return val;
    }


    /**
     * 得到元素的大小信息
     * @param elem
     * @param name
     * @param {String} [extra]  "padding" : (css width) + padding
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
                S.each(which, function (w) {
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

            return val;
        }

        // Fall back to computed then uncomputed css if necessary
        val = DOM._getComputedStyle(elem, name);
        if (val == null || (Number(val)) < 0) {
            val = elem.style[ name ] || 0;
        }
        // Normalize "", auto, and prepare for extra
        val = parseFloat(val) || 0;

        // Add padding, border, margin
        if (extra) {
            S.each(which, function (w) {
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
    requires:["dom/base", "ua"]
});

/**
 * 2011-12-21
 *  - backgroundPositionX, backgroundPositionY firefox/w3c 不支持
 *  - w3c 为准，这里不 fix 了
 *
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
 * @fileOverview   dom-traversal
 * @author  lifesinger@gmail.com,yiminghe@gmail.com
 */
KISSY.add('dom/traversal', function (S, DOM, undefined) {

    var isElementNode = DOM._isElementNode,
        doc = S.Env.host.document,
        CONTAIN_MASK = 16,
        __contains = doc.documentElement.contains ?
            function (a, b) {
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
            doc.documentElement.compareDocumentPosition ?
                function (a, b) {
                    return !!(a.compareDocumentPosition(b) & CONTAIN_MASK);
                } :
                // it can not be true , pathetic browser
                0
            );


    S.mix(DOM,
        /**
         * @lends DOM
         */
        {

            /**
             * Get the first element that matches the filter,
             * beginning at the first element of matched elements and progressing up through the DOM tree.
             * @param {HTMLElement[]|String|HTMLElement} selector Matched elements
             * @param {String|Function} filter Selector string or filter function
             * @param {HTMLElement|String|Document|HTMLElement[]} [context] Search bound element
             * @returns {HTMLElement}
             */
            closest:function (selector, filter, context) {
                return nth(selector, filter, 'parentNode', function (elem) {
                    return elem.nodeType != DOM.DOCUMENT_FRAGMENT_NODE;
                }, context, true);
            },

            /**
             * Get the parent of the first element in the current set of matched elements, optionally filtered by a selector.
             * @param {HTMLElement[]|String|HTMLElement} selector Matched elements
             * @param {String|Function} [filter] Selector string or filter function
             * @param {HTMLElement|String|Document|HTMLElement[]} [context] Search bound element
             * @returns {HTMLElement}
             */
            parent:function (selector, filter, context) {
                return nth(selector, filter, 'parentNode', function (elem) {
                    return elem.nodeType != DOM.DOCUMENT_FRAGMENT_NODE;
                }, context);
            },

            /**
             * Get the first child of the first element in the set of matched elements.
             * If a filter is provided, it retrieves the next child only if it matches that filter.
             * @param {HTMLElement[]|String|HTMLElement} selector Matched elements
             * @param {String|Function} [filter] Selector string or filter function
             * @returns {HTMLElement}
             */
            first:function (selector, filter) {
                var elem = DOM.get(selector);
                return nth(elem && elem.firstChild, filter, 'nextSibling',
                    undefined, undefined, true);
            },

            /**
             * Get the last child of the first element in the set of matched elements.
             * If a filter is provided, it retrieves the previous child only if it matches that filter.
             * @param {HTMLElement[]|String|HTMLElement} selector Matched elements
             * @param {String|Function} [filter] Selector string or filter function
             * @returns {HTMLElement}
             */
            last:function (selector, filter) {
                var elem = DOM.get(selector);
                return nth(elem && elem.lastChild, filter, 'previousSibling',
                    undefined, undefined, true);
            },

            /**
             * Get the immediately following sibling of the first element in the set of matched elements.
             * If a filter is provided, it retrieves the next child only if it matches that filter.
             * @param {HTMLElement[]|String|HTMLElement} selector Matched elements
             * @param {String|Function} [filter] Selector string or filter function
             * @returns {HTMLElement}
             */
            next:function (selector, filter) {
                return nth(selector, filter, 'nextSibling', undefined);
            },

            /**
             * Get the immediately preceding  sibling of the first element in the set of matched elements.
             * If a filter is provided, it retrieves the previous child only if it matches that filter.
             * @param {HTMLElement[]|String|HTMLElement} selector Matched elements
             * @param {String|Function} [filter] Selector string or filter function
             * @returns {HTMLElement}
             */
            prev:function (selector, filter) {
                return nth(selector, filter, 'previousSibling', undefined);
            },

            /**
             * Get the siblings of the first element in the set of matched elements, optionally filtered by a filter.
             * @param {HTMLElement[]|String|HTMLElement} selector Matched elements
             * @param {String|Function} [filter] Selector string or filter function
             * @returns {HTMLElement[]}
             */
            siblings:function (selector, filter) {
                return getSiblings(selector, filter, true);
            },

            /**
             * Get the children of the first element in the set of matched elements, optionally filtered by a filter.
             * @param {HTMLElement[]|String|HTMLElement} selector Matched elements
             * @param {String|Function} [filter] Selector string or filter function
             * @returns {HTMLElement[]}
             */
            children:function (selector, filter) {
                return getSiblings(selector, filter, undefined);
            },

            /**
             * Get the childrNodes of the first element in the set of matched elements (includes text and comment nodes),
             * optionally filtered by a filter.
             * @param {HTMLElement[]|String|HTMLElement} selector Matched elements
             * @param {String|Function} [filter] Selector string or filter function
             * @returns {Node[]}
             */
            contents:function (selector, filter) {
                return getSiblings(selector, filter, undefined, 1);
            },

            /**
             * Check to see if a DOM node is within another DOM node.
             * @param {HTMLElement|String|Element} container The DOM element that may contain the other element.
             * @param {HTMLElement|String|Element} contained The DOM element that may be contained by the other element.
             * @returns {Boolean}
             */
            contains:function (container, contained) {
                container = DOM.get(container);
                contained = DOM.get(contained);
                if (container && contained) {
                    return __contains(container, contained);
                }
                return false;
            },

            /**
             * Check to see if a DOM node is equal with another DOM node.
             * @param {HTMLElement|String|Element} n1
             * @param {HTMLElement|String|Element} n2
             * @returns {Boolean}
             */
            equals:function (n1, n2) {
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
            filter = function () {
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
    function getSiblings(selector, filter, parent, allowText) {
        var ret = [],
            elem = DOM.get(selector),
            parentNode = elem;

        if (elem && parent) {
            parentNode = elem.parentNode;
        }

        if (parentNode) {
            ret = S.makeArray(parentNode.childNodes);
            if (!allowText) {
                ret = DOM.filter(ret, function (el) {
                    return el.nodeType == 1;
                });
            }
            if (filter) {
                ret = DOM.filter(ret, filter);
            }
        }

        return ret;
    }

    return DOM;
}, {
    requires:["./base"]
});

/**
 * 2012-04-05 yiminghe@gmail.com
 * - 增加 contents 方法
 *
 *
 * 2011-08 yiminghe@gmail.com
 * - 添加 closest , first ,last 完全摆脱原生属性
 *
 * NOTES:
 * - jquery does not return null ,it only returns empty array , but kissy does.
 *
 *  - api 的设计上，没有跟随 jQuery. 一是为了和其他 api 一致，保持 first-all 原则。二是
 *    遵循 8/2 原则，用尽可能少的代码满足用户最常用的功能。
 *
 */
/*
Copyright 2012, KISSY UI Library v1.30dev
MIT Licensed
build time: Mar 23 12:19
*/
/**
 * @fileOverview responsible for registering event
 * @author yiminghe@gmail.com
 */
KISSY.add("event/add", function (S, Event, DOM, Utils, EventObject, handle, _data, specials) {
    var simpleAdd = Utils.simpleAdd,
        isValidTarget = Utils.isValidTarget,
        isIdenticalHandler = Utils.isIdenticalHandler;

    /**
     * dom node need eventHandler attached to dom node
     */
    function addDomEvent(target, type, eventHandler, handlers, handleObj) {
        var special = specials[type] || {};
        // 第一次注册该事件，dom 节点才需要注册 dom 事件
        if (!handlers.length &&
            (!special.setup || special.setup.call(target) === false)) {
            simpleAdd(target, type, eventHandler)
        }
        if (special.add) {
            special.add.call(target, handleObj);
        }
    }

    /**
     * @exports Event as Event
     */

    S.mix(Event,
        /**
         * @lends Event
         */
        {
            // single type , single target , fixed native
            __add:function (isNativeTarget, target, type, fn, scope) {
                var typedGroups = Utils.getTypedGroups(type);
                type = typedGroups[0];
                var groups = typedGroups[1],
                    eventDesc,
                    data,
                    s = specials[type],
                    // in case overwrite by delegateFix/onFix in specials events
                    // (mouseenter/leave,focusin/out)
                    originalType,
                    last,
                    selector;
                if (S.isObject(fn)) {
                    last = fn.last;
                    scope = fn.scope;
                    data = fn.data;
                    selector = fn.selector;
                    fn = fn.fn;
                    if (selector) {
                        if (s && s['delegateFix']) {
                            originalType = type;
                            type = s['delegateFix'];
                        }
                    }
                }
                if (!selector) {
                    // when on mouseenter , it's actually on mouseover , and handlers is saved with mouseover!
                    // TODO need evaluate!
                    if (s && s['onFix']) {
                        originalType = type;
                        type = s['onFix'];
                    }
                }
                // 不是有效的 target 或 参数不对
                if (!type ||
                    !target ||
                    !S.isFunction(fn) ||
                    (isNativeTarget && !isValidTarget(target))) {
                    return;
                }
                // 获取事件描述
                eventDesc = Event._data(target);
                if (!eventDesc) {
                    _data._data(target, eventDesc = {});
                }
                //事件 listeners , similar to eventListeners in DOM3 Events
                var events = eventDesc.events = eventDesc.events || {},
                    handlers = events[type] = events[type] || [],
                    handleObj = {
                        fn:fn,
                        scope:scope,
                        selector:selector,
                        last:last,
                        data:data,
                        groups:groups,
                        originalType:originalType
                    },
                    eventHandler = eventDesc.handler;
                // 该元素没有 handler ，并且该元素是 dom 节点时才需要注册 dom 事件
                if (!eventHandler) {
                    eventHandler = eventDesc.handler = function (event, data) {
                        // 是经过 fire 手动调用而浏览器同步触发导致的，就不要再次触发了，
                        // 已经在 fire 中 bubble 过一次了
                        // incase after page has unloaded
                        if (typeof KISSY == "undefined" ||
                            event && event.type == Utils.Event_Triggered) {
                            return;
                        }
                        var currentTarget = eventHandler.target, type;
                        if (!event || !event.fixed) {
                            event = new EventObject(currentTarget, event);
                        }
                        type = event.type;
                        if (S.isPlainObject(data)) {
                            S.mix(event, data);
                        }
                        // protect type
                        if (type) {
                            event.type = type;
                        }
                        return handle(currentTarget, event);
                    };
                    // as for native dom event , this represents currentTarget !
                    eventHandler.target = target;
                }

                for (var i = handlers.length - 1; i >= 0; --i) {
                    /**
                     * If multiple identical EventListeners are registered on the same EventTarget
                     * with the same parameters the duplicate instances are discarded.
                     * They do not cause the EventListener to be called twice
                     * and since they are discarded
                     * they do not need to be removed with the removeEventListener method.
                     */
                    if (isIdenticalHandler(handlers[i], handleObj, target)) {
                        return;
                    }
                }

                if (isNativeTarget) {
                    addDomEvent(target, type, eventHandler, handlers, handleObj);
                    //nullify to prevent memory leak in ie ?
                    target = null;
                }

                // 增加 listener
                if (selector) {
                    var delegateIndex = handlers.delegateCount
                        = handlers.delegateCount || 0;
                    handlers.splice(delegateIndex, 0, handleObj);
                    handlers.delegateCount++;
                } else {
                    handlers.lastCount = handlers.lastCount || 0;
                    if (last) {
                        handlers.push(handleObj);
                        handlers.lastCount++;
                    } else {
                        handlers.splice(handlers.length - handlers.lastCount,
                            0, handleObj);
                    }
                }
            },

            /**
             * Adds an event listener.similar to addEventListener in DOM3 Events
             * @param targets KISSY selector
             * @param type {String} The type of event to append.use space to separate multiple event types.
             * @param fn {Function} The event handler/listener.
             * @param {Object} [scope] The scope (this reference) in which the handler function is executed.
             */
            add:function (targets, type, fn, scope) {
                type = S.trim(type);
                // data : 附加在回调后面的数据，delegate 检查使用
                // remove 时 data 相等(指向同一对象或者定义了 equals 比较函数)
                if (Utils.batchForType(Event.add, targets, type, fn, scope)) {
                    return targets;
                }
                targets=DOM.query(targets);
                for(var i=targets.length-1;i>=0;i--){
                    Event.__add(true, targets[i], type, fn, scope);
                }
                return targets;
            }
        });
}, {
    requires:['./base', 'dom', './utils', './object', './handle', './data', './special']
});/**
 * @fileOverview scalable event framework for kissy (refer DOM3 Events)
 *               how to fire event just like browser?
 * @author  yiminghe@gmail.com,lifesinger@gmail.com
 */
KISSY.add('event/base', function (S, DOM, EventObject, Utils, handle, _data, special) {

    var isValidTarget = Utils.isValidTarget,
        splitAndRun = Utils.splitAndRun,
        nodeName = DOM._nodeName,
        trim = S.trim,
        TRIGGERED_NONE = Utils.TRIGGERED_NONE;

    /**
     * @namespace The event utility provides functions to add and remove event listeners.
     * @name Event
     */
    var Event =
    /**
     * @lends Event
     */
    {

        _clone:function (src, dest) {
            if (dest.nodeType !== DOM.ELEMENT_NODE ||
                !_data._hasData(src)) {
                return;
            }
            var eventDesc = _data._data(src),
                events = eventDesc.events;
            S.each(events, function (handlers, type) {
                S.each(handlers, function (handler) {
                    // scope undefined 时不能写死在 handlers 中，否则不能保证 clone 时的 this
                    Event.on(dest, type, {
                        fn:handler.fn,
                        scope:handler.scope,
                        data:handler.data,
                        originalType:handler.originalType,
                        selector:handler.selector
                    });
                });
            });
        },

        /**
         * fire event,simulate bubble in browser. similar to dispatchEvent in DOM3 Events
         * @memberOf Event
         * @param targets html nodes
         * @param {String|Event.Object} eventType event type
         * @param [eventData] additional event data
         * @param {boolean} [onlyHandlers] only fire handlers
         * @returns {boolean} The return value of fire/dispatchEvent indicates
         *                 whether any of the listeners which handled the event called preventDefault.
         *                 If preventDefault was called the value is false, else the value is true.
         */
        fire:function (targets, eventType, eventData, onlyHandlers/*internal usage*/) {
            var ret = true, r;
            // custom event firing moved to target.js
            eventData = eventData || {};
            if (S.isString(eventType)) {
                eventType = trim(eventType);
                if (eventType.indexOf(" ") > -1) {
                    splitAndRun(eventType, function (t) {
                        r = Event.fire(targets, t, eventData, onlyHandlers);
                        if (ret !== false) {
                            ret = r;
                        }
                    });
                    return ret;
                }
                // protect event type
                eventData.type = eventType;
            } else if (eventType instanceof EventObject) {
                eventData = eventType;
                eventType = eventData.type;
            }

            var typedGroups = Utils.getTypedGroups(eventType),
                _ks_groups = typedGroups[1];

            if (_ks_groups) {
                _ks_groups = Utils.getGroupsRe(_ks_groups);
            }

            eventType = typedGroups[0];

            S.mix(eventData, {
                type:eventType,
                _ks_groups:_ks_groups
            });

            targets = DOM.query(targets);
            for (var i = targets.length - 1; i >= 0; i--) {
                r = fireDOMEvent(targets[i], eventType, eventData, onlyHandlers);
                if (ret !== false) {
                    ret = r;
                }
            }
            return ret;
        },

        /**
         * does not cause default behavior to occur
         * does not bubble up the DOM hierarchy
         * @param targets
         * @param {Event.Object | String} eventType
         * @param [eventData]
         */
        fireHandler:function (targets, eventType, eventData) {
            return Event.fire(targets, eventType, eventData, 1);
        }
    };

    /**
     * fire dom event from bottom to up , emulate dispatchEvent in DOM3 Events
     * @return boolean The return value of dispatchEvent indicates
     *                 whether any of the listeners which handled the event called preventDefault.
     *                 If preventDefault was called the value is false, else the value is true.
     */
    function fireDOMEvent(target, eventType, eventData, onlyHandlers) {
        if (!isValidTarget(target)) {
            return false;
        }
        var s = special[eventType];
        // TODO bug : when fire mouseenter , it also fire mouseover in firefox/chrome
        if (s && s['onFix']) {
            eventType = s['onFix'];
        }

        var event,
            ret = true;
        if (eventData instanceof EventObject) {
            event = eventData;
        } else {
            event = new EventObject(target, undefined, eventType);
            S.mix(event, eventData);
        }
        /**
         * identify event as fired manually
         */
        event._ks_fired = 1;
        /*
         The target of the event is the EventTarget on which dispatchEvent is called.
         */
        // TODO: protect target , but incompatible
        // event.target=target;
        // protect type
        event.type = eventType;

        // onlyHandlers is equal to event.halt()
        // but we can not call event.halt()
        // because handle will check event.isPropagationStopped

        var cur = target,
            t,
            win = DOM._getWin(cur.ownerDocument || cur),
            ontype = "on" + eventType;

        //bubble up dom tree
        do {
            event.currentTarget = cur;
            t = handle(cur, event);
            if (ret !== false) {
                ret = t;
            }
            // Trigger an inline bound script
            if (cur[ ontype ] &&
                cur[ ontype ].call(cur) === false) {
                event.preventDefault();
            }
            // Bubble up to document, then to window
            cur = cur.parentNode ||
                cur.ownerDocument ||
                (cur === target.ownerDocument) && win;
        } while (!onlyHandlers && cur && !event.isPropagationStopped);

        if (!onlyHandlers && !event.isDefaultPrevented) {
            if (!(eventType === "click" &&
                nodeName(target, "a"))) {
                var old;
                try {
                    // execute default action on dom node
                    // so exclude window
                    // exclude focus/blue on hidden element
                    if (ontype &&
                        target[ eventType ] &&
                        (
                            (eventType !== "focus" && eventType !== "blur") ||
                                target.offsetWidth !== 0
                            ) &&
                        !S.isWindow(target)) {
                        // Don't re-trigger an onFOO event when we call its FOO() method
                        old = target[ ontype ];

                        if (old) {
                            target[ ontype ] = null;
                        }

                        // 记录当前 trigger 触发
                        Utils.Event_Triggered = eventType;

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

                Utils.Event_Triggered = TRIGGERED_NONE;
            }
        }
        return ret;
    }

    return Event;
}, {
    requires:["dom", "./object", "./utils", './handle', './data', './special']
});

/**
 * yiminghe@gmail.com : 2011-12-15
 *  - 重构，粒度更细，新的架构
 *
 * 2011-11-24
 *  - 自定义事件和 dom 事件操作彻底分离
 *  - TODO: group event from DOM3 Event
 *
 * 2011-06-07
 *  - refer : http://www.w3.org/TR/2001/WD-DOM-Level-3-Events-20010823/events.html
 *  - 重构
 *  - eventHandler 一个元素一个而不是一个元素一个事件一个，节省内存
 *  - 减少闭包使用，prevent ie 内存泄露？
 *  - 增加 fire ，模拟冒泡处理 dom 事件
 */
/**
 * @fileOverview  change bubble and checkbox/radio fix patch for ie<9
 * @author yiminghe@gmail.com
 */
KISSY.add("event/change", function (S, UA, Event, DOM, special) {
    var mode = S.Env.host.document['documentMode'];

    if (UA['ie'] && (UA['ie'] < 9 || (mode && mode < 9))) {

        var rformElems = /^(?:textarea|input|select)$/i;

        function isFormElement(n) {
            return rformElems.test(n.nodeName);
        }

        function isCheckBoxOrRadio(el) {
            var type = el.type;
            return type == "checkbox" || type == "radio";
        }

        special['change'] = {
            setup:function () {
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
            tearDown:function () {
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
                    S.each(DOM.query("textarea,input,select", el), function (fel) {
                        if (fel.__changeHandler) {
                            fel.__changeHandler = 0;
                            Event.remove(fel, "change", {fn:changeHandler, last:1});
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
                // lazy bind change , always as last handler among user's handlers
                Event.on(t, "change", {fn:changeHandler, last:1});
            }
        }

        function changeHandler(e) {
            var fel = this;

            if (
            // in case stopped by user's callback,same with submit
            // http://bugs.jquery.com/ticket/11049
            // see : test/change/bubble.html
                e.isPropagationStopped ||
                    // checkbox/radio already bubble using another technique
                    isCheckBoxOrRadio(fel)) {
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
    requires:["ua", "./base", "dom", './special']
});/**
 * @fileOverview for other kissy core usage
 * @author yiminghe@gmail.com
 */
KISSY.add("event/data", function (S, DOM, Utils) {
    var EVENT_GUID = Utils.EVENT_GUID,
        data,
        makeArray = S.makeArray;
    data = {
        _hasData:function (elem) {
            return DOM.hasData(elem, EVENT_GUID);
        },

        _data:function (elem) {
            var args = makeArray(arguments);
            args.splice(1, 0, EVENT_GUID);
            return DOM.data.apply(DOM, args);
        },

        _removeData:function (elem) {
            var args = makeArray(arguments);
            args.splice(1, 0, EVENT_GUID);
            return DOM.removeData.apply(DOM, args);
        }
    };
    return data;
}, {
    requires:['dom', './utils']
});/**
 * @fileOverview KISSY Scalable Event Framework
 */
KISSY.add("event", function (S, _data, KeyCodes, Event, Target, Object) {
    S.mix(Event,
        /**
         * @lends Event
         */
        {
            KeyCodes:KeyCodes,
            Target:Target,
            Object:Object,
            on:Event.add,
            detach:Event.remove,
            /**
             *
             * @param targets KISSY selector
             * @param {String} [eventType] The type of event to delegate.
             * use space to separate multiple event types.
             * @param {String|Function} selector filter selector string or function to find right element
             * @param {Function} [fn] The event handler/listener.
             * @param {Object} [scope] The scope (this reference) in which the handler function is executed.
             */
            delegate:function (targets, eventType, selector, fn, scope) {
                return Event.add(targets, eventType, {
                    fn:fn,
                    scope:scope,
                    selector:selector
                });
            },
            /**
             * @param targets KISSY selector
             * @param {String} [eventType] The type of event to undelegate.
             * use space to separate multiple event types.
             * @param {String|Function} selector filter selector string or function to find right element
             * @param {Function} [fn] The event handler/listener.
             * @param {Object} [scope] The scope (this reference) in which the handler function is executed.
             */
            undelegate:function (targets, eventType, selector, fn, scope) {
                return Event.remove(targets, eventType, {
                    fn:fn,
                    scope:scope,
                    selector:selector
                });
            }
        });

    S.mix(Event, _data);

    S.mix(S, {
        Event:Event,
        EventTarget:Event.Target,
        EventObject:Event.Object
    });

    return Event;
}, {
    requires:[
        "event/data",
        "event/keycodes",
        "event/base",
        "event/target",
        "event/object",
        "event/focusin",
        "event/hashchange",
        "event/valuechange",
        "event/mouseenter",
        "event/submit",
        "event/change",
        "event/mousewheel",
        "event/add",
        "event/remove"
    ]
});

/**
 *  2012-02-12 yiminghe@gmail.com note:
 *   - 普通 remove() 不管 selector 都会查，如果 fn scope 相等就移除
 *   - undelegate() selector 为 ""，那么去除所有委托绑定的 handler
 *//**
 * @fileOverview   event-focusin
 * @author  yiminghe@gmail.com
 */
KISSY.add('event/focusin', function (S, UA, Event, special) {
    // 让非 IE 浏览器支持 focusin/focusout
    if (!UA['ie']) {
        S.each([
            { name:'focusin', fix:'focus' },
            { name:'focusout', fix:'blur' }
        ], function (o) {
            var key = S.guid("attaches_" + S.now() + "_")
            special[o.name] = {
                // 统一在 document 上 capture focus/blur 事件，然后模拟冒泡 fire 出来
                // 达到和 focusin 一样的效果 focusin -> focus
                // refer: http://yiminghe.iteye.com/blog/813255
                setup:function () {
                    // this maybe document
                    var doc = this.ownerDocument || this;
                    if (!(key in doc)) {
                        doc[key] = 0;
                    }
                    doc[key] += 1;
                    if (doc[key] === 1) {
                        doc.addEventListener(o.fix, handler, true);
                    }
                },

                tearDown:function () {
                    var doc = this.ownerDocument || this;
                    doc[key] -= 1;
                    if (doc[key] === 0) {
                        doc.removeEventListener(o.fix, handler, true);
                    }
                }
            };

            function handler(event) {
                var target = event.target;
                return Event.fire(target, o.name);
            }

        });
    }

    special["focus"] = {
        delegateFix:"focusin"
    };

    special["blur"] = {
        delegateFix:"focusout"
    };

    return Event;
}, {
    requires:["ua", "./base", './special']
});

/**
 * 承玉:2011-06-07
 * - refactor to jquery , 更加合理的模拟冒泡顺序，子元素先出触发，父元素后触发
 *
 * NOTES:
 *  - webkit 和 opera 已支持 DOMFocusIn/DOMFocusOut 事件，但上面的写法已经能达到预期效果，暂时不考虑原生支持。
 */
/**
 * @fileOverview responsible for handling event from browser to KISSY Event
 * @author yiminghe@gmail.com
 */
KISSY.add("event/handle", function (S, DOM, _data, special) {

    function getEvents(target) {
        // 获取事件描述
        var eventDesc = _data._data(target);
        return eventDesc && eventDesc.events;
    }

    function getHandlers(target, type) {
        var events = getEvents(target) || {};
        return events[type] || [];
    }

    return function (currentTarget, event) {
        /*
         As some listeners may remove themselves from the
         event, the original array length is dynamic. So,
         let's make a copy of all listeners, so we are
         sure we'll call all of them.
         */
        /**
         * DOM3 Events: EventListenerList objects in the DOM are live. ??
         */
        var handlers = getHandlers(currentTarget, event.type),
            target = event.target,
            currentTarget0,
            allHandlers = [],
            ret,
            gRet,
            handlerObj,
            i,
            j,
            delegateCount = handlers.delegateCount || 0,
            len,
            currentTargetHandlers,
            currentTargetHandler,
            handler;

        // collect delegated handlers and corresponding element
        if (delegateCount &&
            // by jq
            // Avoid disabled elements in IE (#6911)
            // non-left-click bubbling in Firefox (#3861),firefox 8 fix it
            !target.disabled) {
            while (target != currentTarget) {
                currentTargetHandlers = [];
                for (i = 0; i < delegateCount; i++) {
                    handler = handlers[i];
                    if (DOM.test(target, handler.selector)) {
                        currentTargetHandlers.push(handler);
                    }
                }
                if (currentTargetHandlers.length) {
                    allHandlers.push({
                        currentTarget:target,
                        "currentTargetHandlers":currentTargetHandlers
                    });
                }
                target = target.parentNode || currentTarget;
            }
        }

        // root node's handlers is placed at end position of add handlers
        // in case child node stopPropagation of root node's handlers
        allHandlers.push({
            currentTarget:currentTarget,
            currentTargetHandlers:handlers.slice(delegateCount)
        });

        // backup eventType
        var eventType = event.type,
            s,
            t,
            _ks_groups = event._ks_groups;
        for (i = 0, len = allHandlers.length;
             !event.isPropagationStopped && i < len;
             ++i) {

            handlerObj = allHandlers[i];
            currentTargetHandlers = handlerObj.currentTargetHandlers;
            currentTarget0 = handlerObj.currentTarget;
            event.currentTarget = currentTarget0;
            for (j = 0; !event.isImmediatePropagationStopped &&
                j < currentTargetHandlers.length;
                 j++) {

                currentTargetHandler = currentTargetHandlers[j];

                // handler's group does not match specified groups (at fire step)
                if (_ks_groups &&
                    (!currentTargetHandler.groups ||
                        !(currentTargetHandler.groups.match(_ks_groups)))) {
                    continue;
                }

                var data = currentTargetHandler.data;

                // restore originalType if involving delegate/onFix handlers
                event.type = currentTargetHandler.originalType || eventType;

                // scope undefined 时不能写死在 listener 中，否则不能保证 clone 时的 this
                if ((s = special[event.type]) && s.handle) {
                    t = s.handle(event, currentTargetHandler, data);
                    // can handle
                    if (t.length > 0) {
                        ret = t[0];
                    }
                } else {
                    ret = currentTargetHandler.fn.call(
                        currentTargetHandler.scope || currentTarget,
                        event, data
                    );
                }
                // 和 jQuery 逻辑保持一致
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
        }

        // fire 时判断如果 preventDefault，则返回 false 否则返回 true
        // 这里返回值意义不同
        return gRet;
    }
}, {
    requires:['dom', './data', './special']
});/**
 * @fileOverview   event-hashchange
 * @author  yiminghe@gmail.com , xiaomacji@gmail.com
 */
KISSY.add('event/hashchange', function (S, Event, DOM, UA, special) {

    var win=S.Env.host,
        doc = win.document,
        docMode = doc['documentMode'],
        ie = docMode || UA['ie'],
        HASH_CHANGE = 'hashchange';

    // ie8 支持 hashchange
    // 但IE8以上切换浏览器模式到IE7（兼容模式），会导致 'onhashchange' in window === true，但是不触发事件

    // 1. 不支持 hashchange 事件，支持 hash 导航(opera??)：定时器监控
    // 2. 不支持 hashchange 事件，不支持 hash 导航(ie67) : iframe + 定时器
    if ((!( 'on' + HASH_CHANGE in win)) || ie && ie < 8) {


        function getIframeDoc(iframe) {
            return iframe.contentWindow.document;
        }

        var POLL_INTERVAL = 50,
            IFRAME_TEMPLATE = "<html><head><title>" + (doc.title || "") +
                " - {hash}</title>{head}</head><body>{hash}</body></html>",

            getHash = function () {
                // 不能 location.hash
                // http://xx.com/#yy?z=1
                // ie6 => location.hash = #yy
                // 其他浏览器 => location.hash = #yy?z=1
                var url = location.href;
                return '#' + url.replace(/^[^#]*#?(.*)$/, '$1');
            },

            timer,

            // 用于定时器检测，上次定时器记录的 hash 值
            lastHash,

            poll = function () {
                var hash = getHash();
                if (hash !== lastHash) {
                    // S.log("poll success :" + hash + " :" + lastHash);
                    // 通知完调用者 hashchange 事件前设置 lastHash
                    lastHash = hash;
                    // ie<8 同步 : hashChange -> onIframeLoad
                    hashChange(hash);
                }
                timer = setTimeout(poll, POLL_INTERVAL);
            },

            hashChange = ie && ie < 8 ? function (hash) {
                // S.log("set iframe html :" + hash);

                var html = S.substitute(IFRAME_TEMPLATE, {
                    hash:hash,
                    // 一定要加哦
                    head:DOM._isCustomDomain() ? "<script>document.domain = '" +
                        doc.domain
                        + "';</script>" : ""
                }),
                    iframeDoc = getIframeDoc(iframe);
                try {
                    // 写入历史 hash
                    iframeDoc.open();
                    // 取时要用 innerText !!
                    // 否则取 innerHtml 会因为 escapeHtml 导置 body.innerHTMl != hash
                    iframeDoc.write(html);
                    iframeDoc.close();
                    // 立刻同步调用 onIframeLoad !!!!
                } catch (e) {
                    // S.log('doc write error : ', 'error');
                    // S.log(e, 'error');
                }
            } : function () {
                notifyHashChange();
            },

            notifyHashChange = function () {
                // S.log("hash changed : " + getHash());
                Event.fire(win, HASH_CHANGE);
            },
            setup = function () {
                if (!timer) {
                    poll();
                }
            },
            tearDown = function () {
                timer && clearTimeout(timer);
                timer = 0;
            },
            iframe;

        // ie6, 7, 覆盖一些function
        if (ie < 8) {

            /*
             前进后退 : start -> notifyHashChange
             直接输入 : poll -> hashChange -> start
             iframe 内容和 url 同步
             */
            setup = function () {
                if (!iframe) {
                    var iframeSrc = DOM._genEmptyIframeSrc();
                    //http://www.paciellogroup.com/blog/?p=604
                    iframe = DOM.create('<iframe ' +
                        (iframeSrc ? 'src="' + iframeSrc + '"' : '') +
                        ' style="display: none" ' +
                        'height="0" ' +
                        'width="0" ' +
                        'tabindex="-1" ' +
                        'title="empty"/>');
                    // Append the iframe to the documentElement rather than the body.
                    // Keeping it outside the body prevents scrolling on the initial
                    // page load
                    DOM.prepend(iframe, doc.documentElement);

                    // init，第一次触发，以后都是 onIframeLoad
                    Event.add(iframe, "load", function () {
                        Event.remove(iframe, "load");
                        // Update the iframe with the initial location hash, if any. This
                        // will create an initial history entry that the user can return to
                        // after the state has changed.
                        hashChange(getHash());
                        Event.add(iframe, "load", onIframeLoad);
                        poll();
                    });

                    // Whenever `document.title` changes, update the Iframe's title to
                    // prettify the back/next history menu entries. Since IE sometimes
                    // errors with "Unspecified error" the very first time this is set
                    // (yes, very useful) wrap this with a try/catch block.
                    doc.onpropertychange = function () {
                        try {
                            if (event.propertyName === 'title') {
                                getIframeDoc(iframe).title =
                                    doc.title + " - " + getHash();
                            }
                        } catch (e) {
                        }
                    };

                    /*
                     前进后退 ： onIframeLoad -> 触发
                     直接输入 : timer -> hashChange -> onIframeLoad -> 触发
                     触发统一在 start(load)
                     iframe 内容和 url 同步
                     */
                    function onIframeLoad() {
                        // S.log('iframe start load..');

                        // 2011.11.02 note: 不能用 innerHtml 会自动转义！！
                        // #/x?z=1&y=2 => #/x?z=1&amp;y=2
                        var c = S.trim(getIframeDoc(iframe).body.innerText),
                            ch = getHash();

                        // 后退时不等
                        // 定时器调用 hashChange() 修改 iframe 同步调用过来的(手动改变 location)则相等
                        if (c != ch) {
                            S.log("set loc hash :" + c);
                            location.hash = c;
                            // 使lasthash为 iframe 历史， 不然重新写iframe，
                            // 会导致最新状态（丢失前进状态）

                            // 后退则立即触发 hashchange，
                            // 并更新定时器记录的上个 hash 值
                            lastHash = c;
                        }
                        notifyHashChange();
                    }
                }
            };

            tearDown = function () {
                timer && clearTimeout(timer);
                timer = 0;
                Event.detach(iframe);
                DOM.remove(iframe);
                iframe = 0;
            };
        }

        special[HASH_CHANGE] = {
            setup:function () {
                if (this !== win) {
                    return;
                }
                // 第一次启动 hashchange 时取一下，不能类库载入后立即取
                // 防止类库嵌入后，手动修改过 hash，
                lastHash = getHash();
                // 不用注册 dom 事件
                setup();
            },
            tearDown:function () {
                if (this !== win) {
                    return;
                }
                tearDown();
            }
        };
    }
}, {
    requires:["./base", "dom", "ua", "./special"]
});

/**
 * 已知 bug :
 * - ie67 有时后退后取得的 location.hash 不和地址栏一致，导致必须后退两次才能触发 hashchange
 *
 * v1 : 2010-12-29
 * v1.1: 支持非IE，但不支持onhashchange事件的浏览器(例如低版本的firefox、safari)
 * refer : http://yiminghe.javaeye.com/blog/377867
 *         https://github.com/cowboy/jquery-hashchange
 *//**
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

});/**
 * @fileOverview   event-mouseenter
 * @author  yiminghe@gmail.com
 */
KISSY.add('event/mouseenter', function (S, Event, DOM, UA, special) {
    S.each([
        { name:'mouseenter', fix:'mouseover' },
        { name:'mouseleave', fix:'mouseout' }
    ], function (o) {
        special[o.name] = {
            // fix #75
            onFix:o.fix,
            // all browser need
            delegateFix:o.fix,
            handle:function (event, handler, data) {
                var currentTarget = event.currentTarget,
                    relatedTarget = event.relatedTarget;
                // 在自身外边就触发
                // self === document,parent === null
                // relatedTarget 与 currentTarget 之间就是 mouseenter/leave
                if (!relatedTarget ||
                    (relatedTarget !== currentTarget &&
                        !DOM.contains(currentTarget, relatedTarget))) {
                    // http://msdn.microsoft.com/en-us/library/ms536945(v=vs.85).aspx
                    // does not bubble
                    event.stopPropagation();
                    return [handler.fn.call(handler.scope || currentTarget, event, data)];
                }
                return [];
            }
        };
    });

    return Event;
}, {
    requires:["./base", "dom", "ua", "./special"]
});

/**
 * yiminghe@gmail.com:2011-12-15
 * - 借鉴 jq 1.7 新的架构
 *
 * 承玉：2011-06-07
 * - 根据新结构，调整 mouseenter 兼容处理
 * - fire('mouseenter') 可以的，直接执行 mouseenter 的 handlers 用户回调数组
 */
/**
 * @fileOverview normalize mousewheel in gecko
 * @author yiminghe@gmail.com
 */
KISSY.add("event/mousewheel", function (S, Event, UA, Utils, EventObject, handle, _data, special) {

    var MOUSE_WHEEL = UA.gecko ? 'DOMMouseScroll' : 'mousewheel',
        simpleRemove = Utils.simpleRemove,
        simpleAdd = Utils.simpleAdd,
        MOUSE_WHEEL_HANDLER = "mousewheelHandler";

    function handler(e) {
        var deltaX,
            currentTarget = this,
            deltaY,
            delta,
            detail = e.detail;

        if (e.wheelDelta) {
            delta = e.wheelDelta / 120;
        }
        if (e.detail) {
            // press control e.detail == 1 else e.detail == 3
            delta = -(detail % 3 == 0 ? detail / 3 : detail);
        }

        // Gecko
        if (e.axis !== undefined) {
            if (e.axis === e['HORIZONTAL_AXIS']) {
                deltaY = 0;
                deltaX = -1 * delta;
            } else if (e.axis === e['VERTICAL_AXIS']) {
                deltaX = 0;
                deltaY = delta;
            }
        }

        // Webkit
        if (e['wheelDeltaY'] !== undefined) {
            deltaY = e['wheelDeltaY'] / 120;
        }
        if (e['wheelDeltaX'] !== undefined) {
            deltaX = -1 * e['wheelDeltaX'] / 120;
        }

        // 默认 deltaY ( ie )
        if (!deltaX && !deltaY) {
            deltaY = delta;
        }

        // can not invoke eventDesc.handler , it will protect type
        // but here in firefox , we want to change type really
        e = new EventObject(currentTarget, e);

        S.mix(e, {
            deltaY:deltaY,
            delta:delta,
            deltaX:deltaX,
            type:'mousewheel'
        });

        return  handle(currentTarget, e);
    }

    special['mousewheel'] = {
        setup:function () {
            var el = this,
                mousewheelHandler,
                eventDesc = _data._data(el);
            // solve this in ie
            mousewheelHandler = eventDesc[MOUSE_WHEEL_HANDLER] = S.bind(handler, el);
            simpleAdd(this, MOUSE_WHEEL, mousewheelHandler);
        },
        tearDown:function () {
            var el = this,
                mousewheelHandler,
                eventDesc = _data._data(el);
            mousewheelHandler = eventDesc[MOUSE_WHEEL_HANDLER];
            simpleRemove(this, MOUSE_WHEEL, mousewheelHandler);
            delete eventDesc[mousewheelHandler];
        }
    };

}, {
    requires:['./base', 'ua', './utils',
        './object', './handle',
        './data', "./special"]
});

/**
 note:
 not perfect in osx : accelerated scroll
 refer:
 https://github.com/brandonaaron/jquery-mousewheel/blob/master/jquery.mousewheel.js
 http://www.planabc.net/2010/08/12/mousewheel_event_in_javascript/
 http://www.switchonthecode.com/tutorials/javascript-tutorial-the-scroll-wheel
 http://stackoverflow.com/questions/5527601/normalizing-mousewheel-speed-across-browsers/5542105#5542105
 http://www.javascriptkit.com/javatutors/onmousewheel.shtml
 http://www.adomas.org/javascript-mouse-wheel/
 http://plugins.jquery.com/project/mousewheel
 http://www.cnblogs.com/aiyuchen/archive/2011/04/19/2020843.html
 http://www.w3.org/TR/DOM-Level-3-Events/#events-mousewheelevents
 **//**
 * @fileOverview   EventObject
 * @author  lifesinger@gmail.com,yiminghe@gmail.com
 */
KISSY.add('event/object', function (S, undefined) {

    var doc = S.Env.host.document,
        TRUE = true,
        FALSE = false,
        props = ('altKey attrChange attrName bubbles button cancelable ' +
            'charCode clientX clientY ctrlKey currentTarget data detail ' +
            'eventPhase fromElement handler keyCode metaKey ' +
            'newValue offsetX offsetY originalTarget pageX pageY prevValue ' +
            'relatedNode relatedTarget screenX screenY shiftKey srcElement ' +
            'target toElement view wheelDelta which axis').split(' ');

    /**
     * @class KISSY's event system normalizes the event object according to
     * W3C standards. The event object is guaranteed to be passed to
     * the event handler. Most properties from the original event are
     * copied over and normalized to the new event object.
     * @name Object
     * @memberOf Event
     */
    function EventObject(currentTarget, domEvent, type) {
        var self = this;
        self.originalEvent = domEvent || { };
        self.currentTarget = currentTarget;
        if (domEvent) { // html element
            self.type = domEvent.type;
            // incase dom event has been mark as default prevented by lower dom node
            self.isDefaultPrevented = ( domEvent['defaultPrevented'] || domEvent.returnValue === FALSE ||
                domEvent['getPreventDefault'] && domEvent['getPreventDefault']() ) ? TRUE : FALSE;
            self._fix();
        }
        else { // custom
            self.type = type;
            self.target = currentTarget;
        }
        // bug fix: in _fix() method, ie maybe reset currentTarget to undefined.
        self.currentTarget = currentTarget;
        self.fixed = TRUE;
    }

    S.augment(EventObject,
        /**
         * @lends Event.Object#
         */
        {

            /**
             * Flag for preventDefault that is modified during fire event. if it is true, the default behavior for this event will be executed.
             * @type Boolean
             */
            isDefaultPrevented:FALSE,
            /**
             * Flag for stopPropagation that is modified during fire event. true means to stop propagation to bubble targets.
             * @type Boolean
             */
            isPropagationStopped:FALSE,
            /**
             * Flag for stopImmediatePropagation that is modified during fire event. true means to stop propagation to bubble targets and other listener.
             * @type Boolean
             */
            isImmediatePropagationStopped:FALSE,

            _fix:function () {
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
                    self.target = self.srcElement || ownerDoc; // srcElement might not be defined either
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
            preventDefault:function () {
                var e = this.originalEvent;

                // if preventDefault exists run it on the original event
                if (e.preventDefault) {
                    e.preventDefault();
                }
                // otherwise set the returnValue property of the original event to FALSE (IE)
                else {
                    e.returnValue = FALSE;
                }

                this.isDefaultPrevented = TRUE;
            },

            /**
             * Stops the propagation to the next bubble target
             */
            stopPropagation:function () {
                var e = this.originalEvent;

                // if stopPropagation exists run it on the original event
                if (e.stopPropagation) {
                    e.stopPropagation();
                }
                // otherwise set the cancelBubble property of the original event to TRUE (IE)
                else {
                    e.cancelBubble = TRUE;
                }

                this.isPropagationStopped = TRUE;
            },


            /**
             * Stops the propagation to the next bubble target and
             * prevents any additional listeners from being exectued
             * on the current target.
             */
            stopImmediatePropagation:function () {
                var self = this;
                self.isImmediatePropagationStopped = TRUE;
                // fixed 1.2
                // call stopPropagation implicitly
                self.stopPropagation();
            },

            /**
             * Stops the event propagation and prevents the default
             * event behavior.
             * @param  {boolean} [immediate] if true additional listeners on the current target will not be executed
             */
            halt:function (immediate) {
                var self = this;
                if (immediate) {
                    self.stopImmediatePropagation();
                } else {
                    self.stopPropagation();
                }
                self.preventDefault();
            }
        });

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
 * @fileOverview responsible for un-registering event
 * @author yiminghe@gmail.com
 */
KISSY.add("event/remove", function (S, Event, DOM, Utils, _data, EVENT_SPECIAL) {
    var isValidTarget = Utils.isValidTarget,
        simpleRemove = Utils.simpleRemove;

    S.mix(Event,
        /**
         * @lends Event
         */
        {
            // single target, single type, fixed native
            __remove:function (isNativeTarget, target, type, fn, scope) {

                if (!target || (isNativeTarget && !isValidTarget(target))) {
                    return;
                }

                var typedGroups = Utils.getTypedGroups(type);
                type = typedGroups[0];
                var groups = typedGroups[1],
                    selector,
                    // in case type is undefined
                    originalFn = fn,
                    originalScope = scope,
                    hasSelector, s = EVENT_SPECIAL[type];

                if (S.isObject(fn)) {
                    scope = fn.scope;
                    hasSelector = ("selector" in fn);
                    selector = fn.selector;
                    fn = fn.fn;
                    if (selector) {
                        if (s && s['delegateFix']) {
                            type = s['delegateFix'];
                        }
                    }
                }

                if (!selector) {
                    if (s && s['onFix']) {
                        type = s['onFix'];
                    }
                }

                var eventDesc = _data._data(target),
                    events = eventDesc && eventDesc.events,
                    handlers,
                    handler,
                    len,
                    i,
                    j,
                    t,
                    special = (isNativeTarget && EVENT_SPECIAL[type]) || { };

                if (!events) {
                    return;
                }

                // remove all types of event
                if (!type) {
                    for (type in events) {
                        if (events.hasOwnProperty(type)) {
                            Event.__remove(isNativeTarget,
                                target, type + groups, originalFn,
                                originalScope);
                        }
                    }
                    return;
                }

                var groupsRe;

                if (groups) {
                    groupsRe = Utils.getGroupsRe(groups);
                }

                if ((handlers = events[type])) {
                    len = handlers.length;
                    // 移除 fn
                    if ((fn || hasSelector || groupsRe ) && len) {
                        scope = scope || target;

                        for (i = 0, j = 0, t = []; i < len; ++i) {
                            handler = handlers[i];
                            var handlerScope = handler.scope || target;
                            if (
                                (scope != handlerScope) ||
                                    // 指定了函数，函数不相等，保留
                                    (fn && fn != handler.fn) ||
                                    // 1.没指定函数
                                    // 1.1 没有指定选择器,删掉 else2
                                    // 1.2 指定选择器,字符串为空
                                    // 1.2.1 指定选择器,字符串为空,待比较 handler 有选择器,删掉 else
                                    // 1.2.2 指定选择器,字符串为空,待比较 handler 没有选择器,保留
                                    // 1.3 指定选择器,字符串不为空,字符串相等,删掉 else
                                    // 1.4 指定选择器,字符串不为空,字符串不相等,保留
                                    // 2.指定了函数且函数相等
                                    // 2.1 没有指定选择器,删掉 else
                                    // 2.2 指定选择器,字符串为空
                                    // 2.2.1 指定选择器,字符串为空,待比较 handler 有选择器,删掉 else
                                    // 2.2.2 指定选择器,字符串为空,待比较 handler 没有选择器,保留
                                    // 2.3 指定选择器,字符串不为空,字符串相等,删掉  else
                                    // 2.4 指定选择器,字符串不为空,字符串不相等,保留
                                    (
                                        hasSelector &&
                                            (
                                                (selector && selector != handler.selector) ||
                                                    (!selector && !handler.selector)
                                                )
                                        ) ||

                                    // 指定了删除的某些组，而该 handler 不属于这些组，保留，否则删除
                                    (groupsRe && !handler.groups.match(groupsRe))

                                ) {
                                t[j++] = handler;
                            }
                            else {
                                if (handler.selector && handlers.delegateCount) {
                                    handlers.delegateCount--;
                                }
                                if (handler.last && handlers.lastCount) {
                                    handlers.lastCount--;
                                }
                                if (special.remove) {
                                    special.remove.call(target, handler);
                                }
                            }
                        }
                        t.delegateCount = handlers.delegateCount;
                        t.lastCount = handlers.lastCount;
                        events[type] = t;
                        len = t.length;
                    } else {
                        // 全部删除
                        len = 0;
                    }

                    if (!len) {
                        // remove(el, type) or fn 已移除光
                        // dom node need to detach handler from dom node
                        if (isNativeTarget &&
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
            },

            /**
             * Detach an event or set of events from an element. similar to removeEventListener in DOM3 Events
             * @param targets KISSY selector
             * @param {String} [type] The type of event to remove.
             * use space to separate multiple event types.
             * @param {Function} [fn] The event handler/listener.
             * @param {Object} [scope] The scope (this reference) in which the handler function is executed.
             */
            remove:function (targets, type, fn, scope) {

                type = S.trim(type);

                if (Utils.batchForType(Event.remove, targets, type, fn, scope)) {
                    return targets;
                }

                targets = DOM.query(targets);

                for (var i = targets.length - 1; i >= 0; i--) {
                    Event.__remove(true, targets[i], type, fn, scope);
                }

                return targets;

            }
        });
}, {
    requires:['./base', 'dom', './utils', './data', './special']
});/**
 * @fileOverview special house for special events
 * @author yiminghe@gmail.com
 */
KISSY.add("event/special", function () {
    return {};
});/**
 * @fileOverview patch for ie<9 submit : does not bubble !
 * @author yiminghe@gmail.com
 */
KISSY.add("event/submit", function (S, UA, Event, DOM, special) {
    var mode = S.Env.host.document['documentMode'];
    if (UA['ie'] && (UA['ie'] < 9 || (mode && mode < 9))) {
        var nodeName = DOM._nodeName;
        special['submit'] = {
            setup:function () {
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
            tearDown:function () {
                var el = this;
                // form use native
                if (nodeName(el, "form")) {
                    return false;
                }
                Event.remove(el, "click keypress", detector);
                S.each(DOM.query("form", el),function (form) {
                    if (form.__submit__fix) {
                        form.__submit__fix = 0;
                        Event.remove(form, "submit", {
                            fn:submitBubble,
                            last:1
                        });
                    }
                });
            }
        };


        function detector(e) {
            var t = e.target,
                form = nodeName(t, "input") || nodeName(t, "button") ? t.form : null;

            if (form && !form.__submit__fix) {
                form.__submit__fix = 1;
                Event.on(form, "submit", {
                    fn:submitBubble,
                    last:1
                });
            }
        }

        function submitBubble(e) {
            var form = this;
            if (form.parentNode &&
                // it is stopped by user callback
                !e.isPropagationStopped &&
                // it is not fired manually
                !e._ks_fired) {
                // simulated bubble for submit
                // fire from parentNode. if form.on("submit") , this logic is never run!
                Event.fire(form.parentNode, "submit", e);
            }
        }
    }

}, {
    requires:["ua", "./base", "dom", "./special"]
});
/**
 * modified from jq ,fix submit in ie<9
 *  - http://bugs.jquery.com/ticket/11049
 **//**
 * @fileOverview 提供事件发布和订阅机制
 * @author  yiminghe@gmail.com
 */
KISSY.add('event/target', function (S, Event, EventObject, Utils, handle, undefined) {
    var KS_PUBLISH = "__~ks_publish",
        trim = S.trim,
        splitAndRun = Utils.splitAndRun,
        KS_BUBBLE_TARGETS = "__~ks_bubble_targets",
        ALL_EVENT = "*";

    function getCustomEvent(self, type, eventData) {
        if (eventData instanceof EventObject) {
            // set currentTarget in the process of bubbling
            eventData.currentTarget = self;
            return eventData;
        }
        var customEvent = new EventObject(self, undefined, type);
        S.mix(customEvent, eventData);
        return customEvent
    }

    function getEventPublishObj(self) {
        self[KS_PUBLISH] = self[KS_PUBLISH] || {};
        return self[KS_PUBLISH];
    }

    function getBubbleTargetsObj(self) {
        self[KS_BUBBLE_TARGETS] = self[KS_BUBBLE_TARGETS] || {};
        return self[KS_BUBBLE_TARGETS];
    }

    function isBubblable(self, eventType) {
        var publish = getEventPublishObj(self);
        return publish[eventType] && publish[eventType].bubbles || publish[ALL_EVENT] && publish[ALL_EVENT].bubbles
    }

    function attach(method) {
        return function (type, fn, scope) {
            var self = this;
            type = trim(type);
            splitAndRun(type, function (t) {
                Event["__" + method](false, self, t, fn, scope);
            });
            return self; // chain
        };
    }

    /**
     * @class EventTarget provides the implementation for any object to publish, subscribe and fire to custom events,
     * and also allows other EventTargets to target the object with events sourced from the other object.
     * EventTarget is designed to be used with S.augment to allow events to be listened to and fired by name.
     * This makes it possible for implementing code to subscribe to an event that either has not been created yet,
     * or will not be created at all.
     * @namespace
     * @name Target
     * @memberOf Event
     */
    var Target =
    /**
     * @lends Event.Target
     */
    {
        /**
         * Fire a custom event by name.
         * The callback functions will be executed from the context specified when the event was created,
         * and the {@link Event.Object} created will be mixed with eventData
         * @param {String} type The type of the event
         * @param {Object} [eventData] The data will be mixed with {@link Event.Object} created
         * @returns {Boolean|*} If any listen returns false, then the returned value is false. else return the last listener's returned value
         */
        fire:function (type, eventData) {
            var self = this,
                ret = undefined,
                r2,
                customEvent;
            eventData = eventData || {};
            type = trim(type);
            if (type.indexOf(" ") > 0) {
                splitAndRun(type, function (t) {
                    r2 = self.fire(t, eventData);
                    if (ret !== false) {
                        ret = r2;
                    }
                });
                return ret;
            }
            var typedGroups = Utils.getTypedGroups(type), _ks_groups = typedGroups[1];
            type = typedGroups[0];
            if (_ks_groups) {
                _ks_groups = Utils.getGroupsRe(_ks_groups);
            }
            S.mix(eventData, {
                // protect type
                type:type,
                _ks_groups:_ks_groups
            });
            customEvent = getCustomEvent(self, type, eventData);
            ret = handle(self, customEvent);
            if (!customEvent.isPropagationStopped &&
                isBubblable(self, type)) {
                r2 = self.bubble(type, customEvent);
                // false 优先返回
                if (ret !== false) {
                    ret = r2;
                }
            }
            return ret
        },

        /**
         * Creates a new custom event of the specified type
         * @param {String} type The type of the event
         * @param {Object} cfg Config params
         * @param {Boolean} [cfg.bubbles=false] whether or not this event bubbles
         */
        publish:function (type, cfg) {
            var self = this,
                publish = getEventPublishObj(self);
            type = trim(type);
            if (type) {
                publish[type] = cfg;
            }
        },

        /**
         * bubble event to its targets
         * @param type
         * @param eventData
         * @private
         */
        bubble:function (type, eventData) {
            var self = this,
                ret = undefined,
                targets = getBubbleTargetsObj(self);
            S.each(targets, function (t) {
                var r2 = t.fire(type, eventData);
                if (ret !== false) {
                    ret = r2;
                }
            });
            return ret;
        },

        /**
         * Registers another EventTarget as a bubble target.
         * @param {Event.Target} target Another EventTarget instance to add
         */
        addTarget:function (target) {
            var self = this,
                targets = getBubbleTargetsObj(self);
            targets[S.stamp(target)] = target;
        },

        /**
         * Removes a bubble target
         * @param {Event.Target} target Another EventTarget instance to remove
         */
        removeTarget:function (target) {
            var self = this,
                targets = getBubbleTargetsObj(self);
            delete targets[S.stamp(target)];
        },

        /**
         * Subscribe a callback function to a custom event fired by this object or from an object that bubbles its events to this object.
         * @function
         * @param {String} type The name of the event
         * @param {Function} fn The callback to execute in response to the event
         * @param {Object} [scope] this object in callback
         */
        on:attach("add"),
        /**
         * Detach one or more listeners the from the specified event
         * @function
         * @param {String} type The name of the event
         * @param {Function} [fn] The subscribed function to unsubscribe. if not supplied, all subscribers will be removed.
         * @param {Object} [scope] The custom object passed to subscribe.
         */
        detach:attach("remove")
    };

    return Target;
}, {
    requires:["./base", './object', './utils', './handle']
});
/**
 *  yiminghe:2011-10-17
 *   - implement bubble for custom event
 **//**
 * @fileOverview utils for event
 * @author yiminghe@gmail.com
 */
KISSY.add("event/utils", function (S, DOM) {

    /**
     * whether two event listens are the same
     * @param h1 已有的 handler 描述
     * @param h2 用户提供的 handler 描述
     */
    function isIdenticalHandler(h1, h2, el) {
        var scope1 = h1.scope || el,
            ret = 1,
            scope2 = h2.scope || el;
        if (
            h1.fn !== h2.fn ||
                h1.selector !== h2.selector ||
                h1.data !== h2.data ||
                scope1 !== scope2 ||
                h1.originalType !== h2.originalType ||
                h1.groups !== h2.groups ||
                h1.last !== h2.last
            ) {
            ret = 0;
        }
        return ret;
    }


    function isValidTarget(target) {
        // 3 - is text node
        // 8 - is comment node
        return target &&
            target.nodeType !== DOM.TEXT_NODE &&
            target.nodeType !== DOM.COMMENT_NODE;
    }


    function batchForType(fn, targets, types) {
        // on(target, 'click focus', fn)
        if (types && types.indexOf(" ") > 0) {
            var args = S.makeArray(arguments);
            S.each(types.split(/\s+/), function (type) {
                var args2 = [].concat(args);
                args2.splice(0, 3, targets, type);
                fn.apply(null, args2);
            });
            return true;
        }
        return 0;
    }


    function splitAndRun(type, fn) {
        S.each(type.split(/\s+/), fn);
    }

    var doc = S.Env.host.document,
        simpleAdd = doc.addEventListener ?
            function (el, type, fn, capture) {
                if (el.addEventListener) {
                    el.addEventListener(type, fn, !!capture);
                }
            } :
            function (el, type, fn) {
                if (el.attachEvent) {
                    el.attachEvent('on' + type, fn);
                }
            },
        simpleRemove = doc.removeEventListener ?
            function (el, type, fn, capture) {
                if (el.removeEventListener) {
                    el.removeEventListener(type, fn, !!capture);
                }
            } :
            function (el, type, fn) {
                if (el.detachEvent) {
                    el.detachEvent('on' + type, fn);
                }
            };


    return {
        // 记录手工 fire(domElement,type) 时的 type
        // 再在浏览器通知的系统 eventHandler 中检查
        // 如果相同，那么证明已经 fire 过了，不要再次触发了
        Event_Triggered:"",
        TRIGGERED_NONE:"trigger-none-" + S.now(),
        EVENT_GUID:'ksEventTargetId' + S.now(),
        splitAndRun:splitAndRun,
        batchForType:batchForType,
        isValidTarget:isValidTarget,
        isIdenticalHandler:isIdenticalHandler,
        simpleAdd:simpleAdd,
        simpleRemove:simpleRemove,
        getTypedGroups:function (type) {
            if (type.indexOf(".") < 0) {
                return [type, ""];
            }
            var m = type.match(/([^.]+)?(\..+)?$/),
                t = m[1],
                ret = [t],
                gs = m[2];
            if (gs) {
                gs = gs.split(".").sort();
                ret.push(gs.join("."));
            } else {
                ret.push("");
            }
            return ret;
        },
        getGroupsRe:function (groups) {
            return new RegExp(groups.split(".").join(".*\\.") + "(?:\\.|$)");
        }
    };

}, {
    requires:['dom']
});/**
 * @fileOverview  inspired by yui3 :
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
KISSY.add('event/valuechange', function (S, Event, DOM, special) {
    var VALUE_CHANGE = "valuechange",
        nodeName = DOM._nodeName,
        KEY = "event/valuechange",
        HISTORY_KEY = KEY + "/history",
        POLL_KEY = KEY + "/poll",
        interval = 50;

    function clearPollTimer(target) {
        if (DOM.hasData(target, POLL_KEY)) {
            var poll = DOM.data(target, POLL_KEY);
            clearTimeout(poll);
            DOM.removeData(target, POLL_KEY);
        }
    }

    function stopPoll(target) {
        DOM.removeData(target, HISTORY_KEY);
        clearPollTimer(target);
    }

    function stopPollHandler(ev) {
        clearPollTimer(ev.target);
    }

    function checkChange(target) {
        var v = target.value,
            h = DOM.data(target, HISTORY_KEY);
        if (v !== h) {
            // 只触发自己绑定的 handler
            Event.fire(target, VALUE_CHANGE, {
                prevVal:h,
                newVal:v
            }, true);
            DOM.data(target, HISTORY_KEY, v);
        }
    }

    function startPoll(target) {
        if (DOM.hasData(target, POLL_KEY)) {
            return;
        }
        DOM.data(target, POLL_KEY, setTimeout(function () {
            checkChange(target);
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

    function webkitSpeechChangeHandler(e) {
        checkChange(e.target);
    }

    function monitor(target) {
        unmonitored(target);
        Event.on(target, "blur", stopPollHandler);
        // fix #94
        // see note 2012-02-08
        Event.on(target, "webkitspeechchange", webkitSpeechChangeHandler);
        Event.on(target, "mousedown keyup keydown focus", startPollHandler);
    }

    function unmonitored(target) {
        stopPoll(target);
        Event.remove(target, "blur", stopPollHandler);
        Event.remove(target, "webkitspeechchange", webkitSpeechChangeHandler);
        Event.remove(target, "mousedown keyup keydown focus", startPollHandler);
    }

    special[VALUE_CHANGE] = {
        setup:function () {
            var target = this;
            if (nodeName(target, "input")
                || nodeName(target, "textarea")) {
                monitor(target);
            }
        },
        tearDown:function () {
            var target = this;
            unmonitored(target);
        }
    };
    return Event;
}, {
    requires:["./base", "dom", "./special"]
});

/**
 * 2012-02-08 yiminghe@gmail.com note about webkitspeechchange :
 *  当 input 没焦点立即点击语音
 *   -> mousedown -> blur -> focus -> blur -> webkitspeechchange -> focus
 *  第二次：
 *   -> mousedown -> blur -> webkitspeechchange -> focus
 **/
/*
Copyright 2012, KISSY UI Library v1.30dev
MIT Licensed
build time: Mar 23 12:19
*/
/**
 * @fileOverview adapt json2 to kissy
 */
KISSY.add('json', function (S, JSON) {

    return S.JSON = {

        parse:function (text) {
            // 当输入为 undefined / null / '' 时，返回 null
            if (text == null || text === '') {
                return null;
            }
            return JSON.parse(text);
        },

        stringify:JSON.stringify
    };
}, {
    requires:["json/json2"]
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
    var win = S.Env.host,JSON = win.JSON;
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
/*
Copyright 2012, KISSY UI Library v1.30dev
MIT Licensed
build time: Apr 9 11:47
*/
/**
 * @fileOverview form data  serialization util
 * @author  yiminghe@gmail.com
 */
KISSY.add("ajax/FormSerializer", function(S, DOM) {
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
            S.each(DOM.query(forms),function(el) {
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
});/**
 * @fileOverview non-refresh upload file with form by iframe
 * @author  yiminghe@gmail.com
 */
KISSY.add("ajax/IframeTransport", function (S, DOM, Event, io) {

    var doc = S.Env.host.document,
        OK_CODE = 200,
        ERROR_CODE = 500,
        BREATH_INTERVAL = 30;

    // iframe 内的内容就是 body.innerText
    io.setupConfig({
        converters:{
            // iframe 到其他类型的转化和 text 一样
            iframe:io.getConfig().converters.text,
            text:{
                iframe:function (text) {
                    return text;
                }
            }
        }
    });

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

    function IframeTransport(xhrObject) {
        this.xhrObject = xhrObject;
    }

    S.augment(IframeTransport, {
        send:function () {

            var self = this,
                xhrObject = self.xhrObject,
                c = xhrObject.config,
                fields,
                form = DOM.get(c.form);

            self.attrs = {
                target:DOM.attr(form, "target") || "",
                action:DOM.attr(form, "action") || ""
            };
            self.form = form;

            createIframe(xhrObject);

            // set target to iframe to avoid main page refresh
            DOM.attr(form, {
                "target":xhrObject.iframeId,
                "action":c.url
            });

            if (c.data) {
                fields = addDataToForm(c.data, form, c.serializeArray);
            }

            self.fields = fields;

            var iframe = xhrObject.iframe;

            Event.on(iframe, "load error", self._callback, self);

            form.submit();

        },

        _callback:function (event, abort) {
            //debugger
            var self=this,
                form = self.form,
                xhrObject = self.xhrObject,
                eventType = event.type,
                iframe = xhrObject.iframe;

            // 防止重复调用 , 成功后 abort
            if (!iframe) {
                return;
            }

            DOM.attr(form, self.attrs);

            if (eventType == "load") {
                var iframeDoc = iframe.contentWindow.document;
                xhrObject.responseXML = iframeDoc;
                xhrObject.responseText = DOM.text(iframeDoc.body);
                xhrObject._xhrReady(OK_CODE, "success");
            } else if (eventType == 'error') {
                xhrObject._xhrReady(ERROR_CODE, "error");
            }

            removeFieldsFromData(this.fields);

            Event.detach(iframe);

            setTimeout(function () {
                // firefox will keep loading if not settimeout
                DOM.remove(iframe);
            }, BREATH_INTERVAL);

            // nullify to prevent memory leak?
            xhrObject.iframe = null;
        },

        abort:function () {
            this._callback({}, 1);
        }
    });

    io.setupTransport("iframe", IframeTransport);

    return io;

}, {
    requires:["dom", "event", "./base"]
});/**
 * @fileOverview script transport for kissy io
 * @description: modified version of S.getScript , add abort ability
 * @author  yiminghe@gmail.com
 */
KISSY.add("ajax/ScriptTransport", function (S, io) {

    var win = S.Env.host,
        doc = win.document,
        OK_CODE = 200,
        ERROR_CODE = 500;

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
                script:function (text) {
                    S.globalEval(text);
                    return text;
                }
            }
        }
    });

    function ScriptTransport(xhrObj) {
        // 优先使用 xhr+eval 来执行脚本, ie 下可以探测到（更多）失败状态
        if (!xhrObj.config.crossDomain) {
            return new (io.getTransport("*"))(xhrObj);
        }
        this.xhrObj = xhrObj;
        return 0;
    }

    S.augment(ScriptTransport, {
        send:function () {
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
                    script.onreadystatechange = function (e) {
                        e = e || win.event;
                        // firefox onerror 没有 type ?!
                        self._callback((e.type || "error").toLowerCase());
                    };

            head.insertBefore(script, head.firstChild);
        },

        _callback:function (event, abort) {
            var script = this.script,
                xhrObj = this.xhrObj,
                head = this.head;

            // 防止重复调用,成功后 abort
            if (!script) {
                return;
            }

            if (
                abort ||
                    !script.readyState ||
                    /loaded|complete/.test(script.readyState) ||
                    event == "error"
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
                    xhrObj._xhrReady(OK_CODE, "success");
                }
                // 非 ie<9 可以判断出来
                else if (event == "error") {
                    xhrObj._xhrReady(ERROR_CODE, "scripterror");
                }
            }
        },

        abort:function () {
            this._callback(0, 1);
        }
    });

    io.setupTransport("script", ScriptTransport);

    return io;

}, {
    requires:['./base', './XhrTransport']
});/**
 * @fileOverview solve io between sub domains using proxy page
 * @author yiminghe@gmail.com
 */
KISSY.add("ajax/SubDomainTransport", function (S, XhrTransportBase, Event, DOM) {

    var rurl = /^([\w\+\.\-]+:)(?:\/\/([^\/?#:]*)(?::(\d+))?)?/,
        PROXY_PAGE = "/sub_domain_proxy.html",
        doc = S.Env.host.document,
        iframeMap = {
            // hostname:{iframe: , ready:}
        };

    function SubDomainTransport(xhrObj) {
        var self = this,
            c = xhrObj.config;
        self.xhrObj = xhrObj;
        var m = c.url.match(rurl);
        self.hostname = m[2];
        self.protocol = m[1];
        c.crossDomain = false;
    }


    S.augment(SubDomainTransport, XhrTransportBase.proto, {
        // get nativeXhr from iframe document
        // not from current document directly like XhrTransport
        send:function () {
            var self = this,
                c = self.xhrObj.config,
                hostname = self.hostname,
                iframe,
                iframeDesc = iframeMap[hostname];

            var proxy = PROXY_PAGE;

            if (c['xdr'] && c['xdr']['subDomain'] && c['xdr']['subDomain'].proxy) {
                proxy = c['xdr']['subDomain'].proxy;
            }

            if (iframeDesc && iframeDesc.ready) {
                self.nativeXhr = XhrTransportBase.nativeXhr(0, iframeDesc.iframe.contentWindow);
                if (self.nativeXhr) {
                    self.sendInternal();
                } else {
                    S.error("document.domain not set correctly!");
                }
                return;
            }

            if (!iframeDesc) {
                iframeDesc = iframeMap[hostname] = {};
                iframe = iframeDesc.iframe = doc.createElement("iframe");
                DOM.css(iframe, {
                    position:'absolute',
                    left:'-9999px',
                    top:'-9999px'
                });
                DOM.prepend(iframe, doc.body || doc.documentElement);
                iframe.src = self.protocol + "//" + hostname + proxy;
            } else {
                iframe = iframeDesc.iframe;
            }

            Event.on(iframe, "load", _onLoad, self);

        }
    });

    function _onLoad() {
        var self = this,
            hostname = self.hostname,
            iframeDesc = iframeMap[hostname];
        iframeDesc.ready = 1;
        Event.detach(iframeDesc.iframe, "load", _onLoad, self);
        self.send();
    }

    return SubDomainTransport;

}, {
    requires:['./XhrTransportBase', 'event', 'dom']
});/**
 * @fileOverview use flash to accomplish cross domain request , usage scenario ? why not jsonp ?
 * @author yiminghe@gmail.com
 */
KISSY.add("ajax/XdrFlashTransport", function (S, io, DOM) {

    var // current running request instances
        maps = {},
        ID = "io_swf",
        // flash transporter
        flash,
        doc = S.Env.host.document,
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
            '&host=KISSY.require(\'ajax\')" />' +
            '<param name="allowScriptAccess" value="always" />' +
            '</object>',
            c = doc.createElement('div');
        DOM.prepend(c, doc.body || doc.documentElement);
        c.innerHTML = o;
    }

    function XdrFlashTransport(xhrObj) {
        S.log("use flash xdr");
        this.xhrObj = xhrObj;
    }

    S.augment(XdrFlashTransport, {
        // rewrite send to support flash xdr
        send:function () {
            var self = this,
                xhrObj = self.xhrObj,
                c = xhrObj.config;
            var xdr = c['xdr'] || {};
            // 不提供则使用 cdn 默认的 flash
            _swf(xdr.src || (S.Config.base + "ajax/io.swf"), 1, 1);
            // 简便起见，用轮训
            if (!flash) {
                // S.log("detect xdr flash");
                setTimeout(function () {
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

        abort:function () {
            flash.abort(this._uid);
        },

        _xdrResponse:function (e, o) {
            S.log(e);
            var self = this,
                ret,
                xhrObj = self.xhrObj;

            // need decodeURI to get real value from flash returned value
            xhrObj.responseText = decodeURI(o.c.responseText);

            switch (e) {
                case 'success':
                    ret = { status:200, statusText:"success" };
                    delete maps[o.id];
                    break;
                case 'abort':
                    delete maps[o.id];
                    break;
                case 'timeout':
                case 'transport error':
                case 'failure':
                    delete maps[o.id];
                    ret = { status:500, statusText:e };
                    break;
            }
            if (ret) {
                xhrObj._xhrReady(ret.status, ret.statusText);
            }
        }
    });

    /*called by flash*/
    io['applyTo'] = function (_, cmd, args) {
        // S.log(cmd + " execute");
        var cmds = cmd.split(".").slice(1),
            func = io;
        S.each(cmds, function (c) {
            func = func[c];
        });
        func.apply(null, args);
    };

    // when flash is loaded
    io['xdrReady'] = function () {
        flash = doc.getElementById(ID);
    };

    /**
     * when response is returned from server
     * @param e response status
     * @param o internal data
     * @param c internal data
     */
    io['xdrResponse'] = function (e, o, c) {
        var xhr = maps[o.uid];
        xhr && xhr._xdrResponse(e, o, c);
    };

    return XdrFlashTransport;

}, {
    requires:["./base", 'dom']
});/**
 * @fileOverview encapsulation of io object . as transaction object in yui3
 * @author yiminghe@gmail.com
 */
KISSY.add("ajax/XhrObject", function (S, undefined) {

    var OK_CODE = 200,
        Promise = S.Promise,
        MULTIPLE_CHOICES = 300,
        NOT_MODIFIED = 304,
        // get individual response header from responseheader str
        rheaders = /^(.*?):[ \t]*([^\r\n]*)\r?$/mg;

    function handleResponseData(xhrObject) {

        // text xml 是否原生转化支持
        var text = xhrObject.responseText,
            xml = xhrObject.responseXML,
            c = xhrObject.config,
            cConverts = c.converters,
            xConverts = xhrObject.converters || {},
            type,
            responseData,
            contents = c.contents,
            dataType = c.dataType;

        // 例如 script 直接是js引擎执行，没有返回值，不需要自己处理初始返回值
        // jsonp 时还需要把 script 转换成 json，后面还得自己来
        if (text || xml) {

            var contentType = xhrObject.mimeType || xhrObject.getResponseHeader("Content-Type");

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
                // 看能否从 text xml 转换到合适数据，并设置起始类型为 text/xml
                S.each(["text", "xml"], function (prevType) {
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

        xhrObject.responseData = responseData;
    }

    /**
     * @class A class for constructing io request instances. !Do Not New By Yourself!
     * @extends KISSY.Promise
     * @memberOf IO
     */
    function XhrObject(c) {
        Promise.call(this);
        S.mix(this, {
            // 结构化数据，如 json
            responseData:null,
            config:c || {},
            timeoutTimer:null,

            /**
             * @field
             * @memberOf IO.XhrObject#
             * @description String typed data returned from server
             */
            responseText:null,
            /**
             * @field
             * @memberOf IO.XhrObject#
             * @description xml typed data returned from server
             */
            responseXML:null,
            responseHeadersString:"",
            responseHeaders:null,
            requestHeaders:{},
            /**
             * @field
             * @memberOf IO.XhrObject#
             * @description <br>
             * readyState of current request<br>
             * 0: initialized<br>
             * 1: send <br>
             * 4: completed<br>
             */
            readyState:0,
            state:0,
            /**
             * @field
             * @memberOf IO.XhrObject#
             * @description HTTP statusText of current request
             */
            statusText:null,
            /**
             * @field
             * @memberOf IO.XhrObject#
             * @description <br> HTTP Status Code of current request <br>
             * eg:<br>
             * 200 : ok<br>
             * 404 : Not Found<br>
             * 500 : Server Error<br>
             */
            status:0,
            transport:null,
            _defer:new S.Defer(this)
        });
    }

    S.extend(XhrObject, Promise,
        /**
         * @lends IO.XhrObject.prototype
         */
        {
            // Caches the header
            setRequestHeader:function (name, value) {
                var self = this;
                self.requestHeaders[ name ] = value;
                return self;
            },

            /**
             * get all response headers as string after request is completed
             * @returns {String}
             */
            getAllResponseHeaders:function () {
                var self = this;
                return self.state === 2 ? self.responseHeadersString : null;
            },

            /**
             * get header value in response to specified header name
             * @param {String} name header name
             * @return {String} header value
             */
            getResponseHeader:function (name) {
                var match, self = this;
                if (self.state === 2) {
                    if (!self.responseHeaders) {
                        self.responseHeaders = {};
                        while (( match = rheaders.exec(self.responseHeadersString) )) {
                            self.responseHeaders[ match[1] ] = match[ 2 ];
                        }
                    }
                    match = self.responseHeaders[ name ];
                }
                return match === undefined ? null : match;
            },

            // Overrides response content-type header
            overrideMimeType:function (type) {
                var self = this;
                if (!self.state) {
                    self.mimeType = type;
                }
                return self;
            },

            /**
             * cancel this request
             * @param {String} [statusText=abort] error reason as current request object's statusText
             */
            abort:function (statusText) {
                var self = this;
                statusText = statusText || "abort";
                if (self.transport) {
                    self.transport.abort(statusText);
                }
                self._xhrReady(0, statusText);
                return self;
            },

            /**
             * get native XMLHttpRequest
             * @since 1.3
             */
            getNativeXhr:function () {
                var transport;
                if (transport = this.transport) {
                    return transport.nativeXhr;
                }
            },

            _xhrReady:function (status, statusText) {
                var self = this;
                // 只能执行一次，防止重复执行
                // 例如完成后，调用 abort

                // 到这要么成功，调用success
                // 要么失败，调用 error
                // 最终都会调用 complete
                if (self.state == 2) {
                    return;
                }
                self.state = 2;
                self.readyState = 4;
                var isSuccess;
                if (status >= OK_CODE && status < MULTIPLE_CHOICES || status == NOT_MODIFIED) {

                    if (status == NOT_MODIFIED) {
                        statusText = "notmodified";
                        isSuccess = true;
                    } else {
                        try {
                            handleResponseData(self);
                            statusText = "success";
                            isSuccess = true;
                        } catch (e) {
                            statusText = "parsererror : " + e;
                        }
                    }

                } else {
                    if (status < 0) {
                        status = 0;
                    }
                }

                self.status = status;
                self.statusText = statusText;

                var defer = self._defer;
                defer[isSuccess ? "resolve" : "reject"]([self.responseData, self.statusText, self]);
            }
        }
    );

    return XhrObject;
});/**
 * @fileOverview ajax xhr transport class , route subdomain , xdr
 * @author yiminghe@gmail.com
 */
KISSY.add("ajax/XhrTransport", function (S, io, XhrTransportBase, SubDomainTransport, XdrFlashTransport, undefined) {

    var rurl = /^([\w\+\.\-]+:)(?:\/\/([^\/?#:]*)(?::(\d+))?)?/,
        win = S.Env.host,
        _XDomainRequest = win['XDomainRequest'],
        detectXhr = XhrTransportBase.nativeXhr();

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
                    return new SubDomainTransport(xhrObj);
                }

                /**
                 * ie>7 强制使用 flash xdr
                 * 使用 withCredentials 检测是否支持 CORS
                 * http://hacks.mozilla.org/2009/07/cross-site-xmlhttprequest-with-cors/
                 */
                if (!("withCredentials" in detectXhr) &&
                    (String(xdrCfg.use) === "flash" || !_XDomainRequest)) {
                    return new XdrFlashTransport(xhrObj);
                }
            }

            this.xhrObj = xhrObj;
            this.nativeXhr = XhrTransportBase.nativeXhr(c.crossDomain);
            return undefined;
        }

        S.augment(XhrTransport, XhrTransportBase.proto, {

            send:function () {
                this.sendInternal();
            }

        });

        io.setupTransport("*", XhrTransport);
    }

    return io;
}, {
    requires:["./base", './XhrTransportBase', './SubDomainTransport', "./XdrFlashTransport"]
});

/**
 * 借鉴 jquery，优化使用原型替代闭包
 * CORS : http://www.nczonline.net/blog/2010/05/25/cross-domain-ajax-with-cross-origin-resource-sharing/
 **//**
 * @fileOverview base for xhr and subdomain
 * @author yiminghe@gmail.com
 */
KISSY.add("ajax/XhrTransportBase", function (S, io) {
    var OK_CODE = 200,
        win = S.Env.host,
        // http://msdn.microsoft.com/en-us/library/cc288060(v=vs.85).aspx
        _XDomainRequest = win['XDomainRequest'],
        NO_CONTENT_CODE = 204,
        NOT_FOUND_CODE = 404,
        NO_CONTENT_CODE2 = 1223,
        XhrTransportBase = {
            proto:{}
        };

    function createStandardXHR(_, refWin) {
        try {
            return new (refWin || win)['XMLHttpRequest']();
        } catch (e) {
            //S.log("createStandardXHR error");
        }
        return undefined;
    }

    function createActiveXHR(_, refWin) {
        try {
            return new (refWin || win)['ActiveXObject']("Microsoft.XMLHTTP");
        } catch (e) {
            S.log("createActiveXHR error");
        }
        return undefined;
    }

    XhrTransportBase.nativeXhr = win['ActiveXObject'] ? function (crossDomain, refWin) {
        if (crossDomain && _XDomainRequest) {
            return new _XDomainRequest();
        }
        // ie7 XMLHttpRequest 不能访问本地文件
        return !io.isLocal && createStandardXHR(crossDomain, refWin) || createActiveXHR(crossDomain, refWin);
    } : createStandardXHR;

    function isInstanceOfXDomainRequest(xhr) {
        return _XDomainRequest && (xhr instanceof _XDomainRequest);
    }

    S.mix(XhrTransportBase.proto, {
        sendInternal:function () {

            var self = this,
                xhrObj = self.xhrObj,
                c = xhrObj.config;

            var nativeXhr = self.nativeXhr,
                xhrFields,
                i;

            if (c['username']) {
                nativeXhr.open(c.type, c.url, c.async, c['username'], c.password)
            } else {
                nativeXhr.open(c.type, c.url, c.async);
            }

            if (xhrFields = c['xhrFields']) {
                for (i in xhrFields) {
                    if (xhrFields.hasOwnProperty(i)) {
                        nativeXhr[ i ] = xhrFields[ i ];
                    }
                }
            }

            // Override mime type if supported
            if (xhrObj.mimeType && nativeXhr.overrideMimeType) {
                nativeXhr.overrideMimeType(xhrObj.mimeType);
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
                        nativeXhr.setRequestHeader(i, xhrObj.requestHeaders[ i ]);
                    }
                }
            } catch (e) {
                S.log("setRequestHeader in xhr error : ");
                S.log(e);
            }

            nativeXhr.send(c.hasContent && c.data || null);

            if (!c.async || nativeXhr.readyState == 4) {
                self._callback();
            } else {
                // _XDomainRequest 单独的回调机制
                if (isInstanceOfXDomainRequest(nativeXhr)) {
                    nativeXhr.onload = function () {
                        nativeXhr.readyState = 4;
                        nativeXhr.status = 200;
                        self._callback();
                    };
                    nativeXhr.onerror = function () {
                        nativeXhr.readyState = 4;
                        nativeXhr.status = 500;
                        self._callback();
                    };
                } else {
                    nativeXhr.onreadystatechange = function () {
                        self._callback();
                    };
                }
            }
        },
        // 由 xhrObj.abort 调用，自己不可以调用 xhrObj.abort
        abort:function () {
            this._callback(0, 1);
        },

        _callback:function (event, abort) {
            // Firefox throws exceptions when accessing properties
            // of an xhr when a network error occured
            // http://helpful.knobs-dials.com/index.php/Component_returned_failure_code:_0x80040111_(NS_ERROR_NOT_AVAILABLE)
            try {
                var self = this,
                    nativeXhr = self.nativeXhr,
                    xhrObj = self.xhrObj,
                    c = xhrObj.config;
                //abort or complete
                if (abort || nativeXhr.readyState == 4) {

                    // ie6 ActiveObject 设置不恰当属性导致出错
                    if (isInstanceOfXDomainRequest(nativeXhr)) {
                        nativeXhr.onerror = S.noop;
                        nativeXhr.onload = S.noop;
                    } else {
                        // ie6 ActiveObject 只能设置，不能读取这个属性，否则出错！
                        nativeXhr.onreadystatechange = S.noop;
                    }

                    if (abort) {
                        // 完成以后 abort 不要调用
                        if (nativeXhr.readyState !== 4) {
                            nativeXhr.abort();
                        }
                    } else {
                        var status = nativeXhr.status;

                        // _XDomainRequest 不能获取响应头
                        if (!isInstanceOfXDomainRequest(nativeXhr)) {
                            xhrObj.responseHeadersString = nativeXhr.getAllResponseHeaders();
                        }

                        var xml = nativeXhr.responseXML;

                        // Construct response list
                        if (xml && xml.documentElement /* #4958 */) {
                            xhrObj.responseXML = xml;
                        }
                        xhrObj.responseText = nativeXhr.responseText;

                        // Firefox throws an exception when accessing
                        // statusText for faulty cross-domain requests
                        try {
                            var statusText = nativeXhr.statusText;
                        } catch (e) {
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

                        xhrObj._xhrReady(status, statusText);
                    }
                }
            } catch (firefoxAccessException) {
                S.log(firefoxAccessException, "error");
                nativeXhr.onreadystatechange = S.noop;
                if (!abort) {
                    xhrObj._xhrReady(-1, firefoxAccessException);
                }
            }
        }
    });

    return XhrTransportBase;
}, {
    requires:['./base']
});/**
 * @fileOverview io shortcut
 * @author yiminghe@gmail.com
 */
KISSY.add("ajax", function (S, serializer, IO, XhrObject) {
    var undef = undefined;

    function get(url, data, callback, dataType, _t) {
        // data 参数可省略
        if (S.isFunction(data)) {
            dataType = callback;
            callback = data;
            data = undef;
        }

        return IO({
            type:_t || "get",
            url:url,
            data:data,
            success:callback,
            dataType:dataType
        });
    }

    // some shortcut
    S.mix(IO,

        /**
         * @lends IO
         */
        {
            XhrObject:XhrObject,
            /**
             * form serialization
             * @function
             * @param formElement {HTMLElement[]|HTMLElement|NodeList} form elements
             * @returns {String} serialized string represent form elements
             */
            serialize:serializer.serialize,

            /**
             * perform a get request
             * @function
             * @param {String} url request destination
             * @param {Object} [data] name-value object associated with this request
             * @param {Function()} callback <br/>
             * success callback when this request is done
             * with parameter <br/>
             * 1. data returned from this request with type specified by dataType <br/>
             * 2. status of this request with type String <br/>
             * 3. XhrObject of this request , for details {@link IO.XhrObject}
             * @param {String} [dataType] the type of data returns from this request
             * ("xml" or "json" or "text")
             * @returns {IO.XhrObject}
             */
            get:get,

            /**
             * preform a post request
             * @param {String} url request destination
             * @param {Object} [data] name-value object associated with this request
             * @param {Function()} callback <br/>
             * success callback when this request is done<br/>
             * with parameter<br/>
             * 1. data returned from this request with type specified by dataType<br/>
             * 2. status of this request with type String<br/>
             * 3. XhrObject of this request , for details {@link IO.XhrObject}
             * @param {String} [dataType] the type of data returns from this request
             * ("xml" or "json" or "text")
             * @returns {IO.XhrObject}
             */
            post:function (url, data, callback, dataType) {
                if (S.isFunction(data)) {
                    dataType = callback;
                    callback = data;
                    data = undef;
                }
                return get(url, data, callback, dataType, "post");
            },

            /**
             * preform a jsonp request
             * @param {String} url request destination
             * @param {Object} [data] name-value object associated with this request
             * @param {Function()} callback
             *  <br/>success callback when this request is done<br/>
             * with parameter<br/>
             * 1. data returned from this request with type specified by dataType<br/>
             * 2. status of this request with type String<br/>
             * 3. XhrObject of this request , for details {@link IO.XhrObject}
             * @returns {IO.XhrObject}
             */
            jsonp:function (url, data, callback) {
                if (S.isFunction(data)) {
                    callback = data;
                    data = undef;
                }
                return get(url, data, callback, "jsonp");
            },

            // 和 S.getScript 保持一致
            // 更好的 getScript 可以用
            /*
             IO({
             dataType:'script'
             });
             */
            getScript:S.getScript,

            /**
             * perform a get request to fetch json data from server
             * @param {String} url request destination
             * @param {Object} [data] name-value object associated with this request
             * @param {Function()} callback  <br/>success callback when this request is done<br/>
             * with parameter<br/>
             * 1. data returned from this request with type JSON<br/>
             * 2. status of this request with type String<br/>
             * 3. XhrObject of this request , for details {@link IO.XhrObject}
             * @returns {IO.XhrObject}
             */
            getJSON:function (url, data, callback) {
                if (S.isFunction(data)) {
                    callback = data;
                    data = undef;
                }
                return get(url, data, callback, "json");
            },

            /**
             * submit form without page refresh
             * @param {String} url request destination
             * @param {HTMLElement|NodeList} form element tobe submited
             * @param {Object} [data] name-value object associated with this request
             * @param {Function()} callback  <br/>success callback when this request is done<br/>
             * with parameter<br/>
             * 1. data returned from this request with type specified by dataType<br/>
             * 2. status of this request with type String<br/>
             * 3. XhrObject of this request , for details {@link IO.XhrObject}
             * @param {String} [dataType] the type of data returns from this request
             * ("xml" or "json" or "text")
             * @returns {IO.XhrObject}
             */
            upload:function (url, form, data, callback, dataType) {
                if (S.isFunction(data)) {
                    dataType = callback;
                    callback = data;
                    data = undef;
                }
                return IO({
                    url:url,
                    type:'post',
                    dataType:dataType,
                    form:form,
                    data:data,
                    success:callback
                });
            }
        });

    S.mix(S, {
        "Ajax":IO,
        "IO":IO,
        ajax:IO,
        io:IO,
        jsonp:IO.jsonp
    });

    return IO;
}, {
    requires:[
        "ajax/FormSerializer",
        "ajax/base",
        "ajax/XhrObject",
        "ajax/XhrTransport",
        "ajax/ScriptTransport",
        "ajax/jsonp",
        "ajax/form",
        "ajax/IframeTransport"]
});/**
 * @fileOverview a scalable client io framework
 * @author  yiminghe@gmail.com
 */
KISSY.add("ajax/base", function (S, JSON, Event, XhrObject, undefined) {

    var rlocalProtocol = /^(?:about|app|app\-storage|.+\-extension|file|widget):$/,
        rspace = /\s+/,
        rurl = /^([\w\+\.\-]+:)(?:\/\/([^\/?#:]*)(?::(\d+))?)?/,
        mirror = function (s) {
            return s;
        },
        HTTP_PORT = 80,
        HTTPS_PORT = 443,
        rnoContent = /^(?:GET|HEAD)$/,
        curLocation,
        doc = S.Env.host.document,
        curLocationParts;

    try {
        curLocation = location.href;
    } catch (e) {
        S.log("ajax/base get curLocation error : ");
        S.log(e);
        // Use the href attribute of an A element
        // since IE will modify it given document.location
        curLocation = doc.createElement("a");
        curLocation.href = "";
        curLocation = curLocation.href;
    }

    // fix on nodejs , curLocation == "/xx/yy/kissy-nodejs.js"
    curLocationParts = rurl.exec(curLocation) || ["", "", "", ""];

    var isLocal = rlocalProtocol.test(curLocationParts[1]),
        transports = {},
        defaultConfig = {
            type:"GET",
            contentType:"application/x-www-form-urlencoded; charset=UTF-8",
            async:true,
            serializeArray:true,
            processData:true,
            accepts:{
                xml:"application/xml, text/xml",
                html:"text/html",
                text:"text/plain",
                json:"application/json, text/javascript",
                "*":"*/*"
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
        // deep mix,exclude context!
        var context = c.context;
        delete c.context;
        c = S.mix(S.clone(defaultConfig), c || {}, undefined, undefined, true);
        c.context = context;

        if (!("crossDomain" in c)) {
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

        // fix #90 ie7 about "//x.htm"
        c.url = c.url.replace(/^\/\//, curLocationParts[1] + "//");
        c.type = c.type.toUpperCase();
        c.hasContent = !rnoContent.test(c.type);

        // 数据类型处理链，一步步将前面的数据类型转化成最后一个
        c.dataType = S.trim(c.dataType || "*").split(rspace);

        if (!("cache" in c) && S.inArray(c.dataType[0], ["script", "jsonp"])) {
            c.cache = false;
        }

        if (!c.hasContent) {
            if (c.data) {
                c.url += ( /\?/.test(c.url) ? "&" : "?" ) + c.data;
                delete c.data;
            }
            if (c.cache === false) {
                c.url += ( /\?/.test(c.url) ? "&" : "?" ) + "_ksTS=" + (S.now() + "_" + S.guid());
            }
        }

        c.context = c.context || c;
        return c;
    }

    function fire(eventType, xhrObject) {
        /**
         * @name IO#complete
         * @description fired after request completes (success or error)
         * @event
         * @param {Event.Object} e
         * @param {Object} e.ajaxConfig current request 's config
         * @param {IO.XhrObject} e.xhr current xhr object
         */

        /**
         * @name IO#success
         * @description  fired after request succeeds
         * @event
         * @param {Event.Object} e
         * @param {Object} e.ajaxConfig current request 's config
         * @param {IO.XhrObject} e.xhr current xhr object
         */

        /**
         * @name IO#error
         * @description fired after request occurs error
         * @event
         * @param {Event.Object} e
         * @param {Object} e.ajaxConfig current request 's config
         * @param {IO.XhrObject} e.xhr current xhr object
         */
        io.fire(eventType, { ajaxConfig:xhrObject.config, xhr:xhrObject});
    }

    /**
     * @name IO
     * @namespace Provides utility that brokers HTTP requests through a simplified interface
     * @function
     *
     * @param {Object} c <br/>name-value of object to config this io request.<br/>
     *  all values are optional.<br/>
     *  default value can be set through {@link io.setupConfig}<br/>
     *
     * @param {String} c.url <br/>request destination
     *
     * @param {String} c.type <br/>request type.
     * eg: "get","post"<br/>
     * Default: "get"<br/>
     *
     * @param {String} c.contentType <br/>
     * Default: "application/x-www-form-urlencoded; charset=UTF-8"<br/>
     * Data will always be transmitted to the server using UTF-8 charset<br/>
     *
     * @param {Object} c.accepts <br/>
     * Default: depends on DataType.<br/>
     * The content type sent in request header that tells the server<br/>
     * what kind of response it will accept in return.<br/>
     * It is recommended to do so once in the {@link io.setupConfig}
     *
     * @param {Boolean} c.async <br/>
     * Default: true<br/>
     * whether request is sent asynchronously<br/>
     *
     * @param {Boolean} c.cache <br/>
     * Default: true ,false for dataType "script" and "jsonp"<br/>
     * if set false,will append _ksTs=Date.now() to url automatically<br/>
     *
     * @param {Object} c.contents <br/>
     * a name-regexp map to determine request data's dataType<br/>
     * It is recommended to do so once in the {@link io.setupConfig}<br/>
     *
     * @param {Object} c.context <br/>
     * specify the context of this request's callback (success,error,complete)
     *
     * @param {Object} c.converters <br/>
     * Default:{text:{json:JSON.parse,html:mirror,text:mirror,xml:KISSY.parseXML}}<br/>
     * specified how to transform one dataType to another dataType<br/>
     * It is recommended to do so once in the {@link io.setupConfig}
     *
     * @param {Boolean} c.crossDomain <br/>
     * Default: false for same-domain request,true for cross-domain request<br/>
     * if server-side jsonp redirect to another domain ,you should set this to true
     *
     * @param {Object} c.data <br/>
     * Data sent to server.if processData is true,data will be serialized to String type.<br/>
     * if value if an Array, serialization will be based on serializeArray.
     *
     * @param {String} c.dataType <br/>
     * return data as a specified type<br/>
     * Default: Based on server contentType header<br/>
     * "xml" : a XML document<br/>
     * "text"/"html": raw server data <br/>
     * "script": evaluate the return data as script<br/>
     * "json": parse the return data as json and return the result as final data<br/>
     * "jsonp": load json data via jsonp
     *
     * @param {Object} c.headers <br/>
     * additional name-value header to send along with this request.
     *
     * @param {String} c.jsonp <br/>
     * Default: "callback"<br/>
     * Override the callback function name in a jsonp request. eg:<br/>
     * set "callback2" , then jsonp url will append  "callback2=?".
     *
     * @param {String} c.jsonpCallback <br/>
     * Specify the callback function name for a jsonp request.<br/>
     * set this value will replace the auto generated function name.<br/>
     * eg:<br/>
     * set "customCall" , then jsonp url will append "callback=customCall"
     *
     * @param {String} c.mimeType <br/>
     * override xhr's mime type
     *
     * @param {Boolean} c.processData <br/>
     * Default: true<br/>
     * whether data will be serialized as String
     *
     * @param {String} c.scriptCharset <br/>
     * only for dataType "jsonp" and "script" and "get" type.<br/>
     * force the script to certain charset.
     *
     * @param {Function} c.beforeSend <br/>
     * beforeSend(xhrObject,config)<br/>
     * callback function called before the request is sent.this function has 2 arguments<br/>
     * 1. current KISSY xhrObject<br/>
     * 2. current io config<br/>
     * note: can be used for add progress event listener for native xhr's upload attribute
     * see <a href="http://www.w3.org/TR/XMLHttpRequest/#event-xhr-progress">XMLHttpRequest2</a>
     *
     * @param {Function} c.success <br/>
     * success(data,textStatus,xhr)<br/>
     * callback function called if the request succeeds.this function has 3 arguments<br/>
     * 1. data returned from this request with type specified by dataType<br/>
     * 2. status of this request with type String<br/>
     * 3. XhrObject of this request , for details {@link IO.XhrObject}
     *
     * @param {Function} c.error <br/>
     * success(data,textStatus,xhr) <br/>
     * callback function called if the request occurs error.this function has 3 arguments<br/>
     * 1. null value<br/>
     * 2. status of this request with type String,such as "timeout","Not Found","parsererror:..."<br/>
     * 3. XhrObject of this request , for details {@link IO.XhrObject}
     *
     * @param {Function} c.complete <br/>
     * success(data,textStatus,xhr)<br/>
     * callback function called if the request finished(success or error).this function has 3 arguments<br/>
     * 1. null value if error occurs or data returned from server<br/>
     * 2. status of this request with type String,such as success:"ok",
     * error:"timeout","Not Found","parsererror:..."<br/>
     * 3. XhrObject of this request , for details {@link IO.XhrObject}
     *
     * @param {Number} c.timeout <br/>
     * Set a timeout(in seconds) for this request.if will call error when timeout
     *
     * @param {Boolean} c.serializeArray <br/>
     * whether add [] to data's name when data's value is array in serialization
     *
     * @param {Object} c.xhrFields <br/>
     * name-value to set to native xhr.set as xhrFields:{withCredentials:true}
     *
     * @param {String} c.username <br/>
     * a username tobe used in response to HTTP access authentication request
     *
     * @param {String} c.password <br/>
     * a password tobe used in response to HTTP access authentication request
     *
     * @param {Object} c.xdr <br/>
     * cross domain request config object
     *
     * @param {String} c.xdr.src <br/>
     * Default: kissy's flash url
     * flash sender url
     *
     * @param {String} c.xdr.use <br/>
     * if set to "use", it will always use flash for cross domain request even in chrome/firefox
     *
     * @param {Object} c.xdr.subDomain <br/>
     * cross sub domain request config object
     *
     * @param {String} c.xdr.subDomain.proxy <br/>
     * proxy page,eg:<br/>
     * a.t.cn/a.htm send request to b.t.cn/b.htm: <br/>
     * 1. a.htm set document.domain='t.cn'<br/>
     * 2. b.t.cn/proxy.htm 's content is &lt;script>document.domain='t.cn'&lt;/script><br/>
     * 3. in a.htm , call io({xdr:{subDomain:{proxy:'/proxy.htm'}}})
     *
     * @returns {IO.XhrObject} current request object
     */
    function io(c) {

        if (!c.url) {
            return undefined;
        }

        c = setUpConfig(c);

        var xhrObject = new XhrObject(c);

        /**
         * @name IO#start
         * @description fired before generating request object
         * @event
         * @param {Event.Object} e
         * @param {Object} e.ajaxConfig current request 's config
         * @param {IO.XhrObject} e.xhr current xhr object
         */

        fire("start", xhrObject);

        var transportContructor = transports[c.dataType[0]] || transports["*"],
            transport = new transportContructor(xhrObject);
        xhrObject.transport = transport;

        if (c.contentType) {
            xhrObject.setRequestHeader("Content-Type", c.contentType);
        }
        var dataType = c.dataType[0],
            accepts = c.accepts;
        // Set the Accepts header for the server, depending on the dataType
        xhrObject.setRequestHeader(
            "Accept",
            dataType && accepts[dataType] ?
                accepts[ dataType ] + (dataType === "*" ? "" : ", */*; q=0.01"  ) :
                accepts[ "*" ]
        );

        // Check for headers option
        for (var i in c.headers) {
            xhrObject.setRequestHeader(i, c.headers[ i ]);
        }


        // allow setup native listener
        // such as xhr.upload.addEventListener('progress', function (ev) {})
        if (c.beforeSend && ( c.beforeSend.call(c.context || c, xhrObject, c) === false)) {
            return undefined;
        }

        function genHandler(handleStr) {
            return function (v) {
                if (xhrObject.timeoutTimer) {
                    clearTimeout(xhrObject.timeoutTimer);
                    xhrObject.timeoutTimer = 0;
                }
                var h = c[handleStr];
                h && h.apply(c.context, v);
                fire(handleStr, xhrObject);
            };
        }

        xhrObject.then(genHandler("success"), genHandler("error"));

        xhrObject.fin(genHandler("complete"));

        xhrObject.readyState = 1;

        /**
         * @name IO#send
         * @description fired before sending request
         * @event
         * @param {Event.Object} e
         * @param {Object} e.ajaxConfig current request 's config
         * @param {IO.XhrObject} e.xhr current xhr object
         */

        fire("send", xhrObject);

        // Timeout
        if (c.async && c.timeout > 0) {
            xhrObject.timeoutTimer = setTimeout(function () {
                xhrObject.abort("timeout");
            }, c.timeout * 1000);
        }

        try {
            // flag as sending
            xhrObject.state = 1;
            transport.send();
        } catch (e) {
            // Propagate exception as error if not done
            if (xhrObject.state < 2) {
                xhrObject._xhrReady(-1, e);
                // Simply rethrow otherwise
            } else {
                S.error(e);
            }
        }

        return xhrObject;
    }

    S.mix(io, Event.Target);

    S.mix(io,
        /**
         * @lends IO
         */
        {
            /**
             * whether current application is a local application
             * (protocal is file://,widget://,about://)
             * @type Boolean
             * @field
             */
            isLocal:isLocal,
            /**
             * name-value object that set default config value for io request
             * @param {Object} setting for details see {@link io}
             */
            setupConfig:function (setting) {
                S.mix(defaultConfig, setting, undefined, undefined, true);
            },
            /**
             * @private
             */
            setupTransport:function (name, fn) {
                transports[name] = fn;
            },
            /**
             * @private
             */
            getTransport:function (name) {
                return transports[name];
            },
            /**
             * get default config value for io request
             * @returns {Object}
             */
            getConfig:function () {
                return defaultConfig;
            }
        });

    return io;
}, {
    requires:["json", "event", "./XhrObject"]
});

/**
 * 2012-2-07 yiminghe@gmail.com:
 *
 *  返回 Promise 类型对象，可以链式操作啦！
 *
 * 借鉴 jquery，优化减少闭包使用
 *
 * TODO:
 *  ifModified mode 是否需要？
 *  优点：
 *      不依赖浏览器处理，ajax 请求浏览不会自动加 If-Modified-Since If-None-Match ??
 *  缺点：
 *      内存占用
 **//**
 * @fileOverview process form config
 * @author yiminghe@gmail.com
 */
KISSY.add("ajax/form", function(S, io, DOM, FormSerializer) {

    io.on("start", function(e) {
        var xhrObject = e.xhr,
            c = xhrObject.config;
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
        requires:['./base',"dom","./FormSerializer"]
    });/**
 * @fileOverview jsonp transport based on script transport
 * @author  yiminghe@gmail.com
 */
KISSY.add("ajax/jsonp", function (S, io) {
    var win = S.Env.host;
    io.setupConfig({
        jsonp:"callback",
        jsonpCallback:function () {
            // 不使用 now() ，极端情况下可能重复
            return S.guid("jsonp");
        }
    });

    io.on("start", function (e) {
        var xhrObject = e.xhr,
            c = xhrObject.config;
        if (c.dataType[0] == "jsonp") {
            var response,
                cJsonpCallback = c.jsonpCallback,
                jsonpCallback = S.isFunction(cJsonpCallback) ?
                    cJsonpCallback() :
                    cJsonpCallback,
                previous = win[ jsonpCallback ];

            c.url += ( /\?/.test(c.url) ? "&" : "?" ) + c.jsonp + "=" + jsonpCallback;

            // build temporary JSONP function
            win[jsonpCallback] = function (r) {
                // 使用数组，区别：故意调用了 jsonpCallback(undefined) 与 根本没有调用
                // jsonp 返回了数组
                if (arguments.length > 1) {
                    r = S.makeArray(arguments);
                }
                response = [r];
            };

            // cleanup whether success or failure
            xhrObject.fin(function () {
                win[ jsonpCallback ] = previous;
                if (previous === undefined) {
                    try {
                        delete win[ jsonpCallback ];
                    } catch (e) {
                        //S.log("delete window variable error : ");
                        //S.log(e);
                    }
                } else if (response) {
                    // after io success handler called
                    // then call original existed jsonpcallback
                    previous(response[0]);
                }
            });

            xhrObject.converters = xhrObject.converters || {};
            xhrObject.converters.script = xhrObject.converters.script || {};

            // script -> jsonp ,jsonp need to see json not as script
            // if ie onload a 404 file or all browsers onload an invalid script
            // 404/invalid will be caught here
            // because response is undefined( jsonp callback is never called)
            // error throwed will be caught in conversion step
            // and KISSY will notify user by error callback
            xhrObject.converters.script.json = function () {
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
/*
Copyright 2012, KISSY UI Library v1.30dev
MIT Licensed
build time: Mar 23 12:19
*/
/**
 * @fileOverview   cookie
 * @author  lifesinger@gmail.com
 */
KISSY.add('cookie', function (S) {

    /**
     * @name Cookie
     * @namespace Provide Cookie utilities.
     */

    var doc = S.Env.host.document,
        MILLISECONDS_OF_DAY = 24 * 60 * 60 * 1000,
        encode = encodeURIComponent,
        decode = decodeURIComponent;


    function isNotEmptyString(val) {
        return S.isString(val) && val !== '';
    }

    return S.Cookie =
    /**
     * @lends Cookie
     */
    {

        /**
         * Returns the cookie value for given name
         * @return {String} name The name of the cookie to retrieve
         */
        get:function (name) {
            var ret, m;

            if (isNotEmptyString(name)) {
                if ((m = String(doc.cookie).match(
                    new RegExp('(?:^| )' + name + '(?:(?:=([^;]*))|;|$)')))) {
                    ret = m[1] ? decode(m[1]) : '';
                }
            }
            return ret;
        },

        /**
         * Set a cookie with a given name and value
         * @param {String} name The name of the cookie to set
         * @param {String} val The value to set for cookie
         * @param {Number|Date} expires
         * if Number secified how many days this cookie will expire
         * @param {String} domain set cookie's domain
         * @param {String} path set cookie's path
         * @param {Boolean} secure whether this cookie can only be sent to server on https
         */
        set:function (name, val, expires, domain, path, secure) {
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

            doc.cookie = name + '=' + text;
        },

        /**
         * Remove a cookie from the machine by setting its expiration date to sometime in the past
         * @param {String} name The name of the cookie to remove.
         * @param {String} domain The cookie's domain
         * @param {String} path The cookie's path
         * @param {String} secure The cookie's secure option
         */
        remove:function (name, domain, path, secure) {
            this.set(name, '', -1, domain, path, secure);
        }
    };

});

/**
 *  2012.02.14 yiminghe@gmail.com
 *   - jsdoc added
 *
 *  2010.04
 *   - get 方法要考虑 ie 下，
 *     值为空的 cookie 为 'test3; test3=3; test3tt=2; test1=t1test3; test3', 没有等于号。
 *     除了正则获取，还可以 split 字符串的方式来获取。
 *   - api 设计上，原本想借鉴 jQuery 的简明风格：S.cookie(name, ...), 但考虑到可扩展性，目前
 *     独立成静态工具类的方式更优。
 */
/*
Copyright 2012, KISSY UI Library v1.30dev
MIT Licensed
build time: Mar 23 12:19
*/
/**
 * @fileOverview attribute management
 * @author  yiminghe@gmail.com, lifesinger@gmail.com
 */
KISSY.add('base/attribute', function (S, undef) {

    // atomic flag
    Attribute.INVALID = {};

    var INVALID = Attribute.INVALID;

    /**
     *
     * @param host
     * @param method
     * @return method if fn or host[method]
     */
    function normalFn(host, method) {
        if (S.isString(method)) {
            return host[method];
        }
        return method;
    }


    /**
     * fire attribute value change
     */
    function __fireAttrChange(self, when, name, prevVal, newVal, subAttrName, attrName) {
        attrName = attrName || name;
        return self.fire(when + capitalFirst(name) + 'Change', {
            attrName:attrName,
            subAttrName:subAttrName,
            prevVal:prevVal,
            newVal:newVal
        });
    }


    /**
     *
     * @param obj
     * @param name
     * @param [create]
     * @return non-empty property value of obj
     */
    function ensureNonEmpty(obj, name, create) {
        var ret = obj[name] || {};
        if (create) {
            obj[name] = ret;
        }
        return ret;
    }

    /**
     *
     * @param self
     * @return non-empty attr config holder
     */
    function getAttrs(self) {
        /**
         * attribute meta information
         {
         attrName: {
         getter: function,
         setter: function,
         // 注意：只能是普通对象以及系统内置类型，而不能是 new Xx()，否则用 valueFn 替代
         value: v, // default value
         valueFn: function
         }
         }
         */
        return ensureNonEmpty(self, "__attrs", true);
    }

    /**
     *
     * @param self
     * @return non-empty attr value holder
     */
    function getAttrVals(self) {
        /**
         * attribute value
         {
         attrName: attrVal
         }
         */
        return ensureNonEmpty(self, "__attrVals", true);
    }

    /**
     * o, [x,y,z] => o[x][y][z]
     * @param o
     * @param path
     */
    function getValueByPath(o, path) {
        for (var i = 0, len = path.length;
             o != undef && i < len;
             i++) {
            o = o[path[i]];
        }
        return o;
    }

    /**
     * o, [x,y,z], val => o[x][y][z]=val
     * @param o
     * @param path
     * @param val
     */
    function setValueByPath(o, path, val) {
        var rlen = path.length - 1,
            s = o;
        if (rlen >= 0) {
            for (var i = 0; i < rlen; i++) {
                o = o[path[i]];
            }
            if (o != undef) {
                o[path[i]] = val;
            } else {
                s = undef;
            }
        }
        return s;
    }

    function setInternal(self, name, value, opts, attrs) {
        var ret;
        opts = opts || {};
        var dot = ".",
            path,
            subVal,
            prevVal,
            fullName = name;

        if (name.indexOf(dot) !== -1) {
            path = name.split(dot);
            name = path.shift();
        }

        prevVal = self.get(name);

        if (path) {
            subVal = getValueByPath(prevVal, path);
        }

        // if no change, just return
        if (!path && prevVal === value) {
            return undef;
        } else if (path && subVal === value) {
            return undef;
        }

        if (path) {
            var tmp = S.clone(prevVal);
            setValueByPath(tmp, path, value);
            value = tmp;
        }

        // check before event
        if (!opts['silent']) {
            if (false === __fireAttrChange(self, 'before', name, prevVal, value, fullName)) {
                return false;
            }
        }
        // set it
        ret = self.__set(name, value, opts);

        if (ret === false) {
            return ret;
        }

        // fire after event
        if (!opts['silent']) {
            value = getAttrVals(self)[name];
            __fireAttrChange(self, 'after', name, prevVal, value, fullName);
            if (!attrs) {
                __fireAttrChange(self,
                    '', '*',
                    [prevVal], [value],
                    [fullName], [name]);
            } else {
                attrs.push({
                    prevVal:prevVal,
                    newVal:value,
                    attrName:name,
                    subAttrName:fullName
                });
            }
        }
        return self;
    }

    /**
     * @class <p>
     * Attribute provides configurable attribute support along with attribute change events. It is designed to be
     * augmented on to a host class, and provides the host with the ability to configure attributes to store and retrieve state,
     * along with attribute change events.
     * </p>
     * <p>For example, attributes added to the host can be configured:</p>
     * <ul>
     *     <li>With a setter function, which can be used to manipulate
     *     values passed to Attribute's {@link Attribute#set} method, before they are stored.</li>
     *     <li>With a getter function, which can be used to manipulate stored values,
     *     before they are returned by Attribute's {@link Attribute#get} method.</li>
     *     <li>With a validator function, to validate values before they are stored.</li>
     * </ul>
     *
     * <p>See the {@link Attribute#addAttr} method, for the complete set of configuration
     * options available for attributes</p>.
     *
     * <p><strong>NOTE:</strong> Most implementations will be better off extending the {@link Base} class,
     * instead of augmenting Attribute directly. Base augments Attribute and will handle the initial configuration
     * of attributes for derived classes, accounting for values passed into the constructor.</p>
     * @name Attribute
     */
    function Attribute() {
    }

    S.augment(Attribute,
        /**
         * @lends Attribute.prototype
         */
        {

            /**
             * @return un-cloned attr config collections
             */
            getAttrs:function () {
                return getAttrs(this);
            },

            /**
             * @return un-cloned attr value collections
             */
            getAttrVals:function () {
                var self = this,
                    o = {},
                    a,
                    attrs = getAttrs(self);
                for (a in attrs) {
                    o[a] = self.get(a);
                }
                return o;
            },

            /**
             * Adds an attribute with the provided configuration to the host object.
             * @param {String} name attrName
             * @param {Object} attrConfig The config supports the following properties
             * @param [attrConfig.value] simple object or system native object
             * @param [attrConfig.valueFn] a function which can return current attribute's default value
             * @param {Function(*)} [attrConfig.setter] call when set attribute's value
             *                                          pass current attribute's value as parameter
             *                                          if return value is not undefined,set returned value as real value
             * @param {Function(*)} [attrConfig.getter] call when get attribute's value
             *                                          pass current attribute's value as parameter
             *                                          return getter's returned value to invoker
             * @param {Function(*)} [attrConfig.validator]  call before set attribute's value
             *                                              if return false,cancel this set action
             * @param {boolean} [override] whether override existing attribute config ,default true
             */
            addAttr:function (name, attrConfig, override) {
                var self = this,
                    attrs = getAttrs(self),
                    cfg = S.clone(attrConfig);
                if (!attrs[name]) {
                    attrs[name] = cfg;
                } else {
                    S.mix(attrs[name], cfg, override);
                }
                return self;
            },

            /**
             * Configures a group of attributes, and sets initial values.
             * @param {Object} attrConfigs  An object with attribute name/configuration pairs.
             * @param {Object} initialValues user defined initial values
             */
            addAttrs:function (attrConfigs, initialValues) {
                var self = this;
                S.each(attrConfigs, function (attrConfig, name) {
                    self.addAttr(name, attrConfig);
                });
                if (initialValues) {
                    self.set(initialValues);
                }
                return self;
            },

            /**
             * Checks if the given attribute has been added to the host.
             */
            hasAttr:function (name) {
                return name && getAttrs(this).hasOwnProperty(name);
            },

            /**
             * Removes an attribute from the host object.
             */
            removeAttr:function (name) {
                var self = this;

                if (self.hasAttr(name)) {
                    delete getAttrs(self)[name];
                    delete getAttrVals(self)[name];
                }

                return self;
            },


            /**
             * Sets the value of an attribute.
             * @param {String|Object} name attribute's name or attribute name and value map
             * @param [value] attribute's value
             * @param {Object} [opts] some options
             * @param {boolean} [opts.silent] whether fire change event
             * @returns {boolean} whether pass validator
             */
            set:function (name, value, opts) {
                var self = this;
                if (S.isPlainObject(name)) {
                    opts = value;
                    var all = Object(name),
                        attrs = [],
                        e,
                        errors = [];
                    for (name in all) {
                        // bulk validation
                        // if any one failed,all values are not set
                        if ((e = validate(self, name, all[name], all)) !== undef) {
                            errors.push(e);
                        }
                    }
                    if (errors.length) {
                        if (opts.error) {
                            opts.error(errors);
                        }
                        return false;
                    }
                    for (name in all) {
                        setInternal(self, name, all[name], opts, attrs);
                    }
                    var attrNames = [],
                        prevVals = [],
                        newVals = [],
                        subAttrNames = [];
                    S.each(attrs, function (attr) {
                        prevVals.push(attr.prevVal);
                        newVals.push(attr.newVal);
                        attrNames.push(attr.attrName);
                        subAttrNames.push(attr.subAttrName);
                    });
                    if (attrNames.length) {
                        __fireAttrChange(self,
                            '',
                            '*',
                            prevVals,
                            newVals,
                            subAttrNames,
                            attrNames);
                    }
                    return self;
                }
                return setInternal(self, name, value, opts);
            },

            /**
             * internal use, no event involved, just set.
             * @protected overriden by mvc/model
             */
            __set:function (name, value, opts) {
                var self = this,
                    setValue,
                    // if host does not have meta info corresponding to (name,value)
                    // then register on demand in order to collect all data meta info
                    // 一定要注册属性元数据，否则其他模块通过 _attrs 不能枚举到所有有效属性
                    // 因为属性在声明注册前可以直接设置值
                    e,
                    attrConfig = ensureNonEmpty(getAttrs(self), name, true),
                    setter = attrConfig['setter'];

                // validator check
                e = validate(self, name, value);

                if (e !== undef) {
                    if (opts.error) {
                        opts.error(e);
                    }
                    return false;
                }

                // if setter has effect
                if (setter && (setter = normalFn(self, setter))) {
                    setValue = setter.call(self, value, name);
                }

                if (setValue === INVALID) {
                    return false;
                }

                if (setValue !== undef) {
                    value = setValue;
                }

                // finally set
                getAttrVals(self)[name] = value;
            },

            /**
             * Gets the current value of the attribute.
             * @param {String} name attribute's name
             */
            get:function (name) {
                var self = this,
                    dot = ".",
                    path,
                    attrVals = getAttrVals(self),
                    attrConfig,
                    getter, ret;

                if (name.indexOf(dot) !== -1) {
                    path = name.split(dot);
                    name = path.shift();
                }

                attrConfig = ensureNonEmpty(getAttrs(self), name);
                getter = attrConfig['getter'];

                // get user-set value or default value
                //user-set value takes privilege
                ret = name in attrVals ?
                    attrVals[name] :
                    self.__getDefAttrVal(name);

                // invoke getter for this attribute
                if (getter && (getter = normalFn(self, getter))) {
                    ret = getter.call(self, ret, name);
                }

                if (path) {
                    ret = getValueByPath(ret, path);
                }

                return ret;
            },

            /**
             * get default attribute value from valueFn/value
             * @private
             * @param name
             */
            __getDefAttrVal:function (name) {
                var self = this,
                    attrs = getAttrs(self),
                    attrConfig = ensureNonEmpty(attrs, name),
                    valFn = attrConfig.valueFn,
                    val;

                if (valFn && (valFn = normalFn(self, valFn))) {
                    val = valFn.call(self);
                    if (val !== undef) {
                        attrConfig.value = val;
                    }
                    delete attrConfig.valueFn;
                    attrs[name] = attrConfig;
                }

                return attrConfig.value;
            },

            /**
             * Resets the value of an attribute.just reset what addAttr set  (not what invoker set when call new Xx(cfg))
             * @param {String} name name of attribute
             * @param {Object} [opts] some options
             * @param {boolean} [opts.silent] whether fire change event
             */
            reset:function (name, opts) {
                var self = this;

                if (S.isString(name)) {
                    if (self.hasAttr(name)) {
                        // if attribute does not have default value, then set to undefined.
                        return self.set(name, self.__getDefAttrVal(name), opts);
                    }
                    else {
                        return self;
                    }
                }

                opts = name;

                var attrs = getAttrs(self),
                    values = {};

                // reset all
                for (name in attrs) {
                    values[name] = self.__getDefAttrVal(name);
                }

                self.set(values, opts);
                return self;
            }
        });

    function capitalFirst(s) {
        return s.charAt(0).toUpperCase() + s.substring(1);
    }

    function validate(self, name, value, all) {
        var attrConfig = ensureNonEmpty(getAttrs(self), name, true),
            e,
            validator = attrConfig['validator'];
        if (validator && (validator = normalFn(self, validator))) {
            e = validator.call(self, value, name, all);
            // undefined and true validate successfully
            if (e !== undef && e !== true) {
                return e;
            }
        }
        return undef;
    }

    if (undef) {
        Attribute.prototype.addAttrs = undef;
    }
    return Attribute;
});

/**
 *  2011-10-18
 *    get/set sub attribute value ,set("x.y",val) x 最好为 {} ，不要是 new Clz() 出来的
 *    add validator
 */
/**
 * @fileOverview attribute management and event in one
 * @author  yiminghe@gmail.com,lifesinger@gmail.com
 */
KISSY.add('base', function (S, Attribute, Event) {

    /**
     * @name Base
     * @extends Event.Target
     * @extends Attribute
     * @class <p>
     * A base class which objects requiring attributes and custom event support can
     * extend. attributes configured
     * through the static {@link Base.ATTRS} property for each class
     * in the hierarchy will be initialized by Base.
     * </p>
     */
    function Base(config) {
        var c = this.constructor;

        // define
        while (c) {
            addAttrs(this, c['ATTRS']);
            c = c.superclass ? c.superclass.constructor : null;
        }
        // initial
        initAttrs(this, config);
    }


    /**
     * The default set of attributes which will be available for instances of this class, and
     * their configuration
     *
     * By default if the value is an object literal or an array it will be "shallow" cloned, to
     * protect the default value.
     *
     * @name Base.ATTRS
     * @type Object
     */


    /**
     * see {@link Attribute#set}
     * @name set
     * @memberOf Base#
     * @function
     */


    function addAttrs(host, attrs) {
        if (attrs) {
            for (var attr in attrs) {
                // 子类上的 ATTRS 配置优先
                if (attrs.hasOwnProperty(attr)) {
                    // 父类后加，父类不覆盖子类的相同设置
                    // 属性对象会 merge   a: {y:{getter:fn}}, b:{y:{value:3}}, b extends a => b {y:{value:3}}
                    host.addAttr(attr, attrs[attr], false);
                }
            }
        }
    }

    function initAttrs(host, config) {
        if (config) {
            for (var attr in config) {
                if (config.hasOwnProperty(attr)) {
                    //用户设置会调用 setter/validator 的，但不会触发属性变化事件
                    host.__set(attr, config[attr]);
                }

            }
        }
    }

    S.augment(Base, Event.Target, Attribute);

    Base.Attribute = Attribute;

    S.Base = Base;

    return Base;
}, {
    requires:["base/attribute", "event"]
});
/*
Copyright 2012, KISSY UI Library v1.30dev
MIT Licensed
build time: Mar 23 12:18
*/
/**
 * @fileOverview anim
 */
KISSY.add("anim", function (S, Anim, Easing) {
    Anim.Easing = Easing;
    S.mix(S, {
        Anim:Anim,
        Easing:Anim.Easing
    });
    return Anim;
}, {
    requires:["anim/base", "anim/easing", "anim/color", "anim/backgroundPosition"]
});/**
 * @fileOverview special patch for anim backgroundPosition
 * @author  yiminghe@gmail.com
 */
KISSY.add("anim/backgroundPosition", function (S, DOM, Anim, Fx) {

    function numeric(bp) {
        bp = bp.replace(/left|top/g, '0px')
            .replace(/right|bottom/g, '100%')
            .replace(/([0-9\.]+)(\s|\)|$)/g, "$1px$2");
        var res = bp.match(/(-?[0-9\.]+)(px|%|em|pt)\s(-?[0-9\.]+)(px|%|em|pt)/);
        return [parseFloat(res[1]), res[2], parseFloat(res[3]), res[4]];
    }

    function BackgroundPositionFx() {
        BackgroundPositionFx.superclass.constructor.apply(this, arguments);
    }

    S.extend(BackgroundPositionFx, Fx, {

        load:function () {
            var self = this, fromUnit;
            BackgroundPositionFx.superclass.load.apply(self, arguments);
            fromUnit = self.unit = ["px", "px"];
            if (self.from) {
                var from = numeric(self.from);
                self.from = [from[0], from[2]];
                fromUnit = [from[1], from[3]];
            } else {
                self.from = [0, 0];
            }
            if (self.to) {
                var to = numeric(self.to);
                self.to = [to[0], to[2]];
                self.unit = [to[1], to[3]];
            } else {
                self.to = [0, 0];
            }
            if (fromUnit) {
                if (fromUnit[0] !== self.unit[0] || fromUnit[1] !== self.unit[1]) {
                    S.log("BackgroundPosition x y unit is not same :", "warn");
                    S.log(fromUnit, "warn");
                    S.log(self.unit, "warn");
                }
            }
        },

        interpolate:function (from, to, pos) {
            var unit = this.unit, interpolate = BackgroundPositionFx.superclass.interpolate;
            return interpolate(from[0], to[0], pos) + unit[0] + " " +
                interpolate(from[1], to[1], pos) + unit[1];
        },

        cur:function () {
            return DOM.css(this.elem, "backgroundPosition");
        },

        update:function () {
            var self = this,
                prop = self.prop,
                elem = self.elem,
                from = self.from,
                to = self.to,
                val = self.interpolate(from, to, self.pos);
            DOM.css(elem, prop, val);
        }

    });

    Fx.Factories["backgroundPosition"] = BackgroundPositionFx;

    return BackgroundPositionFx;

}, {
    requires:["dom", "./base", "./fx"]
});/**
 * @fileOverview animation framework for KISSY
 * @author   yiminghe@gmail.com,lifesinger@gmail.com
 */
KISSY.add('anim/base', function (S, DOM, Event, Easing, UA, AM, Fx, Q) {

    var camelCase = DOM._camelCase,
        _isElementNode = DOM._isElementNode,
        specialVals = ["hide", "show", "toggle"],
        // shorthand css properties
        SHORT_HANDS = {
            // http://www.w3.org/Style/CSS/Tracker/issues/9
            // http://snook.ca/archives/html_and_css/background-position-x-y
            // backgroundPositionX  backgroundPositionY does not support
            background:[
                "backgroundPosition"
            ],
            border:[
                "borderBottomWidth",
                "borderLeftWidth",
                'borderRightWidth',
                // 'borderSpacing', 组合属性？
                'borderTopWidth'
            ],
            "borderBottom":["borderBottomWidth"],
            "borderLeft":["borderLeftWidth"],
            borderTop:["borderTopWidth"],
            borderRight:["borderRightWidth"],
            font:[
                'fontSize',
                'fontWeight'
            ],
            margin:[
                'marginBottom',
                'marginLeft',
                'marginRight',
                'marginTop'
            ],
            padding:[
                'paddingBottom',
                'paddingLeft',
                'paddingRight',
                'paddingTop'
            ]
        },
        defaultConfig = {
            duration:1,
            easing:'easeNone'
        },
        rfxnum = /^([+\-]=)?([\d+.\-]+)([a-z%]*)$/i;

    Anim.SHORT_HANDS = SHORT_HANDS;


    /**
     * @class A class for constructing animation instances.
     * @param {HTMLElement|window} elem Html dom node or window
     * (window can only animate scrollTop/scrollLeft)
     * @param {Object} props style map
     * @param {Number|Object} [duration] duration(s) or anim config
     * @param {String|Function} [duration.easing] easing fn or string
     * @param {Function} [duration.complete] callback function when this animation is complete
     * @param {Number} [duration.duration] duration(s)
     * @param {String|Boolean} [duration.queue] current animation's queue, if false then no queue
     * @param {Function|String} [easing] easing fn or string
     * @param {Function} [callback] callback function when this animation is complete
     * @extends Event.Target
     * @name Anim
     *
     */
    function Anim(elem, props, duration, easing, callback) {
        var self = this, config;

        // ignore non-exist element
        if (!(elem = DOM.get(elem))) {
            return;
        }

        // factory or constructor
        if (!(self instanceof Anim)) {
            return new Anim(elem, props, duration, easing, callback);
        }

        /**
         * the transition properties
         */
        if (S.isString(props)) {
            props = S.unparam(String(props), ";", ":");
        } else {
            // clone to prevent collision within multiple instance
            props = S.clone(props);
        }

        /**
         * 驼峰属性名
         */
        for (var prop in props) {
            var camelProp = camelCase(S.trim(prop));
            if (prop != camelProp) {
                props[camelProp] = props[prop];
                delete props[prop];
            }
        }

        /**
         * animation config
         */
        if (S.isPlainObject(duration)) {
            config = S.clone(duration);
        } else {
            config = {
                duration:parseFloat(duration) || undefined,
                easing:easing,
                complete:callback
            };
        }

        config = S.merge(defaultConfig, config);
        self.config = config;
        config.duration *= 1000;

        // domEl deprecated!
        self.elem = self['domEl'] = elem;
        self.props = props;

        // 实例属性
        self._backupProps = {};
        self._fxs = {};

        // register callback
        self.on("complete", onComplete);
    }


    function onComplete(e) {
        var self = this,
            _backupProps,
            config = self.config;

        // only recover after complete anim
        if (!S.isEmptyObject(_backupProps = self._backupProps)) {
            DOM.css(self.elem, _backupProps);
        }

        if (config.complete) {
            config.complete.call(self, e);
        }
    }

    function runInternal() {
        var self = this,
            config = self.config,
            _backupProps = self._backupProps,
            elem = self.elem,
            hidden,
            val,
            prop,
            specialEasing = (config['specialEasing'] || {}),
            fxs = self._fxs,
            props = self.props;

        // 进入该函数即代表执行（q[0] 已经是 ...）
        saveRunning(self);

        if (self.fire("start") === false) {
            // no need to invoke complete
            self.stop(0);
            return;
        }

        if (_isElementNode(elem)) {
            hidden = (DOM.css(elem, "display") === "none");
            for (prop in props) {
                val = props[prop];
                // 直接结束
                if (val == "hide" && hidden || val == 'show' && !hidden) {
                    // need to invoke complete
                    self.stop(1);
                    return;
                }
            }
        }

        // 分离 easing
        S.each(props, function (val, prop) {
            if (!props.hasOwnProperty(prop)) {
                return;
            }
            var easing;
            if (S.isArray(val)) {
                easing = specialEasing[prop] = val[1];
                props[prop] = val[0];
            } else {
                easing = specialEasing[prop] = (specialEasing[prop] || config.easing);
            }
            if (S.isString(easing)) {
                easing = specialEasing[prop] = Easing[easing];
            }
            specialEasing[prop] = easing || Easing['easeNone'];
        });


        // 扩展分属性
        S.each(SHORT_HANDS, function (shortHands, p) {
            var sh,
                origin,
                val;
            if (val = props[p]) {
                origin = {};
                S.each(shortHands, function (sh) {
                    // 得到原始分属性之前值
                    origin[sh] = DOM.css(elem, sh);
                    specialEasing[sh] = specialEasing[p];
                });
                DOM.css(elem, p, val);
                for (sh in origin) {
                    // 得到期待的分属性最后值
                    props[sh] = DOM.css(elem, sh);
                    // 还原
                    DOM.css(elem, sh, origin[sh]);
                }
                // 删除复合属性
                delete props[p];
            }
        });

        // 取得单位，并对单个属性构建 Fx 对象
        for (prop in props) {
            if (!props.hasOwnProperty(prop)) {
                continue;
            }

            val = S.trim(props[prop]);

            var to,
                from,
                propCfg = {
                    elem:elem,
                    prop:prop,
                    duration:config.duration,
                    easing:specialEasing[prop]
                },
                fx = Fx.getFx(propCfg);

            // hide/show/toggle : special treat!
            if (S.inArray(val, specialVals)) {
                // backup original value
                _backupProps[prop] = DOM.style(elem, prop);
                if (val == "toggle") {
                    val = hidden ? "show" : "hide";
                }
                if (val == "hide") {
                    to = 0;
                    from = fx.cur();
                    // 执行完后隐藏
                    _backupProps.display = 'none';
                } else {
                    from = 0;
                    to = fx.cur();
                    // prevent flash of content
                    DOM.css(elem, prop, from);
                    DOM.show(elem);
                }
                val = to;
            } else {
                to = val;
                from = fx.cur();
            }

            val += "";

            var unit = "",
                parts = val.match(rfxnum);

            if (parts) {
                to = parseFloat(parts[2]);
                unit = parts[3];

                // 有单位但单位不是 px
                if (unit && unit !== "px") {
                    DOM.css(elem, prop, val);
                    from = (to / fx.cur()) * from;
                    DOM.css(elem, prop, from + unit);
                }

                // 相对
                if (parts[1]) {
                    to = ( (parts[ 1 ] === "-=" ? -1 : 1) * to ) + from;
                }
            }

            propCfg.from = from;
            propCfg.to = to;
            propCfg.unit = unit;
            fx.load(propCfg);
            fxs[prop] = fx;
        }

        if (_isElementNode(elem) &&
            (props.width || props.height)) {
            // Make sure that nothing sneaks out
            // Record all 3 overflow attributes because IE does not
            // change the overflow attribute when overflowX and
            // overflowY are set to the same value
            S.mix(_backupProps, {
                overflow:DOM.style(elem, "overflow"),
                "overflow-x":DOM.style(elem, "overflowX"),
                "overflow-y":DOM.style(elem, "overflowY")
            });
            DOM.css(elem, "overflow", "hidden");
            // inline element should has layout/inline-block
            if (DOM.css(elem, "display") === "inline" &&
                DOM.css(elem, "float") === "none") {
                if (UA['ie']) {
                    DOM.css(elem, "zoom", 1);
                } else {
                    DOM.css(elem, "display", "inline-block");
                }
            }
        }

        AM.start(self);
    }


    S.augment(Anim, Event.Target,
        /**
         * @lends Anim.prototype
         */
        {

            /**
             * @return {boolean} whether this animation is running
             */
            isRunning:function () {
                return isRunning(this);
            },

            _runInternal:runInternal,

            /**
             * start this animation
             */
            run:function () {
                var self = this,
                    queueName = self.config.queue;

                if (queueName === false) {
                    runInternal.call(self);
                } else {
                    // 当前动画对象加入队列
                    Q.queue(self);
                }

                return self;
            },

            _frame:function () {

                var self = this,
                    prop,
                    config = self.config,
                    end = 1,
                    c,
                    fx,
                    fxs = self._fxs;

                for (prop in fxs) {
                    if (fxs.hasOwnProperty(prop) &&
                        // 当前属性没有结束
                        !((fx = fxs[prop]).finished)) {
                        // 非短路
                        if (config.frame) {
                            c = config.frame(fx);
                        }
                        // 结束
                        if (c == 1 ||
                            // 不执行自带
                            c == 0) {
                            fx.finished = c;
                            end &= c;
                        }
                        else {
                            end &= fx.frame();
                        }
                    }
                }

                if ((self.fire("step") === false) ||
                    end) {
                    // complete 事件只在动画到达最后一帧时才触发
                    self.stop(end);
                }
            },

            /**
             * stop this animation
             * @param {Boolean} [finish] whether jump to the last position of this animation
             */
            stop:function (finish) {
                var self = this,
                    config = self.config,
                    queueName = config.queue,
                    prop,
                    fx,
                    fxs = self._fxs;

                // already stopped
                if (!self.isRunning()) {
                    // 从自己的队列中移除
                    if (queueName !== false) {
                        Q.remove(self);
                    }
                    return;
                }

                if (finish) {
                    for (prop in fxs) {
                        if (fxs.hasOwnProperty(prop) &&
                            // 当前属性没有结束
                            !((fx = fxs[prop]).finished)) {
                            // 非短路
                            if (config.frame) {
                                config.frame(fx, 1);
                            } else {
                                fx.frame(1);
                            }
                        }
                    }
                    self.fire("complete");
                }

                AM.stop(self);

                removeRunning(self);

                if (queueName !== false) {
                    // notify next anim to run in the same queue
                    Q.dequeue(self);
                }

                return self;
            }
        });

    var runningKey = S.guid("ks-anim-unqueued-" + S.now() + "-");

    function saveRunning(anim) {
        var elem = anim.elem,
            allRunning = DOM.data(elem, runningKey);
        if (!allRunning) {
            DOM.data(elem, runningKey, allRunning = {});
        }
        allRunning[S.stamp(anim)] = anim;
    }

    function removeRunning(anim) {
        var elem = anim.elem,
            allRunning = DOM.data(elem, runningKey);
        if (allRunning) {
            delete allRunning[S.stamp(anim)];
            if (S.isEmptyObject(allRunning)) {
                DOM.removeData(elem, runningKey);
            }
        }
    }

    function isRunning(anim) {
        var elem = anim.elem,
            allRunning = DOM.data(elem, runningKey);
        if (allRunning) {
            return !!allRunning[S.stamp(anim)];
        }
        return 0;
    }

    /**
     * stop all the anims currently running
     * @param {HTMLElement} elem element which anim belongs to
     * @param {boolean} end whether jump to last position
     * @param {boolean} clearQueue whether clean current queue
     * @param {String|Boolean} queueName current queue's name to be cleared
     * @private
     */
    Anim.stop = function (elem, end, clearQueue, queueName) {
        if (
        // default queue
            queueName === null ||
                // name of specified queue
                S.isString(queueName) ||
                // anims not belong to any queue
                queueName === false
            ) {
            return stopQueue.apply(undefined, arguments);
        }
        // first stop first anim in queues
        if (clearQueue) {
            Q.removeQueues(elem);
        }
        var allRunning = DOM.data(elem, runningKey),
            // can not stop in for/in , stop will modified allRunning too
            anims = S.merge(allRunning);
        for (var k in anims) {
            anims[k].stop(end);
        }
    };

    /**
     *
     * @param elem element which anim belongs to
     * @param queueName queue'name if set to false only remove
     * @param end
     * @param clearQueue
     * @private
     */
    function stopQueue(elem, end, clearQueue, queueName) {
        if (clearQueue && queueName !== false) {
            Q.removeQueue(elem, queueName);
        }
        var allRunning = DOM.data(elem, runningKey),
            anims = S.merge(allRunning);
        for (var k in anims) {
            var anim = anims[k];
            if (anim.config.queue == queueName) {
                anim.stop(end);
            }
        }
    }

    /**
     * whether elem is running anim
     * @param {HTMLElement} elem
     * @private
     */
    Anim.isRunning = function (elem) {
        var allRunning = DOM.data(elem, runningKey);
        return allRunning && !S.isEmptyObject(allRunning);
    };

    Anim.Q = Q;

    if (SHORT_HANDS) {
    }
    return Anim;
}, {
    requires:["dom", "event", "./easing", "ua", "./manager", "./fx", "./queue"]
});

/**
 * 2011-11
 * - 重构，抛弃 emile，优化性能，只对需要的属性进行动画
 * - 添加 stop/stopQueue/isRunning，支持队列管理
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
 * @fileOverview special patch for making color gradual change
 * @author  yiminghe@gmail.com
 */
KISSY.add("anim/color", function (S, DOM, Anim, Fx) {

    var HEX_BASE = 16,

        floor = Math.floor,

        KEYWORDS = {
            "black":[0, 0, 0],
            "silver":[192, 192, 192],
            "gray":[128, 128, 128],
            "white":[255, 255, 255],
            "maroon":[128, 0, 0],
            "red":[255, 0, 0],
            "purple":[128, 0, 128],
            "fuchsia":[255, 0, 255],
            "green":[0, 128, 0],
            "lime":[0, 255, 0],
            "olive":[128, 128, 0],
            "yellow":[255, 255, 0],
            "navy":[0, 0, 128],
            "blue":[0, 0, 255],
            "teal":[0, 128, 128],
            "aqua":[0, 255, 255]
        },
        re_RGB = /^rgb\(([0-9]+)\s*,\s*([0-9]+)\s*,\s*([0-9]+)\)$/i,

        re_RGBA = /^rgba\(([0-9]+)\s*,\s*([0-9]+)\s*,\s*([0-9]+),\s*([0-9]+)\)$/i,

        re_hex = /^#?([0-9A-F]{1,2})([0-9A-F]{1,2})([0-9A-F]{1,2})$/i,

        SHORT_HANDS = Anim.SHORT_HANDS,

        COLORS = [
            'backgroundColor' ,
            'borderBottomColor' ,
            'borderLeftColor' ,
            'borderRightColor' ,
            'borderTopColor' ,
            'color' ,
            'outlineColor'
        ];

    SHORT_HANDS['background'] = SHORT_HANDS['background'] || [];
    SHORT_HANDS['background'].push('backgroundColor');

    SHORT_HANDS['borderColor'] = [
        'borderBottomColor',
        'borderLeftColor',
        'borderRightColor',
        'borderTopColor'
    ];

    SHORT_HANDS['border'].push(
        'borderBottomColor',
        'borderLeftColor',
        'borderRightColor',
        'borderTopColor'
    );

    SHORT_HANDS['borderBottom'].push(
        'borderBottomColor'
    );

    SHORT_HANDS['borderLeft'].push(
        'borderLeftColor'
    );

    SHORT_HANDS['borderRight'].push(
        'borderRightColor'
    );

    SHORT_HANDS['borderTop'].push(
        'borderTopColor'
    );

    //得到颜色的数值表示，红绿蓝数字数组
    function numericColor(val) {
        val = (val + "");
        var match;
        if (match = val.match(re_RGB)) {
            return [
                parseInt(match[1]),
                parseInt(match[2]),
                parseInt(match[3])
            ];
        }
        else if (match = val.match(re_RGBA)) {
            return [
                parseInt(match[1]),
                parseInt(match[2]),
                parseInt(match[3]),
                parseInt(match[4])
            ];
        }
        else if (match = val.match(re_hex)) {
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
        if (KEYWORDS[val = val.toLowerCase()]) {
            return KEYWORDS[val];
        }

        //transparent 或者 颜色字符串返回
        S.log("only allow rgb or hex color string : " + val, "warn");
        return [255, 255, 255];
    }

    function ColorFx() {
        ColorFx.superclass.constructor.apply(this, arguments);
    }

    S.extend(ColorFx, Fx, {

        load:function () {
            var self = this;
            ColorFx.superclass.load.apply(self, arguments);
            if (self.from) {
                self.from = numericColor(self.from);
            }
            if (self.to) {
                self.to = numericColor(self.to);
            }
        },

        interpolate:function (from, to, pos) {
            var interpolate = ColorFx.superclass.interpolate;
            if (from.length == 3 && to.length == 3) {
                return 'rgb(' + [
                    floor(interpolate(from[0], to[0], pos)),
                    floor(interpolate(from[1], to[1], pos)),
                    floor(interpolate(from[2], to[2], pos))
                ].join(', ') + ')';
            } else if (from.length == 4 || to.length == 4) {
                return 'rgba(' + [
                    floor(interpolate(from[0], to[0], pos)),
                    floor(interpolate(from[1], to[1], pos)),
                    floor(interpolate(from[2], to[2], pos)),
                    // 透明度默认 1
                    floor(interpolate(from[3] || 1, to[3] || 1, pos))
                ].join(', ') + ')';
            } else {
                S.log("anim/color unknown value : " + from);
            }
        }

    });

    S.each(COLORS, function (color) {
        Fx.Factories[color] = ColorFx;
    });

    return ColorFx;

}, {
    requires:["dom", "./base", "./fx"]
});

/**
 * TODO
 * 支持 hsla
 *  - https://github.com/jquery/jquery-color/blob/master/jquery.color.js
 **//**
 * @fileOverview Easing equation from yui3
 */
KISSY.add('anim/easing', function () {

    // Based on Easing Equations (c) 2003 Robert Penner, all rights reserved.
    // This work is subject to the terms in http://www.robertpenner.com/easing_terms_of_use.html
    // Preview: http://www.robertpenner.com/Easing/easing_demo.html

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
        BACK_CONST = 1.70158;
    /**
     * @memberOf Anim
     * @name Easing
     * @namespace Provides methods for customizing how an animation behaves during each run.
     */
    var Easing =
    /**
     * @lends Anim.Easing
     */
    {

        swing:function (t) {
            return ( -Math.cos(t * PI) / 2 ) + 0.5;
        },

        /**
         * Uniform speed between points.
         */
        "easeNone":function (t) {
            return t;
        },

        /**
         * Begins slowly and accelerates towards end. (quadratic)
         */
        "easeIn":function (t) {
            return t * t;
        },

        /**
         * Begins quickly and decelerates towards end.  (quadratic)
         */
        easeOut:function (t) {
            return ( 2 - t) * t;
        },

        /**
         * Begins slowly and decelerates towards end. (quadratic)
         */
        easeBoth:function (t) {
            return (t *= 2) < 1 ?
                .5 * t * t :
                .5 * (1 - (--t) * (t - 2));
        },

        /**
         * Begins slowly and accelerates towards end. (quartic)
         */
        "easeInStrong":function (t) {
            return t * t * t * t;
        },

        /**
         * Begins quickly and decelerates towards end.  (quartic)
         */
        easeOutStrong:function (t) {
            return 1 - (--t) * t * t * t;
        },

        /**
         * Begins slowly and decelerates towards end. (quartic)
         */
        "easeBothStrong":function (t) {
            return (t *= 2) < 1 ?
                .5 * t * t * t * t :
                .5 * (2 - (t -= 2) * t * t * t);
        },

        /**
         * Snap in elastic effect.
         */

        "elasticIn":function (t) {
            var p = .3, s = p / 4;
            if (t === 0 || t === 1) return t;
            return -(pow(2, 10 * (t -= 1)) * sin((t - s) * (2 * PI) / p));
        },

        /**
         * Snap out elastic effect.
         */
        elasticOut:function (t) {
            var p = .3, s = p / 4;
            if (t === 0 || t === 1) return t;
            return pow(2, -10 * t) * sin((t - s) * (2 * PI) / p) + 1;
        },

        /**
         * Snap both elastic effect.
         */
        "elasticBoth":function (t) {
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
        "backIn":function (t) {
            if (t === 1) t -= .001;
            return t * t * ((BACK_CONST + 1) * t - BACK_CONST);
        },

        /**
         * Overshoots end, then reverses and comes back to end.
         */
        backOut:function (t) {
            return (t -= 1) * t * ((BACK_CONST + 1) * t + BACK_CONST) + 1;
        },

        /**
         * Backtracks slightly, then reverses direction, overshoots end,
         * then reverses and comes back to end.
         */
        "backBoth":function (t) {
            if ((t *= 2 ) < 1) {
                return .5 * (t * t * (((BACK_CONST *= (1.525)) + 1) * t - BACK_CONST));
            }
            return .5 * ((t -= 2) * t * (((BACK_CONST *= (1.525)) + 1) * t + BACK_CONST) + 2);
        },

        /**
         * Bounce off of start.
         */
        bounceIn:function (t) {
            return 1 - Easing.bounceOut(1 - t);
        },

        /**
         * Bounces off end.
         */
        bounceOut:function (t) {
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
        "bounceBoth":function (t) {
            if (t < .5) {
                return Easing.bounceIn(t * 2) * .5;
            }
            return Easing.bounceOut(t * 2 - 1) * .5 + .5;
        }
    };

    return Easing;
});

/**
 * TODO:
 *  - test-Easing.html 详细的测试 + 曲线可视化
 *
 * NOTES:
 *  - 综合比较 jQuery UI/scripty2/YUI 的 Easing 命名，还是觉得 YUI 的对用户
 *    最友好。因此这次完全照搬 YUI 的 Easing, 只是代码上做了点压缩优化。
 *  - 和原生对应关系：
 *     Easing.NativeTimeFunction = {
 *      easeNone: 'linear',
 *      ease: 'ease',
 *
 *      easeIn: 'ease-in',
 *      easeOut: 'ease-out',
 *      easeBoth: 'ease-in-out',
 *
 *      // Ref:
 *      //  1. http://www.w3.org/TR/css3-transitions/#transition-timing-function_tag
 *      //  2. http://www.robertpenner.com/Easing/easing_demo.html
 *      //  3. assets/cubic-bezier-timing-function.html
 *      // 注：是模拟值，非精确推导值
 *      easeInStrong: 'cubic-bezier(0.9, 0.0, 0.9, 0.5)',
 *      easeOutStrong: 'cubic-bezier(0.1, 0.5, 0.1, 1.0)',
 *      easeBothStrong: 'cubic-bezier(0.9, 0.0, 0.1, 1.0)'
 *    };
 */
/**
 * @fileOverview animate on single property
 * @author yiminghe@gmail.com
 */
KISSY.add("anim/fx", function (S, DOM, undefined) {

    /**
     * basic animation about single css property or element attribute
     * @param cfg
     */
    function Fx(cfg) {
        this.load(cfg);
    }

    S.augment(Fx, {

        load:function (cfg) {
            var self = this;
            S.mix(self, cfg);
            self.startTime = S.now();
            self.pos = 0;
            self.unit = self.unit || "";
        },

        frame:function (end) {
            var self = this,
                endFlag = 0,
                elapsedTime;
            if (self.finished) {
                return 1;
            }
            var t = S.now();
            if (end || t >= self.duration + self.startTime) {
                self.pos = 1;
                endFlag = 1;
            } else {
                elapsedTime = t - self.startTime;
                self.pos = self.easing(elapsedTime / self.duration);
            }
            self.update();
            self.finished = self.finished || endFlag;
            return endFlag;
        },

        /**
         * 数值插值函数
         * @param {Number} from 源值
         * @param {Number} to 目的值
         * @param {Number} pos 当前位置，从 easing 得到 0~1
         * @return {Number} 当前值
         */
        interpolate:function (from, to, pos) {
            // 默认只对数字进行 easing
            if (S.isNumber(from) &&
                S.isNumber(to)) {
                return (from + (to - from) * pos).toFixed(3);
            } else {
                return undefined;
            }
        },

        update:function () {
            var self = this,
                prop = self.prop,
                elem = self.elem,
                from = self.from,
                to = self.to,
                val = self.interpolate(from, to, self.pos);

            if (val === undefined) {
                // 插值出错，直接设置为最终值
                if (!self.finished) {
                    self.finished = 1;
                    DOM.css(elem, prop, to);
                    S.log(self.prop + " update directly ! : " + val + " : " + from + " : " + to);
                }
            } else {
                val += self.unit;
                if (isAttr(elem, prop)) {
                    DOM.attr(elem, prop, val, 1);
                } else {
                    DOM.css(elem, prop, val);
                }
            }
        },

        /**
         * current value
         */
        cur:function () {
            var self = this,
                prop = self.prop,
                elem = self.elem;
            if (isAttr(elem, prop)) {
                return DOM.attr(elem, prop, undefined, 1);
            }
            var parsed,
                r = DOM.css(elem, prop);
            // Empty strings, null, undefined and "auto" are converted to 0,
            // complex values such as "rotate(1rad)" or "0px 10px" are returned as is,
            // simple values such as "10px" are parsed to Float.
            return isNaN(parsed = parseFloat(r)) ?
                !r || r === "auto" ? 0 : r
                : parsed;
        }
    });

    function isAttr(elem, prop) {
        // support scrollTop/Left now!
        if ((!elem.style || elem.style[ prop ] == null) &&
            DOM.attr(elem, prop, undefined, 1) != null) {
            return 1;
        }
        return 0;
    }

    Fx.Factories = {};

    Fx.getFx = function (cfg) {
        var Constructor = Fx.Factories[cfg.prop] || Fx;
        return new Constructor(cfg);
    };

    return Fx;

}, {
    requires:['dom']
});
/**
 * TODO
 * 支持 transform ,ie 使用 matrix
 *  - http://shawphy.com/2011/01/transformation-matrix-in-front-end.html
 *  - http://www.cnblogs.com/winter-cn/archive/2010/12/29/1919266.html
 *  - 标准：http://www.zenelements.com/blog/css3-transform/
 *  - ie: http://www.useragentman.com/IETransformsTranslator/
 *  - wiki: http://en.wikipedia.org/wiki/Transformation_matrix
 *  - jq 插件: http://plugins.jquery.com/project/2d-transform
 **//**
 * @fileOverview single timer for the whole anim module
 * @author  yiminghe@gmail.com
 */
KISSY.add("anim/manager", function(S) {
    var stamp = S.stamp;

    return {
        interval:15,
        runnings:{},
        timer:null,
        start:function(anim) {
            var self = this,
                kv = stamp(anim);
            if (self.runnings[kv]) {
                return;
            }
            self.runnings[kv] = anim;
            self.startTimer();
        },
        stop:function(anim) {
            this.notRun(anim);
        },
        notRun:function(anim) {
            var self = this,
                kv = stamp(anim);
            delete self.runnings[kv];
            if (S.isEmptyObject(self.runnings)) {
                self.stopTimer();
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
                    if (!self.runFrames()) {
                        self.timer = 0;
                        self.startTimer();
                    } else {
                        self.stopTimer();
                    }
                }, self.interval);
            }
        },
        stopTimer:function() {
            var self = this,
                t = self.timer;
            if (t) {
                clearTimeout(t);
                self.timer = 0;
            }
        },
        runFrames:function() {
            var self = this,
                done = 1,
                runnings = self.runnings;
            for (var r in runnings) {
                if (runnings.hasOwnProperty(r)) {
                    done = 0;
                    runnings[r]._frame();
                }
            }
            return done;
        }
    };
});/**
 * @fileOverview queue of anim objects
 * @author yiminghe@gmail.com
 */
KISSY.add("anim/queue", function(S, DOM) {

    var /*队列集合容器*/
        queueCollectionKey = S.guid("ks-queue-" + S.now() + "-"),
        /*默认队列*/
        queueKey = S.guid("ks-queue-" + S.now() + "-"),
        // 当前队列是否有动画正在执行
        processing = "...";

    function getQueue(elem, name, readOnly) {
        name = name || queueKey;

        var qu,
            quCollection = DOM.data(elem, queueCollectionKey);

        if (!quCollection && !readOnly) {
            DOM.data(elem, queueCollectionKey, quCollection = {});
        }

        if (quCollection) {
            qu = quCollection[name];
            if (!qu && !readOnly) {
                qu = quCollection[name] = [];
            }
        }

        return qu;
    }

    function removeQueue(elem, name) {
        name = name || queueKey;
        var quCollection = DOM.data(elem, queueCollectionKey);
        if (quCollection) {
            delete quCollection[name];
        }
        if (S.isEmptyObject(quCollection)) {
            DOM.removeData(elem, queueCollectionKey);
        }
    }

    var q = {

        queueCollectionKey:queueCollectionKey,

        queue:function(anim) {
            var elem = anim.elem,
                name = anim.config.queue,
                qu = getQueue(elem, name);
            qu.push(anim);
            if (qu[0] !== processing) {
                q.dequeue(anim);
            }
            return qu;
        },

        remove:function(anim) {
            var elem = anim.elem,
                name = anim.config.queue,
                qu = getQueue(elem, name, 1),index;
            if (qu) {
                index = S.indexOf(anim, qu);
                if (index > -1) {
                    qu.splice(index, 1);
                }
            }
        },

        removeQueues:function(elem) {
            DOM.removeData(elem, queueCollectionKey);
        },

        removeQueue:removeQueue,

        dequeue:function(anim) {
            var elem = anim.elem,
                name = anim.config.queue,
                qu = getQueue(elem, name, 1),
                nextAnim = qu && qu.shift();

            if (nextAnim == processing) {
                nextAnim = qu.shift();
            }

            if (nextAnim) {
                qu.unshift(processing);
                nextAnim._runInternal();
            } else {
                // remove queue data
                removeQueue(elem, name);
            }
        }

    };
    return q;
}, {
    requires:['dom']
});
/*
Copyright 2012, KISSY UI Library v1.30dev
MIT Licensed
build time: Apr 5 19:33
*/
/**
 * @fileOverview   anim-node-plugin
 * @author  yiminghe@gmail.com,
 *          lifesinger@gmail.com,
 *          qiaohua@taobao.com,
 *
 */
KISSY.add('node/anim', function(S, DOM, Anim, Node, undefined) {

    var FX = [
        // height animations
        [ "height", "marginTop", "marginBottom", "paddingTop", "paddingBottom" ],
        // width animations
        [ "width", "marginLeft", "marginRight", "paddingLeft", "paddingRight" ],
        // opacity animations
        [ "opacity" ]
    ];

    function getFxs(type, num, from) {
        var ret = [],
            obj = {};
        for (var i = from || 0; i < num; i++) {
            ret.push.apply(ret, FX[i]);
        }
        for (i = 0; i < ret.length; i++) {
            obj[ret[i]] = type;
        }
        return obj;
    }

    S.augment(Node, {
        animate:function() {
            var self = this,
                args = S.makeArray(arguments);
            S.each(self, function(elem) {
                Anim.apply(undefined, [elem].concat(args)).run();
            });
            return self;
        },
        stop:function(end, clearQueue, queue) {
            var self = this;
            S.each(self, function(elem) {
                Anim.stop(elem, end, clearQueue, queue);
            });
            return self;
        },
        isRunning:function() {
            var self = this;
            for (var i = 0; i < self.length; i++) {
                if (Anim.isRunning(self[i])) {
                    return 1;
                }
            }
            return 0;
        }
    });

    S.each({
            show: getFxs("show", 3),
            hide: getFxs("hide", 3),
            toggle:getFxs("toggle", 3),
            fadeIn: getFxs("show", 3, 2),
            fadeOut: getFxs("hide", 3, 2),
            fadeToggle:getFxs("toggle", 3, 2),
            slideDown: getFxs("show", 1),
            slideUp: getFxs("hide", 1),
            slideToggle:getFxs("toggle", 1)
        },
        function(v, k) {
            Node.prototype[k] = function(speed, callback, easing) {
                var self = this;
                // 没有参数时，调用 DOM 中的对应方法
                if (DOM[k] && !speed) {
                    DOM[k](self);
                } else {
                    S.each(self, function(elem) {
                        Anim(elem, v, speed, easing || 'easeOut', callback).run();
                    });
                }
                return self;
            };
        });

}, {
    requires:["dom","anim","./base"]
});
/**
 * 2011-11-10
 *  - 重写，逻辑放到 Anim 模块，这边只进行转发
 *
 * 2011-05-17
 *  - 承玉：添加 stop ，随时停止动画
 *
 *  TODO
 *  - anim needs queue mechanism ?
 */
/**
 * @fileOverview import methods from DOM to NodeList.prototype
 * @author  yiminghe@gmail.com
 */
KISSY.add('node/attach', function (S, DOM, Event, NodeList, undefined) {

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
            "unselectable",

            "wrap",
            "wrapAll",
            "replaceWith",
            "wrapInner",
            "unwrap"
        ],
        // if return array ,need transform to nodelist
        DOM_INCLUDES_NORM_NODE_LIST = [
            "filter",
            "first",
            "last",
            "parent",
            "closest",
            "next",
            "prev",
            "clone",
            "siblings",
            "contents",
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
        EVENT_INCLUDES = [
            "on",
            "detach",
            "fire",
            "fireHandler",
            "delegate",
            "undelegate"
        ];


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

    S.each(DOM_INCLUDES_NORM, function (k) {
        NLP[k] = function () {
            var args = makeArray(arguments);
            return accessNorm(k, this, args);
        };
    });

    S.each(DOM_INCLUDES_NORM_NODE_LIST, function (k) {
        NLP[k] = function () {
            var args = makeArray(arguments);
            return accessNormList(k, this, args);
        };
    });

    S.each(DOM_INCLUDES_NORM_IF, function (index, k) {
        NLP[k] = function () {
            var args = makeArray(arguments);
            return accessNormIf(k, this, index, args);
        };
    });

    S.each(EVENT_INCLUDES, function (k) {
        NLP[k] = function () {
            var self = this,
                args = makeArray(arguments);
            args.unshift(self);
            Event[k].apply(Event, args);
            return self;
        }
    });

}, {
    requires:["dom", "event", "./base"]
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
 * @fileOverview definition for node and nodelist
 * @author yiminghe@gmail.com,lifesinger@gmail.com
 */
KISSY.add("node/base", function (S, DOM, undefined) {

    var AP = Array.prototype,
        slice = AP.slice,
        push = AP.push,
        makeArray = S.makeArray,
        isNodeList = DOM._isNodeList;

    /**
     * @class The NodeList class provides a wrapper for manipulating DOM Node.
     * use KISSY.all/one to retrieve NodeList instances
     * @name NodeList
     */
    function NodeList(html, props, ownerDocument) {
        var self = this,
            domNode;

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
                push.apply(this, makeArray(domNode.childNodes));
                return undefined;
            }
        }

        else if (S.isArray(html) || isNodeList(html)) {
            push.apply(self, makeArray(html));
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
        length:0,


        item:function (index) {
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

        add:function (selector, context, index) {
            if (S.isNumber(context)) {
                index = context;
                context = undefined;
            }
            var list = NodeList.all(selector, context).getDOMNodes(),
                ret = new NodeList(this);
            if (index === undefined) {
                push.apply(ret, list);
            } else {
                var args = [index, 0];
                args.push.apply(args, list);
                AP.splice.apply(ret, args);
            }
            return ret;
        },

        slice:function (start, end) {
            // ie<9 : [1,2].slice(-2,undefined) => []
            // ie<9 : [1,2].slice(-2) => []
            // fix #85
            return new NodeList(slice.apply(this, arguments));
        },

        /**
         * Retrieves the DOMNodes.
         */
        getDOMNodes:function () {
            return slice.call(this);
        },

        /**
         * Applies the given function to each Node in the NodeList.
         * @param fn The function to apply. It receives 3 arguments: the current node instance, the node's index, and the NodeList instance
         * @param [context] An optional context to apply the function with Default context is the current NodeList instance
         */
        each:function (fn, context) {
            var self = this;

            S.each(self, function (n, i) {
                n = new NodeList(n);
                return fn.call(context || n, n, i, self);
            });

            return self;
        },
        /**
         * Retrieves the DOMNode.
         */
        getDOMNode:function () {
            return this[0];
        },

        /**
         * stack sub query
         */
        end:function () {
            var self = this;
            return self.__parent || self;
        },

        all:function (selector) {
            var ret, self = this;
            if (self.length > 0) {
                ret = NodeList.all(selector, self);
            } else {
                ret = new NodeList();
            }
            ret.__parent = self;
            return ret;
        },

        one:function (selector) {
            var self = this, all = self.all(selector),
                ret = all.length ? all.slice(0, 1) : null;
            if (ret) {
                ret.__parent = self;
            }
            return ret;
        }
    });

    S.mix(NodeList, {
        /**
         * 查找位于上下文中并且符合选择器定义的节点列表或根据 html 生成新节点
         * @param {String|HTMLElement[]|NodeList} selector html 字符串或<a href='http://docs.kissyui.com/docs/html/api/core/dom/selector.html'>选择器</a>或节点列表
         * @param {String|Array<HTMLElement>|NodeList|HTMLElement|Document} [context] 上下文定义
         * @returns {NodeList} 节点列表对象
         */
        all:function (selector, context) {
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
        one:function (selector, context) {
            var all = NodeList.all(selector, context);
            return all.length ? all.slice(0, 1) : null;
        }
    });

    S.mix(NodeList, DOM._NODE_TYPE);

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
 * @fileOverview node
 * @author yiminghe@gmail.com
 */
KISSY.add("node", function (S, Event, Node) {
    Node.KeyCodes = Event.KeyCodes;
    S.mix(S, {
        Node:Node,
        NodeList:Node,
        one:Node.one,
        all:Node.all
    });
    return Node;
}, {
    requires:[
        "event",
        "node/base",
        "node/attach",
        "node/override",
        "node/anim"]
});/**
 * @fileOverview overrides methods in NodeList.prototype
 * @author yiminghe@gmail.com
 */
KISSY.add("node/override", function (S, DOM, Event, NodeList) {

    var NLP = NodeList.prototype;

    /**
     * append(node ,parent) : 参数顺序反过来了
     * appendTo(parent,node) : 才是正常
     *
     */
    S.each(['append', 'prepend', 'before', 'after'], function (insertType) {
        NLP[insertType] = function (html) {
            var newNode = html, self = this;
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

    S.each(["wrap", "wrapAll", "replaceWith", "wrapInner"], function (fixType) {
        var orig = NLP[fixType];
        NLP[fixType] = function (others) {
            var self = this;
            if (S.isString(others)) {
                others = NodeList.all(others, self[0].ownerDocument);
            }
            return orig.call(self, others);
        };
    })

}, {
    requires:["dom", "event", "./base", "./attach"]
});

/**
 * 2011-04-05 yiminghe@gmail.com
 * - 增加 wrap/wrapAll/replaceWith/wrapInner/unwrap/contents
 *
 * 2011-05-24
 * - 承玉：
 * - 重写 NodeList 的某些方法
 * - 添加 one ,all ，从当前 NodeList 往下开始选择节点
 * - 处理 append ,prepend 和 DOM 的参数实际上是反过来的
 * - append/prepend 参数是节点时，如果当前 NodeList 数量 > 1 需要经过 clone，因为同一节点不可能被添加到多个节点中去（NodeList）
 */

KISSY.use("ua,dom,event,node,json,ajax,anim,base,cookie");
