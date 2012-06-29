/*
Copyright 2012, KISSY UI Library v1.30rc
MIT Licensed
build time: Jun 29 16:29
*/
KISSY.add("editor/plugin/flash/index",function(h,i,j,f){function g(b){this.config=b||{}}h.augment(g,{renderUI:function(b){var d=b.htmlDataProcessor;d.dataFilter.addRules({tags:{object:function(a){var c;if(!a.getAttribute("classid")){var b=a.childNodes;for(c=0;c<b.length;c++)if("embed"==b[c].nodeName)if(f.isFlashEmbed(b[c][c]))break;else return d.createFakeParserElement(a,"ke_flash","flash",!0);return null}return d.createFakeParserElement(a,"ke_flash","flash",!0)},embed:function(a){return f.isFlashEmbed(a)?
d.createFakeParserElement(a,"ke_flash","flash",!0):null}}},5);var e=new j({editor:b,cls:"ke_flash",type:"flash",pluginConfig:this.config,bubbleId:"flash",contextMenuId:"flash",contextMenuHandlers:{"Flash属性":function(){var a=this.get("editorSelectedEl");a&&e.show(a)}}});this.flashControl=e;b.addButton("flash",{tooltip:"插入Flash",listeners:{click:function(){e.show()}},mode:i.WYSIWYG_MODE})}});return g},{requires:["editor","../flashCommon/baseClass","../flashCommon/utils"]});
