/*
Copyright 2012, KISSY UI Library v1.30dev
MIT Licensed
build time: May 28 19:44
*/
KISSY.add("editor/plugin/undo/btn",function(d,g,e){function f(){this.get("editor").on("afterSave afterRestore",this._respond,this);this.disable()}function b(){b.superclass.constructor.apply(this,arguments);f.call(this)}function c(){c.superclass.constructor.apply(this,arguments);f.call(this)}d.extend(b,e,{offClick:function(){this.get("editor").execCommand("undo")},_respond:function(a){0<a.index?this.boff():this.disable()}});d.extend(c,e,{offClick:function(){this.get("editor").execCommand("redo")},
_respond:function(a){a.index<a.history.length-1?this.boff():this.disable()}});return{RedoBtn:c,UndoBtn:b}},{requires:["editor","../button/"]});
