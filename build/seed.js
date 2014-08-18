var modulex=function(e){var t={__BUILD_TIME:"Mon, 18 Aug 2014 08:55:39 GMT",Env:{host:this,mods:{}},Config:{debug:"",packages:{},fns:{}},version:"@VERSION@",config:function(n,r){var o,a,i,u=t.Config,s=u.fns,c=this;if("string"==typeof n)o=s[n],r===e?a=o?o.call(c):u[n]:o?a=o.call(c,r):u[n]=r;else for(var l in n)r=n[l],i=s[l],i?i.call(c,r):u[l]=r;return a}},n=t.Loader={};return n.Status={ERROR:-1,INIT:0,LOADING:1,LOADED:2,ATTACHING:3,ATTACHED:4},t}();!function(e){function t(e){var t={};for(var n in r)!function(t,n){t[n]=function(t){return o.log(t,n,e)}}(t,n);return t}var n={},r={debug:10,info:20,warn:30,error:40},o={config:function(e){return n=e||n},log:function(e,t,n){return void 0},getLogger:function(e){return t(e)},error:function(e){}};e.LoggerMangaer=o,e.getLogger=o.getLogger,e.log=o.log,e.error=o.error,e.Config.fns.logger=o.config}(modulex),function(e){function t(e){var t=0;return parseFloat(e.replace(/\./g,function(){return 0===t++?".":""}))}function n(e){var t=e.split(/\//);return"/"===e.charAt(0)&&t[0]&&t.unshift(""),"/"===e.charAt(e.length-1)&&e.length>1&&t[t.length-1]&&t.push(""),t}function r(e){return"/"===e.charAt(e.length-1)&&(e+="index"),h.endsWith(e,".js")&&(e=e.slice(0,-3)),e}function o(e,t){var n,r,o=0;if(y(e))for(r=e.length;r>o&&t(e[o],o,e)!==!1;o++);else for(n=a(e),r=n.length;r>o&&t(e[n[o]],n[o],e)!==!1;o++);}function a(e){var t=[];for(var n in e)t.push(n);return t}function i(e,t){for(var n in t)e[n]=t[n];return e}var u,s,c=e.Loader,l=e.Env,f=l.mods,g=Array.prototype.map,d=l.host,h=c.Utils={},m=d.document,p=(d.navigator||{}).userAgent||"";((u=p.match(/AppleWebKit\/([\d.]*)/))||(u=p.match(/Safari\/([\d.]*)/)))&&u[1]&&(h.webkit=t(u[1])),(u=p.match(/Trident\/([\d.]*)/))&&(h.trident=t(u[1])),(u=p.match(/Gecko/))&&(h.gecko=.1,(u=p.match(/rv:([\d.]*)/))&&u[1]&&(h.gecko=t(u[1]))),(u=p.match(/MSIE ([^;]*)|Trident.*; rv(?:\s|:)?([0-9.]+)/))&&(s=u[1]||u[2])&&(h.ie=t(s),h.ieMode=m.documentMode||h.ie,h.trident=h.trident||1);var v=/http(s)?:\/\/([^/]+)(?::(\d+))?/,b=/(\/\*([\s\mx]*?)\*\/|([^:]|^)\/\/(.*)$)/gm,M=/[^.'"]\s*require\s*\((['"])([^)]+)\1\)/g,y=Array.isArray||function(e){return"[object Array]"===Object.prototype.toString.call(e)};i(h,{mix:i,noop:function(){},map:g?function(e,t,n){return g.call(e,t,n||this)}:function(e,t,n){for(var r=e.length,o=new Array(r),a=0;r>a;a++){var i="string"==typeof e?e.charAt(a):e[a];(i||a in e)&&(o[a]=t.call(n||this,i,a,e))}return o},startsWith:function(e,t){return 0===e.lastIndexOf(t,0)},isEmptyObject:function(e){for(var t in e)if(void 0!==t)return!1;return!0},endsWith:function(e,t){var n=e.length-t.length;return n>=0&&e.indexOf(t,n)===n},now:Date.now||function(){return+new Date},each:o,keys:a,isArray:y,indexOf:function(e,t){for(var n=0,r=t.length;r>n;n++)if(t[n]===e)return n;return-1},normalizeSlash:function(e){return e.replace(/\\/g,"/")},normalizePath:function(e,t){var r=t.charAt(0);if("."!==r)return t;var o=n(e),a=n(t);o.pop();for(var i=0,u=a.length;u>i;i++){var s=a[i];"."===s||(".."===s?o.pop():o.push(s))}return o.join("/").replace(/\/+/,"/")},isSameOriginAs:function(e,t){var n=e.match(v),r=t.match(v);return n[0]===r[0]},docHead:function(){return m.getElementsByTagName("head")[0]||m.documentElement},getHash:function(e){var t,n=5381;for(t=e.length;--t>-1;)n=(n<<5)+n+e.charCodeAt(t);return n+""},getRequiresFromFn:function(e){var t=[];return e.toString().replace(b,"").replace(M,function(e,n,r){t.push(r)}),t},createModule:function(e,t){var n=f[e];return n||(e=r(e),n=f[e]),n?(t&&(i(n,t),t.requires&&n.setRequiresModules(t.requires)),n):(f[e]=n=new c.Module(i({name:e},t)),n)},createModules:function(e){return h.map(e,function(e){return h.createModule(e)})},attachModules:function(e){var t,n=e.length;for(t=0;n>t;t++)e[t].attachRecursive()},getModulesExports:function(e){for(var t=e.length,n=[],r=0;t>r;r++)n.push(e[r].getExports());return n},addModule:function(t,n,r){var o=f[t];return o&&void 0!==o.factory?void e.log(t+" is defined more than once","warn"):void h.createModule(t,i({name:t,status:c.Status.LOADED,factory:n},r))}})}(modulex),function(e){function t(e){for(var t=[],n=0;n<e.length;n++)t[n]=e[n];return t}function n(e,t){return t in e?e[t]:c[t]}function r(e){p(this,e)}function o(n){var r=this;r.exports=void 0,r.status=l.INIT,r.name=void 0,r.factory=void 0,r.cjs=1,p(r,n),r.waits={};var o=r._require=function(e){if("string"==typeof e){var t=r.resolve(e);return d.attachModules(t.getNormalizedModules()),t.getExports()}o.async.apply(o,arguments)};o.async=function(n){for(var o=0;o<n.length;o++)n[o]=r.resolve(n[o]).name;var a=t(arguments);a[0]=n,e.use.apply(e,a)},o.resolve=function(e){return r.resolve(e).getUrl()},o.toUrl=function(e){var t=r.getUrl(),n=t.indexOf("//");-1===n?n=0:(n=t.indexOf("/",n+2),-1===n&&(n=0));var o=t.substring(n);return e=d.normalizePath(o,e),t.substring(0,n)+e},o.load=e.getScript}function a(t){var n=t.indexOf("!");if(-1!==n){var r=t.substring(0,n);t=t.substring(n+1);var o=m(r).attachRecursive().exports||{};o.alias&&(t=o.alias(e,t,r))}return t}function i(e,t){e=e||[];for(var n=e.length,r=0;n>r;r++)e[r]=t.resolve(e[r]).name;return e}function u(e){var t,n=e.name,r=e.alias;return"string"==typeof r&&(e.alias=r=[r]),r?r:(t=e.getPackage(),t&&t.alias&&(r=t.alias(n)),r=e.alias=r||[a(n)])}var s=e.Loader,c=e.Config,l=s.Status,f=l.ATTACHED,g=l.ATTACHING,d=s.Utils,h=d.startsWith,m=d.createModule,p=d.mix;r.prototype={constructor:r,reset:function(e){p(this,e)},getFilter:function(){return n(this,"filter")},getTag:function(){return n(this,"tag")},getBase:function(){return this.base},getCharset:function(){return n(this,"charset")},isCombine:function(){return n(this,"combine")},getGroup:function(){return n(this,"group")}},s.Package=r,o.prototype={modulex:1,constructor:o,require:function(e){return this.resolve(e).getExports()},resolve:function(e){return m(d.normalizePath(this.name,e))},add:function(e){this.waits[e.id]=e},remove:function(e){delete this.waits[e.id]},contains:function(e){return this.waits[e.id]},flush:function(){d.each(this.waits,function(e){e.flush()}),this.waits={}},getType:function(){var e=this,t=e.type;return t||(t=d.endsWith(e.name,".css")?"css":"js",e.type=t),t},getExports:function(){return this.getNormalizedModules()[0].exports},getAlias:function(){var e=this,t=e.name;if(e.normalizedAlias)return e.normalizedAlias;var n=u(e),r=[];if(n[0]===t)r=n;else for(var o=0,a=n.length;a>o;o++){var i=n[o];if(i&&i!==t){var s=m(i),c=s.getAlias();c?r.push.apply(r,c):r.push(i)}}return e.normalizedAlias=r,r},getNormalizedModules:function(){var e=this;return e.normalizedModules?e.normalizedModules:(e.normalizedModules=d.map(e.getAlias(),function(e){return m(e)}),e.normalizedModules)},getUrl:function(){var t=this;return t.url||(t.url=d.normalizeSlash(e.Config.resolveModFn(t))),t.url},getPackage:function(){var e=this;if(!("packageInfo"in e)){var t=e.name;if(h(t,"/")||h(t,"http://")||h(t,"https://")||h(t,"file://"))return void(e.packageInfo=null);var n,r=c.packages,o=e.name+"/",a="";for(n in r)h(o,n+"/")&&n.length>a.length&&(a=n);e.packageInfo=r[a]||r.core}return e.packageInfo},getTag:function(){var e=this;return e.tag||e.getPackage()&&e.getPackage().getTag()},getCharset:function(){var e=this;return e.charset||e.getPackage()&&e.getPackage().getCharset()},setRequiresModules:function(e){var t=this,n=t.requiredModules=d.map(i(e,t),function(e){return m(e)}),r=[];d.each(n,function(e){r.push.apply(r,e.getNormalizedModules())}),t.normalizedRequiredModules=r},getNormalizedRequiredModules:function(){var e=this;return e.normalizedRequiredModules?e.normalizedRequiredModules:(e.setRequiresModules(e.requires),e.normalizedRequiredModules)},getRequiredModules:function(){var e=this;return e.requiredModules?e.requiredModules:(e.setRequiresModules(e.requires),e.requiredModules)},attachSelf:function(){var e,t=this,n=t.status,r=t.factory;return n===l.ATTACHED||n<l.LOADED?!0:("function"==typeof r?(t.exports={},e=r.apply(t,t.cjs?[t._require,t.exports,t]:d.map(t.getRequiredModules(),function(e){return e.getExports()})),void 0!==e&&(t.exports=e)):t.exports=r,t.status=f,void(t.afterAttach&&t.afterAttach(t.exports)))},attachRecursive:function(){var e,t=this;return e=t.status,e>=g||e<l.LOADED?t:(t.status=g,t.cjs?t.attachSelf():(d.each(t.getNormalizedRequiredModules(),function(e){e.attachRecursive()}),t.attachSelf()),t)},undef:function(){this.status=l.INIT,delete this.factory,delete this.exports}},s.Module=o}(modulex),function(e){function t(){u||(o.debug("start css poll timer"),r())}function n(e,t){var n=0;if(i.webkit)e.sheet&&(o.debug("webkit css poll loaded: "+t),n=1);else if(e.sheet)try{var r=e.sheet.cssRules;r&&(o.debug("same domain css poll loaded: "+t),n=1)}catch(a){var u=a.name;o.debug("css poll exception: "+u+" "+a.code+" "+t),"NS_ERROR_DOM_SECURITY_ERR"===u&&(o.debug("css poll exception: "+u+"loaded : "+t),n=1)}return n}function r(){for(var e in s){var t=s[e],c=t.node;n(c,e)&&(t.callback&&t.callback.call(c),delete s[e])}i.isEmptyObject(s)?(o.debug("clear css poll timer"),u=0):u=setTimeout(r,a)}var o=e.getLogger("modulex/getScript"),a=30,i=e.Loader.Utils,u=0,s={};i.pollCss=function(e,n){var r=e.href,o=s[r]={};o.node=e,o.callback=n,t()},i.isCssLoaded=n}(modulex),function(e){var t,n=1e3,r=e.Env.host,o=r.document,a=e.Loader.Utils,i={},u=a.webkit;e.getScript=function(s,c,l){function f(){var e=M.readyState;e&&"loaded"!==e&&"complete"!==e||(M.onreadystatechange=M.onload=null,x(0))}var g,d,h,m,p,v=c,b=a.endsWith(s,".css");if("object"==typeof v&&(c=v.success,g=v.error,d=v.timeout,l=v.charset,h=v.attrs),b&&a.ieMode<10&&o.getElementsByTagName("style").length+o.getElementsByTagName("link").length>=31)return r.console&&r.console.error("style and link's number is more than 31.ie < 10 can not insert link: "+s),void(g&&g());if(m=i[s]=i[s]||[],m.push([c,g]),m.length>1)return m.node;var M=o.createElement(b?"link":"script"),y=function(){p&&(clearTimeout(p),p=void 0)};h&&a.each(h,function(e,t){M.setAttribute(t,e)}),l&&(M.charset=l),b?(M.href=s,M.rel="stylesheet"):(M.src=s,M.async=!0),m.node=M;var x=function(e){var t,n=e;y(),a.each(i[s],function(e){(t=e[n])&&t.call(M)}),delete i[s]},k="onload"in M,A=e.Config.forceCssPoll||u&&536>u||!u&&!a.trident&&!a.gecko;return b&&A&&k&&(k=!1),k?(M.onload=f,M.onerror=function(){M.onerror=null,x(1)}):b?a.pollCss(M,function(){x(0)}):M.onreadystatechange=f,d&&(p=setTimeout(function(){x(1)},d*n)),t||(t=a.docHead()),b?t.appendChild(M):t.insertBefore(M,t.firstChild),M}}(modulex),function(e,t){function n(t){return function(n){var r={};for(var o in n)r[o]={},r[o][t]=n[o];e.config("modules",r)}}function r(e,t){if(e=i.normalizeSlash(e),t&&"/"!==e.charAt(e.length-1)&&(e+="/"),c){if(i.startsWith(e,"http:")||i.startsWith(e,"https:")||i.startsWith(e,"file:"))return e;e=c.protocol+"//"+c.host+i.normalizePath(c.pathname,e)}return e}var o=e.Loader,a=o.Package,i=o.Utils,u=e.Env.host,s=e.Config,c=u.location,l=s.fns;s.loadModsFn=function(t,n){e.getScript(t.url,n)},s.resolveModFn=function(e){var t,n,r,o=e.name,a=e.path,i=e.getPackage();if(!i)return o;var u=i.getBase(),s=i.name,c=e.getType(),l="."+c;return a||(o=o.replace(/\.css$/,""),t=i.getFilter()||"","function"==typeof t?a=t(o,c):"string"==typeof t&&(t&&(t="-"+t),a=o+t+l)),"core"===s?r=u+a:o===s?r=u.substring(0,u.length-1)+t+l:(a=a.substring(s.length+1),r=u+a),(n=e.getTag())&&(n+=l,r+="?t="+n),r},l.requires=n("requires"),l.alias=n("alias"),l.packages=function(e){var n=this.Config,o=n.packages;return e?(i.each(e,function(e,t){var n=e.name=e.name||t,i=e.base||e.path;i&&(e.base=r(i,!0)),o[n]?o[n].reset(e):o[n]=new a(e)}),t):e===!1?(n.packages={core:o.core},t):o},l.modules=function(e){e&&i.each(e,function(e,t){var n=e.url;n&&(e.url=r(n));var a=i.createModule(t,e);a.status===o.Status.INIT&&i.mix(a,e)})},l.base=function(e){var n=this,r=s.packages.core;return e?(n.config("packages",{core:{base:e}}),t):r&&r.getBase()}}(modulex),function(e,t){function n(e,n,r){function o(){--a||n(u,i)}var a=e&&e.length,i=[],u=[];v(e,function(e){var n,a={timeout:r,success:function(){u.push(e),n&&s&&(f.debug("standard browser get mod name after load: "+n.name),p(n.name,s.factory,s.config),s=t),o()},error:function(){i.push(e),o()},charset:e.charset};e.combine||(n=e.mods[0],"css"===n.getType()?n=t:k&&(c=n.name,a.attrs={"data-mod-name":n.name})),d.loadModsFn(e,a)})}function r(e){this.callback=e,this.head=this.tail=t,this.id="loader"+ ++A}function o(e,t){if(e||"function"!=typeof t)e&&e.requires&&!e.cjs&&(e.cjs=0);else{var n=m.getRequiresFromFn(t);n.length&&(e=e||{},e.requires=n)}return e}function a(){var e,t,n,r,o=document.getElementsByTagName("script");for(t=o.length-1;t>=0;t--)if(r=o[t],"interactive"===r.readyState){e=r;break}return e?n=e.getAttribute("data-mod-name"):(f.debug("can not find interactive script,time diff : "+(+new Date-l)),f.debug("old_ie get mod name from cache : "+c),n=c),n}function i(e,t){var n=e.indexOf("//"),r="";-1!==n&&(r=e.substring(0,e.indexOf("//")+2)),e=e.substring(r.length).split(/\//),t=t.substring(r.length).split(/\//);for(var o=Math.min(e.length,t.length),a=0;o>a&&e[a]===t[a];a++);return r+e.slice(0,a).join("/")+"/"}function u(e,t,n,r,o,a){if(e&&t.length>1){for(var i=e.length,u=[],s=0;s<t.length;s++)u[s]=t[s].substring(i);return n+e+r+u.join(o)+a}return n+r+t.join(o)+a}var s,c,l,f=e.getLogger("modulex"),g=e.Loader,d=e.Config,h=g.Status,m=g.Utils,p=m.addModule,v=m.each,b=m.getHash,M=h.LOADING,y=h.LOADED,x=h.ERROR,k=m.ieMode&&m.ieMode<10,A=0;r.add=function(e,n,r,i){if(3===i&&m.isArray(n)){var u=n;n=r,r={requires:u,cjs:1}}"function"==typeof e||1===i?(r=n,n=e,r=o(r,n),k?(e=a(),p(e,n,r),c=null,l=0):s={factory:n,config:r}):(k?(c=null,l=0):s=t,r=o(r,n),p(e,n,r))};m.mix(r.prototype,{use:function(t){var r,o=this,a=d.timeout;r=o.getComboUrls(t),r.css&&n(r.css,function(t,n){v(t,function(e){v(e.mods,function(e){p(e.name,m.noop),e.flush()})}),v(n,function(t){v(t.mods,function(n){var r=n.name+" is not loaded! can not find module in url: "+t.url;e.log(r,"error"),n.status=x,n.flush()})})},a),r.js&&n(r.js,function(t){v(r.js,function(t){v(t.mods,function(n){if(!n.factory){var r=n.name+" is not loaded! can not find module in url: "+t.url;e.log(r,"error"),n.status=x}n.flush()})})},a)},calculate:function(e,t,n,r,o){var a,i,u,s,c=this;for(o=o||[],r=r||{},a=0;a<e.length;a++)if(u=e[a],i=u.name,!r[i])if(s=u.status,s!==x)if(s>y)r[i]=1;else{s===y||u.contains(c)||(s!==M&&(u.status=M,o.push(u)),u.add(c),c.wait(u)),c.calculate(u.getNormalizedRequiredModules(),t,n,r,o),r[i]=1}else t.push(u),r[i]=1;return o},getComboMods:function(e){var t,n,r,o,a,u,s,c,l,f,g,d=e.length,h={},p={};for(t=0;d>t;++t)if(r=e[t],a=r.getType(),g=r.getUrl(),o=r.getPackage(),o?(c=o.getBase(),l=o.name,s=o.getCharset(),u=o.getTag(),f=o.getGroup()):c=r.name,o&&o.isCombine()&&f){var v=h[a]||(h[a]={});f=f+"-"+s;var M=v[f]||(v[f]={}),y=0;m.each(M,function(e,t){if(m.isSameOriginAs(t,c)){var n=i(t,c);e.push(r),u&&u!==e.tag&&(e.tag=b(e.tag+u)),delete M[t],M[n]=e,y=1}}),y||(n=M[c]=[r],n.charset=s,n.tag=u||"")}else{var x=p[a]||(p[a]={});(n=x[c])?u&&u!==n.tag&&(n.tag=b(n.tag+u)):(n=x[c]=[],n.charset=s,n.tag=u||""),n.push(r)}return{groups:h,normals:p}},getComboUrls:function(e){function n(e,n,r){function o(e){x.push({combine:1,url:e,charset:b,mods:p})}function a(){return u(d,h,n,s,c,M)}for(var d,h=[],p=[],v=r.tag,b=r.charset,M=v?"?t="+encodeURIComponent(v)+"."+e:"",y=n.length,x=[],k=0;k<r.length;k++){var A=r[k],C=A.getUrl();if(A.getPackage()&&A.getPackage().isCombine()&&m.startsWith(C,n)){var E=C.slice(y).replace(/\?.*$/,"");h.push(E),p.push(A),d===t?d=-1!==E.indexOf("/")?E:"":""!==d&&(d=i(d,E),"/"===d&&(d="")),(h.length>f||a().length>g)&&(h.pop(),p.pop(),o(a()),h=[],p=[],d=t,k--)}else x.push({combine:0,url:C,charset:b,mods:[A]})}h.length&&o(a()),l[e].push.apply(l[e],x)}var r,o,a,s=d.comboPrefix,c=d.comboSep,l={},f=d.comboMaxFileNum,g=d.comboMaxUrlLength,h=this.getComboMods(e),p=h.normals,v=h.groups;for(r in p){l[r]=l[r]||[];for(o in p[r])n(r,o,p[r][o])}for(r in v){l[r]=l[r]||[];for(a in v[r])for(o in v[r][a])n(r,o,v[r][a][o])}return l},flush:function(){var e=this;if(e.callback){for(var t=e.head,n=e.callback;t;){var r=t.node,o=r.status;if(!(o>=y||o===x))return;r.remove(e),t=e.head=t.next}e.callback=null,n()}},isCompleteLoading:function(){return!this.head},wait:function(e){var t=this;if(t.head){var n={node:e};t.tail.next=n,t.tail=n}else t.tail=t.head={node:e}}}),g.ComboLoader=r}(modulex),function(e){var t=e.Env.host&&e.Env.host.document,n="??",r=",",o=e.Loader,a=o.Utils,i=a.createModule,u=o.ComboLoader,s=e.getLogger("modulex");a.mix(e,{getModule:function(e){return i(e)},getPackage:function(t){return e.Config.packages[t]},add:function(e,t,n){u.add(e,t,n,arguments.length)},use:function(t,n){function r(){++c;var t,u=[];f=o.calculate(f,u);var d=f.length;if(s.debug(c+" check duration "+(+new Date-t)),u.length){if(e.log("loader: load the following modules error","error"),e.log(a.map(u,function(e){return e.name}),"error"),i)try{i.apply(e,u)}catch(h){setTimeout(function(){throw h},0)}}else if(o.isCompleteLoading()){if(a.attachModules(g),n)try{n.apply(e,a.getModulesExports(l))}catch(h){setTimeout(function(){throw h},0)}}else o.callback=r,d&&(s.debug(c+" reload "),o.use(f))}var o,i,c=0;"object"==typeof n&&(i=n.error,n=n.success);var l=a.createModules(t),f=[];a.each(l,function(e){f.push.apply(f,e.getNormalizedModules())});var g=f;return o=new u(r),r(),e},require:function(e){var t=i(e);return t.getExports()},undef:function(e){var t=i(e),n=t.getNormalizedModules();a.each(n,function(e){e.undef()})}}),e.config({comboPrefix:n,comboSep:r,charset:"utf-8",filter:"",lang:"zh-cn"}),e.config("packages",{core:{filter:e.Config.debug?"debug":""}}),t&&t.getElementsByTagName&&e.config(a.mix({comboMaxUrlLength:2e3,comboMaxFileNum:40})),e.add("logger-manager",function(){return e.LoggerMangaer})}(modulex),modulex.add("i18n",{alias:function(e,t){return t+"/i18n/"+e.Config.lang}});/* exported KISSY */
/*jshint -W079 */
var KISSY = (function () {
    var S = {};
    var slice = [].slice;
    S.Env = modulex.Env;
    S.Config = modulex.Config;
    S.config = modulex.config;
    S.log = modulex.log;
    S.error = modulex.error;
    S.getLogger = modulex.getLogger;
    S.nodeRequire = modulex.nodeRequire;
    S.getModule = modulex.getModule;
    S.getPackage = modulex.getPackage;
    S.Loader = modulex.Loader;

    function wrap(fn) {
        function wrapped() {
            var args = slice.call(arguments, 0);
            args.unshift(S);
            fn.apply(this, args);
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
        if (typeof args[0] === 'string') {
            S.log('use\'s first argument should be array of string!, now is: ' + args[0]);
            args[0] = args[0].split(/\s*,\s*/);
        }
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

    return S;
})();




/*
Copyright 2014, KISSY v5.0.0
MIT Licensed
build time: Jul 18 14:05
*/
KISSY.add("ua",[],function(e,l,n,h){function f(b){var d=0;return parseFloat(b.replace(/\./g,function(){return 0===d++?".":""}))}function o(b,d){var g;d.trident=0.1;if((g=b.match(/Trident\/([\d.]*)/))&&g[1])d.trident=f(g[1]);d.core="trident"}function p(b){var d,g;return(d=b.match(/MSIE ([^;]*)|Trident.*; rv(?:\s|:)?([0-9.]+)/))&&(g=d[1]||d[2])?f(g):0}function q(b){var e,g="",k="",a,h=[6,9],j,i=m&&m.createElement("div"),l=[],c={webkit:d,trident:d,gecko:d,presto:d,chrome:d,safari:d,firefox:d,ie:d,ieMode:d,
opera:d,mobile:d,core:d,shell:d,phantomjs:d,os:d,ipad:d,iphone:d,ipod:d,ios:d,android:d,nodejs:d};i&&i.getElementsByTagName&&(i.innerHTML="<\!--[if IE {{version}}]><s></s><![endif]--\>".replace("{{version}}",""),l=i.getElementsByTagName("s"));if(0<l.length){o(b,c);a=h[0];for(h=h[1];a<=h;a++)if(i.innerHTML="<\!--[if IE {{version}}]><s></s><![endif]--\>".replace("{{version}}",a),0<l.length){c[k="ie"]=a;break}if(!c.ie&&(j=p(b)))c[k="ie"]=j}else if(((a=b.match(/AppleWebKit\/([\d.]*)/))||(a=b.match(/Safari\/([\d.]*)/)))&&
a[1]){c[g="webkit"]=f(a[1]);(a=b.match(/OPR\/(\d+\.\d+)/))&&a[1]?c[k="opera"]=f(a[1]):(a=b.match(/Chrome\/([\d.]*)/))&&a[1]?c[k="chrome"]=f(a[1]):(a=b.match(/\/([\d.]*) Safari/))&&a[1]?c[k="safari"]=f(a[1]):c.safari=c.webkit;if(/ Mobile\//.test(b)&&b.match(/iPad|iPod|iPhone/)){c.mobile="apple";if((a=b.match(/OS ([^\s]*)/))&&a[1])c.ios=f(a[1].replace("_","."));e="ios";if((a=b.match(/iPad|iPod|iPhone/))&&a[0])c[a[0].toLowerCase()]=c.ios}else if(/ Android/i.test(b)){if(/Mobile/.test(b)&&(e=c.mobile=
"android"),(a=b.match(/Android ([^\s]*);/))&&a[1])c.android=f(a[1])}else if(a=b.match(/NokiaN[^\/]*|Android \d\.\d|webOS\/\d\.\d/))c.mobile=a[0].toLowerCase();if((a=b.match(/PhantomJS\/([^\s]*)/))&&a[1])c.phantomjs=f(a[1])}else if((a=b.match(/Presto\/([\d.]*)/))&&a[1]){if(c[g="presto"]=f(a[1]),(a=b.match(/Opera\/([\d.]*)/))&&a[1]){c[k="opera"]=f(a[1]);if((a=b.match(/Opera\/.* Version\/([\d.]*)/))&&a[1])c[k]=f(a[1]);if((a=b.match(/Opera Mini[^;]*/))&&a)c.mobile=a[0].toLowerCase();else if((a=b.match(/Opera Mobi[^;]*/))&&
a)c.mobile=a[0]}}else if(j=p(b))c[k="ie"]=j,o(b,c);else if(a=b.match(/Gecko/)){c[g="gecko"]=0.1;if((a=b.match(/rv:([\d.]*)/))&&a[1])c[g]=f(a[1]),/Mobile|Tablet/.test(b)&&(c.mobile="firefox");if((a=b.match(/Firefox\/([\d.]*)/))&&a[1])c[k="firefox"]=f(a[1])}e||(/windows|win32/i.test(b)?e="windows":/macintosh|mac_powerpc/i.test(b)?e="macintosh":/linux/i.test(b)?e="linux":/rhino/i.test(b)&&(e="rhino"));c.os=e;c.core=c.core||g;c.shell=k;c.ieMode=c.ie&&m.documentMode||c.ie;return c}var e="undefined"!==
typeof window?window:{},d,m=e.document,h=h.exports=q(e.navigator&&e.navigator.userAgent||"");if("object"===typeof process){var i,j;if((i=process.versions)&&(j=i.node))h.os=process.platform,h.nodejs=f(j)}h.getDescriptorFromUserAgent=q;i="webkit,trident,gecko,presto,chrome,safari,firefox,ie,opera".split(",");j=m&&m.documentElement;e="";if(j){for(l=0;l<i.length;l++){var n=i[l],r=h[n];r&&(e+=" ks-"+n+(parseInt(r,10)+""),e+=" ks-"+n)}e&&(j.className=(j.className+e).replace(/^[\s\xa0]+|[\s\xa0]+$/g,""))}});
/*
Copyright 2014, KISSY v5.0.0
MIT Licensed
build time: Jul 18 14:03
*/
KISSY.add("feature",["ua"],function(j,r,w,s){function t(a,b){return b.toUpperCase()}function k(a){-1!==a.indexOf("-")&&(a=a.replace(u,t));if(a in c)return c[a];if(!h||a in h)c[a]={propertyName:a,propertyNamePrefix:""};else{for(var b=a.charAt(0).toUpperCase()+a.slice(1),d,g=0;g<v;g++){var e=n[g];d=e+b;d in h&&(c[a]={propertyName:d,propertyNamePrefix:e})}c[a]=c[a]||null}return c[a]}var e=window,j=r("ua"),n=["Webkit","Moz","O","ms"],v=n.length,i=e.document||{},l,m,d,b=i&&i.documentElement,h,o=!0,p=!1,
q="ontouchstart"in i&&!j.phantomjs,c={},f=j.ieMode;b&&(b.querySelector&&8!==f&&(p=!0),h=b.style,o="classList"in b,l="msPointerEnabled"in navigator,m="pointerEnabled"in navigator);var u=/-([a-z])/gi;s.exports={isMsPointerSupported:function(){return l},isPointerSupported:function(){return m},isTouchEventSupported:function(){return q},isTouchGestureSupported:function(){return q||m||l},isDeviceMotionSupported:function(){return!!e.DeviceMotionEvent},isHashChangeSupported:function(){return"onhashchange"in
e&&(!f||f>7)},isInputEventSupported:function(){return"oninput"in e&&(!f||f>9)},isTransform3dSupported:function(){if(d!==void 0)return d;if(!b||!k("transform"))d=false;else try{var a=i.createElement("p"),c=k("transform").propertyName;b.insertBefore(a,b.firstChild);a.style[c]="translate3d(1px,1px,1px)";var f=e.getComputedStyle(a),g=f.getPropertyValue(c)||f[c];b.removeChild(a);d=g!==void 0&&g.length>0&&g!=="none"}catch(h){d=true}return d},isClassListSupported:function(){return o},isQuerySelectorSupported:function(){return p},
getCssVendorInfo:function(a){return k(a)}}});
/*
Copyright 2014, KISSY v5.0.0
MIT Licensed
build time: Aug 11 10:12
*/
KISSY.config({packages:{gallery:{base:"https"===location.protocol?"https://s.tbcdn.cn/s/kissy/gallery":"http://a.tbcdn.cn/s/kissy/gallery"}}});
KISSY.use(["ua","feature"],function(f,g,a){function c(a,c){var b;"string"===typeof a?(b={},b[a]=c):b=a;f.config("alias",b)}f.config("requires",{"anim/base":["dom","querystring","promise"],"anim/timer":["anim/base","feature"],"anim/transition":["anim/base","feature"],attribute:["event/custom"],base:["attribute"],button:["component/control"],color:["attribute"],combobox:["menu","io"],"combobox/multi-word":["combobox"],"component/container":["component/control"],"component/control":["node","event/gesture/basic",
"event/gesture/tap","base","xtemplate/runtime"],"component/extension/align":["node","ua"],"component/extension/delegate-children":["component/control"],"component/extension/shim":["ua"],"component/plugin/drag":["dd"],"component/plugin/resize":["resizable"],cookie:["util"],"date/format":["date/gregorian"],"date/gregorian":["util","i18n!date"],"date/picker":["i18n!date/picker","component/control","date/format","date/picker-xtpl"],"date/popup-picker":["date/picker","component/extension/shim","component/extension/align"],
dd:["base","node","event/gesture/basic","event/gesture/pan"],"dd/plugin/constrain":["base","node"],"dd/plugin/proxy":["dd"],"dd/plugin/scroll":["dd"],"dom/base":["util","feature"],"dom/class-list":["dom/base"],"dom/ie":["dom/base"],"dom/selector":["util","dom/basic"],editor:["html-parser","component/control"],event:["event/dom","event/custom"],"event/base":["util"],"event/custom":["event/base"],"event/dom/base":["event/base","dom","ua"],"event/dom/focusin":["event/dom/base"],"event/dom/hashchange":["event/dom/base"],
"event/dom/ie":["event/dom/base"],"event/dom/input":["event/dom/base"],"event/gesture/basic":["event/gesture/util"],"event/gesture/edge-pan":["event/gesture/util"],"event/gesture/pan":["event/gesture/util"],"event/gesture/pinch":["event/gesture/util"],"event/gesture/rotate":["event/gesture/util"],"event/gesture/shake":["event/dom/base"],"event/gesture/swipe":["event/gesture/util"],"event/gesture/tap":["event/gesture/util"],"event/gesture/util":["event/dom/base","feature"],feature:["ua"],"filter-menu":["menu"],
"html-parser":["util"],io:"dom,event/custom,promise,url,ua,event/dom".split(","),json:["util"],menu:["component/container","component/extension/delegate-children","component/extension/content-box","component/extension/align","component/extension/shim"],menubutton:["button","menu"],"navigation-view":["component/container","component/extension/content-box"],"navigation-view/bar":["button"],node:["util","dom","event/dom","anim"],overlay:["component/container","component/extension/shim","component/extension/align",
"component/extension/content-box"],promise:["util"],querystring:["logger-manager"],resizable:["dd"],"resizable/plugin/proxy":["base","node"],router:["url","event/dom","event/custom","feature"],"scroll-view/base":["anim/timer","component/container","component/extension/content-box"],"scroll-view/plugin/pull-to-refresh":["base","node","feature"],"scroll-view/plugin/scrollbar":["component/control","event/gesture/pan"],"scroll-view/touch":["scroll-view/base","event/gesture/pan"],separator:["component/control"],
"split-button":["menubutton"],stylesheet:["dom"],swf:["dom","json","attribute"],tabs:["toolbar","button","component/extension/content-box"],toolbar:["component/container","component/extension/delegate-children"],tree:["component/container","component/extension/content-box","component/extension/delegate-children"],url:["querystring","path"],util:["logger-manager"],xtemplate:["xtemplate/runtime"],"xtemplate/runtime":["util"]});var h=window,e=a.isTouchGestureSupported(),b=f.add,d={};c("anim",a.getCssVendorInfo("transition")?
"anim/transition":"anim/timer");c({"dom/basic":["dom/base",9>g.ieMode?"dom/ie":"",a.isClassListSupported()?"":"dom/class-list"],dom:["dom/basic",a.isQuerySelectorSupported()?"":"dom/selector"]});c("event/dom",["event/dom/base",a.isHashChangeSupported()?"":"event/dom/hashchange",9>g.ieMode?"event/dom/ie":"",a.isInputEventSupported()?"":"event/dom/input",g.ie?"":"event/dom/focusin"]);e||b("event/gesture/edge-pan",d);e||b("event/gesture/pinch",d);e||b("event/gesture/rotate",d);h.DeviceMotionEvent||b("event/gesture/shake",
d);e||b("event/gesture/swipe",d);c("ajax","io");c("scroll-view",a.isTouchGestureSupported()?"scroll-view/touch":"scroll-view/base")});
