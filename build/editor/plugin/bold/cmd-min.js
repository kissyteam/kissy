/*
Copyright 2013, KISSY UI Library v1.40dev
MIT Licensed
build time: May 30 01:34
*/
KISSY.add("editor/plugin/bold/cmd",function(d,a,b){var c=new a.Style({element:"strong",overrides:[{element:"b"},{element:"span",attributes:{style:"font-weight: bold;"}}]});return{init:function(a){b.addButtonCmd(a,"bold",c)}}},{requires:["editor","../font/cmd"]});
