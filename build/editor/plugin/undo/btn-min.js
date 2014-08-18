/*
Copyright 2014, KISSY v1.47
MIT Licensed
build time: May 22 12:26
*/
KISSY.add("editor/plugin/undo/btn",["../button","editor"],function(g,c){var d=c("../button"),e=c("editor"),f=d.extend({__lock:!0,bindUI:function(){var a=this,b=a.get("editor");a.on("click",function(){b.execCommand("undo")});b.on("afterUndo afterRedo afterSave",function(b){0<b.index?a.set("disabled",a.__lock=!1):a.set("disabled",a.__lock=!0)})}},{ATTRS:{mode:{value:e.Mode.WYSIWYG_MODE},disabled:{value:!0,setter:function(a){this.__lock&&(a=!0);return a}}}});return{RedoBtn:d.extend({__lock:!0,bindUI:function(){var a=
this,b=a.get("editor");a.on("click",function(){b.execCommand("redo")});b.on("afterUndo afterRedo afterSave",function(b){b.index<b.history.length-1?a.set("disabled",a.__lock=!1):a.set("disabled",a.__lock=!0)})}},{ATTRS:{mode:{value:e.Mode.WYSIWYG_MODE},disabled:{value:!0,setter:function(a){this.__lock&&(a=!0);return a}}}}),UndoBtn:f}});
