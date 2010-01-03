/*
Copyright (c) 2010, Kissy UI Library. All rights reserved.
MIT Licensed.
http://kissy.googlecode.com/

Date: 2010-01-03 21:56:25
Revision: 393
*/
KISSY.add("switchable-circular",function(k){var e=YAHOO.util,m="switchable",l="relative",f="left",h="top",i="px",g="",d="forward",j="backward",c="scrollx",a="scrolly",o=k.Switchable;k.mix(o.Config,{circular:false});function p(y,s,C,v,A){var E=this,w=E.config[m],x=E.length,D=E.activeIndex,F=w.scrollType===c,q=F?f:h,u=E.viewSize[F?0:1],B=-u*v,r={},t,z=A===j;t=(z&&D===0&&v===x-1)||(A===d&&D===x-1&&v===0);if(t){B=b.call(E,E.panels,v,z,q,u)}r[q]={to:B};if(E.anim){E.anim.stop()}E.anim=new e.Anim(E.content,r,w.duration,w.easing);E.anim.onComplete.subscribe(function(){if(t){n.call(E,E.panels,v,z,q,u)}E.anim=null;C()});E.anim.animate()}function b(x,u,y,q,v){var C=this,w=C.config[m],z=w.steps,t=C.length,r=y?t-1:0,B=r*z,A=(r+1)*z,s;for(s=B;s<A;s++){x[s].style.position=l;x[s].style[q]=(y?"-":g)+v*t+i}return y?v:-v*t}function n(x,u,y,q,v){var C=this,w=C.config[m],z=w.steps,t=C.length,r=y?t-1:0,B=r*z,A=(r+1)*z,s;for(s=B;s<A;s++){x[s].style.position=g;x[s].style[q]=g}C.content.style[q]=y?-v*(t-1)+i:g}k.weave(function(){var r=this,q=r.config[m];if(q.circular&&(q.effect===c||q.effect===a)){q.scrollType=q.effect;q.effect=p}},"after",o.prototype,"_initSwitchable")});
