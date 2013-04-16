/*
Copyright 2013, KISSY UI Library v1.40dev
MIT Licensed
build time: Apr 17 00:18
*/
KISSY.add("editor/plugin/list-utils/btn",function(j,h){return{init:function(b,d){var e=d.buttonId,f=d.cmdType,i=d.tooltip,c=b.addButton(e,{elCls:e+"Btn",mode:h.Mode.WYSIWYG_MODE,tooltip:"\u8bbe\u7f6e"+i});b.on("selectionChange",function(){var a;(a=b.queryCommandValue(f))?(c.set("checked",!0),g.set("value",a)):c.set("checked",!1)});var g=b.addSelect(e+"Arrow",{tooltip:"\u9009\u62e9\u5e76\u8bbe\u7f6e"+i,mode:h.Mode.WYSIWYG_MODE,menu:d.menu,matchElWidth:!1,elCls:"toolbar-"+e+"ArrowBtn"});g.on("click",function(a){a=a.target.get("value");
c.listValue=a;b.execCommand(f,a);b.focus()});c.on("click",function(){var a=c.listValue;c.get("checked")&&(a=g.get("value"));b.execCommand(f,a);b.focus()})}}},{requires:["editor","../button","../menubutton"]});
