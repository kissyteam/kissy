/*
Copyright 2012, KISSY UI Library v1.30dev
MIT Licensed
build time: May 29 18:24
*/
KISSY.add("editor/core/base",function(d,c,h){c=h.Controller.extend({initializer:function(){this.__commands={};this.__dialogs={}},use:function(a,c){var e=this,f=e.__CORE_PLUGINS||["htmlDataProcessor","enterKey","clipboard","selection"];d.isString(a)&&(a=a.split(","));for(var b=a.length-1;0<=b;b--)a[b]||a.splice(b,1);for(b=0;b<f.length;b++){var g=f[b];d.inArray(g,a)||a.unshift(g)}d.each(a,function(c,b){a[b]&&(a[b]="editor/plugin/"+c+"/")});d.use(a,function(){var a=d.makeArray(arguments);a.shift();for(var b=
0;b<a.length;b++)a[b]&&a[b].init(e);c&&c.call(e);e.adjustHeight()});e.__CORE_PLUGINS=[];return e}},{Config:{},XHTML_DTD:c.DTD,ATTRS:{textarea:{},iframe:{},window:{},document:{},iframeWrapEl:{},toolBarEl:{},statusBarEl:{},handleMouseEvents:{value:!1},focusable:{value:!1},mode:{value:1},data:{getter:function(){return this._getData()},setter:function(a){return this._setData(a)}},formatData:{getter:function(){return this._getData(1)},setter:function(a){return this._setData(a)}},customStyle:{value:""},
customLink:{value:[]},prefixCls:{value:"ke-"}}},{xclass:"editor"});c.HTML_PARSER={textarea:function(a){return a.one("."+this.get("prefixCls")+"editor-textarea")}};d.mix(c,d.EventTarget);return KISSY.Editor=c},{requires:["htmlparser","component","core"]});
