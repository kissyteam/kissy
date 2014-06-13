/*
Copyright 2014, KISSY v5.0.0
MIT Licensed
build time: Jun 13 11:41
*/
KISSY.add("component/extension/content-box",["./content-box/content-xtpl"],function(b,e,h,d){function f(a){var c=a.get("contentEl");a.$contentEl=a.$contentEl=c;a.contentEl=a.contentEl=c[0]}function a(){}b=e("./content-box/content-xtpl");a.prototype={__createDom:function(){f(this)},__decorateDom:function(){f(this)},getChildrenContainerEl:function(){return this.get("contentEl")},_onSetContent:function(a){var c=this.$contentEl;c.html(a);this.get("allowTextSelection")||c.unselectable()}};a.ATTRS={contentTpl:{value:b},
contentEl:{selector:function(){return"."+this.getBaseCssClass("content")}},content:{parse:function(){return this.get("contentEl").html()}}};d.exports=a});
KISSY.add("component/extension/content-box/content-xtpl",[],function(b,e,h,d){b=function(b,a,d){var c=this.root.utils.callFn;a.write('<div class="',0);var e={escape:1},g=[];g.push("content");e.params=g;if((c=c(this,b,e,a,["getBaseCssClasses"],0,1))&&c.isBuffer)a=c,c=d;a.write(c,!0);a.write('">',0);b=b.resolve(["content"],0);a.write(b,!1);a.write("</div>",0);return a};b.TPL_NAME=d.name;b.version="5.0.0";d.exports=b});
