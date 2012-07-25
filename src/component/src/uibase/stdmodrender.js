/**
 * @fileOverview support standard mod for component
 * @author yiminghe@gmail.com
 */
KISSY.add("component/uibase/stdmodrender", function (S, Node) {


    var CLS_PREFIX = "ks-stdmod-";

    function StdMod() {
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
        },
        bodyContent:{
        },
        footerContent:{
        }
    };

    StdMod.HTML_PARSER = {
        header:function (el) {
            return el.one("." + CLS_PREFIX + "header");
        },
        body:function (el) {
            return el.one("." + CLS_PREFIX + "body");
        },
        footer:function (el) {
            return el.one("." + CLS_PREFIX + "footer");
        }
    };

    function renderUI(self, part) {
        var el = self.get("contentEl"),
            partEl = self.get(part);
        if (!partEl) {
            partEl = new Node("<div class='" +
                CLS_PREFIX + part + "'" +
                " " +
                " >" +
                "</div>");
            partEl.appendTo(el);
            self.__set(part, partEl);
        }
    }


    function _setStdModContent(self, part, v) {
        part = self.get(part);
        if (S.isString(v)) {
            part.html(v);
        } else {
            part.html("")
                .append(v);
        }
    }

    StdMod.prototype = {

        __createDom:function () {
            renderUI(this, "header");
            renderUI(this, "body");
            renderUI(this, "footer");
        },

        _uiSetBodyStyle:function (v) {
            this.get("body").css(v);
        },

        _uiSetHeaderStyle:function (v) {
            this.get("header").css(v);
        },
        _uiSetFooterStyle:function (v) {
            this.get("footer").css(v);
        },

        _uiSetBodyContent:function (v) {
            _setStdModContent(this, "body", v);
        },

        _uiSetHeaderContent:function (v) {
            _setStdModContent(this, "header", v);
        },

        _uiSetFooterContent:function (v) {
            _setStdModContent(this, "footer", v);
        }
    };

    return StdMod;

}, {
    requires:['node']
});