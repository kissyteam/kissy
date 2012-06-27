KISSY.add("kison/Production", function (S, Base) {

    function Production() {
        Production.superclass.constructor.apply(this, arguments);
    }

    S.extend(Production, Base, {

        equals:function (other) {
            var self = this;
            if (!S.equals(other.get("rhs"), self.get("rhs"))) {
                return false;
            }
            if (other.get("symbol") != self.get("symbol")) {
                return false;
            }
            return true;
        },

        toString:function (dot) {
            var rhsStr = "";
            var rhs = this.get("rhs");
            S.each(rhs, function (r, index) {
                if (index == dot) {
                    rhsStr += ".";
                }
                rhsStr += r;
            });
            if (dot == rhs.length) {
                rhsStr += ".";
            }
            return this.get("symbol") + "=>" + rhsStr;
        }

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