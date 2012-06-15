/**
 * @fileOverview resize extension using resizable
 * @author yiminghe@gmail.com
 */
KISSY.add("component/uibase/resize", function (S) {

    /**
     * @name Resize
     * @class
     * Resizable extension class.
     * Make component resizable
     * @memberOf Component.UIBase
     */
    function Resize() {
    }

    Resize.ATTRS =
    /**
     * @lends Component.UIBase.Resize.prototype
     */
    {
        /**
         * Resizable configuration.
         * See {@link Resizable}
         * @example
         * <code>
         *  {
         *    minWidth:100,
         *    maxWidth:1000,
         *    minHeight:100,
         *    maxHeight:1000,
         *    handlers:["b","t","r","l","tr","tl","br","bl"]
         *  }
         * </code>
         * @type Object
         */
        resize:{
            value:{
            }
        }
    };

    Resize.prototype = {
        __destructor:function () {
            var r = this.resizer;
            r && r.destroy();
        },
        _uiSetResize:function (v) {
            var Resizable = S.require("resizable"),
                self = this;
            self.resizer && self.resizer.destroy();
            if (Resizable && v) {
                v.node = self.get("el");
                self.resizer = new Resizable(v);
            }
        }
    };


    return Resize;
});