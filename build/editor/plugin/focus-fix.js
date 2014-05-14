/*
Copyright 2014, KISSY v5.0.0
MIT Licensed
build time: May 14 22:19
*/
KISSY.add("editor/plugin/focus-fix",["editor","ua"],function(j,b){function d(){var a=this._focusEditor=e.currentInstance();if(f.ie&&a){window.focus();document.body.focus();var g=a.get("document")[0].selection,c;try{c=g.createRange()}catch(b){c=0}c&&c.item&&c.item(0).ownerDocument===a.get("document")[0]&&(a=document.body.createTextRange(),a.moveToElementText(this.get("el").first()[0]),a.collapse(!0),a.select())}}function h(){var a=this._focusEditor;a&&a.focus()}var i=b("editor"),f=b("ua"),e=i.focusManager;
return{init:function(a){a.on("beforeVisibleChange",function(b){b.newVal&&d.call(a)});a.on("hide",function(){h.call(a)})}}});
