/**
 * @ignore
 * NonTerminal Set for KISON
 * @author yiminghe@gmail.com
 */
KISSY.add(function (S, require) {
    var Base = require('base');

    /**
     * non-terminal symbol for grammar
     * @class KISSY.Kison.NonTerminal
     */
    return Base.extend({}, {
        ATTRS: {
            productions: {
                valueFn: function () {
                    return [];
                }
            },
            firsts: {
                valueFn: function () {
                    return {};
                }
            },
            symbol: {

            },
            nullable: {
                value: false
            }
        }
    });
});