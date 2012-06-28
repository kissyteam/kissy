/*
Copyright 2012, KISSY UI Library v1.30dev
MIT Licensed
build time: Jun 28 20:23
*/
KISSY.add("editor/plugin/heading/cmd",function(e,c){return{init:function(b){if(!b.hasCommand("heading")){b.addCommand("heading",{exec:function(a,b){a.execCommand("save");(new c.Style({element:b})).apply(a.get("document")[0]);a.execCommand("save")}});var d=c.Utils.getQueryCmd("heading");b.addCommand(d,{exec:function(a){if((a=a.getSelection())&&!a.isInvalid)if(a=a.getStartElement(),a=new c.ElementPath(a),a=(a=a.block||a.blockLimit)&&a.nodeName()||"",a.match(/^h\d$/)||"p"==a)return a}})}}}},{requires:["editor"]});
