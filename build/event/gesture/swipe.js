/*
Copyright 2014, KISSY v5.0.0
MIT Licensed
build time: May 9 14:04
*/
KISSY.add("event/gesture/swipe",["event/gesture/util","event/dom/base"],function(p,e){function l(a,b,c){var f=a.lastTouches[0],d=f.pageX-a.startX,e=f.pageY-a.startY,g=Math.abs(d),h=Math.abs(e);if(b.timeStamp-a.startTime>q)return!1;a.isVertical&&g>m&&(a.isVertical=0);a.isHorizontal&&h>m&&(a.isHorizontal=0);if(c)a.isVertical&&a.isHorizontal&&(h>g?a.isHorizontal=0:a.isVertical=0);else if(a.isVertical&&h<n&&(a.isVertical=0),a.isHorizontal&&g<n)a.isHorizontal=0;if(a.isHorizontal)d=0>d?"left":"right";else if(a.isVertical)d=
0>e?"up":"down",g=h;else return!1;c?d&&!a.isStarted?(a.isStarted=1,c=i):c=j:c=k;r.fire(f.target,c,{originalEvent:b.originalEvent,pageX:f.pageX,pageY:f.pageY,which:1,direction:d,distance:g,duration:(b.timeStamp-a.startTime)/1E3})}function b(){}var o=e("event/gesture/util"),s=o.addEvent,r=e("event/dom/base"),j="swipe",i="swipeStart",k="swipeEnd",q=1E3,m=35,n=50;p.extend(b,o.SingleTouch,{requiredGestureType:"touch",start:function(){b.superclass.start.apply(this,arguments);var a=this.lastTouches[0];this.isVertical=
this.isHorizontal=1;this.startX=a.pageX;this.startY=a.pageY},move:function(a){b.superclass.move.apply(this,arguments);return l(this,a,1)},end:function(a){b.superclass.end.apply(this,arguments);return l(this,a,0)}});s([j,i,k],{handle:new b});return{SWIPE:j,SWIPE_START:i,SWIPE_END:k}});
