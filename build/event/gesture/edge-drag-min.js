/*
Copyright 2014, KISSY v5.0.0
MIT Licensed
build time: Apr 14 14:16
*/
KISSY.add("event/gesture/edge-drag",["event/gesture/util","event/dom/base"],function(t,h){function i(a,c,j){var e=a.lastTouches[0],o=e.pageX,p=e.pageY,f=o-a.startX,g=p-a.startY,k=Math.abs(f),l=Math.abs(g),b=a.direction;b||(b=k>l?0>f?"left":"right":0>g?"up":"down",a.direction=b);var f="up"===b||"down"===b?l:k,h,i,g=c.timeStamp-a.startTime;if(j)if(a.isStarted)j=q;else{var j=r,d=window,k=d.pageXOffset+m,l=d.pageXOffset+d.innerWidth-m,n=d.pageYOffset+m,d=d.pageYOffset+d.innerHeight-m;if("right"===b&&
o>k||"left"===b&&o<l||"down"===b&&p>n||"up"===b&&p<d)return!1;a.isStarted=1;a.startTime=c.timeStamp}else j=s,"left"===b||"right"===b?h=f/g:i=f/g;u.fire(e.target,j,{originalEvent:c.originalEvent,pageX:e.pageX,pageY:e.pageY,which:1,touch:e,direction:b,distance:f,duration:g/1E3,velocityX:h,velocityY:i})}function c(){}var n=h("event/gesture/util"),v=n.addEvent,u=h("event/dom/base"),r="edgeDragStart",q="edgeDrag",s="edgeDragEnd",m=60;t.extend(c,n.SingleTouch,{requiredGestureType:"touch",start:function(){c.superclass.start.apply(this,
arguments);var a=this.lastTouches[0];this.direction=null;this.startX=a.pageX;this.startY=a.pageY},move:function(a){c.superclass.move.apply(this,arguments);return i(this,a,1)},end:function(a){c.superclass.end.apply(this,arguments);return i(this,a,0)}});v([q,s,r],{handle:new c});return{EDGE_DRAG:q,EDGE_DRAG_START:r,EDGE_DRAG_END:s}});
