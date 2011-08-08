/**
 * KISSY Overlay
 * @author  玉伯<lifesinger@gmail.com>, 承玉<yiminghe@gmail.com>,乔花<qiaohua@taobao.com>
 */
KISSY.add("overlay/overlayrender", function(S, UA, UIBase, Component) {

    var $ = S.all;

    function require(s) {
        return S.require("uibase/" + s);
    }

    return UIBase.create(Component.Render, [
        require("contentboxrender"),
        require("positionrender"),
        require("loadingrender"),
        UA['ie'] == 6 ? require("shimrender") : null,
        require("maskrender")
    ], {

        renderUI:function() {
            this.get("el").addClass(this.get("prefixCls") + "overlay");
        }

    }, {
        ATTRS:{
            elBefore:{
                valueFn:function() {
                    return $("body").first();
                }
            },
            // 是否支持焦点处理
            focusable:{
                value:false
            },
            visibleMode:{
                value:"visibility"
            }
        }
    });
}, {
    requires: ["ua","uibase","component"]
});

/**
 * 2010-11-09 2010-11-10 承玉<yiminghe@gmail.com>重构，attribute-base-uibase-Overlay ，采用 UIBase.create
 */
