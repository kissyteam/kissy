/*
Copyright 2014, KISSY v5.0.0
MIT Licensed
build time: Jun 13 11:47
*/
KISSY.add("editor/plugin/local-storage",["editor","overlay","./flash-bridge","util","ua"],function(d,a,e,f){var d=a("editor"),e=a("overlay"),h=a("./flash-bridge"),g=a("util"),a=a("ua").ieMode;if((!a||8<a)&&window.localStorage)f.exports=window.localStorage;else{var a=d.Utils.debugUrl("plugin/local-storage/assets/swfstore.swf?refresh="+ +new Date),i={width:215,border:"1px solid red"},j={width:0,border:"none"},b=new e({prefixCls:"ks-editor-",elStyle:{background:"white"},width:"0px",content:'<h1 style="text-align:center;">\u8bf7\u70b9\u51fb\u5141\u8bb8</h1><div class="storage-container"></div>',
zIndex:d.baseZIndex(d.ZIndexManager.STORE_FLASH_SHOW)});b.render();b.show();var c=new h({src:a,render:b.get("contentEl").one(".storage-container"),params:{flashVars:{useCompression:!0}},attrs:{height:138,width:"100%"},methods:["setItem","removeItem","getItem","setMinDiskSpace","getValueOf"]});g.ready(function(){setTimeout(function(){b.center()},0)});c.on("pending",function(){b.get("el").css(i);b.center();b.show();setTimeout(function(){c.retrySave()},1E3)});c.on("save",function(){b.get("el").css(j)});
var k=c.setItem;g.mix(c,{_ke:1,getItem:function(a){return this.getValueOf(a)},retrySave:function(){this.setItem(this.lastSave.k,this.lastSave.v)},setItem:function(a,b){this.lastSave={k:a,v:b};k.call(this,a,b)}});c.on("contentReady",function(){c._ready=1});f.exports=c}});
