/*
Copyright 2014, KISSY v1.47
MIT Licensed
build time: May 22 12:16
*/
KISSY.add("component/extension/content-xtpl",[],function(){return function(b){var a;a=this.config.utils;var d=a.renderOutput,e=a.runInlineCommand,f=a.getPropertyOrRunCommand;a='<div id="ks-content-';var c=f(this,b,{},"id",0,1);a+=d(c,!0);a+='"\n           class="';var c={},g=[];g.push("content");c.params=g;e=e(this,b,c,"getBaseCssClasses",2);a+=d(e,!0);a+='">';b=f(this,b,{},"content",0,2);a+=d(b,!1);return a+"</div>"}});
