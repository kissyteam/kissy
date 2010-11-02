/**
 * Overlay Constrain Plugin
 * @author 乔花<qiaohua@taobao.com>
 */

KISSY.add('constrain', function(S, undefined) {
    var DOM = S.DOM,
        Overlay = S.Overlay,
        min = Math.min, max = Math.max,
        defaultConstrain = {
            node: undefined,    // 如果没有设置限制容器元素, 默认以可视区域
            mode: false         // 开启/关闭限制
        };

    /**
     * 添加 constrain 配置项
     */
    S.mix(Overlay.Config, {
        constrain: defaultConstrain
    });

    S.mix(Overlay.ATTRS, {
        constrain: {
            value: defaultConstrain
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
        name: 'constrain',
        init: function(host) {
            host.config.constrain = S.merge(S.clone(Overlay.Config.constrain), host.config.constrain);

            host.set('constrain', host.config.constrain);
            host.on('afterConstrainChange', function(e) {
                host.align();
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
                constrain = self.get('constrain'),
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
            var self = this;

            self.set('constrain', {
                'node': node,
                'mode': true
            });
        },

        /**
         * 开启/关闭 constrain
         * @param {boolean} enabled
         */
        toggleConstrain: function(enabled) {
            var self = this;

            self.set('constrain', {
                node: self.get('constrain').node,
                mode: !!enabled
            });
        }
    });
}, { host: 'overlay' });


/**
 * Note:
 * - 2010/11/01 constrain 支持可视区域或指定区域
 */