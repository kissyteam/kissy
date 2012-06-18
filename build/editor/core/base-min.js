/*
Copyright 2012, KISSY UI Library v1.30dev
MIT Licensed
build time: Jun 18 22:02
*/
KISSY.add("editor/core/base",function(b,a,c){a=c.Controller.extend({initializer:function(){this.__commands={};this.__controls={}}},{Config:{},XHTML_DTD:a.DTD,ATTRS:{textarea:{},iframe:{},window:{},document:{},toolBarEl:{},statusBarEl:{},handleMouseEvents:{value:!1},focusable:{value:!1},mode:{value:1},data:{getter:function(){return this._getData()},setter:function(a){return this._setData(a)}},formatData:{getter:function(){return this._getData(1)},setter:function(a){return this._setData(a)}},customStyle:{value:""},
customLink:{value:[]}}},{xclass:"editor"});a.HTML_PARSER={textarea:function(a){return a.one(".ks-editor-textarea")}};b.mix(a,b.EventTarget);return KISSY.Editor=a},{requires:["htmlparser","component","core"]});
