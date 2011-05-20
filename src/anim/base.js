/**
 * @module   anim
 * @author   lifesinger@gmail.com,yiminghe@gmail.com
 */
KISSY.add('anim/base', function(S, DOM, Event, Easing, UA, AM, undefined) {

    var EventTarget,
        PROPS,
        CUSTOM_ATTRS,
        OPACITY,NONE,
        PROPERTY,EVENT_START,
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
    PROPERTY = 'Property';
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
        if (!(elem = DOM.get(elem))) return;

        // factory or constructor
        if (!(this instanceof Anim)) {
            return new Anim(elem, props, duration, easing, callback, nativeSupport);
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
            if (duration) (config.duration = parseFloat(duration) || 1);
            if (S.isString(easing) || S.isFunction(easing)) config.easing = easing;
            if (S.isFunction(callback)) config.complete = callback;
            if (nativeSupport !== undefined) {
                config.nativeSupport = nativeSupport;
            }
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

                // already running,please stop first
                if (self.isRunning) {
                    return;
                }
                if (self.fire(EVENT_START) === false) return;

                self.stop(); // 先停止掉正在运行的动画
                duration = config.duration * 1000;
                self.duration = duration;
                if (self.transitionName) {
                    // !important firefox 如果结束样式对应的初始样式没有，则不会产生动画
                    // <div> -> <div 'left=100px'>
                    // 则初始 div 要设置行内 left=getComputed("left")
//                    for (prop in target) {
//                        var av = getAnimValue(elem, prop);// :)
//                        setAnimValue(elem, prop, av.v + av.u);
//                    }
                    self._nativeRun();
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
                    if (eqAnimValue(prop, tp, sp)) continue;

                    //S.log(prop);
                    //S.log(tp.v + " : " + sp.v + " : " + sp.u + " : " + tp.u);

                    // 比如 sp = { v: 0, u: 'pt'} ( width: 0 时，默认单位是 pt )
                    // 这时要把 sp 的单位调整为和 tp 的一致
                    if (tp.v == 0) {
                        tp.u = sp.u;
                    }

                    // 单位不一样时，以 tp.u 的为主，同时 sp 从 0 开始
                    // 比如：ie 下 border-width 默认为 medium
                    if (sp.u !== tp.u) {
                        //S.log(prop + " : " + sp.v + " : " + sp.u);
                        //S.log(prop + " : " + tp.v + " : " + tp.u);
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
                S.later(function() {
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
                    prefix = self.transitionName,
                    props = self.props,
                    prop;

                // handle for the CSS transition
                if (finish) {
                    // CSS transition value remove should come first
                    DOM.css(elem, prefix + PROPERTY, NONE);
                    self._complete();
                } else {
                    // if want to stop the CSS transition, should set the current computed style value to the final CSS value
                    for (prop in props) {
                        DOM.css(elem, prop, DOM._getComputedStyle(elem, prop));
                    }
                    // CSS transition value remove should come last
                    DOM.css(elem, prefix + PROPERTY, NONE);
                }
            }
        });

    Anim.supportTransition = function() {
        if (TRANSITION_NAME) return TRANSITION_NAME;
        var name = 'transition', transitionName;
        var el = document.body;
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
        var el = DOM.insertAfter(elem.cloneNode(true), elem);

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
 *  - 实现 jQuery Effects 的 queue / specialEasing / += / 等特性
 *
 * NOTES:
 *  - 与 emile 相比，增加了 borderStyle, 使得 border: 5px solid #ccc 能从无到有，正确显示
 *  - api 借鉴了 YUI, jQuery 以及 http://www.w3.org/TR/css3-transitions/
 *  - 代码实现了借鉴了 Emile.js: http://github.com/madrobby/emile
 *  - 借鉴 yui3 ，中央定时器，否则 ie6 内存泄露？
 */
