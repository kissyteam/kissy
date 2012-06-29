/*
Copyright 2012, KISSY UI Library v1.30rc
MIT Licensed
build time: Jun 29 16:29
*/
KISSY.add("editor/plugin/backColor/cmd",function(e,c){var d={element:"span",styles:{"background-color":"#(color)"},overrides:[{element:"*",styles:{"background-color":null}}],childRule:function(){return!1}};return{init:function(a){a.hasCommand("backColor")||a.addCommand("backColor",{exec:function(b,a){b.execCommand("save");c.applyColor(b,a,d);b.execCommand("save")}})}}},{requires:["../color/cmd"]});
