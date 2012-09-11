/*
Copyright 2012, KISSY UI Library v1.40dev
MIT Licensed
build time: Sep 10 21:59
*/
KISSY.add("editor/plugin/local-storage/index",function(d,c,e,f){if(!d.UA.ie&&window.localStorage)return window.localStorage;var g=c.Utils.debugUrl("plugin/local-storage/swfstore.swf?t="+ +new Date),a=new f({movie:g,flashVars:{useCompression:!0},methods:["setItem","removeItem","getItem","setMinDiskSpace","getValueOf"]});a.swf.height=138;var h={width:215,border:"1px solid red"},i={width:0,border:"none"},b=new e({prefixCls:"ks-editor-",elStyle:{background:"white"},width:"0px",content:"<h1 style='text-align:center;'>请点击允许</h1>",
zIndex:c.baseZIndex(c.zIndexManager.STORE_FLASH_SHOW)});b.render();b.get("contentEl").append(a.swf);b.center();b.show();a.on("pending",function(){b.get("el").css(h);b.center();b.show();setTimeout(function(){a.retrySave()},1E3)});a.on("save",function(){b.get("el").css(i)});var j=a.setItem;d.mix(a,{_ke:1,getItem:function(a){return this.getValueOf(a)},retrySave:function(){this.setItem(this.lastSave.k,this.lastSave.v)},setItem:function(a,b){this.lastSave={k:a,v:b};j.call(this,a,b)}});a.on("contentReady",
function(){a._ready=1});return a},{attach:!1,requires:["editor","overlay","../flash-bridge/"]});
