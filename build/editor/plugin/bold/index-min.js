/*
Copyright 2012, KISSY UI Library v1.30dev
MIT Licensed
build time: Jun 28 20:23
*/
KISSY.add("editor/plugin/bold/index",function(b,e,c,d){function a(){}b.augment(a,{renderUI:function(a){d.init(a);a.addButton("bold",{cmdType:"bold",tooltip:"粗体 "},c.Button)}});return a},{requires:["editor","../font/ui","./cmd"]});
