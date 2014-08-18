/*
Copyright 2014, KISSY v1.47
MIT Licensed
build time: May 22 12:28
*/
KISSY.add("event/dom/hashchange",["event/dom/base","dom"],function(e,n){var c=n("event/dom/base"),h=n("dom"),d=e.UA,r=c.Special,f=e.Env.host,g=f.document,s=d.ieMode,l="__replace_history_"+e.now(),d=s||d.ie;c.REPLACE_HISTORY=l;var t="<html><head><title>"+(g&&g.title||"")+" - {hash}</title>{head}</head><body>{hash}</body></html>",i=function(){return"#"+(new e.Uri(location.href)).getFragment()},b,j,m=function(){var a=i(),c;if(c=e.endsWith(a,l))a=a.slice(0,-l.length),location.hash=a;a!==j&&(j=a,o(a,c));
b=setTimeout(m,50)},o=d&&8>d?function(c,b){var d=e.substitute(t,{hash:e.escapeHtml(c),head:h.isCustomDomain()?'<script>document.domain = "'+g.domain+'";<\/script>':""}),k=a.contentWindow.document;try{b?k.open("text/html","replace"):k.open(),k.write(d),k.close()}catch(f){}}:function(){c.fireHandler(f,"hashchange")},p=function(){b||m()},q=function(){b&&clearTimeout(b);b=0},a;d&&8>d&&(p=function(){if(!a){var b=h.getEmptyIframeSrc();a=h.create("<iframe "+(b?'src="'+b+'"':"")+' style="display: none" height="0" width="0" tabindex="-1" title="empty"/>');
h.prepend(a,g.documentElement);c.add(a,"load",function(){c.remove(a,"load");o(i());c.add(a,"load",d);m()});g.onpropertychange=function(){try{"title"===event.propertyName&&(a.contentWindow.document.title=g.title+" - "+i())}catch(c){}};var d=function(){var b=e.trim(a.contentWindow.document.body.innerText),d=i();b!==d&&(j=location.hash=b);c.fireHandler(f,"hashchange")}}},q=function(){b&&clearTimeout(b);b=0;c.detach(a);h.remove(a);a=0});r.hashchange={setup:function(){if(this===f){j=i();p()}},tearDown:function(){this===
f&&q()}}});
