/*
Copyright 2014, KISSY v1.50
MIT Licensed
build time: Jan 6 18:33
*/
KISSY.add("event/dom/input",["dom","event/dom/base"],function(p,e){function f(a){if(c.hasData(a,d)){var b=c.data(a,d);clearTimeout(b);c.removeData(a,d)}}function h(a){f(a.target)}function n(a){c.hasData(a,d)||c.data(a,d,setTimeout(function o(){var e=a.value,f=c.data(a,g);e!==f&&(b.fire(a,i),c.data(a,g,e));c.data(a,d,setTimeout(o,j))},j))}function k(a){var b=a.target;"focus"===a.type&&c.data(b,g,b.value);n(b)}function l(a){c.removeData(a,g);f(a);b.detach(a,"blur",h);b.detach(a,"mousedown keyup keydown focus",
k);b.on(a,"blur",h);b.on(a,"mousedown keyup keydown focus",k)}var c=e("dom"),b=e("event/dom/base"),i="input",m=c.nodeName,g="event/input/history",d="event/input/poll",j=50;b.Special[i]={setup:function(){var a=m(this);return"input"===a||"textarea"===a?l(this):!1},tearDown:function(){var a=m(this);return"input"===a||"textarea"===a?l(this):!1}};return b});
