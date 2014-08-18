/*
Copyright 2014, KISSY v1.47
MIT Licensed
build time: May 22 12:17
*/
KISSY.add("component/manager",[],function(){var h=0,e,g={},c={};return e={__instances:c,addComponent:function(a,b){c[a]=b},removeComponent:function(a){delete c[a]},getComponent:function(a){return c[a]},createComponent:function(a,b){var d;if(a){if(!a.isControl&&b&&(a.prefixCls||(a.prefixCls=b.get("prefixCls")),!a.xclass&&a.prefixXClass))a.xclass=a.prefixXClass,a.xtype&&(a.xclass+="-"+a.xtype);if(!a.isControl&&(d=a.xclass))d=e.getConstructorByXClass(d),a=new d(a);a.isControl&&b&&a.setInternal("parent",
b)}return a},getConstructorByXClass:function(a){var a=a.split(/\s+/),b=-1,d,c,f,e=null;for(c=0;c<a.length;c++)if((f=g[a[c]])&&(d=f.priority)>b)b=d,e=f.constructor;return e},setConstructorByXClass:function(a,b){g[a]={constructor:b,priority:h++}}}});
