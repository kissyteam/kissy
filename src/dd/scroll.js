/**
 * auto scroll for drag object's container
 * @author yiminghe@gmail.com
 */
KISSY.add("dd/scroll", function(S, Base, Node, DOM) {

    var TAG_DRAG = "__dd-scroll-id-",
        DESTRUCTORS = "__dd_scrolls";

    function Scroll() {
        Scroll.superclass.constructor.apply(this, arguments);
        this[DESTRUCTORS] = {};
    }

    Scroll.ATTRS = {
        node:{
            setter:function(v) {
                return Node.one(v);
            }
        },
        rate:{
            value:[10,10]
        },
        diff:{
            value:[20,20]
        }
    };


    function isWin(node) {
        return !node || node == window;
    }

    S.extend(Scroll, Base, {

        getRegion:function(node) {
            if (isWin(node)) {
                return {
                    width:DOM['viewportWidth'](),
                    height:DOM['viewportHeight']()
                };
            } else {
                return {
                    width:node[0].offsetWidth,
                    height:node[0].offsetHeight
                };
            }
        },

        getOffset:function(node) {
            if (isWin(node)) {
                return {
                    left:DOM.scrollLeft(),
                    top:DOM.scrollTop()
                };
            } else {
                return node.offset();
            }
        },

        getScroll:function(node) {
            if (isWin(node)) {
                return {
                    left:DOM.scrollLeft(),
                    top:DOM.scrollTop()
                };
            } else {
                return {
                    left:node[0].scrollLeft,
                    top:node[0].scrollTop
                };
            }
        },

        setScroll:function(node, r) {
            if (isWin(node)) {
                window.scrollTo(r.left, r.top);
            } else {
                node[0].scrollLeft = r.left;
                node[0].scrollTop = r.top;
            }
        },

        unAttach:function(drag) {
            var tag = drag[TAG_DRAG];
            if (!tag) return;
            this[DESTRUCTORS][tag].fn();
            delete drag[TAG_DRAG];
            delete this[DESTRUCTORS][tag];
        },

        destroy:function() {
            for (var d in this[DESTRUCTORS]) {
                this.unAttach(this[DESTRUCTORS][d].drag);
            }
        },

        attach:function(drag) {
            if (drag[TAG_DRAG]) return;

            var self = this,
                rate = self.get("rate"),
                diff = self.get("diff"),
                event,
                /*
                 目前相对 container 的便宜，container 为 window 时，相对于 viewport
                 */
                dxy,
                timer = null;

            function dragging(ev) {
                if (ev.fake) return;
                var node = self.get("node");
                event = ev;
                dxy = S.clone(drag.mousePos);
                var offset = self.getOffset(node);
                dxy.left -= offset.left;
                dxy.top -= offset.top;
                if (!timer) {
                    startScroll();
                }
            }

            function dragend() {
                clearTimeout(timer);
                timer = null;
            }

            drag.on("drag", dragging);

            drag.on("dragend", dragend);

            var tag = drag[TAG_DRAG] = S.guid(TAG_DRAG);
            self[DESTRUCTORS][tag] = {
                drag:drag,
                fn:function() {
                    drag.detach("drag", dragging);
                    drag.detach("dragend", dragend);
                }
            };


            function startScroll() {
                //S.log("******* scroll");
                var node = self.get("node"),
                    r = self.getRegion(node),
                    nw = r.width,
                    nh = r.height,
                    scroll = self.getScroll(node),
                    origin = S.clone(scroll);

                var diffY = dxy.top - nh;
                //S.log(diffY);
                var adjust = false;
                if (diffY >= -diff[1]) {
                    scroll.top += rate[1];
                    adjust = true;
                }

                var diffY2 = dxy.top;
                //S.log(diffY2);
                if (diffY2 <= diff[1]) {
                    scroll.top -= rate[1];
                    adjust = true;
                }


                var diffX = dxy.left - nw;
                //S.log(diffX);
                if (diffX >= -diff[0]) {
                    scroll.left += rate[0];
                    adjust = true;
                }

                var diffX2 = dxy.left;
                //S.log(diffX2);
                if (diffX2 <= diff[0]) {
                    scroll.left -= rate[0];
                    adjust = true;
                }

                if (adjust) {

                    self.setScroll(node, scroll);
                    timer = setTimeout(arguments.callee, 100);
                    // 不希望更新相对值，特别对于相对 window 时，相对值如果不真正拖放触发的 drag，是不变的，
                    // 不会因为程序 scroll 而改变相对值
                    event.fake = true;
                    if (isWin(node)) {
                        // 当使 window 自动滚动时，也要使得拖放物体相对文档位置随 scroll 改变
                        // 而相对 node 容器时，只需 node 容器滚动，拖动物体相对文档位置不需要改变
                        scroll = self.getScroll(node);
                        event.left += scroll.left - origin.left;
                        event.top += scroll.top - origin.top;
                    }
                    drag.fire("drag", event);
                } else {
                    timer = null;
                }
            }

        }
    });

    return Scroll;
}, {
    requires:['base','node','dom']
});