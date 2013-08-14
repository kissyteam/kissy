/*
Copyright 2013, KISSY UI Library v1.40dev
MIT Licensed
build time: Aug 14 23:53
*/
KISSY.add("dd/plugin/scroll",function(f,r,s,l){var j=r.DDM,t=f.Env.host,k=".-ks-dd-scroll"+f.now(),u=100,n=f.isWindow;return s.extend({pluginId:"dd/plugin/scroll",getRegion:function(a){return n(a[0])?{width:a.width(),height:a.height()}:{width:a.outerWidth(),height:a.outerHeight()}},getOffset:function(a){return n(a[0])?{left:a.scrollLeft(),top:a.scrollTop()}:a.offset()},getScroll:function(a){return{left:a.scrollLeft(),top:a.scrollTop()}},setScroll:function(a,f){a.scrollLeft(f.left);a.scrollTop(f.top)},
pluginDestructor:function(a){a.detach(k)},pluginInitializer:function(a){function l(){if(n(e[0]))return 0;var c=a.mousePos,d=j.region(e);return!j.inRegion(d,c)?(clearTimeout(i),i=0,1):0}function q(){if(!l()){var c=g.getRegion(e),k=c.width,c=c.height,b=g.getScroll(e),j=f.clone(b),m=!1;d.top-c>=-o[1]&&(b.top+=p[1],m=!0);d.top<=o[1]&&(b.top-=p[1],m=!0);d.left-k>=-o[0]&&(b.left+=p[0],m=!0);d.left<=o[0]&&(b.left-=p[0],m=!0);m?(g.setScroll(e,b),i=setTimeout(q,u),h.fake=!0,n(e[0])&&(b=g.getScroll(e),h.left+=
b.left-j.left,h.top+=b.top-j.top),a.get("move")&&a.get("node").offset(h),a.fire("drag",h)):i=null}}var g=this,e=g.get("node"),p=g.get("rate"),o=g.get("diff"),h,d,i=null;a.on("drag"+k,function(c){!c.fake&&!l()&&(h=c,d=f.clone(a.mousePos),c=g.getOffset(e),d.left-=c.left,d.top-=c.top,i||q())});a.on("dragstart"+k,function(){j.cacheWH(e)});a.on("dragend"+k,function(){clearTimeout(i);i=null})}},{ATTRS:{node:{valueFn:function(){return l.one(t)},setter:function(a){return l.one(a)}},rate:{value:[10,10]},diff:{value:[20,
20]}}})},{requires:["dd","base","node"]});
