/**
 * delegate all draggable nodes to one draggable object
 * @author:yiminghe@gmail.com
 */
KISSY.add("dd/draggable-delegate", function(S, DDM, Draggable, DOM) {
    function Delegate() {
        Delegate.superclass.constructor.apply(this, arguments);
    }

    S.extend(Delegate, Draggable, {
        _init:function() {
            var self = this,
                handlers = self.get('handlers'),
                node = self.get('container');
            if (handlers.length == 0) {
                handlers.push(self.get("selector"));
            }
            node.on('mousedown', self._handleMouseDown, self);
        },

        /**
         * 得到适合 handler，从这里开始启动拖放，对于 handlers 选择器字符串数组
         * @param target
         */
        _getHandler:function(target) {
            var self = this,
                node = this.get("container"),
                handlers = self.get('handlers');

            while (target && target[0] !== node[0]) {
                for (var i = 0; i < handlers.length; i++) {
                    var h = handlers[i];
                    if (DOM.test(target[0], h, node[0])) {
                        return target;
                    }
                }
                target = target.parent();
            }
        },

        /**
         * 找到真正应该移动的节点，对应 selector 属性选择器字符串
         * @param h
         */
        _getNode:function(h) {
            var node = this.get("container"),sel = this.get("selector");
            while (h && h[0] != node[0]) {
                if (DOM.test(h[0], sel, node[0])) {
                    return h;
                }
                h = h.parent();
            }
        },

        /**
         * 父容器监听 mousedown，找到合适的拖动 handlers 以及拖动节点
         *
         * @param ev
         */
        _handleMouseDown:function(ev) {
            var self = this;
            var target = ev.target;
            var handler = target && this._getHandler(target);
            if (!handler) return;
            var node = this._getNode(handler);
            if (!node) return;
            ev.preventDefault();
            self.set("node", node);
            self.set("dragNode", node);
            self._prepare(ev);
        }
    },
    {
        ATTRS:{
            /**
             * 用于委托的父容器
             */
            container:{
                setter:function(v) {
                    return S.one(v);
                }
            },

            /**
             * 实际拖放的节点选择器，一般用 tag.cls
             */
            selector:{
            }

        /**
         * 继承来的 handlers : 拖放句柄选择器数组，一般用 [ tag.cls ]
         * 不设则为 [ selector ]
         *
         * handlers:{
         *  value:[]
         * }
         */
        }
    });

    return Delegate;
}, {
    requires:['./ddm','./draggable','dom']
});