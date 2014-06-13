/*
Copyright 2014, KISSY v5.0.0
MIT Licensed
build time: Jun 13 11:48
*/
KISSY.add("editor/plugin/strike-through",["./font/ui","./strike-through/cmd","./button"],function(f,a,g,c){function b(){}var d=a("./font/ui"),e=a("./strike-through/cmd");a("./button");b.prototype={pluginRenderUI:function(a){e.init(a);a.addButton("strikeThrough",{cmdType:"strikeThrough",tooltip:"\u5220\u9664\u7ebf"},d.Button)}};c.exports=b});
