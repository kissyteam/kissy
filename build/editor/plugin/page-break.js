/*
Copyright 2014, KISSY v5.0.0
MIT Licensed
build time: May 14 22:22
*/
KISSY.add("editor/plugin/page-break",["editor","./fake-objects","./button","node"],function(k,b){function g(){}var h=b("editor"),i=b("./fake-objects");b("./button");var j=b("node");g.prototype={pluginRenderUI:function(a){i.init(a);var b=a.htmlDataProcessor;(b&&b.dataFilter).addRules({tags:{div:function(a){var d=a.getAttribute("style"),c;if(d)for(var e=a.childNodes,f=0;f<e.length;f++)1===e[f].nodeType&&(c=e[f]);if((c=c&&"span"===c.nodeName&&c.getAttribute("style"))&&/page-break-after\s*:\s*always/i.test(d)&&
/display\s*:\s*none/i.test(c))return b.createFakeParserElement(a,"ke_pagebreak","div")}}});a.addButton("pageBreak",{tooltip:"\u5206\u9875",listeners:{click:function(){var b=new j('<div style="page-break-after: always; "><span style="DISPLAY:none">&nbsp;</span></div>',null,a.get("document")[0]),b=a.createFakeElement(b,"ke_pagebreak","div",!1,'<div style="page-break-after: always; "><span style="DISPLAY:none">&nbsp;</span></div>');a.focus();var d=a.getSelection();if(d=d&&d.getRanges()[0]){a.execCommand("save");
for(var c=d.startContainer,e=c;"body"!==c.nodeName();)e=c,c=c.parent();d.collapse(!0);d.splitElement(e);b.insertAfter(e);a.execCommand("save")}}},mode:h.Mode.WYSIWYG_MODE})}};return g});
