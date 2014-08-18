/*
Copyright 2014, KISSY v1.47
MIT Licensed
build time: May 22 12:21
*/
KISSY.add("editor/plugin/font-family",["editor","./font/ui","./font-family/cmd","./menubutton"],function(b,a){function e(b){this.config=b||{}}var f=a("editor"),g=a("./font/ui"),h=a("./font-family/cmd");a("./menubutton");b.augment(e,{pluginRenderUI:function(a){h.init(a);var c=this.config,d={};b.mix(d,{children:[{content:"\u5b8b\u4f53",value:"SimSun"},{content:"\u9ed1\u4f53",value:"SimHei"},{content:"\u96b6\u4e66",value:"LiSu"},{content:"\u6977\u4f53",value:"KaiTi_GB2312"},{content:"\u5fae\u8f6f\u96c5\u9ed1",value:'"Microsoft YaHei"'},{content:"Georgia",value:"Georgia"},
{content:"Times New Roman",value:'"Times New Roman"'},{content:"Impact",value:"Impact"},{content:"Courier New",value:'"Courier New"'},{content:"Arial",value:"Arial"},{content:"Verdana",value:"Verdana"},{content:"Tahoma",value:"Tahoma"}],width:"130px"});b.each(d.children,function(b){var a=b.elAttrs||{},c=b.value;a.style=a.style||"";a.style+=";font-family:"+c;b.elAttrs=a});c.menu=b.mix(d,c.menu);a.addSelect("fontFamily",b.mix({cmdType:"fontFamily",defaultCaption:"\u5b57\u4f53",width:130,mode:f.Mode.WYSIWYG_MODE},
c),g.Select)}});return e});
