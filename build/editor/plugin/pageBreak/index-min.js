/*
Copyright 2012, KISSY UI Library v1.30dev
MIT Licensed
build time: Jun 8 00:39
*/
KISSY.add("editor/plugin/pageBreak/index",function(g,h,i){var j=g.Node;return{init:function(a){i.init(a);var d=a.htmlDataProcessor;(d&&d.dataFilter).addRules({tags:{div:function(a){var c=a.getAttribute("style"),b;if(c)for(var e=a.childNodes,f=0;f<e.length;f++)1==e[f].nodeType&&(b=e[f]);if((b=b&&"span"==b.nodeName&&b.getAttribute("style"))&&/page-break-after\s*:\s*always/i.test(c)&&/display\s*:\s*none/i.test(b))return d.createFakeParserElement(a,"ke_pagebreak","div")}}});a.addButton("pageBreak",{tooltip:"分页",
listeners:{click:{fn:function(){var d=new j('<div style="page-break-after: always; "><span style="DISPLAY:none">&nbsp;</span></div>',null,a.get("document")[0]),d=a.createFakeElement(d,"ke_pagebreak","div",!1,'<div style="page-break-after: always; "><span style="DISPLAY:none">&nbsp;</span></div>'),c=a.getSelection();if(c=c&&c.getRanges()[0]){a.execCommand("save");for(var b=c.startContainer,e=b;"body"!==b.nodeName();)e=b,b=b.parent();c.collapse(!0);c.splitElement(e);d.insertAfter(e);a.execCommand("save")}}}},
mode:h.WYSIWYG_MODE})}}},{requires:["editor","../fakeObjects/"]});
