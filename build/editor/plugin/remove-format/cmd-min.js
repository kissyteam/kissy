/*
Copyright 2014, KISSY v1.47
MIT Licensed
build time: May 22 12:25
*/
KISSY.add("editor/plugin/remove-format/cmd",["editor"],function(k,l){function m(b,d){for(var e=0;e<d.length;e++)b.removeAttr(d[e])}var c=l("editor"),n=c.RangeType,o=c.ElementPath,j=k.DOM,p="class,style,lang,width,height,align,hspace,valign".split(/,/),h=RegExp("^(?:"+"b,big,code,del,dfn,em,font,i,ins,kbd,q,samp,small,span,strike,strong,sub,sup,tt,u,var,s".replace(/,/g,"|")+")$","i");return{init:function(b){b.hasCommand("removeFormat")||b.addCommand("removeFormat",{exec:function(){b.focus();h.lastIndex=
0;var d=b.getSelection().getRanges();b.execCommand("save");for(var e=0,f;f=d[e];e++)if(!f.collapsed){f.enlarge(n.ENLARGE_ELEMENT);var i=f.createBookmark(),a=i.startNode,c=i.endNode,g=function(a){for(var b=new o(a),e=b.elements,d=1,c;(c=e[d])&&!c.equals(b.block)&&!c.equals(b.blockLimit);d++)h.test(c.nodeName())&&a._4eBreakParent(c)};g(a);g(c);for(a=a._4eNextSourceNode(!0,j.NodeType.ELEMENT_NODE,void 0,void 0);a&&!a.equals(c);)g=a._4eNextSourceNode(!1,j.NodeType.ELEMENT_NODE,void 0,void 0),"img"===
a.nodeName()&&(a.attr("_ke_real_element")||/\bke_/.test(a[0].className))||(h.test(a.nodeName())?a._4eRemove(!0):m(a,p)),a=g;f.moveToBookmark(i)}b.getSelection().selectRanges(d);b.execCommand("save")}})}}});
