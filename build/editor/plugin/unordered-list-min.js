/*
Copyright 2014, KISSY v1.47
MIT Licensed
build time: May 22 12:26
*/
KISSY.add("editor/plugin/unordered-list",["./list-utils/btn","./unordered-list/cmd"],function(c,a){function b(){}var d=a("./list-utils/btn"),e=a("./unordered-list/cmd");c.augment(b,{pluginRenderUI:function(a){e.init(a);d.init(a,{cmdType:"insertUnorderedList",buttonId:"unorderedList",menu:{width:75,children:[{content:"\u25cf \u5706\u70b9",value:"disc"},{content:"\u25cb \u5706\u5708",value:"circle"},{content:"\u25a0 \u65b9\u5757",value:"square"}]},tooltip:"\u65e0\u5e8f\u5217\u8868"})}});return b});
