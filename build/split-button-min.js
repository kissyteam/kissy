/*
Copyright 2013, KISSY UI Library v1.40dev
MIT Licensed
build time: Aug 19 22:26
*/
KISSY.add("split-button",function(c,b){return b.extend({renderUI:function(){var a=this.get("alignWithEl"),b=this.get("children")[1].get("menu");a&&(b.get("align").node=this.$el)}},{ATTRS:{handleMouseEvents:{value:!1},focusable:{value:!1},alignWithEl:{value:!0},children:{value:[{xclass:"button"},{xclass:"menu-button"}]},menuButton:{getter:function(){return this.get("children")[1]},setter:function(a){this.get("children")[1]=a}},button:{getter:function(){return this.get("children")[0]},setter:function(a){this.get("children")[0]=
a}}},xclass:"split-button"})},{requires:["component/container","button","menubutton"]});
