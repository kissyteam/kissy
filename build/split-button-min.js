/*
Copyright 2014, KISSY v1.50
MIT Licensed
build time: Mar 13 18:03
*/
KISSY.add("split-button",["component/container","button","menubutton"],function(d,a){var b=a("component/container");a("button");a("menubutton");return b.extend({renderUI:function(){var c=this.get("alignWithEl"),a=this.get("children")[1].get("menu");c&&(a.get("align").node=this.$el)}},{ATTRS:{handleGestureEvents:{value:!1},focusable:{value:!1},alignWithEl:{value:!0},children:{value:[{xclass:"button"},{xclass:"menu-button"}]},menuButton:{getter:function(){return this.get("children")[1]},setter:function(a){this.get("children")[1]=
a}},button:{getter:function(){return this.get("children")[0]},setter:function(a){this.get("children")[0]=a}}},xclass:"split-button"})});
