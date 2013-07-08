/*
Copyright 2013, KISSY UI Library v1.40dev
MIT Licensed
build time: Jul 3 13:58
*/
KISSY.add("xtemplate",function(g,a,h){function b(a,c){c=g.merge(j,c);if("string"==typeof a){var e=a,f=c,d;if(!f.cache||!(d=i[e]))d=h.compileToFn(e,f),f.cache&&(i[e]=d);a=d}b.superclass.constructor.call(this,a,c)}var i=b.cache={},j={cache:!0};g.extend(b,a,{},{compiler:h,RunTime:a,addCommand:a.addCommand,removeCommand:a.removeCommand});return b},{requires:["xtemplate/runtime","xtemplate/compiler"]});
