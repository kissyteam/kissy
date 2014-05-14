/*
Copyright 2014, KISSY v5.0.0
MIT Licensed
build time: May 14 22:16
*/
KISSY.add("dd/plugin/scroll",["util","node","dd","base"],function(s,h){var n=h("util"),r=h("node"),t=h("dd"),u=h("base"),j=t.DDM,v=s.Env.host,k=".-ks-dd-scroll"+n.now(),w=100,o=n.isWindow;return u.extend({pluginId:"dd/plugin/scroll",getRegion:function(a){return o(a[0])?{width:a.width(),height:a.height()}:{width:a.outerWidth(),height:a.outerHeight()}},getOffset:function(a){return o(a[0])?{left:a.scrollLeft(),top:a.scrollTop()}:a.offset()},getScroll:function(a){return{left:a.scrollLeft(),top:a.scrollTop()}},
setScroll:function(a,l){a.scrollLeft(l.left);a.scrollTop(l.top)},pluginDestructor:function(a){a.detach(k)},pluginInitializer:function(a){function l(){if(o(e[0]))return 0;var c=a.mousePos,d=j.region(e);return!j.inRegion(d,c)?(clearTimeout(i),i=0,1):0}function h(){if(!l()){var c=f.getRegion(e),k=c.width,c=c.height,b=f.getScroll(e),j=n.clone(b),m=!1;d.top-c>=-p[1]&&(b.top+=q[1],m=!0);d.top<=p[1]&&(b.top-=q[1],m=!0);d.left-k>=-p[0]&&(b.left+=q[0],m=!0);d.left<=p[0]&&(b.left-=q[0],m=!0);m?(f.setScroll(e,
b),i=setTimeout(h,w),g.fake=!0,o(e[0])&&(b=f.getScroll(e),g.left+=b.left-j.left,g.top+=b.top-j.top),a.get("move")&&a.get("node").offset(g),a.fire("drag",g)):i=null}}var f=this,e=f.get("node"),q=f.get("rate"),p=f.get("diff"),g,d,i=null;a.on("drag"+k,function(c){!c.fake&&!l()&&(g=c,d=n.clone(a.mousePos),c=f.getOffset(e),d.left-=c.left,d.top-=c.top,i||h())});a.on("dragstart"+k,function(){j.cacheWH(e)});a.on("dragend"+k,function(){clearTimeout(i);i=null})}},{ATTRS:{node:{valueFn:function(){return r.one(v)},
setter:function(a){return r.one(a)}},rate:{value:[10,10]},diff:{value:[20,20]}}})});
