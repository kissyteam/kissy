/**
 * KISSY Overlay
 * @author: 玉伯<lifesinger@gmail.com>, 承玉<yiminghe@gmail.com>,乔花<qiaohua@taobao.com>
 */
KISSY.add("overlay/overlay", function(S, UA, UIBase) {

    function require(s) {
        return S.require("uibase/" + s);
    }

    return UIBase.create([require("box"),
        require("contentbox"),
        require("position"),
        require("loading"),
        UA['ie'] == 6 ? require("shim") : null,
        require("align"),
         require("resize"),
        require("mask")], {

        initializer:function() {
            //S.log("Overlay init");
        },

        renderUI:function() {
            //S.log("_renderUIOverlay");
            this.get("el").addClass("ks-overlay");
        },

        syncUI:function() {
            //S.log("_syncUIOverlay");
        },
        /**
         * bindUI
         * 注册dom事件以及属性事件
         * @override
         */
        bindUI: function() {
            //S.log("_bindUIOverlay");
        },

        /**
         * 删除自己, mask 删不了
         */
        destructor: function() {
            //S.log("overlay destructor");
        }

    }, {
        ATTRS:{
            elOrder:0
        }
    });
}, {
    requires: ["ua","uibase"]
});

/**
 * 2010-11-09 2010-11-10 承玉<yiminghe@gmail.com>重构，attribute-base-uibase-Overlay ，采用 UIBase.create
 */
