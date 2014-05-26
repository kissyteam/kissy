/*
Copyright 2014, KISSY v5.0.0
MIT Licensed
build time: May 26 21:39
*/
KISSY.add("event/gesture/pinch",["event/gesture/util","event/dom/base","feature","util"],function(k,e){function f(){}function i(a){2===a.targetTouches.length&&a.preventDefault()}var d=e("event/gesture/util"),a=d.DoubleTouch,d=d.addEvent,h=e("event/dom/base"),j=e("feature"),g=e("util");g.extend(f,a,{requiredGestureType:"touch",move:function(a){f.superclass.move.apply(this,arguments);var b=this.lastTouches;if(0<b[0].pageX&&0<b[0].pageY&&0<b[1].pageX&&0<b[1].pageY){var c;c=b[0];var d=b[1],b=c.pageX-
d.pageX;c=c.pageY-d.pageY;c=Math.sqrt(b*b+c*c);this.isStarted?h.fire(this.target,"pinch",g.mix(a,{distance:c,scale:c/this.startDistance})):(this.isStarted=!0,this.startDistance=c,b=this.target=this.getCommonTarget(a),h.fire(b,"pinchStart",g.mix(a,{distance:c,scale:1})))}},end:function(a){f.superclass.end.apply(this,arguments);h.fire(this.target,"pinchEnd",g.mix(a,{touches:this.lastTouches}))}});a=new f;d(["pinchStart","pinchEnd"],{handle:a});a={handle:a};j.isTouchEventSupported()&&(a.setup=function(){this.addEventListener("touchmove",
i,!1)},a.tearDown=function(){this.removeEventListener("touchmove",i,!1)});d("pinch",a);return{PINCH:"pinch",PINCH_START:"pinchStart",PINCH_END:"pinchEnd"}});
