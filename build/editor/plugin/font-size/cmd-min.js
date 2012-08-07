/*
Copyright 2012, KISSY UI Library v1.30rc
MIT Licensed
build time: Aug 7 11:46
*/
KISSY.add("editor/plugin/font-size/cmd",function(d,e,a){var b={element:"span",styles:{"font-size":"#(value)"},overrides:[{element:"font",attributes:{size:null}}]};return{init:function(c){a.addSelectCmd(c,"fontSize",b)}}},{requires:["editor","../font/cmd"]});
