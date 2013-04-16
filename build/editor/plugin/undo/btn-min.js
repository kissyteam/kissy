/*
Copyright 2013, KISSY UI Library v1.40dev
MIT Licensed
build time: Apr 17 00:20
*/
KISSY.add("editor/plugin/undo/btn",function(c,d,e){c=e.extend({__lock:!0,bindUI:function(){var a=this,b=a.get("editor");a.on("click",function(){b.execCommand("undo")});b.on("afterUndo afterRedo afterSave",function(b){0<b.index?a.set("disabled",a.__lock=!1):a.set("disabled",a.__lock=!0)})}},{ATTRS:{mode:{value:d.Mode.WYSIWYG_MODE},disabled:{value:!0,setter:function(a){this.__lock&&(a=!0);return a}}}});return{RedoBtn:e.extend({__lock:!0,bindUI:function(){var a=this,b=a.get("editor");a.on("click",function(){b.execCommand("redo")});
b.on("afterUndo afterRedo afterSave",function(b){b.index<b.history.length-1?a.set("disabled",a.__lock=!1):a.set("disabled",a.__lock=!0)})}},{ATTRS:{mode:{value:d.Mode.WYSIWYG_MODE},disabled:{value:!0,setter:function(a){this.__lock&&(a=!0);return a}}}}),UndoBtn:c}},{requires:["editor","../button"]});
