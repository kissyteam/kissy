/*
Copyright 2012, KISSY UI Library v1.40dev
MIT Licensed
build time: Jul 31 22:33
*/
KISSY.add("split-button",function(d,c,e,f){return c.Controller.extend([],{renderUI:function(){var b=this.get("alignWithEl"),a=this.get("children");this.__set("menuButton",a[1]);this.__set("button",a[0]);a=a[1].get("menu");b&&(a instanceof c.Controller?a.get("align").node=this.get("el"):(a.align=a.align||{},a.align.node=this.get("el")))},decorateInternal:function(){var b=this.get("button"),a=this.get("menuButton"),c=this.get("el").children();this.__set("button",new e(d.mix({srcNode:c[0]},b)));this.__set("menuButton",
new f(d.mix({srcNode:c[1]},a)))}},{ATTRS:{handleMouseEvents:{value:!1},focusable:{value:!1},alignWithEl:{value:!0},children:{value:[{xclass:"button"},{xclass:"menu-button"}]},button:{setter:function(b){this.get("children")[0]=b}},menuButton:{setter:function(b){this.get("children")[1]=b}}}},{xclass:"split-button"})},{requires:["component","button","menubutton"]});
