/*
Copyright 2014, KISSY v1.47
MIT Licensed
build time: May 22 12:24
*/
KISSY.add("editor/plugin/list-utils/btn",["editor","../button","../menubutton"],function(j,c){var h=c("editor");c("../button");c("../menubutton");return{init:function(b,e){var f=e.buttonId,c=e.cmdType,i=e.tooltip,d=b.addButton(f,{elCls:f+"Btn",mode:h.Mode.WYSIWYG_MODE,tooltip:"\u8bbe\u7f6e"+i});b.on("selectionChange",function(){var a;(a=b.queryCommandValue(c))?(d.set("checked",!0),g.set("value",a)):d.set("checked",!1)});var g=b.addSelect(f+"Arrow",{tooltip:"\u9009\u62e9\u5e76\u8bbe\u7f6e"+i,mode:h.Mode.WYSIWYG_MODE,menu:e.menu,matchElWidth:!1,
elCls:"toolbar-"+f+"ArrowBtn"});g.on("click",function(a){a=a.target.get("value");d.listValue=a;b.execCommand(c,a);b.focus()});d.on("click",function(){var a=d.listValue;d.get("checked")&&(a=g.get("value"));b.execCommand(c,a);b.focus()})}}});
