/**
 * shim for ie6 ,require box-ext
 * @author:yiminghe@gmail.com
 */
KISSY.add("ext-shim", function(S) {
    S.namespace("Ext");
    function ShimExt() {
        S.log("shim init");
        var self = this;
        self.on("renderUI", self._renderUIShimExt, self);
        self.on("bindUI", self._bindUIShimExt, self);
        self.on("syncUI", self._syncUIShimExt, self);
    }

    var Node = S.Node;
    ShimExt.prototype = {
        _syncUIShimExt:function() {
            S.log("_syncUIShimExt");
        },
        _bindUIShimExt:function() {
            S.log("_bindUIShimExt");
        },
        _renderUIShimExt:function() {
            S.log("_renderUIShimExt");
            var self = this,el = self.get("el");
            var shim = new Node("<iframe style='position: absolute;" +
                "border: none;" +
                "width: expression(this.parentNode.offsetWidth);" +
                "top: 0;" +
                "opacity: 0;" +
                "filter: alpha(opacity=0);" +
                "left: 0;" +
                "z-index: -1;" +
                "height: expression(this.parentNode.offsetHeight);" + "'>");
            el.prepend(shim);
        },

        __destructor:function() {
            S.log("shim __destructor");
        }
    };
    S.Ext.Shim = ShimExt;
});