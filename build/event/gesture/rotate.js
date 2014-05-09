/*
Copyright 2014, KISSY v5.0.0
MIT Licensed
build time: May 9 14:04
*/
KISSY.add("event/gesture/rotate",["event/gesture/util","event/dom/base"],function(e,f){function h(){}function g(a){2===a.targetTouches.length&&a.preventDefault()}var c=f("event/gesture/util"),a=c.DoubleTouch,c=c.addEvent,i=f("event/dom/base"),j=180/Math.PI;e.extend(h,a,{requiredGestureType:"touch",move:function(a){h.superclass.move.apply(this,arguments);var d=this.lastTouches,b=d[0],c=d[1],d=this.lastAngle,b=Math.atan2(c.pageY-b.pageY,c.pageX-b.pageX)*j;if(void 0!==d){var c=Math.abs(b-d),f=(b+360)%
360,g=(b-360)%360;Math.abs(f-d)<c?b=f:Math.abs(g-d)<c&&(b=g)}this.lastAngle=b;this.isStarted?i.fire(this.target,"rotate",e.mix(a,{angle:b,rotation:b-this.startAngle})):(this.isStarted=!0,this.startAngle=b,this.target=this.getCommonTarget(a),i.fire(this.target,"rotateStart",e.mix(a,{angle:b,rotation:0})))},end:function(a){h.superclass.end.apply(this,arguments);this.lastAngle=void 0;i.fire(this.target,"rotateEnd",e.mix(a,{touches:this.lastTouches}))}});a=new h;c(["rotateEnd","rotateStart"],{handle:a});
a={handle:a};e.Feature.isTouchEventSupported()&&(a.setup=function(){this.addEventListener("touchmove",g,!1)},a.tearDown=function(){this.removeEventListener("touchmove",g,!1)});c("rotate",a);return{ROTATE_START:"rotateStart",ROTATE:"rotate",ROTATE_END:"rotateEnd"}});
