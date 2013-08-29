/*
Copyright 2013, KISSY v1.40dev
MIT Licensed
build time: Aug 30 01:36
*/
KISSY.add("dd/plugin/proxy",function(g,h,i,j){var k=j.DDM,e=".-ks-proxy"+g.now();return i.extend({pluginId:"dd/plugin/proxy",pluginInitializer:function(b){var c=this,f=c.get("hideNodeOnDrag");b.on("dragstart"+e,function(){var a=c.get("node"),d=b.get("node");c.get("proxyNode")?a=c.get("proxyNode"):"function"===typeof a&&(a=a(b),a.addClass("ks-dd-proxy"),c.set("proxyNode",a));a.show();d.parent().append(a);k.cacheWH(a);a.offset(d.offset());b.setInternal("dragNode",d);b.setInternal("node",a);f&&d.css("visibility",
"hidden")}).on("dragend"+e,function(){var a=c.get("proxyNode"),d=b.get("dragNode");c.get("moveOnEnd")&&d.offset(a.offset());c.get("destroyOnEnd")?(a.remove(),c.set("proxyNode",0)):a.hide();b.setInternal("node",d);f&&d.css("visibility","")})},pluginDestructor:function(b){b.detach(e)}},{ATTRS:{node:{value:function(b){return new h(b.get("node").clone(!0))}},hideNodeOnDrag:{value:!1},destroyOnEnd:{value:!1},moveOnEnd:{value:!0},proxyNode:{}}})},{requires:["node","base","dd"]});
