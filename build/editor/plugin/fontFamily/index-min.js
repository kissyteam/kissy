/*
Copyright 2012, KISSY UI Library v1.30dev
MIT Licensed
build time: Jun 13 00:29
*/
KISSY.add("editor/plugin/fontFamily/index",function(d,e,f,g){return{init:function(b){g.init(b);var a=b.get("pluginConfig").fontFamily,a=a||{};d.mix(a,{children:[{content:"宋体",value:"SimSun"},{content:"黑体",value:"SimHei"},{content:"隶书",value:"LiSu"},{content:"楷体",value:"KaiTi_GB2312"},{content:"微软雅黑",value:"Microsoft YaHei"},{content:"Georgia",value:"Georgia"},{content:"Times New Roman",value:"Times New Roman"},{content:"Impact",value:"Impact"},{content:"Courier New",value:"Courier New"},{content:"Arial",
value:"Arial"},{content:"Verdana",value:"Verdana"},{content:"Tahoma",value:"Tahoma"}],width:"130px"},!1);d.each(a.children,function(a){var c=a.elAttrs||{},b=a.value;c.style=c.style||"";c.style+=";font-family:"+b;a.elAttrs=c});b.addSelect("fontFamily",{cmdType:"fontFamily",defaultCaption:"字体",width:130,mode:e.WYSIWYG_MODE,menu:{width:a.width,children:a.children}},f.Select)}}},{requires:["editor","../font/ui","./cmd"]});
