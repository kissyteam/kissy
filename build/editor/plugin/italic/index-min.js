/*
Copyright 2012, KISSY UI Library v1.30rc
MIT Licensed
build time: Jul 11 21:28
*/
KISSY.add("editor/plugin/italic/index",function(c,g,e,f){function d(){}c.augment(d,{renderUI:function(a){f.init(a);a.addButton("italic",{cmdType:"italic",tooltip:"斜体 "},e.Button);a.docReady(function(){a.get("document").on("keydown",function(b){b.ctrlKey&&b.keyCode==c.Node.KeyCodes.I&&(a.execCommand("italic"),b.preventDefault())})})}});return d},{requires:["editor","../font/ui","./cmd"]});
