/**
 * @ignore
 * dom
 * @author yiminghe@gmail.com
 */
KISSY.add(function (S) {
    var module = this;
    var Dom = module.require('./base/api');

    module.require('./base/attr');
    module.require('./base/class');
    module.require('./base/create');
    module.require('./base/data');
    module.require('./base/insertion');
    module.require('./base/offset');
    module.require('./base/style');
    module.require('./base/selector');
    module.require('./base/traversal');

    S.mix(S, {
        // compatibility
        DOM:Dom,
        get: Dom.get,
        query: Dom.query
    });

    return Dom;
});