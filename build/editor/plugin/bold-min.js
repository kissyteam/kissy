/*
Copyright 2014, KISSY v1.47
MIT Licensed
build time: May 22 12:19
*/
KISSY.add("editor/plugin/bold",["./font/ui","./bold/cmd","./button"],function(c,a){function d(){}var e=a("./font/ui"),f=a("./bold/cmd");a("./button");c.augment(d,{pluginRenderUI:function(b){f.init(b);b.addButton("bold",{cmdType:"bold",tooltip:"\u7c97\u4f53"},e.Button);b.docReady(function(){b.get("document").on("keydown",function(a){a.ctrlKey&&a.keyCode===c.Node.KeyCode.B&&(b.execCommand("bold"),a.preventDefault())})})}});return d});
