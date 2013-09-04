/*
Copyright 2013, KISSY UI Library v1.32
MIT Licensed
build time: Sep 4 17:12
*/
KISSY.add("editor/plugin/italic/index",function(c,g,e,f){function d(){}c.augment(d,{pluginRenderUI:function(a){f.init(a);a.addButton("italic",{cmdType:"italic",tooltip:"\u659c\u4f53 "},e.Button);a.docReady(function(){a.get("document").on("keydown",function(b){b.ctrlKey&&b.keyCode==c.Node.KeyCodes.I&&(a.execCommand("italic"),b.preventDefault())})})}});return d},{requires:["editor","../font/ui","./cmd"]});
