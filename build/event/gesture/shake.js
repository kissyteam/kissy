/*
Copyright 2014, KISSY v5.0.0
MIT Licensed
build time: May 26 21:39
*/
KISSY.add("event/gesture/shake",["event/dom/base","util"],function(m,d){function j(a){var b=a.accelerationIncludingGravity,a=b.x,d=b.y,b=b.z,f;void 0!==c&&(f=n(g(a-c),g(d-h),g(b-i)),f>o&&k(),f>p&&(e=1));c=a;h=d;i=b}var l=d("event/dom/base"),q=d("util"),r=l.Special,o=5,p=20,e=0,c,h,i,n=Math.max,g=Math.abs,a=m.Env.host,k=q.buffer(function(){e&&(l.fireHandler(a,"shake",{accelerationIncludingGravity:{x:c,y:h,z:i}}),c=void 0,e=0)},250);r.shake={setup:function(){this===a&&a.addEventListener("devicemotion",
j,!1)},tearDown:function(){this===a&&(k.stop(),c=void 0,e=0,a.removeEventListener("devicemotion",j,!1))}};return{SHAKE:"shake"}});
