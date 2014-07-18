/*
Copyright 2014, KISSY v5.0.0
MIT Licensed
build time: Jul 18 13:53
*/
KISSY.add("component/extension/shim",["ua"],function(a,c,f,d){function b(){}var a=6===c("ua").ie,e='<iframe style="position: absolute;border: none;width: '+(a?"expression(this.parentNode.clientWidth)":"100%")+";top: 0;opacity: 0;filter: alpha(opacity=0);left: 0;z-index: -1;height: "+(a?"expression(this.parentNode.clientHeight)":"100%")+';"/>';b.ATTRS={shim:{value:a}};b.prototype.__createDom=function(){this.get("shim")&&this.get("el").prepend(e)};d.exports=b});
