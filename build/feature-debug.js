/*
Copyright 2014, KISSY v5.0.0
MIT Licensed
build time: Jul 18 14:03
*/
/*
combined modules:
feature
*/
KISSY.add('feature', ['ua'], function (S, require, exports, module) {
    /**
 * @ignore
 * detect if current browser supports various features.
 * @author yiminghe@gmail.com
 */
    var win = window, UA = require('ua'), propertyPrefixes = [
            'Webkit',
            'Moz',
            'O',
            // ms is special .... !
            'ms'
        ], propertyPrefixesLength = propertyPrefixes.length,
        // for nodejs
        doc = win.document || {}, isMsPointerSupported,
        // ie11
        isPointerSupported, isTransform3dSupported,
        // nodejs
        documentElement = doc && doc.documentElement, documentElementStyle, isClassListSupportedState = true, isQuerySelectorSupportedState = false,
        // phantomjs issue: http://code.google.com/p/phantomjs/issues/detail?id=375
        isTouchEventSupportedState = 'ontouchstart' in doc && !UA.phantomjs, vendorInfos = {}, ie = UA.ieMode;
    if (documentElement) {
        // broken ie8
        if (documentElement.querySelector && ie !== 8) {
            isQuerySelectorSupportedState = true;
        }
        documentElementStyle = documentElement.style;
        isClassListSupportedState = 'classList' in documentElement;
        isMsPointerSupported = 'msPointerEnabled' in navigator;
        isPointerSupported = 'pointerEnabled' in navigator;
    }
    var RE_DASH = /-([a-z])/gi;
    function upperCase() {
        return arguments[1].toUpperCase();
    }    // return prefixed css prefix name
    // return prefixed css prefix name
    function getVendorInfo(name) {
        if (name.indexOf('-') !== -1) {
            name = name.replace(RE_DASH, upperCase);
        }
        if (name in vendorInfos) {
            return vendorInfos[name];
        }    // if already prefixed or need not to prefix
        // if already prefixed or need not to prefix
        if (!documentElementStyle || name in documentElementStyle) {
            vendorInfos[name] = {
                propertyName: name,
                propertyNamePrefix: ''
            };
        } else {
            var upperFirstName = name.charAt(0).toUpperCase() + name.slice(1), vendorName;
            for (var i = 0; i < propertyPrefixesLength; i++) {
                var propertyNamePrefix = propertyPrefixes[i];
                vendorName = propertyNamePrefix + upperFirstName;
                if (vendorName in documentElementStyle) {
                    vendorInfos[name] = {
                        propertyName: vendorName,
                        propertyNamePrefix: propertyNamePrefix
                    };
                }
            }
            vendorInfos[name] = vendorInfos[name] || null;
        }
        return vendorInfos[name];
    }    /**
 * browser features detection
 * @class KISSY.Feature
 * @private
 * @singleton
 */
    /**
 * browser features detection
 * @class KISSY.Feature
 * @private
 * @singleton
 */
    module.exports = {
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
        isHashChangeSupported: function () {
            // ie8 支持 hashchange
            // 但 ie8 以上切换浏览器模式到 ie7（兼容模式），
            // 会导致 'onhashchange' in window === true，但是不触发事件
            return 'onhashchange' in win && (!ie || ie > 7);
        },
        isInputEventSupported: function () {
            return 'oninput' in win && (!ie || ie > 9);
        },
        /**
     * whether support css transform 3d
     * @returns {boolean}
     */
        isTransform3dSupported: function () {
            if (isTransform3dSupported !== undefined) {
                return isTransform3dSupported;
            }
            if (!documentElement || !getVendorInfo('transform')) {
                isTransform3dSupported = false;
            } else {
                // https://gist.github.com/lorenzopolidori/3794226
                // ie9 does not support 3d transform
                // http://msdn.microsoft.com/en-us/ie/ff468705
                try {
                    var el = doc.createElement('p');
                    var transformProperty = getVendorInfo('transform').propertyName;
                    documentElement.insertBefore(el, documentElement.firstChild);
                    el.style[transformProperty] = 'translate3d(1px,1px,1px)';
                    var computedStyle = win.getComputedStyle(el);
                    var has3d = computedStyle.getPropertyValue(transformProperty) || computedStyle[transformProperty];
                    documentElement.removeChild(el);
                    isTransform3dSupported = has3d !== undefined && has3d.length > 0 && has3d !== 'none';
                } catch (e) {
                    // https://github.com/kissyteam/kissy/issues/563
                    isTransform3dSupported = true;
                }
            }
            return isTransform3dSupported;
        },
        /**
     * whether support class list api
     * @returns {boolean}
     */
        isClassListSupported: function () {
            return isClassListSupportedState;
        },
        /**
     * whether support querySelectorAll
     * @returns {boolean}
     */
        isQuerySelectorSupported: function () {
            // force to use js selector engine
            return isQuerySelectorSupportedState;
        },
        getCssVendorInfo: function (name) {
            return getVendorInfo(name);
        }
    };
});
