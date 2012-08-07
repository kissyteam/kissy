/*
Copyright 2012, KISSY UI Library v1.30rc
MIT Licensed
build time: Aug 7 11:46
*/
KISSY.add("editor/core/focusManager",function(c){function h(){var a=this;a.__iframeFocus=k;g=a;e&&clearTimeout(e);e=setTimeout(function(){a.fire("focus")},100)}function i(){var a=this;a.__iframeFocus=l;g=m;e&&clearTimeout(e);e=setTimeout(function(){a.fire("blur")},100)}var j=c.Editor,f=c.Event,d={},e,g,c={refreshAll:function(){for(var a in d)if(d.hasOwnProperty(a)){var b=d[a].get("document")[0];b.designMode="off";b.designMode="on"}},currentInstance:function(){return g},getInstance:function(a){return d[a]},
add:function(a){var b=a.get("window")[0];f.on(b,"focus",h,a);f.on(b,"blur",i,a)},register:function(a){d[a._UUID]=a},remove:function(a){delete d[a._UUID];var b=a.get("window")[0];f.remove(b,"focus",h,a);f.remove(b,"blur",i,a)}},k=!0,l=!1,m=null;c.refreshAll=c.refreshAll;j.focusManager=c;j.getInstances=function(){return d};return c},{requires:["./base","./dom"]});
