/*
Copyright 2012, KISSY UI Library v1.30rc
MIT Licensed
build time: Aug 22 22:20
*/
KISSY.add("editor/plugin/multiple-upload/index",function(c,d,e){function a(b){this.config=b||{}}c.augment(a,{renderUI:function(b){var a=this;b.addButton("multipleUpload",{tooltip:"批量插图",listeners:{click:function(){e.useDialog(b,"multiple-upload",a.config)}},mode:d.WYSIWYG_MODE})}});return a},{requires:["editor","../dialog-loader/"]});
