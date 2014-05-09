/*
Copyright 2014, KISSY v5.0.0
MIT Licensed
build time: May 9 13:53
*/
KISSY.add("component/extension/content-box",["./content-box/content-xtpl"],function(b,g){function e(a){var d=a.get("contentEl");a.$contentEl=a.$contentEl=d;a.contentEl=a.contentEl=d[0]}function c(){}var h=g("./content-box/content-xtpl");c.prototype={__createDom:function(){e(this)},__decorateDom:function(){e(this)},getChildrenContainerEl:function(){return this.get("contentEl")},_onSetContent:function(a){var d=this.$contentEl;d.html(a);this.get("allowTextSelection")||d.unselectable()}};b.mix(c,{ATTRS:{contentTpl:{value:h},
contentEl:{selector:function(){return"."+this.getBaseCssClass("content")}},content:{parse:function(){return this.get("contentEl").html()}}}});return c});
KISSY.add("component/extension/content-box/content-xtpl",[],function(b,g,e,c){b=function(b,a,d){var f=this.root.utils.callFn;a.write('<div class="',0);var c={escape:1},e=[];e.push("content");c.params=e;if((f=f(this,b,c,a,["getBaseCssClasses"],0,1))&&f.isBuffer)a=f,f=d;a.write(f,!0);a.write('">',0);b=b.resolve(["content"],0);a.write(b,!1);a.write("</div>",0);return a};b.TPL_NAME=c.name;b.version="5.0.0";return b});
