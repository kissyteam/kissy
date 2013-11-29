/**
 * @ignore
 * represent attribute node in tag node
 * @author yiminghe@gmail.com
 */
KISSY.add(function(S) {
    function Attribute(name, assignment, value, quote) {
        this.nodeType = 2;
        this.name = name;
        this.assignment = assignment;
        this.value = value;
        this.quote = quote;
    }
    S.augment(Attribute, {
        clone: function() {
            var ret = new Attribute();
            S.mix(ret, this);
            return ret;
        },
        equals:function(other) {
            return this.name === other.name && this.value === other.value && this.nodeType === other.nodeType;
        }
    });
    Attribute.prototype.clone = function() {
        var ret = new Attribute();
        S.mix(ret, this);
        return ret;
    };
    return Attribute;
});