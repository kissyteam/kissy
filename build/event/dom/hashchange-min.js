/*
Copyright 2014, KISSY v1.50
MIT Licensed
build time: Mar 31 19:27
*/
KISSY.add("event/dom/hashchange",["event/dom/base","dom","uri","ua"],function(i,g){var c=g("event/dom/base"),h=g("dom"),r=g("uri"),d=g("ua"),m,s=c.Special,j=i.Env.host,f=j.document,d=d.ieMode||d.ie;c.REPLACE_HISTORY="__ks_replace_history__";var t="<html><head><title>"+(f&&f.title||"")+" - {hash}</title>{head}</head><body>{hash}</body></html>",e=function(){return"#"+(new r(location.href)).getFragment()},b,k,l=function(){var a=e(),c=0;-1!==a.indexOf("__ks_replace_history__")&&(c=1,a=a.replace("__ks_replace_history__",
""),location.hash=a);a!==k&&n(a,c);b=setTimeout(l,50)},n=d&&8>d?function(c,b){var d=i.substitute(t,{hash:i.escapeHtml(c),head:h.isCustomDomain()?'<script>document.domain = "'+f.domain+'";<\/script>':""}),e=a.contentWindow.document;try{b?e.open("text/html","replace"):e.open(),e.write(d),e.close()}catch(g){}}:function(){o()},o=function(){c.fireHandler(j,"hashchange",{newURL:location.href,oldURL:m+k});k=e()},p=function(){b||l()},q=function(){b&&clearTimeout(b);b=0},a;d&&8>d&&(p=function(){if(!a){var b=
h.getEmptyIframeSrc();a=h.create("<iframe "+(b?'src="'+b+'"':"")+' style="display: none" height="0" width="0" tabindex="-1" title="empty"/>');h.prepend(a,f.documentElement);c.add(a,"load",function(){c.remove(a,"load");n(e());c.add(a,"load",d);l()});f.attachEvent("propertychange",function(b){b=b||window.event;try{"title"===b.propertyName&&(a.contentWindow.document.title=f.title+" - "+e())}catch(c){}});var d=function(){location.hash=i.trim(a.contentWindow.document.body.innerText);o()}}},q=function(){b&&
clearTimeout(b);b=0;c.detach(a);h.remove(a);a=0});s.hashchange={setup:function(){if(this===j){k=e();m=location.href.replace(/#.+/,"");p()}},tearDown:function(){this===j&&q()}}});
