/*
Copyright 2013, KISSY UI Library v1.40dev
MIT Licensed
build time: Apr 17 00:17
*/
KISSY.add("editor/plugin/font-family",function(a,e,f,g){function b(a){this.config=a||{}}a.augment(b,{pluginRenderUI:function(b){g.init(b);var c=this.config,d={};a.mix(d,{children:[{content:"\u5b8b\u4f53",value:"SimSun"},{content:"\u9ed1\u4f53",value:"SimHei"},{content:"\u96b6\u4e66",value:"LiSu"},{content:"\u6977\u4f53",value:"KaiTi_GB2312"},{content:"\u5fae\u8f6f\u96c5\u9ed1",value:"Microsoft YaHei"},{content:"Georgia",value:"Georgia"},{content:"Times New Roman",value:"Times New Roman"},{content:"Impact",value:"Impact"},{content:"Courier New",value:"Courier New"},
{content:"Arial",value:"Arial"},{content:"Verdana",value:"Verdana"},{content:"Tahoma",value:"Tahoma"}],width:"130px"});a.each(d.children,function(a){var b=a.elAttrs||{},c=a.value;b.style=b.style||"";b.style+=";font-family:"+c;a.elAttrs=b});c.menu=a.mix(d,c.menu);b.addSelect("fontFamily",a.mix({cmdType:"fontFamily",defaultCaption:"\u5b57\u4f53",width:130,mode:e.Mode.WYSIWYG_MODE},c),f.Select)}});return b},{requires:["editor","./font/ui","./font-family/cmd"]});
