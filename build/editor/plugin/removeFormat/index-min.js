/*
Copyright 2012, KISSY UI Library v1.30dev
MIT Licensed
build time: May 28 19:44
*/
KISSY.add("editor/plugin/removeFormat/index",function(d,b,c){return{init:function(a){c.init(a);a.addButton({title:"清除格式",mode:b.WYSIWYG_MODE,contentCls:"ke-toolbar-removeformat"},{offClick:function(){a.execCommand("removeFormat")}})}}},{requires:["editor","./cmd","../button/"]});
