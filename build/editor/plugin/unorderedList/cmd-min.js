/*
Copyright 2012, KISSY UI Library v1.30rc
MIT Licensed
build time: Jul 16 11:07
*/
KISSY.add("editor/plugin/unorderedList/cmd",function(g,d,b){var e=b.queryActive,f=new b.ListCommand("ul");return{init:function(c){c.hasCommand("insertUnorderedList")||c.addCommand("insertUnorderedList",{exec:function(a){a.focus();f.exec(a)}});var b=d.Utils.getQueryCmd("insertUnorderedList");c.hasCommand(b)||c.addCommand(b,{exec:function(a){if((a=a.getSelection())&&!a.isInvalid)return a=a.getStartElement(),a=new d.ElementPath(a),e("ul",a)}})}}},{requires:["editor","../listUtils/cmd"]});
