/*
Copyright 2014, KISSY v5.0.0
MIT Licensed
build time: Jun 13 11:52
*/
(function(d){function p(a,e){for(var b=0;b<a.length&&!1!==e(a[b],b,a);b++);}function s(a,e,b,g,c,d){var f=a.name;if(!(l&&c[f]||d[f]))if(d[f]=1,"css"===a.getType())g[f]||(a.status=4,e.push(a),g[f]=1);else if(a=a.getRequiredMods(),l&&(c[f]=1,b.push(f)),p(a,function(a){s(a,e,b,g,c,d)}),l)b.pop(),delete c[f]}var l;d.importStyle=function(a){var e=d.Loader.Utils,a=e.getModNamesAsArray(a),a=e.normalizeModNames(d,a),b=[],g=d.Env.host.document,c=d.Config,t={},f=[],u={},v={};l=c.debug;p(a,function(a){a=d.Loader.Utils.getOrCreateModuleInfo(d,
a);s(a,b,f,t,u,v)});if(b.length)if(c.combine){for(var a=c.comboPrefix,e=c.comboSep,w=c.comboMaxFileNum,c=c.comboMaxUrlLength,m="",n="",i=[],h=[],o=0;o<b.length;o++){var q=b[o],j=q.getPackage(),r=j.getBase(),k=q.getPath();if(!j.isCombine()||0!==k.lastIndexOf(r,0))g.writeln('<link href="'+k+'"  rel="stylesheet"/>');else if(k=k.slice(r.length).replace(/\?.*$/,""),i.push(q),h.push(k),1===i.length)m=r+a,j.getTag()&&(n="?t="+encodeURIComponent(j.getTag())+".css");else if(h.length>w||m.length+h.join(e).length+
n.length>c||i[0].getPackage()!==j)i.pop(),h.pop(),g.writeln('<link href="'+(m+h.join(e)+n)+'"  rel="stylesheet"/>'),i=[],h=[],o--}h.length&&g.writeln('<link href="'+(m+h.join(e)+n)+'"  rel="stylesheet"/>')}else p(b,function(a){g.writeln('<link href="'+a.Path()+'"  rel="stylesheet"/>')})}})(KISSY);
