/*
Copyright 2014, KISSY v1.42
MIT Licensed
build time: Feb 19 17:22
*/
(function(c){function s(a,f,d,g,b,i){var e=a.getName();if(m&&b[e])"circular dependencies found: "+d;else if(!i[e])if(i[e]=1,"css"===a.getType())g[e]||(a.status=4,f.push(a),g[e]=1);else if(a=a.getRequiredMods(),m&&(b[e]=1,d.push(e)),c.each(a,function(a){s(a,f,d,g,b,i)}),m)d.pop(),delete b[e]}var m;c.importStyle=function(a){var f=c.Loader.Utils,a=f.getModNamesAsArray(a),a=f.normalizeModNames(c,a),d=[],g=c.Env.host.document,b=c.Config,i={},e=[],t={},u={};m=b.debug;c.each(a,function(a){a=c.Loader.Utils.createModuleInfo(c,
a);s(a,d,e,i,t,u)});if(d.length)if(b.combine){for(var a=b.comboPrefix,f=b.comboSep,v=b.comboMaxFileNum,b=b.comboMaxUrlLength,n="",o="",j=[],h=[],p=0;p<d.length;p++){var q=d[p],k=q.getPackage(),r=k.getPrefixUriForCombo(),l=q.getFullPath();if(!k.isCombine()||!c.startsWith(l,r))g.writeln('<link href="'+l+'"  rel="stylesheet"/>');else if(l=l.slice(r.length).replace(/\?.*$/,""),j.push(q),h.push(l),1===j.length)n=r+a,k.getTag()&&(o="?t="+encodeURIComponent(k.getTag())+".css");else if(h.length>v||n.length+
h.join(f).length+o.length>b||j[0].getPackage()!==k)j.pop(),h.pop(),g.writeln('<link href="'+(n+h.join(f)+o)+'"  rel="stylesheet"/>'),j=[],h=[],p--}h.length&&g.writeln('<link href="'+(n+h.join(f)+o)+'"  rel="stylesheet"/>')}else c.each(d,function(a){g.writeln('<link href="'+a.getFullPath()+'"  rel="stylesheet"/>')})}})(KISSY);
