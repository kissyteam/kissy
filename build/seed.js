var modulex=function(e){function t(){}"undefined"==typeof console&&(this.console={log:t,error:t,warn:t});var n={__BUILD_TIME:"Thu, 04 Sep 2014 10:17:32 GMT",Env:{host:this,mods:{}},Config:{debug:"",packages:{},fns:{}},version:"1.3.1",config:function(t,r){var o,i,a,s=n.Config,u=s.fns,c=this;if("string"==typeof t)o=u[t],r===e?i=o?o.call(c):s[t]:o?i=o.call(c,r):s[t]=r;else for(var l in t)r=t[l],a=u[l],a?a.call(c,r):s[l]=r;return i}},r=n.Loader={};return r.Status={ERROR:-1,UNLOADED:0,LOADING:1,LOADED:2,INITIALIZING:3,INITIALIZED:4},n}();!function(e){function t(e){var t=0;return parseFloat(e.replace(/\./g,function(){return 0===t++?".":""}))}function n(e){var t=e.split(/\//);return"/"===e.charAt(0)&&t[0]&&t.unshift(""),"/"===e.charAt(e.length-1)&&e.length>1&&t[t.length-1]&&t.push(""),t}function r(e){return"/"===e.charAt(e.length-1)&&(e+="index"),g.endsWith(e,".js")&&(e=e.slice(0,-3)),e}function o(e,t){var n,r,o=0;if(b(e))for(r=e.length;r>o&&t(e[o],o,e)!==!1;o++);else for(n=i(e),r=n.length;r>o&&t(e[n[o]],n[o],e)!==!1;o++);}function i(e){var t=[];for(var n in e)t.push(n);return t}function a(e,t){for(var n in t)e[n]=t[n];return e}var s,u,c=e.Loader,l=e.Env,f=l.mods,d=Array.prototype.map,h=l.host,g=c.Utils={},p=h.document,v=(h.navigator||{}).userAgent||"";((s=v.match(/Web[Kk]it[\/]{0,1}([\d.]*)/))||(s=v.match(/Safari[\/]{0,1}([\d.]*)/)))&&s[1]&&(g.webkit=t(s[1])),(s=v.match(/Trident\/([\d.]*)/))&&(g.trident=t(s[1])),(s=v.match(/Gecko/))&&(g.gecko=.1,(s=v.match(/rv:([\d.]*)/))&&s[1]&&(g.gecko=t(s[1]))),(s=v.match(/MSIE ([^;]*)|Trident.*; rv(?:\s|:)?([0-9.]+)/))&&(u=s[1]||s[2])&&(g.ie=t(u),g.ieMode=p.documentMode||g.ie,g.trident=g.trident||1);var m=/http(s)?:\/\/([^/]+)(?::(\d+))?/,y=/(\/\*([\s\mx]*?)\*\/|([^:]|^)\/\/(.*)$)/gm,M=/[^.'"]\s*require\s*\((['"])([^)]+)\1\)/g,b=Array.isArray||function(e){return"[object Array]"===Object.prototype.toString.call(e)};a(g,{mix:a,noop:function(){},map:d?function(e,t,n){return d.call(e,t,n||this)}:function(e,t,n){for(var r=e.length,o=new Array(r),i=0;r>i;i++){var a="string"==typeof e?e.charAt(i):e[i];(a||i in e)&&(o[i]=t.call(n||this,a,i,e))}return o},startsWith:function(e,t){return 0===e.lastIndexOf(t,0)},isEmptyObject:function(e){for(var t in e)if(void 0!==t)return!1;return!0},endsWith:function(e,t){var n=e.length-t.length;return n>=0&&e.indexOf(t,n)===n},now:Date.now||function(){return+new Date},each:o,keys:i,isArray:b,indexOf:function(e,t){for(var n=0,r=t.length;r>n;n++)if(t[n]===e)return n;return-1},normalizeSlash:function(e){return e.replace(/\\/g,"/")},normalizePath:function(e,t){var r=t.charAt(0);if("."!==r)return t;var o=n(e),i=n(t);o.pop();for(var a=0,s=i.length;s>a;a++){var u=i[a];"."===u||(".."===u?o.pop():o.push(u))}return o.join("/").replace(/\/+/,"/")},isSameOriginAs:function(e,t){var n=e.match(m),r=t.match(m);return n[0]===r[0]},docHead:function(){return p.getElementsByTagName("head")[0]||p.documentElement},getHash:function(e){var t,n=5381;for(t=e.length;--t>-1;)n=(n<<5)+n+e.charCodeAt(t);return n+""},getRequiresFromFn:function(e){var t=[];return e.toString().replace(y,"").replace(M,function(e,n,r){t.push(r)}),t},createModule:function(e,t){var n=f[e];return n||(e=r(e),n=f[e]),n?(t&&n.reset(t),n):(f[e]=n=new c.Module(a({id:e},t)),n)},createModules:function(e){return g.map(e,function(e){return g.createModule(e)})},initModules:function(e){var t,n=e.length,r=1;for(t=0;n>t;t++)r&=e[t].initRecursive();return r},getModulesExports:function(e){for(var t=e.length,n=[],r=0;t>r;r++)n.push(e[r].getExports());return n},addModule:function(e,t,n){var r=f[e];return r&&void 0!==r.factory?void console.warn(e+" is defined more than once"):void g.createModule(e,a({id:e,status:c.Status.LOADED,factory:t},n))}})}(modulex),function(e){function t(e){for(var t=[],n=0;n<e.length;n++)t[n]=e[n];return t}function n(e,t){return t in e?e[t]:c[t]}function r(e){m(this,e)}function o(n){var r=this;r.exports=void 0,r.status=l.UNLOADED,r.id=void 0,r.factory=void 0,r.config=void 0,r.cjs=1,m(r,n),r.waits={};var o=r._require=function(e){if("string"==typeof e){var t=r.resolve(e);return g.initModules(t.getNormalizedModules()),t.getExports()}o.async.apply(o,arguments)};o.async=function(n){for(var o=0;o<n.length;o++)n[o]=r.resolve(n[o]).id;var i=t(arguments);i[0]=n,e.use.apply(e,i)},o.toUrl=function(e){return r.resolve(e).getUri()},o.load=e.getScript}function i(t){var n=t.indexOf("!");if(-1!==n){var r=t.substring(0,n);t=t.substring(n+1);var o=v(r).initRecursive().getExports()||{};o.alias&&(t=o.alias(e,t,r))}return t}function a(e,t){e=e||[];for(var n=e.length,r=0;n>r;r++)e[r]=t.resolve(e[r]).id;return e}function s(e){var t,n=e.id,r=e.alias;return"string"==typeof r&&(e.alias=r=[r]),r?r:(t=e.getPackage(),t&&t.alias&&(r=t.alias(n)),r=e.alias=r||[i(n)])}var u=e.Loader,c=e.Config,l=u.Status,f=l.INITIALIZED,d=l.INITIALIZING,h=l.ERROR,g=u.Utils,p=g.startsWith,v=g.createModule,m=g.mix;r.prototype={constructor:r,reset:function(e){m(this,e)},getFilter:function(){return n(this,"filter")},getTag:function(){return n(this,"tag")},getBase:function(){return this.base},getCharset:function(){return n(this,"charset")},isCombine:function(){return n(this,"combine")},getGroup:function(){return n(this,"group")}},u.Package=r,o.prototype={modulex:1,constructor:o,config:function(){return this.config},reset:function(e){var t=this;m(t,e),e.requires&&t.setRequiresModules(e.requires)},require:function(e){return this.resolve(e).getExports()},resolve:function(e){return v(g.normalizePath(this.id,e))},add:function(e){this.waits[e.id]=e},remove:function(e){delete this.waits[e.id]},contains:function(e){return this.waits[e.id]},flush:function(){g.each(this.waits,function(e){e.flush()}),this.waits={}},getType:function(){var e=this,t=e.type;return t||(t=g.endsWith(e.id,".css")?"css":"js",e.type=t),t},getAlias:function(){var e=this,t=e.id;if(e.normalizedAlias)return e.normalizedAlias;var n=s(e),r=[];if(n[0]===t)r=n;else for(var o=0,i=n.length;i>o;o++){var a=n[o];if(a&&a!==t){var u=v(a),c=u.getAlias();c?r.push.apply(r,c):r.push(a)}}return e.normalizedAlias=r,r},getNormalizedModules:function(){var e=this;return e.normalizedModules?e.normalizedModules:(e.normalizedModules=g.map(e.getAlias(),function(e){return v(e)}),e.normalizedModules)},getUri:function(){var t=this;return t.uri||(t.uri=g.normalizeSlash(e.Config.resolveModFn(t))),t.uri},getExports:function(){return this.getNormalizedModules()[0].exports},getPackage:function(){var e=this;if(!("packageInfo"in e)){var t=e.id;if(p(t,"/")||p(t,"http://")||p(t,"https://")||p(t,"file://"))return void(e.packageInfo=null);var n,r=c.packages,o=e.id+"/",i="";for(n in r)p(o,n+"/")&&n.length>i.length&&(i=n);e.packageInfo=r[i]||r.core}return e.packageInfo},getTag:function(){var e=this;return e.tag||e.getPackage()&&e.getPackage().getTag()},getCharset:function(){var e=this;return e.charset||e.getPackage()&&e.getPackage().getCharset()},setRequiresModules:function(e){var t=this,n=t.requiredModules=g.map(a(e,t),function(e){return v(e)}),r=[];g.each(n,function(e){r.push.apply(r,e.getNormalizedModules())}),t.normalizedRequiredModules=r},getNormalizedRequiredModules:function(){var e=this;return e.normalizedRequiredModules?e.normalizedRequiredModules:(e.setRequiresModules(e.requires),e.normalizedRequiredModules)},getRequiredModules:function(){var e=this;return e.requiredModules?e.requiredModules:(e.setRequiresModules(e.requires),e.requiredModules)},callFactory:function(){var e=this;return e.factory.apply(e,e.cjs?[e._require,e.exports,e]:g.map(e.getRequiredModules(),function(e){return e.getExports()}))},initSelf:function(){var e,t=this,n=t.factory;if("function"==typeof n){if(t.exports={},c.debug)e=t.callFactory();else{try{e=t.callFactory()}catch(r){if(t.status=h,t.onError||c.onModuleError){var o={type:"init",exception:r,module:t};t.onError&&t.onError(o),c.onModuleError&&c.onModuleError(o)}else setTimeout(function(){throw r},0);return 0}var i=1;if(g.each(t.getNormalizedRequiredModules(),function(e){return e.status===h?(i=0,!1):void 0}),!i)return 0}void 0!==e&&(t.exports=e)}else t.exports=n;return t.status=f,t.afterInit&&t.afterInit(t),c.afterModInit&&c.afterModInit(t),1},initRecursive:function(){var e=this,t=1,n=e.status;return n===h?0:n>=d?t:(e.status=d,e.cjs?t=e.initSelf():(g.each(e.getNormalizedRequiredModules(),function(e){t=t&&e.initRecursive()}),t&&e.initSelf()),t)},undef:function(){this.status=l.UNLOADED,delete this.factory,delete this.exports}},u.Module=o}(modulex),function(e){function t(){a||r()}function n(e){var t=0;if(i.webkit)e.sheet&&(t=1);else if(e.sheet)try{var n=e.sheet.cssRules;n&&(t=1)}catch(r){var o=r.name;"NS_ERROR_DOM_SECURITY_ERR"===o&&(t=1)}return t}function r(){for(var e in s){var t=s[e],u=t.node;n(u)&&(t.callback&&t.callback.call(u),delete s[e])}a=i.isEmptyObject(s)?0:setTimeout(r,o)}var o=30,i=e.Loader.Utils,a=0,s={};i.pollCss=function(e,n){var r=e.href,o=s[r]={};o.node=e,o.callback=n,t()},i.isCssLoaded=n}(modulex),function(e){var t,n=1e3,r=e.Env.host,o=r.document,i=e.Loader.Utils,a={},s=i.webkit;e.getScript=function(r,u,c){function l(){var e=y.readyState;e&&"loaded"!==e&&"complete"!==e||(y.onreadystatechange=y.onload=null,b(0))}var f,d,h,g,p,v=u,m=i.endsWith(r,".css");if("object"==typeof v&&(u=v.success,f=v.error,d=v.timeout,c=v.charset,h=v.attrs),m&&i.ieMode<10&&o.getElementsByTagName("style").length+o.getElementsByTagName("link").length>=31)return setTimeout(function(){throw new Error("style and link's number is more than 31.ie < 10 can not insert link: "+r)},0),void(f&&f());if(g=a[r]=a[r]||[],g.push([u,f]),g.length>1)return g.node;var y=o.createElement(m?"link":"script"),M=function(){p&&(clearTimeout(p),p=void 0)};h&&i.each(h,function(e,t){y.setAttribute(t,e)}),c&&(y.charset=c),m?(y.href=r,y.rel="stylesheet"):(y.src=r,y.async=!0),g.node=y;var b=function(e){var t,n=e;M(),i.each(a[r],function(e){(t=e[n])&&t.call(y)}),delete a[r]},E="onload"in y,x=e.Config.forceCssPoll||s&&536>s||!s&&!i.trident&&!i.gecko;return m&&x&&E&&(E=!1),E?(y.onload=l,y.onerror=function(){y.onerror=null,b(1)}):m?i.pollCss(y,function(){b(0)}):y.onreadystatechange=l,d&&(p=setTimeout(function(){b(1)},d*n)),t||(t=i.docHead()),m?t.appendChild(y):t.insertBefore(y,t.firstChild),y}}(modulex),function(e,t){function n(t){return function(n){var r={};for(var o in n)r[o]={},r[o][t]=n[o];e.config("modules",r)}}function r(e,t){if(e=a.normalizeSlash(e),t&&"/"!==e.charAt(e.length-1)&&(e+="/"),c){if(a.startsWith(e,"http:")||a.startsWith(e,"//")||a.startsWith(e,"https:")||a.startsWith(e,"file:"))return e;e=c.protocol+"//"+c.host+a.normalizePath(c.pathname,e)}return e}var o=e.Loader,i=o.Package,a=o.Utils,s=e.Env.host,u=e.Config,c=s.location,l=u.fns;u.loadModsFn=function(t,n){e.getScript(t.uri,n)},u.resolveModFn=function(e){var t,n,r,o=e.id,i=e.path,a=e.getPackage();if(!a)return o;var s=a.getBase(),u=a.name,c=e.getType(),l="."+c;return i||(o=o.replace(/\.css$/,""),t=a.getFilter()||"","function"==typeof t?i=t(o,c):"string"==typeof t&&(t&&(t="-"+t),i=o+t+l)),"core"===u?r=s+i:o===u?r=s.substring(0,s.length-1)+t+l:(i=i.substring(u.length+1),r=s+i),(n=e.getTag())&&(n+=l,r+="?t="+n),r},l.requires=n("requires"),l.alias=n("alias"),l.packages=function(e){var n=u.packages;return e?(a.each(e,function(e,t){var o=e.name=e.name||t,a=e.base||e.path;a&&(e.base=r(a,!0)),n[o]?n[o].reset(e):n[o]=new i(e)}),t):e?n:(u.packages={core:n.core},t)},l.modules=function(e){e&&a.each(e,function(e,t){var n=e.uri;n&&(e.uri=r(n)),a.createModule(t,e)})},l.base=function(e){var n=this,r=u.packages.core;return e?(n.config("packages",{core:{base:e}}),t):r&&r.getBase()}}(modulex),function(e,t){function n(e,n,r){function o(){--i||n(s,a)}var i=e&&e.length,a=[],s=[];v(e,function(e){var n,i={timeout:r,success:function(){s.push(e),n&&u&&(p(n.id,u.factory,u.config),u=t),o()},error:function(){a.push(e),o()},charset:e.charset};e.combine||(n=e.mods[0],"css"===n.getType()?n=t:E&&(c=n.id,i.attrs={"data-mod-id":n.id})),d.loadModsFn(e,i)})}function r(e){this.callback=e,this.head=this.tail=t,this.id="loader"+ ++x}function o(e,t){if(e||"function"!=typeof t)e&&e.requires&&!e.cjs&&(e.cjs=0);else{var n=g.getRequiresFromFn(t);n.length&&(e=e||{},e.requires=n)}return e}function i(){var e,t,n,r,o=document.getElementsByTagName("script");for(t=o.length-1;t>=0;t--)if(r=o[t],"interactive"===r.readyState){e=r;break}return n=e?e.getAttribute("data-mod-id"):c}function a(e,t){var n=e.indexOf("//"),r="";-1!==n&&(r=e.substring(0,e.indexOf("//")+2)),e=e.substring(r.length).split(/\//),t=t.substring(r.length).split(/\//);for(var o=Math.min(e.length,t.length),i=0;o>i&&e[i]===t[i];i++);return r+e.slice(0,i).join("/")+"/"}function s(e,t,n,r,o,i){if(e&&t.length>1){for(var a=e.length,s=[],u=0;u<t.length;u++)s[u]=t[u].substring(a);return n+e+r+s.join(o)+i}return n+r+t.join(o)+i}var u,c,l,f=e.Loader,d=e.Config,h=f.Status,g=f.Utils,p=g.addModule,v=g.each,m=g.getHash,y=h.LOADING,M=h.LOADED,b=h.ERROR,E=g.ieMode&&g.ieMode<10,x=0;r.add=function(e,n,r,a){if(3===a&&g.isArray(n)){var s=n;n=r,r={requires:s,cjs:1}}"function"==typeof e||1===a?(r=n,n=e,r=o(r,n),E?(e=i(),p(e,n,r),c=null,l=0):u={factory:n,config:r}):(E?(c=null,l=0):u=t,r=o(r,n),p(e,n,r))};g.mix(r.prototype,{use:function(e){var t,r=this,o=d.timeout;t=r.getComboUris(e),t.css&&n(t.css,function(e,t){v(e,function(e){v(e.mods,function(e){p(e.id,g.noop),e.flush()})}),v(t,function(e){v(e.mods,function(t){var n=t.id+" is not loaded! can not find module in uri: "+e.uri;console.error(n),t.status=b;var r={type:"load",exception:n,module:t};t.onError&&t.onError(r),d.onModuleError&&d.onModuleError(r),t.flush()})})},o),t.js&&n(t.js,function(e){v(t.js,function(e){v(e.mods,function(t){if(!t.factory){var n=t.id+" is not loaded! can not find module in uri: "+e.uri;console.error(n),t.status=b}t.flush()})})},o)},calculate:function(e,t,n,r,o){var i,a,s,u,c=this;for(o=o||[],r=r||{},i=0;i<e.length;i++)if(s=e[i],a=s.id,!r[a])if(u=s.status,u!==b)if(u>M)r[a]=1;else{u===M||s.contains(c)||(u!==y&&(s.status=y,o.push(s)),s.add(c),c.wait(s)),c.calculate(s.getNormalizedRequiredModules(),t,n,r,o),r[a]=1}else t.push(s),r[a]=1;return o},getComboMods:function(e){var t,n,r,o,i,s,u,c,l,f,d,h=e.length,p={},v={};for(t=0;h>t;++t)if(r=e[t],i=r.getType(),d=r.getUri(),o=r.getPackage(),o?(c=o.getBase(),l=o.name,u=o.getCharset(),s=o.getTag(),f=o.getGroup()):c=r.id,o&&o.isCombine()&&f){var y=p[i]||(p[i]={});f=f+"-"+u;var M=y[f]||(y[f]={}),b=0;g.each(M,function(e,t){if(g.isSameOriginAs(t,c)){var n=a(t,c);e.push(r),s&&s!==e.tag&&(e.tag=m(e.tag+s)),delete M[t],M[n]=e,b=1}}),b||(n=M[c]=[r],n.charset=u,n.tag=s||"")}else{var E=v[i]||(v[i]={});(n=E[c])?s&&s!==n.tag&&(n.tag=m(n.tag+s)):(n=E[c]=[],n.charset=u,n.tag=s||""),n.push(r)}return{groups:p,normals:v}},getComboUris:function(e){function n(e,n,r){function o(e){E.push({combine:1,uri:e,charset:y,mods:v})}function i(){return s(d,p,n,u,c,M)}for(var d,p=[],v=[],m=r.tag,y=r.charset,M=m?"?t="+encodeURIComponent(m)+"."+e:"",b=n.length,E=[],x=0;x<r.length;x++){var k=r[x],R=k.getUri();if(k.getPackage()&&k.getPackage().isCombine()&&g.startsWith(R,n)){var A=R.slice(b).replace(/\?.*$/,"");p.push(A),v.push(k),d===t?d=-1!==A.indexOf("/")?A:"":""!==d&&(d=a(d,A),"/"===d&&(d="")),(p.length>f||i().length>h)&&(p.pop(),v.pop(),o(i()),p=[],v=[],d=t,x--)}else E.push({combine:0,uri:R,charset:y,mods:[k]})}p.length&&o(i()),l[e].push.apply(l[e],E)}var r,o,i,u=d.comboPrefix,c=d.comboSep,l={},f=d.comboMaxFileNum,h=d.comboMaxUriLength,p=this.getComboMods(e),v=p.normals,m=p.groups;for(r in v){l[r]=l[r]||[];for(o in v[r])n(r,o,v[r][o])}for(r in m){l[r]=l[r]||[];for(i in m[r])for(o in m[r][i])n(r,o,m[r][i][o])}return l},flush:function(){var e=this;if(e.callback){for(var t=e.head,n=e.callback;t;){var r=t.node,o=r.status;if(!(o>=M||o===b))return;r.remove(e),t=e.head=t.next}e.callback=null,n()}},isCompleteLoading:function(){return!this.head},wait:function(e){var t=this;if(t.head){var n={node:e};t.tail.next=n,t.tail=n}else t.tail=t.head={node:e}}}),f.ComboLoader=r}(modulex),function(e){var t=e.Env.host&&e.Env.host.document,n="??",r=",",o=e.Loader,i=o.Utils,a=o.Status,s=i.createModule,u=o.ComboLoader;i.mix(e,{getModule:function(e){return s(e)},getPackage:function(t){return e.Config.packages[t]},add:function(e,t,n){u.add(e,t,n,arguments.length)},use:function(t,n,r){function o(t,n){if(console.error("modulex: "+n+" the following modules error"),console.error(i.map(t,function(e){return e.id})),r)try{r.apply(e,t)}catch(o){setTimeout(function(){throw o},0)}}function s(){++l;var t=[];d=c.calculate(d,t),g=g.concat(d);var r=d.length;if(t.length)o(t,"load");else if(c.isCompleteLoading()){var u=i.initModules(h);if(u){if(n)try{n.apply(e,i.getModulesExports(f))}catch(p){setTimeout(function(){throw p},0)}}else t=[],i.each(g,function(e){e.status===a.ERROR&&t.push(e)}),o(t,"initialize")}else c.callback=s,r&&c.use(d)}var c,l=0;"string"==typeof t&&(t=t.split(/\s*,\s*/)),"object"==typeof n&&(r=n.error,n=n.success);var f=i.createModules(t),d=[];i.each(f,function(e){d.push.apply(d,e.getNormalizedModules())});var h=d,g=[];return c=new u(s),s(),e},require:function(e){return s(e).getExports()},undef:function(e){var t=s(e),n=t.getNormalizedModules();i.each(n,function(e){e.undef()})}}),e.config({comboPrefix:n,comboSep:r,charset:"utf-8",filter:"",lang:"zh-cn"}),e.config("packages",{core:{filter:"",base:"."}}),t&&t.getElementsByTagName&&e.config(i.mix({comboMaxUriLength:2e3,comboMaxFileNum:40}))}(modulex),modulex.add("i18n",{alias:function(e,t){return t+"/i18n/"+e.Config.lang}});/* exported KISSY */
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
