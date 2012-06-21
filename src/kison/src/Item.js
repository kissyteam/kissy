KISSY.add("Item", function (S, Base) {

    function Item() {

    }


    S.extend(Item, Base, {

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
    })

}, {
    requires:['base']
});