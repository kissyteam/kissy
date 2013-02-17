/*
Copyright 2013, KISSY UI Library v1.30
MIT Licensed
build time: Feb 17 19:29
*/
/**
 * @ignore
 * A seed where KISSY grows up from, KISS Yeah !
 * @author https://github.com/kissyteam?tab=members
 */

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
var KISSY = (function (undefined) {

    var host = this,
        S,
        guid = 0,
        EMPTY = '';

    S = {

        /**
         * The build time of the library.
         * NOTICE: '20130217192945' will replace with current timestamp when compressing.
         * @private
         * @type {String}
         */
        __BUILD_TIME: '20130217192945',
        /**
         * KISSY Environment.
         * @private
         * @type {Object}
         */
        Env: {
            host: host,
            nodejs: (typeof require == 'function') && (typeof exports == 'object')
        },
        /**
         * KISSY Config.
         * If load kissy.js, Config.debug defaults to true.
         * Else If load kissy-min.js, Config.debug defaults to false.
         * @private
         * @property {Object} Config
         * @property {Boolean} Config.debug
         * @member KISSY
         */
        Config: {
            debug: '@DEBUG@',
            fns: {}
        },

        /**
         * The version of the library.
         * NOTICE: '1.30' will replace with current version when compressing.
         * @type {String}
         */
        version: '1.30',

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
         * @param {String} [configName.packages.ignorePackageNameInUri=false] whether remove packageName from module request uri,
         * can only be used in production mode.
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
                configFns = Config.fns;
            if (S.isObject(configName)) {
                S.each(configName, function (configValue, p) {
                    fn = configFns[p];
                    if (fn) {
                        fn.call(self, configValue);
                    } else {
                        Config[p] = configValue;
                    }
                });
            } else {
                cfg = configFns[configName];
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
                // with stack info!
                throw msg instanceof  Error ? msg : new Error(msg);
            }
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

    // exports for nodejs
    if (S.Env.nodejs) {
        S.KISSY = S;
        module.exports = S;
    }

    return S;

})();/**
 * @ignore
 * object utilities of lang
 * @author yiminghe@gmail.com
 *
 */
(function (S, undefined) {

    var MIX_CIRCULAR_DETECTION = '__MIX_CIRCULAR',
        STAMP_MARKER = '__~ks_stamped',
        host = this,
        TRUE = true,
        EMPTY = '',
        ObjectCreate = Object.create,
    // error in native ie678, not in simulated ie9
        hasEnumBug = !({toString: 1}.propertyIsEnumerable('toString')),
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
         * Get all the property names of o as array
         * @param {Object} o
         * @return {Array}
         * @member KISSY
         */
        keys: function (o) {
            var result = [], p, i;

            for (p in o) {
                result.push(p);
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
         * Copies all the properties of s to r.
         * @method
         * @param {Object} r the augmented object
         * @param {Object} s the object need to augment
         * @param {Boolean|Object} [ov=TRUE] whether overwrite existing property or config.
         * @param {Boolean} [ov.overwrite=TRUE] whether overwrite existing property.
         * @param {String[]} [ov.whitelist] array of white-list properties
         * @param {Boolean}[ov.deep=false] whether recursive mix if encounter object.
         * @param {String[]} [wl] array of white-list properties
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
                wl = ov['whitelist'];
                deep = ov['deep'];
                ov = ov['overwrite'];
            }
            var cache = [],
                c,
                i = 0;
            mixInternal(r, s, ov, wl, deep, cache);
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
         * @param {...Object} var_args objects need to be merged
         * @return {Object} the new merged object
         * @member KISSY
         */
        merge: function (var_args) {
            var_args = S.makeArray(arguments);
            var o = {},
                i,
                l = var_args.length;
            for (i = 0; i < l; i++) {
                S.mix(o, var_args[i]);
            }
            return o;
        },

        /**
         * Applies prototype properties from the supplier to the receiver.
         * @param   {Object} r received object
         * @param   {...Object} var_args object need to  augment
         *          {Boolean} [ov=TRUE] whether overwrite existing property
         *          {String[]} [wl] array of white-list properties
         * @return  {Object} the augmented object
         * @member KISSY
         */
        augment: function (r, var_args) {
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
         * @member KISSY
         */
        extend: function (r, s, px, sx) {
            if (!s || !r) {
                return r;
            }

            var sp = s.prototype,
                rp;

            // add prototype chain
            rp = createObject(sp, r);
            r.prototype = S.mix(rp, r.prototype);
            r.superclass = createObject(sp, s);

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
                    o = o[p[j]] = o[p[j]] || { };
                }
            }
            return o;
        }

    });

    function Empty() {
    }

    function createObject(proto, constructor) {
        var newProto;
        if (ObjectCreate) {
            newProto = ObjectCreate(proto);
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

        if (ov === undefined) {
            ov = TRUE;
        }

        var i = 0, p, keys, len;

        // 记录循环标志
        s[MIX_CIRCULAR_DETECTION] = r;

        // 记录被记录了循环标志的对像
        cache.push(s);

        if (wl) {
            len = wl.length;
            for (i = 0; i < len; i++) {
                p = wl[i];
                if (p in s) {
                    _mix(p, r, s, ov, wl, deep, cache);
                }
            }
        } else {
            // mix all properties
            keys = S.keys(s);
            len = keys.length;
            for (i = 0; i < len; i++) {
                p = keys[i];
                if (p != MIX_CIRCULAR_DETECTION) {
                    // no hasOwnProperty judge!
                    _mix(p, r, s, ov, wl, deep, cache);
                }
            }
        }

        return r;
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
                // S.mix({},{x:undefined})
                if (target === undefined) {
                    r[p] = target;
                }
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
                    mixInternal(clone, src, ov, wl, TRUE, cache);
                }
            } else if (src !== undefined && (ov || !(p in r))) {
                r[p] = src;
            }
        }
    }
})(KISSY);/**
 * @ignore
 * array utilities of lang
 * @author yiminghe@gmail.com
 *
 */
(function (S, undefined) {

    var TRUE = true,
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
                    isObj = length === undefined || S.type(object) === 'function';

                context = context || null;

                if (isObj) {
                    keys = S.keys(object);
                    for (; i < keys.length; i++) {
                        key = keys[i];
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
                    var el = typeof arr == 'string' ? arr.charAt(i) : arr[i];
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
         * refer: https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/array/reduce
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
         * Converts object to a TRUE array.
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
                || typeof o == 'string'
                || S.isFunction(o)) {
                return [o];
            }
            var ret = [];
            for (var i = 0, l = o.length; i < l; i++) {
                ret[i] = o[i];
            }
            return ret;
        }
    });

})(KISSY);/**
 * @ignore
 * escape of lang
 * @author yiminghe@gmail.com
 *
 */
(function (S, undefined) {
    // IE doesn't include non-breaking-space (0xa0) in their \s character
    // class (as required by section 7.2 of the ECMAScript spec), we explicitly
    // include it in the regexp to enforce consistent cross-browser behavior.
    var SEP = '&',
        EMPTY = '',
        EQ = '=',
        TRUE = true,
    // FALSE = false,
        HEX_BASE = 16,
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

    function isValidParamValue(val) {
        var t = typeof val;
        // If the type of val is null, undefined, number, string, boolean, return TRUE.
        return val == null || (t !== 'object' && t !== 'function');
    }

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

    S.mix(S, {

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
         * frequently used in taobao cookie about nick
         * @member KISSY
         * @return {String} un-unicode string.
         */
        fromUnicode: function (str) {
            return str.replace(/\\u([a-f\d]{4})/ig, function (m, u) {
                return  String.fromCharCode(parseInt(u, HEX_BASE));
            });
        },
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
        escapeHTML: function (str) {
            return (str + '').replace(getEscapeReg(), function (m) {
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
        unEscapeHTML: function (str) {
            return str.replace(getUnEscapeReg(), function (m, n) {
                return htmlEntities[m] || String.fromCharCode(+n);
            });
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
            if (!S.isPlainObject(o)) {
                return EMPTY;
            }
            sep = sep || SEP;
            eq = eq || EQ;
            if (S.isUndefined(serializeArray)) {
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
            if (typeof str != 'string' || !(str = S.trim(str))) {
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
                if (eqIndex == -1) {
                    key = decode(pairs[i]);
                    val = undefined;
                } else {
                    // remember to decode key!
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
        }
    });
})(KISSY);/**
 * @ignore
 * function utilities of lang
 * @author yiminghe@gmail.com
 *
 */
(function (S, undefined) {

    function bindFn(r, fn, obj) {
        var slice = [].slice,
            args = slice.call(arguments, 3),
            fNOP = function () {
            },
            bound = function () {
                var inArgs = slice.call(arguments);
                return fn.apply(
                    this instanceof fNOP ? this : obj,
                    (r ? inArgs.concat(args) : args.concat(inArgs))
                );
            };
        fNOP.prototype = fn.prototype;
        bound.prototype = new fNOP();
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

            if (typeof fn == 'string') {
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
})(KISSY);/**
 * @ignore
 *   lang
 * @author  yiminghe@gmail.com, lifesinger@gmail.com
 *
 */
(function (S, undefined) {

    var TRUE = true,
        FALSE = false,
        CLONE_MARKER = '__~ks_cloned',
        COMPARE_MARKER = '__~ks_compared';

    S.mix(S, {
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
                if (typeof a == 'string' && typeof b == 'string') {
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
                            // S.log('delete CLONE_MARKER error : ');
                            v[CLONE_MARKER] = undefined;
                        }
                    }
                });
                memory = null;
                return ret;
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
 * string utilities of lang
 * @author yiminghe@gmail.com
 *
 */
(function (S, undefined) {

    // IE doesn't include non-breaking-space (0xa0) in their \s character
    // class (as required by section 7.2 of the ECMAScript spec), we explicitly
    // include it in the regexp to enforce consistent cross-browser behavior.
    var RE_TRIM = /^[\s\xa0]+|[\s\xa0]+$/g,
        trim = String.prototype.trim,
        SUBSTITUTE_REG = /\\?\{([^{}]+)\}/g,
        EMPTY = '';

    S.mix(S, {
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
         * Substitutes keywords in a string using an object/array.
         * Removes undefined keywords and ignores escaped keywords.
         * @param {String} str template string
         * @param {Object} o json data
         * @member KISSY
         * @param {RegExp} [regexp] to match a piece of template string
         */
        substitute: function (str, o, regexp) {
            if (typeof str != 'string' || !o) {
                return str;
            }

            return str.replace(regexp || SUBSTITUTE_REG, function (match, name) {
                if (match.charAt(0) === '\\') {
                    return match.slice(1);
                }
                return (o[name] === undefined) ? EMPTY : o[name];
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
        }

    });
})(KISSY);/**
 * @ignore
 *   type of land
 * @author  lifesinger@gmail.com, yiminghe@gmail.com
 *
 */
(function (S, undefined) {
    // [[Class]] -> type pairs
    var class2type = {},
        FALSE = false,
        OP = Object.prototype,
        toString = OP.toString;

    function hasOwnProperty(o, p) {
        return Object.prototype.hasOwnProperty.call(o, p);
    }

    S.mix(S,
        {
            /**
             * test whether o is boolean
             * @method
             * @param  o
             * @return {Boolean}
             * @member KISSY
             */
            isBoolean: 0,
            /**
             * test whether o is number
             * @method
             * @param  o
             * @return {Boolean}
             * @member KISSY
             */
            isNumber: 0,
            /**
             * test whether o is String
             * @method
             * @param  o
             * @return {Boolean}
             * @member KISSY
             */
            isString: 0,
            /**
             * test whether o is function
             * @method
             * @param  o
             * @return {Boolean}
             * @member KISSY
             */
            isFunction: 0,
            /**
             * test whether o is Array
             * @method
             * @param  o
             * @return {Boolean}
             * @member KISSY
             */
            isArray: 0,
            /**
             * test whether o is Date
             * @method
             * @param  o
             * @return {Boolean}
             * @member KISSY
             */
            isDate: 0,
            /**
             * test whether o is RegExp
             * @method
             * @param  o
             * @return {Boolean}
             * @member KISSY
             */
            isRegExp: 0,
            /**
             * test whether o is Object
             * @method
             * @param  o
             * @return {Boolean}
             * @member KISSY
             */
            isObject: 0,

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
                return true;
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
                    return FALSE;
                }

                try {
                    // Not own constructor property must be Object
                    if (obj.constructor &&
                        !hasOwnProperty(obj, "constructor") &&
                        !hasOwnProperty(obj.constructor.prototype, "isPrototypeOf")) {
                        return FALSE;
                    }
                } catch (e) {
                    // IE8,9 Will throw exceptions on certain host objects #9897
                    return FALSE;
                }

                // Own properties are enumerated firstly, so to speed up,
                // if last one is own, then all properties are own.

                var key;
                for (key in obj) {
                }

                return key === undefined || hasOwnProperty(obj, key);
            }
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

})(KISSY);/**
 * @ignore
 * implement Promise specification by KISSY
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
    Promise.Defer = Defer;

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
        var up = 0,
            i = parts.length - 1,
            // splice costs a lot in ie
            // use new array instead
            newParts = [],
            last;

        for (; i >= 0; i--) {
            last = parts[i];
            if (last == '.') {
            } else if (last === '..') {
                up++;
            } else if (up) {
                up--;
            } else {
                newParts[newParts.length] = last;
            }
        }

        // if allow above root, has to add ..
        if (allowAboveRoot) {
            for (; up--; up) {
                newParts[newParts.length] = '..';
            }
        }

        newParts = newParts.reverse();

        return newParts;
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
                args = (arguments),
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

            return /**@type String  @ignore*/path;
        },

        /**
         * Get base name of path
         * @param {String} path
         * @param {String} [ext] ext to be stripped from result returned.
         * @return {String}
         */
        basename: function (path, ext) {
            var result = path.match(splitPathRe) || [],
                basename;
            basename = result[3] || '';
            if (ext && basename && basename.slice(-1 * ext.length) == ext) {
                basename = basename.slice(0, -1 * ext.length);
            }
            return basename;
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
    if (Path) {
        S.Path = Path;
    }
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
         * @chainable
         */
        reset: function (query) {
            var self = this;
            self._query = query || '';
            self._queryMap = null;
            return self;
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
         * judge whether has query parameter
         * @param {String} [key]
         */
        has: function (key) {
            var self = this, _queryMap;
            parseQuery(self);
            _queryMap = self._queryMap;
            if (key) {
                return key in _queryMap;
            } else {
                return !S.isEmptyObject(_queryMap);
            }
        },

        /**
         * Return parameter value corresponding to current key
         * @param {String} [key]
         */
        get: function (key) {
            var self = this, _queryMap;
            parseQuery(self);
            _queryMap = self._queryMap;
            if (key) {
                return _queryMap[key];
            } else {
                return _queryMap;
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
         * @chainable
         */
        set: function (key, value) {
            var self = this, _queryMap;
            parseQuery(self);
            _queryMap = self._queryMap;
            if (typeof key == 'string') {
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
         * @chainable
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
         * @chainable
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
            return uriStr['clone']();
        }

        var components, self = this;

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

        components = Uri.getComponents(uriStr);

        S.each(components, function (v, key) {
            v = v || '';
            if (key == 'query') {
                // need encoded content
                self.query = new Query(v);
            } else {
                // https://github.com/kissyteam/kissy/issues/298
                try {
                    v = S.urlDecode(v);
                } catch (e) {
                    S.log(e + 'urlDecode error : ' + v, 'error');
                }
                // need to decode to get data structure in memory
                self[key] = v;
            }
        });

        return self;
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

            if (typeof relativeUri == 'string') {
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
         * @chainable
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
         * @chainable
         */
        setHostname: function (hostname) {
            this.hostname = hostname;
            return this;
        },

        /**
         * Set user info
         * @param {String} userInfo
         * @chainable
         */
        'setUserInfo': function (userInfo) {
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
         * @chainable
         */
        'setPort': function (port) {
            this.port = port;
            return this;
        },

        /**
         * Get port
         * @return {String}
         */
        'getPort': function () {
            return this.port;
        },

        /**
         * Set path
         * @param {string} path
         * @chainable
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
         * @chainable
         */
        'setQuery': function (query) {
            if (typeof query == 'string') {
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
         * @chainable
         */
        'setFragment': function (fragment) {
            var self = this;
            if (S.startsWith(fragment, '#')) {
                fragment = fragment.slice(1);
            }
            self.fragment = fragment;
            return self;
        },

        /**
         * Judge whether two uri has same domain.
         * @param {KISSY.Uri} other
         * @return {Boolean}
         */
        isSameOriginAs: function (other) {
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

            var out = [],
                self = this,
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

            if (query = ( self.query.toString.call(self.query, serializeArray))) {
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

    Uri.getComponents = function (url) {
        url = url || "";
        var m = url.match(URI_SPLIT_REG) || [],
            ret = {};
        S.each(REG_INFO, function (index, key) {
            ret[key] = m[index];
        });
        return ret;
    };

    S.Uri = Uri;

})(KISSY);
/*
 Refer
 - application/x-www-form-urlencoded
 - http://www.ietf.org/rfc/rfc3986.txt
 - http://en.wikipedia.org/wiki/URI_scheme
 - http://unixpapa.com/js/querystring.html
 - http://code.stephenmorley.org/javascript/parsing-query-strings-for-get-data/
 - same origin: http://tools.ietf.org/html/rfc6454
 *//**
 * @ignore
 * ua
 */
(function (S, undefined) {

    var win = S.Env.host,
        doc = win.document,
        navigator = win.navigator,
        ua = navigator && navigator.userAgent || "",
        EMPTY = '',
        os,
        MOBILE = 'mobile',
        core = EMPTY,
        shell = EMPTY, m,
        IE_DETECT_RANGE = [6, 9],
        v,
        end,
        VERSION_PLACEHOLDER = '{{version}}',
        IE_DETECT_TPL = '<!--[if IE ' + VERSION_PLACEHOLDER + ']><' + 's></s><![endif]-->',
        div = doc && doc.createElement('div'),
        s = [];
    /**
     * KISSY UA
     * @member KISSY
     * @class KISSY.UA
     * @singleton
     */
    var UA = KISSY.UA = {
            /**
             * webkit version
             * @type undefined|Number
             * @member KISSY.UA
             */
            webkit: undefined,
            /**
             * trident version
             * @type undefined|Number
             * @member KISSY.UA
             */
            trident: undefined,
            /**
             * gecko version
             * @type undefined|Number
             * @member KISSY.UA
             */
            gecko: undefined,
            /**
             * presto version
             * @type undefined|Number
             * @member KISSY.UA
             */
            presto: undefined,
            /**
             * chrome version
             * @type undefined|Number
             * @member KISSY.UA
             */
            chrome: undefined,
            /**
             * safari version
             * @type undefined|Number
             * @member KISSY.UA
             */
            safari: undefined,
            /**
             * firefox version
             * @type undefined|Number
             * @member KISSY.UA
             */
            firefox: undefined,
            /**
             * ie version
             * @type undefined|Number
             * @member KISSY.UA
             */
            ie: undefined,
            /**
             * opera version
             * @type undefined|Number
             * @member KISSY.UA
             */
            opera: undefined,
            /**
             * mobile browser. apple, android.
             * @type String
             * @member KISSY.UA
             */
            mobile: undefined,
            /**
             * browser render engine name. webkit, trident
             * @type String
             * @member KISSY.UA
             */
            core: undefined,
            /**
             * browser shell name. ie, chrome, firefox
             * @type String
             * @member KISSY.UA
             */
            shell: undefined,

            /**
             * PhantomJS version number
             * @type undefined|Number
             * @member KISSY.UA
             */
            phantomjs: undefined,

            /**
             * operating system. android, ios, linux, windows
             * @type string
             * @member KISSY.UA
             */
            os: undefined,

            /**
             * ipad ios version
             * @type Number
             * @member KISSY.UA
             */
            ipad: undefined,
            /**
             * iphone ios version
             * @type Number
             * @member KISSY.UA
             */
            iphone: undefined,
            /**
             * ipod ios
             * @type Number
             * @member KISSY.UA
             */
            ipod: undefined,
            /**
             * ios version
             * @type Number
             * @member KISSY.UA
             */
            ios: undefined,

            /**
             * android version
             * @type Number
             * @member KISSY.UA
             */
            android: undefined,

            /**
             * nodejs version
             * @type Number
             * @member KISSY.UA
             */
            nodejs: undefined
        },
        numberify = function (s) {
            var c = 0;
            // convert '1.2.3.4' to 1.234
            return parseFloat(s.replace(/\./g, function () {
                return (c++ === 0) ? '.' : '';
            }));
        };

    if (div) {
        // try to use IE-Conditional-Comment detect IE more accurately
        // IE10 doesn't support this method, @ref: http://blogs.msdn.com/b/ie/archive/2011/07/06/html5-parsing-in-ie10.aspx
        div.innerHTML = IE_DETECT_TPL.replace(VERSION_PLACEHOLDER, '');
        s = div.getElementsByTagName('s');
    }

    if (s.length > 0) {

        shell = 'ie';
        UA[core = 'trident'] = 0.1; // Trident detected, look for revision

        // Get the Trident's accurate version
        if ((m = ua.match(/Trident\/([\d.]*)/)) && m[1]) {
            UA[core] = numberify(m[1]);
        }

        // Detect the accurate version
        // 注意：
        //  UA.shell = ie, 表示外壳是 ie
        //  但 UA.ie = 7, 并不代表外壳是 ie7, 还有可能是 ie8 的兼容模式
        //  对于 ie8 的兼容模式，还要通过 documentMode 去判断。但此处不能让 UA.ie = 8, 否则
        //  很多脚本判断会失误。因为 ie8 的兼容模式表现行为和 ie7 相同，而不是和 ie8 相同
        for (v = IE_DETECT_RANGE[0], end = IE_DETECT_RANGE[1]; v <= end; v++) {
            div.innerHTML = IE_DETECT_TPL.replace(VERSION_PLACEHOLDER, v);
            if (s.length > 0) {
                UA[shell] = v;
                break;
            }
        }

    } else {

        // WebKit
        if ((m = ua.match(/AppleWebKit\/([\d.]*)/)) && m[1]) {
            UA[core = 'webkit'] = numberify(m[1]);

            // Chrome
            if ((m = ua.match(/Chrome\/([\d.]*)/)) && m[1]) {
                UA[shell = 'chrome'] = numberify(m[1]);
            }
            // Safari
            else if ((m = ua.match(/\/([\d.]*) Safari/)) && m[1]) {
                UA[shell = 'safari'] = numberify(m[1]);
            }

            // Apple Mobile
            if (/ Mobile\//.test(ua) && ua.match(/iPad|iPod|iPhone/)) {
                UA[MOBILE] = 'apple'; // iPad, iPhone or iPod Touch

                m = ua.match(/OS ([^\s]*)/);
                if (m && m[1]) {
                    UA.ios = numberify(m[1].replace('_', '.'));
                }
                os = 'ios';
                m = ua.match(/iPad|iPod|iPhone/);
                if (m && m[0]) {
                    UA[m[0].toLowerCase()] = UA.ios;
                }
            } else if (/ Android/.test(ua)) {
                if (/Mobile/.test(ua)) {
                    os = UA.mobile = 'android';
                }
                m = ua.match(/Android ([^\s]*);/);
                if (m && m[1]) {
                    UA.android = numberify(m[1]);
                }
            }
            // Other WebKit Mobile Browsers
            else if ((m = ua.match(/NokiaN[^\/]*|Android \d\.\d|webOS\/\d\.\d/))) {
                UA[MOBILE] = m[0].toLowerCase(); // Nokia N-series, Android, webOS, ex: NokiaN95
            }

            if ((m = ua.match(/PhantomJS\/([^\s]*)/)) && m[1]) {
                UA.phantomjs = numberify(m[1]);
            }
        }
        // NOT WebKit
        else {
            // Presto
            // ref: http://www.useragentstring.com/pages/useragentstring.php
            if ((m = ua.match(/Presto\/([\d.]*)/)) && m[1]) {
                UA[core = 'presto'] = numberify(m[1]);

                // Opera
                if ((m = ua.match(/Opera\/([\d.]*)/)) && m[1]) {
                    UA[shell = 'opera'] = numberify(m[1]); // Opera detected, look for revision

                    if ((m = ua.match(/Opera\/.* Version\/([\d.]*)/)) && m[1]) {
                        UA[shell] = numberify(m[1]);
                    }

                    // Opera Mini
                    if ((m = ua.match(/Opera Mini[^;]*/)) && m) {
                        UA[MOBILE] = m[0].toLowerCase(); // ex: Opera Mini/2.0.4509/1316
                    }
                    // Opera Mobile
                    // ex: Opera/9.80 (Windows NT 6.1; Opera Mobi/49; U; en) Presto/2.4.18 Version/10.00
                    // issue: 由于 Opera Mobile 有 Version/ 字段，可能会与 Opera 混淆，同时对于 Opera Mobile 的版本号也比较混乱
                    else if ((m = ua.match(/Opera Mobi[^;]*/)) && m) {
                        UA[MOBILE] = m[0];
                    }
                }

                // NOT WebKit or Presto
            } else {
                // MSIE
                // 由于最开始已经使用了 IE 条件注释判断，因此落到这里的唯一可能性只有 IE10+
                if ((m = ua.match(/MSIE\s([^;]*)/)) && m[1]) {
                    UA[core = 'trident'] = 0.1; // Trident detected, look for revision
                    UA[shell = 'ie'] = numberify(m[1]);

                    // Get the Trident's accurate version
                    if ((m = ua.match(/Trident\/([\d.]*)/)) && m[1]) {
                        UA[core] = numberify(m[1]);
                    }

                    // NOT WebKit, Presto or IE
                } else {
                    // Gecko
                    if ((m = ua.match(/Gecko/))) {
                        UA[core = 'gecko'] = 0.1; // Gecko detected, look for revision
                        if ((m = ua.match(/rv:([\d.]*)/)) && m[1]) {
                            UA[core] = numberify(m[1]);
                        }

                        // Firefox
                        if ((m = ua.match(/Firefox\/([\d.]*)/)) && m[1]) {
                            UA[shell = 'firefox'] = numberify(m[1]);
                        }
                    }
                }
            }
        }
    }

    if (!os) {
        if ((/windows|win32/i).test(ua)) {
            os = 'windows';
        } else if ((/macintosh|mac_powerpc/i).test(ua)) {
            os = 'macintosh';
        } else if ((/linux/i).test(ua)) {
            os = 'linux';
        } else if ((/rhino/i).test(ua)) {
            os = 'rhino';
        }
    }

    // nodejs
    if (typeof process === 'object') {
        var versions, nodeVersion;
        if ((versions = process.versions) && (nodeVersion = versions.node)) {
            os = process.platform;
            UA.nodejs = numberify(nodeVersion);
        }
    }

    UA.os = os;
    UA.core = core;
    UA.shell = shell;
    UA._numberify = numberify;

    var o = [
            // browser core type
            'webkit',
            'trident',
            'gecko',
            'presto',
            // browser type
            'chrome',
            'safari',
            'firefox',
            'ie',
            'opera'
        ],
        documentElement = doc && doc.documentElement,
        className = '';
    if (documentElement) {
        S.each(o, function (key) {
            var v = UA[key];
            if (v) {
                className += ' ks-' + key + (parseInt(v) + '');
                className += ' ks-' + key;
            }
        });
        if (S.trim(className)) {
            documentElement.className = S.trim(documentElement.className + className);
        }
    }
})(KISSY);

/*
 NOTES:
 2012.11.27
 - moved to seed for conditional loading and better code share

 2012.11.21 yiminghe@gmail.com
 - touch and os support

 2011.11.08
 - ie < 10 使用条件注释判断内核，更精确 by gonghaocn@gmail.com

 2010.03
 - jQuery, YUI 等类库都推荐用特性探测替代浏览器嗅探。特性探测的好处是能自动适应未来设备和未知设备，比如
 if(document.addEventListener) 假设 IE9 支持标准事件，则代码不用修改，就自适应了“未来浏览器”。
 对于未知浏览器也是如此。但是，这并不意味着浏览器嗅探就得彻底抛弃。当代码很明确就是针对已知特定浏览器的，
 同时并非是某个特性探测可以解决时，用浏览器嗅探反而能带来代码的简洁，同时也也不会有什么后患。总之，一切
 皆权衡。
 - UA.ie && UA.ie < 8 并不意味着浏览器就不是 IE8, 有可能是 IE8 的兼容模式。进一步的判断需要使用 documentMode.
 */
/**
 * @ignore
 * detect if current browser supports various features.
 * @author yiminghe@gmail.com
 */
(function (S) {

    var Env = S.Env,
        win = Env.host,
        UA = S.UA,
    // nodejs
        doc = win.document || {},
    // phantomjs issue: http://code.google.com/p/phantomjs/issues/detail?id=375
        isTouchSupported = ('ontouchstart' in doc) && !(UA.phantomjs),
        documentMode = doc.documentMode,
        ie = documentMode || UA.ie,
        isNativeJSONSupported = ((Env.nodejs && typeof global === 'object') ? global : win).JSON;

    // ie 8.0.7600.16315@win7 json bug!
    if (documentMode && documentMode < 9) {
        isNativeJSONSupported = 0;
    }

    /**
     * test browser features
     * @class KISSY.Features
     * @private
     * @singleton
     */
    S.Features = {
        // http://blogs.msdn.com/b/ie/archive/2011/09/20/touch-input-for-ie10-and-metro-style-apps.aspx
        /**
         * @ignore
         * whether support win8 pointer event.
         * @type {Boolean}
         */
        // isMsPointerEnabled: "msPointerEnabled" in (win.navigator || {}),
        /**
         * whether support touch event.
         * @method
         * @return {Boolean}
         */
        isTouchSupported: function () {
            return isTouchSupported;
        },

        isDeviceMotionSupported: function () {
            return !!win['DeviceMotionEvent'];
        },

        'isHashChangeSupported': function () {
            // ie8 支持 hashchange
            // 但 ie8 以上切换浏览器模式到 ie7（兼容模式），
            // 会导致 'onhashchange' in window === true，但是不触发事件
            return ( 'onhashchange' in win) && (!ie || ie > 7);
        },

        /**
         * whether support native json
         * @method
         * @return {Boolean}
         */
        isNativeJSONSupported: function () {
            return isNativeJSONSupported;
        }
    };

})(KISSY);/**
 * @ignore
 * setup data structure for kissy loader
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
     * @enum {Number} KISSY.Loader.Status
     */
    Loader.Status = {
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

    S.Loader = Loader;

    S.Loader.Status = Loader.Status;

})(KISSY);
/*
 TODO: implement conditional loader
 *//**
 * @ignore
 * simple event target for loader
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
         */
        fire: function (eventName, obj) {
            var fns = getEventHolder(this, eventName) || [],
                i,
                l = fns.length;
            for (i = 0; i < l; i++) {
                fns[i].call(null, obj);
            }
        }
    };
})(KISSY);/**
 * @ignore
 * Utils for kissy loader
 * @author yiminghe@gmail.com
 */
(function (S) {

    var Loader = S.Loader,
        Path = S.Path,
        host = S.Env.host,
        startsWith = S.startsWith,
        data = Loader.Status,
        ATTACHED = data.ATTACHED,
        LOADED = data.LOADED,
        /**
         * @class KISSY.Loader.Utils
         * Utils for KISSY Loader
         * @singleton
         * @private
         */
            Utils = S.Loader.Utils = {},
        doc = host.document;

    // http://wiki.commonjs.org/wiki/Packages/Mappings/A
    // 如果模块名以 / 结尾，自动加 index
    function indexMap(s) {
        if (typeof s == 'string') {
            return indexMapStr(s);
        } else {
            var ret = [],
                i = 0,
                l = s.length;
            for (; i < l; i++) {
                ret[i] = indexMapStr(s[i]);
            }
            return ret;
        }
    }

    function indexMapStr(s) {
        // 'x/' 'x/y/z/'
        if (s.charAt(s.length - 1) == '/') {
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
         * Get absolute path of dep module.similar to {@link KISSY.Path#resolve}
         * @param moduleName current module 's name
         * @param depName dep module 's name
         * @return {string|Array}
         */
        normalDepModuleName: function (moduleName, depName) {
            var i = 0, l;

            if (!depName) {
                return depName;
            }

            if (typeof depName == 'string') {
                if (startsWith(depName, '../') || startsWith(depName, './')) {
                    // x/y/z -> x/y/
                    return Path.resolve(Path.dirname(moduleName), depName);
                }

                return Path.normalize(depName);
            }

            for (l = depName.length; i < l; i++) {
                depName[i] = Utils.normalDepModuleName(moduleName, depName[i]);
            }
            return depName;
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
            var mods = [runtime], mod,
                unalias,
                allOk,
                m,
                runtimeMods = runtime.Env.mods;

            S.each(modNames, function (modName) {
                mod = runtimeMods[modName];
                if (!mod || mod.getType() != 'css') {
                    unalias = Utils.unalias(runtime, modName);
                    allOk = S.reduce(unalias, function (a, n) {
                        m = runtimeMods[n];
                        return a && m && m.status == ATTACHED;
                    }, true);
                    if (allOk) {
                        mods.push(runtimeMods[unalias[0]].value);
                    } else {
                        mods.push(null);
                    }
                }
            });

            return mods;
        },

        attachModsRecursively: function (modNames, runtime, stack) {
            stack = stack || [];
            var i,
                s = 1,
                l = modNames.length,
                stackDepth = stack.length;
            for (i = 0; i < l; i++) {
                s = Utils.attachModRecursively(modNames[i], runtime, stack) && s;
                stack.length = stackDepth;
            }
            return s;
        },

        attachModRecursively: function (modName, runtime, stack) {
            var mods = runtime.Env.mods,
                status,
                m = mods[modName];
            if (!m) {
                return 0;
            }
            status = m.status;
            if (status == ATTACHED) {
                return 1;
            }
            if (status != LOADED) {
                return 0;
            }
            if (S.Config.debug) {
                if (S.inArray(modName, stack)) {
                    stack.push(modName);
                    S.error('find cyclic dependency between mods: ' + stack);
                    return 0;
                }
                stack.push(modName);
            }
            if (Utils.attachModsRecursively(m.getNormalizedRequires(), runtime, stack)) {
                Utils.attachMod(runtime, m);
                return 1;
            }
            return 0;
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

            var fn = mod.fn;

            if (fn) {
                // 需要解开 index，相对路径
                // 但是需要保留 alias，防止值不对应
                mod.value = fn.apply(mod, Utils.getModules(runtime, mod.getRequiresWithAlias()));
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
            if (typeof modNames == 'string') {
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
         *  or module names string separated by comma
         * @param {String} [refModName]
         * @return {String[]}
         */
        normalizeModNames: function (runtime, modNames, refModName) {
            return Utils.unalias(runtime,
                Utils.normalizeModNamesWithAlias(runtime, modNames, refModName));
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
                j,
                mods = runtime['Env'].mods;
            while (!ok) {
                ok = 1;
                for (i = ret.length - 1; i >= 0; i--) {
                    if ((m = mods[ret[i]]) && (alias = m.alias)) {
                        ok = 0;
                        for (j = alias.length - 1; j >= 0; j--) {
                            if (!alias[j]) {
                                alias.splice(j, 1);
                            }
                        }
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
            // 2. relative to absolute (optional)
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
            S.mix(mod, {
                name: name,
                status: LOADED,
                fn: fn
            });

            S.mix(mod, config);
            // S.log(name + ' is loaded', 'info');
        },

        /**
         * Get mapped path.
         * @param runtime
         * @param path
         * @param [rules]
         * @return {String}
         */
        getMappedPath: function (runtime, path, rules) {
            var mappedRules = rules ||
                    runtime.Config.mappedRules ||
                    [],
                i,
                m,
                rule;
            for (i = 0; i < mappedRules.length; i++) {
                rule = mappedRules[i];
                if (m = path.match(rule[0])) {
                    return path.replace(rule[0], rule[1]);
                }
            }
            return path;
        }
    });

    function isStatus(runtime, modNames, status) {
        var mods = runtime.Env.mods,
            mod,
            i;
        modNames = S.makeArray(modNames);
        for (i = 0; i < modNames.length; i++) {
            mod = mods[modNames[i]];
            if (!mod || mod.status !== status) {
                return 0;
            }
        }
        return 1;
    }
})(KISSY);/**
 * @ignore
 * setup data structure for kissy loader
 * @author yiminghe@gmail.com
 */
(function (S) {

    var Path = S.Path,
        Loader = S.Loader,
        IGNORE_PACKAGE_NAME_IN_URI = 'ignorePackageNameInUri',
        Utils = Loader.Utils;

    function forwardSystemPackage(self, property) {
        return property in self ?
            self[property] :
            self.runtime.Config[property];
    }

    /**
     * @class KISSY.Loader.Package
     * @private
     * This class should not be instantiated manually.
     */
    function Package(cfg) {
        S.mix(this, cfg);
    }

    S.augment(Package, {
        /**
         * Tag for package.
         * @return {String}
         */
        getTag: function () {
            return forwardSystemPackage(this, 'tag');
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
        'getBase': function () {
            return forwardSystemPackage(this, 'base');
        },

        getPrefixUriForCombo: function () {
            var self = this,
                packageName = self.getName();
            return self.getBase() + (
                packageName && !self.isIgnorePackageNameInUri() ?
                    (packageName + '/') :
                    ''
                );
        },

        /**
         * Get package baseUri
         * @return {KISSY.Uri}
         */
        getBaseUri: function () {
            return forwardSystemPackage(this, 'baseUri');
        },

        /**
         * Whether is debug for this package.
         * @return {Boolean}
         */
        isDebug: function () {
            return forwardSystemPackage(this, 'debug');
        },

        /**
         *  whether request mod file without package name
         *  @return {Boolean}
         */
        isIgnorePackageNameInUri: function () {
            return forwardSystemPackage(this, IGNORE_PACKAGE_NAME_IN_URI);
        },

        /**
         * Get charset for package.
         * @return {String}
         */
        getCharset: function () {
            return forwardSystemPackage(this, 'charset');
        },

        /**
         * Whether modules are combined for this package.
         * @return {Boolean}
         */
        isCombine: function () {
            return forwardSystemPackage(this, 'combine');
        }
    });

    Loader.Package = Package;

    /**
     * @class KISSY.Loader.Module
     * @private
     * This class should not be instantiated manually.
     */
    function Module(cfg) {
        this.status = Loader.Status.INIT;
        S.mix(this, cfg);
    }

    S.augment(Module, {
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
            var self = this,
                v = self.type;
            if (!v) {
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
            var self = this,
                t,
                fullpathUri,
                packageBaseUri,
                packageInfo,
                packageName,
                path;
            if (!self.fullpath) {
                packageInfo = self.getPackage();
                packageBaseUri = packageInfo.getBaseUri();
                path = self.getPath();
                // #262
                if (packageInfo.isIgnorePackageNameInUri() &&
                    // native mod does not allow ignore package name
                    (packageName = packageInfo.getName())) {
                    path = Path.relative(packageName, path);
                }
                fullpathUri = packageBaseUri.resolve(path);
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
        'getRequiredMods': function () {
            var self = this, mods = self.runtime.Env.mods;
            return S.map(self.getNormalizedRequires(), function (r) {
                return mods[r];
            });
        },

        getRequiresWithAlias: function () {
            var self = this,
                requiresWithAlias = self.requiresWithAlias,
                requires = self.requires;
            if (!requires || requires.length == 0) {
                return requires || [];
            } else if (!requiresWithAlias) {
                self.requiresWithAlias = requiresWithAlias =
                    Utils.normalizeModNamesWithAlias(self.runtime, requires, self.name);
            }
            return requiresWithAlias;
        },


        getNormalizedRequires: function () {
            var self = this,
                normalizedRequires,
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
            extname = '.' + m.getType(),
            min = '-min';

        name = Path.join(Path.dirname(name), Path.basename(name, extname));

        if (m.getPackage().isDebug()) {
            min = '';
        }

        return name + min + extname;
    }

    function getPackage(self, mod) {
        var modName = mod.name,
            packages = self.config('packages'),
            pName = '',
            p;

        for (p in packages) {

            // longest match
            if (S.startsWith(modName, p) &&
                p.length > pName.length) {
                pName = p;
            }

        }

        return packages[pName] || self.config('systemPackage');
    }


})(KISSY);
/*
 TODO: implement conditional loader
 *//**
 * @ignore
 * script/css load across browser
 * @author yiminghe@gmail.com
 */
(function (S) {

    var CSS_POLL_INTERVAL = 30,
        UA= S.UA,
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

        for (var url in monitors) {

            var callbackObj = monitors[url],
                node = callbackObj.node,
                exName,
                loaded = 0;
            if (UA.webkit) {
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
 * getScript support for css and js callback after load
 * @author yiminghe@gmail.com, lifesinger@gmail.com
 */
(function (S) {

    var MILLISECONDS_OF_SECOND = 1000,
        doc = S.Env.host.document,
        utils = S.Loader.Utils,
        Path = S.Path,
        jsCssCallbacks = {},
        UA = S.UA,
    // onload for webkit 535.23  Firefox 9.0
    // https://bugs.webkit.org/show_activity.cgi?id=38995
    // https://bugzilla.mozilla.org/show_bug.cgi?id=185236
    // https://developer.mozilla.org/en/HTML/Element/link#Stylesheet_load_events
    // phantomjs 1.7 == webkit 534.34
        isOldWebKit = UA.webkit < 536;

    S.mix(S, {
        /**
         * Load a javascript/css file from the server using a GET HTTP request,
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
         * Note 404/500 status in ie<9 will trigger success callback.
         * If you want a jsonp operation, please use {@link KISSY.IO} instead.
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
            // can not use KISSY.Uri, url can not be encoded for some url
            // eg: /??dom.js,event.js , ? , should not be encoded
            var config = success,
                css = 0,
                error,
                timeout,
                attrs,
                callbacks,
                timer;

            if (S.startsWith(Path.extname(url).toLowerCase(), '.css')) {
                css = 1;
            }

            if (S.isPlainObject(config)) {
                success = config['success'];
                error = config['error'];
                timeout = config['timeout'];
                charset = config['charset'];
                attrs = config['attrs'];
            }

            callbacks = jsCssCallbacks[url] = jsCssCallbacks[url] || [];

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

            if (attrs) {
                S.each(attrs, function (v, n) {
                    node.setAttribute(n, v);
                });
            }

            if (css) {
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
                    var index = error,
                        fn;
                    clearTimer();
                    S.each(jsCssCallbacks[url], function (callback) {
                        if (fn = callback[index]) {
                            fn.call(node);
                        }
                    });
                    delete jsCssCallbacks[url];
                },
                useNative = !css;

            if (css) {
                if (isOldWebKit) {
                    useNative = false;
                } else {
                    useNative = 'onload' in node;
                }
            }

            //标准浏览器 css and all script
            if (useNative) {
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
                    end(1);
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
            if (css) {
                // css order matters
                // so can not use css in head
                head.appendChild(node);
            } else {
                // can use js in head
                head.insertBefore(node, head.firstChild);
            }
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
 * Declare config info for KISSY.
 * @author yiminghe@gmail.com
 */
(function (S, undefined) {

    var Loader = S.Loader,
        utils = Loader.Utils,
        host = S.Env.host,
        location = host.location,
        simulatedLocation,
        locationHref,
        configFns = S.Config.fns;

    if (!S.Env.nodejs && location && (locationHref = location.href)) {
        simulatedLocation = new S.Uri(locationHref)
    }

    /*
     modify current module path

     [
     [/(.+-)min(.js(\?t=\d+)?)$/, '$1$2'],
     [/(.+-)min(.js(\?t=\d+)?)$/, function(_,m1,m2){
     return m1+m2;
     }]
     ]

     */
    configFns.map = function (rules) {
        var Config = this.Config;
        if (rules === false) {
            return Config.mappedRules = [];
        }
        return Config.mappedRules = (Config.mappedRules || []).concat(rules || []);
    };

    configFns.mapCombo = function (rules) {
        var Config = this.Config;
        if (rules === false) {
            return Config.mappedComboRules = [];
        }
        return Config.mappedComboRules = (Config.mappedComboRules || []).concat(rules || []);
    };

    /*
     包声明
     biz -> .
     表示遇到 biz/x
     在当前网页路径找 biz/x.js
     @private
     */
    configFns.packages = function (cfgs) {
        var name,
            Config = this.Config,
            ps = Config.packages = Config.packages || {};
        if (cfgs) {
            S.each(cfgs, function (cfg, key) {
                // 兼容数组方式
                name = cfg.name || key;

                // 兼容 path
                var baseUri = normalizeBase(cfg.base || cfg.path);

                cfg.name = name;
                cfg.base = baseUri.toString();
                cfg.baseUri = baseUri;
                cfg.runtime = S;
                delete cfg.path;
                ps[name] = new Loader.Package(cfg);
            });
            return undefined;
        } else if (cfgs === false) {
            Config.packages = {
            };
            return undefined;
        } else {
            return ps;
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
    configFns.modules = function (modules) {
        var self = this,
            Env = self.Env;
        if (modules) {
            S.each(modules, function (modCfg, modName) {
                utils.createModuleInfo(self, modName, modCfg);
                S.mix(Env.mods[modName], modCfg);
            });
        }
    };

    /*
     KISSY 's base path.
     */
    configFns.base = function (base) {
        var self = this,
            Config = self.Config,
            baseUri;
        if (!base) {
            return Config.base;
        }
        baseUri = normalizeBase(base);
        Config.base = baseUri.toString();
        Config.baseUri = baseUri;
        return undefined;
    };


    function normalizeBase(base) {
        var baseUri;
        if (base.charAt(base.length - 1) != '/') {
            base += '/';
        }
        if (simulatedLocation) {
            baseUri = simulatedLocation.resolve(base);
        } else {
            // add scheme for S.Uri
            // currently only for nodejs
            if (!S.startsWith(base, 'file:')) {
                base = 'file:' + base;
            }
            baseUri = new S.Uri(base);
        }
        return baseUri;
    }

})(KISSY);/**
 * @ignore
 * add module to kissy simple loader
 * @author yiminghe@gmail.com, lifesinger@gmail.com
 */
(function (S) {

    var Loader = S.Loader,
        UA = S.UA,
        utils = Loader.Utils;

    S.augment(Loader, Loader.Target, {

        // standard browser 如果 add 没有模块名，模块定义先暂存这里
        __currentMod: null,

        // ie 开始载入脚本的时间
        __startLoadTime: 0,

        // ie6,7,8开始载入脚本对应的模块名
        __startLoadModName: null,

        /**
         * Registers a module.
         * @param {String|Object} [name] module name
         * @param {Function|Object} [fn] entry point into the module that is used to bind module to KISSY
         * @param {Object} [config] special config for this add
         * @param {String[]} [config.requires] array of mod 's name that current module requires
         * @member KISSY.Loader
         *
         * for example:
         *      @example
         *      KISSY.add('package-name/module-name', function(S){ }, {requires: ['mod1']});
         */
        add: function (name, fn, config) {
            var self = this,
                runtime = self.runtime;

            // S.add(name[, fn[, config]])
            if (typeof name == 'string') {
                utils.registerModule(runtime, name, fn, config);
                return;
            }
            // S.add(fn,config);
            else if (S.isFunction(name)) {
                config = fn;
                fn = name;
                if (UA.ie) {
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
                    S.log('ie get modName by interactive: ' + name);
                    utils.registerModule(runtime, name, fn, config);
                    self.__startLoadModName = null;
                    self.__startLoadTime = 0;
                } else {
                    // 其他浏览器 onload 时，关联模块名与模块定义
                    self.__currentMod = {
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
        var scripts = S.Env.host.document.getElementsByTagName('script'),
            re,
            i,
            name,
            script;

        for (i = scripts.length - 1; i >= 0; i--) {
            script = scripts[i];
            if (script.readyState == 'interactive') {
                re = script;
                break;
            }
        }
        if (re) {
            name = re.getAttribute('data-mod-name');
        } else {
            // sometimes when read module file from cache,
            // interactive status is not triggered
            // module code is executed right after inserting into dom
            // i has to preserve module name before insert module script into dom,
            // then get it back here
            // S.log('can not find interactive script,time diff : ' + (+new Date() - self.__startLoadTime), 'error');
            // S.log('old_ie get mod name from cache : ' + self.__startLoadModName);
            name = self.__startLoadModName;
        }
        return name;
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
 * use and attach mod for kissy simple loader
 * @author yiminghe@gmail.com, lifesinger@gmail.com
 */
(function (S, undefined) {

    var Loader, data, utils, UA,
        remoteLoads = {},
        LOADING, LOADED, ERROR, ATTACHED;

    Loader = S.Loader;
    data = Loader.Status;
    utils = Loader.Utils;
    UA = S.UA;
    LOADING = data.LOADING;
    LOADED = data.LOADED;
    ERROR = data.ERROR;
    ATTACHED = data.ATTACHED;

    function LoadChecker(fn) {
        S.mix(this, {
            fn: fn,
            waitMods: {},
            requireLoadedMods: {}
        });
    }

    LoadChecker.prototype = {

        check: function () {
            var self = this,
                fn = self.fn;
            if (fn && S.isEmptyObject(self.waitMods)) {
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
            var self = this,
                requireLoadedMods = self.requireLoadedMods,
                modName = mod.name,
                requires;
            if (!requireLoadedMods[modName]) {
                requireLoadedMods[modName] = 1;
                requires = mod.getNormalizedRequires();
                loadModules(loader, requires, self);
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
         * @param _forceSync internal use, do not set
         * @chainable
         */
        use: function (modNames, callback, /* for internal */_forceSync) {
            var self = this,
                normalizedModNames,
                loadChecker = new LoadChecker(loadReady),
                runtime = self.runtime;

            modNames = utils.getModNamesAsArray(modNames);
            modNames = utils.normalizeModNamesWithAlias(runtime, modNames);

            normalizedModNames = utils.unalias(runtime, modNames);

            function loadReady() {
                utils.attachModsRecursively(normalizedModNames, runtime);
                callback && callback.apply(runtime, utils.getModules(runtime, modNames));
            }

            loadModules(self, normalizedModNames, loadChecker);

            // in case modules is loaded statically
            // synchronous check
            // but always async for loader
            if (_forceSync) {
                loadChecker.check();
            } else {
                setTimeout(function () {
                    loadChecker.check();
                }, 0);
            }
            return self;
        }
    });

    function loadModules(self, modNames, loadChecker) {
        var i,
            l = modNames.length;
        for (i = 0; i < l; i++) {
            loadModule(self, modNames[i], loadChecker);
        }
    }

    function loadModule(self, modName, loadChecker) {
        var runtime = self.runtime,
            status,
            isWait,
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

        // 已经静态存在在页面上
        // 或者该模块不是根据自身模块名动态加载来的(ajax.js包含 ajax/base,ajax/form)
        if (status === LOADED) {
            loadChecker.loadModRequires(self, mod);
        } else {
            isWait = loadChecker.isModWait(modName);
            // prevent duplicate listen for this use
            //  use('a,a') or
            //  user('a,c') a require b, c require b
            // listen b only once
            // already waiting, will notify loadReady in the future
            if (isWait) {
                return;
            }
            // error or init or loading
            loadChecker.addWaitMod(modName);
            // in case parallel use (more than one use)
            if (status <= LOADING) {
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
            currentModule = 0,
            ie = UA.ie,
            isCss = mod.getType() == 'css';

        mod.status = LOADING;

        if (ie && !isCss) {
            self.__startLoadModName = modName;
            self.__startLoadTime = Number(+new Date());
        }

        S.getScript(url, {
            attrs: ie ? {
                'data-mod-name': modName
            } : undefined,
            // syntaxError in all browser will trigger this
            // same as #111 : https://github.com/kissyteam/kissy/issues/111
            success: function () {
                // parallel use
                // 只设置第一个 use 处
                if (mod.status == LOADING) {
                    if (isCss) {
                        // css does not set LOADED because no add for css! must be set manually
                        utils.registerModule(runtime, modName, S.noop);
                    } else {
                        // does not need this step for css
                        // standard browser(except ie9) fire load after KISSY.add immediately
                        if (currentModule = self.__currentMod) {
                            // S.log('standard browser get mod name after load : ' + modName);
                            utils.registerModule(runtime,
                                modName, currentModule.fn,
                                currentModule.config);
                            self.__currentMod = null;
                        }
                    }
                }

                // nodejs is synchronous,
                // use('x,y')
                // need x,y filled into waitingMods first
                // x,y waiting -> x -> load -> y -> load -> check

                S.later(checkHandler);
            },
            error: checkHandler,
            // source:mod.name + '-init',
            charset: charset
        });

        function checkHandler() {
            if (mod.fn) {
                if (!remoteLoads[modName]) {
                    S.log('load remote module: "' + modName + '" from: "' + url + '"', 'info');
                    remoteLoads[modName] = 1;
                }
                // 只在 LOADED 后加载依赖项一次
                // 防止 config('modules') requires 和模块中 requires 不一致
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
 *//**
 * @ignore
 * using combo to load module files
 * @author yiminghe@gmail.com
 */
(function (S, undefined) {

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
            }, charset);
        });
    }

    var Loader = S.Loader,
        data = Loader.Status,
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
        if (self.queue.length) {
            var modItem = self.queue.shift();
            _use(self, modItem);
        }
    }

    // Enqueue use
    function enqueue(self, modItem) {
        self.queue.push(modItem);
    }

    // Real use.
    function _use(self, modItem) {
        var modNames = modItem.modNames,
            unaliasModNames = modItem.unaliasModNames,
            fn = modItem.fn,
            allModNames,
            comboUrls,
            css,
            jss,
            jsOk,
            cssOk,
            countCss,
            p,
            runtime = self.runtime;

        self.loading = 1;

        allModNames = self['calculate'](unaliasModNames);

        utils.createModulesInfo(runtime, allModNames);

        comboUrls = self['getComboUrls'](allModNames);

        // load css first to avoid page blink
        css = comboUrls.css;
        countCss = 0;

        for (p in css) {
            countCss++;
        }

        jsOk = 0;
        cssOk = !countCss;

        for (p in css) {

            loadScripts(css[p], function () {
                if (!(--countCss)) {
                    // mark all css mods to be loaded
                    for (p in css) {
                        S.each(css[p].mods, function (m) {
                            utils.registerModule(runtime, m.name, S.noop);
                        });
                    }
                    debugRemoteModules(css);
                    cssOk = 1;
                    check();
                }
            }, css[p].charset);

        }

        function check() {
            if (cssOk && jsOk) {
                if (utils['attachModsRecursively'](unaliasModNames, runtime)) {
                    fn.apply(null, utils.getModules(runtime, modNames))
                } else {
                    // new require is introduced by KISSY.add
                    // run again
                    _use(self, modItem)
                }
            }
        }

        jss = comboUrls.js;

        // jss css download in parallel
        _useJs(jss, function (ok) {
            jsOk = ok;
            if (ok) {
                debugRemoteModules(jss);
            }
            check();
        });
    }


    function debugRemoteModules(rss) {
        if (S.Config.debug) {
            var ms = [],
                p,
                ps = [];
            for (p in rss) {
                ps.push.apply(ps, rss[p]);
                S.each(rss[p].mods, function (m) {
                    ms.push(m.name);
                });
            }
            if (ms.length) {
                S.log('load remote modules: "' + ms.join(', ') + '" from: "' + ps.join(', ') + '"');
            }
        }
    }

    // use js
    function _useJs(jss, check) {
        var p,
            success,
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
                    S.each(jss[p].mods, function (mod) {
                        // fix #111
                        // https://github.com/kissyteam/kissy/issues/111
                        if (!mod.fn) {
                            S.log(mod.name + ' is not loaded! can not find module in path : ' + jss[p], 'error');
                            mod.status = data.ERROR;
                            success = 0;
                            return false;
                        }
                        return undefined;
                    });
                    if (success && !(--countJss)) {
                        check(1);
                    }
                }, jss[p].charset);
            })(p);

        }
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
            r,
            ret2,
            mod = getModInfo(self, modName),
        // 做个缓存，该模块的待加载子模块都知道咯，不用再次递归查找啦！
        // also prevent circular require
            ret = cache[modName];

        if (ret) {
            return ret;
        }

        cache[modName] = ret = {};

        // if this mod is attached then its require is attached too!
        if (mod && !utils.isAttached(runtime, modName)) {
            requires = mod.getNormalizedRequires();
            for (i = 0; i < requires.length; i++) {
                r = requires[i];
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

        clear: function () {
            this.loading = 0;
        },

        /**
         * use, _forceSync for kissy.js, initialize dom,event sync
         */
        use: function (modNames, callback, /* for internal */_forceSync) {
            var self = this;

            var runtime = self.runtime;

            modNames = utils.getModNamesAsArray(modNames);

            modNames = utils.normalizeModNamesWithAlias(runtime, modNames);

            var unaliasModNames = utils.unalias(runtime, modNames);

            // if all mods are attached, just run
            // do not queue
            if (utils.isAttached(runtime, unaliasModNames)) {
                if (callback) {
                    if (_forceSync) {
                        callback.apply(null, utils.getModules(runtime, modNames));
                    } else {
                        setTimeout(function () {
                            callback.apply(null, utils.getModules(runtime, modNames));
                        }, 0);
                    }
                }
                return;
            }

            var fn = function () {
                // one callback failure does not interfere with others
                setTimeout(function () {
                    self.loading = 0;
                    next(self);
                }, 0);
                // KISSY.use in callback will be queued
                if (callback) {
                    // try {
                    callback.apply(this, arguments);
//                    } catch (e) {
//                        S.log(e.stack || e, 'error');
//                    }
                }
            };

            enqueue(self, {
                modNames: modNames,
                unaliasModNames: unaliasModNames,
                fn: fn
            });

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
            utils.registerModule(runtime, name, fn, config);
        },

        /**
         * calculate dependency
         * @param modNames
         * @private
         * @return {Array}
         */
        'calculate': function (modNames) {
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
        'getComboUrls': function (modNames) {
            var self = this,
                i,
                runtime = self.runtime,
                Config = runtime.Config,
                combos = {};

            S.each(modNames, function (modName) {
                var mod = getModInfo(self, modName),
                    packageInfo = mod.getPackage(),
                    type = mod.getType(),
                    mods,
                    packageName = packageInfo.getName();
                combos[packageName] = combos[packageName] || {};
                if (!(mods = combos[packageName][type])) {
                    mods = combos[packageName][type] = combos[packageName][type] || [];
                    mods.packageInfo = packageInfo;
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
                        packageInfo = jss.packageInfo,
                        tag = packageInfo.getTag(),
                        suffix = (tag ? ('?t=' + encodeURIComponent(tag)) : ''),
                        suffixLength = suffix.length,
                        prefix,
                        path,
                        fullpath,
                        l,
                        packagePath = packageInfo.getPrefixUriForCombo();

                    res[type][packageName] = [];
                    res[type][packageName].charset = packageInfo.getCharset();
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
                            Config.mappedComboRules
                        ));
                    }

                    for (i = 0; i < jss.length; i++) {

                        // map individual module
                        fullpath = jss[i].getFullPath();

                        res[type][packageName].mods.push(jss[i]);

                        if (!packageInfo.isCombine() || !S.startsWith(fullpath, packagePath)) {
                            res[type][packageName].push(fullpath);
                            continue;
                        }

                        // ignore query parameter
                        path = fullpath.slice(packagePath.length).replace(/\?.*$/, '');

                        t.push(path);

                        if ((t.length > maxFileNum) ||
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
 * mix loader into S and infer KISSy baseUrl if not set
 * @author yiminghe@gmail.com, lifesinger@gmail.com
 */
(function (S, undefined) {

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
             *      KISSY.add('dom', function(S, xx){
             *          return {css: function(el, name, val){}};
             *      },{
             *          requires:['xx']
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
                var loader = this.getLoader();
                loader.use.apply(loader, arguments);
            },
            /**
             * get KISSY 's loader instance
             * @member KISSY
             * @return {KISSY.Loader}
             */
            getLoader: function () {
                var self = this,
                    Config = self.Config,
                    Env = self.Env;
                if (Config.combine && !Env.nodejs) {
                    return Env._comboLoader;
                } else {
                    return Env._loader;
                }
            },
            /**
             * get module value defined by define function
             * @param {string} moduleName
             * @member KISSY
             */
            require: function (moduleName) {
                return utils.getModules(this, [moduleName])[1];
            }
        });

    var Loader = S.Loader,
        Env = S.Env,
        utils = Loader.Utils,
        ComboLoader = S.Loader.Combo;

    function returnJson(s) {
        return (new Function('return ' + s))();
    }

    /**
     * get base from seed.js
     * @return {Object} base for kissy
     * @ignore
     *
     * for example:
     *      @example
     *      http://a.tbcdn.cn/??s/kissy/x.y.z/seed-min.js,p/global/global.js
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
            scripts = Env.host.document.getElementsByTagName('script'),
            script = scripts[scripts.length - 1],
        // can not use KISSY.Uri
        // /??x.js,dom.js for tbcdn
            src = script.src,
            baseInfo = script.getAttribute('data-config');

        if (baseInfo) {
            baseInfo = returnJson(baseInfo);
        } else {
            baseInfo = {};
        }

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
            // a.tbcdn.cn??y.js, ie does not insert / after host
            // a.tbcdn.cn/combo? comboPrefix=/combo?
            if (base.charAt(base.length - 1) != '/') {
                base += '/';
            }
            parts = src.substring(index + comboPrefix.length).split(comboSep);
            S.each(parts, function (part) {
                if (part.match(baseTestReg)) {
                    base += part.replace(baseReg, '$1');
                    return false;
                }
                return undefined;
            });
        }
        return S.mix({
            base: base
        }, baseInfo);
    }

    if (S.Env.nodejs) {
        // nodejs: no tag
        S.config({
            charset: 'utf-8',
            base: __dirname.replace(/\\/g, '/').replace(/\/$/, '') + '/'
        });
    } else {
        // will transform base to absolute path
        S.config(S.mix({
            // 2k(2048) url length
            comboMaxUrlLength: 2000,
            // file limit number for a single combo url
            comboMaxFileNum: 40,
            charset: 'utf-8',
            tag: '20130217192945'
        }, getBaseInfo()));
    }

    S.config('systemPackage', new Loader.Package({
        name: '',
        runtime: S
    }));

    // Initializes loader.
    Env.mods = {}; // all added mods
    Env._loader = new Loader(S);

    if (ComboLoader) {
        Env._comboLoader = new ComboLoader(S);
    }

})(KISSY);/**
 * @ignore
 * web.js
 * @author lifesinger@gmail.com, yiminghe@gmail.com
 * this code can only run at browser environment
 */
(function (S, undefined) {

    var win = S.Env.host,

        UA = S.UA,

        doc = win['document'],

        docElem = doc && doc.documentElement,

        location = win.location,

        EMPTY = '',

        readyDefer = new S.Defer(),

        readyPromise = readyDefer.promise,

    // The number of poll times.
        POLL_RETIRES = 500,

    // The poll interval in milliseconds.
        POLL_INTERVAL = 40,

    // #id or id
        RE_ID_STR = /^#?([\w-]+)$/,

        RE_NOT_WHITESPACE = /\S/,

        standardEventModel = !!(doc && doc.addEventListener),
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
                    xml.async = false;
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
         * Evaluates a script in a global context.
         * @member KISSY
         */
        globalEval: function (data) {
            if (data && RE_NOT_WHITESPACE.test(data)) {
                // http://weblogs.java.net/blog/driscoll/archive/2009/09/08/eval-javascript-global-context
                // http://msdn.microsoft.com/en-us/library/ie/ms536420(v=vs.85).aspx always return null
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
         * @chainable
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
            id = (id + EMPTY).match(RE_ID_STR)[1];
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

    function fireReady() {
        // nodejs
        if (doc) {
            removeEventListener(win, LOAD_EVENT, fireReady);
        }
        readyDefer.resolve(S);
    }

    /**
     * Binds ready events.
     * @ignore
     */
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
        }
        // IE event model is used
        else {

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
                notframe = (win['frameElement'] === null);
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
                        //S.log('detect document ready : ' + ex);
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
    bindReady();

    if (UA.ie) {
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
                alias: ['dom', 'event', 'ajax', 'anim', 'base', 'node', 'json','ua']
            }
        }
    });
})(KISSY);

(function(config,Features,UA){
/*Generated by KISSY Module Compiler*/
config({
'ajax': {requires: ['dom','json','event']}
});
/*Generated by KISSY Module Compiler*/
config({
'anim': {requires: ['dom','event']}
});
/*Generated by KISSY Module Compiler*/
config({
'base': {requires: ['event/custom']}
});
/*Generated by KISSY Module Compiler*/
config({
'button': {requires: ['component/base','event']}
});
/*Generated by KISSY Module Compiler*/
config({
'calendar': {requires: ['node','event']}
});
/*Generated by KISSY Module Compiler*/
config({
'color': {requires: ['base']}
});
/*Generated by KISSY Module Compiler*/
config({
'combobox': {requires: ['dom','component/base','node','menu','ajax']}
});
/*Generated by KISSY Module Compiler*/
config({
'component/base': {requires: ['rich-base','node','event']}
});
/*Generated by KISSY Module Compiler*/
config({
'component/extension': {requires: ['dom','node']}
});
/*Generated by KISSY Module Compiler*/
config({
'component/plugin/drag': {requires: ['rich-base','dd/base']}
});
/*Generated by KISSY Module Compiler*/
config({
'component/plugin/resize': {requires: ['resizable']}
});
/*Generated by KISSY Module Compiler*/
config({
'datalazyload': {requires: ['dom','event','base']}
});
config({
    'dd': {alias: ['dd/base', 'dd/droppable']}
});
/*Generated by KISSY Module Compiler*/
config({
'dd/base': {requires: ['dom','node','event','rich-base','base']}
});
/*Generated by KISSY Module Compiler*/
config({
'dd/droppable': {requires: ['dd/base','dom','node','rich-base']}
});
/*Generated by KISSY Module Compiler*/
config({
'dd/plugin/constrain': {requires: ['base','node']}
});
/*Generated by KISSY Module Compiler*/
config({
'dd/plugin/proxy': {requires: ['node','base','dd/base']}
});
/*Generated by KISSY Module Compiler*/
config({
'dd/plugin/scroll': {requires: ['dd/base','base','node','dom']}
});
config({
    "dom": {
        "alias": ['dom/base', UA.ie < 9 ? 'dom/ie' : '']
    }
});/*Generated by KISSY Module Compiler*/
config({
'dom/ie': {requires: ['dom/base']}
});
/*Generated by KISSY Module Compiler*/
config({
'editor': {requires: ['htmlparser','component/base','core']}
});
config({
    "event": {
        "alias": ["event/base", "event/dom", "event/custom"]
    }
});/*Generated by KISSY Module Compiler*/
config({
'event/custom': {requires: ['event/base']}
});
config({
    "event/dom": {
        "alias": [
            "event/dom/base",
            Features.isTouchSupported() ? 'event/dom/touch' : '',
            Features.isDeviceMotionSupported() ? 'event/dom/shake' : '',
            Features.isHashChangeSupported() ? '' : 'event/dom/hashchange',
            UA.ie < 9 ? 'event/dom/ie' : '',
            UA.ie ? '' : 'event/dom/focusin'
        ]
    }
});/*Generated by KISSY Module Compiler*/
config({
'event/dom/base': {requires: ['dom','event/base']}
});
/*Generated by KISSY Module Compiler*/
config({
'event/dom/focusin': {requires: ['event/dom/base']}
});
/*Generated by KISSY Module Compiler*/
config({
'event/dom/hashchange': {requires: ['event/dom/base','dom']}
});
/*Generated by KISSY Module Compiler*/
config({
'event/dom/ie': {requires: ['event/dom/base','dom']}
});
/*Generated by KISSY Module Compiler*/
config({
'event/dom/shake': {requires: ['event/dom/base']}
});
/*Generated by KISSY Module Compiler*/
config({
'event/dom/touch': {requires: ['event/dom/base','dom']}
});
/*Generated by KISSY Module Compiler*/
config({
'imagezoom': {requires: ['node','overlay']}
});
/*Generated by KISSY Module Compiler*/
config({
'json': {requires: [KISSY.Features.isNativeJSONSupported() ? "" : "json/json2"]}
});
/*Generated by KISSY Module Compiler*/
config({
'kison': {requires: ['base']}
});
/*Generated by KISSY Module Compiler*/
config({
'menu': {requires: ['component/extension','node','component/base','event']}
});
/*Generated by KISSY Module Compiler*/
config({
'menubutton': {requires: ['node','menu','button','component/base']}
});
/*Generated by KISSY Module Compiler*/
config({
'mvc': {requires: ['event','base','ajax','json','node']}
});
/*Generated by KISSY Module Compiler*/
config({
'node': {requires: ['dom','event/dom','anim']}
});
/*Generated by KISSY Module Compiler*/
config({
'overlay': {requires: ['node','component/base','component/extension','event']}
});
/*Generated by KISSY Module Compiler*/
config({
'resizable': {requires: ['node','rich-base','dd/base']}
});
/*Generated by KISSY Module Compiler*/
config({
'rich-base': {requires: ['base']}
});
/*Generated by KISSY Module Compiler*/
config({
'separator': {requires: ['component/base']}
});
/*Generated by KISSY Module Compiler*/
config({
'split-button': {requires: ['component/base','button','menubutton']}
});
/*Generated by KISSY Module Compiler*/
config({
'stylesheet': {requires: ['dom']}
});
/*Generated by KISSY Module Compiler*/
config({
'swf': {requires: ['dom','json','base']}
});
/*Generated by KISSY Module Compiler*/
config({
'switchable': {requires: ['dom','event','anim',KISSY.Features.isTouchSupported() ? "dd/base" : ""]}
});
/*Generated by KISSY Module Compiler*/
config({
'tabs': {requires: ['button','toolbar','component/base']}
});
/*Generated by KISSY Module Compiler*/
config({
'toolbar': {requires: ['component/base','node']}
});
/*Generated by KISSY Module Compiler*/
config({
'tree': {requires: ['node','component/base','event']}
});
/*Generated by KISSY Module Compiler*/
config({
'waterfall': {requires: ['node','base']}
});
config({
    xtemplate: {
        alias: ['xtemplate/facade']
    }
});/*Generated by KISSY Module Compiler*/
config({
'xtemplate/compiler': {requires: ['xtemplate/runtime']}
});
/*Generated by KISSY Module Compiler*/
config({
'xtemplate/facade': {requires: ['xtemplate/runtime','xtemplate/compiler']}
});

                })(function(c){
                KISSY.config('modules', c);
                },KISSY.Features,KISSY.UA);
            /**
 * @ignore
 * export KISSY 's functionality to module system
 */
(function (S) {

    // empty mod for conditional loading
    S.add('empty', S.noop);

    S.add('promise', function () {
        return S.Promise;
    });

    S.add('ua', function () {
        return S.UA;
    });

    S.add('uri', function () {
        return S.Uri;
    });

    S.add('path', function () {
        return S.Path
    });

})(KISSY);
/*
Copyright 2013, KISSY UI Library v1.30
MIT Licensed
build time: Jan 29 20:38
*/
/**
 * @ignore
 * dom
 * @author yiminghe@gmail.com, lifesinger@gmail.com
 */
KISSY.add('dom/base/api', function (S) {

    var WINDOW = S.Env.host,
        UA = S.UA,
        RE_NUM = /[\-+]?(?:\d*\.|)\d+(?:[eE][\-+]?\d+|)/.source,
        /**
         * DOM Element node type.
         * @enum {Number} KISSY.DOM.NodeType
         */
            NodeType = {
            /**
             * element type
             */
            ELEMENT_NODE: 1,
            /**
             * attribute node type
             */
            'ATTRIBUTE_NODE': 2,
            /**
             * text node type
             */
            TEXT_NODE: 3,
            /**
             * cdata node type
             */
            'CDATA_SECTION_NODE': 4,
            /**
             * entity reference node type
             */
            'ENTITY_REFERENCE_NODE': 5,
            /**
             * entity node type
             */
            'ENTITY_NODE': 6,
            /**
             * processing instruction node type
             */
            'PROCESSING_INSTRUCTION_NODE': 7,
            /**
             * comment node type
             */
            COMMENT_NODE: 8,
            /**
             * document node type
             */
            DOCUMENT_NODE: 9,
            /**
             * document type
             */
            'DOCUMENT_TYPE_NODE': 10,
            /**
             * document fragment type
             */
            DOCUMENT_FRAGMENT_NODE: 11,
            /**
             * notation type
             */
            'NOTATION_NODE': 12
        };
    /**
     * KISSY DOM Utils.
     * Provides DOM helper methods.
     * @class KISSY.DOM
     * @singleton
     */
    var DOM = {

        /**
         * Whether has been set a custom domain.
         * Note not perfect: localhost:8888, domain='localhost'
         * @param {window} [win] Test window. Default current window.
         * @return {Boolean}
         */
        isCustomDomain: function (win) {
            win = win || WINDOW;
            var domain = win.document.domain,
                hostname = win.location.hostname;
            return domain != hostname &&
                domain != ( '[' + hostname + ']' );	// IPv6 IP support
        },

        /**
         * Get appropriate src for new empty iframe.
         * Consider custom domain.
         * @param {window} [win] Window new iframe will be inserted into.
         * @return {String} Src for iframe.
         */
        getEmptyIframeSrc: function (win) {
            win = win || WINDOW;
            if (UA['ie'] && DOM.isCustomDomain(win)) {
                return  'javascript:void(function(){' + encodeURIComponent(
                    'document.open();' +
                        "document.domain='" +
                        win.document.domain
                        + "';" +
                        'document.close();') + '}())';
            }
            return '';
        },

        NodeType: NodeType,

        /**
         * Return corresponding window if elem is document or window.
         * Return global window if elem is undefined
         * Else return false.
         * @param {undefined|window|HTMLDocument} elem
         * @return {window|Boolean}
         */
        getWindow: function (elem) {
            if (!elem) {
                return WINDOW;
            }
            return ('scrollTo' in elem && elem['document']) ?
                elem : elem.nodeType == NodeType.DOCUMENT_NODE ?
                elem.defaultView || elem.parentWindow :
                false;
        },

        // Ref: http://lifesinger.github.com/lab/2010/nodelist.html
        _isNodeList: function (o) {
            // 注1：ie 下，有 window.item, typeof node.item 在 ie 不同版本下，返回值不同
            // 注2：select 等元素也有 item, 要用 !node.nodeType 排除掉
            // 注3：通过 namedItem 来判断不可靠
            // 注4：getElementsByTagName 和 querySelectorAll 返回的集合不同
            // 注5: 考虑 iframe.contentWindow
            return o && !o.nodeType && o.item && !o.setTimeout;
        },

        /**
         * Get node 's nodeName in lowercase.
         * @param {HTMLElement[]|String|HTMLElement} selector Matched elements.
         * @return {String} el 's nodeName in lowercase
         */
        nodeName: function (selector) {
            var el = DOM.get(selector),
                nodeName = el.nodeName.toLowerCase();
            // http://msdn.microsoft.com/en-us/library/ms534388(VS.85).aspx
            if (UA['ie']) {
                var scopeName = el['scopeName'];
                if (scopeName && scopeName != 'HTML') {
                    nodeName = scopeName.toLowerCase() + ':' + nodeName;
                }
            }
            return nodeName;
        },

        _RE_NUM_NO_PX: new RegExp("^(" + RE_NUM + ")(?!px)[a-z%]+$", "i")
    };

    S.mix(DOM, NodeType);

    return DOM;

});

/*
 2011-08
 - 添加键盘枚举值，方便依赖程序清晰
 */
/**
 * @ignore
 *  dom-attr
 * @author yiminghe@gmail.com, lifesinger@gmail.com
 */
KISSY.add('dom/base/attr', function (S, DOM, undefined) {

    var doc = S.Env.host.document,
        NodeType = DOM.NodeType,
        docElement = doc && doc.documentElement,
        TEXT = docElement && docElement.textContent === undefined ?
            'innerText' : 'textContent',
        EMPTY = '',
        nodeName = DOM.nodeName,
        R_BOOLEAN = /^(?:autofocus|autoplay|async|checked|controls|defer|disabled|hidden|loop|multiple|open|readonly|required|scoped|selected)$/i,
        R_FOCUSABLE = /^(?:button|input|object|select|textarea)$/i,
        R_CLICKABLE = /^a(?:rea)?$/i,
        R_INVALID_CHAR = /:|^on/,
        R_RETURN = /\r/g,

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
            offset: 1,
            scrollTop: 1,
            scrollLeft: 1
        },

        attrHooks = {
            // http://fluidproject.org/blog/2008/01/09/getting-setting-and-removing-tabindex-values-with-javascript/
            tabindex: {
                get: function (el) {
                    // elem.tabIndex doesn't always return the correct value when it hasn't been explicitly set
                    var attributeNode = el.getAttributeNode('tabindex');
                    return attributeNode && attributeNode.specified ?
                        parseInt(attributeNode.value, 10) :
                        R_FOCUSABLE.test(el.nodeName) ||
                            R_CLICKABLE.test(el.nodeName) && el.href ?
                            0 :
                            undefined;
                }
            }
        },

        propFix = {
            'hidefocus': 'hideFocus',
            tabindex: 'tabIndex',
            readonly: 'readOnly',
            'for': 'htmlFor',
            'class': 'className',
            maxlength: 'maxLength',
            'cellspacing': 'cellSpacing',
            'cellpadding': 'cellPadding',
            rowspan: 'rowSpan',
            colspan: 'colSpan',
            usemap: 'useMap',
            'frameborder': 'frameBorder',
            'contenteditable': 'contentEditable'
        },

    // Hook for boolean attributes
    // if bool is false
    // - standard browser returns null
    // - ie<8 return false
    // - norm to undefined
        boolHook = {
            get: function (elem, name) {
                // 转发到 prop 方法
                return DOM.prop(elem, name) ?
                    // 根据 w3c attribute , true 时返回属性名字符串
                    name.toLowerCase() :
                    undefined;
            },
            set: function (elem, value, name) {
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

        propHooks = {
        },

    // get attribute value from attribute node, only for ie
        attrNodeHook = {
        },

        valHooks = {

            select: {
                // fix for multiple select
                get: function (elem) {
                    var index = elem.selectedIndex,
                        options = elem.options,
                        ret,
                        i,
                        len,
                        one = elem.type === 'select-one';

                    // Nothing was selected
                    if (index < 0) {
                        return null;
                    } else if (one) {
                        return DOM.val(options[index]);
                    }

                    // Loop through all the selected options
                    ret = [];
                    i = 0;
                    len = options.length;
                    for (; i < len; ++i) {
                        if (options[i].selected) {
                            ret.push(DOM.val(options[i]));
                        }
                    }
                    // Multi-Selects return an array
                    return ret;
                },

                set: function (elem, value) {
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
            }

        };

    // Radios and checkboxes getter/setter
    S.each(['radio', 'checkbox'], function (r) {
        valHooks[r] = {
            get: function (elem) {
                // Handle the case where in Webkit '' is returned instead of 'on'
                // if a value isn't specified
                return elem.getAttribute('value') === null ? 'on' : elem.value;
            },
            set: function (elem, value) {
                if (S.isArray(value)) {
                    return elem.checked = S.inArray(DOM.val(elem), value);
                }
            }
        };
    });

    // IE7- 下，需要用 cssText 来获取
    // 所有浏览器统一下, attr('style') 标准浏览器也不是 undefined
    attrHooks['style'] = {
        get: function (el) {
            return el.style.cssText;
        }
    };

    function getProp(elem, name) {
        name = propFix[name] || name;
        var hook = propHooks[name];
        if (hook && hook.get) {
            return hook.get(elem, name);
        } else {
            return elem[name];
        }
    }

    S.mix(DOM,
        /**
         * @override KISSY.DOM
         * @class
         * @singleton
         */
        {

            _valHooks: valHooks,

            _propFix: propFix,

            _attrHooks: attrHooks,

            _propHooks: propHooks,

            _attrNodeHook: attrNodeHook,

            _attrFix: attrFix,

            /**
             * Get the value of a property for the first element in the set of matched elements.
             * or
             * Set one or more properties for the set of matched elements.
             * @param {HTMLElement[]|String|HTMLElement} selector matched elements
             * @param {String|Object} name
             * The name of the property to set.
             * or
             * A map of property-value pairs to set.
             * @param [value] A value to set for the property.
             * @return {String|undefined|Boolean}
             */
            prop: function (selector, name, value) {
                var elems = DOM.query(selector),
                    i,
                    elem,
                    hook;

                // supports hash
                if (S.isPlainObject(name)) {
                    S.each(name, function (v, k) {
                        DOM.prop(elems, k, v);
                    });
                    return undefined;
                }

                // Try to normalize/fix the name
                name = propFix[ name ] || name;
                hook = propHooks[ name ];
                if (value !== undefined) {
                    for (i = elems.length - 1; i >= 0; i--) {
                        elem = elems[i];
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
             * @param {HTMLElement[]|String|HTMLElement} selector 元素
             * @param {String} name The name of property to test
             * @return {Boolean}
             */
            hasProp: function (selector, name) {
                var elems = DOM.query(selector),
                    i,
                    len = elems.length,
                    el;
                for (i = 0; i < len; i++) {
                    el = elems[i];
                    if (getProp(el, name) !== undefined) {
                        return true;
                    }
                }
                return false;
            },

            /**
             * Remove a property for the set of matched elements.
             * @param {HTMLElement[]|String|HTMLElement} selector matched elements
             * @param {String} name The name of the property to remove.
             */
            removeProp: function (selector, name) {
                name = propFix[ name ] || name;
                var elems = DOM.query(selector),
                    i,
                    el;
                for (i = elems.length - 1; i >= 0; i--) {
                    el = elems[i];
                    try {
                        el[ name ] = undefined;
                        delete el[ name ];
                    } catch (e) {
                        // S.log('delete el property error : ');
                        // S.log(e);
                    }
                }
            },

            /**
             * Get the value of an attribute for the first element in the set of matched elements.
             * or
             * Set one or more attributes for the set of matched elements.
             * @param {HTMLElement[]|HTMLElement|String} selector matched elements
             * @param {String|Object} name The name of the attribute to set. or A map of attribute-value pairs to set.
             * @param [val] A value to set for the attribute.
             * @param [pass] for internal use
             * @return {String}
             */
            attr: function (selector, name, val, /*internal use by anim/fx*/pass) {
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

                 - Trying to set an invalid name like ':' is supposed to throw an
                 error.  In IE[678] and Opera 10, it fails without an error.
                 */

                var els = DOM.query(selector),
                    attrNormalizer,
                    i,
                    el = els[0],
                    ret;

                // supports hash
                if (S.isPlainObject(name)) {
                    pass = val;
                    for (var k in name) {
                        DOM.attr(els, k, name[k], pass);
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

                if (R_BOOLEAN.test(name)) {
                    attrNormalizer = boolHook;
                }
                // only old ie?
                else if (R_INVALID_CHAR.test(name)) {
                    attrNormalizer = attrNodeHook;
                } else {
                    attrNormalizer = attrHooks[name];
                }


                if (val === undefined) {
                    if (el && el.nodeType === NodeType.ELEMENT_NODE) {
                        // browsers index elements by id/name on forms, give priority to attributes.
                        if (nodeName(el) == 'form') {
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
                    for (i = els.length - 1; i >= 0; i--) {
                        el = els[i];
                        if (el && el.nodeType === NodeType.ELEMENT_NODE) {
                            if (nodeName(el) == 'form') {
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
             * @param {HTMLElement[]|String} selector matched elements
             * @param {String} name An attribute to remove
             */
            removeAttr: function (selector, name) {
                name = name.toLowerCase();
                name = attrFix[name] || name;
                var els = DOM.query(selector),
                    propName,
                    el, i;
                for (i = els.length - 1; i >= 0; i--) {
                    el = els[i];
                    if (el.nodeType == NodeType.ELEMENT_NODE) {
                        el.removeAttribute(name);
                        // Set corresponding property to false for boolean attributes
                        if (R_BOOLEAN.test(name) && (propName = propFix[ name ] || name) in el) {
                            el[ propName ] = false;
                        }
                    }
                }
            },

            /**
             * Whether one of the matched elements has specified attribute
             * @method
             * @param {HTMLElement[]|String} selector matched elements
             * @param {String} name The attribute to be tested
             * @return {Boolean}
             */
            hasAttr: docElement && !docElement.hasAttribute ?
                function (selector, name) {
                    name = name.toLowerCase();
                    var elems = DOM.query(selector),
                        i, el,
                        attrNode;
                    // from ppk :http://www.quirksmode.org/dom/w3c_core.html
                    // IE5-7 doesn't return the value of a style attribute.
                    // var $attr = el.attributes[name];
                    for (i = 0; i < elems.length; i++) {
                        el = elems[i];
                        attrNode = el.getAttributeNode(name);
                        if (attrNode && attrNode.specified) {
                            return true;
                        }
                    }
                    return false;
                } :
                function (selector, name) {
                    var elems = DOM.query(selector), i,
                        len = elems.length;
                    for (i = 0; i < len; i++) {
                        //使用原生实现
                        if (elems[i].hasAttribute(name)) {
                            return true;
                        }
                    }
                    return false;
                },

            /**
             * Get the current value of the first element in the set of matched elements.
             * or
             * Set the value of each element in the set of matched elements.
             * @param {HTMLElement[]|String} selector matched elements
             * @param {String|String[]} [value] A string of text or an array of strings corresponding to the value of each matched element to set as selected/checked.
             * @return {undefined|String|String[]|Number}
             */
            val: function (selector, value) {
                var hook, ret, elem, els, i, val;

                //getter
                if (value === undefined) {

                    elem = DOM.get(selector);

                    if (elem) {
                        hook = valHooks[ nodeName(elem) ] || valHooks[ elem.type ];

                        if (hook && 'get' in hook &&
                            (ret = hook.get(elem, 'value')) !== undefined) {
                            return ret;
                        }

                        ret = elem.value;

                        return typeof ret === 'string' ?
                            // handle most common string cases
                            ret.replace(R_RETURN, '') :
                            // handle cases where value is null/undefined or number
                            ret == null ? '' : ret;
                    }

                    return undefined;
                }

                els = DOM.query(selector);
                for (i = els.length - 1; i >= 0; i--) {
                    elem = els[i];
                    if (elem.nodeType !== 1) {
                        return undefined;
                    }

                    val = value;

                    // Treat null/undefined as ''; convert numbers to string
                    if (val == null) {
                        val = '';
                    } else if (typeof val === 'number') {
                        val += '';
                    } else if (S.isArray(val)) {
                        val = S.map(val, function (value) {
                            return value == null ? '' : value + '';
                        });
                    }

                    hook = valHooks[ nodeName(elem)] || valHooks[ elem.type ];

                    // If set returns undefined, fall back to normal setting
                    if (!hook || !('set' in hook) || hook.set(elem, val, 'value') === undefined) {
                        elem.value = val;
                    }
                }
                return undefined;
            },

            /**
             * Get the combined text contents of each element in the set of matched elements, including their descendants.
             * or
             * Set the content of each element in the set of matched elements to the specified text.
             * @param {HTMLElement[]|HTMLElement|String} selector matched elements
             * @param {String} [val] A string of text to set as the content of each matched element.
             * @return {String|undefined}
             */
            text: function (selector, val) {
                var el, els, i;
                // getter
                if (val === undefined) {
                    // supports css selector/Node/NodeList
                    el = DOM.get(selector);

                    // only gets value on supported nodes
                    if (el.nodeType == NodeType.ELEMENT_NODE) {
                        return el[TEXT] || EMPTY;
                    }
                    else if (el.nodeType == NodeType.TEXT_NODE) {
                        return el.nodeValue;
                    }
                    return undefined;
                }
                // setter
                else {
                    els = DOM.query(selector);
                    for (i = els.length - 1; i >= 0; i--) {
                        el = els[i];
                        if (el.nodeType == NodeType.ELEMENT_NODE) {
                            el[TEXT] = val;
                        }
                        else if (el.nodeType == NodeType.TEXT_NODE) {
                            el.nodeValue = val;
                        }
                    }
                }
                return undefined;
            }
        });

    return DOM;
}, {
    requires: ['./api']
});
/*
 NOTES:
 yiminghe@gmail.com: 2012-11-27
 - 拆分 ie attr，条件加载

 yiminghe@gmail.com：2011-06-03
 - 借鉴 jquery 1.6,理清 attribute 与 property

 yiminghe@gmail.com：2011-01-28
 - 处理 tabindex，顺便重构

 2010.03
 - 在 jquery/support.js 中，special attrs 里还有 maxlength, cellspacing,
 rowspan, colspan, usemap, frameborder, 但测试发现，在 Grade-A 级浏览器中
 并无兼容性问题。
 - 当 colspan/rowspan 属性值设置有误时，ie7- 会自动纠正，和 href 一样，需要传递
 第 2 个参数来解决。jQuery 未考虑，存在兼容性 bug.
 - jQuery 考虑了未显式设定 tabindex 时引发的兼容问题，kissy 里忽略（太不常用了）
 - jquery/attributes.js: Safari mis-reports the default selected
 property of an option 在 Safari 4 中已修复。

 *//**
 * @ignore
 *  dom
 * @author yiminghe@gmail.com
 */
KISSY.add('dom/base', function (S, DOM) {
    S.mix(S, {
        DOM: DOM,
        get: DOM.get,
        query: DOM.query
    });

    return DOM;
}, {
    requires: [
        './base/api',
        './base/attr',
        './base/class',
        './base/create',
        './base/data',
        './base/insertion',
        './base/offset',
        './base/style',
        './base/selector',
        './base/traversal'
    ]
});/**
 * @ignore
 *  dom-class
 * @author lifesinger@gmail.com, yiminghe@gmail.com
 */
KISSY.add('dom/base/class', function (S, DOM, undefined) {

    var SPACE = ' ',
        NodeType = DOM.NodeType,
        RE_SPLIT = /[\.\s]\s*\.?/,
        RE_CLASS = /[\n\t]/g;

    function norm(elemClass) {
        return (SPACE + elemClass + SPACE).replace(RE_CLASS, SPACE);
    }

    S.mix(DOM,

        /**
         * @override KISSY.DOM
         * @class
         * @singleton
         */
        {
            /**
             * Determine whether any of the matched elements are assigned the given classes.
             * @param {HTMLElement|String|HTMLElement[]} selector matched elements
             * @param {String} className One or more class names to search for.
             * multiple class names is separated by space
             * @return {Boolean}
             */
            hasClass: function (selector, className) {
                return batch(selector, className, function (elem, classNames, cl) {
                    var elemClass = elem.className,
                        className,
                        j,
                        ret;
                    if (elemClass) {
                        className = norm(elemClass);
                        j = 0;
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
             * @param {HTMLElement|String|HTMLElement[]} selector matched elements
             * @param {String} className One or more class names to be added to the class attribute of each matched element.
             * multiple class names is separated by space
             */
            addClass: function (selector, className) {
                batch(selector, className, function (elem, classNames, cl) {
                    var elemClass = elem.className,
                        normClassName,
                        setClass,
                        j;
                    if (!elemClass) {
                        elem.className = className;
                    } else {
                        normClassName = norm(elemClass);
                        setClass = elemClass;
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
             * @param {HTMLElement|String|HTMLElement[]} selector matched elements
             * @param {String} className One or more class names to be removed from the class attribute of each matched element.
             * multiple class names is separated by space
             */
            removeClass: function (selector, className) {
                batch(selector, className, function (elem, classNames, cl) {
                    var elemClass = elem.className,
                        className,
                        j,
                        needle;
                    if (elemClass) {
                        if (!cl) {
                            elem.className = '';
                        } else {
                            className = norm(elemClass);
                            j = 0;
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
             * @param {HTMLElement|String|HTMLElement[]} selector matched elements
             * @param {String} oldClassName One or more class names to be removed from the class attribute of each matched element.
             * multiple class names is separated by space
             * @param {String} newClassName One or more class names to be added to the class attribute of each matched element.
             * multiple class names is separated by space
             */
            replaceClass: function (selector, oldClassName, newClassName) {
                DOM.removeClass(selector, oldClassName);
                DOM.addClass(selector, newClassName);
            },

            /**
             * Add or remove one or more classes from each element in the set of
             * matched elements, depending on either the class's presence or the
             * value of the switch argument.
             * @param {HTMLElement|String|HTMLElement[]} selector matched elements
             * @param {String} className One or more class names to be added to the class attribute of each matched element.
             * multiple class names is separated by space
             * @param [state] {Boolean} optional boolean to indicate whether class
             *        should be added or removed regardless of current state.
             */
            toggleClass: function (selector, className, state) {
                var isBool = S.isBoolean(state), has, j;
                batch(selector, className, function (elem, classNames, cl) {
                    for (j=0; j < cl; j++) {
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
            tmp = value.split(RE_SPLIT),
            elem,
            ret,
            classNames = [],
            t,
            i;
        for (i = 0; i < tmp.length; i++) {
            t = S.trim(tmp[i]);
            if (t) {
                classNames.push(t);
            }
        }
        for (i = 0; i < len; i++) {
            elem = elems[i];
            if (elem.nodeType == NodeType.ELEMENT_NODE) {
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
    requires: ['./api']
});

/*
 NOTES:
 - hasClass/addClass/removeClass 的逻辑和 jQuery 保持一致
 - toggleClass 不支持 value 为 undefined 的情形（jQuery 支持）
 */
/**
 * @ignore
 *  dom-create
 * @author lifesinger@gmail.com, yiminghe@gmail.com
 */
KISSY.add('dom/base/create', function (S, DOM, undefined) {

    var doc = S.Env.host.document,
        NodeType = DOM.NodeType,
        UA = S.UA,
        ie = UA['ie'],
        DIV = 'div',
        PARENT_NODE = 'parentNode',
        DEFAULT_DIV = doc && doc.createElement(DIV),
        R_XHTML_TAG = /<(?!area|br|col|embed|hr|img|input|link|meta|param)(([\w:]+)[^>]*)\/>/ig,
        RE_TAG = /<([\w:]+)/,
        R_LEADING_WHITESPACE = /^\s+/,
        lostLeadingWhitespace = ie && ie < 9,
        R_HTML = /<|&#?\w+;/,
        supportOuterHTML = doc && 'outerHTML' in doc.documentElement,
        RE_SIMPLE_TAG = /^<(\w+)\s*\/?>(?:<\/\1>)?$/;

    // help compression
    function getElementsByTagName(el, tag) {
        return el.getElementsByTagName(tag);
    }

    function cleanData(els) {
        var Event = S.require('event/dom');
        if (Event) {
            Event.detach(els);
        }
        DOM.removeData(els);
    }

    function defaultCreator(html, ownerDoc) {
        var frag = ownerDoc && ownerDoc != doc ?
            ownerDoc.createElement(DIV) :
            DEFAULT_DIV;
        // html 为 <style></style> 时不行，必须有其他元素？
        frag.innerHTML = 'm<div>' + html + '<' + '/div>';
        return frag.lastChild;
    }

    S.mix(DOM,
        /**
         * @override KISSY.DOM
         * @class
         * @singleton
         */
        {

            /**
             * Creates DOM elements on the fly from the provided string of raw HTML.
             * @param {String} html A string of HTML to create on the fly. Note that this parses HTML, not XML.
             * @param {Object} [props] An map of attributes on the newly-created element.
             * @param {HTMLDocument} [ownerDoc] A document in which the new elements will be created
             * @return {DocumentFragment|HTMLElement}
             */
            create: function (html, props, ownerDoc, _trim/*internal*/) {

                var ret = null;

                if (!html) {
                    return ret;
                }

                if (html.nodeType) {
                    return DOM.clone(html);
                }


                if (typeof html != 'string') {
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

                if (!R_HTML.test(html)) {
                    ret = context.createTextNode(html);
                }
                // 简单 tag, 比如 DOM.create('<p>')
                else if ((m = RE_SIMPLE_TAG.exec(html))) {
                    ret = context.createElement(m[1]);
                }
                // 复杂情况，比如 DOM.create('<img src='sprite.png' />')
                else {
                    // Fix 'XHTML'-style tags in all browsers
                    html = html.replace(R_XHTML_TAG, '<$1><' + '/$2>');

                    if ((m = RE_TAG.exec(html)) && (k = m[1])) {
                        tag = k.toLowerCase();
                    }

                    holder = (creators[tag] || defaultCreator)(html, context);
                    // ie 把前缀空白吃掉了
                    if (lostLeadingWhitespace &&
                        (whitespaceMatch = html.match(R_LEADING_WHITESPACE))) {
                        holder.insertBefore(context.createTextNode(whitespaceMatch[0]),
                            holder.firstChild);
                    }

                    nodes = holder.childNodes;

                    if (nodes.length === 1) {
                        // return single node, breaking parentNode ref from 'fragment'
                        ret = nodes[0][PARENT_NODE].removeChild(nodes[0]);
                    } else if (nodes.length) {
                        // return multiple nodes as a fragment
                        ret = nodeListToFragment(nodes);
                    } else {
                        S.error(html + ' : create node error');
                    }
                }

                return attachProps(ret, props);
            },

            _fixCloneAttributes: null,

            _creators: {
                div: defaultCreator
            },

            _defaultCreator:defaultCreator,

            /**
             * Get the HTML contents of the first element in the set of matched elements.
             * or
             * Set the HTML contents of each element in the set of matched elements.
             * @param {HTMLElement|String|HTMLElement[]} selector matched elements
             * @param {String} htmlString  A string of HTML to set as the content of each matched element.
             * @param {Boolean} [loadScripts=false] True to look for and process scripts
             */
            html: function (selector, htmlString, loadScripts, callback) {
                // supports css selector/Node/NodeList
                var els = DOM.query(selector),
                    el = els[0],
                    success = false,
                    valNode,
                    i, elem;

                if (!el) {
                    return
                }

                // getter
                if (htmlString === undefined) {
                    // only gets value on the first of element nodes
                    if (el.nodeType == NodeType.ELEMENT_NODE) {
                        return el.innerHTML;
                    } else {
                        return null;
                    }
                }
                // setter
                else {
                    htmlString += '';

                    // faster
                    // fix #103,some html element can not be set through innerHTML
                    if (!htmlString.match(/<(?:script|style|link)/i) &&
                        (!lostLeadingWhitespace || !htmlString.match(R_LEADING_WHITESPACE)) &&
                        !creatorsMap[ (htmlString.match(RE_TAG) || ['', ''])[1].toLowerCase() ]) {

                        try {
                            for (i = els.length - 1; i >= 0; i--) {
                                elem = els[i];
                                if (elem.nodeType == NodeType.ELEMENT_NODE) {
                                    cleanData(getElementsByTagName(elem, '*'));
                                    elem.innerHTML = htmlString;
                                }
                            }
                            success = true;
                        } catch (e) {
                            // a <= '<a>'
                            // a.innerHTML='<p>1</p>';
                        }

                    }

                    if (!success) {
                        valNode = DOM.create(htmlString, 0, el.ownerDocument, 0);
                        DOM.empty(els);
                        DOM.append(valNode, els, loadScripts);
                    }
                    callback && callback();
                }
            },

            /**
             * Get the outerHTML of the first element in the set of matched elements.
             * or
             * Set the outerHTML of each element in the set of matched elements.
             * @param {HTMLElement|String|HTMLElement[]} selector matched elements
             * @param {String} htmlString  A string of HTML to set as outerHTML of each matched element.
             * @param {Boolean} [loadScripts=false] True to look for and process scripts
             */
            outerHTML: function (selector, htmlString, loadScripts) {
                var els = DOM.query(selector),
                    holder,
                    i,
                    valNode,
                    ownerDoc,
                    length = els.length,
                    el = els[0];
                if (!el) {
                    return
                }
                // getter
                if (htmlString === undefined) {
                    if (supportOuterHTML) {
                        return el.outerHTML
                    } else {
                        ownerDoc = el.ownerDocument;
                        holder = ownerDoc && ownerDoc != doc ?
                            ownerDoc.createElement(DIV) :
                            DEFAULT_DIV;
                        holder.innerHTML = '';
                        holder.appendChild(DOM.clone(el, true));
                        return holder.innerHTML;
                    }
                } else {
                    htmlString += '';
                    if (!htmlString.match(/<(?:script|style|link)/i) && supportOuterHTML) {
                        for (i = length - 1; i >= 0; i--) {
                            el = els[i];
                            if (el.nodeType == NodeType.ELEMENT_NODE) {
                                cleanData(el);
                                cleanData(getElementsByTagName(el, '*'));
                                el.outerHTML = htmlString;
                            }
                        }
                    } else {
                        valNode = DOM.create(htmlString, 0, el.ownerDocument, 0);
                        DOM.insertBefore(valNode, els, loadScripts);
                        DOM.remove(els);
                    }
                }
            },

            /**
             * Remove the set of matched elements from the DOM.
             * @param {HTMLElement|String|HTMLElement[]} selector matched elements
             * @param {Boolean} [keepData=false] whether keep bound events and jQuery data associated with the elements from removed.
             */
            remove: function (selector, keepData) {
                var el,
                    els = DOM.query(selector),
                    elChildren,
                    i;
                for (i = els.length - 1; i >= 0; i--) {
                    el = els[i];
                    if (!keepData && el.nodeType == NodeType.ELEMENT_NODE) {
                        // 清理数据
                        elChildren = getElementsByTagName(el, '*');
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
             * @param {HTMLElement|String|HTMLElement[]} selector matched elements
             * @param {Boolean|Object} [deep=false] whether perform deep copy or copy config.
             * @param {Boolean} [deep.deep] whether perform deep copy
             * @param {Boolean} [deep.withDataAndEvent=false] A Boolean indicating
             * whether event handlers and data should be copied along with the elements.
             * @param {Boolean} [deep.deepWithDataAndEvent=false]
             * A Boolean indicating whether event handlers and data for all children of the cloned element should be copied.
             * if set true then deep argument must be set true as well.
             * @param {Boolean} [withDataAndEvent=false] A Boolean indicating
             * whether event handlers and data should be copied along with the elements.
             * @param {Boolean} [deepWithDataAndEvent=false]
             * A Boolean indicating whether event handlers and data for all children of the cloned element should be copied.
             * if set true then deep argument must be set true as well.
             * https://developer.mozilla.org/En/DOM/Node.cloneNode
             * @return {HTMLElement}
             * @member KISSY.DOM
             */
            clone: function (selector, deep, withDataAndEvent, deepWithDataAndEvent) {

                if (typeof deep === 'object') {
                    deepWithDataAndEvent = deep['deepWithDataAndEvent'];
                    withDataAndEvent = deep['withDataAndEvent'];
                    deep = deep['deep'];
                }

                var elem = DOM.get(selector),
                    clone,
                    _fixCloneAttributes = DOM._fixCloneAttributes,
                    elemNodeType;

                if (!elem) {
                    return null;
                }

                elemNodeType = elem.nodeType;

                // TODO
                // ie bug :
                // 1. ie<9 <script>xx</script> => <script></script>
                // 2. ie will execute external script
                clone = elem.cloneNode(deep);

                if (elemNodeType == NodeType.ELEMENT_NODE ||
                    elemNodeType == NodeType.DOCUMENT_FRAGMENT_NODE) {
                    // IE copies events bound via attachEvent when using cloneNode.
                    // Calling detachEvent on the clone will also remove the events
                    // from the original. In order to get around this, we use some
                    // proprietary methods to clear the events. Thanks to MooTools
                    // guys for this hotness.
                    if (_fixCloneAttributes && elemNodeType == NodeType.ELEMENT_NODE) {
                        _fixCloneAttributes(elem, clone);
                    }

                    if (deep && _fixCloneAttributes) {
                        processAll(_fixCloneAttributes, elem, clone);
                    }
                }
                // runtime 获得事件模块
                if (withDataAndEvent) {
                    cloneWithDataAndEvent(elem, clone);
                    if (deep && deepWithDataAndEvent) {
                        processAll(cloneWithDataAndEvent, elem, clone);
                    }
                }
                return clone;
            },

            /**
             * Remove(include data and event handlers) all child nodes of the set of matched elements from the DOM.
             * @param {HTMLElement|String|HTMLElement[]} selector matched elements
             */
            empty: function (selector) {
                var els = DOM.query(selector),
                    el, i;
                for (i = els.length - 1; i >= 0; i--) {
                    el = els[i];
                    DOM.remove(el.childNodes);
                }
            },

            _nodeListToFragment: nodeListToFragment
        });

    function processAll(fn, elem, clone) {
        var elemNodeType = elem.nodeType;
        if (elemNodeType == NodeType.DOCUMENT_FRAGMENT_NODE) {
            var eCs = elem.childNodes,
                cloneCs = clone.childNodes,
                fIndex = 0;
            while (eCs[fIndex]) {
                if (cloneCs[fIndex]) {
                    processAll(fn, eCs[fIndex], cloneCs[fIndex]);
                }
                fIndex++;
            }
        } else if (elemNodeType == NodeType.ELEMENT_NODE) {
            var elemChildren = getElementsByTagName(elem, '*'),
                cloneChildren = getElementsByTagName(clone, '*'),
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
    function cloneWithDataAndEvent(src, dest) {
        var Event = S.require('event/dom'),
            srcData,
            d;

        if (dest.nodeType == NodeType.ELEMENT_NODE && !DOM.hasData(src)) {
            return;
        }

        srcData = DOM.data(src);

        // 浅克隆，data 也放在克隆节点上
        for (d in srcData) {
            DOM.data(dest, d, srcData[d]);
        }

        // 事件要特殊点
        if (Event) {
            // remove event data (but without dom attached listener) which is copied from above DOM.data
            Event._DOMUtils.removeData(dest);
            // attach src 's event data and dom attached listener to dest
            Event._clone(src, dest);
        }
    }

    // 添加成员到元素中
    function attachProps(elem, props) {
        if (S.isPlainObject(props)) {
            if (elem.nodeType == NodeType.ELEMENT_NODE) {
                DOM.attr(elem, props, true);
            }
            // document fragment
            else if (elem.nodeType == NodeType.DOCUMENT_FRAGMENT_NODE) {
                DOM.attr(elem.childNodes, props, true);
            }
        }
        return elem;
    }

    // 将 nodeList 转换为 fragment
    function nodeListToFragment(nodes) {
        var ret = null,
            i,
            ownerDoc,
            len;
        if (nodes && (nodes.push || nodes.item) && nodes[0]) {
            ownerDoc = nodes[0].ownerDocument;
            ret = ownerDoc.createDocumentFragment();
            nodes = S.makeArray(nodes);
            for (i = 0, len = nodes.length; i < len; i++) {
                ret.appendChild(nodes[i]);
            }
        } else {
            S.log('Unable to convert ' + nodes + ' to fragment.');
        }
        return ret;
    }

    // 残缺元素处理
    var creators = DOM._creators,
        create = DOM.create,
        creatorsMap = {
            option: 'select',
            optgroup: 'select',
            area: 'map',
            thead: 'table',
            td: 'tr',
            th: 'tr',
            tr: 'tbody',
            tbody: 'table',
            tfoot: 'table',
            caption: 'table',
            colgroup: 'table',
            col: 'colgroup',
            legend: 'fieldset'
        }, p;

    for (p in creatorsMap) {
        (function (tag) {
            creators[p] = function (html, ownerDoc) {
                return create('<' + tag + '>' +
                    html + '<' + '/' + tag + '>',
                    null, ownerDoc);
            };
        })(creatorsMap[p]);
    }

    return DOM;
}, {
    requires: ['./api']
});

/*
 2012-01-31
 remove spurious tbody

 2011-10-13
 empty , html refactor

 2011-08-22
 clone 实现，参考 jq

 2011-08
 remove 需要对子孙节点以及自身清除事件以及自定义 data
 create 修改，支持 <style></style> ie 下直接创建
 */
/**
 * @ignore
 *  dom-data
 * @author lifesinger@gmail.com, yiminghe@gmail.com
 */
KISSY.add('dom/base/data', function (S, DOM, undefined) {

    var win = S.Env.host,
        EXPANDO = '__ks_data_' + S.now(), // 让每一份 kissy 的 expando 都不同
        dataCache = { }, // 存储 node 节点的 data
        winDataCache = { }, // 避免污染全局


    // The following elements throw uncatchable exceptions if you
    // attempt to add expando properties to them.
        noData = {
        };
    noData['applet'] = 1;
    noData['object'] = 1;
    noData['embed'] = 1;

    var commonOps = {
        hasData: function (cache, name) {
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
        hasData: function (ob, name) {
            // 只判断当前窗口，iframe 窗口内数据直接放入全局变量
            if (ob == win) {
                return objectOps.hasData(winDataCache, name);
            }
            // 直接建立在对象内
            var thisCache = ob[EXPANDO];
            return commonOps.hasData(thisCache, name);
        },

        data: function (ob, name, value) {
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
        removeData: function (ob, name) {
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
        hasData: function (elem, name) {
            var key = elem[EXPANDO];
            if (!key) {
                return false;
            }
            var thisCache = dataCache[key];
            return commonOps.hasData(thisCache, name);
        },

        data: function (elem, name, value) {
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

        removeData: function (elem, name) {
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
                    //S.log('delete expando error : ');
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
         * @override KISSY.DOM
         * @class
         * @singleton
         */
        {

            __EXPANDO: EXPANDO,

            /**
             * Determine whether an element has any data or specified data name associated with it.
             * @param {HTMLElement[]|String|HTMLElement} selector Matched elements
             * @param {String} [name] A string naming the piece of data to set.
             * @return {Boolean}
             */
            hasData: function (selector, name) {
                var ret = false,
                    elems = DOM.query(selector);
                for (var i = 0; i < elems.length; i++) {
                    var elem = elems[i];
                    if (elem.nodeType) {
                        ret = domOps.hasData(elem, name);
                    } else {
                        // window
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
             * @param [data] The new data value.
             * @return {Object|undefined}
             */
            data: function (selector, name, data) {

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
                            return domOps.data(elem, name);
                        } else {
                            // window
                            return objectOps.data(elem, name);
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
                            // window
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
            removeData: function (selector, name) {
                var els = DOM.query(selector), elem, i;
                for (i = els.length - 1; i >= 0; i--) {
                    elem = els[i];
                    if (elem.nodeType) {
                        domOps.removeData(elem, name);
                    } else {
                        // window
                        objectOps.removeData(elem, name);
                    }
                }
            }
        });

    return DOM;

}, {
    requires: ['./api']
});
/*
 yiminghe@gmail.com：2011-05-31
 - 分层，节点和普通对象分开处理
 *//**
 * @ignore
 *  dom-insertion
 * @author yiminghe@gmail.com, lifesinger@gmail.com
 */
KISSY.add('dom/base/insertion', function (S, DOM) {

    var PARENT_NODE = 'parentNode',
        NodeType = DOM.NodeType,
        RE_FORM_EL = /^(?:button|input|object|select|textarea)$/i,
        getNodeName = DOM.nodeName,
        makeArray = S.makeArray,
        splice = [].splice,
        NEXT_SIBLING = 'nextSibling',
        R_SCRIPT_TYPE = /\/(java|ecma)script/i;

    function isJs(el) {
        return !el.type || R_SCRIPT_TYPE.test(el.type);
    }

    // extract script nodes and execute alone later
    function filterScripts(nodes, scripts) {
        var ret = [], i, el, nodeName;
        for (i = 0; nodes[i]; i++) {
            el = nodes[i];
            nodeName = getNodeName(el);
            if (el.nodeType == NodeType.DOCUMENT_FRAGMENT_NODE) {
                ret.push.apply(ret, filterScripts(makeArray(el.childNodes), scripts));
            } else if (nodeName === 'script' && isJs(el)) {
                // remove script to make sure ie9 does not invoke when append
                if (el.parentNode) {
                    el.parentNode.removeChild(el)
                }
                if (scripts) {
                    scripts.push(el);
                }
            } else {
                if (el.nodeType == NodeType.ELEMENT_NODE &&
                    // ie checkbox getElementsByTagName 后造成 checked 丢失
                    !RE_FORM_EL.test(nodeName)) {
                    var tmp = [],
                        s,
                        j,
                        ss = el.getElementsByTagName('script');
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
            var code = S.trim(el.text || el.textContent || el.innerHTML || '');
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
        if (DOM._fixInsertionChecked) {
            DOM._fixInsertionChecked(newNodes);
        }

        refNodes = DOM.query(refNodes);

        var newNodesLength = newNodes.length,
            newNode,
            i,
            refNode,
            node,
            clonedNode,
            refNodesLength = refNodes.length;

        if ((!newNodesLength && (!scripts || !scripts.length)) || !refNodesLength) {
            return;
        }

        // fragment 插入速度快点
        // 而且能够一个操作达到批量插入
        // refer: http://www.w3.org/TR/REC-DOM-Level-1/level-one-core.html#ID-B63ED1A3
        newNode = DOM._nodeListToFragment(newNodes);
        //fragment 一旦插入里面就空了，先复制下
        if (refNodesLength > 1) {
            clonedNode = DOM.clone(newNode, true);
            refNodes = S.makeArray(refNodes)
        }

        for (i = 0; i < refNodesLength; i++) {
            refNode = refNodes[i];
            if (newNode) {
                //refNodes 超过一个，clone
                node = i > 0 ? DOM.clone(clonedNode, true) : newNode;
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
         * @override KISSY.DOM
         * @class
         * @singleton
         */
        {

            _fixInsertionChecked: null,

            /**
             * Insert every element in the set of newNodes before every element in the set of refNodes.
             * @param {HTMLElement|HTMLElement[]} newNodes Nodes to be inserted
             * @param {HTMLElement|HTMLElement[]|String} refNodes Nodes to be referred
             */
            insertBefore: function (newNodes, refNodes, loadScripts) {
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
            insertAfter: function (newNodes, refNodes, loadScripts) {
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
            appendTo: function (newNodes, parents, loadScripts) {
                insertion(newNodes, parents, function (newNode, parent) {
                    parent.appendChild(newNode);
                }, loadScripts);
            },

            /**
             * Insert every element in the set of newNodes to the beginning of every element in the set of parents.
             * @param {HTMLElement|HTMLElement[]} newNodes Nodes to be inserted
             * @param {HTMLElement|HTMLElement[]|String} parents Nodes to be referred as parentNode
             */
            prependTo: function (newNodes, parents, loadScripts) {
                insertion(newNodes, parents, function (newNode, parent) {
                    parent.insertBefore(newNode, parent.firstChild);
                }, loadScripts);
            },

            /**
             * Wrap a node around all elements in the set of matched elements
             * @param {HTMLElement|HTMLElement[]|String} wrappedNodes set of matched elements
             * @param {HTMLElement|String} wrapperNode html node or selector to get the node wrapper
             */
            wrapAll: function (wrappedNodes, wrapperNode) {
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
            wrap: function (wrappedNodes, wrapperNode) {
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
            wrapInner: function (wrappedNodes, wrapperNode) {
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
            unwrap: function (wrappedNodes) {
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
            replaceWith: function (selector, newNodes) {
                var nodes = DOM.query(selector);
                newNodes = DOM.query(newNodes);
                DOM.remove(newNodes, true);
                DOM.insertBefore(newNodes, nodes);
                DOM.remove(nodes);
            }
        });
    S.each({
        'prepend': 'prependTo',
        'append': 'appendTo',
        'before': 'insertBefore',
        'after': 'insertAfter'
    }, function (value, key) {
        DOM[key] = DOM[value];
    });
    return DOM;
}, {
    requires: ['./api']
});

/*
 2012-04-05 yiminghe@gmail.com
 - 增加 replaceWith/wrap/wrapAll/wrapInner/unwrap

 2011-05-25
 - yiminghe@gmail.com：参考 jquery 处理多对多的情形 :http://api.jquery.com/append/
 DOM.append('.multi1','.multi2');

 */
/**
 * @ignore
 *  dom-offset
 * @author lifesinger@gmail.com, yiminghe@gmail.com
 */
KISSY.add('dom/base/offset', function (S, DOM, undefined) {

    var win = S.Env.host,
        doc = win.document,
        NodeType = DOM.NodeType,
        docElem = doc && doc.documentElement,
        getWin = DOM.getWindow,
        CSS1Compat = 'CSS1Compat',
        compatMode = 'compatMode',
        MAX = Math.max,
        myParseInt = parseInt,
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
        SCROLL_TOP = SCROLL + 'Top';

    S.mix(DOM,
        /**
         * @override KISSY.DOM
         * @class
         * @singleton
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
             * @return {Object|undefined} if Get, the format of returned value is same with coordinates.
             */
            offset: function (selector, coordinates, relativeWin) {
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
             * scrolls the first of matched elements into container view
             * @param {HTMLElement[]|String|HTMLElement} selector Matched elements
             * @param {String|HTMLElement|HTMLDocument} [container=window] Container element
             * @param {Boolean|Object} [alignWithTop=true]If true, the scrolled element is aligned with the top of the scroll area.
             * If false, it is aligned with the bottom.
             * @param {Boolean} [alignWithTop.allowHorizontalScroll=true] Whether trigger horizontal scroll.
             * @param {Boolean} [alignWithTop.onlyScrollIfNeeded=false] scrollIntoView when element is out of view
             * and set top to false or true automatically if top is undefined
             * @param {Boolean} [allowHorizontalScroll=true] Whether trigger horizontal scroll.
             * refer: http://www.w3.org/TR/2009/WD-html5-20090423/editing.html#scrollIntoView
             *        http://www.sencha.com/deploy/dev/docs/source/Element.scroll-more.html#scrollIntoView
             *        http://yiminghe.javaeye.com/blog/390732
             */
            scrollIntoView: function (selector, container, alignWithTop, allowHorizontalScroll) {
                var elem,
                    onlyScrollIfNeeded;

                if (!(elem = DOM.get(selector))) {
                    return;
                }

                if (container) {
                    container = DOM.get(container);
                }

                if (!container) {
                    container = elem.ownerDocument;
                }

                // document 归一化到 window
                if (container.nodeType == NodeType.DOCUMENT_NODE) {
                    container = getWin(container);
                }

                if (S.isPlainObject(alignWithTop)) {
                    allowHorizontalScroll = alignWithTop.allowHorizontalScroll;
                    onlyScrollIfNeeded = alignWithTop.onlyScrollIfNeeded;
                    alignWithTop = alignWithTop.alignWithTop;
                }

                allowHorizontalScroll = allowHorizontalScroll === undefined ? true : allowHorizontalScroll;

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
                        left: DOM.scrollLeft(win),
                        top: DOM.scrollTop(win)
                    };
                    // elem 相对 container 可视视窗的距离
                    diffTop = {
                        left: elemOffset[LEFT] - winScroll[LEFT],
                        top: elemOffset[TOP] - winScroll[TOP]
                    };
                    diffBottom = {
                        left: elemOffset[LEFT] + ew - (winScroll[LEFT] + ww),
                        top: elemOffset[TOP] + eh - (winScroll[TOP] + wh)
                    };
                    containerScroll = winScroll;
                }
                else {
                    containerOffset = DOM.offset(container);
                    ch = container.clientHeight;
                    cw = container.clientWidth;
                    containerScroll = {
                        left: DOM.scrollLeft(container),
                        top: DOM.scrollTop(container)
                    };
                    // elem 相对 container 可视视窗的距离
                    // 注意边框 , offset 是边框到根节点
                    diffTop = {
                        left: elemOffset[LEFT] - (containerOffset[LEFT] +
                            (myParseInt(DOM.css(container, 'borderLeftWidth')) || 0)),
                        top: elemOffset[TOP] - (containerOffset[TOP] +
                            (myParseInt(DOM.css(container, 'borderTopWidth')) || 0))
                    };
                    diffBottom = {
                        left: elemOffset[LEFT] + ew -
                            (containerOffset[LEFT] + cw +
                                (myParseInt(DOM.css(container, 'borderRightWidth')) || 0)),
                        top: elemOffset[TOP] + eh -
                            (containerOffset[TOP] + ch +
                                (myParseInt(DOM.css(container, 'borderBottomWidth')) || 0))
                    };
                }

                if (onlyScrollIfNeeded) {
                    if (diffTop.top < 0 || diffBottom.top > 0) {
                        // 强制向上
                        if (alignWithTop === true) {
                            DOM.scrollTop(container, containerScroll.top + diffTop.top);
                        } else if (alignWithTop === false) {
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
                } else {
                    alignWithTop = alignWithTop === undefined ? true : !!alignWithTop;
                    if (alignWithTop) {
                        DOM.scrollTop(container, containerScroll.top + diffTop.top);
                    } else {
                        DOM.scrollTop(container, containerScroll.top + diffBottom.top);
                    }
                }

                if (allowHorizontalScroll) {
                    if (onlyScrollIfNeeded) {
                        if (diffTop.left < 0 || diffBottom.left > 0) {
                            // 强制向上
                            if (alignWithTop === true) {
                                DOM.scrollLeft(container, containerScroll.left + diffTop.left);
                            } else if (alignWithTop === false) {
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
                    } else {
                        alignWithTop = alignWithTop === undefined ? true : !!alignWithTop;
                        if (alignWithTop) {
                            DOM.scrollLeft(container, containerScroll.left + diffTop.left);
                        } else {
                            DOM.scrollLeft(container, containerScroll.left + diffBottom.left);
                        }
                    }
                }
            },
            /**
             * Get the width of document
             * @param {window} [win=window] Window to be referred.
             * @method
             */
            docWidth: 0,
            /**
             * Get the height of document
             * @param {window} [win=window] Window to be referred.
             * @method
             */
            docHeight: 0,
            /**
             * Get the height of window
             * @param {window} [win=window] Window to be referred.
             * @method
             */
            viewportHeight: 0,
            /**
             * Get the width of document
             * @param {window} [win=window] Window to be referred.
             * @method
             */
            viewportWidth: 0,
            /**
             * Get the current vertical position of the scroll bar for the first element in the set of matched elements.
             * or
             * Set the current vertical position of the scroll bar for each of the set of matched elements.
             * @param {HTMLElement[]|String|HTMLElement|window} selector matched elements
             * @param {Number} value An integer indicating the new position to set the scroll bar to.
             * @method
             */
            scrollTop: 0,
            /**
             * Get the current horizontal position of the scroll bar for the first element in the set of matched elements.
             * or
             * Set the current horizontal position of the scroll bar for each of the set of matched elements.
             * @param {HTMLElement[]|String|HTMLElement|window} selector matched elements
             * @param {Number} value An integer indicating the new position to set the scroll bar to.
             * @method
             */
            scrollLeft: 0
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
                left,
                top,
                w = getWin(elem),
                d;
            if (w) {
                if (v !== undefined) {
                    v = parseFloat(v);
                    // 注意多 window 情况，不能简单取 win
                    left = name == 'Left' ? v : DOM.scrollLeft(w);
                    top = name == 'Top' ? v : DOM.scrollTop(w);
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
            } else if (elem.nodeType == NodeType.ELEMENT_NODE) {
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
        }
    });

    function getClientPosition(elem) {
        var box, x , y ,
            doc = elem.ownerDocument,
            body = doc.body;

        if (!elem.getBoundingClientRect) {
            return {
                left: 0,
                top: 0
            };
        }

        // 根据 GBS 最新数据，A-Grade Browsers 都已支持 getBoundingClientRect 方法，不用再考虑传统的实现方式
        box = elem.getBoundingClientRect();

        // 注：jQuery 还考虑减去 docElem.clientLeft/clientTop
        // 但测试发现，这样反而会导致当 html 和 body 有边距/边框样式时，获取的值不正确
        // 此外，ie6 会忽略 html 的 margin 值，幸运地是没有谁会去设置 html 的 margin

        x = box[LEFT];
        y = box[TOP];

        // In IE, most of the time, 2 extra pixels are added to the top and left
        // due to the implicit 2-pixel inset border.  In IE6/7 quirks mode and
        // IE6 standards mode, this border can be overridden by setting the
        // document element's border to zero -- thus, we cannot rely on the
        // offset always being 2 pixels.

        // In quirks mode, the offset can be determined by querying the body's
        // clientLeft/clientTop, but in standards mode, it is found by querying
        // the document element's clientLeft/clientTop.  Since we already called
        // getClientBoundingRect we have already forced a reflow, so it is not
        // too expensive just to query them all.

        // ie 下应该减去窗口的边框吧，毕竟默认 absolute 都是相对窗口定位的
        // 窗口边框标准是设 documentElement ,quirks 时设置 body
        // 最好禁止在 body 和 html 上边框 ，但 ie < 9 html 默认有 2px ，减去
        // 但是非 ie 不可能设置窗口边框，body html 也不是窗口 ,ie 可以通过 html,body 设置
        // 标准 ie 下 docElem.clientTop 就是 border-top
        // ie7 html 即窗口边框改变不了。永远为 2
        // 但标准 firefox/chrome/ie9 下 docElem.clientTop 是窗口边框，即使设了 border-top 也为 0

        x -= docElem.clientLeft || body.clientLeft || 0;
        y -= docElem.clientTop || body.clientTop || 0;

        return { left: x, top: y };
    }


    function getPageOffset(el) {
        var pos = getClientPosition(el),
            w = getWin(el[OWNER_DOCUMENT]);
        pos.left += DOM[SCROLL_LEFT](w);
        pos.top += DOM[SCROLL_TOP](w);
        return pos;
    }

    // 获取 elem 相对 elem.ownerDocument 的坐标
    function getOffset(el, relativeWin) {
        var position = {left: 0, top: 0},

        // Iterate up the ancestor frame chain, keeping track of the current window
        // and the current element in that window.
            currentWin = getWin(el[OWNER_DOCUMENT]),
            offset,
            currentEl = el;
        relativeWin = relativeWin || currentWin;

        do {
            // if we're at the top window, we want to get the page offset.
            // if we're at an inner frame, we only want to get the window position
            // so that we can determine the actual page offset in the context of
            // the outer window.
            offset = currentWin == relativeWin ?
                getPageOffset(currentEl) :
                getClientPosition(currentEl);
            position.left += offset.left;
            position.top += offset.top;
        } while (currentWin &&
            currentWin != relativeWin &&
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

        var old = getOffset(elem),
            ret = { },
            current, key;

        for (key in offset) {
            current = myParseInt(DOM.css(elem, key), 10) || 0;
            ret[key] = current + offset[key] - old[key];
        }
        DOM.css(elem, ret);
    }

    return DOM;
}, {
    requires: ['./api']
});

/*
 2012-03-30
 - refer: http://www.softcomplex.com/docs/get_window_size_and_scrollbar_position.html
 - http://help.dottoro.com/ljkfqbqj.php
 - http://www.boutell.com/newfaq/creating/sizeofclientarea.html

 2011-05-24
 - yiminghe@gmail.com：
 - 调整 docWidth , docHeight ,
 viewportHeight , viewportWidth ,scrollLeft,scrollTop 参数，
 便于放置到 Node 中去，可以完全摆脱 DOM，完全使用 Node


 TODO:
 - 考虑是否实现 jQuery 的 position, offsetParent 等功能
 - 更详细的测试用例（比如：测试 position 为 fixed 的情况）
 */
/**
 * @ignore
 *  selector
 * @author yiminghe@gmail.com, lifesinger@gmail.com
 */
KISSY.add('dom/base/selector', function (S, DOM, undefined) {

    var doc = S.Env.host.document,
        NodeType = DOM.NodeType,
        filter = S.filter,
        require = function (selector) {
            return S.require(selector);
        },
        isArray = S.isArray,
        makeArray = S.makeArray,
        isNodeList = DOM._isNodeList,
        getNodeName = DOM.nodeName,
        push = Array.prototype.push,
        SPACE = ' ',
        COMMA = ',',
        trim = S.trim,
        RE_ID = /^#[\w-]+$/,
        RE_QUERY = /^(?:#([\w-]+))?\s*([\w-]+|\*)?\.?([\w-]+)?$/;

    function query_each(f) {
        var self = this,
            el, i;
        for (i = 0; i < self.length; i++) {
            el = self[i];
            if (f(el, i) === false) {
                break;
            }
        }
    }

    function query(selector, context) {
        var ret,
            i,
            simpleContext,
            isSelectorString = typeof selector == 'string',
        // optimize common usage
        // consider context == null
            contexts = (context == undefined && (simpleContext = 1)) ?
                [doc] :
                query(context);
        // 常见的空
        if (!selector) {
            ret = [];
        }
        // 常见的选择器
        // DOM.query('#x')
        else if (isSelectorString) {
            selector = trim(selector);
            // shortcut
            if (simpleContext && selector == 'body') {
                ret = [doc.body]
            } else if (contexts.length == 1 && selector) {
                ret = quickFindBySelectorStr(selector, contexts[0]);
            }
        }
        // 不写 context，就是包装一下
        else if (simpleContext) {
            // 1.常见的单个元素
            // DOM.query(document.getElementById('xx'))
            if (selector['nodeType'] || selector['setTimeout']) {
                ret = [selector];
            }
            // 2.KISSY NodeList 特殊点直接返回，提高性能
            else if (selector['getDOMNodes']) {
                ret = selector['getDOMNodes']();
            }
            // 3.常见的数组
            // var x=DOM.query('.l');
            // DOM.css(x,'color','red');
            else if (isArray(selector)) {
                ret = selector;
            }
            // 4.selector.item
            // DOM.query(document.getElementsByTagName('a'))
            // note:
            // document.createElement('select').item 已经在 1 处理了
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
                    DOM.unique(ret);
                }
            }
        }

        // attach each method
        ret.each = query_each;

        return ret;
    }

    function queryByContexts(selector, context) {
        var ret = [],
            isSelectorString = typeof selector == 'string';
        if (isSelectorString && selector.match(RE_QUERY) || !isSelectorString) {
            // 简单选择器自己处理
            ret = queryBySimple(selector, context);
        }
        // 如果选择器有, 分开递归一部分一部分来
        else if (isSelectorString &&
            // #255
            // [data-key='a,b']
            selector
                .replace(/"(?:(?:\\.)|[^"])*"/g, '')
                .replace(/'(?:(?:\\.)|[^'])*'/g, '').indexOf(COMMA) > -1) {
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
            sizzle = require('sizzle');
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
        if (RE_ID.test(selector)) {
            t = getElementById(selector.slice(1), context);
            // #id 无效时，返回空数组
            ret = t ? [t] : [];
        }
        // selector 为支持列表中的其它 6 种
        else {
            match = RE_QUERY.exec(selector);
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
                            ret = [].concat(DOM._getElementsByClassName(cls, tag, context));
                        }
                        // 处理 #id.cls
                        else {
                            t = getElementById(id, context);
                            if (hasSingleClass(t, cls)) {
                                ret = [t];
                            }
                        }
                    }
                    // #id tag | tag
                    else if (tag) { // 排除空白字符串
                        ret = makeArray(DOM._getElementsByTagName(tag, context));
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
            isSelectorString = typeof selector == 'string';
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
        return DOM._contains(context, element);
    }

    // throw exception
    function error(msg) {
        S.error('Unsupported selector: ' + msg);
    }

    // query #id
    function getElementById(id, context) {
        var contextIsDocument = context.nodeType == NodeType.DOCUMENT_NODE,
            doc = contextIsDocument ? context : context.ownerDocument;
        return DOM._getElementById(id, context, doc, contextIsDocument);
    }

    function hasSingleClass(el, cls) {
        var className = el && el.className;
        return className && (SPACE + className + SPACE).indexOf(SPACE + cls + SPACE) > -1;
    }

    function getAttr(el, name) {
        var ret = el && el.getAttributeNode(name);
        return ret && ret.nodeValue;
    }

    S.mix(DOM,
        /**
         * @override KISSY.DOM
         * @class
         * @singleton
         */
        {
            _getAttr: getAttr,
            _hasSingleClass: hasSingleClass,

            _getElementById: function (id, context, doc, contextIsDocument) {
                var el = doc.getElementById(id);
                // ie confuse name with id
                // https://github.com/kissyteam/kissy/issues/67
                // 不能直接 el.id ，否则 input shadow form attribute
                var elId = DOM._getAttr(el, 'id');
                if (!el && !contextIsDocument && !DOM._contains(doc, context)
                    || el && elId != id) {
                    return DOM.filter('*', '#' + id, context)[0] || null;
                } else if (contextIsDocument || el && DOM._contains(context, el)) {
                    return el;
                }
                return null;
            },

            _getElementsByTagName: function (tag, context) {
                return context.getElementsByTagName(tag);
            },

            _getElementsByClassName: function (cls, tag, context) {
                // ie8 return staticNodeList 对象,[].concat 会形成 [ staticNodeList ] ，手动转化为普通数组
                return  makeArray(context.querySelectorAll((tag || '') + '.' + cls));
            },

            // 貌似除了 ie 都有了...
            _compareNodeOrder: function (a, b) {
                if (!a.compareDocumentPosition || !b.compareDocumentPosition) {
                    return a.compareDocumentPosition ? -1 : 1;
                }

                return a.compareDocumentPosition(b) & 4 ? -1 : 1;
            },

            /**
             * Accepts a string containing a CSS selector which is then used to match a set of elements.
             * @param {String|HTMLElement[]} selector
             * A string containing a selector expression.
             * or
             * array of HTMLElements.
             * @param {String|HTMLElement[]|HTMLDocument|HTMLElement} [context] context under which to find elements matching selector.
             * @return {HTMLElement[]} The array of found HTMLElements
             * @method
             */
            query: query,

            /**
             * Accepts a string containing a CSS selector which is then used to match a set of elements.
             * @param {String|HTMLElement[]} selector
             * A string containing a selector expression.
             * or
             * array of HTMLElements.
             * @param {String|HTMLElement[]|HTMLDocument|HTMLElement|window} [context] context under which to find elements matching selector.
             * @return {HTMLElement} The first of found HTMLElements
             */
            get: function (selector, context) {
                return query(selector, context)[0] || null;
            },

            /**
             * Sorts an array of DOM elements, in place, with the duplicates removed.
             * Note that this only works on arrays of DOM elements, not strings or numbers.
             * @param {HTMLElement[]} The Array of DOM elements.
             * @method
             * @return {HTMLElement[]}
             * @member KISSY.DOM
             */
            unique: (function () {
                var hasDuplicate,
                    baseHasDuplicate = true;

                // Here we check if the JavaScript engine is using some sort of
                // optimization where it does not always call our comparison
                // function. If that is the case, discard the hasDuplicate value.
                // Thus far that includes Google Chrome.
                [0, 0].sort(function () {
                    baseHasDuplicate = false;
                    return 0;
                });

                function sortOrder(a, b) {
                    if (a == b) {
                        hasDuplicate = true;
                        return 0;
                    }

                    return DOM._compareNodeOrder(a, b);
                }

                // 排序去重
                return function (elements) {

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

                    return elements;
                };
            })(),

            /**
             * Reduce the set of matched elements to those that match the selector or pass the function's test.
             * @param {String|HTMLElement[]} selector Matched elements
             * @param {String|Function} filter Selector string or filter function
             * @param {String|HTMLElement[]|HTMLDocument} [context] Context under which to find matched elements
             * @return {HTMLElement[]}
             * @member KISSY.DOM
             */
            filter: function (selector, filter, context) {
                var elems = query(selector, context),
                    sizzle = require('sizzle'),
                    match,
                    tag,
                    id,
                    cls,
                    ret = [];

                // 默认仅支持最简单的 tag.cls 或 #id 形式
                if (typeof filter == 'string' &&
                    (filter = trim(filter)) &&
                    (match = RE_QUERY.exec(filter))) {
                    id = match[1];
                    tag = match[2];
                    cls = match[3];
                    if (!id) {
                        filter = function (elem) {
                            var tagRe = true, clsRe = true;

                            // 指定 tag 才进行判断
                            if (tag) {
                                tagRe = getNodeName(elem) == tag.toLowerCase();
                            }

                            // 指定 cls 才进行判断
                            if (cls) {
                                clsRe = hasSingleClass(elem, cls);
                            }

                            return clsRe && tagRe;
                        }
                    } else if (id && !tag && !cls) {
                        filter = function (elem) {
                            return getAttr(elem, 'id') == id;
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
             * @param {String|HTMLElement[]|HTMLDocument} [context] Context under which to find matched elements
             * @return {Boolean}
             * @member KISSY.DOM
             */
            test: function (selector, filter, context) {
                var elements = query(selector, context);
                return elements.length && (DOM.filter(elements, filter, context).length === elements.length);
            }
        });

    return DOM;
}, {
    requires: ['./api']
});

/*
 NOTES:

 2012.12.26
 - 尽量用原生方法提高性能

 2011.08.02
 - 利用 sizzle 重构选择器
 - 1.1.6 修正，原来 context 只支持 #id 以及 document
 1.2 context 支持任意，和 selector 格式一致
 - 简单选择器也和 jquery 保持一致 DOM.query('xx','yy') 支持
 - context 不提供则为当前 document ，否则通过 query 递归取得
 - 保证选择出来的节点（除了 document window）都是位于 context 范围内


 2010.01
 - 对 reg exec 的结果(id, tag, className)做 cache, 发现对性能影响很小，去掉。
 - getElementById 使用频率最高，使用直达通道优化。
 - getElementsByClassName 性能优于 querySelectorAll, 但 IE 系列不支持。
 - instanceof 对性能有影响。
 - 内部方法的参数，比如 cls, context 等的异常情况，已经在 query 方法中有保证，无需冗余“防卫”。
 - query 方法中的条件判断考虑了“频率优先”原则。最有可能出现的情况放在前面。
 - Array 的 push 方法可以用 j++ 来替代，性能有提升。
 - 返回值策略和 Sizzle 一致，正常时，返回数组；其它所有情况，返回空数组。

 - 从压缩角度考虑，还可以将 getElementsByTagName 和 getElementsByClassName 定义为常量，
 不过感觉这样做太“压缩控”，还是保留不替换的好。

 - 调整 getElementsByClassName 的降级写法，性能最差的放最后。

 2010.02
 - 添加对分组选择器的支持（主要参考 Sizzle 的代码，代去除了对非 Grade A 级浏览器的支持）

 2010.03
 - 基于原生 dom 的两个 api: S.query 返回数组; S.get 返回第一个。
 基于 Node 的 api: S.one, 在 Node 中实现。
 基于 NodeList 的 api: S.all, 在 NodeList 中实现。
 通过 api 的分层，同时满足初级用户和高级用户的需求。

 2010.05
 - 去掉给 S.query 返回值默认添加的 each 方法，保持纯净。
 - 对于不支持的 selector, 采用外部耦合进来的 Selector.

 2010.06
 - 增加 filter 和 test 方法

 2010.07
 - 取消对 , 分组的支持，group 直接用 Sizzle

 2010.08
 - 给 S.query 的结果 attach each 方法

 2011.05
 - yiminghe@gmail.com：恢复对简单分组支持

 Ref: http://ejohn.org/blog/selectors-that-people-actually-use/
 考虑 2/8 原则，仅支持以下选择器：
 #id
 tag
 .cls
 #id tag
 #id .cls
 tag.cls
 #id tag.cls
 注 1：RE_QUERY 还会匹配 #id.cls
 注 2：tag 可以为 * 字符
 注 3: 支持 , 号分组


 Bugs:
 - S.query('#test-data *') 等带 * 号的选择器，在 IE6 下返回的值不对。jQuery 等类库也有此 bug, 诡异。

 References:
 - http://ejohn.org/blog/selectors-that-people-actually-use/
 - http://ejohn.org/blog/thoughts-on-queryselectorall/
 - MDC: querySelector, querySelectorAll, getElementsByClassName
 - Sizzle: http://github.com/jeresig/sizzle
 - MINI: http://james.padolsey.com/javascript/mini/
 - Peppy: http://jamesdonaghue.com/?p=40
 - Sly: http://github.com/digitarald/sly
 - XPath, TreeWalker：http://www.cnblogs.com/rubylouvre/archive/2009/07/24/1529640.html

 - http://www.quirksmode.org/blog/archives/2006/01/contains_for_mo.html
 - http://www.quirksmode.org/dom/getElementsByTagNames.html
 - http://ejohn.org/blog/comparing-document-position/
 - http://github.com/jeresig/sizzle/blob/master/sizzle.js
 */
/**
 * @ignore
 *  dom/style
 * @author yiminghe@gmail.com, lifesinger@gmail.com
 */
KISSY.add('dom/base/style', function (S, DOM, undefined) {
    var WINDOW = S.Env.host,
        UA = S.UA,
        getNodeName = DOM.nodeName,
        doc = WINDOW.document,
        STYLE = 'style',
        FLOAT = 'float',
        RE_MARGIN = /^margin/,
        WIDTH = 'width',
        HEIGHT = 'height',
        AUTO = 'auto',
        DISPLAY = 'display',
        OLD_DISPLAY = DISPLAY + S.now(),
        NONE = 'none',
        myParseInt = parseInt,
        cssNumber = {
            'fillOpacity': 1,
            'fontWeight': 1,
            'lineHeight': 1,
            'opacity': 1,
            'orphans': 1,
            'widows': 1,
            'zIndex': 1,
            'zoom': 1
        },
        rmsPrefix = /^-ms-/,
        RE_DASH = /-([a-z])/ig,
        CAMEL_CASE_FN = function (all, letter) {
            return letter.toUpperCase();
        },
    // 考虑 ie9 ...
        R_UPPER = /([A-Z]|^ms)/g,
        EMPTY = '',
        DEFAULT_UNIT = 'px',
        CUSTOM_STYLES = {},
        cssProps = {},
        defaultDisplay = {};

    cssProps[FLOAT] = 'cssFloat';

    function camelCase(name) {
        // fix #92, ms!
        return name.replace(rmsPrefix, 'ms-').replace(RE_DASH, CAMEL_CASE_FN);
    }

    function getDefaultDisplay(tagName) {
        var body,
            oldDisplay = defaultDisplay[ tagName ],
            elem;
        if (!defaultDisplay[ tagName ]) {
            body = doc.body || doc.documentElement;
            elem = doc.createElement(tagName);
            // note: do not change default tag display!
            DOM.prepend(elem, body);
            oldDisplay = DOM.css(elem, 'display');
            body.removeChild(elem);
            // Store the correct default display
            defaultDisplay[ tagName ] = oldDisplay;
        }
        return oldDisplay;
    }

    S.mix(DOM,
        /**
         * @override KISSY.DOM
         * @class
         * @singleton
         */
        {
            _camelCase: camelCase,

            _CUSTOM_STYLES: CUSTOM_STYLES,

            _cssProps: cssProps,

            _getComputedStyle: function (elem, name) {
                var val = '',
                    computedStyle,
                    width,
                    minWidth,
                    maxWidth,
                    style,
                    d = elem.ownerDocument;

                name = name.replace(R_UPPER, '-$1').toLowerCase();

                // https://github.com/kissyteam/kissy/issues/61
                if (computedStyle = d.defaultView.getComputedStyle(elem, null)) {
                    val = computedStyle.getPropertyValue(name) || computedStyle[name];
                }

                // 还没有加入到 document，就取行内
                if (val === '' && !DOM.contains(d, elem)) {
                    name = cssProps[name] || name;
                    val = elem[STYLE][name];
                }

                // Safari 5.1 returns percentage for margin
                if (DOM._RE_NUM_NO_PX.test(val) && RE_MARGIN.test(name)) {
                    style = elem.style;
                    width = style.width;
                    minWidth = style.minWidth;
                    maxWidth = style.maxWidth;

                    style.minWidth = style.maxWidth = style.width = val;
                    val = computedStyle.width;

                    style.width = width;
                    style.minWidth = minWidth;
                    style.maxWidth = maxWidth;
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
             *  @return {undefined|String}
             */
            style: function (selector, name, val) {
                var els = DOM.query(selector),
                    k,
                    ret,
                    elem = els[0], i;
                // supports hash
                if (S.isPlainObject(name)) {
                    for (k in name) {
                        for (i = els.length - 1; i >= 0; i--) {
                            style(els[i], k, name[k]);
                        }
                    }
                    return undefined;
                }
                if (val === undefined) {
                    ret = '';
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
             * @param {HTMLElement[]|String|HTMLElement} selector 选择器或节点或节点数组
             * @param {String|Object} name A CSS property. or A map of property-value pairs to set.
             * @param [val] A value to set for the property.
             * @return {undefined|String}
             */
            css: function (selector, name, val) {
                var els = DOM.query(selector),
                    elem = els[0],
                    k,
                    hook,
                    ret,
                    i;
                // supports hash
                if (S.isPlainObject(name)) {
                    for (k in name) {
                        for (i = els.length - 1; i >= 0; i--) {
                            style(els[i], k, name[k]);
                        }
                    }
                    return undefined;
                }

                name = camelCase(name);
                hook = CUSTOM_STYLES[name];
                // getter
                if (val === undefined) {
                    // supports css selector/Node/NodeList
                    ret = '';
                    if (elem) {
                        // If a hook was provided get the computed value from there
                        if (hook && 'get' in hook && (ret = hook.get(elem, true)) !== undefined) {
                        } else {
                            ret = DOM._getComputedStyle(elem, name);
                        }
                    }
                    return ret === /**@type String
                     @ignore*/undefined ? '' : ret;
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
            show: function (selector) {
                var els = DOM.query(selector),
                    tagName,
                    old,
                    elem, i;
                for (i = els.length - 1; i >= 0; i--) {
                    elem = els[i];
                    elem[STYLE][DISPLAY] = DOM.data(elem, OLD_DISPLAY) || EMPTY;
                    // 可能元素还处于隐藏状态，比如 css 里设置了 display: none
                    if (DOM.css(elem, DISPLAY) === NONE) {
                        tagName = elem.tagName.toLowerCase();
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
            hide: function (selector) {
                var els = DOM.query(selector),
                    elem, i;
                for (i = els.length - 1; i >= 0; i--) {
                    elem = els[i];
                    var style = elem[STYLE],
                        old = style[DISPLAY];
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
            toggle: function (selector) {
                var els = DOM.query(selector),
                    elem, i;
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
             * @param {String} [cssText] The text containing the css rules
             * @param {String} [id] An id to add to the stylesheet for later removal
             */
            addStyleSheet: function (refWin, cssText, id) {
                refWin = refWin || WINDOW;

                if (typeof refWin == 'string') {
                    id = cssText;
                    cssText = /**@type String
                     @ignore*/refWin;
                    refWin = WINDOW;
                }

                refWin = DOM.get(refWin);

                var win = DOM.getWindow(refWin),
                    doc = win.document,
                    elem;

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

            /**
             * Make matched elements unselectable
             * @param {HTMLElement[]|String|HTMLElement} selector  Matched elements.
             */
            unselectable: function (selector) {
                var _els = DOM.query(selector), elem, j,
                    e,
                    i = 0,
                    excludes,
                    els;
                for (j = _els.length - 1; j >= 0; j--) {
                    elem = _els[j];
                    if (UA['gecko']) {
                        elem[STYLE]['MozUserSelect'] = 'none';
                    } else if (UA['webkit']) {
                        elem[STYLE]['KhtmlUserSelect'] = 'none';
                    } else if (UA['ie'] || UA['opera']) {
                        els = elem.getElementsByTagName('*');
                        elem.setAttribute('unselectable', 'on');
                        excludes = ['iframe', 'textarea', 'input', 'select'];
                        while (e = els[i++]) {
                            if (!S.inArray(getNodeName(e), excludes)) {
                                e.setAttribute('unselectable', 'on');
                            }
                        }
                    }

                }
            },

            /**
             * Get the current computed width for the first element in the set of matched elements, including padding but not border.
             * @method
             * @param {HTMLElement[]|String|HTMLElement} selector Matched elements
             * @return {Number}
             */
            innerWidth: 0,
            /**
             * Get the current computed height for the first element in the set of matched elements, including padding but not border.
             * @method
             * @param {HTMLElement[]|String|HTMLElement} selector Matched elements
             * @return {Number}
             */
            innerHeight: 0,
            /**
             *  Get the current computed width for the first element in the set of matched elements, including padding and border, and optionally margin.
             * @method
             * @param {HTMLElement[]|String|HTMLElement} selector Matched elements
             * @param {Boolean} [includeMargin] A Boolean indicating whether to include the element's margin in the calculation.
             * @return {Number}
             */
            outerWidth: 0,
            /**
             * Get the current computed height for the first element in the set of matched elements, including padding, border, and optionally margin.
             * @method
             * @param {HTMLElement[]|String|HTMLElement} selector Matched elements
             * @param {Boolean} [includeMargin] A Boolean indicating whether to include the element's margin in the calculation.
             * @return {Number}
             */
            outerHeight: 0,
            /**
             * Get the current computed width for the first element in the set of matched elements.
             * or
             * Set the CSS width of each element in the set of matched elements.
             * @method
             * @param {HTMLElement[]|String|HTMLElement} selector Matched elements
             * @param {String|Number} [value]
             * An integer representing the number of pixels, or an integer along with an optional unit of measure appended (as a string).
             * @return {Number|undefined}
             */
            width: 0,
            /**
             * Get the current computed height for the first element in the set of matched elements.
             * or
             * Set the CSS height of each element in the set of matched elements.
             * @method
             * @param {HTMLElement[]|String|HTMLElement} selector Matched elements
             * @param {String|Number} [value]
             * An integer representing the number of pixels, or an integer along with an optional unit of measure appended (as a string).
             * @return {Number|undefined}
             */
            height: 0
        });

    S.each([WIDTH, HEIGHT], function (name) {
        DOM['inner' + S.ucfirst(name)] = function (selector) {
            var el = DOM.get(selector);
            return el && getWHIgnoreDisplay(el, name, 'padding');
        };

        DOM['outer' + S.ucfirst(name)] = function (selector, includeMargin) {
            var el = DOM.get(selector);
            return el && getWHIgnoreDisplay(el, name, includeMargin ? 'margin' : 'border');
        };

        DOM[name] = function (selector, val) {
            var ret = DOM.css(selector, name, val);
            if (ret) {
                ret = parseFloat(ret);
            }
            return ret;
        };
    });

    var cssShow = { position: 'absolute', visibility: 'hidden', display: 'block' };

    /*
     css height,width 永远都是计算值
     */
    S.each(['height', 'width'], function (name) {
        /**
         * @ignore
         */
        CUSTOM_STYLES[ name ] = {
            /**
             * @ignore
             */
            get: function (elem, computed) {
                if (computed) {
                    return getWHIgnoreDisplay(elem, name) + 'px';
                }
                return undefined;
            }
        };
    });

    S.each(['left', 'top'], function (name) {

        CUSTOM_STYLES[ name ] = {
            get: function (elem, computed) {
                var val, offset;
                if (computed) {
                    val = DOM._getComputedStyle(elem, name);

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
                            if (UA.ie && (doc['documentMode'] || 0) < 9 || UA['opera']) {
                                // 类似 offset ie 下的边框处理
                                // 如果 offsetParent 为 html ，需要减去默认 2 px == documentElement.clientTop
                                // 否则减去 borderTop 其实也是 clientTop
                                // http://msdn.microsoft.com/en-us/library/aa752288%28v=vs.85%29.aspx
                                // ie<9 注意有时候 elem.offsetParent 为 null ...
                                // 比如 DOM.append(DOM.create('<div class='position:absolute'></div>'),document.body)
                                offset -= elem.offsetParent && elem.offsetParent['client' + (name == 'left' ? 'Left' : 'Top')]
                                    || 0;
                            }
                            val = offset - (myParseInt(DOM.css(elem, 'margin-' + name)) || 0);
                        }
                        val += 'px';
                    }
                }
                return val;
            }
        };
    });

    function swap(elem, options, callback) {
        var old = {}, name;

        // Remember the old values, and insert the new ones
        for (name in options) {
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
        var style,
            ret,
            hook;
        if (elem.nodeType === 3 || elem.nodeType === 8 || !(style = elem[STYLE])) {
            return undefined;
        }
        name = camelCase(name);
        hook = CUSTOM_STYLES[name];
        name = cssProps[name] || name;
        // setter
        if (val !== undefined) {
            // normalize unset
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
                    // EMPTY will unset style!
                    style[name] = val;
                } catch (e) {
                    S.log('css set error :' + e);
                }
                // #80 fix,font-family
                if (val === EMPTY && style.removeAttribute) {
                    style.removeAttribute(name);
                }
            }
            if (!style.cssText) {
                // weird for chrome, safari is ok?
                // https://github.com/kissyteam/kissy/issues/231
                UA.webkit && (style = elem.outerHTML);
                elem.removeAttribute('style');
            }
            return undefined;
        }
        //getter
        else {
            // If a hook was provided get the non-computed value from there
            if (hook && 'get' in hook && (ret = hook.get(elem, false)) !== undefined) {

            } else {
                // Otherwise just get the value from the style object
                ret = style[ name ];
            }
            return ret === undefined ? '' : ret;
        }
    }

    // fix #119 : https://github.com/kissyteam/kissy/issues/119
    function getWHIgnoreDisplay(elem) {
        var val, args = arguments;
        // in case elem is window
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


    /*
     得到元素的大小信息
     @param elem
     @param name
     @param {String} [extra]  'padding' : (css width) + padding
     'border' : (css width) + padding + border
     'margin' : (css width) + padding + border + margin
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
            if (extra !== 'border') {
                S.each(which, function (w) {
                    if (!extra) {
                        val -= parseFloat(DOM.css(elem, 'padding' + w)) || 0;
                    }
                    if (extra === 'margin') {
                        val += parseFloat(DOM.css(elem, extra + w)) || 0;
                    } else {
                        val -= parseFloat(DOM.css(elem, 'border' + w + 'Width')) || 0;
                    }
                });
            }

            return val;
        }

        // Fall back to computed then un computed css if necessary
        val = DOM._getComputedStyle(elem, name);
        if (val == null || (Number(val)) < 0) {
            val = elem.style[ name ] || 0;
        }
        // Normalize '', auto, and prepare for extra
        val = parseFloat(val) || 0;

        // Add padding, border, margin
        if (extra) {
            S.each(which, function (w) {
                val += parseFloat(DOM.css(elem, 'padding' + w)) || 0;
                if (extra !== 'padding') {
                    val += parseFloat(DOM.css(elem, 'border' + w + 'Width')) || 0;
                }
                if (extra === 'margin') {
                    val += parseFloat(DOM.css(elem, extra + w)) || 0;
                }
            });
        }

        return val;
    }

    return DOM;
}, {
    requires: ['./api']
});

/*
 2011-12-21
 - backgroundPositionX, backgroundPositionY firefox/w3c 不支持
 - w3c 为准，这里不 fix 了


 2011-08-19
 - 调整结构，减少耦合
 - fix css('height') == auto

 NOTES:
 - Opera 下，color 默认返回 #XXYYZZ, 非 rgb(). 目前 jQuery 等类库均忽略此差异，KISSY 也忽略。
 - Safari 低版本，transparent 会返回为 rgba(0, 0, 0, 0), 考虑低版本才有此 bug, 亦忽略。


 - getComputedStyle 在 webkit 下，会舍弃小数部分，ie 下会四舍五入，gecko 下直接输出 float 值。

 - color: blue 继承值，getComputedStyle, 在 ie 下返回 blue, opera 返回 #0000ff, 其它浏览器
 返回 rgb(0, 0, 255)

 - 总之：要使得返回值完全一致是不大可能的，jQuery/ExtJS/KISSY 未“追求完美”。YUI3 做了部分完美处理，但
 依旧存在浏览器差异。
 */
/**
 * @ignore
 *  dom-traversal
 * @author lifesinger@gmail.com, yiminghe@gmail.com
 */
KISSY.add('dom/base/traversal', function (S, DOM, undefined) {

    var NodeType = DOM.NodeType,
        CONTAIN_MASK = 16;

    S.mix(DOM,
        /**
         * @override KISSY.DOM
         * @class
         * @singleton
         */
        {

            _contains: function (a, b) {
                return !!(a.compareDocumentPosition(b) & CONTAIN_MASK);
            },

            /**
             * Get the first element that matches the filter,
             * beginning at the first element of matched elements and progressing up through the DOM tree.
             * @param {HTMLElement[]|String|HTMLElement} selector Matched elements
             * @param {String|Function|String[]|Function[]} filter Selector string or filter function or array
             * @param {HTMLElement|String|HTMLDocument|HTMLElement[]} [context] Search bound element
             * @return {HTMLElement|HTMLElement[]}
             *  if filter is array, return all ancestors (include this) which match filter.
             *  else return closest parent (include this) which matches filter.
             */
            closest: function (selector, filter, context, allowTextNode) {
                return nth(selector, filter, 'parentNode', function (elem) {
                    return elem.nodeType != NodeType.DOCUMENT_FRAGMENT_NODE;
                }, context, true, allowTextNode);
            },

            /**
             * Get the parent of the first element in the current set of matched elements, optionally filtered by a selector.
             * @param {HTMLElement[]|String|HTMLElement} selector Matched elements
             * @param {String|Function|String[]|Function[]} [filter] Selector string or filter function or array
             * @param {HTMLElement|String|HTMLDocument|HTMLElement[]} [context] Search bound element
             * @return {HTMLElement|HTMLElement[]}
             *  if filter is array, return all ancestors which match filter.
             *  else return closest parent which matches filter.
             */
            parent: function (selector, filter, context) {
                return nth(selector, filter, 'parentNode', function (elem) {
                    return elem.nodeType != NodeType.DOCUMENT_FRAGMENT_NODE;
                }, context, undefined);
            },

            /**
             * Get the first child of the first element in the set of matched elements.
             * If a filter is provided, it retrieves the next child only if it matches that filter.
             * @param {HTMLElement[]|String|HTMLElement} selector Matched elements
             * @param {String|Function} [filter] Selector string or filter function
             * @return {HTMLElement}
             */
            first: function (selector, filter, allowTextNode) {
                var elem = DOM.get(selector);
                return nth(elem && elem.firstChild, filter, 'nextSibling',
                    undefined, undefined, true, allowTextNode);
            },

            /**
             * Get the last child of the first element in the set of matched elements.
             * If a filter is provided, it retrieves the previous child only if it matches that filter.
             * @param {HTMLElement[]|String|HTMLElement} selector Matched elements
             * @param {String|Function} [filter] Selector string or filter function
             * @return {HTMLElement}
             */
            last: function (selector, filter, allowTextNode) {
                var elem = DOM.get(selector);
                return nth(elem && elem.lastChild, filter, 'previousSibling',
                    undefined, undefined, true, allowTextNode);
            },

            /**
             * Get the immediately following sibling of the first element in the set of matched elements.
             * If a filter is provided, it retrieves the next child only if it matches that filter.
             * @param {HTMLElement[]|String|HTMLElement} selector Matched elements
             * @param {String|Function} [filter] Selector string or filter function
             * @return {HTMLElement}
             */
            next: function (selector, filter, allowTextNode) {
                return nth(selector, filter, 'nextSibling', undefined,
                    undefined, undefined, allowTextNode);
            },

            /**
             * Get the immediately preceding  sibling of the first element in the set of matched elements.
             * If a filter is provided, it retrieves the previous child only if it matches that filter.
             * @param {HTMLElement[]|String|HTMLElement} selector Matched elements
             * @param {String|Function} [filter] Selector string or filter function
             * @return {HTMLElement}
             */
            prev: function (selector, filter, allowTextNode) {
                return nth(selector, filter, 'previousSibling',
                    undefined, undefined, undefined, allowTextNode);
            },

            /**
             * Get the siblings of the first element in the set of matched elements, optionally filtered by a filter.
             * @param {HTMLElement[]|String|HTMLElement} selector Matched elements
             * @param {String|Function} [filter] Selector string or filter function
             * @return {HTMLElement[]}
             */
            siblings: function (selector, filter, allowTextNode) {
                return getSiblings(selector, filter, true, allowTextNode);
            },

            /**
             * Get the children of the first element in the set of matched elements, optionally filtered by a filter.
             * @param {HTMLElement[]|String|HTMLElement} selector Matched elements
             * @param {String|Function} [filter] Selector string or filter function
             * @return {HTMLElement[]}
             */
            children: function (selector, filter) {
                return getSiblings(selector, filter, undefined);
            },

            /**
             * Get the childNodes of the first element in the set of matched elements (includes text and comment nodes),
             * optionally filtered by a filter.
             * @param {HTMLElement[]|String|HTMLElement} selector Matched elements
             * @param {String|Function} [filter] Selector string or filter function
             * @return {HTMLElement[]}
             */
            contents: function (selector, filter) {
                return getSiblings(selector, filter, undefined, 1);
            },

            /**
             * Check to see if a DOM node is within another DOM node.
             * @param {HTMLElement|String} container The DOM element that may contain the other element.
             * @param {HTMLElement|String} contained The DOM element that may be contained by the other element.
             * @return {Boolean}
             */
            contains: function (container, contained) {
                container = DOM.get(container);
                contained = DOM.get(contained);
                if (container && contained) {
                    return DOM._contains(container, contained);
                }
                return false;
            },
            /**
             * search for a given element from among the matched elements.
             * @param {HTMLElement|String} selector elements or selector string to find matched elements.
             * @param {HTMLElement|String} s2 elements or selector string to find matched elements.
             */
            index: function (selector, s2) {
                var els = DOM.query(selector),
                    c,
                    n = 0,
                    p,
                    els2,
                    el = els[0];

                if (!s2) {
                    p = el && el.parentNode;
                    if (!p) {
                        return -1;
                    }
                    c = el;
                    while (c = c.previousSibling) {
                        if (c.nodeType == NodeType.ELEMENT_NODE) {
                            n++;
                        }
                    }
                    return n;
                }

                els2 = DOM.query(s2);

                if (typeof s2 === 'string') {
                    return S.indexOf(el, els2);
                }

                return S.indexOf(els2[0], els);
            },

            /**
             * Check to see if a DOM node is equal with another DOM node.
             * @param {HTMLElement|String} n1
             * @param {HTMLElement|String} n2
             * @return {Boolean}
             * @member KISSY.DOM
             */
            equals: function (n1, n2) {
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
    function nth(elem, filter, direction, extraFilter, context, includeSef, allowTextNode) {
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
            filterLength;

        if (S.isNumber(filter)) {
            fi = 0;
            filterLength = filter;
            filter = function () {
                return ++fi === filterLength;
            };
        }

        // 概念统一，都是 context 上下文，只过滤子孙节点，自己不管
        while (elem && elem != context) {
            if ((
                elem.nodeType == NodeType.ELEMENT_NODE ||
                    elem.nodeType == NodeType.TEXT_NODE && allowTextNode
                ) &&
                testFilter(elem, filter) &&
                (!extraFilter || extraFilter(elem))) {
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
            var i, l = filter.length;
            if (!l) {
                return true;
            }
            for (i = 0; i < l; i++) {
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
            tmp,
            i,
            el,
            elem = DOM.get(selector),
            parentNode = elem;

        if (elem && parent) {
            parentNode = elem.parentNode;
        }

        if (parentNode) {
            tmp = S.makeArray(parentNode.childNodes);
            for (i = 0; i < tmp.length; i++) {
                el = tmp[i];
                if (!allowText && el.nodeType != NodeType.ELEMENT_NODE) {
                    continue;
                }
                if (el == elem) {
                    continue;
                }
                ret.push(el);
            }
            if (filter) {
                ret = DOM.filter(ret, filter);
            }
        }

        return ret;
    }

    return DOM;
}, {
    requires: ['./api']
});

/*
 2012-04-05 yiminghe@gmail.com
 - 增加 contents 方法

 2011-08 yiminghe@gmail.com
 - 添加 closest , first ,last 完全摆脱原生属性

 NOTES:
 - jquery does not return null ,it only returns empty array , but kissy does.

 - api 的设计上，没有跟随 jQuery. 一是为了和其他 api 一致，保持 first-all 原则。二是
 遵循 8/2 原则，用尽可能少的代码满足用户最常用的功能。
 */
/*
Copyright 2012, KISSY UI Library v1.30
MIT Licensed
build time: Dec 26 18:09
*/
/**
 * attr ie hack
 * @author yiminghe@gmail.com
 */
KISSY.add('dom/ie/attr', function (S, DOM) {

    var attrHooks = DOM._attrHooks,
        attrNodeHook = DOM._attrNodeHook,
        NodeType = DOM.NodeType,
        valHooks = DOM._valHooks,
        propFix = DOM._propFix,
        HREF = 'href',
        hrefFix,
        IE_VERSION = S.UA.ie;


    if (IE_VERSION < 8) {

        attrHooks['style'].set = function (el, val) {
            el.style.cssText = val;
        };

        // get attribute value from attribute node for ie
        S.mix(attrNodeHook, {
            get: function (elem, name) {
                var ret = elem.getAttributeNode(name);
                // Return undefined if attribute node specified by user
                return ret && (
                    // fix #100
                    ret.specified
                        || ret.nodeValue) ?
                    ret.nodeValue :
                    undefined;
            },
            set: function (elem, value, name) {
                // Check form objects in IE (multiple bugs related)
                // Only use nodeValue if the attribute node exists on the form
                var ret = elem.getAttributeNode(name), attr;
                if (ret) {
                    ret.nodeValue = value;
                } else {
                    try {
                        attr = elem.ownerDocument.createAttribute(name);
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
        });

        // ie6,7 不区分 attribute 与 property
        S.mix(DOM._attrFix, propFix);

        // http://fluidproject.org/blog/2008/01/09/getting-setting-and-removing-tabindex-values-with-javascript/
        attrHooks.tabIndex = attrHooks.tabindex;

        // 不光是 href, src, 还有 rowspan 等非 mapping 属性，也需要用第 2 个参数来获取原始值
        // 注意 colSpan rowSpan 已经由 propFix 转为大写
        S.each([ HREF, 'src', 'width', 'height', 'colSpan', 'rowSpan' ], function (name) {
            attrHooks[ name ] = {
                get: function (elem) {
                    var ret = elem.getAttribute(name, 2);
                    return ret === null ? undefined : ret;
                }
            };
        });

        // button 元素的 value 属性和其内容冲突
        // <button value='xx'>zzz</button>
        valHooks.button = attrHooks.value = attrNodeHook;

        // 当没有设定 value 时，标准浏览器 option.value === option.text
        // ie7- 下，没有设定 value 时，option.value === '',
        // 需要用 el.attributes.value 来判断是否有设定 value
        valHooks['option'] = {
            get: function (elem) {
                var val = elem.attributes.value;
                return !val || val.specified ? elem.value : elem.text;
            }
        };

    }

    // https://github.com/kissyteam/kissy/issues/198
    // http://social.msdn.microsoft.com/Forums/en-US/iewebdevelopment/thread/aa6bf9a5-0c0b-4a02-a115-c5b85783ca8c
    // http://gabriel.nagmay.com/2008/11/javascript-href-bug-in-ie/
    // https://groups.google.com/group/jquery-dev/browse_thread/thread/22029e221fe635c6?pli=1
    hrefFix = attrHooks[HREF] = attrHooks[HREF] || {};
    hrefFix.set = function (el, val, name) {
        var childNodes = el.childNodes,
            b,
            len = childNodes.length,
            allText = len > 0;
        for (len = len - 1; len >= 0; len--) {
            if (childNodes[len].nodeType != NodeType.TEXT_NODE) {
                allText = 0;
            }
        }
        if (allText) {
            b = el.ownerDocument.createElement('b');
            b.style.display = 'none';
            el.appendChild(b);
        }
        el.setAttribute(name, '' + val);
        if (b) {
            el.removeChild(b);
        }
    };

    return DOM;
}, {
    requires: ['dom/base']
});
/**
 * 2012-11-27 yiminghe@gmail.com note:
 *  no need for feature detection for old-ie!
 *//**
 * ie create hack
 * @author yiminghe@gmail.com
 */
KISSY.add('dom/ie/create', function (S, DOM) {

    // wierd ie cloneNode fix from jq
    DOM._fixCloneAttributes = function (src, dest) {

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
            srcChildren = src.childNodes;

        // IE6-8 fail to clone children inside object elements that use
        // the proprietary classid attribute value (rather than the type
        // attribute) to identify the type of content to display
        if (nodeName === 'object' && !dest.childNodes.length) {
            for (var i = 0; i < srcChildren.length; i++) {
                dest.appendChild(srcChildren[i].cloneNode(true));
            }
            // dest.outerHTML = src.outerHTML;
        } else if (nodeName === 'input' && (src.type === 'checkbox' || src.type === 'radio')) {
            // IE6-8 fails to persist the checked state of a cloned checkbox
            // or radio button. Worse, IE6-7 fail to give the cloned element
            // a checked appearance if the defaultChecked value isn't also set
            if (src.checked) {
                dest['defaultChecked'] = dest.checked = src.checked;
            }

            // IE6-7 get confused and end up setting the value of a cloned
            // checkbox/radio button to an empty string instead of 'on'
            if (dest.value !== src.value) {
                dest.value = src.value;
            }

            // IE6-8 fails to return the selected option to the default selected
            // state when cloning options
        } else if (nodeName === 'option') {
            dest.selected = src.defaultSelected;
            // IE6-8 fails to set the defaultValue to the correct value when
            // cloning other types of input fields
        } else if (nodeName === 'input' || nodeName === 'textarea') {
            dest.defaultValue = src.defaultValue;
        }

        // Event data gets referenced instead of copied if the expando
        // gets copied too
        // 自定义 data 根据参数特殊处理，expando 只是个用于引用的属性
        dest.removeAttribute(DOM.__EXPANDO);
    };

    var creators = DOM._creators,
        defaultCreator = DOM._defaultCreator,
        R_TBODY = /<tbody/i;

    // IE7- adds TBODY when creating thead/tfoot/caption/col/colgroup elements
    if (S.UA.ie < 8) {
        // fix #88
        // https://github.com/kissyteam/kissy/issues/88 : spurious tbody in ie<8
        creators.table = function (html, ownerDoc) {
            var frag = defaultCreator(html, ownerDoc),
                hasTBody = R_TBODY.test(html);
            if (hasTBody) {
                return frag;
            }
            var table = frag.firstChild,
                tableChildren = S.makeArray(table.childNodes);
            S.each(tableChildren, function (c) {
                if (DOM.nodeName(c) == 'tbody' && !c.childNodes.length) {
                    table.removeChild(c);
                }
            });
            return frag;
        };
    }
}, {
    requires: ['dom/base']
});/**
 * dirty hack for ie
 * @author yiminghe@gmail.com
 */
KISSY.add('dom/ie', function (S, DOM) {
    return DOM;
}, {
    requires: [
        './ie/attr',
        './ie/create',
        './ie/insertion',
        './ie/selector',
        './ie/style',
        './ie/traversal',
        './ie/input-selection'
    ]
});/**
 * handle input selection and cursor position ie hack
 * @author yiminghe@gmail.com
 */
KISSY.add('dom/ie/input-selection', function (S, DOM) {
    var propHooks = DOM._propHooks;
    // S.log("fix selectionEnd/Start !");
    // note :
    // in ie textarea can not set selectionStart or selectionEnd between '\r' and '\n'
    // else kissy will move start to one step backward and move end to one step forword
    // 1\r^\n2\r^\n3
    // =>
    // 1^\r\n2\r\n^3
    propHooks.selectionStart = {
        set: function (elem, start) {
            var selectionRange = getSelectionRange(elem),
                inputRange = getInputRange(elem);
            if (inputRange.inRange(selectionRange)) {
                var end = getStartEnd(elem, 1)[1],
                    diff = getMovedDistance(elem, start, end);
                selectionRange.collapse(false);
                selectionRange.moveStart('character', -diff);
                if (start > end) {
                    selectionRange.collapse(true);
                }
                selectionRange.select();
            }
        },
        get: function (elem) {
            return getStartEnd(elem)[0];
        }
    };

    propHooks.selectionEnd = {
        set: function (elem, end) {
            var selectionRange = getSelectionRange(elem),
                inputRange = getInputRange(elem);
            if (inputRange.inRange(selectionRange)) {
                var start = getStartEnd(elem)[0],
                    diff = getMovedDistance(elem, start, end);
                selectionRange.collapse(true);
                selectionRange.moveEnd('character', diff);
                if (start > end) {
                    selectionRange.collapse(false);
                }
                selectionRange.select();

            }
        },
        get: function (elem) {
            return getStartEnd(elem, 1)[1];
        }
    };

    function getStartEnd(elem, includeEnd) {
        var start = 0,
            end = 0,
            selectionRange = getSelectionRange(elem),
            inputRange = getInputRange(elem);
        if (inputRange.inRange(selectionRange)) {
            inputRange.setEndPoint('EndToStart', selectionRange);
            start = getRangeText(elem, inputRange).length;
            if (includeEnd) {
                end = start + getRangeText(elem, selectionRange).length;
            }
        }
        return [start, end];
    }

    function getSelectionRange(elem) {
        return  elem.ownerDocument.selection.createRange();
    }

    function getInputRange(elem) {
        // buggy textarea , can not pass inRange test
        if (elem.type == 'textarea') {
            var range = elem.document.body.createTextRange();
            range.moveToElementText(elem);
            return range;
        } else {
            return elem.createTextRange();
        }
    }

    // moveEnd("character",1) will jump "\r\n" at one step
    function getMovedDistance(elem, s, e) {
        var start = Math.min(s, e);
        var end = Math.max(s, e);
        if (start == end) {
            return 0;
        }
        if (elem.type == "textarea") {
            var l = elem.value.substring(start, end).replace(/\r\n/g, '\n').length;
            if (s > e) {
                l = -l;
            }
            return l;
        } else {
            return e - s;
        }
    }

    // range.text will not contain "\r\n" if "\r\n" if "\r\n" is at end of this range
    function getRangeText(elem, range) {
        if (elem.type == "textarea") {
            var ret = range.text,
                testRange = range.duplicate();

            // consider end \r\n
            if (testRange.compareEndPoints('StartToEnd', testRange) == 0) {
                return ret;
            }

            testRange.moveEnd('character', -1);
            if (testRange.text == ret) {
                ret += '\r\n';
            }

            return ret;
        } else {
            return range.text;
        }
    }
}, {
    requires: ['dom/base']
});/**
 * ie create hack
 * @author yiminghe@gmail.com
 */
KISSY.add('dom/ie/insertion', function (S, DOM) {

    var UA = S.UA;

    if (UA.ie < 8) {

        /*
         ie 6,7 lose checked status when append to dom
         var c=S.all('<input />');
         c.attr('type','radio');
         c.attr('checked',true);
         S.all('#t').append(c);
         alert(c[0].checked);
         */
        DOM._fixInsertionChecked = function fixChecked(ret) {
            for (var i = 0; i < ret.length; i++) {
                var el = ret[i];
                if (el.nodeType == DOM.NodeType.DOCUMENT_FRAGMENT_NODE) {
                    fixChecked(el.childNodes);
                } else if (DOM.nodeName(el) == 'input') {
                    fixCheckedInternal(el);
                } else if (el.nodeType == DOM.NodeType.ELEMENT_NODE) {
                    var cs = el.getElementsByTagName('input');
                    for (var j = 0; j < cs.length; j++) {
                        fixChecked(cs[j]);
                    }
                }
            }
        };

        function fixCheckedInternal(el) {
            if (el.type === 'checkbox' || el.type === 'radio') {
                // after insert, in ie6/7 checked is decided by defaultChecked !
                el.defaultChecked = el.checked;
            }
        }

    }


}, {
    requires: ['dom/base']
});/**
 * ie selector hack
 * @author yiminghe@gmail.com
 */
KISSY.add('dom/ie/selector', function (S, DOM) {

    var doc = S.Env.host.document;

    DOM._compareNodeOrder = function (a, b) {
        return a.sourceIndex - b.sourceIndex;
    };

    if (!doc.querySelectorAll) {

        DOM._getElementsByClassName = function (cls, tag, context) {
            if (!context) {
                return [];
            }
            var els = context.getElementsByTagName(tag || '*'),
                ret = [],
                i = 0,
                j = 0,
                len = els.length,
                el;
            for (; i < len; ++i) {
                el = els[i];
                if (DOM._hasSingleClass(el, cls)) {
                    ret[j++] = el;
                }
            }
            return ret;
        };

    }

    // ie<9
    // Check to see if the browser returns only elements
    // when doing getElementsByTagName('*')
    DOM._getElementsByTagName = function (tag, context) {
        var ret = S.makeArray(context.getElementsByTagName(tag)),
            t, i, j, node;
        if (tag === '*') {
            t = [];
            i = 0;
            j = 0;
            while ((node = ret[i++])) {
                // Filter out possible comments
                if (node.nodeType === 1) {
                    t[j++] = node;
                }
            }
            ret = t;
        }
        return ret;
    };

}, {
    requires: ['dom/base']
});

/**
 * @ignore
 *
 * 2012.12.26
 * - 尽量用原生方法提高性能
 *
 *//**
 * style hack for ie
 * @author yiminghe@gmail.com
 */
KISSY.add('dom/ie/style', function (S, DOM) {

    var cssProps = DOM._cssProps,
        UA = S.UA,
        HUNDRED = 100,
        doc = S.Env.host.document,
        docElem = doc && doc.documentElement,
        OPACITY = 'opacity',
        STYLE = 'style',
        RE_POS = /^(top|right|bottom|left)$/,
        FILTER = 'filter',
        CURRENT_STYLE = 'currentStyle',
        RUNTIME_STYLE = 'runtimeStyle',
        LEFT = 'left',
        PX = 'px',
        CUSTOM_STYLES = DOM._CUSTOM_STYLES,
        backgroundPosition = 'backgroundPosition',
        R_OPACITY = /opacity\s*=\s*([^)]*)/,
        R_ALPHA = /alpha\([^)]*\)/i;

    cssProps['float'] = 'styleFloat';

    // odd backgroundPosition
    CUSTOM_STYLES[backgroundPosition] = {
        get: function (elem, computed) {
            if (computed) {
                return elem[CURRENT_STYLE][backgroundPosition + 'X'] +
                    ' ' +
                    elem[CURRENT_STYLE][backgroundPosition + 'Y'];
            } else {
                return elem[STYLE][backgroundPosition];
            }
        }
    };

    // use alpha filter for IE opacity
    try {
        if (docElem.style[OPACITY] == null) {

            CUSTOM_STYLES[OPACITY] = {

                get: function (elem, computed) {
                    // 没有设置过 opacity 时会报错，这时返回 1 即可
                    // 如果该节点没有添加到 dom ，取不到 filters 结构
                    // val = elem[FILTERS]['DXImageTransform.Microsoft.Alpha'][OPACITY];
                    return R_OPACITY.test((
                        computed && elem[CURRENT_STYLE] ?
                            elem[CURRENT_STYLE][FILTER] :
                            elem[STYLE][FILTER]) || '') ?
                        ( parseFloat(RegExp.$1) / HUNDRED ) + '' :
                        computed ? '1' : '';
                },

                set: function (elem, val) {
                    val = parseFloat(val);

                    var style = elem[STYLE],
                        currentStyle = elem[CURRENT_STYLE],
                        opacity = isNaN(val) ? '' : 'alpha(' + OPACITY + '=' + val * HUNDRED + ')',
                        filter = S.trim(currentStyle && currentStyle[FILTER] || style[FILTER] || '');

                    // ie  has layout
                    style.zoom = 1;

                    // if setting opacity to 1, and no other filters exist - attempt to remove filter attribute
                    // https://github.com/kissyteam/kissy/issues/231
                    if ((val >= 1 || !opacity) && !S.trim(filter.replace(R_ALPHA, ''))) {

                        // Setting style.filter to null, '' & ' ' still leave 'filter:' in the cssText
                        // if 'filter:' is present at all, clearType is disabled, we want to avoid this
                        // style.removeAttribute is IE Only, but so apparently is this code path...
                        style.removeAttribute(FILTER);

                        if (// unset inline opacity
                            !opacity ||
                                // if there is no filter style applied in a css rule, we are done
                                currentStyle && !currentStyle[FILTER]) {
                            return;
                        }
                    }

                    // otherwise, set new filter values
                    // 如果 >=1 就不设，就不能覆盖外部样式表定义的样式，一定要设
                    style.filter = R_ALPHA.test(filter) ?
                        filter.replace(R_ALPHA, opacity) :
                        filter + (filter ? ', ' : '') + opacity;
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
     (default is 'medium')
     */
    var IE8 = UA['ie'] == 8,
        BORDER_MAP = {
        },
        BORDERS = ['', 'Top', 'Left', 'Right', 'Bottom'];
    BORDER_MAP['thin'] = IE8 ? '1px' : '2px';
    BORDER_MAP['medium'] = IE8 ? '3px' : '4px';
    BORDER_MAP['thick'] = IE8 ? '5px' : '6px';

    S.each(BORDERS, function (b) {
        var name = 'border' + b + 'Width',
            styleName = 'border' + b + 'Style';

        CUSTOM_STYLES[name] = {
            get: function (elem, computed) {
                // 只有需要计算样式的时候才转换，否则取原值
                var currentStyle = computed ? elem[CURRENT_STYLE] : 0,
                    current = currentStyle && String(currentStyle[name]) || undefined;
                // look up keywords if a border exists
                if (current && current.indexOf('px') < 0) {
                    // 边框没有隐藏
                    if (BORDER_MAP[current] && currentStyle[styleName] !== 'none') {
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

    DOM._getComputedStyle = function (elem, name) {
        name = cssProps[name] || name;
        // currentStyle maybe null
        // http://msdn.microsoft.com/en-us/library/ms535231.aspx
        var ret = elem[CURRENT_STYLE] && elem[CURRENT_STYLE][name];

        // 当 width/height 设置为百分比时，通过 pixelLeft 方式转换的 width/height 值
        // 一开始就处理了! CUSTOM_STYLE['height'],CUSTOM_STYLE['width'] ,cssHook 解决@2011-08-19
        // 在 ie 下不对，需要直接用 offset 方式
        // borderWidth 等值也有问题，但考虑到 borderWidth 设为百分比的概率很小，这里就不考虑了

        // From the awesome hack by Dean Edwards
        // http://erik.eae.net/archives/2007/07/27/18.54.15/#comment-102291
        // If we're not dealing with a regular pixel number
        // but a number that has a weird ending, we need to convert it to pixels
        // exclude left right for relativity
        if (DOM._RE_NUM_NO_PX.test(ret) && !RE_POS.test(name)) {
            // Remember the original values
            var style = elem[STYLE],
                left = style[LEFT],
                rsLeft = elem[RUNTIME_STYLE][LEFT];

            // prevent flashing of content
            elem[RUNTIME_STYLE][LEFT] = elem[CURRENT_STYLE][LEFT];

            // Put in the new values to get a computed value out
            style[LEFT] = name === 'fontSize' ? '1em' : (ret || 0);
            ret = style['pixelLeft'] + PX;

            // Revert the changed values
            style[LEFT] = left;

            elem[RUNTIME_STYLE][LEFT] = rsLeft;
        }
        return ret === '' ? 'auto' : ret;
    };

}, {
    requires: ['dom/base']
});

/*
 NOTES:

 yiminghe@gmail.com: 2012-11-27
 - 单独抽取出 ie 动态加载

 yiminghe@gmail.com: 2011.12.21 backgroundPosition in ie
 - currentStyle['backgroundPosition'] undefined
 - currentStyle['backgroundPositionX'] ok
 - currentStyle['backgroundPositionY'] ok


 yiminghe@gmail.com： 2011.05.19 opacity in ie
 - 如果节点是动态创建，设置opacity，没有加到 dom 前，取不到 opacity 值
 - 兼容：border-width 值，ie 下有可能返回 medium/thin/thick 等值，其它浏览器返回 px 值
 - opacity 的实现，参考自 jquery
 */
/**
 * traversal ie hack
 * @author yiminghe@gmail.com
 */
KISSY.add('dom/ie/traversal', function (S, DOM) {

    DOM._contains = function (a, b) {
        if (a.nodeType == DOM.NodeType.DOCUMENT_NODE) {
            a = a.documentElement;
        }
        // !a.contains => a===document || text
        // 注意原生 contains 判断时 a===b 也返回 true
        b = b.parentNode;

        if (a == b) {
            return true;
        }

        // when b is document, a.contains(b) 不支持的接口 in ie
        if (b && b.nodeType == DOM.NodeType.ELEMENT_NODE) {
            return a.contains && a.contains(b);
        } else {
            return false;
        }
    };

}, {
    requires: ['dom/base']
});
/*
Copyright 2012, KISSY UI Library v1.30
MIT Licensed
build time: Dec 20 22:27
*/
/**
 * @ignore
 * scalable event framework for kissy (refer DOM3 Events)
 * @author yiminghe@gmail.com
 */
KISSY.add('event/base', function (S, Utils, Object, Observer, ObservableEvent) {
    /**
     * The event utility provides functions to add and remove event listeners.
     * @class KISSY.Event
     * @singleton
     */
    return S.Event = {
        _Utils: Utils,
        _Object: Object,
        _Observer: Observer,
        _ObservableEvent: ObservableEvent
    };
}, {
    requires: ['./base/utils', './base/object', './base/observer', './base/observable']
});


/*
 yiminghe@gmail.com: 2012-10-24
 - 重构，新架构，自定义事件，DOM 事件分离

 yiminghe@gmail.com: 2011-12-15
 - 重构，粒度更细，新的架构

 2011-11-24
 - 自定义事件和 dom 事件操作彻底分离
 - TODO: group event from DOM3 Event

 2011-06-07
 - refer : http://www.w3.org/TR/2001/WD-DOM-Level-3-Events-20010823/events.html
 - 重构
 - eventHandler 一个元素一个而不是一个元素一个事件一个，节省内存
 - 减少闭包使用，prevent ie 内存泄露？
 - 增加 fire ，模拟冒泡处理 dom 事件
 *//**
 * @ignore
 * base event object for custom and dom event.
 * @author yiminghe@gmail.com
 */
KISSY.add('event/base/object', function (S) {

    var FALSE_FN = function () {
        return false;
    }, TRUE_FN = function () {
        return true;
    };

    /**
     * @class KISSY.Event.Object
     * @private
     * KISSY 's base event object for custom and dom event.
     */
    function EventObject() {
        this.timeStamp = S.now();
        /**
         * current event type
         * @property type
         * @type {String}
         */
    }

    EventObject.prototype = {
        constructor: EventObject,
        /**
         * Flag for preventDefault that is modified during fire event. if it is true, the default behavior for this event will be executed.
         * @method
         */
        isDefaultPrevented: FALSE_FN,
        /**
         * Flag for stopPropagation that is modified during fire event. true means to stop propagation to bubble targets.
         * @method
         */
        isPropagationStopped: FALSE_FN,
        /**
         * Flag for stopImmediatePropagation that is modified during fire event. true means to stop propagation to bubble targets and other listener.
         * @method
         */
        isImmediatePropagationStopped: FALSE_FN,

        /**
         * Prevents the event's default behavior
         */
        preventDefault: function () {
            this.isDefaultPrevented = TRUE_FN;
        },

        /**
         * Stops the propagation to the next bubble target
         */
        stopPropagation: function () {
            this.isPropagationStopped = TRUE_FN;
        },

        /**
         * Stops the propagation to the next bubble target and
         * prevents any additional listeners from being executed
         * on the current target.
         */
        stopImmediatePropagation: function () {
            var self = this;
            self.isImmediatePropagationStopped = TRUE_FN;
            // fixed 1.2
            // call stopPropagation implicitly
            self.stopPropagation();
        },

        /**
         * Stops the event propagation and prevents the default
         * event behavior.
         * @param  {Boolean} [immediate] if true additional listeners on the current target will not be executed
         */
        halt: function (immediate) {
            var self = this;
            if (immediate) {
                self.stopImmediatePropagation();
            } else {
                self.stopPropagation();
            }
            self.preventDefault();
        }
    };

    return EventObject;

});/**
 * @ignore
 * base custom event mechanism for kissy
 * @author yiminghe@gmail.com
 */
KISSY.add('event/base/observable', function (S) {

    /**
     * base custom event for registering and un-registering observer for specified event.
     * @class KISSY.Event.ObservableEvent
     * @private
     * @param {Object} cfg custom event's attribute
     */
    function ObservableEvent(cfg) {
        var self = this;
        S.mix(self, cfg);
        self.reset();
        /**
         * current event type
         * @cfg {String} type
         */
    }

    ObservableEvent.prototype = {

        constructor: ObservableEvent,

        /**
         * whether current event has observers
         * @return {Boolean}
         */
        hasObserver: function () {
            return !!this.observers.length;
        },

        /**
         * reset current event's status
         */
        reset: function () {
            var self = this;
            self.observers = [];
        },

        /**
         * remove one observer from current event's observers
         * @param {KISSY.Event.Observer} s
         */
        removeObserver: function (s) {
            var self = this,
                i,
                observers = self.observers,
                len = observers.length;
            for (i = 0; i < len; i++) {
                if (observers[i] == s) {
                    observers.splice(i, 1);
                    break;
                }
            }
            self.checkMemory();
        },

        /**
         * check memory after detach
         * @private
         */
        checkMemory: function () {

        },

        /**
         * Search for a specified observer within current event's observers
         * @param {KISSY.Event.Observer} observer
         * @return {Number} observer's index in observers
         */
        findObserver: function (observer) {
            var observers = this.observers, i;

            for (i = observers.length - 1; i >= 0; --i) {
                /*
                 If multiple identical EventListeners are registered on the same EventTarget
                 with the same parameters the duplicate instances are discarded.
                 They do not cause the EventListener to be called twice
                 and since they are discarded
                 they do not need to be removed with the removeEventListener method.
                 */
                if (observer.equals(observers[i])) {
                    return i;
                }
            }

            return -1;
        }
    };

    return ObservableEvent;

});/**
 * @ignore
 * observer for event.
 * @author yiminghe@gmail.com
 */
KISSY.add('event/base/observer', function (S) {

    /**
     * KISSY 's base observer for handle user-specified function
     * @private
     * @class KISSY.Event.Observer
     * @param {Object} cfg
     */
    function Observer(cfg) {
        S.mix(this, cfg);

        /**
         * context in which observer's fn runs
         * @cfg {Object} context
         */
        /**
         * current observer's user-defined function
         * @cfg {Function} fn
         */
        /**
         * whether un-observer current observer once after running observer's user-defined function
         * @cfg {Boolean} once
         */
        /**
         * groups separated by '.' which current observer belongs
         * @cfg {String} groups
         */
    }

    Observer.prototype = {

        constructor: Observer,

        /**
         * whether current observer equals s2
         * @param {KISSY.Event.Observer} s2 another observer
         * @return {Boolean}
         */
        equals: function (s2) {
            var s1 = this;
            return !!S.reduce(s1.keys, function (v, k) {
                return v && (s1[k] === s2[k]);
            }, 1);
        },

        /**
         * simple run current observer's user-defined function
         * @param {KISSY.Event.Object} event
         * @param {KISSY.Event.ObservableEvent} ce
         * @return {*} return value of current observer's user-defined function
         */
        simpleNotify: function (event, ce) {
            var ret, self = this;
            ret = self.fn.call(
                self.context || ce.currentTarget,
                event, self.data
            );
            if (self.once) {
                ce.removeObserver(self);
            }
            return ret;
        },

        /**
         * current observer's notification.
         * @protected
         * @param {KISSY.Event.Object} event
         * @param {KISSY.Event.ObservableEvent} ce
         */
        notifyInternal: function (event, ce) {
            return this.simpleNotify(event, ce);
        },

        /**
         * run current observer's user-defined function
         * @param event
         * @param ce
         */
        notify: function (event, ce) {

            var ret,
                self = this,
                _ks_groups = event._ks_groups;

            // handler's group does not match specified groups (at fire step)
            if (_ks_groups && (!self.groups || !(self.groups.match(_ks_groups)))) {
                return;
            }

            ret = self.notifyInternal(event, ce);

            // return false 等价 preventDefault + stopPropagation
            if (ret === false) {
                event.halt();
            }

            return ret;
        }

    };

    return Observer;

});/**
 * @ignore
 * @fileOverview utils for event
 * @author yiminghe@gmail.com
 */
KISSY.add('event/base/utils', function (S) {

    var getTypedGroups, splitAndRun;

    return {

        splitAndRun: splitAndRun = function (type, fn) {
            type = S.trim(type);
            if (type.indexOf(' ') == -1) {
                fn(type);
            } else {
                S.each(type.split(/\s+/), fn);
            }
        },

        normalizeParam: function (type, fn, context) {
            var cfg = fn || {};

            if (S.isFunction(fn)) {
                cfg = {
                    fn: fn,
                    context: context
                };
            } else {
                // copy
                cfg = S.merge(cfg);
            }

            var typedGroups = getTypedGroups(type);

            type = typedGroups[0];

            cfg.groups = typedGroups[1];

            cfg.type = type;

            return cfg;
        },

        batchForType: function (fn, num) {
            var args = S.makeArray(arguments),
                types = args[2 + num];
            splitAndRun(types, function (type) {
                var args2 = [].concat(args);
                args2.splice(0, 2);
                args2[num] = type;
                fn.apply(null, args2);
            });
        },

        getTypedGroups: getTypedGroups = function (type) {
            if (type.indexOf('.') < 0) {
                return [type, ''];
            }
            var m = type.match(/([^.]+)?(\..+)?$/),
                t = m[1],
                ret = [t],
                gs = m[2];
            if (gs) {
                gs = gs.split('.').sort();
                ret.push(gs.join('.'));
            } else {
                ret.push('');
            }
            return ret;
        },

        getGroupsRe: function (groups) {
            return new RegExp(groups.split('.').join('.*\\.') + '(?:\\.|$)');
        }

    };

});
/*
Copyright 2012, KISSY UI Library v1.30
MIT Licensed
build time: Dec 20 22:27
*/
/**
 * @ignore
 * @fileOverview custom event target for publish and subscribe
 * @author yiminghe@gmail.com
 */
KISSY.add('event/custom/api-impl', function (S, api, Event, ObservableCustomEvent) {
    var trim = S.trim,
        _Utils = Event._Utils,
        splitAndRun = _Utils.splitAndRun,
        KS_BUBBLE_TARGETS = '__~ks_bubble_targets';


    return S.mix(api,
        /**
         * @class KISSY.Event.Target
         * @singleton
         * EventTarget provides the implementation for any object to publish, subscribe and fire to custom events,
         * and also allows other EventTargets to target the object with events sourced from the other object.
         *
         * EventTarget is designed to be used with S.augment to allow events to be listened to and fired by name.
         *
         * This makes it possible for implementing code to subscribe to an event that either has not been created yet,
         * or will not be created at all.
         */
        {

            /**
             * Fire a custom event by name.
             * The callback functions will be executed from the context specified when the event was created,
             * and the {@link KISSY.Event.CustomEventObject} created will be mixed with eventData
             * @param {String} type The type of the event
             * @param {Object} [eventData] The data will be mixed with {@link KISSY.Event.CustomEventObject} created
             * @return {*} If any listen returns false, then the returned value is false. else return the last listener's returned value
             */
            fire: function (target, type, eventData) {
                var self = target, ret = undefined;

                eventData = eventData || {};

                splitAndRun(type, function (type) {
                    var r2, customEvent,
                        typedGroups = _Utils.getTypedGroups(type),
                        _ks_groups = typedGroups[1];

                    type = typedGroups[0];

                    if (_ks_groups) {
                        _ks_groups = _Utils.getGroupsRe(_ks_groups);
                        eventData._ks_groups = _ks_groups;
                    }

                    customEvent = ObservableCustomEvent.getCustomEvent(self, type) ||
                        // in case no publish custom event but we need bubble
                        // because bubbles defaults to true!
                        new ObservableCustomEvent({
                            currentTarget: target,
                            type: type
                        });


                    r2 = customEvent.fire(eventData);

                    if (ret !== false) {
                        ret = r2;
                    }
                });

                return ret;
            },

            /**
             * Creates a new custom event of the specified type
             * @param {String} type The type of the event
             * @param {Object} cfg Config params
             * @param {Boolean} [cfg.bubbles=true] whether or not this event bubbles
             * @param {Function} [cfg.defaultFn] this event's default action
             * @chainable
             */
            publish: function (target, type, cfg) {
                var customEvent;

                splitAndRun(type, function (t) {
                    customEvent = ObservableCustomEvent.getCustomEvent(target, t, 1);
                    S.mix(customEvent, cfg)
                });

                return target;
            },

            /**
             * Registers another EventTarget as a bubble target.
             * @param {KISSY.Event.Target} anotherTarget Another EventTarget instance to add
             * @chainable
             */
            addTarget: function (target, anotherTarget) {
                var targets = api.getTargets(target);
                if (!S.inArray(anotherTarget, targets)) {
                    targets.push(anotherTarget);
                }
                return target;
            },

            /**
             * Removes a bubble target
             * @param {KISSY.Event.Target} anotherTarget Another EventTarget instance to remove
             * @chainable
             */
            removeTarget: function (target, anotherTarget) {
                var targets = api.getTargets(target),
                    index = S.indexOf(anotherTarget, targets);
                if (index != -1) {
                    targets.splice(index, 1);
                }
                return target;
            },

            /**
             * all targets where current target's events bubble to
             * @private
             * @return {Array}
             */
            getTargets: function (target) {
                target[KS_BUBBLE_TARGETS] = target[KS_BUBBLE_TARGETS] || [];
                return target[KS_BUBBLE_TARGETS];
            },

            /**
             * Subscribe a callback function to a custom event fired by this object or from an object that bubbles its events to this object.
             * @method
             * @param {String} type The name of the event
             * @param {Function} fn The callback to execute in response to the event
             * @param {Object} [context] this object in callback
             * @chainable
             */
            on: function (target, type, fn, context) {
                type = trim(type);
                _Utils.batchForType(function (type, fn, context) {
                    var cfg = _Utils.normalizeParam(type, fn, context),
                        customEvent;
                    type = cfg.type;
                    customEvent = ObservableCustomEvent.getCustomEvent(target, type, 1);
                    if (customEvent) {
                        customEvent.on(cfg);
                    }
                }, 0, type, fn, context);

                return target; // chain
            },

            /**
             * Detach one or more listeners from the specified event
             * @method
             * @param {String} type The name of the event
             * @param {Function} [fn] The subscribed function to un-subscribe. if not supplied, all observers will be removed.
             * @param {Object} [context] The custom object passed to subscribe.
             * @chainable
             */
            detach: function (target, type, fn, context) {
                type = trim(type);
                _Utils.batchForType(function (type, fn, context) {
                    var cfg = _Utils.normalizeParam(type, fn, context),
                        customEvents,
                        customEvent;
                    type = cfg.type;
                    if (type) {
                        customEvent = ObservableCustomEvent.getCustomEvent(target, type, 1);
                        if (customEvent) {
                            customEvent.detach(cfg);
                        }
                    } else {
                        customEvents = ObservableCustomEvent.getCustomEvents(target);
                        S.each(customEvents, function (customEvent) {
                            customEvent.detach(cfg);
                        });
                    }
                }, 0, type, fn, context);

                return target; // chain
            }
        });
}, {
    requires: ['./api', 'event/base', './observable']
});
/*
 yiminghe: 2012-10-24
 - implement defaultFn for custom event

 yiminghe: 2011-10-17
 - implement bubble for custom event
 *//**
 * @ignore
 * @fileOverview custom event target for publish and subscribe
 * @author yiminghe@gmail.com
 */
KISSY.add('event/custom/api', function () {
    return {

    };
});/**
 * @ignore
 * custom facade
 * @author yiminghe@gmail.com
 */
KISSY.add('event/custom', function (S, Event, api, ObservableCustomEvent) {
    var Target = {};

    S.each(api, function (fn, name) {
        Target[name] = function () {
            var args = S.makeArray(arguments);
            args.unshift(this);
            return fn.apply(null, args);
        }
    });

    var custom = S.mix({
        _ObservableCustomEvent: ObservableCustomEvent,
        Target: Target
    }, api);

    S.mix(Event, {
        Target: Target,
        custom: custom
    });

    // compatibility
    S.EventTarget = Target;

    return custom;
}, {
    requires: ['./base', './custom/api-impl', './custom/observable']
});/**
 * @ignore
 * simple custom event object for custom event mechanism.
 * @author yiminghe@gmail.com
 */
KISSY.add('event/custom/object', function (S, Event) {

    /**
     * Do not new by yourself.
     *
     * Custom event object.
     * @class KISSY.Event.CustomEventObject
     * @param {Object} data data which will be mixed into custom event instance
     * @extends KISSY.Event.Object
     */
    function CustomEventObject(data) {
        CustomEventObject.superclass.constructor.call(this);
        S.mix(this, data);
        /**
         * source target of current event
         * @property  target
         * @type {KISSY.Event.Target}
         */
        /**
         * current target which processes current event
         * @property currentTarget
         * @type {KISSY.Event.Target}
         */
    }

    S.extend(CustomEventObject, Event._Object);

    return CustomEventObject;

}, {
    requires: ['event/base']
});/**
 * @ignore
 * custom event mechanism for kissy.
 * refer: http://www.w3.org/TR/domcore/#interface-customevent
 * @author yiminghe@gmail.com
 */
KISSY.add('event/custom/observable', function (S, api, CustomEventObserver, CustomEventObject, Event) {

    var _Utils = Event._Utils;

    /**
     * custom event for registering and un-registering observer for specified event on normal object.
     * @class KISSY.Event.ObservableCustomEvent
     * @extends KISSY.Event.ObservableEvent
     * @private
     */
    function ObservableCustomEvent() {
        var self = this;
        ObservableCustomEvent.superclass.constructor.apply(self, arguments);
        self.defaultFn = null;
        self.defaultTargetOnly = false;

        /**
         * whether this event can bubble.
         * Defaults to: true
         * @cfg {Boolean} bubbles
         */
        self.bubbles = true;
        /**
         * event target which binds current custom event
         * @cfg {KISSY.Event.Target} currentTarget
         */
    }

    S.extend(ObservableCustomEvent, Event._ObservableEvent, {

        constructor: ObservableCustomEvent,

        /**
         * add a observer to custom event's observers
         * @param {Object} cfg {@link KISSY.Event.CustomEventObserver} 's config
         */
        on: function (cfg) {
            var observer = new CustomEventObserver(cfg);
            if (this.findObserver(observer) == -1) {
                this.observers.push(observer);
            }
        },

        checkMemory: function () {
            var self = this,
                currentTarget = self.currentTarget,
                events = ObservableCustomEvent.getCustomEvents(currentTarget);
            if (events) {
                if (!self.hasObserver()) {
                    delete events[self.type];
                }
                if (S.isEmptyObject(events)) {
                    delete currentTarget[KS_CUSTOM_EVENTS];
                }
            }
        },

        /**
         * notify current custom event 's observers and then bubble up if this event can bubble.
         * @param {KISSY.Event.CustomEventObject} eventData
         * @return {*} return false if one of custom event 's observers (include bubbled) else
         * return last value of custom event 's observers (include bubbled) 's return value.
         */
        fire: function (eventData) {

            if (!this.hasObserver() && !this.bubbles) {
                return;
            }

            eventData = eventData || {};

            var self = this,
                type = self.type,
                defaultFn = self.defaultFn,
                i,
                parents,
                len,
                currentTarget = self.currentTarget,
                customEvent = eventData,
                gRet, ret;

            eventData.type = type;

            if (!(customEvent instanceof  CustomEventObject)) {
                customEvent.target = currentTarget;
                customEvent = new CustomEventObject(customEvent);
            }

            customEvent.currentTarget = currentTarget;

            ret = self.notify(customEvent);

            if (gRet !== false) {
                gRet = ret;
            }

            if (self.bubbles) {
                parents = api.getTargets(currentTarget);
                len = parents && parents.length || 0;

                for (i = 0; i < len && !customEvent.isPropagationStopped(); i++) {

                    ret = api.fire(parents[i], type, customEvent);

                    // false 优先返回
                    if (gRet !== false) {
                        gRet = ret;
                    }

                }
            }

            if (defaultFn && !customEvent.isDefaultPrevented()) {
                var lowestCustomEvent = ObservableCustomEvent.getCustomEvent(customEvent.target, customEvent.type);
                if ((!self.defaultTargetOnly && !lowestCustomEvent.defaultTargetOnly) ||
                    self == customEvent.target) {
                    defaultFn.call(self);
                }
            }

            return gRet;

        },

        /**
         * notify current event 's observers
         * @param {KISSY.Event.CustomEventObject} event
         * @return {*} return false if one of custom event 's observers  else
         * return last value of custom event 's observers 's return value.
         */
        notify: function (event) {
            var observers = this.observers,
                ret,
                gRet,
                len = observers.length, i;

            for (i = 0; i < len && !event.isImmediatePropagationStopped(); i++) {
                ret = observers[i].notify(event, this);
                if (gRet !== false) {
                    gRet = ret;
                }
                if (ret === false) {
                    event.halt();
                }
            }

            return gRet;
        },

        /**
         * remove some observers from current event 's observers by observer config param
         * @param {Object} cfg {@link KISSY.Event.CustomEventObserver} 's config
         */
        detach: function (cfg) {
            var groupsRe,
                self = this,
                fn = cfg.fn,
                context = cfg.context,
                currentTarget = self.currentTarget,
                observers = self.observers,
                groups = cfg.groups;

            if (!observers.length) {
                return;
            }

            if (groups) {
                groupsRe = _Utils.getGroupsRe(groups);
            }

            var i, j, t, observer, observerContext, len = observers.length;

            // 移除 fn
            if (fn || groupsRe) {
                context = context || currentTarget;

                for (i = 0, j = 0, t = []; i < len; ++i) {
                    observer = observers[i];
                    observerContext = observer.context || currentTarget;
                    if (
                        (context != observerContext) ||
                            // 指定了函数，函数不相等，保留
                            (fn && fn != observer.fn) ||
                            // 指定了删除的某些组，而该 observer 不属于这些组，保留，否则删除
                            (groupsRe && !observer.groups.match(groupsRe))
                        ) {
                        t[j++] = observer;
                    }
                }

                self.observers = t;
            } else {
                // 全部删除
                self.reset();
            }

            self.checkMemory();
        }
    });

    var KS_CUSTOM_EVENTS = '__~ks_custom_events';

    /**
     * Get custom event for specified event
     * @static
     * @private
     * @member KISSY.Event.ObservableCustomEvent
     * @param {HTMLElement} target
     * @param {String} type event type
     * @param {Boolean} [create] whether create custom event on fly
     * @return {KISSY.Event.ObservableCustomEvent}
     */
    ObservableCustomEvent.getCustomEvent = function (target, type, create) {
        var self = this,
            customEvent,
            customEvents = ObservableCustomEvent.getCustomEvents(target, create);
        customEvent = customEvents && customEvents[type];
        if (!customEvent && create) {
            customEvent = customEvents[type] = new ObservableCustomEvent({
                currentTarget: target,
                type: type
            });
        }
        return customEvent;
    };

    /**
     * Get custom events holder
     * @private
     * @static
     * @param {HTMLElement} target
     * @param {Boolean} [create] whether create custom event container on fly
     * @return {Object}
     */
    ObservableCustomEvent.getCustomEvents = function (target, create) {
        if (!target[KS_CUSTOM_EVENTS] && create) {
            target[KS_CUSTOM_EVENTS] = {};
        }
        return target[KS_CUSTOM_EVENTS];
    };

    return ObservableCustomEvent;

}, {
    requires: ['./api', './observer', './object', 'event/base']
});
/**
 * @ignore
 * 2012-10-26 yiminghe@gmail.com
 *  - custom event can bubble by default!
 *//**
 * @ignore
 * Observer for custom event
 * @author yiminghe@gmail.com
 */
KISSY.add('event/custom/observer', function (S, Event) {

    /**
     * Observer for custom event
     * @class KISSY.Event.CustomEventObserver
     * @extends KISSY.Event.Observer
     * @private
     */
    function CustomEventObserver() {
        CustomEventObserver.superclass.constructor.apply(this, arguments);
    }

    S.extend(CustomEventObserver, Event._Observer, {

        keys:['fn','context','groups']

    });

    return CustomEventObserver;

}, {
    requires: ['event/base']
});
/*
Copyright 2013, KISSY UI Library v1.30
MIT Licensed
build time: Jan 9 19:16
*/
/**
 * @ignore
 * setup event/dom api module
 * @author yiminghe@gmail.com
 */
KISSY.add('event/dom/base/api', function (S, Event, DOM, special, Utils, ObservableDOMEvent, DOMEventObject) {
    var _Utils = Event._Utils;

    function fixType(cfg, type) {
        var s = special[type] || {};
        // in case overwritten by delegateFix/onFix in special events
        // (mouseenter/leave,focusin/out)

        if (!cfg.originalType) {
            if (cfg.selector) {
                if (s['delegateFix']) {
                    cfg.originalType = type;
                    type = s['delegateFix'];
                }
            } else {
                // when on mouseenter, it's actually on mouseover,
                // and observers is saved with mouseover!
                // TODO need evaluate!
                if (s['onFix']) {
                    cfg.originalType = type;
                    type = s['onFix'];
                }
            }
        }

        return type;
    }

    function addInternal(currentTarget, type, cfg) {
        var eventDesc,
            customEvent,
            events,
            handle;

        cfg = S.merge(cfg);
        type = fixType(cfg, type);

        // 获取事件描述
        eventDesc = ObservableDOMEvent.getCustomEvents(currentTarget, 1);

        if (!(handle = eventDesc.handle)) {
            handle = eventDesc.handle = function (event) {
                // 是经过 fire 手动调用而浏览器同步触发导致的，就不要再次触发了，
                // 已经在 fire 中 bubble 过一次了
                // in case after page has unloaded
                var type = event.type,
                    customEvent,
                    currentTarget = handle.currentTarget;
                if (ObservableDOMEvent.triggeredEvent == type ||
                    typeof KISSY == 'undefined') {
                    return;
                }
                customEvent = ObservableDOMEvent.getCustomEvent(currentTarget, type);
                if (customEvent) {
                    event.currentTarget = currentTarget;
                    event = new DOMEventObject(event);
                    return customEvent.notify(event);
                }
            };
            handle.currentTarget = currentTarget;
        }

        if (!(events = eventDesc.events)) {
            events = eventDesc.events = {};
        }

        //事件 listeners , similar to eventListeners in DOM3 Events
        customEvent = events[type];

        if (!customEvent) {
            customEvent = events[type] = new ObservableDOMEvent({
                type: type,
                fn: handle,
                currentTarget: currentTarget
            });

            customEvent.setup();
        }

        customEvent.on(cfg);

        currentTarget = null;
    }

    function removeInternal(currentTarget, type, cfg) {
        // copy
        cfg = S.merge(cfg);

        var customEvent;

        type = fixType(cfg, type);

        var eventDesc = ObservableDOMEvent.getCustomEvents(currentTarget),
            events = (eventDesc || {}).events;

        if (!eventDesc || !events) {
            return;
        }

        // remove all types of event
        if (!type) {
            for (type in events) {
                events[type].detach(cfg);
            }
            return;
        }

        customEvent = events[type];

        if (customEvent) {
            customEvent.detach(cfg);
        }
    }

    S.mix(Event, {
        /**
         * Adds an event listener.similar to addEventListener in DOM3 Events
         * @param targets KISSY selector
         * @member KISSY.Event
         * @param type {String} The type of event to append.
         * use space to separate multiple event types.
         * @param fn {Function|Object} The event listener or event description object.
         * @param {Function} fn.fn The event listener
         * @param {Function} fn.context The context (this reference) in which the handler function is executed.
         * @param {String|Function} fn.selector filter selector string or function to find right element
         * @param {Boolean} fn.once whether fn will be removed once after it is executed.
         * @param {Object} [context] The context (this reference) in which the handler function is executed.
         */
        add: function (targets, type, fn, context) {
            type = S.trim(type);
            // data : 附加在回调后面的数据，delegate 检查使用
            // remove 时 data 相等(指向同一对象或者定义了 equals 比较函数)
            targets = DOM.query(targets);

            _Utils.batchForType(function (targets, type, fn, context) {
                var cfg = _Utils.normalizeParam(type, fn, context), i;
                type = cfg.type;
                for (i = targets.length - 1; i >= 0; i--) {
                    addInternal(targets[i], type, cfg);
                }
            }, 1, targets, type, fn, context);

            return targets;
        },

        /**
         * Detach an event or set of events from an element. similar to removeEventListener in DOM3 Events
         * @param targets KISSY selector
         * @member KISSY.Event
         * @param {String} [type] The type of event to remove.
         * use space to separate multiple event types.
         * @param [fn] {Function|Object} The event listener or event description object.
         * @param {Function} fn.fn The event listener
         * @param {Function} [fn.context] The context (this reference) in which the handler function is executed.
         * @param {String|Function} [fn.selector] filter selector string or function to find right element
         * @param {Boolean} [fn.once] whether fn will be removed once after it is executed.
         * @param {Object} [context] The context (this reference) in which the handler function is executed.
         */
        remove: function (targets, type, fn, context) {

            type = S.trim(type);

            targets = DOM.query(targets);

            _Utils.batchForType(function (targets, type, fn, context) {
                var cfg = _Utils.normalizeParam(type, fn, context), i;

                type = cfg.type;

                for (i = targets.length - 1; i >= 0; i--) {
                    removeInternal(targets[i], type, cfg);
                }
            }, 1, targets, type, fn, context);


            return targets;

        },

        /**
         * Delegate event.
         * @param targets KISSY selector
         * @param {String|Function} selector filter selector string or function to find right element
         * @param {String} [eventType] The type of event to delegate.
         * use space to separate multiple event types.
         * @param {Function} [fn] The event listener.
         * @param {Object} [context] The context (this reference) in which the handler function is executed.
         * @member KISSY.Event
         */
        delegate: function (targets, eventType, selector, fn, context) {
            return Event.add(targets, eventType, {
                fn: fn,
                context: context,
                selector: selector
            });
        },
        /**
         * undelegate event.
         * @param targets KISSY selector
         * @param {String} [eventType] The type of event to undelegate.
         * use space to separate multiple event types.
         * @param {String|Function} [selector] filter selector string or function to find right element
         * @param {Function} [fn] The event listener.
         * @param {Object} [context] The context (this reference) in which the handler function is executed.
         * @member KISSY.Event
         */
        undelegate: function (targets, eventType, selector, fn, context) {
            return Event.remove(targets, eventType, {
                fn: fn,
                context: context,
                selector: selector
            });
        },

        /**
         * fire event,simulate bubble in browser. similar to dispatchEvent in DOM3 Events
         * @param targets html nodes
         * @member KISSY.Event
         * @param {String} eventType event type
         * @param [eventData] additional event data
         * @return {*} return false if one of custom event 's observers (include bubbled) else
         * return last value of custom event 's observers (include bubbled) 's return value.
         */
        fire: function (targets, eventType, eventData, onlyHandlers/*internal usage*/) {
            var ret = undefined;
            // custom event firing moved to target.js
            eventData = eventData || {};

            /**
             * identify event as fired manually
             * @ignore
             */
            eventData.synthetic = 1;

            _Utils.splitAndRun(eventType, function (eventType) {
                // protect event type
                eventData.type = eventType;

                var r,
                    i,
                    target,
                    customEvent,
                    typedGroups = _Utils.getTypedGroups(eventType),
                    _ks_groups = typedGroups[1];

                if (_ks_groups) {
                    _ks_groups = _Utils.getGroupsRe(_ks_groups);
                }

                eventType = typedGroups[0];

                S.mix(eventData, {
                    type: eventType,
                    _ks_groups: _ks_groups
                });

                targets = DOM.query(targets);

                for (i = targets.length - 1; i >= 0; i--) {
                    target = targets[i];
                    customEvent = ObservableDOMEvent
                        .getCustomEvent(target, eventType);
                    // bubbling
                    // html dom event defaults to bubble
                    if (!onlyHandlers && !customEvent) {
                        customEvent = new ObservableDOMEvent({
                            type: eventType,
                            currentTarget: target
                        });
                    }
                    if (customEvent) {
                        r = customEvent.fire(eventData, onlyHandlers);
                        if (ret !== false) {
                            ret = r;
                        }
                    }
                }
            });

            return ret;
        },

        /**
         * same with fire but:
         * - does not cause default behavior to occur.
         * - does not bubble up the DOM hierarchy.
         * @param targets html nodes
         * @member KISSY.Event
         * @param {String} eventType event type
         * @param [eventData] additional event data
         * @return {*} return false if one of custom event 's observers (include bubbled) else
         * return last value of custom event 's observers (include bubbled) 's return value.
         */
        fireHandler: function (targets, eventType, eventData) {
            return Event.fire(targets, eventType, eventData, 1);
        },


        /**
         * copy event from src to dest
         * @member KISSY.Event
         * @param {HTMLElement} src srcElement
         * @param {HTMLElement} dest destElement
         * @private
         */
        _clone: function (src, dest) {
            var eventDesc, events;
            if (!(eventDesc = ObservableDOMEvent.getCustomEvents(src))) {
                return;
            }
            events = eventDesc.events;
            S.each(events, function (customEvent, type) {
                S.each(customEvent.observers, function (observer) {
                    // scope undefined
                    // 不能 this 写死在 handlers 中
                    // 否则不能保证 clone 时的 this
                    addInternal(dest, type, observer);
                });
            });
        },

        _ObservableDOMEvent: ObservableDOMEvent
    });

    /**
     * Same with {@link KISSY.Event#add}
     * @method
     * @member KISSY.Event
     */
    Event.on = Event.add;
    /**
     * Same with {@link KISSY.Event#remove}
     * @method
     * @member KISSY.Event
     */
    Event.detach = Event.remove;

    return Event;
}, {
    requires: ['event/base', 'dom', './special', './utils', './observable', './object']
});
/*
 2012-02-12 yiminghe@gmail.com note:
 - 普通 remove() 不管 selector 都会查，如果 fn context 相等就移除
 - undelegate() selector 为 ''，那么去除所有委托绑定的 handler
 */
/**
 * @ignore
 *  dom event facade
 * @author yiminghe@gmail.com
 */
KISSY.add('event/dom/base', function (S, Event, KeyCodes, _DOMUtils, Gesture, Special) {
    S.mix(Event, {
        KeyCodes: KeyCodes,
        _DOMUtils: _DOMUtils,
        Gesture: Gesture,
        _Special: Special
    });

    return Event;
}, {
    requires: ['event/base',
        './base/key-codes',
        './base/utils',
        './base/gesture',
        './base/special',
        './base/api',
        './base/mouseenter',
        './base/mousewheel',
        './base/valuechange']
});

/**
 * @ignore
 * gesture normalization for pc and touch.
 * @author yiminghe@gmail.com
 */
KISSY.add('event/dom/base/gesture', function (S) {

    /**
     * gesture for event
     * @enum {String} KISSY.Event.Gesture
     */
    return {
        /**
         * start gesture
         */
        start: 'mousedown',
        /**
         * move gesture
         */
        move: 'mousemove',
        /**
         * end gesture
         */
        end: 'mouseup',
        /**
         * tap gesture
         */
        tap: 'click',
        /**
         * doubleTap gesture, it is not same with dblclick
         */
        doubleTap:'dblclick'
    };

});/**
 * @ignore
 *  some key-codes definition and utils from closure-library
 * @author yiminghe@gmail.com
 */
KISSY.add('event/dom/base/key-codes', function (S) {
    /**
     * @enum {Number} KISSY.Event.KeyCodes
     * All key codes.
     */
    var UA = S.UA,
        KeyCodes = {
            /**
             * MAC_ENTER
             */
            MAC_ENTER: 3,
            /**
             * BACKSPACE
             */
            BACKSPACE: 8,
            /**
             * TAB
             */
            TAB: 9,
            /**
             * NUMLOCK on FF/Safari Mac
             */
            NUM_CENTER: 12, // NUMLOCK on FF/Safari Mac
            /**
             * ENTER
             */
            ENTER: 13,
            /**
             * SHIFT
             */
            SHIFT: 16,
            /**
             * CTRL
             */
            CTRL: 17,
            /**
             * ALT
             */
            ALT: 18,
            /**
             * PAUSE
             */
            PAUSE: 19,
            /**
             * CAPS_LOCK
             */
            CAPS_LOCK: 20,
            /**
             * ESC
             */
            ESC: 27,
            /**
             * SPACE
             */
            SPACE: 32,
            /**
             * PAGE_UP
             */
            PAGE_UP: 33, // also NUM_NORTH_EAST
            /**
             * PAGE_DOWN
             */
            PAGE_DOWN: 34, // also NUM_SOUTH_EAST
            /**
             * END
             */
            END: 35, // also NUM_SOUTH_WEST
            /**
             * HOME
             */
            HOME: 36, // also NUM_NORTH_WEST
            /**
             * LEFT
             */
            LEFT: 37, // also NUM_WEST
            /**
             * UP
             */
            UP: 38, // also NUM_NORTH
            /**
             * RIGHT
             */
            RIGHT: 39, // also NUM_EAST
            /**
             * DOWN
             */
            DOWN: 40, // also NUM_SOUTH
            /**
             * PRINT_SCREEN
             */
            PRINT_SCREEN: 44,
            /**
             * INSERT
             */
            INSERT: 45, // also NUM_INSERT
            /**
             * DELETE
             */
            DELETE: 46, // also NUM_DELETE
            /**
             * ZERO
             */
            ZERO: 48,
            /**
             * ONE
             */
            ONE: 49,
            /**
             * TWO
             */
            TWO: 50,
            /**
             * THREE
             */
            THREE: 51,
            /**
             * FOUR
             */
            FOUR: 52,
            /**
             * FIVE
             */
            FIVE: 53,
            /**
             * SIX
             */
            SIX: 54,
            /**
             * SEVEN
             */
            SEVEN: 55,
            /**
             * EIGHT
             */
            EIGHT: 56,
            /**
             * NINE
             */
            NINE: 57,
            /**
             * QUESTION_MARK
             */
            QUESTION_MARK: 63, // needs localization
            /**
             * A
             */
            A: 65,
            /**
             * B
             */
            B: 66,
            /**
             * C
             */
            C: 67,
            /**
             * D
             */
            D: 68,
            /**
             * E
             */
            E: 69,
            /**
             * F
             */
            F: 70,
            /**
             * G
             */
            G: 71,
            /**
             * H
             */
            H: 72,
            /**
             * I
             */
            I: 73,
            /**
             * J
             */
            J: 74,
            /**
             * K
             */
            K: 75,
            /**
             * L
             */
            L: 76,
            /**
             * M
             */
            M: 77,
            /**
             * N
             */
            N: 78,
            /**
             * O
             */
            O: 79,
            /**
             * P
             */
            P: 80,
            /**
             * Q
             */
            Q: 81,
            /**
             * R
             */
            R: 82,
            /**
             * S
             */
            S: 83,
            /**
             * T
             */
            T: 84,
            /**
             * U
             */
            U: 85,
            /**
             * V
             */
            V: 86,
            /**
             * W
             */
            W: 87,
            /**
             * X
             */
            X: 88,
            /**
             * Y
             */
            Y: 89,
            /**
             * Z
             */
            Z: 90,
            /**
             * META
             */
            META: 91, // WIN_KEY_LEFT
            /**
             * WIN_KEY_RIGHT
             */
            WIN_KEY_RIGHT: 92,
            /**
             * CONTEXT_MENU
             */
            CONTEXT_MENU: 93,
            /**
             * NUM_ZERO
             */
            NUM_ZERO: 96,
            /**
             * NUM_ONE
             */
            NUM_ONE: 97,
            /**
             * NUM_TWO
             */
            NUM_TWO: 98,
            /**
             * NUM_THREE
             */
            NUM_THREE: 99,
            /**
             * NUM_FOUR
             */
            NUM_FOUR: 100,
            /**
             * NUM_FIVE
             */
            NUM_FIVE: 101,
            /**
             * NUM_SIX
             */
            NUM_SIX: 102,
            /**
             * NUM_SEVEN
             */
            NUM_SEVEN: 103,
            /**
             * NUM_EIGHT
             */
            NUM_EIGHT: 104,
            /**
             * NUM_NINE
             */
            NUM_NINE: 105,
            /**
             * NUM_MULTIPLY
             */
            NUM_MULTIPLY: 106,
            /**
             * NUM_PLUS
             */
            NUM_PLUS: 107,
            /**
             * NUM_MINUS
             */
            NUM_MINUS: 109,
            /**
             * NUM_PERIOD
             */
            NUM_PERIOD: 110,
            /**
             * NUM_DIVISION
             */
            NUM_DIVISION: 111,
            /**
             * F1
             */
            F1: 112,
            /**
             * F2
             */
            F2: 113,
            /**
             * F3
             */
            F3: 114,
            /**
             * F4
             */
            F4: 115,
            /**
             * F5
             */
            F5: 116,
            /**
             * F6
             */
            F6: 117,
            /**
             * F7
             */
            F7: 118,
            /**
             * F8
             */
            F8: 119,
            /**
             * F9
             */
            F9: 120,
            /**
             * F10
             */
            F10: 121,
            /**
             * F11
             */
            F11: 122,
            /**
             * F12
             */
            F12: 123,
            /**
             * NUMLOCK
             */
            NUMLOCK: 144,
            /**
             * SEMICOLON
             */
            SEMICOLON: 186, // needs localization
            /**
             * DASH
             */
            DASH: 189, // needs localization
            /**
             * EQUALS
             */
            EQUALS: 187, // needs localization
            /**
             * COMMA
             */
            COMMA: 188, // needs localization
            /**
             * PERIOD
             */
            PERIOD: 190, // needs localization
            /**
             * SLASH
             */
            SLASH: 191, // needs localization
            /**
             * APOSTROPHE
             */
            APOSTROPHE: 192, // needs localization
            /**
             * SINGLE_QUOTE
             */
            SINGLE_QUOTE: 222, // needs localization
            /**
             * OPEN_SQUARE_BRACKET
             */
            OPEN_SQUARE_BRACKET: 219, // needs localization
            /**
             * BACKSLASH
             */
            BACKSLASH: 220, // needs localization
            /**
             * CLOSE_SQUARE_BRACKET
             */
            CLOSE_SQUARE_BRACKET: 221, // needs localization
            /**
             * WIN_KEY
             */
            WIN_KEY: 224,
            /**
             * MAC_FF_META
             */
            MAC_FF_META: 224, // Firefox (Gecko) fires this for the meta key instead of 91
            /**
             * WIN_IME
             */
            WIN_IME: 229
        };

    /**
     * whether text and modified key is entered at the same time.
     * @param {KISSY.Event.DOMEventObject} e event object
     * @return {Boolean}
     */
    KeyCodes.isTextModifyingKeyEvent = function (e) {
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

    /**
     * whether character is entered.
     * @param {KISSY.Event.KeyCodes} keyCode
     * @return {Boolean}
     */
    KeyCodes.isCharacterKey = function (keyCode) {
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
        if (UA.webkit && keyCode == 0) {
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
 * @ignore
 *  event-mouseenter
 * @author yiminghe@gmail.com
 */
KISSY.add('event/dom/base/mouseenter', function (S, Event, DOM, special) {

    S.each([
        { name: 'mouseenter', fix: 'mouseover' },
        { name: 'mouseleave', fix: 'mouseout' }
    ], function (o) {
        special[o.name] = {
            // fix #75
            onFix: o.fix,
            // all browser need
            delegateFix: o.fix,
            handle: function (event, observer, ce) {
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
                    // 2012-04-12 把 mouseover 阻止冒泡有问题！
                    // <div id='0'><div id='1'><div id='2'><div id='3'></div></div></div></div>
                    // 2 mouseover 停止冒泡
                    // 然后快速 2,1 飞过，可能 1 的 mouseover 是 2 冒泡过来的
                    // mouseover 采样时跳跃的，可能 2,1 的 mouseover 事件
                    // target 都是 3,而 relatedTarget 都是 0
                    // event.stopPropagation();
                    return [observer.simpleNotify(event, ce)];
                }
            }
        };
    });

    return Event;
}, {
    requires: ['./api', 'dom', './special']
});

/*
 yiminghe@gmail.com:2011-12-15
 - 借鉴 jq 1.7 新的架构

 yiminghe@gmail.com：2011-06-07
 - 根据新结构，调整 mouseenter 兼容处理
 - fire('mouseenter') 可以的，直接执行 mouseenter 的 handlers 用户回调数组
 */
/**
 * @ignore
 *  normalize mousewheel in gecko
 * @author yiminghe@gmail.com
 */
KISSY.add('event/dom/base/mousewheel', function (S, special) {

    var UA = S.UA, MOUSE_WHEEL = UA.gecko ? 'DOMMouseScroll' : 'mousewheel';

    special['mousewheel'] = {
        onFix: MOUSE_WHEEL,
        delegateFix: MOUSE_WHEEL
    };

}, {
    requires: ['./special']
});/**
 * @ignore
 *  event object for dom
 * @author yiminghe@gmail.com
 */
KISSY.add('event/dom/base/object', function (S, Event, undefined) {

    var doc = S.Env.host.document,
        TRUE = true,
        FALSE = false,
        props = ('type altKey attrChange attrName bubbles button cancelable ' +
            'charCode clientX clientY ctrlKey currentTarget data detail ' +
            'eventPhase fromElement handler keyCode metaKey ' +
            'newValue offsetX offsetY pageX pageY prevValue ' +
            'relatedNode relatedTarget screenX screenY shiftKey srcElement ' +
            'target toElement view wheelDelta which axis ' +
            'changedTouches touches targetTouches rotation scale').split(' ');

    /**
     * Do not new by yourself.
     *
     * KISSY 's dom event system normalizes the event object according to
     * W3C standards.
     *
     * The event object is guaranteed to be passed to
     * the event handler.
     *
     * Most properties from the original event are
     * copied over and normalized to the new event object
     * according to [W3C standards](http://www.w3.org/TR/dom/#event).
     *
     * @class KISSY.Event.DOMEventObject
     * @extends KISSY.Event.Object
     * @param domEvent native dom event
     */
    function DOMEventObject(domEvent) {
        var self = this;

        if ('@DEBUG@') {
            /**
             * altKey
             * @property altKey
             */
            self.altKey = undefined;
            /**
             * attrChange
             * @property attrChange
             */
            self.attrChange = undefined;
            /**
             * attrName
             * @property attrName
             */
            self.attrName = undefined;
            /**
             * bubbles
             * @property bubbles
             */
            self.bubbles = undefined;
            /**
             * button
             * @property button
             */
            self.button = undefined;
            /**
             * cancelable
             * @property cancelable
             */
            self.cancelable = undefined;
            /**
             * charCode
             * @property charCode
             */
            self.charCode = undefined;
            /**
             * clientX
             * @property clientX
             */
            self.clientX = undefined;
            /**
             * clientY
             * @property clientY
             */
            self.clientY = undefined;
            /**
             * ctrlKey
             * @property ctrlKey
             */
            self.ctrlKey = undefined;
            /**
             * data
             * @property data
             */
            self.data = undefined;
            /**
             * detail
             * @property detail
             */
            self.detail = undefined;
            /**
             * eventPhase
             * @property eventPhase
             */
            self.eventPhase = undefined;
            /**
             * fromElement
             * @property fromElement
             */
            self.fromElement = undefined;
            /**
             * handler
             * @property handler
             */
            self.handler = undefined;
            /**
             * keyCode
             * @property keyCode
             */
            self.keyCode = undefined;
            /**
             * metaKey
             * @property metaKey
             */
            self.metaKey = undefined;
            /**
             * newValue
             * @property newValue
             */
            self.newValue = undefined;
            /**
             * offsetX
             * @property offsetX
             */
            self.offsetX = undefined;
            /**
             * offsetY
             * @property offsetY
             */
            self.offsetY = undefined;
            /**
             * pageX
             * @property pageX
             */
            self.pageX = undefined;
            /**
             * pageY
             * @property pageY
             */
            self.pageY = undefined;
            /**
             * prevValue
             * @property prevValue
             */
            self.prevValue = undefined;
            /**
             * relatedNode
             * @property relatedNode
             */
            self.relatedNode = undefined;
            /**
             * relatedTarget
             * @property relatedTarget
             */
            self.relatedTarget = undefined;
            /**
             * screenX
             * @property screenX
             */
            self.screenX = undefined;
            /**
             * screenY
             * @property screenY
             */
            self.screenY = undefined;
            /**
             * shiftKey
             * @property shiftKey
             */
            self.shiftKey = undefined;
            /**
             * srcElement
             * @property srcElement
             */
            self.srcElement = undefined;

            /**
             * toElement
             * @property toElement
             */
            self.toElement = undefined;
            /**
             * view
             * @property view
             */
            self.view = undefined;
            /**
             * wheelDelta
             * @property wheelDelta
             */
            self.wheelDelta = undefined;
            /**
             * which
             * @property which
             */
            self.which = undefined;
            /**
             * changedTouches
             * @property changedTouches
             */
            self.changedTouches = undefined;
            /**
             * touches
             * @property touches
             */
            self.touches = undefined;
            /**
             * targetTouches
             * @property targetTouches
             */
            self.targetTouches = undefined;
            /**
             * rotation
             * @property rotation
             */
            self.rotation = undefined;
            /**
             * scale
             * @property scale
             */
            self.scale = undefined;
        }

        DOMEventObject.superclass.constructor.call(self);
        self.originalEvent = domEvent;
        // in case dom event has been mark as default prevented by lower dom node
        self.isDefaultPrevented = ( domEvent['defaultPrevented'] || domEvent.returnValue === FALSE ||
            domEvent['getPreventDefault'] && domEvent['getPreventDefault']() ) ? function () {
            return TRUE;
        } : function () {
            return FALSE;
        };
        fix(self);
        fixMouseWheel(self);
        /**
         * source html node of current event
         * @property target
         * @type {HTMLElement}
         */
        /**
         * current htm node which processes current event
         * @property currentTarget
         * @type {HTMLElement}
         */
    }

    function fix(self) {
        var originalEvent = self.originalEvent,
            l = props.length,
            prop,
            ct = originalEvent.currentTarget,
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

        // check if target is a text node (safari)
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
    }

    function fixMouseWheel(e) {
        var deltaX,
            deltaY,
            delta,
            detail = e.detail;

        // ie/webkit
        if (e.wheelDelta) {
            delta = e.wheelDelta / 120;
        }

        // gecko
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

        // 默认 deltaY (ie)
        if (!deltaX && !deltaY) {
            deltaY = delta;
        }

        if (deltaX !== undefined ||
            deltaY !== undefined ||
            delta !== undefined) {
            S.mix(e, {
                /**
                 * deltaY of mousewheel event
                 * @property deltaY
                 */
                deltaY: deltaY,
                /**
                 * delta of mousewheel event
                 * @property delta
                 */
                delta: delta,
                /**
                 * deltaX of mousewheel event
                 * @property deltaX
                 */
                deltaX: deltaX
            });
        }
    }

    S.extend(DOMEventObject, Event._Object, {

        constructor: DOMEventObject,

        preventDefault: function () {
            var e = this.originalEvent;

            // if preventDefault exists run it on the original event
            if (e.preventDefault) {
                e.preventDefault();
            }
            // otherwise set the returnValue property of the original event to FALSE (IE)
            else {
                e.returnValue = FALSE;
            }

            DOMEventObject.superclass.preventDefault.call(this);
        },

        stopPropagation: function () {
            var e = this.originalEvent;

            // if stopPropagation exists run it on the original event
            if (e.stopPropagation) {
                e.stopPropagation();
            }
            // otherwise set the cancelBubble property of the original event to TRUE (IE)
            else {
                e.cancelBubble = TRUE;
            }

            DOMEventObject.superclass.stopPropagation.call(this);
        }
    });

    // compatibility
    // Event.Object = S.EventObject = DOMEventObject;

    Event.DOMEventObject=DOMEventObject;

    return DOMEventObject;

}, {
    requires: ['event/base']
});

/*
 2012-10-30
 - consider touch properties

 2012-10-24
 - merge with mousewheel: not perfect in osx : accelerated scroll

 2010.04
 - http://www.w3.org/TR/2003/WD-DOM-Level-3-Events-20030331/ecma-script-binding.html

 - refer:
 https://github.com/brandonaaron/jquery-mousewheel/blob/master/jquery.mousewheel.js
 http://www.planabc.net/2010/08/12/mousewheel_event_in_javascript/
 http://www.switchonthecode.com/tutorials/javascript-tutorial-the-scroll-wheel
 http://stackoverflow.com/questions/5527601/normalizing-mousewheel-speed-across-browsers/5542105#5542105
 http://www.javascriptkit.com/javatutors/onmousewheel.shtml
 http://www.adomas.org/javascript-mouse-wheel/
 http://plugins.jquery.com/project/mousewheel
 http://www.cnblogs.com/aiyuchen/archive/2011/04/19/2020843.html
 http://www.w3.org/TR/DOM-Level-3-Events/#events-mousewheelevents
 *//**
 * @ignore
 * custom event for dom.
 * @author yiminghe@gmail.com
 */
KISSY.add('event/dom/base/observable', function (S, DOM, special, Utils, DOMEventObserver, DOMEventObject, Event) {

    // 记录手工 fire(domElement,type) 时的 type
    // 再在浏览器通知的系统 eventHandler 中检查
    // 如果相同，那么证明已经 fire 过了，不要再次触发了
    var _Utils = Event._Utils;

    /**
     * custom event for dom
     * @param {Object} cfg
     * @private
     * @class KISSY.Event.ObservableDOMEvent
     * @extends KISSY.Event.ObservableEvent
     */
    function ObservableDOMEvent(cfg) {
        var self = this;
        S.mix(self, cfg);
        self.reset();
        /**
         * html node which binds current custom event
         * @cfg {HTMLElement} currentTarget
         */
    }

    S.extend(ObservableDOMEvent, Event._ObservableEvent, {

        setup: function () {
            var self = this,
                type = self.type,
                s = special[type] || {},
                currentTarget = self.currentTarget,
                eventDesc = Utils.data(currentTarget),
                handle = eventDesc.handle;
            // 第一次注册该事件，dom 节点才需要注册 dom 事件
            if (!s.setup || s.setup.call(currentTarget, type) === false) {
                Utils.simpleAdd(currentTarget, type, handle)
            }
        },

        constructor: ObservableDOMEvent,

        reset: function () {
            var self = this;
            ObservableDOMEvent.superclass.reset.call(self);
            self.delegateCount = 0;
            self.lastCount = 0;
        },

        /**
         * notify current event 's observers
         * @param {KISSY.Event.DOMEventObject} event
         * @return {*} return false if one of custom event 's observers  else
         * return last value of custom event 's observers 's return value.
         */
        notify: function (event) {
            /*
             As some listeners may remove themselves from the
             event, the original array length is dynamic. So,
             let's make a copy of all listeners, so we are
             sure we'll call all of them.
             */
            /*
             DOM3 Events: EventListenerList objects in the DOM are live. ??
             */
            var target = event['target'],
                self = this,
                currentTarget = self.currentTarget,
                observers = self.observers,
                currentTarget0,
                allObservers = [],
                ret,
                gRet,
                observerObj,
                i,
                j,
                delegateCount = self.delegateCount || 0,
                len,
                currentTargetObservers,
                currentTargetObserver,
                observer;

            // collect delegated observers and corresponding element
            // by jq
            // Avoid disabled elements in IE (#6911)
            // non-left-click bubbling in Firefox (#3861),firefox 8 fix it
            if (delegateCount && !target.disabled) {
                while (target != currentTarget) {
                    currentTargetObservers = [];
                    for (i = 0; i < delegateCount; i++) {
                        observer = observers[i];
                        if (DOM.test(target, observer.selector)) {
                            currentTargetObservers.push(observer);
                        }
                    }
                    if (currentTargetObservers.length) {
                        allObservers.push({
                            currentTarget: target,
                            'currentTargetObservers': currentTargetObservers
                        });
                    }
                    target = target.parentNode || currentTarget;
                }
            }

            // root node's observers is placed at end position of add observers
            // in case child node stopPropagation of root node's observers
            allObservers.push({
                currentTarget: currentTarget,
                // http://www.w3.org/TR/dom/#dispatching-events
                // Let listeners be a static list of the event listeners
                // associated with the object for which these steps are run.
                currentTargetObservers: observers.slice(delegateCount)
            });

            for (i = 0, len = allObservers.length; !event.isPropagationStopped() && i < len; ++i) {

                observerObj = allObservers[i];
                currentTargetObservers = observerObj.currentTargetObservers;
                currentTarget0 = observerObj.currentTarget;
                event.currentTarget = currentTarget0;

                for (j = 0; !event.isImmediatePropagationStopped() && j < currentTargetObservers.length; j++) {

                    currentTargetObserver = currentTargetObservers[j];

                    ret = currentTargetObserver.notify(event, self);

                    // 和 jQuery 逻辑保持一致
                    // 有一个 false，最终结果就是 false
                    // 否则等于最后一个返回值
                    if (gRet !== false) {
                        gRet = ret;
                    }
                }
            }

            // fire 时判断如果 preventDefault，则返回 false 否则返回 true
            // 这里返回值意义不同
            return gRet;
        },

        /**
         * fire dom event from bottom to up , emulate dispatchEvent in DOM3 Events
         * @param {Object|KISSY.Event.DOMEventObject} [event] additional event data
         * @return {*} return false if one of custom event 's observers (include bubbled) else
         * return last value of custom event 's observers (include bubbled) 's return value.
         */
        fire: function (event, onlyHandlers/*internal usage*/) {

            event = event || {};

            var self = this,
                eventType = self.type,
                s = special[eventType];

            // TODO bug: when fire mouseenter, it also fire mouseover in firefox/chrome
            if (s && s['onFix']) {
                eventType = s['onFix'];
            }

            var customEvent,
                eventData,
                currentTarget = self.currentTarget,
                ret = true;

            event.type = eventType;

            if (!(event instanceof DOMEventObject)) {
                eventData = event;
                event = new DOMEventObject({
                    currentTarget: currentTarget,
                    target: currentTarget
                });
                S.mix(event, eventData);
            }

            // onlyHandlers is equal to event.halt()
            // but we can not call event.halt()
            // because handle will check event.isPropagationStopped
            var cur = currentTarget,
                t,
                win = DOM.getWindow(cur.ownerDocument || cur),
                curDocument = win.document,
                eventPath = [],
                eventPathIndex = 0,
                ontype = 'on' + eventType;


            // http://www.w3.org/TR/dom/#dispatching-events
            // let event path be a static ordered list of all its ancestors in tree order,
            // or let event path be the empty list otherwise.
            do {
                eventPath.push(cur);
                // Bubble up to document, then to window
                cur = cur.parentNode ||
                    cur.ownerDocument ||
                    (cur === curDocument) && win;
            } while (cur);

            cur = eventPath[eventPathIndex];

            // bubble up dom tree
            do {
                event.currentTarget = cur;
                customEvent = ObservableDOMEvent.getCustomEvent(cur, eventType);
                // default bubble for html node
                if (customEvent) {
                    t = customEvent.notify(event);
                    if (ret !== false) {
                        ret = t;
                    }
                }
                // Trigger an inline bound script
                if (cur[ ontype ] && cur[ ontype ].call(cur) === false) {
                    event.preventDefault();
                }

                cur = eventPath[++eventPathIndex];
            } while (!onlyHandlers && cur && !event.isPropagationStopped());

            if (!onlyHandlers && !event.isDefaultPrevented()) {

                // now all browser support click
                // https://developer.mozilla.org/en-US/docs/DOM/element.click

                var old;

                try {
                    // execute default action on dom node
                    // so exclude window
                    // exclude focus/blue on hidden element
                    if (ontype && currentTarget[ eventType ] &&
                        (
                            (
                                eventType !== 'focus' && eventType !== 'blur') ||
                                currentTarget.offsetWidth !== 0
                            ) &&
                        !S.isWindow(currentTarget)) {
                        // Don't re-trigger an onFOO event when we call its FOO() method
                        old = currentTarget[ ontype ];

                        if (old) {
                            currentTarget[ ontype ] = null;
                        }

                        // 记录当前 trigger 触发
                        ObservableDOMEvent.triggeredEvent = eventType;

                        // 只触发默认事件，而不要执行绑定的用户回调
                        // 同步触发
                        currentTarget[ eventType ]();
                    }
                } catch (eError) {
                    S.log('trigger action error: ');
                    S.log(eError);
                }

                if (old) {
                    currentTarget[ ontype ] = old;
                }

                ObservableDOMEvent.triggeredEvent = '';

            }
            return ret;
        },

        /**
         * add a observer to custom event's observers
         * @param {Object} cfg {@link KISSY.Event.DOMEventObserver} 's config
         */
        on: function (cfg) {
            var self = this,
                observers = self.observers,
                s = special[self.type] || {},
            // clone event
                observer = cfg instanceof DOMEventObserver ? cfg : new DOMEventObserver(cfg);

            if (self.findObserver(observer) == -1) {
                // 增加 listener
                if (observer.selector) {
                    observers.splice(self.delegateCount, 0, observer);
                    self.delegateCount++;
                } else {
                    if (observer.last) {
                        observers.push(observer);
                        self.lastCount++;
                    } else {
                        observers.splice(observers.length - self.lastCount, 0, observer);
                    }
                }

                if (s.add) {
                    s.add.call(self.currentTarget, observer);
                }
            }
        },

        /**
         * remove some observers from current event 's observers by observer config param
         * @param {Object} cfg {@link KISSY.Event.DOMEventObserver} 's config
         */
        detach: function (cfg) {
            var groupsRe,
                self = this,
                s = special[self.type] || {},
                hasSelector = 'selector' in cfg,
                selector = cfg.selector,
                context = cfg.context,
                fn = cfg.fn,
                currentTarget = self.currentTarget,
                observers = self.observers,
                groups = cfg.groups;

            if (!observers.length) {
                return;
            }

            if (groups) {
                groupsRe = _Utils.getGroupsRe(groups);
            }

            var i, j, t, observer, observerContext, len = observers.length;

            // 移除 fn
            if (fn || hasSelector || groupsRe) {
                context = context || currentTarget;

                for (i = 0, j = 0, t = []; i < len; ++i) {
                    observer = observers[i];
                    observerContext = observer.context || currentTarget;
                    if (
                        (context != observerContext) ||
                            // 指定了函数，函数不相等，保留
                            (fn && fn != observer.fn) ||
                            // 1.没指定函数
                            // 1.1 没有指定选择器,删掉 else2
                            // 1.2 指定选择器,字符串为空
                            // 1.2.1 指定选择器,字符串为空,待比较 observer 有选择器,删掉 else
                            // 1.2.2 指定选择器,字符串为空,待比较 observer 没有选择器,保留
                            // 1.3 指定选择器,字符串不为空,字符串相等,删掉 else
                            // 1.4 指定选择器,字符串不为空,字符串不相等,保留
                            // 2.指定了函数且函数相等
                            // 2.1 没有指定选择器,删掉 else
                            // 2.2 指定选择器,字符串为空
                            // 2.2.1 指定选择器,字符串为空,待比较 observer 有选择器,删掉 else
                            // 2.2.2 指定选择器,字符串为空,待比较 observer 没有选择器,保留
                            // 2.3 指定选择器,字符串不为空,字符串相等,删掉  else
                            // 2.4 指定选择器,字符串不为空,字符串不相等,保留
                            (
                                hasSelector &&
                                    (
                                        (selector && selector != observer.selector) ||
                                            (!selector && !observer.selector)
                                        )
                                ) ||

                            // 指定了删除的某些组，而该 observer 不属于这些组，保留，否则删除
                            (groupsRe && !observer.groups.match(groupsRe))
                        ) {
                        t[j++] = observer;
                    } else {
                        if (observer.selector && self.delegateCount) {
                            self.delegateCount--;
                        }
                        if (observer.last && self.lastCount) {
                            self.lastCount--;
                        }
                        if (s.remove) {
                            s.remove.call(currentTarget, observer);
                        }
                    }
                }

                self.observers = t;
            } else {
                // 全部删除
                self.reset();
            }

            self.checkMemory();
        },

        checkMemory: function () {
            var self = this,
                type = self.type,
                events,
                handle,
                s = special[type] || {},
                currentTarget = self.currentTarget,
                eventDesc = Utils.data(currentTarget);
            if (eventDesc) {
                events = eventDesc.events;
                if (!self.hasObserver()) {
                    handle = eventDesc.handle;
                    // remove(el, type) or fn 已移除光
                    // dom node need to detach handler from dom node
                    if ((!s['tearDown'] || s['tearDown'].call(currentTarget, type) === false)) {
                        Utils.simpleRemove(currentTarget, type, handle);
                    }
                    // remove currentTarget's single event description
                    delete events[type];
                }

                // remove currentTarget's  all events description
                if (S.isEmptyObject(events)) {
                    eventDesc.handle = null;
                    Utils.removeData(currentTarget);
                }
            }
        }
    });

    ObservableDOMEvent.triggeredEvent = '';

    /**
     * get custom event from html node by event type.
     * @param {HTMLElement} node
     * @param {String} type event type
     * @return {KISSY.Event.ObservableDOMEvent}
     */
    ObservableDOMEvent.getCustomEvent = function (node, type) {

        var eventDesc = Utils.data(node), events;
        if (eventDesc) {
            events = eventDesc.events;
        }
        if (events) {
            return events[type];
        }

        return undefined;
    };


    ObservableDOMEvent.getCustomEvents = function (node, create) {
        var eventDesc = Utils.data(node);
        if (!eventDesc && create) {
            Utils.data(node, eventDesc = {});
        }
        return eventDesc;
    };

    return ObservableDOMEvent;

}, {
    requires: ['dom', './special', './utils', './observer', './object', 'event/base']
});/**
 * @ignore
 * observer for dom event.
 * @author yiminghe@gmail.com
 */
KISSY.add('event/dom/base/observer', function (S, special, Event) {

    /**
     * observer for dom event
     * @class KISSY.Event.DOMEventObserver
     * @extends KISSY.Event.Observer
     * @private
     */
    function DOMEventObserver(cfg) {
        DOMEventObserver.superclass.constructor.apply(this, arguments);
        /**
         * filter selector string or function to find right element
         * @cfg {String} selector
         */
        /**
         * extra data as second parameter of listener
         * @cfg {*} data
         */
    }

    S.extend(DOMEventObserver, Event._Observer, {

        keys: ['fn', 'selector', 'data', 'context', 'originalType', 'groups', 'last'],

        notifyInternal: function (event, ce) {
            var self = this,
                s, t, ret,
                type = event.type;

            // restore originalType if involving delegate/onFix handlers
            if (self.originalType) {
                event.type = self.originalType;
            }

            // context undefined 时不能写死在 listener 中，否则不能保证 clone 时的 this
            if ((s = special[event.type]) && s.handle) {
                t = s.handle(event, self, ce);
                // can handle
                if (t && t.length > 0) {
                    ret = t[0];
                }
            } else {
                ret = self.simpleNotify(event, ce);
            }

            event.type = type;

            return ret;
        }

    });

    return DOMEventObserver;

}, {
    requires: ['./special', 'event/base']
});/**
 * @ignore
 *  special house for special events
 * @author yiminghe@gmail.com
 */
KISSY.add('event/dom/base/special', function () {
    return {};
});/**
 * @ignore
 *  utils for event
 * @author yiminghe@gmail.com
 */
KISSY.add('event/dom/base/utils', function (S, DOM) {
    var EVENT_GUID = 'ksEventTargetId_1.30',
        doc = S.Env.host.document,
        simpleAdd = doc && doc.addEventListener ?
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
        simpleRemove = doc && doc.removeEventListener ?
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
        simpleAdd: simpleAdd,

        simpleRemove: simpleRemove,

        data: function (elem, v) {
            return DOM.data(elem, EVENT_GUID, v);
        },

        removeData: function (elem) {
            return DOM.removeData(elem, EVENT_GUID);
        }
    };

}, {
    requires: ['dom']
});/**
 * @ignore
 *  inspired by yui3
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
KISSY.add('event/dom/base/valuechange', function (S, Event, DOM, special) {
    var VALUE_CHANGE = 'valuechange',
        getNodeName = DOM.nodeName,
        KEY = 'event/valuechange',
        HISTORY_KEY = KEY + '/history',
        POLL_KEY = KEY + '/poll',
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
            // allow delegate
            Event.fireHandler(target, VALUE_CHANGE, {
                prevVal: h,
                newVal: v
            });
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
        if (ev.type == 'focus') {
            DOM.data(target, HISTORY_KEY, target.value);
        }
        startPoll(target);
    }

    function webkitSpeechChangeHandler(e) {
        checkChange(e.target);
    }

    function monitor(target) {
        unmonitored(target);
        Event.on(target, 'blur', stopPollHandler);
        // fix #94
        // see note 2012-02-08
        Event.on(target, 'webkitspeechchange', webkitSpeechChangeHandler);
        Event.on(target, 'mousedown keyup keydown focus', startPollHandler);
    }

    function unmonitored(target) {
        stopPoll(target);
        Event.remove(target, 'blur', stopPollHandler);
        Event.remove(target, 'webkitspeechchange', webkitSpeechChangeHandler);
        Event.remove(target, 'mousedown keyup keydown focus', startPollHandler);
    }

    special[VALUE_CHANGE] = {
        setup: function () {
            var target = this, nodeName = getNodeName(target);
            if (nodeName == 'input' || nodeName == 'textarea') {
                monitor(target);
            }
        },
        tearDown: function () {
            var target = this;
            unmonitored(target);
        }
    };
    return Event;
}, {
    requires: ['./api', 'dom', './special']
});

/*
 2012-02-08 yiminghe@gmail.com note about webkitspeechchange :
 当 input 没焦点立即点击语音
 -> mousedown -> blur -> focus -> blur -> webkitspeechchange -> focus
 第二次：
 -> mousedown -> blur -> webkitspeechchange -> focus
 */
/*
Copyright 2012, KISSY UI Library v1.30
MIT Licensed
build time: Dec 20 22:27
*/
/**
 * @ignore
 * @fileOverview event-focusin
 * @author yiminghe@gmail.com
 */
KISSY.add('event/dom/focusin', function (S, Event) {

    var special = Event._Special;

    // 让非 IE 浏览器支持 focusin/focusout

    S.each([
        { name: 'focusin', fix: 'focus' },
        { name: 'focusout', fix: 'blur' }
    ], function (o) {
        var key = S.guid('attaches_' + S.now() + '_');
        special[o.name] = {
            // 统一在 document 上 capture focus/blur 事件，然后模拟冒泡 fire 出来
            // 达到和 focusin 一样的效果 focusin -> focus
            // refer: http://yiminghe.iteye.com/blog/813255
            setup: function () {
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

            tearDown: function () {
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

    return Event;
}, {
    requires: ['event/dom/base']
});

/*
 yiminghe@gmail.com:2011-06-07
 - 更加合理的模拟冒泡顺序，子元素先出触发，父元素后触发
 */
/*
Copyright 2012, KISSY UI Library v1.30
MIT Licensed
build time: Dec 20 22:27
*/
/**
 * @ignore
 * @fileOverview hashchange event for non-standard browser
 * @author yiminghe@gmail.com, xiaomacji@gmail.com
 */
KISSY.add('event/dom/hashchange', function (S, Event, DOM) {

    var UA = S.UA,
        special = Event._Special,
        win = S.Env.host,
        doc = win.document,
        docMode = doc && doc['documentMode'],
        REPLACE_HISTORY = '__replace_history_' + S.now(),
        ie = docMode || UA['ie'],
        HASH_CHANGE = 'hashchange';

    Event.REPLACE_HISTORY = REPLACE_HISTORY;

    // 1. 不支持 hashchange 事件，支持 hash 历史导航(opera??)：定时器监控
    // 2. 不支持 hashchange 事件，不支持 hash 历史导航(ie67) : iframe + 定时器

    function getIframeDoc(iframe) {
        return iframe.contentWindow.document;
    }

    var POLL_INTERVAL = 50,
        IFRAME_TEMPLATE = '<html><head><title>' + (doc && doc.title || '') +
            ' - {hash}</title>{head}</head><body>{hash}</body></html>',

        getHash = function () {
            // 不能 location.hash
            // 1.
            // http://xx.com/#yy?z=1
            // ie6 => location.hash = #yy
            // 其他浏览器 => location.hash = #yy?z=1
            // 2.
            // #!/home/q={%22thedate%22:%2220121010~20121010%22}
            // firefox 15 => #!/home/q={"thedate":"20121010~20121010"}
            // !! :(
            var uri = new S.Uri(location.href);
            return '#' + uri.getFragment();
        },

        timer,

    // 用于定时器检测，上次定时器记录的 hash 值
        lastHash,

        poll = function () {
            var hash = getHash(), replaceHistory;
            if (replaceHistory = S.endsWith(hash, REPLACE_HISTORY)) {
                hash = hash.slice(0, -REPLACE_HISTORY.length);
                // 去除 ie67 hack 标记
                location.hash = hash;
            }
            if (hash !== lastHash) {
                // S.log('poll success :' + hash + ' :' + lastHash);
                // 通知完调用者 hashchange 事件前设置 lastHash
                lastHash = hash;
                // ie<8 同步 : hashChange -> onIframeLoad
                hashChange(hash, replaceHistory);
            }
            timer = setTimeout(poll, POLL_INTERVAL);
        },

        hashChange = ie && ie < 8 ? function (hash, replaceHistory) {
            // S.log('set iframe html :' + hash);
            var html = S.substitute(IFRAME_TEMPLATE, {
                    // 防止 hash 里有代码造成 xss
                    // 后面通过 innerText，相当于 unEscapeHTML
                    hash: S.escapeHTML(hash),
                    // 一定要加哦
                    head: DOM.isCustomDomain() ? ("<script>" +
                        "document." +
                        "domain = '" +
                        doc.domain
                        + "';</script>") : ''
                }),
                iframeDoc = getIframeDoc(iframe);
            try {
                // ie 下不留历史记录！
                if (replaceHistory) {
                    iframeDoc.open("text/html", "replace");
                } else {
                    // 写入历史 hash
                    iframeDoc.open();
                }
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
            // S.log('hash changed : ' + getHash());
            // does not need bubbling
            Event.fireHandler(win, HASH_CHANGE);
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
    if (ie && ie < 8) {

        /*
         前进后退 : start -> notifyHashChange
         直接输入 : poll -> hashChange -> start
         iframe 内容和 url 同步
         */
        setup = function () {
            if (!iframe) {
                var iframeSrc = DOM.getEmptyIframeSrc();
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
                Event.add(iframe, 'load', function () {
                    Event.remove(iframe, 'load');
                    // Update the iframe with the initial location hash, if any. This
                    // will create an initial history entry that the user can return to
                    // after the state has changed.
                    hashChange(getHash());
                    Event.add(iframe, 'load', onIframeLoad);
                    poll();
                });

                // Whenever `document.title` changes, update the Iframe's title to
                // prettify the back/next history menu entries. Since IE sometimes
                // errors with 'Unspecified error' the very first time this is set
                // (yes, very useful) wrap this with a try/catch block.
                doc.onpropertychange = function () {
                    try {
                        if (event.propertyName === 'title') {
                            getIframeDoc(iframe).title =
                                doc.title + ' - ' + getHash();
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
                        S.log('set loc hash :' + c);
                        location.hash = c;
                        // 使 last hash 为 iframe 历史， 不然重新写iframe，
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
        setup: function () {
            if (this !== win) {
                return;
            }
            // 第一次启动 hashchange 时取一下，不能类库载入后立即取
            // 防止类库嵌入后，手动修改过 hash，
            lastHash = getHash();
            // 不用注册 dom 事件
            setup();
        },
        tearDown: function () {
            if (this !== win) {
                return;
            }
            tearDown();
        }
    };
}, {
    requires: ['event/dom/base', 'dom']
});

/*
 已知 bug :
 - ie67 有时后退后取得的 location.hash 不和地址栏一致，导致必须后退两次才能触发 hashchange

 v1 : 2010-12-29
 v1.1: 支持非IE，但不支持onhashchange事件的浏览器(例如低版本的firefox、safari)
 refer : http://yiminghe.javaeye.com/blog/377867
 https://github.com/cowboy/jquery-hashchange
 */
/*
Copyright 2012, KISSY UI Library v1.30
MIT Licensed
build time: Dec 20 22:27
*/
/**
 * @ignore
 * @fileOverview  change bubble and checkbox/radio fix patch for ie<9
 * @author yiminghe@gmail.com
 */
KISSY.add('event/dom/ie/change', function (S, Event, DOM) {
    var special = Event._Special,
        R_FORM_EL = /^(?:textarea|input|select)$/i;

    function isFormElement(n) {
        return R_FORM_EL.test(n.nodeName);
    }

    function isCheckBoxOrRadio(el) {
        var type = el.type;
        return type == 'checkbox' || type == 'radio';
    }

    special['change'] = {
        setup: function () {
            var el = this;
            if (isFormElement(el)) {
                // checkbox/radio only fires change when blur in ie<9
                // so use another technique from jquery
                if (isCheckBoxOrRadio(el)) {
                    // change in ie<9
                    // change = propertychange -> click
                    Event.on(el, 'propertychange', propertyChange);
                    Event.on(el, 'click', onClick);
                } else {
                    // other form elements use native , do not bubble
                    return false;
                }
            } else {
                // if bind on parentNode ,lazy bind change event to its form elements
                // note event order : beforeactivate -> change
                // note 2: checkbox/radio is exceptional
                Event.on(el, 'beforeactivate', beforeActivate);
            }
        },
        tearDown: function () {
            var el = this;
            if (isFormElement(el)) {
                if (isCheckBoxOrRadio(el)) {
                    Event.remove(el, 'propertychange', propertyChange);
                    Event.remove(el, 'click', onClick);
                } else {
                    return false;
                }
            } else {
                Event.remove(el, 'beforeactivate', beforeActivate);
                S.each(DOM.query('textarea,input,select', el), function (fel) {
                    if (fel.__changeHandler) {
                        fel.__changeHandler = 0;
                        Event.remove(fel, 'change', {fn: changeHandler, last: 1});
                    }
                });
            }
        }
    };

    function propertyChange(e) {
        // if only checked property 's value is changed
        if (e.originalEvent.propertyName == 'checked') {
            this.__changed = 1;
        }
    }

    function onClick(e) {
        // only fire change after click and checked is changed
        // (only fire change after click on previous unchecked radio)
        if (this.__changed) {
            this.__changed = 0;
            // fire from itself
            Event.fire(this, 'change', e);
        }
    }

    function beforeActivate(e) {
        var t = e.target;
        if (isFormElement(t) && !t.__changeHandler) {
            t.__changeHandler = 1;
            // lazy bind change , always as last handler among user's handlers
            Event.on(t, 'change', {fn: changeHandler, last: 1});
        }
    }

    function changeHandler(e) {
        var fel = this;

        if (
        // in case stopped by user's callback,same with submit
        // http://bugs.jquery.com/ticket/11049
        // see : test/change/bubble.html
            e.isPropagationStopped() ||
                // checkbox/radio already bubble using another technique
                isCheckBoxOrRadio(fel)) {
            return;
        }
        var p;
        if (p = fel.parentNode) {
            // fire from parent , itself is handled natively
            Event.fire(p, 'change', e);
        }
    }
}, {
    requires: ['event/dom/base', 'dom']
});/**
 * patch collection for ie<9
 * @author yiminghe@gmail.com
 */
KISSY.add('event/dom/ie', function () {

}, {
    requires: ['./ie/change', './ie/submit']
});/**
 * @ignore
 * @fileOverview patch for ie<9 submit: does not bubble !
 * @author yiminghe@gmail.com
 */
KISSY.add('event/dom/ie/submit', function (S, Event, DOM) {

    var special = Event._Special,
        getNodeName = DOM.nodeName;

    special['submit'] = {
        setup: function () {
            var el = this;
            // form use native
            if (getNodeName(el) == 'form') {
                return false;
            }
            // lazy add submit for inside forms
            // note event order : click/keypress -> submit
            // key point : find the forms
            Event.on(el, 'click keypress', detector);
        },
        tearDown: function () {
            var el = this;
            // form use native
            if (getNodeName(el) == 'form') {
                return false;
            }
            Event.remove(el, 'click keypress', detector);
            S.each(DOM.query('form', el), function (form) {
                if (form.__submit__fix) {
                    form.__submit__fix = 0;
                    Event.remove(form, 'submit', {
                        fn: submitBubble,
                        last: 1
                    });
                }
            });
        }
    };


    function detector(e) {
        var t = e.target,
            nodeName = getNodeName(t),
            form = (nodeName == 'input' || nodeName == 'button') ? t.form : null;

        if (form && !form.__submit__fix) {
            form.__submit__fix = 1;
            Event.on(form, 'submit', {
                fn: submitBubble,
                last: 1
            });
        }
    }

    function submitBubble(e) {
        var form = this;
        if (form.parentNode &&
            // it is stopped by user callback
            !e.isPropagationStopped() &&
            // it is not fired manually
            !e.synthetic) {
            // simulated bubble for submit
            // fire from parentNode. if form.on('submit') , this logic is never run!
            Event.fire(form.parentNode, 'submit', e);
        }
    }

}, {
    requires: ['event/dom/base', 'dom']
});
/*
 modified from jq, fix submit in ie<9
 - http://bugs.jquery.com/ticket/11049
 */
/*
Copyright 2012, KISSY UI Library v1.30
MIT Licensed
build time: Dec 20 22:27
*/
/**
 * @ignore
 * simulate shake gesture by listening devicemotion event
 * @author yiminghe@gmail.com
 */
KISSY.add('event/dom/shake', function (S, EventDomBase, undefined) {
    var Special = EventDomBase._Special,
        start = 5,
        enough = 20,
        shaking = 0,
        lastX, lastY, lastZ,
        max = Math.max,
        abs = Math.abs,
        win = S.Env.host,
        devicemotion = 'devicemotion',
        checkShake = S.buffer(function () {
            if (shaking) {
                EventDomBase.fireHandler(win, 'shake', {
                    accelerationIncludingGravity: {
                        x: lastX,
                        y: lastY,
                        z: lastZ
                    }
                });
                clear();
            }
        }, 250);

    // only for window
    Special['shake'] = {
        setup: function () {
            if (this != win) {
                return;
            }
            win.addEventListener(devicemotion, shake, false);
        },
        tearDown: function () {
            if (this != win) {
                return;
            }
            checkShake.stop();
            clear();
            win.removeEventListener(devicemotion, shake, false);
        }
    };

    function clear() {
        lastX = undefined;
        shaking = 0;
    }

    function shake(e) {
        var accelerationIncludingGravity = e.accelerationIncludingGravity,
            x = accelerationIncludingGravity.x,
            y = accelerationIncludingGravity.y,
            z = accelerationIncludingGravity.z,
            diff;
        if (lastX !== undefined) {
            diff = max(abs(x - lastX), abs(y - lastY), abs(z - lastZ));
            if (diff > start) {
                checkShake();
            }
            if (diff > enough) {
                // console.log(diff);
                // console.log(x,lastX,y,lastY,z,lastZ);
                shaking = 1;
            }
            // console.log(x);
        }
        lastX = x;
        lastY = y;
        lastZ = z;
    }
}, {
    requires: ['event/dom/base']
});
/**
 * @ignore
 * refer:
 *  - http://www.mobilexweb.com/blog/safari-ios-accelerometer-websockets-html5
 *  - http://www.mobilexweb.com/blog/safari-ios-accelerometer-websockets-html5
 *  - http://bbs.ajaxjs.com/forumdisplay.php?fid=54
 *  - http://bbs.ajaxjs.com/viewthread.php?tid=3549
 *  - https://developer.apple.com/library/safari/#documentation/SafariDOMAdditions/Reference/DeviceMotionEventClassRef/DeviceMotionEvent/DeviceMotionEvent.html
 *  - http://www.html5rocks.com/en/tutorials/device/orientation/
 *  - https://gist.github.com/3061490
 *  - http://www.eleqtriq.com/2010/05/css-3d-matrix-transformations/
 *  - http://dev.w3.org/geo/api/spec-source-orientation
 */
/*
Copyright 2013, KISSY UI Library v1.30
MIT Licensed
build time: Jan 28 14:33
*/
/**
 * @ignore
 * gesture single tap double tap
 * @author yiminghe@gmail.com
 */
KISSY.add('event/dom/touch/double-tap',
    function (S, eventHandleMap, Event, SingleTouch) {

        var SINGLE_TAP = 'singleTap',
            DOUBLE_TAP = 'doubleTap',
        // same with native click delay
            MAX_DURATION = 300;

        function DoubleTap() {
        }

        S.extend(DoubleTap, SingleTouch, {

            onTouchStart: function (e) {
                var self = this;
                if (DoubleTap.superclass.onTouchStart.apply(self, arguments) === false) {
                    return false;
                }
                self.startTime = e.timeStamp;
                if (self.singleTapTimer) {
                    clearTimeout(self.singleTapTimer);
                    self.singleTapTimer = 0;
                }
            },

            onTouchMove: function () {
                return false;
            },

            onTouchEnd: function (e) {
                var self = this,
                    lastEndTime = self.lastEndTime,
                    time = e.timeStamp,
                    target = e.target,
                    touch = e.changedTouches[0],
                    duration = time - self.startTime;
                self.lastEndTime = time;
                // second touch end
                if (lastEndTime) {
                    // time between current up and last up
                    duration = time - lastEndTime;
                    // a double tap
                    if (duration < MAX_DURATION) {
                        // a new double tap cycle
                        self.lastEndTime = 0;

                        Event.fire(target, DOUBLE_TAP, {
                            touch: touch,
                            duration: duration / 1000
                        });
                        return;
                    }
                    // else treat as the first tap cycle
                }

                // time between down and up is long enough
                // then a singleTap
                duration = time - self.startTime;
                if (duration > MAX_DURATION) {
                    Event.fire(target, SINGLE_TAP, {
                        touch: touch,
                        duration: duration / 1000
                    })
                } else {
                    // buffer singleTap
                    // wait for a second tap
                    self.singleTapTimer = setTimeout(function () {
                        Event.fire(target, SINGLE_TAP, {
                            touch: touch,
                            duration: duration / 1000
                        });
                    }, MAX_DURATION);
                }

            }
        });

        eventHandleMap[SINGLE_TAP] = eventHandleMap[DOUBLE_TAP] = {
            handle: new DoubleTap()
        };

        return DoubleTap;

    }, {
        requires: ['./handle-map', 'event/dom/base', './single-touch']
    });/**
 * @ignore
 * patch gesture for touch
 * @author yiminghe@gmail.com
 */
KISSY.add('event/dom/touch/gesture', function (S, EventDomBase) {
    var Gesture = EventDomBase.Gesture,
        Features = S.Features,
        startEvent,
        moveEvent,
        endEvent;

    // 不能同时绑定 touchstart 与 mousedown 会导致 ios 不能选择文本
    // bind mousedown to turn element into clickable element
    if (Features.isTouchSupported()) {
        startEvent = 'touchstart';
        moveEvent = 'touchmove';
        endEvent = 'touchend';
    }


//    else if (Features.isMsPointerEnabled) {
//        startEvent = 'MSPointerDown';
//        moveEvent = 'MSPointerMove';
//        endEvent = 'MSPointerUp';
//    }

    // force to load event/dom/touch in pc to use mouse to simulate touch
    if (startEvent) {
        Gesture.start = startEvent;
        Gesture.move = moveEvent;
        Gesture.end = endEvent;
        Gesture.tap = 'tap';
        Gesture.doubleTap = 'doubleTap';
    }

    return Gesture;
}, {
    requires: ['event/dom/base']
});/**
 * @ignore
 * handles for gesture events
 * @author yiminghe@gmail.com
 */
KISSY.add('event/dom/touch/handle-map', function () {

    return {

    };

});/**
 * @ignore
 * base handle for touch gesture
 * @author yiminghe@gmail.com
 */
KISSY.add('event/dom/touch/handle', function (S, DOM, eventHandleMap, Event, Gesture) {

    'use strict';

    var key = S.guid('touch-handle'),
        Features = S.Features,
        MOVE_DELAY = 30,
        touchEvents = {
        };

    touchEvents[Gesture.start] = 'onTouchStart';
    touchEvents[Gesture.move] = 'onTouchMove';
    touchEvents[Gesture.end] = 'onTouchEnd';

    if (Gesture.start !== 'mousedown') {
        touchEvents.touchcancel = 'onTouchEnd';
    }

    function DocumentHandler(doc) {

        var self = this;

        self.doc = doc;

        self.eventHandle = {
        };

        self.init();

    }

    // 一个应用 一个 document 只需要注册一个 move
    var throttleTouchMove = S.throttle(function (e) {
        this.callEventHandle('onTouchMove', e);
    }, MOVE_DELAY);

    DocumentHandler.prototype = {

        init: function () {
            var self = this,
                doc = self.doc,
                e, h;

            for (e in touchEvents) {
                h = touchEvents[e];
                Event.on(doc, e, self[h], self);
            }
        },

        normalize: function (e) {
            var type = e.type,
                notUp,
                touchList;
            if (Features.isTouchSupported()) {
                return e;
            } else {
                if (type.indexOf('mouse') != -1 && e.which != 1) {
                    return undefined;
                }
                touchList = [e];
                notUp = !type.match(/up$/i);
                e.touches = notUp ? touchList : [];
                e.targetTouches = notUp ? touchList : [];
                e.changedTouches = touchList;
                return e;
            }
        },

        onTouchMove: function (e) {
            throttleTouchMove.call(this, e);
        },

        onTouchStart: function (event) {
            var e, h,
                self = this,
                eventHandle = self.eventHandle;
            for (e in eventHandle) {
                h = eventHandle[e];
                h.isActive = 1;
            }
            self.callEventHandle('onTouchStart', event);
        },

        onTouchEnd: function (event) {
            this.callEventHandle('onTouchEnd', event);
        },

        callEventHandle: function (method, event) {
            var self = this,
                eventHandle = self.eventHandle,
                e, h;
            event = self.normalize(event);
            if (event) {
                for (e in eventHandle) {
                    // event processor shared by multiple events
                    h = eventHandle[e];
                    if (h.processed) {
                        continue;
                    }
                    h.processed = 1;
                    if (h.isActive && h[method](event) === false) {
                        h.isActive = 0;
                    }
                }

                for (e in eventHandle) {
                    h = eventHandle[e];
                    h.processed = 0;
                }
            }
        },

        addEventHandle: function (event) {
            var self = this,
                handle = eventHandleMap[event].handle;
            if (!self.eventHandle[event]) {
                self.eventHandle[event] = handle;
            }
        },

        'removeEventHandle': function (event) {
            delete this.eventHandle[event];
        },

        destroy: function () {
            var self = this,
                doc = self.doc,
                e, h;
            for (e in touchEvents) {
                h = touchEvents[e];
                Event.detach(doc, e, self[h], self);
            }
        }

    };

    return {

        addDocumentHandle: function (el, event) {
            var win = DOM.getWindow(el.ownerDocument || el),
                doc = win.document,
                setup = eventHandleMap[event].setup,
                handle = DOM.data(doc, key);
            if (!handle) {
                DOM.data(doc, key, handle = new DocumentHandler(doc));
            }
            if (setup) {
                setup.call(el, event);
            }
            handle.addEventHandle(event);
        },

        removeDocumentHandle: function (el, event) {
            var win = DOM.getWindow(el.ownerDocument || el),
                doc = win.document,
                tearDown = eventHandleMap[event].tearDown,
                handle = DOM.data(doc, key);
            if (tearDown) {
                tearDown.call(el, event);
            }
            if (handle) {
                handle.removeEventHandle(event);
                if (S.isEmptyObject(handle.eventHandle)) {
                    handle.destroy();
                    DOM.removeData(doc, key);
                }
            }
        }

    };

}, {
    requires: [
        'dom',
        './handle-map',
        'event/dom/base',
        './gesture',
        './tap',
        './swipe',
        './double-tap',
        './pinch',
        './tap-hold',
        './rotate'
    ]
});/**
 * @ignore
 * multi-touch base
 * @author yiminghe@gmail.com
 */
KISSY.add('event/dom/touch/multi-touch', function (S, DOM) {

    function MultiTouch() {
    }

    MultiTouch.prototype = {

        requiredTouchCount: 2,

        onTouchStart: function (e) {
            var self = this,
                requiredTouchesCount = self.requiredTouchCount,
                touches = e.touches,
                touchesCount = touches.length;

            if (touchesCount === requiredTouchesCount) {
                self.start();
            }
            else if (touchesCount > requiredTouchesCount) {
                self.end(e);
            }
        },

        onTouchEnd: function (e) {
            this.end(e);
        },

        start: function () {
            var self = this;
            if (!self.isTracking) {
                self.isTracking = true;
                self.isStarted = false;
            }
        },

        fireEnd: S.noop,

        getCommonTarget: function (e) {
            var touches = e.touches,
                t1 = touches[0].target,
                t2 = touches[1].target;
            if (t1 == t2) {
                return t1;
            }
            if (DOM.contains(t1, t2)) {
                return t1;
            }

            while (1) {
                if (DOM.contains(t2, t1)) {
                    return t2;
                }
                t2 = t2.parentNode;
            }
            S.error('getCommonTarget error!');
            return undefined;
        },

        end: function (e) {
            var self = this;
            if (self.isTracking) {
                self.isTracking = false;

                if (self.isStarted) {
                    self.isStarted = false;
                    self.fireEnd(e);
                }
            }
        }
    };

    return MultiTouch;

}, {
    requires: ['dom']
});/**
 * @ignore
 * gesture pinch
 * @author yiminghe@gmail.com
 */
KISSY.add('event/dom/touch/pinch', function (S, eventHandleMap, Event, MultiTouch, Gesture) {

    var PINCH = 'pinch',
        PINCH_START = 'pinchStart',
        PINCH_END = 'pinchEnd';

    function getDistance(p1, p2) {
        var deltaX = p1.pageX - p2.pageX,
            deltaY = p1.pageY - p2.pageY;
        return Math.sqrt(deltaX * deltaX + deltaY * deltaY);
    }

    function Pinch() {
    }

    S.extend(Pinch, MultiTouch, {

        onTouchMove: function (e) {
            var self = this;

            if (!self.isTracking) {
                return;
            }

            var touches = e.touches;
            var distance = getDistance(touches[0], touches[1]);

            self.lastTouches = touches;

            if (!self.isStarted) {
                self.isStarted = true;
                self.startDistance = distance;
                var target = self.target = self.getCommonTarget(e);

                Event.fire(target,
                    PINCH_START, S.mix(e, {
                        distance: distance,
                        scale: 1
                    }));
            } else {
                Event.fire(self.target,
                    PINCH, S.mix(e, {
                        distance: distance,
                        scale: distance / self.startDistance
                    }));
            }
        },

        fireEnd: function (e) {
            var self = this;
            Event.fire(self.target, PINCH_END, S.mix(e, {
                touches: self.lastTouches
            }));
        }

    });

    var p = new Pinch();

    eventHandleMap[PINCH_START] =
        eventHandleMap[PINCH_END] = {
            handle: p
        };

    function preventTwoFinger(e) {
        // android can not throttle
        // need preventDefault always
        if (!e.touches || e.touches.length == 2) {
            e.preventDefault();
        }
    }

    eventHandleMap[PINCH] = {
        handle: p,
        setup: function () {
            Event.on(this, Gesture.move, preventTwoFinger);
        },
        tearDown: function () {
            Event.detach(this, Gesture.move, preventTwoFinger);
        }
    };

    return Pinch;

}, {
    requires: ['./handle-map', 'event/dom/base', './multi-touch', './gesture']
});/**
 * @ignore
 * fired when rotate using two fingers
 * @author yiminghe@gmail.com
 */
KISSY.add('event/dom/touch/rotate', function (S, eventHandleMap, MultiTouch, Event, Gesture, undefined) {
    var ROTATE_START = 'rotateStart',
        ROTATE = 'rotate',
        RAD_2_DEG = 180 / Math.PI,
        ROTATE_END = 'rotateEnd';

    function Rotate() {
    }

    S.extend(Rotate, MultiTouch, {

        onTouchMove: function (e) {
            var self = this;

            if (!self.isTracking) {
                return;
            }

            var touches = e.touches,
                one = touches[0],
                two = touches[1],
                lastAngle = self.lastAngle,
                angle = Math.atan2(two.pageY - one.pageY,
                    two.pageX - one.pageX) * RAD_2_DEG;

            if (lastAngle !== undefined) {
                // more smooth
                // 5 4 3 2 1 -1 -2 -3 -4
                // 170 180 190 200
                var diff = Math.abs(angle - lastAngle);
                var positiveAngle = (angle + 360) % 360;
                var negativeAngle = (angle - 360) % 360;

                // process '>' scenario: top -> bottom
                if (Math.abs(positiveAngle - lastAngle) < diff) {
                    angle = positiveAngle;
                }
                // process '>' scenario: bottom -> top
                else if (Math.abs(negativeAngle - lastAngle) < diff) {
                    angle = negativeAngle;
                }
            }

            self.lastTouches = touches;
            self.lastAngle = angle;

            if (!self.isStarted) {
                self.isStarted = true;

                self.startAngle = angle;

                self.target = self.getCommonTarget(e);

                Event.fire(self.target, ROTATE_START, S.mix(e, {
                    angle: angle,
                    rotation: 0
                }));

            } else {
                Event.fire(self.target, ROTATE, S.mix(e, {
                    angle: angle,
                    rotation: angle - self.startAngle
                }));
            }
        },

        end: function () {
            var self = this;
            self.lastAngle = undefined;
            Rotate.superclass.end.apply(self, arguments);
        },

        fireEnd: function (e) {
            var self = this;
            Event.fire(self.target, ROTATE_END, S.mix(e, {
                touches: self.lastTouches
            }));
        }
    });

    function preventTwoFinger(e) {
        // android can not throttle
        // need preventDefault always
        if (!e.touches || e.touches.length == 2) {
            e.preventDefault();
        }
    }

    var r = new Rotate();

    eventHandleMap[ROTATE_END] =
        eventHandleMap[ROTATE_START] = {
            handle: r
        };

    eventHandleMap[ROTATE] = {
        handle: r,
        setup: function () {
            Event.on(this, Gesture.move, preventTwoFinger);
        },
        tearDown: function () {
            Event.detach(this, Gesture.move, preventTwoFinger);
        }
    };

    return Rotate;

}, {
    requires: ['./handle-map', './multi-touch', 'event/dom/base', './gesture']
});/**
 * @ignore
 * touch count guard
 * @author yiminghe@gmail.com
 */
KISSY.add('event/dom/touch/single-touch', function (S) {

    function SingleTouch() {
    }

    SingleTouch.prototype = {
        requiredTouchCount: 1,
        onTouchStart: function (e) {
            var self = this;
            if (e.touches.length != self.requiredTouchCount) {
                return false;
            }
            self.lastTouches = e.touches;
            return undefined;
        },
        onTouchMove: S.noop,
        onTouchEnd: S.noop
    };

    return SingleTouch;

});/**
 * @ignore
 * gesture swipe inspired by sencha touch
 * @author yiminghe@gmail.com
 */
KISSY.add('event/dom/touch/swipe', function (S, eventHandleMap, Event, SingleTouch, Gesture) {

    var event = 'swipe';

    var MAX_DURATION = 1000,
        MAX_OFFSET = 35,
        MIN_DISTANCE = 50;

    function Swipe() {
    }

    S.extend(Swipe, SingleTouch, {

        onTouchStart: function (e) {
            var self = this;
            if (Swipe.superclass.onTouchStart.apply(self, arguments) === false) {
                return false;
            }
            var touch = e.touches[0];
            self.startTime = e.timeStamp;

            self.isHorizontal = 1;
            self.isVertical = 1;

            self.startX = touch.pageX;
            this.startY = touch.pageY;

            if (e.type.indexOf('mouse') != -1) {
                e.preventDefault();
            }
        },

        onTouchMove: function (e) {
            var self = this,
                touch = e.changedTouches[0],
                x = touch.pageX,
                y = touch.pageY,
                absDeltaX = Math.abs(x - self.startX),
                absDeltaY = Math.abs(y - self.startY),
                time = e.timeStamp;

            if (time - self.startTime > MAX_DURATION) {
                return false;
            }

            if (self.isVertical && absDeltaX > MAX_OFFSET) {
                self.isVertical = 0;
            }

            if (self.isHorizontal && absDeltaY > MAX_OFFSET) {
                self.isHorizontal = 0;
            }

            if (!self.isHorizontal && !self.isVertical) {
                return false;
            }
        },

        onTouchEnd: function (e) {
            var self = this;
            if (self.onTouchMove(e) === false) {
                return false;
            }

            var touches = e.changedTouches,
                touch = touches[0],
                x = touch.pageX,
                y = touch.pageY,
                deltaX = x - self.startX,
                deltaY = y - self.startY,
                absDeltaX = Math.abs(deltaX),
                absDeltaY = Math.abs(deltaY),
                distance,
                direction;

            if (self.isVertical && absDeltaY < MIN_DISTANCE) {
                self.isVertical = 0;
            }

            if (self.isHorizontal && absDeltaX < MIN_DISTANCE) {
                self.isHorizontal = 0;
            }

            if (self.isHorizontal) {
                direction = deltaX < 0 ? 'left' : 'right';
                distance = absDeltaX;
            } else if (self.isVertical) {
                direction = deltaY < 0 ? 'up' : 'down';
                distance = absDeltaY;
            } else {
                return false;
            }

            Event.fire(e.target, event, {
                /**
                 *
                 * native touch property **only for touch event**.
                 *
                 * @property touch
                 * @member KISSY.Event.DOMEventObject
                 */
                touch: touch,
                /**
                 *
                 * direction property **only for event swipe/singleTap/doubleTap**.
                 *
                 * can be one of 'up' 'down' 'left' 'right'
                 * @property {String} direction
                 * @member KISSY.Event.DOMEventObject
                 */
                direction: direction,
                /**
                 *
                 * distance property **only for event swipe**.
                 *
                 * the distance swipe gesture costs
                 * @property {Number} distance
                 * @member KISSY.Event.DOMEventObject
                 */
                distance: distance,
                /**
                 *
                 * duration property **only for touch event**.
                 *
                 * the duration swipe gesture costs
                 * @property {Number} duration
                 * @member KISSY.Event.DOMEventObject
                 */
                duration: (e.timeStamp - self.startTime) / 1000
            });
        }

    });

    function prevent(e) {
        if (!e.touches || e.touches.length == 1) {
            e.preventDefault();
        }
    }

    eventHandleMap[event] = {
        setup: function () {
            // prevent native scroll
            Event.on(this, Gesture.move, prevent);
        },
        tearDown: function () {
            Event.detach(this, Gesture.move, prevent);
        },
        handle: new Swipe()
    };

    return Swipe;

}, {
    requires: ['./handle-map', 'event/dom/base', './single-touch', './gesture']
});/**
 * @ignore
 * fired when tap and hold for more than 1s
 * @author yiminghe@gmail.com
 */
KISSY.add('event/dom/touch/tap-hold', function (S, eventHandleMap, SingleTouch, Event, Gesture) {
    var event = 'tapHold';

    var duration = 1000;

    function TapHold() {
    }

    S.extend(TapHold, SingleTouch, {
        onTouchStart: function (e) {
            var self = this;
            if (TapHold.superclass.onTouchStart.call(self, e) === false) {
                return false;
            }
            self.timer = setTimeout(function () {
                Event.fire(e.target, event, {
                    touch: e.touches[0],
                    duration: (S.now() - e.timeStamp) / 1000
                });
            }, duration);
        },

        onTouchMove: function () {
            clearTimeout(this.timer);
            return false;
        },

        onTouchEnd: function () {
            clearTimeout(this.timer);
        }
    });

    function prevent(e) {
        if (!e.touches || e.touches.length == 1) {
            e.preventDefault();
        }
    }

    eventHandleMap[event] = {
        setup: function () {
            // prevent native scroll
            Event.on(this, Gesture.start, prevent);
        },
        tearDown: function () {
            Event.detach(this, Gesture.start, prevent);
        },
        handle: new TapHold()
    };

    return TapHold;

}, {
    requires: ['./handle-map', './single-touch', 'event/dom/base', './gesture']
});/**
 * @ignore
 * gesture tap or click for pc
 * @author yiminghe@gmail.com
 */
KISSY.add('event/dom/touch/tap', function (S, eventHandleMap, Event, SingleTouch) {

    var event = 'tap';

    function Tap() {
    }

    S.extend(Tap, SingleTouch, {

        onTouchMove: function () {
            return false;
        },

        onTouchEnd: function (e) {
            Event.fire(e.target, event, {
                touch: e.changedTouches[0]
            });
        }

    });

    eventHandleMap[event] = {
        handle: new Tap()
    };

    return Tap;

}, {
    requires: ['./handle-map', 'event/dom/base', './single-touch']
});
/**
 * @ignore
 *
 * yiminghe@gmail.com 2012-10-31
 *
 * 页面改动必须先用桌面 chrome 刷新下，再用 ios 刷新，否则很可能不生效??
 *
 * why to implement tap:
 * 1.   click 造成 clickable element 有 -webkit-tap-highlight-color 其内不能选择文字
 * 2.   touchstart touchdown 时间间隔非常短不会触发 click (touchstart)
 * 3.   click 在touchmove 到其他地方后仍然会触发（如果没有组织touchmove默认行为导致的屏幕移动）
 *
 * tap:
 * 1.   长按可以选择文字，
 *      可以选择阻止 document 的 touchstart 来阻止整个程序的文字选择功能:
 *      同时阻止了touch 的 mouse/click 相关事件触发
 * 2.   反应更灵敏
 *
 * https://developers.google.com/mobile/articles/fast_buttons
 *//**
 * @ignore
 * touch event logic module
 * @author yiminghe@gmail.com
 */
KISSY.add('event/dom/touch', function (S, EventDomBase, eventHandleMap, eventHandle) {

    var Special = EventDomBase._Special;

    var specialEvent = {
        setup: function (event) {
            eventHandle.addDocumentHandle(this, event);
        },
        tearDown: function (event) {
            eventHandle.removeDocumentHandle(this, event);
        }
    }, e;

    for (e in eventHandleMap) {
        Special[e] = specialEvent;
    }

}, {
    requires: ['event/dom/base', './touch/handle-map', './touch/handle']
});
/*
Copyright 2013, KISSY UI Library v1.30
MIT Licensed
build time: Jan 29 22:46
*/
/*
Copyright 2012, KISSY UI Library v1.30
MIT Licensed
build time: Dec 20 22:27
*/
/*
 @fileOverview  http://www.JSON.org/json2.js

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

KISSY.add("json/json2", function () {
    var JSON = {};

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
            '"': '\\"',
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

        var i, // The loop counter.
            k, // The member key.
            v, // The member value.
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


// If the JSON object does not yet have a parse method, give it one.


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

    return JSON;
});
/*
Copyright 2013, KISSY UI Library v1.30
MIT Licensed
build time: Jan 29 22:46
*/
/**
 * @ignore
 *  kissy json use json2 or native conditionally
 */
KISSY.add('json', function (S, J) {

    if (!J) {
        J = JSON;
    }

    /**
     * Provide json utils for KISSY.
     * @class KISSY.JSON
     * @singleton
     */
    return S.JSON = {

        /**
         * Parse json object from string.
         * @param text
         * @return {Object}
         */
        parse: function (text) {
            // 当输入为 undefined / null / '' 时，返回 null
            if (text == null || text === '') {
                return null;
            }
            return J.parse(text);
        },
        /**
         * serialize json object to string.
         * @method
         * @param {Object} jsonObject
         * @return {String}
         */
        stringify: J.stringify
    };
}, {
    requires: [
        KISSY.Features.isNativeJSONSupported() ? "" : "json/json2"
    ]
});
/*
Copyright 2013, KISSY UI Library v1.30
MIT Licensed
build time: Jan 31 23:15
*/
/**
 * @ignore
 * io shortcut
 * @author yiminghe@gmail.com
 */
KISSY.add('ajax', function (S, serializer, IO) {
    var undef = undefined;

    function get(url, data, callback, dataType, type) {
        // data 参数可省略
        if (S.isFunction(data)) {
            dataType = callback;
            callback = data;
            data = undef;
        }

        return IO({
            type: type || 'get',
            url: url,
            data: data,
            success: callback,
            dataType: dataType
        });
    }

    // some shortcut
    S.mix(IO,
        {

            serialize: serializer.serialize,

            /**
             * perform a get request
             * @method
             * @param {String} url request destination
             * @param {Object} [data] name-value object associated with this request
             * @param {Function} [callback] success callback when this request is done
             * @param callback.data returned from this request with type specified by dataType
             * @param {String} callback.status status of this request with type String
             * @param {KISSY.IO} callback.io io object of this request
             * @param {String} [dataType] the type of data returns from this request
             * ('xml' or 'json' or 'text')
             * @return {KISSY.IO}
             * @member KISSY.IO
             * @static
             */
            get: get,

            /**
             * preform a post request
             * @param {String} url request destination
             * @param {Object} [data] name-value object associated with this request
             * @param {Function} [callback] success callback when this request is done.
             * @param callback.data returned from this request with type specified by dataType
             * @param {String} callback.status status of this request with type String
             * @param {KISSY.IO} callback.io io object of this request
             * @param {String} [dataType] the type of data returns from this request
             * ('xml' or 'json' or 'text')
             * @return {KISSY.IO}
             * @member KISSY.IO
             * @static
             */
            post: function (url, data, callback, dataType) {
                if (S.isFunction(data)) {
                    dataType = /**
                     @type String
                     @ignore*/callback;
                    callback = data;
                    data = undef;
                }
                return get(url, data, callback, dataType, 'post');
            },

            /**
             * preform a jsonp request
             * @param {String} url request destination
             * @param {Object} [data] name-value object associated with this request
             * @param {Function} [callback] success callback when this request is done.
             * @param callback.data returned from this request with type specified by dataType
             * @param {String} callback.status status of this request with type String
             * @param {KISSY.IO} callback.io io object of this request
             * @return {KISSY.IO}
             * @member KISSY.IO
             * @static
             */
            jsonp: function (url, data, callback) {
                if (S.isFunction(data)) {
                    callback = data;
                    data = undef;
                }
                return get(url, data, callback, 'jsonp');
            },

            // 和 S.getScript 保持一致
            // 更好的 getScript 可以用
            /*
             IO({
             dataType:'script'
             });
             */
            getScript: S.getScript,

            /**
             * perform a get request to fetch json data from server
             * @param {String} url request destination
             * @param {Object} [data] name-value object associated with this request
             * @param {Function} [callback] success callback when this request is done.@param callback.data returned from this request with type specified by dataType
             * @param {String} callback.status status of this request with type String
             * @param {KISSY.IO} callback.io io object of this request
             * @return {KISSY.IO}
             * @member KISSY.IO
             * @static
             */
            getJSON: function (url, data, callback) {
                if (S.isFunction(data)) {
                    callback = data;
                    data = undef;
                }
                return get(url, data, callback, 'json');
            },

            /**
             * submit form without page refresh
             * @param {String} url request destination
             * @param {HTMLElement|KISSY.NodeList} form element tobe submited
             * @param {Object} [data] name-value object associated with this request
             * @param {Function} [callback]  success callback when this request is done.@param callback.data returned from this request with type specified by dataType
             * @param {String} callback.status status of this request with type String
             * @param {KISSY.IO} callback.io io object of this request
             * @param {String} [dataType] the type of data returns from this request
             * ('xml' or 'json' or 'text')
             * @return {KISSY.IO}
             * @member KISSY.IO
             * @static
             */
            upload: function (url, form, data, callback, dataType) {
                if (S.isFunction(data)) {
                    dataType = /**
                     @type String
                     @ignore
                     */callback;
                    callback = data;
                    data = undef;
                }
                return IO({
                    url: url,
                    type: 'post',
                    dataType: dataType,
                    form: form,
                    data: data,
                    success: callback
                });
            }
        });

    S.mix(S, {
        // compatibility
        'Ajax': IO,
        'IO': IO,
        ajax: IO,
        io: IO,
        jsonp: IO.jsonp
    });

    return IO;
}, {
    requires: [
        'ajax/form-serializer',
        'ajax/base',
        'ajax/xhr-transport',
        'ajax/script-transport',
        'ajax/jsonp',
        'ajax/form',
        'ajax/iframe-transport',
        'ajax/methods']
});/**
 * @ignore
 * a scalable client io framework
 * @author yiminghe@gmail.com
 */
KISSY.add('ajax/base', function (S, JSON, Event, undefined) {

    var rlocalProtocol = /^(?:about|app|app\-storage|.+\-extension|file|widget)$/,
        rspace = /\s+/,
        mirror = function (s) {
            return s;
        },
        Promise = S.Promise,
        rnoContent = /^(?:GET|HEAD)$/,
        win = S.Env.host,
        location = win.location || {},
        simulatedLocation = /**
         @type KISSY.Uri
         @ignore*/new S.Uri(location.href),
        isLocal = simulatedLocation && rlocalProtocol.test(simulatedLocation.getScheme()),
        transports = {},
        defaultConfig = {
            type: 'GET',
            contentType: 'application/x-www-form-urlencoded; charset=UTF-8',
            async: true,
            serializeArray: true,
            processData: true,
            accepts: {
                xml: 'application/xml, text/xml',
                html: 'text/html',
                text: 'text/plain',
                json: 'application/json, text/javascript',
                '*': '*/*'
            },
            converters: {
                text: {
                    json: JSON.parse,
                    html: mirror,
                    text: mirror,
                    xml: S.parseXML
                }
            },
            contents: {
                xml: /xml/,
                html: /html/,
                json: /json/
            }
        };

    defaultConfig.converters.html = defaultConfig.converters.text;

    function setUpConfig(c) {

        // deep mix,exclude context!
        var context = c.context;
        delete c.context;
        c = S.mix(S.clone(defaultConfig), c, {
            deep: true
        });
        c.context = context || c;

        var data, uri,
            type = c.type,
            dataType = c.dataType;

        uri = c.uri = simulatedLocation.resolve(c.url);

        // see method _getUrlForSend
        c.uri.setQuery('');

        if (!('crossDomain' in c)) {
            c.crossDomain = !c.uri.isSameOriginAs(simulatedLocation);
        }

        type = c.type = type.toUpperCase();
        c.hasContent = !rnoContent.test(type);

        if (c.processData && (data = c.data) && typeof data != 'string') {
            // normalize to string
            c.data = S.param(data, undefined, undefined, c.serializeArray);
        }

        // 数据类型处理链，一步步将前面的数据类型转化成最后一个
        dataType = c.dataType = S.trim(dataType || '*').split(rspace);

        if (!('cache' in c) && S.inArray(dataType[0], ['script', 'jsonp'])) {
            c.cache = false;
        }

        if (!c.hasContent) {
            if (c.data) {
                uri.query.add(S.unparam(c.data));
            }
            if (c.cache === false) {
                uri.query.set('_ksTS', (S.now() + '_' + S.guid()));
            }
        }
        return c;
    }

    function fire(eventType, self) {
        /**
         * fired after request completes (success or error)
         * @event complete
         * @member KISSY.IO
         * @static
         * @param {KISSY.Event.CustomEventObject} e
         * @param {KISSY.IO} e.io current io
         */

        /**
         * fired after request succeeds
         * @event success
         * @member KISSY.IO
         * @static
         * @param {KISSY.Event.CustomEventObject} e
         * @param {KISSY.IO} e.io current io
         */

        /**
         * fired after request occurs error
         * @event error
         * @member KISSY.IO
         * @static
         * @param {KISSY.Event.CustomEventObject} e
         * @param {KISSY.IO} e.io current io
         */
        IO.fire(eventType, {
            // 兼容
            ajaxConfig: self.config,
            io: self
        });
    }

    /**
     * Return a io object and send request by config.
     *
     * @class KISSY.IO
     * @extends KISSY.Promise
     *
     * @cfg {String} url
     * request destination
     *
     * @cfg {String} type request type.
     * eg: 'get','post'
     * Default to: 'get'
     *
     * @cfg {String} contentType
     * Default to: 'application/x-www-form-urlencoded; charset=UTF-8'
     * Data will always be transmitted to the server using UTF-8 charset
     *
     * @cfg {Object} accepts
     * Default to: depends on DataType.
     * The content type sent in request header that tells the server
     * what kind of response it will accept in return.
     * It is recommended to do so once in the {@link KISSY.IO#method-setupConfig}
     *
     * @cfg {Boolean} async
     * Default to: true
     * whether request is sent asynchronously
     *
     * @cfg {Boolean} cache
     * Default to: true ,false for dataType 'script' and 'jsonp'
     * if set false,will append _ksTs=Date.now() to url automatically
     *
     * @cfg {Object} contents
     * a name-regexp map to determine request data's dataType
     * It is recommended to do so once in the {@link KISSY.IO#method-setupConfig}
     *
     * @cfg {Object} context
     * specify the context of this request 's callback (success,error,complete)
     *
     * @cfg {Object} converters
     * Default to: {text:{json:JSON.parse,html:mirror,text:mirror,xml:KISSY.parseXML}}
     * specified how to transform one dataType to another dataType
     * It is recommended to do so once in the {@link KISSY.IO#method-setupConfig}
     *
     * @cfg {Boolean} crossDomain
     * Default to: false for same-domain request,true for cross-domain request
     * if server-side jsonp redirect to another domain, you should set this to true.
     * if you want use script for jsonp for same domain request, you should set this to true.
     *
     * @cfg {Object} data
     * Data sent to server.if processData is true,data will be serialized to String type.
     * if value if an Array, serialization will be based on serializeArray.
     *
     * @cfg {String} dataType
     * return data as a specified type
     * Default to: Based on server contentType header
     * 'xml' : a XML document
     * 'text'/'html': raw server data
     * 'script': evaluate the return data as script
     * 'json': parse the return data as json and return the result as final data
     * 'jsonp': load json data via jsonp
     *
     * @cfg {Object} headers
     * additional name-value header to send along with this request.
     *
     * @cfg {String} jsonp
     * Default to: 'callback'
     * Override the callback function name in a jsonp request. eg:
     * set 'callback2' , then jsonp url will append  'callback2=?'.
     *
     * @cfg {String} jsonpCallback
     * Specify the callback function name for a jsonp request.
     * set this value will replace the auto generated function name.
     * eg:
     * set 'customCall' , then jsonp url will append 'callback=customCall'
     *
     * @cfg {String} mimeType
     * override xhr 's mime type
     *
     * @cfg {String} ifModified
     * whether enter if modified mode.
     * Defaults to false.
     *
     * @cfg {Boolean} processData
     * Default to: true
     * whether data will be serialized as String
     *
     * @cfg {String} scriptCharset
     * only for dataType 'jsonp' and 'script' and 'get' type.
     * force the script to certain charset.
     *
     * @cfg {Function} beforeSend
     * beforeSend(io,config)
     * callback function called before the request is sent.this function has 2 arguments
     *
     * 1. current KISSY io object
     *
     * 2. current io config
     *
     * note: can be used for add progress event listener for native xhr's upload attribute
     * see <a href='http://www.w3.org/TR/XMLHttpRequest/#event-xhr-progress'>XMLHttpRequest2</a>
     *
     * @cfg {Function} success
     * success(data,textStatus,xhr)
     * callback function called if the request succeeds.this function has 3 arguments
     *
     * 1. data returned from this request with type specified by dataType
     *
     * 2. status of this request with type String
     *
     * 3. io object of this request , for details {@link KISSY.IO}
     *
     * @cfg {Function} error
     * success(data,textStatus,xhr)
     * callback function called if the request occurs error.this function has 3 arguments
     *
     * 1. null value
     *
     * 2. status of this request with type String,such as 'timeout','Not Found','parsererror:...'
     *
     * 3. io object of this request , for details {@link KISSY.IO}
     *
     * @cfg {Function} complete
     * success(data,textStatus,xhr)
     * callback function called if the request finished(success or error).this function has 3 arguments
     *
     * 1. null value if error occurs or data returned from server
     *
     * 2. status of this request with type String,such as success:'ok',
     * error:'timeout','Not Found','parsererror:...'
     *
     * 3. io object of this request , for details {@link KISSY.IO}
     *
     * @cfg {Number} timeout
     * Set a timeout(in seconds) for this request.if will call error when timeout
     *
     * @cfg {Boolean} serializeArray
     * whether add [] to data's name when data's value is array in serialization
     *
     * @cfg {Object} xhrFields
     * name-value to set to native xhr.set as xhrFields:{withCredentials:true}
     *
     * @cfg {String} username
     * a username tobe used in response to HTTP access authentication request
     *
     * @cfg {String} password
     * a password tobe used in response to HTTP access authentication request
     *
     * @cfg {Object} xdr
     * cross domain request config object, contains sub config:
     *
     * xdr.src
     * Default to: KISSY 's flash url
     * flash sender url
     *
     * xdr.use
     * if set to 'use', it will always use flash for cross domain request even in chrome/firefox
     *
     * xdr.subDomain
     * cross sub domain request config object
     *
     * xdr.subDomain.proxy
     * proxy page,eg:     *
     * a.t.cn/a.htm send request to b.t.cn/b.htm:
     *
     * 1. a.htm set <code> document.domain='t.cn' </code>
     *
     * 2. b.t.cn/proxy.htm 's content is <code> &lt;script>document.domain='t.cn'&lt;/script> </code>
     *
     * 3. in a.htm , call <code> IO({xdr:{subDomain:{proxy:'/proxy.htm'}}}) </code>
     *
     */
    function IO(c) {

        var self = this;

        if (!(self instanceof IO)) {
            return new IO(c);
        }

        Promise.call(self);

        c = setUpConfig(c);

        S.mix(self, {
            // 结构化数据，如 json
            responseData: null,
            /**
             * config of current IO instance.
             * @member KISSY.IO
             * @property config
             * @type Object
             */
            config: c || {},
            timeoutTimer: null,

            /**
             * String typed data returned from server
             * @type String
             */
            responseText: null,
            /**
             * xml typed data returned from server
             * @type String
             */
            responseXML: null,
            responseHeadersString: '',
            responseHeaders: null,
            requestHeaders: {},
            /**
             * readyState of current request
             * 0: initialized
             * 1: send
             * 4: completed
             * @type Number
             */
            readyState: 0,
            state: 0,
            /**
             * HTTP statusText of current request
             * @type String
             */
            statusText: null,
            /**
             * HTTP Status Code of current request
             * eg:
             * 200: ok
             * 404: Not Found
             * 500: Server Error
             * @type String
             */
            status: 0,
            transport: null,
            _defer: new S.Defer(this)
        });


        var transportConstructor,
            transport;

        /**
         * fired before generating request object
         * @event start
         * @member KISSY.IO
         * @static
         * @param {KISSY.Event.CustomEventObject} e
         * @param {KISSY.IO} e.io current io
         */

        fire('start', self);

        transportConstructor = transports[c.dataType[0]] || transports['*'];
        transport = new transportConstructor(self);

        self.transport = transport;

        if (c.contentType) {
            self.setRequestHeader('Content-Type', c.contentType);
        }

        var dataType = c.dataType[0],
            timeoutTimer,
            i,
            timeout = c.timeout,
            context = c.context,
            headers = c.headers,
            accepts = c.accepts;

        // Set the Accepts header for the server, depending on the dataType
        self.setRequestHeader(
            'Accept',
            dataType && accepts[dataType] ?
                accepts[ dataType ] + (dataType === '*' ? '' : ', */*; q=0.01'  ) :
                accepts[ '*' ]
        );

        // Check for headers option
        for (i in headers) {
            self.setRequestHeader(i, headers[ i ]);
        }


        // allow setup native listener
        // such as xhr.upload.addEventListener('progress', function (ev) {})
        if (c.beforeSend && ( c.beforeSend.call(context, self, c) === false)) {
            return self;
        }

        function genHandler(handleStr) {
            return function (v) {
                if (timeoutTimer = self.timeoutTimer) {
                    clearTimeout(timeoutTimer);
                    self.timeoutTimer = 0;
                }
                var h = c[handleStr];
                h && h.apply(context, v);
                fire(handleStr, self);
            };
        }

        self.then(genHandler('success'), genHandler('error'));

        self.fin(genHandler('complete'));

        self.readyState = 1;

        /**
         * fired before sending request
         * @event send
         * @member KISSY.IO
         * @static
         * @param {KISSY.Event.CustomEventObject} e
         * @param {KISSY.IO} e.io current io
         */

        fire('send', self);

        // Timeout
        if (c.async && timeout > 0) {
            self.timeoutTimer = setTimeout(function () {
                self.abort('timeout');
            }, timeout * 1000);
        }

        try {
            // flag as sending
            self.state = 1;
            transport.send();
        } catch (e) {
            // Propagate exception as error if not done
            if (self.state < 2) {
                S.log(e.stack || e, 'error');
                self._ioReady(-1, e.message);
                // Simply rethrow otherwise
            } else {
                S.error(e);
            }
        }

        return self;
    }

    S.mix(IO, Event.Target);

    S.mix(IO,
        {
            /**
             * whether current application is a local application
             * (protocal is file://,widget://,about://)
             * @type {Boolean}
             * @member KISSY.IO
             * @static
             */
            isLocal: isLocal,
            /**
             * name-value object that set default config value for io class
             * @param {Object} setting
             * @member KISSY.IO
             * @static
             */
            setupConfig: function (setting) {
                S.mix(defaultConfig, setting, {
                    deep: true
                });
            },
            /**
             * @private
             * @member KISSY.IO
             * @static
             */
            'setupTransport': function (name, fn) {
                transports[name] = fn;
            },
            /**
             * @private
             * @member KISSY.IO
             * @static
             */
            'getTransport': function (name) {
                return transports[name];
            },
            /**
             * get default config value for io request
             * @return {Object}
             * @member KISSY.IO
             * @static
             */
            getConfig: function () {
                return defaultConfig;
            }
        });

    return IO;
}, {
    requires: ['json', 'event']
});

/*

 // !TODO
 // 去除 event/custom 依赖，用户不载入就不能监听
 // 载入后通过 custom.on(IO,type) 监听


 2012-08-16
 - transform IO to class, remove XhrObject class.
 - support ifModified
 - http://bugs.jquery.com/ticket/8394
 - http://www.w3.org/Protocols/rfc2616/rfc2616-sec10.html
 - https://github.com/kissyteam/kissy/issues/203

 2012-07-18 yiminghe@gmail.com
 - refactor by KISSY.Uri

 2012-2-07 yiminghe@gmail.com
 - 返回 Promise 类型对象，可以链式操作啦！

 2011 yiminghe@gmail.com
 - 借鉴 jquery，优化减少闭包使用

 *//**
 * @ignore
 * form data  serialization util
 * @author yiminghe@gmail.com
 */
KISSY.add('ajax/form-serializer', function (S, DOM) {
    var rselectTextarea = /^(?:select|textarea)/i,
        rCRLF = /\r?\n/g,
        FormSerializer,
        rinput = /^(?:color|date|datetime|email|hidden|month|number|password|range|search|tel|text|time|url|week)$/i;

    function normalizeCRLF(v) {
        return v.replace(rCRLF, '\r\n');
    }

    return FormSerializer = {
        /**
         * form serialization
         * @method
         * @param {HTMLElement[]|HTMLElement|KISSY.NodeList} forms form elements
         * @return {String} serialized string represent form elements
         * @param {Boolean}[serializeArray=false] See {@link KISSY#method-param} 同名参数
         * @member KISSY.IO
         * @static
         */
        serialize: function (forms, serializeArray) {
            // 名值键值对序列化,数组元素名字前不加 []
            return S.param(FormSerializer.getFormData(forms), undefined, undefined,
                serializeArray || false);
        },

        getFormData: function (forms) {
            var elements = [], data = {};
            S.each(DOM.query(forms), function (el) {
                // form 取其表单元素集合
                // 其他直接取自身
                var subs = el.elements ? S.makeArray(el.elements) : [el];
                elements.push.apply(elements, subs);
            });
            // 对表单元素进行过滤，具备有效值的才保留
            elements = S.filter(elements, function (el) {
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
            S.each(elements, function (el) {
                var val = DOM.val(el), vs;

                // <select></select> select nothing!
                // #297
                if (val === null) {
                    return;
                }

                // 字符串换行平台归一化
                if (S.isArray(val)) {
                    val = S.map(val, normalizeCRLF);
                } else {
                    val = normalizeCRLF(val);
                }

                vs = data[el.name];
                if (!vs) {
                    data[el.name] = val;
                    return;
                }
                if (vs && !S.isArray(vs)) {
                    // 多个元素重名时搞成数组
                    vs = data[el.name] = [vs];
                }
                vs.push.apply(vs, S.makeArray(val));
            });
            return data;
        }
    };
}, {
    requires: ['dom']
});/**
 * @ignore
 * process form config
 * @author yiminghe@gmail.com
 */
KISSY.add('ajax/form', function (S, IO, DOM, FormSerializer) {

    IO.on('start', function (e) {
        var io = e.io,
            form,
            d,
            enctype,
            dataType,
            formParam,
            data,
            tmpForm,
            c = io.config;
        // serialize form if needed
        if (tmpForm = c.form) {
            form = DOM.get(tmpForm);
            enctype = form['encoding'] || form.enctype;
            data = c.data;
            // 上传有其他方法
            if (enctype.toLowerCase() != 'multipart/form-data') {
                // when get need encode
                formParam = FormSerializer.getFormData(form);
                if (c.hasContent) {
                    formParam = S.param(formParam, undefined, undefined, c.serializeArray);
                    if (data) {
                        c.data += '&' + formParam;
                    } else {
                        c.data = formParam;
                    }
                } else {
                    // get 直接加到 url
                    c.uri.query.add(formParam);
                }
            } else {
                dataType = c.dataType;
                d = dataType[0];
                if (d == '*') {
                    d = 'text';
                }
                dataType.length = 2;
                dataType[0] = 'iframe';
                dataType[1] = d;
            }
        }
    });

    return IO;

}, {
    requires: ['./base', 'dom', './form-serializer']
});/**
 * @ignore
 * non-refresh upload file with form by iframe
 * @author yiminghe@gmail.com
 */
KISSY.add('ajax/iframe-transport', function (S, DOM, Event, IO) {

    'use strict';

    var doc = S.Env.host.document,
        OK_CODE = 200,
        ERROR_CODE = 500,
        BREATH_INTERVAL = 30;

    // iframe 内的内容就是 body.innerText
    IO.setupConfig({
        converters: {
            // iframe 到其他类型的转化和 text 一样
            iframe: IO.getConfig().converters.text,
            text: {
                // fake type, just mirror
                iframe: function (text) {
                    return text;
                }
            },
            xml: {
                // fake type, just mirror
                iframe: function (xml) {
                    return xml;
                }
            }
        }
    });

    function createIframe(xhr) {
        var id = S.guid('io-iframe'),
            iframe,
        // empty src, so no history
            src = DOM.getEmptyIframeSrc();

        iframe = xhr.iframe = DOM.create('<iframe ' +
            // ie6 need this when cross domain
            (src ? (' src="' + src + '" ') : '') +
            ' id="' + id + '"' +
            // need name for target of form
            ' name="' + id + '"' +
            ' style="position:absolute;left:-9999px;top:-9999px;"/>');

        DOM.prepend(iframe, doc.body || doc.documentElement);
        return iframe;
    }

    function addDataToForm(query, form, serializeArray) {
        var ret = [], isArray, vs, i, e;
        S.each(query, function (data, k) {
            isArray = S.isArray(data);
            vs = S.makeArray(data);
            // 数组和原生一样对待，创建多个同名输入域
            for (i = 0; i < vs.length; i++) {
                e = doc.createElement('input');
                e.type = 'hidden';
                e.name = k + (isArray && serializeArray ? '[]' : '');
                e.value = vs[i];
                DOM.append(e, form);
                ret.push(e);
            }
        });
        return ret;
    }

    function removeFieldsFromData(fields) {
        DOM.remove(fields);
    }

    function IframeTransport(io) {
        this.io = io;
        S.log('use IframeTransport for: ' + io.config.url);
    }

    S.augment(IframeTransport, {
        send: function () {

            var self = this,
                io = self.io,
                c = io.config,
                fields,
                iframe,
                query,
                data = c.data,
                form = DOM.get(c.form);

            self.attrs = {
                target: DOM.attr(form, 'target') || '',
                action: DOM.attr(form, 'action') || '',
                // enctype 区分 iframe 与 serialize
                //encoding:DOM.attr(form, 'encoding'),
                //enctype:DOM.attr(form, 'enctype'),
                method: DOM.attr(form, 'method')
            };
            self.form = form;

            iframe = createIframe(io);

            // set target to iframe to avoid main page refresh
            DOM.attr(form, {
                target: iframe.id,
                action: io._getUrlForSend(),
                method: 'post'
                //enctype:'multipart/form-data',
                //encoding:'multipart/form-data'
            });

            // unparam to kv map
            if (data) {
                query = S.unparam(data);
            }

            if (query) {
                fields = addDataToForm(query, form, c.serializeArray);
            }

            self.fields = fields;

            function go() {
                Event.on(iframe, 'load error', self._callback, self);
                form.submit();
            }

            // ie6 need a breath
            if (S.UA.ie == 6) {
                setTimeout(go, 0);
            } else {
                // can not setTimeout or else chrome will submit to top window
                go();
            }
        },

        _callback: function (event/*, abort*/) {
            var self = this,
                form = self.form,
                io = self.io,
                eventType = /**
                 @type String
                 @ignore*/event.type,
                iframeDoc,
                iframe = io.iframe;

            // 防止重复调用 , 成功后 abort
            if (!iframe) {
                return;
            }

            // ie6 立即设置 action 设置为空导致白屏
            if (eventType == 'abort' && S.UA.ie == 6) {
                setTimeout(function () {
                    DOM.attr(form, self.attrs);
                }, 0);
            } else {
                DOM.attr(form, self.attrs);
            }

            removeFieldsFromData(this.fields);

            Event.detach(iframe);

            setTimeout(function () {
                // firefox will keep loading if not set timeout
                DOM.remove(iframe);
            }, BREATH_INTERVAL);

            // nullify to prevent memory leak?
            io.iframe = null;

            if (eventType == 'load') {

                try {
                    iframeDoc = iframe.contentWindow.document;
                    // ie<9
                    if (iframeDoc && iframeDoc.body) {
                        io.responseText = S.trim(DOM.text(iframeDoc.body));
                        // ie still can retrieve xml 's responseText
                        if (S.startsWith(io.responseText, '<?xml')) {
                            io.responseText = undefined;
                        }
                    }
                    // ie<9
                    // http://help.dottoro.com/ljbcjfot.php
                    // http://msdn.microsoft.com/en-us/library/windows/desktop/ms766512(v=vs.85).aspx
                    /*
                     In Internet Explorer, XML documents can also be embedded into HTML documents with the xml HTML elements.
                     To get an XMLDocument object that represents the embedded XML data island,
                     use the XMLDocument property of the xml element.
                     Note that the support for the XMLDocument property has been removed in Internet Explorer 9.
                     */
                    if (iframeDoc && iframeDoc['XMLDocument']) {
                        io.responseXML = iframeDoc['XMLDocument'];
                    }
                    // ie9 firefox chrome
                    else {
                        io.responseXML = iframeDoc;
                    }
                    if (iframeDoc) {
                        io._ioReady(OK_CODE, 'success');
                    } else {
                        // chrome does not throw exception:
                        // Unsafe JavaScript attempt to access frame with URL upload.jss from frame with URL test.html.
                        // Domains, protocols and ports must match.
                        // chrome will get iframeDoc to null
                        // so this error is parser error to normalize all browsers
                        io._ioReady(ERROR_CODE, 'parser error');
                    }
                } catch (e) {
                    // #245 submit to a  cross domain page except chrome
                    io._ioReady(ERROR_CODE, 'parser error');
                }
            } else if (eventType == 'error') {
                io._ioReady(ERROR_CODE, 'error');
            }
        },

        abort: function () {
            this._callback({
                type: 'abort'
            });
        }
    });

    IO['setupTransport']('iframe', IframeTransport);

    return IO;

}, {
    requires: ['dom', 'event', './base']
});/**
 * @ignore
 * jsonp transport based on script transport
 * @author yiminghe@gmail.com
 */
KISSY.add('ajax/jsonp', function (S, IO) {
    var win = S.Env.host;
    IO.setupConfig({
        jsonp: 'callback',
        jsonpCallback: function () {
            // 不使用 now() ，极端情况下可能重复
            return S.guid('jsonp');
        }
    });

    IO.on('start', function (e) {
        var io = e.io,
            c = io.config,
            dataType = c.dataType;
        if (dataType[0] == 'jsonp') {
            var response,
                cJsonpCallback = c.jsonpCallback,
                converters,
                jsonpCallback = S.isFunction(cJsonpCallback) ?
                    cJsonpCallback() :
                    cJsonpCallback,
                previous = win[ jsonpCallback ];

            c.uri.query.set(c.jsonp, jsonpCallback);

            // build temporary JSONP function
            win[jsonpCallback] = function (r) {
                // 使用数组，区别：故意调用了 jsonpCallback(undefined) 与 根本没有调用
                // jsonp 返回了数组
                if (arguments.length > 1) {
                    r = S.makeArray(arguments);
                }
                // 先存在内存里, onload 后再读出来处理
                response = [r];
            };

            // cleanup whether success or failure
            io.fin(function () {
                win[ jsonpCallback ] = previous;
                if (previous === undefined) {
                    try {
                        delete win[ jsonpCallback ];
                    } catch (e) {
                        //S.log('delete window variable error : ');
                        //S.log(e);
                    }
                } else if (response) {
                    // after io success handler called
                    // then call original existed jsonpcallback
                    previous(response[0]);
                }
            });

            converters = io.converters = io.converters || {};
            converters.script = converters.script || {};

            // script -> jsonp ,jsonp need to see json not as script
            // if ie onload a 404/500 file or all browsers onload an invalid script
            // 404/invalid will be caught here
            // because response is undefined( jsonp callback is never called)
            // error throwed will be caught in conversion step
            // and KISSY will notify user by error callback
            converters.script.json = function () {
                if (!response) {
                    S.error(' not call jsonpCallback: ' + jsonpCallback)
                }
                return response[0];
            };

            dataType.length = 2;
            // 利用 script transport 发送 script 请求
            dataType[0] = 'script';
            dataType[1] = 'json';
        }
    });

    return IO;
}, {
    requires: ['./base']
});
/**
 * @ignore
 * encapsulation of io object . as transaction object in yui3
 * @author yiminghe@gmail.com
 */
KISSY.add('ajax/methods', function (S, IO, undefined) {

    var OK_CODE = 200,
        Promise = S.Promise,
        MULTIPLE_CHOICES = 300,
        NOT_MODIFIED = 304,
    // get individual response header from response header str
        rheaders = /^(.*?):[ \t]*([^\r\n]*)\r?$/mg;

    function handleResponseData(io) {

        // text xml 是否原生转化支持
        var text = io.responseText,
            xml = io.responseXML,
            c = io.config,
            cConverts = c.converters,
            xConverts = io.converters || {},
            type,
            contentType,
            responseData,
            contents = c.contents,
            dataType = c.dataType;

        // 例如 script 直接是js引擎执行，没有返回值，不需要自己处理初始返回值
        // jsonp 时还需要把 script 转换成 json，后面还得自己来
        if (text || xml) {

            contentType = io.mimeType || io.getResponseHeader('Content-Type');

            // 去除无用的通用格式
            while (dataType[0] == '*') {
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
            // 服务器端没有告知（并且客户端没有 mimetype ）默认 text 类型
            dataType[0] = dataType[0] || 'text';

            //获得合适的初始数据
            if (dataType[0] == 'text' && text !== undefined) {
                responseData = text;
            }
            // 有 xml 值才直接取，否则可能还要从 xml 转
            else if (dataType[0] == 'xml' && xml !== undefined) {
                responseData = xml;
            } else {
                var rawData = {text: text, xml: xml};
                // 看能否从 text xml 转换到合适数据，并设置起始类型为 text/xml
                S.each(['text', 'xml'], function (prevType) {
                    var type = dataType[0],
                        converter = xConverts[prevType] && xConverts[prevType][type] ||
                            cConverts[prevType] && cConverts[prevType][type];
                    if (converter && rawData[prevType]) {
                        dataType.unshift(prevType);
                        responseData = prevType == 'text' ? text : xml;
                        return false;
                    }
                    return undefined;
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
                throw 'no covert for ' + prevType + ' => ' + type;
            }
            responseData = converter(responseData);

            prevType = type;
        }

        io.responseData = responseData;
    }

    S.extend(IO, Promise,
        {
            // Caches the header
            setRequestHeader: function (name, value) {
                var self = this;
                self.requestHeaders[ name ] = value;
                return self;
            },

            /**
             * get all response headers as string after request is completed.
             * @member KISSY.IO
             * @return {String}
             */
            getAllResponseHeaders: function () {
                var self = this;
                return self.state === 2 ? self.responseHeadersString : null;
            },

            /**
             * get header value in response to specified header name
             * @param {String} name header name
             * @return {String} header value
             * @member KISSY.IO
             */
            getResponseHeader: function (name) {
                var match, self = this, responseHeaders;
                if (self.state === 2) {
                    if (!(responseHeaders = self.responseHeaders)) {
                        responseHeaders = self.responseHeaders = {};
                        while (( match = rheaders.exec(self.responseHeadersString) )) {
                            responseHeaders[ match[1] ] = match[ 2 ];
                        }
                    }
                    match = responseHeaders[ name ];
                }
                return match === undefined ? null : match;
            },

            // Overrides response content-type header
            overrideMimeType: function (type) {
                var self = this;
                if (!self.state) {
                    self.mimeType = type;
                }
                return self;
            },

            /**
             * cancel this request
             * @member KISSY.IO
             * @param {String} [statusText=abort] error reason as current request object's statusText
             * @chainable
             */
            abort: function (statusText) {
                var self = this;
                statusText = statusText || 'abort';
                if (self.transport) {
                    self.transport.abort(statusText);
                }
                self._ioReady(0, statusText);
                return self;
            },

            /**
             * get native XMLHttpRequest
             * @member KISSY.IO
             * @return {XMLHttpRequest}
             */
            getNativeXhr: function () {
                var transport;
                if (transport = this.transport) {
                    return transport.nativeXhr;
                }
                return null;
            },

            _ioReady: function (status, statusText) {
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
                    // note: not same with nativeStatusText, such as 'OK'/'Not Modified'
                    // 为了整个框架的和谐以及兼容性，用小写，并改变写法
                    if (status == NOT_MODIFIED) {
                        statusText = 'not modified';
                        isSuccess = true;
                    } else {
                        try {
                            handleResponseData(self);
                            statusText = 'success';
                            isSuccess = true;
                        } catch (e) {
                            S.log(e.stack || e, 'error');
                            statusText = 'parser error';
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
                defer[isSuccess ? 'resolve' : 'reject']([self.responseData, statusText, self]);
            },

            _getUrlForSend: function () {
                // for compatible, some server does not decode query
                // uri will encode query
                // x.html?t=1,2
                // =>
                // x.html?t=1%3c2
                // so trim original query when process other query
                // and append when send
                var c = this.config,
                    uri = c.uri,
                    originalQuery = S.Uri.getComponents(c.url).query || "",
                    url = uri.toString(c.serializeArray);

                return url + (originalQuery ?
                    ((uri.query.has() ? '&' : '?') + originalQuery) :
                    originalQuery);
            }
        }
    );
}, {
    requires: ['./base']
});/**
 * @ignore
 * script transport for kissy io,
 * modified version of S.getScript,
 * add abort ability
 * @author yiminghe@gmail.com
 */
KISSY.add('ajax/script-transport', function (S, IO, _, undefined) {

    var win = S.Env.host,
        doc = win.document,
        OK_CODE = 200,
        ERROR_CODE = 500;

    IO.setupConfig({
        accepts: {
            script: 'text/javascript, ' +
                'application/javascript, ' +
                'application/ecmascript, ' +
                'application/x-ecmascript'
        },

        contents: {
            script: /javascript|ecmascript/
        },
        converters: {
            text: {
                // 如果以 xhr+eval 需要下面的，
                // 否则直接 script node 不需要，引擎自己执行了，
                // 不需要手动 eval
                script: function (text) {
                    S.globalEval(text);
                    return text;
                }
            }
        }
    });

    function ScriptTransport(io) {
        var config = io.config;
        // 优先使用 xhr+eval 来执行脚本, ie 下可以探测到（更多）失败状态
        if (!config.crossDomain) {
            return new (IO['getTransport']('*'))(io);
        }
        this.io = io;
        S.log('use ScriptTransport for: ' + config.url);
        return this;
    }

    S.augment(ScriptTransport, {
        send: function () {
            var self = this,
                script,
                io = self.io,
                c = io.config,
                head = doc['head'] ||
                    doc.getElementsByTagName('head')[0] ||
                    doc.documentElement;

            self.head = head;
            script = doc.createElement('script');
            self.script = script;
            script.async = true;

            if (c['scriptCharset']) {
                script.charset = c['scriptCharset'];
            }

            script.src = io._getUrlForSend();

            script.onerror =
                script.onload =
                    script.onreadystatechange = function (e) {
                        e = e || win.event;
                        // firefox onerror 没有 type ?!
                        self._callback((e.type || 'error').toLowerCase());
                    };

            head.insertBefore(script, head.firstChild);
        },

        _callback: function (event, abort) {
            var self = this,
                script = self.script,
                io = self.io,
                head = self.head;

            // 防止重复调用,成功后 abort
            if (!script) {
                return;
            }

            if (
                abort ||
                    !script.readyState ||
                    /loaded|complete/.test(script.readyState) ||
                    event == 'error'
                ) {

                script['onerror'] = script.onload = script.onreadystatechange = null;

                // Remove the script
                if (head && script.parentNode) {
                    // ie 报错载入无效 js
                    // 怎么 abort ??
                    // script.src = '#';
                    head.removeChild(script);
                }

                self.script = undefined;
                self.head = undefined;

                // Callback if not abort
                if (!abort && event != 'error') {
                    io._ioReady(OK_CODE, 'success');
                }
                // 非 ie<9 可以判断出来
                else if (event == 'error') {
                    io._ioReady(ERROR_CODE, 'script error');
                }
            }
        },

        abort: function () {
            this._callback(0, 1);
        }
    });

    IO['setupTransport']('script', ScriptTransport);

    return IO;

}, {
    requires: ['./base', './xhr-transport']
});/**
 * @ignore
 * solve io between sub domains using proxy page
 * @author yiminghe@gmail.com
 */
KISSY.add('ajax/sub-domain-transport', function (S, XhrTransportBase, Event, DOM) {

    var PROXY_PAGE = '/sub_domain_proxy.html',
        doc = S.Env.host.document,
        iframeMap = {
            // hostname:{iframe: , ready:}
        };

    function SubDomainTransport(io) {
        var self = this,
            c = io.config;
        self.io = io;
        c.crossDomain = false;
        S.log('use SubDomainTransport for: ' + c.url);
    }


    S.augment(SubDomainTransport, XhrTransportBase.proto, {
        // get nativeXhr from iframe document
        // not from current document directly like XhrTransport
        send: function () {
            var self = this,
                c = self.io.config,
                uri = c.uri,
                hostname = uri.getHostname(),
                iframe,
                iframeUri,
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
                    S.error('document.domain not set correctly!');
                }
                return;
            }

            if (!iframeDesc) {
                iframeDesc = iframeMap[hostname] = {};
                iframe = iframeDesc.iframe = doc.createElement('iframe');
                DOM.css(iframe, {
                    position: 'absolute',
                    left: '-9999px',
                    top: '-9999px'
                });
                DOM.prepend(iframe, doc.body || doc.documentElement);
                iframeUri = new S.Uri();
                iframeUri.setScheme(uri.getScheme());
                iframeUri.setPort(uri.getPort());
                iframeUri.setHostname(hostname);
                iframeUri.setPath(proxy);
                iframe.src = iframeUri.toString();
            } else {
                iframe = iframeDesc.iframe;
            }

            Event.on(iframe, 'load', _onLoad, self);

        }
    });

    function _onLoad() {
        var self = this,
            c = self.io.config,
            uri = c.uri,
            hostname = uri.getHostname(),
            iframeDesc = iframeMap[hostname];
        iframeDesc.ready = 1;
        Event.detach(iframeDesc.iframe, 'load', _onLoad, self);
        self.send();
    }

    return SubDomainTransport;

}, {
    requires: ['./xhr-transport-base', 'event', 'dom']
});/**
 * @ignore
 * use flash to accomplish cross domain request, usage scenario ? why not jsonp ?
 * @author yiminghe@gmail.com
 */
KISSY.add('ajax/xdr-flash-transport', function (S, IO, DOM) {

    var // current running request instances
        maps = {},
        ID = 'io_swf',
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
                '&host=KISSY.IO" />' +
                '<param name="allowScriptAccess" value="always" />' +
                '</object>',
            c = doc.createElement('div');
        DOM.prepend(c, doc.body || doc.documentElement);
        c.innerHTML = o;
    }

    function XdrFlashTransport(io) {
        S.log('use XdrFlashTransport for: ' + io.config.url);
        this.io = io;
    }

    S.augment(XdrFlashTransport, {
        // rewrite send to support flash xdr
        send: function () {
            var self = this,
                io = self.io,
                c = io.config,
                xdr = c['xdr'] || {};
            // 不提供则使用 cdn 默认的 flash
            _swf(xdr.src || (S.Config.base + 'ajax/io.swf'), 1, 1);
            // 简便起见，用轮训
            if (!flash) {
                // S.log('detect xdr flash');
                setTimeout(function () {
                    self.send();
                }, 200);
                return;
            }
            self._uid = S.guid();
            maps[self._uid] = self;

            // ie67 send 出错？
            flash.send(io._getUrlForSend(), {
                id: self._uid,
                uid: self._uid,
                method: c.type,
                data: c.hasContent && c.data || {}
            });
        },

        abort: function () {
            flash.abort(this._uid);
        },

        _xdrResponse: function (e, o) {
            // S.log(e);
            var self = this,
                ret,
                id = o.id,
                responseText,
                c = o.c,
                io = self.io;

            // need decodeURI to get real value from flash returned value
            if (c && (responseText = c.responseText)) {
                io.responseText = decodeURI(responseText);
            }

            switch (e) {
                case 'success':
                    ret = { status: 200, statusText: 'success' };
                    delete maps[id];
                    break;
                case 'abort':
                    delete maps[id];
                    break;
                case 'timeout':
                case 'transport error':
                case 'failure':
                    delete maps[id];
                    ret = {
                        status: 'status' in c ? c.status : 500,
                        statusText: c.statusText || e
                    };
                    break;
            }
            if (ret) {
                io._ioReady(ret.status, ret.statusText);
            }
        }
    });

    /*called by flash*/
    IO['applyTo'] = function (_, cmd, args) {
        // S.log(cmd + ' execute');
        var cmds = cmd.split('.').slice(1),
            func = IO;
        S.each(cmds, function (c) {
            func = func[c];
        });
        func.apply(null, args);
    };

    // when flash is loaded
    IO['xdrReady'] = function () {
        flash = doc.getElementById(ID);
    };

    /*
     when response is returned from server
     @param e response status
     @param o internal data
     */
    IO['xdrResponse'] = function (e, o) {
        var xhr = maps[o.uid];
        xhr && xhr._xdrResponse(e, o);
    };

    return XdrFlashTransport;

}, {
    requires: ['./base', 'dom']
});/**
 * @ignore
 * base for xhr and subdomain
 * @author yiminghe@gmail.com
 */
KISSY.add('ajax/xhr-transport-base', function (S, IO) {
        var OK_CODE = 200,
            win = S.Env.host,
        // http://msdn.microsoft.com/en-us/library/cc288060(v=vs.85).aspx
            _XDomainRequest = S.UA.ie > 7 && win['XDomainRequest'],
            NO_CONTENT_CODE = 204,
            NOT_FOUND_CODE = 404,
            NO_CONTENT_CODE2 = 1223,
            XhrTransportBase = {
                proto: {}
            }, lastModifiedCached = {},
            eTagCached = {};

        IO.__lastModifiedCached = lastModifiedCached;
        IO.__eTagCached = eTagCached;

        function createStandardXHR(_, refWin) {
            try {
                return new (refWin || win)['XMLHttpRequest']();
            } catch (e) {
                S.log('createStandardXHR error: ' + _);
            }
            return undefined;
        }

        function createActiveXHR(_, refWin) {
            try {
                return new (refWin || win)['ActiveXObject']('Microsoft.XMLHTTP');
            } catch (e) {
                S.log('createActiveXHR error: ' + _);
            }
            return undefined;
        }

        XhrTransportBase.nativeXhr = win['ActiveXObject'] ? function (crossDomain, refWin) {
            // consider ie10
            if (!XhrTransportBase.supportCORS && crossDomain && _XDomainRequest) {
                return new _XDomainRequest();
            }
            // ie7 XMLHttpRequest 不能访问本地文件
            return !IO.isLocal && createStandardXHR(crossDomain, refWin) ||
                createActiveXHR(crossDomain, refWin);
        } : createStandardXHR;

        XhrTransportBase._XDomainRequest = _XDomainRequest;
        XhrTransportBase.supportCORS = ('withCredentials' in XhrTransportBase.nativeXhr());
        function isInstanceOfXDomainRequest(xhr) {
            return _XDomainRequest && (xhr instanceof _XDomainRequest);
        }

        function getIfModifiedKey(c) {
            var ifModified = c.ifModified,
                ifModifiedKey;
            if (ifModified) {
                ifModifiedKey = c.uri;
                if (c.cache === false) {
                    ifModifiedKey = ifModifiedKey.clone();
                    // remove random timestamp
                    // random timestamp is forced to fetch code file from server
                    ifModifiedKey.query.remove('_ksTS');
                }
                ifModifiedKey = ifModifiedKey.toString();
            }
            return ifModifiedKey;
        }

        S.mix(XhrTransportBase.proto, {
            sendInternal: function () {
                var self = this,
                    io = self.io,
                    c = io.config,
                    nativeXhr = self.nativeXhr,
                    type = c.type,
                    async = c.async,
                    username,
                    mimeType = io.mimeType,
                    requestHeaders = io.requestHeaders || {},
                    url = io._getUrlForSend(),
                    xhrFields,
                    ifModifiedKey = getIfModifiedKey(c),
                    cacheValue,
                    i;

                if (ifModifiedKey) {
                    // if io want a conditional load
                    // (response status is 304 and responseText is null)
                    // u need to set if-modified-since manually!
                    // or else
                    // u will always get response status 200 and full responseText
                    // which is also conditional load but process transparently by browser
                    if (cacheValue = lastModifiedCached[ifModifiedKey]) {
                        requestHeaders['If-Modified-Since'] = cacheValue;
                    }
                    if (cacheValue = eTagCached[ifModifiedKey]) {
                        requestHeaders['If-None-Match'] = cacheValue;
                    }
                }

                if (username = c['username']) {
                    nativeXhr.open(type, url, async, username, c.password)
                } else {
                    nativeXhr.open(type, url, async);
                }

                if (xhrFields = c['xhrFields']) {
                    for (i in xhrFields) {
                        nativeXhr[ i ] = xhrFields[ i ];
                    }
                }

                // Override mime type if supported
                if (mimeType && nativeXhr.overrideMimeType) {
                    nativeXhr.overrideMimeType(mimeType);
                }

                // set header event cross domain, eg: phonegap
                if (!requestHeaders['X-Requested-With']) {
                    requestHeaders[ 'X-Requested-With' ] = 'XMLHttpRequest';
                }


                // ie<10 XDomainRequest does not support setRequestHeader
                if (typeof nativeXhr.setRequestHeader !== 'undefined') {
                    for (i in requestHeaders) {
                        nativeXhr.setRequestHeader(i, requestHeaders[ i ]);
                    }
                }

                nativeXhr.send(c.hasContent && c.data || null);

                if (!async || nativeXhr.readyState == 4) {
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
            // 由 io.abort 调用，自己不可以调用 io.abort
            abort: function () {
                this._callback(0, 1);
            },

            _callback: function (event, abort) {
                // Firefox throws exceptions when accessing properties
                // of an xhr when a network error occurred
                // http://helpful.knobs-dials.com/index.php/Component_returned_failure_code:_0x80040111_(NS_ERROR_NOT_AVAILABLE)
                var self = this,
                    nativeXhr = self.nativeXhr,
                    io = self.io,
                    ifModifiedKey,
                    lastModified,
                    eTag,
                    statusText,
                    xml,
                    c = io.config;
                try {
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
                            ifModifiedKey = getIfModifiedKey(c);

                            var status = nativeXhr.status;

                            // _XDomainRequest 不能获取响应头
                            if (!isInstanceOfXDomainRequest(nativeXhr)) {
                                io.responseHeadersString = nativeXhr.getAllResponseHeaders();
                            }

                            if (ifModifiedKey) {
                                lastModified = nativeXhr.getResponseHeader('Last-Modified');
                                eTag = nativeXhr.getResponseHeader('ETag');
                                // if u want to set if-modified-since manually
                                // u need to save last-modified after the first request
                                if (lastModified) {
                                    lastModifiedCached[ifModifiedKey] = lastModified;
                                }
                                if (eTag) {
                                    eTagCached[eTag] = eTag;
                                }
                            }

                            xml = nativeXhr.responseXML;

                            // Construct response list
                            if (xml && xml.documentElement /* #4958 */) {
                                io.responseXML = xml;
                            }
                            io.responseText = nativeXhr.responseText;

                            // Firefox throws an exception when accessing
                            // statusText for faulty cross-domain requests
                            try {
                                statusText = nativeXhr.statusText;
                            } catch (e) {
                                S.log('xhr statusText error: ');
                                S.log(e);
                                // We normalize with Webkit giving an empty statusText
                                statusText = '';
                            }

                            // Filter status for non standard behaviors
                            // If the request is local and we have data: assume a success
                            // (success with no data won't get notified, that's the best we
                            // can do given current implementations)
                            if (!status && IO.isLocal && !c.crossDomain) {
                                status = io.responseText ? OK_CODE : NOT_FOUND_CODE;
                                // IE - #1450: sometimes returns 1223 when it should be 204
                            } else if (status === NO_CONTENT_CODE2) {
                                status = NO_CONTENT_CODE;
                            }

                            io._ioReady(status, statusText);
                        }
                    }
                } catch (firefoxAccessException) {
                    nativeXhr.onreadystatechange = S.noop;
                    if (!abort) {
                        io._ioReady(-1, firefoxAccessException);
                    }
                }
            }
        })
        ;

        return XhrTransportBase;
    },
    {
        requires: ['./base']
    }
)
;/**
 * @ignore
 * io xhr transport class, route subdomain, xdr
 * @author yiminghe@gmail.com
 */
KISSY.add('ajax/xhr-transport', function (S, IO, XhrTransportBase, SubDomainTransport, XdrFlashTransport) {

    var win = S.Env.host,
        doc = win.document,
        _XDomainRequest = XhrTransportBase._XDomainRequest;

    function isSubDomain(hostname) {
        // phonegap does not have doc.domain
        return doc.domain && S.endsWith(hostname, doc.domain);
    }

    /**
     * @class
     * @ignore
     */
    function XhrTransport(io) {
        var c = io.config,
            crossDomain = c.crossDomain,
            self = this,
            xhr,
            xdrCfg = c['xdr'] || {},
            subDomain = xdrCfg.subDomain = xdrCfg.subDomain || {};

        self.io = io;

        if (crossDomain) {
            // 跨子域
            if (isSubDomain(c.uri.getHostname())) {
                // force to not use sub domain transport
                if (subDomain.proxy !== false) {
                    return new SubDomainTransport(io);
                }
            }

            /*
             ie>7 通过配置 use='flash' 强制使用 flash xdr
             使用 withCredentials 检测是否支持 CORS
             http://hacks.mozilla.org/2009/07/cross-site-xmlhttprequest-with-cors/
             */
            if (!XhrTransportBase.supportCORS &&
                (String(xdrCfg.use) === 'flash' || !_XDomainRequest)) {
                return new XdrFlashTransport(io);
            }
        }

        xhr = self.nativeXhr = XhrTransportBase.nativeXhr(crossDomain);
        S.log('crossDomain: ' + crossDomain + ', use ' + (_XDomainRequest && (xhr instanceof _XDomainRequest) ? 'XDomainRequest' : 'XhrTransport') + ' for: ' + c.url);

        return self;
    }

    S.augment(XhrTransport, XhrTransportBase.proto, {

        send: function () {
            this.sendInternal();
        }

    });

    IO['setupTransport']('*', XhrTransport);


    return IO;
}, {
    requires: ['./base', './xhr-transport-base', './sub-domain-transport', './xdr-flash-transport']
});

/*
 2012-11-28 note ie port problem:
 - ie 的 xhr 可以跨端口发请求，例如 localhost:8888 发请求到 localhost:9999
 - ie iframe 间访问不设置 document.domain 完全不考虑 port！
 - localhost:8888 访问 iframe 内的 localhost:9999

 CORS : http://www.nczonline.net/blog/2010/05/25/cross-domain-io-with-cross-origin-resource-sharing/
 */
/*
Copyright 2012, KISSY UI Library v1.30
MIT Licensed
build time: Dec 20 22:24
*/
/**
 * @ignore
 * @fileOverview cookie
 * @author lifesinger@gmail.com
 */
KISSY.add('cookie', function (S) {

    var doc = S.Env.host.document,
        MILLISECONDS_OF_DAY = 24 * 60 * 60 * 1000,
        encode = encodeURIComponent,
        decode = S.urlDecode;

    function isNotEmptyString(val) {
        return (typeof val == 'string') && val !== '';
    }

    /**
     * Provide Cookie utilities.
     * @class KISSY.Cookie
     * @singleton
     */
    return S.Cookie = {

        /**
         * Returns the cookie value for given name
         * @return {String} name The name of the cookie to retrieve
         */
        get: function (name) {
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
         * if Number specified how many days this cookie will expire
         * @param {String} domain set cookie's domain
         * @param {String} path set cookie's path
         * @param {Boolean} secure whether this cookie can only be sent to server on https
         */
        set: function (name, val, expires, domain, path, secure) {
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
        remove: function (name, domain, path, secure) {
            this.set(name, '', -1, domain, path, secure);
        }
    };

});

/*
 2012.02.14 yiminghe@gmail.com
 - jsdoc added

 2010.04
 - get 方法要考虑 ie 下，
 值为空的 cookie 为 'test3; test3=3; test3tt=2; test1=t1test3; test3', 没有等于号。
 除了正则获取，还可以 split 字符串的方式来获取。
 - api 设计上，原本想借鉴 jQuery 的简明风格：S.cookie(name, ...), 但考虑到可扩展性，目前
 独立成静态工具类的方式更优。
 */
/*
Copyright 2012, KISSY UI Library v1.30
MIT Licensed
build time: Dec 20 22:23
*/
/**
 * @ignore
 * @fileOverview attribute management
 * @author yiminghe@gmail.com, lifesinger@gmail.com
 */
KISSY.add('base/attribute', function (S, undefined) {

    // atomic flag
    Attribute.INVALID = {};

    var INVALID = Attribute.INVALID;

    function normalFn(host, method) {
        if (typeof method == 'string') {
            return host[method];
        }
        return method;
    }

    // fire attribute value change
    function __fireAttrChange(self, when, name, prevVal, newVal, subAttrName, attrName) {
        attrName = attrName || name;
        return self.fire(when + S.ucfirst(name) + 'Change', {
            attrName: attrName,
            subAttrName: subAttrName,
            prevVal: prevVal,
            newVal: newVal
        });
    }

    function ensureNonEmpty(obj, name, create) {
        var ret = obj[name] || {};
        if (create) {
            obj[name] = ret;
        }
        return ret;
    }

    function getAttrs(self) {
        /*
         attribute meta information
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
        return ensureNonEmpty(self, '__attrs', true);
    }


    function getAttrVals(self) {
        /*
         attribute value
         {
         attrName: attrVal
         }
         */
        return ensureNonEmpty(self, '__attrVals', true);
    }

    /*
     o, [x,y,z] => o[x][y][z]
     */
    function getValueByPath(o, path) {
        for (var i = 0, len = path.length;
             o != undefined && i < len;
             i++) {
            o = o[path[i]];
        }
        return o;
    }

    /*
     o, [x,y,z], val => o[x][y][z]=val
     */
    function setValueByPath(o, path, val) {
        var len = path.length - 1,
            s = o;
        if (len >= 0) {
            for (var i = 0; i < len; i++) {
                o = o[path[i]];
            }
            if (o != undefined) {
                o[path[i]] = val;
            } else {
                s = undefined;
            }
        }
        return s;
    }

    function getPathNamePair(self, name) {
        var declared = self.hasAttr(name), path;

        if (
        // 声明过，那么 xx.yy 当做普通属性
            !declared &&
                name.indexOf('.') !== -1) {
            path = name.split('.');
            name = path.shift();
        }

        return {
            path: path,
            name: name
        };
    }

    function getValueBySubValue(prevVal, path, value) {
        var tmp = value;
        if (path) {
            if (prevVal === undefined) {
                tmp = {};
            } else {
                tmp = S.clone(prevVal);
            }
            setValueByPath(tmp, path, value);
        }
        return tmp;
    }

    function setInternal(self, name, value, opts, attrs) {
        opts = opts || {};

        var ret,
            path,
            subVal,
            prevVal,
            pathNamePair = getPathNamePair(self, name),
            fullName = name;

        name = pathNamePair.name;
        path = pathNamePair.path;
        prevVal = self.get(name);

        if (path) {
            subVal = getValueByPath(prevVal, path);
        }

        // if no change, just return
        if (!path && prevVal === value) {
            return undefined;
        } else if (path && subVal === value) {
            return undefined;
        }

        value = getValueBySubValue(prevVal, path, value);

        // check before event
        if (!opts['silent']) {
            if (false === __fireAttrChange(self, 'before', name, prevVal, value, fullName)) {
                return false;
            }
        }
        // set it
        ret = self.setInternal(name, value, opts);

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
                    prevVal: prevVal,
                    newVal: value,
                    attrName: name,
                    subAttrName: fullName
                });
            }
        }
        return self;
    }

    /**
     * @class KISSY.Base.Attribute
     * @private
     * Attribute provides configurable attribute support along with attribute change events.
     * It is designed to be augmented on to a host class,
     * and provides the host with the ability to configure attributes to store and retrieve state,
     * along with attribute change events.
     *
     * For example, attributes added to the host can be configured:
     *
     *  - With a setter function, which can be used to manipulate
     *  values passed to attribute 's {@link #set} method, before they are stored.
     *  - With a getter function, which can be used to manipulate stored values,
     *  before they are returned by attribute 's {@link #get} method.
     *  - With a validator function, to validate values before they are stored.
     *
     * See the {@link #addAttr} method, for the complete set of configuration
     * options available for attributes.
     *
     * NOTE: Most implementations will be better off extending the {@link KISSY.Base} class,
     * instead of augmenting Attribute directly.
     * Base augments Attribute and will handle the initial configuration
     * of attributes for derived classes, accounting for values passed into the constructor.
     */
    function Attribute() {
    }


    Attribute.prototype = {

        /**
         * get un-cloned attr config collections
         * @return {Object}
         * @private
         */
        getAttrs: function () {
            return getAttrs(this);
        },

        /**
         * get un-cloned attr value collections
         * @return {Object}
         */
        getAttrVals: function () {
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
         * @param [attrConfig.valueFn] a function which can return current attribute 's default value
         * @param {Function} [attrConfig.setter] call when set attribute 's value
         * pass current attribute 's value as parameter
         * if return value is not undefined,set returned value as real value
         * @param {Function} [attrConfig.getter] call when get attribute 's value
         * pass current attribute 's value as parameter
         * return getter's returned value to invoker
         * @param {Function} [attrConfig.validator]  call before set attribute 's value
         * if return false,cancel this set action
         * @param {Boolean} [override] whether override existing attribute config ,default true
         * @chainable
         */
        addAttr: function (name, attrConfig, override) {
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
         * @chainable
         */
        addAttrs: function (attrConfigs, initialValues) {
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
         * @param {String} name attribute name
         * @return {Boolean}
         */
        hasAttr: function (name) {
            return getAttrs(this).hasOwnProperty(name);
        },

        /**
         * Removes an attribute from the host object.
         * @chainable
         */
        removeAttr: function (name) {
            var self = this;

            if (self.hasAttr(name)) {
                delete getAttrs(self)[name];
                delete getAttrVals(self)[name];
            }

            return self;
        },


        /**
         * Sets the value of an attribute.
         * @param {String|Object} name attribute 's name or attribute name and value map
         * @param [value] attribute 's value
         * @param {Object} [opts] some options
         * @param {Boolean} [opts.silent] whether fire change event
         * @return {Boolean} whether pass validator
         */
        set: function (name, value, opts) {
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
                    if ((e = validate(self, name, all[name], all)) !== undefined) {
                        errors.push(e);
                    }
                }
                if (errors.length) {
                    if (opts && opts.error) {
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
         * @protected
         */
        setInternal: function (name, value, opts) {
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

            if (e !== undefined) {
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

            if (setValue !== undefined) {
                value = setValue;
            }


            // finally set
            getAttrVals(self)[name] = value;
        },

        /**
         * Gets the current value of the attribute.
         * @param {String} name attribute 's name
         * @return {*}
         */
        get: function (name) {
            var self = this,
                dot = '.',
                path,
                declared = self.hasAttr(name),
                attrVals = getAttrVals(self),
                attrConfig,
                getter, ret;

            if (!declared && name.indexOf(dot) !== -1) {
                path = name.split(dot);
                name = path.shift();
            }

            attrConfig = ensureNonEmpty(getAttrs(self), name);
            getter = attrConfig['getter'];

            // get user-set value or default value
            //user-set value takes privilege
            ret = name in attrVals ?
                attrVals[name] :
                getDefAttrVal(self, name);

            // invoke getter for this attribute
            if (getter && (getter = normalFn(self, getter))) {
                ret = getter.call(self, ret, name);
            }

            if (!(name in attrVals) && ret !== undefined) {
                attrVals[name] = ret;
            }

            if (path) {
                ret = getValueByPath(ret, path);
            }

            return ret;
        },

        /**
         * Resets the value of an attribute.just reset what addAttr set
         * (not what invoker set when call new Xx(cfg))
         * @param {String} name name of attribute
         * @param {Object} [opts] some options
         * @param {Boolean} [opts.silent] whether fire change event
         * @chainable
         */
        reset: function (name, opts) {
            var self = this;

            if (typeof name == 'string') {
                if (self.hasAttr(name)) {
                    // if attribute does not have default value, then set to undefined
                    return self.set(name, getDefAttrVal(self, name), opts);
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
                values[name] = getDefAttrVal(self, name);
            }

            self.set(values, opts);
            return self;
        }
    };


    // get default attribute value from valueFn/value
    function getDefAttrVal(self, name) {
        var attrs = getAttrs(self),
            attrConfig = ensureNonEmpty(attrs, name),
            valFn = attrConfig.valueFn,
            val;

        if (valFn && (valFn = normalFn(self, valFn))) {
            val = valFn.call(self);
            if (val !== undefined) {
                attrConfig.value = val;
            }
            delete attrConfig.valueFn;
            attrs[name] = attrConfig;
        }

        return attrConfig.value;
    }

    function validate(self, name, value, all) {
        var path, prevVal, pathNamePair;

        pathNamePair = getPathNamePair(self, name);

        name = pathNamePair.name;
        path = pathNamePair.path;

        if (path) {
            prevVal = self.get(name);
            value = getValueBySubValue(prevVal, path, value);
        }
        var attrConfig = ensureNonEmpty(getAttrs(self), name, true),
            e,
            validator = attrConfig['validator'];
        if (validator && (validator = normalFn(self, validator))) {
            e = validator.call(self, value, name, all);
            // undefined and true validate successfully
            if (e !== undefined && e !== true) {
                return e;
            }
        }
        return undefined;
    }

    return Attribute;
});

/*
 2011-10-18
 get/set sub attribute value ,set('x.y',val) x 最好为 {} ，不要是 new Clz() 出来的
 add validator
 */
/**
 * @ignore
 * @fileOverview attribute management and event in one
 * @author yiminghe@gmail.com, lifesinger@gmail.com
 */
KISSY.add('base', function (S, Attribute, Event) {

    /**
     * @class KISSY.Base
     * @mixins KISSY.Event.Target
     * @mixins KISSY.Base.Attribute
     *
     * A base class which objects requiring attributes and custom event support can
     * extend. attributes configured
     * through the static {@link KISSY.Base#static-ATTRS} property for each class
     * in the hierarchy will be initialized by Base.
     */
    function Base(config) {
        var self = this,
            c = self.constructor;
        // save user config
        self.userConfig = config;
        // define
        while (c) {
            addAttrs(self, c['ATTRS']);
            c = c.superclass ? c.superclass.constructor : null;
        }
        // initial
        initAttrs(self, config);
    }


    /**
     * The default set of attributes which will be available for instances of this class, and
     * their configuration
     *
     * By default if the value is an object literal or an array it will be 'shallow' cloned, to
     * protect the default value.
     *
     *      for example:
     *      @example
     *      {
     *          x:{
     *              value: // default value
     *              valueFn: // default function to get value
     *              getter: // getter function
     *              setter: // setter function
     *          }
     *      }
     *
     * @property ATTRS
     * @member KISSY.Base
     * @static
     * @type {Object}
     */


    function addAttrs(host, attrs) {
        if (attrs) {
            for (var attr in attrs) {
                // 子类上的 ATTRS 配置优先
                // 父类后加，父类不覆盖子类的相同设置
                // 属性对象会 merge
                // a: {y: {getter: fn}}, b: {y: {value: 3}}
                // b extends a
                // =>
                // b {y: {value: 3, getter: fn}}
                host.addAttr(attr, attrs[attr], false);
            }
        }
    }

    function initAttrs(host, config) {
        if (config) {
            for (var attr in config) {
                // 用户设置会调用 setter/validator 的，但不会触发属性变化事件
                host.setInternal(attr, config[attr]);
            }
        }
    }

    S.augment(Base, Event.Target, Attribute);

    Base.Attribute = Attribute;

    S.Base = Base;

    return Base;
}, {
    requires: ['base/attribute', 'event/custom']
});
/*
Copyright 2012, KISSY UI Library v1.30
MIT Licensed
build time: Dec 20 22:23
*/
/**
 * @ignore
 * @fileOverview anim
 */
KISSY.add('anim', function (S, Anim, Easing) {
    Anim.Easing = Easing;
    S.mix(S, {
        Anim:Anim,
        Easing:Anim.Easing
    });
    return Anim;
}, {
    requires:['anim/base', 'anim/easing', 'anim/color', 'anim/background-position']
});/**
 * @ignore
 * @fileOverview special patch for anim backgroundPosition
 * @author yiminghe@gmail.com
 */
KISSY.add('anim/background-position', function (S, DOM, Anim, Fx) {

    function numeric(bp) {
        bp = bp.replace(/left|top/g, '0px')
            .replace(/right|bottom/g, '100%')
            .replace(/([0-9\.]+)(\s|\)|$)/g, '$1px$2');
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
            fromUnit = self.unit = ['px', 'px'];
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
                    S.log('BackgroundPosition x y unit is not same :', 'warn');
                    S.log(fromUnit, 'warn');
                    S.log(self.unit, 'warn');
                }
            }
        },

        interpolate:function (from, to, pos) {
            var unit = this.unit, interpolate = BackgroundPositionFx.superclass.interpolate;
            return interpolate(from[0], to[0], pos) + unit[0] + ' ' +
                interpolate(from[1], to[1], pos) + unit[1];
        },

        cur:function () {
            return DOM.css(this.anim.config.el, 'backgroundPosition');
        },

        update:function () {
            var self = this,
                prop = self.prop,
                el = self.anim.config.el,
                from = self.from,
                to = self.to,
                val = self.interpolate(from, to, self.pos);
            DOM.css(el, prop, val);
        }

    });

    Fx.Factories['backgroundPosition'] = BackgroundPositionFx;

    return BackgroundPositionFx;

}, {
    requires:['dom', './base', './fx']
});/**
 * @ignore
 * @fileOverview animation framework for KISSY
 * @author   yiminghe@gmail.com, lifesinger@gmail.com
 */
KISSY.add('anim/base', function (S, DOM, Event, Easing, AM, Fx, Q) {

    var UA = S.UA,
        camelCase = DOM._camelCase,
        NodeType = DOM.NodeType,
        specialVals = ['hide', 'show', 'toggle'],
    // shorthand css properties
        SHORT_HANDS = {
            // http://www.w3.org/Style/CSS/Tracker/issues/9
            // http://snook.ca/archives/html_and_css/background-position-x-y
            // backgroundPositionX  backgroundPositionY does not support
            background: [
                'backgroundPosition'
            ],
            border: [
                'borderBottomWidth',
                'borderLeftWidth',
                'borderRightWidth',
                // 'borderSpacing', 组合属性？
                'borderTopWidth'
            ],
            'borderBottom': ['borderBottomWidth'],
            'borderLeft': ['borderLeftWidth'],
            borderTop: ['borderTopWidth'],
            borderRight: ['borderRightWidth'],
            font: [
                'fontSize',
                'fontWeight'
            ],
            margin: [
                'marginBottom',
                'marginLeft',
                'marginRight',
                'marginTop'
            ],
            padding: [
                'paddingBottom',
                'paddingLeft',
                'paddingRight',
                'paddingTop'
            ]
        },
        defaultConfig = {
            duration: 1,
            easing: 'easeNone'
        },
        NUMBER_REG = /^([+\-]=)?([\d+.\-]+)([a-z%]*)$/i;

    Anim.SHORT_HANDS = SHORT_HANDS;

    /**
     * @class KISSY.Anim
     * A class for constructing animation instances.
     * @mixins KISSY.Event.Target
     * @cfg {HTMLElement|window} el html dom node or window
     * (window can only animate scrollTop/scrollLeft)
     * @cfg {Object} props end css style value.
     * @cfg {Number} [duration=1] duration(second) or anim config
     * @cfg {String|Function} [easing='easeNone'] easing fn or string
     * @cfg {Function} [complete] callback function when this animation is complete
     * @cfg {String|Boolean} [queue] current animation's queue, if false then no queue
     */
    function Anim(el, props, duration, easing, complete) {

        if (el.el) {
            var realEl = el.el;
            props = el.props;
            delete el.el;
            delete  el.props;
            return new Anim(realEl, props, el);
        }

        var self = this, config;

        // ignore non-exist element
        if (!(el = DOM.get(el))) {
            return;
        }

        // factory or constructor
        if (!(self instanceof Anim)) {
            return new Anim(el, props, duration, easing, complete);
        }

        // the transition properties
        if (typeof props == 'string') {
            props = S.unparam(String(props), ';', ':');
        } else {
            // clone to prevent collision within multiple instance
            props = S.clone(props);
        }

        // camel case uniformity
        S.each(props, function (v, prop) {
            var camelProp = S.trim(camelCase(prop));
            if (!camelProp) {
                delete props[prop];
            } else if (prop != camelProp) {
                props[camelProp] = props[prop];
                delete props[prop];
            }
        });

        // animation config
        if (S.isPlainObject(duration)) {
            config = S.clone(duration);
        } else {
            config = {
                duration: parseFloat(duration) || undefined,
                easing: easing,
                complete: complete
            };
        }

        config = S.merge(defaultConfig, config);
        config.el = el;
        config.props = props;

        /**
         * config object of current anim instance
         * @type {Object}
         */
        self.config = config;
        self._duration = config.duration * 1000;

        // domEl deprecated!
        self['domEl'] = el;
        // self.props = props;

        // 实例属性
        self._backupProps = {};
        self._fxs = {};

        // register complete
        self.on('complete', onComplete);
    }


    function onComplete(e) {
        var self = this,
            _backupProps,
            complete,
            config = self.config;

        // only recover after complete anim
        if (!S.isEmptyObject(_backupProps = self._backupProps)) {
            DOM.css(config.el, _backupProps);
        }

        if (complete = config.complete) {
            complete.call(self, e);
        }
    }

    function runInternal() {
        var self = this,
            config = self.config,
            _backupProps = self._backupProps,
            el = config.el,
            elStyle,
            hidden,
            val,
            prop,
            specialEasing = (config['specialEasing'] || {}),
            fxs = self._fxs,
            props = config.props;

        // 进入该函数即代表执行（q[0] 已经是 ...）
        saveRunning(self);

        if (self.fire('beforeStart') === false) {
            // no need to invoke complete
            self.stop(0);
            return;
        }

        if (el.nodeType == NodeType.ELEMENT_NODE) {
            hidden = (DOM.css(el, 'display') === 'none');
            for (prop in props) {
                val = props[prop];
                // 直接结束
                if (val == 'hide' && hidden || val == 'show' && !hidden) {
                    // need to invoke complete
                    self.stop(1);
                    return;
                }
            }
        }

        // 放在前面，设置 overflow hidden，否则后面 ie6  取 width/height 初值导致错误
        // <div style='width:0'><div style='width:100px'></div></div>
        if (el.nodeType == NodeType.ELEMENT_NODE &&
            (props.width || props.height)) {
            // Make sure that nothing sneaks out
            // Record all 3 overflow attributes because IE does not
            // change the overflow attribute when overflowX and
            // overflowY are set to the same value
            elStyle = el.style;
            S.mix(_backupProps, {
                overflow: elStyle.overflow,
                'overflow-x': elStyle.overflowX,
                'overflow-y': elStyle.overflowY
            });
            elStyle.overflow = 'hidden';
            // inline element should has layout/inline-block
            if (DOM.css(el, 'display') === 'inline' &&
                DOM.css(el, 'float') === 'none') {
                if (UA['ie']) {
                    elStyle.zoom = 1;
                } else {
                    elStyle.display = 'inline-block';
                }
            }
        }

        // 分离 easing
        S.each(props, function (val, prop) {
            var easing;
            if (S.isArray(val)) {
                easing = specialEasing[prop] = val[1];
                props[prop] = val[0];
            } else {
                easing = specialEasing[prop] = (specialEasing[prop] || config.easing);
            }
            if (typeof easing == 'string') {
                easing = specialEasing[prop] = Easing[easing];
            }
            specialEasing[prop] = easing || Easing['easeNone'];
        });


        // 扩展分属性
        S.each(SHORT_HANDS, function (shortHands, p) {
            var origin,
                val;
            if (val = props[p]) {
                origin = {};
                S.each(shortHands, function (sh) {
                    // 得到原始分属性之前值
                    origin[sh] = DOM.css(el, sh);
                    specialEasing[sh] = specialEasing[p];
                });
                DOM.css(el, p, val);
                S.each(origin, function (val, sh) {
                    // 得到期待的分属性最后值
                    props[sh] = DOM.css(el, sh);
                    // 还原
                    DOM.css(el, sh, val);
                });
                // 删除复合属性
                delete props[p];
            }
        });

        // 取得单位，并对单个属性构建 Fx 对象
        for (prop in props) {

            val = S.trim(props[prop]);

            var to,
                from,
                propCfg = {
                    prop: prop,
                    anim: self,
                    easing: specialEasing[prop]
                },
                fx = Fx.getFx(propCfg);

            // hide/show/toggle : special treat!
            if (S.inArray(val, specialVals)) {
                // backup original inline css value
                _backupProps[prop] = DOM.style(el, prop);
                if (val == 'toggle') {
                    val = hidden ? 'show' : 'hide';
                }
                if (val == 'hide') {
                    to = 0;
                    from = fx.cur();
                    // 执行完后隐藏
                    _backupProps.display = 'none';
                } else {
                    from = 0;
                    to = fx.cur();
                    // prevent flash of content
                    DOM.css(el, prop, from);
                    DOM.show(el);
                }
                val = to;
            } else {
                to = val;
                from = fx.cur();
            }

            val += '';

            var unit = '',
                parts = val.match(NUMBER_REG);

            if (parts) {
                to = parseFloat(parts[2]);
                unit = parts[3];

                // 有单位但单位不是 px
                if (unit && unit !== 'px') {
                    DOM.css(el, prop, val);
                    from = (to / fx.cur()) * from;
                    DOM.css(el, prop, from + unit);
                }

                // 相对
                if (parts[1]) {
                    to = ( (parts[ 1 ] === '-=' ? -1 : 1) * to ) + from;
                }
            }

            propCfg.from = from;
            propCfg.to = to;
            propCfg.unit = unit;
            fx.load(propCfg);
            fxs[prop] = fx;
        }

        self._startTime = S.now();

        AM.start(self);
    }

    Anim.prototype = {

        constructor: Anim,

        /**
         * whether this animation is running
         * @return {Boolean}
         */
        isRunning: function () {
            return isRunning(this);
        },

        /**
         * whether this animation is paused
         * @return {Boolean}
         */
        isPaused: function () {
            return isPaused(this);
        },

        /**
         * pause current anim
         * @chainable
         */
        pause: function () {
            var self = this;
            if (self.isRunning()) {
                self._pauseDiff = S.now() - self._startTime;
                AM.stop(self);
                removeRunning(self);
                savePaused(self);
            }
            return self;
        },

        /**
         * resume current anim
         * @chainable
         */
        resume: function () {
            var self = this;
            if (self.isPaused()) {
                self._startTime = S.now() - self._pauseDiff;
                removePaused(self);
                saveRunning(self);
                AM.start(self);
            }
            return self;
        },

        /**
         * @ignore
         */
        _runInternal: runInternal,

        /**
         * start this animation
         * @chainable
         */
        run: function () {
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

        /**
         * @ignore
         */
        _frame: function () {
            var self = this,
                prop,
                config = self.config,
                end = 1,
                c,
                fx,
                fxs = self._fxs;

            for (prop in fxs) {
                // 当前属性没有结束
                if (!((fx = fxs[prop]).finished)) {
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
                    } else {
                        end &= fx.frame();
                        // 最后通知下
                        if (end && config.frame) {
                            config.frame(fx);
                        }
                    }
                }
            }

            if ((self.fire('step') === false) || end) {
                // complete 事件只在动画到达最后一帧时才触发
                self.stop(end);
            }
        },

        /**
         * stop this animation
         * @param {Boolean} [finish] whether jump to the last position of this animation
         * @chainable
         */
        stop: function (finish) {
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
                return self;
            }

            if (finish) {
                for (prop in fxs) {
                    // 当前属性没有结束
                    if (!((fx = fxs[prop]).finished)) {
                        // 非短路
                        if (config.frame) {
                            config.frame(fx, 1);
                        } else {
                            fx.frame(1);
                        }
                    }
                }
                self.fire('complete');
            }

            AM.stop(self);

            removeRunning(self);

            if (queueName !== false) {
                // notify next anim to run in the same queue
                Q.dequeue(self);
            }

            return self;
        }
    };

    S.augment(Anim, Event.Target);

    var runningKey = S.guid('ks-anim-unqueued-' + S.now() + '-');

    function saveRunning(anim) {
        var el = anim.config.el,
            allRunning = DOM.data(el, runningKey);
        if (!allRunning) {
            DOM.data(el, runningKey, allRunning = {});
        }
        allRunning[S.stamp(anim)] = anim;
    }

    function removeRunning(anim) {
        var el = anim.config.el,
            allRunning = DOM.data(el, runningKey);
        if (allRunning) {
            delete allRunning[S.stamp(anim)];
            if (S.isEmptyObject(allRunning)) {
                DOM.removeData(el, runningKey);
            }
        }
    }

    function isRunning(anim) {
        var el = anim.config.el,
            allRunning = DOM.data(el, runningKey);
        if (allRunning) {
            return !!allRunning[S.stamp(anim)];
        }
        return 0;
    }


    var pausedKey = S.guid('ks-anim-paused-' + S.now() + '-');

    function savePaused(anim) {
        var el = anim.config.el,
            paused = DOM.data(el, pausedKey);
        if (!paused) {
            DOM.data(el, pausedKey, paused = {});
        }
        paused[S.stamp(anim)] = anim;
    }

    function removePaused(anim) {
        var el = anim.config.el,
            paused = DOM.data(el, pausedKey);
        if (paused) {
            delete paused[S.stamp(anim)];
            if (S.isEmptyObject(paused)) {
                DOM.removeData(el, pausedKey);
            }
        }
    }

    function isPaused(anim) {
        var el = anim.config.el,
            paused = DOM.data(el, pausedKey);
        if (paused) {
            return !!paused[S.stamp(anim)];
        }
        return 0;
    }

    /**
     * stop all the anims currently running
     * @static
     * @param {HTMLElement} el element which anim belongs to
     * @param {Boolean} end whether jump to last position
     * @param {Boolean} clearQueue whether clean current queue
     * @param {String|Boolean} queueName current queue's name to be cleared
     */
    Anim.stop = function (el, end, clearQueue, queueName) {
        if (
        // default queue
            queueName === null ||
                // name of specified queue
                typeof queueName == 'string' ||
                // anims not belong to any queue
                queueName === false
            ) {
            return stopQueue.apply(undefined, arguments);
        }
        // first stop first anim in queues
        if (clearQueue) {
            Q.removeQueues(el);
        }
        var allRunning = DOM.data(el, runningKey),
        // can not stop in for/in , stop will modified allRunning too
            anims = S.merge(allRunning);
        S.each(anims, function (anim) {
            anim.stop(end);
        });
    };


    /**
     * pause all the anims currently running
     * @param {HTMLElement} el element which anim belongs to
     * @param {String|Boolean} queueName current queue's name to be cleared
     * @method pause
     * @member KISSY.Anim
     * @static
     */

    /**
     * resume all the anims currently running
     * @param {HTMLElement} el element which anim belongs to
     * @param {String|Boolean} queueName current queue's name to be cleared
     * @method resume
     * @member KISSY.Anim
     * @static
     */

    S.each(['pause', 'resume'], function (action) {
        Anim[action] = function (el, queueName) {
            if (
            // default queue
                queueName === null ||
                    // name of specified queue
                    typeof queueName == 'string' ||
                    // anims not belong to any queue
                    queueName === false
                ) {
                return pauseResumeQueue(el, queueName, action);
            }
            pauseResumeQueue(el, undefined, action);
        };
    });

    function pauseResumeQueue(el, queueName, action) {
        var allAnims = DOM.data(el, action == 'resume' ? pausedKey : runningKey),
        // can not stop in for/in , stop will modified allRunning too
            anims = S.merge(allAnims);

        S.each(anims, function (anim) {
            if (queueName === undefined ||
                anim.config.queue == queueName) {
                anim[action]();
            }
        });
    }

    /**
     *
     * @param el element which anim belongs to
     * @param queueName queue'name if set to false only remove
     * @param end
     * @param clearQueue
     * @ignore
     */
    function stopQueue(el, end, clearQueue, queueName) {
        if (clearQueue && queueName !== false) {
            Q.removeQueue(el, queueName);
        }
        var allRunning = DOM.data(el, runningKey),
            anims = S.merge(allRunning);
        S.each(anims, function (anim) {
            if (anim.config.queue == queueName) {
                anim.stop(end);
            }
        });
    }

    /**
     * whether el is running anim
     * @param {HTMLElement} el
     * @return {Boolean}
     * @static
     */
    Anim.isRunning = function (el) {
        var allRunning = DOM.data(el, runningKey);
        return allRunning && !S.isEmptyObject(allRunning);
    };

    /**
     * whether el has paused anim
     * @param {HTMLElement} el
     * @return {Boolean}
     * @static
     */
    Anim.isPaused = function (el) {
        var paused = DOM.data(el, pausedKey);
        return paused && !S.isEmptyObject(paused);
    };

    /**
     * @ignore
     */
    Anim.Q = Q;

    if (SHORT_HANDS) {
    }
    return Anim;
}, {
    requires: ['dom', 'event', './easing', './manager', './fx', './queue']
});

/*
 2011-11
 - 重构，抛弃 emile，优化性能，只对需要的属性进行动画
 - 添加 stop/stopQueue/isRunning，支持队列管理

 2011-04
 - 借鉴 yui3 ，中央定时器，否则 ie6 内存泄露？
 - 支持配置 scrollTop/scrollLeft


 TODO:
 - 效率需要提升，当使用 nativeSupport 时仍做了过多动作
 - opera nativeSupport 存在 bug ，浏览器自身 bug ?
 - 实现 jQuery Effects 的 queue / specialEasing / += / 等特性

 NOTES:
 - 与 emile 相比，增加了 borderStyle, 使得 border: 5px solid #ccc 能从无到有，正确显示
 - api 借鉴了 YUI, jQuery 以及 http://www.w3.org/TR/css3-transitions/
 - 代码实现了借鉴了 Emile.js: http://github.com/madrobby/emile *
 */
/**
 * @ignore
 * @fileOverview special patch for making color gradual change
 * @author yiminghe@gmail.com
 */
KISSY.add('anim/color', function (S, DOM, Anim, Fx) {

    var HEX_BASE = 16,

        floor = Math.floor,

        KEYWORDS = {
            'black':[0, 0, 0],
            'silver':[192, 192, 192],
            'gray':[128, 128, 128],
            'white':[255, 255, 255],
            'maroon':[128, 0, 0],
            'red':[255, 0, 0],
            'purple':[128, 0, 128],
            'fuchsia':[255, 0, 255],
            'green':[0, 128, 0],
            'lime':[0, 255, 0],
            'olive':[128, 128, 0],
            'yellow':[255, 255, 0],
            'navy':[0, 0, 128],
            'blue':[0, 0, 255],
            'teal':[0, 128, 128],
            'aqua':[0, 255, 255]
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
        val = (val + '');
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
        S.log('only allow rgb or hex color string : ' + val, 'warn');
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
                S.log('anim/color unknown value : ' + from);
            }
        }

    });

    S.each(COLORS, function (color) {
        Fx.Factories[color] = ColorFx;
    });

    return ColorFx;

}, {
    requires:['dom', './base', './fx']
});

/*
  TODO
  支持 hsla
   - https://github.com/jquery/jquery-color/blob/master/jquery.color.js
*//**
 * @ignore
 * @fileOverview Easing equation from yui3
 */
KISSY.add('anim/easing', function () {

    // Based on Easing Equations (c) 2003 Robert Penner, all rights reserved.
    // This work is subject to the terms in http://www.robertpenner.com/easing_terms_of_use.html
    // Preview: http://www.robertpenner.com/Easing/easing_demo.html


// 和 YUI 的 Easing 相比，S.Easing 进行了归一化处理，参数调整为：
// @param {Number} t Time value used to compute current value  保留 0 =< t <= 1
// @param {Number} b Starting value  b = 0
// @param {Number} c Delta between start and end values  c = 1
// @param {Number} d Total length of animation d = 1


    var PI = Math.PI,
        pow = Math.pow,
        sin = Math.sin,
        BACK_CONST = 1.70158;
    /**
     * Provides methods for customizing how an animation behaves during each run.
     * @class KISSY.Anim.Easing
     * @singleton
     */
    var Easing = {

        /**
         * swing effect.
         */
        swing: function (t) {
            return ( -Math.cos(t * PI) / 2 ) + 0.5;
        },

        /**
         * Uniform speed between points.
         */
        'easeNone': function (t) {
            return t;
        },

        /**
         * Begins slowly and accelerates towards end. (quadratic)
         */
        'easeIn': function (t) {
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
        'easeInStrong': function (t) {
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
        'easeBothStrong': function (t) {
            return (t *= 2) < 1 ?
                .5 * t * t * t * t :
                .5 * (2 - (t -= 2) * t * t * t);
        },

        /**
         * Snap in elastic effect.
         */

        'elasticIn': function (t) {
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
        'elasticBoth': function (t) {
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
        'backIn': function (t) {
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
        'backBoth': function (t) {
            var s = BACK_CONST;
            var m = (s *= 1.525) + 1;

            if ((t *= 2 ) < 1) {
                return .5 * (t * t * (m * t - s));
            }
            return .5 * ((t -= 2) * t * (m * t + s) + 2);

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
        'bounceBoth': function (t) {
            if (t < .5) {
                return Easing.bounceIn(t * 2) * .5;
            }
            return Easing.bounceOut(t * 2 - 1) * .5 + .5;
        }
    };

    return Easing;
});

/*
 2012-06-04
 - easing.html 曲线可视化

 NOTES:
 - 综合比较 jQuery UI/scripty2/YUI 的 Easing 命名，还是觉得 YUI 的对用户
 最友好。因此这次完全照搬 YUI 的 Easing, 只是代码上做了点压缩优化。
 - 和原生对应关系：
 Easing.NativeTimeFunction = {
 easeNone: 'linear',
 ease: 'ease',

 easeIn: 'ease-in',
 easeOut: 'ease-out',
 easeBoth: 'ease-in-out',

 // Ref:
 //  1. http://www.w3.org/TR/css3-transitions/#transition-timing-function_tag
 //  2. http://www.robertpenner.com/Easing/easing_demo.html
 //  3. assets/cubic-bezier-timing-function.html
 // 注：是模拟值，非精确推导值
 easeInStrong: 'cubic-bezier(0.9, 0.0, 0.9, 0.5)',
 easeOutStrong: 'cubic-bezier(0.1, 0.5, 0.1, 1.0)',
 easeBothStrong: 'cubic-bezier(0.9, 0.0, 0.1, 1.0)'
 };
 */
/**
 * @ignore
 * @fileOverview animate on single property
 * @author yiminghe@gmail.com
 */
KISSY.add('anim/fx', function (S, DOM, undefined) {

    /**
     * basic animation about single css property or element attribute
     * @class KISSY.Anim.Fx
     * @private
     */
    function Fx(cfg) {
        this.load(cfg);
    }

    Fx.prototype = {

        constructor: Fx,

        /**
         * reset config.
         * @param cfg
         */
        load: function (cfg) {
            var self = this;
            S.mix(self, cfg);
            self.pos = 0;
            self.unit = self.unit || '';
        },

        /**
         * process current anim frame.
         * @param {Boolean} end whether this anim is ended
         * @return {Number}
         *
         */
        frame: function (end) {
            var self = this,
                anim = self.anim,
                endFlag = 0,
                elapsedTime;
            if (self.finished) {
                return 1;
            }
            var t = S.now(),
                _startTime = anim._startTime,
                duration = anim._duration;
            if (end || t >= duration + _startTime) {
                self.pos = 1;
                endFlag = 1;
            } else {
                elapsedTime = t - _startTime;
                self.pos = self.easing(elapsedTime / duration);
            }
            self.update();
            self.finished = self.finished || endFlag;
            return endFlag;
        },

        /**
         * interpolate function
         *
         * @param {Number} from current css value
         * @param {Number} to end css value
         * @param {Number} pos current position from easing 0~1
         * @return {Number} value corresponding to position
         */
        interpolate: function (from, to, pos) {
            // 默认只对数字进行 easing
            if (S.isNumber(from) &&
                S.isNumber(to)) {
                return (from + (to - from) * pos).toFixed(3);
            } else {
                return undefined;
            }
        },

        /**
         * update dom according to current frame css value.
         *
         */
        update: function () {
            var self = this,
                anim = self.anim,
                prop = self.prop,
                el = anim.config.el,
                from = self.from,
                to = self.to,
                val = self.interpolate(from, to, self.pos);

            if (val === undefined) {
                // 插值出错，直接设置为最终值
                if (!self.finished) {
                    self.finished = 1;
                    DOM.css(el, prop, to);
                    S.log(prop + ' update directly ! : ' + val + ' : ' + from + ' : ' + to);
                }
            } else {
                val += self.unit;
                if (isAttr(el, prop)) {
                    DOM.attr(el, prop, val, 1);
                } else {
                    // S.log(self.prop + ' update: ' + val);
                    DOM.css(el, prop, val);
                }
            }
        },

        /**
         * current value
         *
         */
        cur: function () {
            var self = this,
                prop = self.prop,
                el = self.anim.config.el;
            if (isAttr(el, prop)) {
                return DOM.attr(el, prop, undefined, 1);
            }
            var parsed,
                r = DOM.css(el, prop);
            // Empty strings, null, undefined and 'auto' are converted to 0,
            // complex values such as 'rotate(1rad)' or '0px 10px' are returned as is,
            // simple values such as '10px' are parsed to Float.
            return isNaN(parsed = parseFloat(r)) ?
                !r || r === 'auto' ? 0 : r
                : parsed;
        }
    };

    function isAttr(el, prop) {
        // support scrollTop/Left now!
        if ((!el.style || el.style[ prop ] == null) &&
            DOM.attr(el, prop, undefined, 1) != null) {
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
    requires: ['dom']
});
/*
 TODO
 支持 transform ,ie 使用 matrix
 - http://shawphy.com/2011/01/transformation-matrix-in-front-end.html
 - http://www.cnblogs.com/winter-cn/archive/2010/12/29/1919266.html
 - 标准：http://www.zenelements.com/blog/css3-transform/
 - ie: http://www.useragentman.com/IETransformsTranslator/
 - wiki: http://en.wikipedia.org/wiki/Transformation_matrix
 - jq 插件: http://plugins.jquery.com/project/2d-transform
 *//**
 * @ignore
 * @fileOverview single timer for the whole anim module
 * @author yiminghe@gmail.com
 */
KISSY.add('anim/manager', function (S) {
    var stamp = S.stamp;

    return {
        // note in background tab, interval is set to 1s in chrome/firefox
        // no interval change in ie for 15, if interval is less than 15
        // then in background tab interval is changed to 15
        interval: 15,
        runnings: {},
        timer: null,
        start: function (anim) {
            var self = this,
                kv = stamp(anim);
            if (self.runnings[kv]) {
                return;
            }
            self.runnings[kv] = anim;
            self.startTimer();
        },
        stop: function (anim) {
            this.notRun(anim);
        },
        notRun: function (anim) {
            var self = this,
                kv = stamp(anim);
            delete self.runnings[kv];
            if (S.isEmptyObject(self.runnings)) {
                self.stopTimer();
            }
        },
        pause: function (anim) {
            this.notRun(anim);
        },
        resume: function (anim) {
            this.start(anim);
        },
        startTimer: function () {
            var self = this;
            if (!self.timer) {
                self.timer = setTimeout(function () {
                    if (!self.runFrames()) {
                        self.timer = 0;
                        self.startTimer();
                    } else {
                        self.stopTimer();
                    }
                }, self.interval);
            }
        },
        stopTimer: function () {
            var self = this,
                t = self.timer;
            if (t) {
                clearTimeout(t);
                self.timer = 0;
            }
        },
        runFrames: function () {
            var self = this,
                done = 1,
                r,
                runnings = self.runnings;
            for (r in runnings) {
                done = 0;
                runnings[r]._frame();
            }
            return done;
        }
    };
});
/**
 * @ignore
 *
 * !TODO: deal with https://developers.google.com/chrome/whitepapers/pagevisibility
 *//**
 * @ignore
 * @fileOverview queue of anim objects
 * @author yiminghe@gmail.com
 */
KISSY.add('anim/queue', function (S, DOM) {

    var // 队列集合容器
        queueCollectionKey = S.guid('ks-queue-' + S.now() + '-'),
    // 默认队列
        queueKey = S.guid('ks-queue-' + S.now() + '-'),
    // 当前队列是否有动画正在执行
        processing = '...';

    function getQueue(el, name, readOnly) {
        name = name || queueKey;

        var qu,
            quCollection = DOM.data(el, queueCollectionKey);

        if (!quCollection && !readOnly) {
            DOM.data(el, queueCollectionKey, quCollection = {});
        }

        if (quCollection) {
            qu = quCollection[name];
            if (!qu && !readOnly) {
                qu = quCollection[name] = [];
            }
        }

        return qu;
    }

    function removeQueue(el, name) {
        name = name || queueKey;
        var quCollection = DOM.data(el, queueCollectionKey);
        if (quCollection) {
            delete quCollection[name];
        }
        if (S.isEmptyObject(quCollection)) {
            DOM.removeData(el, queueCollectionKey);
        }
    }

    var q = {

        queueCollectionKey: queueCollectionKey,

        queue: function (anim) {
            var el = anim.config.el,
                name = anim.config.queue,
                qu = getQueue(el, name);
            qu.push(anim);
            if (qu[0] !== processing) {
                q.dequeue(anim);
            }
            return qu;
        },

        remove: function (anim) {
            var el = anim.config.el,
                name = anim.config.queue,
                qu = getQueue(el, name, 1), index;
            if (qu) {
                index = S.indexOf(anim, qu);
                if (index > -1) {
                    qu.splice(index, 1);
                }
            }
        },

        removeQueues: function (el) {
            DOM.removeData(el, queueCollectionKey);
        },

        removeQueue: removeQueue,

        dequeue: function (anim) {
            var el = anim.config.el,
                name = anim.config.queue,
                qu = getQueue(el, name, 1),
                nextAnim = qu && qu.shift();

            if (nextAnim == processing) {
                nextAnim = qu.shift();
            }

            if (nextAnim) {
                qu.unshift(processing);
                nextAnim._runInternal();
            } else {
                // remove queue data
                removeQueue(el, name);
            }
        }

    };
    return q;
}, {
    requires: ['dom']
});
/*
Copyright 2013, KISSY UI Library v1.30
MIT Licensed
build time: Jan 31 22:55
*/
/**
 * @ignore
 *  anim-node-plugin
 * @author yiminghe@gmail.com,
 *         lifesinger@gmail.com,
 *         qiaohua@taobao.com,
 *
 */
KISSY.add('node/anim', function (S, DOM, Anim, Node, undefined) {

    var FX = [
        // height animations
        [ 'height', 'marginTop', 'marginBottom', 'paddingTop', 'paddingBottom' ],
        // width animations
        [ 'width', 'marginLeft', 'marginRight', 'paddingLeft', 'paddingRight' ],
        // opacity animations
        [ 'opacity' ]
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

    S.augment(Node,{
            /**
             * animate for current node list.
             * @param var_args see {@link KISSY.Anim}
             * @chainable
             * @member KISSY.NodeList
             */
            animate: function (var_args) {
                var self = this,
                    originArgs = S.makeArray(arguments);
                S.each(self, function (elem) {
                    var args = S.clone(originArgs),
                        arg0 = args[0];
                    if (arg0.props) {
                        arg0.el = elem;
                        Anim(arg0).run();
                    } else {
                        Anim.apply(undefined, [elem].concat(args)).run();
                    }
                });
                return self;
            },
            /**
             * stop anim of current node list.
             * @param {Boolean} [end] see {@link KISSY.Anim#static-method-stop}
             * @param [clearQueue]
             * @param [queue]
             * @chainable
             * @member KISSY.NodeList
             */
            stop: function (end, clearQueue, queue) {
                var self = this;
                S.each(self, function (elem) {
                    Anim.stop(elem, end, clearQueue, queue);
                });
                return self;
            },
            /**
             * pause anim of current node list.
             * @param {Boolean} end see {@link KISSY.Anim#static-method-pause}
             * @param queue
             * @chainable
             * @member KISSY.NodeList
             */
            pause: function (end, queue) {
                var self = this;
                S.each(self, function (elem) {
                    Anim.pause(elem, queue);
                });
                return self;
            },
            /**
             * resume anim of current node list.
             * @param {Boolean} end see {@link KISSY.Anim#static-method-resume}
             * @param queue
             * @chainable
             * @member KISSY.NodeList
             */
            resume: function (end, queue) {
                var self = this;
                S.each(self, function (elem) {
                    Anim.resume(elem, queue);
                });
                return self;
            },
            /**
             * whether one of current node list is animating.
             * @return {Boolean}
             * @member KISSY.NodeList
             */
            isRunning: function () {
                var self = this;
                for (var i = 0; i < self.length; i++) {
                    if (Anim.isRunning(self[i])) {
                        return true;
                    }
                }
                return false;
            },
            /**
             * whether one of current node list 's animation is paused.
             * @return {Boolean}
             * @member KISSY.NodeList
             */
            isPaused: function () {
                var self = this;
                for (var i = 0; i < self.length; i++) {
                    if (Anim.isPaused(self[i])) {
                        return 1;
                    }
                }
                return 0;
            }
        });

    /**
     * animate show effect for current node list.
     * @param {Number} duration duration of effect
     * @param {Function} [complete] callback function on anim complete.
     * @param {String|Function} [easing] easing type or custom function.
     * @chainable
     * @member KISSY.NodeList
     * @method show
     */

    /**
     * animate hide effect for current node list.
     * @param {Number} duration duration of effect
     * @param {Function} [complete] callback function on anim complete.
     * @param {String|Function} [easing] easing type or custom function.
     * @chainable
     * @member KISSY.NodeList
     * @method hide
     */

    /**
     * toggle show and hide effect for current node list.
     * @param {Number} duration duration of effect
     * @param {Function} [complete] callback function on anim complete.
     * @param {String|Function} [easing] easing type or custom function.
     * @chainable
     * @member KISSY.NodeList
     * @method toggle
     */

    /**
     * animate fadeIn effect for current node list.
     * @param {Number} duration duration of effect
     * @param {Function} [complete] callback function on anim complete.
     * @param {String|Function} [easing] easing type or custom function.
     * @chainable
     * @member KISSY.NodeList
     * @method fadeIn
     */

    /**
     * animate fadeOut effect for current node list.
     * @param {Number} duration duration of effect
     * @param {Function} [complete] callback function on anim complete.
     * @param {String|Function} [easing] easing type or custom function.
     * @chainable
     * @member KISSY.NodeList
     * @method fadeOut
     */

    /**
     * toggle fadeIn and fadeOut effect for current node list.
     * @param {Number} duration duration of effect
     * @param {Function} [complete] callback function on anim complete.
     * @param {String|Function} [easing] easing type or custom function.
     * @chainable
     * @member KISSY.NodeList
     * @method fadeToggle
     */

    /**
     * animate slideUp effect for current node list.
     * @param {Number} duration duration of effect
     * @param {Function} [complete] callback function on anim complete.
     * @param {String|Function} [easing] easing type or custom function.
     * @chainable
     * @member KISSY.NodeList
     * @method slideUp
     */

    /**
     * animate slideDown effect for current node list.
     * @param {Number} duration duration of effect
     * @param {Function} [complete] callback function on anim complete.
     * @param {String|Function} [easing] easing type or custom function.
     * @chainable
     * @member KISSY.NodeList
     * @method slideDown
     */

    /**
     * toggle slideUp and slideDown effect for current node list.
     * @param {Number} duration duration of effect
     * @param {Function} [complete] callback function on anim complete.
     * @param {String|Function} [easing] easing type or custom function.
     * @chainable
     * @member KISSY.NodeList
     * @method slideToggle
     */

    S.each({
            show: getFxs('show', 3),
            hide: getFxs('hide', 3),
            toggle: getFxs('toggle', 3),
            fadeIn: getFxs('show', 3, 2),
            fadeOut: getFxs('hide', 3, 2),
            fadeToggle: getFxs('toggle', 3, 2),
            slideDown: getFxs('show', 1),
            slideUp: getFxs('hide', 1),
            slideToggle: getFxs('toggle', 1)
        },
        function (v, k) {
            Node.prototype[k] = function (duration, complete, easing) {
                var self = this;
                // 没有参数时，调用 DOM 中的对应方法
                if (DOM[k] && !duration) {
                    DOM[k](self);
                } else {
                    S.each(self, function (elem) {
                        Anim(elem, v, duration, easing || 'easeOut', complete).run();
                    });
                }
                return self;
            };
        });

}, {
    requires: ['dom', 'anim', './base']
});
/*
 2011-11-10
 - 重写，逻辑放到 Anim 模块，这边只进行转发

 2011-05-17
 - yiminghe@gmail.com：添加 stop ，随时停止动画

 TODO
 - anim needs queue mechanism ?
 */
/**
 * @ignore
 *  import methods from DOM to NodeList.prototype
 * @author yiminghe@gmail.com
 */
KISSY.add('node/attach', function (S, DOM, Event, NodeList, undefined) {

    var NLP = NodeList.prototype,
        makeArray = S.makeArray,
    // DOM 添加到 NP 上的方法
    // if DOM methods return undefined , Node methods need to transform result to itself
        DOM_INCLUDES_NORM = [
            'nodeName',
            'equals',
            'contains',
            'index',
            'scrollTop',
            'scrollLeft',
            'height',
            'width',
            'innerHeight',
            'innerWidth',
            'outerHeight',
            'outerWidth',
            'addStyleSheet',
            // 'append' will be overridden
            'appendTo',
            // 'prepend' will be overridden
            'prependTo',
            'insertBefore',
            'before',
            'after',
            'insertAfter',
            'test',
            'hasClass',
            'addClass',
            'removeClass',
            'replaceClass',
            'toggleClass',
            'removeAttr',
            'hasAttr',
            'hasProp',
            // anim override
//            'show',
//            'hide',
//            'toggle',
            'scrollIntoView',
            'remove',
            'empty',
            'removeData',
            'hasData',
            'unselectable',

            'wrap',
            'wrapAll',
            'replaceWith',
            'wrapInner',
            'unwrap'
        ],
    // if return array ,need transform to nodelist
        DOM_INCLUDES_NORM_NODE_LIST = [
            'filter',
            'first',
            'last',
            'parent',
            'closest',
            'next',
            'prev',
            'clone',
            'siblings',
            'contents',
            'children'
        ],
    // if set return this else if get return true value ,no nodelist transform
        DOM_INCLUDES_NORM_IF = {
            // dom method : set parameter index
            'attr': 1,
            'text': 0,
            'css': 1,
            'style': 1,
            'val': 0,
            'prop': 1,
            'offset': 0,
            'html': 0,
            'outerHTML': 0,
            'data': 1
        },
    // Event 添加到 NP 上的方法
        EVENT_INCLUDES = [
            'on',
            'detach',
            'fire',
            'fireHandler',
            'delegate',
            'undelegate'
        ];

    NodeList.KeyCodes = Event.KeyCodes;

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
    requires: ['dom', 'event/dom', './base']
});

/*
 2011-05-24
 - yiminghe@gmail.com：
 - 将 DOM 中的方法包装成 NodeList 方法
 - Node 方法调用参数中的 KISSY NodeList 要转换成第一个 HTML Node
 - 要注意链式调用，如果 DOM 方法返回 undefined （无返回值），则 NodeList 对应方法返回 this
 - 实际上可以完全使用 NodeList 来代替 DOM，不和节点关联的方法如：viewportHeight 等，在 window，document 上调用
 - 存在 window/document 虚节点，通过 S.one(window)/new Node(window) ,S.one(document)/new NodeList(document) 获得
 */
/**
 * @ignore
 *  definition for node and nodelist
 * @author yiminghe@gmail.com, lifesinger@gmail.com
 */
KISSY.add('node/base', function (S, DOM, undefined) {

    var AP = Array.prototype,
        slice = AP.slice,
        NodeType = DOM.NodeType,
        push = AP.push,
        makeArray = S.makeArray,
        isNodeList = DOM._isNodeList;

    /**
     * The NodeList class provides a {@link KISSY.DOM} wrapper for manipulating DOM Node.
     * use KISSY.all/one to retrieve NodeList instances.
     *
     *  for example:
     *      @example
     *      KISSY.all('a').attr('href','http://docs.kissyui.com');
     *
     * is equal to
     *      @example
     *      KISSY.DOM.attr('a','href','http://docs.kissyui.com');
     *
     * @class KISSY.NodeList
     */
    function NodeList(html, props, ownerDocument) {
        var self = this,
            domNode;

        if (!(self instanceof NodeList)) {
            return new NodeList(html, props, ownerDocument);
        }

        // handle NodeList(''), NodeList(null), or NodeList(undefined)
        if (!html) {
            return self;
        }

        else if (typeof html == 'string') {
            // create from html
            domNode = DOM.create(html, props, ownerDocument);
            // ('<p>1</p><p>2</p>') 转换为 NodeList
            if (domNode.nodeType === NodeType.DOCUMENT_FRAGMENT_NODE) { // fragment
                push.apply(this, makeArray(domNode.childNodes));
                return self;
            }
        }

        else if (S.isArray(html) || isNodeList(html)) {
            push.apply(self, makeArray(html));
            return self;
        }

        else {
            // node, document, window
            domNode = html;
        }

        self[0] = domNode;
        self.length = 1;
        return self;
    }

    NodeList.prototype = {

        constructor: NodeList,

        /**
         * length of nodelist
         * @type {Number}
         */
        length: 0,


        /**
         * Get one node at index
         * @param {Number} index Index position.
         * @return {KISSY.NodeList}
         */
        item: function (index) {
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

        /**
         * return a new NodeList object which consists of current node list and parameter node list.
         * @param {KISSY.NodeList} selector Selector string or html string or common dom node.
         * @param {KISSY.NodeList|Number} [context] Search context for selector
         * @param {Number} [index] Insert position.
         * @return {KISSY.NodeList} a new nodelist
         */
        add: function (selector, context, index) {
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

        /**
         * Get part of node list.
         * @param {Number} start Start position.
         * @param {number} end End position.
         * @return {KISSY.NodeList}
         */
        slice: function (start, end) {
            // ie<9 : [1,2].slice(-2,undefined) => []
            // ie<9 : [1,2].slice(-2) => []
            // fix #85
            return new NodeList(slice.apply(this, arguments));
        },

        /**
         * Retrieves the DOMNodes.
         */
        getDOMNodes: function () {
            return slice.call(this);
        },

        /**
         * Applies the given function to each Node in the NodeList.
         * @param {Function} fn The function to apply. It receives 3 arguments:
         * the current node instance, the node's index,
         * and the NodeList instance
         * @param [context] An optional context to
         * apply the function with Default context is the current NodeList instance
         * @return {KISSY.NodeList}
         */
        each: function (fn, context) {
            var self = this;

            S.each(self, function (n, i) {
                n = new NodeList(n);
                return fn.call(context || n, n, i, self);
            });

            return self;
        },
        /**
         * Retrieves the DOMNode.
         * @return {HTMLElement}
         */
        getDOMNode: function () {
            return this[0];
        },

        /**
         * return last stack node list.
         * @return {KISSY.NodeList}
         */
        end: function () {
            var self = this;
            return self.__parent || self;
        },

        /**
         * Get node list which are descendants of current node list.
         * @param {String} selector Selector string
         * @return {KISSY.NodeList}
         */
        all: function (selector) {
            var ret, self = this;
            if (self.length > 0) {
                ret = NodeList.all(selector, self);
            } else {
                ret = new NodeList();
            }
            ret.__parent = self;
            return ret;
        },

        /**
         * Get node list which match selector under current node list sub tree.
         * @param {String} selector
         * @return {KISSY.NodeList}
         */
        one: function (selector) {
            var self = this, all = self.all(selector),
                ret = all.length ? all.slice(0, 1) : null;
            if (ret) {
                ret.__parent = self;
            }
            return ret;
        }
    };

    S.mix(NodeList, {
        /**
         * Get node list from selector or construct new node list from html string.
         * Can also called from KISSY.all
         * @param {String|KISSY.NodeList} selector Selector string or html string or common dom node.
         * @param {String|KISSY.NodeList} [context] Search context for selector
         * @return {KISSY.NodeList}
         * @member KISSY.NodeList
         * @static
         */
        all: function (selector, context) {
            // are we dealing with html string ?
            // TextNode 仍需要自己 new Node

            if (typeof selector == 'string'
                && (selector = S.trim(selector))
                && selector.length >= 3
                && S.startsWith(selector, '<')
                && S.endsWith(selector, '>')
                ) {
                if (context) {
                    if (context['getDOMNode']) {
                        context = context[0];
                    }
                    context = context['ownerDocument'] || context;
                }
                return new NodeList(selector, undefined, context);
            }
            return new NodeList(DOM.query(selector, context));
        },

        /**
         * Get node list with length of one
         * from selector or construct new node list from html string.
         * @param {String|KISSY.NodeList} selector Selector string or html string or common dom node.
         * @param {String|KISSY.NodeList} [context] Search context for selector
         * @return {KISSY.NodeList}
         * @member KISSY.NodeList
         * @static
         */
        one: function (selector, context) {
            var all = NodeList.all(selector, context);
            return all.length ? all.slice(0, 1) : null;
        }
    });

    /**
     * Same with {@link KISSY.DOM.NodeType}
     * @member KISSY.NodeList
     * @property NodeType
     * @static
     */
    NodeList.NodeType = NodeType;

    return NodeList;
}, {
    requires: ['dom']
});


/*
 Notes:
 2011-05-25
 - yiminghe@gmail.com：参考 jquery，只有一个 NodeList 对象，Node 就是 NodeList 的别名

 2010.04
 - each 方法传给 fn 的 this, 在 jQuery 里指向原生对象，这样可以避免性能问题。
 但从用户角度讲，this 的第一直觉是 $(this), kissy 和 yui3 保持一致，牺牲
 性能，以易用为首。
 - 有了 each 方法，似乎不再需要 import 所有 dom 方法，意义不大。
 - dom 是低级 api, node 是中级 api, 这是分层的一个原因。还有一个原因是，如果
 直接在 node 里实现 dom 方法，则不大好将 dom 的方法耦合到 nodelist 里。可
 以说，技术成本会制约 api 设计。
 */
/**
 * @ignore
 *  node
 * @author yiminghe@gmail.com
 */
KISSY.add('node', function (S, Node) {
    S.mix(S, {
        Node: Node,
        NodeList: Node,
        one: Node.one,
        all: Node.all
    });
    return Node;
}, {
    requires: [
        'node/base',
        'node/attach',
        'node/override',
        'node/anim'
    ]
});/**
 * @ignore
 *  overrides methods in NodeList.prototype
 * @author yiminghe@gmail.com
 */
KISSY.add('node/override', function (S, DOM,NodeList) {

    var NLP = NodeList.prototype;

    /**
     * Insert every element in the set of newNodes to the end of every element in the set of current node list.
     * @param {KISSY.NodeList} newNodes Nodes to be inserted
     * @return {KISSY.NodeList} this
     * @method append
     * @member KISSY.NodeList
     */

    /**
     * Insert every element in the set of newNodes to the beginning of every element in the set of current node list.
     * @param {KISSY.NodeList} newNodes Nodes to be inserted
     * @return {KISSY.NodeList} this
     * @method prepend
     * @member KISSY.NodeList
     */


        // append(node ,parent) : 参数顺序反过来了
        // appendTo(parent,node) : 才是正常
    S.each(['append', 'prepend', 'before', 'after'], function (insertType) {
        NLP[insertType] = function (html) {
            var newNode = html, self = this;
            // 创建
            if (typeof newNode == 'string') {
                newNode = DOM.create(newNode);
            }
            if (newNode) {
                DOM[insertType](newNode, self);
            }
            return self;
        };
    });

    S.each(['wrap', 'wrapAll', 'replaceWith', 'wrapInner'], function (fixType) {
        var orig = NLP[fixType];
        NLP[fixType] = function (others) {
            var self = this;
            if (typeof others == 'string') {
                others = NodeList.all(others, self[0].ownerDocument);
            }
            return orig.call(self, others);
        };
    })

}, {
    requires: ['dom', './base']
});

/*
 2011-04-05 yiminghe@gmail.com
 - 增加 wrap/wrapAll/replaceWith/wrapInner/unwrap/contents

 2011-05-24
 - yiminghe@gmail.com：
 - 重写 NodeList 的某些方法
 - 添加 one ,all ，从当前 NodeList 往下开始选择节点
 - 处理 append ,prepend 和 DOM 的参数实际上是反过来的
 - append/prepend 参数是节点时，如果当前 NodeList 数量 > 1 需要经过 clone，因为同一节点不可能被添加到多个节点中去（NodeList）
 */

KISSY.use("ua,dom,event,node,json,ajax,anim,base,cookie",0,1);
