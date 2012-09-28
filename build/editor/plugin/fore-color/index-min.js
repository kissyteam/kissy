/*
Copyright 2012, KISSY UI Library v1.30rc
MIT Licensed
build time: Sep 28 16:36
*/
KISSY.add("editor/plugin/fore-color/index",function(c,f,d,e){function b(a){this.config=a||{}}c.augment(b,{renderUI:function(a){e.init(a);a.addButton("foreColor",{cmdType:"foreColor",tooltip:"文本颜色",pluginConfig:this.config},d)}});return b},{requires:["editor","../color/btn","./cmd"]});
