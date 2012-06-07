/*
Copyright 2012, KISSY UI Library v1.30dev
MIT Licensed
build time: Jun 7 15:13
*/
KISSY.add("editor/plugin/multipleUpload/index",function(d,b,c){return{init:function(a){a.addButton("multipleUpload",{tooltip:"批量插图",mode:b.WYSIWYG_MODE},{offClick:function(){c.useDialog(a,"multipleUpload/dialog")}})}}},{requires:["editor","../dialogLoader/"]});
