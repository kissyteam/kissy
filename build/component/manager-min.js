/*
Copyright 2013, KISSY v1.42
MIT Licensed
build time: Dec 4 22:05
*/
KISSY.add("component/manager",[],function(){var h=0,e,g={},c={};return e={__instances:c,addComponent:function(a,b){c[a]=b},removeComponent:function(a){delete c[a]},getComponent:function(a){return c[a]},createComponent:function(a,b){var f,d;if(a){if(!a.isControl&&b&&(a.prefixCls||(a.prefixCls=b.get("prefixCls")),!a.xclass&&a.prefixXClass))a.xclass=a.prefixXClass,a.xtype&&(a.xclass+="-"+a.xtype);if(!a.isControl&&(d=a.xclass))(f=e.getConstructorByXClass(d))||"can not find class by xclass desc : "+d,
a=new f(a);a.isControl&&b&&a.setInternal("parent",b)}return a},getConstructorByXClass:function(a){var a=a.split(/\s+/),b=-1,f,d,c,e=null;for(d=0;d<a.length;d++)if((c=g[a[d]])&&(f=c.priority)>b)b=f,e=c.constructor;return e},setConstructorByXClass:function(a,b){g[a]={constructor:b,priority:h++}}}});
