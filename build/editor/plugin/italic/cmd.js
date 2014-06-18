/*
Copyright 2014, KISSY v5.0.0
MIT Licensed
build time: Jun 18 13:15
*/
KISSY.add("editor/plugin/italic/cmd",["editor","../font/cmd"],function(a,b,f,c){var a=b("editor"),d=b("../font/cmd"),e=new a.Style({element:"em",overrides:[{element:"i"},{element:"span",attributes:{style:"font-style: italic;"}}]});c.exports={init:function(a){d.addButtonCmd(a,"italic",e)}}});
