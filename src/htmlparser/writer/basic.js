KISSY.add(function(S) {
    function BasicWriter() {
        this.output = [];
    }

    BasicWriter.prototype = {

        append:function(str) {
            this.output.push(str);
            return this;
        },

        openTag:function(el) {
            this.append("<").append(el.tagName);
        },

        openTagClose:function(el) {
            if (el.isEmptyXmlTag) {
                this.append(" ");
                this.append("/");
            }
            this.append(">");
        },

        closeTag:function(el) {
            this.append("<\/").append(el.tagName).append(">");
        },

        attribute:function(attr) {
            this.append(" ").append(attr.name)
                .append("=\"")
                .append(S.escapeHTML(attr.value || attr.name))
                .append("\"");
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