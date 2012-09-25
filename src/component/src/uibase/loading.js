/**
 * @ignore
 * @fileOverview loading mask support for overlay
 * @author yiminghe@gmail.com
 */
KISSY.add("component/uibase/loading", function () {

    /**
     * @class KISSY.DD.UIBase.Loading
     * Loading extension class. Make component to be able to mask loading.
     */
    function Loading() {
    }

    Loading.prototype = {
        /**
         * mask component as loading
         */
        loading: function () {
            this.get("view").loading();
            return this;
        },

        /**
         * unmask component as loading
         */
        unloading: function () {
            this.get("view").unloading();
            return this;
        }
    };

    return Loading;

});