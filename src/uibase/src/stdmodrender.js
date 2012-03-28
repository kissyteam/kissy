/**
 * @fileOverview support standard mod for component
 * @author yiminghe@gmail.com
 */
KISSY.add("uibase/stdmodrender", function (S, Node) {


    var CLS_PREFIX = "stdmod-";

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
            sync:false
        },
        footerStyle:{
            sync:false
        },
        headerStyle:{
            sync:false
        },
        headerContent:{
            sync:false
        },
        bodyContent:{
            sync:false
        },
        footerContent:{
            sync:false
        }
    };

    function serialize(css) {
        var str = "";
        if (css) {
            for (var i in css) {
                if (css.hasOwnProperty(i)) {
                    str += i + ":" + css[i] + ";"
                }
            }
        }
        return str;
    }

    StdMod.HTML_PARSER = {
        header:function (el) {
            return el.one("." + this.get("prefixCls") + CLS_PREFIX + "header");
        },
        body:function (el) {
            return el.one("." + this.get("prefixCls") + CLS_PREFIX + "body");
        },
        footer:function (el) {
            return el.one("." + this.get("prefixCls") + CLS_PREFIX + "footer");
        }
    };

    function renderUI(self, part) {
        var el = self.get("contentEl"),
            style = self.get(part + "Style"),
            content = self.get(part + "Content"),
            isString = S.isString(content),
            partEl = self.get(part);
        if (!partEl) {
            style = serialize(style);
            partEl = new Node("<div class='" + self.get("prefixCls") +
                CLS_PREFIX + part + "'" +
                " " +
                (style ? ("style='" + style + "'") : "") +
                " >" +
                (isString ? content : "") +
                "</div>");
            if (!isString) {
                partEl.append(content);
            }
            partEl.appendTo(el);
            self.__set(part, partEl);
        } else if (style) {
            partEl.css(style);
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