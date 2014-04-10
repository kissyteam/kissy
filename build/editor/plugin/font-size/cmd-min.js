/*
Copyright 2014, KISSY v5.0.0
MIT Licensed
build time: Apr 10 18:40
*/
KISSY.add("editor/plugin/font-size/cmd",["../font/cmd"],function(d,a){var b=a("../font/cmd"),c={element:"span",styles:{"font-size":"#(value)"},overrides:[{element:"font",attributes:{size:null}}]};return{init:function(a){b.addSelectCmd(a,"fontSize",c)}}});
