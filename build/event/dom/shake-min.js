/*
Copyright 2013, KISSY UI Library v1.40dev
MIT Licensed
build time: Apr 17 00:21
*/
KISSY.add("event/dom/shake",function(d,k,f){function l(a){var b=a.accelerationIncludingGravity,a=b.x,d=b.y,b=b.z,g;c!==f&&(g=n(h(a-c),h(d-i),h(b-j)),g>o&&m(),g>p&&(e=1));c=a;i=d;j=b}var q=k._Special,o=5,p=20,e=0,c,i,j,n=Math.max,h=Math.abs,a=d.Env.host,m=d.buffer(function(){e&&(k.fireHandler(a,"shake",{accelerationIncludingGravity:{x:c,y:i,z:j}}),c=f,e=0)},250);q.shake={setup:function(){this==a&&a.addEventListener("devicemotion",l,!1)},tearDown:function(){this==a&&(m.stop(),c=f,e=0,a.removeEventListener("devicemotion",
l,!1))}}},{requires:["event/dom/base"]});
