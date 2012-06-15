/**
 * @fileOverview KISSY.Dialog
 * @author  yiminghe@gmail.com, 乔花<qiaohua@taobao.com>
 */
KISSY.add('overlay/dialog', function (S, Overlay, DialogRender, Aria) {

    function require(s) {
        return S.require("component/uibase/" + s);
    }

    /**
     * @class
     * KISSY Dialog Component.
     * xclass: 'dialog'.
     * @name Dialog
     * @memberOf Overlay
     * @extends Overlay
     * @extends Component.UIBase.StdMod
     * @extends Component.UIBase.Drag
     * @extends Component.UIBase.Constrain
     */
    var Dialog = Overlay.extend([
        require("stdmod"),
        require("drag"),
        require("constrain"),
        Aria
    ],
        /**
         * @lends Overlay.Dialog#
         */
        {
            /**
             * see {@link Component.UIBase.Box#show}
             * @name Overlay.Dialog#show
             * @function
             */
        },

        {
            ATTRS:/**
             * @lends Overlay.Dialog#
             */
            {

                /**
                 * whether this component can be closed. Default:true
                 * @type Boolean
                 */
                closable:{
                    value:true
                },

                /**
                 * Default: Dialog's header element
                 * see {@link DD.Draggable#handlers}
                 */
                handlers:{
                    valueFn:function () {
                        var self = this;
                        return [
                            // 运行时取得拖放头
                            function () {
                                return self.get("view").get("header");
                            }
                        ];
                    }
                },
                xrender:{
                    value:DialogRender
                }
            }
        }, {
            xclass:'dialog',
            priority:20
        });

    return Dialog;

}, {
    requires:[ "overlay/base", 'overlay/dialogRender', './aria']
});

/**
 * 2010-11-10 yiminghe@gmail.com重构，使用扩展类
 */



