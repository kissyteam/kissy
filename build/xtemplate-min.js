/*
Copyright 2014, KISSY v1.50
MIT Licensed
build time: Mar 24 03:03
*/
KISSY.add("xtemplate",["xtemplate/runtime","xtemplate/compiler"],function(i,b){function d(a,c){if("string"===typeof a){var f=a,e,b=!c||!1!==c.cache;if(!b||!(e=g[f]))e=h.compileToFn(f,c&&c.name),b&&(g[f]=e);a=e}d.superclass.constructor.call(this,a,c)}var a=b("xtemplate/runtime"),h=b("xtemplate/compiler"),g=d.cache={};i.extend(d,a,{},{Compiler:h,Scope:a.Scope,RunTime:a,addCommand:a.addCommand,removeCommand:a.removeCommand});return d});
