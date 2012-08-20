/*
Copyright 2012, KISSY UI Library v1.30rc
MIT Licensed
build time: Aug 20 15:37
*/
KISSY.add("split-button",function(d,c,e,f){return c.Controller.extend([],{renderUI:function(){var a=this.get("alignWithEl"),b=this.get("children");this.__set("menuButton",b[1]);this.__set("button",b[0]);b=b[1].get("menu");a&&(b instanceof c.Controller?b.get("align").node=this.get("el"):(b.align=b.align||{},b.align.node=this.get("el")))},decorateInternal:function(a){var b=this.get("button"),c=this.get("menuButton");this.set("el",a);a=a.children();this.__set("button",new e(d.mix({srcNode:a[0]},b)));
this.__set("menuButton",new f(d.mix({srcNode:a[1]},c)))}},{ATTRS:{handleMouseEvents:{value:!1},focusable:{value:!1},alignWithEl:{value:!0},children:{value:[{xclass:"button"},{xclass:"menu-button"}]},button:{setter:function(a){this.get("children")[0]=a}},menuButton:{setter:function(a){this.get("children")[1]=a}}}},{xclass:"split-button"})},{requires:["component","button","menubutton"]});
