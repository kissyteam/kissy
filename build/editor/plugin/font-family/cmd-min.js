/*
Copyright 2013, KISSY v1.50
MIT Licensed
build time: Dec 10 21:05
*/
KISSY.add("editor/plugin/font-family/cmd",["../font/cmd"],function(d,a){var b=a("../font/cmd"),c={element:"span",styles:{"font-family":"#(value)"},overrides:[{element:"font",attributes:{face:null}}]};return{init:function(a){b.addSelectCmd(a,"fontFamily",c)}}});
