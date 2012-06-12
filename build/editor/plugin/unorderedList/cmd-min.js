/*
Copyright 2012, KISSY UI Library v1.30dev
MIT Licensed
build time: Jun 13 00:29
*/
KISSY.add("editor/plugin/unorderedList/cmd",function(f,c,a){var d=a.queryActive,e=new a.ListCommand("ul");return{init:function(b){b.hasCommand("insertUnorderedList")||b.addCommand("insertUnorderedList",{exec:function(a){e.exec(a)}});var a=c.Utils.getQueryCmd("insertUnorderedList");b.hasCommand(a)||b.addCommand(a,{exec:function(a,b){return d("ul",b)}})}}},{requires:["editor","../listUtils/cmd"]});
