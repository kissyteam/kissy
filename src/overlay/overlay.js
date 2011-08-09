/**
 * model and control for overlay
 * @author yiminghe@gmail.com
 */
KISSY.add("overlay/overlay", function(S, UIBase, Component, OverlayRender, Effect) {
    function require(s) {
        return S.require("uibase/" + s);
    }

    var Overlay = UIBase.create(Component.ModelControl, [
        require("contentbox"),
        require("position"),
        require("loading"),
        require("align"),
        require("close"),
        require("resize"),
        require("mask"),
        Effect
    ], {}, {
        ATTRS:{
            // 是否支持焦点处理
            focusable:{
                value:false
            },
            closable:{
                // overlay 默认没 X
                value:false
            },
            // 是否绑定鼠标事件
            handleMouseEvents:{
                value:false
            },
            allowTextSelection_:{
                value:true
            },
            visibleMode:{
                value:"visibility"
            }
        }
    });

    Overlay.DefaultRender = OverlayRender;

    return Overlay;
}, {
    requires:['uibase','component','./overlayrender','./effect']
});