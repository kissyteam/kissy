/*
Copyright 2014, KISSY v5.0.0
MIT Licensed
build time: Jun 5 23:16
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
                _propData.duration *= 1000;
                _propData.delay *= 1000;
                if (typeof _propData.easing === 'string') {
                    _propData.easing = Easing.toFn(_propData.easing);
                }
            });
            util.each(SHORT_HANDS, function (shortHands, p) {
                var origin, _propData = _propsData[p], val;
                if (_propData) {
                    val = _propData.value;
                    origin = {};
                    util.each(shortHands, function (sh) {
                        origin[sh] = Dom.css(node, sh);
                    });
                    Dom.css(node, p, val);
                    util.each(origin, function (val, sh) {
                        if (!(sh in _propsData)) {
                            _propsData[sh] = util.merge(_propData, { value: Dom.css(node, sh) });
                        }
                        Dom.css(node, sh, val);
                    });
                    delete _propsData[p];
                }
            });
            var prop, _propData, val, to, from, propCfg, fx, isCustomFx = 0, unit, parts;
            if (util.isPlainObject(node)) {
                isCustomFx = 1;
            }
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
                    unit = parts[3];
                    if (unit && unit !== 'px' && from) {
                        var tmpCur = 0, to2 = to;
                        do {
                            ++to2;
                            Dom.css(node, prop, to2 + unit);
                            tmpCur = fx.cur();
                        } while (tmpCur === 0);
                        from = to2 / tmpCur * from;
                        Dom.css(node, prop, from + unit);
                    }
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
        frame: function () {
            var self = this, prop, end = 1, fx, _propData, _propsData = self._propsData;
            for (prop in _propsData) {
                _propData = _propsData[prop];
                fx = _propData.fx;
                fx.frame();
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
                self.stop(end);
            }
        },
        doStop: function (finish) {
            var self = this, prop, fx, _propData, _propsData = self._propsData;
            AM.stop(self);
            if (finish) {
                for (prop in _propsData) {
                    _propData = _propsData[prop];
                    fx = _propData.fx;
                    if (fx) {
                        fx.frame(1);
                    }
                }
            }
        },
        doStart: function () {
            AM.start(this);
        }
    });
    TimerAnim.Easing = Easing;
    TimerAnim.Fx = Fx;
    util.mix(TimerAnim, AnimBase.Statics);
    module.exports = S.Anim = TimerAnim;
});



KISSY.add('anim/timer/easing', [], function (S, require, exports, module) {
    var PI = Math.PI, pow = Math.pow, sin = Math.sin, parseNumber = parseFloat, CUBIC_BEZIER_REG = /^cubic-bezier\(([^,]+),([^,]+),([^,]+),([^,]+)\)$/i, BACK_CONST = 1.70158;
    function easeNone(t) {
        return t;
    }
    var Easing = {
            swing: function (t) {
                return 0.5 - Math.cos(t * PI) / 2;
            },
            easeNone: easeNone,
            linear: easeNone,
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
            easeOut: function (t) {
                return (2 - t) * t;
            },
            easeBoth: function (t) {
                return (t *= 2) < 1 ? 0.5 * t * t : 0.5 * (1 - --t * (t - 2));
            },
            easeInStrong: function (t) {
                return t * t * t * t;
            },
            easeOutStrong: function (t) {
                return 1 - --t * t * t * t;
            },
            easeBothStrong: function (t) {
                return (t *= 2) < 1 ? 0.5 * t * t * t * t : 0.5 * (2 - (t -= 2) * t * t * t);
            },
            elasticIn: function (t) {
                var p = 0.3, s = p / 4;
                if (t === 0 || t === 1) {
                    return t;
                }
                return 0 - pow(2, 10 * (t -= 1)) * sin((t - s) * (2 * PI) / p);
            },
            elasticOut: function (t) {
                var p = 0.3, s = p / 4;
                if (t === 0 || t === 1) {
                    return t;
                }
                return pow(2, -10 * t) * sin((t - s) * (2 * PI) / p) + 1;
            },
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
            backIn: function (t) {
                if (t === 1) {
                    t -= 0.001;
                }
                return t * t * ((BACK_CONST + 1) * t - BACK_CONST);
            },
            backOut: function (t) {
                return (t -= 1) * t * ((BACK_CONST + 1) * t + BACK_CONST) + 1;
            },
            backBoth: function (t) {
                var s = BACK_CONST;
                var m = (s *= 1.525) + 1;
                if ((t *= 2) < 1) {
                    return 0.5 * (t * t * (m * t - s));
                }
                return 0.5 * ((t -= 2) * t * (m * t + s) + 2);
            },
            bounceIn: function (t) {
                return 1 - Easing.bounceOut(1 - t);
            },
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
            bounceBoth: function (t) {
                if (t < 0.5) {
                    return Easing.bounceIn(t * 2) * 0.5;
                }
                return Easing.bounceOut(t * 2 - 1) * 0.5 + 0.5;
            }
        };
    var ZERO_LIMIT = 0.000001, abs = Math.abs;
    function cubicBezierFunction(p1x, p1y, p2x, p2y) {
        var ax = 3 * p1x - 3 * p2x + 1, bx = 3 * p2x - 6 * p1x, cx = 3 * p1x;
        var ay = 3 * p1y - 3 * p2y + 1, by = 3 * p2y - 6 * p1y, cy = 3 * p1y;
        function sampleCurveDerivativeX(t) {
            return (3 * ax * t + 2 * bx) * t + cx;
        }
        function sampleCurveX(t) {
            return ((ax * t + bx) * t + cx) * t;
        }
        function sampleCurveY(t) {
            return ((ay * t + by) * t + cy) * t;
        }
        function solveCurveX(x) {
            var t2 = x, derivative, x2;
            for (var i = 0; i < 8; i++) {
                x2 = sampleCurveX(t2) - x;
                if (abs(x2) < ZERO_LIMIT) {
                    return t2;
                }
                derivative = sampleCurveDerivativeX(t2);
                if (abs(derivative) < ZERO_LIMIT) {
                    break;
                }
                t2 -= x2 / derivative;
            }
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
            }
            return t2;
        }
        function solve(x) {
            return sampleCurveY(solveCurveX(x));
        }
        return solve;
    }
    module.exports = Easing;
});
KISSY.add('anim/timer/manager', ['util'], function (S, require, exports, module) {
    var util = require('util');
    var stamp = util.stamp, win = S.Env.host, INTERVAL = 15, requestAnimationFrameFn, cancelAnimationFrameFn;
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
    }
    module.exports = {
        runnings: {},
        timer: null,
        start: function (anim) {
            var self = this, kv = stamp(anim);
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
            var self = this, kv = stamp(anim);
            delete self.runnings[kv];
            if (util.isEmptyObject(self.runnings)) {
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
                self.timer = requestAnimationFrameFn(function run() {
                    if (self.runFrames()) {
                        self.stopTimer();
                    } else {
                        self.timer = requestAnimationFrameFn(run);
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
            var self = this, r, flag, runnings = self.runnings;
            for (r in runnings) {
                runnings[r].frame();
            }
            for (r in runnings) {
                flag = 0;
                break;
            }
            return flag === undefined;
        }
    };
});
KISSY.add('anim/timer/fx', [
    'util',
    'dom'
], function (S, require, exports, module) {
    var util = require('util');
    var logger = S.getLogger('s/aim/timer/fx');
    var Dom = require('dom');
    var undef;
    function load(self, cfg) {
        util.mix(self, cfg);
        self.pos = 0;
        self.unit = self.unit || '';
    }
    function Fx(cfg) {
        load(this, cfg);
    }
    Fx.prototype = {
        isCustomFx: 0,
        constructor: Fx,
        load: function (cfg) {
            load(this, cfg);
        },
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
                if (val === undef) {
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
        interpolate: function (from, to, pos) {
            if (typeof from === 'number' && typeof to === 'number') {
                return Math.round((from + (to - from) * pos) * 100000) / 100000;
            } else {
                return null;
            }
        },
        cur: function () {
            var self = this, prop = self.prop, type, parsed, r, node = self.anim.node;
            if (self.isCustomFx) {
                return node[prop] || 0;
            }
            if (!(type = self.type)) {
                type = self.type = isAttr(node, prop) ? 'attr' : 'css';
            }
            if (type === 'attr') {
                r = Dom.attr(node, prop, undef, 1);
            } else {
                r = Dom.css(node, prop);
            }
            return isNaN(parsed = parseFloat(r)) ? !r || r === 'auto' ? 0 : r : parsed;
        }
    };
    function isAttr(node, prop) {
        if ((!node.style || node.style[prop] == null) && Dom.attr(node, prop, undef, 1) != null) {
            return 1;
        }
        return 0;
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
    module.exports = Fx;
});
KISSY.add('anim/timer/color', [
    'util',
    './fx'
], function (S, require, exports, module) {
    var logger = S.getLogger('s/anim/timer/color');
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
        ];
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
        }
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
    module.exports = ColorFx;
});
KISSY.add('anim/timer/transform', [
    'util',
    'feature',
    'dom',
    './fx'
], function (S, require, exports, module) {
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
    }
    function decomposeMatrix(matrix) {
        matrix = toMatrixArray(matrix);
        var scaleX, scaleY, skew, A = matrix[0], B = matrix[1], C = matrix[2], D = matrix[3];
        if (A * D - B * C) {
            scaleX = Math.sqrt(A * A + B * B);
            skew = (A * C + B * D) / (A * D - C * B);
            scaleY = (A * D - B * C) / scaleX;
            if (A * D < B * C) {
                skew = -skew;
                scaleX = -scaleX;
            }
        } else {
            scaleX = scaleY = skew = 0;
        }
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
        var trim = util.trim, i = -1, l = transform.length - 1, split, prop, val, ret = defaultDecompose();
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
            TransformFx.superclass.load.apply(self, arguments);
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
    module.exports = TransformFx;
});

KISSY.add('anim/timer/short-hand', [], function (S, require, exports, module) {
    module.exports = {
        background: ['backgroundColor'],
        border: [
            'borderBottomWidth',
            'borderLeftWidth',
            'borderRightWidth',
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
