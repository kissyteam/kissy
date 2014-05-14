/*
Copyright 2014, KISSY v5.0.0
MIT Licensed
build time: May 14 22:20
*/
KISSY.add("editor/plugin/indent",["editor","./indent/cmd","./button"],function(f,b){function c(){}var d=b("editor"),e=b("./indent/cmd");b("./button");c.prototype={pluginRenderUI:function(a){e.init(a);a.addButton("indent",{tooltip:"\u589e\u52a0\u7f29\u8fdb\u91cf",listeners:{click:function(){a.execCommand("indent");a.focus()}},mode:d.Mode.WYSIWYG_MODE})}};return c});
