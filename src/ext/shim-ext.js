/**
 * shim for ie6 ,require box-ext
 * @author:yiminghe@gmail.com
 */
KISSY.add("ext-shim", function(S) {
    S.namespace("Ext");
    function ShimExt() {
        var self = this;
        self.on("renderUI", self._renderUIShimExt, self);
    }

    var Node = S.Node;
    ShimExt.prototype = {
        _renderUIShimExt:function() {
            S.log("_renderUIShimExt");
            var self = this,el = self.get("el");
            var shim = new Node("<iframe style='position: absolute;" +
                "border: none;" +
                "width: 100%;" +
                "top: 0;" +
                "left: 0;" +
                "z-index: -1;" +
                "height: expression(this.parentNode.offsetHeight);" + "'>");
            var c = el[0].firstChild;
            if (c) shim.insertBefore(c);
            else shim.appendTo(el);
        }
    };
    S.Ext.Shim = ShimExt;
});