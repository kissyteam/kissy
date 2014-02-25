/*
Copyright 2013, KISSY v1.42
MIT Licensed
build time: Dec 4 22:05
*/
KISSY.add("component/extension/content-render",["component/extension/content-xtpl"],function(e,g){function f(a){var b=a.control,c=b.get("contentEl");a.$contentEl=b.$contentEl=c;a.contentEl=b.contentEl=c[0]}function d(){}var h=g("component/extension/content-xtpl");d.prototype={__beforeCreateDom:function(a,b){e.mix(b,{contentEl:"#ks-content-{id}"})},__createDom:function(){f(this)},__decorateDom:function(){f(this)},getChildrenContainerEl:function(){return this.control.get("contentEl")},_onSetContent:function(a){var b=
this.control,c=b.$contentEl;c.html(a);b.get("allowTextSelection")||c.unselectable()}};e.mix(d,{ATTRS:{contentTpl:{value:h}},HTML_PARSER:{content:function(a){return a.one("."+this.getBaseCssClass("content")).html()},contentEl:function(a){return a.one("."+this.getBaseCssClass("content"))}}});return d});
