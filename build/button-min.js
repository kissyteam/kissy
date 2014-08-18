/*
Copyright 2014, KISSY v1.47
MIT Licensed
build time: May 22 12:15
*/
KISSY.add("button/render",["component/control"],function(d,b){return b("component/control").getDefaultRender().extend({beforeCreateDom:function(a){d.mix(a.elAttrs,{role:"button",title:a.tooltip,"aria-describedby":a.describedby});a.checked&&a.elCls.push(this.getBaseCssClasses("checked"))},_onSetChecked:function(a){var b=this.getBaseCssClasses("checked");this.$el[a?"addClass":"removeClass"](b)},_onSetTooltip:function(a){this.el.setAttribute("title",a)},_onSetDescribedby:function(a){this.el.setAttribute("aria-describedby",
a)}},{name:"ButtonRender"})});
KISSY.add("button",["node","component/control","button/render"],function(d,b){var a=b("node"),e=b("component/control"),f=b("button/render"),c=a.KeyCode;return e.extend({isButton:1,bindUI:function(){this.$el.on("keyup",this.handleKeyDownInternal,this)},handleKeyDownInternal:function(a){return a.keyCode===c.ENTER&&"keydown"===a.type||a.keyCode===c.SPACE&&"keyup"===a.type?this.handleClickInternal(a):a.keyCode===c.SPACE},handleClickInternal:function(){this.callSuper();this.get("checkable")&&this.set("checked",
!this.get("checked"));this.fire("click")}},{ATTRS:{value:{},describedby:{value:"",view:1},tooltip:{value:"",view:1},checkable:{},checked:{value:!1,view:1},xrender:{value:f}},xclass:"button"})});
