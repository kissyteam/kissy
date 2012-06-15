/**
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
     * @name Package
     * @class KISSY Package constructor
     * This class should not be instantiated manually.
     * @memberOf KISSY.Loader
     */
    function Package(cfg) {
        S.mix(this, cfg);
    }

    S.augment(Package,
        /**
         * @lends KISSY.Loader.Package#
         */
        {
            /**
             * Tag for package.
             * @return {String}
             */
            getTag:function () {
                return this.tag || this.SS.Config.tag;
            },

            /**
             * Get package name.
             * @return {String}
             */
            getName:function () {
                return this.name;
            },

            /**
             * Get package base.
             * @return {String}
             */
            getBase:function () {
                return this.base || this.SS.Config.base;
            },

            /**
             * Whether is debug for this package.
             * @return {Boolean}
             */
            isDebug:function () {
                var debug = this.debug;
                return debug === undefined ? this.SS.Config.debug : debug;
            },

            /**
             * Get charset for package.
             * @return {String}
             */
            getCharset:function () {
                return this.charset || this.SS.Config.charset;
            },

            /**
             * Whether modules are combined for this package.
             * @return {Boolean}
             */
            isCombine:function () {
                var combine = this.combine;
                return combine === undefined ? this.SS.Config.combine : combine;
            }
        });

    Loader.Package = Package;


    /**
     * @class KISSY Module constructor
     * This class should not be instantiated manually.
     * @memberOf KISSY.Loader
     */
    function Module(cfg) {
        S.mix(this, cfg);
    }

    S.augment(Module,
        /**
         * @lends KISSY.Loader.Module#
         */
        {
            /**
             * Set the value of current module
             * @param v value to be set
             */
            setValue:function (v) {
                this.value = v;
            },

            /**
             * Get the fullpath of current module if load dynamically
             */
            getFullPath:function () {
                var self = this, t;
                return self.fullpath || (self.fullpath =
                    Loader.Utils.getMappedPath(self.SS,
                        self.packageInfo.getBase() +
                            self.path +
                            ((t = self.getTag()) ? ("?t=" + encodeURIComponent(t)) : "")));
            },

            /**
             * Get the value of current module
             */
            getValue:function () {
                return this.value;
            },

            /**
             * Get the name of current module
             * @returns {String}
             */
            getName:function () {
                return this.name;
            },

            /**
             * Get the packageInfo of current module
             * @return {Object}
             */
            getPackageInfo:function () {
                return this.packageInfo;
            },

            /**
             * Get the tag of current module
             * @return {String}
             */
            getTag:function () {
                return (this.tag || this.packageInfo.getTag());
            },

            /**
             * Get the charset of current module
             * @return {String}
             */
            getCharset:function () {
                return this.charset || this.packageInfo.getCharset();
            }
        });

    Loader.Module = Module;

    // 模块(mod)状态
    Loader.STATUS = {
        "INIT":0,
        "LOADING":1,
        "LOADED":2,
        "ERROR":3,
        "ATTACHED":4
    };
})(KISSY);