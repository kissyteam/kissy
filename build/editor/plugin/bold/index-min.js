/*
Copyright 2013, KISSY UI Library v1.30
MIT Licensed
build time: Feb 17 17:29
*/
KISSY.add("editor/plugin/bold/index",function(c,g,e,f){function d(){}c.augment(d,{pluginRenderUI:function(a){f.init(a);a.addButton("bold",{cmdType:"bold",tooltip:"粗体 "},e.Button);a.docReady(function(){a.get("document").on("keydown",function(b){b.ctrlKey&&b.keyCode==c.Node.KeyCodes.B&&(a.execCommand("bold"),b.preventDefault())})})}});return d},{requires:["editor","../font/ui","./cmd"]});
