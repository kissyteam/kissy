/**
 * @ignore
 * setup data structure for kissy loader
 * @author yiminghe@gmail.com
 */
(function (S) {
    var Loader = S.Loader = {};

    /**
     * Loader Status Enum
     * @enum {Number} KISSY.Loader.Status
     */
    Loader.Status = {
        /** error */
        'ERROR': -1,
        /** init */
        'INIT': 0,
        /** loading */
        'LOADING': 1,
        /** loaded */
        'LOADED': 2,
        /**dependencies are loaded or attached*/
        'READY_TO_ATTACH': 3,
        /** attaching */
        'ATTACHING': 4,
        /** attached */
        'ATTACHED': 5
    };
})(KISSY);