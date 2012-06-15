/**
 * @fileOverview loading mask support for overlay
 * @author yiminghe@gmail.com
 */
KISSY.add("component/uibase/loading", function () {

    /**
     * @name Loading
     * @class
     * Loading extension class.
     * Make component to be able to mask loading.
     * @memberOf Component.UIBase
     */
    function Loading() {
    }

    Loading.prototype =
    /**
     * @lends Component.UIBase.Loading#
     */
    {
        /**
         * mask component as loading
         */
        loading:function () {
            this.get("view").loading();
            return this;
        },

        /**
         * unmask component as loading
         */
        unloading:function () {
            this.get("view").unloading();
            return this;
        }
    };

    return Loading;

});