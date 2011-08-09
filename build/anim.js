/*
Copyright 2011, KISSY UI Library v1.20dev
MIT Licensed
build time: Aug 9 18:38
*/
/**
 * @module   anim
 * @author   lifesinger@gmail.com,yiminghe@gmail.com
 */
KISSY.add('anim/base', function(S, DOM, Event, Easing, UA, AM, undefined) {

    var EventTarget,
        /**
         * milliseconds in one second
         * @constant
         */
            SECOND_UNIT = 1000,
        PROPS,
        CUSTOM_ATTRS,
        OPACITY,NONE,
        EVENT_START,
        EVENT_STEP,
        EVENT_COMPLETE,
        defaultConfig,
        TRANSITION_NAME;

    EventTarget = Event.Target;

    //支持的有效的 css 分属性，数字则动画，否则直接设最终结果
    PROPS = (

        'borderBottomWidth ' +
            'borderBottomStyle ' +

            'borderLeftWidth ' +
            'borderLeftStyle ' +
            // 同 font
            //'borderColor ' +

            'borderRightWidth ' +
            'borderRightStyle ' +
            'borderSpacing ' +

            'borderTopWidth ' +
            'borderTopStyle ' +
            'bottom ' +

            // shorthand 属性去掉，取分解属性
            //'font ' +
            'fontFamily ' +
            'fontSize ' +
            'fontWeight ' +
            'height ' +
            'left ' +
            'letterSpacing ' +
            'lineHeight ' +
            'marginBottom ' +
            'marginLeft ' +
            'marginRight ' +
            'marginTop ' +
            'maxHeight ' +
            'maxWidth ' +
            'minHeight ' +
            'minWidth ' +
            'opacity ' +

            'outlineOffset ' +
            'outlineWidth ' +
            'paddingBottom ' +
            'paddingLeft ' +
            'paddingRight ' +
            'paddingTop ' +
            'right ' +
            'textIndent ' +
            'top ' +
            'width ' +
            'wordSpacing ' +
            'zIndex').split(' ');

    //支持的元素属性
    CUSTOM_ATTRS = [];

    OPACITY = 'opacity';
    NONE = 'none';
    EVENT_START = 'start';
    EVENT_STEP = 'step';
    EVENT_COMPLETE = 'complete';
    defaultConfig = {
        duration: 1,
        easing: 'easeNone',
        nativeSupport: true // 优先使用原生 css3 transition
    };

    /**
     * Anim Class
     * @constructor
     */
    function Anim(elem, props, duration, easing, callback, nativeSupport) {
        // ignore non-exist element
        if (!(elem = DOM.get(elem))) {
            return;
        }

        // factory or constructor
        if (!(this instanceof Anim)) {
            return new Anim(elem, props, duration, easing, callback, nativeSupport);
        }

        /**
         * 默认不启用原生动画，有些问题
         */
        if (nativeSupport === undefined) {
            nativeSupport = false;
        }

        var self = this,
            isConfig = S.isPlainObject(duration),
            style = props,
            config;

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
            style = String(S.param(style, ';'))
                .replace(/=/g, ':')
                .replace(/%23/g, '#')// 还原颜色值中的 #
                //注意：这里自定义属性也被 - 了，后面从字符串中取值时需要考虑
                .replace(/([a-z])([A-Z])/g, '$1-$2')
                .toLowerCase(); // backgroundColor => background-color
        }

        //正则化，并且将shorthand属性分解成各个属性统一单独处理
        //border:1px solid #fff =>
        //borderLeftWidth:1px
        //borderLeftColor:#fff
        self.props = normalize(style, elem);
        // normalize 后：
        // props = {
        //          width: { v: 200, unit: 'px', f: interpolate }
        //          color: { v: '#ccc', unit: '', f: color }
        //         }

        self.targetStyle = style;

        /**
         * animation config
         */
        if (isConfig) {
            config = S.merge(defaultConfig, duration);
        } else {
            config = S.clone(defaultConfig);
            if (duration) {
                config.duration = parseFloat(duration) || 1;
            }
            if (S.isString(easing) || S.isFunction(easing)) {
                config.easing = easing;
            }
            if (S.isFunction(callback)) {
                config.complete = callback;
            }
            config.nativeSupport = nativeSupport;
        }

        //如果设定了元素属性的动画，则不能启动 css3 transition
        if (!S.isEmptyObject(getCustomAttrs(style))) {
            config.nativeSupport = false;
        }
        self.config = config;

        /**
         * detect browser native animation(CSS3 transition) support
         */
        if (config.nativeSupport
            && getNativeTransitionName()
            && S.isString((easing = config.easing))) {
            // 当 easing 是支持的字串时，才激活 native transition
            if (/cubic-bezier\([\s\d.,]+\)/.test(easing) ||
                (easing = Easing.NativeTimeFunction[easing])) {
                config.easing = easing;
                self.transitionName = getNativeTransitionName();
            }
        }

        // register callback
        if (S.isFunction(callback)) {
            self.callback = callback;
            //不要这样注册了，常用方式(new 完就扔)会忘记 detach，造成内存不断增加
            //self.on(EVENT_COMPLETE, callback);
        }
    }

    Anim.PROPS = PROPS;
    Anim.CUSTOM_ATTRS = CUSTOM_ATTRS;

    // 不能插值的直接返回终值，没有动画插值过程
    function mirror(source, target) {
        source = null;
        return target;
    }

    /**
     * 相应属性的读取设置操作，需要转化为动画模块格式
     */
    Anim.PROP_OPS = {
        "*":{
            getter:function(elem, prop) {
                var val = DOM.css(elem, prop),
                    num = parseFloat(val),
                    unit = (val + '').replace(/^[-\d.]+/, '');
                // 不能动画的量，插值直接设为最终，下次也不运行
                if (isNaN(num)) {
                    return {v:unit,u:'',f:mirror};
                }
                return {v:num,u:unit,f:this.interpolate};
            },
            setter:function(elem, prop, val) {
                return DOM.css(elem, prop, val);
            },
            /**
             * 数值插值函数
             * @param {Number} source 源值
             * @param {Number} target 目的值
             * @param {Number} pos 当前位置，从 easing 得到 0~1
             * @return {Number} 当前值
             */
            interpolate:function(source, target, pos) {
                return (source + (target - source) * pos).toFixed(3);
            },

            eq:function(tp, sp) {
                return tp.v == sp.v && tp.u == sp.u;
            }
        }
    };

    var PROP_OPS = Anim.PROP_OPS;


    S.augment(Anim, EventTarget, {
        /**
         * @type {boolean} 是否在运行
         */
        isRunning:false,
        /**
         * 动画开始到现在逝去的时间
         */
        elapsedTime:0,
        /**
         * 动画开始的时间
         */
        start:0,
        /**
         * 动画结束的时间
         */
        finish:0,
        /**
         * 动画持续时间，不间断的话 = finish-start
         */
        duration:0,

        run: function() {

            var self = this,
                config = self.config,
                elem = self.domEl,
                duration, easing,
                start,
                finish,
                target = self.props,
                source = {},
                prop;

            if (self.fire(EVENT_START) === false) {
                return;
            }

            self.stop(); // 先停止掉正在运行的动画
            duration = config.duration * SECOND_UNIT;
            self.duration = duration;
            if (self.transitionName) {
                // some hack ,Weird but ff/chrome need a break
                setTimeout(function() {
                    self._nativeRun();
                }, 10);
            } else {
                for (prop in target) {
                    source[prop] = getAnimValue(elem, prop);
                }

                self.source = source;

                start = S.now();
                finish = start + duration;
                easing = config.easing;

                if (S.isString(easing)) {
                    easing = Easing[easing] || Easing.easeNone;
                }


                self.start = start;
                self.finish = finish;
                self.easing = easing;

                AM.start(self);
            }

            self.isRunning = true;

            return self;
        },

        _complete:function() {
            var self = this;
            self.fire(EVENT_COMPLETE);
            self.callback && self.callback();
        },

        _runFrame:function() {

            var self = this,
                elem = self.domEl,
                finish = self.finish,
                start = self.start,
                duration = self.duration,
                time = S.now(),
                source = self.source,
                easing = self.easing,
                target = self.props,
                prop,
                elapsedTime;
            elapsedTime = time - start;
            var t = time > finish ? 1 : elapsedTime / duration,
                sp, tp, b;

            self.elapsedTime = elapsedTime;

            //S.log("********************************  _runFrame");

            for (prop in target) {

                sp = source[prop];
                tp = target[prop];

                // 没有发生变化的，直接略过
                if (eqAnimValue(prop, tp, sp)) {
                    continue;
                }

                //S.log(prop);
                //S.log(tp.v + " : " + sp.v + " : " + sp.u + " : " + tp.u);

                // 比如 sp = { v: 0, u: 'pt'} ( width: 0 时，默认单位是 pt )
                // 这时要把 sp 的单位调整为和 tp 的一致
                if (tp.v === 0) {
                    tp.u = sp.u;
                }

                // 单位不一样时，以 tp.u 的为主，同时 sp 从 0 开始
                // 比如：ie 下 border-width 默认为 medium
                if (sp.u !== tp.u) {
                    //S.log(prop + " : " + sp.v + " : " + sp.u);
                    //S.log(tp.f);
                    sp.v = 0;
                    sp.u = tp.u;
                }

                setAnimValue(elem, prop, tp.f(sp.v, tp.v, easing(t)) + tp.u);
                /**
                 * 不能动画的量，直接设成最终值，下次不用动画，设置 dom 了
                 */
                if (tp.f == mirror) {
                    sp.v = tp.v;
                    sp.u = tp.u;
                }
            }

            if ((self.fire(EVENT_STEP) === false) || (b = time > finish)) {
                self.stop();
                // complete 事件只在动画到达最后一帧时才触发
                if (b) {
                    self._complete();
                }
            }
        },

        _nativeRun: function() {
            var self = this,
                config = self.config,
                elem = self.domEl,
                duration = self.duration,
                easing = config.easing,
                prefix = self.transitionName,
                transition = {};

            // using CSS transition process
            transition[prefix + 'Property'] = 'all';
            transition[prefix + 'Duration'] = duration + 'ms';
            transition[prefix + 'TimingFunction'] = easing;

            // set the CSS transition style
            DOM.css(elem, transition);

            // set the final style value (need some hack for opera)
            setTimeout(function() {
                setToFinal(elem,
                    // target,
                    self.targetStyle);
            }, 0);

            // after duration time, fire the stop function
            S.later(function() {
                self.stop(true);
            }, duration);
        },

        stop: function(finish) {
            var self = this;
            // already stopped
            if (!self.isRunning) {
                return;
            }

            if (self.transitionName) {
                self._nativeStop(finish);
            } else {
                // 直接设置到最终样式
                if (finish) {
                    setToFinal(self.domEl,
                        //self.props,
                        self.targetStyle);
                    self._complete();
                }
                AM.stop(self);
            }

            self.isRunning = false;

            return self;
        },

        _nativeStop: function(finish) {
            var self = this,
                elem = self.domEl,
                props = self.props,
                prop;

            // handle for the CSS transition
            if (finish) {
                // CSS transition value remove should come first
                self._clearNativeProperty();
                self._complete();
            } else {
                // if want to stop the CSS transition, should set the current computed style value to the final CSS value
                for (prop in props) {
                    DOM.css(elem, prop, DOM._getComputedStyle(elem, prop));
                }
                // CSS transition value remove should come last
                self._clearNativeProperty();
            }
        },

        _clearNativeProperty:function() {
            var transition = {},
                self = this,
                elem = self.domEl,
                prefix = self.transitionName;
            transition[prefix + 'Property'] = NONE;
            transition[prefix + 'Duration'] = "";
            transition[prefix + 'TimingFunction'] = "";
            DOM.css(elem, transition);
        }
    });

    Anim.supportTransition = function() {
        if (TRANSITION_NAME) {
            return TRANSITION_NAME;
        }
        var name = 'transition', transitionName;
        var el = document.documentElement;
        if (el.style[name] !== undefined) {
            transitionName = name;
        } else {
            S.each(['Webkit', 'Moz', 'O'], function(item) {
                if (el.style[(name = item + 'Transition')] !== undefined) {
                    transitionName = name;
                    return false;
                }
            });
        }
        TRANSITION_NAME = transitionName;
        return transitionName;
    };


    var getNativeTransitionName = Anim.supportTransition;

    function setToFinal(elem, style) {
        setAnimStyleText(elem, style);
    }

    function getAnimValue(el, prop) {
        return (PROP_OPS[prop] || PROP_OPS["*"]).getter(el, prop);
    }


    function setAnimValue(el, prop, v) {
        return (PROP_OPS[prop] || PROP_OPS["*"]).setter(el, prop, v);
    }

    function eqAnimValue(prop, tp, sp) {
        var propSpecial = PROP_OPS[prop];
        if (propSpecial && propSpecial.eq) {
            return propSpecial.eq(tp, sp);
        }
        return PROP_OPS["*"].eq(tp, sp);
    }

    /**
     * 建一个尽量相同的 dom 节点在相同的位置（不单行内，获得相同的 css 选择器样式定义），从中取值
     */
    function normalize(style, elem) {
        var css,
            rules = {},
            i = PROPS.length,
            v;
        var el = elem.cloneNode(true);

        DOM.insertAfter(el, elem);

        css = el.style;
        setAnimStyleText(el, style);
        while (i--) {
            var prop = PROPS[i];
            // !important 只对行内样式得到计算当前真实值
            if (v = css[prop]) {
                rules[prop] = getAnimValue(el, prop);
            }
        }
        //自定义属性混入
        var customAttrs = getCustomAttrs(style);
        for (var a in customAttrs) {
            rules[a] = getAnimValue(el, a);
        }
        DOM.remove(el);
        return rules;
    }

    /**
     * 直接设置 cssText 以及属性字符串，注意 ie 的 opacity
     * @param style
     * @param elem
     */
    function setAnimStyleText(elem, style) {
        if (UA['ie'] && style.indexOf(OPACITY) > -1) {
            var reg = /opacity\s*:\s*([^;]+)(;|$)/;
            var match = style.match(reg);
            if (match) {
                DOM.css(elem, OPACITY, parseFloat(match[1]));
            }
            //不要把它清除了
            //ie style.opacity 要能取！
        }
        elem.style.cssText += ';' + style;
        //设置自定义属性
        var attrs = getCustomAttrs(style);
        for (var a in attrs) {
            elem[a] = attrs[a];
        }
    }

    /**
     * 从自定义属性和样式字符串中解出属性值
     * @param style
     */
    function getCustomAttrs(style) {

        var ret = {};
        for (var i = 0; i < CUSTOM_ATTRS.length; i++) {
            var attr = CUSTOM_ATTRS[i]
                .replace(/([a-z])([A-Z])/g, '$1-$2')
                .toLowerCase();
            var reg = new RegExp(attr + "\\s*:([^;]+)(;|$)");
            var m = style.match(reg);
            if (m) {
                ret[CUSTOM_ATTRS[i]] = S.trim(m[1]);
            }
        }
        return ret;
    }

    return Anim;
}, {
    requires:["dom","event","./easing","ua","./manager"]
});

/**
 * TODO:
 *  - 效率需要提升，当使用 nativeSupport 时仍做了过多动作
 *  - opera nativeSupport 存在 bug ，浏览器自身 bug ?
 *  - 实现 jQuery Effects 的 queue / specialEasing / += / 等特性
 *
 * NOTES:
 *  - 与 emile 相比，增加了 borderStyle, 使得 border: 5px solid #ccc 能从无到有，正确显示
 *  - api 借鉴了 YUI, jQuery 以及 http://www.w3.org/TR/css3-transitions/
 *  - 代码实现了借鉴了 Emile.js: http://github.com/madrobby/emile
 *  - 借鉴 yui3 ，中央定时器，否则 ie6 内存泄露？
 */
/**
 * special patch for making color gradual change
 * @author  yiminghe@gmail.com
 */
KISSY.add("anim/color", function(S, DOM, Anim) {

    var HEX_BASE = 16,
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
        };
    var re_RGB = /^rgb\(([0-9]+)\s*,\s*([0-9]+)\s*,\s*([0-9]+)\)$/i,
        re_hex = /^#?([0-9A-F]{1,2})([0-9A-F]{1,2})([0-9A-F]{1,2})$/i;


    //颜色 css 属性
    var colors = ('backgroundColor ' +
        'borderBottomColor ' +
        'borderLeftColor ' +
        'borderRightColor ' +
        'borderTopColor ' +
        'color ' +
        'outlineColor').split(' ');

    var OPS = Anim.PROP_OPS,
        PROPS = Anim.PROPS;

    //添加到支持集
    PROPS.push.apply(PROPS, colors);


    //得到颜色的数值表示，红绿蓝数字数组
    function numericColor(val) {
        val = val.toLowerCase();
        var match;
        if (match = val.match(re_RGB)) {
            return [
                parseInt(match[1]),
                parseInt(match[2]),
                parseInt(match[3])
            ];
        } else if (match = val.match(re_hex)) {
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
        if (KEYWORDS[val]) {
            return KEYWORDS[val];
        }
        //transparent 或者 颜色字符串返回
        S.log("only allow rgb or hex color string : " + val, "warn");
        return [255,255,255];
    }


    OPS["color"] = {
        getter:function(elem, prop) {
            return {
                v:numericColor(DOM.css(elem, prop)),
                u:'',
                f:this.interpolate
            };
        },
        setter:OPS["*"].setter,
        /**
         * 根据颜色的数值表示，执行数组插值
         * @param source {Array.<Number>} 颜色源值表示
         * @param target {Array.<Number>} 颜色目的值表示
         * @param pos {Number} 当前进度
         * @return {String} 可设置css属性的格式值 : rgb
         */
        interpolate:function(source, target, pos) {
            var interpolate = OPS["*"].interpolate;
            return 'rgb(' + [
                Math.floor(interpolate(source[0], target[0], pos)),
                Math.floor(interpolate(source[1], target[1], pos)),
                Math.floor(interpolate(source[2], target[2], pos))
            ].join(', ') + ')';
        },
        eq:function(tp, sp) {
            return (tp.v + "") == (sp.v + "");
        }
    };

    S.each(colors, function(prop) {
        OPS[prop] = OPS['color'];
    });
}, {
    requires:["dom","./base"]
});/**
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
 * single timer for the whole anim module
 * @author  yiminghe@gmail.com
 */
KISSY.add("anim/manager", function(S) {
    var tag = S.guid("anim-");

    function getKv(anim) {
        anim[tag] = anim[tag] || S.guid("anim-");
        return anim[tag];
    }

    var manager = {
        interval:20,
        runnings:{},
        timer:null,
        start:function(anim) {
            var kv = getKv(anim);
            if (this.runnings[kv]) {
                return;
            }
            this.runnings[kv] = anim;
            this.startTimer();
        },
        stop:function(anim) {
            this.notRun(anim);
        },
        notRun:function(anim) {
            var kv = getKv(anim);
            delete this.runnings[kv];
            if (S.isEmptyObject(this.runnings)) {
                this.stopTimer();
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
                    //S.log("running : " + (id++));
                    if (!self.runFrames()) {
                        self.timer = null;
                        self.startTimer();
                    } else {
                        self.stopTimer();
                    }
                }, self.interval);
            }
        },
        stopTimer:function() {
            var t = this.timer;
            if (t) {
                clearTimeout(t);
                this.timer = null;
                //S.log("timer stop");
            }
        },
        runFrames:function() {
            var done = true,runnings = this.runnings;
            for (var r in runnings) {
                if (runnings.hasOwnProperty(r)) {
                    done = false;
                    runnings[r]._runFrame();
                }
            }
            return done;
        }
    };

    if (1 > 2) {
        manager.pause().resume();
    }

    return manager;
});/**
 * special patch for animate scroll property of element
 * @author  yiminghe@gmail.com
 */
KISSY.add("anim/scroll", function(S, DOM, Anim) {

    var OPS = Anim.PROP_OPS;

    //添加到支持集
    Anim.CUSTOM_ATTRS.push("scrollLeft", "scrollTop");

    // 不从 css  中读取，从元素属性中得到值
    OPS["scrollLeft"] = OPS["scrollTop"] = {
        getter:function(elem, prop) {

            return {
                v:elem[prop],
                u:'',
                f:OPS["*"].interpolate
            };
        },
        setter:function(elem, prop, val) {
            elem[prop] = val;
        }
    };
}, {
    requires:["dom","./base"]
});KISSY.add("anim", function(S, Anim,Easing) {
    Anim.Easing=Easing;
    return Anim;
}, {
    requires:["anim/base","anim/easing","anim/color","anim/scroll"]
});
