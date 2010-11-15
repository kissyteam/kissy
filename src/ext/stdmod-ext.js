/**
 * support standard mod for component
 * @author: yiminghe@gmail.com
 */
KISSY.add("ext-stdmod", function(S) {

    S.namespace("Ext");
    var CLS_PREFIX = "ks-stdmod-",
        Node = S.Node;

    function StdMod() {
        S.log("stdmod init");
        var self = this;
        self.on("renderUI", self._renderUIStdMod, self);
        self.on("syncUI", self._syncUIStdMod, self);
        self.on("bindUI", self._bindUIStdMod, self);
    }

    StdMod.ATTRS = {
        header:{
        },
        body:{
        },
        footer:{
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


    StdMod.prototype = {
        _bindUIStdMod:function() {
            S.log("_bindUIStdMod");
        },
        _syncUIStdMod:function() {
            S.log("_syncUIStdMod");
        },
        _setStdModContent:function(part, v) {
            if (v !== false) {
                if (S.isString(v)) {
                    this.get(part).html(v);
                } else {
                    this.get(part).html("");
                    this.get(part).append(v);
                }
            }
        },
        _uiSetBodyContent:function(v) {
            S.log("_uiSetBodyContent");
            this._setStdModContent("body", v);
        },
        _uiSetHeaderContent:function(v) {
            S.log("_uiSetHeaderContent");
            this._setStdModContent("header", v);
        },
        _uiSetFooterContent:function(v) {
            S.log("_uiSetFooterContent");
            this._setStdModContent("footer", v);
        },
        _renderUIStdMod:function() {
            S.log("_renderUIStdMod");
            var self = this,
                el = self.get("contentEl"),
                header = self.get("header"),
                body = self.get("body"),
                footer = self.get("footer"),
                headerContent = self.get("headerContent"),
                bodyContent = self.get("bodyContent"),
                footerContent = self.get("footerContent");
            if (!header) {
                header = new Node("<div class='" + CLS_PREFIX + "header'>").appendTo(el);
                self.set("header", header);
            }
            if (!body) {
                body = new Node("<div class='" + CLS_PREFIX + "body'>").appendTo(el);
                self.set("body", body);
            }
            if (!footer) {
                footer = new Node("<div class='" + CLS_PREFIX + "footer'>").appendTo(el);
                self.set("footer", footer);
            }
        },

        __destructor:function() {
            S.log("stdmod __destructor");
        }
    };


    S.Ext.StdMod = StdMod;

});