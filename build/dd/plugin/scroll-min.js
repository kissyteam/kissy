/*
Copyright 2013, KISSY UI Library v1.40dev
MIT Licensed
build time: Jun 27 03:33
*/
KISSY.add("dd/plugin/scroll",function(d,s,t,k){function i(){i.superclass.constructor.apply(this,arguments)}var l=s.DDM,r=d.Env.host;k.all(r);var m=".-ks-dd-scroll"+d.now(),u=100;i.ATTRS={node:{valueFn:function(){return k.one(r)},setter:function(a){return k.one(a)}},rate:{value:[10,10]},diff:{value:[20,20]}};var o=d.isWindow;d.extend(i,t,{pluginId:"dd/plugin/scroll",getRegion:function(a){return o(a[0])?{width:a.width(),height:a.height()}:{width:a.outerWidth(),height:a.outerHeight()}},getOffset:function(a){return o(a[0])?
{left:a.scrollLeft(),top:a.scrollTop()}:a.offset()},getScroll:function(a){return{left:a.scrollLeft(),top:a.scrollTop()}},setScroll:function(a,d){a.scrollLeft(d.left);a.scrollTop(d.top)},pluginDestructor:function(a){a.detach(m)},pluginInitializer:function(a){function i(){if(o(e[0]))return 0;var c=a.mousePos,d=l.region(e);return!l.inRegion(d,c)?(clearTimeout(j),j=0,1):0}function k(){if(!i()){var c=g.getRegion(e),m=c.width,c=c.height,b=g.getScroll(e),l=d.clone(b),n=!1;f.top-c>=-p[1]&&(b.top+=q[1],n=
!0);f.top<=p[1]&&(b.top-=q[1],n=!0);f.left-m>=-p[0]&&(b.left+=q[0],n=!0);f.left<=p[0]&&(b.left-=q[0],n=!0);n?(g.setScroll(e,b),j=setTimeout(k,u),h.fake=!0,o(e[0])&&(b=g.getScroll(e),h.left+=b.left-l.left,h.top+=b.top-l.top),a.get("move")&&a.get("node").offset(h),a.fire("drag",h)):j=null}}var g=this,e=g.get("node"),q=g.get("rate"),p=g.get("diff"),h,f,j=null;a.on("drag"+m,function(c){!c.fake&&!i()&&(h=c,f=d.clone(a.mousePos),c=g.getOffset(e),f.left-=c.left,f.top-=c.top,j||k())});a.on("dragstart"+m,
function(){l.cacheWH(e)});a.on("dragend"+m,function(){clearTimeout(j);j=null})}});return i},{requires:["dd","base","node"]});
