/*
Copyright 2012, KISSY UI Library v1.40dev
MIT Licensed
build time: Dec 7 00:25
*/
KISSY.add("editor/plugin/multiple-upload/index",function(c,d,e){function a(b){this.config=b||{}}c.augment(a,{pluginRenderUI:function(b){var a=this;b.addButton("multipleUpload",{tooltip:"批量插图",listeners:{click:function(){e.useDialog(b,"multiple-upload",a.config)}},mode:d.WYSIWYG_MODE})}});return a},{requires:["editor","../dialog-loader/"]});
