/*
Copyright 2012, KISSY UI Library v1.30rc
MIT Licensed
build time: Jun 29 16:29
*/
KISSY.add("editor/plugin/multipleUpload/index",function(c,d,e){function a(b){this.config=b||{}}c.augment(a,{renderUI:function(b){var a=this;b.addButton("multipleUpload",{tooltip:"批量插图",listeners:{click:function(){e.useDialog(b,"multipleUpload",a.config)}},mode:d.WYSIWYG_MODE})}});return a},{requires:["editor","../dialogLoader/"]});
