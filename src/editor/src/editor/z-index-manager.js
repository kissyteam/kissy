/**
 * @ignore
 * z-index management
 * @author yiminghe@gmail.com
 */
KISSY.add(function (S,require) {
    var Editor=require('./base');
    /**
     * z-index manager
     * @enum {number} KISSY.Editor.ZIndexManager
     */
    var ZIndexManager = Editor.ZIndexManager = {
        /**
         * bubble view
         */
        BUBBLE_VIEW: (1100),
        /**
         * bubble view
         */
        POPUP_MENU: (1200),
        /**
         * bubble view
         */
        STORE_FLASH_SHOW: (99999),
        /**
         * bubble view
         */
        MAXIMIZE: (900),
        /**
         * bubble view
         */
        OVERLAY: (9999),
        /**
         * bubble view
         */
        LOADING: (11000),
        /**
         * bubble view
         */
        LOADING_CANCEL: 12000,
        /**
         * bubble view
         */
        SELECT: (1200)
    };

    Editor.baseZIndex = function (z) {
        return (Editor.Config.baseZIndex || 10000) + z;
    };

    return ZIndexManager;
});