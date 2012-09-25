/**
 * @ignore
 * @fileOverview shim for ie6 ,require box-ext
 * @author yiminghe@gmail.com
 */
KISSY.add("component/uibase/shim-render", function () {
    // only for ie6!
    function Shim() {
    }

    Shim.prototype = {
        __createDom:function () {
            this.get("el").prepend("<" + "iframe style='position: absolute;" +
                "border: none;" +
                "width: expression(this.parentNode.offsetWidth);" +
                "top: 0;" +
                "opacity: 0;" +
                "filter: alpha(opacity=0);" +
                "left: 0;" +
                "z-index: -1;" +
                "height: expression(this.parentNode.offsetHeight);" + "'/>");
        }
    };

    return Shim;
});