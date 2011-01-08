/**
 * support standard mod for component
 * @author: 承玉<yiminghe@gmail.com>
 */
KISSY.add("uibase/stdmod", function(S) {


    var CLS_PREFIX = "ks-stdmod-";

    function StdMod() {
        //S.log("stdmod init");
    }

    StdMod.ATTRS = {
        header:{
        },
        body:{
        },
        footer:{
        },
        bodyStyle:{
        },
        footerStyle:{

        },
        headerStyle:{

        },
        headerContent:{
            value:false
        },
        bodyContent:{
            value:false
        },
        footerContent:{
            value:false
        }
    };

    StdMod.HTML_PARSER = {
        header:"." + CLS_PREFIX + "header",
        body:"." + CLS_PREFIX + "body",
        footer:"." + CLS_PREFIX + "footer"
    };

    function renderUI(self, part) {
        var Node = S.require("node/node");
        var el = self.get("contentEl"),
            partEl = self.get(part);

        if (!partEl) {
            partEl = new Node("<div class='" + CLS_PREFIX + part + "'>")
                .appendTo(el);
            self.set(part, partEl);
        }
    }

    StdMod.prototype = {
        __bindUI:function() {
            //S.log("_bindUIStdMod");
        },
        __syncUI:function() {
            //S.log("_syncUIStdMod");
        },
        _setStdModContent:function(part, v) {
            if (v !== false) {

                if (S['isString'](v)) {
                    this.get(part).html(v);
                } else {
                    this.get(part).html("");
                    this.get(part).append(v);
                }
            }
        },
        _uiSetBodyStyle:function(v) {
            if (v !== undefined) {
                this.get("body").css(v);
            }
        },
        _uiSetHeaderStyle:function(v) {
            if (v !== undefined) {
                this.get("header").css(v);
            }
        },
        _uiSetFooterStyle:function(v) {
            if (v !== undefined) {
                this.get("footer").css(v);
            }
        },
        _uiSetBodyContent:function(v) {
            //S.log("_uiSetBodyContent");
            this._setStdModContent("body", v);
        },
        _uiSetHeaderContent:function(v) {
            //S.log("_uiSetHeaderContent");
            this._setStdModContent("header", v);
        },
        _uiSetFooterContent:function(v) {
            //S.log("_uiSetFooterContent");
            this._setStdModContent("footer", v);
        },
        __renderUI:function() {
            //S.log("_renderUIStdMod");
            renderUI(this, "header");
            renderUI(this, "body");
            renderUI(this, "footer");
        },

        __destructor:function() {
            //S.log("stdmod __destructor");
        }
    };


    return StdMod;

});