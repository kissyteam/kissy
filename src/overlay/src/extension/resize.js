/**
 * @ignore
 * @fileOverview resize extension using resizable
 * @author yiminghe@gmail.com
 */
KISSY.add("overlay/extension/resize", function (S) {

    /**
     * @class KISSY.Overlay.Extension.Resize
     * Resizable extension class. Make component resizable
     */
    function Resize() {
    }

    Resize.ATTRS = {
        /**
         * Resizable configuration. See {@link KISSY.Resizable}
         * @type {Object}
         * @property resize
         *
         * for example:
         *      @example
         *      {
         *          minWidth:100,
         *          maxWidth:1000,
         *          minHeight:100,
         *          maxHeight:1000,
         *          handlers:["b","t","r","l","tr","tl","br","bl"]
         *      }
         *
         *
         */
        /**
         * @ignore
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
        _onSetResize:function (v) {
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