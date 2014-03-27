/*
Copyright 2014, KISSY v1.50
MIT Licensed
build time: Mar 27 21:45
*/
KISSY.add("component/extension/delegate-children",["node","component/manager","ua"],function(e,d){function h(a){a.target===this&&a.component.$el.addClass(this.__childClsTag)}function i(a){a.target===this&&(a=a.component.$el)&&a.removeClass(this.__childClsTag)}function f(){this.__childClsTag=e.guid("ks-component-child");this.on("afterRenderChild",h,this).on("afterRemoveChild",i,this)}var j=d("node"),k=d("component/manager"),g=d("ua").ieMode,c=j.Gesture;e.augment(f,{handleChildrenEvents:function(a){if(!this.get("disabled")){var b=
this.getOwnerControl(a);if(b&&!b.get("disabled"))switch(a.type){case c.start:b.handleMouseDown(a);break;case c.end:b.handleMouseUp(a);break;case c.tap:b.handleClick(a);break;case "mouseenter":b.handleMouseEnter(a);break;case "mouseleave":b.handleMouseLeave(a);break;case "contextmenu":b.handleContextMenu(a);break;case "dblclick":b.handleDblClick(a)}}},__bindUI:function(){var a=c.start+" "+c.end+" "+c.tap;c.cancel&&(a+=" "+c.cancel);a+=" mouseenter mouseleave contextmenu "+(g&&9>g?"dblclick ":"");this.$el.delegate(a,
"."+this.__childClsTag,this.handleChildrenEvents,this)},getOwnerControl:function(a){return k.getComponent(a.currentTarget.id)}});return f});
