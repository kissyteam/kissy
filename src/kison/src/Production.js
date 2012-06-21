KISSY.add("production", function (S, Base) {

    function Production() {
        Production.superclass.constructor.apply(this, arguments);
    }

    S.extend(Production, Base, {



    }, {
        ATTRS:{
            firsts:{
                value:{}
            },
            follows:{
                value:[]
            },
            symbol:{},
            rhs:{
                value:[]
            },
            nullAble:{
                value:false
            }
        }
    });

    return Production;

}, {
    requires:['base']
});