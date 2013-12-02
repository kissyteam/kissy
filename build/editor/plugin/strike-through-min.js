/*
Copyright 2013, KISSY v1.50dev
MIT Licensed
build time: Dec 2 15:20
*/
KISSY.add("editor/plugin/strike-through",["./font/ui","./strike-through/cmd","./button"],function(c,a){function b(){}var d=a("./font/ui"),e=a("./strike-through/cmd");a("./button");c.augment(b,{pluginRenderUI:function(a){e.init(a);a.addButton("strikeThrough",{cmdType:"strikeThrough",tooltip:"\u5220\u9664\u7ebf"},d.Button)}});return b});
