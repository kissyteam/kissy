/**
 * @ignore
 * shim for ie6 ,require box-ext
 * @author yiminghe@gmail.com
 */
KISSY.add("component/extension/shim-render", function () {
    // only for ie6!
    function Shim() {
    }

    Shim.prototype = {
        __createDom: function () {
            this.get("el").prepend("<" + "iframe style='position: absolute;" +
                "border: none;" +
                // consider border
                // bug fix: 2012-11-07
                "width: expression(this.parentNode.clientWidth);" +
                "top: 0;" +
                "opacity: 0;" +
                "filter: alpha(opacity=0);" +
                "left: 0;" +
                "z-index: -1;" +
                "height: expression(this.parentNode.clientHeight);" + "'/>");
        }
    };

    return Shim;
});