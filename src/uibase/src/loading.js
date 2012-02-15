/**
 * @fileOverview loading mask support for overlay
 * @author yiminghe@gmail.com
 */
KISSY.add("uibase/loading", function () {

    /**
     * make component can mask loading
     * @class
     * @memberOf UIBase
     */
    function Loading() {
    }

    Loading.prototype =
    /**
     * @lends UIBase.Loading.prototype
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