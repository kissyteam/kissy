/*
Copyright 2012, KISSY UI Library v1.30dev
MIT Licensed
build time: May 28 19:44
*/
KISSY.add("editor/plugin/bold/cmd",function(d,a,b){var c=new a.Style({element:"strong",overrides:[{element:"b"},{element:"span",attributes:{style:"font-weight: bold;"}}]});return{init:function(a){b.addButtonCmd(a,"bold",c)}}},{requires:["editor","../font/cmd"]});
