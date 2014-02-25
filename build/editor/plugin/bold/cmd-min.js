/*
Copyright 2014, KISSY v1.42
MIT Licensed
build time: Jan 6 12:44
*/
KISSY.add("editor/plugin/bold/cmd",["editor","../font/cmd"],function(e,a){var b=a("editor"),c=a("../font/cmd"),d=new b.Style({element:"strong",overrides:[{element:"b"},{element:"span",attributes:{style:"font-weight: bold;"}}]});return{init:function(a){c.addButtonCmd(a,"bold",d)}}});
