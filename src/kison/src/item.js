/**
 * Item for KISON
 * @author yiminghe@gmail.com
 */
KISSY.add("kison/item", function (S, Base) {

    function Item() {
        Item.superclass.constructor.apply(this, arguments);
    }


    S.extend(Item, Base, {

        equals: function (other, ignoreLookAhead) {
            var self = this;
            if (!other.get("production").equals(self.get("production"))) {
                return false;
            }
            if (other.get("dotPosition") != self.get("dotPosition")) {
                return false;
            }
            if (!ignoreLookAhead) {
                if (!S.equals(self.get("lookAhead"), other.get("lookAhead"))) {
                    return false;
                }
            }
            return true;
        },

        toString: function (ignoreLookAhead) {
            return this.get("production")
                .toString(this.get("dotPosition"))
                + (ignoreLookAhead ? "" :
                ("," + S.keys(this.get("lookAhead")).join("/")));
        },

        addLookAhead: function (ls) {
            var lookAhead = this.get("lookAhead"), ret = 0;
            S.each(ls, function (_, l) {
                if (!lookAhead[l]) {
                    lookAhead[l] = 1;
                    ret = 1;
                }
            });
            return ret;
        }

    }, {
        ATTRS: {
            production: {},
            dotPosition: {
                value: 0
            },
            lookAhead: {
                /*
                 2012-07-27
                 improve performance,use object to compare( equal )
                 and find( indexOf )
                 instead of array
                 */
                value: {}
            }
        }
    });

    return Item;
}, {
    requires: ['base']
});