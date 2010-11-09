/**
 * Overlay Constrain Plugin
 * @author 乔花<qiaohua@taobao.com>
 */

KISSY.add('constrain', function(S, undefined) {
    var DOM = S.DOM,
        Overlay = S.Overlay,
        min = Math.min, max = Math.max, CONSTRAIN = 'constrain';

    S.mix(Overlay.ATTRS, {
        constrain: {            // 限制设置
            value: false,
            setter: function(v) {
                return S.isBoolean(v) ? v : S.get(v);
            }
        }
    });

    Overlay.Plugins.push({
        name: CONSTRAIN,
        init: function(host) {
            host.on('create', function() {
                var self = this;

                self.on('afterConstrainChange', function() {
                    self._setPosition();
                });
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
                ret;

            if (!constrain) return undefined;

            if (constrain !== true) {
                ret = DOM.offset(constrain);
                S.mix(ret, {
                    maxLeft: ret.left + DOM.width(constrain) - DOM.width(self.container),
                    maxTop: ret.top + DOM.height(constrain) - DOM.height(self.container)
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

        move: function(x, y) {
            var self = this,
                constrainRegion = self._getConstrainRegion();

            if (S.isArray(x)) {
                y = x[1];
                x = x[0];
            }

            if (constrainRegion) {
                x = min(max(constrainRegion.left, x), constrainRegion.maxLeft);
                if (y) {
                    y = min(max(constrainRegion.top, y), constrainRegion.maxTop);
                }
            }
            self.set('x', x);
            y && self.set('y', y);
        }
    });

}, { host: 'overlay' });


/**
 * Note:
 * - 2010/11/01 constrain 支持可视区域或指定区域
 */