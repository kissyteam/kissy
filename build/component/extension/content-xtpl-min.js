/*
Copyright 2014, KISSY v1.50
MIT Licensed
build time: Mar 13 17:48
*/
KISSY.add("component/extension/content-xtpl",[],function(b,h,i,e){b=function(b,e){var a,c=e.escapeHtml,f=this.utils.callCommand;a='<div id="ks-content-';var d=b.resolve(["id"]);a+=c(d);a+='"\r\n           class="';var d={},g=[];g.push("content");d.params=g;f=f(this,b,d,"getBaseCssClasses",2);a+=c(f);a+='">';if((c=b.resolve(["content"]))||0===c)a+=c;return a+"</div>"};b.TPL_NAME=e.name;return b});
