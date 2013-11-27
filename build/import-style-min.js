/*
Copyright 2013, KISSY v1.50dev
MIT Licensed
build time: Nov 27 00:48
*/
(function(c){function s(a,f,d,h,b,i){var e=a.getName();if(l&&b[e])"circular dependencies found: "+d;else if(!i[e])if(i[e]=1,"css"==a.getType())h[e]||(a.status=4,f.push(a),h[e]=1);else if(a=a.getRequiredMods(),l&&(b[e]=1,d.push(e)),c.each(a,function(a){s(a,f,d,h,b,i)}),l)d.pop(),delete b[e]}var l;c.importStyle=function(a){var f=c.Loader.Utils,a=f.getModNamesAsArray(a),a=f.normalizeModNames(c,a),d=[],h=c.Env.host.document,b=c.Config,i={},e=[],t={},u={};l=b.debug;c.each(a,function(a){a=c.Loader.Utils.createModuleInfo(c,
a);s(a,d,e,i,t,u)});if(d.length)if(b.combine){for(var a=b.comboPrefix,f=b.comboSep,v=b.comboMaxFileNum,b=b.comboMaxUrlLength,m="",n="",j=[],g=[],o=0;o<d.length;o++){var q=d[o],p=q.getPackage(),r=p.getPrefixUriForCombo(),k=q.getFullPath();if(!p.isCombine()||!c.startsWith(k,r))document.writeln('<link href="'+k+'"  rel="stylesheet"/>');else if(k=k.slice(r.length).replace(/\?.*$/,""),j.push(q),g.push(k),1===j.length)m=r+a,n="?t="+encodeURIComponent(p.getTag())+".css";else if(g.length>v||m.length+g.join(f).length+
n.length>b||j[0].getPackage()!=p)j.pop(),g.pop(),document.writeln('<link href="'+(m+g.join(f)+n)+'"  rel="stylesheet"/>'),j=[],g=[],o--}g.length&&h.writeln('<link href="'+(m+g.join(f)+n)+'"  rel="stylesheet"/>')}else c.each(d,function(a){h.writeln('<link href="'+a.getFullPath()+'"  rel="stylesheet"/>')})}})(KISSY);
