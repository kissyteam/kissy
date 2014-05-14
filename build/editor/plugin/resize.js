/*
Copyright 2014, KISSY v5.0.0
MIT Licensed
build time: May 14 22:22
*/
KISSY.add("editor/plugin/resize",["dd","node","util"],function(o,b){function c(a){this.config=a||{}}var k=b("dd"),l=b("node"),g=b("util");c.prototype={pluginRenderUI:function(a){var b=k.Draggable,c=a.get("statusBarEl"),d=this.config.direction||["x","y"],h="se-resize";1===d.length&&(h="x"===d[0]?"e-resize":"s-resize");var e=(new l('<div class="'+a.get("prefixCls")+'editor-resizer" style="cursor: '+h+'"></div>')).appendTo(c);a.on("maximizeWindow",function(){e.css("display","none")});a.on("restoreWindow",
function(){e.css("display","")});var f=new b({node:e,groups:!1}),i=0,j=0,m=a.get("el"),n=a.get("el");f.on("dragstart",function(){i=m.height();j=n.width();a.fire("resizeStart")});f.on("drag",function(b){g.inArray("y",d)&&a.set("height",i+b.deltaY);g.inArray("x",d)&&a.set("width",j+b.deltaX);a.fire("resize")});a.on("destroy",function(){f.destroy();e.remove()})}};return c});
