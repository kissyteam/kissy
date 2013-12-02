/*
Copyright 2013, KISSY v1.50dev
MIT Licensed
build time: Dec 2 15:21
*/
KISSY.add("editor/plugin/underline/cmd",["editor","../font/cmd"],function(e,a){var b=a("editor"),c=a("../font/cmd"),d=new b.Style({element:"u",overrides:[{element:"span",attributes:{style:"text-decoration: underline;"}}]});return{init:function(a){c.addButtonCmd(a,"underline",d)}}});
