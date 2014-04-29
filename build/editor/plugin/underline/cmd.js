/*
Copyright 2014, KISSY v5.0.0
MIT Licensed
build time: Apr 29 15:07
*/
KISSY.add("editor/plugin/underline/cmd",["editor","../font/cmd"],function(e,a){var b=a("editor"),c=a("../font/cmd"),d=new b.Style({element:"u",overrides:[{element:"span",attributes:{style:"text-decoration: underline;"}}]});return{init:function(a){c.addButtonCmd(a,"underline",d)}}});
