/**
 * @fileOverview KISSY's MVC Framework for Page Application (Backbone Style)
 * @author yiminghe@gmail.com
 */
KISSY.add("mvc", function (S, MVC, Model, Collection, View, Router) {

    /**
     * @namespace
     * @name MVC
     */

    return S.mix(MVC, {
        Model:Model,
        View:View,
        Collection:Collection,
        Router:Router
    });
}, {
    requires:["mvc/base", "mvc/model", "mvc/collection", "mvc/view", "mvc/router"]
});