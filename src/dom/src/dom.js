/**
 * @fileOverview dom
 */
KISSY.add("dom", function (S, DOM) {

    /**
     * @namespace Provides DOM helper methods
     * @name DOM
     */
    S.mix(S,{
        DOM:DOM,
        get:DOM.get,
        query:DOM.query
    });

    return DOM;
}, {
    requires:["dom/attr",
        "dom/class",
        "dom/create",
        "dom/data",
        "dom/insertion",
        "dom/offset",
        "dom/style",
        "dom/selector",
        "dom/style-ie",
        "dom/traversal"]
});