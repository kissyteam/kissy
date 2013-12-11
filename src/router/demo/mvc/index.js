/**
 * @ignore
 * KISSY 's MVC Framework for Page Application (Backbone Style)
 * @author yiminghe@gmail.com
 */
KISSY.add(function (S, require) {
    return {
        sync: require('./sync'),
        Model: require('./model'),
        View: require('./view'),
        Collection: require('./collection')
    };
});