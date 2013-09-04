/*
Copyright 2013, KISSY UI Library v1.32
MIT Licensed
build time: Sep 4 17:12
*/
KISSY.add("editor/plugin/font-size/cmd",function(d,e,a){var b={element:"span",styles:{"font-size":"#(value)"},overrides:[{element:"font",attributes:{size:null}}]};return{init:function(c){a.addSelectCmd(c,"fontSize",b)}}},{requires:["editor","../font/cmd"]});
