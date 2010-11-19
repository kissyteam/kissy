/**
 * KISSY Overlay
 * @author 玉伯<lifesinger@gmail.com>, 承玉<yiminghe@gmail.com>,乔花<qiaohua@taobao.com>
 */
KISSY.add("overlay", function(S) {

    var Base = S.Base,
        UA = S.UA;


    var Overlay = Base.create([S.Ext.Box,
        S.Ext.ContentBox,
        S.Ext.Position,
        S.Ext.Loading,
        //ie6 支持,select bug
        UA.ie == 6 ? S.Ext.Shim : null,
        S.Ext.Align,
        S.Ext.Mask], {

        init:function() {
            S.log("Overlay init");
            var self = this;
            self.on("bindUI", self._bindUIOverlay, self);
            self.on("renderUI", self._renderUIOverlay, self);
            self.on("syncUI", self._syncUIOverlay, self);
        },

        _renderUIOverlay:function() {
            S.log("_renderUIOverlay");
            this.get("el").addClass("ks-overlay");
        },

        _syncUIOverlay:function() {
            S.log("_syncUIOverlay");
        },
        /**
         * bindUI
         * 注册dom事件以及属性事件
         * @override
         */
        _bindUIOverlay: function() {
            S.log("_bindUIOverlay");
        },

        /**
         * 删除自己, mask 删不了
         */
        destructor: function() {
            S.log("overlay destructor");
        }

    });
    S.Overlay = Overlay;

}, {
    requires: ["core"]
});

/**
 * 2010-11-09 2010-11-10 承玉<yiminghe@gmail.com>重构，attribute-base-Overlay ，采用 Base.create
 *
 * TODO:
 *  - effect
 */
