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
                'borderSpacing',
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
            var camelProp = camelCase(S.trim(prop.toLowerCase()));
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

        // register callback
        if (config.complete) {
            self.on("complete", config.complete);
        }
    }

    S.augment(Anim, Event.Target, {

        _backupProps:{},

        _fxs:{},

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
                        propEasings[sh] = propEasings[prop];
                    });
                    DOM.css(elem, p, val);
                    for (sh in origin) {
                        // 得到期待的分属性最后值
                        props[sh] = DOM.css(elem, sh);
                        // 还原
                        DOM.css(elem, sh, origin[sh]);
                    }
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
                    unit,
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
                end = 0,
                fxs = self._fxs;

            for (prop in fxs) {
                if (fxs.hasOwnProperty(prop) &&
                    fxs[prop].frame()) {
                    delete fxs[prop];
                }
            }

            if ((self.fire("step") === false) ||
                (end = S.isEmptyObject(fxs))) {
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
