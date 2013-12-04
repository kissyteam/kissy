/*
Copyright 2013, KISSY v1.41
MIT Licensed
build time: Dec 4 22:10
*/
KISSY.add("editor/plugin/indent",["editor","./indent/cmd","./button"],function(d,b){function c(){}var e=b("editor"),f=b("./indent/cmd");b("./button");d.augment(c,{pluginRenderUI:function(a){f.init(a);a.addButton("indent",{tooltip:"\u589e\u52a0\u7f29\u8fdb\u91cf",listeners:{click:function(){a.execCommand("indent");a.focus()}},mode:e.Mode.WYSIWYG_MODE})}});return c});
