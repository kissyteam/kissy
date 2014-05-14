/*
Copyright 2014, KISSY v5.0.0
MIT Licensed
build time: May 14 22:19
*/
KISSY.add("editor/plugin/fore-color",["./color/btn","./fore-color/cmd"],function(f,b){function c(a){this.config=a||{}}var d=b("./color/btn"),e=b("./fore-color/cmd");c.prototype={pluginRenderUI:function(a){e.init(a);d.init(a,{cmdType:"foreColor",defaultColor:"rgb(204, 0, 0)",tooltip:"\u6587\u672c\u989c\u8272"})}};return c});
