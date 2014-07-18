/*
Copyright 2014, KISSY v5.0.0
MIT Licensed
build time: Jul 18 14:03
*/
KISSY.add("feature",["ua"],function(j,r,w,s){function t(a,b){return b.toUpperCase()}function k(a){-1!==a.indexOf("-")&&(a=a.replace(u,t));if(a in c)return c[a];if(!h||a in h)c[a]={propertyName:a,propertyNamePrefix:""};else{for(var b=a.charAt(0).toUpperCase()+a.slice(1),d,g=0;g<v;g++){var e=n[g];d=e+b;d in h&&(c[a]={propertyName:d,propertyNamePrefix:e})}c[a]=c[a]||null}return c[a]}var e=window,j=r("ua"),n=["Webkit","Moz","O","ms"],v=n.length,i=e.document||{},l,m,d,b=i&&i.documentElement,h,o=!0,p=!1,
q="ontouchstart"in i&&!j.phantomjs,c={},f=j.ieMode;b&&(b.querySelector&&8!==f&&(p=!0),h=b.style,o="classList"in b,l="msPointerEnabled"in navigator,m="pointerEnabled"in navigator);var u=/-([a-z])/gi;s.exports={isMsPointerSupported:function(){return l},isPointerSupported:function(){return m},isTouchEventSupported:function(){return q},isTouchGestureSupported:function(){return q||m||l},isDeviceMotionSupported:function(){return!!e.DeviceMotionEvent},isHashChangeSupported:function(){return"onhashchange"in
e&&(!f||f>7)},isInputEventSupported:function(){return"oninput"in e&&(!f||f>9)},isTransform3dSupported:function(){if(d!==void 0)return d;if(!b||!k("transform"))d=false;else try{var a=i.createElement("p"),c=k("transform").propertyName;b.insertBefore(a,b.firstChild);a.style[c]="translate3d(1px,1px,1px)";var f=e.getComputedStyle(a),g=f.getPropertyValue(c)||f[c];b.removeChild(a);d=g!==void 0&&g.length>0&&g!=="none"}catch(h){d=true}return d},isClassListSupported:function(){return o},isQuerySelectorSupported:function(){return p},
getCssVendorInfo:function(a){return k(a)}}});
