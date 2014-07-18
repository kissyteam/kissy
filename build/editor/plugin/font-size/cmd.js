/*
Copyright 2014, KISSY v5.0.0
MIT Licensed
build time: Jul 18 13:57
*/
KISSY.add("editor/plugin/font-size/cmd",["../font/cmd"],function(e,a,f,b){var c=a("../font/cmd"),d={element:"span",styles:{"font-size":"#(value)"},overrides:[{element:"font",attributes:{size:null}}]};b.exports={init:function(a){c.addSelectCmd(a,"fontSize",d)}}});
