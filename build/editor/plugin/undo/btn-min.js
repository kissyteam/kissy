/*
Copyright 2013, KISSY UI Library v1.30
MIT Licensed
build time: Feb 17 17:29
*/
KISSY.add("editor/plugin/undo/btn",function(c,d,e){c=e.extend({bindUI:function(){var b=this,a=b.get("editor");b.on("click",function(){a.execCommand("undo")});a.on("afterUndo afterRedo afterSave",function(a){0<a.index?b.set("disabled",!1):b.set("disabled",!0)})}},{ATTRS:{mode:{value:d.WYSIWYG_MODE},disabled:{value:!0}}});return{RedoBtn:e.extend({bindUI:function(){var b=this,a=b.get("editor");b.on("click",function(){a.execCommand("redo")});a.on("afterUndo afterRedo afterSave",function(a){a.index<a.history.length-
1?b.set("disabled",!1):b.set("disabled",!0)})}},{mode:{value:d.WYSIWYG_MODE},ATTRS:{disabled:{value:!0}}}),UndoBtn:c}},{requires:["editor","../button/"]});
