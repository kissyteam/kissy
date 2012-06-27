KISSY.add("kison/ItemSet", function (S, Base) {
    function ItemSet() {
        ItemSet.superclass.constructor.apply(this, arguments);
    }

    S.extend(ItemSet, Base, {

        addItem:function (item) {
            this.get("items").push(item);
        },

        size:function () {
            return this.get("items").length;
        },

        findItemIndex:function (item) {
            var oneItems = this.get("items");
            for (var i = 0; i < oneItems.length; i++) {
                if (oneItems[i].equals(item)) {
                    return i;
                }
            }
            return -1;
        },

        equals:function (other) {
            var oneItems = this.get("items"),
                i,
                otherItems = other.get("items");
            if (oneItems.length != otherItems.length) {
                return false;
            }
            for (i = 0; i < oneItems.length; i++) {
                if (!oneItems[i].equals(otherItems[i])) {
                    return false;
                }
            }
            return true;
        },
        toString:function () {
            var ret = [];
            S.each(this.get("items"), function (item) {
                ret.push(item.toString());
            });
            return ret.join("\n");
        }

    }, {
        ATTRS:{
            items:{
                value:[]
            },
            gotos:{
                value:{}
            },
            reverseGotos:{
                value:{}
            }
        }
    });

    return ItemSet;
}, {
    requires:['base']
})