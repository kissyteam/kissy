/*
Copyright 2014, KISSY v5.0.0
MIT Licensed
build time: May 14 22:17
*/
KISSY.add("editor/plugin/bold",["./font/ui","./bold/cmd","node","./button"],function(g,a){function c(){}var d=a("./font/ui"),e=a("./bold/cmd"),f=a("node");a("./button");c.prototype={pluginRenderUI:function(b){e.init(b);b.addButton("bold",{cmdType:"bold",tooltip:"\u7c97\u4f53"},d.Button);b.docReady(function(){b.get("document").on("keydown",function(a){a.ctrlKey&&a.keyCode===f.KeyCode.B&&(b.execCommand("bold"),a.preventDefault())})})}};return c});
