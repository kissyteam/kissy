/**
 * @ignore
 * special patch for anim backgroundPosition
 * @author yiminghe@gmail.com
 */
KISSY.add(function (S, require) {
    var Dom = require('dom');
    var Fx = require('./fx');

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

        load: function () {
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

        interpolate: function (from, to, pos) {
            var unit = this.unit, interpolate = BackgroundPositionFx.superclass.interpolate;
            return interpolate(from[0], to[0], pos) + unit[0] + ' ' +
                interpolate(from[1], to[1], pos) + unit[1];
        },

        cur: function () {
            return Dom.css(this.anim.config.node, 'backgroundPosition');
        },

        update: function () {
            var self = this,
                prop = self.prop,
                node = self.anim.config.node,
                from = self.from,
                to = self.to,
                val = self.interpolate(from, to, self.pos);
            Dom.css(node, prop, val);
        }

    });

    Fx.Factories['backgroundPosition'] = BackgroundPositionFx;

    return BackgroundPositionFx;

});