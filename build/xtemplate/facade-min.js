/*
Copyright 2012, KISSY UI Library v1.40dev
MIT Licensed
build time: Dec 20 22:28
*/
KISSY.add("xtemplate/facade",function(f,c,h){function b(a,d){d=f.merge(j,d);if("string"==typeof a){a=a.replace(/\{\{@/g,"{{#");var b=a,g=d,e;if(!g.cache||!(e=i[b]))e=h.compileToFn(b,g),g.cache&&(i[b]=e);a=e}this.option=d;this.tpl=a;this.runtime=new c(a,d)}var i=b.cache={};c.includeCommand.invokeEngine=function(a,d,c){return(new b(a,f.merge(c))).render(d)};var j={cache:!0};f.augment(b,{removeSubTpl:function(a){this.runtime.removeSubTpl(a)},removeCommand:function(a){this.runtime.removeCommand(a)},addSubTpl:function(a,
b){this.runtime.addSubTpl(a,b)},addCommand:function(a,b){this.runtime.addCommand(a,b)},render:function(a){return this.runtime.render(a)}});b.compiler=h;b.RunTime=c;b.addCommand=c.addCommand;b.addSubTpl=c.addSubTpl;b.removeCommand=c.removeCommand;b.removeSubTpl=c.removeSubTpl;return b},{requires:["./runtime","./compiler"]});
