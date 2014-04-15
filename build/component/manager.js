/*
Copyright 2014, KISSY v5.0.0
MIT Licensed
build time: Apr 15 17:42
*/
KISSY.add("component/manager",function(){var h=0,e,g={},b={};return e={__instances:b,addComponent:function(a){b[a.get("id")]=a},removeComponent:function(a){delete b[a.get("id")]},getComponent:function(a){return b[a]},createComponent:function(a,c){var d;if(a){if(!a.isControl&&c&&(a.prefixCls||(a.prefixCls=c.get("prefixCls")),!a.xclass&&a.prefixXClass))a.xclass=a.prefixXClass,a.xtype&&(a.xclass+="-"+a.xtype);if(!a.isControl&&(d=a.xclass))d=e.getConstructorByXClass(d),a=new d(a);a.isControl&&c&&a.setInternal("parent",
c)}return a},getConstructorByXClass:function(a){var a=a.split(/\s+/),c=-1,d,b,f,e=null;for(b=0;b<a.length;b++)if((f=g[a[b]])&&(d=f.priority)>c)c=d,e=f.constructor;return e},setConstructorByXClass:function(a,b){g[a]={constructor:b,priority:h++}}}});
