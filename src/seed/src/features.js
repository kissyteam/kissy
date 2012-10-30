/**
 * detect if current browser supports various features.
 * @author yiminghe@gmail.com
 */
(function (S) {

    var win = S.Env.host,
        doc = win.document;

    /**
     * @class KISSY.Features
     * @singleton
     */
    S.Features = {
        // http://blogs.msdn.com/b/ie/archive/2011/09/20/touch-input-for-ie10-and-metro-style-apps.aspx
        /**
         * whether support win8 pointer event.
         * @type {Boolean}
         */
        isMsPointerEnabled: "msPointerEnabled" in win.navigator,
        /**
         * whether support touch event.
         * @type {Boolean}
         */
        isTouchSupported: 'ontouchstart' in doc
    };

})(KISSY);