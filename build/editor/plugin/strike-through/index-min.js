/*
Copyright 2012, KISSY UI Library v1.30rc
MIT Licensed
build time: Oct 9 23:22
*/
KISSY.add("editor/plugin/strike-through/index",function(b,e,c,d){function a(){}b.augment(a,{renderUI:function(a){d.init(a);a.addButton("strikeThrough",{cmdType:"strikeThrough",tooltip:"删除线 "},c.Button)}});return a},{requires:["editor","../font/ui","./cmd"]});
