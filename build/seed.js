var modulex=function(e){function t(){}"undefined"==typeof console&&(this.console={log:t,error:t,warn:t});var r={__BUILD_TIME:"Fri, 05 Sep 2014 03:39:48 GMT",Env:{host:this,mods:{}},Config:{debug:"",packages:{},fns:{}},version:"1.3.1",config:function(t,n){var o,i,a,s=r.Config,u=s.fns,c=this;if("string"==typeof t)o=u[t],n===e?i=o?o.call(c):s[t]:o?i=o.call(c,n):s[t]=n;else for(var l in t)n=t[l],a=u[l],a?a.call(c,n):s[l]=n;return i}},n=r.Loader={};return n.Status={ERROR:-1,UNLOADED:0,LOADING:1,LOADED:2,INITIALIZING:3,INITIALIZED:4},r}();!function(e){function t(e){var t=0;return parseFloat(e.replace(/\./g,function(){return 0===t++?".":""}))}function r(e){var t=e.split(/\//);return"/"===e.charAt(0)&&t[0]&&t.unshift(""),"/"===e.charAt(e.length-1)&&e.length>1&&t[t.length-1]&&t.push(""),t}function n(e){return"/"===e.charAt(e.length-1)&&(e+="index"),g.endsWith(e,".js")&&(e=e.slice(0,-3)),e}function o(e,t){var r,n,o=0;if(b(e))for(n=e.length;n>o&&t(e[o],o,e)!==!1;o++);else for(r=i(e),n=r.length;n>o&&t(e[r[o]],r[o],e)!==!1;o++);}function i(e){var t=[];for(var r in e)t.push(r);return t}function a(e,t){for(var r in t)e[r]=t[r];return e}var s,u,c=e.Loader,l=e.Env,f=l.mods,d=Array.prototype.map,h=l.host,g=c.Utils={},p=h.document,v=(h.navigator||{}).userAgent||"";((s=v.match(/Web[Kk]it[\/]{0,1}([\d.]*)/))||(s=v.match(/Safari[\/]{0,1}([\d.]*)/)))&&s[1]&&(g.webkit=t(s[1])),(s=v.match(/Trident\/([\d.]*)/))&&(g.trident=t(s[1])),(s=v.match(/Gecko/))&&(g.gecko=.1,(s=v.match(/rv:([\d.]*)/))&&s[1]&&(g.gecko=t(s[1]))),(s=v.match(/MSIE ([^;]*)|Trident.*; rv(?:\s|:)?([0-9.]+)/))&&(u=s[1]||s[2])&&(g.ie=t(u),g.ieMode=p.documentMode||g.ie,g.trident=g.trident||1);var m=/http(s)?:\/\/([^/]+)(?::(\d+))?/,y=/(\/\*([\s\mx]*?)\*\/|([^:]|^)\/\/(.*)$)/gm,M=/[^.'"]\s*require\s*\((['"])([^)]+)\1\)/g,b=Array.isArray||function(e){return"[object Array]"===Object.prototype.toString.call(e)};a(g,{mix:a,noop:function(){},map:d?function(e,t,r){return d.call(e,t,r||this)}:function(e,t,r){for(var n=e.length,o=new Array(n),i=0;n>i;i++){var a="string"==typeof e?e.charAt(i):e[i];(a||i in e)&&(o[i]=t.call(r||this,a,i,e))}return o},startsWith:function(e,t){return 0===e.lastIndexOf(t,0)},isEmptyObject:function(e){for(var t in e)if(void 0!==t)return!1;return!0},endsWith:function(e,t){var r=e.length-t.length;return r>=0&&e.indexOf(t,r)===r},now:Date.now||function(){return+new Date},each:o,keys:i,isArray:b,indexOf:function(e,t){for(var r=0,n=t.length;n>r;r++)if(t[r]===e)return r;return-1},normalizeSlash:function(e){return e.replace(/\\/g,"/")},normalizePath:function(e,t){var n=t.charAt(0);if("."!==n)return t;var o=r(e),i=r(t);o.pop();for(var a=0,s=i.length;s>a;a++){var u=i[a];"."===u||(".."===u?o.pop():o.push(u))}return o.join("/").replace(/\/+/,"/")},isSameOriginAs:function(e,t){var r=e.match(m),n=t.match(m);return r[0]===n[0]},docHead:function(){return p.getElementsByTagName("head")[0]||p.documentElement},getHash:function(e){var t,r=5381;for(t=e.length;--t>-1;)r=(r<<5)+r+e.charCodeAt(t);return r+""},getRequiresFromFn:function(e){var t=[];return e.toString().replace(y,"").replace(M,function(e,r,n){t.push(n)}),t},createModule:function(e,t){var r=f[e];return r||(e=n(e),r=f[e]),r?(t&&r.reset(t),r):(f[e]=r=new c.Module(a({id:e},t)),r)},createModules:function(e){return g.map(e,function(e){return g.createModule(e)})},initModules:function(e){var t,r=e.length,n=1;for(t=0;r>t;t++)n&=e[t].initRecursive();return n},getModulesExports:function(e){for(var t=e.length,r=[],n=0;t>n;n++)r.push(e[n].getExports());return r},addModule:function(e,t,r){var n=f[e];return n&&void 0!==n.factory?void console.warn(e+" is defined more than once"):void g.createModule(e,a({id:e,status:c.Status.LOADED,factory:t},r))}})}(modulex),function(e){function t(e){for(var t=[],r=0;r<e.length;r++)t[r]=e[r];return t}function r(e,t){return t in e?e[t]:c[t]}function n(e){m(this,e)}function o(r){var n=this;n.exports=void 0,n.status=l.UNLOADED,n.id=void 0,n.factory=void 0,n.config=void 0,n.cjs=1,m(n,r),n.waits={};var o=n._require=function(e){if("string"==typeof e){var t=n.resolve(e);return g.initModules(t.getNormalizedModules()),t.getExports()}o.async.apply(o,arguments)};o.async=function(r){for(var o=0;o<r.length;o++)r[o]=n.resolve(r[o]).id;var i=t(arguments);i[0]=r,e.use.apply(e,i)},o.toUrl=function(e){return n.resolve(e).getUri()},o.load=e.getScript}function i(t){var r=t.indexOf("!");if(-1!==r){var n=t.substring(0,r);t=t.substring(r+1);var o=v(n);o.initRecursive();var i=o.getExports()||{};i.alias&&(t=i.alias(e,t,n))}return t}function a(e,t){e=e||[];for(var r=e.length,n=0;r>n;n++)e[n]=t.resolve(e[n]).id;return e}function s(e){var t,r=e.id,n=e.alias;return"string"==typeof n&&(e.alias=n=[n]),n?n:(t=e.getPackage(),t&&t.alias&&(n=t.alias(r)),n=e.alias=n||[i(r)])}var u=e.Loader,c=e.Config,l=u.Status,f=l.INITIALIZED,d=l.INITIALIZING,h=l.ERROR,g=u.Utils,p=g.startsWith,v=g.createModule,m=g.mix;n.prototype={constructor:n,reset:function(e){m(this,e)},getFilter:function(){return r(this,"filter")},getTag:function(){return r(this,"tag")},getBase:function(){return this.base},getCharset:function(){return r(this,"charset")},isCombine:function(){return r(this,"combine")},getGroup:function(){return r(this,"group")}},u.Package=n,o.prototype={modulex:1,constructor:o,config:function(){return this.config},reset:function(e){var t=this;m(t,e),e.requires&&t.setRequiresModules(e.requires)},require:function(e){return this.resolve(e).getExports()},resolve:function(e){return v(g.normalizePath(this.id,e))},add:function(e){this.waits[e.id]=e},remove:function(e){delete this.waits[e.id]},contains:function(e){return this.waits[e.id]},flush:function(){g.each(this.waits,function(e){e.flush()}),this.waits={}},getType:function(){var e=this,t=e.type;return t||(t=g.endsWith(e.id,".css")?"css":"js",e.type=t),t},getAlias:function(){var e=this,t=e.id;if(e.normalizedAlias)return e.normalizedAlias;var r=s(e),n=[];if(r[0]===t)n=r;else for(var o=0,i=r.length;i>o;o++){var a=r[o];if(a&&a!==t){var u=v(a),c=u.getAlias();c?n.push.apply(n,c):n.push(a)}}return e.normalizedAlias=n,n},getNormalizedModules:function(){var e=this;return e.normalizedModules?e.normalizedModules:(e.normalizedModules=g.map(e.getAlias(),function(e){return v(e)}),e.normalizedModules)},getUri:function(){var t=this;return t.uri||(t.uri=g.normalizeSlash(e.Config.resolveModFn(t))),t.uri},getExports:function(){return this.getNormalizedModules()[0].exports},getPackage:function(){var e=this;if(!("packageInfo"in e)){var t=e.id;if(p(t,"/")||p(t,"http://")||p(t,"https://")||p(t,"file://"))return void(e.packageInfo=null);var r,n=c.packages,o=e.id+"/",i="";for(r in n)p(o,r+"/")&&r.length>i.length&&(i=r);e.packageInfo=n[i]||n.core}return e.packageInfo},getTag:function(){var e=this;return e.tag||e.getPackage()&&e.getPackage().getTag()},getCharset:function(){var e=this;return e.charset||e.getPackage()&&e.getPackage().getCharset()},setRequiresModules:function(e){var t=this,r=t.requiredModules=g.map(a(e,t),function(e){return v(e)}),n=[];g.each(r,function(e){n.push.apply(n,e.getNormalizedModules())}),t.normalizedRequiredModules=n},getNormalizedRequiredModules:function(){var e=this;return e.normalizedRequiredModules?e.normalizedRequiredModules:(e.setRequiresModules(e.requires),e.normalizedRequiredModules)},getRequiredModules:function(){var e=this;return e.requiredModules?e.requiredModules:(e.setRequiresModules(e.requires),e.requiredModules)},callFactory:function(){var e=this;return e.factory.apply(e,e.cjs?[e._require,e.exports,e]:g.map(e.getRequiredModules(),function(e){return e.getExports()}))},initSelf:function(){var e,t=this,r=t.factory;if("function"==typeof r){if(t.exports={},c.debug)e=t.callFactory();else{try{e=t.callFactory()}catch(n){if(t.status=h,t.onError||c.onModuleError){var o={type:"init",exception:n,module:t};t.onError&&t.onError(o),c.onModuleError&&c.onModuleError(o)}else setTimeout(function(){throw n},0);return 0}var i=1;if(g.each(t.getNormalizedRequiredModules(),function(e){return e.status===h?(i=0,!1):void 0}),!i)return 0}void 0!==e&&(t.exports=e)}else t.exports=r;return t.status=f,t.afterInit&&t.afterInit(t),c.afterModInit&&c.afterModInit(t),1},initRecursive:function(){var e=this,t=1,r=e.status;return r===h?0:r>=d?t:(e.status=d,e.cjs?t=e.initSelf():(g.each(e.getNormalizedRequiredModules(),function(e){t=t&&e.initRecursive()}),t&&e.initSelf()),t)},undef:function(){this.status=l.UNLOADED,delete this.factory,delete this.exports}},u.Module=o}(modulex),function(e){function t(){a||n()}function r(e){var t=0;if(i.webkit)e.sheet&&(t=1);else if(e.sheet)try{var r=e.sheet.cssRules;r&&(t=1)}catch(n){var o=n.name;"NS_ERROR_DOM_SECURITY_ERR"===o&&(t=1)}return t}function n(){for(var e in s){var t=s[e],u=t.node;r(u)&&(t.callback&&t.callback.call(u),delete s[e])}a=i.isEmptyObject(s)?0:setTimeout(n,o)}var o=30,i=e.Loader.Utils,a=0,s={};i.pollCss=function(e,r){var n=e.href,o=s[n]={};o.node=e,o.callback=r,t()},i.isCssLoaded=r}(modulex),function(e){var t,r=1e3,n=e.Env.host,o=n.document,i=e.Loader.Utils,a={},s=i.webkit;e.getScript=function(n,u,c){function l(){var e=y.readyState;e&&"loaded"!==e&&"complete"!==e||(y.onreadystatechange=y.onload=null,b(0))}var f,d,h,g,p,v=u,m=i.endsWith(n,".css");if("object"==typeof v&&(u=v.success,f=v.error,d=v.timeout,c=v.charset,h=v.attrs),m&&i.ieMode<10&&o.getElementsByTagName("style").length+o.getElementsByTagName("link").length>=31)return setTimeout(function(){throw new Error("style and link's number is more than 31.ie < 10 can not insert link: "+n)},0),void(f&&f());if(g=a[n]=a[n]||[],g.push([u,f]),g.length>1)return g.node;var y=o.createElement(m?"link":"script"),M=function(){p&&(clearTimeout(p),p=void 0)};h&&i.each(h,function(e,t){y.setAttribute(t,e)}),c&&(y.charset=c),m?(y.href=n,y.rel="stylesheet"):(y.src=n,y.async=!0),g.node=y;var b=function(e){var t,r=e;M(),i.each(a[n],function(e){(t=e[r])&&t.call(y)}),delete a[n]},E="onload"in y,x=e.Config.forceCssPoll||s&&536>s||!s&&!i.trident&&!i.gecko;return m&&x&&E&&(E=!1),E?(y.onload=l,y.onerror=function(){y.onerror=null,b(1)}):m?i.pollCss(y,function(){b(0)}):y.onreadystatechange=l,d&&(p=setTimeout(function(){b(1)},d*r)),t||(t=i.docHead()),m?t.appendChild(y):t.insertBefore(y,t.firstChild),y}}(modulex),function(e,t){function r(t){return function(r){var n={};for(var o in r)n[o]={},n[o][t]=r[o];e.config("modules",n)}}function n(e,t){if(e=a.normalizeSlash(e),t&&"/"!==e.charAt(e.length-1)&&(e+="/"),c){if(a.startsWith(e,"http:")||a.startsWith(e,"//")||a.startsWith(e,"https:")||a.startsWith(e,"file:"))return e;e=c.protocol+"//"+c.host+a.normalizePath(c.pathname,e)}return e}var o=e.Loader,i=o.Package,a=o.Utils,s=e.Env.host,u=e.Config,c=s.location,l=u.fns;u.loadModsFn=function(t,r){e.getScript(t.uri,r)},u.resolveModFn=function(e){var t,r,n,o=e.id,i=e.path,a=e.getPackage();if(!a)return o;var s=a.getBase(),u=a.name,c=e.getType(),l="."+c;return i||(o=o.replace(/\.css$/,""),t=a.getFilter()||"","function"==typeof t?i=t(o,c):"string"==typeof t&&(t&&(t="-"+t),i=o+t+l)),"core"===u?n=s+i:o===u?n=s.substring(0,s.length-1)+t+l:(i=i.substring(u.length+1),n=s+i),(r=e.getTag())&&(r+=l,n+="?t="+r),n},l.requires=r("requires"),l.alias=r("alias"),l.packages=function(e){var r=u.packages;return e?(a.each(e,function(e,t){var o=e.name=e.name||t,a=e.base||e.path;a&&(e.base=n(a,!0)),r[o]?r[o].reset(e):r[o]=new i(e)}),t):e===!1?(u.packages={core:r.core},t):r},l.modules=function(e){e&&a.each(e,function(e,t){var r=e.uri;r&&(e.uri=n(r)),a.createModule(t,e)})},l.base=function(e){var r=this,n=u.packages.core;return e?(r.config("packages",{core:{base:e}}),t):n&&n.getBase()}}(modulex),function(e,t){function r(e,r,n){function o(){--i||r(s,a)}var i=e&&e.length,a=[],s=[];v(e,function(e){var r,i={timeout:n,success:function(){s.push(e),r&&u&&(p(r.id,u.factory,u.config),u=t),o()},error:function(){a.push(e),o()},charset:e.charset};e.combine||(r=e.mods[0],"css"===r.getType()?r=t:E&&(c=r.id,i.attrs={"data-mod-id":r.id})),d.loadModsFn(e,i)})}function n(e){this.callback=e,this.head=this.tail=t,this.id="loader"+ ++x}function o(e,t){if(e||"function"!=typeof t)e&&e.requires&&!e.cjs&&(e.cjs=0);else{var r=g.getRequiresFromFn(t);r.length&&(e=e||{},e.requires=r)}return e}function i(){var e,t,r,n,o=document.getElementsByTagName("script");for(t=o.length-1;t>=0;t--)if(n=o[t],"interactive"===n.readyState){e=n;break}return r=e?e.getAttribute("data-mod-id"):c}function a(e,t){var r=e.indexOf("//"),n="";-1!==r&&(n=e.substring(0,e.indexOf("//")+2)),e=e.substring(n.length).split(/\//),t=t.substring(n.length).split(/\//);for(var o=Math.min(e.length,t.length),i=0;o>i&&e[i]===t[i];i++);return n+e.slice(0,i).join("/")+"/"}function s(e,t,r,n,o,i){if(e&&t.length>1){for(var a=e.length,s=[],u=0;u<t.length;u++)s[u]=t[u].substring(a);return r+e+n+s.join(o)+i}return r+n+t.join(o)+i}var u,c,l,f=e.Loader,d=e.Config,h=f.Status,g=f.Utils,p=g.addModule,v=g.each,m=g.getHash,y=h.LOADING,M=h.LOADED,b=h.ERROR,E=g.ieMode&&g.ieMode<10,x=0;n.add=function(e,r,n,a){if(3===a&&g.isArray(r)){var s=r;r=n,n={requires:s,cjs:1}}"function"==typeof e||1===a?(n=r,r=e,n=o(n,r),E?(e=i(),p(e,r,n),c=null,l=0):u={factory:r,config:n}):(E?(c=null,l=0):u=t,n=o(n,r),p(e,r,n))};g.mix(n.prototype,{use:function(e){var t,n=this,o=d.timeout;t=n.getComboUris(e),t.css&&r(t.css,function(e,t){v(e,function(e){v(e.mods,function(e){p(e.id,g.noop),e.flush()})}),v(t,function(e){v(e.mods,function(t){var r=t.id+" is not loaded! can not find module in uri: "+e.uri;console.error(r),t.status=b;var n={type:"load",exception:r,module:t};t.onError&&t.onError(n),d.onModuleError&&d.onModuleError(n),t.flush()})})},o),t.js&&r(t.js,function(e){v(t.js,function(e){v(e.mods,function(t){if(!t.factory){var r=t.id+" is not loaded! can not find module in uri: "+e.uri;console.error(r),t.status=b}t.flush()})})},o)},calculate:function(e,t,r,n,o){var i,a,s,u,c=this;for(o=o||[],n=n||{},i=0;i<e.length;i++)if(s=e[i],a=s.id,!n[a])if(u=s.status,u!==b)if(u>M)n[a]=1;else{u===M||s.contains(c)||(u!==y&&(s.status=y,o.push(s)),s.add(c),c.wait(s)),c.calculate(s.getNormalizedRequiredModules(),t,r,n,o),n[a]=1}else t.push(s),n[a]=1;return o},getComboMods:function(e){var t,r,n,o,i,s,u,c,l,f,d,h=e.length,p={},v={};for(t=0;h>t;++t)if(n=e[t],i=n.getType(),d=n.getUri(),o=n.getPackage(),o?(c=o.getBase(),l=o.name,u=o.getCharset(),s=o.getTag(),f=o.getGroup()):c=n.id,o&&o.isCombine()&&f){var y=p[i]||(p[i]={});f=f+"-"+u;var M=y[f]||(y[f]={}),b=0;g.each(M,function(e,t){if(g.isSameOriginAs(t,c)){var r=a(t,c);e.push(n),s&&s!==e.tag&&(e.tag=m(e.tag+s)),delete M[t],M[r]=e,b=1}}),b||(r=M[c]=[n],r.charset=u,r.tag=s||"")}else{var E=v[i]||(v[i]={});(r=E[c])?s&&s!==r.tag&&(r.tag=m(r.tag+s)):(r=E[c]=[],r.charset=u,r.tag=s||""),r.push(n)}return{groups:p,normals:v}},getComboUris:function(e){function r(e,r,n){function o(e){E.push({combine:1,uri:e,charset:y,mods:v})}function i(){return s(d,p,r,u,c,M)}for(var d,p=[],v=[],m=n.tag,y=n.charset,M=m?"?t="+encodeURIComponent(m)+"."+e:"",b=r.length,E=[],x=0;x<n.length;x++){var k=n[x],R=k.getUri();if(k.getPackage()&&k.getPackage().isCombine()&&g.startsWith(R,r)){var A=R.slice(b).replace(/\?.*$/,"");p.push(A),v.push(k),d===t?d=-1!==A.indexOf("/")?A:"":""!==d&&(d=a(d,A),"/"===d&&(d="")),(p.length>f||i().length>h)&&(p.pop(),v.pop(),o(i()),p=[],v=[],d=t,x--)}else E.push({combine:0,uri:R,charset:y,mods:[k]})}p.length&&o(i()),l[e].push.apply(l[e],E)}var n,o,i,u=d.comboPrefix,c=d.comboSep,l={},f=d.comboMaxFileNum,h=d.comboMaxUriLength,p=this.getComboMods(e),v=p.normals,m=p.groups;for(n in v){l[n]=l[n]||[];for(o in v[n])r(n,o,v[n][o])}for(n in m){l[n]=l[n]||[];for(i in m[n])for(o in m[n][i])r(n,o,m[n][i][o])}return l},flush:function(){var e=this;if(e.callback){for(var t=e.head,r=e.callback;t;){var n=t.node,o=n.status;if(!(o>=M||o===b))return;n.remove(e),t=e.head=t.next}e.callback=null,r()}},isCompleteLoading:function(){return!this.head},wait:function(e){var t=this;if(t.head){var r={node:e};t.tail.next=r,t.tail=r}else t.tail=t.head={node:e}}}),f.ComboLoader=n}(modulex),function(e){var t=e.Env.host&&e.Env.host.document,r="??",n=",",o=e.Loader,i=o.Utils,a=o.Status,s=i.createModule,u=o.ComboLoader;i.mix(e,{getModule:function(e){return s(e)},getPackage:function(t){return e.Config.packages[t]},add:function(e,t,r){u.add(e,t,r,arguments.length)},use:function(t,r,n){function o(t,r){if(console.error("modulex: "+r+" the following modules error"),console.error(i.map(t,function(e){return e.id})),n)try{n.apply(e,t)}catch(o){setTimeout(function(){throw o},0)}}function s(){++l;var t=[];d=c.calculate(d,t),g=g.concat(d);var n=d.length;if(t.length)o(t,"load");else if(c.isCompleteLoading()){var u=i.initModules(h);if(u){if(r)try{r.apply(e,i.getModulesExports(f))}catch(p){setTimeout(function(){throw p},0)}}else t=[],i.each(g,function(e){e.status===a.ERROR&&t.push(e)}),o(t,"initialize")}else c.callback=s,n&&c.use(d)}var c,l=0;"string"==typeof t&&(t=t.split(/\s*,\s*/)),"object"==typeof r&&(n=r.error,r=r.success);var f=i.createModules(t),d=[];i.each(f,function(e){d.push.apply(d,e.getNormalizedModules())});var h=d,g=[];return c=new u(s),s(),e},require:function(e){return s(e).getExports()},undef:function(e){var t=s(e),r=t.getNormalizedModules();i.each(r,function(e){e.undef()})}}),e.config({comboPrefix:r,comboSep:n,charset:"utf-8",filter:"",lang:"zh-cn"}),e.config("packages",{core:{filter:"",base:"."}}),t&&t.getElementsByTagName&&e.config(i.mix({comboMaxUriLength:2e3,comboMaxFileNum:40}))}(modulex),modulex.add("i18n",{alias:function(e,t){return t+"/i18n/"+e.Config.lang}});/* exported KISSY */
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
build time: Aug 26 16:11
*/
KISSY.config({packages:{gallery:{base:"https"===location.protocol?"https://s.tbcdn.cn/s/kissy/gallery":"http://a.tbcdn.cn/s/kissy/gallery"},kg:{base:"//g.alicdn.com/kg/"}}});
KISSY.use(["ua","feature"],function(f,g,a){function c(a,c){var b;"string"===typeof a?(b={},b[a]=c):b=a;f.config("alias",b)}f.config("requires",{"anim/base":["dom","querystring","promise"],"anim/timer":["anim/base","feature"],"anim/transition":["anim/base","feature"],attribute:["event/custom"],base:["attribute"],button:["component/control"],color:["attribute"],combobox:["menu","io"],"combobox/multi-word":["combobox"],"component/container":["component/control"],"component/control":["node","event/gesture/basic",
"event/gesture/tap","base","xtemplate/runtime"],"component/extension/align":["node","ua"],"component/extension/delegate-children":["component/control"],"component/extension/shim":["ua"],"component/plugin/drag":["dd"],"component/plugin/resize":["resizable"],cookie:["util"],"date/format":["date/gregorian"],"date/gregorian":["util","i18n!date"],"date/picker":["i18n!date/picker","component/control","date/format","date/picker-xtpl"],"date/popup-picker":["date/picker","component/extension/shim","component/extension/align"],
dd:["base","node","event/gesture/basic","event/gesture/pan"],"dd/plugin/constrain":["base","node"],"dd/plugin/proxy":["dd"],"dd/plugin/scroll":["dd"],"dom/base":["util","feature"],"dom/class-list":["dom/base"],"dom/ie":["dom/base"],"dom/selector":["util","dom/basic"],editor:["html-parser","component/control"],event:["event/dom","event/custom"],"event/base":["util"],"event/custom":["event/base"],"event/dom/base":["event/base","dom","ua"],"event/dom/focusin":["event/dom/base"],"event/dom/hashchange":["event/dom/base"],
"event/dom/ie":["event/dom/base"],"event/dom/input":["event/dom/base"],"event/gesture/basic":["event/gesture/util"],"event/gesture/edge-pan":["event/gesture/util"],"event/gesture/pan":["event/gesture/util"],"event/gesture/pinch":["event/gesture/util"],"event/gesture/rotate":["event/gesture/util"],"event/gesture/shake":["event/dom/base"],"event/gesture/swipe":["event/gesture/util"],"event/gesture/tap":["event/gesture/util"],"event/gesture/util":["event/dom/base","feature"],feature:["ua"],"filter-menu":["menu"],
"html-parser":["util"],io:"dom,event/custom,promise,url,ua,event/dom".split(","),json:["util"],menu:["component/container","component/extension/delegate-children","component/extension/content-box","component/extension/align","component/extension/shim"],menubutton:["button","menu"],"navigation-view":["component/container","component/extension/content-box"],"navigation-view/bar":["button"],node:["util","dom","event/dom","anim"],overlay:["component/container","component/extension/shim","component/extension/align",
"component/extension/content-box"],promise:["util"],querystring:["logger-manager"],resizable:["dd"],"resizable/plugin/proxy":["base","node"],router:["url","event/dom","event/custom","feature"],"scroll-view/base":["anim/timer","component/container","component/extension/content-box"],"scroll-view/plugin/pull-to-refresh":["base","node","feature"],"scroll-view/plugin/scrollbar":["component/control","event/gesture/pan"],"scroll-view/touch":["scroll-view/base","event/gesture/pan"],separator:["component/control"],
"split-button":["menubutton"],stylesheet:["dom"],swf:["dom","json","attribute"],tabs:["toolbar","button","component/extension/content-box"],toolbar:["component/container","component/extension/delegate-children"],tree:["component/container","component/extension/content-box","component/extension/delegate-children"],url:["querystring","path"],util:["logger-manager"],xtemplate:["xtemplate/runtime"]});var h=window,e=a.isTouchGestureSupported(),b=f.add,d={};c("anim",a.getCssVendorInfo("transition")?"anim/transition":
"anim/timer");c({"dom/basic":["dom/base",9>g.ieMode?"dom/ie":"",a.isClassListSupported()?"":"dom/class-list"],dom:["dom/basic",a.isQuerySelectorSupported()?"":"dom/selector"]});c("event/dom",["event/dom/base",a.isHashChangeSupported()?"":"event/dom/hashchange",9>g.ieMode?"event/dom/ie":"",a.isInputEventSupported()?"":"event/dom/input",g.ie?"":"event/dom/focusin"]);e||b("event/gesture/edge-pan",d);e||b("event/gesture/pinch",d);e||b("event/gesture/rotate",d);h.DeviceMotionEvent||b("event/gesture/shake",
d);e||b("event/gesture/swipe",d);c("ajax","io");c("scroll-view",a.isTouchGestureSupported()?"scroll-view/touch":"scroll-view/base")});
