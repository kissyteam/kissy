/**
 * @module kissy
 * @creator lifesinger@gmail.com
 */

if (typeof KISSY === "undefined" || !KISSY) {
    /**
     * The KISSY global object.
     * @constructor
     * @global
     */
    function KISSY(config) {
        var o = this;
        // allow instantiation without the new operator
        if (!(o instanceof KISSY)) {
            return new KISSY(config);
        } else {
            // init the core environment
            o._init();
            return o;
        }
    }
}

(function(S) {

    var win = window,
        mix = function(r, s) {
            if (r && typeof s === "object") {
                for (var p in s) {
                    r[p] = s[p];
                }
            }
            return r;
        };

    mix(S.prototype, {

        _init: function() {

        },

        add: function() {

        },

        use: function() {

        },

        /**
         * Copies all the properties of s to r. overwrite mode.
         * @return {object} the augmented object
         */
        mix: mix,

        /**
         * Returns a new object containing all of the properties of
         * all the supplied objects.  The properties from later objects
         * will overwrite those in earlier objects.  Passing in a
         * single object will create a shallow copy of it.
         * @return {object} the new merged object
         */
        merge: function() {
            var a = arguments, o = {}, i, l = a.length;
            for (i = 0; i < l; ++i) {
                this.mix(o, a[i], true);
            }
            return o;
        },

        /**
         * Adds aliases to KISSY
         * <pre>
         * S.alias("TaoBao", "KouBei");
         * </pre>
         * @return {object}  A reference to the last object
         */
        alias: function() {
            var a = arguments, l = a.length, i, o = this;
            for (i = 0; i < l; i++) {
                win[a[i]] = o;
            }
            return o;
        },

        /**
         * Returns the namespace specified and creates it if it doesn't exist
         * Be careful when naming packages. Reserved words may work in some browsers
         * and not others.
         * <pre>
         * S.alias("TB");
         * TB.namespace("app.Shop"); // returns TB.app.Shop
         * </pre>
         * @return {object}  A reference to the last namespace object created
         */
        namespace: function() {
            var a = arguments, l = a.length, o = this, i, j, p;
            for (i = 0; i < l; i++) {
                p = ("" + a[i]).split(".");
                for (j = win[p[0]] ? 1 : 0; j < p.length; j++) {
                    o[p[j]] = o[p[j]] || {};
                    o = o[p[j]];
                }
            }
            return o;
        }
    });

    
})(KISSY);