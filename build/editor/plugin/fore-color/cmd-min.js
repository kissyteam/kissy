/*
Copyright 2012, KISSY UI Library v1.30rc
MIT Licensed
build time: Aug 27 10:38
*/
KISSY.add("editor/plugin/fore-color/cmd",function(e,b){var c={element:"span",styles:{color:"#(color)"},overrides:[{element:"font",attributes:{color:null}}],childRule:function(a){return!("a"==a.nodeName()||a.all("a").length)}};return{init:function(a){a.hasCommand("foreColor")||a.addCommand("foreColor",{exec:function(a,d){a.execCommand("save");b.applyColor(a,d,c);a.execCommand("save")}})}}},{requires:["../color/cmd"]});
