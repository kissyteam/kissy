/**
 * KISSY.Dialog
 * @creator  承玉<yiminghe@gmail.com>, 乔花<qiaohua@taobao.com>
 */
KISSY.add('dialog', function(S) {

    S.Dialog = S.Base.create(S.Overlay,
        [S.Ext.StdMod,
            S.Ext.Close,
            S.Ext.Drag,
            S.Ext.Constrain], {
        init:function() {
            S.log("dialog init");
            var self = this;
            self.on("renderUI", self._rendUIDialog, self);
            self.on("bindUI", self._bindUIDialog, self);
            self.on("syncUI", self._syncUIDialog, self);
        },

        _rendUIDialog:function() {
            S.log("_rendUIDialog");
            var self = this;
            self.get("el").addClass("ks-dialog");
            //设置值，drag-ext 绑定时用到
            self.set("handlers", [self.get("header")]);
        },
        _bindUIDialog:function() {
            S.log("_bindUIDialog");
        },
        _syncUIDialog:function() {
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



