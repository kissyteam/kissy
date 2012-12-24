/*
Copyright 2012, KISSY UI Library v1.30
MIT Licensed
build time: Dec 20 22:27
*/
KISSY.add("event/dom/ie/change",function(h,b,g){function d(c){c=c.type;return"checkbox"==c||"radio"==c}function f(c){"checked"==c.originalEvent.propertyName&&(this.__changed=1)}function e(c){this.__changed&&(this.__changed=0,b.fire(this,"change",c))}function a(c){c=c.target;i.test(c.nodeName)&&!c.__changeHandler&&(c.__changeHandler=1,b.on(c,"change",{fn:j,last:1}))}function j(c){if(!c.isPropagationStopped()&&!d(this)){var a;(a=this.parentNode)&&b.fire(a,"change",c)}}var i=/^(?:textarea|input|select)$/i;
b._Special.change={setup:function(){if(i.test(this.nodeName))if(d(this))b.on(this,"propertychange",f),b.on(this,"click",e);else return!1;else b.on(this,"beforeactivate",a)},tearDown:function(){if(i.test(this.nodeName))if(d(this))b.remove(this,"propertychange",f),b.remove(this,"click",e);else return!1;else b.remove(this,"beforeactivate",a),h.each(g.query("textarea,input,select",this),function(a){a.__changeHandler&&(a.__changeHandler=0,b.remove(a,"change",{fn:j,last:1}))})}}},{requires:["event/dom/base",
"dom"]});KISSY.add("event/dom/ie",function(){},{requires:["./ie/change","./ie/submit"]});
KISSY.add("event/dom/ie/submit",function(h,b,g){function d(a){var a=a.target,d=e(a);if((a="input"==d||"button"==d?a.form:null)&&!a.__submit__fix)a.__submit__fix=1,b.on(a,"submit",{fn:f,last:1})}function f(a){this.parentNode&&!a.isPropagationStopped()&&!a.synthetic&&b.fire(this.parentNode,"submit",a)}var e=g.nodeName;b._Special.submit={setup:function(){if("form"==e(this))return!1;b.on(this,"click keypress",d)},tearDown:function(){if("form"==e(this))return!1;b.remove(this,"click keypress",d);h.each(g.query("form",
this),function(a){a.__submit__fix&&(a.__submit__fix=0,b.remove(a,"submit",{fn:f,last:1}))})}}},{requires:["event/dom/base","dom"]});
