/*
Copyright 2013, KISSY UI Library v1.40dev
MIT Licensed
build time: Jun 24 21:41
*/
KISSY.add("component/extension/delegate-children",function(d,g,h){function i(a){a.target==this&&a.component.$el.addClass(this.__childClsTag)}function j(a){a.target==this&&(a=a.component.$el)&&a.removeClass(this.__childClsTag)}function e(){this.__childClsTag=d.guid("ks-component-child");this.on("afterRenderChild",i,this).on("afterRemoveChild",j,this)}var k=d.UA,f=d.Env.host.document.documentMode||k.ie,c=g.Gesture,l=d.Features.isTouchEventSupported();d.augment(e,{handleChildrenEvents:function(a){if(!this.get("disabled")){var b=
this.getOwnerControl(a);if(b&&!b.get("disabled"))switch(a.stopPropagation(),a.type){case c.start:b.handleMouseDown(a);break;case c.end:b.handleMouseUp(a);break;case c.tap:b.handleClick(a);break;case "mouseenter":b.handleMouseEnter(a);break;case "mouseleave":b.handleMouseLeave(a);break;case "contextmenu":b.handleContextMenu(a);break;case "dblclick":b.handleDblClick(a)}}},__bindUI:function(){var a=c.start+" "+c.end+" "+c.tap;c.cancel&&(a+=" "+c.cancel);l||(a+=" mouseenter mouseleave contextmenu "+(f&&
9>f?"dblclick ":""));this.$el.delegate(a,"."+this.__childClsTag,this.handleChildrenEvents,this)},getOwnerControl:function(a){return h.getComponent(a.currentTarget.id)}});return e},{requires:["node","component/manager"]});
