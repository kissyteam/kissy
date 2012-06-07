/*
Copyright 2012, KISSY UI Library v1.30dev
MIT Licensed
build time: Jun 7 15:13
*/
KISSY.add("editor/plugin/xiamiMusic/index",function(l,m,n,i){function h(){h.superclass.constructor.apply(this,arguments)}l.extend(h,n,{_updateTip:function(c,f){var d=this.get("editor").restoreRealElement(f);d&&(c.html(f.attr("title")),c.attr("href",this._getFlashUrl(d)))}});return{init:function(c){function f(a){return/xiami\.com/i.test(a)}var d=c.htmlDataProcessor,j=d&&d.dataFilter;j&&j.addRules({tags:{object:function(a){var c=a.getAttribute("title"),b,e;b=a.getAttribute("classid");var g=a.childNodes;
if(!b){for(b=0;b<g.length;b++)if(e=g[b],"embed"==e.nodeName){if(!i.isFlashEmbed(e))break;if(f(e.attributes.src))return d.createFakeParserElement(a,"ke_xiami","xiamiMusic",!0,{title:c})}return null}for(b=0;b<g.length;b++)if(e=g[b],"param"==e.nodeName&&"movie"==e.getAttribute("name")&&f(e.getAttribute("value")))return d.createFakeParserElement(a,"ke_xiami","xiamiMusic",!0,{title:c})},embed:function(a){if(i.isFlashEmbed(a)&&f(a.getAttribute("src")))return d.createFakeParserElement(a,"ke_xiami","xiamiMusic",
!0,{title:a.getAttribute("title")})}}},4);var k=new h({editor:c,cls:"ke_xiami",type:"xiamiMusic",contextMenuId:"xiami-contextmenu",contextMenuHandlers:{"虾米属性":function(){var a=this.get("editorSelectedEl");a&&k.show(a)}}});c.addButton("xiamiMusic",{tooltip:"插入虾米音乐",mode:m.WYSIWYG_MODE},{offClick:function(){k.show()}})}}},{requires:["editor","../flashCommon/baseClass","../flashCommon/utils"]});
