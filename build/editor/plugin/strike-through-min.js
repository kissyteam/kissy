/*
Copyright 2013, KISSY UI Library v1.40dev
MIT Licensed
build time: Apr 17 00:20
*/
KISSY.add("editor/plugin/strike-through",function(b,e,c,d){function a(){}b.augment(a,{pluginRenderUI:function(a){d.init(a);a.addButton("strikeThrough",{cmdType:"strikeThrough",tooltip:"\u5220\u9664\u7ebf "},c.Button)}});return a},{requires:["editor","./font/ui","./strike-through/cmd"]});
