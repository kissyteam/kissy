/*
Copyright 2012, KISSY UI Library v1.30dev
MIT Licensed
build time: Jun 11 20:22
*/
KISSY.add("editor/plugin/italic/cmd",function(d,a,b){var c=new a.Style({element:"em",overrides:[{element:"i"},{element:"span",attributes:{style:"font-style: italic;"}}]});return{init:function(a){b.addButtonCmd(a,"italic",c)}}},{requires:["editor","../font/cmd"]});
