/**
 * @ignore
 * comment node (<!-- content -->)
 * @author yiminghe@gmail.com
 */
KISSY.add(function (S, require) {
    var Text = require('./text');

    function Comment() {
        Comment.superclass.constructor.apply(this, arguments);
        this.nodeType = 8;
        this.nodeName = '#comment';
    }

    S.extend(Comment, Text, {
        writeHtml: function (writer, filter) {
            var ret;
            if (!filter || (ret = filter.onComment(this)) !== false) {
                if (ret) {
                    if (this !== ret) {
                        ret.writeHtml(writer, filter);
                        return;
                    }
                }
                writer.comment(this.toHtml());
            }
        },
        toHtml: function () {
            if (this.nodeValue) {
                return this.nodeValue;
            } else {
                var value = Text.superclass.toHtml.apply(this, arguments);
                // <!-- -->
                return value.substring(4, value.length - 3);
            }
        }
    });

    return Comment;
});