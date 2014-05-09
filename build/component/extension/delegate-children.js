/*
Copyright 2014, KISSY v5.0.0
MIT Licensed
build time: May 9 13:53
*/
KISSY.add("component/extension/delegate-children",["component/control","event/gesture/base","event/gesture/tap"],function(e,d){function h(a){a.target===this&&a.component.$el.addClass(this.__childClsTag)}function i(a){a.target===this&&(a=a.component.$el)&&a.removeClass(this.__childClsTag)}function f(){this.__childClsTag=e.guid("ks-component-child");this.on("afterRenderChild",h,this).on("afterRemoveChild",i,this)}var j=d("component/control").Manager,c=d("event/gesture/base"),g=d("event/gesture/tap");
e.augment(f,{handleChildrenEvents:function(a){if(!this.get("disabled")){var b=this.getOwnerControl(a);if(b&&!b.get("disabled"))switch(a.type){case c.START:b.handleMouseDown(a);break;case c.END:b.handleMouseUp(a);break;case g.TAP:b.handleClick(a);break;case "mouseenter":b.handleMouseEnter(a);break;case "mouseleave":b.handleMouseLeave(a);break;case "contextmenu":b.handleContextMenu(a)}}},__bindUI:function(){var a=c.START+" "+c.END+" "+g.TAP;this.$el.delegate(a+" mouseenter mouseleave contextmenu","."+
this.__childClsTag,this.handleChildrenEvents,this)},getOwnerControl:function(a){return j.getComponent(a.currentTarget.id)}});return f});
