/*
Copyright 2013, KISSY v1.40dev
MIT Licensed
build time: Sep 17 23:05
*/
KISSY.add("editor/plugin/strike-through",function(b,e,c,d){function a(){}b.augment(a,{pluginRenderUI:function(a){d.init(a);a.addButton("strikeThrough",{cmdType:"strikeThrough",tooltip:"\u5220\u9664\u7ebf "},c.Button)}});return a},{requires:["editor","./font/ui","./strike-through/cmd"]});
