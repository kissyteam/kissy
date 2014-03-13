/*
Copyright 2014, KISSY v1.50
MIT Licensed
build time: Mar 13 23:52
*/
KISSY.add("feature",["ua"],function(i,t){function l(a){if(a in d)return d[a];if(!j||a in j)d[a]={propertyName:a,name:a,propertyNamePrefix:"",namePrefix:""};else{var e=a.charAt(0).toUpperCase()+a.slice(1),c,b;for(b in m)c=b+e,c in j&&(d[a]={propertyName:c,name:m[b]+a,propertyNamePrefix:b,namePrefix:m[b]});d[a]=d[a]||null}return d[a]}var b=i.Env.host,p=i.Config,f=t("ua"),m={Webkit:"-webkit-",Moz:"-moz-",O:"-o-",ms:"ms-"},k=b.document||{},n,o,g,c=k&&k.documentElement,j,q=!0,r=!1,s="ontouchstart"in k&&
!f.phantomjs,d={},h=f.ieMode;c&&(c.querySelector&&8!==h&&(r=!0),j=c.style,q="classList"in c,f=b.navigator||{},n="msPointerEnabled"in f,o="pointerEnabled"in f);i.Feature={isMsPointerSupported:function(){return n},isPointerSupported:function(){return o},isTouchEventSupported:function(){return s},isTouchGestureSupported:function(){return s||o||n},isDeviceMotionSupported:function(){return!!b.DeviceMotionEvent},isHashChangeSupported:function(){return"onhashchange"in b&&(!h||h>7)},isInputEventSupported:function(){return!p.simulateInputEvent&&
"oninput"in b&&(!h||h>9)},isTransform3dSupported:function(){if(g!==void 0)return g;if(!c||l("transform").prefix===false)g=false;else{var a=k.createElement("p"),e=l("transform").name;c.insertBefore(a,c.firstChild);a.style[e]="translate3d(1px,1px,1px)";var d=b.getComputedStyle(a),e=d.getPropertyValue(e)||d[e];c.removeChild(a);g=e!==void 0&&e.length>0&&e!=="none"}return g},isClassListSupported:function(){return q},isQuerySelectorSupported:function(){return!p.simulateCss3Selector&&r},getCssVendorInfo:function(a){return l(a)}};
return i.Feature});
