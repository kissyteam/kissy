/**
 * @ignore
 * declare and initiate sub scanners
 * @author yiminghe@gmail.com
 */

var TagScanner = require('./scanners/tag-scanner');
var SpecialScanners = require('./scanners/special-scanners');
require('./scanners/quote-cdata-scanner');
require('./scanners/textarea-scanner');

exports.getScanner = function (nodeName) {
    return SpecialScanners[nodeName] || TagScanner;
};
