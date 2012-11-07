/*
Copyright 2012, KISSY UI Library v1.40dev
MIT Licensed
build time: Nov 7 17:20
*/
KISSY.add("dd/proxy",function(f,l,b,g){function e(){e.superclass.constructor.apply(this,arguments);this[h]={}}var h="__proxy_destructors",m=g.DDM,i=f.stamp,j=f.guid("__dd_proxy");e.ATTRS={node:{value:function(a){return new l(a.get("node").clone(!0))}},destroyOnEnd:{value:!1},moveOnEnd:{value:!0},proxyNode:{}};f.extend(e,b,{attachDrag:function(a){function k(){var c=d.get("node"),b=a.get("node");d.get("proxyNode")?c=d.get("proxyNode"):f.isFunction(c)&&(c=c(a),c.addClass("ks-dd-proxy"),c.css("position",
"absolute"),d.set("proxyNode",c));c.show();b.parent().append(c);m.cacheWH(c);c.offset(b.offset());a.setInternal("dragNode",b);a.setInternal("node",c)}function b(){var c=d.get("proxyNode");d.get("moveOnEnd")&&a.get("dragNode").offset(c.offset());d.get("destroyOnEnd")?(c.remove(),d.set("proxyNode",0)):c.hide();a.setInternal("node",a.get("dragNode"))}var d=this,e=d[h],g=i(a,0,j);if(e[g])return d;a.on("dragstart",k);a.on("dragend",b);e[g]={drag:a,fn:function(){a.detach("dragstart",k);a.detach("dragend",
b)}};return d},detachDrag:function(a){var a=i(a,1,j),b=this[h];a&&b[a]&&(b[a].fn(),delete b[a]);return this},destroy:function(){var a=this.get("node"),b=this[h];a&&!f.isFunction(a)&&a.remove();for(var e in b)this.detachDrag(b[e].drag)}});b=e.prototype;b.attach=b.attachDrag;b.unAttach=b.detachDrag;return g.Proxy=e},{requires:["node","base","dd/base"]});
