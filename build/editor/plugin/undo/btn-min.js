/*
Copyright 2012, KISSY UI Library v1.30dev
MIT Licensed
build time: Jun 7 00:48
*/
KISSY.add("editor/plugin/undo/btn",function(b,c,d){function e(a){a.get("editor").on("afterSave afterRestore",a._respond,a)}b=d.extend({bindUI:function(){e(this)},offClick:function(){this.get("editor").execCommand("undo")},_respond:function(a){0<a.index?this.set("disabled",!1):this.set("disabled",!0)}},{ATTRS:{mode:{value:c.WYSIWYG_MODE},disabled:{value:!0}}});return{RedoBtn:d.extend({bindUI:function(){e(this)},offClick:function(){this.get("editor").execCommand("redo")},_respond:function(a){a.index<
a.history.length-1?this.set("disabled",!1):this.set("disabled",!0)}},{mode:{value:c.WYSIWYG_MODE},ATTRS:{disabled:{value:!0}}}),UndoBtn:b}},{requires:["editor","../button/"]});
