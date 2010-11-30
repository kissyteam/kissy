/**
 * shim for ie6 ,require box-ext
 * @author: 承玉<yiminghe@gmail.com>
 */
KISSY.add("uibase-shim", function(S) {
    S.namespace("UIBase");
    function Shim() {
        S.log("shim init");
    }

    var Node = S.Node;
    Shim.prototype = {
        __syncUI:function() {
            S.log("_syncUIShimExt");
        },
        __bindUI:function() {
            S.log("_bindUIShimExt");
        },
        __renderUI:function() {
            S.log("_renderUIShimExt");
            var self = this,el = self.get("el");
            var shim = new Node("<"+"iframe style='position: absolute;" +
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
    S.UIBase.Shim = Shim;
});