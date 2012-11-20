/**
 * @ignore
 * detect if current browser supports various features.
 * @author yiminghe@gmail.com
 */
(function (S) {

    var Env = S.Env,
        win = Env.host,
    // nodejs
        doc = win.document || {},
        ua = ((win.navigator || {}).userAgent) || "",
    // phantomjs issue: http://code.google.com/p/phantomjs/issues/detail?id=375
        isTouchSupported = ('ontouchstart' in doc) && !(/PhantomJS/.test(ua)),
        documentMode = doc.documentMode,
        isNativeJSONSupported = ((Env.nodejs && typeof global === 'object') ? global : win).JSON;

    // ie 8.0.7600.16315@win7 json bug!
    if (documentMode && documentMode < 9) {
        isNativeJSONSupported = 0;
    }

    /**
     * test browser features
     * @class KISSY.Features
     * @private
     * @singleton
     */
    S.Features = {
        // http://blogs.msdn.com/b/ie/archive/2011/09/20/touch-input-for-ie10-and-metro-style-apps.aspx
        /**
         * @ignore
         * whether support win8 pointer event.
         * @type {Boolean}
         */
        // isMsPointerEnabled: "msPointerEnabled" in (win.navigator || {}),
        /**
         * whether support touch event.
         * @method
         * @return {Boolean}
         */
        isTouchSupported: function () {
            return isTouchSupported;
        },

        /**
         * whether support native json
         * @method
         * @return {Boolean}
         */
        isNativeJSONSupported: function () {
            return isNativeJSONSupported;
        }
    };

})(KISSY);