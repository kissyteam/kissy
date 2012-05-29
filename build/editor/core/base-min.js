/*
Copyright 2012, KISSY UI Library v1.30dev
MIT Licensed
build time: May 29 14:52
*/
KISSY.add("editor/core/base",function(c,d,i){d=i.Controller.extend({initializer:function(){var a;this.__commands={};this.__dialogs={};if(a=this.get("textarea")){if(!this.get("render")&&!this.get("elBefore")){var c=a.next();c?this.__set("elBefore",c):this.__set("render",a.parent())}}else this.__editor_created_new=1},use:function(a,d){var e=this,g=e.__CORE_PLUGINS||["htmlDataProcessor","enterKey","clipboard","selection"];c.isString(a)&&(a=a.split(","));for(var b=a.length-1;0<=b;b--)a[b]||a.splice(b,
1);for(b=0;b<g.length;b++){var h=g[b];c.inArray(h,a)||a.unshift(h)}c.each(a,function(c,b){a[b]&&(a[b]="editor/plugin/"+c+"/")});c.use(a,function(){var a,b=c.makeArray(arguments);b.shift();for(var f=0;f<b.length;f++)b[f]&&b[f].init(e);d&&d.call(e);(a=e.get("height"))&&e._uiSetHeight(a)});e.__CORE_PLUGINS=[];return e}},{Config:{},XHTML_DTD:d.DTD,ATTRS:{textarea:{},iframe:{},window:{},document:{},iframeWrapEl:{},toolBarEl:{},statusBarEl:{},handleMouseEvents:{value:!1},focusable:{value:!1},mode:{value:1},
data:{getter:function(){return this._getData()},setter:function(a){return this._setData(a)}},formatData:{getter:function(){return this._getData(1)},setter:function(a){return this._setData(a)}},prefixCls:{value:"ke-"}}},{xclass:"editor"});c.mix(d,c.EventTarget);return KISSY.Editor=d},{requires:["htmlparser","component","core"]});
