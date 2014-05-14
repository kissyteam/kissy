/*
Copyright 2014, KISSY v5.0.0
MIT Licensed
build time: May 14 22:20
*/
KISSY.add("editor/plugin/italic",["./font/ui","./italic/cmd","./button","node"],function(g,a){function c(){}var d=a("./font/ui"),e=a("./italic/cmd");a("./button");var f=a("node");c.prototype={pluginRenderUI:function(b){e.init(b);b.addButton("italic",{cmdType:"italic",tooltip:"\u659c\u4f53"},d.Button);b.docReady(function(){b.get("document").on("keydown",function(a){a.ctrlKey&&a.keyCode===f.KeyCode.I&&(b.execCommand("italic"),a.preventDefault())})})}};return c});
