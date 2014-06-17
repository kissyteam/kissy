/*
Copyright 2014, KISSY v5.0.0
MIT Licensed
build time: Jun 17 22:12
*/
KISSY.add("event/gesture/swipe",["util","dom","event/gesture/util","event/dom/base"],function(k,e,g,o){function l(a,d,c){var h=a.lastTouches[0],b=h.pageX-a.startX,e=h.pageY-a.startY,f=Math.abs(b),i=Math.abs(e),g=d.timeStamp;a.isStarted=1;if(g-a.startTime>p)return!1;a.isVertical&&f>m&&(a.isVertical=0);a.isHorizontal&&i>m&&(a.isHorizontal=0);a.isVertical&&a.isHorizontal&&(i>f?a.isHorizontal=0:a.isVertical=0);if(!c&&(a.isVertical&&i<n&&(a.isVertical=0),a.isHorizontal&&f<n))a.isHorizontal=0;if(a.isHorizontal)b=
0>b?"left":"right";else if(a.isVertical)b=0>e?"up":"down",f=i;else return!1;c?(a=d.originalEvent._ksSwipePrevent)&&a[b]&&d.preventDefault():q.fire(h.target,j,{originalEvent:d.originalEvent,pageX:h.pageX,pageY:h.pageY,which:1,direction:b,distance:f,duration:(d.timeStamp-a.startTime)/1E3})}function c(){}var k=e("util"),r=e("dom"),g=e("event/gesture/util"),s=g.addEvent,q=e("event/dom/base"),j="swipe",p=1E3,m=35,n=50;k.extend(c,g.SingleTouch,{requiredGestureType:"touch",start:function(){c.superclass.start.apply(this,
arguments);var a=this.lastTouches[0];this.isVertical=this.isHorizontal=1;this.startX=a.pageX;this.startY=a.pageY},move:function(a){c.superclass.move.apply(this,arguments);return l(this,a,1)},end:function(a){c.superclass.end.apply(this,arguments);return l(this,a,0)}});s([j],{handle:new c,add:function(a){var d=a.config,c=this;d.preventDefault&&(a._preventFn=function(a){var b;if(!(b=!d.filter)){b=a.target;for(var e=d.filter,f=!1;b!==c&&!(f=r.test(b,e));)b=b.parentNode;b=f}b&&(a._ksSwipePrevent=d.preventDefault)},
c.addEventListener("touchmove",a._preventFn))},remove:function(a){a._preventFn&&(this.removeEventListener("touchmove",a._preventFn),a._preventFn=null)}});o.exports={SWIPE:j}});
