/*
Copyright 2014, KISSY v5.0.0
MIT Licensed
build time: May 14 22:26
*/
KISSY.add("feature",["ua"],function(n,t){function u(a,c){return c.toUpperCase()}function k(a){-1!==a.indexOf("-")&&(a=a.replace(v,u));if(a in f)return f[a];if(!i||a in i)f[a]={propertyName:a,propertyNamePrefix:""};else{for(var c=a.charAt(0).toUpperCase()+a.slice(1),b,e=0;e<w;e++){var d=o[e];b=d+c;b in i&&(f[a]={propertyName:b,propertyNamePrefix:d})}f[a]=f[a]||null}return f[a]}var e=n.Env.host,p=n.Config,d=t("ua"),o=["Webkit","Moz","O","ms"],w=o.length,j=e.document||{},l,m,g,b=j&&j.documentElement,
i,q=!0,r=!1,s="ontouchstart"in j&&!d.phantomjs,f={},h=d.ieMode;b&&(b.querySelector&&8!==h&&(r=!0),i=b.style,q="classList"in b,d=e.navigator||{},l="msPointerEnabled"in d,m="pointerEnabled"in d);var v=/-([a-z])/gi;return{isMsPointerSupported:function(){return l},isPointerSupported:function(){return m},isTouchEventSupported:function(){return s},isTouchGestureSupported:function(){return s||m||l},isDeviceMotionSupported:function(){return!!e.DeviceMotionEvent},isHashChangeSupported:function(){return"onhashchange"in
e&&(!h||h>7)},isInputEventSupported:function(){return!p.simulateInputEvent&&"oninput"in e&&(!h||h>9)},isTransform3dSupported:function(){if(g!==void 0)return g;if(!b||!k("transform"))g=false;else{var a=j.createElement("p"),c=k("transform").name;b.insertBefore(a,b.firstChild);a.style[c]="translate3d(1px,1px,1px)";var d=e.getComputedStyle(a),c=d.getPropertyValue(c)||d[c];b.removeChild(a);g=c!==void 0&&c.length>0&&c!=="none"}return g},isClassListSupported:function(){return q},isQuerySelectorSupported:function(){return!p.simulateCss3Selector&&
r},getCssVendorInfo:function(a){return k(a)}}});
