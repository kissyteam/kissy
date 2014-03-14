/*
Copyright 2014, KISSY v1.50
MIT Licensed
build time: Mar 14 15:42
*/
KISSY.add("event/dom/hashchange",["event/dom/base","dom"],function(f,l){var c=l("event/dom/base"),h=l("dom"),d=f.UA,m,r=c.Special,i=f.Env.host,g=i.document,d=d.ieMode||d.ie;c.REPLACE_HISTORY="__ks_replace_history__";var s="<html><head><title>"+(g&&g.title||"")+" - {hash}</title>{head}</head><body>{hash}</body></html>",e=function(){return"#"+(new f.Uri(location.href)).getFragment()},b,j,k=function(){var a=e(),c=0;-1!==a.indexOf("__ks_replace_history__")&&(c=1,a=a.replace("__ks_replace_history__",""),
location.hash=a);a!==j&&n(a,c);b=setTimeout(k,50)},n=d&&8>d?function(c,b){var d=f.substitute(s,{hash:f.escapeHtml(c),head:h.isCustomDomain()?'<script>document.domain = "'+g.domain+'";<\/script>':""}),e=a.contentWindow.document;try{b?e.open("text/html","replace"):e.open(),e.write(d),e.close()}catch(i){}}:function(){o()},o=function(){c.fireHandler(i,"hashchange",{newURL:location.href,oldURL:m+j});j=e()},p=function(){b||k()},q=function(){b&&clearTimeout(b);b=0},a;d&&8>d&&(p=function(){if(!a){var b=h.getEmptyIframeSrc();
a=h.create("<iframe "+(b?'src="'+b+'"':"")+' style="display: none" height="0" width="0" tabindex="-1" title="empty"/>');h.prepend(a,g.documentElement);c.add(a,"load",function(){c.remove(a,"load");n(e());c.add(a,"load",d);k()});g.attachEvent("propertychange",function(b){b=b||window.event;try{"title"===b.propertyName&&(a.contentWindow.document.title=g.title+" - "+e())}catch(c){}});var d=function(){location.hash=f.trim(a.contentWindow.document.body.innerText);o()}}},q=function(){b&&clearTimeout(b);b=
0;c.detach(a);h.remove(a);a=0});r.hashchange={setup:function(){if(this===i){j=e();m=location.href.replace(/#.+/,"");p()}},tearDown:function(){this===i&&q()}}});
