/*
Copyright 2014, KISSY v5.0.0
MIT Licensed
build time: May 9 13:58
*/
KISSY.add("editor/plugin/font-family/cmd",["../font/cmd"],function(d,a){var b=a("../font/cmd"),c={element:"span",styles:{"font-family":"#(value)"},overrides:[{element:"font",attributes:{face:null}}]};return{init:function(a){b.addSelectCmd(a,"fontFamily",c)}}});
