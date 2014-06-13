/*
Copyright 2014, KISSY v5.0.0
MIT Licensed
build time: Jun 13 11:48
*/
KISSY.add("editor/plugin/page-break",["editor","./fake-objects","./button","node"],function(l,b,m,h){function g(){}var i=b("editor"),j=b("./fake-objects");b("./button");var k=b("node");g.prototype={pluginRenderUI:function(a){j.init(a);var b=a.htmlDataProcessor;(b&&b.dataFilter).addRules({tags:{div:function(a){var d=a.getAttribute("style"),c;if(d)for(var e=a.childNodes,f=0;f<e.length;f++)1===e[f].nodeType&&(c=e[f]);if((c=c&&"span"===c.nodeName&&c.getAttribute("style"))&&/page-break-after\s*:\s*always/i.test(d)&&
/display\s*:\s*none/i.test(c))return b.createFakeParserElement(a,"ke_pagebreak","div")}}});a.addButton("pageBreak",{tooltip:"\u5206\u9875",listeners:{click:function(){var b=k('<div style="page-break-after: always; "><span style="DISPLAY:none">&nbsp;</span></div>',a.get("document")[0]),b=a.createFakeElement(b,"ke_pagebreak","div",!1,'<div style="page-break-after: always; "><span style="DISPLAY:none">&nbsp;</span></div>');a.focus();var d=a.getSelection();if(d=d&&d.getRanges()[0]){a.execCommand("save");for(var c=
d.startContainer,e=c;"body"!==c.nodeName();)e=c,c=c.parent();d.collapse(!0);d.splitElement(e);b.insertAfter(e);a.execCommand("save")}}},mode:i.Mode.WYSIWYG_MODE})}};h.exports=g});
