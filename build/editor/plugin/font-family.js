/*
Copyright 2014, KISSY v5.0.0
MIT Licensed
build time: Jun 13 11:45
*/
KISSY.add("editor/plugin/font-family",["util","editor","./font/ui","./font-family/cmd","./menubutton"],function(j,a,k,f){function e(a){this.config=a||{}}var b=a("util"),g=a("editor"),h=a("./font/ui"),i=a("./font-family/cmd");a("./menubutton");b.augment(e,{pluginRenderUI:function(a){i.init(a);var c=this.config,d={};b.mix(d,{children:[{content:"\u5b8b\u4f53",value:"SimSun"},{content:"\u9ed1\u4f53",value:"SimHei"},{content:"\u96b6\u4e66",value:"LiSu"},{content:"\u6977\u4f53",value:"KaiTi_GB2312"},{content:"\u5fae\u8f6f\u96c5\u9ed1",value:'"Microsoft YaHei"'},
{content:"Georgia",value:"Georgia"},{content:"Times New Roman",value:'"Times New Roman"'},{content:"Impact",value:"Impact"},{content:"Courier New",value:'"Courier New"'},{content:"Arial",value:"Arial"},{content:"Verdana",value:"Verdana"},{content:"Tahoma",value:"Tahoma"}],width:"130px"});b.each(d.children,function(a){var b=a.elAttrs||{},c=a.value;b.style=b.style||"";b.style+=";font-family:"+c;a.elAttrs=b});c.menu=b.mix(d,c.menu);a.addSelect("fontFamily",b.mix({cmdType:"fontFamily",defaultCaption:"\u5b57\u4f53",
width:130,mode:g.Mode.WYSIWYG_MODE},c),h.Select)}});f.exports=e});
