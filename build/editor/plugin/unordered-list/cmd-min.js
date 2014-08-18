/*
Copyright 2014, KISSY v1.47
MIT Licensed
build time: May 22 12:27
*/
KISSY.add("editor/plugin/unordered-list/cmd",["editor","../list-utils/cmd"],function(h,b){var d=b("editor"),e=b("../list-utils/cmd"),f=e.queryActive,g=new e.ListCommand("ul");return{init:function(c){c.hasCommand("insertUnorderedList")||c.addCommand("insertUnorderedList",{exec:function(a,b){a.focus();g.exec(a,b)}});var b=d.Utils.getQueryCmd("insertUnorderedList");c.hasCommand(b)||c.addCommand(b,{exec:function(a){if((a=a.getSelection())&&!a.isInvalid)return a=a.getStartElement(),a=new d.ElementPath(a),
f("ul",a)}})}}});
