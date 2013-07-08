/**
 * @ignore
 * animate on single property
 * @author yiminghe@gmail.com
 */
KISSY.add('anim/timer/fx', function (S, Dom, undefined) {

    /**
     * basic animation about single css property or element attribute
     * @class KISSY.Anim.Fx
     * @private
     */
    function Fx(cfg) {
        this.load(cfg);
    }

    Fx.prototype = {

        // implemented by KISSY
        isBasicFx: 1,

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
         * @param {Number} pos
         */
        frame: function (pos) {
            var self = this;
            self.pos = pos;
            self.update();
            self.finished = self.finished || pos == 1;
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
            if (S.isNumber(from) && S.isNumber(to)) {
                return /**@type Number @ignore*/(from + (to - from) * pos).toFixed(3);
            } else {
                return /**@type Number @ignore*/undefined;
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
                node = anim.node,
                from = self.from,
                to = self.to,
                val = self.interpolate(from, to, self.pos);

            if (val === /**@type Number @ignore*/undefined) {
                // 插值出错，直接设置为最终值
                if (!self.finished) {
                    self.finished = 1;
                    Dom.css(node, prop, to);
                    S.log(prop + ' update directly ! : ' + val + ' : ' + from + ' : ' + to);
                }
            } else {
                val += self.unit;
                if (isAttr(node, prop)) {
                    Dom.attr(node, prop, val, 1);
                } else {
                    // S.log(self.prop + ' update: ' + val);
                    Dom.css(node, prop, val);
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
                node = self.anim.node;
            if (isAttr(node, prop)) {
                return Dom.attr(node, prop, undefined, 1);
            }
            var parsed,
                r = Dom.css(node, prop);
            // Empty strings, null, undefined and 'auto' are converted to 0,
            // complex values such as 'rotate(1rad)' or '0px 10px' are returned as is,
            // simple values such as '10px' are parsed to Float.
            return isNaN(parsed = parseFloat(r)) ?
                !r || r === 'auto' ? 0 : r
                : parsed;
        }
    };

    function isAttr(node, prop) {
        // support scrollTop/Left now!
        if ((!node.style || node.style[ prop ] == null) &&
            Dom.attr(node, prop, undefined, 1) != null) {
            return 1;
        }
        return 0;
    }

    function getPos(anim, propData) {
        var t = S.now(),
            runTime,
            startTime = anim.startTime,
            delay = propData.delay,
            duration = propData.duration;
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

    Fx.getPos = getPos;

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
 */