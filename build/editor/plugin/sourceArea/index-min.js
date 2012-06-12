/*
Copyright 2012, KISSY UI Library v1.30dev
MIT Licensed
build time: Jun 13 00:29
*/
KISSY.add("editor/plugin/sourceArea/index",function(e,b){var c=b.SOURCE_MODE,d=b.WYSIWYG_MODE;return{init:function(a){a.addButton("sourceArea",{tooltip:"源码",listeners:{afterSyncUI:function(){var b=this;a.on("wysiwygMode",function(){b.set("checked",!1)});a.on("sourceMode",function(){b.set("checked",!0)})},click:function(){this.get("checked")?a.set("mode",c):a.set("mode",d);a.focus()}},checkable:!0})}}},{requires:["editor","../button/"]});
