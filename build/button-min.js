/*
Copyright 2013, KISSY UI Library v1.40dev
MIT Licensed
build time: May 23 00:42
*/
KISSY.add("button/base",function(d,b,a,c){var e=b.KeyCodes;return a.Controller.extend({isButton:1,bindUI:function(){this.get("el").on("keyup",this.handleKeyEventInternal,this)},handleKeyEventInternal:function(a){return a.keyCode==e.ENTER&&"keydown"==a.type||a.keyCode==e.SPACE&&"keyup"==a.type?this.performActionInternal(a):a.keyCode==e.SPACE},performActionInternal:function(){this.get("checkable")&&this.set("checked",!this.get("checked"));this.fire("click")}},{ATTRS:{value:{},describedby:{value:"",
view:1},tooltip:{value:"",view:1},checkable:{},checked:{view:1},xrender:{value:c}}},{xclass:"button"})},{requires:["event","component/base","./render"]});KISSY.add("button",function(d,b,a){b.Render=a;return b},{requires:["button/base","button/render"]});
KISSY.add("button/render",function(d,b){return b.Render.extend({initializer:function(){var a=this.get("elAttrs"),c=this.get("renderData");d.mix(a,{role:"button",title:c.tooltip,"aria-describedby":c.describedby});c.checked&&this.get("elCls").push(self.getBaseCssClasses("checked"))},_onSetChecked:function(a){var c=this.get("el"),b=this.getBaseCssClasses("checked");c[a?"addClass":"removeClass"](b)},_onSetTooltip:function(a){this.get("el").attr("title",a)},_onSetDescribedby:function(a){this.get("el").attr("aria-describedby",
a)}},{ATTRS:{describedby:{sync:0},tooltip:{sync:0},checked:{sync:0}}})},{requires:["component/base"]});
