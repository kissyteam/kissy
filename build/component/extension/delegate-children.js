/*
Copyright 2014, KISSY v5.0.0
MIT Licensed
build time: Jul 18 13:53
*/
KISSY.add("component/extension/delegate-children",["component/control","event/gesture/basic","event/gesture/tap"],function(l,d,m,g){function h(a){a.target===this&&a.component.$el.addClass(this.__childClsTag)}function i(a){a.target===this&&(a=a.component.$el)&&a.removeClass(this.__childClsTag)}function e(){this.__childClsTag="ks-component-child"+j++;this.on("afterRenderChild",h,this).on("afterRemoveChild",i,this)}var k=d("component/control").Manager,c=d("event/gesture/basic"),f=d("event/gesture/tap"),
j=1;e.prototype={handleChildrenEvents:function(a){if(!this.get("disabled")){var b=this.getOwnerControl(a);if(b&&!b.get("disabled"))switch(a.type){case c.START:b.handleMouseDown(a);break;case c.END:b.handleMouseUp(a);break;case f.TAP:b.handleClick(a);break;case "mouseenter":b.handleMouseEnter(a);break;case "mouseleave":b.handleMouseLeave(a);break;case "contextmenu":b.handleContextMenu(a);break;default:throw Error(a.type+" unhandled!");}}},__bindUI:function(){var a=c.START+" "+c.END+" "+f.TAP;this.$el.delegate(a+
" mouseenter mouseleave contextmenu","."+this.__childClsTag,this.handleChildrenEvents,this)},getOwnerControl:function(a){return k.getComponent(a.currentTarget.id)}};g.exports=e});
