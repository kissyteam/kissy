/*
Copyright 2012, KISSY UI Library v1.40dev
MIT Licensed
build time: Sep 24 15:22
*/
KISSY.add("editor/plugin/source-area/index",function(d,a){function c(){}var e=a.SOURCE_MODE,f=a.WYSIWYG_MODE;d.augment(c,{renderUI:function(b){b.addButton("sourceArea",{tooltip:"源码",listeners:{afterSyncUI:function(){var a=this;b.on("wysiwygMode",function(){a.set("checked",!1)});b.on("sourceMode",function(){a.set("checked",!0)})},click:function(){this.get("checked")?b.set("mode",e):b.set("mode",f)}},checkable:!0})}});return c},{requires:["editor","../button/"]});
