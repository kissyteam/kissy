/*
Copyright 2012, KISSY UI Library v1.30
MIT Licensed
build time: Dec 20 22:27
*/
KISSY.add("event/base",function(e,d,c,a,b){return e.Event={_Utils:d,_Object:c,_Observer:a,_ObservableEvent:b}},{requires:["./base/utils","./base/object","./base/observer","./base/observable"]});
KISSY.add("event/base/object",function(e){function d(){this.timeStamp=e.now()}var c=function(){return!1},a=function(){return!0};d.prototype={constructor:d,isDefaultPrevented:c,isPropagationStopped:c,isImmediatePropagationStopped:c,preventDefault:function(){this.isDefaultPrevented=a},stopPropagation:function(){this.isPropagationStopped=a},stopImmediatePropagation:function(){this.isImmediatePropagationStopped=a;this.stopPropagation()},halt:function(a){a?this.stopImmediatePropagation():this.stopPropagation();
this.preventDefault()}};return d});
KISSY.add("event/base/observable",function(e){function d(c){e.mix(this,c);this.reset()}d.prototype={constructor:d,hasObserver:function(){return!!this.observers.length},reset:function(){this.observers=[]},removeObserver:function(c){var a,b=this.observers,d=b.length;for(a=0;a<d;a++)if(b[a]==c){b.splice(a,1);break}this.checkMemory()},checkMemory:function(){},findObserver:function(c){var a=this.observers,b;for(b=a.length-1;0<=b;--b)if(c.equals(a[b]))return b;return-1}};return d});
KISSY.add("event/base/observer",function(e){function d(c){e.mix(this,c)}d.prototype={constructor:d,equals:function(c){var a=this;return!!e.reduce(a.keys,function(b,d){return b&&a[d]===c[d]},1)},simpleNotify:function(c,a){var b;b=this.fn.call(this.context||a.currentTarget,c,this.data);this.once&&a.removeObserver(this);return b},notifyInternal:function(c,a){return this.simpleNotify(c,a)},notify:function(c,a){var b;b=c._ks_groups;if(!b||this.groups&&this.groups.match(b))return b=this.notifyInternal(c,
a),!1===b&&c.halt(),b}};return d});
KISSY.add("event/base/utils",function(e){var d,c;return{splitAndRun:c=function(a,b){a=e.trim(a);-1==a.indexOf(" ")?b(a):e.each(a.split(/\s+/),b)},normalizeParam:function(a,b,c){var f=b||{},f=e.isFunction(b)?{fn:b,context:c}:e.merge(f),b=d(a),a=b[0];f.groups=b[1];f.type=a;return f},batchForType:function(a,b){var d=e.makeArray(arguments);c(d[2+b],function(c){var e=[].concat(d);e.splice(0,2);e[b]=c;a.apply(null,e)})},getTypedGroups:d=function(a){if(0>a.indexOf("."))return[a,""];var b=a.match(/([^.]+)?(\..+)?$/),
a=[b[1]];(b=b[2])?(b=b.split(".").sort(),a.push(b.join("."))):a.push("");return a},getGroupsRe:function(a){return RegExp(a.split(".").join(".*\\.")+"(?:\\.|$)")}}});
