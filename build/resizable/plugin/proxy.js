/*
Copyright 2014, KISSY v5.0.0
MIT Licensed
build time: Jul 18 14:04
*/
KISSY.add("resizable/plugin/proxy",["base","node"],function(e,g,j,h){var e=g("base"),i=g("node"),f=".-ks-proxy"+ +new Date;h.exports=e.extend({pluginId:"resizable/plugin/proxy",pluginInitializer:function(d){var b=this,e=b.get("hideNodeOnResize");d.on("resizeStart"+f,function(){var a=b.get("node"),c=d.get("node");b.get("proxyNode")?a=b.get("proxyNode"):"function"===typeof a&&(a=a(d),b.set("proxyNode",a));a.show();c.parent().append(a);a.css({left:c.css("left"),top:c.css("top"),width:c.width(),height:c.height()});
e&&c.css("visibility","hidden")}).on("beforeResize"+f,function(a){a.preventDefault();b.get("proxyNode").css(a.region)}).on("resizeEnd"+f,function(){var a=b.get("proxyNode"),c=d.get("node");c.css({left:a.css("left"),top:a.css("top"),width:a.width(),height:a.height()});b.get("destroyOnEnd")?(a.remove(),b.set("proxyNode",0)):a.hide();e&&c.css("visibility","")})},pluginDestructor:function(d){d.detach(f)}},{ATTRS:{node:{value:function(d){return i('<div class="'+d.get("prefixCls")+'resizable-proxy"></div>')}},
proxyNode:{},hideNodeOnResize:{value:!1},destroyOnEnd:{value:!1}}})});
