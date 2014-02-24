/*
Copyright 2014, KISSY v1.50
MIT Licensed
build time: Feb 25 00:53
*/
KISSY.add("xtemplate",["xtemplate/runtime","xtemplate/compiler"],function(h,e){function c(a,b){b&&!1===b.cache&&(this.cache=!1);c.superclass.constructor.call(this,a,b)}var d=e("xtemplate/runtime"),f=e("xtemplate/compiler"),g=c.cache={};h.extend(c,d,{cache:!0,derive:function(){var a=c.superclass.derive.apply(this,arguments);a.cache=this.cache;return a},compile:function(){var a,b=this.tpl;if(this.cache&&(a=g[b]))return a;a=f.compileToFn(b,this.name);this.cache&&(g[b]=a);return a},render:function(){this.compiled||
(this.compiled=1,"string"===typeof this.tpl&&(this.tpl=this.compile()));return c.superclass.render.apply(this,arguments)}},{compiler:f,Scope:d.Scope,RunTime:d,addCommand:d.addCommand,removeCommand:d.removeCommand});return c});
