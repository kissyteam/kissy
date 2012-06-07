/*
Copyright 2012, KISSY UI Library v1.30dev
MIT Licensed
build time: Jun 7 15:13
*/
KISSY.add("editor/plugin/pageBreak/index",function(h,i,j){var k=h.Node;return{init:function(f){j.init(f);var g=f.htmlDataProcessor;(g&&g.dataFilter).addRules({tags:{div:function(b){var e=b.getAttribute("style"),a;if(e)for(var c=b.childNodes,d=0;d<c.length;d++)1==c[d].nodeType&&(a=c[d]);if((a=a&&"span"==a.nodeName&&a.getAttribute("style"))&&/page-break-after\s*:\s*always/i.test(e)&&/display\s*:\s*none/i.test(a))return g.createFakeParserElement(b,"ke_pagebreak","div")}}});f.addButton("pageBreak",{tooltip:"分页",
mode:i.WYSIWYG_MODE},{offClick:function(){var b=this.get("editor"),e=new k('<div style="page-break-after: always; "><span style="DISPLAY:none">&nbsp;</span></div>',null,b.get("document")[0]),e=b.createFakeElement(e,"ke_pagebreak","div",!1,'<div style="page-break-after: always; "><span style="DISPLAY:none">&nbsp;</span></div>'),a=b.getSelection();if(a=a&&a.getRanges()[0]){b.execCommand("save");for(var c=a.startContainer,d=c;"body"!==c.nodeName();)d=c,c=c.parent();a.collapse(!0);a.splitElement(d);e.insertAfter(d);
b.execCommand("save")}}})}}},{requires:["editor","../fakeObjects/"]});
