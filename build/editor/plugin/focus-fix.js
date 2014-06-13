/*
Copyright 2014, KISSY v5.0.0
MIT Licensed
build time: Jun 13 11:45
*/
KISSY.add("editor/plugin/focus-fix",["editor","ua"],function(b,d,k,e){function f(){var a=this._focusEditor=g.currentInstance();if(h.ie&&a){window.focus();document.body.focus();var i=a.get("document")[0].selection,c;try{c=i.createRange()}catch(b){c=0}c&&c.item&&c.item(0).ownerDocument===a.get("document")[0]&&(a=document.body.createTextRange(),a.moveToElementText(this.get("el").first()[0]),a.collapse(!0),a.select())}}function j(){var a=this._focusEditor;a&&a.focus()}var b=d("editor"),h=d("ua"),g=b.focusManager;
e.exports={init:function(a){a.on("beforeVisibleChange",function(b){b.newVal&&f.call(a)});a.on("hide",function(){j.call(a)})}}});
