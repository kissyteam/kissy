/**
 * @ignore
 * detect if current browser supports various features.
 * @author yiminghe@gmail.com
 */
(function (S) {

    var Env = S.Env,
        win = Env.host,
        UA = S.UA,
        VENDORS = [
            'Webkit',
            'Moz',
            'O',
            'Ms'
        ],
    // nodejs
        doc = win.document || {},
        documentMode = doc.documentMode,
        isTransitionSupported = false,
        transitionPrefix = '',
        documentElement = doc.documentElement,
        documentElementStyle,
    // phantomjs issue: http://code.google.com/p/phantomjs/issues/detail?id=375
        isTouchSupported = ('ontouchstart' in doc) && !(UA.phantomjs),
        ie = documentMode || UA.ie;

    if (documentElement) {
        documentElementStyle = documentElement.style;
        if ('transition' in documentElementStyle) {
            isTransitionSupported = true;
        } else {
            S.each(VENDORS, function (val) {
                if ((val + 'Transition') in documentElementStyle) {
                    transitionPrefix = val;
                    isTransitionSupported = true;
                }
            });
        }
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

        isDeviceMotionSupported: function () {
            return !!win['DeviceMotionEvent'];
        },

        'isHashChangeSupported': function () {
            // ie8 支持 hashchange
            // 但 ie8 以上切换浏览器模式到 ie7（兼容模式），
            // 会导致 'onhashchange' in window === true，但是不触发事件
            return ( 'onhashchange' in win) && (!ie || ie > 7);
        },

        'isTransitionSupported': function () {
            return isTransitionSupported;
        },

        'getCss3Prefix': function () {
            return transitionPrefix;
        }
    };
})(KISSY);