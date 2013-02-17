/*
Copyright 2013, KISSY UI Library v1.30
MIT Licensed
build time: Feb 17 17:29
*/
KISSY.add("editor/plugin/preview/index",function(e){function b(){}var f=window;e.augment(b,{pluginRenderUI:function(b){b.addButton("preview",{tooltip:"预览",listeners:{click:function(){try{var c=f.screen,d=Math.round(0.8*c.width),a=Math.round(0.7*c.height),g=Math.round(0.1*c.width)}catch(e){d=640,a=420,g=80}c=b.getDocHtml().replace(/\${title}/,"预览");d=f.open("","","toolbar=yes,location=no,status=yes,menubar=yes,scrollbars=yes,resizable=yes,width="+d+",height="+a+",left="+g);a=d.document;a.open();a.write(c);
a.close();d.focus()}}})}});return b});
