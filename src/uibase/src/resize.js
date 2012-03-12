/**
 * @fileOverview resize extension using resizable
 * @author yiminghe@gmail.com
 */
KISSY.add("uibase/resize", function (S) {

    /**
     * make component resizable
     * @class
     * @memberOf UIBase
     */
    function Resize() {
    }

    Resize.ATTRS =
    /**
     * @lends UIBase.Resize.prototype
     */
    {
        /**
         * 调整大小的配置
         * @example
         * <code>
         *  {
         *    minWidth:100, //类型整数, 表示拖动调整大小的最小宽度
         *    maxWidth:1000, //类型整数, 表示拖动调整大小的最大宽度
         *    minHeight:100, //类型整数, 表示拖动调整大小的最小高度
         *    maxHeight:1000, //类型整数, 表示拖动调整大小的最大高度
         *    handlers:["b","t","r","l","tr","tl","br","bl"] //类型字符串数组, 取自上述 8 个值的集合.
         *    // handlers 配置表示的数组元素可取上述八种值之一, t,b,l,r 分别表示 top,bottom,left,right,
         *    // 加上组合共八种取值, 可在上, 下, 左, 右以及左上, 左下, 右上, 右下进行拖动.
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
            if (Resizable) {
                self.resizer && self.resizer.destroy();
                v.node = self.get("el");
                if (v.handlers) {
                    self.resizer = new Resizable(v);
                }
            }
        }
    };


    return Resize;
});