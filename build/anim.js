/*
Copyright 2011, KISSY UI Library v1.20dev
MIT Licensed
build time: Nov 9 22:49
*/
/**
 * animation framework for KISSY
 * @author   yiminghe@gmail.com,lifesinger@gmail.com
 */
KISSY.add('anim/base', function(S, DOM, Event, Easing, UA, AM, Fx) {

    var camelCase = DOM._camelCase,
        _isElementNode = DOM._isElementNode,
        // shorthand css properties
        SHORT_HANDS = {
            border:[
                "borderBottomWidth",
                "borderLeftWidth",
                'borderRightWidth',
                // 'borderSpacing', 组合属性？
                'borderTopWidth'
            ],
            "borderBottom":["borderBottomWidth"],
            "borderLeft":["borderLeftWidth"],
            borderTop:["borderTopWidth"],
            borderRight:["borderRightWidth"],
            font:[
                'fontSize',
                'fontWeight'
            ],
            margin:[
                'marginBottom',
                'marginLeft',
                'marginRight',
                'marginTop'
            ],
            padding:[
                'paddingBottom',
                'paddingLeft',
                'paddingRight',
                'paddingTop'
            ]
        },
        defaultConfig = {
            duration: 1,
            easing: 'easeNone'
        },
        rfxnum = /^([+\-]=)?([\d+.\-]+)([a-z%]*)$/i;

    Anim.SHORT_HANDS = SHORT_HANDS;


    /**
     * get a anim instance associate
     * @param elem 元素或者 window （ window 时只能动画 scrollTop/scrollLeft ）
     * @param props
     * @param duration
     * @param easing
     * @param callback
     */
    function Anim(elem, props, duration, easing, callback) {
        var self = this,config;

        // ignore non-exist element
        if (!(elem = DOM.get(elem))) {
            return;
        }

        // factory or constructor
        if (!(self instanceof Anim)) {
            return new Anim(elem, props, duration, easing, callback);
        }

        /**
         * the transition properties
         */
        if (S.isString(props)) {
            props = S.unparam(props, ";", ":");
        }

        /**
         * 驼峰属性名
         */
        for (var prop in props) {
            var camelProp = camelCase(S.trim(prop));
            if (prop != camelProp) {
                props[camelProp] = props[prop];
                delete props[prop];
            }
        }

        /**
         * animation config
         */
        if (S.isPlainObject(duration)) {
            config = duration;
        } else {
            config = {
                duration:parseFloat(duration) || undefined,
                easing:easing,
                complete:callback
            };
        }

        config = S.merge(defaultConfig, config);

        config.duration *= 1000;
        self.config = config;
        // domEl deprecated!
        self.elem = self['domEl'] = elem;
        self.props = props;

        // 实例属性
        self._backupProps = {};
        self._fxs = {};

        // register callback
        if (config.complete) {
            self.on("complete", config.complete);
        }
    }

    S.augment(Anim, Event.Target, {

        /**
         * @type {boolean} 是否在运行
         */
        isRunning:false,

        /**
         * 开始动画
         */
        run: function() {

            var self = this,
                _backupProps = self._backupProps,
                elem = self.elem,
                prop,
                propEasings = {},
                fxs = self._fxs,
                config = self.config,
                props = self.props;

            if (self.fire("start") === false) {
                return;
            }

            // 分离 easing
            S.each(props, function(val, prop) {
                if (!props.hasOwnProperty(prop)) {
                    return;
                }
                var easing;
                if (S.isArray(val)) {
                    easing = propEasings[prop] = val[1];
                    props[prop] = val[0];
                } else {
                    easing = propEasings[prop] = config.easing;
                }
                if (S.isString(easing)) {
                    easing = propEasings[prop] = Easing[easing];
                }
                propEasings[prop] = easing || Easing.easeNone;
            });


            // 扩展分属性
            S.each(SHORT_HANDS, function(shortHands, p) {
                var sh,
                    origin,
                    val;
                if (val = props[p]) {
                    origin = {};
                    S.each(shortHands, function(sh) {
                        // 得到原始分属性之前值
                        origin[sh] = DOM.css(elem, sh);
                        propEasings[sh] = propEasings[p];
                    });
                    DOM.css(elem, p, val);
                    for (sh in origin) {
                        // 得到期待的分属性最后值
                        props[sh] = DOM.css(elem, sh);
                        // 还原
                        DOM.css(elem, sh, origin[sh]);
                    }
                    // 删除复合属性
                    delete props[p];
                }
            });

            // 取得单位，并对单个属性构建 Fx 对象
            for (prop in props) {
                if (!props.hasOwnProperty(prop)) {
                    continue;
                }

                var val = S.trim(props[prop]),
                    propCfg = {
                        elem:elem,
                        prop:prop,
                        duration:config.duration,
                        easing:propEasings[prop]
                    },
                    fx = Fx.getFx(propCfg),
                    to = val,
                    unit = "",
                    from = fx.cur(),
                    parts = val.match(rfxnum);

                if (parts) {
                    to = parseFloat(parts[2]);
                    unit = parts[3];

                    // 有单位但单位不是 px
                    if (unit && unit !== "px") {
                        DOM.css(elem, prop, val);
                        from = (to / fx.cur()) * from;
                        DOM.css(elem, prop, from + unit);
                    }

                    // 相对
                    if (parts[1]) {
                        to = ( (parts[ 1 ] === "-=" ? -1 : 1) * to ) + from;
                    }
                }

                propCfg.from = from;
                propCfg.to = to;
                propCfg.unit = unit;
                fx.load(propCfg);
                fxs[prop] = fx;
            }

            if (_isElementNode(elem) &&
                (props.width || props.height)) {
                // Make sure that nothing sneaks out
                // Record all 3 overflow attributes because IE does not
                // change the overflow attribute when overflowX and
                // overflowY are set to the same value
                S.mix(_backupProps, {
                    overflow:DOM.css(elem, "overflow"),
                    "overflow-x":DOM.css(elem, "overflowX"),
                    "overflow-y":DOM.css(elem, "overflowY")
                });
                DOM.css(elem, "overflow", "hidden");
                // inline element should has layout/inline-block
                if (DOM.css(elem, "display") === "inline" &&
                    DOM.css(elem, "float") === "none") {
                    if (UA['ie']) {
                        DOM.css(elem, "zoom", 1);
                    } else {
                        DOM.css(elem, "display", "inline-block");
                    }
                }
            }

            AM.start(self);

            self.isRunning = true;

            return self;
        },

        _frame:function() {

            var self = this,
                prop,
                end = 1,
                fxs = self._fxs;

            for (prop in fxs) {
                if (fxs.hasOwnProperty(prop)) {
                    end &= fxs[prop].frame();
                }
            }

            if ((self.fire("step") === false) ||
                end) {
                // complete 事件只在动画到达最后一帧时才触发
                self.stop(end);
            }
        },

        stop: function(finish) {
            var self = this,
                _backupProps,
                prop,
                fxs = self._fxs,
                elem = self.elem;

            // already stopped
            if (!self.isRunning) {
                return;
            }

            if (finish) {
                for (prop in fxs) {
                    if (!fxs.hasOwnProperty(prop)) {
                        continue;
                    }
                    fxs[prop].frame(1);
                }
                self.fire("complete");
            }

            // 恢复 overflow
            if (!S.isEmptyObject(_backupProps = self._backupProps)) {
                DOM.css(elem, _backupProps);
            }

            self._backupProps = {};
            self._fxs = {};

            AM.stop(self);

            self.isRunning = false;

            return self;
        }
    });

    return Anim;
}, {
    requires:["dom","event","./easing","ua","./manager","./fx"]
});

/**
 * 2011-11
 * - 抛弃 emile，优化性能，只对需要的属性进行动画
 *
 * 2011-04
 * - 借鉴 yui3 ，中央定时器，否则 ie6 内存泄露？
 * - 支持配置 scrollTop/scrollLeft
 *
 *
 * TODO:
 *  - 效率需要提升，当使用 nativeSupport 时仍做了过多动作
 *  - opera nativeSupport 存在 bug ，浏览器自身 bug ?
 *  - 实现 jQuery Effects 的 queue / specialEasing / += / 等特性
 *
 * NOTES:
 *  - 与 emile 相比，增加了 borderStyle, 使得 border: 5px solid #ccc 能从无到有，正确显示
 *  - api 借鉴了 YUI, jQuery 以及 http://www.w3.org/TR/css3-transitions/
 *  - 代码实现了借鉴了 Emile.js: http://github.com/madrobby/emile *
 */
/**
 * special patch for making color gradual change
 * @author  yiminghe@gmail.com
 */
KISSY.add("anim/color", function(S, DOM, Anim, Fx) {

    var HEX_BASE = 16,

        floor = Math.floor,

        KEYWORDS = {
            "black":[0,0,0],
            "silver":[192,192,192],
            "gray":[128,128,128],
            "white":[255,255,255],
            "maroon":[128,0,0],
            "red":[255,0,0],
            "purple":[128,0,128],
            "fuchsia":[255,0,255],
            "green":[0,128,0],
            "lime":[0,255,0],
            "olive":[128,128,0],
            "yellow":[255,255,0],
            "navy":[0,0,128],
            "blue":[0,0,255],
            "teal":[0,128,128],
            "aqua":[0,255,255]
        },
        re_RGB = /^rgb\(([0-9]+)\s*,\s*([0-9]+)\s*,\s*([0-9]+)\)$/i,

        re_RGBA = /^rgba\(([0-9]+)\s*,\s*([0-9]+)\s*,\s*([0-9]+),\s*([0-9]+)\)$/i,

        re_hex = /^#?([0-9A-F]{1,2})([0-9A-F]{1,2})([0-9A-F]{1,2})$/i,

        SHORT_HANDS = Anim.SHORT_HANDS,

        COLORS = [
            'backgroundColor' ,
            'borderBottomColor' ,
            'borderLeftColor' ,
            'borderRightColor' ,
            'borderTopColor' ,
            'color' ,
            'outlineColor'
        ];

    SHORT_HANDS['background'] = ['backgroundColor'];

    SHORT_HANDS['borderColor'] = [
        'borderBottomColor',
        'borderLeftColor',
        'borderRightColor',
        'borderTopColor'
    ];

    SHORT_HANDS['border'].push(
        'borderBottomColor',
        'borderLeftColor',
        'borderRightColor',
        'borderTopColor'
    );

    SHORT_HANDS['borderBottom'].push(
        'borderBottomColor'
    );

    SHORT_HANDS['borderLeft'].push(
        'borderLeftColor'
    );

    SHORT_HANDS['borderRight'].push(
        'borderRightColor'
    );

    SHORT_HANDS['borderTop'].push(
        'borderTopColor'
    );

    //得到颜色的数值表示，红绿蓝数字数组
    function numericColor(val) {
        val = (val + "");
        var match;
        if (match = val.match(re_RGB)) {
            return [
                parseInt(match[1]),
                parseInt(match[2]),
                parseInt(match[3])
            ];
        }
        else if (match = val.match(re_RGBA)) {
            return [
                parseInt(match[1]),
                parseInt(match[2]),
                parseInt(match[3]),
                parseInt(match[4])
            ];
        }
        else if (match = val.match(re_hex)) {
            for (var i = 1; i < match.length; i++) {
                if (match[i].length < 2) {
                    match[i] += match[i];
                }
            }
            return [
                parseInt(match[1], HEX_BASE),
                parseInt(match[2], HEX_BASE),
                parseInt(match[3], HEX_BASE)
            ];
        }
        if (KEYWORDS[val = val.toLowerCase()]) {
            return KEYWORDS[val];
        }

        //transparent 或者 颜色字符串返回
        S.log("only allow rgb or hex color string : " + val, "warn");
        return [255,255,255];
    }

    function ColorFx() {
        ColorFx.superclass.constructor.apply(this, arguments);
    }

    S.extend(ColorFx, Fx, {

        load:function() {
            var self = this;
            ColorFx.superclass.load.apply(self, arguments);
            if (self.from) {
                self.from = numericColor(self.from);
            }
            if (self.to) {
                self.to = numericColor(self.to);
            }
        },

        interpolate:function (from, to, pos) {
            var interpolate = ColorFx.superclass.interpolate;
            if (from.length == 3 && to.length == 3) {
                return 'rgb(' + [
                    floor(interpolate(from[0], to[0], pos)),
                    floor(interpolate(from[1], to[1], pos)),
                    floor(interpolate(from[2], to[2], pos))
                ].join(', ') + ')';
            } else if (from.length == 4 || to.length == 4) {
                return 'rgba(' + [
                    floor(interpolate(from[0], to[0], pos)),
                    floor(interpolate(from[1], to[1], pos)),
                    floor(interpolate(from[2], to[2], pos)),
                    // 透明度默认 1
                    floor(interpolate(from[3] || 1, to[3] || 1, pos))
                ].join(', ') + ')';
            } else {
                S.log("anim/color unknown value : " + from);
            }
        }

    });

    S.each(COLORS, function(color) {
        Fx.Factories[color] = ColorFx;
    });

    return ColorFx;

}, {
    requires:["dom","./base","./fx"]
});

/**
 * TODO
 * 支持 hsla
 *  - https://github.com/jquery/jquery-color/blob/master/jquery.color.js
 **//**
 * @module anim-easing
 */
KISSY.add('anim/easing', function() {

    // Based on Easing Equations (c) 2003 Robert Penner, all rights reserved.
    // This work is subject to the terms in http://www.robertpenner.com/easing_terms_of_use.html
    // Preview: http://www.robertpenner.com/easing/easing_demo.html

    /**
     * 和 YUI 的 Easing 相比，S.Easing 进行了归一化处理，参数调整为：
     * @param {Number} t Time value used to compute current value  保留 0 =< t <= 1
     * @param {Number} b Starting value  b = 0
     * @param {Number} c Delta between start and end values  c = 1
     * @param {Number} d Total length of animation d = 1
     */

    var PI = Math.PI,
        pow = Math.pow,
        sin = Math.sin,
        BACK_CONST = 1.70158,

        Easing = {

            swing:function(t) {
                return ( -Math.cos(t * PI) / 2 ) + 0.5;
            },

            /**
             * Uniform speed between points.
             */
            easeNone: function (t) {
                return t;
            },

            /**
             * Begins slowly and accelerates towards end. (quadratic)
             */
            easeIn: function (t) {
                return t * t;
            },

            /**
             * Begins quickly and decelerates towards end.  (quadratic)
             */
            easeOut: function (t) {
                return ( 2 - t) * t;
            },

            /**
             * Begins slowly and decelerates towards end. (quadratic)
             */
            easeBoth: function (t) {
                return (t *= 2) < 1 ?
                    .5 * t * t :
                    .5 * (1 - (--t) * (t - 2));
            },

            /**
             * Begins slowly and accelerates towards end. (quartic)
             */
            easeInStrong: function (t) {
                return t * t * t * t;
            },

            /**
             * Begins quickly and decelerates towards end.  (quartic)
             */
            easeOutStrong: function (t) {
                return 1 - (--t) * t * t * t;
            },

            /**
             * Begins slowly and decelerates towards end. (quartic)
             */
            easeBothStrong: function (t) {
                return (t *= 2) < 1 ?
                    .5 * t * t * t * t :
                    .5 * (2 - (t -= 2) * t * t * t);
            },

            /**
             * Snap in elastic effect.
             */

            elasticIn: function (t) {
                var p = .3, s = p / 4;
                if (t === 0 || t === 1) return t;
                return -(pow(2, 10 * (t -= 1)) * sin((t - s) * (2 * PI) / p));
            },

            /**
             * Snap out elastic effect.
             */
            elasticOut: function (t) {
                var p = .3, s = p / 4;
                if (t === 0 || t === 1) return t;
                return pow(2, -10 * t) * sin((t - s) * (2 * PI) / p) + 1;
            },

            /**
             * Snap both elastic effect.
             */
            elasticBoth: function (t) {
                var p = .45, s = p / 4;
                if (t === 0 || (t *= 2) === 2) return t;

                if (t < 1) {
                    return -.5 * (pow(2, 10 * (t -= 1)) *
                        sin((t - s) * (2 * PI) / p));
                }
                return pow(2, -10 * (t -= 1)) *
                    sin((t - s) * (2 * PI) / p) * .5 + 1;
            },

            /**
             * Backtracks slightly, then reverses direction and moves to end.
             */
            backIn: function (t) {
                if (t === 1) t -= .001;
                return t * t * ((BACK_CONST + 1) * t - BACK_CONST);
            },

            /**
             * Overshoots end, then reverses and comes back to end.
             */
            backOut: function (t) {
                return (t -= 1) * t * ((BACK_CONST + 1) * t + BACK_CONST) + 1;
            },

            /**
             * Backtracks slightly, then reverses direction, overshoots end,
             * then reverses and comes back to end.
             */
            backBoth: function (t) {
                if ((t *= 2 ) < 1) {
                    return .5 * (t * t * (((BACK_CONST *= (1.525)) + 1) * t - BACK_CONST));
                }
                return .5 * ((t -= 2) * t * (((BACK_CONST *= (1.525)) + 1) * t + BACK_CONST) + 2);
            },

            /**
             * Bounce off of start.
             */
            bounceIn: function (t) {
                return 1 - Easing.bounceOut(1 - t);
            },

            /**
             * Bounces off end.
             */
            bounceOut: function (t) {
                var s = 7.5625, r;

                if (t < (1 / 2.75)) {
                    r = s * t * t;
                }
                else if (t < (2 / 2.75)) {
                    r = s * (t -= (1.5 / 2.75)) * t + .75;
                }
                else if (t < (2.5 / 2.75)) {
                    r = s * (t -= (2.25 / 2.75)) * t + .9375;
                }
                else {
                    r = s * (t -= (2.625 / 2.75)) * t + .984375;
                }

                return r;
            },

            /**
             * Bounces off start and end.
             */
            bounceBoth: function (t) {
                if (t < .5) {
                    return Easing.bounceIn(t * 2) * .5;
                }
                return Easing.bounceOut(t * 2 - 1) * .5 + .5;
            }
        };

    Easing.NativeTimeFunction = {
        easeNone: 'linear',
        ease: 'ease',

        easeIn: 'ease-in',
        easeOut: 'ease-out',
        easeBoth: 'ease-in-out',

        // Ref:
        //  1. http://www.w3.org/TR/css3-transitions/#transition-timing-function_tag
        //  2. http://www.robertpenner.com/easing/easing_demo.html
        //  3. assets/cubic-bezier-timing-function.html
        // 注：是模拟值，非精确推导值
        easeInStrong: 'cubic-bezier(0.9, 0.0, 0.9, 0.5)',
        easeOutStrong: 'cubic-bezier(0.1, 0.5, 0.1, 1.0)',
        easeBothStrong: 'cubic-bezier(0.9, 0.0, 0.1, 1.0)'
    };

    return Easing;
});

/**
 * TODO:
 *  - test-easing.html 详细的测试 + 曲线可视化
 *
 * NOTES:
 *  - 综合比较 jQuery UI/scripty2/YUI 的 easing 命名，还是觉得 YUI 的对用户
 *    最友好。因此这次完全照搬 YUI 的 Easing, 只是代码上做了点压缩优化。
 *
 */
/**
 * animate on single property
 * @author yiminghe@gmail.com
 */
KISSY.add("anim/fx", function(S, DOM, undefined) {

    /**
     * basic animation about single css property or element attribute
     * @param cfg
     */
    function Fx(cfg) {
        this.load(cfg);
    }

    S.augment(Fx, {

        load:function(cfg) {
            var self = this;
            S.mix(self, cfg);
            self.startTime = S.now();
            self.pos = 0;
            self.unit = self.unit || "";
        },

        frame:function(end) {
            var self = this,
                endFlag = 0,
                elapsedTime,
                t = S.now();
            if (end || t >= self.duration + self.startTime) {
                self.pos = 1;
                endFlag = 1;
            } else {
                elapsedTime = t - self.startTime;
                self.pos = self.easing(elapsedTime / self.duration);
            }
            self.update();
            return endFlag;
        },

        /**
         * 数值插值函数
         * @param {Number} from 源值
         * @param {Number} to 目的值
         * @param {Number} pos 当前位置，从 easing 得到 0~1
         * @return {Number} 当前值
         */
        interpolate:function (from, to, pos) {
            // 默认只对数字进行 easing
            if (S.isNumber(from) &&
                S.isNumber(to)) {
                return (from + (to - from) * pos).toFixed(3);
            } else {
                return undefined;
            }
        },

        update:function() {
            var self = this,
                prop = self.prop,
                elem = self.elem,
                from = self.from,
                to = self.to,
                val = self.interpolate(from, to, self.pos);

            if (val === undefined) {
                // 插值出错，直接设置为最终值
                if (!self.finished) {
                    self.finished = 1;
                    DOM.css(elem, prop, to);
                    S.log(self.prop + " update directly ! : " + val + " : " + from + " : " + to);
                }
            } else {
                val += self.unit;
                if (isAttr(elem, prop)) {
                    DOM.attr(elem, prop, val, 1);
                } else {
                    DOM.css(elem, prop, val);
                }
            }
        },

        /**
         * current value
         */
        cur:function() {
            var self = this,
                prop = self.prop,
                elem = self.elem;
            if (isAttr(elem, prop)) {
                return DOM.attr(elem, prop, undefined, 1);
            }
            var parsed,
                r = DOM.css(elem, prop);
            // Empty strings, null, undefined and "auto" are converted to 0,
            // complex values such as "rotate(1rad)" are returned as is,
            // simple values such as "10px" are parsed to Float.
            return isNaN(parsed = parseFloat(r)) ?
                !r || r === "auto" ? 0 : r
                : parsed;
        }
    });

    function isAttr(elem, prop) {
        // support scrollTop/Left now!
        if ((!elem.style || elem.style[ prop ] == null) &&
            DOM.attr(elem, prop, undefined, 1) != null) {
            return 1;
        }
        return 0;
    }

    Fx.Factories = {};

    Fx.getFx = function(cfg) {
        var Constructor = Fx.Factories[cfg.prop] || Fx;
        return new Constructor(cfg);
    };

    return Fx;

}, {
    requires:['dom']
});
/**
 * TODO
 * 支持 transform ,ie 使用 matrix
 *  - http://shawphy.com/2011/01/transformation-matrix-in-front-end.html
 *  - http://www.cnblogs.com/winter-cn/archive/2010/12/29/1919266.html
 *  - 标准：http://www.zenelements.com/blog/css3-transform/
 *  - ie: http://www.useragentman.com/IETransformsTranslator/
 *  - wiki: http://en.wikipedia.org/wiki/Transformation_matrix
 *  - jq 插件: http://plugins.jquery.com/project/2d-transform
 **//**
 * single timer for the whole anim module
 * @author  yiminghe@gmail.com
 */
KISSY.add("anim/manager", function(S) {
    var stamp = S.stamp;

    return {
        interval:15,
        runnings:{},
        timer:null,
        start:function(anim) {
            var self = this,
                kv = stamp(anim);
            if (self.runnings[kv]) {
                return;
            }
            self.runnings[kv] = anim;
            self.startTimer();
        },
        stop:function(anim) {
            this.notRun(anim);
        },
        notRun:function(anim) {
            var self = this,
                kv = stamp(anim);
            delete self.runnings[kv];
            if (S.isEmptyObject(self.runnings)) {
                self.stopTimer();
            }
        },
        pause:function(anim) {
            this.notRun(anim);
        },
        resume:function(anim) {
            this.start(anim);
        },
        startTimer:function() {
            var self = this;
            if (!self.timer) {
                self.timer = setTimeout(function() {
                    if (!self.runFrames()) {
                        self.timer = 0;
                        self.startTimer();
                    } else {
                        self.stopTimer();
                    }
                }, self.interval);
            }
        },
        stopTimer:function() {
            var self = this,
                t = self.timer;
            if (t) {
                clearTimeout(t);
                self.timer = 0;
            }
        },
        runFrames:function() {
            var self = this,
                done = 1,
                runnings = self.runnings;
            for (var r in runnings) {
                if (runnings.hasOwnProperty(r)) {
                    done = 0;
                    runnings[r]._frame();
                }
            }
            return done;
        }
    };
});KISSY.add("anim", function(S, Anim,Easing) {
    Anim.Easing=Easing;
    return Anim;
}, {
    requires:["anim/base","anim/easing","anim/color"]
});
