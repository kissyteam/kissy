/*
Copyright 2014, KISSY v1.47
MIT Licensed
build time: May 22 12:30
*/
KISSY.add("resizable/plugin/proxy",["node","base"],function(g,e){var h=e("node"),i=e("base"),j=h.all,f=".-ks-proxy"+g.now();return i.extend({pluginId:"resizable/plugin/proxy",pluginInitializer:function(d){var b=this,e=b.get("hideNodeOnResize");d.on("resizeStart"+f,function(){var a=b.get("node"),c=d.get("node");b.get("proxyNode")?a=b.get("proxyNode"):"function"===typeof a&&(a=a(d),b.set("proxyNode",a));a.show();c.parent().append(a);a.css({left:c.css("left"),top:c.css("top"),width:c.width(),height:c.height()});
e&&c.css("visibility","hidden")}).on("beforeResize"+f,function(a){a.preventDefault();b.get("proxyNode").css(a.region)}).on("resizeEnd"+f,function(){var a=b.get("proxyNode"),c=d.get("node");c.css({left:a.css("left"),top:a.css("top"),width:a.width(),height:a.height()});b.get("destroyOnEnd")?(a.remove(),b.set("proxyNode",0)):a.hide();e&&c.css("visibility","")})},pluginDestructor:function(d){d.detach(f)}},{ATTRS:{node:{value:function(d){return j('<div class="'+d.get("prefixCls")+'resizable-proxy"></div>')}},
proxyNode:{},hideNodeOnResize:{value:!1},destroyOnEnd:{value:!1}}})});
