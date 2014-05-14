/*
Copyright 2014, KISSY v5.0.0
MIT Licensed
build time: May 14 22:23
*/
KISSY.add("editor/plugin/strike-through",["./font/ui","./strike-through/cmd","./button"],function(e,a){function b(){}var c=a("./font/ui"),d=a("./strike-through/cmd");a("./button");b.prototype={pluginRenderUI:function(a){d.init(a);a.addButton("strikeThrough",{cmdType:"strikeThrough",tooltip:"\u5220\u9664\u7ebf"},c.Button)}};return b});
