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
        /** init */
        'INIT': 0,
        /** loading */
        'LOADING': 1,
        /** loaded */
        'LOADED': 2,
        /**dependencies are loaded or attached*/
        'READY_TO_ATTACH': 3,
        /** attached */
        'ATTACHED': 4,
        /** error */
        'ERROR': 1000
    };
})(KISSY);