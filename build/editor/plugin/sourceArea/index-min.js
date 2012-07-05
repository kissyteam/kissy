/*
Copyright 2012, KISSY UI Library v1.30rc
MIT Licensed
build time: Jul 5 23:07
*/
KISSY.add("editor/plugin/sourceArea/index",function(d,a){function c(){}var e=a.SOURCE_MODE,f=a.WYSIWYG_MODE;d.augment(c,{renderUI:function(b){b.addButton("sourceArea",{tooltip:"源码",listeners:{afterSyncUI:function(){var a=this;b.on("wysiwygMode",function(){a.set("checked",!1)});b.on("sourceMode",function(){a.set("checked",!0)})},click:function(){this.get("checked")?b.set("mode",e):b.set("mode",f)}},checkable:!0})}});return c},{requires:["editor","../button/"]});
