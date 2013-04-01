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
            '',
            'Webkit',
            'Moz',
            'O',
            'Ms'
        ],
    // nodejs
        doc = win.document || {},
        documentMode = doc.documentMode,
        isTransitionSupportedState = false,
        transitionPrefix = '',
        isTransformSupportedState = false,
        transformPrefix = '',
        documentElement = doc.documentElement,
        documentElementStyle,
        isClassListSupportedState = true,
        isQuerySelectorSupportedState = false,
    // phantomjs issue: http://code.google.com/p/phantomjs/issues/detail?id=375
        isTouchSupportedState = ('ontouchstart' in doc) && !(UA.phantomjs),
        ie = documentMode || UA.ie;

    if (documentElement) {
        if (documentElement.querySelector &&
            // broken ie8
            ie != 8) {
            isQuerySelectorSupportedState = true;
        }
        documentElementStyle = documentElement.style;

        S.each(VENDORS, function (val) {
            var transition = val ? val + 'Transition' : 'transition',
                transform = val ? val + 'Transform' : 'transform';
            if (transition in documentElementStyle) {
                transitionPrefix = val;
                isTransitionSupportedState = true;
            }
            if (transform in documentElementStyle) {
                transformPrefix = val;
                isTransformSupportedState = true;
            }
        });

        isClassListSupportedState = 'classList' in documentElement;
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
            return isTouchSupportedState;
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
            return isTransitionSupportedState;
        },

        'isTransformSupported': function () {
            return isTransformSupportedState;
        },

        'isClassListSupported': function () {
            return isClassListSupportedState
        },

        'isQuerySelectorSupported': function () {
            return isQuerySelectorSupportedState;
        },

        'isIELessThan': function (v) {
            return ie && ie < v;
        },

        'getTransitionPrefix': function () {
            return transitionPrefix;
        },
        'getTransformPrefix': function () {
            return transformPrefix;
        }
    };
})(KISSY);