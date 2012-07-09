/*
Copyright 2012, KISSY UI Library v1.40dev
MIT Licensed
build time: Jul 6 13:06
*/
KISSY.add("editor/plugin/multipleUpload/index",function(c,d,e){function a(b){this.config=b||{}}c.augment(a,{renderUI:function(b){var a=this;b.addButton("multipleUpload",{tooltip:"批量插图",listeners:{click:function(){e.useDialog(b,"multipleUpload",a.config)}},mode:d.WYSIWYG_MODE})}});return a},{requires:["editor","../dialogLoader/"]});
