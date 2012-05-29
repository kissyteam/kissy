/*
Copyright 2012, KISSY UI Library v1.30dev
MIT Licensed
build time: May 29 18:24
*/
KISSY.add("editor/plugin/heading/index",function(j,f,i){return{init:function(c){i.init(c);var g=[],b={"普通文本":"p","标题1":"h1","标题2":"h2","标题3":"h3","标题4":"h4","标题5":"h5","标题6":"h6"},e={p:"1em",h1:"2em",h2:"1.5em",h3:"1.17em",h4:"1em",h5:"0.83em",h6:"0.67em"},a;for(a in b)b.hasOwnProperty(a)&&g.push({name:a,value:b[a],attrs:{style:"font-size:"+e[b[a]]}});c.addSelect({items:g,title:"标题",width:"100px",mode:f.WYSIWYG_MODE},{click:function(h){var a=h.newVal;a!=h.prevVal?c.execCommand("heading",a):(c.execCommand("heading",
"p"),this.set("value","p"))},selectionChange:function(a){var a=a.path,b=f.Utils.getQueryCmd("heading"),d;for(d in e)if(e.hasOwnProperty(d)&&c.execCommand(b,a,d)){this.set("value",d);break}}})}}},{requires:["editor","./cmd"]});
