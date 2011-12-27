/**
 * @fileOverview Attribute and Base
 */
KISSY.add("base", function(S, Base, Attribute) {
    Base.Attribute = Attribute;
    return Base;
}, {
    requires:["base/base2","base/attribute"]
});