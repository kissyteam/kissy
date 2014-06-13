/*
Copyright 2014, KISSY v5.0.0
MIT Licensed
build time: Jun 13 11:46
*/
KISSY.add("editor/plugin/fore-color/cmd",["../color/cmd"],function(f,b,g,c){var d=b("../color/cmd"),e={element:"span",styles:{color:"#(color)"},overrides:[{element:"font",attributes:{color:null}}],childRule:function(a){return!("a"===a.nodeName()||a.all("a").length)}};c.exports={init:function(a){a.hasCommand("foreColor")||a.addCommand("foreColor",{exec:function(a,b){a.execCommand("save");d.applyColor(a,b,e);a.execCommand("save")}})}}});
