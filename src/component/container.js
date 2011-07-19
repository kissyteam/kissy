/**
 * container can delegate event for its children
 * @author yiminghe@gmail.com
 */
KISSY.add("component/container", function(S, UIBase, MC, UIStore) {

    return UIBase.create(MC, {
        bindUI:function() {
            var self = this,
                view = self.get("view"),
                el = view.get("el");
            el.on("mousedown mouseup mouseover mouseout", self._handleChildMouseEvents, self);
        },
        _handleChildMouseEvents:function(e) {
            var control = this.getOwnerControl(S.one(e.target)[0]);
            if (control) {
                // Child control identified; forward the event.
                switch (e.type) {
                    case "mousedown":
                        control._handleMouseDown(e);
                        break;
                    case "mouseup":
                        control._handleMouseUp(e);
                        break;
                    case "mouseover":
                        control._handleMouseOver(e);
                        break;
                    case "mouseout":
                        control._handleMouseOut(e);
                        break;
                }
            }
        },
        /**
         * container 需要在装饰时对儿子特殊处理，递归装饰
         */
        decorateInternal:function(el) {
            var self = this;
            self.set("el", el);
            var children = el.children();
            S.each(children, function(c) {
                var cls = c.attr("class") || "";
                // 过滤掉特定前缀
                cls = cls.replace(new RegExp("(?:^|\\s+)" + this.get("prefixCls"), "ig"), "")
                var UI = UIStore.getUIByClass(cls);
                self.addChild(new UI({srcNode:c}));
            });
        },
        getOwnerControl:function(node) {
            var self = this,
                children = self.get("children"),
                len = children.length,
                elem = this.get('view').get("el")[0];
            while (node && node !== elem) {
                for (var i = 0; i < len; i++) {
                    if (children[i].get("view").get("el")[0] === node) {
                        return children[i];
                    }
                }
                node = node.parentNode;
            }
            return null;
        }

    });

}, {
    requires:['uibase','./modelcontrol','./uistore']
});