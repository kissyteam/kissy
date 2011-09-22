/*
Copyright 2011, KISSY UI Library v1.20dev
MIT Licensed
build time: Sep 22 13:53
*/
KISSY.add("button/base",function(c,g,d,e,f){var a=g.KeyCodes;c=d.create(e.ModelControl,[d.Contentbox],{bindUI:function(){this.get("el").on("keyup",this._handleKeyEventInternal,this)},_handleKeyEventInternal:function(b){if(b.keyCode==a.ENTER&&b.type=="keydown"||b.keyCode==a.SPACE&&b.type=="keyup")return this._performInternal(b);return b.keyCode==a.SPACE},_performInternal:function(){this.fire("click")}},{ATTRS:{value:{},describedby:{view:true},tooltip:{view:true}}});c.DefaultRender=f;e.UIStore.setUIByClass("button",
{priority:e.UIStore.PRIORITY.LEVEL1,ui:c});return c},{requires:["event","uibase","component","./customrender"]});KISSY.add("button/buttonrender",function(c,g,d){return g.create(d.Render,{createDom:function(){this.get("el").attr("role","button").addClass(this.getCls("inline-block button"))},_uiSetTooltip:function(e){this.get("el").attr("title",e)},_uiSetDescribedby:function(e){this.get("el").attr("aria-describedby",e)}},{ATTRS:{describedby:{},tooltip:{}}})},{requires:["uibase","component"]});
KISSY.add("button/customrender",function(c,g,d,e){return d.create(e,[d.Contentbox.Render],{createDom:function(){var f=this.get("el"),a=this.get("contentEl"),b=c.guid("ks-button-labelby");f.attr("aria-labelledby",b);a.addClass(this.getCls("button-outer-box"));f=c.makeArray(a[0].childNodes);a=(new g("<div id='"+b+"' class='"+this.getCls("button-inner-box")+"'/>")).appendTo(a);for(b=0;b<f.length;b++)a.append(f[b]);this.set("innerEl",a)},_uiSetContent:function(f){var a=this.get("innerEl");a.html("");
f&&a.append(f)}},{innerEL:{}})},{requires:["node","uibase","./buttonrender"]});KISSY.add("button",function(c,g,d){g.Render=d;return g},{requires:["button/base","button/customrender"]});
