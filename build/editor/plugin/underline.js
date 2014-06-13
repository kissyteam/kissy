/*
Copyright 2014, KISSY v5.0.0
MIT Licensed
build time: Jun 13 11:49
*/
KISSY.add("editor/plugin/underline",["./font/ui","./underline/cmd","./button","node"],function(h,a,i,d){function c(){}var e=a("./font/ui"),f=a("./underline/cmd");a("./button");var g=a("node");c.prototype={pluginRenderUI:function(b){f.init(b);b.addButton("underline",{cmdType:"underline",tooltip:"\u4e0b\u5212\u7ebf"},e.Button);b.docReady(function(){b.get("document").on("keydown",function(a){a.ctrlKey&&a.keyCode===g.Event.KeyCode.U&&(b.execCommand("underline"),a.preventDefault())})})}};d.exports=c});
