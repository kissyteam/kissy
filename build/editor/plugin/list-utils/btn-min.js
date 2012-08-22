/*
Copyright 2012, KISSY UI Library v1.30rc
MIT Licensed
build time: Aug 22 23:28
*/
KISSY.add("editor/plugin/list-utils/btn",function(f,c,d){function e(){var a=this.get("editor"),b=this.get("cmdType");a.execCommand(b);a.focus()}return d.extend({initializer:function(){var a=this;a.on("click",e,a);var b=a.get("editor");b.on("selectionChange",function(){var c=a.get("cmdType");b.queryCommandValue(c)?a.set("checked",!0):a.set("checked",!1)})}},{ATTRS:{checkable:{value:!0},mode:{value:c.WYSIWYG_MODE}}})},{requires:["editor","../button/"]});
