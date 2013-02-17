/*
Copyright 2013, KISSY UI Library v1.30
MIT Licensed
build time: Feb 17 17:29
*/
KISSY.add("editor/plugin/italic/index",function(c,g,e,f){function d(){}c.augment(d,{pluginRenderUI:function(a){f.init(a);a.addButton("italic",{cmdType:"italic",tooltip:"斜体 "},e.Button);a.docReady(function(){a.get("document").on("keydown",function(b){b.ctrlKey&&b.keyCode==c.Node.KeyCodes.I&&(a.execCommand("italic"),b.preventDefault())})})}});return d},{requires:["editor","../font/ui","./cmd"]});
