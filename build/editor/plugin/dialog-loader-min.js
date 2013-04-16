/*
Copyright 2013, KISSY UI Library v1.40dev
MIT Licensed
build time: Apr 17 00:16
*/
KISSY.add("editor/plugin/dialog-loader",function(c,d,e){var a,f={loading:function(b){a||(a=new d({x:0,width:6==c.UA.ie?c.DOM.docWidth():"100%",y:0,zIndex:e.baseZIndex(e.zIndexManager.LOADING),prefixCls:b+"editor-",elCls:b+"editor-global-loading"}));a.set("height",c.DOM.docHeight());a.show();a.loading()},unloading:function(){a.hide()}};return{useDialog:function(b,a,e,g){b.focus();var d=b.get("prefixCls");b.getControl(a+"/dialog")?setTimeout(function(){b.showDialog(a,g)},0):(f.loading(d),c.use("editor/plugin/"+
a+"/dialog",function(c,d){f.unloading();b.addControl(a+"/dialog",new d(b,e));b.showDialog(a,g)}))}}},{requires:["overlay","editor"]});
