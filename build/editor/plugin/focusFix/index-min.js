/*
Copyright 2012, KISSY UI Library v1.30dev
MIT Licensed
build time: Jun 7 15:13
*/
KISSY.add("editor/plugin/focusFix/index",function(c,d){function e(){var a=this._focusEditor=f.currentInstance();if(g.ie&&a){window.focus();document.body.focus();var b=a.get("document")[0].selection.createRange();b&&b.item&&b.item(0).ownerDocument==a.get("document")[0]&&(a=document.body.createTextRange(),a.moveToElementText(this.get("el").first()[0]),a.collapse(!0),a.select())}}function h(){var a=this._focusEditor;a&&a.focus()}var g=c.UA,f=d.focusManager;return{init:function(a){a.on("beforeVisibleChange",
function(b){b.newVal&&e.call(a)});a.on("hide",function(){h.call(a)})}}},{requires:["editor"]});
