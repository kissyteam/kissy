/*
Copyright 2014, KISSY v1.47
MIT Licensed
build time: May 22 12:25
*/
KISSY.add("editor/plugin/page-break",["editor","./fake-objects","./button"],function(g,c){function h(){}var i=c("editor"),j=c("./fake-objects");c("./button");var k=g.Node;g.augment(h,{pluginRenderUI:function(a){j.init(a);var c=a.htmlDataProcessor;(c&&c.dataFilter).addRules({tags:{div:function(a){var d=a.getAttribute("style"),b;if(d)for(var e=a.childNodes,f=0;f<e.length;f++)1===e[f].nodeType&&(b=e[f]);if((b=b&&"span"===b.nodeName&&b.getAttribute("style"))&&/page-break-after\s*:\s*always/i.test(d)&&
/display\s*:\s*none/i.test(b))return c.createFakeParserElement(a,"ke_pagebreak","div")}}});a.addButton("pageBreak",{tooltip:"\u5206\u9875",listeners:{click:function(){var c=new k('<div style="page-break-after: always; "><span style="DISPLAY:none">&nbsp;</span></div>',null,a.get("document")[0]),c=a.createFakeElement(c,"ke_pagebreak","div",!1,'<div style="page-break-after: always; "><span style="DISPLAY:none">&nbsp;</span></div>');a.focus();var d=a.getSelection();if(d=d&&d.getRanges()[0]){a.execCommand("save");
for(var b=d.startContainer,e=b;"body"!==b.nodeName();)e=b,b=b.parent();d.collapse(!0);d.splitElement(e);c.insertAfter(e);a.execCommand("save")}}},mode:i.Mode.WYSIWYG_MODE})}});return h});
