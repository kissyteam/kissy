/*
Copyright 2012, KISSY UI Library v1.30dev
MIT Licensed
build time: May 24 18:37
*/
KISSY.add("editor/plugin/insertUnorderedList/cmd",function(f,c,a){var d=a.queryActive,e=new a.ListCommand("ul");return{init:function(b){b.hasCommand("insertUnorderedList")||b.addCommand("insertUnorderedList",{exec:function(a){e.exec(a)}});var a=c.Utils.getQueryCmd("insertUnorderedList");b.hasCommand(a)||b.addCommand(a,{exec:function(a,b){return d("ul",b)}})}}},{requires:["editor","../listUtils/cmd.js"]});
