/**
 * @fileOverview dom text node
 * @author yiminghe@gmail.com
 */
KISSY.add("htmlparser/nodes/Text", function (S, Node) {

    function Text(v) {
        if (S.isString(v)) {
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
            var value = this.nodeValue;
            if (!filter || filter.onText(this) !== false) {
                writer.text(value);
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