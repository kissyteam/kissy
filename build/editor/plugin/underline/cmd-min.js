/*
Copyright 2014, KISSY v1.47
MIT Licensed
build time: May 22 12:26
*/
KISSY.add("editor/plugin/underline/cmd",["editor","../font/cmd"],function(e,a){var b=a("editor"),c=a("../font/cmd"),d=new b.Style({element:"u",overrides:[{element:"span",attributes:{style:"text-decoration: underline;"}}]});return{init:function(a){c.addButtonCmd(a,"underline",d)}}});
