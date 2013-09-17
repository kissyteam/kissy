/*
Copyright 2013, KISSY v1.40dev
MIT Licensed
build time: Sep 17 22:57
*/
KISSY.add("component/extension/content-render/content-xtpl",function(){return function(c,e,d){var a;a=this.config.utils;var e=a.getExpression,f=a.getPropertyOrRunCommand;a='<div id="ks-content-';var b=f(this,c,{},"id",0,1,d,!1);a+=e(b,!0);a+='"\r\n           class="';var b={},g=[];g.push("content");b.params=g;b=f(this,c,b,"getBaseCssClasses",0,2,!0,d);a=a+b+'">';c=f(this,c,{},"content",0,2,d,!1);a+=e(c,!1);return a+"</div>"}});
KISSY.add("component/extension/content-render",function(c,e){function d(a){var b=a.control,c=b.get("contentEl");a.$contentEl=b.$contentEl=c;a.contentEl=b.contentEl=c[0]}function a(){}a.prototype={__beforeCreateDom:function(a,b){c.mix(b,{contentEl:"#ks-content-{id}"})},__createDom:function(){d(this)},__decorateDom:function(){d(this)},getChildrenContainerEl:function(){return this.control.get("contentEl")},_onSetContent:function(a){var b=this.control,d=b.$contentEl;d.html(a);9>c.UA.ie&&!b.get("allowTextSelection")&&
d.unselectable()}};c.mix(a,{ATTRS:{contentTpl:{value:e}},HTML_PARSER:{content:function(a){return a.one("."+this.getBaseCssClass("content")).html()},contentEl:function(a){return a.one("."+this.getBaseCssClass("content"))}}});return a},{requires:["./content-render/content-xtpl"]});
