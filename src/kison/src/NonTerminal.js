KISSY.add("NonTerminal", function (S, Base) {

    function NonTerminal() {

    }

    S.extend(NonTerminal, Base, {

    }, {
        ATTRS:{
            productions:{
                value:[]
            },
            firsts:{
                value:{}
            },
            symbol:{

            },
            nullAble:{
                value:false
            }
        }
    });

    return NonTerminal;

}, {
    requires:['base']
});