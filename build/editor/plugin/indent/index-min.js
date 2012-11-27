/*
Copyright 2012, KISSY UI Library v1.40dev
MIT Licensed
build time: Nov 28 02:49
*/
KISSY.add("editor/plugin/indent/index",function(c,d,e){function b(){}c.augment(b,{renderUI:function(a){e.init(a);a.addButton("indent",{tooltip:"增加缩进量 ",listeners:{click:function(){a.execCommand("indent");a.focus()}},mode:d.WYSIWYG_MODE})}});return b},{requires:["editor","./cmd"]});
