/*
Copyright 2014, KISSY v5.0.0
MIT Licensed
build time: Jun 13 11:48
*/
KISSY.add("editor/plugin/source-area",["editor","./button"],function(a,c,h,e){function d(){}a=c("editor");c("./button");var f=a.Mode.SOURCE_MODE,g=a.Mode.WYSIWYG_MODE;d.prototype={pluginRenderUI:function(b){b.addButton("sourceArea",{tooltip:"\u6e90\u7801",listeners:{afterSyncUI:function(){var a=this;b.on("wysiwygMode",function(){a.set("checked",!1)});b.on("sourceMode",function(){a.set("checked",!0)})},click:function(){this.get("checked")?b.set("mode",f):b.set("mode",g)}},checkable:!0})}};e.exports=d});
