/*
Copyright 2014, KISSY v1.47
MIT Licensed
build time: May 22 12:21
*/
KISSY.add("editor/plugin/font-size",["editor","./font/ui","./font-size/cmd","./menubutton"],function(b,a){function d(b){this.config=b||{}}var e=a("editor"),f=a("./font/ui"),g=a("./font-size/cmd");a("./menubutton");b.augment(d,{pluginRenderUI:function(a){g.init(a);var c=this.config;c.menu=b.mix({children:function(a){var c=[];b.each(a,function(a){c.push({content:a,value:a})});return c}("8px,10px,12px,14px,18px,24px,36px,48px,60px,72px,84px,96px".split(","))},c.menu);a.addSelect("fontSize",b.mix({cmdType:"fontSize",
defaultCaption:"\u5927\u5c0f",width:"70px",mode:e.Mode.WYSIWYG_MODE},c),f.Select)}});return d});
