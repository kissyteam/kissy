/*
Copyright 2014, KISSY v5.0.0
MIT Licensed
build time: May 14 22:23
*/
KISSY.add("editor/plugin/unordered-list",["./list-utils/btn","./unordered-list/cmd"],function(e,a){function b(){}var c=a("./list-utils/btn"),d=a("./unordered-list/cmd");b.prototype={pluginRenderUI:function(a){d.init(a);c.init(a,{cmdType:"insertUnorderedList",buttonId:"unorderedList",menu:{width:75,children:[{content:"\u25cf \u5706\u70b9",value:"disc"},{content:"\u25cb \u5706\u5708",value:"circle"},{content:"\u25a0 \u65b9\u5757",value:"square"}]},tooltip:"\u65e0\u5e8f\u5217\u8868"})}};return b});
