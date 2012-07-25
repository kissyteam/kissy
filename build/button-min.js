/*
Copyright 2012, KISSY UI Library v1.40dev
MIT Licensed
build time: Jul 25 18:15
*/
KISSY.add("button/base",function(e,d,a,c){var b=d.KeyCodes,f=a.Controller.extend({bindUI:function(){this.get("el").on("keyup",this.handleKeyEventInternal,this);this.publish("click",{bubbles:1})},handleKeyEventInternal:function(a){return a.keyCode==b.ENTER&&"keydown"==a.type||a.keyCode==b.SPACE&&"keyup"==a.type?this.performActionInternal(a):a.keyCode==b.SPACE},performActionInternal:function(){this.get("checkable")&&this.set("checked",!this.get("checked"));this.fire("click")},render:function(){return f.superclass.render.apply(this,
arguments)}},{ATTRS:{value:{},describedby:{view:1},tooltip:{view:1},checkable:{},checked:{view:1},collapseSide:{view:1},xrender:{value:c}}},{xclass:"button",priority:10});return f},{requires:["event","component","./buttonRender"]});KISSY.add("button",function(e,d,a){d.Render=a;return d},{requires:["button/base","button/buttonRender"]});
KISSY.add("button/buttonRender",function(e,d){return d.Render.extend({createDom:function(){this.get("el").attr("role","button").addClass("ks-inline-block")},_uiSetChecked:function(a){var c=this.get("el"),b=this.getComponentCssClassWithState("-checked");c[a?"addClass":"removeClass"](b)},_uiSetTooltip:function(a){this.get("el").attr("title",a)},_uiSetDescribedby:function(a){this.get("el").attr("aria-describedby",a)},_uiSetCollapseSide:function(a){var c=this.getCssClassWithPrefix("button-collapse-"),
b=this.get("el");b.removeClass(c+"left "+c+"right");a&&b.addClass(c+a)}},{ATTRS:{describedby:{},tooltip:{},checked:{},collapseSide:{}}})},{requires:["component"]});
