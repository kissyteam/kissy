/*
Copyright 2012, KISSY UI Library v1.30dev
MIT Licensed
build time: Jun 13 14:40
*/
KISSY.add("editor/plugin/outdent/index",function(f,b,c){return{init:function(a){c.init(a);var e=b.Utils.getQueryCmd("outdent");a.addButton("outdent",{tooltip:"减少缩进量 ",listeners:{click:function(){a.execCommand("outdent");a.focus()},afterSyncUI:function(){var d=this;a.on("selectionChange",function(c){a.get("mode")!=b.SOURCE_MODE&&(a.execCommand(e,c.path)?d.set("disabled",!1):d.set("disabled",!0))})}},mode:b.WYSIWYG_MODE})}}},{requires:["editor","./cmd"]});
