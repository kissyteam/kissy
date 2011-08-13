/**
 * KISSY.Dialog
 * @author  承玉<yiminghe@gmail.com>, 乔花<qiaohua@taobao.com>
 */
KISSY.add('overlay/dialog', function(S, Component, Overlay, UIBase, DialogRender, Aria) {

    function require(s) {
        return S.require("uibase/" + s);
    }

    var Dialog = UIBase.create(Overlay, [
        require("stdmod"),
        require("drag"),
        require("constrain"),
        Aria
    ], {
        renderUI:function() {
            var self = this;
            //设置值，drag-ext 绑定时用到
            self.set("handlers", [self.get("header")]);
        }
    }, {
        ATTRS:{
            closable:{
                value:true
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
    requires:[ "component","overlay/overlay","uibase",'overlay/dialogrender','./aria']
});

/**
 * 2010-11-10 承玉<yiminghe@gmail.com>重构，使用扩展类
 */



