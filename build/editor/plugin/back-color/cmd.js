/*
Copyright 2014, KISSY v5.0.0
MIT Licensed
build time: May 9 13:56
*/
KISSY.add("editor/plugin/back-color/cmd",["../color/cmd"],function(e,b){var c=b("../color/cmd"),d={element:"span",styles:{"background-color":"#(color)"},overrides:[{element:"*",styles:{"background-color":null}}],childRule:function(a){return!!a.style("background-color")}};return{init:function(a){a.hasCommand("backColor")||a.addCommand("backColor",{exec:function(a,b){a.execCommand("save");c.applyColor(a,b,d);a.execCommand("save")}})}}});
