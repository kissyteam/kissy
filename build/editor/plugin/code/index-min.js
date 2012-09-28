/*
Copyright 2012, KISSY UI Library v1.30rc
MIT Licensed
build time: Sep 28 16:36
*/
KISSY.add("editor/plugin/code/index",function(b,c,d){function a(){}b.augment(a,{renderUI:function(a){a.addButton("code",{tooltip:"插入代码",listeners:{click:function(){d.useDialog(a,"code")}},mode:c.WYSIWYG_MODE})}});return a},{requires:["editor","../dialog-loader/"]});
