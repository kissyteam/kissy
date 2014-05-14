/*
Copyright 2014, KISSY v5.0.0
MIT Licensed
build time: May 14 22:19
*/
KISSY.add("editor/plugin/font-size",["editor","./font/ui","./font-size/cmd","./menubutton","util"],function(h,a){function d(a){this.config=a||{}}var e=a("editor"),f=a("./font/ui"),g=a("./font-size/cmd");a("./menubutton");var c=a("util");c.augment(d,{pluginRenderUI:function(a){g.init(a);var b=this.config;b.menu=c.mix({children:function(a){var b=[];c.each(a,function(a){b.push({content:a,value:a})});return b}("8px,10px,12px,14px,18px,24px,36px,48px,60px,72px,84px,96px".split(","))},b.menu);a.addSelect("fontSize",
c.mix({cmdType:"fontSize",defaultCaption:"\u5927\u5c0f",width:"70px",mode:e.Mode.WYSIWYG_MODE},b),f.Select)}});return d});
