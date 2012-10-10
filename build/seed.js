/*
Copyright 2012, KISSY UI Library v1.40dev
MIT Licensed
build time: Oct 10 14:09
*/
/**
 * @ignore
 * @fileOverview A seed where KISSY grows up from , KISS Yeah !
 * @author lifesinger@gmail.com, yiminghe@gmail.com
 */
var KISSY = (function (undefined) {
    /**
     * The KISSY global namespace object. you can use
     *
     * for example:
     *      @example
     *      KISSY.each/mix
     *
     * to do basic operation. or
     *
     * for example:
     *      @example
     *      KISSY.use('overlay,node', function(S, Overlay, Node){
     *          //
     *      });
     *
     * to do complex task with modules.
     * @singleton
     * @class KISSY
     */

    function hasOwnProperty(o, p) {
        return Object.prototype.hasOwnProperty.call(o, p);
    }

    var host = this,
        MIX_CIRCULAR_DETECTION = '__MIX_CIRCULAR',
        hasEnumBug = !({toString: 1}.propertyIsEnumerable('toString')),
        enumProperties = [
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
             * @method
             * @param {Object} r the augmented object
             * @param {Object} s the object need to augment
             * @param {Boolean|Object} [ov=true] whether overwrite existing property or config.
             * @param {Boolean} [ov.overwrite=true] whether overwrite existing property.
             * @param {String[]} [ov.whitelist] array of white-list properties
             * @param {Boolean}[ov.deep=false] whether recursive mix if encounter object.
             * @param {String[]} [wl] array of white-list properties
             * @param [deep=false] {Boolean} whether recursive mix if encounter object.
             * @return {Object} the augmented object
             *
             * for example:
             *     @example
             *     var t = {};
             *     S.mix({x: {y: 2, z: 4}}, {x: {y: 3, a: t}}, {deep: true}) => {x: {y: 3, z: 4, a: {}}}, a !== t
             *     S.mix({x: {y: 2, z: 4}}, {x: {y: 3, a: t}}, {deep: true, overwrite: false}) => {x: {y: 2, z: 4, a: {}}}, a !== t
             *     S.mix({x: {y: 2, z: 4}}, {x: {y: 3, a: t}}, 1) => {x: {y: 3, a: t}}
             */
            mix: function (r, s, ov, wl, deep) {
                if (typeof ov === 'object') {
                    wl = ov['whitelist'];
                    deep = ov['deep'];
                    ov = ov['overwrite'];
                }
                var cache = [], c, i = 0;
                mixInternal(r, s, ov, wl, deep, cache);
                while (c = cache[i++]) {
                    delete c[MIX_CIRCULAR_DETECTION];
                }
                return r;
            }
        },

        mixInternal = function (r, s, ov, wl, deep, cache) {
            if (!s || !r) {
                return r;
            }

            if (ov === undefined) {
                ov = true;
            }

            var i = 0, p, len;

            // 记录循环标志
            s[MIX_CIRCULAR_DETECTION] = r;

            // 记录被记录了循环标志的对像
            cache.push(s);

            if (wl && (len = wl.length)) {
                for (; i < len; i++) {
                    p = wl[i];
                    if (p in s) {
                        _mix(p, r, s, ov, wl, deep, cache);
                    }
                }
            } else {
                for (p in s) {
                    if (p != MIX_CIRCULAR_DETECTION) {
                        // no hasOwnProperty judge !
                        _mix(p, r, s, ov, wl, deep, cache);
                    }
                }

                // fix #101
                if (hasEnumBug) {
                    for (; p = enumProperties[i++];) {
                        if (hasOwnProperty(s, p)) {
                            _mix(p, r, s, ov, wl, deep, cache);
                        }
                    }
                }
            }
            return r;
        },

        _mix = function (p, r, s, ov, wl, deep, cache) {
            // 要求覆盖
            // 或者目的不存在
            // 或者深度mix
            if (ov || !(p in r) || deep) {
                var target = r[p],
                    src = s[p];
                // prevent never-end loop
                if (target === src) {
                    return;
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
                        mixInternal(clone, src, ov, wl, true, cache);
                    }
                } else if (src !== undefined && (ov || !(p in r))) {
                    r[p] = src;
                }
            }
        },

    // If KISSY is already defined, the existing KISSY object will not
    // be overwritten so that defined namespaces are preserved.
        seed = {},

        guid = 0,
        EMPTY = '';

    // The host of runtime environment. specify by user's seed or <this>,
    // compatibled for  '<this> is null' in unknown engine.
    seed.Env = seed.Env || {};
    seed.Env.host = host;

    // shortcut and meta for seed.
    // override previous kissy
    var S = meta.mix(seed, meta);

    S.mix(S,
        {
            /**
             * Config function.
             * @private
             */
            configs: (S.configs || {}),

            /**
             * The version of the library.
             * NOTICE: '1.40dev' will replace with current version when compressing.
             * @type {String}
             */
            version: '1.40dev',

            /**
             * Returns a new object containing all of the properties of
             * all the supplied objects. The properties from later objects
             * will overwrite those in earlier objects. Passing in a
             * single object will create a shallow copy of it.
             * @param {...Object} var_args objects need to be merged
             * @return {Object} the new merged object
             */
            merge: function (var_args) {
                var_args = S.makeArray(arguments);
                var o = {}, i, l = var_args.length;
                for (i = 0; i < l; i++) {
                    S.mix(o, var_args[i]);
                }
                return o;
            },

            /**
             * Applies prototype properties from the supplier to the receiver.
             * @param   {Object} r received object
             * @param   {...Object} s1 object need to  augment
             *          {Boolean} [ov=true] whether overwrite existing property
             *          {String[]} [wl] array of white-list properties
             * @return  {Object} the augmented object
             */
            augment: function (r, s1) {
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
             * @param {Object} [px] prototype properties to add/override
             * @param {Object} [sx] static properties to add/override
             * @return r {Object}
             */
            extend: function (r, s, px, sx) {
                if (!s || !r) {
                    return r;
                }

                var create = Object.create ?
                        function (proto, c) {
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

            // The KISSY System Framework

            /**
             * Returns the namespace specified and creates it if it doesn't exist. Be careful
             * when naming packages. Reserved words may work in some browsers and not others.
             *
             * for example:
             *      @example
             *      S.namespace('KISSY.app'); // returns KISSY.app
             *      S.namespace('app.Shop'); // returns KISSY.app.Shop
             *      S.namespace('TB.app.Shop', true); // returns TB.app.Shop
             *
             * @return {Object}  A reference to the last namespace object created
             */
            namespace: function () {
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
             * set KISSY configuration
             * @param {Object|String}   configName Config object or config key.
             * @param {String} configName.base   KISSY 's base path. Default: get from kissy(-min).js or seed(-min).js
             * @param {String} configName.tag    KISSY 's timestamp for native module. Default: KISSY 's build time.
             * @param {Boolean} configName.debug     whether to enable debug mod.
             * @param {Boolean} configName.combine   whether to enable combo.
             * @param {Object} configName.packages Packages definition with package name as the key.
             * @param {String} configName.packages.base    Package base path.
             * @param {String} configName.packages.tag     Timestamp for this package's module file.
             * @param {String} configName.packages.debug     Whether force debug mode for current package.
             * @param {String} configName.packages.combine     Whether allow combine for current package modules.
             * @param {Array[]} configName.map file map      File url map configs.
             * @param {Array[]} configName.map.0     A single map rule.
             * @param {RegExp} configName.map.0.0    A regular expression to match url.
             * @param {String|Function} configName.map.0.1   Replacement for String.replace.
             * @param [configValue] config value.
             *
             * for example:
             *     @example
             *     KISSY.config({
             *      combine: true,
             *      base: '',
             *      packages: {
             *          'gallery': {
             *              base: 'http://a.tbcdn.cn/s/kissy/gallery/'
             *          }
             *      },
             *      modules: {
             *          'gallery/x/y': {
             *              requires: ['gallery/x/z']
             *          }
             *      }
             *     });
             */
            config: function (configName, configValue) {
                var cfg,
                    r,
                    self = this,
                    fn,
                    Config = S.Config,
                    configs = S.configs;
                if (S.isObject(configName)) {
                    S.each(configName, function (configValue, p) {
                        fn = configs[p];
                        if (fn) {
                            fn.call(self, configValue);
                        } else {
                            Config[p] = configValue;
                        }
                    });
                } else {
                    cfg = configs[configName];
                    if (configValue === undefined) {
                        if (cfg) {
                            r = cfg.call(self);
                        } else {
                            r = Config[configName];
                        }
                    } else {
                        if (cfg) {
                            r = cfg.call(self, configValue);
                        } else {
                            Config[configName] = configValue;
                        }
                    }
                }
                return r;
            },

            /**
             * Prints debug info.
             * @param msg {String} the message to log.
             * @param {String} [cat] the log category for the message. Default
             *        categories are 'info', 'warn', 'error', 'time' etc.
             * @param {String} [src] the source of the the message (opt)
             */
            log: function (msg, cat, src) {
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
            error: function (msg) {
                if (S.Config.debug) {
                    throw msg;
                }
            },

            /*
             * Generate a global unique id.
             * @param {String} [pre] guid prefix
             * @return {String} the guid
             */
            guid: function (pre) {
                return (pre || EMPTY) + guid++;
            },

            /**
             * Get all the property names of o as array
             * @param {Object} o
             * @return {Array}
             */
            keys: function (o) {
                var result = [], p;

                for (p in o) {
                    result.push(p);
                }

                if (hasEnumBug) {
                    S.each(enumProperties, function (name) {
                        if (hasOwnProperty(o, name)) {
                            result.push(name);
                        }
                    });
                }

                return result;
            }
        });


    // Initializes
    (function () {
        var c;
        /**
         * KISSY Environment.
         * @private
         * @type {Object}
         */
        S.Env = S.Env || {};

        S.Env.nodejs = (typeof require === 'function') &&
            (typeof exports === 'object');

        /**
         * KISSY Config.
         * If load kissy.js, Config.debug defaults to true.
         * Else If load kissy-min.js, Config.debug defaults to false.
         * @private
         * @property {Object} Config
         * @property {Boolean} Config.debug
         * @member KISSY
         */
        c = S.Config = S.Config || {};

        c.debug = '@DEBUG@';

        /**
         * The build time of the library.
         * NOTICE: '20121010140939' will replace with current timestamp when compressing.
         * @private
         * @type {String}
         */
        S.__BUILD_TIME = '20121010140939';
    })();

    // exports for nodejs
    if (S.Env.nodejs) {
        S.KISSY = S;
        module.exports = S;
    }

    return S;

})();/**
 * @ignore
 * @fileOverview   lang
 * @author  lifesinger@gmail.com, yiminghe@gmail.com
 * @description this code can run in any ecmascript compliant environment
 */
(function (S, undefined) {

    function hasOwnProperty(o, p) {
        return Object.prototype.hasOwnProperty.call(o, p);
    }

    var TRUE = true,
        FALSE = false,
        OP = Object.prototype,
        toString = OP.toString,
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
            '&amp;': '&',
            '&gt;': '>',
            '&lt;': '<',
            '&#x60;': '`',
            '&#x2F;': '/',
            '&quot;': '"',
            '&#x27;': "'"
        },
        reverseEntities = {},
        escapeReg,
        unEscapeReg,
    // - # $ ^ * ( ) + [ ] { } | \ , . ?
        escapeRegExp = /[\-#$\^*()+\[\]{}|\\,.?\s]/g;
    (function () {
        for (var k in htmlEntities) {

            reverseEntities[htmlEntities[k]] = k;

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
        return escapeReg = new RegExp(str, 'g');
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
        return unEscapeReg = new RegExp(str, 'g');
    }


    function isValidParamValue(val) {
        var t = typeof val;
        // If the type of val is null, undefined, number, string, boolean, return true.
        return val == null || (t !== 'object' && t !== 'function');
    }


    S.mix(S,
        {

            /**
             * stamp a object by guid
             * @param {Object} o object needed to be stamped
             * @param {Boolean} [readOnly] while set marker on o if marker does not exist
             * @param {String} [marker] the marker will be set on Object
             * @return {String} guid associated with this object
             * @member KISSY
             */
            stamp: function (o, readOnly, marker) {
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
             * @member KISSY
             */
            noop: function () {
            },

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
             * whether o === null
             * @param o
             * @member KISSY
             */
            isNull: function (o) {
                return o === null;
            },

            /**
             * whether o === undefined
             * @param o
             * @member KISSY
             */
            isUndefined: function (o) {
                return o === undefined;
            },

            /**
             * Checks to see if an object is empty.
             * @member KISSY
             */
            isEmptyObject: function (o) {
                for (var p in o) {
                    if (p !== undefined) {
                        return FALSE;
                    }
                }
                return TRUE;
            },

            /**
             * Checks to see if an object is a plain object (created using '{}'
             * or 'new Object()' but not 'new FunctionClass()').
             * @member KISSY
             */
            isPlainObject: function (obj) {
                // credits to jq

                // Must be an Object.
                // Because of IE, we also have to check the presence of the constructor property.
                // Make sure that DOM nodes and window objects don't pass through, as well
                if (!obj || S.type(obj) !== "object" || obj.nodeType || obj.window == obj) {
                    return false;
                }

                try {
                    // Not own constructor property must be Object
                    if (obj.constructor &&
                        !hasOwnProperty(obj, "constructor") &&
                        !hasOwnProperty(obj.constructor.prototype, "isPrototypeOf")) {
                        return false;
                    }
                } catch (e) {
                    // IE8,9 Will throw exceptions on certain host objects #9897
                    return false;
                }

                // Own properties are enumerated firstly, so to speed up,
                // if last one is own, then all properties are own.

                var key;
                for (key in obj) {
                }

                return key === undefined || hasOwnProperty(obj, key);
            },


            /**
             * Checks to see whether two object are equals.
             * @param a 比较目标1
             * @param b 比较目标2
             * @return {Boolean} a.equals(b)
             * @member KISSY
             */
            equals: function (a, b, /*internal use*/mismatchKeys, /*internal use*/mismatchValues) {
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
                if (typeof a === 'object' && typeof b === 'object') {
                    return compareObjects(a, b, mismatchKeys, mismatchValues);
                }
                // Straight check
                return (a === b);
            },

            /**
             * Creates a deep copy of a plain object or array. Others are returned untouched.
             * @param input
             * @member KISSY
             * @param {Function} [filter] filter function
             * @return {Object} the new cloned object
             * @see http://www.w3.org/TR/html5/common-dom-interfaces.html#safe-passing-of-structured-data
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
                            S.log('delete CLONE_MARKER error : ');
                            v[CLONE_MARKER] = undefined;
                        }
                    }
                });
                memory = null;
                return ret;
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
                    return str == null ? EMPTY : str.toString().replace(RE_TRIM, EMPTY);
                },

            /**
             * Substitutes keywords in a string using an object/array.
             * Removes undefined keywords and ignores escaped keywords.
             * @param {String} str template string
             * @param {Object} o json data
             * @member KISSY
             * @param {RegExp} [regexp] to match a piece of template string
             */
            substitute: function (str, o, regexp) {
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
             * @member KISSY
             */
            each: function (object, fn, context) {
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
             * @method
             * @member KISSY
             * @param {Array} arr the array of items where item will be search
             * @return {number} item's index in array
             */
            indexOf: indexOf ?
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
             * @method
             * @param item individual item to be searched
             * @param {Array} arr the array of items where item will be search
             * @return {number} item's last index in array
             * @member KISSY
             */
            lastIndexOf: (lastIndexOf) ?
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
             * @param [override] {Boolean} if override is true, S.unique([a, b, a]) => [b, a].
             * if override is false, S.unique([a, b, a]) => [a, b]
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
             * function returned true for.
             * @member KISSY
             * @method
             * @param arr {Array} the array to iterate
             * @param fn {Function} the function to execute on each item
             * @param [context] {Object} optional context object
             * @return {Array} The items on which the supplied function returned true.
             * If no items matched an empty array is returned.
             * @member KISSY
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
             * @see https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Array/map
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
             * @member KISSY
             */
            reduce: /*
             NaN ?
             reduce ? function(arr, callback, initialValue) {
             return arr.reduce(callback, initialValue);
             } : */function (arr, callback, initialValue) {
                var len = arr.length;
                if (typeof callback !== 'function') {
                    throw new TypeError('callback is not function!');
                }

                // no value to return if no initial value and an empty array
                if (len === 0 && arguments.length == 2) {
                    throw new TypeError('arguments invalid');
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
             * Creates a new function that, when called, itself calls this function in the context of the provided this value,
             * with a given sequence of arguments preceding any provided when the new function was called.
             * @see https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Function/bind
             * @param {Function} fn internal called function
             * @param {Object} obj context in which fn runs
             * @param {...*} arg1 extra arguments
             * @member KISSY
             * @return {Function} new function with context and arguments
             */
            bind: function (fn, obj, arg1) {
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
             * @method
             * @see  https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Date/now
             * http://j-query.blogspot.com/2011/02/timing-ecmascript-5-datenow-function.html
             * http://kangax.github.com/es5-compat-table/
             * @member KISSY
             * @return {Number} current time
             */
            now: Date.now || function () {
                return +new Date();
            },
            /**
             * frequently used in taobao cookie about nick
             * @member KISSY
             * @return {String} un-unicode string.
             */
            fromUnicode: function (str) {
                return str.replace(/\\u([a-f\d]{4})/ig, function (m, u) {
                    return  String.fromCharCode(parseInt(u, HEX_BASE));
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
            },

            /**
             * get escaped string from html
             * @see   http://yiminghe.javaeye.com/blog/788929
             *        http://wonko.com/post/html-escaping
             * @param str {string} text2html show
             * @member KISSY
             * @return {String} escaped html
             */
            escapeHTML: function (str) {
                return (str + '').replace(getEscapeReg(), function (m) {
                    return reverseEntities[m];
                });
            },

            /**
             * get escaped regexp string for construct regexp
             * @param str
             * @member KISSY
             * @return {String} escaped regexp
             */
            escapeRegExp: function (str) {
                return str.replace(escapeRegExp, '\\$&');
            },

            /**
             * un-escape html to string
             * @param str {string} html2text
             * @member KISSY
             * @return {String} un-escaped html
             */
            unEscapeHTML: function (str) {
                return str.replace(getUnEscapeReg(), function (m, n) {
                    return htmlEntities[m] || String.fromCharCode(+n);
                });
            },
            /**
             * Converts object to a true array.
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

                // The strings and functions also have 'length'
                if (typeof o.length !== 'number'
                    // form.elements in ie78 has nodeName 'form'
                    // then caution select
                    // || o.nodeName
                    // window
                    || o.alert
                    || S.isString(o)
                    || S.isFunction(o)) {
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
             *
             * for example:
             *     @example
             *     {foo: 1, bar: 2}    // -> 'foo=1&bar=2'
             *     {foo: 1, bar: [2, 3]}    // -> 'foo=1&bar=2&bar=3'
             *     {foo: '', bar: 2}    // -> 'foo=&bar=2'
             *     {foo: undefined, bar: 2}    // -> 'foo=undefined&bar=2'
             *     {foo: true, bar: 2}    // -> 'foo=true&bar=2'
             *
             * @param {Object} o json data
             * @param {String} [sep='&'] separator between each pair of data
             * @param {String} [eq='='] separator between key and value of data
             * @param {Boolean} [serializeArray =true] whether add '[]' to array key of data
             * @return {String}
             * @member KISSY
             */
            param: function (o, sep, eq, serializeArray) {
                if (!S.isPlainObject(o)) {
                    return EMPTY;
                }
                sep = sep || SEP;
                eq = eq || EQ;
                if (S.isUndefined(serializeArray)) {
                    serializeArray = TRUE;
                }
                var buf = [], key, i, v, len, val;
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
                    }
                    // val is not empty array
                    else if (S.isArray(val) && val.length) {
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
                if (!S.isString(str) || !(str = S.trim(str))) {
                    return {};
                }
                sep = sep || SEP;
                eq = eq || EQ;
                var ret = {},
                    eqIndex,
                    pairs = str.split(sep),
                    key, val,
                    i = 0, len = pairs.length;

                for (; i < len; ++i) {
                    eqIndex = pairs[i].indexOf(eq);
                    if (eqIndex == -1) {
                        key = decode(pairs[i]);
                        val = undefined;
                    } else {
                        key = decode(pairs[i].substring(0, eqIndex));
                        val = pairs[i].substring(eqIndex + 1);
                        try {
                            val = decode(val);
                        } catch (e) {
                            S.log(e + 'decodeURIComponent error : ' + val, 'error');
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
             * Executes the supplied function in the context of the supplied
             * object 'when' milliseconds later. Executes the function a
             * single time unless periodic is set to true.
             *
             * @param fn {Function|String} the function to execute or the name of the method in
             * the 'o' object to execute.
             *
             * @param when {Number} the number of milliseconds to wait until the fn is executed.
             *
             * @param {Boolean} [periodic] if true, executes continuously at supplied interval
             * until canceled.
             *
             * @param {Object} [context] the context object.
             *
             * @param [data] that is provided to the function. This accepts either a single
             * item or an array. If an array is provided, the function is executed with
             * one parameter for each array item. If you need to pass a single array
             * parameter, it needs to be wrapped in an array [myarray].
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
                return ind >= 0 && str.indexOf(suffix, ind) == ind;
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
        {
            /**
             * test whether o is boolean
             * @method
             * @param  o
             * @return {Boolean}
             * @member KISSY
             */
            isBoolean: isValidParamValue,
            /**
             * test whether o is number
             * @method
             * @param  o
             * @return {Boolean}
             * @member KISSY
             */
            isNumber: isValidParamValue,
            /**
             * test whether o is String
             * @method
             * @param  o
             * @return {Boolean}
             * @member KISSY
             */
            isString: isValidParamValue,
            /**
             * test whether o is function
             * @method
             * @param  o
             * @return {Boolean}
             * @member KISSY
             */
            isFunction: isValidParamValue,
            /**
             * test whether o is Array
             * @method
             * @param  o
             * @return {Boolean}
             * @member KISSY
             */
            isArray: isValidParamValue,
            /**
             * test whether o is Date
             * @method
             * @param  o
             * @return {Boolean}
             * @member KISSY
             */
            isDate: isValidParamValue,
            /**
             * test whether o is RegExp
             * @method
             * @param  o
             * @return {Boolean}
             * @member KISSY
             */
            isRegExp: isValidParamValue,
            /**
             * test whether o is Object
             * @method
             * @param  o
             * @return {Boolean}
             * @member KISSY
             */
            isObject: isValidParamValue
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
        } else if (typeof input === 'object') {
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
            mismatchValues.push('arrays were not the same length');
        }
        delete a[COMPARE_MARKER];
        delete b[COMPARE_MARKER];
        return (mismatchKeys.length === 0 && mismatchValues.length === 0);
    }

})(KISSY);
/**
 * @ignore
 * @fileOverview implement Promise specification by KISSY
 * @author yiminghe@gmail.com
 */
(function (S, undefined) {

    var PROMISE_VALUE = '__promise_value',
        PROMISE_PENDINGS = '__promise_pendings';

    /**
     * two effects:
     * 1. call fulfilled with immediate value
     * 2. push fulfilled in right promise
     * @ignore
     * @param fulfilled
     * @param rejected
     */
    function promiseWhen(promise, fulfilled, rejected) {
        // simply call rejected
        if (promise instanceof Reject) {
            // if there is a rejected , should always has! see when()
            if (!rejected) {
                S.error('no rejected callback!');
            }
            return rejected(promise[PROMISE_VALUE]);
        }

        var v = promise[PROMISE_VALUE],
            pendings = promise[PROMISE_PENDINGS];

        // unresolved
        // pushed to pending list
        if (pendings) {
            pendings.push([fulfilled, rejected]);
        }
        // rejected or nested promise
        else if (isPromise(v)) {
            promiseWhen(v, fulfilled, rejected);
        } else {
            // fulfilled value
            // normal value represents ok
            // need return user's return value
            // if return promise then forward
            return fulfilled && fulfilled(v);
        }
        return undefined;
    }

    /**
     * @class KISSY.Defer
     * Defer constructor For KISSY,implement Promise specification.
     */
    function Defer(promise) {
        var self = this;
        if (!(self instanceof Defer)) {
            return new Defer(promise);
        }
        // http://en.wikipedia.org/wiki/Object-capability_model
        // principal of least authority
        /**
         * defer object's promise
         * @type {KISSY.Promise}
         */
        self.promise = promise || new Promise();
    }

    Defer.prototype =
    {
        constructor: Defer,
        /**
         * fulfill defer object's promise
         * note: can only be called once
         * @param value defer object's value
         * @return defer object's promise
         */
        resolve: function (value) {
            var promise = this.promise,
                pendings;
            if (!(pendings = promise[PROMISE_PENDINGS])) {
                return undefined;
            }
            // set current promise 's resolved value
            // maybe a promise or instant value
            promise[PROMISE_VALUE] = value;
            pendings = [].concat(pendings);
            promise[PROMISE_PENDINGS] = undefined;
            S.each(pendings, function (p) {
                promiseWhen(promise, p[0], p[1]);
            });
            return value;
        },
        /**
         * reject defer object's promise
         * @param reason
         * @return defer object's promise
         */
        reject: function (reason) {
            return this.resolve(new Reject(reason));
        }
    };

    function isPromise(obj) {
        return  obj && obj instanceof Promise;
    }

    /**
     * @class KISSY.Promise
     * Promise constructor.
     * This class should not be instantiated manually.
     * Instances will be created and returned as needed by {@link KISSY.Defer#promise}
     * @param [v] promise 's resolved value
     */
    function Promise(v) {
        var self = this;
        // maybe internal value is also a promise
        self[PROMISE_VALUE] = v;
        if (v === undefined) {
            // unresolved
            self[PROMISE_PENDINGS] = [];
        }
    }

    Promise.prototype =
    {
        constructor: Promise,
        /**
         * register callbacks when this promise object is resolved
         * @param {Function} fulfilled called when resolved successfully,pass a resolved value to this function and
         * return a value (could be promise object) for the new promise's resolved value.
         * @param {Function} [rejected] called when error occurs,pass error reason to this function and
         * return a new reason for the new promise's error reason
         * @return {KISSY.Promise} a new promise object
         */
        then: function (fulfilled, rejected) {
            return when(this, fulfilled, rejected);
        },
        /**
         * call rejected callback when this promise object is rejected
         * @param {Function} rejected called with rejected reason
         * @return {KISSY.Promise} a new promise object
         */
        fail: function (rejected) {
            return when(this, 0, rejected);
        },
        /**
         * call callback when this promise object is rejected or resolved
         * @param {Function} callback the second parameter is
         * true when resolved and false when rejected
         * @@return {KISSY.Promise} a new promise object
         */
        fin: function (callback) {
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
         * @member KISSY.Promise
         */
        isResolved: function () {
            return isResolved(this);
        },
        /**
         * whether the given object is a rejected promise
         */
        isRejected: function () {
            return isRejected(this);
        }
    };

    function Reject(reason) {
        if (reason instanceof Reject) {
            return reason;
        }
        var self = this;
        Promise.apply(self, arguments);
        if (self[PROMISE_VALUE] instanceof Promise) {
            S.error('assert.not(this.__promise_value instanceof promise) in Reject constructor');
        }
        return undefined;
    }

    S.extend(Reject, Promise);

    /**
     * wrap for promiseWhen
     * @param value
     * @ignore
     * @param fulfilled
     * @param [rejected]
     */
    function when(value, fulfilled, rejected) {
        var defer = new Defer(),
            done = 0;

        // wrap user's callback to catch exception
        function _fulfilled(value) {
            try {
                return fulfilled ? fulfilled(value) :
                    // propagate
                    value;
            } catch (e) {
                // print stack info for firefox/chrome
                S.log(e.stack || e, 'error');
                return new Reject(e);
            }
        }

        function _rejected(reason) {
            try {
                return rejected ?
                    // error recovery
                    rejected(reason) :
                    // propagate
                    new Reject(reason);
            } catch (e) {
                // print stack info for firefox/chrome
                S.log(e.stack || e, 'error');
                return new Reject(e);
            }
        }

        function finalFulfill(value) {
            if (done) {
                S.error('already done at fulfilled');
                return;
            }
            if (value instanceof Promise) {
                S.error('assert.not(value instanceof Promise) in when')
            }
            done = 1;
            defer.resolve(_fulfilled(value));
        }

        if (value instanceof  Promise) {
            promiseWhen(value, finalFulfill, function (reason) {
                if (done) {
                    S.error('already done at rejected');
                    return;
                }
                done = 1;
                // _reject may return non-Reject object for error recovery
                defer.resolve(_rejected(reason));
            });
        } else {
            finalFulfill(value);
        }

        // chained and leveled
        // wait for value's resolve
        return defer.promise;
    }

    function isResolved(obj) {
        // exclude Reject at first
        return !isRejected(obj) &&
            isPromise(obj) &&
            // self is resolved
            (obj[PROMISE_PENDINGS] === undefined) &&
            // value is a resolved promise or value is immediate value
            (
                // immediate value
                !isPromise(obj[PROMISE_VALUE]) ||
                    // resolved with a resolved promise !!! :)
                    // Reject.__promise_value is string
                    isResolved(obj[PROMISE_VALUE])
                );
    }

    function isRejected(obj) {
        return isPromise(obj) &&
            (obj[PROMISE_PENDINGS] === undefined) &&
            (obj[PROMISE_VALUE] instanceof Reject);
    }

    KISSY.Defer = Defer;
    KISSY.Promise = Promise;

    S.mix(Promise,
        /**
         * @class KISSY.PromiseMix
         * @override KISSY.Promise
         */
        {
            /**
             * register callbacks when obj as a promise is resolved
             * or call fulfilled callback directly when obj is not a promise object
             * @param {KISSY.Promise|*} obj a promise object or value of any type
             * @param {Function} fulfilled called when obj resolved successfully,pass a resolved value to this function and
             * return a value (could be promise object) for the new promise's resolved value.
             * @param {Function} [rejected] called when error occurs in obj,pass error reason to this function and
             * return a new reason for the new promise's error reason
             * @return {KISSY.Promise} a new promise object
             *
             * for example:
             *      @example
             *      function check(p) {
             *          S.Promise.when(p, function(v){
             *              alert(v === 1);
             *          });
             *      }
             *
             *      var defer = S.Defer();
             *      defer.resolve(1);
             *
             *      check(1); // => alert(true)
             *
             *      check(defer.promise); //=> alert(true);
             *
             * @static
             * @method
             */
            when: when,
            /**
             * whether the given object is a promise
             * @method
             * @static
             * @param obj the tested object
             * @return {Boolean}
             */
            isPromise: isPromise,
            /**
             * whether the given object is a resolved promise
             * @method
             * @static
             * @param obj the tested object
             * @return {Boolean}
             */
            isResolved: isResolved,
            /**
             * whether the given object is a rejected promise
             * @method
             * @static
             * @param obj the tested object
             * @return {Boolean}
             */
            isRejected: isRejected,
            /**
             * return a new promise
             * which is resolved when all promises is resolved
             * and rejected when any one of promises is rejected
             * @param {KISSY.Promise[]} promises list of promises
             * @static
             * @return {KISSY.Promise}
             */
            all: function (promises) {
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
            }
        });

})(KISSY);

/*
 refer:
 - http://wiki.commonjs.org/wiki/Promises
 - http://en.wikipedia.org/wiki/Futures_and_promises#Read-only_views
 - http://en.wikipedia.org/wiki/Object-capability_model
 - https://github.com/kriskowal/q
 - http://www.sitepen.com/blog/2010/05/03/robust-promises-with-dojo-deferred-1-5/
 - http://dojotoolkit.org/documentation/tutorials/1.6/deferreds/
 *//**
 * @ignore
 * Port Node Utils For KISSY.
 * Note: Only posix mode.
 * @author yiminghe@gmail.com
 */
(function (S) {

    // [root, dir, basename, ext]
    var splitPathRe = /^(\/?)([\s\S]+\/(?!$)|\/)?((?:\.{1,2}$|[\s\S]+?)?(\.[^.\/]*)?)$/;

    /**
     * Remove .. and . in path array
     * @ignore
     * @param parts
     * @param allowAboveRoot
     * @return {*}
     */
    function normalizeArray(parts, allowAboveRoot) {
        // level above root
        var up = 0;
        for (var i = parts.length - 1; i >= 0; i--) {
            var last = parts[i];
            if (last == '.') {
                parts.splice(i, 1);
            } else if (last === '..') {
                parts.splice(i, 1);
                up++;
            } else if (up) {
                parts.splice(i, 1);
                up--;
            }
        }

        // if allow above root, has to add ..
        if (allowAboveRoot) {
            for (; up--; up) {
                parts.unshift('..');
            }
        }

        return parts;
    }

    /**
     * Path Utils For KISSY.
     * @class KISSY.Path
     * @singleton
     */
    var Path = {

        /**
         * resolve([from ...], to)
         *
         * @return {String} Resolved path.
         */
        resolve: function () {

            var resolvedPath = '',
                resolvedPathStr,
                i,
                args = S.makeArray(arguments),
                path,
                absolute = 0;

            for (i = args.length - 1; i >= 0 && !absolute; i--) {
                path = args[i];
                if (typeof path != 'string' || !path) {
                    continue;
                }
                resolvedPath = path + '/' + resolvedPath;
                absolute = path.charAt(0) == '/';
            }

            resolvedPathStr = normalizeArray(S.filter(resolvedPath.split('/'), function (p) {
                return !!p;
            }), !absolute).join('/');

            return ((absolute ? '/' : '') + resolvedPathStr) || '.';
        },

        /**
         * normalize .. and . in path
         * @param {String} path Path tobe normalized
         *
         * for example:
         *      @example
         *      'x/y/../z' => 'x/z'
         *      'x/y/z/../' => 'x/y/'
         *
         * @return {String}
         */
        normalize: function (path) {
            var absolute = path.charAt(0) == '/',
                trailingSlash = path.slice(-1) == '/';

            path = normalizeArray(S.filter(path.split('/'), function (p) {
                return !!p;
            }), !absolute).join('/');

            if (!path && !absolute) {
                path = '.';
            }

            if (path && trailingSlash) {
                path += '/';
            }


            return (absolute ? '/' : '') + path;
        },

        /**
         * join([path ...]) and normalize
         * @return {String}
         */
        join: function () {
            var args = S.makeArray(arguments);
            return Path.normalize(S.filter(args,function (p) {
                return p && (typeof p == 'string');
            }).join('/'));
        },

        /**
         * Get string which is to relative to from
         * @param {String} from
         * @param {String} to
         *
         * for example:
         *      @example
         *      relative('x/','x/y/z') => 'y/z'
         *      relative('x/t/z','x/') => '../../'
         *
         * @return {String}
         */
        relative: function (from, to) {
            from = Path.normalize(from);
            to = Path.normalize(to);

            var fromParts = S.filter(from.split('/'), function (p) {
                    return !!p;
                }),
                path = [],
                sameIndex,
                sameIndex2,
                toParts = S.filter(to.split('/'), function (p) {
                    return !!p;
                }), commonLength = Math.min(fromParts.length, toParts.length);

            for (sameIndex = 0; sameIndex < commonLength; sameIndex++) {
                if (fromParts[sameIndex] != toParts[sameIndex]) {
                    break;
                }
            }

            sameIndex2 = sameIndex;

            while (sameIndex < fromParts.length) {
                path.push('..');
                sameIndex++;
            }

            path = path.concat(toParts.slice(sameIndex2));

            path = path.join('/');

            return path;
        },

        /**
         * Get base name of path
         * @param {String} path
         * @param {String} [ext] ext to be stripped from result returned.
         * @return {String}
         */
        basename: function (path, ext) {
            var result = path.match(splitPathRe) || [];
            result = result[3] || '';
            if (ext && result && result.slice(-1 * ext.length) == ext) {
                result = result.slice(0, -1 * ext.length);
            }
            return result;
        },

        /**
         * Get dirname of path
         * @return {String}
         */
        dirname: function (path) {
            var result = path.match(splitPathRe) || [],
                root = result[1] || '',
                dir = result[2] || '';

            if (!root && !dir) {
                // No dirname
                return '.';
            }

            if (dir) {
                // It has a dirname, strip trailing slash
                dir = dir.substring(0, dir.length - 1);
            }

            return root + dir;
        },

        /**
         * Get extension name of file in path
         * @param {String} path
         * @return {String}
         */
        extname: function (path) {
            return (path.match(splitPathRe) || [])[4] || '';
        }

    };

    S.Path = Path;

})(KISSY);
/*
 Refer
 - https://github.com/joyent/node/blob/master/lib/path.js
 *//**
 * @ignore
 * Uri class for KISSY.
 * @author yiminghe@gmail.com
 */
(function (S, undefined) {

    var reDisallowedInSchemeOrUserInfo = /[#\/\?@]/g,
        reDisallowedInPathName = /[#\?]/g,
    // ?? combo of taobao
        reDisallowedInQuery = /[#@]/g,
        reDisallowedInFragment = /#/g,

        URI_SPLIT_REG = new RegExp(
            '^' +
                /*
                 Scheme names consist of a sequence of characters beginning with a
                 letter and followed by any combination of letters, digits, plus
                 ('+'), period ('.'), or hyphen ('-').
                 */
                '(?:([\\w\\d+.-]+):)?' + // scheme

                '(?://' +
                /*
                 The authority component is preceded by a double slash ('//') and is
                 terminated by the next slash ('/'), question mark ('?'), or number
                 sign ('#') character, or by the end of the URI.
                 */
                '(?:([^/?#@]*)@)?' + // userInfo

                '(' +
                '[\\w\\d\\-\\u0100-\\uffff.+%]*' +
                '|' +
                // ipv6
                '\\[[^\\]]+\\]' +
                ')' + // hostname - restrict to letters,
                // digits, dashes, dots, percent
                // escapes, and unicode characters.
                '(?::([0-9]+))?' + // port
                ')?' +
                /*
                 The path is terminated
                 by the first question mark ('?') or number sign ('#') character, or
                 by the end of the URI.
                 */
                '([^?#]+)?' + // path. hierarchical part
                /*
                 The query component is indicated by the first question
                 mark ('?') character and terminated by a number sign ('#') character
                 or by the end of the URI.
                 */
                '(?:\\?([^#]*))?' + // query. non-hierarchical data
                /*
                 The fragment identifier component of a URI allows indirect
                 identification of a secondary resource by reference to a primary
                 resource and additional identifying information.

                 A
                 fragment identifier component is indicated by the presence of a
                 number sign ('#') character and terminated by the end of the URI.
                 */
                '(?:#(.*))?' + // fragment
                '$'),

        Path = S.Path,

        REG_INFO = {
            scheme: 1,
            userInfo: 2,
            hostname: 3,
            port: 4,
            path: 5,
            query: 6,
            fragment: 7
        };

    function parseQuery(self) {
        if (!self._queryMap) {
            self._queryMap = S.unparam(self._query);
        }
    }

    /**
     * @class KISSY.Uri.Query
     * Query data structure.
     * @param {String} [query] encoded query string(without question mask).
     */
    function Query(query) {
        this._query = query || '';
    }


    Query.prototype =
    {
        constructor: Query,

        /**
         * Cloned new instance.
         * @return {KISSY.Uri.Query}
         */
        clone: function () {
            return new Query(this.toString());
        },


        /**
         * reset to a new query string
         * @param {String} query
         */
        reset: function (query) {
            var self = this;
            self._query = query || '';
            self._queryMap = 0;
        },

        /**
         * Parameter count.
         * @return {Number}
         */
        count: function () {
            var self = this, count = 0,
                _queryMap = self._queryMap,
                k;
            parseQuery(self);
            for (k in _queryMap) {

                if (S.isArray(_queryMap[k])) {
                    count += _queryMap[k].length;
                } else {
                    count++;
                }

            }
            return count;
        },

        /**
         * Return parameter value corresponding to current key
         * @param {String} key
         */
        get: function (key) {
            var self = this;
            parseQuery(self);
            if (key) {
                return self._queryMap[key];
            } else {
                return self._queryMap;
            }
        },

        /**
         * Parameter names.
         * @return {String[]}
         */
        keys: function () {
            var self = this;
            parseQuery(self);
            return S.keys(self._queryMap);
        },

        /**
         * Set parameter value corresponding to current key
         * @param {String} key
         * @param value
         */
        set: function (key, value) {
            var self = this, _queryMap;
            parseQuery(self);
            _queryMap = self._queryMap;
            if (S.isString(key)) {
                self._queryMap[key] = value;
            } else {
                if (key instanceof Query) {
                    key = key.get();
                }
                S.each(key, function (v, k) {
                    _queryMap[k] = v;
                });
            }
            return self;
        },

        /**
         * Remove parameter with specified name.
         * @param {String} key
         */
        remove: function (key) {
            var self = this;
            parseQuery(self);
            if (key) {
                delete self._queryMap[key];
            } else {
                self._queryMap = {};
            }
            return self;

        },

        /**
         * Add parameter value corresponding to current key
         * @param {String} key
         * @param value
         */
        add: function (key, value) {
            var self = this,
                _queryMap,
                currentValue;
            if (S.isObject(key)) {
                if (key instanceof Query) {
                    key = key.get();
                }
                S.each(key, function (v, k) {
                    self.add(k, v);
                });
            } else {
                parseQuery(self);
                _queryMap = self._queryMap;
                currentValue = _queryMap[key];
                if (currentValue === undefined) {
                    currentValue = value;
                } else {
                    currentValue = [].concat(currentValue).concat(value);
                }
                _queryMap[key] = currentValue;
            }
            return self;
        },

        /**
         * Serialize query to string.
         * @param {Boolean} [serializeArray=true]
         * whether append [] to key name when value 's type is array
         */
        toString: function (serializeArray) {
            var self = this;
            parseQuery(self);
            return S.param(self._queryMap, undefined, undefined, serializeArray);
        }
    };

    function padding2(str) {
        return str.length == 1 ? '0' + str : str;
    }

    function equalsIgnoreCase(str1, str2) {
        return str1.toLowerCase() == str2.toLowerCase();
    }

    // www.ta#bao.com // => www.ta.com/#bao.com
    // www.ta%23bao.com
    // Percent-Encoding
    function encodeSpecialChars(str, specialCharsReg) {
        // encodeURI( ) is intended to encode complete URIs,
        // the following ASCII punctuation characters,
        // which have special meaning in URIs, are not escaped either:
        // ; / ? : @ & = + $ , #
        return encodeURI(str).replace(specialCharsReg, function (m) {
            return '%' + padding2(m.charCodeAt(0).toString(16));
        });
    }


    /**
     * @class KISSY.Uri
     * Uri class for KISSY.
     * Most of its interfaces are same with window.location.
     * @param {String|KISSY.Uri} [uriStr] Encoded uri string.
     */
    function Uri(uriStr) {

        if (uriStr instanceof  Uri) {
            return uriStr.clone();
        }

        var m, self = this;

        S.mix(self,
            {
                /**
                 * scheme such as 'http:'. aka protocol without colon
                 * @type {String}
                 */
                scheme: '',
                /**
                 * User credentials such as 'yiminghe:gmail'
                 * @type {String}
                 */
                userInfo: '',
                /**
                 * hostname such as 'docs.kissyui.com'. aka domain
                 * @type {String}
                 */
                hostname: '',
                /**
                 * Port such as '8080'
                 * @type {String}
                 */
                port: '',
                /**
                 * path such as '/index.htm'. aka pathname
                 * @type {String}
                 */
                path: '',
                /**
                 * Query object for search string. aka search
                 * @type {KISSY.Uri.Query}
                 */
                query: '',
                /**
                 * fragment such as '#!/test/2'. aka hash
                 */
                fragment: ''
            });

        uriStr = uriStr || '';
        m = uriStr.match(URI_SPLIT_REG) || [];

        S.each(REG_INFO, function (index, key) {
            var match = m[index] || '';
            if (key == 'query') {
                // need encoded content
                self.query = new Query(match);
            } else {
                // need to decode to get data structure in memory
                self[key] = decodeURIComponent(match);
            }
        });

    }

    Uri.prototype =
    {

        constructor: Uri,

        /**
         * Return a cloned new instance.
         * @return {KISSY.Uri}
         */
        clone: function () {
            var uri = new Uri(), self = this;
            S.each(REG_INFO, function (index, key) {
                uri[key] = self[key];
            });
            uri.query = uri.query.clone();
            return uri;
        },


        /**
         * The reference resolution algorithm.rfc 5.2
         * return a resolved uri corresponding to current uri
         * @param {KISSY.Uri|String} relativeUri
         *
         * for example:
         *      @example
         *      this: 'http://y/yy/z.com?t=1#v=2'
         *      'https:/y/' => 'https:/y/'
         *      '//foo' => 'http://foo'
         *      'foo' => 'http://y/yy/foo'
         *      '/foo' => 'http://y/foo'
         *      '?foo' => 'http://y/yy/z.com?foo'
         *      '#foo' => http://y/yy/z.com?t=1#foo'
         *
         * @return {KISSY.Uri}
         */
        resolve: function (relativeUri) {

            if (S.isString(relativeUri)) {
                relativeUri = new Uri(relativeUri);
            }

            var self = this,
                override = 0,
                lastSlashIndex,
                order = ['scheme', 'userInfo', 'hostname', 'port', 'path', 'query', 'fragment'],
                target = self.clone();

            S.each(order, function (o) {
                if (o == 'path') {
                    // relativeUri does not set for scheme/userInfo/hostname/port
                    if (override) {
                        target[o] = relativeUri[o];
                    } else {
                        var path = relativeUri['path'];
                        if (path) {
                            // force to override target 's query with relative
                            override = 1;
                            if (!S.startsWith(path, '/')) {
                                if (target.hostname && !target.path) {
                                    // RFC 3986, section 5.2.3, case 1
                                    path = '/' + path;
                                } else if (target.path) {
                                    // RFC 3986, section 5.2.3, case 2
                                    lastSlashIndex = target.path.lastIndexOf('/');
                                    if (lastSlashIndex != -1) {
                                        path = target.path.slice(0, lastSlashIndex + 1) + path;
                                    }
                                }
                            }
                            // remove .. / .  as part of the resolution process
                            target.path = Path.normalize(path);
                        }
                    }
                } else if (o == 'query') {
                    if (override || relativeUri['query'].toString()) {
                        target.query = relativeUri['query'].clone();
                        override = 1;
                    }
                } else if (override || relativeUri[o]) {
                    target[o] = relativeUri[o];
                    override = 1;
                }
            });

            return target;

        },

        /**
         * Get scheme part
         */
        getScheme: function () {
            return this.scheme;
        },

        /**
         * Set scheme part
         * @param {String} scheme
         * @return this
         */
        setScheme: function (scheme) {
            this.scheme = scheme;
            return this;
        },

        /**
         * Return hostname
         * @return {String}
         */
        getHostname: function () {
            return this.hostname;
        },

        /**
         * Set hostname
         * @param {String} hostname
         * @return this
         */
        setHostname: function (hostname) {
            this.hostname = hostname;
            return this;
        },

        /**
         * Set user info
         * @param {String} userInfo
         * @return this
         */
        setUserInfo: function (userInfo) {
            this.userInfo = userInfo;
            return this;
        },

        /**
         * Get user info
         * @return {String}
         */
        getUserInfo: function () {
            return this.userInfo;
        },

        /**
         * Set port
         * @param {String} port
         * @return this
         */
        setPort: function (port) {
            this.port = port;
            return this;
        },

        /**
         * Get port
         * @return {String}
         */
        getPort: function () {
            return this.port;
        },

        /**
         * Set path
         * @param {string} path
         * @return this
         */
        setPath: function (path) {
            this.path = path;
            return this;
        },

        /**
         * Get path
         * @return {String}
         */
        getPath: function () {
            return this.path;
        },

        /**
         * Set query
         * @param {String|KISSY.Uri.Query} query
         * @return this
         */
        setQuery: function (query) {
            if (S.isString(query)) {
                if (S.startsWith(query, '?')) {
                    query = query.slice(1);
                }
                query = new Query(encodeSpecialChars(query, reDisallowedInQuery));
            }
            this.query = query;
            return this;
        },

        /**
         * Get query
         * @return {KISSY.Uri.Query}
         */
        getQuery: function () {
            return this.query;
        },

        /**
         * Get fragment
         * @return {String}
         */
        getFragment: function () {
            return this.fragment;
        },

        /**
         * Set fragment
         * @param {String} fragment
         * @return this
         */
        setFragment: function (fragment) {
            if (!S.startsWith(fragment, '#')) {
                fragment = '#' + fragment;
            }
            this.fragment = fragment;
            return this;
        },

        /**
         * Judge whether two uri has same domain.
         * @param {KISSY.Uri} other
         * @return {Boolean}
         */
        hasSameDomainAs: function (other) {
            var self = this;
            // port and hostname has to be same
            return equalsIgnoreCase(self.hostname, other['hostname']) &&
                equalsIgnoreCase(self.scheme, other['scheme']) &&
                equalsIgnoreCase(self.port, other['port']);
        },

        /**
         * Serialize to string.
         * See rfc 5.3 Component Recomposition.
         * But kissy does not differentiate between undefined and empty.
         * @param {boolean} [serializeArray=true]
         * whether append [] to key name when value 's type is array
         * @return {String}
         */
        toString: function (serializeArray) {

            var out = [], self = this,
                scheme,
                hostname,
                path,
                port,
                fragment,
                query,
                userInfo;

            if (scheme = self.scheme) {
                out.push(encodeSpecialChars(scheme, reDisallowedInSchemeOrUserInfo));
                out.push(':');
            }

            if (hostname = self.hostname) {
                out.push('//');
                if (userInfo = self.userInfo) {
                    out.push(encodeSpecialChars(userInfo, reDisallowedInSchemeOrUserInfo));
                    out.push('@');
                }

                out.push(encodeURIComponent(hostname));

                if (port = self.port) {
                    out.push(':');
                    out.push(port);
                }
            }

            if (path = self.path) {
                if (hostname && !S.startsWith(path, '/')) {
                    path = '/' + path;
                }
                path = Path.normalize(path);
                out.push(encodeSpecialChars(path, reDisallowedInPathName));
            }

            if (query = ( self.query.toString(serializeArray))) {
                out.push('?');
                out.push(query);
            }

            if (fragment = self.fragment) {
                out.push('#');
                out.push(encodeSpecialChars(fragment, reDisallowedInFragment))
            }

            return out.join('');
        }
    };

    Uri.Query = Query;

    S.Uri = Uri;

})(KISSY);
/*
 Refer
 - http://www.ietf.org/rfc/rfc3986.txt
 - http://en.wikipedia.org/wiki/URI_scheme
 *//**
 * @ignore
 * @fileOverview setup data structure for kissy loader
 * @author yiminghe@gmail.com
 */
(function (S) {

    /**
     * @class KISSY.Loader
     * @private
     * @mixins KISSY.Loader.Target
     * This class should not be instantiated manually.
     */
    function Loader(runtime) {
        this.runtime = runtime;
        /**
         * @event afterModAttached
         * fired after a module is attached
         * @param e
         * @param {KISSY.Loader.Module} e.mod current module object
         */
    }

    /**
     * Loader Status Enum
     * @private
     * @enum {Number} KISSY.Loader.STATUS
     */
    Loader.STATUS = {
        /** init */
        'INIT': 0,
        /** loading */
        'LOADING': 1,
        /** loaded */
        'LOADED': 2,
        /** error */
        'ERROR': 3,
        /** attached */
        'ATTACHED': 4
    };

    KISSY.Loader = Loader;

})(KISSY);
/*
 TODO: implement conditional loader
 *//**
 * @ignore
 * @fileOverview simple event target for loader
 * @author yiminghe@gmail.com
 */
(function (S) {

    // in case current code runs on nodejs
    S.namespace("Loader");

    var time = S.now(),
        p = '__events__' + time;

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

    /**
     * @class KISSY.Loader.Target
     * Event Target For KISSY Loader.
     * @private
     * @singleton
     */
    KISSY.Loader.Target = {
        /**
         * register callback for specified eventName from loader
         * @param {String} eventName event name from kissy loader
         * @param {Function} callback function to be executed when event of eventName is fired
         */
        on: function (eventName, callback) {
            getEventHolder(this, eventName, 1).push(callback);
        },

        /**
         * remove callback for specified eventName from loader
         * @param {String} [eventName] eventName from kissy loader.
         * if undefined remove all callbacks for all events
         * @param {Function } [callback] function to be executed when event of eventName is fired.
         * if undefined remove all callbacks fro this event
         */
        detach: function (eventName, callback) {
            var self = this, fns, index;
            if (!eventName) {
                delete self[p];
                return;
            }
            fns = getEventHolder(self, eventName);
            if (fns) {
                if (callback) {
                    index = S.indexOf(callback, fns);
                    if (index != -1) {
                        fns.splice(index, 1);
                    }
                }
                if (!callback || !fns.length) {
                    delete getHolder(self)[eventName];
                }
            }
        },

        /**
         * Fire specified event.
         * @param eventName
         * @param obj
         * @private
         */
        fire: function (eventName, obj) {
            var fns = getEventHolder(this, eventName);
            S.each(fns, function (f) {
                f.call(null, obj);
            });
        }
    };
})(KISSY);/**
 * @ignore
 * @fileOverview Utils for kissy loader
 * @author yiminghe@gmail.com
 */
(function (S) {

    var Loader = S.Loader,
        Path = S.Path,
        Uri = S.Uri,
        host = S.Env.host,
        ua = host.navigator && navigator.userAgent || "",
        startsWith = S.startsWith,
        data = Loader.STATUS,
        ATTACHED = data.ATTACHED,
        LOADED = data.LOADED,
        /**
         * @class KISSY.Loader.Utils
         * Utils for KISSY Loader
         * @singleton
         * @private
         */
            Utils = {},

        isWebKit = !!ua.match(/AppleWebKit/),
        doc = host.document,
        simulatedLocation = new Uri(host.location && location.href || "");


    // http://wiki.commonjs.org/wiki/Packages/Mappings/A
    // 如果模块名以 / 结尾，自动加 index
    function indexMap(s) {
        if (S.isArray(s)) {
            var ret = [], i = 0;
            for (; i < s.length; i++) {
                ret[i] = indexMapStr(s[i]);
            }
            return ret;
        }
        return indexMapStr(s);
    }

    function indexMapStr(s) {
        // 'x/' 'x/y/z/'
        if (S.endsWith(Path.basename(s), '/')) {
            s += 'index';
        }
        return s;
    }

    S.mix(Utils, {

        /**
         * get document head
         * @return {HTMLElement}
         */
        docHead: function () {
            return doc.getElementsByTagName('head')[0] || doc.documentElement;
        },

        /**
         * isWebkit
         */
        isWebKit: isWebKit,

        /**
         * isGecko
         */
        isGecko: !isWebKit && !!ua.match(/Gecko/),

        /**
         * isPresto
         */
        isPresto: !!ua.match(/Presto/),

        /**
         * IE
         */
        IE: !!ua.match(/MSIE/),

        addEventListener: host.addEventListener ? function (node, type, callback) {
            node.addEventListener(type, callback, false);
        } : function (node, type, callback) {
            node.attachEvent('on' + type, callback);
        },

        removeEventListener: host.removeEventListener ? function (node, type, callback) {
            node.removeEventListener(type, callback, false);
        } : function (node, type, callback) {
            node.detachEvent('on' + type, callback);
        },

        /**
         * Get absolute path of dep module.similar to {@link KISSY.Path#resolve}
         * @param moduleName current module 's name
         * @param depName dep module 's name
         * @return {string|Array}
         */
        normalDepModuleName: function (moduleName, depName) {
            var i = 0;

            if (!depName) {
                return depName;
            }

            if (S.isArray(depName)) {
                for (; i < depName.length; i++) {
                    depName[i] = Utils.normalDepModuleName(moduleName, depName[i]);
                }
                return depName;
            }

            if (startsWith(depName, '../') || startsWith(depName, './')) {
                // x/y/z -> x/y/
                return Path.resolve(Path.dirname(moduleName), depName);
            }

            return Path.normalize(depName);
        },

        /**
         * remove ext name
         * @param path
         * @return {String}
         */
        removeExtname: function (path) {
            return path.replace(/(-min)?\.js$/i, '');
        },

        /**
         * resolve according to current page location.
         * @return {String}
         */
        resolveByPage: function (path) {
            return simulatedLocation.resolve(path);
        },

        /**
         * create modules info
         * @param runtime
         * @param modNames
         */
        createModulesInfo: function (runtime, modNames) {
            S.each(modNames, function (m) {
                Utils.createModuleInfo(runtime, m);
            });
        },

        /**
         * create single module info
         * @param runtime
         * @param modName
         * @param [cfg]
         * @return {KISSY.Loader.Module}
         */
        createModuleInfo: function (runtime, modName, cfg) {
            modName = indexMapStr(modName);

            var mods = runtime.Env.mods,
                mod = mods[modName];

            if (mod) {
                return mod;
            }

            // 防止 cfg 里有 tag，构建 fullpath 需要
            mods[modName] = mod = new Loader.Module(S.mix({
                name: modName,
                runtime: runtime
            }, cfg));

            return mod;
        },

        /**
         * Whether modNames is attached.
         * @param runtime
         * @param modNames
         * @return {Boolean}
         */
        isAttached: function (runtime, modNames) {
            return isStatus(runtime, modNames, ATTACHED);
        },

        /**
         * Whether modNames is loaded.
         * @param runtime
         * @param modNames
         * @return {Boolean}
         */
        isLoaded: function (runtime, modNames) {
            return isStatus(runtime, modNames, LOADED);
        },

        /**
         * Get module values
         * @param runtime
         * @param modNames
         * @return {Array}
         */
        getModules: function (runtime, modNames) {
            var mods = [runtime], mod;

            S.each(modNames, function (modName) {
                mod = runtime.Env.mods[modName];
                if (!mod || mod.getType() != 'css') {
                    mods.push(runtime.require(modName));
                }
            });

            return mods;
        },

        /**
         * Attach specified mod.
         * @param runtime
         * @param mod
         */
        attachMod: function (runtime, mod) {
            if (mod.status != LOADED) {
                return;
            }

            var fn = mod.fn,
                requires,
                value;

            // 需要解开 index，相对路径，去除 tag，但是需要保留 alias，防止值不对应
            requires = mod.requires = mod.getNormalizedRequires();

            if (fn) {
                if (S.isFunction(fn)) {
                    // context is mod info
                    value = fn.apply(mod, Utils.getModules(runtime, requires));
                } else {
                    value = fn;
                }
                mod.value = value;
            }

            mod.status = ATTACHED;

            runtime.getLoader().fire('afterModAttached', {
                mod: mod
            });
        },

        /**
         * Get mod names as array.
         * @param modNames
         * @return {String[]}
         */
        getModNamesAsArray: function (modNames) {
            if (S.isString(modNames)) {
                modNames = modNames.replace(/\s+/g, '').split(',');
            }
            return modNames;
        },

        /**
         * Three effects:
         * 1. add index : / => /index
         * 2. unalias : core => dom,event,ua
         * 3. relative to absolute : ./x => y/x
         * @param {KISSY} runtime Global KISSY instance
         * @param {String|String[]} modNames Array of module names
         * or module names string separated by comma
         * @return {String[]}
         */
        normalizeModNames: function (runtime, modNames, refModName) {
            return Utils.unalias(runtime, Utils.normalizeModNamesWithAlias(runtime, modNames, refModName));
        },

        /**
         * unalias module name.
         * @param runtime
         * @param names
         * @return {Array}
         */
        unalias: function (runtime, names) {
            var ret = [].concat(names),
                i,
                m,
                alias,
                ok = 0,
                mods = runtime['Env'].mods;
            while (!ok) {
                ok = 1;
                for (i = ret.length - 1; i >= 0; i--) {
                    if ((m = mods[ret[i]]) && (alias = m.alias)) {
                        ok = 0;
                        ret.splice.apply(ret, [i, 1].concat(indexMap(alias)));
                    }
                }
            }
            return ret;
        },

        /**
         * normalize module names
         * @param runtime
         * @param modNames
         * @param [refModName]
         * @return {Array}
         */
        normalizeModNamesWithAlias: function (runtime, modNames, refModName) {
            var ret = [], i, l;
            if (modNames) {
                // 1. index map
                for (i = 0, l = modNames.length; i < l; i++) {
                    // conditional loader
                    // requires:[window.localStorage?"local-storage":""]
                    if (modNames[i]) {
                        ret.push(indexMap(modNames[i]));
                    }
                }
            }
            // 3. relative to absolute (optional)
            if (refModName) {
                ret = Utils.normalDepModuleName(refModName, ret);
            }
            return ret;
        },

        /**
         * register module with factory
         * @param runtime
         * @param name
         * @param fn
         * @param [config]
         */
        registerModule: function (runtime, name, fn, config) {
            var mods = runtime.Env.mods,
                mod = mods[name];

            if (mod && mod.fn) {
                S.log(name + ' is defined more than once');
                return;
            }

            // 没有 use，静态载入的 add 可能执行
            Utils.createModuleInfo(runtime, name);

            mod = mods[name];

            // 注意：通过 S.add(name[, fn[, config]]) 注册的代码，无论是页面中的代码，
            // 还是 js 文件里的代码，add 执行时，都意味着该模块已经 LOADED
            S.mix(mod, { name: name, status: LOADED });

            mod.fn = fn;

            S.mix((mods[name] = mod), config);

            // S.log(name + ' is loaded', 'info');
        },

        /**
         * Get mapped path.
         * @param runtime
         * @param path
         * @return {String}
         */
        getMappedPath: function (runtime, path, rules) {
            var __mappedRules = rules || runtime.Config.mappedRules || [],
                i,
                m,
                rule;
            for (i = 0; i < __mappedRules.length; i++) {
                rule = __mappedRules[i];
                if (m = path.match(rule[0])) {
                    return path.replace(rule[0], rule[1]);
                }
            }
            return path;
        },

        memoize: function (fn, hasher) {
            hasher = hasher || function (x) {
                return x;
            };
            var memo = {},
                queues = {},
                memoized = function () {
                    var args = S.makeArray(arguments),
                        callback = args.pop(),
                        key = hasher.apply(null, args);
                    if (key in memo) {
                        callback.apply(null, memo[key]);
                    } else if (key in queues) {
                        queues[key].push(callback);
                    } else {
                        queues[key] = [callback];
                        fn.apply(null, args.concat([function () {
                            memo[key] = arguments;
                            var q = queues[key];
                            delete queues[key];
                            for (var i = 0, l = q.length; i < l; i++) {
                                q[i].apply(null, arguments);
                            }
                        }]));
                    }
                };
            memoized.unmemoized = fn;
            return memoized;
        }
    });

    function isStatus(runtime, modNames, status) {
        var mods = runtime.Env.mods,
            i;
        modNames = S.makeArray(modNames);
        for (i = 0; i < modNames.length; i++) {
            var mod = mods[modNames[i]];
            if (!mod || mod.status !== status) {
                return false;
            }
        }
        return true;
    }

    Loader.Utils = Utils;

})(KISSY);/**
 * @ignore
 * @fileOverview setup data structure for kissy loader
 * @author yiminghe@gmail.com
 */
(function (S) {

    var Path = S.Path, Loader = S.Loader, Utils = Loader.Utils;

    /**
     * @class KISSY.Loader.Package
     * @private
     * This class should not be instantiated manually.
     */
    function Package(cfg) {
        S.mix(this, cfg);
    }

    S.augment(Package,
        {
            /**
             * Tag for package.
             * @return {String}
             */
            getTag: function () {
                var self = this;
                return self.tag || self.runtime.Config.tag;
            },

            /**
             * Get package name.
             * @return {String}
             */
            getName: function () {
                return this.name;
            },

            /**
             * Get package base.
             * @return {String}
             */
            getBase: function () {
                var self = this;
                return self.base || self.runtime.Config.base;
            },

            /**
             * Get package baseUri
             * @return {KISSY.Uri}
             */
            getBaseUri: function () {
                var self = this;
                return self.baseUri || self.runtime.Config.baseUri;
            },

            /**
             * Whether is debug for this package.
             * @return {Boolean}
             */
            isDebug: function () {
                var self = this, debug = self.debug;
                return debug === undefined ? self.runtime.Config.debug : debug;
            },

            /**
             * Get charset for package.
             * @return {String}
             */
            getCharset: function () {
                var self = this;
                return self.charset || self.runtime.Config.charset;
            },

            /**
             * Whether modules are combined for this package.
             * @return {Boolean}
             */
            isCombine: function () {
                var self = this, combine = self.combine;
                return combine === undefined ? self.runtime.Config.combine : combine;
            }
        });

    Loader.Package = Package;

    /**
     * @class KISSY.Loader.Module
     * @private
     * This class should not be instantiated manually.
     */
    function Module(cfg) {
        this.status = Loader.STATUS.INIT;
        S.mix(this, cfg);
    }

    S.augment(Module,
        {
            /**
             * Set the value of current module
             * @param v value to be set
             */
            setValue: function (v) {
                this.value = v;
            },

            /**
             * Get the type if current Module
             * @return {String} css or js
             */
            getType: function () {
                var self = this, v;
                if ((v = self.type) === undefined) {
                    if (Path.extname(self.name).toLowerCase() == '.css') {
                        v = 'css';
                    } else {
                        v = 'js';
                    }
                    self.type = v;
                }
                return v;
            },

            /**
             * Get the fullpath of current module if load dynamically
             * @return {String}
             */
            getFullPath: function () {
                var self = this, t, fullpathUri, packageBaseUri;
                if (!self.fullpath) {
                    packageBaseUri = self.getPackage().getBaseUri();
                    fullpathUri = packageBaseUri.resolve(self.getPath());
                    if (t = self.getTag()) {
                        fullpathUri.query.set('t', t);
                    }
                    self.fullpath = Utils.getMappedPath(self.runtime, fullpathUri.toString());
                }
                return self.fullpath;
            },

            /**
             * Get the path (without package base)
             * @return {String}
             */
            getPath: function () {
                var self = this;
                return self.path ||
                    (self.path = defaultComponentJsName(self))
            },

            /**
             * Get the value of current module
             * @return {*}
             */
            getValue: function () {
                return this.value;
            },

            /**
             * Get the name of current module
             * @return {String}
             */
            getName: function () {
                return this.name;
            },

            /**
             * Get the package which current module belongs to.
             * @return {KISSY.Loader.Package}
             */
            getPackage: function () {
                var self = this;
                return self.packageInfo ||
                    (self.packageInfo = getPackage(self.runtime, self));
            },

            /**
             * Get the tag of current module
             * @return {String}
             */
            getTag: function () {
                var self = this;
                return self.tag || self.getPackage().getTag();
            },

            /**
             * Get the charset of current module
             * @return {String}
             */
            getCharset: function () {
                var self = this;
                return self.charset || self.getPackage().getCharset();
            },


            /**
             * Get module objects required by this one
             * @return {KISSY.Loader.Module[]}
             */
            getRequiredMods: function () {
                var mods = this.runtime.Env.mods;
                return S.map(this.getNormalizedRequires(), function (r) {
                    return mods[r];
                });
            },


            getNormalizedRequires: function () {
                var self = this, normalizedRequires,
                    normalizedRequiresStatus = self.normalizedRequiresStatus,
                    status = self.status,
                    requires = self.requires;
                if (!requires || requires.length == 0) {
                    return requires || [];
                } else if ((normalizedRequires = self.normalizedRequires) &&
                    // 事先声明的依赖不能当做 loaded 状态下真正的依赖
                    (normalizedRequiresStatus == status)) {
                    return normalizedRequires;
                } else {
                    self.normalizedRequiresStatus = status;
                    return self.normalizedRequires =
                        Utils.normalizeModNames(self.runtime, requires, self.name);
                }
            }
        });

    Loader.Module = Module;


    function defaultComponentJsName(m) {
        var name = m.name,
            extname = (Path.extname(name) || '').toLowerCase(),
            min = '-min';

        if (extname != '.css') {
            extname = '.js';
        }

        name = Path.join(Path.dirname(name), Path.basename(name, extname));

        if (m.getPackage().isDebug()) {
            min = '';
        }
        return name + min + extname;
    }

    function getPackage(self, mod) {
        var modName = mod.name,
            Env = self.Env,
            packages = Env.packages || {},
            pName = '',
            p,
            packageDesc;

        for (p in packages) {

            // longest match
            if (S.startsWith(modName, p) &&
                p.length > pName.length) {
                pName = p;
            }

        }

        packageDesc = packages[pName] ||
            Env.defaultPackage ||
            (Env.defaultPackage = new Loader.Package({
                runtime: self,
                // need packageName as key
                name: ''
            }));

        return packageDesc;
    }


})(KISSY);
/*
 TODO: implement conditional loader
 *//**
 * @ignore
 * @fileOverview script/css load across browser
 * @author yiminghe@gmail.com
 */
(function (S) {

    var CSS_POLL_INTERVAL = 30,
        utils = S.Loader.Utils,
    // central poll for link node
        timer = 0,
        monitors = {
            // node.id:{callback:callback,node:node}
        };


    /**
     * @ignore
     * References:
     *  - http://unixpapa.com/js/dyna.html
     *  - http://www.blaze.io/technical/ies-premature-execution-problem/
     *
     * `onload` event is supported in WebKit since 535.23
     *  - https://bugs.webkit.org/show_activity.cgi?id=38995
     * `onload/onerror` event is supported since Firefox 9.0
     *  - https://bugzilla.mozilla.org/show_bug.cgi?id=185236
     *  - https://developer.mozilla.org/en/HTML/Element/link#Stylesheet_load_events
     *
     * monitor css onload across browsers.issue about 404 failure.
     *
     *  - firefox not ok（4 is wrong）：
     *    - http://yearofmoo.com/2011/03/cross-browser-stylesheet-preloading/
     *  - all is ok
     *    - http://lifesinger.org/lab/2011/load-js-css/css-preload.html
     *  - others
     *    - http://www.zachleat.com/web/load-css-dynamically/
     */

    function startCssTimer() {
        if (!timer) {
            // S.log('start css polling');
            cssPoll();
        }
    }

    // single thread is ok
    function cssPoll() {

        var callbackObj = monitors[url],
            node = callbackObj.node,
            exName,
            loaded = 0;
        if (utils.isWebKit) {
            // http://www.w3.org/TR/DOM-Level-2-Style/stylesheets.html
            if (node['sheet']) {
                S.log('webkit loaded : ' + url);
                loaded = 1;
            }
        } else if (node['sheet']) {
            try {
                var cssRules = node['sheet'].cssRules;
                if (cssRules) {
                    S.log('same domain firefox loaded : ' + url);
                    loaded = 1;
                }
            } catch (ex) {
                exName = ex.name;
                S.log('firefox getStyle : ' + exName + ' ' + ex.code + ' ' + url);
                // http://www.w3.org/TR/dom/#dom-domexception-code
                if (// exName == 'SecurityError' ||
                // for old firefox
                    exName == 'NS_ERROR_DOM_SECURITY_ERR') {
                    S.log(exName + ' firefox loaded : ' + url);
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

        if (S.isEmptyObject(monitors)) {
            timer = 0;
            // S.log('end css polling');
        } else {
            timer = setTimeout(cssPoll, CSS_POLL_INTERVAL);
        }
    }

    S.mix(utils, {
        pollCss: // refer : http://lifesinger.org/lab/2011/load-js-css/css-preload.html
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
 * @ignore
 * @fileOverview getScript support for css and js callback after load
 * @author yiminghe@gmail.com, lifesinger@gmail.com
 */
(function (S) {

    var MILLISECONDS_OF_SECOND = 1000,
        doc = S.Env.host.document,
        utils = S.Loader.Utils,
        Path = S.Path,
        jsCssCallbacks = {};

    S.mix(S, {
        /**
         * Load a JavaScript/Css file from the server using a GET HTTP request,
         * then execute it.
         *
         * for example:
         *      @example
         *      getScript(url, success, charset);
         *      // or
         *      getScript(url, {
         *          charset: string
         *          success: fn,
         *          error: fn,
         *          timeout: number
         *      });
         *
         * @param {String} url resource's url
         * @param {Function|Object} [success] success callback or config
         * @param {Function} [success.success] success callback
         * @param {Function} [success.error] error callback
         * @param {Number} [success.timeout] timeout (s)
         * @param {String} [success.charset] charset of current resource
         * @param {String} [charset] charset of current resource
         * @return {HTMLElement} script/style node
         * @member KISSY
         */
        getScript: function (url, success, charset) {

            var src = utils.resolveByPage(url).toString(),
                config = success,
                css = 0,
                error,
                timeout,
                timer;

            if (S.startsWith(Path.extname(url).toLowerCase(), '.css')) {
                css = 1;
            }

            if (S.isPlainObject(config)) {
                success = config.success;
                error = config.error;
                timeout = config.timeout;
                charset = config.charset;
            }

            var callbacks = jsCssCallbacks[src] = jsCssCallbacks[src] || [];

            callbacks.push([success, error]);

            if (callbacks.length > 1) {
                // S.log(' queue js : ' + callbacks.length + ' : for :' + url + ' by ' + (config.source || ''));
                return callbacks.node;
            } else {
                // S.log('init getScript : by ' + config.source);
            }

            var head = utils.docHead(),
                node = doc.createElement(css ? 'link' : 'script'),
                clearTimer = function () {
                    if (timer) {
                        timer.cancel();
                        timer = undefined;
                    }
                };

            if (css) {
                // can not use src.toString
                // ? is escaped when combo in KISSY.Uri
                node.href = url;
                node.rel = 'stylesheet';
            } else {
                node.src = url;
                node.async = true;
            }

            callbacks.node = node;

            if (charset) {
                node.charset = charset;
            }

            var end = function (error) {
                var index = error ? 1 : 0;
                clearTimer();
                var callbacks = jsCssCallbacks[src];
                S.each(callbacks, function (callback) {
                    if (callback[index]) {
                        callback[index].call(node);
                    }
                });
                delete jsCssCallbacks[src];
            };

            //标准浏览器 css and all script
            if ('onload' in node || !css) {
                node.onload = node.onreadystatechange = function () {
                    var readyState = node.readyState;
                    if (!readyState ||
                        readyState == "loaded" ||
                        readyState == "complete") {
                        node.onreadystatechange = node.onload = null;
                        end(0)
                    }
                };
                node.onerror = function () {
                    node.onerror = null;
                    error(1);
                };
            }
            // old chrome/firefox for css
            else {
                utils.pollCss(node, function () {
                    end(0);
                });
            }

            if (timeout) {
                timer = S.later(function () {
                    end(1);
                }, timeout * MILLISECONDS_OF_SECOND);
            }

            head.appendChild(node);
            return node;
        }
    });

})(KISSY);
/*
 yiminghe@gmail.com refactor@2012-03-29
 - 考虑连续重复请求单个 script 的情况，内部排队

 yiminghe@gmail.com 2012-03-13
 - getScript
 - 404 in ie<9 trigger success , others trigger error
 - syntax error in all trigger success
 *//**
 * @ignore
 * @fileOverview Declare config info for KISSY.
 * @author yiminghe@gmail.com
 */
(function (S) {

    var Loader = S.Loader,
        utils = Loader.Utils,
        configs = S.configs;
    /*
     modify current module path

     [
     [/(.+-)min(.js(\?t=\d+)?)$/, '$1$2'],
     [/(.+-)min(.js(\?t=\d+)?)$/, function(_,m1,m2){
     return m1+m2;
     }]
     ]

     */
    configs.map = function (rules) {
        var self = this;
        if (rules === false) {
            return self.Config.mappedRules = [];
        }
        return self.Config.mappedRules = (self.Config.mappedRules || []).concat(rules || []);
    };

    configs.mapCombo = function (rules) {
        var self = this;
        if (rules === false) {
            return self.Config.mappedComboRules = [];
        }
        return self.Config.mappedComboRules = (self.Config.mappedComboRules || []).concat(rules || []);
    };

    /*
     包声明
     biz -> .
     表示遇到 biz/x
     在当前网页路径找 biz/x.js
     @private
     */
    configs.packages = function (cfgs) {
        var self = this,
            name,
            base,
            Env = self.Env,
            ps = Env.packages = Env.packages || {};
        if (cfgs) {
            S.each(cfgs, function (cfg, key) {
                // 兼容数组方式
                name = cfg.name || key;
                // 兼容 path
                base = cfg.base || cfg.path;

                // nodejs must be absolute local file path
                if (S.Env.nodejs && !S.startsWith(base, 'file:')) {
                    // specify scheme for KISSY.Uri
                    base = 'file:' + base;
                }

                // must be folder
                if (!S.endsWith(base, '/')) {
                    base += '/';
                }

                // 注意正则化
                cfg.name = name;
                var baseUri = utils.resolveByPage(base);
                cfg.base = baseUri.toString();
                cfg.baseUri = baseUri;
                cfg.runtime = S;
                delete cfg.path;

                ps[ name ] = new Loader.Package(cfg);
            });
        } else if (cfgs === false) {
            Env.packages = {};
        }
    };

    /*
     只用来指定模块依赖信息.
     <code>

     KISSY.config({
     base: '',
     // dom-min.js
     debug: '',
     combine: true,
     tag: '',
     packages: {
     'biz1': {
     // path change to base
     base: 'haha',
     // x.js
     debug: '',
     tag: '',
     combine: false,
     }
     },
     modules: {
     'biz1/main': {
     requires: ['biz1/part1', 'biz1/part2']
     }
     }
     });
     */
    configs.modules = function (modules) {
        var self = this;
        if (modules) {
            S.each(modules, function (modCfg, modName) {
                utils.createModuleInfo(self, modName, modCfg);
                S.mix(self.Env.mods[modName], modCfg);
            });
        } else if (modules === false) {
            self.Env.mods = {};
        }
    };

    /*
     KISSY 's base path.
     */
    configs.base = function (base) {
        var self = this, baseUri, Config = self.Config;
        if (!base) {
            return Config.base;
        }
        // nodejs must be absolute local file path
        if (S.Env.nodejs && !S.startsWith(base, 'file:')) {
            // specify scheme for KISSY.Uri
            base = 'file:' + base;
        }
        baseUri = utils.resolveByPage(base);
        Config.base = baseUri.toString();
        Config.baseUri = baseUri;
    };
})(KISSY);/**
 * @ignore
 * @fileOverview add module to kissy simple loader
 * @author yiminghe@gmail.com, lifesinger@gmail.com
 */
(function (S, undefined) {

    var Loader = S.Loader,
        Path = S.Path,
        utils = Loader.Utils;


    S.augment(Loader,
        Loader.Target,
        {

            //firefox,ie9,chrome 如果 add 没有模块名，模块定义先暂存这里
            __currentModule: null,

            //ie6,7,8开始载入脚本的时间
            __startLoadTime: 0,

            //ie6,7,8开始载入脚本对应的模块名
            __startLoadModuleName: null,

            /**
             * Registers a module.
             * @param {String|Object} [name] module name
             * @param {Function|Object} [fn] entry point into the module that is used to bind module to KISSY
             * @param {Object} [config] special config for this add
             * @param {String[]} [config.requires] array of mod's name that current module requires
             * @member KISSY.Loader
             *
             * for example:
             *      @example
             *      KISSY.add('module-name', function(S){ }, {requires: ['mod1']});
             */
            add: function (name, fn, config) {
                var self = this,
                    runtime = self.runtime,
                    mod,
                    requires,
                    mods = runtime.Env.mods;

                // 兼容
                if (S.isPlainObject(name)) {
                    return runtime.config({
                        modules: name
                    });
                }

                // S.add(name[, fn[, config]])
                if (S.isString(name)) {

                    utils.registerModule(runtime, name, fn, config);

                    mod = mods[name];

                    // 显示指定 add 不 attach
                    if (config && config['attach'] === false) {
                        return;
                    }

                    if (config) {
                        requires = mod.getNormalizedRequires();
                    }

                    if (!requires || utils.isAttached(runtime, requires)) {
                        utils.attachMod(runtime, mod);
                    }

                    return;
                }
                // S.add(fn,config);
                else if (S.isFunction(name)) {
                    config = fn;
                    fn = name;
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
                         have a script.readyState == 'interactive'
                         See RequireJS source code if you need more hints.
                         Anyway, the bottom line from a spec perspective is that it is
                         implemented, it works, and it is possible. Hope that helps.
                         Kris
                         */
                        // http://groups.google.com/group/commonjs/browse_thread/thread/5a3358ece35e688e/43145ceccfb1dc02#43145ceccfb1dc02
                        // use onload to get module name is not right in ie
                        name = findModuleNameByInteractive(self);
                        S.log('old_ie get modName by interactive : ' + name);
                        utils.registerModule(runtime, name, fn, config);
                        self.__startLoadModuleName = null;
                        self.__startLoadTime = 0;
                    } else {
                        // 其他浏览器 onload 时，关联模块名与模块定义
                        self.__currentModule = {
                            fn: fn,
                            config: config
                        };
                    }
                    return;
                }
                S.log('invalid format for KISSY.add !', 'error');
            }
        });


    // ie 特有，找到当前正在交互的脚本，根据脚本名确定模块名
    // 如果找不到，返回发送前那个脚本
    function findModuleNameByInteractive(self) {
        var runtime = self.runtime,
            scripts = S.Env.host.document.getElementsByTagName('script'),
            re,
            i,
            script;

        for (i = 0; i < scripts.length; i++) {
            script = scripts[i];
            if (script.readyState == 'interactive') {
                re = script;
                break;
            }
        }
        if (!re) {
            // sometimes when read module file from cache , interactive status is not triggered
            // module code is executed right after inserting into dom
            // i has to preserve module name before insert module script into dom , then get it back here
            S.log('can not find interactive script,time diff : ' + (+new Date() - self.__startLoadTime), 'error');
            S.log('old_ie get mod name from cache : ' + self.__startLoadModuleName);
            return self.__startLoadModuleName;
        }

        // src 必定是绝对路径
        // or re.hasAttribute ? re.src :  re.getAttribute('src', 4);
        // http://msdn.microsoft.com/en-us/library/ms536429(VS.85).aspx
        // note:
        // <script src='/x.js'></script>
        // ie6-8 => re.src == '/x.js'
        // ie9 or firefox/chrome => re.src == 'http://localhost/x.js'
        var src = utils.resolveByPage(re.src),
            srcStr = src.toString(),
            packages = runtime.Env.packages,
            finalPackagePath,
            p,
            packageBase,
            Config = runtime.Config,
            finalPackageUri,
            finalPackageLength = -1;

        // 外部模块去除包路径，得到模块名
        for (p in packages) {

            packageBase = packages[p].getBase();
            if (S.startsWith(srcStr, packageBase)) {
                // longest match
                if (packageBase.length > finalPackageLength) {
                    finalPackageLength = packageBase.length;
                    finalPackagePath = packageBase;
                    finalPackageUri = packages[p].getBaseUri();
                }
            }

        }
        // 注意：模块名不包含后缀名以及参数，所以去除
        // 系统模块去除系统路径
        // 需要 base norm , 防止 base 被指定为相对路径
        // configs 统一处理
        if (finalPackagePath) {
            return utils.removeExtname(Path.relative(finalPackageUri.getPath(),
                src.getPath()));
        } else if (S.startsWith(srcStr, Config.base)) {
            return utils.removeExtname(Path.relative(Config.baseUri.getPath(),
                src.getPath()));
        }

        S.log('interactive script does not have package config ：' + src, 'error');
        return undefined;
    }

})(KISSY);

/*
 2012-02-21 yiminghe@gmail.com refactor:

 拆分 ComboLoader 与 Loader

 2011-01-04 chengyu<yiminghe@gmail.com> refactor:

 adopt requirejs :

 1. packages(cfg) , cfg :{
 name : 包名，用于指定业务模块前缀
 path: 前缀包名对应的路径
 charset: 该包下所有文件的编码

 2. add(moduleName,function(S,depModule){return function(){}},{requires:['depModuleName']});
 moduleName add 时可以不写
 depModuleName 可以写相对地址 (./ , ../)，相对于 moduleName

 3. S.use(['dom'],function(S,DOM){
 });
 依赖注入，发生于 add 和 use 时期

 4. add,use 不支持 css loader ,getScript 仍然保留支持

 5. 部分更新模块文件代码 x/y?t=2011 ，加载过程中注意去除事件戳，仅在载入文件时使用

 demo : http://lite-ext.googlecode.com/svn/trunk/lite-ext/playground/module_package/index.html

 2011-03-01 yiminghe@gmail.com note:

 compatibility

 1. 保持兼容性
 如果 requires 都已经 attached，支持 add 后立即 attach
 支持 { attach : false } 显示控制 add 时是否 attach

 2011-05-04 初步拆分文件，tmd 乱了
 */
/**
 * @ignore
 * @fileOverview use and attach mod for kissy simple loader
 * @author yiminghe@gmail.com, lifesinger@gmail.com
 */
(function (S) {

    var Loader = S.Loader,
        data = Loader.STATUS,
        utils = Loader.Utils,
        IE = utils.IE,
        remoteModules = {},
        LOADING = data.LOADING,
        LOADED = data.LOADED,
        ERROR = data.ERROR,
        CURRENT_MODULE = '__currentModule',
        ATTACHED = data.ATTACHED;

    function LoadChecker(fn) {
        this.fn = fn;
        this.waitMods = {};
        this.requireLoadedMods = {};
    }

    LoadChecker.prototype = {

        check: function () {
            var self = this,
                waitMods = self.waitMods,
                fn = self.fn;
            if (fn && S.isEmptyObject(waitMods)) {
                fn();
                self.fn = null;
            }
        },

        addWaitMod: function (modName) {
            this.waitMods[modName] = 1;
        },

        removeWaitMod: function (modName) {
            delete this.waitMods[modName];
        },

        isModWait: function (modName) {
            return this.waitMods[modName];
        },

        // only load mod requires once
        // prevent looping dependency sub tree more than once for one use()
        loadModRequires: function (loader, mod) {
            // 根据每次 use 缓存子树
            var requireLoadedMods = this.requireLoadedMods,
                modName = mod.name,
                requires;
            if (!requireLoadedMods[modName]) {
                requireLoadedMods[modName] = 1;
                requires = mod.getNormalizedRequires();
                loadModules(loader, requires, this);
            }
        }

    };


    S.augment(Loader, {
        /**
         * Start load specific mods, and fire callback when these mods and requires are attached.
         * @member KISSY.Loader
         *
         * for example:
         *      @example
         *      S.use('mod-name', callback);
         *      S.use('mod1,mod2', callback);
         *
         * @param {String|String[]} modNames names of mods to be loaded,if string then separated by space
         * @param {Function} callback callback when modNames are all loaded,
         * with KISSY as first argument and mod 's value as the following arguments
         */
        use: function (modNames, callback) {
            var self = this,
                normalizedModNames,
                loadChecker = new LoadChecker(loadReady),
                runtime = self.runtime;

            modNames = utils.getModNamesAsArray(modNames);
            modNames = utils.normalizeModNamesWithAlias(runtime, modNames);

            normalizedModNames = utils.unalias(runtime, modNames);

            function loadReady() {
                attachMods(normalizedModNames, runtime, []);
                callback && callback.apply(runtime, utils.getModules(runtime, modNames));
            }

            loadModules(self, normalizedModNames, loadChecker);

            // in case modules is loaded statically
            // synchronous check
            loadChecker.check();

            return self;
        },

        clear: function () {
        }
    });

    function attachMods(modNames, runtime, stack) {
        var i,
            l = modNames.length,
            stackDepth = stack.length;

        for (i = 0; i < l; i++) {
            attachMod(modNames[i], runtime, stack);
            stack.length = stackDepth;
        }
    }

    function attachMod(modName, runtime, stack) {
        var mods = runtime.Env.mods,
            m = mods[modName];
        if (m.status == ATTACHED) {
            return;
        }
        if (S.inArray(modName, stack)) {
            stack.push(modName);
            S.error('find cyclic dependency between mods: ' + stack);
            return;
        }
        stack.push(modName);
        attachMods(m.getNormalizedRequires(), runtime, stack);
        utils.attachMod(runtime, m);
    }

    function loadModules(self, modNames, loadChecker) {
        var i, l = modNames.length;
        for (i = 0; i < l; i++) {
            loadModule(self, modNames[i], loadChecker);
        }
    }

    function loadModule(self, modName, loadChecker) {
        var runtime = self.runtime,
            status,
            mods = runtime.Env.mods,
            mod = mods[modName];

        if (!mod) {
            utils.createModuleInfo(runtime, modName);
            mod = mods[modName];
        }

        status = mod.status;

        if (status == ATTACHED) {
            return;
        }

        // 只在 LOADED 后加载一次依赖项一次
        if (status === LOADED) {
            loadChecker.loadModRequires(self, mod);
        } else {
            var isWait = loadChecker.isModWait(modName);
            // error or init or loading
            loadChecker.addWaitMod(modName);
            // parallel use
            if (status <= LOADING &&
                // prevent duplicate listen for one use
                !isWait) {
                // load and attach this module
                fetchModule(self, mod, loadChecker);
            }

        }
    }

    // Load a single module.
    function fetchModule(self, mod, loadChecker) {

        var runtime = self.runtime,
            modName = mod.getName(),
            charset = mod.getCharset(),
            url = mod.getFullPath(),
            isCss = mod.getType() == 'css';

        mod.status = LOADING;

        if (IE && !isCss) {
            self.__startLoadModuleName = modName;
            self.__startLoadTime = Number(+new Date());
        }

        S.getScript(url, {
            // syntaxError in all browser will trigger this
            // same as #111 : https://github.com/kissyteam/kissy/issues/111
            success: function () {
                if (!remoteModules[modName]) {
                    S.log('load remote module: ' + modName, 'info');
                    remoteModules[modName] = 1;
                }
                // parallel use
                // 只设置第一个 use 处
                if (mod.status == LOADING) {
                    if (isCss) {
                        // css does not set LOADED because no add for css! must be set manually
                        utils.registerModule(runtime, modName, S.noop);
                    } else {
                        var currentModule;
                        // does not need this step for css
                        // standard browser(except ie9) fire load after KISSY.add immediately
                        if (currentModule = self[CURRENT_MODULE]) {
                            S.log('standard browser get mod name after load : ' + modName);
                            utils.registerModule(runtime,
                                modName, currentModule.fn,
                                currentModule.config);
                            self[CURRENT_MODULE] = null;
                        }
                    }
                }
                checkHandler();
            },
            error: checkHandler,
            // source:mod.name + '-init',
            charset: charset
        });

        function checkHandler() {
            if (mod.fn) {
                loadChecker.loadModRequires(self, mod);
                loadChecker.removeWaitMod(modName);
                // a mod is loaded, need to check globally
                loadChecker.check();
            } else {
                // ie will call success even when getScript error(404)
                _modError();
            }
        }

        function _modError() {
            S.log(modName + ' is not loaded! can not find module in path : ' + url, 'error');
            mod.status = ERROR;
        }

    }
})(KISSY);

/*
 2012-10-08 yiminghe@gmail.com refactor
 - use 调用先统一 load 再统一 attach

 2012-09-20 yiminghe@gmail.com refactor
 - 参考 async 重构，去除递归回调

 TODO： 1.4 不兼容修改
 - 分离下载与 attach(执行) 过程
 - 下载阶段构建依赖树
 - use callback 统一 attach
 *//**
 * @ignore
 * @fileOverview using combo to load module files
 * @author yiminghe@gmail.com
 */
(function (S) {

    function loadScripts(urls, callback, charset) {
        var count = urls && urls.length;
        if (!count) {
            callback();
            return;
        }
        S.each(urls, function (url) {
            S.getScript(url, function () {
                if (!(--count)) {
                    callback();
                }
            }, charset || 'utf-8');
        });
    }

    var Loader = S.Loader,
        data = Loader.STATUS,
        utils = Loader.Utils;

    /**
     * @class KISSY.Loader.ComboLoader
     * using combo to load module files
     * @param runtime KISSY
     * @private
     * @mixins KISSY.Loader.Target
     */
    function ComboLoader(runtime) {
        S.mix(this, {
            runtime: runtime,
            queue: [],
            loading: 0
        });
    }

    S.augment(ComboLoader, Loader.Target);

    // ----------------------- private start
    // Load next use
    function next(self) {
        var args;
        if (self.queue.length) {
            args = self.queue.shift();
            _use(self, args.modNames, args.fn);
        }
    }

    // Enqueue use
    function enqueue(self, modNames, fn) {
        self.queue.push({
            modNames: modNames,
            fn: fn
        });
    }

    // Real use.
    function _use(self, modNames, fn) {
        var unaliasModNames,
            allModNames,
            comboUrls,
            css,
            countCss,
            p,
            runtime = self.runtime;

        self.loading = 1;

        modNames = utils.getModNamesAsArray(modNames);

        modNames = utils.normalizeModNamesWithAlias(runtime, modNames);

        unaliasModNames = utils.unalias(runtime, modNames);

        allModNames = self.calculate(unaliasModNames);

        utils.createModulesInfo(runtime, allModNames);

        comboUrls = self.getComboUrls(allModNames);

        // load css first to avoid page blink
        css = comboUrls.css;
        countCss = 0;

        for (p in css) {
            countCss++;
        }

        var jsOk = 0, cssOk = !countCss;

        for (p in css) {

            loadScripts(css[p], function () {
                if (!(--countCss)) {
                    // mark all css mods to be loaded
                    for (var p in css) {

                        S.each(css[p].mods, function (m) {
                            utils.registerModule(runtime, m.name, S.noop);
                        });

                    }
                    cssOk = 1;
                    check(jsOk);
                }
            }, css[p].charset);

        }

        function check(paramJsOk) {
            jsOk = paramJsOk;
            if (cssOk && jsOk) {
                attachMods(self, unaliasModNames);
                if (utils.isAttached(runtime, unaliasModNames)) {
                    fn.apply(null, utils.getModules(runtime, modNames))
                } else {
                    // new require is introduced by KISSY.add
                    // run again
                    _use(self, modNames, fn)
                }
            }
        }

        // jss css download in parallel
        _useJs(comboUrls, check);
    }

    // use js
    function _useJs(comboUrls, check) {
        var p,
            success,
            jss = comboUrls.js,
            countJss = 0;


        for (p in jss) {
            countJss++;
        }

        if (!countJss) {
            // 2012-05-18 bug: loaded 那么需要加载的 jss 为空，要先 attach 再通知用户回调函数
            check(1);
            return;
        }
        success = 1;
        for (p in jss) {

            (function (p) {
                loadScripts(jss[p], function () {
                    var mods = jss[p].mods, mod, i;
                    for (i = 0; i < mods.length; i++) {
                        mod = mods[i];
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
                        check(1);
                    }
                }, jss[p].charset);
            })(p);

        }
    }

    // attach mods
    function attachMods(self, modNames) {
        S.each(modNames, function (modName) {
            attachMod(self, modName);
        });
    }

    // attach one mod
    function attachMod(self, modName) {
        var runtime = self.runtime,
            i,
            len,
            requires,
            r,
            mod = getModInfo(self, modName);
        // new require after add
        // not register yet!
        if (!mod || utils.isAttached(runtime, modName)) {
            return undefined;
        }
        requires = mod.getNormalizedRequires();
        len = requires.length;
        for (i = 0; i < len; i++) {
            r = requires[i];
            attachMod(self, r);
            if (!utils.isAttached(runtime, r)) {
                return false;
            }
        }
        utils.attachMod(runtime, mod);
        return undefined;
    }

    // get mod info.
    function getModInfo(self, modName) {
        return self.runtime.Env.mods[modName];
    }

    // get requires mods need to be loaded dynamically
    function getRequires(self, modName, cache) {
        var runtime = self.runtime,
            requires,
            i,
            rMod,
            r,
            allRequires,
            debugMode = S.Config.debug,
            ret2,
            mod = getModInfo(self, modName),
        // 做个缓存，该模块的待加载子模块都知道咯，不用再次递归查找啦！
            ret = cache[modName];

        if (ret) {
            return ret;
        }

        cache[modName] = ret = {};

        // if this mod is attached then its require is attached too!
        if (mod && !utils.isAttached(runtime, modName)) {
            requires = mod.getNormalizedRequires();
            // circular dependency check
            if (debugMode) {
                allRequires = mod.__allRequires || (mod.__allRequires = {});
                if (allRequires[modName]) {
                    S.error('detect circular dependency among : ');
                    S.error(allRequires);
                    return ret;
                }
            }
            for (i = 0; i < requires.length; i++) {
                r = requires[i];
                if (debugMode) {
                    // circular dependency check
                    rMod = getModInfo(self, r);
                    allRequires[r] = 1;
                    if (rMod && rMod.__allRequires) {
                        S.each(rMod.__allRequires, function (_, r2) {
                            allRequires[r2] = 1;
                        });
                    }
                }
                // if not load into page yet
                if (!utils.isLoaded(runtime, r) &&
                    // and not attached
                    !utils.isAttached(runtime, r)) {
                    ret[r] = 1;
                }
                ret2 = getRequires(self, r, cache);
                S.mix(ret, ret2);
            }
        }

        return ret;
    }

    // ----------------------- private end

    S.augment(ComboLoader, {


        /**
         * use
         * @param modNames
         * @param callback
         */
        use: function (modNames, callback) {
            var self = this,
                fn = function () {
                    // KISSY.use in callback will be queued
                    if (callback) {
                        callback.apply(this, arguments);
                    }
                    self.loading = 0;
                    next(self);
                };

            enqueue(self, modNames, fn);

            if (!self.loading) {
                next(self);
            }
        },

        /**
         * add module
         * @param name
         * @param fn
         * @param config
         */
        add: function (name, fn, config) {
            var self = this,
                runtime = self.runtime;
            // 兼容
            if (S.isPlainObject(name)) {
                return runtime.config({
                    modules: name
                });
            }
            utils.registerModule(runtime, name, fn, config);
        },

        /**
         * calculate dependency
         * @param modNames
         * @private
         * @return {Array}
         */
        calculate: function (modNames) {
            var ret = {},
                i,
                m,
                r,
                ret2,
                self = this,
                runtime = self.runtime,
            // 提高性能，不用每个模块都再次全部依赖计算
            // 做个缓存，每个模块对应的待动态加载模块
                cache = {};
            for (i = 0; i < modNames.length; i++) {
                m = modNames[i];
                if (!utils.isAttached(runtime, m)) {
                    if (!utils.isLoaded(runtime, m)) {
                        ret[m] = 1;
                    }
                    S.mix(ret, getRequires(self, m, cache));
                }
            }
            ret2 = [];
            for (r in ret) {

                ret2.push(r);

            }
            return ret2;
        },

        /**
         * Get combo urls
         * @param modNames
         * @private
         * @return {Object}
         */
        getComboUrls: function (modNames) {
            var self = this,
                i,
                runtime = self.runtime,
                Config = runtime.Config,
                combos = {};

            S.each(modNames, function (modName) {
                var mod = getModInfo(self, modName),
                    packageInfo = mod.getPackage(),
                    packageBase = packageInfo.getBase(),
                    type = mod.getType(),
                    mods,
                    packageName = packageInfo.getName();
                combos[packageName] = combos[packageName] || {};
                if (!(mods = combos[packageName][type])) {
                    mods = combos[packageName][type] = combos[packageName][type] || [];
                    mods.combine = 1;
                    if (packageInfo.isCombine() === false) {
                        mods.combine = 0;
                    }
                    mods.tag = packageInfo.getTag();
                    mods.charset = packageInfo.getCharset();
                    mods.packageBase = packageBase;
                }
                mods.push(mod);
            });

            var res = {
                    js: {},
                    css: {}
                },
                t,
                packageName,
                type,
                comboPrefix = Config.comboPrefix,
                comboSep = Config.comboSep,
                maxFileNum = Config.comboMaxFileNum,
                maxUrlLength = Config.comboMaxUrlLength;

            for (packageName in combos) {

                for (type in combos[packageName]) {

                    t = [];

                    var jss = combos[packageName][type],
                        tag = jss.tag,
                        suffix = (tag ? ('?t=' + encodeURIComponent(tag)) : ''),
                        suffixLength = suffix.length,
                        packageBase = jss.packageBase,
                        prefix,
                        path,
                        fullpath,
                        l,
                        packagePath = packageBase +
                            (packageName ? (packageName + '/') : '');

                    res[type][packageName] = [];
                    res[type][packageName].charset = jss.charset;
                    // current package's mods
                    res[type][packageName].mods = [];
                    // add packageName to common prefix
                    // combo grouped by package
                    prefix = packagePath + comboPrefix;
                    l = prefix.length;

                    function pushComboUrl() {
                        // map the whole combo path
                        res[type][packageName].push(utils.getMappedPath(
                            runtime,
                            prefix +
                                t.join(comboSep) +
                                suffix,
                            Config.mappedComboRules || []
                        ));
                    }

                    for (i = 0; i < jss.length; i++) {

                        // map individual module
                        fullpath = jss[i].getFullPath();

                        res[type][packageName].mods.push(jss[i]);

                        if (!jss.combine || !S.startsWith(fullpath, packagePath)) {
                            res[type][packageName].push(fullpath);
                            continue;
                        }

                        // ignore query parameter
                        path = fullpath.slice(packagePath.length).replace(/\?.*$/, '');

                        t.push(path);

                        if (
                            (t.length > maxFileNum) ||
                                (l + t.join(comboSep).length + suffixLength > maxUrlLength)) {
                            t.pop();
                            pushComboUrl();
                            t = [];
                            i--;
                        }
                    }
                    if (t.length) {
                        pushComboUrl();
                    }

                }

            }

            return res;
        }
    });

    Loader.Combo = ComboLoader;

})(KISSY);
/*
 2012-02-20 yiminghe note:
 - three status
 0 : initialized
 LOADED : load into page
 ATTACHED : fn executed
 *//**
 * @ignore
 * @fileOverview mix loader into S and infer KISSy baseUrl if not set
 * @author yiminghe@gmail.com, lifesinger@gmail.com
 */
(function (S) {

    var Loader = S.Loader,
        utils = Loader.Utils,
        ComboLoader = S.Loader.Combo;

    S.mix(S,
        {
            /**
             * Registers a module with the KISSY global.
             * @param {String} name module name.
             * it must be set if combine is true in {@link KISSY#config}
             * @param {Function} fn module definition function that is used to return
             * this module value
             * @param {KISSY} fn.S KISSY global instance
             * @param {Object} [cfg] module optional config data
             * @param {String[]} cfg.requires this module's required module name list
             * @member KISSY
             *
             * for example:
             *      @example
             *      // dom module's definition
             *      KISSY.add('dom', function(S, UA){
             *          return {css: function(el, name, val){}};
             *      },{
             *          requires:['ua']
             *      });
             */
            add: function (name, fn, cfg) {
                this.getLoader().add(name, fn, cfg);
            },
            /**
             * Attached one or more modules to global KISSY instance.
             * @param {String|String[]} names moduleNames. 1-n modules to bind(use comma to separate)
             * @param {Function} callback callback function executed
             * when KISSY has the required functionality.
             * @param {KISSY} callback.S KISSY instance
             * @param callback.x... used module values
             * @member KISSY
             *
             * for example:
             *      @example
             *      // loads and attached overlay,dd and its dependencies
             *      KISSY.use('overlay,dd', function(S, Overlay){});
             */
            use: function (names, callback) {
                this.getLoader().use(names, callback);
            },
            /**
             * get KISSY 's loader instance
             * @member KISSY
             * @return {KISSY.Loader}
             */
            getLoader: function () {
                var self = this, env = self.Env;
                if (self.Config.combine && !S.Env.nodejs) {
                    return env._comboLoader;
                } else {
                    return env._loader;
                }
            },
            clearLoader: function () {
                var self = this, env = self.Env, l;

                if ((l = env._comboLoader) && l.clear) {
                    l.clear();
                }
                if ((l = env._loader) && l.clear) {
                    l.clear();
                }

                self.config({
                    map: false,
                    mapCombo: false,
                    modules: false,
                    packages: false
                })
            },
            /**
             * get module value defined by define function
             * @param {string} moduleName
             * @member KISSY
             */
            require: function (moduleName) {
                var self = this,
                    mods = self.Env.mods,
                    mod = mods[moduleName];
                return mod && mod.value;
            }
        });

    function returnJson(s) {
        return (new Function('return ' + s))();
    }

    /**
     * get base from seed/kissy.js
     * @return base for kissy
     * @ignore
     *
     * for example:
     *      @example
     *      http://a.tbcdn.cn/??s/kissy/1.4.0/seed-min.js,p/global/global.js
     *      note about custom combo rules, such as yui3:
     *      combo-prefix='combo?' combo-sep='&'
     */
    function getBaseInfo() {
        // get base from current script file path
        // notice: timestamp
        var baseReg = /^(.*)(seed|kissy)(?:-min)?\.js[^/]*/i,
            baseTestReg = /(seed|kissy)(?:-min)?\.js/i,
            comboPrefix,
            comboSep,
            scripts = S.Env.host.document.getElementsByTagName('script'),
            script = scripts[scripts.length - 1],
            src = utils.resolveByPage(script.src).toString(),
            baseInfo = script.getAttribute('data-config');

        if (baseInfo) {
            baseInfo = returnJson(baseInfo);
        } else {
            baseInfo = {};
        }

        // taobao combo syntax
        // /??seed.js,dom.js
        // /?%3fseed.js%2cdom.js
        src = src.replace(/%3f/gi, '?').replace(/%2c/gi, ',');

        comboPrefix = baseInfo.comboPrefix = baseInfo.comboPrefix || '??';
        comboSep = baseInfo.comboSep = baseInfo.comboSep || ',';

        var parts ,
            base,
            index = src.indexOf(comboPrefix);

        // no combo
        if (index == -1) {
            base = src.replace(baseReg, '$1');
        } else {
            base = src.substring(0, index);
            parts = src.substring(index + comboPrefix.length).split(comboSep);
            S.each(parts, function (part) {
                if (part.match(baseTestReg)) {
                    base += part.replace(baseReg, '$1');
                    return false;
                }
            });
        }
        return S.mix({
            base: base,
            baseUri: new S.Uri(base)
        }, baseInfo);
    }

    if (S.Env.nodejs) {
        S.config('base', __dirname.replace(/\\/g, '/').replace(/\/$/, '') + '/');
    } else {
        S.config(S.mix({
            // 2k(2048) url length
            comboMaxUrlLength: 2000,
            // file limit number for a single combo url
            comboMaxFileNum: 40,
            charset: 'utf-8',
            tag: '20121010140939'
        }, getBaseInfo()));
    }

    // Initializes loader.
    (function () {
        var env = S.Env;
        env.mods = env.mods || {}; // all added mods
        env._loader = new Loader(S);
        if (ComboLoader) {
            env._comboLoader = new ComboLoader(S);
        }
    })();

})(KISSY);/**
 * @ignore
 * @fileOverview web.js
 * @author lifesinger@gmail.com, yiminghe@gmail.com
 * @description this code can only run at browser environment
 */
(function (S, undefined) {

    var win = S.Env.host,

        doc = win['document'],

        docElem = doc && doc.documentElement,

        location = win.location,

        navigator = win.navigator,

        EMPTY = '',

        readyDefer = new S.Defer(),

        readyPromise = readyDefer.promise,

    // The number of poll times.
        POLL_RETIRES = 500,

    // The poll interval in milliseconds.
        POLL_INTERVAL = 40,

    // #id or id
        RE_IDSTR = /^#?([\w-]+)$/,

        RE_NOT_WHITE = /\S/;

    S.mix(S,
        {


            /**
             * A crude way of determining if an object is a window
             * @member KISSY
             */
            isWindow: function (obj) {
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
                    if (win['DOMParser']) {
                        xml = new DOMParser().parseFromString(data, 'text/xml');
                    } else { // IE
                        xml = new ActiveXObject('Microsoft.XMLDOM');
                        xml.async = 'false';
                        xml.loadXML(data);
                    }
                } catch (e) {
                    S.log('parseXML error : ');
                    S.log(e);
                    xml = undefined;
                }
                if (!xml || !xml.documentElement || xml.getElementsByTagName('parsererror').length) {
                    S.error('Invalid XML: ' + data);
                }
                return xml;
            },

            /**
             * Evalulates a script in a global context.
             * @member KISSY
             */
            globalEval: function (data) {
                if (data && RE_NOT_WHITE.test(data)) {
                    // http://weblogs.java.net/blog/driscoll/archive/2009/09/08/eval-javascript-global-context
                    ( win.execScript || function (data) {
                        win[ 'eval' ].call(win, data);
                    } )(data);
                }
            },

            /**
             * Specify a function to execute when the DOM is fully loaded.
             * @param fn {Function} A function to execute after the DOM is ready
             *
             * for example:
             *      @example
             *      KISSY.ready(function(S){});
             *
             * @return {KISSY}
             * @member KISSY
             */
            ready: function (fn) {

                readyPromise.then(fn);

                return this;
            },

            /**
             * Executes the supplied callback when the item with the supplied id is found.
             * @param id <String> The id of the element, or an array of ids to look for.
             * @param fn <Function> What to execute when the element is found.
             * @member KISSY
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
                            ++retryCount > POLL_RETIRES) {
                            timer.cancel();
                        }
                    }, POLL_INTERVAL, true);
            }
        });


    /**
     * Binds ready events.
     * @ignore
     */
    function _bindReady() {
        var doScroll = docElem && docElem.doScroll,
            eventType = doScroll ? 'onreadystatechange' : 'DOMContentLoaded',
            COMPLETE = 'complete',
            fire = function () {
                readyDefer.resolve(S)
            };

        // Catch cases where ready() is called after the
        // browser event has already occurred.
        if (!doc || doc.readyState === COMPLETE) {
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
                S.log('get frameElement error : ');
                S.log(e);
                notframe = false;
            }

            // can not use in iframe,parent window is dom ready so doScroll is ready too
            if (doScroll && notframe) {
                function readyScroll() {
                    try {
                        // Ref: http://javascript.nwbox.com/IEContentLoaded/
                        doScroll('left');
                        fire();
                    } catch (ex) {
                        //S.log('detect document ready : ' + ex);
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


//     bind on start
//     in case when you bind but the DOMContentLoaded has triggered
//     then you has to wait onload
//     worst case no callback at all
    _bindReady();

    if (navigator && navigator.userAgent.match(/MSIE/)) {
        try {
            doc.execCommand('BackgroundImageCache', false, true);
        } catch (e) {
        }
    }

})(KISSY, undefined);
/**
 * @ignore
 * Default KISSY Gallery and core alias.
 * @author yiminghe@gmail.com
 */
(function (S) {
    S.config({
        packages: {
            gallery: {
                base: S.Config.baseUri.resolve('../').toString()
            }
        },
        modules: {
            core: {
                alias: ['dom', 'event', 'ajax', 'anim', 'base', 'node', 'json']
            }
        }
    });
})(KISSY);
/*Generated by KISSY Module Compiler*/
if(KISSY.Loader){
KISSY.config('modules', {
'flash': {requires: ['ua','dom','json']},
'combobox': {requires: ['component','node','input-selection','menu','ajax']},
'anim': {requires: ['dom','event','ua']},
'toolbar': {requires: ['component','node']},
'dom': {requires: ['ua']},
'menubutton': {requires: ['menu','node','button','component']},
'waterfall': {requires: ['node','base']},
'dd': {requires: ['ua','dom','event','node','base']},
'switchable': {requires: ['dom','anim','event']},
'tree': {requires: ['node','component','event']},
'button': {requires: ['component','event']},
'json': {requires: ['ua']},
'component': {requires: ['event','ua','dom','node','base']},
'event': {requires: ['ua','dom']},
'ajax': {requires: ['json','event','dom']},
'resizable': {requires: ['node','base','dd']},
'stylesheet': {requires: ['dom']},
'input-selection': {requires: ['dom']},
'datalazyload': {requires: ['dom','event','base']},
'calendar': {requires: ['node','ua','event']},
'validation': {requires: ['dom','event','node']},
'imagezoom': {requires: ['node','overlay']},
'menu': {requires: ['event','component','node','ua']},
'suggest': {requires: ['dom','event','ua']},
'node': {requires: ['event','dom','anim']},
'editor': {requires: ['htmlparser','component','core']},
'split-button': {requires: ['component','button','menubutton']},
'mvc': {requires: ['base','event','node','ajax','json']},
'color': {requires: ['base']},
'overlay': {requires: ['ua','component','node']},
'base': {requires: ['event']},
'separator': {requires: ['component']},
'tabs': {requires: ['button','component','toolbar']}
});
}
