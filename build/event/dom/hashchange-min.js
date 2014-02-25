/*
Copyright 2014, KISSY v1.50
MIT Licensed
build time: Feb 25 19:43
*/
KISSY.add("event/dom/hashchange",["event/dom/base","dom"],function(f,m){var c=m("event/dom/base"),h=m("dom"),d=f.UA,n,s=c.Special,i=f.Env.host,g=i.document,t=d.ieMode,k="__replace_history_"+f.now(),d=t||d.ie;c.REPLACE_HISTORY=k;var u="<html><head><title>"+(g&&g.title||"")+" - {hash}</title>{head}</head><body>{hash}</body></html>",e=function(){return"#"+(new f.Uri(location.href)).getFragment()},b,j,l=function(){var a=e(),c;if(c=f.endsWith(a,k))a=a.slice(0,-k.length),location.hash=a;a!==j&&o(a,c);b=
setTimeout(l,50)},o=d&&8>d?function(c,b){var d=f.substitute(u,{hash:f.escapeHtml(c),head:h.isCustomDomain()?'<script>document.domain = "'+g.domain+'";<\/script>':""}),e=a.contentWindow.document;try{b?e.open("text/html","replace"):e.open(),e.write(d),e.close()}catch(i){}}:function(){p()},p=function(){c.fireHandler(i,"hashchange",{newURL:location.href,oldURL:n+j});j=e()},q=function(){b||l()},r=function(){b&&clearTimeout(b);b=0},a;d&&8>d&&(q=function(){if(!a){var b=h.getEmptyIframeSrc();a=h.create("<iframe "+
(b?'src="'+b+'"':"")+' style="display: none" height="0" width="0" tabindex="-1" title="empty"/>');h.prepend(a,g.documentElement);c.add(a,"load",function(){c.remove(a,"load");o(e());c.add(a,"load",d);l()});g.attachEvent("propertychange",function(b){b=b||window.event;try{"title"===b.propertyName&&(a.contentWindow.document.title=g.title+" - "+e())}catch(c){}});var d=function(){location.hash=f.trim(a.contentWindow.document.body.innerText);p()}}},r=function(){b&&clearTimeout(b);b=0;c.detach(a);h.remove(a);
a=0});s.hashchange={setup:function(){if(this===i){j=e();n=location.href.replace(/#.+/,"");q()}},tearDown:function(){this===i&&r()}}});
