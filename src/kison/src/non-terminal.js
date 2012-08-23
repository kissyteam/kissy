/**
 * NonTerminal Set for KISON
 * @author yiminghe@gmail.com
 */
KISSY.add("kison/non-terminal", function (S, Base) {

    function NonTerminal() {
        NonTerminal.superclass.constructor.apply(this, arguments);
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