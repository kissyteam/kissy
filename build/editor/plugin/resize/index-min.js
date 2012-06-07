/*
Copyright 2012, KISSY UI Library v1.30dev
MIT Licensed
build time: Jun 7 15:13
*/
KISSY.add("editor/plugin/resize/index",function(e,o,i){var j=e.Node;return{init:function(a){var k=i.Draggable,l=a.get("statusBarEl");a.get("textarea");var d=(a.get("pluginConfig").resize||{}).direction||["x","y"],f="se-resize";1==d.length&&(f="x"==d[0]?"e-resize":"s-resize");var b=(new j("<div class='ks-editor-resizer' style='cursor: "+f+"'></div>")).appendTo(l);a.on("maximizeWindow",function(){b.css("display","none")});a.on("restoreWindow",function(){b.css("display","")});var c=new k({node:b}),g=
0,h=0,m=a.get("el"),n=a.get("el");c.on("dragstart",function(){g=m.height();h=n.width();a.fire("resizeStart")});c.on("drag",function(b){var c=b.left-this.startNodePos.left,b=b.top-this.startNodePos.top;e.inArray("y",d)&&a.set("height",g+b);e.inArray("x",d)&&a.set("width",h+c);a.fire("resize")});a.on("destroy",function(){c.destroy();b.remove()})}}},{requires:["editor","dd"]});
