/*
Copyright 2013, KISSY UI Library v1.40dev
MIT Licensed
build time: Mar 11 10:34
*/
KISSY.add("editor/plugin/resize/index",function(d,p,k){function c(a){this.config=a||{}}var l=d.Node;d.augment(c,{pluginRenderUI:function(a){var c=k.Draggable,m=a.get("statusBarEl");a.get("textarea");var e=this.config.direction||["x","y"],h="se-resize";1==e.length&&(h="x"==e[0]?"e-resize":"s-resize");var b=(new l("<div class='"+a.get("prefixCls")+"editor-resizer' style='cursor: "+h+"'></div>")).appendTo(m);a.on("maximizeWindow",function(){b.css("display","none")});a.on("restoreWindow",function(){b.css("display",
"")});var f=new c({node:b,groups:!1}),i=0,j=0,g,n=a.get("el"),o=a.get("el");f.on("dragstart",function(){i=n.height();j=o.width();a.fire("resizeStart");g=b.offset()});f.on("drag",function(b){var c=b.left-g.left,b=b.top-g.top;d.inArray("y",e)&&a.set("height",i+b);d.inArray("x",e)&&a.set("width",j+c);a.fire("resize")});a.on("destroy",function(){f.destroy();b.remove()})}});return c},{requires:["editor","dd/base"]});
