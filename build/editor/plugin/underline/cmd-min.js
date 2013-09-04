/*
Copyright 2013, KISSY UI Library v1.32
MIT Licensed
build time: Sep 4 17:12
*/
KISSY.add("editor/plugin/underline/cmd",function(d,a,b){var c=new a.Style({element:"u",overrides:[{element:"span",attributes:{style:"text-decoration: underline;"}}]});return{init:function(a){b.addButtonCmd(a,"underline",c)}}},{requires:["editor","../font/cmd"]});
