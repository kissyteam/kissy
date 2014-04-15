/*
Copyright 2014, KISSY v5.0.0
MIT Licensed
build time: Apr 15 17:47
*/
KISSY.add("editor/plugin/fore-color",["./color/btn","./fore-color/cmd"],function(d,b){function c(a){this.config=a||{}}var e=b("./color/btn"),f=b("./fore-color/cmd");d.augment(c,{pluginRenderUI:function(a){f.init(a);e.init(a,{cmdType:"foreColor",defaultColor:"rgb(204, 0, 0)",tooltip:"\u6587\u672c\u989c\u8272"})}});return c});
