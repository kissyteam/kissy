/*
Copyright 2012, KISSY UI Library v1.30rc
MIT Licensed
build time: Jul 10 10:47
*/
KISSY.add("editor/plugin/strikeThrough/index",function(b,e,c,d){function a(){}b.augment(a,{renderUI:function(a){d.init(a);a.addButton("strikeThrough",{cmdType:"strikeThrough",tooltip:"删除线 "},c.Button)}});return a},{requires:["editor","../font/ui","./cmd"]});
