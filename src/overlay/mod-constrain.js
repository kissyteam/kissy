/**
 * Overlay Constrain Plugin
 * @author 乔花<qiaohua@taobao.com>
 */

KISSY.add('constrain', function(S, undefined) {
    var DOM = S.DOM,
        Overlay = S.Overlay,
        min = Math.min, max = Math.max, CONSTRAIN = 'constrain',
        defaultConstrain = {
            node: undefined,    // 如果没有设置限制容器元素, 默认以可视区域
            mode: false         // 开启/关闭限制
        };

    S.mix(Overlay.ATTRS, {
        constrain: {            // 限制设置
            value: defaultConstrain,
            setter: function(v) {
                return S.merge(this.get(CONSTRAIN), v);
            },
            getter: function(v) {
                return S.merge(defaultConstrain, v);
            }
        },
        x: {
            value: 0,
            setter: function(v) {
                var self = this,
                    constrainRegion = self._getConstrainRegion();

                if (constrainRegion) {
                    v = min(max(constrainRegion.left, v), constrainRegion.maxLeft);
                }
                return v;
            }
        },
        y: {
            value: 0,
            setter: function(v) {
                var self = this,
                    constrainRegion = self._getConstrainRegion();

                if (constrainRegion) {
                    v = min(max(constrainRegion.top, v), constrainRegion.maxTop);
                }
                return v;
            }
        }
    });

    Overlay.Plugins.push({
        name: CONSTRAIN,
        init: function(host) {
            host.on('afterConstrainChange', function() {
                host.align && host.align();
            });
        }
    });

    S.augment(Overlay, {
        /**
         * 获取受限区域的宽高, 位置
         * @return {Object | undefined} {left: 0, top: 0, maxLeft: 100, maxTop: 100}
         */
        _getConstrainRegion: function() {
            var self = this,
                constrain = self.get(CONSTRAIN),
                elem = S.get(constrain.node),
                ret;

            if (!constrain.mode) return undefined;

            if (elem) {
                ret = DOM.offset(elem);
                S.mix(ret, {
                    maxLeft: ret.left + DOM.width(elem) - DOM.width(self.container),
                    maxTop: ret.top + DOM.height(elem) - DOM.height(self.container)
                });
            }
            // 没有指定 constrain, 表示受限于可视区域
            else {
                ret = { left: DOM.scrollLeft(), top: DOM.scrollTop() };
                S.mix(ret, {
                    maxLeft: ret.left + DOM.viewportWidth() - DOM.width(self.container),
                    maxTop: ret.top + DOM.viewportHeight() - DOM.height(self.container)
                });
            }
            return ret;
        },

        /**
         * 限制 overlay 在 node 中
         * @param {Element=} node 
         */
        constrain: function(node) {
            this.set(CONSTRAIN, {
                node: node,
                mode: true
            });
        },

        /**
         * 开启/关闭 constrain
         * @param {boolean} enabled
         */
        toggleConstrain: function(enabled) {
            var self = this;

            self.set(CONSTRAIN, {
                node: self.get(CONSTRAIN).node,
                mode: !!enabled
            });
        }
    });
}, { host: 'overlay' });


/**
 * Note:
 * - 2010/11/01 constrain 支持可视区域或指定区域
 */