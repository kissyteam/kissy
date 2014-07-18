/*
Copyright 2014, KISSY v5.0.0
MIT Licensed
build time: Jul 18 14:02
*/
KISSY.add("event/dom/focusin",["event/dom/base","util"],function(h,c){var f=c("event/dom/base"),g=f.Special,e=c("util");e.each([{name:"focusin",fix:"focus"},{name:"focusout",fix:"blur"}],function(d){function c(a){return f.fire(a.target,d.name)}var b=e.guid("attaches_"+e.now()+"_");g[d.name]={setup:function(){var a=this.ownerDocument||this;b in a||(a[b]=0);a[b]+=1;1===a[b]&&a.addEventListener(d.fix,c,!0)},tearDown:function(){var a=this.ownerDocument||this;a[b]-=1;0===a[b]&&a.removeEventListener(d.fix,
c,!0)}}})});
