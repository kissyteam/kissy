/*
Copyright 2014, KISSY v1.50
MIT Licensed
build time: Mar 31 19:32
*/
KISSY.add("xtemplate",["util","xtemplate/runtime","xtemplate/compiler"],function(i,b){function d(a,c){if("string"===typeof a){var b=a,e,f=!c||!1!==c.cache;if(!f||!(e=g[b]))e=h.compileToFn(b,c&&c.name),f&&(g[b]=e);a=e}d.superclass.constructor.call(this,a,c)}b("util");var a=b("xtemplate/runtime"),h=b("xtemplate/compiler"),g=d.cache={};i.extend(d,a,{},{Compiler:h,Scope:a.Scope,RunTime:a,addCommand:a.addCommand,removeCommand:a.removeCommand});return d});
