/*
Copyright 2013, KISSY UI Library v1.40dev
MIT Licensed
build time: Jun 21 01:47
*/
KISSY.add("component/extension/content-render",function(b){function a(){}a.prototype={__beforeCreateDom:function(e,a){b.mix(a,{contentEl:"#ks-content-{id}"})},getChildrenContainerEl:function(){return this.controller.get("contentEl")},_onSetContent:function(a){var c=this.controller,d=c.get("contentEl");d.html(a);9>b.UA.ie&&!c.get("allowTextSelection")&&d.unselectable()}};b.mix(a,{ATTRS:{contentTpl:{value:'<div id="ks-content-{{id}}" class="{{getBaseCssClasses "content"}}">{{{content}}}</div>'}},HTML_PARSER:{content:function(a){return a.one("."+
this.getBaseCssClass("content")).html()},contentEl:function(a){return a.one("."+this.getBaseCssClass("content"))}}});a.ContentTpl=a.ATTRS.contentTpl.value;return a});
