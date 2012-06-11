/*
Copyright 2012, KISSY UI Library v1.30dev
MIT Licensed
build time: Jun 11 20:22
*/
KISSY.add("editor/plugin/indent/index",function(d,b,c){return{init:function(a){c.init(a);a.addButton("indent",{tooltip:"增加缩进量 ",listeners:{click:function(){a.execCommand("indent");a.focus()}},mode:b.WYSIWYG_MODE})}}},{requires:["editor","./cmd"]});
