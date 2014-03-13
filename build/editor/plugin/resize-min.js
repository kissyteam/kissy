/*
Copyright 2014, KISSY v1.50
MIT Licensed
build time: Mar 13 17:57
*/
KISSY.add("editor/plugin/resize",["dd"],function(c,f){function b(a){this.config=a||{}}var k=f("dd"),l=c.Node;c.augment(b,{pluginRenderUI:function(a){var b=k.Draggable,f=a.get("statusBarEl"),d=this.config.direction||["x","y"],h="se-resize";1===d.length&&(h="x"===d[0]?"e-resize":"s-resize");var e=(new l('<div class="'+a.get("prefixCls")+'editor-resizer" style="cursor: '+h+'"></div>')).appendTo(f);a.on("maximizeWindow",function(){e.css("display","none")});a.on("restoreWindow",function(){e.css("display",
"")});var g=new b({node:e,groups:!1}),i=0,j=0,m=a.get("el"),n=a.get("el");g.on("dragstart",function(){i=m.height();j=n.width();a.fire("resizeStart")});g.on("drag",function(b){c.inArray("y",d)&&a.set("height",i+b.deltaY);c.inArray("x",d)&&a.set("width",j+b.deltaX);a.fire("resize")});a.on("destroy",function(){g.destroy();e.remove()})}});return b});
