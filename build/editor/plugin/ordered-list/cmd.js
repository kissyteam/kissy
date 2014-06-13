/*
Copyright 2014, KISSY v5.0.0
MIT Licensed
build time: Jun 13 11:48
*/
KISSY.add("editor/plugin/ordered-list/cmd",["editor","../list-utils/cmd"],function(b,d,i,f){var e=d("editor"),b=d("../list-utils/cmd"),g=b.queryActive,h=new b.ListCommand("ol");f.exports={init:function(c){c.hasCommand("insertOrderedList")||c.addCommand("insertOrderedList",{exec:function(a,b){a.focus();h.exec(a,b)}});var b=e.Utils.getQueryCmd("insertOrderedList");c.hasCommand(b)||c.addCommand(b,{exec:function(a){if((a=a.getSelection())&&!a.isInvalid)return a=a.getStartElement(),a=new e.ElementPath(a),
g("ol",a)}})}}});
