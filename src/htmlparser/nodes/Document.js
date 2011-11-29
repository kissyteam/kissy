KISSY.add("htmlparser/nodes/Document", function(S, Tag) {
    function Document() {
        this.childNodes = [];
        this.nodeType = 9;
        this.nodeName = '#document';
    }

    S.extend(Document, Tag, {
        writeHtml:function(writer, filter) {
            this._writeChildrenHtml(writer, filter);
        }
    });

    return Document;
}, {
    requires:['./Tag']
});