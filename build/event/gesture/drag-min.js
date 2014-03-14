/*
Copyright 2014, KISSY v1.50
MIT Licensed
build time: Mar 14 15:42
*/
KISSY.add("event/gesture/drag",["event/gesture/base","event/dom/base"],function(m,j){function k(b,c){var a=b.lastTouches[0],d=c.timeStamp;d-b.lastTime>n&&(b.lastPos={pageX:a.pageX,pageY:a.pageY},b.lastTime=d)}function h(b,c,a){var d=b.startPos,a=a||{},e=b.lastTouches[0];a.pageX=e.pageX;a.pageY=e.pageY;a.originalEvent=c.originalEvent;a.deltaX=e.pageX-d.pageX;a.deltaY=e.pageY-d.pageY;a.startTime=b.startTime;a.startPos=b.startPos;a.touch=e;a.gestureType=c.gestureType;return a}function f(){}var l=j("event/gesture/base"),
o=l.addEvent,i=j("event/dom/base"),n=300,g=document;m.extend(f,l.SingleTouch,{start:function(){f.superclass.start.apply(this,arguments);var b=this.lastTouches[0];this.lastTime=this.startTime;this.dragTarget=b.target;this.startPos=this.lastPos={pageX:b.pageX,pageY:b.pageY}},move:function(b){f.superclass.move.apply(this,arguments);if(this.isStarted)k(this,b),i.fire(this.dragTarget,"gestureDrag",h(this,b));else{var c=b,a=this.lastTouches[0],d=this.startPos,e=a.pageX-d.pageX,a=a.pageY-d.pageY;3<Math.sqrt(e*
e+a*a)&&(this.isStarted?k(this,c):(g.body.setCapture&&g.body.setCapture(),this.isStarted=!0),i.fire(this.dragTarget,"gestureDragStart",h(this,c)))}},end:function(b){var c=this.lastTouches[0],a=b.timeStamp;i.fire(this.dragTarget,"gestureDragEnd",h(this,b,{velocityX:(c.pageX-this.lastPos.pageX)/(a-this.lastTime)||0,velocityY:(c.pageY-this.lastPos.pageY)/(a-this.lastTime)||0}));g.body.releaseCapture&&g.body.releaseCapture()}});o(["gestureDragStart","gestureDrag","gestureDragEnd"],{handle:new f});return{DRAG_START:"gestureDragStart",
DRAG:"gestureDrag",DRAG_END:"gestureDragEnd"}});
