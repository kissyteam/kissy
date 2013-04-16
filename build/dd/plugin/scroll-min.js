/*
Copyright 2013, KISSY UI Library v1.40dev
MIT Licensed
build time: Apr 17 00:15
*/
KISSY.add("dd/plugin/scroll",function(d,s,t,r,i){function j(){j.superclass.constructor.apply(this,arguments)}var l=s.DDM,u=d.Env.host,m=".-ks-dd-scroll"+d.now(),v=100;j.ATTRS={node:{valueFn:function(){return r.one(u)},setter:function(a){return r.one(a)}},rate:{value:[10,10]},diff:{value:[20,20]}};var o=d.isWindow;d.extend(j,t,{pluginId:"dd/plugin/scroll",getRegion:function(a){return o(a[0])?{width:i.viewportWidth(),height:i.viewportHeight()}:{width:a.outerWidth(),height:a.outerHeight()}},getOffset:function(a){return o(a[0])?
{left:i.scrollLeft(),top:i.scrollTop()}:a.offset()},getScroll:function(a){return{left:a.scrollLeft(),top:a.scrollTop()}},setScroll:function(a,d){a.scrollLeft(d.left);a.scrollTop(d.top)},pluginDestructor:function(a){a.detach(m)},pluginInitializer:function(a){function i(){if(o(e[0]))return 0;var c=a.mousePos,d=l.region(e);return!l.inRegion(d,c)?(clearTimeout(k),k=0,1):0}function j(){if(!i()){var c=g.getRegion(e),m=c.width,c=c.height,b=g.getScroll(e),l=d.clone(b),n=!1;f.top-c>=-p[1]&&(b.top+=q[1],n=
!0);f.top<=p[1]&&(b.top-=q[1],n=!0);f.left-m>=-p[0]&&(b.left+=q[0],n=!0);f.left<=p[0]&&(b.left-=q[0],n=!0);n?(g.setScroll(e,b),k=setTimeout(j,v),h.fake=!0,o(e[0])&&(b=g.getScroll(e),h.left+=b.left-l.left,h.top+=b.top-l.top),a.get("move")&&a.get("node").offset(h),a.fire("drag",h)):k=null}}var g=this,e=g.get("node"),q=g.get("rate"),p=g.get("diff"),h,f,k=null;a.on("drag"+m,function(c){!c.fake&&!i()&&(h=c,f=d.clone(a.mousePos),c=g.getOffset(e),f.left-=c.left,f.top-=c.top,k||j())});a.on("dragstart"+m,
function(){l.cacheWH(e)});a.on("dragend"+m,function(){clearTimeout(k);k=null})}});return j},{requires:["dd/base","base","node","dom"]});
