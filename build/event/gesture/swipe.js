/*
Copyright 2014, KISSY v5.0.0
MIT Licensed
build time: Jun 13 11:51
*/
KISSY.add("event/gesture/swipe",["event/gesture/util","event/dom/base","util"],function(l,d,c,p){function m(a,c,e){var b=a.lastTouches[0],f=b.pageX-a.startX,d=b.pageY-a.startY,g=Math.abs(f),h=Math.abs(d);if(c.timeStamp-a.startTime>q)return!1;a.isVertical&&g>n&&(a.isVertical=0);a.isHorizontal&&h>n&&(a.isHorizontal=0);if(e)a.isVertical&&a.isHorizontal&&(h>g?a.isHorizontal=0:a.isVertical=0);else if(a.isVertical&&h<o&&(a.isVertical=0),a.isHorizontal&&g<o)a.isHorizontal=0;if(a.isHorizontal)f=0>f?"left":
"right";else if(a.isVertical)f=0>d?"up":"down",g=h;else return!1;e?f&&!a.isStarted?(a.isStarted=1,e=i):e=j:e=k;r.fire(b.target,e,{originalEvent:c.originalEvent,pageX:b.pageX,pageY:b.pageY,which:1,direction:f,distance:g,duration:(c.timeStamp-a.startTime)/1E3})}function b(){}var c=d("event/gesture/util"),l=c.addEvent,r=d("event/dom/base"),c=c.SingleTouch,j="swipe",i="swipeStart",k="swipeEnd",q=1E3,n=35,o=50;d("util").extend(b,c,{requiredGestureType:"touch",start:function(){b.superclass.start.apply(this,
arguments);var a=this.lastTouches[0];this.isVertical=this.isHorizontal=1;this.startX=a.pageX;this.startY=a.pageY},move:function(a){b.superclass.move.apply(this,arguments);return m(this,a,1)},end:function(a){b.superclass.end.apply(this,arguments);return m(this,a,0)}});l([j,i,k],{handle:new b});p.exports={SWIPE:j,SWIPE_START:i,SWIPE_END:k}});
