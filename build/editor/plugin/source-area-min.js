/*
Copyright 2013, KISSY UI Library v1.40dev
MIT Licensed
build time: Jul 3 13:54
*/
KISSY.add("editor/plugin/source-area",function(d,a){function c(){}var e=a.Mode.SOURCE_MODE,f=a.Mode.WYSIWYG_MODE;d.augment(c,{pluginRenderUI:function(b){b.addButton("sourceArea",{tooltip:"\u6e90\u7801",listeners:{afterSyncUI:function(){var a=this;b.on("wysiwygMode",function(){a.set("checked",!1)});b.on("sourceMode",function(){a.set("checked",!0)})},click:function(){this.get("checked")?b.set("mode",e):b.set("mode",f)}},checkable:!0})}});return c},{requires:["editor","./button"]});
