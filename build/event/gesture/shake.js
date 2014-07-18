/*
Copyright 2014, KISSY v5.0.0
MIT Licensed
build time: Jul 18 14:02
*/
KISSY.add("event/gesture/shake",["event/dom/base","util"],function(j,b,r,n){function k(a){var c=a.accelerationIncludingGravity,a=c.x,b=c.y,c=c.z,f;void 0!==d&&(f=o(g(a-d),g(b-h),g(c-i)),f>p&&l(),f>q&&(e=1));d=a;h=b;i=c}var m=b("event/dom/base"),j=b("util"),b=m.Special,p=5,q=20,e=0,d,h,i,o=Math.max,g=Math.abs,a=window,l=j.buffer(function(){e&&(m.fireHandler(a,"shake",{accelerationIncludingGravity:{x:d,y:h,z:i}}),d=void 0,e=0)},250);b.shake={setup:function(){this===a&&a.addEventListener("devicemotion",
k,!1)},tearDown:function(){this===a&&(l.stop(),d=void 0,e=0,a.removeEventListener("devicemotion",k,!1))}};n.exports={SHAKE:"shake"}});
