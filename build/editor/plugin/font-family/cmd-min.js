/*
Copyright 2013, KISSY UI Library v1.31
MIT Licensed
build time: Aug 15 16:16
*/
KISSY.add("editor/plugin/font-family/cmd",function(d,e,a){var b={element:"span",styles:{"font-family":"#(value)"},overrides:[{element:"font",attributes:{face:null}}]};return{init:function(c){a.addSelectCmd(c,"fontFamily",b)}}},{requires:["editor","../font/cmd"]});
