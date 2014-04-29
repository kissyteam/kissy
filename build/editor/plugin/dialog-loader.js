/*
Copyright 2014, KISSY v5.0.0
MIT Licensed
build time: Apr 29 15:01
*/
KISSY.add("editor/plugin/dialog-loader",["editor","overlay","dom"],function(f,c){var d=c("editor"),h=c("overlay"),e=c("dom"),a,g={loading:function(b){a||(a=new h({x:0,width:6===f.UA.ie?e.docWidth():"100%",y:0,zIndex:d.baseZIndex(d.ZIndexManager.LOADING),prefixCls:b+"editor-",elCls:b+"editor-global-loading"}));a.set("height",e.docHeight());a.show();a.loading()},unloading:function(){a.hide()}};return{useDialog:function(b,a,c,d){b.focus();var e=b.get("prefixCls");b.getControl(a+"/dialog")?setTimeout(function(){b.showDialog(a,
d)},0):(g.loading(e),f.use("editor/plugin/"+a+"/dialog",function(e,f){g.unloading();b.addControl(a+"/dialog",new f(b,c));b.showDialog(a,d)}))}}});
