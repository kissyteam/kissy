/**
 *  dom text node
 * @author yiminghe@gmail.com
 */
KISSY.add("htmlparser/nodes/Text", function (S, Node) {

    function Text(v) {
        if (typeof v == 'string') {
            this.nodeValue = v;
            Text.superclass.constructor.apply(this, [null, -1, -1]);
        } else {
            Text.superclass.constructor.apply(this, arguments);
            this.nodeValue = this.toHtml();
        }
        this.nodeType = 3;
        this.nodeName = "#text";
    }

    S.extend(Text, Node, {
        writeHtml:function (writer, filter) {
            var ret;
            if (!filter || (ret = filter.onText(this)) !== false) {
                if (ret) {
                    if (this !== ret) {
                        ret.writeHtml(writer, filter);
                        return;
                    }
                }
                writer.text(this.toHtml());
            }
        },
        toHtml:function () {
            if (this.nodeValue) {
                return this.nodeValue;
            } else {
                return Text.superclass.toHtml.apply(this, arguments);
            }
        }
    });

    return Text;
}, {
    requires:['./Node']
});