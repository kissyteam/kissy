/**
 * delegate all draggable nodes to one draggable object
 * @author yiminghe@gmail.com
 */
KISSY.add("dd/draggable-delegate", function(S, DDM, Draggable, DOM, Node) {
    function Delegate() {
        Delegate.superclass.constructor.apply(this, arguments);
    }


    /**
     * 父容器监听 mousedown，找到合适的拖动 handlers 以及拖动节点
     *
     * @param ev
     */
    function _handleMouseDown(ev) {
        var self = this,
            handler,
            node,
            handlers = self.get("handlers"),
            target = new Node(ev.target);

        // 不需要像 Draggble 一样，判断 target 是否在 handler 内
        // 委托时，直接从 target 开始往上找 handler
        if (handlers.length) {
            handler = self._getHandler(target);
        } else {
            handler = target;
        }

        if (handler) {
            self.set("activeHandler", handler);
            node = self._getNode(handler);
        } else {
            return;
        }

        // 找到 handler 确定 委托的 node ，就算成功了
        self.set("node", node);
        self.set("dragNode", node);
        self._prepare(ev);
    }

    S.extend(Delegate, Draggable, {
            _init:function() {
                var self = this,
                    node = self.get('container');
                node.on('mousedown', _handleMouseDown, self)
                    .on('dragstart', self._fixDragStart);
            },

            /**
             * 得到适合 handler，从这里开始启动拖放，对于 handlers 选择器字符串数组
             * @param target
             */
            _getHandler:function(target) {
                var self = this,
                    ret,
                    node = self.get("container"),
                    handlers = self.get('handlers');
                while (target && target[0] !== node[0]) {
                    S.each(handlers, function(h) {
                        if (DOM.test(target[0], h)) {
                            ret = target;
                            return false;
                        }
                    });
                    if (ret) {
                        break;
                    }
                    target = target.parent();
                }
                return ret;
            },

            /**
             * 找到真正应该移动的节点，对应 selector 属性选择器字符串
             * @param h
             */
            _getNode:function(h) {
                return h.closest(this.get("selector"), this.get("container"));
            },

            destroy:function() {
                var self = this;
                self.get("container")
                    .detach('mousedown',
                    _handleMouseDown,
                    self)
                    .detach('dragstart', self._fixDragStart);
                self.detach();
            }
        },
        {
            ATTRS:{
                /**
                 * 用于委托的父容器
                 */
                container:{
                    setter:function(v) {
                        return Node.one(v);
                    }
                },

                /**
                 * 实际拖放的节点选择器，一般用 tag.cls
                 */
                selector:{
                },

                /**
                 * 继承来的 handlers : 拖放句柄选择器数组，一般用 [ tag.cls ]
                 * 不设则为 [ selector ]
                 **/
                handlers:{
                    value:[],
                    // 覆盖父类的 getter ，这里 normalize 成节点
                    getter:0
                }

            }
        });

    return Delegate;
}, {
    requires:['./ddm','./draggable','dom','node']
});