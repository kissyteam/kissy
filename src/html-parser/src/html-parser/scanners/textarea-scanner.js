/**
 * @ignore
 * textarea data scanner
 * @author yiminghe@gmail.com
 */

var CDataScanner = require('./cdata-scanner');
var SpecialScanners = require('./special-scanners');
module.exports = SpecialScanners.textarea = {
    scan: function (tag, lexer, opts) {
        opts = opts || {};
        CDataScanner.scan(tag, lexer, opts);
    }
};