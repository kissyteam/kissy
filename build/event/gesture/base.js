/*
Copyright 2014, KISSY v5.0.0
MIT Licensed
build time: Apr 29 15:09
*/
KISSY.add("event/gesture/base",["event/dom/base","event/gesture/util"],function(f,a){function c(b,c){var a={isActive:1};a[c]=function(a){d.fire(a.target,b,a)};e(b,{order:1,handle:a})}var d=a("event/dom/base"),e=a("event/gesture/util").addEvent,b={START:"ksGestureStart",MOVE:"ksGestureMove",END:"ksGestureEnd"};c(b.START,"onTouchStart");c(b.MOVE,"onTouchMove");c(b.END,"onTouchEnd");return b});
