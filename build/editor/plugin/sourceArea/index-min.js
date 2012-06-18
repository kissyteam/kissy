/*
Copyright 2012, KISSY UI Library v1.30dev
MIT Licensed
build time: Jun 18 17:43
*/
KISSY.add("editor/plugin/sourceArea/index",function(d,b){function c(){}var e=b.SOURCE_MODE,f=b.WYSIWYG_MODE;d.augment(c,{renderUI:function(a){a.addButton("sourceArea",{tooltip:"源码",listeners:{afterSyncUI:function(){var b=this;a.on("wysiwygMode",function(){b.set("checked",!1)});a.on("sourceMode",function(){b.set("checked",!0)})},click:function(){this.get("checked")?a.set("mode",e):a.set("mode",f);a.focus()}},checkable:!0})}});return c},{requires:["editor","../button/"]});
