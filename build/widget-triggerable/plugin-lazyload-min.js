/*
Copyright (c) 2009, Kissy UI Library. All rights reserved.
MIT Licensed.
http://kissy.googlecode.com/

Date: 2009-12-30 12:18:45
Revision: 380
*/
KISSY.add("switchable-lazyload",function(c){var a=YAHOO.util,d=a.Dom,e="switchable",g="beforeSwitch",h="img-src",f="textarea-data",i={},j=c.Switchable,b=c.DataLazyload;i[h]="data-lazyload-src-custom";i[f]="ks-datalazyload-custom";c.mix(j.Config,{lazyDataType:"",lazyDataFlag:""});c.weave(function(){var m=this,l=m.config[e],o=l.lazyDataType,k=l.lazyDataFlag||i[o];if(!b||!o||!k){return}m.subscribe(g,p);function p(r){var q=l.steps,t=r*q,s=t+q;b.loadCustomLazyData(m.panels.slice(t,s),o,k);if(n()){m.unsubscribe(g,p)}}function n(){var t,r,s,q;if(o===h){t=m.container.getElementsByTagName("img");for(s=0,q=t.length;s<q;s++){if(t[s].getAttribute(k)){return false}}}else{if(o===f){r=m.container.getElementsByTagName("textarea");for(s=0,q=r.length;s<q;s++){if(d.hasClass(r[s],k)){return false}}}}return true}},"after",j.prototype,"_initSwitchable")});
