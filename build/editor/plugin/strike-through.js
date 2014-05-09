/*
Copyright 2014, KISSY v5.0.0
MIT Licensed
build time: May 9 14:01
*/
KISSY.add("editor/plugin/strike-through",["./font/ui","./strike-through/cmd","./button"],function(c,a){function b(){}var d=a("./font/ui"),e=a("./strike-through/cmd");a("./button");c.augment(b,{pluginRenderUI:function(a){e.init(a);a.addButton("strikeThrough",{cmdType:"strikeThrough",tooltip:"\u5220\u9664\u7ebf"},d.Button)}});return b});
