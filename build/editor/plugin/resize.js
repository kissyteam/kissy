/*
Copyright 2014, KISSY v5.0.0
MIT Licensed
build time: Jun 13 11:48
*/
KISSY.add("editor/plugin/resize",["dd","node","util"],function(o,b,p,f){function c(a){this.config=a||{}}var l=b("dd"),m=b("node"),h=b("util");c.prototype={pluginRenderUI:function(a){var b=l.Draggable,c=a.get("statusBarEl"),d=this.config.direction||["x","y"],i="se-resize";1===d.length&&(i="x"===d[0]?"e-resize":"s-resize");var e=m('<div class="'+a.get("prefixCls")+'editor-resizer" style="cursor: '+i+'"></div>').appendTo(c);a.on("maximizeWindow",function(){e.css("display","none")});a.on("restoreWindow",
function(){e.css("display","")});var g=new b({node:e,groups:!1}),j=0,k=0,f=a.get("el"),n=a.get("el");g.on("dragstart",function(){j=f.height();k=n.width();a.fire("resizeStart")});g.on("drag",function(b){h.inArray("y",d)&&a.set("height",j+b.deltaY);h.inArray("x",d)&&a.set("width",k+b.deltaX);a.fire("resize")});a.on("destroy",function(){g.destroy();e.remove()})}};f.exports=c});
