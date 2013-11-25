/**
 * @ignore
 * fake document node
 * @author yiminghe@gmail.com
 */
KISSY.add(function (S, require) {
    var Tag = require('./tag');

    function Document() {
        this.childNodes = [];
        this.nodeType = 9;
        this.nodeName = '#document';
    }

    S.extend(Document, Tag, {
        writeHtml: function (writer, filter) {
            this.__filter = filter;
            this._writeChildrenHTML(writer);
        }
    });

    return Document;
});