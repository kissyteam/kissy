/*
Copyright 2014, KISSY v5.0.0
MIT Licensed
build time: May 14 22:17
*/
KISSY.add("editor/plugin/back-color",["./color/btn","./back-color/cmd"],function(f,b){function c(a){this.config=a||{}}var d=b("./color/btn"),e=b("./back-color/cmd");c.prototype={pluginRenderUI:function(a){e.init(a);d.init(a,{defaultColor:"rgb(255, 217, 102)",cmdType:"backColor",tooltip:"\u80cc\u666f\u989c\u8272"})}};return c});
