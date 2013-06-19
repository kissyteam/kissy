/*
Copyright 2013, KISSY UI Library v1.40dev
MIT Licensed
build time: Jun 19 14:00
*/
KISSY.add("component/extension/content-render",function(b){function a(){b.mix(this.get("childrenElSelectors"),{contentEl:"#ks-content-{id}"})}a.prototype={getChildrenContainerEl:function(){return this.controller.get("contentEl")},_onSetContent:function(a){var c=this.controller,d=c.get("contentEl");d.html(a);9>b.UA.ie&&!c.get("allowTextSelection")&&d.unselectable()}};b.mix(a,{ATTRS:{contentTpl:{value:'<div id="ks-content-{{id}}" class="{{getBaseCssClasses "content"}}">{{{content}}}</div>'}},HTML_PARSER:{content:function(a){return a.one("."+
this.getBaseCssClass("content")).html()},contentEl:function(a){return a.one("."+this.getBaseCssClass("content"))}}});a.ContentTpl=a.ATTRS.contentTpl.value;return a});
