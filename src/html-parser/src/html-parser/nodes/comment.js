/**
 * comment node (<!-- content -->)
 * @author yiminghe@gmail.com
 */
KISSY.add("html-parser/nodes/comment", function (S, Text) {

    function Comment() {
        Comment.superclass.constructor.apply(this, arguments);
        this.nodeType = 8;
        this.nodeName = "#comment";
    }

    S.extend(Comment, Text, {
        writeHTML:function (writer, filter) {
            var ret;
            if (!filter || (ret = filter.onComment(this)) !== false) {
                if (ret) {
                    if (this !== ret) {
                        ret.writeHTML(writer, filter);
                        return;
                    }
                }
                writer.comment(this.toHTML());
            }
        },
        toHTML:function () {
            if (this.nodeValue) {
                return this.nodeValue;
            } else {
                var value = Text.superclass.toHTML.apply(this, arguments);
                // <!-- -->
                return value.substring(4, value.length - 3);
            }
        }
    });

    return Comment;
}, {
    requires:['./text']
});