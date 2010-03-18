/*
Copyright 2010, KISSY UI Library v1.0.4
MIT Licensed
build: 498 Mar 18 13:49
*/
KISSY.add("node",function(b){function c(a,d,f){var g=this,e;if(!(g instanceof c))return new c(a,d,f);if(!a)return null;if(a.nodeType)e=a;else if(typeof a==="string")e=h.create(a,f);g[0]=e}var h=b.Dom;b.one=function(a,d){return new c(b.get(a,d))};b.Node=c});
