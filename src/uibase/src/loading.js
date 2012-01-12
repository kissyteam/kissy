/**
 * @fileOverview loading mask support for overlay
 * @author yiminghe@gmail.com
 */
KISSY.add("uibase/loading", function () {

    /**
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
        loading:function () {
            this.get("view").loading();
        },

        unloading:function () {
            this.get("view").unloading();
        }
    };

    return Loading;

});