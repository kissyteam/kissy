/*
Copyright 2013, KISSY UI Library v1.40dev
MIT Licensed
build time: May 10 00:04
*/
KISSY.add("button/base",function(d,b,a,e){var c=b.KeyCodes;return a.Controller.extend({isButton:1,bindUI:function(){this.get("el").on("keyup",this.handleKeyEventInternal,this)},handleKeyEventInternal:function(a){return a.keyCode==c.ENTER&&"keydown"==a.type||a.keyCode==c.SPACE&&"keyup"==a.type?this.performActionInternal(a):a.keyCode==c.SPACE},performActionInternal:function(){this.get("checkable")&&this.set("checked",!this.get("checked"));this.fire("click")}},{ATTRS:{value:{},describedby:{render:1,
view:1},tooltip:{render:1,view:1},checkable:{},checked:{render:1,view:1},xrender:{value:e}}},{xclass:"button",priority:10})},{requires:["event","component/base","./buttonRender"]});KISSY.add("button",function(d,b,a){b.Render=a;return b},{requires:["button/base","button/buttonRender"]});
KISSY.add("button/buttonRender",function(d,b){return b.Render.extend({createDom:function(){var a=this.get("elAttrs");a.role="button";a.title=this.get("title");a["aria-describedby"]=this.get("describedby");this.get("checked")&&this.get("elCls").push(self.getCssClassWithState("checked"))},_onSetChecked:function(a){var b=this.get("el"),c=this.getCssClassWithState("checked");b[a?"addClass":"removeClass"](c)},_onSetTooltip:function(a){this.get("el").attr("title",a)},_onSetDescribedby:function(a){this.get("el").attr("aria-describedby",
a)}},{ATTRS:{describedby:{sync:0},tooltip:{sync:0},checked:{sync:0}}})},{requires:["component/base"]});
