/*
Copyright 2014, KISSY v5.0.0
MIT Licensed
build time: May 14 22:14
*/
KISSY.add("button",["util","node","component/control"],function(g,b){var d=b("util"),e=b("node"),f=b("component/control"),c=e.KeyCode;return f.extend({isButton:1,beforeCreateDom:function(a){d.mix(a.elAttrs,{role:"button",title:a.tooltip,"aria-describedby":a.describedby});a.checked&&a.elCls.push(this.getBaseCssClasses("checked"))},bindUI:function(){this.$el.on("keyup",this.handleKeyDownInternal,this)},handleKeyDownInternal:function(a){return a.keyCode===c.ENTER&&"keydown"===a.type||a.keyCode===c.SPACE&&
"keyup"===a.type?this.handleClickInternal(a):a.keyCode===c.SPACE},handleClickInternal:function(){this.callSuper();this.get("checkable")&&this.set("checked",!this.get("checked"));this.fire("click")},_onSetChecked:function(a){var b=this.getBaseCssClasses("checked");this.$el[a?"addClass":"removeClass"](b)},_onSetTooltip:function(a){this.el.setAttribute("title",a)},_onSetDescribedby:function(a){this.el.setAttribute("aria-describedby",a)}},{ATTRS:{value:{},describedby:{value:"",render:1,sync:0},tooltip:{value:"",
render:1,sync:0},checkable:{},checked:{value:!1,render:1,sync:0}},xclass:"button"})});
