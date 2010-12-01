/**
 * KISSY Overlay
 * @author: 玉伯<lifesinger@gmail.com>, 承玉<yiminghe@gmail.com>,乔花<qiaohua@taobao.com>
 */
KISSY.add("overlay", function(S) {

    var UIBase = S.UIBase,
        UA = S.UA;


    S.Overlay = UIBase.create([S.UIBase.Box,
        S.UIBase.ContentBox,
        S.UIBase.Position,
        S.UIBase.Loading,
        //ie6 支持,select bug
        UA.ie == 6 ? S.UIBase.Shim : null,
        S.UIBase.Align,
        S.UIBase.Mask], {

        initializer:function() {
            S.log("Overlay init");
        },

        renderUI:function() {
            S.log("_renderUIOverlay");
            this.get("el").addClass("ks-overlay");
        },

        syncUI:function() {
            S.log("_syncUIOverlay");
        },
        /**
         * bindUI
         * 注册dom事件以及属性事件
         * @override
         */
        bindUI: function() {
            S.log("_bindUIOverlay");
        },

        /**
         * 删除自己, mask 删不了
         */
        destructor: function() {
            S.log("overlay destructor");
        }

    },{
        ATTRS:{
            elOrder:0
        }
    });
}, {
    requires: ["core"]
});

/**
 * 2010-11-09 2010-11-10 承玉<yiminghe@gmail.com>重构，attribute-base-Overlay ，采用 Base.create
 */
