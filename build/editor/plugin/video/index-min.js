/*
Copyright 2012, KISSY UI Library v1.30dev
MIT Licensed
build time: Jun 19 16:41
*/
KISSY.add("editor/plugin/video/index",function(l,m,j,n){function c(e){this.config=e}l.augment(c,{renderUI:function(e){function g(b){for(var a=0;a<h.length;a++){var d=h[a];if(d.reg.test(b))return d}}var f=e.htmlDataProcessor,c=f&&f.dataFilter,h=[],i=this.config;i.providers&&h.push.apply(h,i.providers);i.getProvider=g;c&&c.addRules({elements:{object:function(b){var a=b.getAttribute("classid"),d=b.childNodes;if(!a){for(a=0;a<d.length;a++)if("embed"==d[a].name){if(!j.isFlashEmbed(d[a]))break;if(g(d[a].getAttribute("src")))return f.createFakeParserElement(b,
"ke_video","video",!0)}return null}for(a=0;a<d.length;a++){var c=d[a];if("param"==c.nodeName&&"movie"==c.getAttribute("name").toLowerCase()&&g(c.getAttribute("value")))return f.createFakeParserElement(b,"ke_video","video",!0)}},embed:function(b){if(!j.isFlashEmbed(b))return null;if(g(b.getAttribute("src")))return f.createFakeParserElement(b,"ke_video","video",!0)}}},4);var k=new n({editor:e,cls:"ke_video",type:"video",pluginConfig:this.config,bubbleId:"video",contextMenuId:"video",contextMenuHandlers:{"视频属性":function(){var b=
this.get("editorSelectedEl");b&&k.show(b)}}});e.addButton("video",{tooltip:"插入视频",listeners:{click:function(){k.show()}},mode:m.WYSIWYG_MODE})}});return c},{requires:["editor","../flashCommon/utils","../flashCommon/baseClass"]});
