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
            version:'@VERSION@',

            /**
             * The build time of the library
             * @type {String}
             */
            __BUILD_TIME:'@TIMESTAMP@',

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
