/*
Copyright 2014, KISSY v5.0.0
MIT Licensed
build time: Apr 29 14:57
*/
KISSY.add("component/extension/content-box",["component/extension/content-xtpl"],function(e,f){function d(a){var b=a.get("contentEl");a.$contentEl=a.$contentEl=b;a.contentEl=a.contentEl=b[0]}function c(){}var g=f("component/extension/content-xtpl");c.prototype={__createDom:function(){d(this)},__decorateDom:function(){d(this)},getChildrenContainerEl:function(){return this.get("contentEl")},_onSetContent:function(a){var b=this.$contentEl;b.html(a);this.get("allowTextSelection")||b.unselectable()}};
e.mix(c,{ATTRS:{contentTpl:{value:g},contentEl:{selector:function(){return"."+this.getBaseCssClass("content")}},content:{parse:function(){return this.get("contentEl").html()}}}});return c});
