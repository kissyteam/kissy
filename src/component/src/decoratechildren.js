/**
 * @fileOverview decorate function for children render from markup
 * @author yiminghe@gmail.com
 */
KISSY.add("component/decoratechildren", function(S, UIStore) {
    function DecorateChildren() {

    }

    S.augment(DecorateChildren, {
        decorateInternal:function(el) {
            var self = this;
            // 不用 __set , 通知 view 更新
            self.set("el", el);
            self.decorateChildren(el);
        },

        /**
         * 生成一个组件
         */
        decorateChildrenInternal:function(UI, c, prefixCls) {
            this.addChild(new UI({
                srcNode:c,
                prefixCls:prefixCls
            }));
        },

        /**
         * 得到适合装饰该节点的组件类
         * @param c
         */
        _findUIByClass:function(c) {
            var self = this,
                cls = c.attr("class") || "",
                prefixCls = self.get("prefixCls");
            // 过滤掉特定前缀
            cls = cls.replace(new RegExp("\\b" + prefixCls, "ig"), "");
            var UI = UIStore.getUIByClass(cls);
            if (!UI) {
                S.log(c);
                S.log("can not find ui " + cls + " from this markup");
            }
            return UI;
        },

        /**
         * container 需要在装饰时对儿子特殊处理，递归装饰
         */
        decorateChildren:function(el) {
            var self = this,children = el.children(),
                prefixCls = self.get("prefixCls");
            children.each(function(c) {
                var UI = self._findUIByClass(c);
                self.decorateChildrenInternal(UI, c, prefixCls);
            });
        }
    });

    return DecorateChildren;

}, {
    requires:['./uistore']
});