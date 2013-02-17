/*
Copyright 2013, KISSY UI Library v1.30
MIT Licensed
build time: Feb 17 17:29
*/
KISSY.add("editor/plugin/unordered-list/cmd",function(g,d,b){var e=b.queryActive,f=new b.ListCommand("ul");return{init:function(c){c.hasCommand("insertUnorderedList")||c.addCommand("insertUnorderedList",{exec:function(a,b){a.focus();f.exec(a,b)}});var b=d.Utils.getQueryCmd("insertUnorderedList");c.hasCommand(b)||c.addCommand(b,{exec:function(a){if((a=a.getSelection())&&!a.isInvalid)return a=a.getStartElement(),a=new d.ElementPath(a),e("ul",a)}})}}},{requires:["editor","../list-utils/cmd"]});
