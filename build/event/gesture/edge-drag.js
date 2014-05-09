/*
Copyright 2014, KISSY v5.0.0
MIT Licensed
build time: May 9 14:04
*/
KISSY.add("event/gesture/edge-drag",["event/gesture/util","event/dom/base"],function(t,g){function h(a,c,i){var j=a.lastTouches[0],o=j.pageX,p=j.pageY,e=o-a.startX,f=p-a.startY,k=Math.abs(e),l=Math.abs(f),b=a.direction;b||(b=k>l?0>e?"left":"right":0>f?"up":"down",a.direction=b);var e="up"===b||"down"===b?l:k,g,h,f=c.timeStamp-a.startTime;if(i)if(a.isStarted)i=q;else{var i=r,d=window,k=d.pageXOffset+m,l=d.pageXOffset+d.innerWidth-m,n=d.pageYOffset+m,d=d.pageYOffset+d.innerHeight-m;if("right"===b&&
o>k||"left"===b&&o<l||"down"===b&&p>n||"up"===b&&p<d)return!1;a.isStarted=1;a.startTime=c.timeStamp}else i=s,"left"===b||"right"===b?g=e/f:h=e/f;u.fire(j.target,i,{originalEvent:c.originalEvent,pageX:j.pageX,pageY:j.pageY,which:1,direction:b,distance:e,duration:f/1E3,velocityX:g,velocityY:h})}function c(){}var n=g("event/gesture/util"),v=n.addEvent,u=g("event/dom/base"),r="edgeDragStart",q="edgeDrag",s="edgeDragEnd",m=60;t.extend(c,n.SingleTouch,{requiredGestureType:"touch",start:function(){c.superclass.start.apply(this,
arguments);var a=this.lastTouches[0];this.direction=null;this.startX=a.pageX;this.startY=a.pageY},move:function(a){c.superclass.move.apply(this,arguments);return h(this,a,1)},end:function(a){c.superclass.end.apply(this,arguments);return h(this,a,0)}});v([q,s,r],{handle:new c});return{EDGE_DRAG:q,EDGE_DRAG_START:r,EDGE_DRAG_END:s}});
