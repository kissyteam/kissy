/*
Copyright 2014, KISSY v1.47
MIT Licensed
build time: May 22 12:24
*/
KISSY.add("editor/plugin/ordered-list",["./list-utils/btn","./ordered-list/cmd"],function(c,a){function b(){}var d=a("./list-utils/btn"),e=a("./ordered-list/cmd");c.augment(b,{pluginRenderUI:function(a){e.init(a);d.init(a,{cmdType:"insertOrderedList",buttonId:"orderedList",menu:{width:75,children:[{content:"1,2,3...",value:"decimal"},{content:"a,b,c...",value:"lower-alpha"},{content:"A,B,C...",value:"upper-alpha"},{content:"i,ii,iii...",value:"lower-roman"},{content:"I,II,III...",value:"upper-roman"}]},
tooltip:"\u6709\u5e8f\u5217\u8868"})}});return b});
