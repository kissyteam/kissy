/**
 * @ignore
 * @fileOverview support standard mod for component
 * @author yiminghe@gmail.com
 */
KISSY.add("component/uibase/stdmod-render", function (S, Node) {


    var CLS_PREFIX = "stdmod-";

    function StdModRender() {
    }

    StdModRender.ATTRS = {
        header: {
        },
        body: {
        },
        footer: {
        },
        bodyStyle: {
        },
        footerStyle: {
        },
        headerStyle: {
        },
        headerContent: {
        },
        bodyContent: {
        },
        footerContent: {
        }
    };

    StdModRender.HTML_PARSER = {
        header: function (el) {
            return el.one("." + this.get('prefixCls') + CLS_PREFIX + "header");
        },
        body: function (el) {
            return el.one("." + this.get('prefixCls') + CLS_PREFIX + "body");
        },
        footer: function (el) {
            return el.one("." + this.get('prefixCls') + CLS_PREFIX + "footer");
        }
    };

    function createUI(self, part) {
        var el = self.get("contentEl"),
            partEl = self.get(part);
        if (!partEl) {
            partEl = new Node("<div class='" +
                self.get('prefixCls') + CLS_PREFIX + part + "'" +
                " " +
                " >" +
                "</div>");
            partEl.appendTo(el);
            self.setInternal(part, partEl);
        }
    }


    function _setStdModRenderContent(self, part, v) {
        part = self.get(part);
        if (S.isString(v)) {
            part.html(v);
        } else {
            part.html("")
                .append(v);
        }
    }

    StdModRender.prototype = {

        __createDom: function () {
            createUI(this, "header");
            createUI(this, "body");
            createUI(this, "footer");
        },

        _uiSetBodyStyle: function (v) {
            this.get("body").css(v);
        },

        _uiSetHeaderStyle: function (v) {
            this.get("header").css(v);
        },
        _uiSetFooterStyle: function (v) {
            this.get("footer").css(v);
        },

        _uiSetBodyContent: function (v) {
            _setStdModRenderContent(this, "body", v);
        },

        _uiSetHeaderContent: function (v) {
            _setStdModRenderContent(this, "header", v);
        },

        _uiSetFooterContent: function (v) {
            _setStdModRenderContent(this, "footer", v);
        }
    };

    return StdModRender;

}, {
    requires: ['node']
});