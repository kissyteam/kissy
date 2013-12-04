/*
Copyright 2013, KISSY v1.41
MIT Licensed
build time: Dec 4 22:08
*/
KISSY.add("editor/plugin/code",["editor","./button","./dialog-loader"],function(c,a){function b(){}var d=a("editor");a("./button");var e=a("./dialog-loader");c.augment(b,{pluginRenderUI:function(a){a.addButton("code",{tooltip:"\u63d2\u5165\u4ee3\u7801",listeners:{click:function(){e.useDialog(a,"code")}},mode:d.Mode.WYSIWYG_MODE})}});return b});
