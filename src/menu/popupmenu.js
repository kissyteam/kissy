/**
 * positionable and not focusable menu
 * @author yiminghe@gmail.com
 */
KISSY.add("menu/popupmenu", function(S, UIBase, Component, Menu, PopupMenuRender) {
    var doc = S.one(document);
    return UIBase.create(Menu, [
        UIBase.Position,
        UIBase.Align
    ], {

        handleDocumentMouseDown:function(e) {
            var self = this,
                target = S.one(e.target)[0];
            if (self.get("visible") && !self.containsElement(target)) {
                self.hide();
            }
        },

        bindUI:function() {
            var self = this;

            self.on("show", function() {
                doc.on("mousedown", self.handleDocumentMouseDown, self);
            });

            self.on("hide", function() {
                doc.detach("mousedown", self.handleDocumentMouseDown, self);
            });
        }
    }, {
        ATTRS:{
            // 弹出菜单一般不可聚焦，焦点在使它弹出的元素上
            focusable:{
                value:false
            },

            visibleMode:{
                value:"visibility"
            }
        },
        DefaultRender:PopupMenuRender
    });
}, {
    requires:['uibase','component','./menu','./popupmenurender']
});