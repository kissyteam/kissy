/*
Copyright 2014, KISSY v1.47
MIT Licensed
build time: May 22 12:22
*/
KISSY.add("editor/plugin/fore-color/cmd",["../color/cmd"],function(e,b){var c=b("../color/cmd"),d={element:"span",styles:{color:"#(color)"},overrides:[{element:"font",attributes:{color:null}}],childRule:function(a){return!("a"===a.nodeName()||a.all("a").length)}};return{init:function(a){a.hasCommand("foreColor")||a.addCommand("foreColor",{exec:function(a,b){a.execCommand("save");c.applyColor(a,b,d);a.execCommand("save")}})}}});
