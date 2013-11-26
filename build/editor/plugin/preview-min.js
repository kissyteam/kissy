/*
Copyright 2013, KISSY v1.50dev
MIT Licensed
build time: Nov 27 00:01
*/
KISSY.add("editor/plugin/preview",["./button"],function(e,f){function b(){}var g=window;f("./button");e.augment(b,{pluginRenderUI:function(b){b.addButton("preview",{tooltip:"\u9884\u89c8",listeners:{click:function(){try{var c=g.screen,d=Math.round(0.8*c.width),a=Math.round(0.7*c.height),h=Math.round(0.1*c.width)}catch(f){d=640,a=420,h=80}c=e.substitute(b.getDocHtml(),{title:"\u9884\u89c8"});d=g.open("","","toolbar=yes,location=no,status=yes,menubar=yes,scrollbars=yes,resizable=yes,width="+d+",height="+a+",left="+h);
a=d.document;a.open();a.write(c);a.close();d.focus()}}})}});return b});
