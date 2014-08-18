/*
Copyright 2014, KISSY v1.47
MIT Licensed
build time: May 22 12:21
*/
KISSY.add("editor/plugin/focus-fix",["editor"],function(d,e){function f(){var a=this._focusEditor=g.currentInstance();if(h.ie&&a){window.focus();document.body.focus();var c=a.get("document")[0].selection,b;try{b=c.createRange()}catch(d){b=0}b&&b.item&&b.item(0).ownerDocument===a.get("document")[0]&&(a=document.body.createTextRange(),a.moveToElementText(this.get("el").first()[0]),a.collapse(!0),a.select())}}function i(){var a=this._focusEditor;a&&a.focus()}var j=e("editor"),h=d.UA,g=j.focusManager;
return{init:function(a){a.on("beforeVisibleChange",function(c){c.newVal&&f.call(a)});a.on("hide",function(){i.call(a)})}}});
