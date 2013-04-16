/*
Copyright 2013, KISSY UI Library v1.40dev
MIT Licensed
build time: Apr 17 00:17
*/
KISSY.add("editor/plugin/heading/cmd",function(f,d){return{init:function(b){if(!b.hasCommand("heading")){b.addCommand("heading",{exec:function(a,c){a.execCommand("save");if("p"!=c)var b=a.queryCommandValue("heading");c==b&&(c="p");(new d.Style({element:c})).apply(a.get("document")[0]);a.execCommand("save")}});var e=d.Utils.getQueryCmd("heading");b.addCommand(e,{exec:function(a){if((a=a.getSelection())&&!a.isInvalid)if(a=a.getStartElement(),a=new d.ElementPath(a),a=(a=a.block||a.blockLimit)&&a.nodeName()||
"",a.match(/^h\d$/)||"p"==a)return a}})}}}},{requires:["editor"]});
