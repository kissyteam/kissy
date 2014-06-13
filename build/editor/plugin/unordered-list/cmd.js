/*
Copyright 2014, KISSY v5.0.0
MIT Licensed
build time: Jun 13 11:49
*/
KISSY.add("editor/plugin/unordered-list/cmd",["editor","../list-utils/cmd"],function(b,d,i,f){var e=d("editor"),b=d("../list-utils/cmd"),g=b.queryActive,h=new b.ListCommand("ul");f.exports={init:function(c){c.hasCommand("insertUnorderedList")||c.addCommand("insertUnorderedList",{exec:function(a,b){a.focus();h.exec(a,b)}});var b=e.Utils.getQueryCmd("insertUnorderedList");c.hasCommand(b)||c.addCommand(b,{exec:function(a){if((a=a.getSelection())&&!a.isInvalid)return a=a.getStartElement(),a=new e.ElementPath(a),
g("ul",a)}})}}});
