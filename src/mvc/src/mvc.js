/**
 * @ignore
 * KISSY 's MVC Framework for Page Application (Backbone Style)
 * @author yiminghe@gmail.com
 */
KISSY.add(function (S, require) {
    return {
        sync: require('mvc/sync'),
        Model: require('mvc/model'),
        View: require('mvc/view'),
        Collection: require('mvc/collection'),
        Router: require('mvc/router')
    };
});