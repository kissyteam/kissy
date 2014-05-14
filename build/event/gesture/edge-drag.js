/*
Copyright 2014, KISSY v5.0.0
MIT Licensed
build time: May 14 22:25
*/
KISSY.add("event/gesture/edge-drag",["event/gesture/util","event/dom/base","util"],function(u,f){function i(a,c,j){var k=a.lastTouches[0],e=k.pageX,f=k.pageY,g=e-a.startX,h=f-a.startY,l=Math.abs(g),m=Math.abs(h),b=a.direction;b||(b=l>m?0>g?"left":"right":0>h?"up":"down",a.direction=b);var g="up"===b||"down"===b?m:l,i,s,h=c.timeStamp-a.startTime;if(j)if(a.isStarted)j=o;else{var j=p,d=window,l=d.pageXOffset+n,m=d.pageXOffset+d.innerWidth-n,r=d.pageYOffset+n,d=d.pageYOffset+d.innerHeight-n;if("right"===
b&&e>l||"left"===b&&e<m||"down"===b&&f>r||"up"===b&&f<d)return!1;a.isStarted=1;a.startTime=c.timeStamp}else j=q,"left"===b||"right"===b?i=g/h:s=g/h;t.fire(k.target,j,{originalEvent:c.originalEvent,pageX:k.pageX,pageY:k.pageY,which:1,direction:b,distance:g,duration:h/1E3,velocityX:i,velocityY:s})}function c(){}var e=f("event/gesture/util"),r=e.addEvent,t=f("event/dom/base"),e=e.SingleTouch,p="edgeDragStart",o="edgeDrag",q="edgeDragEnd",n=60;f("util").extend(c,e,{requiredGestureType:"touch",start:function(){c.superclass.start.apply(this,
arguments);var a=this.lastTouches[0];this.direction=null;this.startX=a.pageX;this.startY=a.pageY},move:function(a){c.superclass.move.apply(this,arguments);return i(this,a,1)},end:function(a){c.superclass.end.apply(this,arguments);return i(this,a,0)}});r([o,q,p],{handle:new c});return{EDGE_DRAG:o,EDGE_DRAG_START:p,EDGE_DRAG_END:q}});
