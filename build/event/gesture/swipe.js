/*
Copyright 2014, KISSY v5.0.0
MIT Licensed
build time: Apr 15 17:53
*/
KISSY.add("event/gesture/swipe",["event/gesture/util","event/dom/base"],function(o,f){function k(a,b,c){var d=a.lastTouches[0],e=d.pageX-a.startX,f=d.pageY-a.startY,g=Math.abs(e),h=Math.abs(f);if(b.timeStamp-a.startTime>p)return!1;a.isVertical&&g>l&&(a.isVertical=0);a.isHorizontal&&h>l&&(a.isHorizontal=0);if(c)a.isVertical&&a.isHorizontal&&(h>g?a.isHorizontal=0:a.isVertical=0);else if(a.isVertical&&h<m&&(a.isVertical=0),a.isHorizontal&&g<m)a.isHorizontal=0;if(a.isHorizontal)e=0>e?"left":"right";else if(a.isVertical)e=
0>f?"up":"down",g=h;else return!1;c?e&&!a.isStarted?(a.isStarted=1,c=q):c=i:c=j;r.fire(d.target,c,{originalEvent:b.originalEvent,pageX:d.pageX,pageY:d.pageY,which:1,touch:d,direction:e,distance:g,duration:(b.timeStamp-a.startTime)/1E3})}function b(){}var n=f("event/gesture/util"),s=n.addEvent,r=f("event/dom/base"),j="swipe",q="swipeStart",i="swiping",p=1E3,l=35,m=50;o.extend(b,n.SingleTouch,{requiredGestureType:"touch",start:function(){b.superclass.start.apply(this,arguments);var a=this.lastTouches[0];
this.isVertical=this.isHorizontal=1;this.startX=a.pageX;this.startY=a.pageY},move:function(a){b.superclass.move.apply(this,arguments);return k(this,a,1)},end:function(a){b.superclass.end.apply(this,arguments);return k(this,a,0)}});s([j,i],{handle:new b});return{SWIPE:j,SWIPING:i}});
