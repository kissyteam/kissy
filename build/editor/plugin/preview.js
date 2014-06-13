/*
Copyright 2014, KISSY v5.0.0
MIT Licensed
build time: Jun 13 11:48
*/
KISSY.add("editor/plugin/preview",["./button","util"],function(j,c,k,h){function e(){}var g=window;c("./button");var i=c("util");e.prototype={pluginRenderUI:function(c){c.addButton("preview",{tooltip:"\u9884\u89c8",listeners:{click:function(){var b,a,f;try{var d=g.screen;a=Math.round(0.7*d.height);f=Math.round(0.1*d.width);b=Math.round(0.8*d.width)}catch(e){b=640,a=420,f=80}d=i.substitute(c.getDocHtml(),{title:"\u9884\u89c8"});b=g.open("","","toolbar=yes,location=no,status=yes,menubar=yes,scrollbars=yes,resizable=yes,width="+
b+",height="+a+",left="+f);a=b.document;a.open();a.write(d);a.close();b.focus()}}})}};h.exports=e});
