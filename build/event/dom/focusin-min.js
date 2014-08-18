/*
Copyright 2014, KISSY v1.47
MIT Licensed
build time: May 22 12:28
*/
KISSY.add("event/dom/focusin",["event/dom/base"],function(d,g){var e=g("event/dom/base"),h=e.Special;d.each([{name:"focusin",fix:"focus"},{name:"focusout",fix:"blur"}],function(c){function f(a){return e.fire(a.target,c.name)}var b=d.guid("attaches_"+d.now()+"_");h[c.name]={setup:function(){var a=this.ownerDocument||this;b in a||(a[b]=0);a[b]+=1;1===a[b]&&a.addEventListener(c.fix,f,!0)},tearDown:function(){var a=this.ownerDocument||this;a[b]-=1;0===a[b]&&a.removeEventListener(c.fix,f,!0)}}});return e});
