/*
Copyright 2013, KISSY UI Library v1.40dev
MIT Licensed
build time: May 23 00:54
*/
KISSY.add("split-button",function(d,c,e,f){return c.Controller.extend({renderUI:function(){var b=this.get("alignWithEl"),a=this.get("children");this.setInternal("menuButton",a[1]);this.setInternal("button",a[0]);a=a[1].get("menu");b&&(a.isController?a.get("align").node=this.get("el"):(a.align=a.align||{},a.align.node=this.get("el")))},decorateInternal:function(b){var a=this.get("button"),c=this.get("menuButton"),b=b.children();this.setInternal("button",new e(d.mix({srcNode:b[0]},a)));this.setInternal("menuButton",
new f(d.mix({srcNode:b[1]},c)))}},{ATTRS:{handleMouseEvents:{value:!1},focusable:{value:!1},alignWithEl:{value:!0},children:{value:[{xclass:"button"},{xclass:"menu-button"}]},button:{setter:function(b){this.get("children")[0]=b}},menuButton:{setter:function(b){this.get("children")[1]=b}}}},{xclass:"split-button"})},{requires:["component/base","button","menubutton"]});
