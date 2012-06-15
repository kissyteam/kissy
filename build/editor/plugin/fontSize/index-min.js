/*
Copyright 2012, KISSY UI Library v1.30dev
MIT Licensed
build time: Jun 15 17:22
*/
KISSY.add("editor/plugin/fontSize/index",function(c,e,f,g){function d(b){this.config=b||{}}c.augment(d,{renderUI:function(b){g.init(b);var a=this.config,a=a||{};c.mix(a,{children:function(a){var b=[];c.each(a,function(a){b.push({content:a,value:a})});return b}("8px,10px,12px,14px,18px,24px,36px,48px,60px,72px,84px,96px".split(",")),width:"55px"},!1);b.addSelect("fontSize",{cmdType:"fontSize",defaultCaption:"大小",width:"55px",mode:e.WYSIWYG_MODE,menu:{width:a.width,children:a.children}},f.Select)}});
return d},{requires:["editor","../font/ui","./cmd"]});
