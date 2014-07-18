/*
Copyright 2014, KISSY v5.0.0
MIT Licensed
build time: Jul 18 14:02
*/
KISSY.add("event/gesture/edge-pan",["event/gesture/util","event/dom/base","util"],function(i,f,d,o){function j(a,d,c){var k=a.lastTouches[0],f=k.pageX,p=k.pageY,g=f-a.startX,h=p-a.startY,l=Math.abs(g),m=Math.abs(h),b=a.direction;b||(b=l>m?0>g?"left":"right":0>h?"up":"down",a.direction=b);var g="up"===b||"down"===b?m:l,i,j,h=d.timeStamp-a.startTime;if(c)if(a.isStarted)c=q;else{var c=r,e=window,l=e.pageXOffset+n,m=e.pageXOffset+e.innerWidth-n,o=e.pageYOffset+n,e=e.pageYOffset+e.innerHeight-n;if("right"===
b&&f>l||"left"===b&&f<m||"down"===b&&p>o||"up"===b&&p<e)return!1;a.isStarted=1;a.startTime=d.timeStamp}else c=s,"left"===b||"right"===b?i=g/h:j=g/h;t.fire(k.target,c,{originalEvent:d.originalEvent,pageX:k.pageX,pageY:k.pageY,which:1,direction:b,distance:g,duration:h/1E3,velocityX:i,velocityY:j})}function c(){}var d=f("event/gesture/util"),i=d.addEvent,t=f("event/dom/base"),d=d.SingleTouch,r="edgePanStart",q="edgePan",s="edgePanEnd",n=60;f("util").extend(c,d,{requiredGestureType:"touch",start:function(){c.superclass.start.apply(this,
arguments);var a=this.lastTouches[0];this.direction=null;this.startX=a.pageX;this.startY=a.pageY},move:function(a){c.superclass.move.apply(this,arguments);return j(this,a,1)},end:function(a){c.superclass.end.apply(this,arguments);return j(this,a,0)}});i([q,s,r],{handle:new c});o.exports={EDGE_PAN:q,EDGE_PAN_START:r,EDGE_PAN_END:s}});
