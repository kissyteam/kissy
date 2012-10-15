/*
Copyright 2012, KISSY UI Library v1.40dev
MIT Licensed
build time: Oct 15 14:04
*/
KISSY.add("editor/plugin/font-size/cmd",function(d,e,a){var b={element:"span",styles:{"font-size":"#(value)"},overrides:[{element:"font",attributes:{size:null}}]};return{init:function(c){a.addSelectCmd(c,"fontSize",b)}}},{requires:["editor","../font/cmd"]});
