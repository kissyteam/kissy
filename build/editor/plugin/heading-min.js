/*
Copyright 2014, KISSY v1.47
MIT Licensed
build time: May 22 12:22
*/
KISSY.add("editor/plugin/heading",["./menubutton","editor","./heading/cmd"],function(g,a){function e(){}a("./menubutton");var f=a("editor"),h=a("./heading/cmd");g.augment(e,{pluginRenderUI:function(c){h.init(c);var a=[],b={"\u666e\u901a\u6587\u672c":"p","\u6807\u98981":"h1","\u6807\u98982":"h2","\u6807\u98983":"h3","\u6807\u98984":"h4","\u6807\u98985":"h5","\u6807\u98986":"h6"},e={p:"1em",h1:"2em",h2:"1.5em",h3:"1.17em",h4:"1em",h5:"0.83em",h6:"0.67em"},d;for(d in b)a.push({content:d,value:b[d],elAttrs:{style:"font-size:"+e[b[d]]}});c.addSelect("heading",{defaultCaption:"\u6807\u9898",
width:"120px",menu:{children:a},mode:f.Mode.WYSIWYG_MODE,listeners:{click:function(a){a=a.target.get("value");c.execCommand("heading",a)},afterSyncUI:function(){var a=this;c.on("selectionChange",function(){if(c.get("mode")!==f.Mode.SOURCE_MODE){var d=c.queryCommandValue("heading"),b;for(b in e)if(b===d){a.set("value",b);return}a.set("value",null)}})}}})}});return e});
