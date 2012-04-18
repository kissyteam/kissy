/**
 * custom overlay  for kissy editor
 * @author yiminghe@gmail.com
 */
KISSY.add("editor/plugin/overlay/index", function (S, KE, UIBase, Overlay, Focus) {
    var Overlay4E = UIBase.create(Overlay, [Focus], {
    }, {
        ATTRS:{
            prefixCls:{
                value:"ke-"
            },
            "zIndex":{
                value:KE.baseZIndex(KE.zIndexManager.OVERLAY)
            }
        }
    });

    Overlay4E.Dialog = UIBase.create(Overlay.Dialog, [Focus], {
        show:function () {
            var self = this;
            //在 show 之前调用
            self.center();
            var y = self.get("y");
            //居中有点偏下
            if (y - S.DOM.scrollTop() > 200) {
                y = S.DOM.scrollTop() + 200;
                self.set("y", y);
            }
            Overlay4E.prototype.show.call(self);
        }
    }, {
        ATTRS:{
            prefixCls:{
                value:"ke-"
            },
            draggable:{
                value:true
            },
            constrain:{
                value:true
            },
            aria:{
                value:true
            },
            "zIndex":{
                value:KE.baseZIndex(KE.zIndexManager.OVERLAY)
            }
        }
    });

    return Overlay4E
}, {
    requires:["editor", 'uibase', 'overlay', './focus', 'dd']
});