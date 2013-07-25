/*
Copyright 2013, KISSY UI Library v1.40dev
MIT Licensed
build time: Jul 25 22:17
*/
KISSY.add("dd/plugin/proxy",function(g,h,i,j){function e(){e.superclass.constructor.apply(this,arguments)}var k=j.DDM,f=".-ks-proxy"+g.now();e.ATTRS={node:{value:function(b){return new h(b.get("node").clone(!0))}},hideNodeOnDrag:{value:!1},destroyOnEnd:{value:!1},moveOnEnd:{value:!0},proxyNode:{}};g.extend(e,i,{pluginId:"dd/plugin/proxy",pluginInitializer:function(b){var c=this,e=c.get("hideNodeOnDrag");b.on("dragstart"+f,function(){var a=c.get("node"),d=b.get("node");c.get("proxyNode")?a=c.get("proxyNode"):
"function"===typeof a&&(a=a(b),a.addClass("ks-dd-proxy"),a.css("position","absolute"),c.set("proxyNode",a));a.show();d.parent().append(a);k.cacheWH(a);a.offset(d.offset());b.setInternal("dragNode",d);b.setInternal("node",a);e&&d.css("visibility","hidden")}).on("dragend"+f,function(){var a=c.get("proxyNode"),d=b.get("dragNode");c.get("moveOnEnd")&&d.offset(a.offset());c.get("destroyOnEnd")?(a.remove(),c.set("proxyNode",0)):a.hide();b.setInternal("node",d);e&&d.css("visibility","")})},pluginDestructor:function(b){b.detach(f)}});
return e},{requires:["node","base","dd"]});
