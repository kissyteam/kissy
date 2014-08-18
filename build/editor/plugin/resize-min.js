/*
Copyright 2014, KISSY v1.47
MIT Licensed
build time: May 22 12:25
*/
KISSY.add("editor/plugin/resize",["dd"],function(d,g){function b(a){this.config=a||{}}var l=g("dd"),m=d.Node;d.augment(b,{pluginRenderUI:function(a){var b=l.Draggable,g=a.get("statusBarEl"),e=this.config.direction||["x","y"],i="se-resize";1===e.length&&(i="x"===e[0]?"e-resize":"s-resize");var c=(new m('<div class="'+a.get("prefixCls")+'editor-resizer" style="cursor: '+i+'"></div>')).appendTo(g);a.on("maximizeWindow",function(){c.css("display","none")});a.on("restoreWindow",function(){c.css("display",
"")});var f=new b({node:c,groups:!1}),j=0,k=0,h,n=a.get("el"),o=a.get("el");f.on("dragstart",function(){j=n.height();k=o.width();a.fire("resizeStart");h=f.get("dragStartMousePos")});f.on("drag",function(b){var c=b.pageX-h.left,b=b.pageY-h.top;d.inArray("y",e)&&a.set("height",j+b);d.inArray("x",e)&&a.set("width",k+c);a.fire("resize")});a.on("destroy",function(){f.destroy();c.remove()})}});return b});
