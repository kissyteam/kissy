/*
Copyright 2013, KISSY UI Library v1.40dev
MIT Licensed
build time: Jun 19 14:00
*/
KISSY.add("component/base/manager",function(){var h=0,e={},c={};return{__instances:c,addComponent:function(a,b){c[a]=b},removeComponent:function(a){delete c[a]},getComponent:function(a){return c[a]},createComponent:function(a,b){var d;if(a){!a.isController&&b&&(S.mix(a,b.get("defaultChildCfg"),!1),!a.xclass&&a.prefixXClass&&(a.xclass=a.prefixXClass,a.xtype&&(a.xclass+="-"+a.xtype)));if(!a.isController&&(d=a.xclass))d=getConstructorByXClass(d),a=new d(a);a.isController&&b&&a.setInternal("parent",b)}return a},
getXClassByConstructor:function(a){for(var b in e)if(e[b].constructor==a)return b;return""},getConstructorByXClass:function(a){var a=a.split(/\s+/),b=-1,d,c,f,g=null;for(c=0;c<a.length;c++)if((f=e[a[c]])&&(d=f.priority)>b)b=d,g=f.constructor;return g},setConstructorByXClass:function(a,b){e[a]={constructor:b,priority:h++}}}});
