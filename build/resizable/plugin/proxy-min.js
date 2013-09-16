/*
Copyright 2013, KISSY v1.40dev
MIT Licensed
build time: Sep 16 15:17
*/
KISSY.add("resizable/plugin/proxy",function(g,h,i){var j=i.all,e=".-ks-proxy"+g.now();return h.extend({pluginId:"resizable/plugin/proxy",pluginInitializer:function(d){var b=this,f=b.get("hideNodeOnResize");d.on("resizeStart"+e,function(){var a=b.get("node"),c=d.get("node");b.get("proxyNode")?a=b.get("proxyNode"):"function"===typeof a&&(a=a(d),b.set("proxyNode",a));a.show();c.parent().append(a);a.css({left:c.css("left"),top:c.css("top"),width:c.width(),height:c.height()});f&&c.css("visibility","hidden")}).on("beforeResize"+
e,function(a){a.preventDefault();b.get("proxyNode").css(a.region)}).on("resizeEnd"+e,function(){var a=b.get("proxyNode"),c=d.get("node");c.css({left:a.css("left"),top:a.css("top"),width:a.width(),height:a.height()});b.get("destroyOnEnd")?(a.remove(),b.set("proxyNode",0)):a.hide();f&&c.css("visibility","")})},pluginDestructor:function(d){d.detach(e)}},{ATTRS:{node:{value:function(d){return j('<div class="'+d.get("prefixCls")+'resizable-proxy"></div>')}},proxyNode:{},hideNodeOnResize:{value:!1},destroyOnEnd:{value:!1}}})},
{requires:["base","node"]});
