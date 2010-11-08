/**
 * Overlay Alignment Plugin
 * @author 乔花<qiaohua@taobao.com>
 */
KISSY.add('alignment', function(S, undefined) {
    var DOM = S.DOM,
        Overlay = S.Overlay,

        ALIGN = 'align',
        POSITION_ALIGN = {
            TL: 'tl',
            TC: 'tc',
            TR: 'tr',
            CL: 'cl',
            CC: 'cc',
            CR: 'cr',
            BL: 'bl',
            BC: 'bc',
            BR: 'br'
        },
        defaultAlignment = {
            node: null,         // 参考元素, falsy 值为可视区域, 'trigger' 为触发元素, 其他为指定元素
            points: [POSITION_ALIGN.CC, POSITION_ALIGN.CC], // ['tl', 'tr'] 表示 overlay 的 tl 与参考节点的 tr 对齐
            offset: [0, 0]      // 有效值为 [n, m]
        };

    S.mix(Overlay.ATTRS, {
        align: {                // 相对指定 node or viewport 的定位
            value: defaultAlignment,
            setter: function(v) {
                return S.merge(this.get(ALIGN), v);
            },
            getter: function(v) {
                return S.merge(defaultAlignment, v);
            }
        }
    });

    Overlay.Plugins.push({
        name: ALIGN,
        init: function(host) {
            host.on('create', function() {
                var self = this;

                self.on('afterAlignChange', function() {
                    self.align();
                });
            });
        }
    });

    S.augment(Overlay, {
        /**
         * 对齐 Overlay 到 node 的 points 点, 偏移 offset 处
         * @param {Element=} node 参照元素, 可取配置选项中的设置, 也可是一元素
         * @param {Array.<string>} points 对齐方式
         * @param {Array.<number>} offset 偏移
         */
        align: function(node, points, offset) {
            var self = this, alignConfig = self.get(ALIGN), xy, diff, p1, p2;

            if (!self.container) return;

            node = node || alignConfig.node;
            if (node === 'trigger') node = self.currentTrigger;
            else node = S.get(node);

            points = points || alignConfig.points;

            offset = offset === undefined ? alignConfig.offset : offset;
            xy = DOM.offset(self.container);

            // p1 是 node 上 points[0] 的 offset
            // p2 是 overlay 上 points[1] 的 offset
            p1 = self._getAlignOffset(node, points[0]);
            p2 = self._getAlignOffset(self.container, points[1]);
            diff = [p2.left - p1.left, p2.top - p1.top];

            self.move(xy.left - diff[0] + (+offset[0]), xy.top - diff[1] + (+offset[1]));
        },

        /**
         * 获取 node 上的 align 对齐点 相对于页面的坐标
         * @param {?Element} node
         * @param {align} align
         */
        _getAlignOffset: function(node, align) {
            var V = align.charAt(0),
                H = align.charAt(1),
                offset, w, h, x, y;

            if (node) {
                offset = DOM.offset(node);
                w = node.offsetWidth;
                h = node.offsetHeight;
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
        },
        
        /**
         * 居中显示到可视区域, 一次性居中
         */
        center: function() {
            //this.set(ALIGN, defaultAlign);
            this.align('viewport', [POSITION_ALIGN.CC, POSITION_ALIGN.CC], [0, 0]);
        },

        /**
         * 设置初始位置
         */
        _setPosition: function() {
            var self = this,
                xy = self.get('xy'), offset;

            if (xy) {
                offset = {left: self.get('x'), top: self.get('y')};

                DOM.offset(self.container, offset);
                if (self.shim) self.shim.setOffset(offset);
            } else {
                self.align();
            }
        }
    });

}, { host: 'overlay' });

/**
 * Note:
 * - 2010/11/01 从 Overlay 中拆分出 align
 */
