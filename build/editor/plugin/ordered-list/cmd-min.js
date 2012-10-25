/*
Copyright 2012, KISSY UI Library v1.40dev
MIT Licensed
build time: Oct 26 01:55
*/
KISSY.add("editor/plugin/ordered-list/cmd",function(g,d,b){var e=b.queryActive,f=new b.ListCommand("ol");return{init:function(c){c.hasCommand("insertOrderedList")||c.addCommand("insertOrderedList",{exec:function(a){a.focus();f.exec(a)}});var b=d.Utils.getQueryCmd("insertOrderedList");c.hasCommand(b)||c.addCommand(b,{exec:function(a){if((a=a.getSelection())&&!a.isInvalid)return a=a.getStartElement(),a=new d.ElementPath(a),e("ol",a)}})}}},{requires:["editor","../list-utils/cmd"]});
