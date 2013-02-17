/*
Copyright 2013, KISSY UI Library v1.30
MIT Licensed
build time: Feb 17 17:29
*/
KISSY.add("editor/plugin/outdent/index",function(d,c,e){function b(){}d.augment(b,{pluginRenderUI:function(a){e.init(a);a.addButton("outdent",{tooltip:"减少缩进量 ",listeners:{click:function(){a.execCommand("outdent");a.focus()},afterSyncUI:function(){var b=this;a.on("selectionChange",function(){a.get("mode")!=c.SOURCE_MODE&&(a.queryCommandValue("outdent")?b.set("disabled",!1):b.set("disabled",!0))})}},mode:c.WYSIWYG_MODE})}});return b},{requires:["editor","./cmd"]});
