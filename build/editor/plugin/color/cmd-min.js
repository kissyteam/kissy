/*
Copyright 2014, KISSY v1.50
MIT Licensed
build time: Mar 13 17:51
*/
KISSY.add("editor/plugin/color/cmd",["editor"],function(g,f){var b=f("editor");return{applyColor:function(a,c,d){var e=a.get("document")[0];a.execCommand("save");c?(new b.Style(d,{color:c})).apply(e):(new b.Style(d,{color:"inherit"})).remove(e);a.execCommand("save")}}});
