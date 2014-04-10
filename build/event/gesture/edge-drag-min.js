/*
Copyright 2014, KISSY v5.0.0
MIT Licensed
build time: Apr 10 19:04
*/
KISSY.add("event/gesture/edge-drag",["event/gesture/util","event/dom/base"],function(n,h){function i(a,c,j){var g=a.lastTouches[0],o=g.pageX,p=g.pageY,b=o-a.startX,k=p-a.startY,e=Math.abs(b),f=Math.abs(k);a.isVertical&&e>t&&(a.isVertical=0);a.isHorizontal&&f>t&&(a.isHorizontal=0);a.isVertical&&a.isHorizontal&&(f>e?a.isHorizontal=0:a.isVertical=0);var b=a.isHorizontal?a.direction=0>b?"left":"right":a.isVertical?a.direction=0>k?"up":"down":a.direction,e="up"===b||"down"===b?f:e,h,i,f=c.timeStamp-a.startTime;
if(j)if(a.isStarted)j=q;else{var j=r,d=window,k=d.pageXOffset+l,m=d.pageXOffset+d.innerWidth-l,n=d.pageYOffset+l,d=d.pageYOffset+d.innerHeight-l;if("right"===b&&o>k||"left"===b&&o<m||"down"===b&&p>n||"up"===b&&p<d)return!1;a.isStarted=1;a.startTime=c.timeStamp}else j=s,"left"===b||"right"===b?h=e/f:i=e/f;u.fire(g.target,j,{originalEvent:c.originalEvent,pageX:g.pageX,pageY:g.pageY,which:1,touch:g,direction:b,distance:e,duration:f/1E3,velocityX:h,velocityY:i})}function c(){}var m=h("event/gesture/util"),
v=m.addEvent,u=h("event/dom/base"),t=35,r="edgeDragStart",q="edgeDrag",s="edgeDragEnd",l=60;n.extend(c,m.SingleTouch,{requiredGestureType:"touch",start:function(){c.superclass.start.apply(this,arguments);var a=this.lastTouches[0];this.isVertical=this.isHorizontal=1;this.startX=a.pageX;this.startY=a.pageY},move:function(a){c.superclass.move.apply(this,arguments);return i(this,a,1)},end:function(a){c.superclass.end.apply(this,arguments);return i(this,a,0)}});v([q,s,r],{handle:new c});return{EDGE_DRAG:q,
EDGE_DRAG_START:r,EDGE_DRAG_END:s}});
