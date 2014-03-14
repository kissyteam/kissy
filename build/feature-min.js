/*
Copyright 2014, KISSY v1.50
MIT Licensed
build time: Mar 14 15:44
*/
KISSY.add("feature",["ua"],function(g,t){function l(a){-1!==a.indexOf("-")&&(a=g.camelCase(a));if(a in f)return f[a];if(!j||a in j)f[a]={propertyName:a,propertyNamePrefix:""};else{for(var e=a.charAt(0).toUpperCase()+a.slice(1),b,d=0;d<u;d++){var c=o[d];b=c+e;b in j&&(f[a]={propertyName:b,propertyNamePrefix:c})}f[a]=f[a]||null}return f[a]}var d=g.Env.host,p=g.Config,c=t("ua"),o=["Webkit","Moz","O","ms"],u=o.length,k=d.document||{},m,n,h,b=k&&k.documentElement,j,q=!0,r=!1,s="ontouchstart"in k&&!c.phantomjs,
f={},i=c.ieMode;b&&(b.querySelector&&8!==i&&(r=!0),j=b.style,q="classList"in b,c=d.navigator||{},m="msPointerEnabled"in c,n="pointerEnabled"in c);g.Feature={isMsPointerSupported:function(){return m},isPointerSupported:function(){return n},isTouchEventSupported:function(){return s},isTouchGestureSupported:function(){return s||n||m},isDeviceMotionSupported:function(){return!!d.DeviceMotionEvent},isHashChangeSupported:function(){return"onhashchange"in d&&(!i||i>7)},isInputEventSupported:function(){return!p.simulateInputEvent&&
"oninput"in d&&(!i||i>9)},isTransform3dSupported:function(){if(h!==void 0)return h;if(!b||l("transform").prefix===false)h=false;else{var a=k.createElement("p"),e=l("transform").name;b.insertBefore(a,b.firstChild);a.style[e]="translate3d(1px,1px,1px)";var c=d.getComputedStyle(a),e=c.getPropertyValue(e)||c[e];b.removeChild(a);h=e!==void 0&&e.length>0&&e!=="none"}return h},isClassListSupported:function(){return q},isQuerySelectorSupported:function(){return!p.simulateCss3Selector&&r},getCssVendorInfo:function(a){return l(a)}};
return g.Feature});
