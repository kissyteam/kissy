/*
Copyright 2014, KISSY v5.0.0
MIT Licensed
build time: Jul 18 12:20
*/
KISSY.add("editor/plugin/color/cmd",["editor"],function(h,f,i,g){var b=f("editor");g.exports={applyColor:function(a,c,d){var e=a.get("document")[0];a.execCommand("save");c?(new b.Style(d,{color:c})).apply(e):(new b.Style(d,{color:"inherit"})).remove(e);a.execCommand("save")}}});
