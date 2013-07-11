/**
 * @ignore
 * dom
 * @author yiminghe@gmail.com
 */
KISSY.add('dom/base', function (S, Dom) {
    S.mix(S, {
        // compatibility
        DOM:Dom,
        get: Dom.get,
        query: Dom.query
    });

    return Dom;
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
// debug for jayli
KISSY.use('dom/base',{
	sync:true	
});
