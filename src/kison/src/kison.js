/**
 * Parser generator for kissy.
 * @author yiminghe@gmail.com
 */
KISSY.add("kison", function (S, Grammar, Production, Lexer, Utils) {

    var Kison = {};
    Kison.Grammar = Grammar;
    Kison.Production = Production;
    Kison.Lexer = Lexer;
    Kison.Utils = Utils;
    if (!S.trim('@DEBUG@')) {
        alert('kison can only use uncompressed version!');
        return null;
    }
    return Kison;

}, {
    requires: ['kison/grammar', 'kison/production', 'kison/lexer', 'kison/utils']
});