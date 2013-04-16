/*
Copyright 2013, KISSY UI Library v1.40dev
MIT Licensed
build time: Apr 17 00:24
*/
KISSY.add("xtemplate/facade",function(f,c,h){function a(b,d){d=f.merge(j,d);if("string"==typeof b){var a=b,g=d,e;if(!g.cache||!(e=i[a]))e=h.compileToFn(a,g),g.cache&&(i[a]=e);b=e}this.option=d;this.tpl=b;this.runtime=new c(b,d)}var i=a.cache={};c.includeCommand.invokeEngine=function(b,d,c){return(new a(b,f.merge(c))).render(d,!0)};var j={cache:!0};f.augment(a,{removeSubTpl:function(b){this.runtime.removeSubTpl(b)},removeCommand:function(b){this.runtime.removeCommand(b)},addSubTpl:function(b,a){this.runtime.addSubTpl(b,
a)},addCommand:function(a,c){this.runtime.addCommand(a,c)},render:function(a){return this.runtime.render.apply(this.runtime,arguments)}});a.compiler=h;a.RunTime=c;a.addCommand=c.addCommand;a.addSubTpl=c.addSubTpl;a.removeCommand=c.removeCommand;a.removeSubTpl=c.removeSubTpl;return a},{requires:["./runtime","./compiler"]});
