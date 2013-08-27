/*
Copyright 2013, KISSY v1.40dev
MIT Licensed
build time: Aug 27 21:54
*/
KISSY.add("editor/plugin/font-size/cmd",function(d,e,a){var b={element:"span",styles:{"font-size":"#(value)"},overrides:[{element:"font",attributes:{size:null}}]};return{init:function(c){a.addSelectCmd(c,"fontSize",b)}}},{requires:["editor","../font/cmd"]});
