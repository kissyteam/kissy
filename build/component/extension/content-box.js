/*
Copyright 2014, KISSY v5.0.0
MIT Licensed
build time: May 8 11:56
*/
KISSY.add("component/extension/content-box",["./content-box/content-xtpl"],function(g,d){function e(a){var b=a.get("contentEl");a.$contentEl=a.$contentEl=b;a.contentEl=a.contentEl=b[0]}function c(){}var f=d("./content-box/content-xtpl");c.prototype={__createDom:function(){e(this)},__decorateDom:function(){e(this)},getChildrenContainerEl:function(){return this.get("contentEl")},_onSetContent:function(a){var b=this.$contentEl;b.html(a);this.get("allowTextSelection")||b.unselectable()}};g.mix(c,{ATTRS:{contentTpl:{value:f},
contentEl:{selector:function(){return"."+this.getBaseCssClass("content")}},content:{parse:function(){return this.get("contentEl").html()}}}});return c});
KISSY.add("component/extension/content-box/content-xtpl",[],function(g,d,e,c){d=function(f,a,b,d){b=this.utils.callFn;if("5.0.0"!==g.version)throw Error("current xtemplate file("+this.name+")(v5.0.0) need to be recompiled using current kissy(v"+g.version+")!");a.write('<div class="',0);var c={escape:1},e=[];e.push("content");c.params=e;if((b=b(this,f,c,a,["getBaseCssClasses"],0,1))&&b.isBuffer)a=b,b=d;a.write(b,!0);a.write('">',0);f=f.resolve(["content"],0);a.write(f,!1);a.write("</div>",0);return a};
d.TPL_NAME=c.name;return d});
