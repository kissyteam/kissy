/*
Copyright 2012, KISSY UI Library v1.30rc
MIT Licensed
build time: Oct 9 22:47
*/
KISSY.add("editor/plugin/color/cmd",function(f,b){return{applyColor:function(a,c,d){var e=a.get("document")[0];a.execCommand("save");c?(new b.Style(d,{color:c})).apply(e):(new b.Style(d,{color:"inherit"})).remove(e);a.execCommand("save")}}},{requires:["editor"]});
