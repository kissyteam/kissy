/*
Copyright 2013, KISSY UI Library v1.40dev
MIT Licensed
build time: Jun 24 21:41
*/
KISSY.add("button/render",function(d,b){return b.ATTRS.xrender.value.extend({beforeCreateDom:function(a){d.mix(a.elAttrs,{role:"button",title:a.tooltip,"aria-describedby":a.describedby});a.checked&&a.elCls.push(this.getBaseCssClasses("checked"))},_onSetChecked:function(a){var b=this.getBaseCssClasses("checked");this.$el[a?"addClass":"removeClass"](b)},_onSetTooltip:function(a){this.el.setAttribute("title",a)},_onSetDescribedby:function(a){this.el.setAttribute("aria-describedby",a)}},{name:"ButtonRender"})},
{requires:["component/control"]});
KISSY.add("button",function(d,b,a,e){var c=b.KeyCode;return a.extend({isButton:1,bindUI:function(){this.$el.on("keyup",this.handleKeyDownInternal,this)},handleKeyDownInternal:function(a){return a.keyCode==c.ENTER&&"keydown"==a.type||a.keyCode==c.SPACE&&"keyup"==a.type?this.handleClickInternal(a):a.keyCode==c.SPACE},handleClickInternal:function(){this.get("checkable")&&this.set("checked",!this.get("checked"));this.fire("click")}},{ATTRS:{value:{},describedby:{value:"",view:1},tooltip:{value:"",view:1},
checkable:{},checked:{value:!1,view:1},xrender:{value:e}},xclass:"button"})},{requires:["node","component/control","button/render"]});
