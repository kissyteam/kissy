/**
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
 */