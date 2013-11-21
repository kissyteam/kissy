/**
 * @ignore
 * dom
 * @author yiminghe@gmail.com
 */
KISSY.add(function (S,require) {
    var Dom = require('./base/api');

    require('./base/attr');
    require('./base/class');
    require('./base/create');
    require('./base/data');
    require('./base/insertion');
    require('./base/offset');
    require('./base/style');
    require('./base/selector');
    require('./base/traversal');

    S.mix(S, {
        // compatibility
        DOM:Dom,
        get: Dom.get,
        query: Dom.query
    });

    return Dom;
});