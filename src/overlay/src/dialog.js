/**
 * @fileOverview KISSY.Dialog
 * @author  yiminghe@gmail.com, 乔花<qiaohua@taobao.com>
 */
KISSY.add('overlay/dialog', function (S, Component, Overlay, UIBase, DialogRender, Aria) {

    function require(s) {
        return S.require("uibase/" + s);
    }

    /**
     * KISSY Dialog Component
     * @class
     * @name Dialog
     * @memberOf Overlay
     * @extends Overlay
     * @extends UIBase.StdMod
     * @extends UIBase.Drag
     * @extends UIBase.Constrain
     */
    var Dialog = UIBase.create(Overlay, [
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
             * see {@link UIBase.Box#show}
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
                }
            }
        });

    Dialog.DefaultRender = DialogRender;

    Component.UIStore.setUIByClass("dialog", {
        priority:Component.UIStore.PRIORITY.LEVEL2,
        ui:Dialog
    });

    return Dialog;

}, {
    requires:[ "component", "overlay/base", "uibase", 'overlay/dialogrender', './aria']
});

/**
 * 2010-11-10 yiminghe@gmail.com重构，使用扩展类
 */



