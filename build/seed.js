var modulex=function(e){function t(){}"undefined"==typeof console&&(this.console={log:t,error:t,warn:t});var r={__BUILD_TIME:"Fri, 26 Sep 2014 13:14:48 GMT",Env:{host:this,mods:{}},Config:{debug:"",packages:{},fns:{}},version:"1.3.2",config:function(t,n){var o,i,a,u=r.Config,s=u.fns,c=this;if("string"==typeof t)o=s[t],n===e?i=o?o.call(c):u[t]:o?i=o.call(c,n):u[t]=n;else for(var l in t)n=t[l],a=s[l],a?a.call(c,n):u[l]=n;return i}},n=r.Loader={};return n.Status={ERROR:-1,UNLOADED:0,LOADING:1,LOADED:2,INITIALIZING:3,INITIALIZED:4},r}();!function(e){function t(e){var t=0;return parseFloat(e.replace(/\./g,function(){return 0===t++?".":""}))}function r(e){var t=e.split(/\//);return"/"===e.charAt(0)&&t[0]&&t.unshift(""),"/"===e.charAt(e.length-1)&&e.length>1&&t[t.length-1]&&t.push(""),t}function n(e){return"/"===e.charAt(e.length-1)&&(e+="index"),g.endsWith(e,".js")&&(e=e.slice(0,-3)),e}function o(e,t){var r,n,o=0;if(b(e))for(n=e.length;n>o&&t(e[o],o,e)!==!1;o++);else for(r=i(e),n=r.length;n>o&&t(e[r[o]],r[o],e)!==!1;o++);}function i(e){var t=[];for(var r in e)t.push(r);return t}function a(e,t){for(var r in t)e[r]=t[r];return e}var u,s,c=e.Loader,l=e.Env,f=l.mods,d=Array.prototype.map,h=l.host,g=c.Utils={},v=h.document,p=(h.navigator||{}).userAgent||"";((u=p.match(/Web[Kk]it[\/]{0,1}([\d.]*)/))||(u=p.match(/Safari[\/]{0,1}([\d.]*)/)))&&u[1]&&(g.webkit=t(u[1])),(u=p.match(/Trident\/([\d.]*)/))&&(g.trident=t(u[1])),(u=p.match(/Gecko/))&&(g.gecko=.1,(u=p.match(/rv:([\d.]*)/))&&u[1]&&(g.gecko=t(u[1]))),(u=p.match(/MSIE ([^;]*)|Trident.*; rv(?:\s|:)?([0-9.]+)/))&&(s=u[1]||u[2])&&(g.ie=t(s),g.ieMode=v.documentMode||g.ie,g.trident=g.trident||1);var m=/http(s)?:\/\/([^/]+)(?::(\d+))?/,M=/(\/\*([\s\mx]*?)\*\/|([^:]|^)\/\/(.*)$)/gm,y=/[^.'"]\s*require\s*\((['"])([^)]+)\1\)/g,b=Array.isArray||function(e){return"[object Array]"===Object.prototype.toString.call(e)};a(g,{mix:a,getSuffix:function(e){var t=e.match(/\.(\w+)$/);return t?t[1]:void 0},noop:function(){},map:d?function(e,t,r){return d.call(e,t,r||this)}:function(e,t,r){for(var n=e.length,o=new Array(n),i=0;n>i;i++){var a="string"==typeof e?e.charAt(i):e[i];(a||i in e)&&(o[i]=t.call(r||this,a,i,e))}return o},startsWith:function(e,t){return 0===e.lastIndexOf(t,0)},isEmptyObject:function(e){for(var t in e)if(void 0!==t)return!1;return!0},endsWith:function(e,t){var r=e.length-t.length;return r>=0&&e.indexOf(t,r)===r},now:Date.now||function(){return+new Date},each:o,keys:i,isArray:b,indexOf:function(e,t){for(var r=0,n=t.length;n>r;r++)if(t[r]===e)return r;return-1},normalizeSlash:function(e){return e.replace(/\\/g,"/")},normalizePath:function(e,t){var n=t.charAt(0);if("."!==n)return t;var o=r(e),i=r(t);o.pop();for(var a=0,u=i.length;u>a;a++){var s=i[a];"."===s||(".."===s?o.pop():o.push(s))}return o.join("/").replace(/\/+/,"/")},isSameOriginAs:function(e,t){var r=e.match(m),n=t.match(m);return r[0]===n[0]},docHead:function(){return v.getElementsByTagName("head")[0]||v.documentElement},getHash:function(e){var t,r=5381;for(t=e.length;--t>-1;)r=(r<<5)+r+e.charCodeAt(t);return r+""},getRequiresFromFn:function(e){var t=[];return e.toString().replace(M,"").replace(y,function(e,r,n){t.push(n)}),t},createModule:function(e,t){var r=f[e];return r||(e=n(e),r=f[e]),r?(t&&r.reset(t),r):(f[e]=r=new c.Module(a({id:e},t)),r)},createModules:function(e){return g.map(e,function(e){return g.createModule(e)})},initModules:function(e){var t,r=e.length,n=1;for(t=0;r>t;t++)n&=e[t].initRecursive();return n},getModulesExports:function(e){for(var t=e.length,r=[],n=0;t>n;n++)r.push(e[n].getExports());return r},addModule:function(e,t,r){var n=f[e];return n&&void 0!==n.factory?(console.warn(e+" is defined more than once"),void 0):(g.createModule(e,a({id:e,status:c.Status.LOADED,factory:t},r)),void 0)}})}(modulex),function(e){function t(e,t){return t in e?e[t]:c[t]}function r(e){m(this,e)}function n(t,r,n){for(var o=0;o<r.length;o++)r[o]=t.resolve(r[o]).id;e.use(r,n)}function o(t){var r=this;r.exports=void 0,r.status=l.UNLOADED,r.id=void 0,r.factory=void 0,r.config=void 0,r.cjs=1,m(r,t),r.waits={};var o=r._require=function(e,t){if("string"==typeof e){var o=r.resolve(e);return g.initModules(o.getNormalizedModules()),o.getExports()}n(r,e,t)};o.toUrl=function(e){var t=r.getUri(),n="",o=t,i=t.indexOf("//");return-1!==i&&(n=t.slice(0,i+2),o=t.slice(i+2)),n+g.normalizePath(o,e)},o.load=e.getScript}function i(t){var r=t.indexOf("!");if(-1!==r){var n=t.substring(0,r);t=t.substring(r+1);var o=p(n);o.initRecursive();var i=o.getExports()||{};i.alias&&(t=i.alias(e,t,n))}return t}function a(e,t){e=e||[];for(var r=e.length,n=0;r>n;n++)e[n]=t.resolve(e[n]).id;return e}function u(e){var t,r=e.id,n=e.alias;return"string"==typeof n&&(e.alias=n=[n]),n?n:(t=e.getPackage(),t&&t.alias&&(n=t.alias(r)),n=e.alias=n||[i(r)])}var s=e.Loader,c=e.Config,l=s.Status,f=l.INITIALIZED,d=l.INITIALIZING,h=l.ERROR,g=s.Utils,v=g.startsWith,p=g.createModule,m=g.mix;r.prototype={constructor:r,reset:function(e){m(this,e)},getFilter:function(){return t(this,"filter")},getTag:function(){return t(this,"tag")},getBase:function(){return this.base},getCharset:function(){return t(this,"charset")},isCombine:function(){return t(this,"combine")},getGroup:function(){return t(this,"group")}},s.Package=r,o.prototype={modulex:1,constructor:o,config:function(){return this.config},reset:function(e){var t=this;m(t,e),e.requires&&t.setRequiresModules(e.requires)},require:function(e){return this.resolve(e).getExports()},resolve:function(e){return p(g.normalizePath(this.id,e))},add:function(e){this.waits[e.id]=e},remove:function(e){delete this.waits[e.id]},contains:function(e){return this.waits[e.id]},flush:function(){g.each(this.waits,function(e){e.flush()}),this.waits={}},getType:function(){var e=this,t=e.type;if(!t){var r=e.id;t=g.endsWith(r,".css")?"css":g.endsWith(r,".js")?"js":g.getSuffix(r)||"js",e.type=t}return t},getAlias:function(){var e=this,t=e.id;if(e.normalizedAlias)return e.normalizedAlias;var r=u(e),n=[];if(r[0]===t)n=r;else for(var o=0,i=r.length;i>o;o++){var a=r[o];if(a&&a!==t){var s=p(a),c=s.getAlias();c?n.push.apply(n,c):n.push(a)}}return e.normalizedAlias=n,n},getNormalizedModules:function(){var e=this;return e.normalizedModules?e.normalizedModules:(e.normalizedModules=g.map(e.getAlias(),function(e){return p(e)}),e.normalizedModules)},getUri:function(){var t=this;return t.uri||(t.uri=g.normalizeSlash(e.Config.resolveModFn(t))),t.uri},getExports:function(){var e=this.getNormalizedModules();return e[0]&&e[0].exports},getPackage:function(){var e=this;if(!("packageInfo"in e)){var t=e.id;if(v(t,"/")||v(t,"http://")||v(t,"https://")||v(t,"file://"))return e.packageInfo=null,void 0;var r,n=c.packages,o=e.id+"/",i="";for(r in n)v(o,r+"/")&&r.length>i.length&&(i=r);e.packageInfo=n[i]||n.core}return e.packageInfo},getTag:function(){var e=this;return e.tag||e.getPackage()&&e.getPackage().getTag()},getCharset:function(){var e=this;return e.charset||e.getPackage()&&e.getPackage().getCharset()},setRequiresModules:function(e){var t=this,r=t.requiredModules=g.map(a(e,t),function(e){return p(e)}),n=[];g.each(r,function(e){n.push.apply(n,e.getNormalizedModules())}),t.normalizedRequiredModules=n},getNormalizedRequiredModules:function(){var e=this;return e.normalizedRequiredModules?e.normalizedRequiredModules:(e.setRequiresModules(e.requires),e.normalizedRequiredModules)},getRequiredModules:function(){var e=this;return e.requiredModules?e.requiredModules:(e.setRequiresModules(e.requires),e.requiredModules)},callFactory:function(){var e=this;return e.factory.apply(e,e.cjs?[e._require,e.exports,e]:g.map(e.getRequiredModules(),function(e){return e.getExports()}))},initSelf:function(){var e,t=this,r=t.factory;if("function"==typeof r){if(t.exports={},c.debug)e=t.callFactory();else{try{e=t.callFactory()}catch(n){if(t.status=h,t.onError||c.onModuleError){var o={type:"init",exception:n,module:t};t.error=o,t.onError&&t.onError(o),c.onModuleError&&c.onModuleError(o)}else setTimeout(function(){throw n},0);return 0}var i=1;if(g.each(t.getNormalizedRequiredModules(),function(e){return e.status===h?(i=0,!1):void 0}),!i)return 0}void 0!==e&&(t.exports=e)}else t.exports=r;return t.status=f,t.afterInit&&t.afterInit(t),c.afterModuleInit&&c.afterModuleInit(t),1},initRecursive:function(){var e=this,t=1,r=e.status;return r===h?0:r>=d?t:(e.status=d,e.cjs?t=e.initSelf():(g.each(e.getNormalizedRequiredModules(),function(e){t=t&&e.initRecursive()}),t&&e.initSelf()),t)},undef:function(){this.status=l.UNLOADED,this.error=null,this.factory=null,this.exports=null}},s.Module=o}(modulex),function(e){function t(){a||n()}function r(e){var t=0;if(i.webkit)e.sheet&&(t=1);else if(e.sheet)try{var r=e.sheet.cssRules;r&&(t=1)}catch(n){var o=n.name;"NS_ERROR_DOM_SECURITY_ERR"===o&&(t=1)}return t}function n(){for(var e in u){var t=u[e],s=t.node;r(s)&&(t.callback&&t.callback.call(s),delete u[e])}a=i.isEmptyObject(u)?0:setTimeout(n,o)}var o=30,i=e.Loader.Utils,a=0,u={};i.pollCss=function(e,r){var n=e.href,o=u[n]={};o.node=e,o.callback=r,t()},i.isCssLoaded=r}(modulex),function(e){var t,r=1e3,n=e.Env.host,o=n.document,i=e.Loader.Utils,a={},u=i.webkit;e.getScript=function(n,s,c){function l(){var e=M.readyState;e&&"loaded"!==e&&"complete"!==e||(M.onreadystatechange=M.onload=null,b(0))}var f,d,h,g,v,p=s,m=i.endsWith(n,".css");if("object"==typeof p&&(s=p.success,f=p.error,d=p.timeout,c=p.charset,h=p.attrs),m&&i.ieMode<10&&o.getElementsByTagName("style").length+o.getElementsByTagName("link").length>=31)return setTimeout(function(){throw new Error("style and link's number is more than 31.ie < 10 can not insert link: "+n)},0),f&&f(),void 0;if(g=a[n]=a[n]||[],g.push([s,f]),g.length>1)return g.node;var M=o.createElement(m?"link":"script"),y=function(){v&&(clearTimeout(v),v=void 0)};h&&i.each(h,function(e,t){M.setAttribute(t,e)}),c&&(M.charset=c),m?(M.href=n,M.rel="stylesheet"):(M.src=n,M.async=!0),g.node=M;var b=function(e){var t,r=e;y(),i.each(a[n],function(e){(t=e[r])&&t.call(M)}),delete a[n]},x="onload"in M,E=e.Config.forceCssPoll||u&&536>u||!u&&!i.trident&&!i.gecko;return m&&E&&x&&(x=!1),x?(M.onload=l,M.onerror=function(){M.onerror=null,b(1)}):m?i.pollCss(M,function(){b(0)}):M.onreadystatechange=l,d&&(v=setTimeout(function(){b(1)},d*r)),t||(t=i.docHead()),m?t.appendChild(M):t.insertBefore(M,t.firstChild),M}}(modulex),function(e,t){function r(t){return function(r){var n={};for(var o in r)n[o]={},n[o][t]=r[o];e.config("modules",n)}}function n(e,t){if(e=a.normalizeSlash(e),t&&"/"!==e.charAt(e.length-1)&&(e+="/"),c){if(a.startsWith(e,"http:")||a.startsWith(e,"//")||a.startsWith(e,"https:")||a.startsWith(e,"file:"))return e;e=c.protocol+"//"+c.host+a.normalizePath(c.pathname,e)}return e}var o=e.Loader,i=o.Package,a=o.Utils,u=e.Env.host,s=e.Config,c=u.location,l=s.fns;s.loadModsFn=function(t,r){e.getScript(t.uri,r)},s.resolveModFn=function(e){var t,r,n,o=e.id,i=e.path,u=e.getPackage();if(!u)return o;var s=u.getBase(),c=u.name,l=e.getType(),f="."+l;return i||(a.endsWith(o,f)&&(o=o.slice(0,-f.length)),t=u.getFilter()||"","function"==typeof t?i=t(o,l):"string"==typeof t&&(t&&(t="-"+t),i=o+t+f)),"core"===c?n=s+i:o===c?n=s.substring(0,s.length-1)+t+f:(i=i.substring(c.length+1),n=s+i),(r=e.getTag())&&(r+=f,n+="?t="+r),n},l.requires=r("requires"),l.alias=r("alias"),l.packages=function(e){var r=s.packages;return e===t?r:e?(a.each(e,function(e,t){var o=e.name=e.name||t,a=e.base||e.path;a&&(e.base=n(a,!0)),r[o]?r[o].reset(e):r[o]=new i(e)}),t):(s.packages={core:r.core},t)},l.modules=function(e){e&&a.each(e,function(e,t){var r=e.uri;r&&(e.uri=n(r)),a.createModule(t,e)})},l.base=function(e){var r=this,n=s.packages.core;return e?(r.config("packages",{core:{base:e}}),t):n&&n.getBase()}}(modulex),function(e,t){function r(e,r,n){function o(){--i||r(u,a)}var i=e&&e.length,a=[],u=[];m(e,function(e){var r,i={timeout:n,success:function(){u.push(e),r&&c&&(p(r.id,c.factory,c.config),c=t),o()},error:function(){a.push(e),o()},charset:e.charset};e.combine||(r=e.mods[0],"css"===r.getType()?r=t:E&&(l=r.id,i.attrs={"data-mod-id":r.id})),h.loadModsFn(e,i)})}function n(e){this.callback=e,this.head=this.tail=t,this.id="loader"+ ++k}function o(e,t){if(e||"function"!=typeof t)e&&e.requires&&!e.cjs&&(e.cjs=0);else{var r=v.getRequiresFromFn(t);r.length&&(e=e||{},e.requires=r)}return e}function i(e){var t,r,n,o=[];for(t=0,n=e.length;n>t;t++)r=e[t],"exports"===r||"module"===r||"require"===r||o.push(r);return o}function a(){var e,t,r,n,o=document.getElementsByTagName("script");for(t=o.length-1;t>=0;t--)if(n=o[t],"interactive"===n.readyState){e=n;break}return r=e?e.getAttribute("data-mod-id"):l}function u(e,t){var r=e.indexOf("//"),n="";-1!==r&&(n=e.substring(0,e.indexOf("//")+2)),e=e.substring(n.length).split(/\//),t=t.substring(n.length).split(/\//);for(var o=Math.min(e.length,t.length),i=0;o>i&&e[i]===t[i];i++);return n+e.slice(0,i).join("/")+"/"}function s(e,t,r,n,o,i){if(e&&t.length>1){for(var a=e.length,u=[],s=0;s<t.length;s++)u[s]=t[s].substring(a);return r+e+n+u.join(o)+i}return r+n+t.join(o)+i}var c,l,f,d=e.Loader,h=e.Config,g=d.Status,v=d.Utils,p=v.addModule,m=v.each,M=v.getHash,y=g.LOADING,b=g.LOADED,x=g.ERROR,E=v.ieMode&&v.ieMode<10,k=0;n.add=function(e,r,n,u){if(3===u&&v.isArray(r)){var s=r;r=n,n={requires:i(s),cjs:1}}"function"==typeof e||1===u?(n=r,r=e,n=o(n,r),E?(e=a(),p(e,r,n),l=null,f=0):c={factory:r,config:n}):(E?(l=null,f=0):c=t,n=o(n,r),p(e,r,n))};v.mix(n.prototype,{use:function(e){var t,n=this,o=h.timeout;t=n.getComboUris(e),t.css&&r(t.css,function(e,t){m(e,function(e){m(e.mods,function(e){p(e.id,v.noop),e.flush()})}),m(t,function(e){m(e.mods,function(t){var r=t.id+" is not loaded! can not find module in uri: "+e.uri;console.error(r),t.status=x;var n={type:"load",exception:r,module:t};t.error=n,t.onError&&t.onError(n),h.onModuleError&&h.onModuleError(n),t.flush()})})},o),t.js&&r(t.js,function(e){m(t.js,function(e){m(e.mods,function(t){if(!t.factory){var r=t.id+" is not loaded! can not find module in uri: "+e.uri;console.error(r),t.status=x;var n={type:"load",exception:r,module:t};t.error=n,t.onError&&t.onError(n),h.onModuleError&&h.onModuleError(n)}t.flush()})})},o)},calculate:function(e,t,r,n,o){var i,a,u,s,c=this;for(o=o||[],n=n||{},i=0;i<e.length;i++)if(u=e[i],a=u.id,!n[a])if(s=u.status,s!==x)if(s>b)n[a]=1;else{s===b||u.contains(c)||(s!==y&&(u.status=y,o.push(u)),u.add(c),c.wait(u)),c.calculate(u.getNormalizedRequiredModules(),t,r,n,o),n[a]=1}else t.push(u),n[a]=1;return o},getComboMods:function(e){var t,r,n,o,i,a,s,c,l,f,d,h=e.length,g={},p={};for(t=0;h>t;++t)if(n=e[t],i=n.getType(),d=n.getUri(),o=n.getPackage(),o?(c=o.getBase(),l=o.name,s=o.getCharset(),a=o.getTag(),f=o.getGroup()):c=n.id,o&&o.isCombine()&&f){var m=g[i]||(g[i]={});f=f+"-"+s;var y=m[f]||(m[f]={}),b=0;v.each(y,function(e,t){if(v.isSameOriginAs(t,c)){var r=u(t,c);e.push(n),a&&a!==e.tag&&(e.tag=M(e.tag+a)),delete y[t],y[r]=e,b=1}}),b||(r=y[c]=[n],r.charset=s,r.tag=a||"")}else{var x=p[i]||(p[i]={});(r=x[c])?a&&a!==r.tag&&(r.tag=M(r.tag+a)):(r=x[c]=[],r.charset=s,r.tag=a||""),r.push(n)}return{groups:g,normals:p}},getComboUris:function(e){function r(e,r,n){function o(e){x.push({combine:1,uri:e,charset:M,mods:p})}function i(){return s(h,g,r,a,c,y)}for(var h,g=[],p=[],m=n.tag,M=n.charset,y=m?"?t="+encodeURIComponent(m)+"."+e:"",b=r.length,x=[],E=0;E<n.length;E++){var k=n[E],R=k.getUri();if(k.getPackage()&&k.getPackage().isCombine()&&v.startsWith(R,r)){var A=R.slice(b).replace(/\?.*$/,"");g.push(A),p.push(k),h===t?h=-1!==A.indexOf("/")?A:"":""!==h&&(h=u(h,A),"/"===h&&(h="")),(g.length>f||i().length>d)&&(g.pop(),p.pop(),o(i()),g=[],p=[],h=t,E--)}else x.push({combine:0,uri:R,charset:M,mods:[k]})}g.length&&o(i()),l[e].push.apply(l[e],x)}var n,o,i,a=h.comboPrefix,c=h.comboSep,l={},f=h.comboMaxFileNum,d=h.comboMaxUriLength,g=this.getComboMods(e),p=g.normals,m=g.groups;for(n in p){l[n]=l[n]||[];for(o in p[n])r(n,o,p[n][o])}for(n in m){l[n]=l[n]||[];for(i in m[n])for(o in m[n][i])r(n,o,m[n][i][o])}return l},flush:function(){var e=this;if(e.callback){for(var t=e.head,r=e.callback;t;){var n=t.node,o=n.status;if(!(o>=b||o===x))return;n.remove(e),t=e.head=t.next}e.callback=null,r()}},isCompleteLoading:function(){return!this.head},wait:function(e){var t=this;if(t.head){var r={node:e};t.tail.next=r,t.tail=r}else t.tail=t.head={node:e}}}),d.ComboLoader=n}(modulex),function(e){var t=e.Env.host&&e.Env.host.document,r="??",n=",",o=e.Loader,i=o.Utils,a=o.Status,u=i.createModule,s=o.ComboLoader;i.mix(e,{getModule:function(e){return u(e)},getPackage:function(t){return e.Config.packages[t]},add:function(e,t,r){s.add(e,t,r,arguments.length)},use:function(t,r,n){function o(t,r){if(console.error("modulex: "+r+" the following modules error"),console.error(i.map(t,function(e){return e.id})),n)try{n.apply(e,t)}catch(o){setTimeout(function(){throw o},0)}}function u(){++l;var t=[];d=c.calculate(d,t),g=g.concat(d);var n=d.length;if(t.length)o(t,"load");else if(c.isCompleteLoading()){var s=i.initModules(h);if(s){if(r)try{r.apply(e,i.getModulesExports(f))}catch(v){setTimeout(function(){throw v},0)}}else t=[],i.each(g,function(e){e.status===a.ERROR&&t.push(e)}),o(t,"init")}else c.callback=u,n&&c.use(d)}var c,l=0;"string"==typeof t&&(t=t.split(/\s*,\s*/)),"object"==typeof r&&(n=r.error,r=r.success);var f=i.createModules(t),d=[];i.each(f,function(e){d.push.apply(d,e.getNormalizedModules())});var h=d,g=[];return c=new s(u),u(),e},require:function(e){return u(e).getExports()},undef:function(e){var t=u(e),r=t.getNormalizedModules();i.each(r,function(e){e.undef()})}}),e.config({comboPrefix:r,comboSep:n,charset:"utf-8",filter:"",lang:"zh-cn"}),e.config("packages",{core:{filter:"",base:"."}}),t&&t.getElementsByTagName&&e.config(i.mix({comboMaxUriLength:2e3,comboMaxFileNum:40}))}(modulex),modulex.add("i18n",{alias:function(e,t){return t+"/i18n/"+e.Config.lang}});/* exported KISSY */
/*jshint -W079 */
var KISSY = (function () {
    var S = {
        version: '5.0.0'
    };

    var slice = [].slice;
    S.require = modulex.require;
    S.Env = modulex.Env;
    S.Config = modulex.Config;
    S.config = modulex.config;
    S.log = console.log;
    S.error = function (str) {
        if (modulex.Config.debug) {
            throw new Error(str);
        }
    };
    S.nodeRequire = modulex.nodeRequire;

    function wrap(fn) {
        function wrapped() {
            var args = slice.call(arguments, 0);
            args.unshift(S);
            return fn.apply(this, args);
        }

        wrapped.toString = function () {
            return fn.toString();
        };
        return wrapped;
    }

    S.add = function () {
        var args = slice.call(arguments, 0);
        for (var i = 0, l = args.length; i < l; i++) {
            if (typeof args[i] === 'function') {
                args[i] = wrap(args[i]);
            }
        }
        modulex.add.apply(this, args);
    };

    S.use = function () {
        var args = slice.call(arguments, 0);
        var callback = args[1];
        if (typeof callback === 'function') {
            args[1] = wrap(args[1]);
        } else if (callback && callback.success) {
            callback.success = wrap(callback.success);
        }
        modulex.use.apply(this, args);
        return S;
    };

    (function (S) {
        var doc = S.Env.host && S.Env.host.document;
        var defaultComboPrefix = '??';
        var defaultComboSep = ',';

        function mix(r, s) {
            for (var p in s) {
                if (!(p in r)) {
                    r[p] = s[p];
                }
            }
            return r;
        }

        function returnJson(s) {
            /*jshint evil:true*/
            return (new Function('return ' + s))();
        }

        var baseReg = /^(.*)(seed)(?:-debug|)?\.js[^/]*/i;
        var baseTestReg = /(seed)(?:-debug|)?\.js/i;

        function getBaseInfoFromOneScript(script) {
            // can not use KISSY.Uri
            // /??x.js,dom.js for tbcdn
            var src = script.src || '';
            if (!src.match(baseTestReg)) {
                return 0;
            }

            var baseInfo = script.getAttribute('data-config');

            if (baseInfo) {
                baseInfo = returnJson(baseInfo);
            } else {
                baseInfo = {};
            }

            var comboPrefix = baseInfo.comboPrefix || defaultComboPrefix;
            var comboSep = baseInfo.comboSep || defaultComboSep;

            var parts, base;
            var index = src.indexOf(comboPrefix);

            // no combo
            if (index === -1) {
                base = src.replace(baseReg, '$1');
            } else {
                base = src.substring(0, index);
                if (base.charAt(base.length - 1) !== '/') {
                    base += '/';
                }
                parts = src.substring(index + comboPrefix.length).split(comboSep);
                for (var i = 0, l = parts.length; i < l; i++) {
                    var part = parts[i];
                    if (part.match(baseTestReg)) {
                        base += part.replace(baseReg, '$1');
                        break;
                    }
                }
            }

            if (!('tag' in baseInfo)) {
                var queryIndex = src.lastIndexOf('?t=');
                if (queryIndex !== -1) {
                    baseInfo.tag = src.substring(queryIndex + 1);
                }
            }

            baseInfo.base = baseInfo.base || base;

            return baseInfo;
        }

        /**
         * get base from seed-debug.js
         * @return {Object} base for kissy
         * @ignore
         *
         * for example:
         *      @example
         *      http://a.tbcdn.cn/??s/kissy/x.y.z/seed-min.js,p/global/global.js
         *      note about custom combo rules, such as yui3:
         *      combo-prefix='combo?' combo-sep='&'
         */
        function getBaseInfo() {
            // get base from current script file path
            // notice: timestamp
            var scripts = doc.getElementsByTagName('script');
            var i, info;

            for (i = scripts.length - 1; i >= 0; i--) {
                if ((info = getBaseInfoFromOneScript(scripts[i]))) {
                    return info;
                }
            }

            var msg = 'must load kissy by file name in browser environment: ' +
                'seed-debug.js or seed.js';

            S.log(msg, 'error');
            return null;
        }

        if (typeof __dirname !== 'undefined') {
            S.config({
                charset: 'utf-8',
                /*global __dirname*/
                base: __dirname.replace(/\\/g, '/').replace(/\/$/, '') + '/'
            });
        } else if (doc && doc.getElementsByTagName) {
            // will transform base to absolute path
            S.config(mix({
                // 2k(2048) url length
                comboMaxUrlLength: 2000,
                // file limit number for a single combo url
                comboMaxFileNum: 40
            }, getBaseInfo()));
        }
    })(S);

    if (typeof module !== 'undefined') {
        module.exports = S;
    }

    if (typeof global !== 'undefined') {
        global.KISSY = S;
    }

    S.modulex = modulex;

    return S;
})();
modulex.add("ua",[],function(e,o,i){function t(e){var o=0;return parseFloat(e.replace(/\./g,function(){return 0===o++?".":""}))}function a(e,o){var i,a;o[i="trident"]=.1,(a=e.match(/Trident\/([\d.]*)/))&&a[1]&&(o[i]=t(a[1])),o.core=i}function r(e){var o,i;return(o=e.match(/MSIE ([^;]*)|Trident.*; rv(?:\s|:)?([0-9.]+)/))&&(i=o[1]||o[2])?t(i):0}function n(e){var o,i,n,d,m,h="",l=h,p=h,f=[6,9],b="{{version}}",u="<!--[if IE "+b+"]><s></s><![endif]-->",w=c&&c.createElement("div"),g=[],v={webkit:s,trident:s,gecko:s,presto:s,chrome:s,safari:s,firefox:s,ie:s,ieMode:s,opera:s,mobile:s,core:s,shell:s,phantomjs:s,os:s,ipad:s,iphone:s,ipod:s,ios:s,android:s,nodejs:s};if(w&&w.getElementsByTagName&&(w.innerHTML=u.replace(b,""),g=w.getElementsByTagName("s")),g.length>0){for(a(e,v),d=f[0],m=f[1];m>=d;d++)if(w.innerHTML=u.replace(b,d),g.length>0){v[p="ie"]=d;break}!v.ie&&(n=r(e))&&(v[p="ie"]=n)}else((i=e.match(/AppleWebKit\/([\d.]*)/))||(i=e.match(/Safari\/([\d.]*)/)))&&i[1]?(v[l="webkit"]=t(i[1]),(i=e.match(/OPR\/(\d+\.\d+)/))&&i[1]?v[p="opera"]=t(i[1]):(i=e.match(/Chrome\/([\d.]*)/))&&i[1]?v[p="chrome"]=t(i[1]):(i=e.match(/\/([\d.]*) Safari/))&&i[1]?v[p="safari"]=t(i[1]):v.safari=v.webkit,/ Mobile\//.test(e)&&e.match(/iPad|iPod|iPhone/)?(v.mobile="apple",i=e.match(/OS ([^\s]*)/),i&&i[1]&&(v.ios=t(i[1].replace("_","."))),o="ios",i=e.match(/iPad|iPod|iPhone/),i&&i[0]&&(v[i[0].toLowerCase()]=v.ios)):/ Android/i.test(e)?(/Mobile/.test(e)&&(o=v.mobile="android"),i=e.match(/Android ([^\s]*);/),i&&i[1]&&(v.android=t(i[1]))):(i=e.match(/NokiaN[^\/]*|Android \d\.\d|webOS\/\d\.\d/))&&(v.mobile=i[0].toLowerCase()),(i=e.match(/PhantomJS\/([^\s]*)/))&&i[1]&&(v.phantomjs=t(i[1]))):(i=e.match(/Presto\/([\d.]*)/))&&i[1]?(v[l="presto"]=t(i[1]),(i=e.match(/Opera\/([\d.]*)/))&&i[1]&&(v[p="opera"]=t(i[1]),(i=e.match(/Opera\/.* Version\/([\d.]*)/))&&i[1]&&(v[p]=t(i[1])),(i=e.match(/Opera Mini[^;]*/))&&i?v.mobile=i[0].toLowerCase():(i=e.match(/Opera Mobi[^;]*/))&&i&&(v.mobile=i[0]))):(n=r(e))?(v[p="ie"]=n,a(e,v)):(i=e.match(/Gecko/))&&(v[l="gecko"]=.1,(i=e.match(/rv:([\d.]*)/))&&i[1]&&(v[l]=t(i[1]),/Mobile|Tablet/.test(e)&&(v.mobile="firefox")),(i=e.match(/Firefox\/([\d.]*)/))&&i[1]&&(v[p="firefox"]=t(i[1])));return o||(/windows|win32/i.test(e)?o="windows":/macintosh|mac_powerpc/i.test(e)?o="macintosh":/linux/i.test(e)?o="linux":/rhino/i.test(e)&&(o="rhino")),v.os=o,v.core=v.core||l,v.shell=p,v.ieMode=v.ie&&c.documentMode||v.ie,v}var s,d="undefined"!=typeof window?window:{},c=d.document,m=d.navigator&&d.navigator.userAgent||"",h=i.exports=n(m);if("object"==typeof process){var l,p;(l=process.versions)&&(p=l.node)&&(h.os=process.platform,h.nodejs=t(p))}h.getDescriptorFromUserAgent=n;var f=["webkit","trident","gecko","presto","chrome","safari","firefox","ie","opera"],b=c&&c.documentElement,u="";if(b){for(var w=0;w<f.length;w++){var g=f[w],v=h[g];v&&(u+=" ks-"+g+(parseInt(v,10)+""),u+=" ks-"+g)}u&&(b.className=(b.className+u).replace(/^[\s\xa0]+|[\s\xa0]+$/g,""))}});modulex.add("feature",[],function(e,t,n){function r(){return arguments[1].toUpperCase()}function o(e){if(-1!==e.indexOf("-")&&(e=e.replace(g,r)),e in S)return S[e];if(!u||e in u)S[e]={propertyName:e,propertyNamePrefix:""};else{for(var t,n=e.charAt(0).toUpperCase()+e.slice(1),o=0;d>o;o++){var i=c[o];t=i+n,t in u&&(S[e]={propertyName:t,propertyNamePrefix:i})}S[e]=S[e]||null}return S[e]}var i,u,p,a,s=window,c=["Webkit","Moz","O","ms"],d=c.length,f=s.document||{},l=f&&f.documentElement,m=!0,v=!1,h="ontouchstart"in f&&!window.callPhantom,S={},y=f.documentMode;l&&(l.querySelector&&8!==y&&(v=!0),u=l.style,m="classList"in l,i="msPointerEnabled"in navigator,p="pointerEnabled"in navigator);var g=/-([a-z])/gi;n.exports={version:"1.0.0",isMsPointerSupported:function(){return i},isPointerSupported:function(){return p},isTouchEventSupported:function(){return h},isTouchGestureSupported:function(){return h||p||i},isDeviceMotionSupported:function(){return!!s.DeviceMotionEvent},isHashChangeSupported:function(){return"onhashchange"in s&&(!y||y>7)},isInputEventSupported:function(){return"oninput"in s&&(!y||y>9)},isTransform3dSupported:function(){if(void 0!==a)return a;if(l&&o("transform"))try{var e=f.createElement("p"),t=o("transform").propertyName;l.insertBefore(e,l.firstChild),e.style[t]="translate3d(1px,1px,1px)";var n=s.getComputedStyle(e),r=n.getPropertyValue(t)||n[t];l.removeChild(e),a=void 0!==r&&r.length>0&&"none"!==r}catch(i){a=!0}else a=!1;return a},isClassListSupported:function(){return m},isQuerySelectorSupported:function(){return v},getCssVendorInfo:function(e){return o(e)}}});/*
Copyright 2014, KISSY v5.0.0
MIT Licensed
build time: Sep 29 20:14
*/
KISSY.config({packages:{gallery:{base:"https"===location.protocol?"https://s.tbcdn.cn/s/kissy/gallery":"http://a.tbcdn.cn/s/kissy/gallery"},kg:{base:"//g.alicdn.com/kg/"}}});
modulex.use(["ua","feature"],function(b,a){var d=modulex;d.config("requires",{button:["component/control"],combobox:["logger-manager","menu","io"],"combobox/multi-word":["combobox"],dd:"logger-manager,base,ua,node,event/gesture/basic,event/gesture/pan".split(","),"dd/plugin/constrain":["base","node"],"dd/plugin/proxy":["dd"],"dd/plugin/scroll":["dd"],editor:["logger-manager","html-parser","component/control"],"filter-menu":["menu"],menu:["component/container","component/extension/delegate-children",
"component/extension/content-box","component/extension/align","component/extension/shim"],menubutton:["button","menu"],"navigation-view":["component/container","component/extension/content-box"],"navigation-view/bar":["button"],overlay:["component/container","component/extension/shim","component/extension/align","component/extension/content-box","event/gesture/tap"],resizable:["dd"],"resizable/plugin/proxy":["base","node"],"scroll-view/base":["anim/timer","component/container","component/extension/content-box"],
"scroll-view/plugin/pull-to-refresh":["base","node","feature"],"scroll-view/plugin/scrollbar":["component/control","event/gesture/basic","event/gesture/pan"],"scroll-view/touch":["scroll-view/base","event/gesture/basic","event/gesture/pan"],separator:["component/control"],"split-button":["menubutton"],stylesheet:["dom"],swf:["dom","json","attribute","util"],tabs:["toolbar","button","component/extension/content-box"],toolbar:["component/container","component/extension/delegate-children"],tree:["component/container",
"component/extension/content-box","component/extension/delegate-children","event/gesture/tap"],attribute:["modulex-util","modulex-event-custom"],"dom/base":["modulex-util","modulex-ua","modulex-feature","dom/selector"],"dom/ie":["dom/base"],"event-base":["modulex-util"],"event-custom":["modulex-util","modulex-event-base"],"gregorian-calendar":["i18n!gregorian-calendar"],"anim/base":["dom","promise","util"],"anim/timer":["anim/base","feature"],"anim/transition":["anim/base","feature"],base:["attribute"],
"component/container":["component/control"],"component/control":["node","event-dom/gesture/basic","event-dom/gesture/tap","base","xtemplate/runtime"],"component/extension/align":["node","ua"],"component/extension/content-box":["xtemplate/runtime"],"component/extension/delegate-children":["component/control"],"component/extension/shim":["ua"],"component/plugin/drag":["dd"],"component/plugin/resize":["resizable"],"date-picker":"gregorian-calendar,component/control,gregorian-calendar-format,component/extension/shim,component/extension/align,i18n!date-picker".split(","),
"event-dom/base":["event-base","dom","ua"],"event-dom/focusin":["event-dom/base"],"event-dom/gesture/basic":["event-dom/gesture/util"],"event-dom/gesture/edge-pan":["event-dom/gesture/util"],"event-dom/gesture/pan":["event-dom/gesture/util"],"event-dom/gesture/pinch":["event-dom/gesture/util"],"event-dom/gesture/rotate":["event-dom/gesture/util"],"event-dom/gesture/shake":["event-dom/base"],"event-dom/gesture/swipe":["event-dom/gesture/util"],"event-dom/gesture/tap":["event-dom/gesture/util"],"event-dom/gesture/util":["event-dom/base",
"feature"],"event-dom/hashchange":["event-dom/base"],"event-dom/ie":["event-dom/base"],"event-dom/input":["event-dom/base"],io:"util,dom,querystring,event-custom,promise,url,ua,event-dom".split(","),node:["util","dom","event-dom","anim"],router:["url","event-dom","event-custom","feature"],url:["modulex-querystring","modulex-path"]});a.isTouchGestureSupported();var e=a.isTouchGestureSupported()?"scroll-view/touch":"scroll-view/base",c;c={};c["scroll-view"]=e;d.config("alias",c);modulex.config("alias",
{"modulex-attribute":"attribute"});modulex.config("alias",{"modulex-dom":"dom","dom/selector":a.isQuerySelectorSupported()?"":"query-selector",dom:["dom/base",9>b.ieMode?"dom/ie":""]});modulex.config("alias",{"modulex-event-base":"event-base"});modulex.config("alias",{"modulex-event-custom":"event-custom"});modulex.config("alias",{"modulex-feature":"feature"});modulex.config("alias",{anim:a.getCssVendorInfo("transition")?"anim/transition":"anim/timer"});modulex.config("alias",{"modulex-attribute":"attribute"});
modulex.config("alias",{"modulex-base":"base"});modulex.config("alias",{"modulex-color":"color"});modulex.config("alias",{"modulex-dom":"dom","dom/selector":a.isQuerySelectorSupported()?"":"query-selector",dom:["dom/base",9>b.ieMode?"dom/ie":""]});modulex.config("alias",{"modulex-event-base":"event-base"});modulex.config("alias",{"modulex-event-custom":"event-custom"});modulex.config("alias",{"event-dom":["event-dom/base",a.isHashChangeSupported()?"":"event-dom/hashchange",9>b.ieMode?"event-dom/ie":
"",a.isInputEventSupported()?"":"event-dom/input",b.ie?"":"event-dom/focusin"]});modulex.config("alias",{"modulex-feature":"feature"});modulex.config("alias",{"modulex-path":"path"});modulex.config("alias",{"modulex-promise":"event-custom"});modulex.config("alias",{"modulex-querystring":"querystring"});modulex.config("alias",{"modulex-ua":"ua"});modulex.config("alias",{"modulex-url":"url"});modulex.config("alias",{"modulex-util":"util"});modulex.config("alias",{"modulex-path":"path"});modulex.config("alias",
{"modulex-promise":"event-custom"});modulex.config("alias",{"modulex-querystring":"querystring"});modulex.config("alias",{"modulex-ua":"ua"});modulex.config("alias",{"modulex-util":"util"})});
