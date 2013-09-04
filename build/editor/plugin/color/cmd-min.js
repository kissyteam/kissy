/*
Copyright 2013, KISSY UI Library v1.32
MIT Licensed
build time: Sep 4 17:12
*/
KISSY.add("editor/plugin/color/cmd",function(f,b){return{applyColor:function(a,c,d){var e=a.get("document")[0];a.execCommand("save");c?(new b.Style(d,{color:c})).apply(e):(new b.Style(d,{color:"inherit"})).remove(e);a.execCommand("save")}}},{requires:["editor"]});
