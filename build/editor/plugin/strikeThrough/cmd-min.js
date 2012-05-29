/*
Copyright 2012, KISSY UI Library v1.30dev
MIT Licensed
build time: May 29 18:24
*/
KISSY.add("editor/plugin/strikeThrough/cmd",function(d,a,b){var c=new a.Style({element:"del",overrides:[{element:"span",attributes:{style:"text-decoration: line-through;"}},{element:"s"},{element:"strike"}]});return{init:function(a){b.addButtonCmd(a,"strikeThrough",c)}}},{requires:["editor","../font/cmd"]});
