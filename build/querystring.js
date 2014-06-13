/*
Copyright 2014, KISSY v5.0.0
MIT Licensed
build time: Jun 13 11:53
*/
KISSY.add("querystring",["logger-manager"],function(q,o,r,p){function l(b){var c=typeof b;return null==b||"object"!==c&&"function"!==c}function h(b){return decodeURIComponent(b.replace(/\+/g," "))}var k=encodeURIComponent,m={}.toString,n=o("logger-manager");p.exports={stringify:function(b,c,f,e){c=c||"&";f=f||"=";void 0===e&&(e=!0);var a=[],d,i,j,h,g;for(d in b)if(g=b[d],d=k(d),l(g))a.push(d),void 0!==g&&a.push(f,k(g+"")),a.push(c);else if("[object Array]"===m.apply(g)){i=0;for(h=g.length;i<h;++i)j=
g[i],l(j)&&(a.push(d,e?k("[]"):""),void 0!==j&&a.push(f,k(j+"")),a.push(c))}a.pop();return a.join("")},parse:function(b,c,f){for(var f=f||"=",e={},a,c=b.split(c||"&"),d=0,i=c.length;d<i;++d){a=c[d].indexOf(f);if(-1===a)b=h(c[d]),a=void 0;else{b=h(c[d].substring(0,a));a=c[d].substring(a+1);try{a=h(a)}catch(j){n.log("decodeURIComponent error : "+a,"error"),n.log(j,"error")}"[]"===b.slice(-2)&&(b=b.slice(0,-2))}b in e?"[object Array]"===m.apply(e[b])?e[b].push(a):e[b]=[e[b],a]:e[b]=a}return e}}});
