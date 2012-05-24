/*
Copyright 2012, KISSY UI Library v1.30dev
MIT Licensed
build time: May 24 18:37
*/
KISSY.add("editor/core/base",function(c,e,h,d){e=d.create(h.Controller,[d.Box],{initializer:function(){var a;this.__commands={};this.__dialogs={};if(a=this.get("textarea")){if(!this.get("render")&&!this.get("elBefore")){var c=a.next();c?this.__set("elBefore",c):this.__set("render",a.parent())}}else this.__editor_created_new=1},use:function(a,e){for(var f=this,d=f.__CORE_PLUGINS||["htmlDataProcessor","enterKey","clipboard","selection"],a=a.split(","),b=a.length-1;0<=b;b--)a[b]||a.splice(b,1);for(b=
0;b<d.length;b++){var g=d[b];c.inArray(g,a)||a.unshift(g)}c.each(a,function(c,b){a[b]&&(a[b]="editor/plugin/"+c+"/")});c.use(a.join(","),function(){var a,b=c.makeArray(arguments);b.shift();for(var d=0;d<b.length;d++)b[d].init(f);e&&e.call(f);(a=f.get("height"))&&f._uiSetHeight(a)});f.__CORE_PLUGINS=[];return f}},{Config:{},XHTML_DTD:e.DTD,ATTRS:{textarea:{},iframe:{},window:{},document:{},iframeWrapEl:{},toolBarEl:{},statusBarEl:{},handleMouseEvents:{value:!1},focusable:{value:!1},mode:{value:1},
data:{getter:function(){return this._getData()},setter:function(a){return this._setData(a)}},formatData:{getter:function(){return this._getData(1)},setter:function(a){return this._setData(a)}},prefixCls:{value:"ke-"}}},"Editor");c.mix(e,c.EventTarget);return KISSY.Editor=e},{requires:["htmlparser","component","uibase","core"]});
