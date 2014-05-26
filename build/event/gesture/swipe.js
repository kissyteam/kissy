/*
Copyright 2014, KISSY v5.0.0
MIT Licensed
build time: May 26 21:39
*/
KISSY.add("event/gesture/swipe",["event/gesture/util","event/dom/base","util"],function(s,i){function m(a,b,d){var f=a.lastTouches[0],e=f.pageX-a.startX,c=f.pageY-a.startY,g=Math.abs(e),h=Math.abs(c);if(b.timeStamp-a.startTime>p)return!1;a.isVertical&&g>n&&(a.isVertical=0);a.isHorizontal&&h>n&&(a.isHorizontal=0);if(d)a.isVertical&&a.isHorizontal&&(h>g?a.isHorizontal=0:a.isVertical=0);else if(a.isVertical&&h<o&&(a.isVertical=0),a.isHorizontal&&g<o)a.isHorizontal=0;if(a.isHorizontal)e=0>e?"left":"right";
else if(a.isVertical)e=0>c?"up":"down",g=h;else return!1;d?e&&!a.isStarted?(a.isStarted=1,d=j):d=k:d=l;q.fire(f.target,d,{originalEvent:b.originalEvent,pageX:f.pageX,pageY:f.pageY,which:1,direction:e,distance:g,duration:(b.timeStamp-a.startTime)/1E3})}function b(){}var c=i("event/gesture/util"),r=c.addEvent,q=i("event/dom/base"),c=c.SingleTouch,k="swipe",j="swipeStart",l="swipeEnd",p=1E3,n=35,o=50;i("util").extend(b,c,{requiredGestureType:"touch",start:function(){b.superclass.start.apply(this,arguments);
var a=this.lastTouches[0];this.isVertical=this.isHorizontal=1;this.startX=a.pageX;this.startY=a.pageY},move:function(a){b.superclass.move.apply(this,arguments);return m(this,a,1)},end:function(a){b.superclass.end.apply(this,arguments);return m(this,a,0)}});r([k,j,l],{handle:new b});return{SWIPE:k,SWIPE_START:j,SWIPE_END:l}});
