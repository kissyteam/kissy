/**
 * @ignore
 * @fileOverview Easing equation from yui3 and css3
 * @author yiminghe@gmail.com, lifesinger@gmail.com
 */
KISSY.add('anim/easing', function () {

    // Based on Easing Equations (c) 2003 Robert Penner, all rights reserved.
    // This work is subject to the terms in http://www.robertpenner.com/easing_terms_of_use.html
    // Preview: http://www.robertpenner.com/Easing/easing_demo.html

// 和 YUI 的 Easing 相比，Easing 进行了归一化处理，参数调整为：
// @param {Number} t Time value used to compute current value  保留 0 =< t <= 1
// @param {Number} b Starting value  b = 0
// @param {Number} c Delta between start and end values  c = 1
// @param {Number} d Total length of animation d = 1

    var PI = Math.PI,
        pow = Math.pow,
        sin = Math.sin,
        parseNumber = parseFloat,
        CUBIC_BEZIER_REG = /^cubic-bezier\(([^,]+),([^,]+),([^,]+),([^,]+)\)$/i,
        BACK_CONST = 1.70158;

    function easeNone(t) {
        return t;
    }

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
            return ( -Math.cos(t * PI) / 2 ) + 0.5;
        },

        /**
         * Uniform speed between points.
         */
        'easeNone': easeNone,

        'linear': easeNone,

        /**
         * Begins slowly and accelerates towards end. (quadratic)
         */
        'easeIn': function (t) {
            return t * t;
        },

        'ease': makeBezier(0.25, 0.1, 0.25, 1.0),

        'ease-in': makeBezier(0.42, 0, 1.0, 1.0),

        'ease-out': makeBezier(0, 0, 0.58, 1.0),

        'ease-in-out': makeBezier(0.42, 0, 0.58, 1.0),

        'ease-out-in': makeBezier(0, 0.42, 1.0, 0.58),

        toFn: function (easingStr) {
            var m;
            if (m = easingStr.match(CUBIC_BEZIER_REG)) {
                return makeBezier(
                    parseNumber(m[1]),
                    parseNumber(m[2]),
                    parseNumber(m[3]),
                    parseNumber(m[4])
                );
            }
            return Easing[easingStr] || easeNone;
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
        'easeInStrong': function (t) {
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
        'easeBothStrong': function (t) {
            return (t *= 2) < 1 ?
                .5 * t * t * t * t :
                .5 * (2 - (t -= 2) * t * t * t);
        },

        /**
         * Snap in elastic effect.
         */

        'elasticIn': function (t) {
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
        'elasticBoth': function (t) {
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
        'backIn': function (t) {
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
        'backBoth': function (t) {
            var s = BACK_CONST;
            var m = (s *= 1.525) + 1;

            if ((t *= 2 ) < 1) {
                return .5 * (t * t * (m * t - s));
            }
            return .5 * ((t -= 2) * t * (m * t + s) + 2);

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
        'bounceOut': function (t) {
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
        'bounceBoth': function (t) {
            if (t < .5) {
                return Easing.bounceIn(t * 2) * .5;
            }
            return Easing.bounceOut(t * 2 - 1) * .5 + .5;
        }
    };

    var ZERO_LIMIT = 1e-6,
        abs = Math.abs;

    // x = (3*p1x-3*p2x+1)*t^3 + (3*p2x-6*p1x)*t^2 + 3*p1x*t
    // http://en.wikipedia.org/wiki/B%C3%A9zier_curve
    function makeBezier(p1x, p1y, p2x, p2y) {
        var ax1 = 3 * p1x - 3 * p2x + 1,
            ax2 = 3 * p2x - 6 * p1x,
            ax3 = 3 * p1x;

        var ay1 = 3 * p1y - 3 * p2y + 1,
            ay2 = 3 * p2y - 6 * p1y,
            ay3 = 3 * p1y;

        function derivativeX(t) {
            return (3 * ax1 * t + 2 * ax2) * t + ax3;
        }

        function getXByT(t) {
            return ((ax1 * t + ax2) * t + ax3 ) * t;
        }

        function getYByT(t) {
            return ((ay1 * t + ay2) * t + ay3 ) * t;
        }

        function getTByX(x) {
            var iterationT = x,
                derivative,
                xRet;

            // https://trac.webkit.org/browser/trunk/Source/WebCore/platform/animation
            // newton method
            // http://en.wikipedia.org/wiki/Newton's_method
            for (var i = 0; i < 9; i++) {
                // f(t)-x=0
                xRet = getXByT(iterationT) - x;
                if (abs(xRet) < ZERO_LIMIT) {
                    return iterationT;
                }
                derivative = derivativeX(iterationT);
                // == 0, failure
                if (abs(derivative) < ZERO_LIMIT) {
                    break;
                }
                iterationT -= xRet / derivative;
            }

            // bisection
            // http://en.wikipedia.org/wiki/Bisection_method
            var maxT = 1,
                minT = 0;
            iterationT = x;
            while (maxT > minT) {
                xRet = getXByT(iterationT) - x;
                if (abs(xRet) < ZERO_LIMIT) {
                    return iterationT;
                }
                if (xRet > 0) {
                    maxT = iterationT;
                } else {
                    minT = iterationT;
                }
                iterationT = (maxT + minT) / 2;
            }

            // fail
            return iterationT;
        }

        function getYByX(x) {
            var t = getTByX(x);
            return getYByT(t);
        }

        return getYByX;
    }

    return Easing;
});

/*
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
