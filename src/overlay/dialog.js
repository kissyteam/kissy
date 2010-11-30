/**
 * KISSY.Dialog
 * @author: 承玉<yiminghe@gmail.com>, 乔花<qiaohua@taobao.com>
 */
KISSY.add('dialog', function(S) {

    S.Dialog = S.UIBase.create(S.Overlay,
        [
            S.UIBase.StdMod,
            S.UIBase.Close,
            S.UIBase.Drag,
            S.UIBase.Constrain
        ], {
        initializer:function() {
            S.log("dialog init");
        },

        renderUI:function() {
            S.log("_renderUIDialog");
            var self = this;
            self.get("el").addClass("ks-dialog");
            //设置值，drag-ext 绑定时用到
            self.set("handlers", [self.get("header")]);
        },
        bindUI:function() {
            S.log("_bindUIDialog");
        },
        syncUI:function() {
            S.log("_syncUIDialog");
        },
        destructor:function() {
            S.log("Dialog destructor");
        }
    });


}, { host: 'overlay' });

/**
 * 2010-11-10 承玉<yiminghe@gmail.com>重构，使用扩展类
 */



