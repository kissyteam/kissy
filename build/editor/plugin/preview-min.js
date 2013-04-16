/*
Copyright 2013, KISSY UI Library v1.40dev
MIT Licensed
build time: Apr 17 00:19
*/
KISSY.add("editor/plugin/preview",function(e){function b(){}var f=window;e.augment(b,{pluginRenderUI:function(b){b.addButton("preview",{tooltip:"\u9884\u89c8",listeners:{click:function(){try{var c=f.screen,d=Math.round(0.8*c.width),a=Math.round(0.7*c.height),g=Math.round(0.1*c.width)}catch(e){d=640,a=420,g=80}c=b.getDocHTML().replace(/\${title}/,"\u9884\u89c8");d=f.open("","","toolbar=yes,location=no,status=yes,menubar=yes,scrollbars=yes,resizable=yes,width="+d+",height="+a+",left="+g);a=d.document;a.open();a.write(c);
a.close();d.focus()}}})}});return b});
