/*
Copyright 2014, KISSY v5.0.0
MIT Licensed
build time: May 14 22:21
*/
KISSY.add("editor/plugin/local-storage",["editor","overlay","./flash-bridge","util","ua"],function(l,c){var e=c("editor"),g=c("overlay"),h=c("./flash-bridge"),f=c("util"),d=c("ua").ieMode;if((!d||8<d)&&window.localStorage)return window.localStorage;var d=e.Utils.debugUrl("plugin/local-storage/assets/swfstore.swf?t="+ +new Date),i={width:215,border:"1px solid red"},j={width:0,border:"none"},a=new g({prefixCls:"ks-editor-",elStyle:{background:"white"},width:"0px",content:'<h1 style="text-align:center;">\u8bf7\u70b9\u51fb\u5141\u8bb8</h1><div class="storage-container"></div>',
zIndex:e.baseZIndex(e.ZIndexManager.STORE_FLASH_SHOW)});a.render();a.show();var b=new h({src:d,render:a.get("contentEl").one(".storage-container"),params:{flashVars:{useCompression:!0}},attrs:{height:138,width:"100%"},methods:["setItem","removeItem","getItem","setMinDiskSpace","getValueOf"]});f.ready(function(){setTimeout(function(){a.center()},0)});b.on("pending",function(){a.get("el").css(i);a.center();a.show();setTimeout(function(){b.retrySave()},1E3)});b.on("save",function(){a.get("el").css(j)});
var k=b.setItem;f.mix(b,{_ke:1,getItem:function(a){return this.getValueOf(a)},retrySave:function(){this.setItem(this.lastSave.k,this.lastSave.v)},setItem:function(a,b){this.lastSave={k:a,v:b};k.call(this,a,b)}});b.on("contentReady",function(){b._ready=1});return b});
