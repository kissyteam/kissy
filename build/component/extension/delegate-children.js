/*
Copyright 2014, KISSY v5.0.0
MIT Licensed
build time: May 14 22:15
*/
KISSY.add("component/extension/delegate-children",["component/control","event/gesture/basic","event/gesture/tap"],function(k,d){function g(a){a.target===this&&a.component.$el.addClass(this.__childClsTag)}function h(a){a.target===this&&(a=a.component.$el)&&a.removeClass(this.__childClsTag)}function e(){this.__childClsTag="ks-component-child"+i++;this.on("afterRenderChild",g,this).on("afterRemoveChild",h,this)}var j=d("component/control").Manager,c=d("event/gesture/basic"),f=d("event/gesture/tap"),
i=1;e.prototype={handleChildrenEvents:function(a){if(!this.get("disabled")){var b=this.getOwnerControl(a);if(b&&!b.get("disabled"))switch(a.type){case c.START:b.handleMouseDown(a);break;case c.END:b.handleMouseUp(a);break;case f.TAP:b.handleClick(a);break;case "mouseenter":b.handleMouseEnter(a);break;case "mouseleave":b.handleMouseLeave(a);break;case "contextmenu":b.handleContextMenu(a)}}},__bindUI:function(){var a=c.START+" "+c.END+" "+f.TAP;this.$el.delegate(a+" mouseenter mouseleave contextmenu",
"."+this.__childClsTag,this.handleChildrenEvents,this)},getOwnerControl:function(a){return j.getComponent(a.currentTarget.id)}};return e});
