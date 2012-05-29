/*
Copyright 2012, KISSY UI Library v1.30dev
MIT Licensed
build time: May 29 14:44
*/
KISSY.add("editor/plugin/preview/index",function(){var e=window;return{init:function(f){f.addButton({title:"预览",contentCls:"ke-toolbar-preview"},{offClick:function(){var c=this.get("editor");try{var d=e.screen,b=Math.round(0.8*d.width),a=Math.round(0.7*d.height),g=Math.round(0.1*d.width)}catch(f){b=640,a=420,g=80}c=c.getDocHtml().replace(/\${title}/,"预览");b=e.open("","","toolbar=yes,location=no,status=yes,menubar=yes,scrollbars=yes,resizable=yes,width="+b+",height="+a+",left="+g);a=b.document;a.open();
a.write(c);a.close();b.focus()}})}}});
