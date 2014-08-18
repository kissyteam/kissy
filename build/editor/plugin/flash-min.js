/*
Copyright 2014, KISSY v1.47
MIT Licensed
build time: May 22 12:21
*/
KISSY.add("editor/plugin/flash",["editor","./flash-common/base-class","./flash-common/utils","./fake-objects","./button"],function(g,b){function e(a){this.config=a||{}}var h=b("editor"),i=b("./flash-common/base-class"),f=b("./flash-common/utils"),j=b("./fake-objects");b("./button");g.augment(e,{pluginRenderUI:function(a){j.init(a);var b=a.htmlDataProcessor;b.dataFilter.addRules({tags:{object:function(d){var a;if(!d.getAttribute("classid")){var c=d.childNodes;for(a=0;a<c.length;a++)if("embed"===c[a].nodeName)if(f.isFlashEmbed(c[a][a]))break;
else return b.createFakeParserElement(d,"ke_flash","flash",!0);return null}return b.createFakeParserElement(d,"ke_flash","flash",!0)},embed:function(a){return f.isFlashEmbed(a)?b.createFakeParserElement(a,"ke_flash","flash",!0):null}}},5);var c=new i({editor:a,cls:"ke_flash",type:"flash",pluginConfig:this.config,bubbleId:"flash",contextMenuId:"flash",contextMenuHandlers:{"Flash\u5c5e\u6027":function(){var a=this.get("editorSelectedEl");a&&c.show(a)}}});this.flashControl=c;a.addButton("flash",{tooltip:"\u63d2\u5165Flash",
listeners:{click:function(){c.show()}},mode:h.Mode.WYSIWYG_MODE})}});return e});
