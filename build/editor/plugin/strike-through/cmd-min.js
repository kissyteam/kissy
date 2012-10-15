/*
Copyright 2012, KISSY UI Library v1.40dev
MIT Licensed
build time: Oct 15 14:04
*/
KISSY.add("editor/plugin/strike-through/cmd",function(d,a,b){var c=new a.Style({element:"del",overrides:[{element:"span",attributes:{style:"text-decoration: line-through;"}},{element:"s"},{element:"strike"}]});return{init:function(a){b.addButtonCmd(a,"strikeThrough",c)}}},{requires:["editor","../font/cmd"]});
