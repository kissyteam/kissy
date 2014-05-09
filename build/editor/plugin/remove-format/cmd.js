/*
Copyright 2014, KISSY v5.0.0
MIT Licensed
build time: May 9 14:01
*/
KISSY.add("editor/plugin/remove-format/cmd",["editor","dom"],function(p,d){function l(b,c){for(var e=0;e<c.length;e++)b.removeAttr(c[e])}var j=d("editor"),m=j.RangeType,n=j.ElementPath,k=d("dom"),o="class,style,lang,width,height,align,hspace,valign".split(/,/),h=RegExp("^(?:"+"b,big,code,del,dfn,em,font,i,ins,kbd,q,samp,small,span,strike,strong,sub,sup,tt,u,var,s".replace(/,/g,"|")+")$","i");return{init:function(b){b.hasCommand("removeFormat")||b.addCommand("removeFormat",{exec:function(){b.focus();
h.lastIndex=0;var c=b.getSelection().getRanges();b.execCommand("save");for(var e=0,f;f=c[e];e++)if(!f.collapsed){f.enlarge(m.ENLARGE_ELEMENT);var i=f.createBookmark(),a=i.startNode,d=i.endNode,g=function(a){for(var b=new n(a),e=b.elements,d=1,c;(c=e[d])&&!c.equals(b.block)&&!c.equals(b.blockLimit);d++)h.test(c.nodeName())&&a._4eBreakParent(c)};g(a);g(d);for(a=a._4eNextSourceNode(!0,k.NodeType.ELEMENT_NODE,void 0,void 0);a&&!a.equals(d);)g=a._4eNextSourceNode(!1,k.NodeType.ELEMENT_NODE,void 0,void 0),
"img"===a.nodeName()&&(a.attr("_ke_real_element")||/\bke_/.test(a[0].className))||(h.test(a.nodeName())?a._4eRemove(!0):l(a,o)),a=g;f.moveToBookmark(i)}b.getSelection().selectRanges(c);b.execCommand("save")}})}}});
