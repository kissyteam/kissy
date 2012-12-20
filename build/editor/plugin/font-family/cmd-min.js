/*
Copyright 2012, KISSY UI Library v1.40dev
MIT Licensed
build time: Dec 20 22:27
*/
KISSY.add("editor/plugin/font-family/cmd",function(d,e,a){var b={element:"span",styles:{"font-family":"#(value)"},overrides:[{element:"font",attributes:{face:null}}]};return{init:function(c){a.addSelectCmd(c,"fontFamily",b)}}},{requires:["editor","../font/cmd"]});
