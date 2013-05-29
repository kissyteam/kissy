/**
 * dom text node
 * @author yiminghe@gmail.com
 */
KISSY.add("htmlparser/nodes/Text", function (S, Node) {

    function Text(v) {
        if (typeof v == 'string') {
            this.nodeValue = v;
            Text.superclass.constructor.apply(this, [null, -1, -1]);
        } else {
            Text.superclass.constructor.apply(this, arguments);
            this.nodeValue = this.toHTML();
        }
        this.nodeType = 3;
        this.nodeName = "#text";
    }

    S.extend(Text, Node, {
        writeHTML:function (writer, filter) {
            var ret;
            if (!filter || (ret = filter.onText(this)) !== false) {
                if (ret) {
                    if (this !== ret) {
                        ret.writeHTML(writer, filter);
                        return;
                    }
                }
                writer.text(this.toHTML());
            }
        },
        toHTML:function () {
            if (this.nodeValue) {
                return this.nodeValue;
            } else {
                return Text.superclass.toHTML.apply(this, arguments);
            }
        }
    });

    return Text;
}, {
    requires:['./Node']
});