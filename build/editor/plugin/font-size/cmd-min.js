/*
Copyright 2013, KISSY v1.41
MIT Licensed
build time: Dec 4 22:09
*/
KISSY.add("editor/plugin/font-size/cmd",["../font/cmd"],function(d,a){var b=a("../font/cmd"),c={element:"span",styles:{"font-size":"#(value)"},overrides:[{element:"font",attributes:{size:null}}]};return{init:function(a){b.addSelectCmd(a,"fontSize",c)}}});
