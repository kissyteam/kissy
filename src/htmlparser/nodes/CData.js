/**
 * @fileOverview dom text node
 * @author yiminghe@gmail.com
 */
KISSY.add("htmlparser/nodes/CData", function(S, Text) {

    function CData() {
        CData.superclass.constructor.apply(this, arguments);
        this.nodeType = 4;
        this.nodeName = "#cdata";
    }

    S.extend(CData, Text, {
        writeHtml:function(writer, filter) {
            var value = this.toHtml();
            if (!filter || filter.onCData(this) !== false) {
                writer.cdata(value);
            }
        }
    });

    return CData;
}, {
    requires:['./Text']
});