/*
Copyright 2012, KISSY UI Library v1.30rc
MIT Licensed
build time: Sep 27 16:17
*/
KISSY.add("editor/core/elementPath",function(e){function g(a){for(var b=i,c=i,e=[];a;){if(a[0].nodeType==j.NodeType.ELEMENT_NODE){this.lastElement||(this.lastElement=a);var h=a.nodeName();if(!c&&(!b&&l[h]&&(b=a),m[h])){var d;if(d=!b)if(d="div"==h){a:{d=a[0].childNodes;for(var k=0,g=d.length;k<g;k++){var f=d[k];if(f.nodeType==j.NodeType.ELEMENT_NODE&&n.$block[f.nodeName.toLowerCase()]){d=!0;break a}}d=!1}d=!d}d?b=a:c=a}e.push(a);if("body"==h)break}a=a.parent()}this.block=b;this.blockLimit=c;this.elements=
e}var f=e.Editor,j=e.DOM,n=f.XHTML_DTD,i=null,l={address:1,blockquote:1,dl:1,h1:1,h2:1,h3:1,h4:1,h5:1,h6:1,p:1,pre:1,li:1,dt:1,dd:1},m={body:1,div:1,table:1,tbody:1,tr:1,td:1,th:1,caption:1,form:1};g.prototype={compare:function(a){var b=this.elements,a=a&&a.elements;if(!a||b.length!=a.length)return!1;for(var c=0;c<b.length;c++)if(!j.equals(b[c],a[c]))return!1;return!0},contains:function(a){for(var b=this.elements,c=0;c<b.length;c++)if(b[c].nodeName()in a)return b[c];return i},toString:function(){var a=
this.elements,b,c=[];for(b=0;b<a.length;b++)c.push(a[b].nodeName());return c.toString()}};return f.ElementPath=g},{requires:["./base","./dom"]});
