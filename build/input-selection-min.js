/*
Copyright 2012, KISSY UI Library v1.30dev
MIT Licensed
build time: Apr 8 20:27
*/
KISSY.add("input-selection",function(l,m){if(typeof l.Env.host.document.createElement("input").selectionEnd!="number"){var i=m._propHooks;i.selectionStart={set:function(a,c){var b=a.ownerDocument.selection.createRange();if(g(a).inRange(b)){var d=f(a,1)[1],e=j(a,c,d);b.collapse(false);b.moveStart("character",-e);c>d&&b.collapse(true);b.select()}},get:function(a){return f(a)[0]}};i.selectionEnd={set:function(a,c){var b=a.ownerDocument.selection.createRange();if(g(a).inRange(b)){var d=f(a)[0],e=j(a,
d,c);b.collapse(true);b.moveEnd("character",e);d>c&&b.collapse(false);b.select()}},get:function(a){return f(a,1)[1]}};var f=function(a,c){var b=0,d=0,e=a.ownerDocument.selection.createRange(),h=g(a);if(h.inRange(e)){h.setEndPoint("EndToStart",e);b=k(a,h).length;if(c)d=b+k(a,e).length}return[b,d]},g=function(a){if(a.type=="textarea"){var c=a.document.body.createTextRange();c.moveToElementText(a);return c}else return a.createTextRange()},j=function(a,c,b){var d=Math.min(c,b),e=Math.max(c,b);if(d==e)return 0;
if(a.type=="textarea"){a=a.value.substring(d,e).replace(/\r\n/g,"\n").length;if(c>b)a=-a;return a}else return b-c},k=function(a,c){if(a.type=="textarea"){var b=c.text,d=c.duplicate();if(d.compareEndPoints("StartToEnd",d)==0)return b;d.moveEnd("character",-1);if(d.text==b)b+="\r\n";return b}else return c.text}}},{requires:["dom"]});
