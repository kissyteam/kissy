/**
 * dom text node
 * @author yiminghe@gmail.com
 */
KISSY.add(function(S, Text) {

    function CData() {
        Text.superclass.constructor.apply(this, arguments);
        this.nodeType = 4;
        this.nodeName = "#cdata";
    }

    S.extend(CData, Text, {
        writeHtml:function(writer, filter) {
            var value = this.toHtml();
            if (filter.onCData(this) !== false) {
                writer.cdata(value);
            }
        }
    });

    return CData;
}, {
    requires:['./Text']
});