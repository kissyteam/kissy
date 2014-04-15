/*
Copyright 2014, KISSY v5.0.0
MIT Licensed
build time: Apr 15 17:44
*/
KISSY.add("editor/plugin/bold/cmd",["editor","../font/cmd"],function(e,a){var b=a("editor"),c=a("../font/cmd"),d=new b.Style({element:"strong",overrides:[{element:"b"},{element:"span",attributes:{style:"font-weight: bold;"}}]});return{init:function(a){c.addButtonCmd(a,"bold",d)}}});
