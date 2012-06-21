KISSY.add("ItemSet", function (S, Base) {
    function ItemSet() {

    }

    S.extend(ItemSet, Base, {

        addItem:function (item) {
            this.get("items").push(item);
        },

        size:function () {
            return this.get("items").length;
        }

    }, {
        items:{
            value:[]
        }
    });

    return ItemSet;
}, {
    requires:['base']
})