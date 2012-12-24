/*
Copyright 2012, KISSY UI Library v1.30
MIT Licensed
build time: Dec 20 22:23
*/
/**
 * @ignore
 * @fileOverview anim
 */
KISSY.add('anim', function (S, Anim, Easing) {
    Anim.Easing = Easing;
    S.mix(S, {
        Anim:Anim,
        Easing:Anim.Easing
    });
    return Anim;
}, {
    requires:['anim/base', 'anim/easing', 'anim/color', 'anim/background-position']
});/**
 * @ignore
 * @fileOverview special patch for anim backgroundPosition
 * @author yiminghe@gmail.com
 */
KISSY.add('anim/background-position', function (S, DOM, Anim, Fx) {

    function numeric(bp) {
        bp = bp.replace(/left|top/g, '0px')
            .replace(/right|bottom/g, '100%')
            .replace(/([0-9\.]+)(\s|\)|$)/g, '$1px$2');
        var res = bp.match(/(-?[0-9\.]+)(px|%|em|pt)\s(-?[0-9\.]+)(px|%|em|pt)/);
        return [parseFloat(res[1]), res[2], parseFloat(res[3]), res[4]];
    }

    function BackgroundPositionFx() {
        BackgroundPositionFx.superclass.constructor.apply(this, arguments);
    }

    S.extend(BackgroundPositionFx, Fx, {

        load:function () {
            var self = this, fromUnit;
            BackgroundPositionFx.superclass.load.apply(self, arguments);
            fromUnit = self.unit = ['px', 'px'];
            if (self.from) {
                var from = numeric(self.from);
                self.from = [from[0], from[2]];
                fromUnit = [from[1], from[3]];
            } else {
                self.from = [0, 0];
            }
            if (self.to) {
                var to = numeric(self.to);
                self.to = [to[0], to[2]];
                self.unit = [to[1], to[3]];
            } else {
                self.to = [0, 0];
            }
            if (fromUnit) {
                if (fromUnit[0] !== self.unit[0] || fromUnit[1] !== self.unit[1]) {
                    S.log('BackgroundPosition x y unit is not same :', 'warn');
                    S.log(fromUnit, 'warn');
                    S.log(self.unit, 'warn');
                }
            }
        },

        interpolate:function (from, to, pos) {
            var unit = this.unit, interpolate = BackgroundPositionFx.superclass.interpolate;
            return interpolate(from[0], to[0], pos) + unit[0] + ' ' +
                interpolate(from[1], to[1], pos) + unit[1];
        },

        cur:function () {
            return DOM.css(this.anim.config.el, 'backgroundPosition');
        },

        update:function () {
            var self = this,
                prop = self.prop,
                el = self.anim.config.el,
                from = self.from,
                to = self.to,
                val = self.interpolate(from, to, self.pos);
            DOM.css(el, prop, val);
        }

    });

    Fx.Factories['backgroundPosition'] = BackgroundPositionFx;

    return BackgroundPositionFx;

}, {
    requires:['dom', './base', './fx']
});/**
 * @ignore
 * @fileOverview animation framework for KISSY
 * @author   yiminghe@gmail.com, lifesinger@gmail.com
 */
KISSY.add('anim/base', function (S, DOM, Event, Easing, AM, Fx, Q) {

    var UA = S.UA,
        camelCase = DOM._camelCase,
        NodeType = DOM.NodeType,
        specialVals = ['hide', 'show', 'toggle'],
    // shorthand css properties
        SHORT_HANDS = {
            // http://www.w3.org/Style/CSS/Tracker/issues/9
            // http://snook.ca/archives/html_and_css/background-position-x-y
            // backgroundPositionX  backgroundPositionY does not support
            background: [
                'backgroundPosition'
            ],
            border: [
                'borderBottomWidth',
                'borderLeftWidth',
                'borderRightWidth',
                // 'borderSpacing', 组合属性？
                'borderTopWidth'
            ],
            'borderBottom': ['borderBottomWidth'],
            'borderLeft': ['borderLeftWidth'],
            borderTop: ['borderTopWidth'],
            borderRight: ['borderRightWidth'],
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
        },
        defaultConfig = {
            duration: 1,
            easing: 'easeNone'
        },
        NUMBER_REG = /^([+\-]=)?([\d+.\-]+)([a-z%]*)$/i;

    Anim.SHORT_HANDS = SHORT_HANDS;

    /**
     * @class KISSY.Anim
     * A class for constructing animation instances.
     * @mixins KISSY.Event.Target
     * @cfg {HTMLElement|window} el html dom node or window
     * (window can only animate scrollTop/scrollLeft)
     * @cfg {Object} props end css style value.
     * @cfg {Number} [duration=1] duration(second) or anim config
     * @cfg {String|Function} [easing='easeNone'] easing fn or string
     * @cfg {Function} [complete] callback function when this animation is complete
     * @cfg {String|Boolean} [queue] current animation's queue, if false then no queue
     */
    function Anim(el, props, duration, easing, complete) {

        if (el.el) {
            var realEl = el.el;
            props = el.props;
            delete el.el;
            delete  el.props;
            return new Anim(realEl, props, el);
        }

        var self = this, config;

        // ignore non-exist element
        if (!(el = DOM.get(el))) {
            return;
        }

        // factory or constructor
        if (!(self instanceof Anim)) {
            return new Anim(el, props, duration, easing, complete);
        }

        // the transition properties
        if (typeof props == 'string') {
            props = S.unparam(String(props), ';', ':');
        } else {
            // clone to prevent collision within multiple instance
            props = S.clone(props);
        }

        // camel case uniformity
        S.each(props, function (v, prop) {
            var camelProp = S.trim(camelCase(prop));
            if (!camelProp) {
                delete props[prop];
            } else if (prop != camelProp) {
                props[camelProp] = props[prop];
                delete props[prop];
            }
        });

        // animation config
        if (S.isPlainObject(duration)) {
            config = S.clone(duration);
        } else {
            config = {
                duration: parseFloat(duration) || undefined,
                easing: easing,
                complete: complete
            };
        }

        config = S.merge(defaultConfig, config);
        config.el = el;
        config.props = props;

        /**
         * config object of current anim instance
         * @type {Object}
         */
        self.config = config;
        self._duration = config.duration * 1000;

        // domEl deprecated!
        self['domEl'] = el;
        // self.props = props;

        // 实例属性
        self._backupProps = {};
        self._fxs = {};

        // register complete
        self.on('complete', onComplete);
    }


    function onComplete(e) {
        var self = this,
            _backupProps,
            complete,
            config = self.config;

        // only recover after complete anim
        if (!S.isEmptyObject(_backupProps = self._backupProps)) {
            DOM.css(config.el, _backupProps);
        }

        if (complete = config.complete) {
            complete.call(self, e);
        }
    }

    function runInternal() {
        var self = this,
            config = self.config,
            _backupProps = self._backupProps,
            el = config.el,
            elStyle,
            hidden,
            val,
            prop,
            specialEasing = (config['specialEasing'] || {}),
            fxs = self._fxs,
            props = config.props;

        // 进入该函数即代表执行（q[0] 已经是 ...）
        saveRunning(self);

        if (self.fire('beforeStart') === false) {
            // no need to invoke complete
            self.stop(0);
            return;
        }

        if (el.nodeType == NodeType.ELEMENT_NODE) {
            hidden = (DOM.css(el, 'display') === 'none');
            for (prop in props) {
                val = props[prop];
                // 直接结束
                if (val == 'hide' && hidden || val == 'show' && !hidden) {
                    // need to invoke complete
                    self.stop(1);
                    return;
                }
            }
        }

        // 放在前面，设置 overflow hidden，否则后面 ie6  取 width/height 初值导致错误
        // <div style='width:0'><div style='width:100px'></div></div>
        if (el.nodeType == NodeType.ELEMENT_NODE &&
            (props.width || props.height)) {
            // Make sure that nothing sneaks out
            // Record all 3 overflow attributes because IE does not
            // change the overflow attribute when overflowX and
            // overflowY are set to the same value
            elStyle = el.style;
            S.mix(_backupProps, {
                overflow: elStyle.overflow,
                'overflow-x': elStyle.overflowX,
                'overflow-y': elStyle.overflowY
            });
            elStyle.overflow = 'hidden';
            // inline element should has layout/inline-block
            if (DOM.css(el, 'display') === 'inline' &&
                DOM.css(el, 'float') === 'none') {
                if (UA['ie']) {
                    elStyle.zoom = 1;
                } else {
                    elStyle.display = 'inline-block';
                }
            }
        }

        // 分离 easing
        S.each(props, function (val, prop) {
            var easing;
            if (S.isArray(val)) {
                easing = specialEasing[prop] = val[1];
                props[prop] = val[0];
            } else {
                easing = specialEasing[prop] = (specialEasing[prop] || config.easing);
            }
            if (typeof easing == 'string') {
                easing = specialEasing[prop] = Easing[easing];
            }
            specialEasing[prop] = easing || Easing['easeNone'];
        });


        // 扩展分属性
        S.each(SHORT_HANDS, function (shortHands, p) {
            var origin,
                val;
            if (val = props[p]) {
                origin = {};
                S.each(shortHands, function (sh) {
                    // 得到原始分属性之前值
                    origin[sh] = DOM.css(el, sh);
                    specialEasing[sh] = specialEasing[p];
                });
                DOM.css(el, p, val);
                S.each(origin, function (val, sh) {
                    // 得到期待的分属性最后值
                    props[sh] = DOM.css(el, sh);
                    // 还原
                    DOM.css(el, sh, val);
                });
                // 删除复合属性
                delete props[p];
            }
        });

        // 取得单位，并对单个属性构建 Fx 对象
        for (prop in props) {

            val = S.trim(props[prop]);

            var to,
                from,
                propCfg = {
                    prop: prop,
                    anim: self,
                    easing: specialEasing[prop]
                },
                fx = Fx.getFx(propCfg);

            // hide/show/toggle : special treat!
            if (S.inArray(val, specialVals)) {
                // backup original inline css value
                _backupProps[prop] = DOM.style(el, prop);
                if (val == 'toggle') {
                    val = hidden ? 'show' : 'hide';
                }
                if (val == 'hide') {
                    to = 0;
                    from = fx.cur();
                    // 执行完后隐藏
                    _backupProps.display = 'none';
                } else {
                    from = 0;
                    to = fx.cur();
                    // prevent flash of content
                    DOM.css(el, prop, from);
                    DOM.show(el);
                }
                val = to;
            } else {
                to = val;
                from = fx.cur();
            }

            val += '';

            var unit = '',
                parts = val.match(NUMBER_REG);

            if (parts) {
                to = parseFloat(parts[2]);
                unit = parts[3];

                // 有单位但单位不是 px
                if (unit && unit !== 'px') {
                    DOM.css(el, prop, val);
                    from = (to / fx.cur()) * from;
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
            fxs[prop] = fx;
        }

        self._startTime = S.now();

        AM.start(self);
    }

    Anim.prototype = {

        constructor: Anim,

        /**
         * whether this animation is running
         * @return {Boolean}
         */
        isRunning: function () {
            return isRunning(this);
        },

        /**
         * whether this animation is paused
         * @return {Boolean}
         */
        isPaused: function () {
            return isPaused(this);
        },

        /**
         * pause current anim
         * @chainable
         */
        pause: function () {
            var self = this;
            if (self.isRunning()) {
                self._pauseDiff = S.now() - self._startTime;
                AM.stop(self);
                removeRunning(self);
                savePaused(self);
            }
            return self;
        },

        /**
         * resume current anim
         * @chainable
         */
        resume: function () {
            var self = this;
            if (self.isPaused()) {
                self._startTime = S.now() - self._pauseDiff;
                removePaused(self);
                saveRunning(self);
                AM.start(self);
            }
            return self;
        },

        /**
         * @ignore
         */
        _runInternal: runInternal,

        /**
         * start this animation
         * @chainable
         */
        run: function () {
            var self = this,
                queueName = self.config.queue;

            if (queueName === false) {
                runInternal.call(self);
            } else {
                // 当前动画对象加入队列
                Q.queue(self);
            }

            return self;
        },

        /**
         * @ignore
         */
        _frame: function () {
            var self = this,
                prop,
                config = self.config,
                end = 1,
                c,
                fx,
                fxs = self._fxs;

            for (prop in fxs) {
                // 当前属性没有结束
                if (!((fx = fxs[prop]).finished)) {
                    // 非短路
                    if (config.frame) {
                        c = config.frame(fx);
                    }
                    // 结束
                    if (c == 1 ||
                        // 不执行自带
                        c == 0) {
                        fx.finished = c;
                        end &= c;
                    } else {
                        end &= fx.frame();
                        // 最后通知下
                        if (end && config.frame) {
                            config.frame(fx);
                        }
                    }
                }
            }

            if ((self.fire('step') === false) || end) {
                // complete 事件只在动画到达最后一帧时才触发
                self.stop(end);
            }
        },

        /**
         * stop this animation
         * @param {Boolean} [finish] whether jump to the last position of this animation
         * @chainable
         */
        stop: function (finish) {
            var self = this,
                config = self.config,
                queueName = config.queue,
                prop,
                fx,
                fxs = self._fxs;

            // already stopped
            if (!self.isRunning()) {
                // 从自己的队列中移除
                if (queueName !== false) {
                    Q.remove(self);
                }
                return self;
            }

            if (finish) {
                for (prop in fxs) {
                    // 当前属性没有结束
                    if (!((fx = fxs[prop]).finished)) {
                        // 非短路
                        if (config.frame) {
                            config.frame(fx, 1);
                        } else {
                            fx.frame(1);
                        }
                    }
                }
                self.fire('complete');
            }

            AM.stop(self);

            removeRunning(self);

            if (queueName !== false) {
                // notify next anim to run in the same queue
                Q.dequeue(self);
            }

            return self;
        }
    };

    S.augment(Anim, Event.Target);

    var runningKey = S.guid('ks-anim-unqueued-' + S.now() + '-');

    function saveRunning(anim) {
        var el = anim.config.el,
            allRunning = DOM.data(el, runningKey);
        if (!allRunning) {
            DOM.data(el, runningKey, allRunning = {});
        }
        allRunning[S.stamp(anim)] = anim;
    }

    function removeRunning(anim) {
        var el = anim.config.el,
            allRunning = DOM.data(el, runningKey);
        if (allRunning) {
            delete allRunning[S.stamp(anim)];
            if (S.isEmptyObject(allRunning)) {
                DOM.removeData(el, runningKey);
            }
        }
    }

    function isRunning(anim) {
        var el = anim.config.el,
            allRunning = DOM.data(el, runningKey);
        if (allRunning) {
            return !!allRunning[S.stamp(anim)];
        }
        return 0;
    }


    var pausedKey = S.guid('ks-anim-paused-' + S.now() + '-');

    function savePaused(anim) {
        var el = anim.config.el,
            paused = DOM.data(el, pausedKey);
        if (!paused) {
            DOM.data(el, pausedKey, paused = {});
        }
        paused[S.stamp(anim)] = anim;
    }

    function removePaused(anim) {
        var el = anim.config.el,
            paused = DOM.data(el, pausedKey);
        if (paused) {
            delete paused[S.stamp(anim)];
            if (S.isEmptyObject(paused)) {
                DOM.removeData(el, pausedKey);
            }
        }
    }

    function isPaused(anim) {
        var el = anim.config.el,
            paused = DOM.data(el, pausedKey);
        if (paused) {
            return !!paused[S.stamp(anim)];
        }
        return 0;
    }

    /**
     * stop all the anims currently running
     * @static
     * @param {HTMLElement} el element which anim belongs to
     * @param {Boolean} end whether jump to last position
     * @param {Boolean} clearQueue whether clean current queue
     * @param {String|Boolean} queueName current queue's name to be cleared
     */
    Anim.stop = function (el, end, clearQueue, queueName) {
        if (
        // default queue
            queueName === null ||
                // name of specified queue
                typeof queueName == 'string' ||
                // anims not belong to any queue
                queueName === false
            ) {
            return stopQueue.apply(undefined, arguments);
        }
        // first stop first anim in queues
        if (clearQueue) {
            Q.removeQueues(el);
        }
        var allRunning = DOM.data(el, runningKey),
        // can not stop in for/in , stop will modified allRunning too
            anims = S.merge(allRunning);
        S.each(anims, function (anim) {
            anim.stop(end);
        });
    };


    /**
     * pause all the anims currently running
     * @param {HTMLElement} el element which anim belongs to
     * @param {String|Boolean} queueName current queue's name to be cleared
     * @method pause
     * @member KISSY.Anim
     * @static
     */

    /**
     * resume all the anims currently running
     * @param {HTMLElement} el element which anim belongs to
     * @param {String|Boolean} queueName current queue's name to be cleared
     * @method resume
     * @member KISSY.Anim
     * @static
     */

    S.each(['pause', 'resume'], function (action) {
        Anim[action] = function (el, queueName) {
            if (
            // default queue
                queueName === null ||
                    // name of specified queue
                    typeof queueName == 'string' ||
                    // anims not belong to any queue
                    queueName === false
                ) {
                return pauseResumeQueue(el, queueName, action);
            }
            pauseResumeQueue(el, undefined, action);
        };
    });

    function pauseResumeQueue(el, queueName, action) {
        var allAnims = DOM.data(el, action == 'resume' ? pausedKey : runningKey),
        // can not stop in for/in , stop will modified allRunning too
            anims = S.merge(allAnims);

        S.each(anims, function (anim) {
            if (queueName === undefined ||
                anim.config.queue == queueName) {
                anim[action]();
            }
        });
    }

    /**
     *
     * @param el element which anim belongs to
     * @param queueName queue'name if set to false only remove
     * @param end
     * @param clearQueue
     * @ignore
     */
    function stopQueue(el, end, clearQueue, queueName) {
        if (clearQueue && queueName !== false) {
            Q.removeQueue(el, queueName);
        }
        var allRunning = DOM.data(el, runningKey),
            anims = S.merge(allRunning);
        S.each(anims, function (anim) {
            if (anim.config.queue == queueName) {
                anim.stop(end);
            }
        });
    }

    /**
     * whether el is running anim
     * @param {HTMLElement} el
     * @return {Boolean}
     * @static
     */
    Anim.isRunning = function (el) {
        var allRunning = DOM.data(el, runningKey);
        return allRunning && !S.isEmptyObject(allRunning);
    };

    /**
     * whether el has paused anim
     * @param {HTMLElement} el
     * @return {Boolean}
     * @static
     */
    Anim.isPaused = function (el) {
        var paused = DOM.data(el, pausedKey);
        return paused && !S.isEmptyObject(paused);
    };

    /**
     * @ignore
     */
    Anim.Q = Q;

    if (SHORT_HANDS) {
    }
    return Anim;
}, {
    requires: ['dom', 'event', './easing', './manager', './fx', './queue']
});

/*
 2011-11
 - 重构，抛弃 emile，优化性能，只对需要的属性进行动画
 - 添加 stop/stopQueue/isRunning，支持队列管理

 2011-04
 - 借鉴 yui3 ，中央定时器，否则 ie6 内存泄露？
 - 支持配置 scrollTop/scrollLeft


 TODO:
 - 效率需要提升，当使用 nativeSupport 时仍做了过多动作
 - opera nativeSupport 存在 bug ，浏览器自身 bug ?
 - 实现 jQuery Effects 的 queue / specialEasing / += / 等特性

 NOTES:
 - 与 emile 相比，增加了 borderStyle, 使得 border: 5px solid #ccc 能从无到有，正确显示
 - api 借鉴了 YUI, jQuery 以及 http://www.w3.org/TR/css3-transitions/
 - 代码实现了借鉴了 Emile.js: http://github.com/madrobby/emile *
 */
/**
 * @ignore
 * @fileOverview special patch for making color gradual change
 * @author yiminghe@gmail.com
 */
KISSY.add('anim/color', function (S, DOM, Anim, Fx) {

    var HEX_BASE = 16,

        floor = Math.floor,

        KEYWORDS = {
            'black':[0, 0, 0],
            'silver':[192, 192, 192],
            'gray':[128, 128, 128],
            'white':[255, 255, 255],
            'maroon':[128, 0, 0],
            'red':[255, 0, 0],
            'purple':[128, 0, 128],
            'fuchsia':[255, 0, 255],
            'green':[0, 128, 0],
            'lime':[0, 255, 0],
            'olive':[128, 128, 0],
            'yellow':[255, 255, 0],
            'navy':[0, 0, 128],
            'blue':[0, 0, 255],
            'teal':[0, 128, 128],
            'aqua':[0, 255, 255]
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

    SHORT_HANDS['background'] = SHORT_HANDS['background'] || [];
    SHORT_HANDS['background'].push('backgroundColor');

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
        val = (val + '');
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
        S.log('only allow rgb or hex color string : ' + val, 'warn');
        return [255, 255, 255];
    }

    function ColorFx() {
        ColorFx.superclass.constructor.apply(this, arguments);
    }

    S.extend(ColorFx, Fx, {

        load:function () {
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
                S.log('anim/color unknown value : ' + from);
            }
        }

    });

    S.each(COLORS, function (color) {
        Fx.Factories[color] = ColorFx;
    });

    return ColorFx;

}, {
    requires:['dom', './base', './fx']
});

/*
  TODO
  支持 hsla
   - https://github.com/jquery/jquery-color/blob/master/jquery.color.js
*//**
 * @ignore
 * @fileOverview Easing equation from yui3
 */
KISSY.add('anim/easing', function () {

    // Based on Easing Equations (c) 2003 Robert Penner, all rights reserved.
    // This work is subject to the terms in http://www.robertpenner.com/easing_terms_of_use.html
    // Preview: http://www.robertpenner.com/Easing/easing_demo.html


// 和 YUI 的 Easing 相比，S.Easing 进行了归一化处理，参数调整为：
// @param {Number} t Time value used to compute current value  保留 0 =< t <= 1
// @param {Number} b Starting value  b = 0
// @param {Number} c Delta between start and end values  c = 1
// @param {Number} d Total length of animation d = 1


    var PI = Math.PI,
        pow = Math.pow,
        sin = Math.sin,
        BACK_CONST = 1.70158;
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
        'easeNone': function (t) {
            return t;
        },

        /**
         * Begins slowly and accelerates towards end. (quadratic)
         */
        'easeIn': function (t) {
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
        'bounceBoth': function (t) {
            if (t < .5) {
                return Easing.bounceIn(t * 2) * .5;
            }
            return Easing.bounceOut(t * 2 - 1) * .5 + .5;
        }
    };

    return Easing;
});

/*
 2012-06-04
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
/**
 * @ignore
 * @fileOverview animate on single property
 * @author yiminghe@gmail.com
 */
KISSY.add('anim/fx', function (S, DOM, undefined) {

    /**
     * basic animation about single css property or element attribute
     * @class KISSY.Anim.Fx
     * @private
     */
    function Fx(cfg) {
        this.load(cfg);
    }

    Fx.prototype = {

        constructor: Fx,

        /**
         * reset config.
         * @param cfg
         */
        load: function (cfg) {
            var self = this;
            S.mix(self, cfg);
            self.pos = 0;
            self.unit = self.unit || '';
        },

        /**
         * process current anim frame.
         * @param {Boolean} end whether this anim is ended
         * @return {Number}
         *
         */
        frame: function (end) {
            var self = this,
                anim = self.anim,
                endFlag = 0,
                elapsedTime;
            if (self.finished) {
                return 1;
            }
            var t = S.now(),
                _startTime = anim._startTime,
                duration = anim._duration;
            if (end || t >= duration + _startTime) {
                self.pos = 1;
                endFlag = 1;
            } else {
                elapsedTime = t - _startTime;
                self.pos = self.easing(elapsedTime / duration);
            }
            self.update();
            self.finished = self.finished || endFlag;
            return endFlag;
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
            if (S.isNumber(from) &&
                S.isNumber(to)) {
                return (from + (to - from) * pos).toFixed(3);
            } else {
                return undefined;
            }
        },

        /**
         * update dom according to current frame css value.
         *
         */
        update: function () {
            var self = this,
                anim = self.anim,
                prop = self.prop,
                el = anim.config.el,
                from = self.from,
                to = self.to,
                val = self.interpolate(from, to, self.pos);

            if (val === undefined) {
                // 插值出错，直接设置为最终值
                if (!self.finished) {
                    self.finished = 1;
                    DOM.css(el, prop, to);
                    S.log(prop + ' update directly ! : ' + val + ' : ' + from + ' : ' + to);
                }
            } else {
                val += self.unit;
                if (isAttr(el, prop)) {
                    DOM.attr(el, prop, val, 1);
                } else {
                    // S.log(self.prop + ' update: ' + val);
                    DOM.css(el, prop, val);
                }
            }
        },

        /**
         * current value
         *
         */
        cur: function () {
            var self = this,
                prop = self.prop,
                el = self.anim.config.el;
            if (isAttr(el, prop)) {
                return DOM.attr(el, prop, undefined, 1);
            }
            var parsed,
                r = DOM.css(el, prop);
            // Empty strings, null, undefined and 'auto' are converted to 0,
            // complex values such as 'rotate(1rad)' or '0px 10px' are returned as is,
            // simple values such as '10px' are parsed to Float.
            return isNaN(parsed = parseFloat(r)) ?
                !r || r === 'auto' ? 0 : r
                : parsed;
        }
    };

    function isAttr(el, prop) {
        // support scrollTop/Left now!
        if ((!el.style || el.style[ prop ] == null) &&
            DOM.attr(el, prop, undefined, 1) != null) {
            return 1;
        }
        return 0;
    }

    Fx.Factories = {};

    Fx.getFx = function (cfg) {
        var Constructor = Fx.Factories[cfg.prop] || Fx;
        return new Constructor(cfg);
    };

    return Fx;

}, {
    requires: ['dom']
});
/*
 TODO
 支持 transform ,ie 使用 matrix
 - http://shawphy.com/2011/01/transformation-matrix-in-front-end.html
 - http://www.cnblogs.com/winter-cn/archive/2010/12/29/1919266.html
 - 标准：http://www.zenelements.com/blog/css3-transform/
 - ie: http://www.useragentman.com/IETransformsTranslator/
 - wiki: http://en.wikipedia.org/wiki/Transformation_matrix
 - jq 插件: http://plugins.jquery.com/project/2d-transform
 *//**
 * @ignore
 * @fileOverview single timer for the whole anim module
 * @author yiminghe@gmail.com
 */
KISSY.add('anim/manager', function (S) {
    var stamp = S.stamp;

    return {
        // note in background tab, interval is set to 1s in chrome/firefox
        // no interval change in ie for 15, if interval is less than 15
        // then in background tab interval is changed to 15
        interval: 15,
        runnings: {},
        timer: null,
        start: function (anim) {
            var self = this,
                kv = stamp(anim);
            if (self.runnings[kv]) {
                return;
            }
            self.runnings[kv] = anim;
            self.startTimer();
        },
        stop: function (anim) {
            this.notRun(anim);
        },
        notRun: function (anim) {
            var self = this,
                kv = stamp(anim);
            delete self.runnings[kv];
            if (S.isEmptyObject(self.runnings)) {
                self.stopTimer();
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
                self.timer = setTimeout(function () {
                    if (!self.runFrames()) {
                        self.timer = 0;
                        self.startTimer();
                    } else {
                        self.stopTimer();
                    }
                }, self.interval);
            }
        },
        stopTimer: function () {
            var self = this,
                t = self.timer;
            if (t) {
                clearTimeout(t);
                self.timer = 0;
            }
        },
        runFrames: function () {
            var self = this,
                done = 1,
                r,
                runnings = self.runnings;
            for (r in runnings) {
                done = 0;
                runnings[r]._frame();
            }
            return done;
        }
    };
});
/**
 * @ignore
 *
 * !TODO: deal with https://developers.google.com/chrome/whitepapers/pagevisibility
 *//**
 * @ignore
 * @fileOverview queue of anim objects
 * @author yiminghe@gmail.com
 */
KISSY.add('anim/queue', function (S, DOM) {

    var // 队列集合容器
        queueCollectionKey = S.guid('ks-queue-' + S.now() + '-'),
    // 默认队列
        queueKey = S.guid('ks-queue-' + S.now() + '-'),
    // 当前队列是否有动画正在执行
        processing = '...';

    function getQueue(el, name, readOnly) {
        name = name || queueKey;

        var qu,
            quCollection = DOM.data(el, queueCollectionKey);

        if (!quCollection && !readOnly) {
            DOM.data(el, queueCollectionKey, quCollection = {});
        }

        if (quCollection) {
            qu = quCollection[name];
            if (!qu && !readOnly) {
                qu = quCollection[name] = [];
            }
        }

        return qu;
    }

    function removeQueue(el, name) {
        name = name || queueKey;
        var quCollection = DOM.data(el, queueCollectionKey);
        if (quCollection) {
            delete quCollection[name];
        }
        if (S.isEmptyObject(quCollection)) {
            DOM.removeData(el, queueCollectionKey);
        }
    }

    var q = {

        queueCollectionKey: queueCollectionKey,

        queue: function (anim) {
            var el = anim.config.el,
                name = anim.config.queue,
                qu = getQueue(el, name);
            qu.push(anim);
            if (qu[0] !== processing) {
                q.dequeue(anim);
            }
            return qu;
        },

        remove: function (anim) {
            var el = anim.config.el,
                name = anim.config.queue,
                qu = getQueue(el, name, 1), index;
            if (qu) {
                index = S.indexOf(anim, qu);
                if (index > -1) {
                    qu.splice(index, 1);
                }
            }
        },

        removeQueues: function (el) {
            DOM.removeData(el, queueCollectionKey);
        },

        removeQueue: removeQueue,

        dequeue: function (anim) {
            var el = anim.config.el,
                name = anim.config.queue,
                qu = getQueue(el, name, 1),
                nextAnim = qu && qu.shift();

            if (nextAnim == processing) {
                nextAnim = qu.shift();
            }

            if (nextAnim) {
                qu.unshift(processing);
                nextAnim._runInternal();
            } else {
                // remove queue data
                removeQueue(el, name);
            }
        }

    };
    return q;
}, {
    requires: ['dom']
});
