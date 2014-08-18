/*
Copyright 2014, KISSY v1.47
MIT Licensed
build time: May 22 12:28
*/
KISSY.add("event/dom/ie/change",["event/dom/base","dom"],function(i,d){function e(a){a=a.type;return"checkbox"===a||"radio"===a}function g(a){"checked"===a.originalEvent.propertyName&&(this.__changed=1)}function c(b){this.__changed&&(this.__changed=0,a.fire(this,"change",b))}function h(b){b=b.target;j.test(b.nodeName)&&!b.__changeHandler&&(b.__changeHandler=1,a.on(b,"change",{fn:f,last:1}))}function f(b){if(!b.isPropagationStopped()&&!e(this)){var c;(c=this.parentNode)&&a.fire(c,"change",b)}}var a=
d("event/dom/base"),k=d("dom"),j=/^(?:textarea|input|select)$/i;a.Special.change={setup:function(){if(j.test(this.nodeName))if(e(this))a.on(this,"propertychange",g),a.on(this,"click",c);else return!1;else a.on(this,"beforeactivate",h)},tearDown:function(){if(j.test(this.nodeName))if(e(this))a.remove(this,"propertychange",g),a.remove(this,"click",c);else return!1;else a.remove(this,"beforeactivate",h),i.each(k.query("textarea,input,select",this),function(b){b.__changeHandler&&(b.__changeHandler=0,
a.remove(b,"change",{fn:f,last:1}))})}}});
KISSY.add("event/dom/ie/submit",["event/dom/base","dom"],function(i,d){function e(a){var a=a.target,d=f(a);if((a="input"===d||"button"===d?a.form:null)&&!a.__submitFix)a.__submitFix=1,c.on(a,"submit",{fn:g,last:1})}function g(a){this.parentNode&&!a.isPropagationStopped()&&!a.synthetic&&c.fire(this.parentNode,"submit",a)}var c=d("event/dom/base"),h=d("dom"),f=h.nodeName;c.Special.submit={setup:function(){if("form"===f(this))return!1;c.on(this,"click keypress",e)},tearDown:function(){if("form"===f(this))return!1;
c.remove(this,"click keypress",e);i.each(h.query("form",this),function(a){a.__submitFix&&(a.__submitFix=0,c.remove(a,"submit",{fn:g,last:1}))})}}});KISSY.add("event/dom/ie",["./ie/change","./ie/submit"],function(i,d){d("./ie/change");d("./ie/submit")});
