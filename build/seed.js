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
