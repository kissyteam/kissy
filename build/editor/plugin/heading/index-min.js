/*
Copyright 2012, KISSY UI Library v1.30dev
MIT Licensed
build time: Jun 7 00:48
*/
KISSY.add("editor/plugin/heading/index",function(i,f,h){return{init:function(d){h.init(d);var g=[],b={"普通文本":"p","标题1":"h1","标题2":"h2","标题3":"h3","标题4":"h4","标题5":"h5","标题6":"h6"},e={p:"1em",h1:"2em",h2:"1.5em",h3:"1.17em",h4:"1em",h5:"0.83em",h6:"0.67em"},a;for(a in b)b.hasOwnProperty(a)&&g.push({content:a,value:b[a],elAttrs:{style:"font-size:"+e[b[a]]}});d.addSelect("heading",{defaultCaption:"标题",width:"120px",menu:{width:"120px",children:g},mode:f.WYSIWYG_MODE},{click:function(c){var a=c.target.get("value"),
c=c.prevTarget&&c.prevTarget.get("value");a!=c?d.execCommand("heading",a):(d.execCommand("heading","p"),this.set("value","p"))},selectionChange:function(c){var c=c.path,a=f.Utils.getQueryCmd("heading"),b;for(b in e)if(e.hasOwnProperty(b)&&d.execCommand(a,c,b)){this.set("value",b);break}}})}}},{requires:["editor","./cmd"]});
