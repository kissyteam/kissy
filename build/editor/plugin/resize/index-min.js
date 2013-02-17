/*
Copyright 2013, KISSY UI Library v1.30
MIT Licensed
build time: Feb 17 17:29
*/
KISSY.add("editor/plugin/resize/index",function(d,o,j){function b(a){this.config=a||{}}var k=d.Node;d.augment(b,{pluginRenderUI:function(a){var b=j.Draggable,l=a.get("statusBarEl");a.get("textarea");var e=this.config.direction||["x","y"],g="se-resize";1==e.length&&(g="x"==e[0]?"e-resize":"s-resize");var c=(new k("<div class='"+a.get("prefixCls")+"editor-resizer' style='cursor: "+g+"'></div>")).appendTo(l);a.on("maximizeWindow",function(){c.css("display","none")});a.on("restoreWindow",function(){c.css("display",
"")});var f=new b({node:c}),h=0,i=0,m=a.get("el"),n=a.get("el");f.on("dragstart",function(){h=m.height();i=n.width();a.fire("resizeStart")});f.on("drag",function(b){var c=b.left-this.get("startNodePos").left,b=b.top-this.get("startNodePos").top;d.inArray("y",e)&&a.set("height",h+b);d.inArray("x",e)&&a.set("width",i+c);a.fire("resize")});a.on("destroy",function(){f.destroy();c.remove()})}});return b},{requires:["editor","dd/base"]});
