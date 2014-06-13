/**
 * @ignore
 * special patch for making color gradual change
 * @author yiminghe@gmail.com
 */
var LoggerManager = require('logger-manager');
var logger = LoggerManager.getLogger('s/anim/timer/color');
var util = require('util');
var Fx = require('./fx');
var HEX_BASE = 16,
    floor = Math.floor,
    KEYWORDS = {
        black: [0, 0, 0],
        silver: [192, 192, 192],
        gray: [128, 128, 128],
        white: [255, 255, 255],
        maroon: [128, 0, 0],
        red: [255, 0, 0],
        purple: [128, 0, 128],
        fuchsia: [255, 0, 255],
        green: [0, 128, 0],
        lime: [0, 255, 0],
        olive: [128, 128, 0],
        yellow: [255, 255, 0],
        navy: [0, 0, 128],
        blue: [0, 0, 255],
        teal: [0, 128, 128],
        aqua: [0, 255, 255]
    },
    RE_RGB = /^rgb\(([0-9]+)\s*,\s*([0-9]+)\s*,\s*([0-9]+)\)$/i,
    RE_RGBA = /^rgba\(([0-9]+)\s*,\s*([0-9]+)\s*,\s*([0-9]+),\s*([0-9]+)\)$/i,
    RE_HEX = /^#?([0-9A-F]{1,2})([0-9A-F]{1,2})([0-9A-F]{1,2})$/i,

    COLORS = [
        'backgroundColor',
        'borderBottomColor',
        'borderLeftColor',
        'borderRightColor',
        'borderTopColor',
        'color',
        'outlineColor'
    ];

//得到颜色的数值表示，红绿蓝数字数组
function numericColor(val) {
    val = (val + '');
    var match;
    if ((match = val.match(RE_RGB))) {
        return [
            parseInt(match[1], 10),
            parseInt(match[2], 10),
            parseInt(match[3], 10)
        ];
    } else if ((match = val.match(RE_RGBA))) {
        return [
            parseInt(match[1], 10),
            parseInt(match[2], 10),
            parseInt(match[3], 10),
            parseInt(match[4], 10)
        ];
    } else if ((match = val.match(RE_HEX))) {
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

    //transparent 或者颜色字符串返回
    logger.warn('only allow rgb or hex color string : ' + val);
    return [255, 255, 255];
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

module.exports = ColorFx;
/*
 refer
 - https://developer.mozilla.org/en-US/docs/Web/CSS/color_value
 */