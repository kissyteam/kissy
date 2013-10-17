/**
 * @ignore
 * basic writer for inheritance
 * @author yiminghe@gmail.com
 */
KISSY.add("html-parser/writer/basic", function (S, Utils) {
    var isBooleanAttribute = Utils.isBooleanAttribute;

    function escapeAttrValue(str) {
        return String(str).replace(/"/g, "&quote;");
    }

    /**
     * BasicWriter for html content
     * @class KISSY.HtmlParser.BasicWriter
     */
    function BasicWriter() {
        this.output = [];
    }

    BasicWriter.prototype = {
        constructor: BasicWriter,

        append: function () {
            var o = this.output,
                args = (arguments),
                arg;
            for (var i = 0; i < args.length; i++) {
                arg = args[i];
                if (arg.length > 1) {
                    for (var j = 0; j < arg.length; j++) {
                        o.push(arg.charAt(j));
                    }
                } else {
                    o.push(arg);
                }
            }
            return this;
        },

        openTag: function (el) {
            this.append("<", el.tagName);
        },

        openTagClose: function (el) {
            if (el.isSelfClosed) {
                this.append(" ", "/");
            }
            this.append(">");
        },

        closeTag: function (el) {
            this.append("<\/", el.tagName, ">");
        },

        attribute: function (attr) {
            var value = attr.value||'',
                name = attr.name;
            if (isBooleanAttribute(name) && !value) {
                value = name;
            }
            this.append(" ",
                name,
                "=\"",
                escapeAttrValue(value),
                "\"");
        },

        text: function (text) {
            this.append(text);
        },

        cdata: function (cdata) {
            this.append(cdata);
        },

        comment: function (comment) {
            this.append("<!--" + comment + "-->");
        },

        getHtml: function () {
            return this.output.join("");
        }

    };

    return BasicWriter;
}, {
    requires: ['../utils']
});