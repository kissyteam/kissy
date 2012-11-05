/*
Copyright 2012, KISSY UI Library v1.40dev
MIT Licensed
build time: Nov 5 18:56
*/
KISSY.add("editor/plugin/code/index",function(b,c,d){function a(){}b.augment(a,{renderUI:function(a){a.addButton("code",{tooltip:"插入代码",listeners:{click:function(){d.useDialog(a,"code")}},mode:c.WYSIWYG_MODE})}});return a},{requires:["editor","../dialog-loader/"]});
