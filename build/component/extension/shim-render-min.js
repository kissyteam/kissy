/*
Copyright 2013, KISSY UI Library v1.40dev
MIT Licensed
build time: Aug 13 18:48
*/
KISSY.add("component/extension/shim-render",function(){function a(){}a.prototype.__createDom=function(){this.$el.prepend("<iframe style='position: absolute;border: none;width: expression(this.parentNode.clientWidth);top: 0;opacity: 0;filter: alpha(opacity=0);left: 0;z-index: -1;height: expression(this.parentNode.clientHeight);'/>")};return a});
