/**
 * @module kissy
 * @author lifesinger@gmail.com
 */

(function(win, S, undefined) {

    // If KISSY is already defined, the existing KISSY object will not
    // be overwritten so that defined namespaces are preserved.
    if (win[S] === undefined) win[S] = {};

    // shortcut
    S = win[S];

    function mix(r, s, ov, wl) {
        if (!s || !r) return r;
        if (ov === undefined) ov = true;
        var i, p, l;

        if (wl && (l = wl.length)) {
            for (i = 0; i < l; i++) {
                p = wl[i];
                if (p in s) {
                    if (ov || !(p in r)) {
                        r[p] = s[p];
                    }
                }
            }
        } else {
            for (p in s) {
                if (ov || !(p in r)) {
                    r[p] = s[p];
                }
            }
        }
        return r;
    }

    mix(S, {

        /**
         * The version of the library.
         * @type {string}
         */
        version: "@VERSION@",

        /**
         * Initializes KISSY object.
         * @private
         */
        _init: function() {
            this.Env = {
                mods: {}
            };

            this.Config = {
                debug: true
            };
        },

        /**
         * Registers a module.
         * @param name {string} module name
         * @param fn {function} entry point into the module that is used to bind module to KISSY
         * <pre>
         * KISSY.add("module-name", function(S){ });
         * </pre>
         * @return {KISSY}
         */
        add: function(name, fn) {
            var self = this;

            // override mode
            self.Env.mods[name] = {
                name: name,
                fn: fn
            };

            // call entry point immediately
            fn(self);

            // chain support
            return self;
        },

        /**
         * Specify a function to execute when the DOM is fully loaded.
         * @type {function} fn A function to execute after the DOM is ready
         * <pre>
         * KISSY.ready(function(S){ });
         * </pre>
         * @return {KISSY}
         */
        ready: function(/*fn*/) {
            // TODO

            return this;
        },

        /**
         * Copies all the properties of s to r.
         * @return {object} the augmented object
         */
        mix: mix,

        /**
         * Returns a new object containing all of the properties of
         * all the supplied objects. The properties from later objects
         * will overwrite those in earlier objects. Passing in a
         * single object will create a shallow copy of it.
         * @return {object} the new merged object
         */
        merge: function() {
            var a = arguments, o = {}, i, l = a.length;
            for (i = 0; i < l; i++) {
                mix(o, a[i]);
            }
            return o;
        },

        /**
         * Utility to set up the prototype, constructor and superclass properties to
         * support an inheritance strategy that can chain constructors and methods.
         * Static members will not be inherited.
         * @param {function} r the object to modify
         * @param {function} s the object to inherit
         * @param {object} px prototype properties to add/override
         * @param {object} sx static properties to add/override
         * @return {object} r
         */
        extend: function(r, s, px, sx) {
            if (!s || !r) return r;

            var OP = Object.prototype,
                O = function (o) {
                        function F() { }
                        F.prototype = o;
                        return new F();
                    },
                sp = s.prototype,
                rp = O(sp);

            r.prototype = rp;
            rp.constructor = r;
            r.superclass = sp;

            // assign constructor property
            if (s !== Object && sp.constructor === OP.constructor) {
                sp.constructor = s;
            }

            // add prototype overrides
            if (px) {
                mix(rp, px);
            }

            // add object overrides
            if (sx) {
                mix(r, sx);
            }

            return r;
        },

        /**
         * Applies prototype properties from the supplier to the receiver.
         * The receiver must be a Function.
         * @param {Function} r  the object to receive the augmentation
         * @param {Function} s  the object that supplies the properties to augment
         * @param wl {string[]} a whitelist.  If supplied, only properties in this list will be applied to the receiver.
         * @return {object} the augmented object
         */
        augment: function(r, s, ov, wl) {
            return mix(r.prototype, s.prototype, ov, wl);
        },

        /**
         * Executes the supplied function on each item in the array.
         * @method each
         * @param arr {Array} the array to iterate
         * @param fn {Function} the function to execute on each item.  The
         * function receives three arguments: the value, the index, the full array.
         * @param obj Optional context object
         */
        each: function (arr, fn, obj) {
            var l = (arr && arr.length) || 0, i;
            for (i = 0; i < l; i++) {
                fn.call(obj || this, arr[i], i, arr);
            }
            return this;
        },

        /**
         * Execute the supplied method after the specified function
         * @param fn {Function} the function to execute
         * @param when {string} before or after
         * @param obj the object hosting the method to displace
         * @param sFn {string} the name of the method to displace
         */
        weave: function(fn, when, obj, sFn) {
            var arr = [obj[sFn], fn];

            if (when === "before") arr.reverse();
            obj[sFn] = function() {
                for (var i = 0; i < 2; i++) {
                    arr[i].apply(this, arguments);
                }
            };

            return this;
        },

        /**
         * Clones KISSY to another global object.
         * <pre>
         * S.cloneTo("TaoBao");
         * </pre>
         * @return {object}  A reference to the last object
         */
        cloneTo: function(name) {
            function O(c) {
                // allow instantiation without the new operator
                if (!(this instanceof O)) {
                    return new O(c);
                }
                O.superclass.constructor.call(this, c);
            }

            S.extend(O, S, null, S);
            return (win[name] = O);
        },

        /**
         * Returns the namespace specified and creates it if it doesn't exist
         * Be careful when naming packages. Reserved words may work in some browsers
         * and not others.
         * <pre>
         * S.cloneTo("TB");
         * TB.namespace("TB.app"); // returns TB.app
         * TB.namespace("app.Shop"); // returns TB.app.Shop
         * </pre>
         * @return {object}  A reference to the last namespace object created
         */
        namespace: function() {
            var a = arguments, l = a.length, o = this, i, j, p;

            for (i = 0; i < l; i++) {
                p = ("" + a[i]).split(".");
                for (j = (win[p[0]] === o) ? 1 : 0; j < p.length; j++) {
                    o[p[j]] = o[p[j]] || {};
                    o = o[p[j]];
                }
            }
            return o;
        },

        /**
         * print debug info
         * @param {String} msg The message to log.
         * @param {String} cat The log category for the message. Default
         * categories are "info", "warn", "error", time".
         * Custom categories can be used as well. (opt)
         * @param {String} src The source of the the message (opt)
         * @return {KISSY} KISSY instance
         */
        log: function(msg, cat, src) {
            var c = this.Config;

            if (c.debug) {
                src && (msg = src + ": " + msg);
                if (win.console !== undefined && console.log) {
                    console[cat && console[cat] ? cat : "log"](msg);
                }
            }

            return this;
        }
    });

    S._init();

})(window, "KISSY");
