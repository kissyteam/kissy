/*
Copyright 2014, KISSY v1.50
MIT Licensed
build time: Mar 31 21:42
*/
KISSY.add("feature",["util","ua"],function(g,o){function l(a){-1!==a.indexOf("-")&&(a=g.camelCase(a));if(a in f)return f[a];if(!j||a in j)f[a]={propertyName:a,propertyNamePrefix:""};else{for(var e=a.charAt(0).toUpperCase()+a.slice(1),b,d=0;d<u;d++){var c=p[d];b=c+e;b in j&&(f[a]={propertyName:b,propertyNamePrefix:c})}f[a]=f[a]||null}return f[a]}o("util");var d=g.Env.host,q=g.Config,c=o("ua"),p=["Webkit","Moz","O","ms"],u=p.length,k=d.document||{},m,n,h,b=k&&k.documentElement,j,r=!0,s=!1,t="ontouchstart"in
k&&!c.phantomjs,f={},i=c.ieMode;b&&(b.querySelector&&8!==i&&(s=!0),j=b.style,r="classList"in b,c=d.navigator||{},m="msPointerEnabled"in c,n="pointerEnabled"in c);g.Feature={isMsPointerSupported:function(){return m},isPointerSupported:function(){return n},isTouchEventSupported:function(){return t},isTouchGestureSupported:function(){return t||n||m},isDeviceMotionSupported:function(){return!!d.DeviceMotionEvent},isHashChangeSupported:function(){return"onhashchange"in d&&(!i||i>7)},isInputEventSupported:function(){return!q.simulateInputEvent&&
"oninput"in d&&(!i||i>9)},isTransform3dSupported:function(){if(h!==void 0)return h;if(!b||!l("transform"))h=false;else{var a=k.createElement("p"),e=l("transform").name;b.insertBefore(a,b.firstChild);a.style[e]="translate3d(1px,1px,1px)";var c=d.getComputedStyle(a),e=c.getPropertyValue(e)||c[e];b.removeChild(a);h=e!==void 0&&e.length>0&&e!=="none"}return h},isClassListSupported:function(){return r},isQuerySelectorSupported:function(){return!q.simulateCss3Selector&&s},getCssVendorInfo:function(a){return l(a)}};
return g.Feature});
