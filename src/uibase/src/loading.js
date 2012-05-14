/**
 * @fileOverview loading mask support for overlay
 * @author yiminghe@gmail.com
 */
KISSY.add("uibase/loading", function () {

    /**
     * Loading extension class.
     * Make component to be able to mask loading.
     * @class
     * @memberOf UIBase
     */
    function Loading() {
    }

    Loading.prototype =
    /**
     * @lends UIBase.Loading#
     */
    {
        /**
         * mask component as loading
         */
        loading:function () {
            this.get("view").loading();
        },

        /**
         * unmask component as loading
         */
        unloading:function () {
            this.get("view").unloading();
        }
    };

    return Loading;

});