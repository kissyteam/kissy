/**
 * @ignore
 *  dom
 * @author yiminghe@gmail.com
 */
KISSY.add('dom/base', function (S, DOM) {
    S.mix(S, {
        DOM: DOM,
        get: DOM.get,
        query: DOM.query
    });

    return DOM;
}, {
    requires: [
        './base/api',
        './base/attr',
        './base/class',
        './base/create',
        './base/data',
        './base/insertion',
        './base/offset',
        './base/style',
        './base/selector',
        './base/traversal'
    ]
});