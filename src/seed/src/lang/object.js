/**
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
        hasEnumBug = !({toString: 1}['propertyIsEnumerable']('toString')),
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
                 */ov['whitelist'];
                deep = ov['deep'];
                ov = ov['overwrite'];
            }

            if (wl && !S.isFunction(wl)) {
                var originalWl = wl;
                wl = function (name, val) {
                    return S.inArray(name, originalWl) ? val : undefined;
                };
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
            if (p != MIX_CIRCULAR_DETECTION) {
                // no hasOwnProperty judge!
                _mix(p, r, s, ov, wl, deep, cache);
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
            } else if (src !== undefined && (ov || !(p in r))) {
                r[p] = src;
            }
        }
    }
})(KISSY);