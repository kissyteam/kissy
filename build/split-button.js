/*
Copyright 2014, KISSY v5.0.0
MIT Licensed
build time: Jul 18 14:05
*/
KISSY.add("split-button",["component/container","button","menubutton"],function(b,a,e,c){b=a("component/container");a("button");a("menubutton");c.exports=b.extend({renderUI:function(){var d=this.get("alignWithEl"),a=this.get("children")[1].get("menu");d&&(a.get("align").node=this.$el)}},{ATTRS:{handleGestureEvents:{value:!1},focusable:{value:!1},allowTextSelection:{value:!0},alignWithEl:{value:!0},children:{value:[{xclass:"button"},{xclass:"menu-button"}]},menuButton:{getter:function(){return this.get("children")[1]},
setter:function(a){this.get("children")[1]=a}},button:{getter:function(){return this.get("children")[0]},setter:function(a){this.get("children")[0]=a}}},xclass:"split-button"})});
