/*
Copyright 2013, KISSY UI Library v1.40dev
MIT Licensed
build time: Apr 17 00:17
*/
KISSY.add("editor/plugin/heading",function(h,f,i){function b(){}h.augment(b,{pluginRenderUI:function(c){i.init(c);var b=[],e={"\u666e\u901a\u6587\u672c":"p","\u6807\u98981":"h1","\u6807\u98982":"h2","\u6807\u98983":"h3","\u6807\u98984":"h4","\u6807\u98985":"h5","\u6807\u98986":"h6"},g={p:"1em",h1:"2em",h2:"1.5em",h3:"1.17em",h4:"1em",h5:"0.83em",h6:"0.67em"},a;for(a in e)b.push({content:a,value:e[a],elAttrs:{style:"font-size:"+g[e[a]]}});c.addSelect("heading",{defaultCaption:"\u6807\u9898",width:"120px",menu:{children:b},mode:f.Mode.WYSIWYG_MODE,listeners:{click:function(d){d=d.target.get("value");
c.execCommand("heading",d)},afterSyncUI:function(){var d=this;c.on("selectionChange",function(){if(c.get("mode")!=f.Mode.SOURCE_MODE){var b=c.queryCommandValue("heading"),a;for(a in g)if(a==b){d.set("value",a);return}d.set("value",null)}})}}})}});return b},{requires:["editor","./heading/cmd"]});
