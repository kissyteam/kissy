/*
Copyright 2014, KISSY v1.50
MIT Licensed
build time: Feb 25 19:33
*/
KISSY.add("component/extension/content-xtpl",[],function(){var d=function(e,d){var a,b=d.escapeHtml,f=this.utils.callCommand;a='<div id="ks-content-';var c=e.resolve(["id"]);a+=b(c);a+='"\n           class="';var c={},g=[];g.push("content");c.params=g;f=f(this,e,c,"getBaseCssClasses",2);a+=b(f);a+='">';if((b=e.resolve(["content"]))||0===b)a+=b;return a+"</div>"};d.TPL_NAME="component/sub-modules/extension/content-xtpl/src/content.xtpl.html";return d});
