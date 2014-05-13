/**
 * @ignore
 * object utilities of lang
 * @author yiminghe@gmail.com
 */
KISSY.add(function (S, require) {
    var util = require('./base');
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

    mix(util, {
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
                var key,
                    val,
                    keys,
                    i = 0,
                    length = object && object.length,
                // do not use typeof obj == 'function': bug in phantomjs
                    isObj = length === undef || toString.call(object) === '[object Function]';

                context = context || null;

                if (isObj) {
                    keys = util.keys(object);
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
                    guid = o[marker] = util.guid(marker);
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
         *     util.mix({x: {y: 2, z: 4}}, {x: {y: 3, a: t}}, {deep: TRUE}) => {x: {y: 3, z: 4, a: {}}}, a !== t
         *     util.mix({x: {y: 2, z: 4}}, {x: {y: 3, a: t}}, {deep: TRUE, overwrite: false}) => {x: {y: 2, z: 4, a: {}}}, a !== t
         *     util.mix({x: {y: 2, z: 4}}, {x: {y: 3, a: t}}, 1) => {x: {y: 3, a: t}}
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
                    return util.inArray(name, originalWl) ? val : undef;
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
            varArgs = util.makeArray(arguments);
            var o = {},
                i,
                l = varArgs.length;
            for (i = 0; i < l; i++) {
                util.mix(o, varArgs[i]);
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
            var args = util.makeArray(arguments),
                len = args.length - 2,
                i = 1,
                proto,
                arg,
                ov = args[len],
                wl = args[len + 1];

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
                if ((proto = arg.prototype)) {
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

            var sp = s.prototype,
                rp;

            // in case parent does not set constructor
            // eg: parent.prototype={};
            sp.constructor = s;

            // add prototype chain
            rp = createObject(sp, r);
            r.prototype = util.mix(rp, r.prototype);
            r.superclass = sp;

            // add prototype overrides
            if (px) {
                util.mix(rp, px);
            }

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
         * for example:
         *      @example
         *      util.namespace('KISSY.app'); // returns KISSY.app
         *      util.namespace('app.Shop'); // returns KISSY.app.Shop
         *      util.namespace('TB.app.Shop', TRUE); // returns TB.app.Shop
         *
         * @return {Object}  A reference to the last namespace object created
         * @member KISSY
         */
        namespace: function () {
            var args = util.makeArray(arguments),
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
        keys = util.keys(s);
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
                // util.mix({},{x:undef})
                if (target === undef) {
                    r[p] = target;
                }
                return;
            }
            if (wl) {
                src = wl.call(s, p, src);
            }
            // 来源是数组和对象，并且要求深度 mix
            if (deep && src && (util.isArray(src) || util.isPlainObject(src))) {
                if (src[MIX_CIRCULAR_DETECTION]) {
                    r[p] = src[MIX_CIRCULAR_DETECTION];
                } else {
                    // 目标值为对象或数组，直接 mix
                    // 否则 新建一个和源值类型一样的空数组/对象，递归 mix
                    var clone = target && (util.isArray(target) || util.isPlainObject(target)) ?
                        target :
                        (util.isArray(src) ? [] : {});
                    r[p] = clone;
                    mixInternal(clone, src, ov, wl, TRUE, cache);
                }
            } else if (src !== undef && (ov || !(p in r))) {
                r[p] = src;
            }
        }
    }
});