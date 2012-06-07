/*
Copyright 2012, KISSY UI Library v1.30dev
MIT Licensed
build time: Jun 8 00:39
*/
KISSY.add("editor/plugin/multipleUpload/index",function(d,b,c){return{init:function(a){a.addButton("multipleUpload",{tooltip:"批量插图",listeners:{click:{fn:function(){c.useDialog(a,"multipleUpload/dialog")}}},mode:b.WYSIWYG_MODE})}}},{requires:["editor","../dialogLoader/"]});
