/*
Copyright 2012, KISSY UI Library v1.30dev
MIT Licensed
build time: Jun 5 21:37
*/
KISSY.add("editor/plugin/overlay/focus",function(c,d){function b(){}var e=c.UA,f=d.focusManager;b.ATTRS={focus4e:{value:!0}};b.prototype={_uiSetFocus4e:function(a){a?(this.on("show",this._show4FocusExt,this),this.on("hide",this._hide4FocusExt,this)):(this.detach("show",this._show4FocusExt,this),this.detach("hide",this._hide4FocusExt,this))},_show4FocusExt:function(){var a=this._focusEditor=f.currentInstance();if(e.ie&&a){window.focus();document.body.focus();var b=a.get("document")[0].selection.createRange();
b&&b.item&&b.item(0).ownerDocument==a.get("document")[0]&&(a=document.body.createTextRange(),a.moveToElementText(this.get("el").first()[0]),a.collapse(!0),a.select())}},_hide4FocusExt:function(){var a=this._focusEditor;a&&a.focus()}};return b},{requires:["editor"]});
