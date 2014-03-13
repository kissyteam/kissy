/*
Copyright 2014, KISSY v1.50
MIT Licensed
build time: Mar 13 20:31
*/
/*
 Combined modules by KISSY Module Compiler: 

 feature
*/

KISSY.add("feature", ["ua"], function(S, require) {
  var win = S.Env.host, Config = S.Config, UA = require("ua"), VENDORS = ["Webkit", "Moz", "O", "ms"], doc = win.document || {}, isMsPointerSupported, isPointerSupported, isTransform3dSupported, documentElement = doc && doc.documentElement, navigator, documentElementStyle, isClassListSupportedState = true, isQuerySelectorSupportedState = false, isTouchEventSupportedState = "ontouchstart" in doc && !UA.phantomjs, vendorInfos = {}, ie = UA.ieMode;
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
    if(vendorInfos[name]) {
      return vendorInfos[name]
    }
    if(!documentElementStyle || name in documentElementStyle) {
      vendorInfos[name] = {name:name, prefix:""}
    }else {
      var upperFirstName = name.charAt(0).toUpperCase() + name.slice(1), vendorName, i = VENDORS.length;
      while(i--) {
        vendorName = VENDORS[i] + upperFirstName;
        if(vendorName in documentElementStyle) {
          vendorInfos[name] = {name:vendorName, prefix:VENDORS[i]}
        }
      }
      vendorInfos[name] = vendorInfos[name] || {name:name, prefix:false}
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
  }, getVendorCssPropPrefix:function(name) {
    return getVendorInfo(name).prefix
  }, getVendorCssPropName:function(name) {
    return getVendorInfo(name).name
  }};
  return S.Feature
});

