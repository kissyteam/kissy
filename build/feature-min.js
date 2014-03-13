/*
Copyright 2014, KISSY v1.50
MIT Licensed
build time: Mar 13 18:03
*/
KISSY.add("feature",["ua"],function(i,t){function j(a){if(c[a])return c[a];if(!k||a in k)c[a]={name:a,prefix:""};else{for(var e=a.charAt(0).toUpperCase()+a.slice(1),b,d=m.length;d--;)b=m[d]+e,b in k&&(c[a]={name:b,prefix:m[d]});c[a]=c[a]||{name:a,prefix:!1}}return c[a]}var d=i.Env.host,p=i.Config,f=t("ua"),m=["Webkit","Moz","O","ms"],l=d.document||{},n,o,g,b=l&&l.documentElement,k,q=!0,r=!1,s="ontouchstart"in l&&!f.phantomjs,c={},h=f.ieMode;b&&(b.querySelector&&8!==h&&(r=!0),k=b.style,q="classList"in
b,f=d.navigator||{},n="msPointerEnabled"in f,o="pointerEnabled"in f);i.Feature={isMsPointerSupported:function(){return n},isPointerSupported:function(){return o},isTouchEventSupported:function(){return s},isTouchGestureSupported:function(){return s||o||n},isDeviceMotionSupported:function(){return!!d.DeviceMotionEvent},isHashChangeSupported:function(){return"onhashchange"in d&&(!h||h>7)},isInputEventSupported:function(){return!p.simulateInputEvent&&"oninput"in d&&(!h||h>9)},isTransform3dSupported:function(){if(g!==
void 0)return g;if(!b||j("transform").prefix===false)g=false;else{var a=l.createElement("p"),e=j("transform").name;b.insertBefore(a,b.firstChild);a.style[e]="translate3d(1px,1px,1px)";var c=d.getComputedStyle(a),e=c.getPropertyValue(e)||c[e];b.removeChild(a);g=e!==void 0&&e.length>0&&e!=="none"}return g},isClassListSupported:function(){return q},isQuerySelectorSupported:function(){return!p.simulateCss3Selector&&r},getVendorCssPropPrefix:function(a){return j(a).prefix},getVendorCssPropName:function(a){return j(a).name}};
return i.Feature});
