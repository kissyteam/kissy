/**
 * dom text node
 * @author yiminghe@gmail.com
 */
KISSY.add("htmlparser/nodes/CData", function (S, Text) {

    function CData() {
        CData.superclass.constructor.apply(this, arguments);
        this.nodeType = 4;
        this.nodeName = "#cdata";
    }

    S.extend(CData, Text, {
        writeHTML:function (writer, filter) {
            var ret;
            if (!filter || (ret = filter.onCData(this)) !== false) {
                if (ret) {
                    if (this !== ret) {
                        ret.writeHTML(writer, filter);
                        return;
                    }
                }
                writer.cdata(this.toHTML());
            }
        }
    });

    return CData;
}, {
    requires:['./Text']
});