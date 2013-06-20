/**
 * @ignore
 * loading mask support for overlay
 * @author yiminghe@gmail.com
 */
KISSY.add("overlay/extension/loading", function () {

    /**
     * @class KISSY.Overlay.Extension.Loading
     * Loading extension class. Make component to be able to mask loading.
     */
    function Loading() {
    }

    // for augment, no need constructor
    Loading.prototype = {
        /**
         * mask component as loading
         * @chainable
         */
        loading: function () {
            var self = this;
            if (!self._loadingExtEl) {
                self._loadingExtEl = new Node("<div " +
                    "class='" +
                    self.prefixCls + "ext-loading'" +
                    " style='position: absolute;" +
                    "border: none;" +
                    "width: 100%;" +
                    "top: 0;" +
                    "left: 0;" +
                    "z-index: 99999;" +
                    "height:100%;" +
                    "*height: expression(this.parentNode.offsetHeight);" + "'/>")
                    .appendTo(self.el);
            }
            self._loadingExtEl.show();
        },

        /**
         * unmask component as loading
         * @chainable
         */
        unloading: function () {
            var lel = this._loadingExtEl;
            lel && lel.hide();
        }
    };

    return Loading;

});