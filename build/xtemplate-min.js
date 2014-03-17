/*
Copyright 2014, KISSY v1.50
MIT Licensed
build time: Mar 17 21:36
*/
KISSY.add("xtemplate",["xtemplate/runtime","xtemplate/compiler"],function(g,d){function a(){a.superclass.constructor.apply(this,arguments)}var b=d("xtemplate/runtime"),e=d("xtemplate/compiler"),f=a.cache={};g.extend(a,b,{compile:function(){var a,b=this.config,c=this.tpl;if(!1!==b.cache&&(a=f[c]))return a;a=e.compileToFn(c,this.name);!1!==b.cache&&(f[c]=a);return a},render:function(){this.compiled||(this.compiled=1,"string"===typeof this.tpl&&(this.tpl=this.compile()));return a.superclass.render.apply(this,
arguments)}},{compiler:e,Scope:b.Scope,RunTime:b,addCommand:b.addCommand,removeCommand:b.removeCommand});return a});
