/**
 * @ignore
 * scanner cdata (script/textarea/style) with quote smart
 * @author yiminghe@gmail.com
 */
KISSY.add(function (S, require) {
    var CDataScanner = require('./cdata-scanner');
    var Dtd = require('../dtd');
    var SpecialScanners = require('./special-scanners');

    var ret = {
        scan: function (tag, lexer, opts) {
            opts = opts || {};
            opts.quoteSmart = 1;
            CDataScanner.scan(tag, lexer, opts);
            opts.quoteSmart = 0;
        }
    };
    // script/style
    for (var t in Dtd.$cdata) {
        SpecialScanners[t] = ret;
    }
    return ret;
});