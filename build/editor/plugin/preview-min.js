/*
Copyright 2014, KISSY v1.47
MIT Licensed
build time: May 22 12:25
*/
KISSY.add("editor/plugin/preview",["./button"],function(f,g){function c(){}var h=window;g("./button");f.augment(c,{pluginRenderUI:function(c){c.addButton("preview",{tooltip:"\u9884\u89c8",listeners:{click:function(){var b,a,e;try{var d=h.screen;a=Math.round(0.7*d.height);e=Math.round(0.1*d.width);b=Math.round(0.8*d.width)}catch(g){b=640,a=420,e=80}d=f.substitute(c.getDocHtml(),{title:"\u9884\u89c8"});b=h.open("","","toolbar=yes,location=no,status=yes,menubar=yes,scrollbars=yes,resizable=yes,width="+b+",height="+a+",left="+
e);a=b.document;a.open();a.write(d);a.close();b.focus()}}})}});return c});
