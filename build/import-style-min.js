/*
Copyright 2013, KISSY v1.41
MIT Licensed
build time: Dec 4 22:16
*/
(function(c){function s(a,f,d,g,b,i){var e=a.getName();if(l&&b[e])"circular dependencies found: "+d;else if(!i[e])if(i[e]=1,"css"===a.getType())g[e]||(a.status=4,f.push(a),g[e]=1);else if(a=a.getRequiredMods(),l&&(b[e]=1,d.push(e)),c.each(a,function(a){s(a,f,d,g,b,i)}),l)d.pop(),delete b[e]}var l;c.importStyle=function(a){var f=c.Loader.Utils,a=f.getModNamesAsArray(a),a=f.normalizeModNames(c,a),d=[],g=c.Env.host.document,b=c.Config,i={},e=[],t={},u={};l=b.debug;c.each(a,function(a){a=c.Loader.Utils.createModuleInfo(c,
a);s(a,d,e,i,t,u)});if(d.length)if(b.combine){for(var a=b.comboPrefix,f=b.comboSep,v=b.comboMaxFileNum,b=b.comboMaxUrlLength,m="",n="",j=[],h=[],o=0;o<d.length;o++){var q=d[o],p=q.getPackage(),r=p.getPrefixUriForCombo(),k=q.getFullPath();if(!p.isCombine()||!c.startsWith(k,r))g.writeln('<link href="'+k+'"  rel="stylesheet"/>');else if(k=k.slice(r.length).replace(/\?.*$/,""),j.push(q),h.push(k),1===j.length)m=r+a,n="?t="+encodeURIComponent(p.getTag())+".css";else if(h.length>v||m.length+h.join(f).length+
n.length>b||j[0].getPackage()!==p)j.pop(),h.pop(),g.writeln('<link href="'+(m+h.join(f)+n)+'"  rel="stylesheet"/>'),j=[],h=[],o--}h.length&&g.writeln('<link href="'+(m+h.join(f)+n)+'"  rel="stylesheet"/>')}else c.each(d,function(a){g.writeln('<link href="'+a.getFullPath()+'"  rel="stylesheet"/>')})}})(KISSY);
