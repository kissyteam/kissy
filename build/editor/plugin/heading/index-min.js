/*
Copyright 2012, KISSY UI Library v1.30dev
MIT Licensed
build time: Jun 28 20:23
*/
KISSY.add("editor/plugin/heading/index",function(h,g,i){function a(){}h.augment(a,{renderUI:function(c){i.init(c);var a=[],b={"普通文本":"p","标题1":"h1","标题2":"h2","标题3":"h3","标题4":"h4","标题5":"h5","标题6":"h6"},f={p:"1em",h1:"2em",h2:"1.5em",h3:"1.17em",h4:"1em",h5:"0.83em",h6:"0.67em"},d;for(d in b)b.hasOwnProperty(d)&&a.push({content:d,value:b[d],elAttrs:{style:"font-size:"+f[b[d]]}});c.addSelect("heading",{defaultCaption:"标题",width:"120px",menu:{children:a},mode:g.WYSIWYG_MODE,listeners:{click:function(e){var a=
e.target.get("value"),e=e.prevTarget&&e.prevTarget.get("value");a!=e?c.execCommand("heading",a):(c.execCommand("heading","p"),this.set("value","p"))},afterSyncUI:function(){var a=this;c.on("selectionChange",function(){if(c.get("mode")!=g.SOURCE_MODE){var d=c.queryCommandValue("heading"),b;for(b in f)if(f.hasOwnProperty(b)&&b==d){a.set("value",b);return}a.set("value",null)}})}}})}});return a},{requires:["editor","./cmd"]});
