/*
Copyright 2014, KISSY v5.0.0
MIT Licensed
build time: Jul 18 14:04
*/
KISSY.add("path",[],function(l,m,n,k){function h(a){a=a.split(/\/+/);a[a.length-1]||(a=a.slice(0,-1));a[0]||(a=a.slice(1));return a}function j(a,b){for(var c=0,e=a.length-1,d=[],f;0<=e;e--)f=a[e],"."!==f&&(".."===f?c++:c?c--:d[d.length]=f);if(b)for(;c--;c)d[d.length]="..";return d=d.reverse()}var g=/^(\/?)([\s\S]+\/(?!$)|\/)?((?:\.{1,2}$|[\s\S]+?)?(\.[^.\/]*)?)$/,i={resolve:function(){var a="",b,c=arguments,e,d=0;for(b=c.length-1;0<=b&&!d;b--)e=c[b],"string"===typeof e&&e&&(a=e+"/"+a,d="/"===e.charAt(0));
a=j(h(a),!d).join("/");return(d?"/":"")+a||"."},normalize:function(a){var b="/"===a.charAt(0),c="/"===a.slice(-1),a=j(h(a),!b).join("/");!a&&!b&&(a=".");a&&c&&(a+="/");return(b?"/":"")+a},join:function(){var a=Array.prototype.slice.call(arguments);return i.normalize(a.join("/"))},relative:function(a,b){var a=i.normalize(a),b=i.normalize(b),c=h(a),e=[],d,f,g=h(b);f=Math.min(c.length,g.length);for(d=0;d<f&&c[d]===g[d];d++);for(f=d;d<c.length;)e.push(".."),d++;e=e.concat(g.slice(f));return e.join("/")},
basename:function(a,b){var c;c=(a.match(g)||[])[3]||"";b&&c&&c.slice(-1*b.length)===b&&(c=c.slice(0,-1*b.length));return c},dirname:function(a){var b=a.match(g)||[],a=b[1]||"",b=b[2]||"";if(!a&&!b)return".";b&&(b=b.substring(0,b.length-1));return a+b},extname:function(a){return(a.match(g)||[])[4]||""}};k.exports=i});
