/*
Copyright 2014, KISSY v5.0.0
MIT Licensed
build time: Jun 13 11:49
*/
KISSY.add("editor/plugin/strike-through/cmd",["editor","../font/cmd"],function(a,b,f,c){var a=b("editor"),d=b("../font/cmd"),e=new a.Style({element:"del",overrides:[{element:"span",attributes:{style:"text-decoration: line-through;"}},{element:"s"},{element:"strike"}]});c.exports={init:function(a){d.addButtonCmd(a,"strikeThrough",e)}}});
