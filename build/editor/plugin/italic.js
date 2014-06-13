/*
Copyright 2014, KISSY v5.0.0
MIT Licensed
build time: Jun 13 11:46
*/
KISSY.add("editor/plugin/italic",["./font/ui","./italic/cmd","./button","node"],function(h,a,i,d){function c(){}var e=a("./font/ui"),f=a("./italic/cmd");a("./button");var g=a("node");c.prototype={pluginRenderUI:function(b){f.init(b);b.addButton("italic",{cmdType:"italic",tooltip:"\u659c\u4f53"},e.Button);b.docReady(function(){b.get("document").on("keydown",function(a){a.ctrlKey&&a.keyCode===g.Event.KeyCode.I&&(b.execCommand("italic"),a.preventDefault())})})}};d.exports=c});
