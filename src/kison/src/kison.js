/**
 * @ignore
 * Parser generator for kissy.
 * @author yiminghe@gmail.com
 */
KISSY.add(function (S, require) {
    var Grammar = require('kison/grammar');
    var Production = require('kison/production');
    var Lexer = require('kison/lexer');
    var Utils = require('kison/utils');

    var Kison = {};
    Kison.Grammar = Grammar;
    Kison.Production = Production;
    Kison.Lexer = Lexer;
    Kison.Utils = Utils;
    if ('@DEBUG@') {
        return Kison;
    } else {
        window.alert('kison can only use uncompressed version!');
        return null;
    }
});