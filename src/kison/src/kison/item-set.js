/**
 * @ignore
 * Item Set for KISON
 * @author yiminghe@gmail.com
 */
KISSY.add(function (S, require) {
    var Base = require('base');
    /**
     * ItemSet for grammar
     * @class KISSY.Kison.ItemSet
     */
    return Base.extend({
        // Insert item by order
        addItem: function (item) {
            var items = this.get('items');
            for (var i = 0; i < items.length; i++) {
                if (items[i].get('production').toString() > item.get('production').toString()) {
                    break;
                }
            }
            items.splice(i, 0, item);
        },

        size: function () {
            return this.get('items').length;
        },

        findItemIndex: function (item, ignoreLookAhead) {
            var oneItems = this.get('items');
            for (var i = 0; i < oneItems.length; i++) {
                if (oneItems[i].equals(item, ignoreLookAhead)) {
                    return i;
                }
            }
            return -1;
        },

        getItemAt: function (index) {
            return this.get('items')[index];
        },

        equals: function (other, ignoreLookAhead) {
            var oneItems = this.get('items'),
                i,
                otherItems = other.get('items');
            if (oneItems.length !== otherItems.length) {
                return false;
            }
            for (i = 0; i < oneItems.length; i++) {
                if (!oneItems[i].equals(otherItems[i], ignoreLookAhead)) {
                    return false;
                }
            }
            return true;
        },
        toString: function (withGoto) {
            var ret = [],
                gotos = this.get('gotos');
            S.each(this.get('items'), function (item) {
                ret.push(item.toString());
            });
            if (withGoto) {
                ret.push('start gotos:');
                S.each(gotos, function (itemSet, symbol) {
                    ret.push(symbol + ' -> ');
                    ret.push(itemSet.toString());
                });
                ret.push('end gotos:');
            }
            return ret.join('\n');
        },

        addReverseGoto: function (symbol, item) {
            var reverseGotos = this.get('reverseGotos');
            reverseGotos[symbol] = reverseGotos[symbol] || [];
            reverseGotos[symbol].push(item);
        }
    }, {
        ATTRS: {
            items: {
                value: []
            },
            gotos: {
                value: {}
            },
            reverseGotos: {
                // 多个来源同一个symbol指向自己
                //{ c: [x,y]}
                value: {}
            }
        }
    });
});