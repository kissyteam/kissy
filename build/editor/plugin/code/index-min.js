/*
Copyright 2013, KISSY UI Library v1.30
MIT Licensed
build time: Feb 17 17:29
*/
KISSY.add("editor/plugin/code/index",function(b,c,d){function a(){}b.augment(a,{pluginRenderUI:function(a){a.addButton("code",{tooltip:"插入代码",listeners:{click:function(){d.useDialog(a,"code")}},mode:c.WYSIWYG_MODE})}});return a},{requires:["editor","../dialog-loader/"]});
