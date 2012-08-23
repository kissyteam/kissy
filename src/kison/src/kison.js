/**
 * Parser generator for kissy.
 * @author yiminghe@gmail.com
 */
KISSY.add("kison", function (S, Grammar, Production, Lexer) {

    var Kison = {};
    Kison.Grammar = Grammar;
    Kison.Production = Production;
    Kison.Lexer = Lexer;
    return Kison;

}, {
    requires:['kison/grammar', 'kison/production','kison/lexer']
});