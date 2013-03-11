/*
Copyright 2013, KISSY UI Library v1.40dev
MIT Licensed
build time: Mar 11 10:34
*/
KISSY.add("editor/plugin/back-color/index",function(c,f,d,e){function b(a){this.config=a||{}}c.augment(b,{pluginRenderUI:function(a){e.init(a);d.init(a,{defaultColor:"rgb(255, 217, 102)",cmdType:"backColor",tooltip:"\u80cc\u666f\u989c\u8272"})}});return b},{requires:["editor","../color/btn","./cmd"]});
