/*
Copyright 2014, KISSY v5.0.0
MIT Licensed
build time: Apr 15 17:41
*/
KISSY.add("button",["node","component/control"],function(d,c){var e=c("node"),f=c("component/control"),b=e.KeyCode;return f.extend({isButton:1,beforeCreateDom:function(a){d.mix(a.elAttrs,{role:"button",title:a.tooltip,"aria-describedby":a.describedby});a.checked&&a.elCls.push(this.getBaseCssClasses("checked"))},bindUI:function(){this.$el.on("keyup",this.handleKeyDownInternal,this)},handleKeyDownInternal:function(a){return a.keyCode===b.ENTER&&"keydown"===a.type||a.keyCode===b.SPACE&&"keyup"===a.type?
this.handleClickInternal(a):a.keyCode===b.SPACE},handleClickInternal:function(){this.callSuper();this.get("checkable")&&this.set("checked",!this.get("checked"));this.fire("click")},_onSetChecked:function(a){var b=this.getBaseCssClasses("checked");this.$el[a?"addClass":"removeClass"](b)},_onSetTooltip:function(a){this.el.setAttribute("title",a)},_onSetDescribedby:function(a){this.el.setAttribute("aria-describedby",a)}},{ATTRS:{value:{},describedby:{value:"",render:1,sync:0},tooltip:{value:"",render:1,
sync:0},checkable:{},checked:{value:!1,render:1,sync:0}},xclass:"button"})});
