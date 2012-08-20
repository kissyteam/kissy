/*
Copyright 2012, KISSY UI Library v1.30rc
MIT Licensed
build time: Aug 20 15:37
*/
KISSY.add("editor/plugin/local-storage/index",function(d,c,e,f){if(!d.UA.ie&&window.localStorage)return window.localStorage;var g=c.Utils.debugUrl("plugin/local-storage/swfstore.swf?t="+ +new Date),a=new f({movie:g,flashVars:{useCompression:!0},methods:["setItem","removeItem","getItem","setMinDiskSpace","getValueOf"]});a.swf.height=138;var b=new e({width:"0px",prefixCls:"ks-editor-",elStyle:{overflow:"hidden"},content:"<h1 style='border:1px solid black;border-bottom:none;background:white;text-align:center;'>请点击允许</h1>",
zIndex:c.baseZIndex(c.zIndexManager.STORE_FLASH_SHOW)});b.render();b.get("contentEl").append(a.swf);b.center();b.show();a.on("pending",function(){b.set("width",215);b.center();b.show();setTimeout(function(){a.retrySave()},1E3)});a.on("save",function(){b.set("width",0)});var h=a.setItem;d.mix(a,{_ke:1,getItem:function(a){return this.getValueOf(a)},retrySave:function(){this.setItem(this.lastSave.k,this.lastSave.v)},setItem:function(a,b){this.lastSave={k:a,v:b};h.call(this,a,b)}});a.on("contentReady",
function(){a._ready=1});return a},{attach:!1,requires:["editor","overlay","../flash-bridge/"]});
