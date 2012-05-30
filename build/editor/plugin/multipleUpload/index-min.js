/*
Copyright 2012, KISSY UI Library v1.30dev
MIT Licensed
build time: May 30 12:21
*/
KISSY.add("editor/plugin/multipleUpload/index",function(d,b,c){return{init:function(a){a.addButton({contentCls:"ke-toolbar-mul-image",title:"批量插图",mode:b.WYSIWYG_MODE},{offClick:function(){c.useDialog(a,"multipleUpload/dialog")}})}}},{requires:["editor","../dialogLoader/"]});
