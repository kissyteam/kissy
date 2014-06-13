/*
Copyright 2014, KISSY v5.0.0
MIT Licensed
build time: Jun 13 11:48
*/
KISSY.add("editor/plugin/ordered-list",["./list-utils/btn","./ordered-list/cmd"],function(f,a,g,c){function b(){}var d=a("./list-utils/btn"),e=a("./ordered-list/cmd");b.prototype={pluginRenderUI:function(a){e.init(a);d.init(a,{cmdType:"insertOrderedList",buttonId:"OrderedList",menu:{width:75,children:[{content:"1,2,3...",value:"decimal"},{content:"a,b,c...",value:"lower-alpha"},{content:"A,B,C...",value:"upper-alpha"},{content:"i,ii,iii...",value:"lower-roman"},{content:"I,II,III...",value:"upper-roman"}]},
tooltip:"\u6709\u5e8f\u5217\u8868"})}};c.exports=b});
