/*
Copyright 2012, KISSY UI Library v1.40dev
MIT Licensed
build time: Sep 24 15:22
*/
KISSY.add("editor/plugin/heading/index",function(h,g,i){function b(){}h.augment(b,{renderUI:function(c){i.init(c);var b=[],e={"普通文本":"p","标题1":"h1","标题2":"h2","标题3":"h3","标题4":"h4","标题5":"h5","标题6":"h6"},f={p:"1em",h1:"2em",h2:"1.5em",h3:"1.17em",h4:"1em",h5:"0.83em",h6:"0.67em"},a;for(a in e)e.hasOwnProperty(a)&&b.push({content:a,value:e[a],elAttrs:{style:"font-size:"+f[e[a]]}});c.addSelect("heading",{defaultCaption:"标题",width:"120px",menu:{children:b},mode:g.WYSIWYG_MODE,listeners:{click:function(d){d=
d.target.get("value");c.execCommand("heading",d)},afterSyncUI:function(){var d=this;c.on("selectionChange",function(){if(c.get("mode")!=g.SOURCE_MODE){var b=c.queryCommandValue("heading"),a;for(a in f)if(f.hasOwnProperty(a)&&a==b){d.set("value",a);return}d.set("value",null)}})}}})}});return b},{requires:["editor","./cmd"]});
