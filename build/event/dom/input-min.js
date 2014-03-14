/*
Copyright 2014, KISSY v1.50
MIT Licensed
build time: Mar 14 15:42
*/
KISSY.add("event/dom/input",["event/dom/base","dom"],function(o,f){function d(a){var c=(a.nodeName||"").toLowerCase();return"textarea"===c?!0:"input"===c?"text"===a.type||"password"===a.type:!1}function h(a){if(c.hasData(a,e)){var b=c.data(a,e);clearTimeout(b);c.removeData(a,e)}}function i(a){h(a.target)}function p(a){c.hasData(a,e)||c.data(a,e,setTimeout(function q(){var d=a.value,f=c.data(a,g);d!==f&&(b.fire(a,r),c.data(a,g,d));c.data(a,e,setTimeout(q,j))},j))}function k(a){var b=a.target;"focus"===
a.type&&c.data(b,g,b.value);p(b)}function l(a){c.removeData(a,g);h(a);b.detach(a,"blur",i);b.detach(a,"mousedown keyup keydown focus",k)}function m(a){a=a.target;d(a)&&!a.__inputHandler&&(a.__inputHandler=1,b.on(a,"input",n))}var b=f("event/dom/base"),c=f("dom"),n=o.noop,r="input",g="event/input/history",e="event/input/poll",j=50;b.Special.input={setup:function(){if(d(this))l(this),b.on(this,"blur",i),b.on(this,"mousedown keyup keydown focus",k);else b.on(this,"focusin",m)},tearDown:function(){d(this)?
l(this):(b.remove(this,"focusin",m),c.query("textarea,input",this).each(function(a){a.__inputHandler&&(a.__inputHandler=0,b.remove(a,"input",n))}))}}});
