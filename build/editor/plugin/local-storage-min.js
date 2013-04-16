/*
Copyright 2013, KISSY UI Library v1.40dev
MIT Licensed
build time: Apr 17 00:19
*/
KISSY.add("editor/plugin/local-storage",function(c,d,e,f){if(!c.UA.ie&&window.localStorage)return window.localStorage;var g=d.Utils.debugUrl("plugin/local-storage/assets/swfstore.swf?t="+ +new Date),h={width:215,border:"1px solid red"},i={width:0,border:"none"},a=new e({prefixCls:"ks-editor-",elStyle:{background:"white"},width:"0px",content:"<h1 style='text-align:center;'>\u8bf7\u70b9\u51fb\u5141\u8bb8</h1><div class='storage-container'></div>",zIndex:d.baseZIndex(d.zIndexManager.STORE_FLASH_SHOW)});a.render();a.show();var b=
new f({src:g,render:a.get("contentEl").one(".storage-container"),params:{flashVars:{useCompression:!0}},attrs:{height:138,width:"100%"},methods:["setItem","removeItem","getItem","setMinDiskSpace","getValueOf"]});c.ready(function(){setTimeout(function(){a.center()},0)});b.on("pending",function(){a.get("el").css(h);a.center();a.show();setTimeout(function(){b.retrySave()},1E3)});b.on("save",function(){a.get("el").css(i)});var j=b.setItem;c.mix(b,{_ke:1,getItem:function(a){return this.getValueOf(a)},
retrySave:function(){this.setItem(this.lastSave.k,this.lastSave.v)},setItem:function(a,b){this.lastSave={k:a,v:b};j.call(this,a,b)}});b.on("contentReady",function(){b._ready=1});return b},{requires:["editor","overlay","./flash-bridge"]});
