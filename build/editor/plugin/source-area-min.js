/*
Copyright 2014, KISSY v1.47
MIT Licensed
build time: May 22 12:26
*/
KISSY.add("editor/plugin/source-area",["editor","./button"],function(e,a){function c(){}var d=a("editor");a("./button");var f=d.Mode.SOURCE_MODE,g=d.Mode.WYSIWYG_MODE;e.augment(c,{pluginRenderUI:function(b){b.addButton("sourceArea",{tooltip:"\u6e90\u7801",listeners:{afterSyncUI:function(){var a=this;b.on("wysiwygMode",function(){a.set("checked",!1)});b.on("sourceMode",function(){a.set("checked",!0)})},click:function(){this.get("checked")?b.set("mode",f):b.set("mode",g)}},checkable:!0})}});return c});
