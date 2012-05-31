/*
Copyright 2012, KISSY UI Library v1.30dev
MIT Licensed
build time: May 31 22:01
*/
KISSY.add("editor/plugin/removeFormat/index",function(d,b,c){return{init:function(a){c.init(a);a.addButton({title:"清除格式",mode:b.WYSIWYG_MODE,contentCls:"ks-editor-toolbar-removeformat"},{offClick:function(){a.execCommand("removeFormat")}})}}},{requires:["editor","./cmd","../button/"]});
