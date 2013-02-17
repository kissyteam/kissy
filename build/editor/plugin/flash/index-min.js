/*
Copyright 2013, KISSY UI Library v1.30
MIT Licensed
build time: Feb 17 17:29
*/
KISSY.add("editor/plugin/flash/index",function(g,h,i,e,j){function f(a){this.config=a||{}}g.augment(f,{pluginRenderUI:function(a){j.init(a);var c=a.htmlDataProcessor;c.dataFilter.addRules({tags:{object:function(d){var a;if(!d.getAttribute("classid")){var b=d.childNodes;for(a=0;a<b.length;a++)if("embed"==b[a].nodeName)if(e.isFlashEmbed(b[a][a]))break;else return c.createFakeParserElement(d,"ke_flash","flash",!0);return null}return c.createFakeParserElement(d,"ke_flash","flash",!0)},embed:function(a){return e.isFlashEmbed(a)?
c.createFakeParserElement(a,"ke_flash","flash",!0):null}}},5);var b=new i({editor:a,cls:"ke_flash",type:"flash",pluginConfig:this.config,bubbleId:"flash",contextMenuId:"flash",contextMenuHandlers:{"Flash属性":function(){var a=this.get("editorSelectedEl");a&&b.show(a)}}});this.flashControl=b;a.addButton("flash",{tooltip:"插入Flash",listeners:{click:function(){b.show()}},mode:h.WYSIWYG_MODE})}});return f},{requires:["editor","../flash-common/baseClass","../flash-common/utils","../fake-objects/"]});
