/*
Copyright 2014, KISSY v1.47
MIT Licensed
build time: May 22 12:18
*/
KISSY.add("dd/plugin/scroll",["node","dd","base"],function(f,j){var m=j("node"),r=j("dd"),s=j("base"),k=r.DDM,t=f.Env.host,l=".-ks-dd-scroll"+f.now(),u=100,o=f.isWindow;return s.extend({pluginId:"dd/plugin/scroll",getRegion:function(a){return o(a[0])?{width:a.width(),height:a.height()}:{width:a.outerWidth(),height:a.outerHeight()}},getOffset:function(a){return o(a[0])?{left:a.scrollLeft(),top:a.scrollTop()}:a.offset()},getScroll:function(a){return{left:a.scrollLeft(),top:a.scrollTop()}},setScroll:function(a,
f){a.scrollLeft(f.left);a.scrollTop(f.top)},pluginDestructor:function(a){a.detach(l)},pluginInitializer:function(a){function j(){if(o(e[0]))return 0;var c=a.mousePos,d=k.region(e);return!k.inRegion(d,c)?(clearTimeout(i),i=0,1):0}function m(){if(!j()){var c=g.getRegion(e),l=c.width,c=c.height,b=g.getScroll(e),k=f.clone(b),n=!1;d.top-c>=-p[1]&&(b.top+=q[1],n=!0);d.top<=p[1]&&(b.top-=q[1],n=!0);d.left-l>=-p[0]&&(b.left+=q[0],n=!0);d.left<=p[0]&&(b.left-=q[0],n=!0);n?(g.setScroll(e,b),i=setTimeout(m,
u),h.fake=!0,o(e[0])&&(b=g.getScroll(e),h.left+=b.left-k.left,h.top+=b.top-k.top),a.get("move")&&a.get("node").offset(h),a.fire("drag",h)):i=null}}var g=this,e=g.get("node"),q=g.get("rate"),p=g.get("diff"),h,d,i=null;a.on("drag"+l,function(c){!c.fake&&!j()&&(h=c,d=f.clone(a.mousePos),c=g.getOffset(e),d.left-=c.left,d.top-=c.top,i||m())});a.on("dragstart"+l,function(){k.cacheWH(e)});a.on("dragend"+l,function(){clearTimeout(i);i=null})}},{ATTRS:{node:{valueFn:function(){return m.one(t)},setter:function(a){return m.one(a)}},
rate:{value:[10,10]},diff:{value:[20,20]}}})});
