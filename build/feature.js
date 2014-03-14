/*
Copyright 2014, KISSY v1.50
MIT Licensed
build time: Mar 14 15:44
*/
/*
 Combined modules by KISSY Module Compiler: 

 feature
*/

KISSY.add("feature", ["ua"], function(S, require) {
  var win = S.Env.host, Config = S.Config, UA = require("ua"), propertyPrefixes = ["Webkit", "Moz", "O", "ms"], propertyPrefixesLength = propertyPrefixes.length, doc = win.document || {}, isMsPointerSupported, isPointerSupported, isTransform3dSupported, documentElement = doc && doc.documentElement, navigator, documentElementStyle, isClassListSupportedState = true, isQuerySelectorSupportedState = false, isTouchEventSupportedState = "ontouchstart" in doc && !UA.phantomjs, vendorInfos = {}, ie = UA.ieMode;
  if(documentElement) {
    if(documentElement.querySelector && ie !== 8) {
      isQuerySelectorSupportedState = true
    }
    documentElementStyle = documentElement.style;
    isClassListSupportedState = "classList" in documentElement;
    navigator = win.navigator || {};
    isMsPointerSupported = "msPointerEnabled" in navigator;
    isPointerSupported = "pointerEnabled" in navigator
  }
  function getVendorInfo(name) {
    if(name.indexOf("-") !== -1) {
      name = S.camelCase(name)
    }
    if(name in vendorInfos) {
      return vendorInfos[name]
    }
    if(!documentElementStyle || name in documentElementStyle) {
      vendorInfos[name] = {propertyName:name, propertyNamePrefix:""}
    }else {
      var upperFirstName = name.charAt(0).toUpperCase() + name.slice(1), vendorName;
      for(var i = 0;i < propertyPrefixesLength;i++) {
        var propertyNamePrefix = propertyPrefixes[i];
        vendorName = propertyNamePrefix + upperFirstName;
        if(vendorName in documentElementStyle) {
          vendorInfos[name] = {propertyName:vendorName, propertyNamePrefix:propertyNamePrefix}
        }
      }
      vendorInfos[name] = vendorInfos[name] || null
    }
    return vendorInfos[name]
  }
  S.Feature = {isMsPointerSupported:function() {
    return isMsPointerSupported
  }, isPointerSupported:function() {
    return isPointerSupported
  }, isTouchEventSupported:function() {
    return isTouchEventSupportedState
  }, isTouchGestureSupported:function() {
    return isTouchEventSupportedState || isPointerSupported || isMsPointerSupported
  }, isDeviceMotionSupported:function() {
    return!!win.DeviceMotionEvent
  }, isHashChangeSupported:function() {
    return"onhashchange" in win && (!ie || ie > 7)
  }, isInputEventSupported:function() {
    return!Config.simulateInputEvent && "oninput" in win && (!ie || ie > 9)
  }, isTransform3dSupported:function() {
    if(isTransform3dSupported !== undefined) {
      return isTransform3dSupported
    }
    if(!documentElement || getVendorInfo("transform").prefix === false) {
      isTransform3dSupported = false
    }else {
      var el = doc.createElement("p");
      var transformProperty = getVendorInfo("transform").name;
      documentElement.insertBefore(el, documentElement.firstChild);
      el.style[transformProperty] = "translate3d(1px,1px,1px)";
      var computedStyle = win.getComputedStyle(el);
      var has3d = computedStyle.getPropertyValue(transformProperty) || computedStyle[transformProperty];
      documentElement.removeChild(el);
      isTransform3dSupported = has3d !== undefined && has3d.length > 0 && has3d !== "none"
    }
    return isTransform3dSupported
  }, isClassListSupported:function() {
    return isClassListSupportedState
  }, isQuerySelectorSupported:function() {
    return!Config.simulateCss3Selector && isQuerySelectorSupportedState
  }, getCssVendorInfo:function(name) {
    return getVendorInfo(name)
  }};
  return S.Feature
});

