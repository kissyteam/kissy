/*
Copyright 2014, KISSY v5.0.0
MIT Licensed
build time: Jul 18 13:57
*/
KISSY.add("editor/plugin/font-size",["editor","./font/ui","./font-size/cmd","./menubutton","util"],function(i,a,j,e){function d(a){this.config=a||{}}var f=a("editor"),g=a("./font/ui"),h=a("./font-size/cmd");a("./menubutton");var c=a("util");c.augment(d,{pluginRenderUI:function(a){h.init(a);var b=this.config;b.menu=c.mix({children:function(a){var b=[];c.each(a,function(a){b.push({content:a,value:a})});return b}("8px,10px,12px,14px,18px,24px,36px,48px,60px,72px,84px,96px".split(","))},b.menu);a.addSelect("fontSize",
c.mix({cmdType:"fontSize",defaultCaption:"\u5927\u5c0f",width:"70px",mode:f.Mode.WYSIWYG_MODE},b),g.Select)}});e.exports=d});
