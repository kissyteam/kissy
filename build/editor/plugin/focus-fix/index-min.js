/*
Copyright 2013, KISSY UI Library v1.30
MIT Licensed
build time: Feb 17 17:29
*/
KISSY.add("editor/plugin/focus-fix/index",function(d,e){function f(){var a=this._focusEditor=g.currentInstance();if(h.ie&&a){window.focus();document.body.focus();var c=a.get("document")[0].selection,b;try{b=c.createRange()}catch(d){b=0}b&&b.item&&b.item(0).ownerDocument==a.get("document")[0]&&(a=document.body.createTextRange(),a.moveToElementText(this.get("el").first()[0]),a.collapse(!0),a.select())}}function i(){var a=this._focusEditor;a&&a.focus()}var h=d.UA,g=e.focusManager;return{init:function(a){a.on("beforeVisibleChange",
function(c){c.newVal&&f.call(a)});a.on("hide",function(){i.call(a)})}}},{requires:["editor"]});
