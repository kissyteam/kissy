/*
Copyright 2013, KISSY UI Library v1.30
MIT Licensed
build time: Feb 17 17:29
*/
KISSY.add("editor/plugin/page-break/index",function(g,i,j){function h(){}var k=g.Node;g.augment(h,{pluginRenderUI:function(a){j.init(a);var d=a.htmlDataProcessor;(d&&d.dataFilter).addRules({tags:{div:function(a){var c=a.getAttribute("style"),b;if(c)for(var e=a.childNodes,f=0;f<e.length;f++)1==e[f].nodeType&&(b=e[f]);if((b=b&&"span"==b.nodeName&&b.getAttribute("style"))&&/page-break-after\s*:\s*always/i.test(c)&&/display\s*:\s*none/i.test(b))return d.createFakeParserElement(a,"ke_pagebreak","div")}}});
a.addButton("pageBreak",{tooltip:"分页",listeners:{click:function(){var d=new k('<div style="page-break-after: always; "><span style="DISPLAY:none">&nbsp;</span></div>',null,a.get("document")[0]),d=a.createFakeElement(d,"ke_pagebreak","div",!1,'<div style="page-break-after: always; "><span style="DISPLAY:none">&nbsp;</span></div>');a.focus();var c=a.getSelection();if(c=c&&c.getRanges()[0]){a.execCommand("save");for(var b=c.startContainer,e=b;"body"!==b.nodeName();)e=b,b=b.parent();c.collapse(!0);c.splitElement(e);
d.insertAfter(e);a.execCommand("save")}}},mode:i.WYSIWYG_MODE})}});return h},{requires:["editor","../fake-objects/"]});
