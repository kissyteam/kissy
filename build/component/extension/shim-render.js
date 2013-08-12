/*
Copyright 2013, KISSY UI Library v1.40dev
MIT Licensed
build time: Aug 13 00:06
*/
/*
 Combined processedModules by KISSY Module Compiler: 

 component/extension/shim-render
*/

/**
 * @ignore
 * shim for ie6 ,require box-ext
 * @author yiminghe@gmail.com
 */
KISSY.add("component/extension/shim-render", function () {
    var shimTpl = "<" + "iframe style='position: absolute;" +
        "border: none;" +
        // consider border
        // bug fix: 2012-11-07
        "width: expression(this.parentNode.clientWidth);" +
        "top: 0;" +
        "opacity: 0;" +
        "filter: alpha(opacity=0);" +
        "left: 0;" +
        "z-index: -1;" +
        "height: expression(this.parentNode.clientHeight);" + "'/>";

    // only for ie6!
    function ShimRender() {
    }

    ShimRender.prototype.__createDom = function () {
        this.$el.prepend(shimTpl);
    };

    return ShimRender;
});

