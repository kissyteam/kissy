/*
Copyright 2014, KISSY v5.0.0
MIT Licensed
build time: May 14 22:23
*/
KISSY.add("editor/plugin/underline",["./font/ui","./underline/cmd","./button","node"],function(g,a){function c(){}var d=a("./font/ui"),e=a("./underline/cmd");a("./button");var f=a("node");c.prototype={pluginRenderUI:function(b){e.init(b);b.addButton("underline",{cmdType:"underline",tooltip:"\u4e0b\u5212\u7ebf"},d.Button);b.docReady(function(){b.get("document").on("keydown",function(a){a.ctrlKey&&a.keyCode===f.KeyCode.U&&(b.execCommand("underline"),a.preventDefault())})})}};return c});
