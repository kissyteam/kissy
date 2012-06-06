/*
Copyright 2012, KISSY UI Library v1.30dev
MIT Licensed
build time: Jun 7 00:48
*/
KISSY.add("editor/plugin/strikeThrough/cmd",function(d,a,b){var c=new a.Style({element:"del",overrides:[{element:"span",attributes:{style:"text-decoration: line-through;"}},{element:"s"},{element:"strike"}]});return{init:function(a){b.addButtonCmd(a,"strikeThrough",c)}}},{requires:["editor","../font/cmd"]});
