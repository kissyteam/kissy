/*
Copyright 2012, KISSY UI Library v1.40dev
MIT Licensed
build time: Jul 5 23:29
*/
KISSY.add("editor/plugin/dialogLoader/index",function(b,e,d){var a,f={loading:function(){a||(a=new e({x:0,width:6==b.UA.ie?b.DOM.docWidth():"100%",y:0,zIndex:d.baseZIndex(d.zIndexManager.LOADING),prefixCls:"ks-editor-",elCls:"ks-editor-global-loading"}));a.set("height",b.DOM.docHeight());a.show();a.loading()},unloading:function(){a.hide()}};return{useDialog:function(a,c,d,g){a.focus();a.getControl(c+"/dialog")?setTimeout(function(){a.showDialog(c,g)},0):(f.loading(),b.use("editor/plugin/"+c+"/dialog",
function(b,e){f.unloading();a.addControl(c+"/dialog",new e(a,d));a.showDialog(c,g)}))}}},{requires:["overlay","editor"]});
