/**
 * @ignore
 * detect if current browser supports various features.
 * @author yiminghe@gmail.com
 */
(function (S, undefined) {
    var Env = S.Env,
        win = Env.host,
        UA = S.UA,
        VENDORS = [
            '',
            'Webkit',
            'Moz',
            'O',
            // ms is special .... !
            'ms'
        ],
    // nodejs
        doc = win.document || {},
        isMsPointerSupported,
    // ie11
        isPointerSupported,
        transitionProperty,
        transformProperty,
        transitionPrefix,
        transformPrefix,
        isTransform3dSupported,
        documentElement = doc.documentElement,
        documentElementStyle,
        isClassListSupportedState = true,
        isQuerySelectorSupportedState = false,
    // phantomjs issue: http://code.google.com/p/phantomjs/issues/detail?id=375
        isTouchEventSupportedState = ('ontouchstart' in doc) && !(UA.phantomjs),
        ie = UA.ieMode;

    if (documentElement) {
        if (documentElement.querySelector &&
            // broken ie8
            ie !== 8) {
            isQuerySelectorSupportedState = true;
        }
        documentElementStyle = documentElement.style;

        S.each(VENDORS, function (val) {
            var transition = val ? val + 'Transition' : 'transition',
                transform = val ? val + 'Transform' : 'transform';
            if (transitionPrefix === undefined &&
                transition in documentElementStyle) {
                transitionPrefix = val;
                transitionProperty = transition;
            }
            if (transformPrefix === undefined &&
                transform in documentElementStyle) {
                transformPrefix = val;
                transformProperty = transform;
            }
        });

        isClassListSupportedState = 'classList' in documentElement;
        var navigator = (win.navigator || {});
        isMsPointerSupported = 'msPointerEnabled' in navigator;
        isPointerSupported = 'pointerEnabled' in navigator;

        if (transformProperty) {
            // https://gist.github.com/lorenzopolidori/3794226
            // ie9 does not support 3d transform
            // http://msdn.microsoft.com/en-us/ie/ff468705
            try {
                var el = doc.createElement('p');
                documentElement.insertBefore(el, documentElement.firstChild);
                el.style[transformProperty] = 'translate3d(1px,1px,1px)';
                var computedStyle = win.getComputedStyle(el);
                var has3d = computedStyle.getPropertyValue(transformProperty) || computedStyle[transformProperty];
                documentElement.removeChild(el);
                isTransform3dSupported = (has3d !== undefined && has3d.length > 0 && has3d !== 'none');
            }catch (e){
                // https://github.com/kissyteam/kissy/issues/563
                isTransform3dSupported = true;
            }
        }
    }

    var vendorInfos = {};
    // return prefixed css prefix name
    function getVendorInfo(name) {
        if (vendorInfos[name]) {
            return vendorInfos[name];
        }
        // if already prefixed or need not to prefix
        if (!documentElementStyle || name in documentElementStyle) {
            vendorInfos[name] = {
                name: name,
                prefix: ''
            };
        } else {
            var upperFirstName = name.charAt(0).toUpperCase() + name.slice(1),
                vendorName,
                i = VENDORS.length;

            while (i--) {
                vendorName = VENDORS[i] + upperFirstName;
                if (vendorName in documentElementStyle) {
                    vendorInfos[name] = {
                        name: vendorName,
                        prefix: VENDORS[i]
                    };
                }
            }

            vendorInfos[name] = vendorInfos[name] || {
                name: name,
                prefix: false
            };
        }
        return  vendorInfos[name];
    }

    /**
     * browser features detection
     * @class KISSY.Features
     * @private
     * @singleton
     */
    S.Features = {
        // http://blogs.msdn.com/b/ie/archive/2011/09/20/touch-input-for-ie10-and-metro-style-apps.aspx
        /**
         * whether support microsoft pointer event.
         * @type {Boolean}
         */
        isMsPointerSupported: function () {
            // ie11 onMSPointerDown but e.type==pointerdown
            return isMsPointerSupported;
        },

        /**
         * whether support microsoft pointer event (ie11).
         * @type {Boolean}
         */
        isPointerSupported: function () {
            // ie11
            return isPointerSupported;
        },

        /**
         * whether support touch event.
         * @return {Boolean}
         */
        isTouchEventSupported: function () {
            return isTouchEventSupportedState;
        },

        isTouchGestureSupported: function () {
            return isTouchEventSupportedState || isPointerSupported || isMsPointerSupported;
        },

        /**
         * whether support device motion event
         * @returns {boolean}
         */
        isDeviceMotionSupported: function () {
            return !!win.DeviceMotionEvent;
        },

        /**
         * whether support hashchange event
         * @returns {boolean}
         */
        'isHashChangeSupported': function () {
            // ie8 支持 hashchange
            // 但 ie8 以上切换浏览器模式到 ie7（兼容模式），
            // 会导致 'onhashchange' in window === true，但是不触发事件
            return ( 'onhashchange' in win) && (!ie || ie > 7);
        },

        /**
         * whether support css transition
         * @returns {boolean}
         */
        'isTransitionSupported': function () {
            return transitionPrefix !== undefined;
        },

        /**
         * whether support css transform
         * @returns {boolean}
         */
        'isTransformSupported': function () {
            return transformPrefix !== undefined;
        },

        /**
         * whether support css transform 3d
         * @returns {boolean}
         */
        'isTransform3dSupported': function () {
            return isTransform3dSupported;
        },

        /**
         * whether support class list api
         * @returns {boolean}
         */
        'isClassListSupported': function () {
            return isClassListSupportedState;
        },

        /**
         * whether support querySelectorAll
         * @returns {boolean}
         */
        'isQuerySelectorSupported': function () {
            // force to use js selector engine
            return !S.config('dom/selector') &&
                isQuerySelectorSupportedState;
        },

        /**
         * whether is ie and ie version is less than specified version
         * @param {Number} v specified ie version to be compared
         * @returns {boolean}
         */
        'isIELessThan': function (v) {
            return !!(ie && ie < v);
        },

        /**
         * get css transition browser prefix if support css transition
         * @returns {String}
         */
        'getTransitionPrefix': function () {
            return transitionPrefix;
        },

        /**
         * get css transform browser prefix if support css transform
         * @returns {String}
         */
        'getTransformPrefix': function () {
            return transformPrefix;
        },

        /**
         * get css transition property if support css transition
         * @returns {String}
         */
        'getTransitionProperty': function () {
            return transitionProperty;
        },

        /**
         * get css transform property if support css transform
         * @returns {String}
         */
        'getTransformProperty': function () {
            return transformProperty;
        },

        getVendorCssPropPrefix: function (name) {
            return getVendorInfo(name).prefix;
        },

        getVendorCssPropName: function (name) {
            return getVendorInfo(name).name;
        }
    };
})(KISSY);