/*
Copyright 2013, KISSY UI Library v1.40dev
MIT Licensed
build time: Jul 3 13:50
*/
KISSY.add("editor/plugin/code",function(b,c,d){function a(){}b.augment(a,{pluginRenderUI:function(a){a.addButton("code",{tooltip:"\u63d2\u5165\u4ee3\u7801",listeners:{click:function(){d.useDialog(a,"code")}},mode:c.Mode.WYSIWYG_MODE})}});return a},{requires:["editor","./dialog-loader"]});
