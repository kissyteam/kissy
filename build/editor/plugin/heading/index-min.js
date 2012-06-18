/*
Copyright 2012, KISSY UI Library v1.30dev
MIT Licensed
build time: Jun 18 22:02
*/
KISSY.add("editor/plugin/heading/index",function(h,f,i){function a(){}h.augment(a,{renderUI:function(d){i.init(d);var a=[],e={"普通文本":"p","标题1":"h1","标题2":"h2","标题3":"h3","标题4":"h4","标题5":"h5","标题6":"h6"},g={p:"1em",h1:"2em",h2:"1.5em",h3:"1.17em",h4:"1em",h5:"0.83em",h6:"0.67em"},b;for(b in e)e.hasOwnProperty(b)&&a.push({content:b,value:e[b],elAttrs:{style:"font-size:"+g[e[b]]}});d.addSelect("heading",{defaultCaption:"标题",width:"120px",menu:{children:a},mode:f.WYSIWYG_MODE,listeners:{click:function(c){var a=
c.target.get("value"),c=c.prevTarget&&c.prevTarget.get("value");a!=c?d.execCommand("heading",a):(d.execCommand("heading","p"),this.set("value","p"))},afterSyncUI:function(){d.on("selectionChange",function(c){if(d.get("mode")!=f.SOURCE_MODE){var c=c.path,a=f.Utils.getQueryCmd("heading"),b;for(b in g)if(g.hasOwnProperty(b)&&d.execCommand(a,c,b)){this.set("value",b);break}}})}}})}});return a},{requires:["editor","./cmd"]});
