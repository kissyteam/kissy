/*
Copyright 2012, KISSY UI Library v1.30dev
MIT Licensed
build time: May 31 22:01
*/
KISSY.add("editor/plugin/heading/cmd",function(f,b){return{init:function(a){if(!a.hasCommand("heading")){a.addCommand("heading",{exec:function(c,a){c.execCommand("save");(new b.Style({element:a})).apply(c.get("document")[0]);c.execCommand("save")}});var d=b.Utils.getQueryCmd("heading");a.addCommand(d,{exec:function(a,d,e){return(new b.Style({element:e})).checkActive(d)}})}}}},{requires:["editor"]});
