/*
Copyright 2014, KISSY v5.0.0
MIT Licensed
build time: May 14 22:23
*/
KISSY.add("editor/plugin/source-area",["editor","./button"],function(g,a){function c(){}var d=a("editor");a("./button");var e=d.Mode.SOURCE_MODE,f=d.Mode.WYSIWYG_MODE;c.prototype={pluginRenderUI:function(b){b.addButton("sourceArea",{tooltip:"\u6e90\u7801",listeners:{afterSyncUI:function(){var a=this;b.on("wysiwygMode",function(){a.set("checked",!1)});b.on("sourceMode",function(){a.set("checked",!0)})},click:function(){this.get("checked")?b.set("mode",e):b.set("mode",f)}},checkable:!0})}};return c});
