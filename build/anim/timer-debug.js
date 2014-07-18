/*
Copyright 2014, KISSY v5.0.0
MIT Licensed
build time: Jul 18 13:52
*/
/*
combined modules:
anim/timer
anim/timer/easing
anim/timer/manager
anim/timer/fx
anim/timer/color
anim/timer/transform
anim/timer/short-hand
*/
KISSY.add('anim/timer', [
    'dom',
    'util',
    './base',
    './timer/easing',
    './timer/manager',
    './timer/fx',
    './timer/color',
    './timer/transform',
    './timer/short-hand'
], function (S, require, exports, module) {
    /**
 * animation using js timer
 * @author yiminghe@gmail.com
 * @ignore
 */
    var Dom = require('dom');
    var util = require('util');
    var AnimBase = require('./base');
    var Easing = require('./timer/easing');
    var AM = require('./timer/manager');
    var Fx = require('./timer/fx');
    require('./timer/color');
    require('./timer/transform');
    var SHORT_HANDS = require('./timer/short-hand');
    var NUMBER_REG = /^([+\-]=)?([\d+.\-]+)([a-z%]*)$/i;
    function TimerAnim(node, to, duration, easing, complete) {
        var self = this;
        if (!(self instanceof TimerAnim)) {
            return new TimerAnim(node, to, duration, easing, complete);
        }
        TimerAnim.superclass.constructor.apply(self, arguments);
    }
    util.extend(TimerAnim, AnimBase, {
        prepareFx: function () {
            var self = this, node = self.node, _propsData = self._propsData;
            util.each(_propsData, function (_propData) {
                // ms
                _propData.duration *= 1000;
                _propData.delay *= 1000;
                if (typeof _propData.easing === 'string') {
                    _propData.easing = Easing.toFn(_propData.easing);
                }
            });    // 扩展分属性
            // 扩展分属性
            util.each(SHORT_HANDS, function (shortHands, p) {
                var origin, _propData = _propsData[p], val;
                if (_propData) {
                    val = _propData.value;
                    origin = {};
                    util.each(shortHands, function (sh) {
                        // 得到原始分属性之前值
                        origin[sh] = Dom.css(node, sh);
                    });
                    Dom.css(node, p, val);
                    util.each(origin, function (val, sh) {
                        // 如果分属性没有显式设置过，得到期待的分属性最后值
                        if (!(sh in _propsData)) {
                            _propsData[sh] = util.merge(_propData, { value: Dom.css(node, sh) });
                        }    // 还原
                        // 还原
                        Dom.css(node, sh, val);
                    });    // 删除复合属性
                    // 删除复合属性
                    delete _propsData[p];
                }
            });
            var prop, _propData, val, to, from, propCfg, fx, isCustomFx = 0, unit, parts;
            if (util.isPlainObject(node)) {
                isCustomFx = 1;
            }    // 取得单位，并对单个属性构建 Fx 对象
            // 取得单位，并对单个属性构建 Fx 对象
            for (prop in _propsData) {
                _propData = _propsData[prop];
                val = _propData.value;
                propCfg = {
                    isCustomFx: isCustomFx,
                    prop: prop,
                    anim: self,
                    fxType: _propData.fxType,
                    type: _propData.type,
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
                    unit = parts[3];    // unit is not px
                    // unit is not px
                    if (unit && unit !== 'px' && from) {
                        var tmpCur = 0, to2 = to;
                        do {
                            ++to2;
                            Dom.css(node, prop, to2 + unit);    // in case tmpCur==0
                            // in case tmpCur==0
                            tmpCur = fx.cur();
                        } while (tmpCur === 0);
                        from = to2 / tmpCur * from;
                        Dom.css(node, prop, from + unit);
                    }    // 相对
                    // 相对
                    if (parts[1]) {
                        to = (parts[1] === '-=' ? -1 : 1) * to + from;
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
            var self = this, prop, end = 1, fx, _propData, _propsData = self._propsData;
            for (prop in _propsData) {
                _propData = _propsData[prop];
                fx = _propData.fx;
                fx.frame();    // in case call stop in frame
                // in case call stop in frame
                if (self.isRejected() || self.isResolved()) {
                    return;
                }
                end &= fx.pos === 1;
            }
            var currentTime = util.now(), duration = self.config.duration * 1000, remaining = Math.max(0, self.startTime + duration - currentTime), temp = remaining / duration || 0, percent = 1 - temp;
            self.defer.notify([
                self,
                percent,
                remaining
            ]);
            if (end) {
                // complete 事件只在动画到达最后一帧时才触发
                self.stop(end);
            }
        },
        doStop: function (finish) {
            var self = this, prop, fx, _propData, _propsData = self._propsData;
            AM.stop(self);
            if (finish) {
                for (prop in _propsData) {
                    _propData = _propsData[prop];
                    fx = _propData.fx;    // fadeIn() -> call stop
                    // fadeIn() -> call stop
                    if (fx) {
                        fx.frame(1);
                    }
                }
            }
        },
        doStart: function () {
            AM.start(this);
        }
    });    // can used to judge whether it's a timer based anim
    // can used to judge whether it's a timer based anim
    TimerAnim.Easing = Easing;    // for test
    // for test
    TimerAnim.Fx = Fx;
    util.mix(TimerAnim, AnimBase.Statics);    // bad
    // bad
    module.exports = TimerAnim;    /*
 2013-09
 - support custom anim object

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
});



KISSY.add('anim/timer/easing', [], function (S, require, exports, module) {
    /**
 * @ignore
 * Easing equation from yui3 and css3
 * @author yiminghe@gmail.com, lifesinger@gmail.com
 */
    // Based on Easing Equations (c) 2003 Robert Penner, all rights reserved.
    // This work is subject to the terms in http://www.robertpenner.com/easing_terms_of_use.html
    // Preview: http://www.robertpenner.com/Easing/easing_demo.html
    // 和 YUI 的 Easing 相比，Easing 进行了归一化处理，参数调整为：
    // @param {Number} t Time value used to compute current value  保留 0 =< t <= 1
    // @param {Number} b Starting value  b = 0
    // @param {Number} c Delta between start and end values  c = 1
    // @param {Number} d Total length of animation d = 1
    var PI = Math.PI, pow = Math.pow, sin = Math.sin, parseNumber = parseFloat, CUBIC_BEZIER_REG = /^cubic-bezier\(([^,]+),([^,]+),([^,]+),([^,]+)\)$/i, BACK_CONST = 1.70158;
    function easeNone(t) {
        return t;
    }    /**
 * Provides methods for customizing how an animation behaves during each run.
 * @class KISSY.Anim.Easing
 * @singleton
 */
    /**
 * Provides methods for customizing how an animation behaves during each run.
 * @class KISSY.Anim.Easing
 * @singleton
 */
    var Easing = {
            /**
     * swing effect.
     */
            swing: function (t) {
                return 0.5 - Math.cos(t * PI) / 2;
            },
            /**
     * Uniform speed between points.
     */
            easeNone: easeNone,
            linear: easeNone,
            /**
     * Begins slowly and accelerates towards end. (quadratic)
     */
            easeIn: function (t) {
                return t * t;
            },
            ease: cubicBezierFunction(0.25, 0.1, 0.25, 1),
            'ease-in': cubicBezierFunction(0.42, 0, 1, 1),
            'ease-out': cubicBezierFunction(0, 0, 0.58, 1),
            'ease-in-out': cubicBezierFunction(0.42, 0, 0.58, 1),
            'ease-out-in': cubicBezierFunction(0, 0.42, 1, 0.58),
            toFn: function (easingStr) {
                var m;
                if (m = easingStr.match(CUBIC_BEZIER_REG)) {
                    return cubicBezierFunction(parseNumber(m[1]), parseNumber(m[2]), parseNumber(m[3]), parseNumber(m[4]));
                }
                return Easing[easingStr] || easeNone;
            },
            /**
     * Begins quickly and decelerates towards end.  (quadratic)
     */
            easeOut: function (t) {
                return (2 - t) * t;
            },
            /**
     * Begins slowly and decelerates towards end. (quadratic)
     */
            easeBoth: function (t) {
                return (t *= 2) < 1 ? 0.5 * t * t : 0.5 * (1 - --t * (t - 2));
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
                return 1 - --t * t * t * t;
            },
            /**
     * Begins slowly and decelerates towards end. (quartic)
     */
            easeBothStrong: function (t) {
                return (t *= 2) < 1 ? 0.5 * t * t * t * t : 0.5 * (2 - (t -= 2) * t * t * t);
            },
            /**
     * Snap in elastic effect.
     */
            elasticIn: function (t) {
                var p = 0.3, s = p / 4;
                if (t === 0 || t === 1) {
                    return t;
                }
                return 0 - pow(2, 10 * (t -= 1)) * sin((t - s) * (2 * PI) / p);
            },
            /**
     * Snap out elastic effect.
     */
            elasticOut: function (t) {
                var p = 0.3, s = p / 4;
                if (t === 0 || t === 1) {
                    return t;
                }
                return pow(2, -10 * t) * sin((t - s) * (2 * PI) / p) + 1;
            },
            /**
     * Snap both elastic effect.
     */
            elasticBoth: function (t) {
                var p = 0.45, s = p / 4;
                if (t === 0 || (t *= 2) === 2) {
                    return t;
                }
                if (t < 1) {
                    return -0.5 * (pow(2, 10 * (t -= 1)) * sin((t - s) * (2 * PI) / p));
                }
                return pow(2, -10 * (t -= 1)) * sin((t - s) * (2 * PI) / p) * 0.5 + 1;
            },
            /**
     * Backtracks slightly, then reverses direction and moves to end.
     */
            backIn: function (t) {
                if (t === 1) {
                    t -= 0.001;
                }
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
                var s = BACK_CONST;
                var m = (s *= 1.525) + 1;
                if ((t *= 2) < 1) {
                    return 0.5 * (t * t * (m * t - s));
                }
                return 0.5 * ((t -= 2) * t * (m * t + s) + 2);
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
                if (t < 1 / 2.75) {
                    r = s * t * t;
                } else if (t < 2 / 2.75) {
                    r = s * (t -= 1.5 / 2.75) * t + 0.75;
                } else if (t < 2.5 / 2.75) {
                    r = s * (t -= 2.25 / 2.75) * t + 0.9375;
                } else {
                    r = s * (t -= 2.625 / 2.75) * t + 0.984375;
                }
                return r;
            },
            /**
     * Bounces off start and end.
     */
            bounceBoth: function (t) {
                if (t < 0.5) {
                    return Easing.bounceIn(t * 2) * 0.5;
                }
                return Easing.bounceOut(t * 2 - 1) * 0.5 + 0.5;
            }
        };    // The epsilon value we pass to UnitBezier::solve given that the animation is going to run over |dur| seconds.
              // The longer the animation,
              // the more precision we need in the timing function result to avoid ugly discontinuities.
              // ignore for KISSY easing
    // The epsilon value we pass to UnitBezier::solve given that the animation is going to run over |dur| seconds.
    // The longer the animation,
    // the more precision we need in the timing function result to avoid ugly discontinuities.
    // ignore for KISSY easing
    var ZERO_LIMIT = 0.000001, abs = Math.abs;    // x = (3*p1x-3*p2x+1)*t^3 + (3*p2x-6*p1x)*t^2 + 3*p1x*t
                                                  // http://en.wikipedia.org/wiki/B%C3%A9zier_curve
                                                  // https://trac.webkit.org/browser/trunk/Source/WebCore/platform/graphics/UnitBezier.h
                                                  // http://svn.webkit.org/repository/webkit/trunk/Source/WebCore/page/animation/AnimationBase.cpp
    // x = (3*p1x-3*p2x+1)*t^3 + (3*p2x-6*p1x)*t^2 + 3*p1x*t
    // http://en.wikipedia.org/wiki/B%C3%A9zier_curve
    // https://trac.webkit.org/browser/trunk/Source/WebCore/platform/graphics/UnitBezier.h
    // http://svn.webkit.org/repository/webkit/trunk/Source/WebCore/page/animation/AnimationBase.cpp
    function cubicBezierFunction(p1x, p1y, p2x, p2y) {
        // Calculate the polynomial coefficients,
        // implicit first and last control points are (0,0) and (1,1).
        var ax = 3 * p1x - 3 * p2x + 1, bx = 3 * p2x - 6 * p1x, cx = 3 * p1x;
        var ay = 3 * p1y - 3 * p2y + 1, by = 3 * p2y - 6 * p1y, cy = 3 * p1y;
        function sampleCurveDerivativeX(t) {
            // `ax t^3 + bx t^2 + cx t' expanded using Horner 's rule.
            return (3 * ax * t + 2 * bx) * t + cx;
        }
        function sampleCurveX(t) {
            return ((ax * t + bx) * t + cx) * t;
        }
        function sampleCurveY(t) {
            return ((ay * t + by) * t + cy) * t;
        }    // Given an x value, find a parametric value it came from.
        // Given an x value, find a parametric value it came from.
        function solveCurveX(x) {
            var t2 = x, derivative, x2;    // https://trac.webkit.org/browser/trunk/Source/WebCore/platform/animation
                                           // First try a few iterations of Newton's method -- normally very fast.
                                           // http://en.wikipedia.org/wiki/Newton's_method
            // https://trac.webkit.org/browser/trunk/Source/WebCore/platform/animation
            // First try a few iterations of Newton's method -- normally very fast.
            // http://en.wikipedia.org/wiki/Newton's_method
            for (var i = 0; i < 8; i++) {
                // f(t)-x=0
                x2 = sampleCurveX(t2) - x;
                if (abs(x2) < ZERO_LIMIT) {
                    return t2;
                }
                derivative = sampleCurveDerivativeX(t2);    // == 0, failure
                // == 0, failure
                if (abs(derivative) < ZERO_LIMIT) {
                    break;
                }
                t2 -= x2 / derivative;
            }    // Fall back to the bisection method for reliability.
                 // bisection
                 // http://en.wikipedia.org/wiki/Bisection_method
            // Fall back to the bisection method for reliability.
            // bisection
            // http://en.wikipedia.org/wiki/Bisection_method
            var t1 = 1, t0 = 0;
            t2 = x;
            while (t1 > t0) {
                x2 = sampleCurveX(t2) - x;
                if (abs(x2) < ZERO_LIMIT) {
                    return t2;
                }
                if (x2 > 0) {
                    t1 = t2;
                } else {
                    t0 = t2;
                }
                t2 = (t1 + t0) / 2;
            }    // Failure
            // Failure
            return t2;
        }
        function solve(x) {
            return sampleCurveY(solveCurveX(x));
        }
        return solve;
    }
    module.exports = Easing;    /*
 2014-07-01 yiminghe@gmail.com
 - https://github.com/danro/easing-js/blob/master/easing.js

 2013-01-04 yiminghe@gmail.com
 - js 模拟 cubic-bezier

 2012-06-04 yiminghe@gmail.com
 - easing.html 曲线可视化

 NOTES:
 - 综合比较 jQuery UI/scripty2/YUI 的 Easing 命名，还是觉得 YUI 的对用户
 最友好。因此这次完全照搬 YUI 的 Easing, 只是代码上做了点压缩优化。
 - 和原生对应关系：
 Easing.NativeTimeFunction = {
 easeNone: 'linear',
 ease: 'ease',

 easeIn: 'ease-in',
 easeOut: 'ease-out',
 easeBoth: 'ease-in-out',

 // Ref:
 //  1. http://www.w3.org/TR/css3-transitions/#transition-timing-function_tag
 //  2. http://www.robertpenner.com/Easing/easing_demo.html
 //  3. assets/cubic-bezier-timing-function.html
 // 注：是模拟值，非精确推导值
 easeInStrong: 'cubic-bezier(0.9, 0.0, 0.9, 0.5)',
 easeOutStrong: 'cubic-bezier(0.1, 0.5, 0.1, 1.0)',
 easeBothStrong: 'cubic-bezier(0.9, 0.0, 0.1, 1.0)'
 };
 */
});
KISSY.add('anim/timer/manager', [], function (S, require, exports, module) {
    /**
 * @ignore
 * single timer for the whole anim module
 * @author yiminghe@gmail.com
 */
    var win = window,
        // note in background tab, interval is set to 1s in chrome/firefox
        // no interval change in ie for 15, if interval is less than 15
        // then in background tab interval is changed to 15
        INTERVAL = 15,
        // https://gist.github.com/paulirish/1579671
        requestAnimationFrameFn, cancelAnimationFrameFn;    // http://bugs.jquery.com/ticket/9381
    // http://bugs.jquery.com/ticket/9381
    if (0) {
        requestAnimationFrameFn = win.requestAnimationFrame;
        cancelAnimationFrameFn = win.cancelAnimationFrame;
        var vendors = [
                'ms',
                'moz',
                'webkit',
                'o'
            ];
        for (var x = 0; x < vendors.length && !requestAnimationFrameFn; ++x) {
            requestAnimationFrameFn = win[vendors[x] + 'RequestAnimationFrame'];
            cancelAnimationFrameFn = win[vendors[x] + 'CancelAnimationFrame'] || win[vendors[x] + 'CancelRequestAnimationFrame'];
        }
    } else {
        requestAnimationFrameFn = function (fn) {
            return setTimeout(fn, INTERVAL);
        };
        cancelAnimationFrameFn = function (timer) {
            clearTimeout(timer);
        };
    }    //function check() {
         //    if (runnings.head === runnings.tail) {
         //        if (runnings.head && (runnings.head._ksNext || runnings.head._ksPrev)) {
         //            debugger
         //        }
         //        return;
         //    }
         //}
    //function check() {
    //    if (runnings.head === runnings.tail) {
    //        if (runnings.head && (runnings.head._ksNext || runnings.head._ksPrev)) {
    //            debugger
    //        }
    //        return;
    //    }
    //}
    var runnings = {
            head: null,
            tail: null
        };
    var manager = module.exports = {
            runnings: runnings,
            timer: null,
            start: function (anim) {
                //check();
                anim._ksNext = anim._ksPrev = null;
                if (!runnings.head) {
                    runnings.head = runnings.tail = anim;
                } else {
                    anim._ksPrev = runnings.tail;
                    runnings.tail._ksNext = anim;
                    runnings.tail = anim;
                }    //check();
                //check();
                manager.startTimer();
            },
            stop: function (anim) {
                this.notRun(anim);
            },
            notRun: function (anim) {
                //check();
                if (anim._ksPrev) {
                    if (runnings.tail === anim) {
                        runnings.tail = anim._ksPrev;
                    }
                    anim._ksPrev._ksNext = anim._ksNext;
                    if (anim._ksNext) {
                        anim._ksNext._ksPrev = anim._ksPrev;
                    }
                } else {
                    runnings.head = anim._ksNext;
                    if (runnings.tail === anim) {
                        runnings.tail = runnings.head;
                    }
                    if (runnings.head) {
                        runnings.head._ksPrev = null;
                    }
                }    //check();
                //check();
                anim._ksNext = anim._ksPrev = null;
                if (!runnings.head) {
                    manager.stopTimer();
                }
            },
            pause: function (anim) {
                this.notRun(anim);
            },
            resume: function (anim) {
                this.start(anim);
            },
            startTimer: function () {
                var self = this;
                if (!self.timer) {
                    self.timer = requestAnimationFrameFn(function run() {
                        self.timer = requestAnimationFrameFn(run);
                        if (self.runFrames()) {
                            self.stopTimer();
                        }
                    });
                }
            },
            stopTimer: function () {
                var self = this, t = self.timer;
                if (t) {
                    cancelAnimationFrameFn(t);
                    self.timer = 0;
                }
            },
            runFrames: function () {
                var anim = runnings.head;    //var num = 0;
                                             //var anims = [];
                //var num = 0;
                //var anims = [];
                while (anim) {
                    //anims.push(anim);
                    var next = anim._ksNext;    // in case anim is stopped
                    // in case anim is stopped
                    anim.frame();
                    anim = next;    //num++;
                }    //        anims.forEach(function (a) {
                     //            a.frame();
                     //        });
                //num++;
                //        anims.forEach(function (a) {
                //            a.frame();
                //        });
                return !runnings.head;
            }
        };    /**
 * @ignore
 *
 * 2014-06-19
 * - try linked list https://github.com/kissyteam/kissy/issues/651
 *
 * !TODO: deal with https://developers.google.com/chrome/whitepapers/pagevisibility
 */
});
KISSY.add('anim/timer/fx', [
    'util',
    'logger-manager',
    'dom'
], function (S, require, exports, module) {
    /**
 * @ignore
 * animate on single property
 * @author yiminghe@gmail.com
 */
    var util = require('util');
    var LoggerManager = require('logger-manager');
    var logger = LoggerManager.getLogger('s/aim/timer/fx');
    var Dom = require('dom');
    var undef;
    var NUMBER_REG = /^([+\-]=)?([\d+.\-]+)([a-z%]*)$/i;
    function load(self, cfg) {
        util.mix(self, cfg);
        self.pos = 0;
        self.unit = self.unit || '';
    }    /**
 * basic animation about single css property or element attribute
 * @class KISSY.Anim.Fx
 * @private
 */
    /**
 * basic animation about single css property or element attribute
 * @class KISSY.Anim.Fx
 * @private
 */
    function Fx(cfg) {
        load(this, cfg);
    }
    Fx.prototype = {
        // default to dom anim
        isCustomFx: 0,
        constructor: Fx,
        /**
     * reset config.
     * @param cfg
     */
        load: function (cfg) {
            load(this, cfg);
        },
        /**
     * process current anim frame.
     * @param pos
     */
        frame: function (pos) {
            if (this.pos === 1) {
                return;
            }
            var self = this, anim = self.anim, prop = self.prop, node = anim.node, from = self.from, propData = self.propData, to = self.to;
            if (pos === undef) {
                pos = getPos(anim, propData);
            }
            self.pos = pos;
            if (from === to || pos === 0) {
                return;
            }
            var val = self.interpolate(from, to, self.pos);
            self.val = val;
            if (propData.frame) {
                propData.frame.call(self, anim, self);
            } else if (!self.isCustomFx) {
                // in case completed in frame
                if (val === undef) {
                    // 插值出错，直接设置为最终值
                    self.pos = 1;
                    val = to;
                    logger.warn(prop + ' update directly ! : ' + val + ' : ' + from + ' : ' + to);
                } else {
                    val += self.unit;
                }
                self.val = val;
                if (self.type === 'attr') {
                    Dom.attr(node, prop, val, 1);
                } else {
                    Dom.css(node, prop, val);
                }
            }
        },
        /**
     * interpolate function
     *
     * @param {Number} from current css value
     * @param {Number} to end css value
     * @param {Number} pos current position from easing 0~1
     * @return {Number} value corresponding to position
     */
        interpolate: function (from, to, pos) {
            // 默认只对数字进行 easing
            if (typeof from === 'number' && typeof to === 'number') {
                return Math.round((from + (to - from) * pos) * 100000) / 100000;
            } else {
                return null;
            }
        },
        /**
     * current value
     *
     */
        cur: function () {
            var self = this, prop = self.prop, type, parsed, r, node = self.anim.node;    //不是 css 或者 attribute 的缓动
            //不是 css 或者 attribute 的缓动
            if (self.isCustomFx) {
                return node[prop] || 0;
            }
            if (!(type = self.type)) {
                type = self.type = (r = isAttr(node, prop)) !== null ? 'attr' : 'css';
            }
            if (type === 'attr') {
                r = r === undefined ? Dom.attr(node, prop, undef, 1) : r;
            } else {
                r = Dom.style(node, prop);
                var parts = r.match(NUMBER_REG);
                if (parts) {
                    var unit = parts[3];    // unit is not px
                    // unit is not px
                    if (unit && unit !== 'px') {
                        r = Dom.css(node, prop);
                    }
                }
            }    // Empty strings, null, undefined and 'auto' are converted to 0,
                 // complex values such as 'rotate(1rad)' or '0px 10px' are returned as is,
                 // simple values such as '10px' are parsed to Float.
            // Empty strings, null, undefined and 'auto' are converted to 0,
            // complex values such as 'rotate(1rad)' or '0px 10px' are returned as is,
            // simple values such as '10px' are parsed to Float.
            return isNaN(parsed = parseFloat(r)) ? !r || r === 'auto' ? 0 : r : parsed;
        }
    };
    function isAttr(node, prop) {
        var value;    // support scrollTop/Left now!
        // support scrollTop/Left now!
        if ((!node.style || node.style[prop] == null) && // undefined
            (value = Dom.attr(node, prop, undef, 1)) != null) {
            return value;
        }
        return null;
    }
    function getPos(anim, propData) {
        var t = util.now(), runTime, startTime = anim.startTime, delay = propData.delay, duration = propData.duration;
        runTime = t - startTime - delay;
        if (runTime <= 0) {
            return 0;
        } else if (runTime >= duration) {
            return 1;
        } else {
            return propData.easing(runTime / duration);
        }
    }
    Fx.Factories = {};
    Fx.FxTypes = {};
    Fx.getFx = function (cfg) {
        var Constructor = Fx, fxType, SubClass;
        if (fxType = cfg.fxType) {
            Constructor = Fx.FxTypes[fxType];
        } else if (!cfg.isCustomFx && (SubClass = Fx.Factories[cfg.prop])) {
            Constructor = SubClass;
        }
        return new Constructor(cfg);
    };
    module.exports = Fx;    /*
 TODO
 支持 transform ,ie 使用 matrix
 - http://shawphy.com/2011/01/transformation-matrix-in-front-end.html
 - http://www.cnblogs.com/winter-cn/archive/2010/12/29/1919266.html
 - 标准：http://www.zenelements.com/blog/css3-transform/
 - ie: http://www.useragentman.com/IETransformsTranslator/
 - wiki: http://en.wikipedia.org/wiki/Transformation_matrix
 - jq 插件: http://plugins.jquery.com/project/2d-transform
 */
});

KISSY.add('anim/timer/color', [
    'logger-manager',
    'util',
    './fx'
], function (S, require, exports, module) {
    /**
 * @ignore
 * special patch for making color gradual change
 * @author yiminghe@gmail.com
 */
    var LoggerManager = require('logger-manager');
    var logger = LoggerManager.getLogger('s/anim/timer/color');
    var util = require('util');
    var Fx = require('./fx');
    var HEX_BASE = 16, floor = Math.floor, KEYWORDS = {
            black: [
                0,
                0,
                0
            ],
            silver: [
                192,
                192,
                192
            ],
            gray: [
                128,
                128,
                128
            ],
            white: [
                255,
                255,
                255
            ],
            maroon: [
                128,
                0,
                0
            ],
            red: [
                255,
                0,
                0
            ],
            purple: [
                128,
                0,
                128
            ],
            fuchsia: [
                255,
                0,
                255
            ],
            green: [
                0,
                128,
                0
            ],
            lime: [
                0,
                255,
                0
            ],
            olive: [
                128,
                128,
                0
            ],
            yellow: [
                255,
                255,
                0
            ],
            navy: [
                0,
                0,
                128
            ],
            blue: [
                0,
                0,
                255
            ],
            teal: [
                0,
                128,
                128
            ],
            aqua: [
                0,
                255,
                255
            ]
        }, RE_RGB = /^rgb\(([0-9]+)\s*,\s*([0-9]+)\s*,\s*([0-9]+)\)$/i, RE_RGBA = /^rgba\(([0-9]+)\s*,\s*([0-9]+)\s*,\s*([0-9]+),\s*([0-9]+)\)$/i, RE_HEX = /^#?([0-9A-F]{1,2})([0-9A-F]{1,2})([0-9A-F]{1,2})$/i, COLORS = [
            'backgroundColor',
            'borderBottomColor',
            'borderLeftColor',
            'borderRightColor',
            'borderTopColor',
            'color',
            'outlineColor'
        ];    //得到颜色的数值表示，红绿蓝数字数组
    //得到颜色的数值表示，红绿蓝数字数组
    function numericColor(val) {
        val = val + '';
        var match;
        if (match = val.match(RE_RGB)) {
            return [
                parseInt(match[1], 10),
                parseInt(match[2], 10),
                parseInt(match[3], 10)
            ];
        } else if (match = val.match(RE_RGBA)) {
            return [
                parseInt(match[1], 10),
                parseInt(match[2], 10),
                parseInt(match[3], 10),
                parseInt(match[4], 10)
            ];
        } else if (match = val.match(RE_HEX)) {
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
        }    //transparent 或者颜色字符串返回
        //transparent 或者颜色字符串返回
        logger.warn('only allow rgb or hex color string : ' + val);
        return [
            255,
            255,
            255
        ];
    }
    function ColorFx() {
        ColorFx.superclass.constructor.apply(this, arguments);
    }
    util.extend(ColorFx, Fx, {
        load: function () {
            var self = this;
            ColorFx.superclass.load.apply(self, arguments);
            if (self.from) {
                self.from = numericColor(self.from);
            }
            if (self.to) {
                self.to = numericColor(self.to);
            }
        },
        interpolate: function (from, to, pos) {
            var interpolate = ColorFx.superclass.interpolate;
            if (from.length === 3 && to.length === 3) {
                return 'rgb(' + [
                    floor(interpolate(from[0], to[0], pos)),
                    floor(interpolate(from[1], to[1], pos)),
                    floor(interpolate(from[2], to[2], pos))
                ].join(', ') + ')';
            } else if (from.length === 4 || to.length === 4) {
                return 'rgba(' + [
                    floor(interpolate(from[0], to[0], pos)),
                    floor(interpolate(from[1], to[1], pos)),
                    floor(interpolate(from[2], to[2], pos)),
                    // 透明度默认 1
                    floor(interpolate(from[3] || 1, to[3] || 1, pos))
                ].join(', ') + ')';
            } else {
                logger.warn('unknown value : ' + from);
                return undefined;
            }
        }
    });
    util.each(COLORS, function (color) {
        Fx.Factories[color] = ColorFx;
    });
    Fx.FxTypes.color = ColorFx;
    module.exports = ColorFx;    /*
 refer
 - https://developer.mozilla.org/en-US/docs/Web/CSS/color_value
 */
});
KISSY.add('anim/timer/transform', [
    'util',
    'feature',
    'dom',
    './fx'
], function (S, require, exports, module) {
    /**
 * @ignore
 * animation for transform property
 * @author yiminghe@gmail.com
 */
    var util = require('util');
    var Feature = require('feature');
    var Dom = require('dom');
    var Fx = require('./fx');
    var translateTpl = Feature.isTransform3dSupported() ? 'translate3d({translateX}px,{translateY}px,0)' : 'translate({translateX}px,{translateY}px)';
    function toMatrixArray(matrix) {
        matrix = matrix.split(/,/);
        matrix = util.map(matrix, function (v) {
            return myParse(v);
        });
        return matrix;
    }    // blog.yiminghe.me/2013/12/03/decomposing-css-2d-transform-matrix-into-simple-transformations
    // blog.yiminghe.me/2013/12/03/decomposing-css-2d-transform-matrix-into-simple-transformations
    function decomposeMatrix(matrix) {
        matrix = toMatrixArray(matrix);
        var scaleX, scaleY, skew, A = matrix[0], B = matrix[1], C = matrix[2], D = matrix[3];    // Make sure matrix is not singular
        // Make sure matrix is not singular
        if (A * D - B * C) {
            scaleX = Math.sqrt(A * A + B * B);
            skew = (A * C + B * D) / (A * D - C * B);
            scaleY = (A * D - B * C) / scaleX;    // step (6)
            // step (6)
            if (A * D < B * C) {
                skew = -skew;
                scaleX = -scaleX;
            }    // matrix is singular and cannot be interpolated
        } else
            // matrix is singular and cannot be interpolated
            {
                // In this case the elem shouldn't be rendered, hence scale == 0
                scaleX = scaleY = skew = 0;
            }    // The recomposition order is very important
                 // see http://hg.mozilla.org/mozilla-central/file/7cb3e9795d04/layout/style/nsStyleAnimation.cpp#l971
        // The recomposition order is very important
        // see http://hg.mozilla.org/mozilla-central/file/7cb3e9795d04/layout/style/nsStyleAnimation.cpp#l971
        return {
            translateX: myParse(matrix[4]),
            translateY: myParse(matrix[5]),
            rotate: myParse(Math.atan2(B, A) * 180 / Math.PI),
            skewX: myParse(Math.atan(skew) * 180 / Math.PI),
            skewY: 0,
            scaleX: myParse(scaleX),
            scaleY: myParse(scaleY)
        };
    }
    function defaultDecompose() {
        return {
            translateX: 0,
            translateY: 0,
            rotate: 0,
            skewX: 0,
            skewY: 0,
            scaleX: 1,
            scaleY: 1
        };
    }
    function myParse(v) {
        return Math.round(parseFloat(v) * 100000) / 100000;
    }
    function getTransformInfo(transform) {
        transform = transform.split(')');
        var trim = util.trim, i = -1, l = transform.length - 1, split, prop, val, ret = defaultDecompose();    // Loop through the transform properties, parse and multiply them
        // Loop through the transform properties, parse and multiply them
        while (++i < l) {
            split = transform[i].split('(');
            prop = trim(split[0]);
            val = split[1];
            switch (prop) {
            case 'translateX':
            case 'translateY':
            case 'scaleX':
            case 'scaleY':
                ret[prop] = myParse(val);
                break;
            case 'rotate':
            case 'skewX':
            case 'skewY':
                var v = myParse(val);
                if (!util.endsWith(val, 'deg')) {
                    v = v * 180 / Math.PI;
                }
                ret[prop] = v;
                break;
            case 'translate':
            case 'translate3d':
                val = val.split(',');
                ret.translateX = myParse(val[0]);
                ret.translateY = myParse(val[1] || 0);
                break;
            case 'scale':
                val = val.split(',');
                ret.scaleX = myParse(val[0]);
                ret.scaleY = myParse(val[1] || val[0]);
                break;
            case 'matrix':
                return decomposeMatrix(val);
            }
        }
        return ret;
    }
    function TransformFx() {
        TransformFx.superclass.constructor.apply(this, arguments);
    }
    util.extend(TransformFx, Fx, {
        load: function () {
            var self = this;
            TransformFx.superclass.load.apply(self, arguments);    // user value has priority over computed value
            // user value has priority over computed value
            self.from = Dom.style(self.anim.node, 'transform') || self.from;
            if (self.from && self.from !== 'none') {
                self.from = getTransformInfo(self.from);
            } else {
                self.from = defaultDecompose();
            }
            if (self.to) {
                self.to = getTransformInfo(self.to);
            } else {
                self.to = defaultDecompose();
            }
        },
        interpolate: function (from, to, pos) {
            var interpolate = TransformFx.superclass.interpolate;
            var ret = {};
            ret.translateX = interpolate(from.translateX, to.translateX, pos);
            ret.translateY = interpolate(from.translateY, to.translateY, pos);
            ret.rotate = interpolate(from.rotate, to.rotate, pos);
            ret.skewX = interpolate(from.skewX, to.skewX, pos);
            ret.skewY = interpolate(from.skewY, to.skewY, pos);
            ret.scaleX = interpolate(from.scaleX, to.scaleX, pos);
            ret.scaleY = interpolate(from.scaleY, to.scaleY, pos);
            return util.substitute(translateTpl + ' ' + 'rotate({rotate}deg) ' + 'skewX({skewX}deg) ' + 'skewY({skewY}deg) ' + 'scale({scaleX},{scaleY})', ret);
        }
    });
    Fx.Factories.transform = TransformFx;
    module.exports = TransformFx;    /**
 * @ignore
 * refer:
 * - http://louisremi.github.io/jquery.transform.js/index.html
 * - http://hg.mozilla.org/mozilla-central/file/7cb3e9795d04/layout/style/nsStyleAnimation.cpp#l971
 */
});

KISSY.add('anim/timer/short-hand', [], function (S, require, exports, module) {
    /**
 * short-hand css properties
 * @author yiminghe@gmail.com
 * @ignore
 */
    // shorthand css properties
    module.exports = {
        // http://www.w3.org/Style/CSS/Tracker/issues/9
        // http://snook.ca/archives/html_and_css/background-position-x-y
        // backgroundPositionX  backgroundPositionY does not support
        background: ['backgroundColor'],
        border: [
            'borderBottomWidth',
            'borderLeftWidth',
            'borderRightWidth',
            // 'borderSpacing', 组合属性？
            'borderTopWidth',
            'borderBottomColor',
            'borderLeftColor',
            'borderRightColor',
            'borderTopColor'
        ],
        borderColor: [
            'borderBottomColor',
            'borderLeftColor',
            'borderRightColor',
            'borderTopColor'
        ],
        borderBottom: [
            'borderBottomWidth',
            'borderBottomColor'
        ],
        borderLeft: [
            'borderLeftWidth',
            'borderLeftColor'
        ],
        borderTop: [
            'borderTopWidth',
            'borderTopColor'
        ],
        borderRight: [
            'borderRightWidth',
            'borderRightColor'
        ],
        font: [
            'fontSize',
            'fontWeight'
        ],
        margin: [
            'marginBottom',
            'marginLeft',
            'marginRight',
            'marginTop'
        ],
        padding: [
            'paddingBottom',
            'paddingLeft',
            'paddingRight',
            'paddingTop'
        ]
    };
});
