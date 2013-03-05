/**
 * JSON emulator for KISSY
 * @author yiminghe@gmail.com
 */
KISSY.add('json', function (S, stringify, parse) {

    return S.JSON = {
        stringify: stringify,
        parse: parse
    };

}, {
    requires: ['./json/stringify', './json/parse']
});