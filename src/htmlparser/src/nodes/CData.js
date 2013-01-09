/**
 *  dom text node
 * @author yiminghe@gmail.com
 */
KISSY.add("htmlparser/nodes/CData", function (S, Text) {

    function CData() {
        CData.superclass.constructor.apply(this, arguments);
        this.nodeType = 4;
        this.nodeName = "#cdata";
    }

    S.extend(CData, Text, {
        writeHtml:function (writer, filter) {
            var ret;
            if (!filter || (ret = filter.onCData(this)) !== false) {
                if (ret) {
                    if (this !== ret) {
                        ret.writeHtml(writer, filter);
                        return;
                    }
                }
                writer.cdata(this.toHtml());
            }
        }
    });

    return CData;
}, {
    requires:['./Text']
});