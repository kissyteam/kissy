KISSY.add(function(S) {
    function BasicWriter() {
        this.output = [];
    }

    BasicWriter.prototype = {

        append:function() {
            var o = this.output;
            o.push.apply(o, arguments);
            return this;
        },

        openTag:function(el) {
            this.append("<", el.tagName);
        },

        openTagClose:function(el) {
            if (el.isEmptyXmlTag) {
                this.append(" ", "/");
            }
            this.append(">");
        },

        closeTag:function(el) {
            this.append("<\/", el.tagName, ">");
        },

        attribute:function(attr) {
            this.append(" ",
                attr.name,
                "=\"",
                S.escapeHTML(attr.value || attr.name),
                "\"");
        },

        text:function(text) {
            this.append(text);
        },

        cdata:function(cdata) {
            this.append(cdata);
        },

        comment:function(comment) {
            this.append(comment);
        },

        getHtml:function() {
            return this.output.join("");
        }

    };

    return BasicWriter;

});