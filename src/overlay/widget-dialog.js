/**
 * KISSY.Dialog
 * @creator  玉伯<lifesinger@gmail.com>, 乔花<qiaohua@taobao.com>
 */
KISSY.add('dialog', function(S, undefined) {

    var Dialog = S.Base.create(S.Overlay, [S.Ext.StdMod,S.Ext.Close,S.Ext.Drag], {
        init:function() {
            var self = this;
            Dialog.superclass.init.call(self);
            self.on("renderUI", self._rendUIDialog, self);
        },

        _rendUIDialog:function() {
            var self = this;
            //设置值，drag-ext 绑定时用到
            self.set("handlers", [self.get("header")]);
        }

    });

    S.Dialog = Dialog;
}, { host: 'overlay' });

/**
 * 2010-11-10 承玉<yiminghe@gmail.com>重构，使用扩展类
 */



