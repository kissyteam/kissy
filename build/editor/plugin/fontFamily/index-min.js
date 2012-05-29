/*
Copyright 2012, KISSY UI Library v1.30dev
MIT Licensed
build time: May 29 18:24
*/
KISSY.add("editor/plugin/fontFamily/index",function(d,e,f,g){return{init:function(b){g.init(b);var a=b.get("pluginConfig").fontFamily,a=a||{};d.mix(a,{items:[{name:"宋体",value:"SimSun"},{name:"黑体",value:"SimHei"},{name:"隶书",value:"LiSu"},{name:"楷体",value:"KaiTi_GB2312"},{name:"微软雅黑",value:"Microsoft YaHei"},{name:"Georgia",value:"Georgia"},{name:"Times New Roman",value:"Times New Roman"},{name:"Impact",value:"Impact"},{name:"Courier New",value:"Courier New"},{name:"Arial",value:"Arial"},{name:"Verdana",
value:"Verdana"},{name:"Tahoma",value:"Tahoma"}],width:"130px"},!1);d.each(a.items,function(a){var c=a.attrs||{},b=a.value;c.style=c.style||"";c.style+=";font-family:"+b;a.attrs=c});b.addSelect({cmdType:"fontFamily",title:"字体",width:"110px",mode:e.WYSIWYG_MODE,defaultValue:a.defaultValue,popUpWidth:a.width,items:a.items},void 0,f.Select)}}},{requires:["editor","../font/ui","./cmd"]});
