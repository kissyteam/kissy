/*
Copyright 2012, KISSY UI Library v1.30rc
MIT Licensed
build time: Jul 10 11:16
*/
KISSY.add("editor/plugin/bold/cmd",function(d,a,b){var c=new a.Style({element:"strong",overrides:[{element:"b"},{element:"span",attributes:{style:"font-weight: bold;"}}]});return{init:function(a){b.addButtonCmd(a,"bold",c)}}},{requires:["editor","../font/cmd"]});
