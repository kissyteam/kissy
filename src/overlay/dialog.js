/**
 * KISSY.Dialog
 * @author: 承玉<yiminghe@gmail.com>, 乔花<qiaohua@taobao.com>
 */
KISSY.add('overlay/dialog', function(S, Overlay, UIBase) {

    function require(s) {
        return S.require("uibase/" + s);
    }

    return UIBase.create(Overlay, [
        require("stdmod"),
        require("close"),
        require("drag"),
        require("constrain")
    ], {
        initializer:function() {
            //S.log("dialog init");
        },

        renderUI:function() {
            //S.log("_renderUIDialog");
            var self = this;
            self.get("el").addClass("ks-dialog");
            //设置值，drag-ext 绑定时用到
            self.set("handlers", [self.get("header")]);
        },
        bindUI:function() {
            //S.log("_bindUIDialog");
        },
        syncUI:function() {
            //S.log("_syncUIDialog");
        },
        destructor:function() {
            //S.log("Dialog destructor");
        }
    });


}, {
    requires:[ "overlay/overlay","uibase"]
});

/**
 * 2010-11-10 承玉<yiminghe@gmail.com>重构，使用扩展类
 */



