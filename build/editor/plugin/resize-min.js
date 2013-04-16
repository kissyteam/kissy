/*
Copyright 2013, KISSY UI Library v1.40dev
MIT Licensed
build time: Apr 17 00:20
*/
KISSY.add("editor/plugin/resize",function(d,p,k){function b(a){this.config=a||{}}var l=d.Node;d.augment(b,{pluginRenderUI:function(a){var b=k.Draggable,m=a.get("statusBarEl");a.get("textarea");var e=this.config.direction||["x","y"],h="se-resize";1==e.length&&(h="x"==e[0]?"e-resize":"s-resize");var c=(new l("<div class='"+a.get("prefixCls")+"editor-resizer' style='cursor: "+h+"'></div>")).appendTo(m);a.on("maximizeWindow",function(){c.css("display","none")});a.on("restoreWindow",function(){c.css("display",
"")});var f=new b({node:c,groups:!1}),i=0,j=0,g,n=a.get("el"),o=a.get("el");f.on("dragstart",function(){i=n.height();j=o.width();a.fire("resizeStart");g=f.get("dragStartMousePos")});f.on("drag",function(b){var c=b.pageX-g.left,b=b.pageY-g.top;d.inArray("y",e)&&a.set("height",i+b);d.inArray("x",e)&&a.set("width",j+c);a.fire("resize")});a.on("destroy",function(){f.destroy();c.remove()})}});return b},{requires:["editor","dd/base"]});
