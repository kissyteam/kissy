/*
Copyright 2012, KISSY UI Library v1.30dev
MIT Licensed
build time: May 30 20:27
*/
KISSY.add("editor/core/focusManager",function(b){function g(){var a=this;a.__iframeFocus=k;f=a;d&&clearTimeout(d);d=setTimeout(function(){a.fire("focus")},100)}function h(){var a=this;a.__iframeFocus=l;f=m;d&&clearTimeout(d);d=setTimeout(function(){a.fire("blur")},100)}var i=b.Editor,j=b.DOM,e=b.Event,c={},d,f,b={refreshAll:function(){for(var a in c)if(c.hasOwnProperty(a)){var b=c[a].get("document")[0];b.designMode="off";b.designMode="on"}},currentInstance:function(){return f},getInstance:function(a){return c[a]},
add:function(a){var b=j._getWin(a.get("document")[0]);e.on(b,"focus",g,a);e.on(b,"blur",h,a)},register:function(a){c[a._UUID]=a},remove:function(a){delete c[a._UUID];var b=j._getWin(a.get("document")[0]);e.remove(b,"focus",g,a);e.remove(b,"blur",h,a)}},k=!0,l=!1,m=null;b.refreshAll=b.refreshAll;i.focusManager=b;i.getInstances=function(){return c};return b},{requires:["./base","./dom"]});
