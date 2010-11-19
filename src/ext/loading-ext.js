/**
 * loading mask support for overlay
 * @author:yiminghe@gmail.com
 */
KISSY.add("ext-loading", function(S) {
    S.namespace("Ext");
    function LoadingExt() {
        S.log("LoadingExt init");
    }

    LoadingExt.prototype = {
        loading:function() {
            var self = this;
            if (!self._loadingExtEl) {
                self._loadingExtEl = new S.Node("<div " +
                    "class='ks-ext-loading'" +
                    " style='position: absolute;" +
                    "border: none;" +
                    "width: 100%;" +
                    "top: 0;" +
                    "left: 0;" +
                    "z-index: 99999;" +
                    "height:100%;" +
                    "*height: expression(this.parentNode.offsetHeight);" + "'>").appendTo(self.get("el"));
            }
            self._loadingExtEl.show();
        },

        unloading:function() {
            var lel = this._loadingExtEl;
            lel && lel.hide();
        }
    };

    S.Ext.Loading = LoadingExt;

});