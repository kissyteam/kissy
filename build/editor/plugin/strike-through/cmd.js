/*
Copyright 2014, KISSY v5.0.0
MIT Licensed
build time: May 14 22:23
*/
KISSY.add("editor/plugin/strike-through/cmd",["editor","../font/cmd"],function(e,a){var b=a("editor"),c=a("../font/cmd"),d=new b.Style({element:"del",overrides:[{element:"span",attributes:{style:"text-decoration: line-through;"}},{element:"s"},{element:"strike"}]});return{init:function(a){c.addButtonCmd(a,"strikeThrough",d)}}});
