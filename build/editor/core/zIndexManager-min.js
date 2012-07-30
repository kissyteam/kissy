/*
Copyright 2012, KISSY UI Library v1.40dev
MIT Licensed
build time: Jul 30 23:50
*/
KISSY.add("editor/core/zIndexManager",function(a){var b=a.Editor,a=b.zIndexManager={BUBBLE_VIEW:1100,POPUP_MENU:1200,STORE_FLASH_SHOW:99999,MAXIMIZE:900,OVERLAY:9999,LOADING:11E3,LOADING_CANCEL:12E3,SELECT:1200};b.baseZIndex=function(a){return(b.Config.baseZIndex||1E4)+a};return a},{requires:["./base"]});
