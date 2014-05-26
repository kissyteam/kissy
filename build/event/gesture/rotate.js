/*
Copyright 2014, KISSY v5.0.0
MIT Licensed
build time: May 26 21:39
*/
KISSY.add("event/gesture/rotate",["event/gesture/util","event/dom/base","util","feature"],function(l,d){function g(){}function f(a){2===a.targetTouches.length&&a.preventDefault()}var c=d("event/gesture/util"),a=c.DoubleTouch,c=c.addEvent,i=d("event/dom/base"),j=180/Math.PI,h=d("util"),k=d("feature");h.extend(g,a,{requiredGestureType:"touch",move:function(a){g.superclass.move.apply(this,arguments);var e=this.lastTouches,b=e[0],c=e[1],e=this.lastAngle,b=Math.atan2(c.pageY-b.pageY,c.pageX-b.pageX)*j;
if(void 0!==e){var c=Math.abs(b-e),d=(b+360)%360,f=(b-360)%360;Math.abs(d-e)<c?b=d:Math.abs(f-e)<c&&(b=f)}this.lastAngle=b;this.isStarted?i.fire(this.target,"rotate",h.mix(a,{angle:b,rotation:b-this.startAngle})):(this.isStarted=!0,this.startAngle=b,this.target=this.getCommonTarget(a),i.fire(this.target,"rotateStart",h.mix(a,{angle:b,rotation:0})))},end:function(a){g.superclass.end.apply(this,arguments);this.lastAngle=void 0;i.fire(this.target,"rotateEnd",h.mix(a,{touches:this.lastTouches}))}});a=
new g;c(["rotateEnd","rotateStart"],{handle:a});a={handle:a};k.isTouchEventSupported()&&(a.setup=function(){this.addEventListener("touchmove",f,!1)},a.tearDown=function(){this.removeEventListener("touchmove",f,!1)});c("rotate",a);return{ROTATE_START:"rotateStart",ROTATE:"rotate",ROTATE_END:"rotateEnd"}});
