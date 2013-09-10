/**
 * KISSY 's MVC Framework for Page Application (Backbone Style)
 * @author yiminghe@gmail.com
 */
KISSY.add("mvc", function (S, Model, Collection, View, Router, sync) {
    return {
        sync:sync,
        Model:Model,
        View:View,
        Collection:Collection,
        Router:Router
    };
}, {
    requires:["mvc/model", "mvc/collection", "mvc/view", "mvc/router", "mvc/sync"]
});