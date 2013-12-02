/*
Copyright 2013, KISSY v1.50dev
MIT Licensed
build time: Dec 2 15:12
*/
KISSY.add("component/extension/content-xtpl",[],function(){return function(c,d,e){var a;a=this.config.utils;var d=a.getExpression,f=a.getPropertyOrRunCommand;a='<div id="ks-content-';var b=f(this,c,{},"id",0,1,e,!1);a+=d(b,!0);a+='"\n           class="';var b={},g=[];g.push("content");b.params=g;b=f(this,c,b,"getBaseCssClasses",0,2,!0,e);a=a+b+'">';c=f(this,c,{},"content",0,2,e,!1);a+=d(c,!1);return a+"</div>"}});
