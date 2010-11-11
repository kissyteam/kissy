/**
 * KISSY.Dialog
 * @creator  承玉<yiminghe@gmail.com>, 乔花<qiaohua@taobao.com>
 */
KISSY.add('dialog', function(S, undefined) {
    
    var Dialog = S.Base.create(S.Overlay, [S.Ext.StdMod,S.Ext.Close,S.Ext.Drag], {
        init:function() {
            S.log("dialog init");
            var self = this;
            self.on("renderUI", self._rendUIDialog, self);
        },

        _rendUIDialog:function() {
            S.log("_rendUIDialog");
            var self = this;
            //设置值，drag-ext 绑定时用到
            self.set("handlers", [self.get("header")]);
        },
        destructor:function(){
            S.log("Dialog destructor");
        }

    });

    S.Dialog = Dialog;
}, { host: 'overlay' });

/**
 * 2010-11-10 承玉<yiminghe@gmail.com>重构，使用扩展类
 */



