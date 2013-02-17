/*
Copyright 2013, KISSY UI Library v1.30
MIT Licensed
build time: Feb 17 17:29
*/
KISSY.add("editor/plugin/unordered-list/index",function(b,e,c,d){function a(){}b.augment(a,{pluginRenderUI:function(a){d.init(a);c.init(a,{cmdType:"insertUnorderedList",buttonId:"unorderedList",menu:{width:75,children:[{content:"● 圆点",value:"disc"},{content:"○ 圆圈",value:"circle"},{content:"■ 方块",value:"square"}]},tooltip:"无序列表"})}});return a},{requires:["editor","../list-utils/btn","./cmd"]});
