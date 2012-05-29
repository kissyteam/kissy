/*
Copyright 2012, KISSY UI Library v1.30dev
MIT Licensed
build time: May 29 14:52
*/
KISSY.add("editor/plugin/insertOrderedList/cmd",function(f,c,a){var d=a.queryActive,e=new a.ListCommand("ol");return{init:function(b){b.hasCommand("insertOrderedList")||b.addCommand("insertOrderedList",{exec:function(a){e.exec(a)}});var a=c.Utils.getQueryCmd("insertOrderedList");b.hasCommand(a)||b.addCommand(a,{exec:function(a,b){return d("ol",b)}})}}},{requires:["editor","../listUtils/cmd"]});
