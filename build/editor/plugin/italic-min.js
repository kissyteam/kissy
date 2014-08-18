/*
Copyright 2014, KISSY v1.47
MIT Licensed
build time: May 22 12:22
*/
KISSY.add("editor/plugin/italic",["./font/ui","./italic/cmd","./button"],function(c,a){function d(){}var e=a("./font/ui"),f=a("./italic/cmd");a("./button");c.augment(d,{pluginRenderUI:function(b){f.init(b);b.addButton("italic",{cmdType:"italic",tooltip:"\u659c\u4f53"},e.Button);b.docReady(function(){b.get("document").on("keydown",function(a){a.ctrlKey&&a.keyCode===c.Node.KeyCode.I&&(b.execCommand("italic"),a.preventDefault())})})}});return d});
