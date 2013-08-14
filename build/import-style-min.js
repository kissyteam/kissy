/*
Copyright 2013, KISSY UI Library v1.31
MIT Licensed
build time: Aug 15 00:06
*/
(function(d){function t(a,e,g,b,h,i){var c=a.getName();if(!(l&&h[c]||i[c]))if(i[c]=1,"css"==a.getType())b[c]||(a.status=4,e.push(a),b[c]=1);else if(a=a.getRequiredMods(),l&&(h[c]=1,g.push(c)),d.each(a,function(a){t(a,e,g,b,h,i)}),l)g.pop(),delete h[c]}var l;d.importStyle=function(a){"string"==typeof a&&(a=a.split(","));var e=[],g=d.Env.host.document,b=d.Config,h={},i=[],c={},u={};l=b.debug;d.each(a,function(a){a=d.Loader.Utils.createModuleInfo(d,a);t(a,e,i,h,c,u)});if(e.length)if(b.combine){for(var a=
b.comboPrefix,q=b.comboSep,v=b.comboMaxFileNum,b=b.comboMaxUrlLength,m="",n="",j=[],f=[],o=0;o<e.length;o++){var r=e[o],p=r.getPackage(),s=p.getPrefixUriForCombo(),k=r.getFullPath();if(!p.isCombine()||!d.startsWith(k,s))document.writeln('<link href="'+k+'"  rel="stylesheet"/>');else if(k=k.slice(s.length).replace(/\?.*$/,""),j.push(r),f.push(k),1===j.length)m=s+a,n="?t="+encodeURIComponent(p.getTag())+".css";else if(f.length>v||m.length+f.join(q).length+n.length>b||j[0].getPackage()!=p)j.pop(),f.pop(),
document.writeln('<link href="'+(m+f.join(q)+n)+'"  rel="stylesheet"/>'),j=[],f=[],o--}f.length&&g.writeln('<link href="'+(m+f.join(q)+n)+'"  rel="stylesheet"/>')}else d.each(e,function(a){g.writeln('<link href="'+a.getFullPath()+'"  rel="stylesheet"/>')})}})(KISSY);
