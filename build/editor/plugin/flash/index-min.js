/*
Copyright 2012, KISSY UI Library v1.30dev
MIT Licensed
build time: Jun 15 17:22
*/
KISSY.add("editor/plugin/flash/index",function(g,h,i,f){function b(d){this.config=d||{}}g.augment(b,{renderUI:function(d){var e=d.htmlDataProcessor;e.dataFilter.addRules({tags:{object:function(a){var c;if(!a.getAttribute("classid")){var b=a.childNodes;for(c=0;c<b.length;c++)if("embed"==b[c].nodeName)if(f.isFlashEmbed(b[c][c]))break;else return e.createFakeParserElement(a,"ke_flash","flash",!0);return null}return e.createFakeParserElement(a,"ke_flash","flash",!0)},embed:function(a){return f.isFlashEmbed(a)?
e.createFakeParserElement(a,"ke_flash","flash",!0):null}}},5);var b=new i({editor:d,cls:"ke_flash",type:"flash",pluginConfig:this.config,bubbleId:"flash",contextMenuId:"flash",contextMenuHandlers:{"Flash属性":function(){var a=this.get("editorSelectedEl");a&&b.show(a)}}});d.addButton("flash",{tooltip:"插入Flash",listeners:{click:function(){b.show()}},mode:h.WYSIWYG_MODE})}});return b},{requires:["editor","../flashCommon/baseClass","../flashCommon/utils"]});
