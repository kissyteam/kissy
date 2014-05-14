/*
Copyright 2014, KISSY v5.0.0
MIT Licensed
build time: May 14 22:22
*/
KISSY.add("editor/plugin/ordered-list",["./list-utils/btn","./ordered-list/cmd"],function(e,a){function b(){}var c=a("./list-utils/btn"),d=a("./ordered-list/cmd");b.prototype={pluginRenderUI:function(a){d.init(a);c.init(a,{cmdType:"insertOrderedList",buttonId:"orderedList",menu:{width:75,children:[{content:"1,2,3...",value:"decimal"},{content:"a,b,c...",value:"lower-alpha"},{content:"A,B,C...",value:"upper-alpha"},{content:"i,ii,iii...",value:"lower-roman"},{content:"I,II,III...",value:"upper-roman"}]},
tooltip:"\u6709\u5e8f\u5217\u8868"})}};return b});
