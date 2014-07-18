/*
Copyright 2014, KISSY v5.0.0
MIT Licensed
build time: Jul 18 13:55
*/
KISSY.add("dd/plugin/scroll",["util","node","dd","base"],function(l,c,v,s){var n=c("util"),r=c("node"),l=c("dd"),c=c("base"),j=l.DDM,t=window,k=".-ks-dd-scroll"+n.now(),u=100,o=n.isWindow;s.exports=c.extend({pluginId:"dd/plugin/scroll",getRegion:function(a){return o(a[0])?{width:a.width(),height:a.height()}:{width:a.outerWidth(),height:a.outerHeight()}},getOffset:function(a){return o(a[0])?{left:a.scrollLeft(),top:a.scrollTop()}:a.offset()},getScroll:function(a){return{left:a.scrollLeft(),top:a.scrollTop()}},
setScroll:function(a,c){a.scrollLeft(c.left);a.scrollTop(c.top)},pluginDestructor:function(a){a.detach(k)},pluginInitializer:function(a){function c(){if(o(f[0]))return 0;var d=a.mousePos,e=j.region(f);return!j.inRegion(e,d)?(clearTimeout(i),i=0,1):0}function l(){if(!c()){var d=g.getRegion(f),k=d.width,d=d.height,b=g.getScroll(f),j=n.clone(b),m=!1;e.top-d>=-p[1]&&(b.top+=q[1],m=!0);e.top<=p[1]&&(b.top-=q[1],m=!0);e.left-k>=-p[0]&&(b.left+=q[0],m=!0);e.left<=p[0]&&(b.left-=q[0],m=!0);m?(g.setScroll(f,
b),i=setTimeout(l,u),h.fake=!0,o(f[0])&&(b=g.getScroll(f),h.left+=b.left-j.left,h.top+=b.top-j.top),a.get("move")&&a.get("node").offset(h),a.fire("drag",h)):i=null}}var g=this,f=g.get("node"),q=g.get("rate"),p=g.get("diff"),h,e,i=null;a.on("drag"+k,function(d){!d.fake&&!c()&&(h=d,e=n.clone(a.mousePos),d=g.getOffset(f),e.left-=d.left,e.top-=d.top,i||l())});a.on("dragstart"+k,function(){j.cacheWH(f)});a.on("dragend"+k,function(){clearTimeout(i);i=null})}},{ATTRS:{node:{valueFn:function(){return r(t)},
setter:function(a){return r(a)}},rate:{value:[10,10]},diff:{value:[20,20]}}})});
