/*
Copyright 2014, KISSY v5.0.0
MIT Licensed
build time: Jul 18 14:02
*/
KISSY.add("event/dom/hashchange",["util","event/dom/base","dom","ua"],function(v,i){function f(){var a=location.href.match(/#.+$/);return a&&a[0]||"#"}function o(){e.fireHandler(j,p,{newURL:location.href,oldURL:q+k});k=f()}var l=i("util"),e=i("event/dom/base"),h=i("dom"),c=i("ua"),m,b,q,t=e.Special,j=window,k,g=j.document,c=c.ieMode,p="hashchange",u="<html><head><title>"+(g&&g.title||"")+" - {hash}</title>{head}</head><body>{hash}</body></html>";e.REPLACE_HISTORY="__ks_replace_history__";m=c&&8>c?
function(a,d){var e=l.substitute(u,{hash:l.escapeHtml(a),head:h.isCustomDomain()?'<script>document.domain = "'+g.domain+'";<\/script>':""}),c=b.contentWindow.document;try{d?c.open("text/html","replace"):c.open(),c.write(e),c.close()}catch(f){}}:function(){o()};var d,n=function(){var a=f(),b=0;-1!==a.indexOf("__ks_replace_history__")&&(b=1,a=a.replace("__ks_replace_history__",""),location.hash=a);a!==k&&m(a,b);d=setTimeout(n,50)},r=function(){d||n()},s=function(){d&&clearTimeout(d);d=0};c&&8>c&&(r=
function(){if(!b){var a=h.getEmptyIframeSrc();b=h.create("<iframe "+(a?'src="'+a+'"':"")+' style="display: none" height="0" width="0" tabindex="-1" title="empty"/>');h.prepend(b,g.documentElement);e.add(b,"load",function(){e.remove(b,"load");m(f());e.add(b,"load",c);n()});g.attachEvent("propertychange",function(a){a=a||window.event;try{"title"===a.propertyName&&(b.contentWindow.document.title=g.title+" - "+f())}catch(c){}});var c=function(){location.hash=l.trim(b.contentWindow.document.body.innerText);
o()}}},s=function(){d&&clearTimeout(d);d=0;e.detach(b);h.remove(b);b=0});t[p]={setup:function(){if(this===j){k=f();q=location.href.replace(/#.+/,"");r()}},tearDown:function(){this===j&&s()}}});
