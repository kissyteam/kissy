/*
Copyright 2012, KISSY UI Library v1.30dev
MIT Licensed
build time: Jun 19 16:41
*/
KISSY.add("editor/plugin/outdent/index",function(c,d,f){function b(){}c.augment(b,{renderUI:function(a){f.init(a);var b=d.Utils.getQueryCmd("outdent");a.addButton("outdent",{tooltip:"减少缩进量 ",listeners:{click:function(){a.execCommand("outdent");a.focus()},afterSyncUI:function(){var e=this;a.on("selectionChange",function(c){a.get("mode")!=d.SOURCE_MODE&&(a.execCommand(b,c.path)?e.set("disabled",!1):e.set("disabled",!0))})}},mode:d.WYSIWYG_MODE})}});return b},{requires:["editor","./cmd"]});
