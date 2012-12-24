/*
Copyright 2012, KISSY UI Library v1.30
MIT Licensed
build time: Dec 20 22:28
*/
KISSY.add("split-button",function(d,c,e,f){return c.Controller.extend([],{renderUI:function(){var a=this.get("alignWithEl"),b=this.get("children");this.setInternal("menuButton",b[1]);this.setInternal("button",b[0]);b=b[1].get("menu");a&&(b.isController?b.get("align").node=this.get("el"):(b.align=b.align||{},b.align.node=this.get("el")))},decorateInternal:function(a){var b=this.get("button"),c=this.get("menuButton");this.set("el",a);a=a.children();this.setInternal("button",new e(d.mix({srcNode:a[0]},
b)));this.setInternal("menuButton",new f(d.mix({srcNode:a[1]},c)))}},{ATTRS:{handleMouseEvents:{value:!1},focusable:{value:!1},alignWithEl:{value:!0},children:{value:[{xclass:"button"},{xclass:"menu-button"}]},button:{setter:function(a){this.get("children")[0]=a}},menuButton:{setter:function(a){this.get("children")[1]=a}}}},{xclass:"split-button"})},{requires:["component/base","button","menubutton"]});
