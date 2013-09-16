/*
Copyright 2013, KISSY v1.40dev
MIT Licensed
build time: Sep 16 15:07
*/
KISSY.add("component/extension/shim",function(a){function b(){}var a=6===a.UA.ie,c="<iframe style='position: absolute;border: none;width: "+(a?"expression(this.parentNode.clientWidth)":"100%")+";top: 0;opacity: 0;filter: alpha(opacity=0);left: 0;z-index: -1;height: "+(a?"expression(this.parentNode.clientHeight)":"100%")+";'/>";b.ATTRS={shim:{value:a}};b.prototype.__createDom=function(){this.get("shim")&&this.get("el").prepend(c)};return b});
