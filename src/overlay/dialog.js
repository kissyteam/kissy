/**
 * KISSY.Dialog
 * @author: 承玉<yiminghe@gmail.com>, 乔花<qiaohua@taobao.com>
 */
KISSY.add('overlay/dialog', function(S, Overlay, UIBase, DialogRender) {

    function require(s) {
        return S.require("uibase/" + s);
    }

    var Dialog = UIBase.create(Overlay, [
        require("stdmod"),
        require("close"),
        require("drag"),
        require("constrain")
    ], {
        renderUI:function() {
            var self = this;
            self.get("view").get("el").addClass("ks-dialog");
            //设置值，drag-ext 绑定时用到
            self.set("handlers", [self.get("view").get("header")]);
        }
    });

    Dialog.DefaultRender = DialogRender;

    return Dialog;

}, {
    requires:[ "overlay/overlay","uibase",'overlay/dialogrender']
});

/**
 * 2010-11-10 承玉<yiminghe@gmail.com>重构，使用扩展类
 */



