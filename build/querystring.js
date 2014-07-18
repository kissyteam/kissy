/*
Copyright 2014, KISSY v5.0.0
MIT Licensed
build time: Jul 18 14:04
*/
KISSY.add("querystring",["logger-manager"],function(p,l,q,o){function m(a){var c=typeof a;return null==a||"object"!==c&&"function"!==c}function h(a){return decodeURIComponent(a.replace(/\+/g," "))}var k=encodeURIComponent,n={}.toString;l("logger-manager");o.exports={stringify:function(a,c,f,e){c=c||"&";f=f||"=";void 0===e&&(e=!0);var b=[],d,i,j,h,g;for(d in a){g=a[d];var l=d;d=k(d);if(m(g))b.push(d),void 0!==g&&b.push(f,k(g+"")),b.push(c);else if("[object Array]"===n.apply(g)){i=0;for(h=g.length;i<
h;++i)j=g[i],m(j)&&(b.push(d,e&&"[]"!==l.slice(-2)?k("[]"):""),void 0!==j&&b.push(f,k(j+"")),b.push(c))}}b.pop();return b.join("")},parse:function(a,c,f){for(var f=f||"=",e={},b,c=a.split(c||"&"),d=0,i=c.length;d<i;++d){b=c[d].indexOf(f);if(-1===b)a=h(c[d]),b=void 0;else{a=h(c[d].substring(0,b));b=c[d].substring(b+1);try{b=h(b)}catch(j){}"[]"===a.slice(-2)&&(a=a.slice(0,-2))}a in e?"[object Array]"===n.apply(e[a])?e[a].push(b):e[a]=[e[a],b]:e[a]=b}return e}}});
