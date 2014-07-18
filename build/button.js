/*
Copyright 2014, KISSY v5.0.0
MIT Licensed
build time: Jul 18 13:52
*/
KISSY.add("button",["node","component/control"],function(e,c,g,f){var e=c("node"),c=c("component/control"),d=e.Event.KeyCode;f.exports=c.extend({isButton:1,beforeCreateDom:function(a){var b=a.elAttrs;b.role="button";a.tooltip&&(b.title=a.tooltip);a["aria-describedby"]&&(b["aria-describedby"]=a.describedby);a.checked&&a.elCls.push(this.getBaseCssClasses("checked"))},bindUI:function(){this.$el.on("keyup",this.handleKeyDownInternal,this)},handleKeyDownInternal:function(a){return a.keyCode===d.ENTER&&
"keydown"===a.type||a.keyCode===d.SPACE&&"keyup"===a.type?this.handleClickInternal(a):a.keyCode===d.SPACE},handleClickInternal:function(){this.callSuper();this.get("checkable")&&this.set("checked",!this.get("checked"));this.fire("click")},_onSetChecked:function(a){var b=this.getBaseCssClasses("checked");this.$el[a?"addClass":"removeClass"](b)},_onSetTooltip:function(a){this.el.setAttribute("title",a)},_onSetDescribedby:function(a){this.el.setAttribute("aria-describedby",a)}},{ATTRS:{handleGestureEvents:{value:!0},
focusable:{value:!0},allowTextSelection:{value:!1},value:{},describedby:{value:"",render:1,sync:0},tooltip:{value:"",render:1,sync:0},checkable:{},checked:{value:!1,render:1,sync:0}},xclass:"button"})});
