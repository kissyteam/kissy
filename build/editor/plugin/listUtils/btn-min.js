/*
Copyright 2012, KISSY UI Library v1.30dev
MIT Licensed
build time: Jun 11 20:22
*/
KISSY.add("editor/plugin/listUtils/btn",function(f,e,c){function d(){var a=this.get("editor"),b=this.get("cmdType");a.execCommand(b);a.focus()}return c.Toggle.extend({initializer:function(){var a=this;a.on("click",d,a);var b=a.get("editor");b.on("selectionChange",function(c){var d=e.Utils.getQueryCmd(a.get("cmdType"));b.execCommand(d,c.path)?a.set("checked",!0):a.set("checked",!1)})}},{ATTRS:{mode:{value:e.WYSIWYG_MODE}}})},{requires:["editor","../button/"]});
