/*
Copyright 2012, KISSY UI Library v1.30
MIT Licensed
build time: Dec 20 22:27
*/
KISSY.add("event/dom/hashchange",function(e,c,h){var d=e.UA,q=c._Special,g=e.Env.host,f=g.document,r=f&&f.documentMode,l="__replace_history_"+e.now(),d=r||d.ie;c.REPLACE_HISTORY=l;var s="<html><head><title>"+(f&&f.title||"")+" - {hash}</title>{head}</head><body>{hash}</body></html>",i=function(){return"#"+(new e.Uri(location.href)).getFragment()},b,j,m=function(){var a=i(),c;if(c=e.endsWith(a,l))a=a.slice(0,-l.length),location.hash=a;a!==j&&(j=a,n(a,c));b=setTimeout(m,50)},n=d&&8>d?function(c,b){var d=
e.substitute(s,{hash:e.escapeHTML(c),head:h.isCustomDomain()?"<script>document.domain = '"+f.domain+"';<\/script>":""}),k=a.contentWindow.document;try{b?k.open("text/html","replace"):k.open(),k.write(d),k.close()}catch(g){}}:function(){c.fireHandler(g,"hashchange")},o=function(){b||m()},p=function(){b&&clearTimeout(b);b=0},a;d&&8>d&&(o=function(){if(!a){var b=h.getEmptyIframeSrc();a=h.create("<iframe "+(b?'src="'+b+'"':"")+' style="display: none" height="0" width="0" tabindex="-1" title="empty"/>');
h.prepend(a,f.documentElement);c.add(a,"load",function(){c.remove(a,"load");n(i());c.add(a,"load",d);m()});f.onpropertychange=function(){try{"title"===event.propertyName&&(a.contentWindow.document.title=f.title+" - "+i())}catch(c){}};var d=function(){var b=e.trim(a.contentWindow.document.body.innerText),d=i();b!=d&&(j=location.hash=b);c.fireHandler(g,"hashchange")}}},p=function(){b&&clearTimeout(b);b=0;c.detach(a);h.remove(a);a=0});q.hashchange={setup:function(){if(this===g){j=i();o()}},tearDown:function(){this===
g&&p()}}},{requires:["event/dom/base","dom"]});
