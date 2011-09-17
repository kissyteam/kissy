/**
 * represent attribute node in tag node
 * @author yiminghe@gmail.com
 */
KISSY.add(function() {
    function Attribute(name, assignMent, value, quote) {
        this.nodeType = 2;
        this.name = name;
        this['assignMent'] = assignMent;
        this.value = value;
        this.quote = quote;
    }

    return Attribute;
});