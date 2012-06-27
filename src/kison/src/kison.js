/**
 * Parser generator for kissy.
 * @author yiminghe@gmail.com
 */
KISSY.add("kison", function (S, Grammar, Production) {

    var Kison = {};
    Kison.Grammar = Grammar;
    Kison.Production = Production;
    return Kison;

}, {
    requires:['kison/Grammar', 'kison/Production']
});