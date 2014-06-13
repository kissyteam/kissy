/*
Copyright 2014, KISSY v5.0.0
MIT Licensed
build time: Jun 13 11:43
*/
KISSY.add("editor/plugin/back-color",["./color/btn","./back-color/cmd"],function(g,b,h,d){function c(a){this.config=a||{}}var e=b("./color/btn"),f=b("./back-color/cmd");c.prototype={pluginRenderUI:function(a){f.init(a);e.init(a,{defaultColor:"rgb(255, 217, 102)",cmdType:"backColor",tooltip:"\u80cc\u666f\u989c\u8272"})}};d.exports=c});
