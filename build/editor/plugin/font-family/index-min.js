/*
Copyright 2013, KISSY UI Library v1.30
MIT Licensed
build time: Feb 17 17:29
*/
KISSY.add("editor/plugin/font-family/index",function(a,e,f,g){function b(a){this.config=a||{}}a.augment(b,{pluginRenderUI:function(b){g.init(b);var c=this.config,d={};a.mix(d,{children:[{content:"宋体",value:"SimSun"},{content:"黑体",value:"SimHei"},{content:"隶书",value:"LiSu"},{content:"楷体",value:"KaiTi_GB2312"},{content:"微软雅黑",value:"Microsoft YaHei"},{content:"Georgia",value:"Georgia"},{content:"Times New Roman",value:"Times New Roman"},{content:"Impact",value:"Impact"},{content:"Courier New",value:"Courier New"},
{content:"Arial",value:"Arial"},{content:"Verdana",value:"Verdana"},{content:"Tahoma",value:"Tahoma"}],width:"130px"});a.each(d.children,function(a){var b=a.elAttrs||{},c=a.value;b.style=b.style||"";b.style+=";font-family:"+c;a.elAttrs=b});c.menu=a.mix(d,c.menu);b.addSelect("fontFamily",a.mix({cmdType:"fontFamily",defaultCaption:"字体",width:130,mode:e.WYSIWYG_MODE},c),f.Select)}});return b},{requires:["editor","../font/ui","./cmd"]});
