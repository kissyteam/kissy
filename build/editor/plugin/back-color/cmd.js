/*
Copyright 2014, KISSY v5.0.0
MIT Licensed
build time: Jun 13 11:44
*/
KISSY.add("editor/plugin/back-color/cmd",["../color/cmd"],function(f,b,g,c){var d=b("../color/cmd"),e={element:"span",styles:{"background-color":"#(color)"},overrides:[{element:"*",styles:{"background-color":null}}],childRule:function(a){return!!a.style("background-color")}};c.exports={init:function(a){a.hasCommand("backColor")||a.addCommand("backColor",{exec:function(a,b){a.execCommand("save");d.applyColor(a,b,e);a.execCommand("save")}})}}});
