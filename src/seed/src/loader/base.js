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
})(KISSY);