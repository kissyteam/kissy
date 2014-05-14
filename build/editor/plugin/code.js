/*
Copyright 2014, KISSY v5.0.0
MIT Licensed
build time: May 14 22:17
*/
KISSY.add("editor/plugin/code",["editor","./button","./dialog-loader"],function(e,a){function b(){}var c=a("editor");a("./button");var d=a("./dialog-loader");b.prototype={pluginRenderUI:function(a){a.addButton("code",{tooltip:"\u63d2\u5165\u4ee3\u7801",listeners:{click:function(){d.useDialog(a,"code")}},mode:c.Mode.WYSIWYG_MODE})}};return b});
