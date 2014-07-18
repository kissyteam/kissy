/*
Copyright 2014, KISSY v5.0.0
MIT Licensed
build time: Jul 18 14:02
*/
KISSY.add("event/gesture/pinch",["event/gesture/util","event/dom/base","feature","util"],function(d,a,h,j){function e(){}function i(a){2===a.targetTouches.length&&a.preventDefault()}var d=a("event/gesture/util"),k=d.DoubleTouch,d=d.addEvent,g=a("event/dom/base"),h=a("feature"),f=a("util");f.extend(e,k,{requiredGestureType:"touch",move:function(a){e.superclass.move.apply(this,arguments);var b=this.lastTouches;if(0<b[0].pageX&&0<b[0].pageY&&0<b[1].pageX&&0<b[1].pageY){var c;c=b[0];var d=b[1],b=c.pageX-
d.pageX;c=c.pageY-d.pageY;c=Math.sqrt(b*b+c*c);this.isStarted?g.fire(this.target,"pinch",f.mix(a,{distance:c,scale:c/this.startDistance})):(this.isStarted=!0,this.startDistance=c,b=this.target=this.getCommonTarget(a),g.fire(b,"pinchStart",f.mix(a,{distance:c,scale:1})))}},end:function(a){e.superclass.end.apply(this,arguments);g.fire(this.target,"pinchEnd",f.mix(a,{touches:this.lastTouches}))}});a=new e;d(["pinchStart","pinchEnd"],{handle:a});a={handle:a};h.isTouchEventSupported()&&(a.setup=function(){this.addEventListener("touchmove",
i,!1)},a.tearDown=function(){this.removeEventListener("touchmove",i,!1)});d("pinch",a);j.exports={PINCH:"pinch",PINCH_START:"pinchStart",PINCH_END:"pinchEnd"}});
