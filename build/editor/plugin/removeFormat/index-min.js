/*
Copyright 2012, KISSY UI Library v1.30dev
MIT Licensed
build time: Jun 7 00:48
*/
KISSY.add("editor/plugin/removeFormat/index",function(d,b,c){return{init:function(a){c.init(a);a.addButton("removeFormat",{tooltip:"清除格式",mode:b.WYSIWYG_MODE},{offClick:function(){a.execCommand("removeFormat")}})}}},{requires:["editor","./cmd","../button/"]});
