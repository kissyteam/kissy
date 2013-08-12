/**
 * NonTerminal Set for KISON
 * @author yiminghe@gmail.com
 */
KISSY.add("kison/non-terminal", function (S, Base) {

    return Base.extend({

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
            nullable:{
                value:false
            }
        }
    });
}, {
    requires:['base']
});