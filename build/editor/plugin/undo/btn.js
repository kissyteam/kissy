/*
Copyright 2014, KISSY v5.0.0
MIT Licensed
build time: Jun 13 11:49
*/
KISSY.add("editor/plugin/undo/btn",["../button","editor"],function(b,c,d,e){b=c("../button");d=c("editor");c=b.extend({__lock:!0,bindUI:function(){var a=this,b=a.get("editor");a.on("click",function(){b.execCommand("undo")});b.on("afterUndo afterRedo afterSave",function(b){0<b.index?a.set("disabled",a.__lock=!1):a.set("disabled",a.__lock=!0)})}},{ATTRS:{mode:{value:d.Mode.WYSIWYG_MODE},disabled:{value:!0,setter:function(a){this.__lock&&(a=!0);return a}}}});b=b.extend({__lock:!0,bindUI:function(){var a=
this,b=a.get("editor");a.on("click",function(){b.execCommand("redo")});b.on("afterUndo afterRedo afterSave",function(b){b.index<b.history.length-1?a.set("disabled",a.__lock=!1):a.set("disabled",a.__lock=!0)})}},{ATTRS:{mode:{value:d.Mode.WYSIWYG_MODE},disabled:{value:!0,setter:function(a){this.__lock&&(a=!0);return a}}}});e.exports={RedoBtn:b,UndoBtn:c}});
