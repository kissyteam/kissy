/*
Copyright 2012, KISSY UI Library v1.30dev
MIT Licensed
build time: May 24 18:37
*/
KISSY.add("editor/plugin/overlay/index",function(c,a,d,e,f){var b=d.create(e,[f],{},{ATTRS:{prefixCls:{value:"ke-"},zIndex:{value:a.baseZIndex(a.zIndexManager.OVERLAY)}}});b.Dialog=d.create(e.Dialog,[f],{show:function(){this.center();var a=this.get("y");200<a-c.DOM.scrollTop()&&(a=c.DOM.scrollTop()+200,this.set("y",a));b.prototype.show.call(this)}},{ATTRS:{prefixCls:{value:"ke-"},draggable:{value:!0},constrain:{value:!0},aria:{value:!0},zIndex:{value:a.baseZIndex(a.zIndexManager.OVERLAY)}}});return b},
{requires:["editor","uibase","overlay","./focus","dd"]});
