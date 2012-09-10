/*
Copyright 2012, KISSY UI Library v1.30rc
MIT Licensed
build time: Sep 10 22:09
*/
KISSY.add("editor/plugin/remove-format/index",function(c,d,e){function b(){}c.augment(b,{renderUI:function(a){e.init(a);a.addButton("removeFormat",{tooltip:"清除格式",listeners:{click:function(){a.execCommand("removeFormat")}},mode:d.WYSIWYG_MODE})}});return b},{requires:["editor","./cmd","../button/"]});
