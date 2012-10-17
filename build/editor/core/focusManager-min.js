/*
Copyright 2012, KISSY UI Library v1.40dev
MIT Licensed
build time: Oct 17 17:29
*/
KISSY.add("editor/core/focusManager",function(c){function h(){var a=this;a.__iframeFocus=k;g=a;d&&clearTimeout(d);d=setTimeout(function(){a.fire("focus")},100)}function i(){var a=this;a.__iframeFocus=l;g=m;d&&clearTimeout(d);d=setTimeout(function(){a.fire("blur")},100)}var j=c.Editor,f=c.Event,e={},d,g,c={refreshAll:function(){for(var a in e){var b=e[a].get("document")[0];b.designMode="off";b.designMode="on"}},currentInstance:function(){return g},getInstance:function(a){return e[a]},add:function(a){var b=
a.get("window")[0];f.on(b,"focus",h,a);f.on(b,"blur",i,a)},register:function(a){e[a._UUID]=a},remove:function(a){delete e[a._UUID];var b=a.get("window")[0];f.remove(b,"focus",h,a);f.remove(b,"blur",i,a)}},k=!0,l=!1,m=null;c.refreshAll=c.refreshAll;j.focusManager=c;j.getInstances=function(){return e};return c},{requires:["./base","./dom"]});
