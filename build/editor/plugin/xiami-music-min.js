/*
Copyright 2013, KISSY UI Library v1.40dev
MIT Licensed
build time: Jul 3 13:55
*/
KISSY.add("editor/plugin/xiami-music",function(c,k,l,j,m){function i(){i.superclass.constructor.apply(this,arguments)}function h(b){this.config=b||{}}c.extend(i,l,{_updateTip:function(b,g){var f=this.get("editor").restoreRealElement(g);f&&(b.html(g.attr("title")),b.attr("href",this._getFlashUrl(f)))}});c.augment(h,{pluginRenderUI:function(b){function g(a){return/xiami\.com/i.test(a)}m.init(b);var f=b.htmlDataProcessor,c=f&&f.dataFilter;c&&c.addRules({tags:{object:function(a){var b=a.getAttribute("title"),
d,e;d=a.getAttribute("classid");var c=a.childNodes;if(!d){for(d=0;d<c.length;d++)if(e=c[d],"embed"==e.nodeName){if(!j.isFlashEmbed(e))break;if(g(e.attributes.src))return f.createFakeParserElement(a,"ke_xiami","xiami-music",!0,{title:b})}return null}for(d=0;d<c.length;d++)if(e=c[d],"param"==e.nodeName&&"movie"==e.getAttribute("name").toLowerCase()&&g(e.getAttribute("value")||e.getAttribute("VALUE")))return f.createFakeParserElement(a,"ke_xiami","xiami-music",!0,{title:b})},embed:function(a){if(j.isFlashEmbed(a)&&
g(a.getAttribute("src")))return f.createFakeParserElement(a,"ke_xiami","xiami-music",!0,{title:a.getAttribute("title")})}}},4);var h=new i({editor:b,cls:"ke_xiami",type:"xiami-music",bubbleId:"xiami",pluginConfig:this.config,contextMenuId:"xiami",contextMenuHandlers:{"\u867e\u7c73\u5c5e\u6027":function(){var a=this.get("editorSelectedEl");a&&h.show(a)}}});b.addButton("xiamiMusic",{tooltip:"\u63d2\u5165\u867e\u7c73\u97f3\u4e50",listeners:{click:function(){h.show()}},mode:k.Mode.WYSIWYG_MODE})}});return h},{requires:["editor","./flash-common/base-class",
"./flash-common/utils","./fake-objects"]});
