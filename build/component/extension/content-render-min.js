/*
Copyright 2013, KISSY UI Library v1.40dev
MIT Licensed
build time: Jul 3 15:26
*/
KISSY.add("component/extension/content-render",function(d){function f(a){var b=a.control,c=b.get("contentEl");a.$contentEl=b.$contentEl=c;a.contentEl=b.contentEl=c[0]}function e(){}e.prototype={__beforeCreateDom:function(a,b){d.mix(b,{contentEl:"#ks-content-{id}"})},__createDom:function(){f(this)},__decorateDom:function(){f(this)},getChildrenContainerEl:function(){return this.control.get("contentEl")},_onSetContent:function(a){var b=this.control,c=b.$contentEl;c.html(a);9>d.UA.ie&&!b.get("allowTextSelection")&&
c.unselectable()}};d.mix(e,{ATTRS:{contentTpl:{value:'<div id="ks-content-{{id}}" class="{{getBaseCssClasses "content"}}">{{{content}}}</div>'}},HTML_PARSER:{content:function(a){return a.one("."+this.getBaseCssClass("content")).html()},contentEl:function(a){return a.one("."+this.getBaseCssClass("content"))}}});return e});
