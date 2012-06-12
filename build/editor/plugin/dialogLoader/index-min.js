/*
Copyright 2012, KISSY UI Library v1.30dev
MIT Licensed
build time: Jun 13 00:29
*/
KISSY.add("editor/plugin/dialogLoader/index",function(b,e,c){var a,f={loading:function(){a||(a=new e({x:0,width:6==b.UA.ie?b.DOM.docWidth():"100%",y:0,zIndex:c.baseZIndex(c.zIndexManager.LOADING),prefixCls:"ks-editor-",elCls:"ks-editor-global-loading"}));a.set("height",b.DOM.docHeight());a.show();a.loading()},unloading:function(){a.hide()}};return{useDialog:function(a,d,c){a.focus();a.getControl(d+"/dialog")?setTimeout(function(){a.showDialog(d,c)},0):(f.loading(),b.use("editor/plugin/"+d+"/dialog",
function(b,e){f.unloading();a.addControl(d+"/dialog",new e(a));a.showDialog(d,c)}))}}},{requires:["overlay","editor"]});
