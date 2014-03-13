/*
Copyright 2014, KISSY v1.50
MIT Licensed
build time: Mar 13 17:54
*/
KISSY.add("editor/plugin/italic/cmd",["editor","../font/cmd"],function(e,a){var b=a("editor"),c=a("../font/cmd"),d=new b.Style({element:"em",overrides:[{element:"i"},{element:"span",attributes:{style:"font-style: italic;"}}]});return{init:function(a){c.addButtonCmd(a,"italic",d)}}});
