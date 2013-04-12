/**
 * animation using js timer
 * @author yiminghe@gmail.com
 * @ignore
 */
KISSY.add('anim/timer', function (S, DOM, Event, AnimBase, Easing, AM, Fx, SHORT_HANDS) {

    var camelCase = DOM._camelCase,
        NUMBER_REG = /^([+\-]=)?([\d+.\-]+)([a-z%]*)$/i;

    function Anim() {
        var self = this,
            props;
        Anim.superclass.constructor.apply(self, arguments);
        // camel case uniformity
        S.each(props = self.props, function (v, prop) {
            var camelProp = camelCase(prop);
            if (prop != camelProp) {
                props[camelProp] = props[prop];
                delete props[prop];
            }
        });
    }

    S.extend(Anim, AnimBase, {

        prepareFx: function () {
            var self = this,
                el = self.el,
                _propsData = self._propsData;

            S.each(_propsData, function (_propData) {
                // ms
                _propData.duration *= 1000;
                _propData.delay *= 1000;
                if (typeof _propData.easing == 'string') {
                    _propData.easing = Easing.toFn(_propData.easing);
                }
            });

            // 扩展分属性
            S.each(SHORT_HANDS, function (shortHands, p) {
                var origin,
                    _propData = _propsData[p],
                    val;
                // 自定义了 fx 就忽略
                if (_propData && !_propData.fx) {
                    val = _propData.value;
                    origin = {};
                    S.each(shortHands, function (sh) {
                        // 得到原始分属性之前值
                        origin[sh] = DOM.css(el, sh);
                    });
                    DOM.css(el, p, val);
                    S.each(origin, function (val, sh) {
                        // 如果分属性没有显式设置过，得到期待的分属性最后值
                        if (!(sh in _propsData)) {
                            _propsData[sh] = S.merge(_propData, {
                                value: DOM.css(el, sh)
                            });
                        }
                        // 还原
                        DOM.css(el, sh, val);
                    });
                    // 删除复合属性
                    delete _propsData[p];
                }
            });

            var prop,
                _propData,
                val,
                to,
                from,
                propCfg,
                fx,
                unit,
                parts;

            // 取得单位，并对单个属性构建 Fx 对象
            for (prop in _propsData) {

                _propData = _propsData[prop];

                // 自定义
                if (_propData.fx) {
                    _propData.fx.prop = prop;
                    continue;
                }

                val = _propData.value;
                propCfg = {
                    prop: prop,
                    anim: self,
                    propData: _propData
                };
                fx = Fx.getFx(propCfg);
                to = val;

                from = fx.cur();

                val += '';
                unit = '';
                parts = val.match(NUMBER_REG);

                if (parts) {
                    to = parseFloat(parts[2]);
                    unit = parts[3];

                    // 有单位但单位不是 px
                    if (unit && unit !== 'px' && from) {
                        var tmpCur = 0,
                            to2 = to;
                        do {
                            ++to2;
                            DOM.css(el, prop, to2 + unit);
                            // in case tmpCur==0
                            tmpCur = fx.cur();
                        } while (tmpCur == 0);
                        // S.log(to2+' --- '+tmpCur);
                        from = (to2 / tmpCur) * from;
                        DOM.css(el, prop, from + unit);
                    }

                    // 相对
                    if (parts[1]) {
                        to = ( (parts[ 1 ] === '-=' ? -1 : 1) * to ) + from;
                    }
                }

                propCfg.from = from;
                propCfg.to = to;
                propCfg.unit = unit;
                fx.load(propCfg);
                _propData.fx = fx;
            }
        },

        // frame of animation
        frame: function () {
            var self = this,
                prop,
                end = 1,
                c,
                fx,
                pos,
                _propData,
                _propsData = self._propsData;

            for (prop in _propsData) {
                _propData = _propsData[prop];
                fx = _propData.fx;
                // 当前属性没有结束
                if (!(fx.finished)) {
                    pos = Fx.getPos(self, _propData);
                    if (pos == 0) {
                        continue;
                    }
                    fx.pos = pos;
                    if (fx.isBasicFx) {
                        // equal attr value, just skip
                        if (fx.from == fx.to) {
                            fx.finished = fx.finished || pos == 1;
                            continue;
                        }
                        c = 0;
                        if (_propData.frame) {
                            // from to pos prop -> fx
                            c = _propData.frame(self, fx);
                            // in case frame call stop
                            if (!self.isRunning()) {
                                return;
                            }
                        }
                        // prevent default
                        if (c !== false) {
                            fx.frame(fx.finished || pos);
                        }
                    } else {
                        fx.finished = fx.finished || pos == 1;
                        fx.frame(self, fx);
                        // in case frame call stop
                        if (!self.isRunning()) {
                            return;
                        }
                    }
                    end &= fx.finished;
                }
            }

            if ((self.fire('step') === false) || end) {
                // complete 事件只在动画到达最后一帧时才触发
                self['stop'](end);
            }
        },

        doStop: function (finish) {
            var self = this,
                prop,
                fx,
                c,
                _propData,
                _propsData = self._propsData;
            AM.stop(self);
            if (finish) {
                for (prop in _propsData) {
                    _propData = _propsData[prop];
                    fx = _propData.fx;
                    // 当前属性没有结束
                    if (fx && !(fx.finished)) {
                        fx.pos = 1;
                        if (fx.isBasicFx) {
                            c = 0;
                            if (_propData.frame) {
                                c = _propData.frame(self, fx);
                            }
                            // prevent default
                            if (c !== false) {
                                fx.frame(1);
                            }
                        } else {
                            fx.frame(self, fx);
                        }
                        fx.finished = 1;
                    }
                }
            }
        },

        doStart: function () {
            AM.start(this);
        }
    });

    Anim.Easing = Easing;

    return Anim;
}, {
    requires: [
        'dom', 'event', './base',
        './timer/easing', './timer/manager',
        './timer/fx', './timer/short-hand'
        , './timer/color'
    ]
});

/*
 2013-01 yiminghe@gmail.com
 - 分属性细粒度控制 {'width':{value:,easing:,fx: }}
 - 重构，merge css3 transition and js animation

 2011-11 yiminghe@gmail.com
 - 重构，抛弃 emile，优化性能，只对需要的属性进行动画
 - 添加 stop/stopQueue/isRunning，支持队列管理

 2011-04 yiminghe@gmail.com
 - 借鉴 yui3 ，中央定时器，否则 ie6 内存泄露？
 - 支持配置 scrollTop/scrollLeft

 - 效率需要提升，当使用 nativeSupport 时仍做了过多动作
 - opera nativeSupport 存在 bug ，浏览器自身 bug ?
 - 实现 jQuery Effects 的 queue / specialEasing / += / 等特性

 NOTES:
 - 与 emile 相比，增加了 borderStyle, 使得 border: 5px solid #ccc 能从无到有，正确显示
 - api 借鉴了 YUI, jQuery 以及 http://www.w3.org/TR/css3-transitions/
 - 代码实现了借鉴了 Emile.js: http://github.com/madrobby/emile *
 */
