/*
Copyright 2012, KISSY UI Library v1.30dev
MIT Licensed
build time: May 30 12:21
*/
KISSY.add("editor/plugin/fontSize/index",function(c,d,e,f){return{init:function(b){f.init(b);var a=b.get("pluginConfig").fontSize,a=a||{};c.mix(a,{items:function(a){var b=[];c.each(a,function(a){b.push({name:a,value:a})});return b}("8px,10px,12px,14px,18px,24px,36px,48px,60px,72px,84px,96px".split(",")),width:"55px"},!1);b.addSelect({cmdType:"fontSize",title:"大小",width:"30px",mode:d.WYSIWYG_MODE,showValue:!0,defaultValue:a.defaultValue,popUpWidth:a.width,items:a.items},void 0,e.Select)}}},{requires:["editor",
"../font/ui","./cmd"]});
