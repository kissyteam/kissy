/*
Copyright 2012, KISSY UI Library v1.30dev
MIT Licensed
build time: Jun 15 12:07
*/
KISSY.add("editor/plugin/fontFamily/index",function(d,f,g,h){function e(b){this.config=b||{}}d.augment(e,{renderUI:function(b){h.init(b);var a=this.config,a=a||{};d.mix(a,{children:[{content:"宋体",value:"SimSun"},{content:"黑体",value:"SimHei"},{content:"隶书",value:"LiSu"},{content:"楷体",value:"KaiTi_GB2312"},{content:"微软雅黑",value:"Microsoft YaHei"},{content:"Georgia",value:"Georgia"},{content:"Times New Roman",value:"Times New Roman"},{content:"Impact",value:"Impact"},{content:"Courier New",value:"Courier New"},
{content:"Arial",value:"Arial"},{content:"Verdana",value:"Verdana"},{content:"Tahoma",value:"Tahoma"}],width:"130px"},!1);d.each(a.children,function(a){var c=a.elAttrs||{},b=a.value;c.style=c.style||"";c.style+=";font-family:"+b;a.elAttrs=c});b.addSelect("fontFamily",{cmdType:"fontFamily",defaultCaption:"字体",width:130,mode:f.WYSIWYG_MODE,menu:{width:a.width,children:a.children}},g.Select)}});return e},{requires:["editor","../font/ui","./cmd"]});
