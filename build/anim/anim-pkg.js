/*
Copyright 2010, KISSY UI Library v1.0.8
MIT Licensed
build: 871 Jul 19 08:51
*/
/**
 * @module anim-easing
 */
KISSY.add('anim-easing', function(S, undefined) {

    // Based on Easing Equations (c) 2003 Robert Penner, all rights reserved.
    // This work is subject to the terms in http://www.robertpenner.com/easing_terms_of_use.html
    // Preview: http://www.robertpenner.com/easing/easing_demo.html

    var M = Math, PI = M.PI,
        pow = M.pow, sin = M.sin, abs = M.abs, asin = M.asin,
        BACK_CONST = 1.70158,

        Easing = {

            /**
             * Uniform speed between points.
             * @param {Number} t Time value used to compute current value
             * @param {Number} b Starting value
             * @param {Number} c Delta between start and end values
             * @param {Number} d Total length of animation
             * @return {Number} The computed value for the current animation frame
             */
            easeNone: function (t, b, c, d) {
                return c * t / d + b;
            },

            /**
             * Begins slowly and accelerates towards end. (quadratic)
             */
            easeIn: function (t, b, c, d) {
                return c * (t /= d) * t + b;
            },

            /**
             * Begins quickly and decelerates towards end.  (quadratic)
             */
            easeOut: function (t, b, c, d) {
                return -c * (t /= d) * (t - 2) + b;
            },

            /**
             * Begins slowly and decelerates towards end. (quadratic)
             */
            easeBoth: function (t, b, c, d) {
                return (t /= d / 2) < 1 ?
                    c / 2 * t * t + b :
                    -c / 2 * ((--t) * (t - 2) - 1) + b;
            },

            /**
             * Begins slowly and accelerates towards end. (quartic)
             */
            easeInStrong: function (t, b, c, d) {
                return c * (t /= d) * t * t * t + b;
            },

            /**
             * Begins quickly and decelerates towards end.  (quartic)
             */
            easeOutStrong: function (t, b, c, d) {
                return -c * ((t = t / d - 1) * t * t * t - 1) + b;
            },

            /**
             * Begins slowly and decelerates towards end. (quartic)
             */
            easeBothStrong: function (t, b, c, d) {
                return (t /= d / 2) < 1 ?
                    c / 2 * t * t * t * t + b :
                    -c / 2 * ((t -= 2) * t * t * t - 2) + b;
            },

            /**
             * Snap in elastic effect.
             * @param {Number} a Amplitude (optional)
             * @param {Number} p Period (optional)
             */

            elasticIn: function (t, b, c, d, a, p) {
                var s;
                if (t === 0) {
                    return b;
                }
                if ((t /= d) === 1) {
                    return b + c;
                }
                if (!p) {
                    p = d * 0.3;
                }

                if (!a || a < abs(c)) {
                    a = c;
                    s = p / 4;
                }
                else {
                    s = p / (2 * PI) * asin(c / a);
                }

                return -(a * pow(2, 10 * (t -= 1)) * sin((t * d - s) * (2 * PI) / p)) + b;
            },

            /**
             * Snap out elastic effect.
             */
            elasticOut: function (t, b, c, d, a, p) {
                var s;
                if (t === 0) {
                    return b;
                }
                if ((t /= d) === 1) {
                    return b + c;
                }
                if (!p) {
                    p = d * 0.3;
                }

                if (!a || a < abs(c)) {
                    a = c;
                    s = p / 4;
                }
                else {
                    s = p / (2 * PI) * asin(c / a);
                }

                return a * pow(2, -10 * t) * sin((t * d - s) * (2 * PI) / p) + c + b;
            },

            /**
             * Snap both elastic effect.
             */
            elasticBoth: function (t, b, c, d, a, p) {
                var s;
                if (t === 0) {
                    return b;
                }

                if ((t /= d / 2) === 2) {
                    return b + c;
                }

                if (!p) {
                    p = d * (0.3 * 1.5);
                }

                if (!a || a < abs(c)) {
                    a = c;
                    s = p / 4;
                }
                else {
                    s = p / (2 * PI) * asin(c / a);
                }

                if (t < 1) {
                    return -0.5 * (a * pow(2, 10 * (t -= 1)) *
                        sin((t * d - s) * (2 * PI) / p)) + b;
                }
                return a * pow(2, -10 * (t -= 1)) *
                    sin((t * d - s) * (2 * PI) / p) * 0.5 + c + b;
            },

            /**
             * Backtracks slightly, then reverses direction and moves to end.
             * @param {Number} s Overshoot (optional)
             */
            backIn: function (t, b, c, d, s) {
                if (s === undefined) {
                    s = BACK_CONST;
                }
                if (t === d) {
                    t -= 0.001;
                }
                return c * (t /= d) * t * ((s + 1) * t - s) + b;
            },

            /**
             * Overshoots end, then reverses and comes back to end.
             */
            backOut: function (t, b, c, d, s) {
                if (s === undefined) {
                    s = BACK_CONST;
                }
                return c * ((t = t / d - 1) * t * ((s + 1) * t + s) + 1) + b;
            },

            /**
             * Backtracks slightly, then reverses direction, overshoots end,
             * then reverses and comes back to end.
             */
            backBoth: function (t, b, c, d, s) {
                if (s === undefined) {
                    s = BACK_CONST;
                }

                if ((t /= d / 2 ) < 1) {
                    return c / 2 * (t * t * (((s *= (1.525)) + 1) * t - s)) + b;
                }
                return c / 2 * ((t -= 2) * t * (((s *= (1.525)) + 1) * t + s) + 2) + b;
            },

            /**
             * Bounce off of start.
             */
            bounceIn: function (t, b, c, d) {
                return c - Easing.bounceOut(d - t, 0, c, d) + b;
            },

            /**
             * Bounces off end.
             */
            bounceOut: function (t, b, c, d) {
                var s = 7.5625, r;

                if ((t /= d) < (1 / 2.75)) {
                    r = c * (s * t * t) + b;
                }
                else if (t < (2 / 2.75)) {
                    r =  c * (s * (t -= (1.5 / 2.75)) * t + 0.75) + b;
                }
                else if (t < (2.5 / 2.75)) {
                    r =  c * (s * (t -= (2.25 / 2.75)) * t + 0.9375) + b;
                }
                r =  c * (s * (t -= (2.625 / 2.75)) * t + 0.984375) + b;

                return r;
            },

            /**
             * Bounces off start and end.
             */
            bounceBoth: function (t, b, c, d) {
                if (t < d / 2) {
                    return Easing.bounceIn(t * 2, 0, c, d) * 0.5 + b;
                }
                return Easing.bounceOut(t * 2 - d, 0, c, d) * 0.5 + c * 0.5 + b;
            }
        };

    S.Easing = Easing;
});

/**
 * NOTES:
 *
 *  - [20100719] 综合比较 jQuery UI/scripty2/YUI 的 easing 命名，还是觉得 YUI 的对用户
 *    最友好。因此这次完全照搬 YUI 的 Easing, 只是代码上做了点压缩优化。
 *
 */
/**
 * @module  anim
 * @author  lifesinger@gmail.com
 */
KISSY.add('anim', function(S, undefined) {

    var DOM = S.DOM, Easing = S.Easing,
        PARSE_FLOAT = parseFloat,
        parseEl = DOM.create('<div>'),
        PROPS = ('backgroundColor borderBottomColor borderBottomWidth borderLeftColor borderLeftWidth ' +
            'borderRightColor borderRightWidth borderSpacing borderTopColor borderTopWidth bottom color fontSize ' +
            'fontWeight height left letterSpacing lineHeight marginBottom marginLeft marginRight marginTop maxHeight ' +
            'maxWidth minHeight minWidth opacity outlineColor outlineOffset outlineWidth paddingBottom paddingLeft ' +
            'paddingRight paddingTop right textIndent top width wordSpacing zIndex').split(' '),

        defaultConfig = {
            duration: 1,
            easing: Easing.easeNone,
            //complete: null,
            //step: null,
            queue: true
        };

    /**
     * Anim Class
     * @constructor
     */
    function Anim(elem, props, duration, easing, callback) {
        var self = this,
            isConfig = S.isPlainObject(duration),
            style = props, config;

        // ignore non-exist element
        if(!(elem = S.get(elem))) return;

        /**
         * the related dom element
         */
        self.domEl = elem;

        /**
         * the transition properties
         * 可以是："width: 200px; height: 500px" 字符串形式
         * 也可以是: { width: '200px', height: '500px' } 对象形式
         */
        if(S.isPlainObject(style)) {
            style = S.param(style, ';').replace(/=/g, ':');
        }
        self.props = normalize(style);

        /**
         * animation config
         */
        if(isConfig) {
            config = S.merge(defaultConfig, duration);
        } else {
            config = S.clone(defaultConfig);
            duration && (config.duration = PARSE_FLOAT(duration, 10) || 1);
            S.isString(easing) && (easing = Easing[easing]); // 可以是字符串, 比如 'easingOut'
            S.isFunction(easing) && (config.easing = easing);
            S.isFunction(callback) && (config.complete = callback);
        }
        self.config = config;

        var target = normalize(PROPS), comp = el.currentStyle ? el.currentStyle : getComputedStyle(el, null),
            prop, current = {}, start = +new Date, dur = opts.duration || 200, finish = start + dur, interval,
            easing = opts.easing || function(pos) {
                return (-Math.cos(pos * Math.PI) / 2) + 0.5;
            };

        for (prop in target) current[prop] = parse(comp[prop]);

        interval = setInterval(function() {
            var time = +new Date, pos = time > finish ? 1 : (time - start) / dur;
            for (prop in target)
                el.style[prop] = target[prop].f(current[prop].v, target[prop].v, easing(pos)) + target[prop].u;
            if (time > finish) {
                clearInterval(interval);
                opts.after && opts.after();
                after && setTimeout(after, 1);
            }
        }, 10);
    }

    S.augment(Anim, S.EventTarget, {

        _init: function() {

        }
    });

    S.Anim = Anim;

    function normalize(style) {
        var css, rules = { }, i = PROPS.length, v;
        parseEl.innerHTML = '<div style="' + style + '"></div>';
        css = parseEl.childNodes[0].style;
        while (i--) if (v = css[PROPS[i]]) rules[PROPS[i]] = parse(v);
        return rules;
    }

    function parse(prop) {
        var p = PARSE_FLOAT(prop), q = prop.replace(/^[\-\d\.]+/, '');
        return isNaN(p) ? { v: q, f: color, u: ''} : { v: p, f: interpolate, u: q };
    }

    function interpolate(source, target, pos) {
        return (source + (target - source) * pos).toFixed(3);
    }

    function s(str, p, c) {
        return str.substr(p, c || 1);
    }

    function color(source, target, pos) {
        var i = 2, j, c, tmp, v = [], r = [];
        while (j = 3,c = arguments[i - 1],i--)
            if (s(c, 0) == 'r') {
                c = c.match(/\d+/g);
                while (j--) v.push(~~c[j]);
            } else {
                if (c.length == 4) c = '#' + s(c, 1) + s(c, 1) + s(c, 2) + s(c, 2) + s(c, 3) + s(c, 3);
                while (j--) v.push(parseInt(s(c, 1 + j * 2, 2), 16));
            }
        while (j--) {
            tmp = ~~(v[j + 3] + (v[j] - v[j + 3]) * pos);
            r.push(tmp < 0 ? 0 : tmp > 255 ? 255 : tmp);
        }
        return 'rgb(' + r.join(',') + ')';
    }
});

/**
 * NOTES:
 *
 *  - api 借鉴了 YUI, jQuery 以及 http://www.w3.org/TR/css3-transitions/
 *  - 代码实现了借鉴了 Emile.js: http://github.com/madrobby/emile
 */
