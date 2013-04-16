/*
Copyright 2013, KISSY UI Library v1.40dev
MIT Licensed
build time: Apr 17 00:17
*/
KISSY.add("editor/plugin/font-size",function(b,d,e,f){function a(b){this.config=b||{}}b.augment(a,{pluginRenderUI:function(a){f.init(a);var c=this.config;c.menu=b.mix({children:function(a){var c=[];b.each(a,function(a){c.push({content:a,value:a})});return c}("8px,10px,12px,14px,18px,24px,36px,48px,60px,72px,84px,96px".split(","))},c.menu);a.addSelect("fontSize",b.mix({cmdType:"fontSize",defaultCaption:"\u5927\u5c0f",width:"70px",mode:d.Mode.WYSIWYG_MODE},c),e.Select)}});return a},{requires:["editor","./font/ui",
"./font-size/cmd"]});
