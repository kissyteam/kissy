/*
Copyright 2012, KISSY UI Library v1.40dev
MIT Licensed
build time: Jul 6 13:06
*/
KISSY.add("editor/plugin/removeFormat/index",function(c,d,e){function b(){}c.augment(b,{renderUI:function(a){e.init(a);a.addButton("removeFormat",{tooltip:"清除格式",listeners:{click:function(){a.execCommand("removeFormat")}},mode:d.WYSIWYG_MODE})}});return b},{requires:["editor","./cmd","../button/"]});
