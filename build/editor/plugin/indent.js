/*
Copyright 2014, KISSY v5.0.0
MIT Licensed
build time: Jun 13 11:46
*/
KISSY.add("editor/plugin/indent",["editor","./indent/cmd","./button"],function(g,b,h,d){function c(){}var e=b("editor"),f=b("./indent/cmd");b("./button");c.prototype={pluginRenderUI:function(a){f.init(a);a.addButton("indent",{tooltip:"\u589e\u52a0\u7f29\u8fdb\u91cf",listeners:{click:function(){a.execCommand("indent");a.focus()}},mode:e.Mode.WYSIWYG_MODE})}};d.exports=c});
