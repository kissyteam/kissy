/*
Copyright 2014, KISSY v5.0.0
MIT Licensed
build time: Jul 18 14:02
*/
KISSY.add("event/gesture/basic",["event/dom/base","event/gesture/util"],function(b,a,g,d){function c(b,c){var a={isActive:1};a[c]=function(a){e.fire(a.target,b,a)};f(b,{order:1,handle:a})}var e=a("event/dom/base"),f=a("event/gesture/util").addEvent,b=d.exports={START:"ksGestureStart",MOVE:"ksGestureMove",END:"ksGestureEnd"};c(b.START,"onTouchStart");c(b.MOVE,"onTouchMove");c(b.END,"onTouchEnd")});
