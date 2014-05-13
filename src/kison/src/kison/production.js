/**
 * @ignore
 * Production for KISON
 * @author yiminghe@gmail.com
 */
KISSY.add(function (S, require) {
    var Base = require('base');
    var util = require('util');

    function equals(s1, s2) {
        if (s1.length !== s2.length) {
            return false;
        }
        for (var i = 0; i < s1.length; i++) {
            if (s1[i] !== s2[i]) {
                return false;
            }
        }
        return true;
    }

    /**
     * production for grammar
     * @class KISSY.Kison.Production
     */
    return Base.extend({
        equals: function (other) {
            var self = this;
            if (!equals(other.get('rhs'), self.get('rhs'))) {
                return false;
            }
            return other.get('symbol') === self.get('symbol');

        },

        toString: function (dot) {
            var rhsStr = '';
            var rhs = this.get('rhs');
            util.each(rhs, function (r, index) {
                if (index === dot) {
                    rhsStr += ' . ';
                }
                rhsStr += r + ' ';
            });
            if (dot === rhs.length) {
                rhsStr += ' . ';
            }
            return this.get('symbol') + ' => ' + rhsStr;
        }
    }, {
        ATTRS: {
            firsts: {
                valueFn: function () {
                    return {};
                }
            },
            follows: {
                valueFn: function () {
                    return [];
                }
            },
            symbol: {},
            rhs: {
                valueFn: function () {
                    return [];
                }
            },
            nullable: {
                value: false
            },
            action: {
                // action for this production
            }
        }
    });
});