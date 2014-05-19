/*
Copyright 2014, KISSY v5.0.0
MIT Licensed
build time: May 19 20:54
*/
KISSY.add("dd/plugin/proxy",["node","dd","base"],function(k,e){var g=e("node"),h=e("dd"),i=e("base"),j=h.DDM,f=".-ks-proxy"+ +new Date;return i.extend({pluginId:"dd/plugin/proxy",pluginInitializer:function(b){var c=this;b.on("dragstart"+f,function(){var a=c.get("node"),d=b.get("node");c.get("proxyNode")?a=c.get("proxyNode"):"function"===typeof a&&(a=a(b),a.addClass("ks-dd-proxy"),c.set("proxyNode",a));a.show();d.parent().append(a);j.cacheWH(a);a.offset(d.offset());b.setInternal("dragNode",d);b.setInternal("node",
a)}).on("dragend"+f,function(){var a=c.get("proxyNode"),d=b.get("dragNode");c.get("moveOnEnd")&&d.offset(a.offset());c.get("destroyOnEnd")?(a.remove(),c.set("proxyNode",0)):a.hide();b.setInternal("node",d)})},pluginDestructor:function(b){b.detach(f)}},{ATTRS:{node:{value:function(b){return new g(b.get("node").clone(!0))}},destroyOnEnd:{value:!1},moveOnEnd:{value:!0},proxyNode:{}}})});
