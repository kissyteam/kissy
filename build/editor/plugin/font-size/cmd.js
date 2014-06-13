/*
Copyright 2014, KISSY v5.0.0
MIT Licensed
build time: Jun 13 11:45
*/
KISSY.add("editor/plugin/font-size/cmd",["../font/cmd"],function(e,a,f,b){var c=a("../font/cmd"),d={element:"span",styles:{"font-size":"#(value)"},overrides:[{element:"font",attributes:{size:null}}]};b.exports={init:function(a){c.addSelectCmd(a,"fontSize",d)}}});
