/*
Copyright 2013, KISSY UI Library v1.30
MIT Licensed
build time: Feb 17 17:29
*/
KISSY.add("editor/plugin/video/index",function(l,m,j,n,o){function e(c){this.config=c}l.augment(e,{pluginRenderUI:function(c){function g(b){for(var a=0;a<h.length;a++){var d=h[a];if(d.reg.test(b))return d}}o.init(c);var f=c.htmlDataProcessor,e=f&&f.dataFilter,h=[],i=this.config;i.providers&&h.push.apply(h,i.providers);i.getProvider=g;e&&e.addRules({tags:{object:function(b){var a=b.getAttribute("classid"),d=b.childNodes;if(!a){for(a=0;a<d.length;a++)if("embed"==d[a].nodeName){if(!j.isFlashEmbed(d[a]))break;
if(g(d[a].getAttribute("src")))return f.createFakeParserElement(b,"ke_video","video",!0)}return null}for(a=0;a<d.length;a++){var c=d[a];if("param"==c.nodeName&&"movie"==c.getAttribute("name").toLowerCase()&&g(c.getAttribute("value")||c.getAttribute("VALUE")))return f.createFakeParserElement(b,"ke_video","video",!0)}},embed:function(b){if(!j.isFlashEmbed(b))return null;if(g(b.getAttribute("src")))return f.createFakeParserElement(b,"ke_video","video",!0)}}},4);var k=new n({editor:c,cls:"ke_video",type:"video",
pluginConfig:this.config,bubbleId:"video",contextMenuId:"video",contextMenuHandlers:{"视频属性":function(){var b=this.get("editorSelectedEl");b&&k.show(b)}}});c.addButton("video",{tooltip:"插入视频",listeners:{click:function(){k.show()}},mode:m.WYSIWYG_MODE})}});return e},{requires:["editor","../flash-common/utils","../flash-common/baseClass","../fake-objects/"]});
