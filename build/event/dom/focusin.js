/*
Copyright 2014, KISSY v5.0.0
MIT Licensed
build time: May 14 22:25
*/
KISSY.add("event/dom/focusin",["event/dom/base","util"],function(h,c){var e=c("event/dom/base"),g=e.Special,f=c("util");f.each([{name:"focusin",fix:"focus"},{name:"focusout",fix:"blur"}],function(d){function c(a){return e.fire(a.target,d.name)}var b=f.guid("attaches_"+f.now()+"_");g[d.name]={setup:function(){var a=this.ownerDocument||this;b in a||(a[b]=0);a[b]+=1;1===a[b]&&a.addEventListener(d.fix,c,!0)},tearDown:function(){var a=this.ownerDocument||this;a[b]-=1;0===a[b]&&a.removeEventListener(d.fix,
c,!0)}}});return e});
