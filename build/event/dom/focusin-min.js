/*
Copyright 2012, KISSY UI Library v1.30
MIT Licensed
build time: Dec 20 22:27
*/
KISSY.add("event/dom/focusin",function(d,e){var g=e._Special;d.each([{name:"focusin",fix:"focus"},{name:"focusout",fix:"blur"}],function(c){function f(a){return e.fire(a.target,c.name)}var b=d.guid("attaches_"+d.now()+"_");g[c.name]={setup:function(){var a=this.ownerDocument||this;b in a||(a[b]=0);a[b]+=1;1===a[b]&&a.addEventListener(c.fix,f,!0)},tearDown:function(){var a=this.ownerDocument||this;a[b]-=1;0===a[b]&&a.removeEventListener(c.fix,f,!0)}}});return e},{requires:["event/dom/base"]});
