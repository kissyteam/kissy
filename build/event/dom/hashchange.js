/*
Copyright 2014, KISSY v5.0.0
MIT Licensed
build time: Apr 15 17:52
*/
KISSY.add("event/dom/hashchange",["event/dom/base","dom","ua"],function(i,l){var e=l("event/dom/base"),h=l("dom"),c=l("ua"),n,s=e.Special,j=i.Env.host,f=j.document,c=c.ieMode;e.REPLACE_HISTORY="__ks_replace_history__";var t="<html><head><title>"+(f&&f.title||"")+" - {hash}</title>{head}</head><body>{hash}</body></html>",g=function(){var a=location.href.match(/#.+$/);return a&&a[0]||"#"},d,k,m=function(){var a=g(),b=0;-1!==a.indexOf("__ks_replace_history__")&&(b=1,a=a.replace("__ks_replace_history__",
""),location.hash=a);a!==k&&o(a,b);d=setTimeout(m,50)},o=c&&8>c?function(a,d){var e=i.substitute(t,{hash:i.escapeHtml(a),head:h.isCustomDomain()?'<script>document.domain = "'+f.domain+'";<\/script>':""}),c=b.contentWindow.document;try{d?c.open("text/html","replace"):c.open(),c.write(e),c.close()}catch(g){}}:function(){p()},p=function(){e.fireHandler(j,"hashchange",{newURL:location.href,oldURL:n+k});k=g()},q=function(){d||m()},r=function(){d&&clearTimeout(d);d=0},b;c&&8>c&&(q=function(){if(!b){var a=
h.getEmptyIframeSrc();b=h.create("<iframe "+(a?'src="'+a+'"':"")+' style="display: none" height="0" width="0" tabindex="-1" title="empty"/>');h.prepend(b,f.documentElement);e.add(b,"load",function(){e.remove(b,"load");o(g());e.add(b,"load",c);m()});f.attachEvent("propertychange",function(a){a=a||window.event;try{"title"===a.propertyName&&(b.contentWindow.document.title=f.title+" - "+g())}catch(c){}});var c=function(){location.hash=i.trim(b.contentWindow.document.body.innerText);p()}}},r=function(){d&&
clearTimeout(d);d=0;e.detach(b);h.remove(b);b=0});s.hashchange={setup:function(){if(this===j){k=g();n=location.href.replace(/#.+/,"");q()}},tearDown:function(){this===j&&r()}}});
