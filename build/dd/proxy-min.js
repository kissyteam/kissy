/*
Copyright 2012, KISSY UI Library v1.40dev
MIT Licensed
build time: Nov 22 19:06
*/
KISSY.add("dd/proxy",function(f,i,c,h){function e(){e.superclass.constructor.apply(this,arguments)}var j=h.DDM,g=".-ks-proxy"+f.now();e.ATTRS={node:{value:function(a){return new i(a.get("node").clone(!0))}},destroyOnEnd:{value:!1},moveOnEnd:{value:!0},proxyNode:{}};f.extend(e,c,{initializer:function(a){var d=this;a.on("dragstart"+g,function(){var b=d.get("node"),c=a.get("node");d.get("proxyNode")?b=d.get("proxyNode"):f.isFunction(b)&&(b=b(a),b.addClass("ks-dd-proxy"),b.css("position","absolute"),
d.set("proxyNode",b));b.show();c.parent().append(b);j.cacheWH(b);b.offset(c.offset());a.setInternal("dragNode",c);a.setInternal("node",b)}).on("dragend"+g,function(){var b=d.get("proxyNode");d.get("moveOnEnd")&&a.get("dragNode").offset(b.offset());d.get("destroyOnEnd")?(b.remove(),d.set("proxyNode",0)):b.hide();a.setInternal("node",a.get("dragNode"))})},destructor:function(a){a.detach(g)},detachDrag:function(a){this.destructor(a)},attachDrag:function(a){this.initializer(a)},destroy:function(){}});
c=e.prototype;c.attach=c.attachDrag;c.unAttach=c.detachDrag;return h.Proxy=e},{requires:["node","base","dd/base"]});
