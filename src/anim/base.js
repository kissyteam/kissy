/**
 * @module   anim
 * @author   lifesinger@gmail.com
 */
KISSY.add('anim/base', function(S, DOM, Event, Easing, UA, undefined) {

    var PARSE_FLOAT = parseFloat,
        EventTarget = S.require("event/target"),
        parseEl = DOM.create('<div>'),
        PROPS = ('backgroundColor borderBottomColor borderBottomWidth borderBottomStyle borderLeftColor borderLeftWidth borderLeftStyle ' +
            'borderRightColor borderRightWidth borderRightStyle borderSpacing borderTopColor borderTopWidth borderTopStyle bottom color ' +
            'font fontFamily fontSize fontWeight height left letterSpacing lineHeight marginBottom marginLeft marginRight marginTop maxHeight ' +
            'maxWidth minHeight minWidth opacity outlineColor outlineOffset outlineWidth paddingBottom paddingLeft ' +
            'paddingRight paddingTop right textIndent top width wordSpacing zIndex').split(' '),

        STEP_INTERVAL = 13,
        OPACITY = 'opacity',
        NONE = 'none',
        PROPERTY = 'Property',

        EVENT_START = 'start',
        EVENT_STEP = 'step',
        EVENT_COMPLETE = 'complete',

        defaultConfig = {
            duration: 1,
            easing: 'easeNone',
            nativeSupport: true // 优先使用原生 css3 transition
            //queue: true
        };

    /**
     * Anim Class
     * @constructor
     */
    function Anim(elem, props, duration, easing, callback, nativeSupport) {
        // ignore non-exist element
        if (!(elem = DOM.get(elem))) return undefined;

        // factory or constructor
        if (!(this instanceof Anim)) {
            return new Anim(elem, props, duration, easing, callback, nativeSupport);
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
            style = String(S.param(style, ';'))
                .replace(/=/g, ':')
                .replace(/%23/g, '#')// 还原颜色值中的 #
                .replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase(); // backgroundColor => background-color
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
            if (duration) (config.duration = PARSE_FLOAT(duration) || 1);
            if (S['isString'](easing) || S.isFunction(easing)) config.easing = easing;
            if (S.isFunction(callback)) config.complete = callback;
            if (nativeSupport !== undefined) config.nativeSupport = nativeSupport;
        }
        self.config = config;

        /**
         * detect browser native animation(CSS3 transition) support
         */
        if (config.nativeSupport && getNativeTransitionName()
            && S['isString']((easing = config.easing))) {

            // 当 easing 是支持的字串时，才激活 native transition
            if (/cubic-bezier\([\s\d.,]+\)/.test(easing) ||
                (easing = Easing.NativeTimeFunction[easing])) {
                config.easing = easing;
                self.transitionName = getNativeTransitionName();
            }
        }


        /**
         * timer
         */
        //self.timer = undefined;

        // register callback
        if (S.isFunction(callback)) {
            self.on(EVENT_COMPLETE, callback);
        }
        return undefined;
    }

    S.augment(Anim, EventTarget, {

        run: function() {
            var self = this, config = self.config,
                elem = self.domEl,
                duration, easing, start, finish,
                target = self.props,
                source = {}, prop, go;

            for (prop in target) source[prop] = parse(DOM.css(elem, prop));
            if (self.fire(EVENT_START) === false) return;
            self.stop(); // 先停止掉正在运行的动画

            if (self.transitionName) {
                self._nativeRun();
            } else {
                duration = config.duration * 1000;
                start = S.now();
                finish = start + duration;

                easing = config.easing;
                if (S['isString'](easing)) {
                    easing = Easing[easing] || Easing.easeNone;
                }

                self.timer = S.later((go = function () {
                    var time = S.now(),
                        t = time > finish ? 1 : (time - start) / duration,
                        sp, tp, b;

                    for (prop in target) {
                        sp = source[prop];
                        tp = target[prop];

                        // 比如 sp = { v: 0, u: 'pt'} ( width: 0 时，默认单位是 pt )
                        // 这时要把 sp 的单位调整为和 tp 的一致
                        if (tp.v == 0) tp.u = sp.u;

                        // 单位不一样时，以 tp.u 的为主，同时 sp 从 0 开始
                        // 比如：ie 下 border-width 默认为 medium
                        if (sp.u !== tp.u) sp.v = 0;

                        // go
                        DOM.css(elem, prop, tp.f(sp.v, tp.v, easing(t)) + tp.u);
                    }

                    if ((self.fire(EVENT_STEP) === false) || (b = time > finish)) {
                        self.stop();
                        // complete 事件只在动画到达最后一帧时才触发
                        if (b) self.fire(EVENT_COMPLETE);
                    }
                }), STEP_INTERVAL, true);

                // 立刻执行
                go();
            }

            return self;
        },

        _nativeRun: function() {
            var self = this, config = self.config,
                elem = self.domEl,
                target = self.props,
                duration = config.duration * 1000,
                easing = config.easing,
                prefix = self.transitionName,
                transition = {};

            S.log('Amin uses native transition.');

            // using CSS transition process
            transition[prefix + 'Property'] = 'all';
            transition[prefix + 'Duration'] = duration + 'ms';
            transition[prefix + 'TimingFunction'] = easing;

            // set the CSS transition style
            DOM.css(elem, transition);

            // set the final style value (need some hack for opera)
            S.later(function() {
                setToFinal(elem, target, self.targetStyle);
            }, 0);

            // after duration time, fire the stop function
            S.later(function() {
                self.stop(true);
            }, duration);
        },

        stop: function(finish) {
            var self = this;

            if (self.transitionName) {
                self._nativeStop(finish);
            }
            else {
                // 停止定时器
                if (self.timer) {
                    self.timer.cancel();
                    self.timer = undefined;
                }

                // 直接设置到最终样式
                if (finish) {
                    setToFinal(self.domEl, self.props, self.targetStyle);
                    self.fire(EVENT_COMPLETE);
                }
            }

            return self;
        },

        _nativeStop: function(finish) {
            var self = this, elem = self.domEl,
                prefix = self.transitionName,
                props = self.props, prop;

            // handle for the CSS transition
            if (finish) {
                // CSS transition value remove should come first
                DOM.css(elem, prefix + PROPERTY, NONE);
                self.fire(EVENT_COMPLETE);
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
        return !!getNativeTransitionName();
    };


    function getNativeTransitionName() {
        var name = 'transition', transitionName;

        if (parseEl.style[name] !== undefined) {
            transitionName = name;
        } else {
            S.each(['Webkit', 'Moz', 'O'], function(item) {
                if (parseEl.style[(name = item + 'Transition')] !== undefined) {
                    transitionName = name;
                    return false;
                }
            });
        }
        getNativeTransitionName = function() {
            return transitionName;
        };
        return transitionName;
    }

    function setToFinal(elem, props, style) {
        if (UA['ie'] && style.indexOf(OPACITY) > -1) {
            DOM.css(elem, OPACITY, props[OPACITY].v);
        }
        elem.style.cssText += ';' + style;
    }

    function normalize(style) {
        var css, rules = { }, i = PROPS.length, v;
        parseEl.innerHTML = '<div style="' + style + '"></div>';
        css = parseEl.firstChild.style;
        while (i--) if ((v = css[PROPS[i]])) rules[PROPS[i]] = parse(v);
        return rules;
    }

    function parse(val) {
        var num = PARSE_FLOAT(val), unit = (val + '').replace(/^[-\d.]+/, '');
        return isNaN(num) ? { v: unit, u: '', f: colorEtc } : { v: num, u: unit, f: interpolate };
    }

    function interpolate(source, target, pos) {
        return (source + (target - source) * pos).toFixed(3);
    }

    function colorEtc(source, target, pos) {
        var i = 2, j, c, tmp, v = [], r = [];

        while (j = 3,c = arguments[i - 1],i--) {
            if (s(c, 0, 4) === 'rgb(') {
                c = c.match(/\d+/g);
                while (j--) v.push(~~c[j]);
            }
            else if (s(c, 0, undefined) === '#') {
                if (c.length === 4) c = '#' + s(c, 1, undefined)
                    + s(c, 1, undefined) + s(c, 2, undefined)
                    + s(c, 2, undefined) + s(c, 3, undefined) + s(c, 3, undefined);
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

    return Anim;
}, {
    requires:["dom","event","anim/easing","ua"]
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
