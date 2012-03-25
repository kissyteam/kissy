/**
 * @fileOverview auto scroll for drag object's container
 * @author yiminghe@gmail.com
 */
KISSY.add("dd/scroll", function (S, DDM, Base, Node, DOM) {

    var TAG_DRAG = "__dd-scroll-id-",
        win = S.Env.host,
        stamp = S.stamp,
        RATE = [10, 10],
        ADJUST_DELAY = 100,
        DIFF = [20, 20],
        DESTRUCTORS = "__dd_scrolls";

    /**
     * make parent node scroll while dragging
     * @memberOf DD
     * @class
     */
    function Scroll() {
        var self = this;
        Scroll.superclass.constructor.apply(self, arguments);
        self[DESTRUCTORS] = {};
    }

    Scroll.ATTRS =
    /**
     * @lends DD.Scroll#
     */
    {
        /**
         * node to be scrolled while dragging
         * @type {window|String|HTMLElement}
         */
        node:{
            // value:window：不行，默认值一定是简单对象
            valueFn:function () {
                return Node.one(win);
            },
            setter:function (v) {
                return Node.one(v);
            }
        },
        /**
         * adjust velocity. default:[10,10]. larger faster
         * @type Number[]
         */
        rate:{
            value:RATE
        },
        /**
         * the margin to make node scroll. default: [20,20].
         * easier to scroll for node if larger.
         * @type number[]
         */
        diff:{
            value:DIFF
        }
    };


    var isWin = S.isWindow;

    S.extend(Scroll, Base,
        /**
         * @lends DD.Scroll#
         */
        {
            /**
             * @private
             * @param node
             */
            getRegion:function (node) {
                if (isWin(node[0])) {
                    return {
                        width:DOM.viewportWidth(),
                        height:DOM.viewportHeight()
                    };
                } else {
                    return {
                        width:node.outerWidth(),
                        height:node.outerHeight()
                    };
                }
            },

            /**
             * @private
             * @param node
             */
            getOffset:function (node) {
                if (isWin(node[0])) {
                    return {
                        left:DOM.scrollLeft(),
                        top:DOM.scrollTop()
                    };
                } else {
                    return node.offset();
                }
            },

            /**
             * @private
             * @param node
             */
            getScroll:function (node) {
                return {
                    left:node.scrollLeft(),
                    top:node.scrollTop()
                };
            },

            /**
             * @private
             * @param node
             */
            setScroll:function (node, r) {
                node.scrollLeft(r.left);
                node.scrollTop(r.top);
            },

            /**
             * make node not to scroll while this drag object is dragging
             * @param {DD.Draggable} drag
             */
            detachDrag:function (drag) {
                var tag,
                    destructors = this[DESTRUCTORS];
                if (!(tag = stamp(drag, 1, TAG_DRAG)) ||
                    !destructors[tag]
                    ) {
                    return;
                }
                destructors[tag].fn();
                delete destructors[tag];
            },

            /**
             * make node not to scroll at all
             */
            destroy:function () {
                var self = this,
                    destructors = self[DESTRUCTORS];
                for (var d in destructors) {
                    self.unAttach(destructors[d].drag);
                }
            },

            /**
             * make node to scroll while this drag object is dragging
             * @param {DD.Draggable} drag
             */
            attachDrag:function (drag) {
                var self = this,
                    node = self.get("node"),
                    tag = stamp(drag, 0, TAG_DRAG),
                    destructors = self[DESTRUCTORS];

                if (destructors[tag]) {
                    return;
                }

                var rate = self.get("rate"),
                    diff = self.get('diff'),
                    event,
                    /*
                     目前相对 container 的偏移，container 为 window 时，相对于 viewport
                     */
                    dxy,
                    timer = null;

                // fix https://github.com/kissyteam/kissy/issues/115
                // dragDelegate 时 可能一个 dragDelegate对应多个 scroll
                // check container
                function checkContainer() {
                    if (isWin(node[0])) {
                        return 0;
                    }
                    // 判断 proxyNode，不对 dragNode 做大的改变
                    var mousePos = drag.mousePos,
                        r = DDM.region(node);

                    if (!DDM.inRegion(r, mousePos)) {
                        clearTimeout(timer);
                        timer = 0;
                        return 1;
                    }
                    return 0;
                }

                function dragging(ev) {
                    // 给调用者的事件，框架不需要处理
                    // fake 也表示该事件不是因为 mouseover 产生的
                    if (ev.fake) {
                        return;
                    }

                    if (checkContainer()) {
                        return;
                    }

                    // 更新当前鼠标相对于拖节点的相对位置
                    event = ev;
                    dxy = S.clone(drag.mousePos);
                    var offset = self.getOffset(node);
                    dxy.left -= offset.left;
                    dxy.top -= offset.top;
                    if (!timer) {
                        checkAndScroll();
                    }
                }

                function dragEnd() {
                    clearTimeout(timer);
                    timer = null;
                }

                drag.on("drag", dragging);

                drag.on("dragend", dragEnd);

                destructors[tag] = {
                    drag:drag,
                    fn:function () {
                        drag.detach("drag", dragging);
                        drag.detach("dragend", dragEnd);
                    }
                };

                function checkAndScroll() {
                    if (checkContainer()) {
                        return;
                    }

                    var r = self.getRegion(node),
                        nw = r.width,
                        nh = r.height,
                        scroll = self.getScroll(node),
                        origin = S.clone(scroll),
                        diffY = dxy.top - nh,
                        adjust = false;

                    if (diffY >= -diff[1]) {
                        scroll.top += rate[1];
                        adjust = true;
                    }

                    var diffY2 = dxy.top;

                    if (diffY2 <= diff[1]) {
                        scroll.top -= rate[1];
                        adjust = true;
                    }

                    var diffX = dxy.left - nw;

                    if (diffX >= -diff[0]) {
                        scroll.left += rate[0];
                        adjust = true;
                    }

                    var diffX2 = dxy.left;

                    if (diffX2 <= diff[0]) {
                        scroll.left -= rate[0];
                        adjust = true;
                    }

                    if (adjust) {
                        self.setScroll(node, scroll);
                        timer = setTimeout(checkAndScroll, ADJUST_DELAY);
                        // 不希望更新相对值，特别对于相对 window 时，相对值如果不真正拖放触发的 drag，是不变的，
                        // 不会因为程序 scroll 而改变相对值

                        // 调整事件，不需要 scroll 监控，达到预期结果：元素随容器的持续不断滚动而自动调整位置.
                        event.fake = true;
                        if (isWin(node[0])) {
                            // 当使 window 自动滚动时，也要使得拖放物体相对文档位置随 scroll 改变
                            // 而相对 node 容器时，只需 node 容器滚动，拖动物体相对文档位置不需要改变
                            scroll = self.getScroll(node);
                            event.left += scroll.left - origin.left;
                            event.top += scroll.top - origin.top;
                        }
                        // 容器滚动了，元素也要重新设置 left,top
                        if (drag.get("move")) {
                            drag.get("node").offset(event);
                        }
                        drag.fire("drag", event);
                    } else {
                        timer = null;
                    }
                }

            }
        });

    // for compatibility
    var ScrollPrototype = Scroll.prototype;
    ScrollPrototype.attach = ScrollPrototype.attachDrag;
    ScrollPrototype.unAttach = ScrollPrototype.detachDrag;
    return Scroll;
}, {
    requires:['./ddm', 'base', 'node', 'dom']
});