/*
Copyright 2014, KISSY v5.0.0
MIT Licensed
build time: Jul 18 14:02
*/
KISSY.add("event/dom/ie",["./ie/change","./ie/submit"],function(i,c){c("./ie/change");c("./ie/submit")});
KISSY.add("event/dom/ie/change",["event/dom/base","dom"],function(i,c){function d(a){a=a.type;return"checkbox"===a||"radio"===a}function f(a){if("checked"===a.originalEvent.propertyName){var b=this;b.__changed=1;b.__changeTimer&&clearTimeout(b.__changeTimer);b.__changeTimer=setTimeout(function(){b.__changed=0;b.__changeTimer=null},50)}}function b(b){this.__changed&&(this.__changed=0,a.fire(this,"change",b))}function g(b){b=b.target;h.test(b.nodeName)&&!b.__changeHandler&&(b.__changeHandler=1,a.on(b,
"change",{fn:e,last:1}))}function e(b){if(!b.isPropagationStopped()&&!d(this)){var c;(c=this.parentNode)&&a.fire(c,"change",b)}}var a=c("event/dom/base"),j=c("dom"),h=/^(?:textarea|input|select)$/i;a.Special.change={setup:function(){if(h.test(this.nodeName))if(d(this))a.on(this,"propertychange",f),a.on(this,"click",b);else return!1;else a.on(this,"beforeactivate",g)},tearDown:function(){if(h.test(this.nodeName))if(d(this))a.remove(this,"propertychange",f),a.remove(this,"click",b);else return!1;else a.remove(this,
"beforeactivate",g),j.query("textarea,input,select",this).each(function(b){b.__changeHandler&&(b.__changeHandler=0,a.remove(b,"change",{fn:e,last:1}))})}}});
KISSY.add("event/dom/ie/submit",["event/dom/base","dom"],function(i,c){function d(a){var a=a.target,c=e(a);if((a="input"===c||"button"===c?a.form:null)&&!a.__submitFix)a.__submitFix=1,b.on(a,"submit",{fn:f,last:1})}function f(a){this.parentNode&&!a.isPropagationStopped()&&!a.synthetic&&b.fire(this.parentNode,"submit",a)}var b=c("event/dom/base"),g=c("dom"),e=g.nodeName;b.Special.submit={setup:function(){if("form"===e(this))return!1;b.on(this,"click keypress",d)},tearDown:function(){if("form"===e(this))return!1;
b.remove(this,"click keypress",d);g.query("form",this).each(function(a){a.__submitFix&&(a.__submitFix=0,b.remove(a,"submit",{fn:f,last:1}))})}}});
