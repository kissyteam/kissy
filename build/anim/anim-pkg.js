/*
Copyright 2010, KISSY UI Library v1.1.5
MIT Licensed
build time: Sep 19 17:41
*/
/**
 * @module anim-easing
 */
KISSY.add('anim-easing', function(S) {

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

    var M = Math, PI = M.PI,
        pow = M.pow, sin = M.sin,
        BACK_CONST = 1.70158,

        Easing = {

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
                    r =  s * (t -= (1.5 / 2.75)) * t + .75;
                }
                else if (t < (2.5 / 2.75)) {
                    r =  s * (t -= (2.25 / 2.75)) * t + .9375;
                }
                else {
                    r =  s * (t -= (2.625 / 2.75)) * t + .984375;
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

    S.Easing = Easing;
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
 * @module   anim
 * @author   lifesinger@gmail.com
 */
KISSY.add('anim', function(S, undefined) {

    var DOM = S.DOM, Easing = S.Easing,
        PARSE_FLOAT = parseFloat,
        parseEl = DOM.create('<div>'),
        PROPS = ('backgroundColor borderBottomColor borderBottomWidth borderBottomStyle borderLeftColor borderLeftWidth borderLeftStyle ' +
            'borderRightColor borderRightWidth borderRightStyle borderSpacing borderTopColor borderTopWidth borderTopStyle bottom color ' +
            'font fontFamily fontSize fontWeight height left letterSpacing lineHeight marginBottom marginLeft marginRight marginTop maxHeight ' +
            'maxWidth minHeight minWidth opacity outlineColor outlineOffset outlineWidth paddingBottom paddingLeft ' +
            'paddingRight paddingTop right textIndent top width wordSpacing zIndex').split(' '),

        STEP_INTERVAL = 13,
        OPACITY = 'opacity',
        EVENT_START = 'start',
        EVENT_STEP = 'step',
        EVENT_COMPLETE = 'complete',

        defaultConfig = {
            duration: 1,
            easing: Easing.easeNone
            //queue: true
        };

    /**
     * Anim Class
     * @constructor
     */
    function Anim(elem, props, duration, easing, callback) {
        // ignore non-exist element
        if (!(elem = S.get(elem))) return;

        // factory or constructor
        if (!(this instanceof Anim)) {
            return new Anim(elem, props, duration, easing, callback);
        }

        var self = this,
            isConfig = S.isPlainObject(duration),
            style = props, config;

        /**
         * the related dom element
         */
        self.domEl = elem;

        /**
         * the transition properties
         * 可以是 "width: 200px; color: #ccc" 字符串形式
         * 也可以是 { width: '200px', color: '#ccc' } 对象形式
         */
        if (S.isPlainObject(style)) {
            style = S.param(style, ';').replace(/=/g, ':');
        }
        self.props = normalize(style);
        self.targetStyle = style;
        // normalize 后：
        // props = {
        //          width: { v: 200, unit: 'px', f: interpolate }
        //          color: { v: '#ccc', unit: '', f: color }
        //         }

        /**
         * animation config
         */
        if (isConfig) {
            config = S.merge(defaultConfig, duration);
        } else {
            config = S.clone(defaultConfig);
            duration && (config.duration = PARSE_FLOAT(duration, 10) || 1);
            S.isString(easing) && (easing = Easing[easing]); // 可以是字符串, 比如 'easingOut'
            S.isFunction(easing) && (config.easing = easing);
            S.isFunction(callback) && (config.complete = callback);
        }
        self.config = config;

        /**
         * timer
         */
        //self.timer = undefined;

        // register callback
        if (S.isFunction(callback)) {
            self.on(EVENT_COMPLETE, callback);
        }
    }

    S.augment(Anim, S.EventTarget, {

        run: function() {
            var self = this, config = self.config,
                elem = self.domEl,
                duration = config.duration * 1000,
                easing = config.easing,
                start = S.now(), finish = start + duration,
                target = self.props,
                source = {}, prop, go;

            for (prop in target) source[prop] = parse(DOM.css(elem, prop));
            if(self.fire(EVENT_START) === false) return;

            self.stop(); // 先停止掉正在运行的动画

            self.timer = S.later((go = function () {
                var time = S.now(),
                    t = time > finish ? 1 : (time - start) / duration,
                    sp, tp, b;

                for (prop in target) {
                    sp = source[prop];
                    tp = target[prop];

                    // 比如 sp = { v: 0, u: 'pt'} ( width: 0 时，默认单位是 pt )
                    // 这时要把 sp 的单位调整为和 tp 的一致
                    if(tp.v == 0) tp.u = sp.u;

                    // 单位不一样时，以 tp.u 的为主，同时 sp 从 0 开始
                    // 比如：ie 下 border-width 默认为 medium
                    if(sp.u !== tp.u) sp.v = 0;

                    // go
                    DOM.css(elem, prop, tp.f(sp.v, tp.v, easing(t)) + tp.u);
                }

                if ((self.fire(EVENT_STEP) === false) || (b = time > finish)) {
                    self.stop();
                    // complete 事件只在动画到达最后一帧时才触发
                    if(b) self.fire(EVENT_COMPLETE);
                }
            }), STEP_INTERVAL, true);

            // 立刻执行
            go();

            return self;
        },

        stop: function(finish) {
            var self = this, elem = self.domEl,
                style = self.targetStyle;

            // 停止定时器
            if (self.timer) {
                self.timer.cancel();
                self.timer = undefined;
            }

            // 直接设置到最终样式
            if(finish) {
                if(S.UA.ie && style.indexOf(OPACITY) > -1) {
                    DOM.css(elem, OPACITY, self.props[OPACITY].v);
                }
                elem.style.cssText += ';' + style;
                self.fire(EVENT_COMPLETE);
            }

            return self;
        }
    });

    S.Anim = Anim;

    function normalize(style) {
        var css, rules = { }, i = PROPS.length, v;
        parseEl.innerHTML = '<div style="' + style + '"></div>';
        css = parseEl.firstChild.style;
        while (i--) if ((v = css[PROPS[i]])) rules[PROPS[i]] = parse(v);
        return rules;
    }

    function parse(val) {
        var num = PARSE_FLOAT(val), unit = (val + '').replace(/^[-\d\.]+/, '');
        return isNaN(num) ? { v: unit, u: '', f: colorEtc } : { v: num, u: unit, f: interpolate };
    }

    function interpolate(source, target, pos) {
        return (source + (target - source) * pos).toFixed(3);
    }

    function colorEtc(source, target, pos) {
        var i = 2, j, c, tmp, v = [], r = [];

        while (j = 3, c = arguments[i - 1], i--) {
            if (s(c, 0, 4) === 'rgb(') {
                c = c.match(/\d+/g);
                while (j--) v.push(~~c[j]);
            }
            else if(s(c, 0) === '#') {
                if (c.length === 4) c = '#' + s(c, 1) + s(c, 1) + s(c, 2) + s(c, 2) + s(c, 3) + s(c, 3);
                while (j--) v.push(parseInt(s(c, 1 + j * 2, 2), 16));
            }
            else { // red, black 等值，以及其它一切非颜色值，直接返回 target
                return target;
            }
        }

        while (j--) {
            tmp = ~~(v[j + 3] + (v[j] - v[j + 3]) * pos);
            r.push(tmp < 0 ? 0 : tmp > 255 ? 255 : tmp);
        }

        return 'rgb(' + r.join(',') + ')';
    }

    function s(str, p, c) {
        return str.substr(p, c || 1);
    }
});

/**
 * TODO:
 *  - 实现 jQuery Effects 的 queue / specialEasing / += / toogle,show,hide 等特性
 *  - 还有些情况就是动画不一定改变 CSS, 有可能是 scroll-left 等
 *
 * NOTES:
 *  - 与 emile 相比，增加了 borderStyle, 使得 border: 5px solid #ccc 能从无到有，正确显示
 *  - api 借鉴了 YUI, jQuery 以及 http://www.w3.org/TR/css3-transitions/
 *  - 代码实现了借鉴了 Emile.js: http://github.com/madrobby/emile
 */
/**
 * @module  anim-node-plugin
 * @author  lifesinger@gmail.com, qiaohua@taobao.com
 */
KISSY.add('anim-node-plugin', function(S, undefined) {

    var DOM = S.DOM, Anim = S.Anim,
        NP = S.Node.prototype, NLP = S.NodeList.prototype,

        DISPLAY = 'display', NONE = 'none',
        OVERFLOW = 'overflow', HIDDEN = 'hidden',
        OPCACITY = 'opacity',
        HEIGHT = 'height', WIDTH = 'width', AUTO = 'auto',

        FX = {
            show: [OVERFLOW, OPCACITY, HEIGHT, WIDTH],
            fade: [OPCACITY],
            slide: [OVERFLOW, HEIGHT]
        };

    S.each([NP, NLP], function(P) {
        P.animate = function() {
            var args = S.makeArray(arguments);

            S.each(this, function(elem) {
                Anim.apply(undefined, [elem].concat(args)).run();
            });
            return this;
        };

        S.each({
            show: ['show', 1],
            hide: ['hide', 0],
            toggle: ['toggle'],
            fadeIn: ['fade', 1],
            fadeOut: ['fade', 0],
            slideDown: ['slide', 1],
            slideUp: ['slide', 0]
        },
            function(v, k) {

                P[k] = function(speed, callback) {
                    // 没有参数时，调用 DOM 中的对应方法
                    if (DOM[k] && arguments.length === 0) {
                        DOM[k](this);
                    }
                    else {
                        S.each(this, function(elem) {
                            fx(elem, v[0], speed, callback, v[1]);
                        });
                    }
                    return this;
                };
            });
    });

    function fx(elem, which, speed, callback, display) {
        if (which === 'toggle') {
            display = DOM.css(elem, DISPLAY) === NONE ? 1 : 0;
            which = display ? 'show' : 'hide';
        }

        if (display) DOM.css(elem, DISPLAY, DOM.data(elem, DISPLAY) || '');

        // 根据不同类型设置初始 css 属性, 并设置动画参数
        var style = { };
        S.each(FX[which], function(prop) {
            if (prop === OVERFLOW) {
                DOM.css(elem, OVERFLOW, HIDDEN);
            }
            else if (prop === OPCACITY) {
                style.opacity = display ? 1 : 0;
                if (display) DOM.css(elem, OPCACITY, 0);
            }
            else if (prop === HEIGHT) {
                style.height = (display ? DOM.css(elem, HEIGHT) || elem.naturalHeight : 0);
                if (display) DOM.css(elem, HEIGHT, 0);
            }
            else if (prop === WIDTH) {
                style.width = (display ? DOM.css(elem, WIDTH) || elem.naturalWidth : 0);
                if (display) DOM.css(elem, WIDTH, 0);
            }
        });

        // 开始动画
        new S.Anim(elem, style, speed, 'easeOut', function() {
            // 如果是隐藏, 需要还原一些 css 属性
            if (!display) {
                // 保留原有值
                var style = elem.style, oldVal = style[DISPLAY];
                if (oldVal !== NONE) {
                    if (oldVal) {
                        DOM.data(elem, DISPLAY, oldVal);
                    }
                    style[DISPLAY] = NONE;
                }

                // 还原部分样式
                DOM.css(elem, {
                    height: AUTO,
                    width: AUTO,
                    overflow: AUTO,
                    opacity: 1
                });
            }
            if (callback && S.isFunction(callback)) callback();
        }).run();
    }

});
