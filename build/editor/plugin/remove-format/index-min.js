/*
Copyright 2012, KISSY UI Library v1.40dev
MIT Licensed
build time: Sep 24 15:22
*/
KISSY.add("editor/plugin/remove-format/index",function(c,d,e){function b(){}c.augment(b,{renderUI:function(a){e.init(a);a.addButton("removeFormat",{tooltip:"清除格式",listeners:{click:function(){a.execCommand("removeFormat")}},mode:d.WYSIWYG_MODE})}});return b},{requires:["editor","./cmd","../button/"]});
