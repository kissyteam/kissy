/**
 * @ignore
 *  loading mask support for overlay
 * @author yiminghe@gmail.com
 */
KISSY.add("overlay/extension/loading", function () {

    /**
     * @class KISSY.Overlay.Extension.Loading
     * Loading extension class. Make component to be able to mask loading.
     */
    function Loading() {
    }

    Loading.prototype = {
        /**
         * mask component as loading
         * @chainable
         */
        loading: function () {
            var self=this;
            self.get("view").loading();
            return self;
        },

        /**
         * unmask component as loading
         * @chainable
         */
        unloading: function () {
            this.get("view").unloading();
            return this;
        }
    };

    return Loading;

});