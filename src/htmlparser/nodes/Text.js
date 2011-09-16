/**
 * dom text node
 * @author yiminghe@gmail.com
 */
KISSY.add(function(S, Node) {

    function Text() {
        Text.superclass.constructor.apply(this, arguments);
        this.nodeType = 3;
        this.nodeName = "#text";
        this.closed = true;
    }

    S.extend(Text, Node);

    return Text;
}, {
    requires:['./Node']
});