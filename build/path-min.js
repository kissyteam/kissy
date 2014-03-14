/*
Copyright 2014, KISSY v1.50
MIT Licensed
build time: Mar 14 15:43
*/
KISSY.add("path",[],function(j){function g(a,b,c){var e=[];j.each(a,function(a,f,g){b.call(c||this,a,f,g)&&e.push(a)});return e}function k(a,b){for(var c=0,e=a.length-1,d=[],f;0<=e;e--)f=a[e],"."!==f&&(".."===f?c++:c?c--:d[d.length]=f);if(b)for(;c--;c)d[d.length]="..";return d=d.reverse()}var h=/^(\/?)([\s\S]+\/(?!$)|\/)?((?:\.{1,2}$|[\s\S]+?)?(\.[^.\/]*)?)$/,i=j.Path={resolve:function(){var a="",b,c=arguments,e,d=0;for(b=c.length-1;0<=b&&!d;b--)e=c[b],"string"===typeof e&&e&&(a=e+"/"+a,d="/"===e.charAt(0));
a=k(g(a.split("/"),function(a){return!!a}),!d).join("/");return(d?"/":"")+a||"."},normalize:function(a){var b="/"===a.charAt(0),c="/"===a.slice(-1),a=k(g(a.split("/"),function(a){return!!a}),!b).join("/");!a&&!b&&(a=".");a&&c&&(a+="/");return(b?"/":"")+a},join:function(){var a=Array.prototype.slice.call(arguments);return i.normalize(g(a,function(a){return a&&"string"===typeof a}).join("/"))},relative:function(a,b){var a=i.normalize(a),b=i.normalize(b),c=g(a.split("/"),function(a){return!!a}),e=[],
d,f,h=g(b.split("/"),function(a){return!!a});f=Math.min(c.length,h.length);for(d=0;d<f&&c[d]===h[d];d++);for(f=d;d<c.length;)e.push(".."),d++;e=e.concat(h.slice(f));return e=e.join("/")},basename:function(a,b){var c;c=(a.match(h)||[])[3]||"";b&&c&&c.slice(-1*b.length)===b&&(c=c.slice(0,-1*b.length));return c},dirname:function(a){var b=a.match(h)||[],a=b[1]||"",b=b[2]||"";if(!a&&!b)return".";b&&(b=b.substring(0,b.length-1));return a+b},extname:function(a){return(a.match(h)||[])[4]||""}};return i});
