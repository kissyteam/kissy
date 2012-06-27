KISSY.add("kison/Item", function (S, Base) {

    function Item() {
        Item.superclass.constructor.apply(this, arguments);
    }


    S.extend(Item, Base, {

        equals:function (other) {
            var self = this;
            if (!other.get("production").equals(self.get("production"))) {
                return false;
            }
            if (other.get("dotPosition") != self.get("dotPosition")) {
                return false;
            }
            if (!S.equals(self.get("lookAhead"), other.get("lookAhead"))) {
                return false;
            }
            return true;
        },

        toString:function () {
            return this.get("production").toString(this.get("dotPosition")) +
                "," + this.get("lookAhead").join("/");
        }

    }, {
        ATTRS:{
            production:{},
            dotPosition:{
                value:0
            },
            lookAhead:{
                value:[]
            }
        }
    });

    return Item;
}, {
    requires:['base']
});