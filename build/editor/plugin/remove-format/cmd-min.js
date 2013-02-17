/*
Copyright 2013, KISSY UI Library v1.30
MIT Licensed
build time: Feb 17 17:29
*/
KISSY.add("editor/plugin/remove-format/cmd",function(k,d){function l(b,c){for(var e=0;e<c.length;e++)b.removeAttr(c[e])}var m=d.RANGE,n=d.ElementPath,j=k.DOM,o="class,style,lang,width,height,align,hspace,valign".split(/,/),h=RegExp("^(?:"+"b,big,code,del,dfn,em,font,i,ins,kbd,q,samp,small,span,strike,strong,sub,sup,tt,u,var,s".replace(/,/g,"|")+")$","i");return{init:function(b){b.hasCommand("removeFormat")||b.addCommand("removeFormat",{exec:function(){b.focus();h.lastIndex=0;var c=b.getSelection().getRanges();
b.execCommand("save");for(var e=0,f;f=c[e];e++)if(!f.collapsed){f.enlarge(m.ENLARGE_ELEMENT);var i=f.createBookmark(),a=i.startNode,d=i.endNode,g=function(a){for(var b=new n(a),e=b.elements,d=1,c;(c=e[d])&&!c.equals(b.block)&&!c.equals(b.blockLimit);d++)h.test(c.nodeName())&&a._4e_breakParent(c)};g(a);g(d);for(a=a._4e_nextSourceNode(!0,j.NodeType.ELEMENT_NODE,void 0,void 0);a&&!a.equals(d);)g=a._4e_nextSourceNode(!1,j.NodeType.ELEMENT_NODE,void 0,void 0),"img"==a.nodeName()&&(a.attr("_ke_realelement")||
/\bke_/.test(a[0].className))||(h.test(a.nodeName())?a._4e_remove(!0):l(a,o)),a=g;f.moveToBookmark(i)}b.getSelection().selectRanges(c);b.execCommand("save")}})}}},{requires:["editor"]});
