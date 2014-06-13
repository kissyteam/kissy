/*
Copyright 2014, KISSY v5.0.0
MIT Licensed
build time: Jun 13 11:48
*/
KISSY.add("editor/plugin/remove-format/cmd",["editor","dom"],function(d,c,p,k){function l(b,f){for(var e=0;e<f.length;e++)b.removeAttr(f[e])}var d=c("editor"),m=d.RangeType,n=d.ElementPath,j=c("dom"),o="class,style,lang,width,height,align,hspace,valign".split(/,/),i=RegExp("^(?:"+"b,big,code,del,dfn,em,font,i,ins,kbd,q,samp,small,span,strike,strong,sub,sup,tt,u,var,s".replace(/,/g,"|")+")$","i");k.exports={init:function(b){b.hasCommand("removeFormat")||b.addCommand("removeFormat",{exec:function(){b.focus();
i.lastIndex=0;var f=b.getSelection().getRanges();b.execCommand("save");for(var e=0,g;g=f[e];e++)if(!g.collapsed){g.enlarge(m.ENLARGE_ELEMENT);var d=g.createBookmark(),a=d.startNode,c=d.endNode,h=function(a){for(var b=new n(a),d=b.elements,e=1,c;(c=d[e])&&!c.equals(b.block)&&!c.equals(b.blockLimit);e++)i.test(c.nodeName())&&a._4eBreakParent(c)};h(a);h(c);for(a=a._4eNextSourceNode(!0,j.NodeType.ELEMENT_NODE,void 0,void 0);a&&!a.equals(c);)h=a._4eNextSourceNode(!1,j.NodeType.ELEMENT_NODE,void 0,void 0),
"img"===a.nodeName()&&(a.attr("_ke_real_element")||/\bke_/.test(a[0].className))||(i.test(a.nodeName())?a._4eRemove(!0):l(a,o)),a=h;g.moveToBookmark(d)}b.getSelection().selectRanges(f);b.execCommand("save")}})}}});
