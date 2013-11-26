/**
 * @ignore
 * textarea data scanner
 * @author yiminghe@gmail.com
 */
KISSY.add(function (S, require) {
    var CDataScanner = require('./cdata-scanner');
    var SpecialScanners = require('./special-scanners');
    return SpecialScanners["textarea"] = {
        scan: function (tag, lexer, opts) {
            opts = opts || {};
            CDataScanner.scan(tag, lexer, opts);
        }
    };
});