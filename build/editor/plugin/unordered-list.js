/*
Copyright 2014, KISSY v5.0.0
MIT Licensed
build time: Jun 13 11:49
*/
KISSY.add("editor/plugin/unordered-list",["./list-utils/btn","./unordered-list/cmd"],function(f,a,g,c){function b(){}var d=a("./list-utils/btn"),e=a("./unordered-list/cmd");b.prototype={pluginRenderUI:function(a){e.init(a);d.init(a,{cmdType:"insertUnorderedList",buttonId:"unorderedList",menu:{width:75,children:[{content:"\u25cf \u5706\u70b9",value:"disc"},{content:"\u25cb \u5706\u5708",value:"circle"},{content:"\u25a0 \u65b9\u5757",value:"square"}]},tooltip:"\u65e0\u5e8f\u5217\u8868"})}};c.exports=b});
