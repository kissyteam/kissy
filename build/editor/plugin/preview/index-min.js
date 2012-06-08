/*
Copyright 2012, KISSY UI Library v1.30dev
MIT Licensed
build time: Jun 8 00:39
*/
KISSY.add("editor/plugin/preview/index",function(){var d=window;return{init:function(e){e.addButton("preview",{tooltip:"预览",listeners:{click:{fn:function(){try{var b=d.screen,c=Math.round(0.8*b.width),a=Math.round(0.7*b.height),f=Math.round(0.1*b.width)}catch(g){c=640,a=420,f=80}b=e.getDocHtml().replace(/\${title}/,"预览");c=d.open("","","toolbar=yes,location=no,status=yes,menubar=yes,scrollbars=yes,resizable=yes,width="+c+",height="+a+",left="+f);a=c.document;a.open();a.write(b);a.close();c.focus()}}}})}}});
