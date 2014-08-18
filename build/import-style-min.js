/*
Copyright 2014, KISSY v1.47
MIT Licensed
build time: May 22 12:29
*/
(function(c){function s(a,e,f,g,b,i){var d=a.getName();if(!(m&&b[d]||i[d]))if(i[d]=1,"css"===a.getType())g[d]||(a.status=4,e.push(a),g[d]=1);else if(a=a.getRequiredMods(),m&&(b[d]=1,f.push(d)),c.each(a,function(a){s(a,e,f,g,b,i)}),m)f.pop(),delete b[d]}var m;c.importStyle=function(a){var e=c.Loader.Utils,a=e.getModNamesAsArray(a),a=e.normalizeModNames(c,a),f=[],g=c.Env.host.document,b=c.Config,i={},d=[],t={},u={};m=b.debug;c.each(a,function(a){a=c.Loader.Utils.createModuleInfo(c,a);s(a,f,d,i,t,u)});
if(f.length)if(b.combine){for(var a=b.comboPrefix,e=b.comboSep,v=b.comboMaxFileNum,b=b.comboMaxUrlLength,n="",o="",j=[],h=[],p=0;p<f.length;p++){var q=f[p],k=q.getPackage(),r=k.getPrefixUriForCombo(),l=q.getFullPath();if(!k.isCombine()||!c.startsWith(l,r))g.writeln('<link href="'+l+'"  rel="stylesheet"/>');else if(l=l.slice(r.length).replace(/\?.*$/,""),j.push(q),h.push(l),1===j.length)n=r+a,k.getTag()&&(o="?t="+encodeURIComponent(k.getTag())+".css");else if(h.length>v||n.length+h.join(e).length+
o.length>b||j[0].getPackage()!==k)j.pop(),h.pop(),g.writeln('<link href="'+(n+h.join(e)+o)+'"  rel="stylesheet"/>'),j=[],h=[],p--}h.length&&g.writeln('<link href="'+(n+h.join(e)+o)+'"  rel="stylesheet"/>')}else c.each(f,function(a){g.writeln('<link href="'+a.getFullPath()+'"  rel="stylesheet"/>')})}})(KISSY);
