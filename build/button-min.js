/*
Copyright 2012, KISSY UI Library v1.40dev
MIT Licensed
build time: Nov 7 17:20
*/
KISSY.add("button/base",function(d,b,a,f){var c=b.KeyCodes,e=a.Controller.extend({bindUI:function(){this.get("el").on("keyup",this.handleKeyEventInternal,this)},handleKeyEventInternal:function(a){return a.keyCode==c.ENTER&&"keydown"==a.type||a.keyCode==c.SPACE&&"keyup"==a.type?this.performActionInternal(a):a.keyCode==c.SPACE},performActionInternal:function(){this.get("checkable")&&this.set("checked",!this.get("checked"));this.fire("click")},render:function(){return e.superclass.render.apply(this,
arguments)}},{ATTRS:{value:{},describedby:{view:1},tooltip:{view:1},checkable:{},checked:{view:1},xrender:{value:f}}},{xclass:"button",priority:10});return e},{requires:["event","component","./buttonRender"]});KISSY.add("button",function(d,b,a){b.Render=a;return b},{requires:["button/base","button/buttonRender"]});
KISSY.add("button/buttonRender",function(d,b){return b.Render.extend({createDom:function(){this.get("el").attr("role","button")},_uiSetChecked:function(a){var b=this.get("el"),c=this.getCssClassWithState("-checked");b[a?"addClass":"removeClass"](c)},_uiSetTooltip:function(a){this.get("el").attr("title",a)},_uiSetDescribedby:function(a){this.get("el").attr("aria-describedby",a)}},{ATTRS:{describedby:{},tooltip:{},checked:{}}})},{requires:["component"]});
