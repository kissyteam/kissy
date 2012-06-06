/*
Copyright 2012, KISSY UI Library v1.30dev
MIT Licensed
build time: Jun 5 21:37
*/
KISSY.add("editor/plugin/indent/index",function(d,b,c){return{init:function(a){c.init(a);a.addButton({title:"增加缩进量 ",mode:b.WYSIWYG_MODE,contentCls:"ks-editor-toolbar-indent"},{offClick:function(){a.execCommand("indent")}})}}},{requires:["editor","./cmd"]});
