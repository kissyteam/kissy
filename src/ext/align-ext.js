/**
 * align extension
 * @author:承玉<yiminghe@gmail.com>,乔花<qiaohua@taobao.com>
 */
KISSY.add("ext-align", function(S) {
    S.namespace("Ext");
    var DOM = S.DOM,Node = S.Node;

    function AlignExt() {
        S.log("align init");
        var self = this;
        self.on("bindUI", self._bindUIAlign, self);
        self.on("renderUI", self._renderUIAlign, self);
        self.on("syncUI", self._syncUIAlign, self);
    }

    S.mix(AlignExt, {
        TL: 'tl',
        TC: 'tc',
        TR: 'tr',
        CL: 'cl',
        CC: 'cc',
        CR: 'cr',
        BL: 'bl',
        BC: 'bc',
        BR: 'br'
    });


    AlignExt.ATTRS = {
        align:{
            /*
             value:{
             node: null,         // 参考元素, falsy 值为可视区域, 'trigger' 为触发元素, 其他为指定元素
             points: [AlignExt.CC, AlignExt.CC], // ['tr', 'tl'] 表示 overlay 的 tl 与参考节点的 tr 对齐
             offset: [0, 0]      // 有效值为 [n, m]
             }*/
        }
    };


    /**
     * 获取 node 上的 align 对齐点 相对于页面的坐标
     * @param {?Element} node
     * @param align
     */
    function _getAlignOffset(node, align) {
        var V = align.charAt(0),
            H = align.charAt(1),
            offset, w, h, x, y;

        if (node) {
            node = S.one(node);
            offset = node.offset();
            w = node[0].offsetWidth;
            h = node[0].offsetHeight;
        } else {
            offset = { left: DOM.scrollLeft(), top: DOM.scrollTop() };
            w = DOM.viewportWidth();
            h = DOM.viewportHeight();
        }

        x = offset.left;
        y = offset.top;

        if (V === 'c') {
            y += h / 2;
        } else if (V === 'b') {
            y += h;
        }

        if (H === 'c') {
            x += w / 2;
        } else if (H === 'r') {
            x += w;
        }

        return { left: x, top: y };
    }

    AlignExt.prototype = {
        _bindUIAlign:function() {
            S.log("_bindUIAlign");
        },
        _renderUIAlign:function() {
            S.log("_renderUIAlign");
        },
        _syncUIAlign:function() {
            S.log("_syncUIAlign");
        },
        _uiSetAlign:function(v) {
            S.log("_uiSetAlign");
            if (S.isPlainObject(v)) {
                this.align(v.node, v.points, v.offset);
            }
        },
        /**
         * 对齐 Overlay 到 node 的 points 点, 偏移 offset 处
         * @param {Element=} node 参照元素, 可取配置选项中的设置, 也可是一元素
         * @param {Array.<string>} points 对齐方式
         * @param {Array.<number>} offset 偏移
         */
        align: function(node, points, offset) {

            var self = this,
                xy,
                diff,
                p1,
                el = self.get("el"),
                p2;
            offset = offset || [0,0];
            xy = DOM.offset(el);
            // p1 是 node 上 points[0] 的 offset
            // p2 是 overlay 上 points[1] 的 offset
            p1 = _getAlignOffset(node, points[0]);
            p2 = _getAlignOffset(el, points[1]);
            diff = [p2.left - p1.left, p2.top - p1.top];
            var v = [xy.left - diff[0] + (+offset[0]),
                xy.top - diff[1] + (+offset[1])];
            self.set("xy", v);
        },



        /**
         * 居中显示到可视区域, 一次性居中
         */
        center: function(node) {
            this.set("align", {
                node:node,
                points:[AlignExt.CC, AlignExt.CC],
                offset:[0,0]
            });
        },

        __destructor:function() {
            S.log("align __destructor");
        }
    };

    S.Ext.Align = AlignExt;

});