/*
Copyright 2013, KISSY UI Library v1.31
MIT Licensed
build time: Aug 15 16:16
*/
KISSY.add("editor/plugin/italic/cmd",function(d,a,b){var c=new a.Style({element:"em",overrides:[{element:"i"},{element:"span",attributes:{style:"font-style: italic;"}}]});return{init:function(a){b.addButtonCmd(a,"italic",c)}}},{requires:["editor","../font/cmd"]});
