/*
Copyright 2011, KISSY UI Library v1.1.8dev
MIT Licensed
build time: ${build.time}
*/
KISSY.add("template",function(b){var e={},j={"#":"start","/":"end"},k={},f=function(a){a in k||(k[a]=RegExp(a,"ig"));return k[a]},o=function(a){var d,g;return b.trim(a).replace(f("[\r\t\n]")," ").replace(f("([\"'])"),"\\$1").replace(f("{{([#/]?)(?!}})([^}]*)}}"),function(h,i,c){d="";if(i){c=b.trim(c);g=c.indexOf(" ");c=g===-1?[c,""]:[c.substring(0,c.indexOf(" ")),c.substring(c.indexOf(" "))];for(var n in l)if(c[0]===n){c.shift();if(i in j)d=l[n][j[i]].replace(f("KS_TEMPL_STAT_PARAM"),c.join("").replace(f("\\\\(['\"])"),
"$1"))}}else d="KS_TEMPL.push("+c.replace(f("\\\\(['\"])"),"$1")+");";return'");'+d+'KS_TEMPL.push("'})},l={"if":{start:"if(KS_TEMPL_STAT_PARAM){",end:"}"},"else":{start:"}else{"},elseif:{start:"}else if(KS_TEMPL_STAT_PARAM){"},each:{start:"KISSY.each(KS_TEMPL_STAT_PARAM, function(_ks_value, _ks_index){",end:"});"},"!":{start:"/*KS_TEMPL_STAT_PARAM*/"}},m=function(a){if(!(a in e)){var d="KS_DATA_"+b.now(),g,h=["var KS_TEMPL=[],KS_TEMPL_STAT_PARAM=false;with(",d,'||{}){try{KS_TEMPL.push("',o(a),'");}catch(e){KS_TEMPL=["KISSY.Template: Render Error. " + e.message]}};return KS_TEMPL.join("");'];
try{g=new Function(d,h.join(""))}catch(i){h[3]='");KS_TEMPL.push("KISSY.Template: Syntax Error. ,'+i.message+'");KS_TEMPL.push("';g=new Function(d,h.join(""))}e[a]={name:d,parser:h.join(""),render:g}}return e[a]};b.mix(m,{log:function(a){if(!(a in e)){m(a);this.log(a)}},addStatement:function(a,d){if(b.isString(a)&&b.isObject(d))l[a]=d}});b.Template=m},{requires:["core"]});
KISSY.add("template-node",function(b){b.mix(b,{tmpl:function(e,j){return b.one(b.DOM.create(b.Template(b.one(e).html()).render(j)))}})},{host:"template"});
